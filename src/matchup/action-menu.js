/**
 * Prettier Fantrax -- Matchup Pitch: per-player action menu
 * ---------------------------------------------------------------------
 * Tapping/clicking a player on the matchup pitch opens a small menu of
 * real actions instead of (touch) toggling the stat tooltip or (desktop)
 * doing nothing beyond the hover tooltip. This is pitch-editor/
 * action-menu.js's exact model, re-namespaced under FXM/`fxm-`: on a
 * coarse-pointer (touch) device the menu prepends a read-only stats
 * section (this feature's own buildTooltipLines, rendered via the SAME
 * FXShared.renderStatLine every stat line in this codebase now goes
 * through) above the action buttons, since touch has no hover and would
 * otherwise never see those numbers at all. Desktop (fine pointer) skips
 * the stats section -- the hover tooltip (render.js's attachHoverTooltip)
 * already covers that there, untouched by this file.
 *
 * Unlike pitch-editor's roster, the matchup page has no separate "hidden
 * list" of per-player rows to drive real controls from -- parse.js already
 * reads player data straight off Fantrax's own REAL, visible
 * `league-livescoring-standard-table` (render.js's ensureContainer inserts
 * our pitch overlay as a sibling BEFORE that table, never hiding or
 * removing it -- confirmed live and in this file's own recon). So
 * triggerCellAction below re-finds that same live table/row/cell by name
 * (mirroring parse.js's own selectors) and clicks whatever real control
 * sits inside it, exactly the same "find the row, click the control"
 * principle as pitch-editor's triggerRowAction, just against a visible
 * table instead of a hidden one.
 *
 * The one wrinkle matchup has that roster doesn't: a single
 * `.scoring-table__row` holds BOTH teams' players side by side (home in
 * cells[0], the position-letter gutter in cells[1], away in cells[2] --
 * see parse.js's parseRow/parseSide) -- so "find this player's row" alone
 * is ambiguous; every lookup here also takes the tapped card's OWN side
 * ('home'/'away', threaded down from render.js's renderCard/
 * attachHoverTooltip, same as it already threads through to marqueeKey)
 * and reads the matching cell, never just "the row".
 *
 * Trade recon (live, on-device, 2026-08-26): matchup's scoring-table cell
 * itself has no inline Trade/Drop/Claim buttons at all (unlike roster's
 * `.i-table__row`, which carries `button.mat-gray--fill`/
 * `button.mat-red--fill` right in the row) -- the ONLY real control there
 * is the name link. But Fantrax's OWN player-card modal (opened by that
 * same link) has a real header icon button, confirmed live via its
 * `title="Trade"` attribute: `button.mat-gray--fill[title="Trade"]`, same
 * class Fantrax uses for roster's inline Trade button, just relocated into
 * this modal. No Drop/Claim control exists anywhere in that modal either
 * (checked its "..." expand_more control too -- reveals nothing, and a
 * text search of every button in the modal for drop/claim/add/waiver came
 * up empty) -- makes sense, since a matchup player is always on SOME
 * team's roster already (mine or my opponent's), so Drop/Claim (only
 * meaningful for MY OWN roster or a free agent) don't apply the way Trade
 * does. See triggerTrade below for how the async "open modal, wait for it,
 * click Trade inside it" flow works.
 * ---------------------------------------------------------------------
 */
