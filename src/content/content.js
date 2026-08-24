/**
 * Fantrax Refinements
 * ---------------------------------------------------------------------
 * 1) In "Simple" (Standard) live-scoring view, hovering a stat abbreviation
 *    (KP, INT, TkW, ...) shows a tooltip with what it stands for -- the
 *    same tooltip text Fantrax already shows on column headers in
 *    Classic view, just surfaced here too.
 *
 * 2) The tooltip is hybrid: it shows the raw counting stat AND the fantasy
 *    points it produced, regardless of which mode (Stats/Fpts) the table
 *    is currently in, e.g. hovering "AT 6" in Fpts mode (or "AT 1" in
 *    Stats mode) shows "1 Assists (Total) (+6)", with the "(+6)" part
 *    color-coded by sign (green positive / red negative / gray zero) via
 *    a <span class="fx-tooltip__pts--pos|neg|zero"> built with
 *    createElement/createTextNode -- see showTooltip(). This is a
 *    self-contained rendering path with its own classes in content.css,
 *    distinct from (and not reusing) pitch-editor/tooltip.js's or
 *    matchup/render.js's tooltips, since this content script may run
 *    before FXP/FXShared have populated window.FXP/window.FXShared.
 *    Because each mode only renders one of those two numbers at a time,
 *    this script periodically (throttled to every 30s, and only when
 *    the number of distinct players on screen changes or the throttle
 *    window has elapsed) briefly flips the Stats/Fpts toggle to the
 *    mode NOT currently showing, so it can snapshot that view's
 *    per-player values, then flips back to whatever mode the user was
 *    already in. The user's chosen mode is never changed permanently --
 *    this script only ever visits the other mode for a moment to read
 *    it, then restores the original.
 *
 * 3) That flip used to be genuinely VISIBLE -- the mode pill and the
 *    scoring table's values would visibly swap for a moment, most
 *    jarringly right on page load -- so it was removed entirely for one
 *    session. It's back, but now MASKED: while the flip-and-restore
 *    sequence is running, `fx-livescoring-syncing` is added to
 *    <html> and content.css hides (via `visibility: hidden`, never
 *    `display: none`, so nothing reflows) the mode pill-group and the
 *    scoring table's content -- the two regions that actually change
 *    value during the flip. The class comes off again once the sequence
 *    fully completes, success or failure. This is the exact same
 *    technique -- mask a programmatic UI flip with CSS visibility so the
 *    user never sees it -- that src/pitch-editor/points-sync.js already
 *    uses for its own analogous scrape (its `ensureSyncStyle`/
 *    `fx-syncing` class hides the roster page's Stats/Fantasy Points tab
 *    flip and period-dropdown overlay); this file is the live-scoring
 *    page's counterpart to that mechanism.
 *
 * 4) Snapshot caches are keyed by player name, not row position: on the
 *    matchup view a single ".scoring-table__row" holds TWO players (a
 *    home cell and an away cell side by side), so indexing by row would
 *    mix their stats together. Each stat chip's owning player is
 *    resolved via its ".scoring-table__cell" (falling back to the row)
 *    and its ".scorer__info__name a" text.
 *
 * 5) After each successful snapshot, the caches are published to
 *    window.FXC = { raw, fpts, capturedAt } for src/matchup/render.js to
 *    read as an ENHANCEMENT layer on top of its own always-available
 *    per-chip fallback (read-only; may be undefined before the first
 *    capture). This is the same cross-file-global mechanism as
 *    window.FXP/FX_STAT_NAMES, since content scripts of one extension
 *    share the isolated world.
 * ---------------------------------------------------------------------
 */
