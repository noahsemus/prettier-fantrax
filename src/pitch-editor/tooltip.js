/**
 * Prettier Fantrax -- Pitch Editor: hover tooltip
 * ---------------------------------------------------------------------
 * How a player got their points (a breakdown by scoring stat), or their
 * projection for the gameweek if they haven't played yet. Data comes from
 * points-sync.js's background cache. For a locked (already-played) player,
 * each breakdown line leads with the raw count, followed by the stat name,
 * then the signed points contribution in parentheses, e.g. "4 Saves (+2)"
 * -- falling back to the points-only form if a raw count isn't cached for
 * that stat yet. For a not-yet-played player who also has a pre-kickoff
 * status dot (p.eventStatus, roster.js's FXP.EVENT_STATUS_LABEL), the
 * dot's own explanation (e.g. "Not expected to play") is prepended as the
 * first line, ahead of the projection line -- the dot's `title` attribute
 * never shows on a tap/touch device, so the tooltip is what carries that
 * explanation on mobile.
 *
 * buildTooltipLines(p) returns an array whose entries are either a plain
 * string (title/loading/projection/fallback lines, rendered via
 * textContent) or, for a hybrid raw+points line, an object
 * { text: '4 Saves', pts: '+2' } -- text is the raw-count/stat-name part,
 * pts is the already-signed points value WITHOUT its parentheses. Rendering
 * is FXShared.renderStatLine (src/shared/touch-overlay.js), shared with
 * action-menu.js's buildStatsSection AND matchup/render.js's tooltip --
 * turns the object into "<text> (" + a colored
 * <span class="fxs-stat-pts fxs-stat-pts--pos|neg|zero"> + ")", built with
 * createElement/createTextNode -- never innerHTML with interpolated data.
 * The color reflects the sign of pts: green for positive, red for
 * negative, muted gray for zero.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const state = FXP.state;
  const FXShared = window.FXShared;

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

  // ---------- recent performances, in the hover tooltip ----------
  // Desktop has no action menu section to put this in (that's the
  // coarse-pointer path), and hover IS the desktop idiom for "tell me more
  // about this player" -- so the same recent-form block the touch menu
  // shows is appended here, keeping the two platforms at parity rather
  // than making this a mobile-only feature.
  //
  // Gated exactly like the menus: only for players whose game hasn't
  // kicked off, since afterwards the real number has replaced the
  // question recent form was answering.
  function appendRecentSection(el, p) {
    if (!p || p.isEmpty || p.locked || !FXShared.getLast5) return;
    const teamId = FXP.rosterTeamId ? FXP.rosterTeamId() : null;
    const cached = FXShared.peekLast5(p.name, teamId);
    const section = document.createElement('div');
    section.className = 'fx-card-tip__recent';
    el.appendChild(section);

    if (cached !== undefined) {
      renderRecentInto(section, cached);
      return;
    }
    const loading = document.createElement('div');
    loading.className = 'fx-card-tip__recent-title';
    loading.textContent = 'Recent performances: loading…';
    section.appendChild(loading);
    FXShared.getLast5(p.name, teamId).then((rows) => {
      // Only paint if this same player is still the one being hovered --
      // by the time a fetch resolves the pointer may be on someone else,
      // or gone entirely.
      if (state.hoveredKey !== p.key) return;
      if (!state.tooltipEl || !state.tooltipEl.classList.contains('fx-card-tip--visible')) return;
      const live = state.tooltipEl.querySelector('.fx-card-tip__recent');
      if (!live) return;
      live.innerHTML = '';
      renderRecentInto(live, rows);
      positionCardTip(state.lastMouseX, state.lastMouseY);
    });
  }

  function renderRecentInto(section, rows) {
    const title = document.createElement('div');
    title.className = 'fx-card-tip__recent-title';
    title.textContent = 'Recent performances';
    section.appendChild(title);
    if (!rows || !rows.length) {
      const msg = document.createElement('div');
      msg.className = 'fx-card-tip__row fx-card-tip__recent-muted';
      msg.textContent = rows ? 'No games played yet' : 'Couldn’t load';
      section.appendChild(msg);
      return;
    }
    rows.forEach((g) => {
      const row = document.createElement('div');
      row.className = 'fx-card-tip__row';
      const pts = g.fpts !== '' && g.fpts != null ? formatSigned(g.fpts) : '0';
      const opp = formatRecentOpponent(g.opponent) || g.date || '';
      FXShared.renderStatLine(row, { text: opp, pts });
      section.appendChild(row);
    });
  }

  function formatRecentOpponent(oppText) {
    const trimmed = (oppText || '').trim();
    if (!trimmed) return '';
    if (trimmed.charAt(0) === '@') return `@ ${trimmed.slice(1).trim()}`;
    return `vs ${trimmed}`;
  }

  function showCardTip(lines, x, y, p) {
    if (!lines || !lines.length) return;
    const el = ensureCardTip();
    el.innerHTML = '';
    lines.forEach((line, i) => {
      const row = document.createElement('div');
      row.className = i === 0 ? 'fx-card-tip__title' : 'fx-card-tip__row';
      FXShared.renderStatLine(row, line);
      el.appendChild(row);
    });
    appendRecentSection(el, p);
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
    showCardTip(buildTooltipLines(p), state.lastMouseX, state.lastMouseY, p);
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
    // A player with an eventStatus (only ever set pre-kickoff -- see
    // roster.js's readEventStatus) has a colored status dot next to their
    // name on the list, but the dot's only explanation is an HTML `title`
    // attribute, which never shows on a tap/touch device. Prepend its label
    // (e.g. "Not expected to play") as its own line here so the tooltip
    // itself carries that explanation on mobile too, ahead of the
    // projection line below.
    const statusLine = p.eventStatus ? [FXP.EVENT_STATUS_LABEL[p.eventStatus]] : [];
    const proj = state.projectedCache.get(p.name);
    if (proj === undefined) return [...statusLine, 'Projected points not available yet'];
    const gw = FXP.getGameweekNumber();
    return [...statusLine, `Projected: ${proj} pts${gw ? ` (Gameweek ${gw})` : ''}`];
  }

  FXP.ensureCardTip = ensureCardTip;
  FXP.showCardTip = showCardTip;
  FXP.positionCardTip = positionCardTip;
  FXP.hideCardTip = hideCardTip;
  FXP.refreshOpenTooltip = refreshOpenTooltip;
  FXP.buildTooltipLines = buildTooltipLines;
})(window.FXP);
