/**
 * Prettier Fantrax -- Pitch Editor: swap execution against the real Fantrax controls
 * ---------------------------------------------------------------------
 * A swap is: click the source player's `lineup-btn`, wait, click the
 * target's `lineup-btn`, wait, then re-read the list to see if the
 * source's active/reserve status (or position) actually changed. If
 * Fantrax opens its own popup/menu partway through (this happens if your
 * account's "Lineup change system" setting is "Classic" instead of
 * "Easy Click"), this backs off and lets you finish it there rather than
 * guessing which menu item to click.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const state = FXP.state;
  const delay = FXP.delay;
  const overlayChildCount = FXP.overlayChildCount;

  function setStatus(text, kind) {
    if (!state.statusEl) return;
    state.statusEl.textContent = text;
    state.statusEl.className = 'fx-pitch__status' + (kind ? ' fx-pitch__status--' + kind : '');
  }

  function findTargetButton(target) {
    if (!target.isEmpty) {
      const row = FXP.findRowByName(target.name);
      return row ? row.querySelector('button.lineup-btn') : null;
    }
    const candidates = FXP.getListRows().filter((r) => {
      const a = r.querySelector('.scorer__info__name a');
      const btn = r.querySelector('button.lineup-btn');
      const isReserve = r.classList.contains('row--amber');
      return !a && btn && btn.textContent.trim() === target.pos && isReserve === target.isReserve;
    });
    const row = candidates[target.emptyIndex];
    return row ? row.querySelector('button.lineup-btn') : null;
  }

  async function attemptSwap(source, target) {
    if (state.busy) return;
    if (source.locked || target.locked) {
      setStatus("Can't move a player whose game has already started or finished.", 'err');
      return;
    }
    if (source.isEmpty) {
      setStatus('Drag a player onto the empty slot, not the other way around.', 'err');
      return;
    }
    if (source.isReserve === target.isReserve && !target.isEmpty) {
      setStatus('Those are both ' + (source.isReserve ? 'on the bench' : 'active') + ' already — nothing to swap.', 'err');
      return;
    }

    state.busy = true;
    setStatus(`Swapping ${source.name} ↔ ${target.isEmpty ? 'empty slot' : target.name}…`);

    const beforeOverlay = overlayChildCount();
    const sourceRow = FXP.findRowByName(source.name);
    const sourceBtn = sourceRow && sourceRow.querySelector('button.lineup-btn');
    if (!sourceBtn) {
      setStatus("Couldn't find that player in the list anymore — try again.", 'err');
      state.busy = false;
      FXP.render();
      return;
    }

    sourceBtn.click();
    await delay(250);

    // A menu-based flow (e.g. "Classic" lineup change system) opens an overlay.
    // Back off and let the user finish it themselves rather than guessing which
    // menu item to pick.
    if (overlayChildCount() > beforeOverlay) {
      setStatus('Fantrax opened its own picker for this — finish the swap there, then check back.', 'err');
      state.busy = false;
      return;
    }

    const targetBtn = findTargetButton(target);
    if (!targetBtn) {
      setStatus("Couldn't find the target slot — try again.", 'err');
      state.busy = false;
      FXP.render();
      return;
    }

    targetBtn.click();
    await delay(450);

    if (overlayChildCount() > beforeOverlay) {
      setStatus('Fantrax opened its own picker for this — finish the swap there, then check back.', 'err');
      state.busy = false;
      return;
    }

    const after = FXP.parseRoster();
    const newSource = after.find((x) => !x.isEmpty && x.name === source.name);
    const success = !!newSource && (newSource.isReserve !== source.isReserve || newSource.pos !== source.pos);

    state.busy = false;
    FXP.render();

    if (success) {
      setStatus(`Swapped ${source.name} ↔ ${target.isEmpty ? 'active slot' : target.name}.`, 'ok');
    } else {
      setStatus(
        "That didn't go through. This can happen if either player's game has already started, or your league locks lineup changes once the gameweek begins.",
        'err'
      );
    }
  }

  FXP.setStatus = setStatus;
  FXP.findTargetButton = findTargetButton;
  FXP.attemptSwap = attemptSwap;
})(window.FXP);
