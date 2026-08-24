/**
 * Fantrax Refinements -- Pitch Editor: hover tooltip
 * ---------------------------------------------------------------------
 * How a player got their points (a breakdown by scoring stat), or their
 * projection for the gameweek if they haven't played yet. Data comes from
 * points-sync.js's background cache. For a locked (already-played) player,
 * each breakdown line leads with the raw count, followed by the stat name,
 * then the signed points contribution in parentheses, e.g. "4 Saves (+2)"
 * -- falling back to the points-only form if a raw count isn't cached for
 * that stat yet.
 *
 * buildTooltipLines(p) returns an array whose entries are either a plain
 * string (title/loading/projection/fallback lines, rendered via
 * textContent) or, for a hybrid raw+points line, an object
 * { text: '4 Saves', pts: '+2' } -- text is the raw-count/stat-name part,
 * pts is the already-signed points value WITHOUT its parentheses. Renderers
 * (here and action-menu.js's buildStatsSection) turn the object into
 * "<text> (" + a colored <span class="fx-tip-pts fx-tip-pts--pos|neg|zero">
 * + ")", built with createElement/createTextNode -- never innerHTML with
 * interpolated data. The color reflects the sign of pts: green for
 * positive, red for negative, muted gray for zero.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const state = FXP.state;

  // Defensive: state.js (owned elsewhere) may not yet declare this cache.
  state.rawStatsCache = state.rawStatsCache || new Map();

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
    lines.forEach((line, i) => {
      const row = document.createElement('div');
      row.className = i === 0 ? 'fx-card-tip__title' : 'fx-card-tip__row';
      renderTipLine(row, line);
      el.appendChild(row);
    });
    el.classList.add('fx-card-tip--visible');
    positionCardTip(x, y);
  }

  // Decide the color class for a signed points string like "+6", "-2", "0".
  function ptsClass(pts) {
    const n = parseFloat(pts);
    if (n > 0) return 'fx-tip-pts--pos';
    if (n < 0) return 'fx-tip-pts--neg';
    return 'fx-tip-pts--zero';
  }

  // Append a tooltip line's content into `row`: a plain string via
  // textContent, or a hybrid { text, pts } object as "<text> (" + a colored
  // pts span + ")" via createElement/createTextNode. Shared with
  // action-menu.js's buildStatsSection, which renders the same
  // buildTooltipLines() output inside its touch-device stats section.
  function renderTipLine(row, line) {
    if (typeof line === 'string') {
      row.textContent = line;
      return;
    }
    row.appendChild(document.createTextNode(`${line.text} (`));
    const span = document.createElement('span');
    span.className = `fx-tip-pts ${ptsClass(line.pts)}`;
    span.textContent = line.pts;
    row.appendChild(span);
    row.appendChild(document.createTextNode(')'));
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
      const rawStats = state.rawStatsCache.get(p.name);
      const lines = [`${p.fptsText} pts:`];
      entry.lines.forEach((l) => {
        const raw = rawStats && rawStats.get(l.abbr);
        if (raw !== undefined) {
          lines.push({ text: `${raw} ${l.label}`, pts: formatSigned(l.text) });
        } else {
          lines.push(`${formatSigned(l.text)}  ${l.label}`);
        }
      });
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
  FXP.renderTipLine = renderTipLine;
})(window.FXP);
