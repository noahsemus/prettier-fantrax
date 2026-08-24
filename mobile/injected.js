window.FX_DIAGNOSTICS = true;

(function () {
  'use strict';
  if (document.getElementById('fx-styles')) return;
  var style = document.createElement('style');
  style.id = 'fx-styles';
  style.textContent = "/* ---- src/content/content.css ---- */\n.fx-tooltip {\n  position: fixed;\n  z-index: 2147483647;\n  background: #12181f;\n  color: #f5f7fa;\n  border: 1px solid rgba(255, 255, 255, 0.14);\n  padding: 6px 10px;\n  border-radius: 6px;\n  font-size: 12px;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif;\n  line-height: 1.4;\n  pointer-events: none;\n  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);\n  max-width: 260px;\n  display: none;\n  white-space: nowrap;\n}\n\n.fx-tooltip.fx-tooltip--visible {\n  display: block;\n}\n\n/* Give the simple-view stat abbreviations a hover affordance so it's\n   discoverable that they now do something. */\n.scoring-table__cell__content li > b {\n  cursor: help;\n  border-bottom: 1px dotted rgba(255, 255, 255, 0.35);\n}\n\n\n/* ---- src/pitch-editor/pitch.css ---- */\n.fx-pitch {\n  --fx-green-1: #1e6b3a;\n  --fx-green-2: #268049;\n  --fx-line: rgba(255, 255, 255, 0.55);\n  margin: 12px 0 18px;\n  border-radius: 12px;\n  overflow: hidden;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif;\n}\n\n.fx-pitch__header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  background: #0e1116;\n  padding: 8px 14px;\n  color: #f5f7fa;\n  font-size: 13px;\n}\n\n.fx-pitch__title {\n  font-weight: 700;\n  letter-spacing: 0.02em;\n}\n\n.fx-pitch__status {\n  font-size: 12px;\n  color: #aeb8c4;\n  min-height: 16px;\n  transition: color 0.2s ease;\n}\n\n.fx-pitch__status--ok {\n  color: #5be08a;\n}\n\n.fx-pitch__status--err {\n  color: #ff8a80;\n}\n\n.fx-pitch__field {\n  position: relative;\n  background: repeating-linear-gradient(\n    to bottom,\n    var(--fx-green-1) 0px,\n    var(--fx-green-1) 46px,\n    var(--fx-green-2) 46px,\n    var(--fx-green-2) 92px\n  );\n  padding: 18px 12px 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 14px;\n}\n\n.fx-pitch__field::before {\n  content: \"\";\n  position: absolute;\n  inset: 8px;\n  border: 2px solid var(--fx-line);\n  border-radius: 6px;\n  pointer-events: none;\n  opacity: 0.6;\n}\n\n.fx-pitch__row {\n  display: flex;\n  justify-content: center;\n  gap: 10px;\n  flex-wrap: wrap;\n  position: relative;\n  z-index: 1;\n}\n\n.fx-bench {\n  background: #14181f;\n  padding: 12px 14px 16px;\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\n}\n\n.fx-bench__label {\n  color: #9aa4b2;\n  font-size: 11px;\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n  margin-bottom: 8px;\n}\n\n.fx-bench__row {\n  display: flex;\n  gap: 10px;\n  flex-wrap: wrap;\n}\n\n.fx-pitch__hint {\n  padding: 6px 14px 10px;\n  background: #14181f;\n  color: #7c8794;\n  font-size: 11px;\n  border-top: 1px solid rgba(255, 255, 255, 0.06);\n}\n\n.fx-list-collapsed {\n  display: none !important;\n}\n\n/* The \"Pitch Editor\" tab injected next to Fantrax's own \"Easy Click\" /\n   \"Classic\" pills. Styled to match rather than relying on their\n   (possibly view-encapsulated) CSS actually applying to a node we\n   inserted ourselves. */\n.fx-pitch-tab {\n  appearance: none;\n  border: none;\n  cursor: pointer;\n  padding: 7px 16px;\n  border-radius: 999px;\n  font-size: 13px;\n  font-weight: 600;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif;\n  color: #cfd6de;\n  background: transparent;\n  transition: background 0.15s ease, color 0.15s ease;\n}\n\n.fx-pitch-tab:hover {\n  background: rgba(255, 255, 255, 0.08);\n}\n\n.fx-pitch-tab--active {\n  background: #1e6b3a;\n  color: #fff;\n}\n\n.fx-pitch-tab--active:hover {\n  background: #1e6b3a;\n}\n\n\n/* ---- src/pitch-editor/card.css ---- */\n.fx-card {\n  position: relative;\n  width: 88px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  cursor: grab;\n  user-select: none;\n  border-radius: 8px;\n  padding: 5px 4px 6px;\n  background: transparent;\n  border: 1px solid transparent;\n  transition: box-shadow 0.12s ease, border-color 0.12s ease, background 0.12s ease, opacity 0.12s ease;\n}\n\n.fx-card:hover:not(.fx-card--locked):not(.fx-card--empty) {\n  background: rgba(0, 0, 0, 0.22);\n}\n\n.fx-card--locked {\n  cursor: not-allowed;\n}\n\n/* Empty slots are only meaningful while a swap is in progress (native drag,\n   or a card armed via \"Start Swap\") -- removed from layout entirely\n   otherwise, so a partially-filled row centers around its real players\n   only and reads like an actual formation instead of a full-width grid. */\n.fx-card--empty {\n  display: none;\n  cursor: default;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px dashed rgba(255, 255, 255, 0.25);\n  min-height: 78px;\n  justify-content: center;\n}\n\n.fx-card--empty.fx-card--empty-visible {\n  display: flex;\n}\n\n.fx-card--dragging {\n  opacity: 0.35;\n}\n\n.fx-card--armed {\n  border-color: #ffd166;\n  box-shadow: 0 0 0 2px rgba(255, 209, 102, 0.35);\n  background: rgba(255, 209, 102, 0.1);\n}\n\n/* A legal target, not currently under the cursor. */\n.fx-card--drag-target-valid {\n  box-shadow: 0 0 0 1px rgba(91, 224, 138, 0.35);\n}\n\n/* A legal target directly under the cursor during a native drag. */\n.fx-card--drop-target {\n  border-color: #5be08a;\n  box-shadow: 0 0 0 2px rgba(91, 224, 138, 0.4);\n  background: rgba(91, 224, 138, 0.12);\n}\n\n/* Not a legal target for the player currently being moved. */\n.fx-card--drag-invalid {\n  opacity: 0.35;\n  pointer-events: none;\n}\n\n.fx-card__crest {\n  width: auto;\n  height: 46px;\n  max-width: 52px;\n  object-fit: contain;\n  margin-bottom: 2px;\n  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.55));\n  pointer-events: none;\n}\n\n.fx-card__pos {\n  position: absolute;\n  top: 2px;\n  left: 2px;\n  font-size: 8px;\n  font-weight: 700;\n  color: #0e1116;\n  background: rgba(245, 247, 250, 0.9);\n  border-radius: 3px;\n  padding: 0 3px;\n  pointer-events: none;\n}\n\n.fx-card__name {\n  font-size: 10.5px;\n  color: #fff;\n  text-align: center;\n  line-height: 1.2;\n  max-width: 84px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  pointer-events: none;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);\n  margin-top: 1px;\n}\n\n/* Fantrax's own real-life \"is this player playing\" indicator, reused here.\n   See EVENT_STATUS_MAP in roster.js for what each color means. */\n.fx-card__dot {\n  display: inline-block;\n  width: 6px;\n  height: 6px;\n  border-radius: 50%;\n  margin-right: 3px;\n  margin-bottom: 1px;\n  pointer-events: auto;\n}\n\n.fx-card__dot--starting {\n  background: hsl(160 84% 38%);\n}\n\n.fx-card__dot--expected {\n  background: hsl(27 100% 61%);\n}\n\n.fx-card__dot--bench {\n  background: hsl(46 97% 65%);\n}\n\n.fx-card__dot--out {\n  background: hsl(349.7 80% 60.2%);\n}\n\n.fx-card__fpts {\n  font-size: 11px;\n  font-weight: 700;\n  pointer-events: none;\n  margin-top: 1px;\n}\n\n.fx-card__fpts--pos {\n  color: #ffd166;\n}\n\n.fx-card__fpts--neg {\n  color: #ff8a80;\n}\n\n.fx-card__fpts--zero {\n  color: #aeb8c4;\n}\n\n.fx-card__opp {\n  font-size: 8.5px;\n  color: #cfe0ea;\n  opacity: 0.75;\n  text-align: center;\n  line-height: 1.25;\n  max-width: 86px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  pointer-events: none;\n  margin-top: 2px;\n}\n\n.fx-card__plus {\n  font-size: 20px;\n  color: rgba(255, 255, 255, 0.35);\n  pointer-events: none;\n}\n\n\n/* ---- src/pitch-editor/tooltip.css ---- */\n.fx-card-tip {\n  position: fixed;\n  z-index: 2147483647;\n  background: #12181f;\n  color: #f5f7fa;\n  border: 1px solid rgba(255, 255, 255, 0.14);\n  padding: 8px 10px;\n  border-radius: 6px;\n  font-size: 11.5px;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif;\n  line-height: 1.5;\n  pointer-events: none;\n  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);\n  width: max-content;\n  max-width: min(260px, calc(100vw - 16px));\n  box-sizing: border-box;\n  display: none;\n}\n\n.fx-card-tip--visible {\n  display: block;\n}\n\n.fx-card-tip__title {\n  font-weight: 700;\n  color: #fff;\n  margin-bottom: 3px;\n  white-space: normal;\n  overflow-wrap: break-word;\n}\n\n.fx-card-tip__row {\n  color: #cfd6de;\n  white-space: normal;\n  overflow-wrap: break-word;\n}\n\n\n/* ---- src/pitch-editor/action-menu.css ---- */\n.fx-action-menu {\n  position: fixed;\n  z-index: 2147483647;\n  background: #12181f;\n  border: 1px solid rgba(255, 255, 255, 0.14);\n  border-radius: 8px;\n  padding: 4px;\n  min-width: 160px;\n  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif;\n  display: flex;\n  flex-direction: column;\n  gap: 1px;\n}\n\n.fx-action-menu__item {\n  appearance: none;\n  border: none;\n  background: transparent;\n  color: #f5f7fa;\n  font-size: 12.5px;\n  text-align: left;\n  padding: 8px 10px;\n  border-radius: 5px;\n  cursor: pointer;\n}\n\n.fx-action-menu__item:hover:not(:disabled) {\n  background: rgba(255, 255, 255, 0.08);\n}\n\n.fx-action-menu__item--danger {\n  color: #ff8a80;\n}\n\n.fx-action-menu__item--disabled,\n.fx-action-menu__item:disabled {\n  color: #5b6472;\n  cursor: not-allowed;\n}\n";
  (document.head || document.documentElement).appendChild(style);
})();

