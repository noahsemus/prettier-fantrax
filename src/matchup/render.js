/**
 * Fantrax Refinements -- Matchup Pitch: render the two-team pitch
 * ---------------------------------------------------------------------
 * Builds one full-pitch layout (both teams' starting lineups facing each
 * other, my team's half nearest their own goal at the outer edge) plus a
 * compact bench strip per team, from FXM.parseMatchup()'s output.
 *
 * The DOM is identical between wide and narrow viewports -- matchup.css's
 * media query alone flips `.fxm-field`/`.fxm-half`/`.fxm-line` between row
 * and column flex-direction (and swaps which of the two <g> mark groups is
 * visible) to switch between the horizontal (wide) and vertical (narrow)
 * pitch. See matchup.css for the breakpoint. Home is always the first half
 * in DOM order (G, D, M, F) and away the second, reversed (F, M, D, G) --
 * that single ordering reads correctly as "home left / away right,
 * mirrored" in row layout and "home top / away bottom, mirrored" in column
 * layout with no JS branching on orientation.
 *
 * The hover/tap breakdown tooltip (buildTooltipLines) LAYERS window.FXC on
 * top of each player's own currently-rendered stat chips (parse.js's
 * p.chips): content.js briefly, programmatically flips the page's
 * Stats/Fpts pill (now masked -- see content.js's header comment -- so
 * the user never sees it) to snapshot the OTHER mode and publishes a
 * merged raw+fpts reading to window.FXC, keyed by player name. When FXC
 * has BOTH readings for a given player, buildTooltipLines shows the
 * hybrid line (e.g. "1 Assists (Total) (+6)"); otherwise it falls back to
 * that player's own p.chips (single, currently-active-mode value) --
 * FXC is purely an enhancement layer, never a hard requirement, so the
 * tooltip is never stuck waiting on it (see buildTooltipLines' own
 * comment for why that distinction matters).
 *
 * render() tears down and rebuilds EVERY `.fxm-card` node on every
 * re-render, and this livescoring page's own DOM mutations (live score
 * updates) trigger that rebuild often via the MutationObserver in main.js
 * -- including while a player is tap-selected (dimmed + tooltip open) on
 * touch. Tracking WHO is selected by identity (state.selectedIdentity,
 * not a DOM node reference -- see state.js) rather than just a stale
 * `tooltipTargetEl` lets render() re-locate that same player's freshly
 * built card and re-apply the dim/tooltip there (reapplySelection, called
 * at the end of render()) instead of the selection silently reverting
 * within about a second of a live-score-driven re-render.
 * ---------------------------------------------------------------------
 */
