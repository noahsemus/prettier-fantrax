/**
 * Fantrax Refinements -- Pitch Editor: drag / click-to-select interactions
 * ---------------------------------------------------------------------
 * A "source" player becomes active either by starting a native drag, by
 * tap-and-hold on a touch device, or by choosing "Start Swap" from a
 * card's action menu. Either way, every other card is immediately
 * classified as a legal or illegal target for that source and styled
 * accordingly (illegal targets dim and stop accepting clicks/drops; empty
 * slots -- normally invisible -- only appear where the source could
 * actually land). This is the single source of truth for "can X go here"
 * so the drag preview and the click-arm flow can't disagree.
 *
 * Touch devices never fire the HTML5 drag* events below (a touch gesture
 * just scrolls the page), so touchstart/touchmove/touchend/touchcancel
 * listeners run a parallel gesture: hold a draggable card for ~375ms
 * without moving more than a few px to "lift" it (a floating ghost clone
 * tracks the finger from then on), then drag over a target and release.
 * That path re-parses the roster on drop and calls FXP.attemptSwap just
 * like the mouse `drop` handler, and reuses isValidDropTarget/
 * highlightValidTargets so both paths agree on "can X go here."
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const state = FXP.state;

  const TOUCH_LONG_PRESS_MS = 375; // hold this long without moving to lift a card
  const TOUCH_MOVE_CANCEL_PX = 10; // finger moves more than this before the hold fires => treat as a scroll

  // Touch gesture state. Only one touch drag can be in flight at a time
  // (same invariant as state.dragSource for mouse), so this lives at
  // module scope rather than per-card -- touchmove/touchend always retarget
  // to the element that received the touchstart, so the same closure keeps
  // receiving events for the whole gesture even as the finger moves.
  let touchTimer = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchActive = false; // true once the long-press has "lifted" the card
  let touchSourcePlayer = null;
  let touchSourceCard = null;
  let touchGhostEl = null;
  let touchTargetCard = null; // card currently under the finger, if valid
  let suppressNextClick = false; // swallow the synthetic click browsers fire after a touch drag

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

  // ---------- touch (tap-and-hold drag) ----------

  function clearTouchTimer() {
    if (touchTimer) {
      clearTimeout(touchTimer);
      touchTimer = null;
    }
  }

  function createTouchGhost(card) {
    const rect = card.getBoundingClientRect();
    const ghost = card.cloneNode(true);
    ghost.classList.add('fx-card--touch-ghost');
    ghost.style.position = 'fixed';
    ghost.style.left = `${rect.left}px`;
    ghost.style.top = `${rect.top}px`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.margin = '0';
    document.body.appendChild(ghost);
    return ghost;
  }

  function moveTouchGhost(x, y) {
    if (!touchGhostEl) return;
    // Offset above the fingertip so the thumb doesn't hide the card it's carrying.
    touchGhostEl.style.left = `${x - touchGhostEl.offsetWidth / 2}px`;
    touchGhostEl.style.top = `${y - touchGhostEl.offsetHeight / 2 - 28}px`;
  }

  function startTouchDrag(card, p, x, y) {
    touchTimer = null;
    if (state.busy || p.isEmpty || p.locked) return;
    FXP.closeActionMenu();
    if (state.armed && state.armed.key !== p.key) clearArmed(); // one active source at a time
    touchActive = true;
    touchSourcePlayer = p;
    touchSourceCard = card;
    state.dragSource = p;
    touchGhostEl = createTouchGhost(card); // clone the pristine card before dimming the original below
    card.classList.add('fx-card--dragging'); // same "this is the source" look as the mouse path
    highlightValidTargets(p);
    moveTouchGhost(x, y);
  }

  function updateTouchTarget(x, y) {
    const el = document.elementFromPoint(x, y);
    const cardEl = el && el.closest && el.closest('.fx-card');
    if (cardEl === touchTargetCard) return;
    if (touchTargetCard) touchTargetCard.classList.remove('fx-card--drop-target');
    touchTargetCard = null;
    if (!cardEl || !touchSourcePlayer) return;
    const target = state.players.find((x) => x.key === cardEl.dataset.key);
    if (target && isValidDropTarget(touchSourcePlayer, target)) {
      cardEl.classList.add('fx-card--drop-target');
      touchTargetCard = cardEl;
    }
  }

  function endTouchDrag() {
    if (touchSourceCard) touchSourceCard.classList.remove('fx-card--dragging');
    if (touchGhostEl) {
      touchGhostEl.remove();
      touchGhostEl = null;
    }
    touchTargetCard = null;
    touchActive = false;
    touchSourcePlayer = null;
    touchSourceCard = null;
    state.dragSource = null;
    clearTargetHighlights();
  }

  function finishTouchDrag() {
    const dropCard = touchTargetCard;
    const sourcePlayer = touchSourcePlayer;
    endTouchDrag();
    suppressNextClick = true;
    setTimeout(() => {
      suppressNextClick = false;
    }, 500);
    if (!dropCard || !sourcePlayer) return;
    const target = state.players.find((x) => x.key === dropCard.dataset.key);
    // Re-parse the roster for a fresh source, mirroring the mouse `drop` handler.
    const source = FXP.parseRoster().find((x) => x.key === sourcePlayer.key);
    if (!source || !target || !isValidDropTarget(source, target)) return;
    FXP.attemptSwap(source, target);
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

    // touchstart/touchmove/touchend/touchcancel never fire on mouse-only
    // (desktop) devices, so this block only meaningfully engages on touch --
    // the mouse drag* listeners above are untouched by its presence.
    card.addEventListener(
      'touchstart',
      (e) => {
        if (!canDrag) return;
        if (e.touches.length !== 1) return; // ignore multi-touch (pinch/scroll gestures)
        const t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        clearTouchTimer();
        touchTimer = setTimeout(() => startTouchDrag(card, p, t.clientX, t.clientY), TOUCH_LONG_PRESS_MS);
      },
      { passive: false }
    );

    card.addEventListener(
      'touchmove',
      (e) => {
        if (touchActive) {
          e.preventDefault(); // block page scroll once a card is lifted
          const t = e.touches[0];
          moveTouchGhost(t.clientX, t.clientY);
          updateTouchTarget(t.clientX, t.clientY);
          return;
        }
        if (!touchTimer) return;
        const t = e.touches[0];
        const dx = t.clientX - touchStartX;
        const dy = t.clientY - touchStartY;
        if (Math.hypot(dx, dy) > TOUCH_MOVE_CANCEL_PX) {
          clearTouchTimer(); // finger is scrolling, not holding -- let the page scroll
        }
      },
      { passive: false }
    );

    card.addEventListener(
      'touchend',
      (e) => {
        if (touchActive) {
          e.preventDefault();
          finishTouchDrag();
          return;
        }
        clearTouchTimer(); // released before the hold fired -- treat as a plain tap, let `click` handle it
      },
      { passive: false }
    );

    card.addEventListener('touchcancel', () => {
      clearTouchTimer();
      if (touchActive) endTouchDrag();
    });

    // iOS/Android's native long-press context menu would otherwise fight the lift gesture.
    card.addEventListener('contextmenu', (e) => {
      if (touchActive) e.preventDefault();
    });

    card.addEventListener('click', (e) => {
      if (suppressNextClick) return; // swallow the synthetic click after a completed touch-drag
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