// ---- src/shared/stat-names.js ----
/**
 * Fantrax Refinements -- shared stat abbreviation dictionary
 * ---------------------------------------------------------------------
 * Abbreviation -> full name, scraped from Fantrax's own Classic-view
 * header tooltips so it stays accurate to this league's stat set.
 * Shared between content.js (Simple-view tooltips) and pitch-editor.js
 * (points-breakdown hover) so the two don't drift out of sync.
 * ---------------------------------------------------------------------
 */
window.FX_STAT_NAMES = {
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

// ---- src/content/content.js ----
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

  // Abbreviation -> full name (shared with pitch-editor.js via stat-names.js).
  const ABBR_MAP = window.FX_STAT_NAMES;

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

// ---- src/pitch-editor/state.js ----
/**
 * Fantrax Refinements -- Pitch Editor: shared state + tiny DOM utils
 * ---------------------------------------------------------------------
 * Every pitch-editor file is a plain (non-module) script attached in
 * manifest.json, so they share one global scope. Rather than leaning on
 * that implicitly, each file wraps itself in an IIFE and reads/writes an
 * explicit `window.FXP` namespace -- this file creates it and must load
 * first. State lives in one place (`FXP.state`) so every module sees the
 * same live object.
 * ---------------------------------------------------------------------
 */
window.FXP = window.FXP || {};
(function (FXP) {
  'use strict';

  FXP.POS_ORDER = ['G', 'D', 'M', 'F'];
  FXP.POINTS_SYNC_THROTTLE_MS = 60000; // don't re-scrape the breakdown/projection tables more than every 60s
  FXP.PROJECTED_OPTION_TEXT = 'Projected - Per Game';

  FXP.state = {
    container: null,
    statusEl: null,
    armed: null, // { key, player }
    busy: false,
    tabActive: true, // pitch editor is the default sub-tab
    tabBtn: null,

    // last render's data, kept around so drag/arm interactions can look up
    // "is this other card a legal target" without re-scraping the page
    players: [],
    cardsByKey: new Map(), // player key -> rendered .fx-card element
    dragSource: null, // player currently mid native-drag (null otherwise)

    actionMenuEl: null,

    // hover: how a player got their points (or their projection, if unplayed)
    breakdownCache: new Map(), // name -> { lines: [{abbr, label, text}] }
    projectedCache: new Map(), // name -> projected FPts text for this gameweek
    pointsCacheAt: 0,
    pointsCacheGwKey: null,
    pointsSyncInFlight: false,
    tooltipEl: null,
    hoveredKey: null,
    lastMouseX: 0,
    lastMouseY: 0,
  };

  FXP.qa = function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  };

  FXP.delay = function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  FXP.overlayChildCount = function overlayChildCount() {
    const oc = document.querySelector('.cdk-overlay-container');
    return oc ? oc.children.length : 0;
  };
})(window.FXP);

