/**
 * Prettier Fantrax -- Pitch Editor: swap execution against the real Fantrax controls
 * ---------------------------------------------------------------------
 * Every swap is executed through Fantrax's own lineup buttons, and
 * Fantrax's own eligibility logic is the gate: clicking a player's
 * `lineup-btn` "arms" them, and Fantrax immediately marks every invalid
 * destination row with an `ineligible` class and DISABLES its button.
 * We never re-derive those rules -- we just refuse to click a button
 * Fantrax has disabled, and report that Fantrax disallowed the move.
 *
 * THE MENU, AND WHAT ACTUALLY TRIGGERS IT (live-verified by scripting the
 * real page directly, arming/clicking dozens of combinations with a clean
 * discard-and-retry between each one):
 *
 * Fantrax's little "Move / Change to <pos>" menu has NOTHING to do with
 * click ordering or with whether *both* players are multi-position, despite
 * what an earlier version of this file assumed. The actual rule is simple:
 * clicking a RESERVE (bench) player's `lineup-btn` while nothing is
 * currently armed opens the menu IF AND ONLY IF that player has 2+ eligible
 * positions -- Fantrax can't yet highlight valid destinations without
 * knowing which discipline you mean to bring them on as. The exact same
 * player, clicked as the DESTINATION while someone else is already armed,
 * never opens it -- the target slot is already pinned by the armed
 * player's own position, so there's nothing left to disambiguate. Arming a
 * multi-position ACTIVE player is also always menu-free, armed first or
 * not, active players already occupy a definite slot.
 *
 * So: for a plain two-click swap between an active player and a bench
 * player, arming the ACTIVE side first and clicking the BENCH side as the
 * destination is live-verified to complete cleanly with no menu, for every
 * combination of single/multi-position tried on either side. (The previous
 * version of this file armed the bench side first "to avoid the menu" --
 * live testing showed that ordering is exactly backwards; it's what
 * *causes* the menu whenever the bench player has 2+ eligible positions,
 * which is the bug the user reported.)
 *
 * The menu is unavoidable in exactly one place: step 1 of the two-step
 * cross-position replacement below, where the player being armed has to be
 * the bench player (there's no active counterpart to arm instead -- the
 * destination is an empty slot, not a player). When that bench player has
 * 2+ eligible positions, the menu opens the instant they're armed. Of its
 * items ("import_exportMove" / "Change toM" / "Change toD" -- icon
 * ligatures glued onto the label text), "Move" was live-verified to always
 * work: it arms the player exactly as a direct click would have, ready for
 * the follow-up destination click. "Change to <pos>" was live-verified to
 * do the opposite of something useful -- it silently cancels the whole
 * selection (every row's disabled state resets) with no swap -- so we
 * never try it; if "Move" isn't there we give up and say so.
 *
 * A cross-position replacement (e.g. a D-only bench player replacing an
 * active F) has no single Fantrax op, but decomposes into two that do
 * exist (both live-verified):
 *   1. bench player -> empty active slot of a position they play
 *   2. displaced active player -> the bench spot freed by step 1
 *
 * The user should never see any of this: dragging is the whole interface,
 * and the driven menu (plus the auto-dismissed Unsaved-Changes nag, see
 * `dismissUnsavedChangesNag` below) still visually renders -- mispositioned
 * in the viewport's top-left corner, since it anchors to a lineup-btn we
 * keep hidden -- for the ~300-400ms between Fantrax opening it and us
 * clicking through it. So for the duration of attemptSwap we mask the
 * entire `.cdk-overlay-container` with `visibility: hidden`, the same
 * `fx-syncing`-style trick points-sync.js already uses for its own driven
 * flip (see its `ensureSyncStyle`). `visibility: hidden` was live-verified
 * to still allow `.click()` on the hidden buttons -- it's a rendering
 * property, not a hit-testing one, and `.click()` calls the element's
 * click handler directly rather than simulating a mouse event at
 * coordinates -- so driving the menu still works with it applied.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const state = FXP.state;
  const delay = FXP.delay;
  const overlayChildCount = FXP.overlayChildCount;

  const SWAP_STYLE_ID = 'fx-swap-style';
  const SWAP_DRIVING_CLASS = 'fx-swap-driving';

  function ensureSwapDrivingStyle() {
    if (document.getElementById(SWAP_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = SWAP_STYLE_ID;
    style.textContent =
      '.' +
      SWAP_DRIVING_CLASS +
      ' .cdk-overlay-container { visibility: hidden !important; }\n' +
      '.' +
      SWAP_DRIVING_CLASS +
      ' .cdk-overlay-container * { transition: none !important; }';
    document.head.appendChild(style);
  }

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

  // First empty ACTIVE slot the player is eligible for, preferring their
  // current listed position. Looked up fresh (not from state.players) so it
  // sees the list as it stands mid-sequence.
  //
  // Fantrax structurally renders these empty D/M/F rows up to the league's
  // formation MAX for each discipline (e.g. D:3-5) at all times, regardless
  // of whether the current active count is already at the 11-player total --
  // live-verified: from a full, valid 11/11 lineup, two extra empty D rows
  // and one extra empty F row are already sitting in the list, clickable.
  // Filling one of them is a real Fantrax op (it doesn't reject it), but it
  // pushes the total active count to 12 -- a legal *intermediate* state only
  // because step 2 below is expected to immediately bench someone and bring
  // it back to 11. There can be more than one candidate row for a given
  // position, and Fantrax may enable only some of them (`disabled`/
  // `ineligible` on the rest) -- skip any it has disabled, same rule as
  // every other destination in this file.
  function findEmptyActiveSlotButton(player) {
    const prefs = [player.pos].concat(player.eligiblePositions.filter((p) => p !== player.pos));
    for (const pos of prefs) {
      if (!player.eligiblePositions.includes(pos)) continue;
      const row = FXP.getListRows().find((r) => {
        const a = r.querySelector('.scorer__info__name a');
        const btn = r.querySelector('button.lineup-btn');
        return !a && btn && !btn.disabled && btn.textContent.trim() === pos && !r.classList.contains('row--amber');
      });
      if (row) return row.querySelector('button.lineup-btn');
    }
    return null;
  }

  // Empty bench spot (only exists mid-shuffle, e.g. right after step 1 of a
  // two-step replacement moves a bench player into the lineup).
  //
  // Live-verified root cause of a real bug: right after step 1 pushes active
  // to 12 (see findEmptyActiveSlotButton above), the reserve section renders
  // TWO empty amber rows, not one -- and the FIRST one in DOM order was
  // `disabled` + `ineligible` for the specific player step 2 arms, while the
  // SECOND was the real, clickable one (`eligible-to`, not disabled). The
  // old `.find()` here grabbed whichever came first with no disabled check,
  // so it silently clicked the wrong (disabled-but-still-clickable-via-JS)
  // row: nothing happened, the outgoing player stayed active, and the
  // lineup was left over-full at 12. Skip disabled rows here too.
  function findEmptyReserveSlotButton() {
    const row = FXP.getListRows().find((r) => {
      const a = r.querySelector('.scorer__info__name a');
      const btn = r.querySelector('button.lineup-btn');
      return !a && btn && !btn.disabled && r.classList.contains('row--amber');
    });
    return row ? row.querySelector('button.lineup-btn') : null;
  }

  // Fantrax also nags with its OWN "Unsaved Changes" dialog (buttons read
  // "arrow_backLeave" / "redoStay", icon ligature glued on) whenever a
  // lineup change is pending -- completely unrelated to swap mechanics, but
  // it lands in the same `.cdk-overlay-container` we watch for the real
  // "Move" menu. Root cause (found later, chasing a report that it kept
  // appearing during a run of several swaps): it's not a generic idle
  // timer -- points-sync.js's background scrape flips the real Fantasy
  // Points/Stats tabs (and opens the period `mat-select`) roughly every
  // 60s, both of which are real Angular route/query-param navigations, so
  // either one trips this exact guard while a change is pending. That file
  // now checks FXP.hasPendingLineupChanges() and skips its whole scrape
  // whenever one is, so in normal use this collision shouldn't happen
  // anymore -- state.busy also already blocks it for the full duration of
  // any swap this function itself is running. Dismissal stays here as a
  // safety net (e.g. a change left pending between two separate swaps,
  // right as a new one starts, before that guard has had a chance to back
  // the scrape off) -- Stay, since we're not navigating.
  function dismissUnsavedChangesNag() {
    const overlay = document.querySelector('.cdk-overlay-container');
    if (!overlay) return false;
    const stay = Array.from(overlay.querySelectorAll('button')).find((b) => /stay\s*$/i.test(b.textContent.trim()));
    if (!stay) return false;
    stay.click();
    return true;
  }

  // Best-effort driver for Fantrax's "Move / Change to <pos>" menu when it
  // opens on arming a multi-position bench player (see header). "Move" was
  // live-verified to always complete an arm; "Change to <pos>" was
  // live-verified to just cancel the selection, so we don't try it.
  async function driveSwapMenu() {
    const overlay = document.querySelector('.cdk-overlay-container');
    if (!overlay) return false;
    const items = Array.from(overlay.querySelectorAll('button, .mat-mdc-menu-item, [mat-menu-item], a'));
    const move = items.find((b) => /move\s*$/i.test(b.textContent.trim()));
    if (!move) return false;
    move.click();
    await delay(400);
    return true;
  }

  // If the overlay grew, first rule out the unrelated Unsaved-Changes nag
  // (dismiss and re-check), then try to drive a real "Move" menu. Returns
  // true once the overlay is back to baseline (whether nothing opened, the
  // nag was dismissed, or the menu was successfully driven).
  async function clearAnyOverlay(beforeOverlay) {
    if (overlayChildCount() <= beforeOverlay) return true;
    if (dismissUnsavedChangesNag()) {
      await delay(250);
      if (overlayChildCount() <= beforeOverlay) return true;
    }
    if (await driveSwapMenu()) {
      if (overlayChildCount() <= beforeOverlay) return true;
      // The menu itself might have been sitting behind the nag -- one more pass.
      if (dismissUnsavedChangesNag()) {
        await delay(250);
        if (overlayChildCount() <= beforeOverlay) return true;
      }
    }
    return overlayChildCount() <= beforeOverlay;
  }

  // One arm-click + one destination-click through the real list. `arm` is
  // always a named player; `destBtn` is resolved AFTER arming (Fantrax
  // re-flags rows the moment a player is armed). Returns true on success;
  // on failure it disarms (second click on the armed button) so the real
  // list isn't left in a half-armed state.
  async function runStep(arm, resolveDestBtn, beforeOverlay) {
    const armRow = FXP.findRowByName(arm.name);
    const armBtn = armRow && armRow.querySelector('button.lineup-btn');
    if (!armBtn) {
      setStatus("Couldn't find " + arm.name + ' in the list anymore — try again.', 'err');
      return false;
    }
    armBtn.click();
    await delay(300);

    if (!(await clearAnyOverlay(beforeOverlay))) {
      setStatus('Fantrax opened its own picker for this — finish the swap there, then check back.', 'err');
      return false;
    }

    const destBtn = resolveDestBtn();
    if (!destBtn) {
      armBtn.click(); // disarm
      await delay(200);
      setStatus("Couldn't find the destination slot — try again.", 'err');
      return false;
    }
    if (destBtn.disabled) {
      // Fantrax's own eligibility logic says no. Trust it.
      armBtn.click(); // disarm
      await delay(200);
      setStatus("Fantrax doesn't allow that move.", 'err');
      return false;
    }

    destBtn.click();
    await delay(450);

    if (!(await clearAnyOverlay(beforeOverlay))) {
      setStatus('Fantrax opened its own picker for this — finish the swap there, then check back.', 'err');
      return false;
    }
    return true;
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
    if (!FXP.isValidDropTarget(source, target)) {
      setStatus("That move isn't possible.", 'err');
      return;
    }

    state.busy = true;
    setStatus(`Swapping ${source.name} ↔ ${target.isEmpty ? 'empty slot' : target.name}…`);

    // Mask Fantrax's overlay container for the whole sequence -- see header.
    // Removal is unconditional (every exit path, including a thrown error)
    // because a stuck class would permanently hide ALL Fantrax overlays
    // (dialogs, menus, tooltips) site-wide, which is far worse than letting
    // one flash through.
    ensureSwapDrivingStyle();
    document.documentElement.classList.add(SWAP_DRIVING_CLASS);

    // Mark just the two involved cards as mid-swap (card.css's
    // .fx-card--swapping: dim + a small spinner) rather than taking over the
    // whole pitch the way the initial points-sync loading state does -- this
    // is "the data's fine, these two cards are mid-request," not "we don't
    // have anything to show yet." Covers the two-step path too: `incoming`/
    // `outgoing` below are just `source`/`target` relabeled, so marking
    // these two is enough for every shape (direct swap, empty-slot target,
    // two-step). An empty-slot target is normally `display: none` unless
    // mid-drag-hover (card.css .fx-card--empty), and drag.js's `dragend`
    // clears that hover state on the very next event tick -- before any of
    // this function's own delays -- so .fx-card--swapping also forces it
    // visible in card.css, otherwise the loading card would never be seen.
    const sourceCard = state.cardsByKey.get(source.key);
    const targetCard = state.cardsByKey.get(target.key);
    if (sourceCard) sourceCard.classList.add('fx-card--swapping');
    if (targetCard) targetCard.classList.add('fx-card--swapping');

    try {
      const beforeOverlay = overlayChildCount();

      // Build the click plan.
      let ok;
      let twoStep = false;
      let incoming, outgoing;
      if (target.isEmpty || (!source.isReserve && !target.isReserve)) {
        // Empty-slot or active<->active: arm source directly, click the
        // target. Arming an active player never opens the menu; arming a
        // reserve player here only happens when the target is an empty slot
        // (no active counterpart to arm instead), which is exactly step 1's
        // shape below and is handled the same way if the menu opens.
        ok = await runStep(source, () => findTargetButton(target), beforeOverlay);
      } else {
        incoming = source.isReserve ? source : target;
        outgoing = source.isReserve ? target : source;
        if (incoming.eligiblePositions.includes(outgoing.pos)) {
          // Direct active<->bench swap: arm the ACTIVE side (outgoing) first
          // and click the BENCH side (incoming) as the destination. Live-
          // verified menu-free regardless of single/multi-position on either
          // side -- see header. (Arming the bench side first is what
          // triggers the menu; don't do that here.)
          ok = await runStep(outgoing, () => findTargetButton(incoming), beforeOverlay);
        } else {
          // Two-step replacement: incoming -> empty active slot they fit,
          // then outgoing -> the bench spot that just opened up. Step 1 has
          // no active counterpart to arm instead, so if incoming has 2+
          // eligible positions the menu WILL open on arming -- runStep drives
          // it via "Move". Step 1 alone leaves the lineup over-full (12
          // active) until step 2 lands -- see findEmptyActiveSlotButton.
          twoStep = true;
          setStatus(`Bringing ${incoming.name} in and benching ${outgoing.name}…`);
          ok = await runStep(incoming, () => findEmptyActiveSlotButton(incoming), beforeOverlay);
          if (ok) {
            ok = await runStep(outgoing, () => findEmptyReserveSlotButton(), beforeOverlay);
          }
        }
      }

      if (!ok) {
        return;
      }

      const after = FXP.parseRoster();

      if (twoStep) {
        // Step 1 succeeding only means `incoming` is active -- it says
        // nothing about whether step 2 actually benched `outgoing`. Checking
        // only the drag's `source` (as the single-op paths below do) would
        // report success here even when step 2 silently failed, leaving an
        // invalid over-full (12-active) lineup with the user none the wiser
        // -- exactly what was reported live. Require BOTH halves to have
        // actually landed before calling it a swap.
        const newIncoming = after.find((x) => !x.isEmpty && x.name === incoming.name);
        const newOutgoing = after.find((x) => !x.isEmpty && x.name === outgoing.name);
        const incomingLanded = !!newIncoming && !newIncoming.isReserve;
        const outgoingBenched = !!newOutgoing && newOutgoing.isReserve;
        if (incomingLanded && outgoingBenched) {
          setStatus(`Swapped ${source.name} ↔ ${target.name}.`, 'ok');
        } else if (incomingLanded) {
          setStatus(
            `Brought ${incoming.name} in, but couldn't bench ${outgoing.name} — the lineup now has an extra ` +
              `active player. Drag ${outgoing.name} to the bench, or fix it in Fantrax's own list.`,
            'err'
          );
        } else {
          setStatus(
            "That didn't go through. This can happen if either player's game has already started, or your league locks lineup changes once the gameweek begins.",
            'err'
          );
        }
      } else {
        const newSource = after.find((x) => !x.isEmpty && x.name === source.name);
        const success = !!newSource && (newSource.isReserve !== source.isReserve || newSource.pos !== source.pos);
        if (success) {
          setStatus(`Swapped ${source.name} ↔ ${target.isEmpty ? 'active slot' : target.name}.`, 'ok');
        } else {
          setStatus(
            "That didn't go through. This can happen if either player's game has already started, or your league locks lineup changes once the gameweek begins.",
            'err'
          );
        }
      }
    } finally {
      document.documentElement.classList.remove(SWAP_DRIVING_CLASS);
      // Belt-and-braces: FXP.render() below rebuilds every card from scratch
      // (including cardsByKey) whenever it actually runs, which already
      // drops .fx-card--swapping -- but render() no-ops off the roster page,
      // so an explicit removal here is what actually guarantees these two
      // specific elements aren't left permanently dimmed/spinning if that
      // happens.
      if (sourceCard) sourceCard.classList.remove('fx-card--swapping');
      if (targetCard) targetCard.classList.remove('fx-card--swapping');
      state.busy = false;
      FXP.render();
    }
  }

  FXP.setStatus = setStatus;
  FXP.findTargetButton = findTargetButton;
  FXP.attemptSwap = attemptSwap;
})(window.FXP);
