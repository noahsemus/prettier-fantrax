/**
 * Prettier Fantrax -- Pitch Editor: background scrape for points breakdown + projections
 * ---------------------------------------------------------------------
 * Fantrax's own roster table can show either raw stat counts, each stat's
 * Fantasy Points contribution, or a points *projection* -- but only one at
 * a time, chosen via the "Stats/Fantasy Points/..." tabs and the
 * "Stats: <period>" dropdown above the list. There's no API for this, so --
 * same approach as content.js's Stats/Fpts toggle on the live-scoring page
 * -- this briefly flips those real controls to snapshot the data, then
 * flips them back to whatever the user had. The pitch/bench view itself
 * doesn't move (the real list is hidden underneath it).
 *
 * Each run visits the Fantasy Points tab (per-stat points contributions,
 * `breakdownCache`) *and* the Stats tab (the same rows' raw counting
 * stats, `rawStatsCache`) so the hover tooltip can show both together, e.g.
 * "4 Saves (+2 pts)". The Stats tab is visited last and the original tab
 * is restored from there.
 *
 * The "Stats" period dropdown opens as a `mat-select` overlay -- on mobile
 * that overlay renders as a huge sheet, and the tab bar is a scrolling
 * strip, so without care this scrape reads as the whole page flickering
 * between filters. Two mitigations, both scoped to this file:
 *   1. While a sync is in flight we add `fx-syncing` to <html> and inject
 *      a one-time stylesheet that hides `.cdk-overlay-container` (and
 *      freezes its transitions), so the programmatically-opened dropdown
 *      sheet never actually paints. Only the brief Fantasy Points/Stats
 *      tab flip stays visible -- we don't hide the tab bar itself, since
 *      blanking it would just trade one flicker for another.
 *   2. On coarse-pointer (touch/mobile) devices we skip the normal 60s
 *      re-scrape throttle entirely and only sync when the Gameweek
 *      changes (or on a fresh page load) -- rare enough that the tab flip
 *      is a non-issue. Desktop keeps the 60s cadence.
 * A run that ends without committing fresh caches (unexpected layout, a
 * menu already open, a mid-flight abort) also backs off for
 * POINTS_SYNC_RETRY_MS before the next attempt, so a page that doesn't
 * match our expected layout doesn't retry on every render.
 *
 * Two more cases are treated as non-commits, both guarding against
 * scraping a gameweek's table while it's still mid-load right after a
 * gameweek switch: (1) if the Gameweek select no longer reads the same
 * value it did when this run started, the scrape belongs to a gameweek
 * that's no longer current, so it's discarded rather than committed over
 * good data; (2) if the roster visibly has players but the scrape came
 * back with zero rows, that's read as a still-loading table rather than a
 * genuinely empty breakdown, so it's discarded too. Both fall through to
 * the same `committed=false` backoff/retry path as any other failure.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const qa = FXP.qa;
  const delay = FXP.delay;
  const state = FXP.state;
  const overlayChildCount = FXP.overlayChildCount;

  // Defensive: state.js (owned elsewhere) may not yet declare this cache.
  state.rawStatsCache = state.rawStatsCache || new Map();

  // Local-only constants (state.js is owned elsewhere -- see file header).
  const POINTS_SYNC_RETRY_MS = 15000; // backoff before retrying a run that didn't commit fresh caches
  const SYNC_STYLE_ID = 'fx-sync-style';

  function isCoarsePointer() {
    // Evaluated at call time, not cached at module load -- device emulation
    // (devtools, or a real device's mode switch) can toggle this live.
    return window.matchMedia('(pointer: coarse)').matches;
  }

  function ensureSyncStyle() {
    if (document.getElementById(SYNC_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = SYNC_STYLE_ID;
    style.textContent =
      '.fx-syncing .cdk-overlay-container { visibility: hidden !important; }\n' +
      '.fx-syncing .cdk-overlay-container * { transition: none !important; }';
    document.head.appendChild(style);
  }

  function findStatsTabs() {
    const buttons = qa('button.tabs__item');
    const stats = buttons.find((b) => b.textContent.trim() === 'Stats');
    const fpts = buttons.find((b) => b.textContent.trim() === 'Fantasy Points');
    if (!stats || !fpts) return null;
    return { stats, fpts, buttons };
  }

  function isTabSelected(btn) {
    return btn.classList.contains('tabs__item--selected');
  }

  function findSelectByLabel(labelText) {
    return (
      qa('mat-select').find((s) => {
        const ff = s.closest('mat-form-field');
        const label = ff && ff.querySelector('.mdc-floating-label, mat-label, label');
        return label && label.textContent.trim() === labelText;
      }) || null
    );
  }

  function getGameweekNumber() {
    const gwSelect = findSelectByLabel('Gameweek');
    if (!gwSelect) return null;
    const m = gwSelect.textContent.trim().match(/^(\d+)/);
    return m ? m[1] : null;
  }

  async function chooseSelectOption(select, optionText) {
    select.click();
    await delay(300);
    const option = qa('mat-option').find((o) => o.textContent.trim() === optionText);
    if (!option) {
      document.body.click(); // best-effort: close whatever opened
      return false;
    }
    option.click();
    await delay(350);
    return true;
  }

  function readAllRows() {
    const out = [];
    qa('.i-table').forEach((t) => {
      // Desktop marks the header row `.i-table__row--header`. Mobile has no
      // such row -- its real header is `.i-table__row.i-table__header`, but
      // an *empty* decoy `div.single-header` (zero `.i-table__cell` kids)
      // also matches the old catch-all `[class*="header"]` selector and
      // would sort first, yielding an empty `headers` array. Pick the first
      // candidate that actually has header cells instead.
      const headerRow = qa(
        '.i-table__row--header, .i-table__row.i-table__header, [class*="header"]',
        t
      ).find((r) => r.querySelector(':scope > .i-table__cell'));
      if (!headerRow) return;
      const headers = qa(':scope > .i-table__cell', headerRow).map((c) => c.textContent.trim());
      qa('.i-table__row', t).forEach((row) => {
        const nameA = row.querySelector('.scorer__info__name a');
        if (!nameA) return; // header row / empty slot -- skip
        const cells = qa(':scope > .i-table__cell', row).map((c) => c.textContent.trim());
        out.push({ name: nameA.textContent.trim(), headers, cells });
      });
    });
    return out;
  }

  function maybeSyncPointsData() {
    if (state.pointsSyncInFlight) return;
    if (Date.now() - (state.pointsLastAttemptAt || 0) < POINTS_SYNC_RETRY_MS) return; // just tried and failed/aborted -- back off

    const gwKey = getGameweekNumber();
    if (gwKey !== state.pointsCacheGwKey) {
      syncPointsData(); // new gameweek (or first load ever) -- always resync
      return;
    }
    if (isCoarsePointer()) return; // mobile: only resync on a gameweek change, never on the 60s throttle

    const stale = Date.now() - state.pointsCacheAt > FXP.POINTS_SYNC_THROTTLE_MS;
    if (stale) syncPointsData();
  }

  async function syncPointsData() {
    if (state.pointsSyncInFlight || state.busy) return;
    // Captured up front (not just inside the try/finally below) so the two
    // early-return guards just below can also mark this gwKey as "attempted"
    // -- see state.pointsSyncAttemptedGwKey's comment in state.js. Without
    // that, a page that never lays out the tabs/select as expected (or one
    // stuck with a menu open) would leave render.js's loading overlay
    // showing indefinitely, since neither guard ever reaches the
    // try/finally block that normally marks the attempt done.
    const earlyGwKey = getGameweekNumber();
    const tabs = findStatsTabs();
    const periodSelect = findSelectByLabel('Stats');
    if (!tabs || !periodSelect) {
      state.pointsLastAttemptAt = Date.now(); // page isn't laid out as expected -- skip silently, but don't retry every render
      state.pointsSyncAttemptedGwKey = earlyGwKey;
      return;
    }
    if (overlayChildCount() > 0) {
      state.pointsLastAttemptAt = Date.now(); // don't fight an already-open menu
      state.pointsSyncAttemptedGwKey = earlyGwKey;
      return;
    }

    state.pointsSyncInFlight = true;
    state.busy = true;
    ensureSyncStyle();
    document.documentElement.classList.add('fx-syncing');
    const originalTabBtn = tabs.buttons.find(isTabSelected) || tabs.stats;
    const originalPeriodText = periodSelect.textContent.trim();
    const gwKey = getGameweekNumber();
    let committed = false;

    try {
      if (originalTabBtn !== tabs.fpts) {
        tabs.fpts.click();
        await delay(500);
      }
      if (overlayChildCount() > 0) return;

      const breakdown = new Map();
      readAllRows().forEach(({ name, headers, cells }) => {
        const lines = [];
        for (let i = 5; i < headers.length && i < cells.length; i++) {
          if (!parseFloat(cells[i])) continue; // 0, '-', empty -- not a contributor
          const abbr = headers[i];
          lines.push({ abbr, label: window.FX_STAT_NAMES[abbr] || abbr, text: cells[i] });
        }
        breakdown.set(name, { lines });
      });

      let projected = state.projectedCache;
      const opened = await chooseSelectOption(periodSelect, FXP.PROJECTED_OPTION_TEXT);
      if (opened) {
        projected = new Map();
        readAllRows().forEach(({ name, cells }) => projected.set(name, cells[3]));
        await chooseSelectOption(periodSelect, originalPeriodText);
      }

      // Stats tab: the same rows' raw counting stats. A stat can be worth 0
      // points yet still have a meaningful raw count (e.g. 0-value saves),
      // so keep every non-empty cell here rather than the breakdown loop's
      // "truthy points" filter -- only '-'/empty (no stat recorded) is skipped.
      tabs.stats.click();
      await delay(500);
      if (overlayChildCount() > 0) return;

      const raw = new Map();
      readAllRows().forEach(({ name, headers, cells }) => {
        const statMap = new Map();
        for (let i = 5; i < headers.length && i < cells.length; i++) {
          const text = cells[i];
          if (text === '' || text === '-') continue;
          statMap.set(headers[i], text);
        }
        raw.set(name, statMap);
      });

      // We always end this run on the Stats tab (above), so restore
      // whatever the user actually had selected, whenever that differs.
      if (originalTabBtn !== tabs.stats) {
        originalTabBtn.click();
        await delay(400);
      }

      // Guard 1: the gameweek select changed while we were mid-scrape (the
      // user flipped gameweeks again, or the new gameweek's table only
      // just finished swapping in under us). gwKey was captured at the
      // start of this run, so a mismatch here means everything we just
      // read belongs to a gameweek that's no longer current -- committing
      // it would overwrite good data with stale/wrong data. Leave the
      // existing caches alone; the `committed=false` backoff path below
      // will retry in POINTS_SYNC_RETRY_MS once things settle.
      const gwChangedMidSync = getGameweekNumber() !== gwKey;

      // Guard 2: an obviously-empty scrape. If the roster visibly has
      // players but readAllRows() found no rows/headers to read (breakdown
      // ends up empty), the table was almost certainly still mid-load when
      // we scraped it -- don't commit that as "the roster has no points
      // data". A roster that's *actually* empty (no name links at all) has
      // nothing false to report, so that case is still allowed to commit.
      const rosterHasPlayers = !!document.querySelector('.i-table .scorer__info__name a');
      const emptyScrape = rosterHasPlayers && breakdown.size === 0;

      if (!gwChangedMidSync && !emptyScrape) {
        state.breakdownCache = breakdown;
        state.rawStatsCache = raw;
        state.projectedCache = projected;
        state.pointsCacheAt = Date.now();
        state.pointsCacheGwKey = gwKey;
        committed = true;
        FXP.refreshOpenTooltip();
      }
    } catch (err) {
      // best-effort background sync -- leave the previous cache in place
    } finally {
      if (!committed) state.pointsLastAttemptAt = Date.now(); // didn't finish -- back off before the next attempt
      document.documentElement.classList.remove('fx-syncing');
      state.pointsSyncInFlight = false;
      state.busy = false;
      // Marks this run's gwKey "attempted" no matter how it ended --
      // render.js's needsInitialSync check (loading overlay) treats a gwKey
      // as done syncing once it's EITHER committed (state.pointsCacheGwKey)
      // OR merely attempted (this), so a run that hits Guard 1/2 above, or
      // throws, still bounds the overlay to this one attempt instead of
      // leaving it stuck. Set after busy/pointsSyncInFlight are already
      // cleared, both because it's semantically "this attempt is over" and
      // because the FXP.render() call below relies on them already being
      // false.
      state.pointsSyncAttemptedGwKey = gwKey;
      // Pitch cards for a not-yet-played player show state.projectedCache
      // (see render.js's renderCard), and the loading overlay above only
      // clears once render() actually runs again -- but nothing else
      // re-renders the pitch on its own (only an unrelated DOM mutation
      // would trigger main.js's observer). Without this, a gameweek switch
      // would show blank/stale numbers -- or, on a failed attempt, the
      // loading overlay -- until the user happens to cause some other
      // mutation. Re-render now, on every exit from this function
      // (committed or not), so the result is always shown immediately.
      // Safe against re-entrancy: this render()'s own end-of-function
      // maybeSyncPointsData() call sees pointsSyncInFlight already false,
      // but its backoff check (pointsLastAttemptAt, just set above on a
      // failed run) or its gwKey-already-cached check (on a committed run,
      // pointsCacheGwKey now equals gwKey) stop it from re-triggering a
      // sync synchronously in a loop.
      if (state.tabActive) FXP.render();
    }
  }

  FXP.findStatsTabs = findStatsTabs;
  FXP.isTabSelected = isTabSelected;
  FXP.findSelectByLabel = findSelectByLabel;
  FXP.getGameweekNumber = getGameweekNumber;
  FXP.chooseSelectOption = chooseSelectOption;
  FXP.readAllRows = readAllRows;
  FXP.maybeSyncPointsData = maybeSyncPointsData;
  FXP.syncPointsData = syncPointsData;
})(window.FXP);