// ---- src/pitch-editor/roster.js ----
/**
 * Fantrax Refinements -- Pitch Editor: read the real roster list
 * ---------------------------------------------------------------------
 * The pitch/bench view is never a separate source of truth -- it's built
 * fresh from Fantrax's own `.i-table__row` list every render, using that
 * list's own real controls (buttons, links) for every action. This file
 * is the only place that parses those rows into plain player objects.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const qa = FXP.qa;

  function getListRows() {
    return qa('.i-table__row').filter((r) => r.querySelector('button.lineup-btn'));
  }

  // Fantrax's own real-life "is this player playing" indicator (a colored
  // dot next to their name in the list) -- reused here instead of inventing
  // our own. Only present pre-kickoff; there's nothing to show once a
  // player's game has started.
  const EVENT_STATUS_MAP = {
    'scorer-icon--IN_UPCOMING_EVENT': 'starting',
    'scorer-icon--IN_UPCOMING_EVENT_EXPECTED': 'expected',
    'scorer-icon--BENCH_UPCOMING_EVENT': 'bench',
    'scorer-icon--NOT_IN_UPCOMING_EVENT': 'out',
  };

  const EVENT_STATUS_LABEL = {
    starting: 'Confirmed starting',
    expected: 'Expected to play',
    bench: 'Expected to be on the bench',
    out: 'Not expected to play',
  };

  function readEventStatus(row) {
    for (const icon of qa('.scorer-icon', row)) {
      for (const cls of icon.classList) {
        if (EVENT_STATUS_MAP[cls]) return EVENT_STATUS_MAP[cls];
      }
    }
    return null;
  }

  function findRowByName(name) {
    return getListRows().find((r) => {
      const a = r.querySelector('.scorer__info__name a');
      return a && a.textContent.trim() === name;
    });
  }

  function parseRoster() {
    const rows = getListRows();
    const emptyCounters = {};
    return rows.map((row) => {
      const btn = row.querySelector('button.lineup-btn');
      const pos = btn.textContent.trim();
      const nameA = row.querySelector('.scorer__info__name a');
      const name = nameA ? nameA.textContent.trim() : null;
      const isReserve = row.classList.contains('row--amber');
      const cells = qa(':scope > .i-table__cell', row);
      const oppText = cells[2] ? cells[2].textContent.replace(/\s+/g, ' ').trim() : '';
      const fptsText = cells[3] ? cells[3].textContent.replace(/\s+/g, ' ').trim() : '';
      const img = row.querySelector('img');
      const isEmpty = !name;
      let emptyIndex = null;
      if (isEmpty) {
        const bucket = pos + '|' + isReserve;
        emptyCounters[bucket] = (emptyCounters[bucket] || 0) + 1;
        emptyIndex = emptyCounters[bucket] - 1;
      }
      // Locked = no upcoming kickoff time visible for this player, meaning
      // their game has already started or finished. Conservative on purpose.
      // (Matches "11:30AM" / "3:00 PM" etc. -- a plain /\b(AM|PM)\b/ misses
      // these because there's no word boundary between a digit and a letter.)
      const locked = isEmpty ? false : !/\d{1,2}:\d{2}\s*(am|pm)/i.test(oppText);
      return {
        key: isEmpty ? `empty-${pos}-${isReserve}-${emptyIndex}` : name,
        name,
        pos,
        isReserve,
        isEmpty,
        emptyIndex,
        oppText,
        fptsText,
        crest: img ? img.src : null,
        locked,
        eventStatus: isEmpty ? null : readEventStatus(row),
      };
    });
  }

  FXP.getListRows = getListRows;
  FXP.findRowByName = findRowByName;
  FXP.parseRoster = parseRoster;
  FXP.readEventStatus = readEventStatus;
  FXP.EVENT_STATUS_LABEL = EVENT_STATUS_LABEL;
})(window.FXP);

// ---- src/pitch-editor/tabs.js ----
/**
 * Fantrax Refinements -- Pitch Editor: "Pitch Editor" tab next to Easy Click / Classic
 * ---------------------------------------------------------------------
 * Injects a third pill into Fantrax's real "Lineup change system" nav so
 * switching to/from the pitch view behaves exactly like switching between
 * Fantrax's own two options.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const qa = FXP.qa;
  const state = FXP.state;

  function findLineupSystemNav() {
    const buttons = qa('button.pill');
    const easy = buttons.find((b) => b.textContent.trim() === 'Easy Click');
    const classic = buttons.find((b) => b.textContent.trim() === 'Classic');
    if (!easy || !classic) return null;
    return { easy, classic, nav: easy.closest('nav') || easy.parentElement };
  }

  function setupTabs() {
    if (state.tabBtn && document.body.contains(state.tabBtn)) return; // already there
    const found = findLineupSystemNav();
    if (!found) return;
    const { easy, classic, nav } = found;

    const tabBtn = document.createElement('button');
    tabBtn.type = 'button';
    tabBtn.className = 'fx-pitch-tab';
    tabBtn.textContent = 'Pitch Editor';
    tabBtn.addEventListener('click', () => activateTab(true));
    nav.appendChild(tabBtn);
    state.tabBtn = tabBtn;

    [easy, classic].forEach((btn) => {
      btn.addEventListener('click', () => activateTab(false), true);
    });

    activateTab(state.tabActive);
  }

  function activateTab(on) {
    state.tabActive = on;
    if (state.tabBtn) state.tabBtn.classList.toggle('fx-pitch-tab--active', on);
    qa('.i-table').forEach((t) => t.classList.toggle('fx-list-collapsed', on));
    if (on) {
      FXP.render();
      if (state.container) state.container.style.display = '';
    } else if (state.container) {
      state.container.style.display = 'none';
    }
  }

  FXP.findLineupSystemNav = findLineupSystemNav;
  FXP.setupTabs = setupTabs;
  FXP.activateTab = activateTab;
})(window.FXP);

// ---- src/pitch-editor/render.js ----
/**
 * Fantrax Refinements -- Pitch Editor: render the pitch + bench
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const qa = FXP.qa;
  const state = FXP.state;

  // ---------- jersey images (borrowed from Fantrax's own read-only pitch widget) ----------

  function buildJerseyMap() {
    const map = new Map();
    qa('league-team-roster-pitch-view figure.pitch-view__player').forEach((fig) => {
      const img = fig.querySelector('img');
      const capSpan = fig.querySelector('figcaption span');
      if (!img || !capSpan) return;
      const abbrName = capSpan.textContent.trim(); // e.g. "I. Maatsen"
      const lastWord = abbrName.split(/\s+/).pop();
      if (lastWord) map.set(lastWord.toLowerCase(), img.src);
    });
    return map;
  }

  function formatOpp(oppText) {
    if (!oppText) return '';
    return oppText
      .replace(/@/g, ' @ ')
      .replace(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/g, ' $1')
      .replace(/([A-Za-z]{2,4})(\d)/g, '$1 $2')
      .replace(/(\d)(AM|PM)/gi, '$1 $2')
      .replace(/(\d)(F)$/, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function ensureContainer() {
    if (state.container && document.body.contains(state.container)) return state.container;
    const anchor = document.querySelector('.i-table');
    if (!anchor) return null;
    const wrapper = document.createElement('div');
    wrapper.className = 'fx-pitch';
    anchor.parentElement.insertBefore(wrapper, anchor);
    state.container = wrapper;
    return wrapper;
  }

  function render() {
    if (!state.tabActive) return;
    const container = ensureContainer();
    if (!container) return;
    const players = FXP.parseRoster();
    if (!players.length) return;

    container.innerHTML = '';
    FXP.closeActionMenu();
    state.armed = null;
    state.dragSource = null;
    state.players = players;
    state.cardsByKey = new Map();
    const jerseyMap = buildJerseyMap();

    const header = document.createElement('div');
    header.className = 'fx-pitch__header';
    const title = document.createElement('div');
    title.className = 'fx-pitch__title';
    title.textContent = 'Lineup (drag to swap)';
    const status = document.createElement('div');
    status.className = 'fx-pitch__status';
    header.appendChild(title);
    header.appendChild(status);
    container.appendChild(header);
    state.statusEl = status;

    const field = document.createElement('div');
    field.className = 'fx-pitch__field';
    const active = players.filter((p) => !p.isReserve);
    FXP.POS_ORDER.forEach((pos) => {
      const rowPlayers = active.filter((p) => p.pos === pos);
      if (!rowPlayers.length) return;
      const row = document.createElement('div');
      row.className = 'fx-pitch__row';
      rowPlayers.forEach((p) => row.appendChild(renderCard(p, jerseyMap)));
      field.appendChild(row);
    });
    container.appendChild(field);

    const bench = document.createElement('div');
    bench.className = 'fx-bench';
    const label = document.createElement('div');
    label.className = 'fx-bench__label';
    label.textContent = 'Bench';
    const benchRow = document.createElement('div');
    benchRow.className = 'fx-bench__row';
    players.filter((p) => p.isReserve).forEach((p) => benchRow.appendChild(renderCard(p, jerseyMap)));
    bench.appendChild(label);
    bench.appendChild(benchRow);
    container.appendChild(bench);

    const hint = document.createElement('div');
    hint.className = 'fx-pitch__hint';
    hint.textContent =
      'Drag a player onto another to swap them, or click a player for more actions. Only ' +
      'legal targets light up while dragging or after "Start Swap". Hover a player to see ' +
      "how they got their points, or their projection if they haven't played yet. Switch to " +
      '"Easy Click" or "Classic" above to use Fantrax\'s own list instead.';
    container.appendChild(hint);

    FXP.maybeSyncPointsData();
  }

  function renderCard(p, jerseyMap) {
    const card = document.createElement('div');
    card.className = 'fx-card';
    card.dataset.key = p.key;
    if (p.isEmpty) card.classList.add('fx-card--empty');
    if (p.locked) card.classList.add('fx-card--locked');

    if (p.isEmpty) {
      const plus = document.createElement('div');
      plus.className = 'fx-card__plus';
      plus.textContent = '+';
      card.appendChild(plus);
      const posTag = document.createElement('div');
      posTag.className = 'fx-card__pos';
      posTag.textContent = p.pos;
      card.appendChild(posTag);
    } else {
      const posTag = document.createElement('div');
      posTag.className = 'fx-card__pos';
      posTag.textContent = p.pos;
      card.appendChild(posTag);

      const lastWord = p.name.split(/\s+/).pop().toLowerCase();
      const jerseySrc = (jerseyMap && jerseyMap.get(lastWord)) || p.crest;
      if (jerseySrc) {
        const img = document.createElement('img');
        img.className = 'fx-card__crest';
        img.src = jerseySrc;
        img.alt = '';
        img.draggable = false;
        card.appendChild(img);
      }

      const name = document.createElement('div');
      name.className = 'fx-card__name';
      if (p.eventStatus) {
        const dot = document.createElement('span');
        dot.className = `fx-card__dot fx-card__dot--${p.eventStatus}`;
        dot.title = FXP.EVENT_STATUS_LABEL[p.eventStatus] || '';
        name.appendChild(dot);
      }
      name.appendChild(document.createTextNode(p.name));
      card.appendChild(name);

      if (p.fptsText && p.fptsText !== '-') {
        const fpts = document.createElement('div');
        const n = parseFloat(p.fptsText);
        const kind = n > 0 ? 'pos' : n < 0 ? 'neg' : 'zero';
        fpts.className = `fx-card__fpts fx-card__fpts--${kind}`;
        fpts.textContent = p.fptsText;
        card.appendChild(fpts);
      }

      const opp = formatOpp(p.oppText);
      if (opp) {
        const oppEl = document.createElement('div');
        oppEl.className = 'fx-card__opp';
        oppEl.textContent = opp;
        card.appendChild(oppEl);
      }
    }

    state.cardsByKey.set(p.key, card);
    FXP.wireCardInteractions(card, p);
    return card;
  }

  FXP.buildJerseyMap = buildJerseyMap;
  FXP.formatOpp = formatOpp;
  FXP.ensureContainer = ensureContainer;
  FXP.render = render;
  FXP.renderCard = renderCard;
})(window.FXP);

// ---- src/pitch-editor/drag.js ----
/**
 * Fantrax Refinements -- Pitch Editor: drag / click-to-select interactions
 * ---------------------------------------------------------------------
 * A "source" player becomes active either by starting a native drag or by
 * choosing "Start Swap" from a card's action menu. Either way, every other
 * card is immediately classified as a legal or illegal target for that
 * source and styled accordingly (illegal targets dim and stop accepting
 * clicks/drops; empty slots -- normally invisible -- only appear where the
 * source could actually land). This is the single source of truth for
 * "can X go here" so the drag preview and the click-arm flow can't disagree.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const state = FXP.state;

  function isValidDropTarget(source, target) {
    if (!source || !target) return false;
    if (source.key === target.key) return false;
    if (source.locked || target.locked) return false;
    if (source.pos !== target.pos) return false;
    if (!target.isEmpty && source.isReserve === target.isReserve) return false;
    return true;
  }

  function highlightValidTargets(source) {
    state.players.forEach((p) => {
      if (p.key === source.key) return;
      const card = state.cardsByKey.get(p.key);
      if (!card) return;
      const valid = isValidDropTarget(source, p);
      if (p.isEmpty) {
        card.classList.toggle('fx-card--empty-visible', valid);
      } else {
        card.classList.toggle('fx-card--drag-invalid', !valid);
        card.classList.toggle('fx-card--drag-target-valid', valid);
      }
    });
  }

  function clearTargetHighlights() {
    state.cardsByKey.forEach((card) => {
      card.classList.remove(
        'fx-card--drag-invalid',
        'fx-card--drag-target-valid',
        'fx-card--empty-visible',
        'fx-card--drop-target'
      );
    });
  }

  function wireCardInteractions(card, p) {
    const canDrag = !p.isEmpty && !p.locked;
    card.draggable = canDrag;

    card.addEventListener('dragstart', (e) => {
      if (!canDrag) {
        e.preventDefault();
        return;
      }
      FXP.closeActionMenu();
      if (state.armed && state.armed.key !== p.key) clearArmed(); // one active source at a time
      e.dataTransfer.setData('text/plain', p.key);
      e.dataTransfer.effectAllowed = 'move';
      card.classList.add('fx-card--dragging');
      state.dragSource = p;
      highlightValidTargets(p);
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('fx-card--dragging');
      state.dragSource = null;
      clearTargetHighlights();
    });
    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!state.dragSource || !isValidDropTarget(state.dragSource, p)) return;
      e.dataTransfer.dropEffect = 'move';
      card.classList.add('fx-card--drop-target');
    });
    card.addEventListener('dragleave', () => {
      card.classList.remove('fx-card--drop-target');
    });
    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.classList.remove('fx-card--drop-target');
      const sourceKey = e.dataTransfer.getData('text/plain');
      if (!sourceKey || sourceKey === p.key) return;
      const source = FXP.parseRoster().find((x) => x.key === sourceKey);
      if (!source || !isValidDropTarget(source, p)) return;
      FXP.attemptSwap(source, p);
    });

    card.addEventListener('click', (e) => {
      if (state.busy) return;
      if (!state.armed) {
        if (p.isEmpty) return; // nothing to act on
        FXP.openActionMenu(card, p, e.clientX, e.clientY);
        return;
      }
      if (state.armed.key === p.key) {
        clearArmed();
        return;
      }
      if (!isValidDropTarget(state.armed.player, p)) return;
      const source = state.armed.player;
      clearArmed();
      FXP.attemptSwap(source, p);
    });

    if (!p.isEmpty) {
      card.addEventListener('mouseenter', (e) => {
        state.hoveredKey = p.key;
        state.lastMouseX = e.clientX;
        state.lastMouseY = e.clientY;
        FXP.showCardTip(FXP.buildTooltipLines(p), e.clientX, e.clientY);
      });
      card.addEventListener('mousemove', (e) => {
        state.lastMouseX = e.clientX;
        state.lastMouseY = e.clientY;
        if (state.tooltipEl && state.tooltipEl.classList.contains('fx-card-tip--visible')) {
          FXP.positionCardTip(e.clientX, e.clientY);
        }
      });
      card.addEventListener('mouseleave', FXP.hideCardTip);
    }
  }

  function armCard(p) {
    clearArmed();
    const card = state.cardsByKey.get(p.key);
    if (!card) return;
    card.classList.add('fx-card--armed');
    state.armed = { key: p.key, player: p };
    highlightValidTargets(p);
  }

  function clearArmed() {
    if (state.armed) {
      const card = state.cardsByKey.get(state.armed.key);
      if (card) card.classList.remove('fx-card--armed');
    }
    state.armed = null;
    clearTargetHighlights();
  }

  FXP.isValidDropTarget = isValidDropTarget;
  FXP.highlightValidTargets = highlightValidTargets;
  FXP.clearTargetHighlights = clearTargetHighlights;
  FXP.wireCardInteractions = wireCardInteractions;
  FXP.armCard = armCard;
  FXP.clearArmed = clearArmed;
})(window.FXP);

// ---- src/pitch-editor/tooltip.js ----
/**
 * Fantrax Refinements -- Pitch Editor: hover tooltip
 * ---------------------------------------------------------------------
 * How a player got their points (a breakdown by scoring stat), or their
 * projection for the gameweek if they haven't played yet. Data comes from
 * points-sync.js's background cache.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const state = FXP.state;

  function ensureCardTip() {
    if (state.tooltipEl && document.body.contains(state.tooltipEl)) return state.tooltipEl;
    const el = document.createElement('div');
    el.className = 'fx-card-tip';
    document.body.appendChild(el);
    state.tooltipEl = el;
    return el;
  }

  function showCardTip(lines, x, y) {
    if (!lines || !lines.length) return;
    const el = ensureCardTip();
    el.innerHTML = '';
    lines.forEach((text, i) => {
      const row = document.createElement('div');
      row.className = i === 0 ? 'fx-card-tip__title' : 'fx-card-tip__row';
      row.textContent = text;
      el.appendChild(row);
    });
    el.classList.add('fx-card-tip--visible');
    positionCardTip(x, y);
  }

  function positionCardTip(x, y) {
    const el = state.tooltipEl;
    if (!el) return;
    const offset = 14;
    let left = x + offset;
    let top = y + offset;
    const rect = el.getBoundingClientRect();
    if (left + rect.width > window.innerWidth - 8) left = x - rect.width - offset;
    if (top + rect.height > window.innerHeight - 8) top = y - rect.height - offset;
    el.style.left = `${Math.max(4, left)}px`;
    el.style.top = `${Math.max(4, top)}px`;
  }

  function hideCardTip() {
    if (state.tooltipEl) state.tooltipEl.classList.remove('fx-card-tip--visible');
    state.hoveredKey = null;
  }

  // Re-render the currently-open tooltip in place once a background sync
  // finishes -- covers the case where the user hovered before the data
  // (which takes a couple of seconds to fetch) had arrived.
  function refreshOpenTooltip() {
    if (!state.hoveredKey || !state.tooltipEl || !state.tooltipEl.classList.contains('fx-card-tip--visible')) return;
    const p = FXP.parseRoster().find((x) => x.key === state.hoveredKey);
    if (!p) return;
    showCardTip(buildTooltipLines(p), state.lastMouseX, state.lastMouseY);
  }

  function formatSigned(text) {
    const n = parseFloat(text);
    return n > 0 ? `+${text}` : text;
  }

  function buildTooltipLines(p) {
    if (p.isEmpty) return null;
    if (p.locked) {
      const entry = state.breakdownCache.get(p.name);
      if (!entry) return ['Loading points breakdown…'];
      if (!entry.lines.length) {
        return [`${p.fptsText || '0'} pts — no scoring stats this gameweek`];
      }
      const lines = [`${p.fptsText} pts:`];
      entry.lines.forEach((l) => lines.push(`${formatSigned(l.text)}  ${l.label}`));
      return lines;
    }
    const proj = state.projectedCache.get(p.name);
    if (proj === undefined) return ['Projected points not available yet'];
    const gw = FXP.getGameweekNumber();
    return [`Projected: ${proj} pts${gw ? ` (Gameweek ${gw})` : ''}`];
  }

  FXP.ensureCardTip = ensureCardTip;
  FXP.showCardTip = showCardTip;
  FXP.positionCardTip = positionCardTip;
  FXP.hideCardTip = hideCardTip;
  FXP.refreshOpenTooltip = refreshOpenTooltip;
  FXP.buildTooltipLines = buildTooltipLines;
})(window.FXP);

// ---- src/pitch-editor/points-sync.js ----
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

// ---- src/pitch-editor/swap.js ----
/**
 * Fantrax Refinements -- Pitch Editor: swap execution against the real Fantrax controls
 * ---------------------------------------------------------------------
 * A swap is: click the source player's `lineup-btn`, wait, click the
 * target's `lineup-btn`, wait, then re-read the list to see if the
 * source's active/reserve status (or position) actually changed. If
 * Fantrax opens its own popup/menu partway through (this happens if your
 * account's "Lineup change system" setting is "Classic" instead of
 * "Easy Click"), this backs off and lets you finish it there rather than
 * guessing which menu item to click.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const state = FXP.state;
  const delay = FXP.delay;
  const overlayChildCount = FXP.overlayChildCount;

  function setStatus(text, kind) {
    if (!state.statusEl) return;
    state.statusEl.textContent = text;
    state.statusEl.className = 'fx-pitch__status' + (kind ? ' fx-pitch__status--' + kind : '');
  }

  function findTargetButton(target) {
    if (!target.isEmpty) {
      const row = FXP.findRowByName(target.name);
      return row ? row.querySelector('button.lineup-btn') : null;
    }
    const candidates = FXP.getListRows().filter((r) => {
      const a = r.querySelector('.scorer__info__name a');
      const btn = r.querySelector('button.lineup-btn');
      const isReserve = r.classList.contains('row--amber');
      return !a && btn && btn.textContent.trim() === target.pos && isReserve === target.isReserve;
    });
    const row = candidates[target.emptyIndex];
    return row ? row.querySelector('button.lineup-btn') : null;
  }

  async function attemptSwap(source, target) {
    if (state.busy) return;
    if (source.locked || target.locked) {
      setStatus("Can't move a player whose game has already started or finished.", 'err');
      return;
    }
    if (source.isEmpty) {
      setStatus('Drag a player onto the empty slot, not the other way around.', 'err');
      return;
    }
    if (source.isReserve === target.isReserve && !target.isEmpty) {
      setStatus('Those are both ' + (source.isReserve ? 'on the bench' : 'active') + ' already — nothing to swap.', 'err');
      return;
    }

    state.busy = true;
    setStatus(`Swapping ${source.name} ↔ ${target.isEmpty ? 'empty slot' : target.name}…`);

    const beforeOverlay = overlayChildCount();
    const sourceRow = FXP.findRowByName(source.name);
    const sourceBtn = sourceRow && sourceRow.querySelector('button.lineup-btn');
    if (!sourceBtn) {
      setStatus("Couldn't find that player in the list anymore — try again.", 'err');
      state.busy = false;
      FXP.render();
      return;
    }

    sourceBtn.click();
    await delay(250);

    // A menu-based flow (e.g. "Classic" lineup change system) opens an overlay.
    // Back off and let the user finish it themselves rather than guessing which
    // menu item to pick.
    if (overlayChildCount() > beforeOverlay) {
      setStatus('Fantrax opened its own picker for this — finish the swap there, then check back.', 'err');
      state.busy = false;
      return;
    }

    const targetBtn = findTargetButton(target);
    if (!targetBtn) {
      setStatus("Couldn't find the target slot — try again.", 'err');
      state.busy = false;
      FXP.render();
      return;
    }

    targetBtn.click();
    await delay(450);

    if (overlayChildCount() > beforeOverlay) {
      setStatus('Fantrax opened its own picker for this — finish the swap there, then check back.', 'err');
      state.busy = false;
      return;
    }

    const after = FXP.parseRoster();
    const newSource = after.find((x) => !x.isEmpty && x.name === source.name);
    const success = !!newSource && (newSource.isReserve !== source.isReserve || newSource.pos !== source.pos);

    state.busy = false;
    FXP.render();

    if (success) {
      setStatus(`Swapped ${source.name} ↔ ${target.isEmpty ? 'active slot' : target.name}.`, 'ok');
    } else {
      setStatus(
        "That didn't go through. This can happen if either player's game has already started, or your league locks lineup changes once the gameweek begins.",
        'err'
      );
    }
  }

  FXP.setStatus = setStatus;
  FXP.findTargetButton = findTargetButton;
  FXP.attemptSwap = attemptSwap;
})(window.FXP);

// ---- src/pitch-editor/action-menu.js ----
/**
 * Fantrax Refinements -- Pitch Editor: per-player action menu
 * ---------------------------------------------------------------------
 * Clicking a player opens a small menu instead of immediately arming a
 * swap. "Start Swap" reuses the existing arm/highlight flow; Trade, Drop,
 * and View Player Card just click the equivalent real control already
 * sitting in that player's (hidden) list row -- Fantrax's own Trade
 * picker, Drop confirmation, and full player-card modal (Stats/Splits/
 * News/Watch List/Compare/Notes, all of Fantrax's own UI) open exactly as
 * they would from the real list, so none of that needs reimplementing here.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const state = FXP.state;

  function triggerRowAction(p, selector) {
    const row = FXP.findRowByName(p.name);
    const el = row && row.querySelector(selector);
    if (el) el.click();
  }

  function buildMenuItems(p) {
    return [
      {
        label: 'Start Swap',
        disabled: p.locked,
        title: p.locked ? "Can't move -- their game has already started or finished." : '',
        action: () => FXP.armCard(p),
      },
      {
        label: 'Trade…',
        action: () => triggerRowAction(p, 'button.mat-gray--fill'),
      },
      {
        label: 'Drop…',
        danger: true,
        action: () => triggerRowAction(p, 'button.mat-red--fill'),
      },
      {
        label: 'View Player Card',
        action: () => triggerRowAction(p, '.scorer__info__name a'),
      },
    ];
  }

  function onDocClick(e) {
    if (state.actionMenuEl && !state.actionMenuEl.contains(e.target)) closeActionMenu();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') closeActionMenu();
  }

  function closeActionMenu() {
    if (state.actionMenuEl) {
      state.actionMenuEl.remove();
      state.actionMenuEl = null;
    }
    document.removeEventListener('click', onDocClick, true);
    document.removeEventListener('keydown', onKeydown, true);
  }

  function positionMenu(menu, x, y) {
    const rect = menu.getBoundingClientRect();
    let left = x;
    let top = y;
    if (left + rect.width > window.innerWidth - 8) left = window.innerWidth - rect.width - 8;
    if (top + rect.height > window.innerHeight - 8) top = window.innerHeight - rect.height - 8;
    menu.style.left = `${Math.max(4, left)}px`;
    menu.style.top = `${Math.max(4, top)}px`;
  }

  function openActionMenu(card, p, x, y) {
    closeActionMenu();
    FXP.hideCardTip();

    const menu = document.createElement('div');
    menu.className = 'fx-action-menu';
    buildMenuItems(p).forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fx-action-menu__item' + (item.danger ? ' fx-action-menu__item--danger' : '');
      btn.textContent = item.label;
      if (item.title) btn.title = item.title;
      if (item.disabled) {
        btn.disabled = true;
        btn.classList.add('fx-action-menu__item--disabled');
      } else {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          closeActionMenu();
          item.action();
        });
      }
      menu.appendChild(btn);
    });

    document.body.appendChild(menu);
    state.actionMenuEl = menu;
    positionMenu(menu, x, y);
    // Deferred so the click that opened the menu doesn't immediately close it.
    setTimeout(() => {
      document.addEventListener('click', onDocClick, true);
      document.addEventListener('keydown', onKeydown, true);
    }, 0);
  }

  FXP.openActionMenu = openActionMenu;
  FXP.closeActionMenu = closeActionMenu;
  FXP.triggerRowAction = triggerRowAction;
})(window.FXP);

// ---- src/pitch-editor/main.js ----
/**
 * Fantrax Refinements -- Pitch Editor: boot / keep in sync with live updates
 * ---------------------------------------------------------------------
 * Watches the page for changes (new gameweek, live score refresh, etc.)
 * and re-renders. Anything WE inserted (the pitch container, the injected
 * tab button, the hover tooltip, the action menu) is excluded from
 * "relevant" mutations -- otherwise our own tooltip/menu updates on every
 * mouseenter/click would themselves trigger a re-render, which tears down
 * and rebuilds every card mid-hover and reads as the hover state flickering.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const state = FXP.state;

  let renderScheduled = false;
  function scheduleRender() {
    if (state.busy || renderScheduled) return;
    renderScheduled = true;
    setTimeout(() => {
      renderScheduled = false;
      FXP.setupTabs(); // re-inject the tab if Fantrax re-rendered the nav out from under us
      if (state.tabActive) FXP.render();
    }, 500);
  }

  function isOwnMutation(target) {
    return (
      (state.container && state.container.contains(target)) ||
      (state.tabBtn && state.tabBtn.contains(target)) ||
      (state.tooltipEl && state.tooltipEl.contains(target)) ||
      (state.actionMenuEl && state.actionMenuEl.contains(target))
    );
  }

  const observer = new MutationObserver((mutations) => {
    if (state.busy) return;
    const relevant = mutations.some((m) => !isOwnMutation(m.target));
    if (relevant) scheduleRender();
  });

  function start() {
    if (!document.querySelector('.i-table')) {
      setTimeout(start, 500);
      return;
    }
    FXP.setupTabs();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  start();
})(window.FXP);

// ---- mobile/diagnostics.js ----
/**
 * Fantrax Refinements -- Mobile: on-page diagnostics badge
 * ---------------------------------------------------------------------
 * fantrax.com is an Angular SPA, and its mobile layout may not carry the
 * same DOM structure the desktop selectors above were written against --
 * and there's no console to check on a phone. This module probes for the
 * anchor elements each feature depends on and renders a small on-page
 * badge showing what was (and wasn't) found, so a layout mismatch is
 * visible without plugging into a computer. It only runs when
 * `window.FX_DIAGNOSTICS` is set (by the mobile injection bundle) and is
 * inert everywhere else.
 * ---------------------------------------------------------------------
 */
