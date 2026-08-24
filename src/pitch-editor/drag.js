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
