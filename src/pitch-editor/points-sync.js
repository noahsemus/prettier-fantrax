/**
 * Prettier Fantrax -- Pitch Editor: background scrape for points breakdown + season average
 * ---------------------------------------------------------------------
 * Fantrax's own roster table can show either raw stat counts or each
 * stat's Fantasy Points contribution -- but only one at a time, chosen via
 * the "Stats/Fantasy Points/..." tabs and the "Stats: <period>" dropdown
 * above the list. There's no API for this, so -- same approach as
 * content.js's Stats/Fpts toggle on the live-scoring page -- this briefly
 * flips those real controls to snapshot the data, then flips them back to
 * whatever the user had. The pitch/bench view itself doesn't move (the
 * real list is hidden underneath it).
 *
 * Each run visits the Fantasy Points tab (per-stat points contributions,
 * `breakdownCache`) *and* the Stats tab (the same rows' raw counting
 * stats, `rawStatsCache`) so the hover tooltip can show both together, e.g.
 * "4 Saves (+2 pts)". The Stats tab is visited last and the original tab
 * is restored from there.
 *
 * The Stats-tab pass also reads each player's SEASON AVERAGE
 * (`averageCache`) from the table's own FP/G column -- confirmed live
 * (2026-08-28): with the period dropdown on its DEFAULT "<season> - YTD"
 * option, the roster table's headers are [..., "FPts", "FP/G", "GP", ...],
 * and FP/G is exactly Fantrax's own fantasy-points-per-game for the
 * season. render.js shows it as a not-yet-played player's preview number
 * on FUTURE gameweeks (see src/shared/gameweek.js). Since YTD is the
 * default, this usually costs nothing extra; only when the user has
 * switched the period dropdown elsewhere does the sync briefly flip it to
 * the YTD option (matched by its confirmed "2026-27 - YTD" shape, tolerant
 * of the season changing) and back. This replaced an earlier flip to the
 * "Projected - Per Game" option: projections are no longer shown anywhere.
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
 *   3. The tab flip and the period dropdown are both real Angular route/
 *      query-param navigations (the URL's view= param actually changes) --
 *      live-verified that either one trips Fantrax's own "Unsaved Changes"
 *      route guard whenever the user has a pending, unsubmitted lineup
 *      edit, popping its Leave/Stay modal on every sync cycle for as long
 *      as they sit mid-edit (the reported bug: it kept asking "sure you
 *      want to leave" while making several roster changes in a row). See
 *      hasPendingLineupChanges() -- syncPointsData skips the whole run
 *      whenever it's true, and resumes on its own the moment the change is
 *      submitted or discarded.
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

  // True whenever Fantrax is showing its own "Finalize all roster changes"
  // toast (Reset/Submit buttons) -- i.e. the user has an unsubmitted lineup
  // edit pending. Live-verified root cause of a real bug: the Fantasy
  // Points/Stats tab flip below, AND just OPENING the "Stats: <period>"
  // mat-select, are both real Angular route/query-param navigations (the
  // page's URL literally flips view=FPTS <-> view=STATS) -- so while a
  // change is pending, either one trips Fantrax's own CanDeactivate route
  // guard and pops its "Unsaved Changes" Leave/Stay modal, on every sync
  // cycle, for as long as the user sits mid-edit. That's exactly the
  // reported symptom ("keeps popping up asking if I'm sure I want to leave
  // ... every time"). Confirmed live: with a pending change, clicking the
  // real Stats tab -- or even just opening the period dropdown -- opened
  // the guard modal immediately and blocked the navigation (the URL's view
  // param didn't move); leaving the page alone with nothing clicked at all
  // reproduced the same modal within ~10s purely from this file's own
  // background scrape cadence. The toast is a `<toast>` custom element;
  // matched by its exact heading text rather than its class list (which
  // also covers Fantrax's other, differently-purposed toasts) since that
  // text is stable and unambiguous.
  function hasPendingLineupChanges() {
    return qa('toast').some((t) => t.textContent.includes('Finalize all roster changes'));
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

  // `matcher` is either the option's exact text or a predicate
  // (text) => boolean -- the predicate form lets the YTD option be matched
  // by its confirmed SHAPE ("2026-27 - YTD") without pinning the season.
  async function chooseSelectOption(select, matcher) {
    select.click();
    await delay(300);
    const matches = typeof matcher === 'function' ? matcher : (text) => text === matcher;
    const option = qa('mat-option').find((o) => matches(o.textContent.trim()));
    if (!option) {
      // The overlay MUST actually close here: syncPointsData's later
      // `overlayChildCount() > 0` guards otherwise read a lingering
      // dropdown as "a menu the user opened" and discard the whole run --
      // breakdown included (this exact cascade was a real, user-visible
      // bug: "stuck at loading points breakdown"). A bare body.click()
      // doesn't reliably register as an outside-click to the CDK overlay,
      // so close with Escape (CDK's own close key) and verify, falling
      // back to a direct backdrop click.
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
      await delay(150);
      if (overlayChildCount() > 0) {
        const backdrop = document.querySelector('.cdk-overlay-backdrop');
        if (backdrop) backdrop.click();
        await delay(150);
      }
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

  // A failed/aborted sync attempt must not depend on a FUTURE DOM mutation
  // to retry: render() (this module's only caller) runs off main.js's
  // MutationObserver, and after an SPA navigation the page can go
  // completely quiet BEFORE the backoff window ends -- confirmed live
  // (2026-08-28): navigating matchups -> roster fired an early render
  // while the tab strip wasn't laid out yet, the "page isn't laid out"
  // guard marked the gameweek attempted and started the backoff, the
  // page's settling mutations all landed inside that window, and then
  // nothing ever mutated again -- leaving the pitch stuck with empty
  // caches ("Loading points breakdown…" forever) until a manual refresh.
  // So every non-committing exit schedules its own timer retry. One timer
  // max; the roster-page check keeps a stray early attempt on some other
  // page (both this and the livescoring page carry a "Gameweek" select)
  // from turning into an endless reschedule loop there.
  //
  // The retry cadence is ADAPTIVE (user report, 2026-08-28: points took
  // ~15s to appear after switching matchup -> roster, or never appeared
  // at all until an app restart). While the viewed gameweek has NOTHING
  // committed -- the user is staring at zeros/"Loading points breakdown"
  // -- a flat 15s wait is unjustifiable when the usual failure is just
  // "the page hadn't laid out its tab strip yet", which resolves within
  // a second or two. Retries escalate 1.5s -> 3s -> 6s -> 12s -> 15s cap
  // (reset on every successful commit), and the render-path backoff below
  // uses the same short leash in that state. Once a commit EXISTS for the
  // current gameweek, everything reverts to the polite 15s/60s cadence.
  //
  // The "never appeared until restart" half of the report was this same
  // timer dying silently: it fires while the user has navigated AWAY from
  // the roster (its roster-page check returns without rescheduling), and
  // when they navigate back, the settling mutations all land inside the
  // old 15s backoff -- quiet page, no retry, dead pitch. The short
  // nothing-committed backoff closes that hole too: the return
  // navigation's own renders are allowed to kick a sync within 1.5s.
  const QUICK_RETRY_MS = 1500;
  let quickRetryCount = 0; // consecutive non-commits while nothing is committed; reset on commit
  // Why the most recent attempt failed to commit -- set by every guard and
  // non-commit path in syncPointsData, surfaced (once per streak) after
  // several consecutive failures so an app/console report of "breakdown
  // never loads" names its own cause (chrome://inspect reaches the app's
  // WebView console).
  let lastNoCommitReason = null;

  function currentRetryDelay() {
    const uncommitted = getGameweekNumber() !== state.pointsCacheGwKey;
    if (!uncommitted) return POINTS_SYNC_RETRY_MS;
    return Math.min(QUICK_RETRY_MS * Math.pow(2, quickRetryCount), POINTS_SYNC_RETRY_MS);
  }

  let retryTimer = null;
  function scheduleRetry() {
    if (retryTimer) return;
    quickRetryCount += 1;
    if (quickRetryCount === 5) {
      console.warn('[fx-points-sync] no successful stats sync after 5 attempts; last reason:', lastNoCommitReason);
    }
    retryTimer = setTimeout(() => {
      retryTimer = null;
      if (!FXP.findLineupSystemNav || !FXP.findLineupSystemNav()) return; // roster page only
      maybeSyncPointsData();
    }, currentRetryDelay() + 500);
  }

  function maybeSyncPointsData() {
    if (state.pointsSyncInFlight) return;
    const gwKey = getGameweekNumber();
    // Back off after a failed/aborted attempt -- but on a SHORT leash
    // while this gameweek has nothing committed (see the adaptive-retry
    // comment above): there the user is looking at an empty/zeroed pitch,
    // and the common failure is transient page layout, not a broken page.
    const backoff = gwKey !== state.pointsCacheGwKey
      ? Math.min(QUICK_RETRY_MS * Math.pow(2, Math.max(0, quickRetryCount - 1)), POINTS_SYNC_RETRY_MS)
      : POINTS_SYNC_RETRY_MS;
    if (Date.now() - (state.pointsLastAttemptAt || 0) < backoff) return;

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
    if (hasPendingLineupChanges()) {
      lastNoCommitReason = 'pending lineup changes (Fantrax route guard would fire)';
      // Flipping tabs (or even just opening the period dropdown) right now
      // would trip Fantrax's own route guard -- see hasPendingLineupChanges
      // above. Back off exactly like the other early-return guards below;
      // maybeSyncPointsData() naturally retries in POINTS_SYNC_RETRY_MS, and
      // resumes its normal cadence on its own the moment the pending change
      // is gone (submitted or discarded) -- nothing else has to notice.
      state.pointsLastAttemptAt = Date.now();
      state.pointsSyncAttemptedGwKey = earlyGwKey;
      scheduleRetry();
      return;
    }
    const tabs = findStatsTabs();
    const periodSelect = findSelectByLabel('Stats');
    if (!tabs || !periodSelect) {
      lastNoCommitReason = !tabs ? 'Stats/Fantasy Points tabs not found on the page' : 'the Stats period dropdown was not found';
      state.pointsLastAttemptAt = Date.now(); // page isn't laid out as expected -- skip silently, but don't retry every render
      state.pointsSyncAttemptedGwKey = earlyGwKey;
      scheduleRetry();
      return;
    }
    if (overlayChildCount() > 0) {
      lastNoCommitReason = 'an overlay/menu was open';
      state.pointsLastAttemptAt = Date.now(); // don't fight an already-open menu
      state.pointsSyncAttemptedGwKey = earlyGwKey;
      scheduleRetry();
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
      // Period FIRST: every column read below (the Fantasy Points tab's
      // per-stat contributions, the Stats tab's raw counts, and the FPts
      // column itself) follows the "Stats: <period>" dropdown -- and its
      // default, "<season> - YTD", shows SEASON TOTALS, not the viewed
      // gameweek. Confirmed live (2026-08-28, gameweek 2): under YTD a
      // player's FPts cell held their gameweek-1 score, which is exactly
      // the reported bug -- a live-game player's card showing "his scores
      // from the previous gameweek", and a benched-in-real-life player
      // showing points he hadn't earned this week. The dropdown's
      // "<season> - Game Week" option scopes the table to whatever the
      // Gameweek select shows -- verified live: under it, mid-game, a
      // playing player's FPts read his real live 2.5 while the benched
      // Munoz read 0. Matched by shape, season-agnostic. If the flip
      // fails, everything degrades to the old behavior (reads under the
      // user's own period) rather than aborting.
      const isGwPeriodText = (text) => /^\d{4}([-/]\d{2,4})?\s*-\s*Game Week$/.test(text);
      let onGwPeriod = isGwPeriodText(periodSelect.textContent.trim());
      if (!onGwPeriod) onGwPeriod = await chooseSelectOption(periodSelect, isGwPeriodText);
      if (overlayChildCount() > 0) {
        lastNoCommitReason = 'overlay opened mid-sync (after period flip)';
        return;
      }

      if (originalTabBtn !== tabs.fpts) {
        tabs.fpts.click();
        await delay(500);
      }
      if (overlayChildCount() > 0) {
        lastNoCommitReason = 'overlay opened mid-sync (after tab flip)';
        return;
      }

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

      // Stats tab: the same rows' raw counting stats. A stat can be worth 0
      // points yet still have a meaningful raw count (e.g. 0-value saves),
      // so keep every non-empty cell here rather than the breakdown loop's
      // "truthy points" filter -- only '-'/empty (no stat recorded) is skipped.
      tabs.stats.click();
      await delay(500);
      if (overlayChildCount() > 0) {
        lastNoCommitReason = 'overlay opened mid-sync (after Stats tab flip)';
        return;
      }

      const statRows = readAllRows();
      const raw = new Map();
      statRows.forEach(({ name, headers, cells }) => {
        const statMap = new Map();
        for (let i = 5; i < headers.length && i < cells.length; i++) {
          const text = cells[i];
          if (text === '' || text === '-') continue;
          statMap.set(headers[i], text);
        }
        raw.set(name, statMap);
      });

      // Per-gameweek points: the FPts column of these same rows, valid
      // precisely because the period is scoped to the viewed gameweek (see
      // the period-first comment above). This is what a locked player's
      // card/tooltip shows -- live earned points during a game, the real
      // final score afterwards, and a genuine 0 for a player who was
      // benched in real life. Only committed when the gameweek flip
      // actually took; otherwise the previous cache is kept.
      let gwPoints = state.gwPointsCache;
      if (onGwPeriod) {
        gwPoints = new Map();
        statRows.forEach(({ name, headers, cells }) => {
          const i = headers.indexOf('FPts');
          if (i !== -1 && cells[i] !== undefined) gwPoints.set(name, cells[i]);
        });
      }

      // Season average: the FP/G column -- but only under a YTD period is
      // FP/G the SEASON per-game figure (on any other period it's that
      // period's own average). We're normally sitting on the gameweek
      // period at this point, so this is usually one more flip; matched by
      // the confirmed "2026-27 - YTD" option shape, season-agnostic. If
      // the option isn't found the run keeps the previous averageCache --
      // the caches above are already read and unaffected.
      const isYtdText = (text) => /-\s*YTD$/.test(text);
      const readAverages = (rows) => {
        const map = new Map();
        rows.forEach(({ name, headers, cells }) => {
          const i = headers.indexOf('FP/G');
          if (i !== -1 && cells[i] !== undefined) map.set(name, cells[i]);
        });
        return map;
      };
      let average = state.averageCache;
      if (isYtdText(periodSelect.textContent.trim())) {
        average = readAverages(statRows);
      } else if (await chooseSelectOption(periodSelect, (t) => /^\d{4}([-/]\d{2,4})?\s*-\s*YTD$/.test(t))) {
        average = readAverages(readAllRows());
      }

      // Restore the user's own period whenever this run left it anywhere
      // else (on the YTD read above, or on the gameweek option when the
      // YTD flip failed).
      if (periodSelect.textContent.trim() !== originalPeriodText) {
        await chooseSelectOption(periodSelect, originalPeriodText);
      }

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

      if (gwChangedMidSync) lastNoCommitReason = 'gameweek changed mid-scrape';
      else if (emptyScrape) lastNoCommitReason = 'scrape returned no rows (table mid-load)';
      if (!gwChangedMidSync && !emptyScrape) {
        state.breakdownCache = breakdown;
        state.rawStatsCache = raw;
        state.averageCache = average;
        state.gwPointsCache = gwPoints;
        state.pointsCacheAt = Date.now();
        state.pointsCacheGwKey = gwKey;
        committed = true;
        quickRetryCount = 0; // fresh escalation ladder for the next gameweek switch / navigation
        FXP.refreshOpenTooltip();
      }
    } catch (err) {
      // best-effort background sync -- leave the previous cache in place
      lastNoCommitReason = 'exception: ' + (err && err.message);
    } finally {
      if (!committed) {
        state.pointsLastAttemptAt = Date.now(); // didn't finish -- back off before the next attempt
        scheduleRetry();
      }
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
      // Pitch cards for a not-yet-played player show state.averageCache
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
      if (state.tabActive) {
        if (state.actionMenuEl && FXP.refreshActionMenuSections) {
          // A full render() tears down every card AND the open action
          // menu -- so a sync that lands while the user is looking at a
          // tapped player's "Loading points breakdown…" would CLOSE the
          // menu instead of filling it (they'd have to re-tap). Refresh
          // the open menu's read-only sections in place instead, and
          // defer the full card re-render until the menu closes (see
          // closeActionMenu in action-menu.js).
          state.renderPendingAfterMenu = true;
          FXP.refreshActionMenuSections();
        } else {
          FXP.render();
        }
      }
    }
  }

  // Explicit-demand sync: the user just did something that NEEDS the
  // caches RIGHT NOW -- tapped a player whose breakdown isn't loaded,
  // hovered a card before the first sync landed. An explicit gesture
  // beats every implicit signal (timers, backoffs, mutation-driven
  // renders), so this skips the retry backoff entirely and runs
  // immediately. syncPointsData's own guards (in-flight, busy, pending
  // lineup changes, page layout) still apply, so a tap-storm can't
  // stampede the page -- at most one sync runs, and repeat calls while
  // it's in flight are no-ops. (User suggestion 2026-08-28: "why wait
  // for an implicit signal when we have something explicit?")
  function requestPointsSync() {
    if (state.pointsSyncInFlight || state.busy) return;
    state.pointsLastAttemptAt = 0;
    maybeSyncPointsData();
  }

  FXP.requestPointsSync = requestPointsSync;
  FXP.hasPendingLineupChanges = hasPendingLineupChanges;
  FXP.findStatsTabs = findStatsTabs;
  FXP.isTabSelected = isTabSelected;
  FXP.findSelectByLabel = findSelectByLabel;
  FXP.getGameweekNumber = getGameweekNumber;
  FXP.chooseSelectOption = chooseSelectOption;
  FXP.readAllRows = readAllRows;
  FXP.maybeSyncPointsData = maybeSyncPointsData;
  FXP.syncPointsData = syncPointsData;
})(window.FXP);
