/**
 * Fantrax Refinements -- Pitch Editor: background scrape for points breakdown + projections
 * ---------------------------------------------------------------------
 * Fantrax's own roster table can show either raw stat counts, each stat's
 * Fantasy Points contribution, or a points *projection* -- but only one at
 * a time, chosen via the "Stats/Fantasy Points/..." tabs and the
 * "Stats: <period>" dropdown above the list. There's no API for this, so --
 * same approach as content.js's Stats/Fpts toggle on the live-scoring page
 * -- this briefly flips those real controls to snapshot the data, then
 * flips them back to whatever the user had. The pitch/bench view itself
 * doesn't move (the real list is hidden underneath it), but the controls
 * above it will visibly flicker for ~2s while this runs.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const qa = FXP.qa;
  const delay = FXP.delay;
  const state = FXP.state;
  const overlayChildCount = FXP.overlayChildCount;

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
      const headerRow = t.querySelector('.i-table__row--header') || t.querySelector('[class*="header"]');
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
    const gwKey = getGameweekNumber();
    const stale = Date.now() - state.pointsCacheAt > FXP.POINTS_SYNC_THROTTLE_MS;
    if (stale || gwKey !== state.pointsCacheGwKey) syncPointsData();
  }

  async function syncPointsData() {
    if (state.pointsSyncInFlight || state.busy) return;
    const tabs = findStatsTabs();
    const periodSelect = findSelectByLabel('Stats');
    if (!tabs || !periodSelect) return; // page isn't laid out as expected -- skip silently
    if (overlayChildCount() > 0) return; // don't fight an already-open menu

    state.pointsSyncInFlight = true;
    state.busy = true;
    const originalTabBtn = tabs.buttons.find(isTabSelected) || tabs.stats;
    const originalPeriodText = periodSelect.textContent.trim();
    const gwKey = getGameweekNumber();

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

      if (originalTabBtn !== tabs.fpts) {
        originalTabBtn.click();
        await delay(400);
      }

      state.breakdownCache = breakdown;
      state.projectedCache = projected;
      state.pointsCacheAt = Date.now();
      state.pointsCacheGwKey = gwKey;
      FXP.refreshOpenTooltip();
    } catch (err) {
      // best-effort background sync -- leave the previous cache in place
    } finally {
      state.pointsSyncInFlight = false;
      state.busy = false;
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
