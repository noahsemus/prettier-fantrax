/**
 * Prettier Fantrax -- Pitch Editor: per-player action menu
 * ---------------------------------------------------------------------
 * Clicking a player opens a small menu instead of immediately arming a
 * swap. "Start Swap" reuses the existing arm/highlight flow; Trade, Drop,
 * and View Player Card just click the equivalent real control already
 * sitting in that player's (hidden) list row -- Fantrax's own Trade
 * picker, Drop confirmation, and full player-card modal (Stats/Splits/
 * News/Watch List/Compare/Notes, all of Fantrax's own UI) open exactly as
 * they would from the real list, so none of that needs reimplementing here.
 *
 * Touch devices have no hover, so the points-breakdown/projection tooltip
 * (tooltip.js's FXP.buildTooltipLines) is otherwise unreachable there. On a
 * coarse-pointer device (checked at open time), this menu prepends a
 * read-only stats section above the action buttons with exactly those
 * tooltip lines, separated by a divider -- a static, non-clickable block
 * that just happens to live inside the same menu; it doesn't add any
 * behavior to the doc-click-outside-closes-menu or Escape-closes-menu
 * logic below. Desktop (fine pointer) keeps the plain button-only menu,
 * since the hover tooltip already covers stats there.
 *
 * buildTooltipLines() entries are either plain strings or hybrid
 * { text, pts } objects (see tooltip.js); buildStatsSection renders both
 * via the shared FXShared.renderStatLine() (src/shared/touch-overlay.js),
 * so the colored (+N)/(-N) points span looks identical here, in the hover
 * tooltip, AND in matchup's tooltip -- all three now go through one
 * function and one set of CSS classes (touch-overlay.css) instead of each
 * feature maintaining its own copy.
 *
 * On a coarse-pointer (touch) device this menu is anchored to the tapped
 * card -- not the raw tap coordinates -- via FXShared.anchorToElement, kept
 * stuck to the card through a scroll via FXShared.trackAnchor (closing the
 * menu if the card ever goes stale/detached), and dims every other
 * `.fx-card` via FXShared.selectAndDim while it's open. This mirrors
 * matchup's touch-tooltip mechanics exactly (same shared module, keyed
 * 'fxp' so its scroll-tracker can't collide with matchup's 'fxm' one). The
 * desktop (fine-pointer) menu keeps the original raw-coordinate
 * positioning (positionMenu below) -- it isn't anchored to any one card in
 * the same "don't cover the tapped player" sense a touch tap is, since a
 * mouse click's own cursor position is never mistaken for the card itself.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const state = FXP.state;
  const FXShared = window.FXShared;

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

  function isCoarsePointer() {
    return window.matchMedia('(pointer: coarse)').matches;
  }

  // Read-only stats block for touch devices (no hover => no tooltip access).
  // Mirrors the hover tooltip's own line styling (title + muted rows), just
  // sized for the menu. Returns null when there's nothing to show, so the
  // caller can skip the section (and its divider) entirely.
  function buildStatsSection(p) {
    const lines = FXP.buildTooltipLines(p);
    if (!lines || !lines.length) return null;
    const section = document.createElement('div');
    section.className = 'fx-action-menu__stats';
    lines.forEach((line, i) => {
      const row = document.createElement('div');
      row.className = i === 0 ? 'fx-action-menu__stats-title' : 'fx-action-menu__stats-row';
      FXShared.renderStatLine(row, line);
      section.appendChild(row);
    });
    return section;
  }

  // ---------- "Recent performances" (src/shared/last5.js) ----------
  // The same block matchup's action menu carries, built on the SAME shared
  // module (src/shared/last5.js), so both features share one league-wide
  // scorerId lookup per page load and one cache -- see that file's own
  // comment for exactly how far the per-player sharing goes.
  //
  // Shown only for players whose game hasn't kicked off yet (roster.js
  // sets `locked` when the opp cell no longer carries a clock time, i.e.
  // the game has started or finished). On a FUTURE gameweek that's the
  // whole squad, which is the case the user asked for -- and on the
  // current one it keeps showing form for players still to play, exactly
  // when "should I start them?" is the live question, while staying out of
  // the way for players whose points are already real and on the card.
  //
  // Fantrax's scorerMap is league-wide, so resolving an abbreviated card
  // name ("M. Sangaré") is disambiguated by the fantasy team that owns the
  // player -- here, whichever team's roster is on screen, read off the
  // URL's own `teamId` matrix param. That param is absent when Fantrax
  // renders your own default roster, in which case this passes null and
  // last5.js falls back to its league-wide unique-match rule (which still
  // refuses rather than guessing when two players genuinely collide).
  function rosterTeamId() {
    const m = /[;&?]teamId=([^;&?]+)/.exec(location.href);
    return m ? m[1] : null;
  }

  function formatSigned(text) {
    const n = parseFloat(text);
    return n > 0 ? `+${text}` : text;
  }

  function formatRecentOpponent(oppText) {
    const trimmed = (oppText || '').trim();
    if (!trimmed) return '';
    if (trimmed.charAt(0) === '@') return `@ ${trimmed.slice(1).trim()}`;
    return `vs ${trimmed}`;
  }

  // Three outcomes, three renderings -- never a silently absent section.
  // `rows === null` is a failed fetch (last5.js throws rather than caching
  // Fantrax's rate-limit response, so re-tapping genuinely does retry); an
  // empty array is a player with no games on record yet. Mirrors matchup's
  // renderLast5Rows exactly.
  function buildLast5Message(text) {
    const row = document.createElement('div');
    row.className = 'fx-action-menu__last5-row fx-action-menu__last5-row--muted';
    row.textContent = text;
    return row;
  }

  function renderLast5Rows(rows) {
    const nodes = [];
    const title = document.createElement('div');
    title.className = 'fx-action-menu__last5-title';
    title.textContent = 'Recent performances';
    nodes.push(title);
    if (!rows) {
      nodes.push(buildLast5Message('Couldn’t load — tap again to retry'));
      return nodes;
    }
    if (!rows.length) {
      nodes.push(buildLast5Message('No games played yet'));
      return nodes;
    }
    rows.forEach((g) => {
      const row = document.createElement('div');
      row.className = 'fx-action-menu__last5-row';
      const ptsText = g.fpts !== '' && g.fpts != null ? formatSigned(g.fpts) : '0';
      const oppText = formatRecentOpponent(g.opponent) || g.date || '';
      FXShared.renderStatLine(row, { text: oppText, pts: ptsText });
      nodes.push(row);
    });
    return nodes;
  }

  // Re-renders into WHATEVER menu is currently open rather than a captured
  // element, and only if it's still this player's -- by the time the fetch
  // resolves the user may have tapped someone else, and painting one
  // player's form into another's menu is exactly the bug that guard
  // prevents. The roster's menu is only ever open for one card at a time
  // (state.actionMenuPlayerKey, set in openActionMenu).
  function refreshLast5UI(playerKey, rows) {
    if (!state.actionMenuEl || state.actionMenuPlayerKey !== playerKey) return;
    const container = state.actionMenuEl.querySelector('.fx-action-menu__last5');
    if (!container) return;
    container.innerHTML = '';
    renderLast5Rows(rows).forEach((n) => container.appendChild(n));
  }

  function buildLast5Section(p) {
    if (p.isEmpty || p.locked) return null; // already played -- the real number is on the card
    const teamId = rosterTeamId();
    const container = document.createElement('div');
    container.className = 'fx-action-menu__last5';
    const cached = FXShared.peekLast5(p.name, teamId);
    if (cached !== undefined) {
      renderLast5Rows(cached).forEach((n) => container.appendChild(n));
    } else {
      const loading = document.createElement('div');
      loading.className = 'fx-action-menu__last5-title fx-action-menu__last5-title--loading';
      loading.textContent = 'Recent performances: loading…';
      container.appendChild(loading);
      FXShared.getLast5(p.name, teamId).then((rows) => refreshLast5UI(p.key, rows));
    }
    return container;
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
    state.actionMenuPlayerKey = null;
    // Single choke point for every close path (tap-outside via onDocClick,
    // Escape via onKeydown, or picking a menu item) -- tearing down the
    // scroll-tracker and clearing the tap-select dimming here means none
    // of those callers need to remember to do it themselves. Both are
    // no-ops when the menu was opened on the desktop (fine-pointer) path,
    // since only the coarse-pointer path below ever registers/dims them.
    FXShared.stopTrackingAnchor('fxp');
    FXShared.clearDim(state.container || document, '.fx-card', 'fx-card--dimmed');
    document.removeEventListener('click', onDocClick, true);
    document.removeEventListener('keydown', onKeydown, true);
  }

  // Desktop (fine-pointer) positioning only -- raw tap/click coordinates,
  // clamped to the viewport. See openActionMenu for why the coarse-pointer
  // (touch) path uses FXShared.anchorToElement against the card instead.
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
    const coarse = isCoarsePointer();

    // Tracked so refreshLast5UI can tell whether the menu that's open when
    // a fetch resolves is still the one that started it.
    state.actionMenuPlayerKey = p.key;

    if (coarse) {
      const statsSection = buildStatsSection(p);
      if (statsSection) menu.appendChild(statsSection);
      // Recent form sits under the stats block as supporting info (same
      // ordering and reasoning as matchup's menu), and only one divider
      // goes in above the buttons regardless of which of the two
      // read-only sections are present.
      const last5Section = buildLast5Section(p);
      if (last5Section) menu.appendChild(last5Section);
      if (statsSection || last5Section) {
        const divider = document.createElement('div');
        divider.className = 'fx-action-menu__divider';
        menu.appendChild(divider);
      }
    }

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

    if (coarse) {
      // Anchor to the CARD (mirrors matchup's touch tooltip) rather than
      // the raw tap coordinates, so the menu never covers the tapped
      // player card -- the exact complaint that was just fixed for
      // matchup. FXShared.trackAnchor keeps it stuck to the card through a
      // scroll, closing the menu (via closeActionMenu, which also tears
      // down the tracker) if the card ever goes stale/detached from a
      // re-render.
      const reposition = () => FXShared.anchorToElement(menu, card, { gap: 8, margin: 8 });
      reposition();
      FXShared.trackAnchor('fxp', {
        overlayEl: menu,
        targetEl: card,
        isVisible: () => !!state.actionMenuEl,
        onReposition: reposition,
        onStale: closeActionMenu,
      });
      // Dim every other player card so it's unambiguous which one this
      // menu belongs to -- roster's equivalent of matchup's tap-select
      // dimming. Touch path only; desktop's menu isn't tied to a single
      // "selected" card in the same way.
      FXShared.selectAndDim(state.container || document, '.fx-card', card, 'fx-card--dimmed');
    } else {
      positionMenu(menu, x, y);
    }

    // Deferred so the click that opened the menu doesn't immediately close it.
    setTimeout(() => {
      document.addEventListener('click', onDocClick, true);
      document.addEventListener('keydown', onKeydown, true);
    }, 0);
  }

  // Exported so tooltip.js can key its own recent-performances lookup the
  // same way this menu does -- both must agree on the team id or they'd
  // fetch (and cache) the same player twice.
  FXP.rosterTeamId = rosterTeamId;
  FXP.openActionMenu = openActionMenu;
  FXP.closeActionMenu = closeActionMenu;
  FXP.triggerRowAction = triggerRowAction;
})(window.FXP);
