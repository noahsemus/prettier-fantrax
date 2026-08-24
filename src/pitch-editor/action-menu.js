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
 * via tooltip.js's shared FXP.renderTipLine(), so the colored (+N)/(-N)
 * points span looks identical here and in the hover tooltip. This relies
 * on tooltip.css's .fx-tip-pts* classes, which are safe to reuse here since
 * manifest.json loads tooltip.css and action-menu.css together on the same
 * roster-page content script entry.
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
      FXP.renderTipLine(row, line);
      section.appendChild(row);
    });
    return section;
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

    if (isCoarsePointer()) {
      const statsSection = buildStatsSection(p);
      if (statsSection) {
        menu.appendChild(statsSection);
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