(function () {
  'use strict';

  // Abbreviation -> full name (shared with pitch-editor.js via stat-names.js).
  const ABBR_MAP = window.FX_STAT_NAMES;

  const THROTTLE_MS = 30000; // don't re-snapshot the counterpart mode more than every 30s
  const MASK_CLASS = 'fx-livescoring-syncing'; // see content.css; masks the flip below

  const state = {
    isToggling: false,
    lastCaptureAt: 0,
    lastNameCount: -1,
    rawCache: new Map(), // playerName -> Map(abbr -> raw stat value)
    fptsCache: new Map(), // playerName -> Map(abbr -> fantasy points value)
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

  // A ".scoring-table__row" can hold one player (Simple view) or two
  // (matchup view: a home cell and an away cell side by side), so stat
  // chips must be attributed to a player via their containing cell, not
  // the row -- falling back to the row's own name if there's no cell
  // wrapper (e.g. Simple view).
  function resolvePlayerName(b) {
    const cell = b.closest('.scoring-table__cell');
    const nameA =
      (cell && cell.querySelector('.scorer__info__name a')) ||
      b.closest('.scoring-table__row').querySelector('.scorer__info__name a');
    return nameA ? nameA.textContent.trim() : null;
  }

  // Count of distinct players currently rendered, used as the "did the
  // table change" signal for the capture throttle heuristic (in place
  // of a row count, since matchup rows hold two players each).
  function getPlayerNameCount() {
    return document.querySelectorAll('.scoring-table__row .scorer__info__name a').length;
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

  // ---------- per-player snapshot cache ----------

  // Reads whichever mode is currently live in the DOM into the given cache
  // (state.rawCache or state.fptsCache), keyed by player name: Map(playerName
  // -> Map(abbr -> value)). Keying by name (rather than row index) is what
  // keeps the two players sharing a matchup row from clobbering each other.
  function captureCache(cacheKey) {
    const map = new Map();
    document.querySelectorAll('.scoring-table__row ul > li > b').forEach((b) => {
      const abbr = b.textContent.trim();
      if (!abbr) return;
      const name = resolvePlayerName(b);
      if (!name) return; // no resolvable owning player -- skip this chip
      const li = b.closest('li');
      const value = li.textContent.replace(abbr, '').trim();
      if (!map.has(name)) map.set(name, new Map());
      map.get(name).set(abbr, value);
    });
    state[cacheKey] = map;
  }

  function lookupFromCache(bEl, cacheKey) {
    const name = resolvePlayerName(bEl);
    if (!name) return null;
    const playerMap = state[cacheKey].get(name);
    if (!playerMap) return null;
    const abbr = bEl.textContent.trim();
    return playerMap.get(abbr) || null;
  }

  // Publishes the current snapshot caches for src/matchup/* to consume.
  // Shape: { raw: Map(playerName -> Map(abbr -> rawValue)),
  //          fpts: Map(playerName -> Map(abbr -> fptsValue)),
  //          capturedAt: <Date.now() at capture time> }.
  // Replaced wholesale on every successful capture; treat as read-only.
  // May be undefined before the first capture completes.
  function publishFXC() {
    window.FXC = { raw: state.rawCache, fpts: state.fptsCache, capturedAt: Date.now() };
  }

  // ---------- counterpart-mode snapshot flow ----------

  // Whatever mode is currently active, capture it, briefly flip to the
  // OTHER mode and capture that too, then flip back to the original mode.
  // Only runs when actually needed (player count changed, or the throttle
  // window elapsed) -- never on every mutation. The flip itself is masked
  // (see the header comment, point 3) so it's never visible to the user.
  async function snapshotCounterpart() {
    if (state.isToggling) return;
    const buttons = getModeButtons();
    if (!buttons) return; // mode toggle not found -- do nothing
    const { stats, fpts } = buttons;

    const onStats = isActive(stats);
    const onFpts = isActive(fpts);
    if (!onStats && !onFpts) return; // neither pill active -- unknown state, bail

    const rows = getStatRows();
    if (rows.length === 0) return;

    const nameCount = getPlayerNameCount();
    const needsCapture =
      state.lastNameCount !== nameCount || Date.now() - state.lastCaptureAt > THROTTLE_MS;
    if (!needsCapture) return;

    state.isToggling = true;
    const originalBtn = onStats ? stats : fpts;
    const otherBtn = onStats ? fpts : stats;
    try {
      // Capture whichever view is live right now -- no click involved, so
      // nothing to mask for this read.
      captureCache(onStats ? 'rawCache' : 'fptsCache');

      // Flip to the counterpart mode, capture it, then always flip back --
      // even if capturing throws -- so the user's mode is never left
      // changed. Masked for the whole flip-and-restore-back sequence (mask
      // added right before the first click, removed in `finally` once the
      // sequence fully completes) so the pill/table swap the user would
      // otherwise see never actually paints.
      document.documentElement.classList.add(MASK_CLASS);
      try {
        otherBtn.click();
        await waitForNextRender();
        captureCache(onStats ? 'fptsCache' : 'rawCache');
      } finally {
        if (!isActive(originalBtn)) {
          originalBtn.click();
          await waitForNextRender();
        }
        document.documentElement.classList.remove(MASK_CLASS);
      }

      state.lastNameCount = nameCount;
      state.lastCaptureAt = Date.now();
      publishFXC();
    } finally {
      state.isToggling = false;
    }
  }

  // ---------- tooltip ----------

  function ensureTooltipEl() {
    if (state.tooltipEl) return state.tooltipEl;
    const el = document.createElement('div');
    el.className = 'fx-tooltip';
    document.body.appendChild(el);
    state.tooltipEl = el;
    return el;
  }

  // `line` is either a plain string (rendered via textContent, as before)
  // or a hybrid { text, pts } object -- text is the raw-count/stat-name
  // part, pts is the already-signed points value WITHOUT parens. The
  // object case is rendered as "<text> (" + a colored pts span + ")",
  // built with createElement/createTextNode -- never innerHTML with
  // interpolated data.
  function showTooltip(line, x, y) {
    const el = ensureTooltipEl();
    while (el.firstChild) el.removeChild(el.firstChild);
    if (typeof line === 'string') {
      el.textContent = line;
    } else {
      el.appendChild(document.createTextNode(`${line.text} (`));
      const span = document.createElement('span');
      const n = parseFloat(line.pts);
      const cls = n > 0 ? 'fx-tooltip__pts--pos' : n < 0 ? 'fx-tooltip__pts--neg' : 'fx-tooltip__pts--zero';
      span.className = cls;
      span.textContent = line.pts;
      el.appendChild(span);
      el.appendChild(document.createTextNode(')'));
    }
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

  function formatSigned(text) {
    const n = parseFloat(text);
    return n > 0 ? `+${text}` : text;
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

      // The value under the cursor is always live/correct; only its
      // counterpart (the other mode's number) may come from cache.
      const li = b.closest('li');
      const liveValue = li ? li.textContent.replace(abbr, '').trim() : null;

      const buttons = getModeButtons();
      const onFpts = buttons && isActive(buttons.fpts);

      let raw = null;
      let fpts = null;
      if (onFpts) {
        fpts = liveValue;
        raw = lookupFromCache(b, 'rawCache');
      } else {
        raw = liveValue;
        fpts = lookupFromCache(b, 'fptsCache');
      }

      let line = fullName;
      if (raw && fpts) {
        line = { text: `${raw} ${fullName}`, pts: formatSigned(fpts) };
      } else if (raw) {
        line = `${fullName}, ${raw}`;
      } else if (fpts) {
        line = `${fullName}, ${fpts}`;
      }

      showTooltip(line, e.clientX, e.clientY);
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

  const debouncedSnapshot = debounce(snapshotCounterpart, 400);

  const observer = new MutationObserver(() => {
    if (state.isToggling) return;
    debouncedSnapshot();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // Initial run.
  snapshotCounterpart();
})();