(function () {
  'use strict';
  if (!window.FX_DIAGNOSTICS) return;

  const PROBE_GROUPS = [
    {
      name: 'Live scoring',
      selectors: [
        'pill-group[aria-label="Mode"]',
        '.scoring-table__row',
        '.scoring-table__cell__content li > b',
      ],
    },
    {
      name: 'Pitch editor',
      selectors: [
        '.i-table__row',
        'button.lineup-btn',
        'league-team-roster-pitch-view figure.pitch-view__player',
        'button.tabs__item',
      ],
    },
  ];

  const state = {
    badgeEl: null,
    expanded: false,
    dismissed: false,
    results: [], // [{ name, selectors: [{ selector, count }] }]
    settleTimer: null,
    initialTimer: null,
  };

  // ---------- probing ----------

  function runProbe() {
    return PROBE_GROUPS.map((group) => ({
      name: group.name,
      selectors: group.selectors.map((selector) => {
        let count = 0;
        try {
          count = document.querySelectorAll(selector).length;
        } catch (err) {
          count = 0;
        }
        return { selector, count };
      }),
    }));
  }

  function groupStatus(group) {
    const total = group.selectors.length;
    const found = group.selectors.filter((s) => s.count > 0).length;
    let color = '#e03131'; // red -- none found
    if (found === total) color = '#2f9e44'; // green -- all found
    else if (found > 0) color = '#f08c00'; // orange -- partial
    return { found, total, color };
  }

  // ---------- badge ----------

  function ensureBadge() {
    if (state.badgeEl) return state.badgeEl;

    const badge = document.createElement('div');
    badge.id = 'fx-diag';
    applyStyle(badge, {
      position: 'fixed',
      left: '8px',
      bottom: '8px',
      zIndex: '2147483647',
      background: 'rgba(20, 20, 20, 0.92)',
      color: '#fff',
      font: '12px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
      padding: '8px 10px',
      maxWidth: '85vw',
      maxHeight: '70vh',
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
      boxSizing: 'border-box',
      userSelect: 'none',
      WebkitUserSelect: 'none',
    });

    document.body.appendChild(badge);
    state.badgeEl = badge;
    return badge;
  }

  function applyStyle(el, styles) {
    for (const key in styles) {
      el.style[key] = styles[key];
    }
  }

  function clearEl(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function renderBadge() {
    if (state.dismissed) return;
    const badge = ensureBadge();
    clearEl(badge);

    if (!state.expanded) {
      renderCollapsed(badge);
    } else {
      renderExpanded(badge);
    }
  }

  function renderCollapsed(badge) {
    const row = document.createElement('div');
    applyStyle(row, {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      minHeight: '32px',
    });
    row.addEventListener('click', () => {
      state.expanded = true;
      renderBadge();
    });

    const label = document.createElement('span');
    label.textContent = 'FX diag';
    applyStyle(label, { fontWeight: '600', opacity: '0.85' });
    row.appendChild(label);

    state.results.forEach((group) => {
      const { found, total, color } = groupStatus(group);
      const pill = document.createElement('span');
      pill.textContent = group.name + ' ' + found + '/' + total;
      applyStyle(pill, {
        background: color,
        color: '#fff',
        borderRadius: '6px',
        padding: '3px 7px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
      });
      row.appendChild(pill);
    });

    if (!state.results.length) {
      const pending = document.createElement('span');
      pending.textContent = 'probing…';
      applyStyle(pending, { opacity: '0.7' });
      row.appendChild(pending);
    }

    const closeBtn = makeCloseButton();
    row.appendChild(closeBtn);

    badge.appendChild(row);
  }

  function renderExpanded(badge) {
    const header = document.createElement('div');
    applyStyle(header, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      cursor: 'pointer',
      minHeight: '32px',
      marginBottom: '4px',
    });
    header.addEventListener('click', (e) => {
      if (e.target && e.target.getAttribute && e.target.getAttribute('data-fx-diag-close')) return;
      state.expanded = false;
      renderBadge();
    });

    const label = document.createElement('span');
    label.textContent = 'FX diagnostics';
    applyStyle(label, { fontWeight: '600' });
    header.appendChild(label);
    header.appendChild(makeCloseButton());
    badge.appendChild(header);

    state.results.forEach((group) => {
      const { color } = groupStatus(group);
      const groupTitle = document.createElement('div');
      groupTitle.textContent = group.name;
      applyStyle(groupTitle, {
        fontWeight: '600',
        marginTop: '8px',
        color: color,
      });
      badge.appendChild(groupTitle);

      const list = document.createElement('div');
      applyStyle(list, { marginTop: '2px' });
      group.selectors.forEach((s) => {
        const line = document.createElement('div');
        applyStyle(line, {
          display: 'flex',
          alignItems: 'flex-start',
          gap: '6px',
          padding: '2px 0',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '11px',
          wordBreak: 'break-all',
        });

        const mark = document.createElement('span');
        mark.textContent = s.count > 0 ? '✓' : '✗';
        applyStyle(mark, {
          color: s.count > 0 ? '#2f9e44' : '#e03131',
          fontWeight: '700',
          flex: '0 0 auto',
        });
        line.appendChild(mark);

        const text = document.createElement('span');
        text.textContent = s.selector + ' (' + s.count + ')';
        line.appendChild(text);

        list.appendChild(line);
      });
      badge.appendChild(list);
    });

    if (!state.results.length) {
      const pending = document.createElement('div');
      pending.textContent = 'probing…';
      applyStyle(pending, { opacity: '0.7', marginTop: '8px' });
      badge.appendChild(pending);
    }
  }

  function makeCloseButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '✕';
    btn.setAttribute('data-fx-diag-close', '1');
    applyStyle(btn, {
      background: 'transparent',
      border: 'none',
      color: '#fff',
      opacity: '0.8',
      fontSize: '16px',
      lineHeight: '1',
      cursor: 'pointer',
      minWidth: '32px',
      minHeight: '32px',
      padding: '0',
      flex: '0 0 auto',
    });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismiss();
    });
    return btn;
  }

  function dismiss() {
    state.dismissed = true;
    if (state.settleTimer) clearTimeout(state.settleTimer);
    if (state.initialTimer) clearTimeout(state.initialTimer);
    try {
      observer.disconnect();
    } catch (err) {
      // ignore
    }
    if (state.badgeEl && state.badgeEl.parentNode) {
      state.badgeEl.parentNode.removeChild(state.badgeEl);
    }
    state.badgeEl = null;
  }

  // ---------- probe + render, guarded ----------

  function probeAndRender() {
    if (state.dismissed) return;
    try {
      state.results = runProbe();
      renderBadge();
    } catch (err) {
      // never throw -- diagnostics must not break the page
    }
  }

  // ---------- mutation observer, debounced ~5s after mutations settle ----------

  const SETTLE_MS = 5000;

  const observer = new MutationObserver(() => {
    if (state.dismissed) return;
    if (state.settleTimer) clearTimeout(state.settleTimer);
    state.settleTimer = setTimeout(probeAndRender, SETTLE_MS);
  });

  function start() {
    try {
      observer.observe(document.body, { childList: true, subtree: true });
    } catch (err) {
      // ignore -- body may not exist yet; the initial probe below still fires
    }
    state.initialTimer = setTimeout(probeAndRender, SETTLE_MS);
  }

  try {
    start();
  } catch (err) {
    // never throw
  }
})();