(function (FXM) {
  'use strict';
  const qa = FXM.qa;
  const state = FXM.state;
  const FXShared = window.FXShared;

  // Re-finds the SAME cell parse.js originally read this player's data
  // from -- searches both scoring tables (tables[0] = starters, tables[1]
  // = reserves, per parse.js/parseMatchup) since a tapped card can be
  // either. `side` picks which of the row's two player cells to read
  // (cells[0] = home/left, cells[2] = away/right -- cells[1] is just the
  // position-letter/"Res" gutter, never a player). Matched by name via the
  // exact same `.scorer__info__name a` selector parse.js's parseSide uses.
  function findScoringCell(name, side) {
    const anchor = document.querySelector('league-livescoring-standard-table');
    if (!anchor) return null;
    const cellIdx = side === 'home' ? 0 : 2;
    for (const table of qa('.scoring-table', anchor)) {
      for (const row of qa('.scoring-table__row', table)) {
        const cells = qa(':scope > .scoring-table__cell', row);
        if (cells.length !== 3) continue;
        const cell = cells[cellIdx];
        const nameA = cell && cell.querySelector('.scorer__info__name a');
        if (nameA && nameA.textContent.trim() === name) return cell;
      }
    }
    return null;
  }

  function triggerCellAction(p, side, selector) {
    const cell = findScoringCell(p.name, side);
    const el = cell && cell.querySelector(selector);
    if (el) el.click();
  }

  // Fantrax's player-card modal renders asynchronously into its own
  // `.cdk-overlay-container` (confirmed live: anywhere from ~150ms up to
  // ~1s after the name link is clicked) -- there's no synchronous signal
  // to wait on, so this polls briefly for its real Trade button
  // (`button.mat-gray--fill[title="Trade"]`, see this file's own header
  // comment for the recon that found it) and clicks it the moment it
  // appears. Gives up silently past `deadline` if the modal (or its Trade
  // button) never shows -- e.g. Fantrax changes the modal, or it's slow
  // enough to exceed this budget -- rather than leaving a dangling timer
  // that fires long after the user's moved on.
  const TRADE_MODAL_POLL_MS = 120;
  const TRADE_MODAL_TIMEOUT_MS = 2500;

  function pollForTradeButton(deadline) {
    const btn = document.querySelector('.cdk-overlay-container button.mat-gray--fill[title="Trade"]');
    if (btn) {
      btn.click();
      return;
    }
    if (Date.now() >= deadline) return;
    setTimeout(() => pollForTradeButton(deadline), TRADE_MODAL_POLL_MS);
  }

  // Opens Fantrax's OWN player-card modal (same control "View Player Card"
  // below uses) and, once it's rendered, clicks its real Trade button --
  // see this file's header comment for the live recon confirming both that
  // this modal is the only place a Trade control exists for a matchup
  // player, and that it's real (Fantrax's own UI, not reimplemented here).
  function triggerTrade(p, side) {
    triggerCellAction(p, side, '.scorer__info__name a');
    pollForTradeButton(Date.now() + TRADE_MODAL_TIMEOUT_MS);
  }

  // "View Player Card" is the one real, directly-clickable control inside
  // matchup's own scoring-table cell (`.scorer__info__name a`) -- opens
  // Fantrax's OWN full player-card modal (Overview/Stats/Splits/News/etc.)
  // exactly as clicking it on the real page would, nothing reimplemented.
  // "Trade…" goes through that SAME modal (triggerTrade above) since
  // matchup's read-only scoring-table row has no inline Trade control of
  // its own the way roster's list rows do.
  function buildMenuItems(p, side) {
    return [
      {
        label: 'View Player Card',
        action: () => triggerCellAction(p, side, '.scorer__info__name a'),
      },
      {
        label: 'Trade…',
        action: () => triggerTrade(p, side),
      },
    ];
  }

  function isCoarsePointer() {
    return window.matchMedia('(pointer: coarse)').matches;
  }

  // Read-only stats block for touch devices (no hover => no tooltip
  // access) -- literal structure copy of pitch-editor/action-menu.js's
  // buildStatsSection, just reusing THIS feature's own buildTooltipLines
  // (render.js) instead of tooltip.js's. Returns null when there's nothing
  // to show, so the caller can skip the section (and its divider) entirely.
  function buildStatsSection(p) {
    const lines = FXM.buildTooltipLines(p);
    if (!lines || !lines.length) return null;
    const section = document.createElement('div');
    section.className = 'fxm-action-menu__stats';
    lines.forEach((line, i) => {
      const row = document.createElement('div');
      row.className = i === 0 ? 'fxm-action-menu__stats-title' : 'fxm-action-menu__stats-row';
      FXShared.renderStatLine(row, line);
      section.appendChild(row);
    });
    return section;
  }

  // ---------- "Recent performances" (last5.js) ----------
  // Feature-user request: "on future matchups have the player's last 5
  // weekly fpts hauls when i tap on them." Data comes from last5.js's
  // same-origin fetch (see fxpa.js's header comment for the "no API
  // access" scope extension both required) -- this file only renders
  // whatever last5.js's cache/fetch layer hands it.
  //
  // Originally gated to gameState 'upcoming' only (mirroring
  // buildTooltipLines' own projection-vs-real-number split), but per
  // user feedback recent form is useful context regardless of whether
  // THIS gameweek has started for the tapped player -- removed that gate
  // (see buildLast5Section below); a live/finished player just also gets
  // this section now, same as an upcoming one.
  //
  // Row format: opponent abbreviation (e.g. "@ NEW" away, "vs HUL" home --
  // last5.js's own `opponent` column already carries the "@" convention;
  // this just adds the "vs" counterpart for a home game so the row reads
  // unambiguously either way) + the color-coded FPts for that game, e.g.
  // "@ NEW (+4.5)". Deliberately NOT the date -- per the user's own
  // example format ("ARS (+6.5)") and "keep rows compact" ask, opponent is
  // the more useful compact identifier here than a bare date once the
  // section itself is already titled "Recent performances".

  function formatRecentOpponent(oppText) {
    const trimmed = (oppText || '').trim();
    if (!trimmed) return '';
    if (trimmed.charAt(0) === '@') return `@ ${trimmed.slice(1).trim()}`;
    return `vs ${trimmed}`;
  }

  // Three distinct outcomes, three distinct renderings -- never a silently
  // absent section. `rows === null` is a failed fetch (last5.js throws on
  // Fantrax's rate-limit response rather than caching it, so a re-tap
  // genuinely does retry -- hence the retry wording); an empty array is a
  // player who really has no games on record yet (early-season signings,
  // and confirmed live: Fantrax's own player card shows them no "Recent
  // Games" table at all). Those two used to render identically -- as
  // nothing -- which is what made a rate-limited player look like a broken
  // feature instead of a transient hiccup.
  function buildLast5Message(text) {
    const row = document.createElement('div');
    row.className = 'fxm-action-menu__last5-row fxm-action-menu__last5-row--muted';
    row.textContent = text;
    return row;
  }

  function renderLast5Rows(rows) {
    const nodes = [];
    const title = document.createElement('div');
    title.className = 'fxm-action-menu__last5-title';
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
      row.className = 'fxm-action-menu__last5-row';
      const ptsText = g.fpts !== '' && g.fpts != null ? FXM.formatSigned(g.fpts) : '0';
      const oppText = formatRecentOpponent(g.opponent) || g.date || ''; // date is a fallback label if opponent is ever missing
      FXShared.renderStatLine(row, { text: oppText, pts: ptsText });
      nodes.push(row);
    });
    return nodes;
  }

  // Re-renders the last-5 block INSIDE WHATEVER the current menu is,
  // rather than a captured element reference -- by the time last5.js's
  // fetch resolves, reapplyActionMenu may already have rebuilt the stats
  // section (a live-score re-render, or the user tapping a DIFFERENT
  // player entirely) one or more times, so a stale reference could easily
  // be updating a detached node nobody sees, or worse, painting a
  // previous player's fetched data into whatever's now open for someone
  // else. Guards on state.actionMenuIdentity still matching `name` before
  // touching anything.
  // `side` (not just `name`) must still match -- last5.js's cache is keyed
  // by `teamId|name` precisely to keep two same-named players on OPPOSITE
  // sides of the same matchup from ever sharing a slot; checking only
  // `name` here would let a stale promise for "the other side's Smith"
  // paint into a menu now open for a DIFFERENT Smith.
  function refreshLast5UI(name, side, rows) {
    if (!state.actionMenuEl || !state.actionMenuIdentity) return;
    if (state.actionMenuIdentity.name !== name || state.actionMenuIdentity.side !== side) return;
    const container = state.actionMenuEl.querySelector('.fxm-action-menu__last5');
    if (!container) return; // stats section may have been rebuilt without one (shouldn't happen now that this is unconditional, but stays defensive)
    container.innerHTML = '';
    // renderLast5Rows always returns nodes now (it renders its own "no
    // games"/"couldn't load" message), so the section stays put instead of
    // vanishing and leaving the user unable to tell empty from broken.
    renderLast5Rows(rows).forEach((n) => container.appendChild(n));
  }

  // `side` resolves to this matchup's own fantasy teamId (state.js's
  // homeTeamId/awayTeamId, refreshed every render()) -- last5.js's
  // resolveScorerId needs it as the tiebreak scope for an abbreviated
  // ("S. Lammens") name match (see that file's header comment for the
  // full diagnosis of why this exists at all: a plain exact-name lookup
  // only ever matched a minority of players). Synchronous: shows the
  // cached rows immediately if last5.js already has them, otherwise a
  // "loading…" placeholder that refreshLast5UI (above) swaps out once the
  // fetch resolves. Mirrors buildStatsSection's own null-means-skip-me
  // contract. No longer gated to gameState 'upcoming' -- see this
  // section's own header comment for why.
  function buildLast5Section(p, side) {
    const teamId = side === 'home' ? state.homeTeamId : state.awayTeamId;
    const container = document.createElement('div');
    container.className = 'fxm-action-menu__last5';
    const cached = FXShared.peekLast5(p.name, teamId);
    if (cached !== undefined) {
      renderLast5Rows(cached).forEach((n) => container.appendChild(n));
    } else {
      const loading = document.createElement('div');
      loading.className = 'fxm-action-menu__last5-title fxm-action-menu__last5-title--loading';
      loading.textContent = 'Recent performances: loading…';
      container.appendChild(loading);
      FXShared.getLast5(p.name, teamId).then((rows) => refreshLast5UI(p.name, side, rows));
    }
    return container;
  }

  function onDocClick(e) {
    if (state.actionMenuEl && !state.actionMenuEl.contains(e.target)) closeActionMenu();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') closeActionMenu();
  }

  // Removes the "this is the selected one, don't dim me" marker from
  // whatever card currently carries it (there's ever only one). Called
  // before marking a NEW card in openActionMenu (in case the menu is
  // re-opened on a different player without an intervening render() --
  // renderCard only ever ADDS this class at creation time, so nothing else
  // would otherwise clear a stale one off the OLD card's still-live node)
  // and unconditionally in closeActionMenu, so no stray marker survives
  // into whatever gets tapped/rendered next.
  function clearMenuSelectedMark() {
    qa('.fxm-card--menu-selected', state.container || document).forEach((c) => c.classList.remove('fxm-card--menu-selected'));
  }

  function closeActionMenu() {
    if (state.actionMenuEl) {
      state.actionMenuEl.remove();
      state.actionMenuEl = null;
    }
    // Single choke point for every close path (tap-outside via onDocClick,
    // Escape via onKeydown, picking a menu item, or the anchor player
    // genuinely disappearing from the lineup -- see reapplyActionMenu's
    // "not found" branch below) -- tearing down the scroll-tracker and
    // clearing the dimming here means none of those callers need to
    // remember to do it themselves. Removing `.fxm-matchup--menu-open`
    // turns dimming off instantly for every EXISTING `.fxm-card` via
    // matchup.css's descendant selector (see that rule's own comment for
    // why this is container-level, not a per-card class this file loops
    // over) -- clearMenuSelectedMark then just tidies up the now-inert
    // `--menu-selected` marker so it can't linger onto whatever's tapped
    // next. Both are no-ops when the menu was opened via the desktop
    // (fine-pointer) path, since only the coarse-pointer path below ever
    // sets them. Keyed 'fxm-menu' -- distinct from render.js's own
    // 'fxm'-keyed tooltip tracker -- so the two can never step on each
    // other even though, in practice, only one of {tooltip, menu} is ever
    // open on touch at a time (see openActionMenu's FXM.hideTooltip() call
    // below).
    FXShared.stopTrackingAnchor('fxm-menu');
    if (state.container) state.container.classList.remove('fxm-matchup--menu-open');
    clearMenuSelectedMark();
    document.removeEventListener('click', onDocClick, true);
    document.removeEventListener('keydown', onKeydown, true);
    state.actionMenuIdentity = null;
  }

  // Desktop (fine-pointer) positioning only -- raw click coordinates,
  // clamped to the viewport. Identical math to pitch-editor/
  // action-menu.js's positionMenu; not shared since it's a handful of
  // lines and each feature already keeps its own copy of the sibling
  // anchoring/positioning logic (see render.js's positionTooltip).
  function positionMenu(menu, x, y) {
    const rect = menu.getBoundingClientRect();
    let left = x;
    let top = y;
    if (left + rect.width > window.innerWidth - 8) left = window.innerWidth - rect.width - 8;
    if (top + rect.height > window.innerHeight - 8) top = window.innerHeight - rect.height - 8;
    menu.style.left = `${Math.max(4, left)}px`;
    menu.style.top = `${Math.max(4, top)}px`;
  }

  // `side` ('home'/'away', threaded down from render.js) is required --
  // every action above needs it to pick the right cell out of a shared row
  // (see findScoringCell). `x`/`y` are only used on the desktop
  // (fine-pointer) path; the coarse-pointer path anchors to `card` itself
  // instead (see below), same split as pitch-editor's openActionMenu.
  function openActionMenu(card, p, side, x, y) {
    closeActionMenu();
    // Closes any open hover tooltip before the menu takes over -- mirrors
    // pitch-editor/action-menu.js's FXP.hideCardTip() call. Mostly matters
    // on desktop (a mouse can hover a card, showing its tooltip, then
    // click it); on touch the tooltip is never open in the first place any
    // more (see attachHoverTooltip's tap handler in render.js), so this is
    // a harmless no-op there.
    FXM.hideTooltip();

    const menu = document.createElement('div');
    menu.className = 'fxm-action-menu';
    const coarse = isCoarsePointer();

    if (coarse) {
      const statsSection = buildStatsSection(p);
      if (statsSection) menu.appendChild(statsSection);
      const last5Section = buildLast5Section(p, side);
      if (last5Section) menu.appendChild(last5Section);
      if (statsSection || last5Section) {
        const divider = document.createElement('div');
        divider.className = 'fxm-action-menu__divider';
        menu.appendChild(divider);
      }
    }

    buildMenuItems(p, side).forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fxm-action-menu__item' + (item.danger ? ' fxm-action-menu__item--danger' : '');
      btn.textContent = item.label;
      if (item.title) btn.title = item.title;
      if (item.disabled) {
        btn.disabled = true;
        btn.classList.add('fxm-action-menu__item--disabled');
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
      // Anchor to the CARD (mirrors pitch-editor's action menu) rather
      // than raw tap coordinates, so the menu never covers the tapped
      // player. FXShared.trackAnchor keeps it stuck to the card through a
      // scroll, closing the menu if the card goes stale mid-scroll with no
      // render() to fix it up first.
      const reposition = () => FXShared.anchorToElement(menu, card, { gap: 8, margin: 8 });
      reposition();
      FXShared.trackAnchor('fxm-menu', {
        overlayEl: menu,
        targetEl: card,
        isVisible: () => !!state.actionMenuEl,
        onReposition: reposition,
        onStale: closeActionMenu,
      });
      // Dim every other player card (both teams, pitch and bench) so it's
      // unambiguous which one this menu belongs to -- container-level (see
      // matchup.css's `.fxm-matchup--menu-open .fxm-card` rule for the
      // full "why", including the flicker bug this replaced): setting one
      // class on the (persistent-across-renders) container dims every
      // EXISTING `.fxm-card` via CSS alone, and clearMenuSelectedMark +
      // marking `card` itself here is what exempts the tapped one. A card
      // created LATER by a live-score re-render gets the same treatment
      // for free from renderCard (render.js), which checks
      // state.actionMenuIdentity (set right below) at creation time --
      // no JS loop needed after the fact, so a fresh card is never
      // undimmed even for a single frame.
      clearMenuSelectedMark();
      card.classList.add('fxm-card--menu-selected');
      if (state.container) state.container.classList.add('fxm-matchup--menu-open');
      // Identity (not a DOM node reference), e.g. { side: 'home', isBench:
      // false, name: 'Erling Haaland' } -- render.js tears down and
      // rebuilds EVERY `.fxm-card` node on every re-render (live scoring
      // updates trigger that MUCH more often than roster's own re-renders,
      // sometimes under a second after opening this menu), which would
      // otherwise detach `card` out from under the menu and read to the
      // user as the menu "immediately fading back up" right after they tap
      // -- confirmed live. reapplyActionMenu below (called from the end of
      // render(), mirroring the old tooltip's reapplySelection) uses this
      // identity to re-anchor the menu to the SAME player's freshly-built
      // card; renderCard uses this SAME identity to mark that same fresh
      // card `--menu-selected` at creation, which is what actually keeps
      // the dimming glitch-free across a rebuild (see that rule's comment).
      // Fine-pointer opens never set this (positionMenu's fixed x/y
      // doesn't depend on the card surviving a rebuild, and dimming is
      // coarse-pointer only), so reapplyActionMenu is naturally a no-op
      // for those.
      state.actionMenuIdentity = { side, isBench: card.dataset.bench === '1', name: p.name };
    } else {
      positionMenu(menu, x, y);
    }

    // Deferred so the click/tap that opened the menu doesn't immediately
    // close it via onDocClick.
    setTimeout(() => {
      document.addEventListener('click', onDocClick, true);
      document.addEventListener('keydown', onKeydown, true);
    }, 0);
  }

  // Looks up the player object matching a state.actionMenuIdentity (see
  // openActionMenu) inside `data`, the same parsed structure render()'s
  // renderField/renderBenchSide just built the fresh cards from -- so if a
  // card with that identity exists in the just-rendered DOM, this is
  // guaranteed to find its matching player object too. Used by
  // reapplyActionMenu below. Literal port of the old render.js
  // findPlayerByIdentity (removed when the touch tooltip's own
  // identity-tracking was replaced by this menu) -- needed again here for
  // the exact same reason it existed there.
  function findPlayerByIdentity(data, identity) {
    if (!identity) return null;
    const sideData = data[identity.side];
    if (!sideData) return null;
    const list = identity.isBench ? sideData.reserves : FXM.POS_ORDER.flatMap((pos) => sideData.starters[pos]);
    return list.find((p) => p.name === identity.name) || null;
  }

  // Called from the end of render() (mirroring the old tooltip's
  // reapplySelection call) every time the matchup pitch's cards get torn
  // down and rebuilt from a live-score-driven re-render. Without this, an
  // open menu's `card`/`targetEl` goes stale the instant that happens --
  // which live testing showed can be under a second after opening -- and
  // reads to the user as the menu immediately closing/repositioning wrong
  // right after their tap, even though they haven't touched anything.
  //
  // NOTE what this does NOT do any more: touch dimming. That used to be
  // re-applied here too (a `FXShared.selectAndDim` call at the end), but
  // doing it AFTER render() already painted a fresh, undimmed batch of
  // cards is exactly what caused a visible flicker on every OTHER player's
  // card on every live-score re-render (matchup.css's
  // `.fxm-matchup--menu-open` rule + render.js's renderCard now handle
  // dimming a freshly-created card from its very first paint instead --
  // see that rule's own comment for the full story). This function only
  // has to worry about the menu ELEMENT itself.
  //
  // Found: re-anchor the SAME `state.actionMenuEl` (never torn down/
  // recreated -- only its position and stats content update) to the
  // freshly-built card, and refresh its stats section with this render's
  // newest numbers (live scoring keeps changing while the menu sits open).
  // The action buttons are left untouched: their closures only ever
  // capture `p.name`/`side` (stable player identity), never the `p` object
  // itself, so they stay correct without rebuilding -- rebuilding the
  // whole menu on every re-render (some matchups re-render multiple times
  // a second) would otherwise flicker the buttons for no reason.
  //
  // Not found (player genuinely no longer in the lineup/data at all -- a
  // real edge case, e.g. a sub) -- close the menu, same as any other
  // stale-target close.
  function reapplyActionMenu(data, root) {
    const identity = state.actionMenuIdentity;
    if (!identity || !state.actionMenuEl) return;
    const match = qa('.fxm-card', root).find(
      (c) => c.dataset.side === identity.side && (c.dataset.bench === '1') === identity.isBench && c.dataset.name === identity.name
    );
    const p = match && findPlayerByIdentity(data, identity);
    if (!match || !p) {
      closeActionMenu();
      return;
    }

    const menu = state.actionMenuEl;
    const oldStats = menu.querySelector('.fxm-action-menu__stats');
    if (oldStats) {
      const freshStats = buildStatsSection(p);
      if (freshStats) oldStats.replaceWith(freshStats);
    }
    // Same idea for the last-5 block -- if it's already cached this is a
    // cheap synchronous re-render (no new fetch); if it's still loading,
    // buildLast5Section calls FXShared.getLast5 again, but that just returns
    // the SAME in-flight promise (last5.js dedupes per player) and attaches
    // one more harmless, identity-guarded refreshLast5UI callback to it.
    const oldLast5 = menu.querySelector('.fxm-action-menu__last5');
    if (oldLast5) {
      const freshLast5 = buildLast5Section(p, identity.side);
      if (freshLast5) oldLast5.replaceWith(freshLast5);
      else oldLast5.remove();
    }

    const reposition = () => FXShared.anchorToElement(menu, match, { gap: 8, margin: 8 });
    reposition();
    FXShared.trackAnchor('fxm-menu', {
      overlayEl: menu,
      targetEl: match,
      isVisible: () => !!state.actionMenuEl,
      onReposition: reposition,
      onStale: closeActionMenu,
    });
  }

  FXM.openActionMenu = openActionMenu;
  FXM.closeActionMenu = closeActionMenu;
  FXM.triggerCellAction = triggerCellAction;
  FXM.reapplyActionMenu = reapplyActionMenu;
})(window.FXM);
