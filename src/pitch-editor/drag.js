/**
 * Prettier Fantrax -- Pitch Editor: drag / click-to-select interactions
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
  let touchInProgress = false; // any finger currently down on a card (see the dragstart veto below)
  let touchActive = false; // true once the long-press has "lifted" the card
  let lastTouchTs = 0; // when a finger last touched any card -- see isTouchDerived

  // "Is this mouse event real, or synthesized from a touch gesture?" The
  // hover tooltip must only follow an actual mouse: Android dispatches
  // hover-emulation mouse events (mouseover/mouseenter/mousemove) at the
  // long-press moment once the native drag is vetoed (verified live
  // on-device: they land ~500ms into the hold, popping the tooltip in the
  // middle of a touch drag), and both platforms fire the standard
  // compatibility chain right after an unprevented tap's touchend. Three
  // tests, cheapest first: a finger is currently down (the mid-gesture
  // emulation case), the browser says so itself (sourceCapabilities is
  // Chromium-only but authoritative there), or a touch ended moments ago
  // (the after-tap chain on iOS, which lacks sourceCapabilities). A real
  // mouse used >1s after the last touch passes all three and hovers
  // normally.
  function isTouchDerived(e) {
    if (touchInProgress || touchActive) return true;
    if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return true;
    return Date.now() - lastTouchTs < 1000;
  }
  let touchSourcePlayer = null;
  let touchSourceCard = null;
  let touchGhostEl = null;
  let touchTargetCard = null; // card currently under the finger, if valid
  let suppressNextClick = false; // swallow the synthetic click browsers fire after a touch drag

  // What counts as a legal drop mirrors what Fantrax's own two-click lineup
  // flow can actually complete (verified live by arming real lineup-btns and
  // reading the `ineligible` classes + disabled buttons Fantrax puts on
  // every invalid destination). Two shapes of move exist:
  //
  //  - DIRECT: the incoming player is eligible for the exact slot the drop
  //    lands on (an empty slot, or the slot of the player they displace).
  //    One arm-click + one destination-click and Fantrax does the rest,
  //    including bumping the displaced player to the bench itself.
  //  - TWO-STEP (bench player replacing an active player of a position they
  //    can't play, e.g. a D-only bench player dropped on an active F): no
  //    single Fantrax op does this, but the sequence "bench player -> empty
  //    active slot of their own position, then displaced player -> the
  //    just-freed bench spot" completes it entirely through Fantrax's own
  //    controls. Only possible while the formation has an empty active slot
  //    the incoming player fits -- swap.js runs the sequence.
  //
  // Every combination below was verified against the live site; anything our
  // static rules get wrong is still caught at swap time, because swap.js
  // refuses to click a destination button Fantrax has disabled.
  function hasEmptyActiveSlotFor(player) {
    return state.players.some(
      (x) => x.isEmpty && !x.isReserve && !x.locked && player.eligiblePositions.includes(x.pos)
    );
  }

  function isValidDropTarget(source, target) {
    if (!source || !target) return false;
    if (source.key === target.key) return false;
    if (source.locked || target.locked) return false;
    if (source.isEmpty) return false;
    if (target.isEmpty) {
      // An empty bench slot only exists mid-shuffle; dropping an active
      // player there just benches them. Bench -> empty bench is pointless.
      if (target.isReserve) return !source.isReserve;
      return source.eligiblePositions.includes(target.pos);
    }
    // Bench <-> bench: neither player would become active -- pointless.
    if (source.isReserve && target.isReserve) return false;
    if (!source.isReserve && !target.isReserve) {
      // Active <-> active is a slot change; same slot type changes nothing.
      if (source.pos === target.pos) return false;
      return source.eligiblePositions.includes(target.pos);
    }
    // Active <-> bench: the bench player is coming in either way. They need
    // a slot -- the outgoing player's own, or any empty active slot they fit
    // (the two-step path).
    const incoming = source.isReserve ? source : target;
    const outgoing = source.isReserve ? target : source;
    return incoming.eligiblePositions.includes(outgoing.pos) || hasEmptyActiveSlotFor(incoming);
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
      // Android (WebView and Chrome) starts a NATIVE HTML5 drag on a
      // long-press of a draggable element at ~490ms -- right after our own
      // 375ms touch lift. Letting it start fires touchcancel, which tears
      // down the just-lifted ghost and kills the whole touch drag
      // (verified live on-device: touchstart -> [375ms] lift -> [491ms]
      // native dragstart -> [534ms] touchcancel -> everything reset). The
      // touch path owns any gesture that began with a finger, so veto the
      // native drag for the duration of the touch; mouse-initiated drags
      // never have a touch in flight and are unaffected.
      if (touchInProgress || touchActive) {
        e.preventDefault();
        return;
      }
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
        touchInProgress = true; // before any early return -- the dragstart veto must cover every touch
        lastTouchTs = Date.now();
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
        touchInProgress = false;
        lastTouchTs = Date.now();
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
      touchInProgress = false;
      lastTouchTs = Date.now();
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
        if (isTouchDerived(e)) return; // touch flows show stats via the action menu, never hover
        state.hoveredKey = p.key;
        state.lastMouseX = e.clientX;
        state.lastMouseY = e.clientY;
        FXP.showCardTip(FXP.buildTooltipLines(p), e.clientX, e.clientY, p);
      });
      card.addEventListener('mousemove', (e) => {
        if (isTouchDerived(e)) return;
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
