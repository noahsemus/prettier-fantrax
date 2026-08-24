/**
 * Fantrax Refinements
 * ---------------------------------------------------------------------
 * 1) In "Simple" (Standard) live-scoring view, hovering a stat abbreviation
 *    (KP, INT, TkW, ...) shows a tooltip with what it stands for -- the
 *    same tooltip text Fantrax already shows on column headers in
 *    Classic view, just surfaced here too.
 *
 * 2) Fpts is kept as the always-on default for the Stats/Fpts mode
 *    toggle. Because Fpts view only shows point contributions (not the
 *    raw counting stat), this script also briefly borrows the Stats view
 *    on load/refresh to snapshot each player's raw stat values, so the
 *    tooltip can show both, e.g. hovering "AT 6" -> "Assists (Total), 1".
 * ---------------------------------------------------------------------
 */
(function () {
  'use strict';

  // Abbreviation -> full name, scraped from Fantrax's own Classic-view
  // header tooltips so it stays accurate to this league's stat set.
  const ABBR_MAP = {
    GS: 'Games Started',
    Min: 'Minutes Played',
    CS: 'Clean Sheets On Field',
    GA: 'Goals Against',
    Sv: 'Saves',
    YC: 'Yellow Cards',
    RC: 'Red Cards',
    PKS: 'Penalty Kick Saves',
    SBON: 'Substitutions On',
    SBOF: 'Substitutions Off',
    TkW: 'Tackles Won',
    DIS: 'Dispossessed',
    G: 'Goals',
    KP: 'Key Passes (Assists on Shots)',
    AT: 'Assists (Total)',
    Int: 'Interceptions',
    CLR: 'Effective Clearances',
    CoS: 'Successful Dribbles (Contests Succeeded)',
    AER: 'Aerials Won',
    HCS: 'High Claims Succeeded',
    Sm: 'Smothers',
    OG: 'Own Goals',
    SOT: 'Shots on Target',
    SOP: 'Shots off the Post',
    ACNC: 'Accurate Crosses (No Corners)',
    BS: 'Blocked Shots',
    BCC: 'Big Chances Created',
    BCM: 'Big Chances Missed',
    PKM: 'Penalty Kicks Missed',
    PKD: 'Penalty Kicks Drawn',
    GAO: 'Goals Against Outfielders',
  };

  const THROTTLE_MS = 30000; // don't re-snapshot raw stats more than every 30s
  const PIN_COOLDOWN_MS = 10 * 60 * 1000; // respect a manual "Stats" click for 10 min

  const state = {
    isToggling: false,
    lastCaptureAt: 0,
    lastRowCount: -1,
    rawCache: [], // array, index-aligned with getStatRows(), each entry: Map(abbr -> rawValue)
    userPinnedStatsAt: 0,
    tooltipEl: null,
  };

  // ---------- small DOM helpers ----------

  function getModeButtons() {
    const group = document.querySelector('pill-group[aria-label="Mode"]');
    if (!group) return null;
    const buttons = Array.from(group.querySelectorAll('button.pill'));
    const stats = buttons.find((b) => b.textContent.trim() === 'Stats');
    const fpts = buttons.find((b) => b.textContent.trim() === 'Fpts');
    if (!stats || !fpts) return null;
    return { stats, fpts };
  }

  function isActive(btn) {
    return btn.classList.contains('pill--active');
  }

  function getStatRows() {
    return Array.from(document.querySelectorAll('.scoring-table__row')).filter((row) =>
      row.querySelector('ul > li > b')
    );
  }

  function waitForNextRender() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 40)));
    });
  }

  function debounce(fn, ms) {
    let t = null;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  // ---------- raw-stat snapshot (captured from Stats mode) ----------

  function captureRawCache() {
    const rows = getStatRows();
    state.rawCache = rows.map((row) => {
      const map = new Map();
      row.querySelectorAll('ul > li').forEach((li) => {
        const b = li.querySelector('b');
        if (!b) return;
        const abbr = b.textContent.trim();
        const raw = li.textContent.replace(abbr, '').trim();
        if (abbr) map.set(abbr, raw);
      });
      return map;
    });
    state.lastRowCount = rows.length;
    state.lastCaptureAt = Date.now();
  }

  function lookupRaw(bEl) {
    const row = bEl.closest('.scoring-table__row');
    if (!row) return null;
    const rows = getStatRows();
    const idx = rows.indexOf(row);
    if (idx === -1 || !state.rawCache[idx]) return null;
    const abbr = bEl.textContent.trim();
    return state.rawCache[idx].get(abbr) || null;
  }

  // ---------- mode enforcement + cache refresh ----------

  async function syncModeAndCache() {
    if (state.isToggling) return;
    const buttons = getModeButtons();
    if (!buttons) return;
    const { stats, fpts } = buttons;

    // Respect a recent manual click on "Stats" -- don't fight the user.
    if (state.userPinnedStatsAt && Date.now() - state.userPinnedStatsAt < PIN_COOLDOWN_MS) {
      return;
    }

    const rows = getStatRows();
    const needsCapture =
      rows.length > 0 &&
      (state.rawCache.length !== rows.length || Date.now() - state.lastCaptureAt > THROTTLE_MS);

    if (!needsCapture && isActive(fpts)) {
      return; // already default, cache is fresh -- nothing to do
    }

    state.isToggling = true;
    try {
      if (rows.length > 0 && needsCapture) {
        if (!isActive(stats)) {
          stats.click();
          await waitForNextRender();
        }
        captureRawCache();
      }
      if (!isActive(fpts)) {
        fpts.click();
        await waitForNextRender();
      }
    } finally {
      state.isToggling = false;
    }
  }

  // Track genuine (non-programmatic) clicks on the Stats pill so we can
  // back off and let the user look at Stats mode for a while.
  document.addEventListener(
    'click',
    (e) => {
      if (state.isToggling) return;
      const btn = e.target.closest('button.pill');
      if (!btn) return;
      const group = btn.closest('pill-group[aria-label="Mode"]');
      if (!group) return;
      const label = btn.textContent.trim();
      if (label === 'Stats') {
        state.userPinnedStatsAt = Date.now();
      } else if (label === 'Fpts') {
        state.userPinnedStatsAt = 0;
      }
    },
    true
  );

  // ---------- tooltip ----------

  function ensureTooltipEl() {
    if (state.tooltipEl) return state.tooltipEl;
    const el = document.createElement('div');
    el.className = 'fx-tooltip';
    document.body.appendChild(el);
    state.tooltipEl = el;
    return el;
  }

  function showTooltip(text, x, y) {
    const el = ensureTooltipEl();
    el.textContent = text;
    el.classList.add('fx-tooltip--visible');
    positionTooltip(x, y);
  }

  function positionTooltip(x, y) {
    const el = state.tooltipEl;
    if (!el) return;
    const offset = 14;
    let left = x + offset;
    let top = y + offset;
    const rect = el.getBoundingClientRect();
    if (left + rect.width > window.innerWidth - 8) {
      left = x - rect.width - offset;
    }
    if (top + rect.height > window.innerHeight - 8) {
      top = y - rect.height - offset;
    }
    el.style.left = `${Math.max(4, left)}px`;
    el.style.top = `${Math.max(4, top)}px`;
  }

  function hideTooltip() {
    if (state.tooltipEl) state.tooltipEl.classList.remove('fx-tooltip--visible');
  }

  function findStatB(target) {
    return target.closest('.scoring-table__cell__content li > b');
  }

  document.addEventListener(
    'mouseover',
    (e) => {
      const b = findStatB(e.target);
      if (!b) return;
      const abbr = b.textContent.trim();
      const fullName = ABBR_MAP[abbr];
      if (!fullName) return;

      const buttons = getModeButtons();
      let text = fullName;
      if (buttons && isActive(buttons.fpts)) {
        const raw = lookupRaw(b);
        if (raw) text = `${fullName}, ${raw}`;
      }
      showTooltip(text, e.clientX, e.clientY);
    },
    true
  );

  document.addEventListener(
    'mousemove',
    (e) => {
      if (state.tooltipEl && state.tooltipEl.classList.contains('fx-tooltip--visible')) {
        if (findStatB(e.target)) positionTooltip(e.clientX, e.clientY);
      }
    },
    true
  );

  document.addEventListener(
    'mouseout',
    (e) => {
      if (findStatB(e.target)) hideTooltip();
    },
    true
  );

  // ---------- observe for SPA navigation / live updates ----------

  const debouncedSync = debounce(syncModeAndCache, 400);

  const observer = new MutationObserver(() => {
    if (state.isToggling) return;
    debouncedSync();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // Initial run.
  syncModeAndCache();
})();
