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
