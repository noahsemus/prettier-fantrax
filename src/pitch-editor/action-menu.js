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

    if (coarse) {
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

  FXP.openActionMenu = openActionMenu;
  FXP.closeActionMenu = closeActionMenu;
  FXP.triggerRowAction = triggerRowAction;
})(window.FXP);