(function (FXM) {
  'use strict';
  const qa = FXM.qa;
  const state = FXM.state;
  const FXShared = window.FXShared;

  // ---------- jersey URL construction from crest ----------
  // Same rules as pitch-editor/render.js's jerseyFromCrest (EPL-only jersey
  // filenames derived from the crest URL; GK -> generic goalkeeper jersey;
  // non-EPL or unrecognized crest URL -> caller falls back to the crest
  // image itself). Duplicated locally on purpose, not shared -- this
  // module must stand on its own regardless of script load order between
  // the pitch-editor and matchup features.
  function jerseyFromCrest(crestUrl, pos) {
    if (!crestUrl) return null;
    const m = crestUrl.match(/^(.*)\/assets\/images\/logos\/sportsteam\/epl\/([^/]+)\.png$/);
    if (!m) return null;
    const origin = m[1];
    if (pos === 'G') return `${origin}/assets/images/jerseys/epl/Premier-League-jersey-logo_goalkeeper.png`;
    return `${origin}/assets/images/jerseys/epl/Premier-League-jersey_${m[2]}.png`;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // ---------- hover breakdown tooltip ----------
  // Mirrors pitch-editor/tooltip.js's mechanics exactly (fixed-position
  // singleton div, mouseenter/mousemove/mouseleave, viewport-edge
  // flipping) under our own `fxm-` classes so it doesn't collide with
  // pitch-editor's `.fx-card-tip`. Wired onto both pitch (starter) cards
  // and bench cards via attachHoverTooltip, called from renderCard itself
  // so every place a card gets built (line or bench) gets hover for free.

  function ensureTooltip() {
    if (state.tooltipEl && document.body.contains(state.tooltipEl)) return state.tooltipEl;
    const tip = document.createElement('div');
    tip.className = 'fxm-tip';
    document.body.appendChild(tip);
    state.tooltipEl = tip;
    return tip;
  }

  // A line is either a plain string, or `{ text, pts }` for a stat line
  // that has a color-coded parenthetical signed-points suffix (e.g.
  // "1 Assists (Total)" + a green/red/muted "(+6)" span) -- see
  // buildTooltipLines. Rendering (including the parenthetical's own
  // color-coded span) is FXShared.renderStatLine, shared with
  // pitch-editor's tooltip/action-menu stat lines -- see
  // src/shared/touch-overlay.js.
  //
  // Shared by both the mouse (showTooltip) and touch (showTooltipForCard)
  // paths -- building the row DOM is identical either way, only how the
  // tip then gets POSITIONED differs (raw cursor coords vs. anchored to a
  // card element), so that split lives one level up, not duplicated here.
  function renderTooltipContent(lines) {
    const tip = ensureTooltip();
    tip.innerHTML = '';
    lines.forEach((line, i) => {
      const row = el('div', i === 0 ? 'fxm-tip__title' : 'fxm-tip__row');
      FXShared.renderStatLine(row, line);
      tip.appendChild(row);
    });
    tip.classList.add('fxm-tip--visible');
    return tip;
  }

  // Desktop mouse path only -- positions the tip near the live cursor
  // coordinates, flipping to the other side of the pointer if it would
  // otherwise overflow the viewport. Untouched by the touch/anchor work
  // below; see attachHoverTooltip's mouseenter/mousemove.
  function showTooltip(lines, x, y) {
    if (!lines || !lines.length) return;
    renderTooltipContent(lines);
    positionTooltip(x, y);
  }

  function positionTooltip(x, y) {
    const tip = state.tooltipEl;
    if (!tip) return;
    const offset = 14;
    let left = x + offset;
    let top = y + offset;
    const rect = tip.getBoundingClientRect();
    if (left + rect.width > window.innerWidth - 8) left = x - rect.width - offset;
    if (top + rect.height > window.innerHeight - 8) top = y - rect.height - offset;
    tip.style.left = `${Math.max(4, left)}px`;
    tip.style.top = `${Math.max(4, top)}px`;
  }

  // Touch path -- see showTooltipForCard below for why this anchors to the
  // CARD element's rect instead of a raw touch point.
  const TIP_CARD_GAP = 8; // px gap kept between the tip and its anchor card
  // Net finger movement (px) between touchstart and touchend on a card
  // under which a touchend still counts as a tap rather than the tail end
  // of a scroll -- see attachHoverTooltip's FXShared.onTap wiring. Same
  // value and same idea as pitch-editor/drag.js's TOUCH_MOVE_CANCEL_PX.
  const TOUCH_TAP_MOVE_PX = 10;

  // Touch has no hover, so a tap anchors the tip to the CARD it just
  // tapped rather than to the touch point (positionTooltip above) -- a
  // tapped card is itself ~58-76px, so an offset-from-finger tip routinely
  // landed right on top of it. FXShared.anchorToElement (src/shared/
  // touch-overlay.js) owns the flush-above/below + viewport-clamp math --
  // the exact algorithm this file originally had inline, now shared with
  // pitch-editor's action menu. Registering with FXShared.trackAnchor
  // keeps the tip "stuck" to the card through a scroll (re-anchoring on
  // every scroll event) and hides it via hideTooltip if the card ever goes
  // stale -- detached from the document because render()'s
  // MutationObserver-driven re-renders tear down and rebuild EVERY
  // `.fxm-card` node from scratch (see render()'s own comment), which can
  // happen from Fantrax's own live-updating page content with no user
  // action at all. Keyed 'fxm' so this tracker can't collide with
  // pitch-editor's own 'fxp'-keyed action-menu tracker.
  function showTooltipForCard(lines, cardEl) {
    if (!lines || !lines.length) return;
    renderTooltipContent(lines);
    state.tooltipTargetEl = cardEl;
    const reposition = () => FXShared.anchorToElement(state.tooltipEl, cardEl, { gap: TIP_CARD_GAP, margin: 8 });
    reposition();
    FXShared.trackAnchor('fxm', {
      overlayEl: state.tooltipEl,
      targetEl: cardEl,
      isVisible: () => !!(state.tooltipEl && state.tooltipEl.classList.contains('fxm-tip--visible')),
      onReposition: reposition,
      onStale: hideTooltip,
    });
  }

  function hideTooltip() {
    if (state.tooltipEl) state.tooltipEl.classList.remove('fxm-tip--visible');
    state.hoveredName = null;
    state.tooltipTargetEl = null;
    FXShared.stopTrackingAnchor('fxm');
    // Single choke point for every close path (toggle-close, tap-outside via
    // onOutsideTap, mouseleave, and the stale-target scroll-hide via
    // FXShared.trackAnchor's onStale above) -- clearing the tap-select
    // dimming here means none of those callers need to remember to do it
    // themselves. A no-op on desktop/mouse closes since setSelectedCard is
    // only ever called from the touch tap path below, so there's nothing
    // to clear.
    clearSelectedCard();
  }

  // ---------- touch tap-select dimming ----------
  // Touch-only "which card did I just tap" affordance: dims every OTHER
  // `.fxm-card` (pitch and bench, both teams) so the tapped player reads
  // unambiguously against the rest of the pitch. Deliberately NOT wired off
  // desktop mouseenter -- that would dim the whole pitch on every hover,
  // a much more intrusive change to already-established hover behavior.
  // Scoped to state.container (falling back to the whole document if the
  // container ever isn't set) rather than a fixed root, since it must reach
  // both teams' halves and both benches, which live in the same body.
  //
  // The dim mechanic itself (FXShared.selectAndDim/clearDim) is shared with
  // pitch-editor's roster dimming -- purely mechanical class add/remove, so
  // `.fxm-card--dimmed` keeps its own name and its own CSS in matchup.css.
  // `.fxm-card--selected` carries no styling of its own (see matchup.css) --
  // kept as a plain DOM hook local to this feature, not part of the shared
  // module's contract.
  //
  // Also the ONE place state.selectedIdentity gets set/cleared (from the
  // card's own dataset -- see renderCard's data-side/data-bench/data-name)
  // -- see state.js's comment on why identity, not just a DOM ref, is
  // tracked. render()'s reapplySelection call below re-invokes this same
  // function on the freshly-rebuilt card, which is a harmless no-op
  // re-derivation of the same identity.
  function setSelectedCard(cardEl) {
    const root = state.container || document;
    FXShared.selectAndDim(root, '.fxm-card', cardEl, 'fxm-card--dimmed');
    FXM.qa('.fxm-card', root).forEach((c) => c.classList.toggle('fxm-card--selected', c === cardEl));
    state.selectedIdentity = cardEl
      ? { side: cardEl.dataset.side || null, isBench: cardEl.dataset.bench === '1', name: cardEl.dataset.name || null }
      : null;
  }

  function clearSelectedCard() {
    const root = state.container || document;
    FXShared.clearDim(root, '.fxm-card', 'fxm-card--dimmed');
    FXM.qa('.fxm-card', root).forEach((c) => c.classList.remove('fxm-card--selected'));
    state.selectedIdentity = null;
  }

  // Touch has no real hover -- mouseenter/mouseleave (attachHoverTooltip
  // below) may fire inconsistently on a tap, so the tooltip can otherwise
  // linger on-screen after the finger lifts. Fix: a document-level listener
  // that hides it on any tap OUTSIDE a card. Deliberately checks "is this
  // tap on ANY .fxm-card" rather than "is this the currently-open card" --
  // tapping a DIFFERENT card fires that card's own mouseenter (showing ITS
  // tooltip) in the same gesture, and this handler must not immediately
  // close what that just opened; ignoring every in-card tap sidesteps the
  // ordering question entirely (mirrors pitch-editor/action-menu.js's
  // onDocClick outside-closer, adapted from "outside the menu" to "outside
  // any card" since a card tap re-triggers its own show logic instead of a
  // single fixed menu element). Registered once, unconditionally (cheap: an
  // early return whenever no tooltip is visible) rather than only while a
  // tip is open, so there's no separate wire-up/tear-down to keep in sync
  // with show/hide. `FXM.outsideTapWired` guards against wiring a second
  // (redundant, if harmless) listener if this file is ever re-run within
  // the same page load (e.g. live iteration during development).
  function onOutsideTap(e) {
    if (!state.tooltipEl || !state.tooltipEl.classList.contains('fxm-tip--visible')) return;
    if (e.target.closest && e.target.closest('.fxm-card')) return;
    hideTooltip();
  }

  if (!FXM.outsideTapWired) {
    FXM.outsideTapWired = true;
    document.addEventListener('click', onOutsideTap, true);
    document.addEventListener('touchend', onOutsideTap, true);
  }

  function formatSigned(text) {
    const n = parseFloat(text);
    return n > 0 ? `+${text}` : text;
  }

  // Classifies a player's game from parse.js's p.gameText -- see parseSide's
  // comment for why this is necessary (the same DOM cell holds a real score
  // once the game starts and a mere projection before it, with no other
  // visible difference). 'finished' = trailing " F" (e.g. "CRY 0 @ EVE 2
  // F"); 'upcoming' = a scheduled clock time instead of a score (e.g.
  // "@FUL Mon 3:00 PM"); anything else falls back to 'unknown' and is
  // treated like 'finished' for display purposes -- i.e. trust the number
  // as real unless it's positively identified as a pre-game projection.
  //
  // No dedicated 'live'/in-progress state: checked the real livescoring DOM
  // across every open matchup/tab available (2026-08-24 -- a mix of
  // finished Sat/Sun games and Monday games not yet kicked off) and never
  // observed a gameText that was neither a trailing " F" score nor a
  // scheduled clock time, so there's nothing to confirm what an in-progress
  // row's text actually looks like. Rather than guess a regex for it, an
  // unrecognized gameText just stays 'unknown'. Still used by
  // buildTooltipLines (finished vs upcoming messaging) and renderCard (never
  // showing an upcoming player's projection as if it were an earned score)
  // -- NOT by the status dot any more, see EVENT_STATUS_LABEL/renderCard
  // below, which reads Fantrax's own pre-kickoff `.scorer-icon` indicator
  // instead (parse.js's p.eventStatus).
  function gameState(gameText) {
    if (!gameText) return 'unknown';
    if (/\sF$/.test(gameText)) return 'finished';
    if (/\d{1,2}:\d{2}\s*[AP]M/i.test(gameText)) return 'upcoming';
    return 'unknown';
  }

  // Status-dot label text, mirroring pitch-editor/roster.js's
  // EVENT_STATUS_LABEL exactly (own literal copy, not imported -- this
  // module must stand on its own regardless of script load order between
  // the pitch-editor and matchup features, same reasoning as
  // readCrestFromFigure in parse.js). Keyed by parse.js's p.eventStatus
  // values ('starting'/'expected'/'bench'/'out'), which parse.js derives
  // from the SAME `.scorer-icon` classes roster.js's readEventStatus reads
  // -- Fantrax's real pre-kickoff "is this player playing" indicator,
  // present only before kickoff. A player whose game has started or
  // finished simply has no `.scorer-icon` and no eventStatus, and
  // renderCard below shows no dot at all for them -- see matchup.css's
  // .fxm-card__dot comment for the exact "why".
  const EVENT_STATUS_LABEL = {
    starting: 'Confirmed starting',
    expected: 'Expected to play',
    bench: 'Expected to be on the bench',
    out: 'Not expected to play',
  };

  // Mode pill lookup (Stats/Fpts), same "Mode" pill-group content.js reads
  // -- duplicated locally rather than imported, for the same stand-alone-
  // module reason as jerseyFromCrest/readEventStatus above: this module
  // must work regardless of script load order between features.
  function getModeButtons() {
    const group = document.querySelector('pill-group[aria-label="Mode"]');
    if (!group) return null;
    const buttons = Array.from(group.querySelectorAll('button.pill'));
    const stats = buttons.find((b) => b.textContent.trim() === 'Stats');
    const fpts = buttons.find((b) => b.textContent.trim() === 'Fpts');
    if (!stats || !fpts) return null;
    return { stats, fpts };
  }

  // Layered: prefer window.FXC (published by content.js) -- a merged
  // reading of BOTH the raw count and the fpts contribution for every stat
  // chip, keyed by player name, captured via a brief, now-MASKED (see
  // content.js's header comment) Stats/Fpts pill flip -- when it actually
  // has BOTH readings for this player. Falls back to this player's own
  // currently-rendered stat chips (parse.js's p.chips, the CURRENT view's
  // per-chip value only) whenever FXC is absent or doesn't have this
  // player yet.
  //
  // FXC is an ENHANCEMENT layer only, never a hard requirement -- this
  // function used to `return ['Loading breakdown…']` outright whenever FXC
  // was absent, which left the tooltip stuck on that message forever for
  // anyone whose first snapshot hadn't landed (or who never gets one, e.g.
  // the mode toggle isn't found on their layout). That hard dependency is
  // gone: p.chips is always available the instant parse.js has run, so
  // FXC merely upgrades an already-showing single-value line into the
  // hybrid raw+fpts one the moment it becomes available for this player,
  // exactly mirroring content.js's own single-live-value tooltip
  // upgrading to hybrid once its counterpart-mode cache is populated.
  //
  // Line format is raw-first: "«raw» «stat name» («+signedPts»)", e.g.
  // "1 Assists (Total) (+6)" -- matching content.js's tooltip format
  // exactly, including the parenthetical being its own color-coded span
  // (FXShared.renderStatLine's `{ text, pts }` shape -- green positive /
  // red negative / muted zero). Degrades to whichever single value is
  // known when only one side is available (no parenthetical, plain text).
  function buildTooltipLines(p) {
    const statNames = window.FX_STAT_NAMES || {};
    const fxc = window.FXC;
    const rawMap = fxc && fxc.raw && fxc.raw.get(p.name);
    const fptsMap = fxc && fxc.fpts && fxc.fpts.get(p.name);

    if (rawMap && fptsMap) {
      const abbrs = [];
      const seen = new Set();
      [rawMap, fptsMap].forEach((m) => {
        m.forEach((_value, abbr) => {
          if (!seen.has(abbr)) {
            seen.add(abbr);
            abbrs.push(abbr);
          }
        });
      });
      if (abbrs.length) {
        const lines = [`${p.points || '0'} pts:`];
        abbrs.forEach((abbr) => {
          const fullName = statNames[abbr] || abbr;
          const ptsText = fptsMap.get(abbr);
          const rawText = rawMap.get(abbr);
          if (ptsText !== undefined && rawText !== undefined) {
            // { text, pts } -- rendered by FXShared.renderStatLine as
            // "<text> (" + a color-coded pts span + ")".
            lines.push({ text: `${rawText} ${fullName}`, pts: formatSigned(ptsText) });
          } else if (rawText !== undefined) {
            lines.push(`${rawText} ${fullName}`);
          } else if (ptsText !== undefined) {
            lines.push(`${formatSigned(ptsText)} ${fullName}`);
          }
        });
        return lines;
      }
    }

    // FXC enhancement unavailable for this player -- fall back to their
    // own currently-rendered stat chips (parse.js's p.chips), the CURRENT
    // view's per-chip value (raw count or fpts, whichever mode's pill is
    // active right now).
    if (p.chips && p.chips.size) {
      const buttons = getModeButtons();
      const onFpts = !!(buttons && buttons.fpts.classList.contains('pill--active'));
      const lines = [`${p.points || '0'} pts:`];
      p.chips.forEach((value, abbr) => {
        const fullName = statNames[abbr] || abbr;
        lines.push(`${onFpts ? formatSigned(value) : value} ${fullName}`);
      });
      return lines;
    }

    // Genuinely nothing on record for this player. Which terminal message
    // makes sense depends on whether their game has actually happened yet
    // (see gameState) -- otherwise "hasn't played" reads as a promise
    // they'll still get a chance to when their game already finished with
    // them not featuring at all.
    const state = gameState(p.gameText);
    if (state === 'upcoming') {
      if (p.points && p.points !== '-') return [`Projected: ${p.points} pts`];
      return ["No stats yet — hasn't played"];
    }
    if (state === 'finished') {
      return ['Did not play this gameweek'];
    }
    // unknown -- best effort, same as before this distinction existed.
    if (p.points && p.points !== '-') return [`Projected: ${p.points} pts`];
    return ["No stats yet — hasn't played"];
  }

  function attachHoverTooltip(card, p) {
    card.addEventListener('mouseenter', (e) => {
      state.hoveredName = p.name;
      state.lastMouseX = e.clientX;
      state.lastMouseY = e.clientY;
      showTooltip(buildTooltipLines(p), e.clientX, e.clientY);
    });
    card.addEventListener('mousemove', (e) => {
      state.lastMouseX = e.clientX;
      state.lastMouseY = e.clientY;
      if (state.tooltipEl && state.tooltipEl.classList.contains('fxm-tip--visible')) {
        positionTooltip(e.clientX, e.clientY);
      }
    });
    card.addEventListener('mouseleave', hideTooltip);

    // Tap-to-TOGGLE on touch devices. Without this, a tap is indistinguishable
    // from a mouseenter above (an unprevented touch gesture makes the browser
    // synthesize mouseenter/mousemove/click right after it), which can only
    // ever OPEN or reposition the tooltip -- there's no mouseleave-equivalent
    // to close it on a second tap of the SAME card, since touch has no
    // pointer to "leave" with. This handler owns the whole tap gesture
    // instead: calling preventDefault in touchend (when the event is
    // cancelable -- see below) suppresses that synthetic mouse-event chain
    // (well-established behavior -- preventDefault on touchstart OR touchend
    // blocks the compatibility mouse events for that gesture), so mouseenter
    // above never even fires for a tap and this is the ONLY logic that runs.
    // Desktop mouseenter/mousemove/mouseleave above are untouched --
    // touchend simply never fires for a real mouse.
    //
    // Anchored to the CARD, not the touch point: unlike the mouse path
    // (which follows the live cursor and so is never mistaken for covering
    // the pointed-at element), a tap's x/y IS the card the user just
    // touched -- offsetting a fixed amount from it routinely put the tip
    // right on top of the card. showTooltipForCard positions off the
    // card's own rect instead (via FXShared.anchorToElement), and tracks it
    // through scroll via FXShared.trackAnchor.
    //
    // The tap-vs-scroll gesture gating (net finger movement under
    // TOUCH_TAP_MOVE_PX between touchstart and touchend, cancelable-safe
    // preventDefault) is FXShared.onTap (src/shared/touch-overlay.js) --
    // the exact mechanics this file originally had inline, now shared with
    // anything else that needs "was this touchend a real tap." Not the
    // same concern as pitch-editor/drag.js's own long-press-vs-scroll state
    // machine (that one decides whether to START A DRAG); this one decides
    // whether to open/toggle the tooltip.
    FXShared.onTap(
      card,
      () => {
        const alreadyOpenHere =
          state.tooltipEl && state.tooltipEl.classList.contains('fxm-tip--visible') && state.hoveredName === p.name;
        if (alreadyOpenHere) {
          hideTooltip();
          return;
        }
        state.hoveredName = p.name;
        showTooltipForCard(buildTooltipLines(p), card);
        // Dim every other card so it's unambiguous which player this tip
        // belongs to. Touch-tap path only (see setSelectedCard) -- desktop
        // hover intentionally leaves every other card alone.
        setSelectedCard(card);
      },
      { moveThresholdPx: TOUCH_TAP_MOVE_PX }
    );
  }

  // ---------- player / bench cards ----------
  // Bench reuses the exact same card component as the pitch (jersey via
  // jerseyFromCrest, GK variant only when p.pos is the player's real
  // position letter -- parse.js's parseSide captures that from the
  // player's own `.scorer__info__positions` span even on reserve rows, not
  // the "Res" gutter label) with a `fxm-card--bench` size modifier class.

  // Stable per-card identity key for the marquee-persistence map (see
  // applyNameMarquee) -- must distinguish home/away AND pitch/bench so two
  // different cards (e.g. the same player name appearing as both a
  // starter and, implausibly but not impossibly, a same-named opponent's
  // reserve) never share a ping-pong timeline. `side` is 'home'/'away',
  // threaded down from renderField/render (renderBenchSide's caller) through
  // renderLine/renderBenchCard -- there's no other per-card identity concept in this
  // module today (matchup cards have no synthetic key, per state.js's note
  // on state.hoveredName).
  function marqueeKey(side, isBench, name) {
    return `${side || '?'}:${isBench ? 'b' : 'p'}:${name}`;
  }

  function renderCard(p, extraClass, side) {
    const isBench = extraClass === 'fxm-card--bench';
    const card = el('div', extraClass ? `fxm-card ${extraClass}` : 'fxm-card');
    // Identity attributes, not just for marqueeKey (below) any more --
    // render()'s reapplySelection also reads these back off the FRESHLY
    // rebuilt card to re-locate whichever player was tap-selected before a
    // live-score-driven rebuild tore the old node out from under it. Same
    // side:isBench:name shape as marqueeKey, so the two stay in lockstep.
    if (p.name) {
      card.dataset.side = side || '';
      card.dataset.bench = isBench ? '1' : '0';
      card.dataset.name = p.name;
    }
    const constructed = jerseyFromCrest(p.crest, p.pos);
    const jerseySrc = constructed || p.crest;
    if (jerseySrc) {
      const img = el('img', 'fxm-card__crest');
      img.src = jerseySrc;
      img.alt = '';
      img.draggable = false;
      // A constructed URL is a guess -- if it 404s, degrade to the crest
      // image instead of leaving a broken-image icon.
      if (constructed && p.crest && constructed !== p.crest) {
        img.onerror = () => {
          img.onerror = null;
          img.src = p.crest;
        };
      }
      card.appendChild(img);
    }
    const info = el('div', 'fxm-card__info');
    // Name text lives in an inner span so it can be measured/animated
    // independently of the (overflow: hidden) outer container -- see
    // applyNameMarquee, called once per render after the cards are
    // actually laid out in the document (scrollWidth is meaningless on a
    // detached fragment). No status dot in this row any more -- it used to
    // sit inline before the name text, which ate into an already
    // space-starved name box (that's exactly why names marquee at all) and
    // could shrink a long name's available width down to almost nothing.
    // The dot is now a corner badge on the card itself -- see below.
    const nameEl = el('div', 'fxm-card__name');
    // Stashed for applyNameMarquee to read back once this card is actually
    // laid out in the document -- see marqueeKey above.
    if (p.name) nameEl.dataset.marqueeKey = marqueeKey(side, isBench, p.name);
    nameEl.appendChild(el('span', 'fxm-card__name-text', p.name));
    info.appendChild(nameEl);
    // Always show a points value -- a player whose game hasn't started (or
    // who played and scored exactly 0) previously rendered with no number
    // at all, which reads as broken/missing rather than "zero". Falls back
    // to '0' when parse.js came back with nothing, and the zero case gets
    // its own muted color (matching the roster pitch's
    // .fx-card__fpts--zero) instead of the gold positive-points color.
    //
    // For an upcoming (not-yet-started) game, p.points actually holds
    // Fantrax's own PROJECTION for this cell, not a score -- showing that
    // on the card would look like an already-earned result. Force the
    // muted zero there instead; the projection still surfaces on hover
    // (see buildTooltipLines).
    const isUpcoming = gameState(p.gameText) === 'upcoming';
    const ptsText = !isUpcoming && p.points && p.points !== '-' ? p.points : '0';
    const ptsN = parseFloat(ptsText);
    const ptsKind = ptsN > 0 ? 'pos' : ptsN < 0 ? 'neg' : 'zero';
    info.appendChild(el('div', `fxm-card__pts fxm-card__pts--${ptsKind}`, ptsText));
    // Game/opponent line (e.g. "MUN 0 @ HUL 2 F"), directly under the
    // points -- same formatting logic as pitch-editor's .fx-card__opp
    // (FXShared.formatOpp, src/shared/touch-overlay.js: shared LOGIC, own
    // feature-scoped DOM/CSS, per the user's "these should be the same
    // component"). Skipped entirely when there's no text at all (e.g. an
    // empty slot never reaches here since p.name is required below, but a
    // real player can still have an empty gameText in edge cases).
    const opp = FXShared.formatOpp(p.gameText);
    if (opp) {
      const oppEl = el('div', 'fxm-card__opp');
      // Own marquee-key namespace ('opp:' prefix over the SAME
      // side:isBench:name identity marqueeKey builds for the name row) so
      // this element's persisted cycle-start time in state.marqueeStarts
      // can never collide with the name row's own entry for the same card
      // -- see applyMarqueeToSet's comment for why the two must stay
      // disjoint.
      if (p.name) oppEl.dataset.marqueeKey = `opp:${marqueeKey(side, isBench, p.name)}`;
      oppEl.appendChild(el('span', 'fxm-card__opp-text', opp));
      info.appendChild(oppEl);
    }
    card.appendChild(info);
    // Status dot, pinned to the card's own bottom-left corner (matchup.css
    // gives .fxm-card position: relative and positions the dot absolutely
    // against IT, not against .fxm-card__info or the name row) -- ONLY when
    // parse.js actually found a `.scorer-icon` for this player, which on
    // Fantrax's own page only exists pre-kickoff. No eventStatus means the
    // player's game has already started or finished, and no dot is shown
    // at all for them -- not a fallback color, just nothing.
    if (p.name && p.eventStatus) {
      const dot = el('span', `fxm-card__dot fxm-card__dot--${p.eventStatus}`);
      dot.title = EVENT_STATUS_LABEL[p.eventStatus] || '';
      card.appendChild(dot);
    }
    // Skip hover wiring on empty slots -- parse.js never actually hands us
    // one (parseSide returns null and callers skip it), but guard on p.name
    // anyway so this stays correct if that ever changes.
    if (p.name) attachHoverTooltip(card, p);
    return card;
  }

  function renderBenchCard(p, side) {
    return renderCard(p, 'fxm-card--bench', side);
  }

  // A name too wide for its box gets a slow back-and-forth marquee scroll
  // instead of an ellipsis/clip, so the full name stays readable. Must run
  // after `root` is actually attached to the document (scrollWidth on a
  // still-detached fragment is meaningless) -- callers use
  // requestAnimationFrame after the DOM insertion, not before. Shared by
  // both player-card names (`.fxm-card__name`, both pitch and bench, since
  // both share that class) AND the per-team header names
  // (`.fxm-team-header__name`) -- one generic measure/apply pass
  // (applyMarqueeToSet) run once per selector pair below, rather than two
  // parallel copies of the same logic.
  //
  // matchup.css's `<selector>--marquee <selector>-text` animation is
  // declared `infinite alternate` (ping-pong) already -- that alone would
  // be enough on a static page. It isn't enough here because render() tears
  // down and fully rebuilds EVERY card and header node on every re-render
  // (the MutationObserver in main.js fires often, well inside a single 6s
  // marquee cycle, as the live matchup page updates), and a freshly-created
  // element's CSS animation always restarts at 0% -- so without this, the
  // user never sees a leg of the ping-pong complete; it just looks like the
  // marquee keeps snapping back to the start. Fix: persist when each
  // element's cycle "started" (state.marqueeStarts, keyed by
  // data-marquee-key) across re-renders, and apply a negative
  // `animation-delay` to the freshly-built node so the browser treats it as
  // already partway through the cycle -- i.e. resumes mid-cycle instead of
  // restarting. Player-card name keys (marqueeKey, e.g.
  // "home:p:Erling Haaland"), that same card's own game/opponent-line key
  // (e.g. "opp:home:p:Erling Haaland" -- see renderCard), and header keys
  // (e.g. "header:home") are all disjoint by construction (a player name
  // never starts with "opp:" or "header:"), so all three sets safely share
  // the one state.marqueeStarts map with no collision risk.
  function applyMarqueeToSet(root, nameSelector, textSelector, marqueeClass, nextStarts, now) {
    qa(nameSelector, root).forEach((nameEl) => {
      const overflow = nameEl.scrollWidth - nameEl.clientWidth;
      if (overflow <= 0) return;
      nameEl.classList.add(marqueeClass);
      nameEl.style.setProperty('--fxm-marquee-dist', `-${overflow}px`);

      const key = nameEl.dataset.marqueeKey;
      const textEl = nameEl.querySelector(textSelector);
      if (!key || !textEl) return;
      const startTime = state.marqueeStarts.has(key) ? state.marqueeStarts.get(key) : now;
      nextStarts.set(key, startTime);
      const offsetSec = ((now - startTime) % 6000) / 1000;
      // Negative delay = "act as though the animation already ran this
      // long" -- resumes the ping-pong from the correct point instead of
      // restarting at 0% the way a brand-new node otherwise would.
      textEl.style.animationDelay = `-${offsetSec}s`;
    });
  }

  function applyNameMarquee(root) {
    // Defensive init here (not state.js) -- this codebase's convention for
    // a map that's only ever read/written by the one file that needs it;
    // state.js's FXM.state gets replaced wholesale on reload/re-eval, so a
    // fresh Map has to be able to reappear on demand rather than only at
    // state.js's own load time.
    state.marqueeStarts = state.marqueeStarts || new Map();
    const now = Date.now();
    const nextStarts = new Map(); // pruned copy -- only keys touched below survive

    applyMarqueeToSet(root, '.fxm-card__name', '.fxm-card__name-text', 'fxm-card__name--marquee', nextStarts, now);
    applyMarqueeToSet(
      root,
      '.fxm-team-header__name',
      '.fxm-team-header__name-text',
      'fxm-team-header__name--marquee',
      nextStarts,
      now
    );
    // Game/opponent line (e.g. "MUN 0 @ HUL 2 F"), same mechanism, own
    // 'opp:'-prefixed key namespace (see renderCard/marqueeKey) so it can't
    // collide with that same card's name entry above.
    applyMarqueeToSet(root, '.fxm-card__opp', '.fxm-card__opp-text', 'fxm-card__opp--marquee', nextStarts, now);

    // Drop start times for any key not touched this render (player no
    // longer overflowing, subbed out, or a different matchup entirely) so
    // this map can't grow without bound across a long live-scoring session.
    state.marqueeStarts = nextStarts;
  }

  // ---------- team headers ----------
  // Each team's header (name + hero live total + projected) is its own
  // top-level `.fxm-body` grid item now, not nested inside a shared
  // "header bar" wrapper -- matchup.css's grid-template-areas is what
  // decides where each one sits: wide layout puts them side by side in one
  // row above the field (visually the old single header bar); narrow
  // layout separates them, home above the field next to home's half, away
  // below the field next to away's bench. See matchup.css.

  // `key` is 'home'/'away' -- team identity is stable across re-renders
  // (unlike a player, who at least theoretically could change), so a plain
  // "header:home"/"header:away" data-marquee-key is enough; no need for the
  // richer side:isBench:name shape marqueeKey builds for player cards.
  function renderTeamHeader(side, extraClass, key) {
    const header = el('div', `fxm-team-header ${extraClass}`);
    const nameEl = el('div', 'fxm-team-header__name');
    nameEl.dataset.marqueeKey = `header:${key}`;
    // Name text lives in an inner span, mirroring .fxm-card__name-text --
    // see applyNameMarquee/applyMarqueeToSet, which measures/animates this
    // exactly like a player card's name.
    nameEl.appendChild(el('span', 'fxm-team-header__name-text', side.header.name || ''));
    header.appendChild(nameEl);
    const scores = el('div', 'fxm-team-header__scores');
    scores.appendChild(el('span', 'fxm-team-header__live', side.header.live || '-'));
    scores.appendChild(el('span', 'fxm-team-header__projected', `proj ${side.header.projected || '-'}`));
    header.appendChild(scores);
    return header;
  }

  // ---------- pitch (markings + both halves) ----------

  // Field markings as plain absolutely-positioned divs layered under the
  // players -- NOT an SVG with a square viewBox stretched non-uniformly to
  // fit the field's real (non-square) box. That stretch was the original
  // implementation and it visibly distorted every round mark (center
  // circle rendered as an ellipse) and every stroke (border widths
  // stretched differently on each axis). Divs sidestep the problem
  // entirely: circles use an explicit equal px width/height (never a
  // percentage of two different-length axes) so they're always round
  // regardless of the field's aspect ratio, and border-width is always a
  // real px value so strokes stay uniform. Both mark sets (horizontal for
  // the wide layout, vertical for the narrow one) are always in the DOM;
  // CSS shows only the one matching the current orientation, mirroring how
  // the field itself switches flex-direction instead of re-rendering.
  function buildMarks() {
    const wrap = el('div', 'fxm-marks');
    wrap.appendChild(el('div', 'fxm-marks__boundary'));

    const horiz = el('div', 'fxm-marks__horizontal');
    horiz.appendChild(el('div', 'fxm-marks__halfway-v'));
    horiz.appendChild(el('div', 'fxm-marks__circle'));
    horiz.appendChild(el('div', 'fxm-marks__spot fxm-marks__spot--center'));
    horiz.appendChild(el('div', 'fxm-marks__box fxm-marks__box--left'));
    horiz.appendChild(el('div', 'fxm-marks__box-inner fxm-marks__box-inner--left'));
    horiz.appendChild(el('div', 'fxm-marks__spot fxm-marks__spot--left'));
    horiz.appendChild(el('div', 'fxm-marks__box fxm-marks__box--right'));
    horiz.appendChild(el('div', 'fxm-marks__box-inner fxm-marks__box-inner--right'));
    horiz.appendChild(el('div', 'fxm-marks__spot fxm-marks__spot--right'));
    wrap.appendChild(horiz);

    const vert = el('div', 'fxm-marks__vertical');
    vert.appendChild(el('div', 'fxm-marks__halfway-h'));
    vert.appendChild(el('div', 'fxm-marks__circle'));
    vert.appendChild(el('div', 'fxm-marks__spot fxm-marks__spot--center'));
    vert.appendChild(el('div', 'fxm-marks__box fxm-marks__box--top'));
    vert.appendChild(el('div', 'fxm-marks__box-inner fxm-marks__box-inner--top'));
    vert.appendChild(el('div', 'fxm-marks__spot fxm-marks__spot--top'));
    vert.appendChild(el('div', 'fxm-marks__box fxm-marks__box--bottom'));
    vert.appendChild(el('div', 'fxm-marks__box-inner fxm-marks__box-inner--bottom'));
    vert.appendChild(el('div', 'fxm-marks__spot fxm-marks__spot--bottom'));
    wrap.appendChild(vert);

    return wrap;
  }

  function renderLine(players, pos, side) {
    const line = el('div', 'fxm-line');
    line.dataset.pos = pos;
    players.forEach((p) => line.appendChild(renderCard(p, undefined, side)));
    return line;
  }

  function renderField(data) {
    const field = el('div', 'fxm-field');
    field.appendChild(buildMarks());

    const homeHalf = el('div', 'fxm-half fxm-half--home');
    FXM.POS_ORDER.forEach((pos) => {
      const players = data.home.starters[pos];
      if (players.length) homeHalf.appendChild(renderLine(players, pos, 'home'));
    });

    const awayHalf = el('div', 'fxm-half fxm-half--away');
    FXM.POS_ORDER.slice()
      .reverse()
      .forEach((pos) => {
        const players = data.away.starters[pos];
        if (players.length) awayHalf.appendChild(renderLine(players, pos, 'away'));
      });

    field.appendChild(homeHalf);
    field.appendChild(awayHalf);
    return field;
  }

  // ---------- bench strip ----------
  // Each team's bench is its own top-level `.fxm-body` grid item now, not
  // nested inside a shared "bench bar" wrapper -- same restructuring as
  // renderTeamHeader above, and for the same reason: matchup.css's
  // grid-template-areas is what decides where each one sits. Wide layout
  // puts them side by side in one row below the field (visually the old
  // single bench bar); narrow layout pairs each bench with its own team's
  // header on its own side of the field. See matchup.css.

  function renderBenchSide(reserves, extraClass, side) {
    const bench = el('div', `fxm-bench ${extraClass}`);
    bench.appendChild(el('div', 'fxm-bench__label', 'Bench'));
    const row = el('div', 'fxm-bench__row');
    reserves.forEach((p) => row.appendChild(renderBenchCard(p, side)));
    bench.appendChild(row);
    return bench;
  }

  // ---------- container + top-level render ----------

  // Looks up the player object matching a state.selectedIdentity (see
  // state.js) inside `data`, the same parsed structure renderField/
  // renderBenchSide just built the fresh cards from -- so if a card with
  // that identity exists in the just-rendered DOM, this is guaranteed to
  // find its matching player object too. Used by reapplySelection below.
  function findPlayerByIdentity(data, identity) {
    if (!identity) return null;
    const sideData = data[identity.side];
    if (!sideData) return null;
    const list = identity.isBench ? sideData.reserves : FXM.POS_ORDER.flatMap((pos) => sideData.starters[pos]);
    return list.find((p) => p.name === identity.name) || null;
  }

  // Re-locates the tap-selected player (if any) among the cards render()
  // JUST rebuilt, and re-applies the dim + tooltip there -- see state.js's
  // comment on state.selectedIdentity for why this exists: render() tears
  // down and rebuilds every `.fxm-card` node on every re-render, and this
  // livescoring page's own DOM mutations trigger that rebuild often (a
  // MutationObserver in main.js reacts to Fantrax's live score updates),
  // including while a player is tap-selected. Without this, the dimming
  // and tooltip would revert to "nothing selected" within ~1s of a tap --
  // reads as the selection mysteriously undoing itself, even though the
  // user didn't touch anything.
  //
  // Found: re-select + re-dim (setSelectedCard), then re-render the
  // tooltip's content AND re-anchor/re-track it via showTooltipForCard --
  // reusing that function (rather than only repositioning) means the
  // scroll-tracker's targetEl also gets updated to the new node, and the
  // stat lines reflect this render's freshest data, exactly as if the user
  // had just tapped the new card themselves.
  //
  // Not found (player genuinely no longer in the lineup/data at all -- a
  // real edge case, e.g. a sub) -- close the tooltip and clear the
  // identity, same as any other stale-target close (mirrors
  // FXShared.trackAnchor's onStale handling for the scroll path).
  function reapplySelection(data, root) {
    const identity = state.selectedIdentity;
    if (!identity) return;
    const match = qa('.fxm-card', root).find(
      (c) => c.dataset.side === identity.side && (c.dataset.bench === '1') === identity.isBench && c.dataset.name === identity.name
    );
    const p = match && findPlayerByIdentity(data, identity);
    if (!match || !p) {
      hideTooltip();
      return;
    }
    setSelectedCard(match);
    showTooltipForCard(buildTooltipLines(p), match);
  }

  function ensureContainer() {
    if (state.container && document.body.contains(state.container)) return state.container;
    const anchor = document.querySelector('league-livescoring-standard-table');
    if (!anchor) return null;
    const wrapper = el('div', 'fxm-matchup');

    const topbar = el('div', 'fxm-topbar');
    topbar.appendChild(el('div', 'fxm-topbar__title', 'Matchup Pitch'));
    const toggleBtn = el('button', 'fxm-toggle-btn', state.hidden ? 'Show pitch' : 'Hide pitch');
    toggleBtn.type = 'button';
    toggleBtn.addEventListener('click', () => {
      state.hidden = !state.hidden;
      toggleBtn.textContent = state.hidden ? 'Show pitch' : 'Hide pitch';
      if (state.bodyEl) state.bodyEl.style.display = state.hidden ? 'none' : '';
    });
    topbar.appendChild(toggleBtn);
    wrapper.appendChild(topbar);
    state.toggleBtn = toggleBtn;

    anchor.parentElement.insertBefore(wrapper, anchor);
    state.container = wrapper;
    return wrapper;
  }

  function render() {
    const data = FXM.parseMatchup();
    if (!data) {
      // Mobile matchup LIST view, or Teams/Scores tabs -- remove our
      // container silently rather than showing a stale/empty pitch. Also
      // close any open tooltip/selection (hideTooltip clears
      // state.selectedIdentity via clearSelectedCard) -- the tooltip lives
      // at document.body, not inside state.container, so it wouldn't
      // otherwise be cleaned up by the container removal above.
      hideTooltip();
      if (state.container) {
        state.container.remove();
        state.container = null;
        state.bodyEl = null;
        state.toggleBtn = null;
      }
      return;
    }

    const container = ensureContainer();
    if (!container) return;

    if (state.bodyEl) state.bodyEl.remove();
    const body = el('div', 'fxm-body');
    body.style.display = state.hidden ? 'none' : '';
    // DOM order matches the wide-layout reading order (home header, away
    // header, field, home bench, away bench) -- matchup.css's
    // grid-template-areas reorders these visually at the narrow breakpoint
    // (each bench moves next to its own team's header) without any JS
    // branching here.
    body.appendChild(renderTeamHeader(data.home, 'fxm-team-header--home', 'home'));
    body.appendChild(renderTeamHeader(data.away, 'fxm-team-header--away', 'away'));
    body.appendChild(renderField(data));
    body.appendChild(renderBenchSide(data.home.reserves, 'fxm-bench--home', 'home'));
    body.appendChild(renderBenchSide(data.away.reserves, 'fxm-bench--away', 'away'));
    container.appendChild(body);
    state.bodyEl = body;
    reapplySelection(data, body);
    requestAnimationFrame(() => applyNameMarquee(body));
  }

  FXM.jerseyFromCrest = jerseyFromCrest;
  FXM.ensureContainer = ensureContainer;
  FXM.render = render;
})(window.FXM);
