/**
 * Prettier Fantrax -- Matchup Pitch: render the two-team pitch
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
 * updates) trigger that rebuild often via the MutationObserver in main.js.
 * The hover tooltip (desktop only, see attachHoverTooltip below) copes with
 * that for free: it follows the live cursor position rather than anchoring
 * to a specific card element, and removing the hovered card from the DOM
 * mid-render fires its `mouseleave` (hiding the tooltip) same as actually
 * moving the mouse off it would. Tapping a card on touch no longer opens
 * this tooltip at all -- see action-menu.js, which owns the per-player
 * action menu (stats + real controls) that replaced it there, and closes
 * itself outright (rather than re-anchoring) if ITS card goes stale
 * mid-render -- see that file's own comment on why the simpler behavior is
 * enough for it.
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

  // ---------- hover breakdown tooltip (desktop only) ----------
  // Mirrors pitch-editor/tooltip.js's mechanics exactly (fixed-position
  // singleton div, mouseenter/mousemove/mouseleave, viewport-edge
  // flipping) under our own `fxm-` classes so it doesn't collide with
  // pitch-editor's `.fx-card-tip`. Wired onto both pitch (starter) cards
  // and bench cards via attachHoverTooltip, called from renderCard itself
  // so every place a card gets built (line or bench) gets hover for free.
  // Touch never shows this any more -- see attachHoverTooltip's own tap
  // wiring below, which opens action-menu.js's menu instead.

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

  // Net finger movement (px) between touchstart and touchend on a card
  // under which a touchend still counts as a tap rather than the tail end
  // of a scroll -- see attachHoverTooltip's FXShared.onTap wiring (now
  // gating whether a tap opens action-menu.js's menu, not this tooltip --
  // see that function's own comment). Same value and same idea as
  // pitch-editor/drag.js's TOUCH_MOVE_CANCEL_PX.
  const TOUCH_TAP_MOVE_PX = 10;

  function hideTooltip() {
    if (state.tooltipEl) state.tooltipEl.classList.remove('fxm-tip--visible');
    state.hoveredName = null;
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
  // 'starting'/'bench' wording is Fantrax's OWN tooltip text, read live off
  // their real mat-tooltip elements (not guessed) -- see the recon doc for
  // the exact technique and readings. Neither hedges with "expected"/
  // "confirmed" the way our old copy did (old bench label was literally
  // "Expected to be on the bench" -- that "Expected" was our invention,
  // not Fantrax's, and was the exact wording the user objected to).
  // 'expected'/'out' have no live-confirmed example (no player with either
  // class was found on any roster/matchup/gameweek reachable this
  // session) -- kept as best-effort, deliberately non-hedged wording
  // justified from the class name alone rather than silently inventing
  // hedged language; update these two for real the moment a live example
  // turns up.
  const EVENT_STATUS_LABEL = {
    starting: 'Starting in upcoming/current game', // live-confirmed
    expected: 'Likely to play', // best-effort, unconfirmed
    bench: 'On the bench, potential substitute', // live-confirmed
    out: 'Not in the squad for this game', // best-effort, unconfirmed
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
  //
  // For a not-yet-played ('upcoming', and the 'unknown' best-effort
  // fallback right after it) player who also has a pre-kickoff status dot
  // (p.eventStatus, this file's own EVENT_STATUS_LABEL copy above), the
  // dot's own explanation (e.g. "Not expected to play") is prepended as
  // the first line, ahead of the projected/no-stats line -- the dot's
  // `title` attribute never shows on a tap/touch device, so the tooltip is
  // what carries that explanation on mobile.
  // parse.js's p.points comes from `dl.scoring-table__cell__fpts dd`, which
  // can disagree with the player's ACTUAL stat breakdown once their game is
  // live -- confirmed against a real match (Joao Pedro, 3' into a live
  // game: dd read ~18.4 while Fantrax's own player-card popup showed the
  // correct live total of 11, exactly matching this file's own breakdown
  // lines -- Goal +9, Shots on Target +2 -- summed by hand). Rather than
  // trust dd for a player we already have a proven-accurate per-stat fpts
  // reading for (window.FXC's fptsMap, the SAME data the breakdown lines
  // below are built from), derive the displayed total by SUMMING those
  // contributions instead -- pure arithmetic on data already validated
  // against the real total, no new DOM selector to get wrong. Falls back to
  // p.points (dd) only when no fptsMap reading exists yet for this player
  // (FXC not loaded, or this player not in it) -- same enhancement-layer-
  // over-fallback pattern the rest of this function already uses. Must NOT
  // be used for the 'upcoming' (not-yet-played) branches further down --
  // an unplayed player's fptsMap is empty (nothing scored yet), so summing
  // it would wrongly zero out p.points there, which legitimately holds
  // Fantrax's own PROJECTION in that case, not a stale/wrong total.
  function resolvePoints(p) {
    const fxc = window.FXC;
    const fptsMap = fxc && fxc.fpts && fxc.fpts.get(p.name);
    if (fptsMap && fptsMap.size) {
      let sum = 0;
      fptsMap.forEach((v) => {
        const n = parseFloat(v);
        if (!isNaN(n)) sum += n;
      });
      return String(Math.round(sum * 100) / 100);
    }
    return p.points;
  }

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
        const lines = [`${resolvePoints(p)} pts:`];
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
      const lines = [`${resolvePoints(p)} pts:`];
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
      // A player with an eventStatus (only ever set pre-kickoff -- see
      // parse.js/roster.js's readEventStatus) has a colored status dot next
      // to their name, but the dot's only explanation is an HTML `title`
      // attribute, which never shows on a tap/touch device. Prepend its
      // label (e.g. "Not expected to play") as its own line here so the
      // tooltip itself carries that explanation on mobile too, ahead of the
      // projected/no-stats line below.
      const statusLine = p.eventStatus ? [EVENT_STATUS_LABEL[p.eventStatus]] : [];
      if (p.points && p.points !== '-') return [...statusLine, `Projected: ${p.points} pts`];
      return [...statusLine, "No stats yet — hasn't played"];
    }
    if (state === 'finished') {
      return ['Did not play this gameweek'];
    }
    // unknown -- best effort, same as before this distinction existed. Same
    // eventStatus prepend as the 'upcoming' branch above, for consistency --
    // in practice a player with eventStatus set is always classified
    // 'upcoming', but this branch duplicates the same projected/no-stats
    // logic so it gets the same treatment rather than silently diverging.
    const statusLine = p.eventStatus ? [EVENT_STATUS_LABEL[p.eventStatus]] : [];
    if (p.points && p.points !== '-') return [...statusLine, `Projected: ${p.points} pts`];
    return [...statusLine, "No stats yet — hasn't played"];
  }

  function attachHoverTooltip(card, p, side) {
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

    // Desktop (fine-pointer) click -- opens action-menu.js's per-player
    // menu at the click coordinates, action buttons only (no stats section:
    // the hover tooltip above already covers that on desktop). Mirrors
    // pitch-editor's plain `click` listener (drag.js) exactly; matchup has
    // no drag/swap system competing for this card's click, so there's no
    // "armed" branching to do here -- every desktop click just (re)opens
    // the menu for whichever card it landed on. A touch tap's synthetic
    // click is already suppressed by FXShared.onTap's preventDefault below,
    // so in practice this only ever fires for a real mouse.
    card.addEventListener('click', (e) => {
      FXM.openActionMenu(card, p, side, e.clientX, e.clientY);
    });

    // Tap on touch devices -- opens the SAME action menu, but with a
    // read-only stats section prepended (action-menu.js's own
    // buildStatsSection, built from THIS file's buildTooltipLines) since
    // touch has no hover and would otherwise never see those numbers. This
    // REPLACES the old tap-to-toggle tooltip entirely: touch never shows
    // `.fxm-tip` any more, only the menu (see FXM.openActionMenu's own
    // isCoarsePointer() branch). Preserved from that old behavior: calling
    // preventDefault in touchend (when the event is cancelable -- see
    // below) suppresses the browser's synthetic mouseenter/mousemove/click
    // chain that would otherwise follow an unprevented tap, so the desktop
    // mouseenter/click listeners above never fire for a tap and this is the
    // ONLY logic that runs. Desktop mouseenter/mousemove/mouseleave/click
    // above are untouched -- touchend simply never fires for a real mouse.
    //
    // The tap-vs-scroll gesture gating (net finger movement under
    // TOUCH_TAP_MOVE_PX between touchstart and touchend, cancelable-safe
    // preventDefault) is FXShared.onTap (src/shared/touch-overlay.js) --
    // the exact mechanics this file originally had inline, now shared with
    // anything else that needs "was this touchend a real tap." Not the
    // same concern as pitch-editor/drag.js's own long-press-vs-scroll state
    // machine (that one decides whether to START A DRAG); this one decides
    // whether to open the menu at all.
    FXShared.onTap(
      card,
      (e) => {
        const t = e.changedTouches && e.changedTouches[0];
        FXM.openActionMenu(card, p, side, t ? t.clientX : 0, t ? t.clientY : 0);
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
    // Identity attributes -- same side:isBench:name shape as marqueeKey
    // (below). Also what action-menu.js's reapplyActionMenu re-locates a
    // card by after a rebuild, and what the `--menu-selected` check right
    // below reads back on THIS same freshly-built card.
    if (p.name) {
      card.dataset.side = side || '';
      card.dataset.bench = isBench ? '1' : '0';
      card.dataset.name = p.name;

      // Marks the ONE card action-menu.js's menu is currently anchored to
      // (state.actionMenuIdentity, set by openActionMenu -- see its own
      // comment) so matchup.css's `.fxm-matchup--menu-open .fxm-card`
      // dimming rule can exempt it via `.fxm-card--menu-selected`, checked
      // right here at CREATION time -- before this card is ever inserted
      // into the document. That timing is the whole fix for a "flicker"
      // bug: render() tears down and rebuilds EVERY `.fxm-card` node on
      // every re-render (matchup's live-score updates trigger that often,
      // sometimes multiple times a second), and the previous approach
      // (JS looping over cards AFTER each render to toggle a `--dimmed`
      // class) let every fresh batch of cards paint one full frame
      // completely undimmed before catching up a tick later -- a constant,
      // visible flash on every OTHER player's card, confirmed live. Doing
      // the check here instead means a freshly-created non-selected card's
      // very FIRST paint is already dimmed (no class to add after the
      // fact, matchup.css's descendant selector just applies), and the
      // selected card's very first paint is already exempted -- there's no
      // "before" frame for either one to flash through.
      const identity = state.actionMenuIdentity;
      if (identity && identity.side === (side || '') && identity.isBench === isBench && identity.name === p.name) {
        card.classList.add('fxm-card--menu-selected');
      }
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
    const resolvedPoints = isUpcoming ? null : resolvePoints(p);
    const ptsText = resolvedPoints && resolvedPoints !== '-' ? resolvedPoints : '0';
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
    //
    // `fxm-card--has-dot` on the CARD itself (not just the dot span) is what
    // lets matchup.css reserve room for the dot on .fxm-card__opp, the
    // game/opponent line -- that's the LAST child of .fxm-card__info and so
    // sits in the same bottom-left corner the dot occupies. See the dot's
    // own CSS comment for why the opp line needs a left-padding reservation
    // that a dot-less card must NOT get (unconditional padding would misalign
    // every non-dotted card's opp line for nothing).
    if (p.name && p.eventStatus) {
      card.classList.add('fxm-card--has-dot');
      const dot = el('span', `fxm-card__dot fxm-card__dot--${p.eventStatus}`);
      dot.title = EVENT_STATUS_LABEL[p.eventStatus] || '';
      card.appendChild(dot);
    }
    // Skip hover wiring on empty slots -- parse.js never actually hands us
    // one (parseSide returns null and callers skip it), but guard on p.name
    // anyway so this stays correct if that ever changes.
    if (p.name) attachHoverTooltip(card, p, side);
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
    // Stale-pass guard -- fixes a real race where the ping-pong marquee
    // appeared to "just reset" instead of resuming mid-cycle. render()
    // schedules this via requestAnimationFrame(() => applyNameMarquee(body))
    // AFTER building a fresh `body`, but that scheduling is async -- if a
    // SECOND render() runs before the first render's rAF callback fires
    // (this page's MutationObserver in main.js can trigger back-to-back
    // renders well inside a single 6s marquee cycle), render() synchronously
    // does `state.bodyEl.remove()` on the OLD body before attaching the new
    // one. The OLDER rAF callback then fires with a `root` that is already
    // detached from the document. Every element's scrollWidth/clientWidth
    // measure as 0 on a detached node, so `overflow <= 0` is true for
    // everything and applyMarqueeToSet's `overflowing` loop below never
    // touches ANY key -- but this function still unconditionally did
    // `state.marqueeStarts = nextStarts` at the end, stomping the real map
    // with that (near-)empty one. The very next genuine (attached, correctly
    // measuring) pass then finds no prior start time for a still-overflowing
    // element's key, falls back to `now`, and its animation-delay resets to
    // 0 -- reading to the user as "it just reset" even though the underlying
    // ping-pong/persistence mechanism is otherwise correct.
    //
    // Fix: bail out here, before touching state.marqueeStarts at all, when
    // `root` is no longer attached. render() always removes the previous
    // body SYNCHRONOUSLY before scheduling the next rAF, so by the time a
    // stale callback's rAF actually fires, its captured root is reliably
    // already detached -- regardless of which order the two rAF callbacks
    // end up firing in. A simple isConnected check is enough; no generation
    // counter/token needed since detachment itself is the exact, reliable
    // signal of staleness here.
    if (!root.isConnected) return;

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
    // Team header manager-username line (renderTeamHeader) -- own
    // 'owner:'-prefixed key namespace, disjoint from 'header:' (team name)
    // above for the same team. Usernames are typically short (no spaces),
    // so this rarely if ever actually overflows, but the mechanism is
    // there for the unusual long one rather than silently clipping it.
    applyMarqueeToSet(root, '.fxm-team-header__owner', '.fxm-team-header__owner-text', 'fxm-team-header__owner--marquee', nextStarts, now);

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
  // ---------- W/L/D result chip (completed matchups only) ----------
  // Fantrax marks a finished matchup nowhere in this page's own header --
  // it just keeps showing both totals (confirmed live on a past gameweek:
  // "It's Carrick, You Know FC 74.55" vs "Fodenfreezone 80.68", with no
  // result indicator anywhere), so who actually won is left for the reader
  // to work out by comparing two decimals. This derives it.
  //
  // "Completed" deliberately means EVERY player's real-life game has been
  // played, not merely "this gameweek is in the past": mid-gameweek, one
  // side leading with fixtures still to come is not a result, and labelling
  // it W/L would be actively misleading. gameState() already classifies a
  // player's game from its own text, so the test is simply that nothing is
  // still 'upcoming' ('unknown' counts as done -- see gameState's own
  // comment on why it trusts a number it can't positively identify as a
  // projection). Returns null when the matchup isn't finished, or when
  // either total isn't a number we can compare, so callers render no chip
  // at all rather than a wrong or empty one.
  // Only STARTERS decide a matchup -- reserves don't score in Fantrax, so a
  // bench player with a later kickoff doesn't keep the result open. Note
  // parse.js's own shape: starters are bucketed by position ({G,D,M,F}),
  // reserves are a flat list; there is no combined `players` array.
  function startersOf(side) {
    const buckets = (side && side.starters) || {};
    return Object.keys(buckets).reduce((acc, pos) => acc.concat(buckets[pos] || []), []);
  }

  function matchupResult(data) {
    const players = startersOf(data.home).concat(startersOf(data.away));
    if (!players.length) return null;
    // Every starter's game must be POSITIVELY finished. Testing for the
    // absence of 'upcoming' instead would call a matchup done while games
    // were still in progress: a kicked-off game shows a score with no
    // trailing "F" and no clock time, which gameState reports as 'unknown'.
    if (!players.every((p) => gameState(p.gameText) === 'finished')) return null;

    const homeScore = parseFloat(data.home.header.live);
    const awayScore = parseFloat(data.away.header.live);
    if (!isFinite(homeScore) || !isFinite(awayScore)) return null;

    if (homeScore === awayScore) return { home: 'D', away: 'D' };
    const homeWon = homeScore > awayScore;
    return { home: homeWon ? 'W' : 'L', away: homeWon ? 'L' : 'W' };
  }

  const RESULT_LABEL = { W: 'Won', L: 'Lost', D: 'Drew' };

  function renderResultChip(result) {
    const chip = el('div', `fxm-team-header__result fxm-team-header__result--${result.toLowerCase()}`);
    chip.textContent = result;
    // The letter alone is the whole visual, so give assistive tech (and a
    // desktop hover) the word rather than making them infer it.
    chip.title = RESULT_LABEL[result] || '';
    chip.setAttribute('aria-label', RESULT_LABEL[result] || result);
    return chip;
  }

  function renderTeamHeader(side, extraClass, key, result) {
    const header = el('div', `fxm-team-header ${extraClass}`);
    // Name row: team crest (when present) beside the team name -- see
    // matchup.css's `.fxm-team-header__top` for how this row itself gets
    // mirrored (logo-then-name vs. name-then-logo) between the home/away
    // sides. `top` is its own wrapper (not just appending logo/name
    // straight to `header`) so it can be a flex row independent of
    // `header`'s own flex-column stacking of [name row] above [scores].
    const top = el('div', 'fxm-team-header__top');
    // Team crest, read straight off Fantrax's own header DOM (parse.js's
    // parseHeader -> readCrestFromFigure on figure.scoring-header__logo --
    // see dot-tooltip-recon.md's "Team header logo" section). Unlike
    // jerseyFromCrest's CONSTRUCTED jersey URLs elsewhere in this file,
    // this URL comes straight off the DOM (never guessed/constructed), so
    // a broken image is very unlikely -- simplest safe handling is to just
    // skip rendering the <img> entirely when there's no logo, rather than
    // showing a broken-image icon.
    if (side.header.logo) {
      const logo = el('img', 'fxm-team-header__logo');
      logo.src = side.header.logo;
      logo.alt = '';
      logo.draggable = false;
      top.appendChild(logo);
    }
    const nameEl = el('div', 'fxm-team-header__name');
    nameEl.dataset.marqueeKey = `header:${key}`;
    // Name text lives in an inner span, mirroring .fxm-card__name-text --
    // see applyNameMarquee/applyMarqueeToSet, which measures/animates this
    // exactly like a player card's name.
    nameEl.appendChild(el('span', 'fxm-team-header__name-text', side.header.name || ''));
    top.appendChild(nameEl);
    // Result chip beside the name. `top` is a flex row that CSS mirrors for
    // the away side, so appending here puts the chip on the correct edge of
    // each header without either side needing its own ordering logic. Only
    // rendered for a genuinely completed matchup -- see matchupResult.
    if (result) top.appendChild(renderResultChip(result));
    header.appendChild(top);
    // Manager username, e.g. "noahsemus" -- NOT present anywhere in this
    // header's own DOM (confirmed live; see fxpa.js's header comment), so
    // this only renders once ensureOwnersFetched (called from render(),
    // which has both teams' ids in scope) has a cached value for THIS
    // team's id. A header built before that resolves simply has no owner
    // line at all -- no "loading" placeholder -- since the fetch already
    // covers both teams in one request kicked off at the top of render(),
    // and typically resolves well before the next re-render (matchup's own
    // live-score churn) rebuilds this header anyway; ensureOwnersFetched's
    // own .then triggers exactly one extra FXM.render() call once it
    // settles, so the very next header built after that already has it
    // from its first paint -- same "born with the right content, no flash"
    // principle as the dimming fix (matchup.css/action-menu.js).
    const ownerName = side.header.teamId ? state.ownerCache.get(side.header.teamId) : null;
    if (ownerName) {
      const ownerEl = el('div', 'fxm-team-header__owner');
      ownerEl.dataset.marqueeKey = `owner:${key}`;
      ownerEl.appendChild(el('span', 'fxm-team-header__owner-text', ownerName));
      header.appendChild(ownerEl);
    }
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

  // Ensures a same-origin fetch is in flight (or already resolved) for
  // BOTH teams' manager usernames in `data`, batched into ONE request when
  // both are missing (mirrors the real Fantrax app batching multiple
  // `getTeamRosterInfo` calls together) -- see fxpa.js's header comment for
  // why this fetch exists at all, and state.js's ownerCache/ownerInflight
  // comments for the caching contract. Schedules exactly one FXM.render()
  // re-run once the fetch settles (success populates ownerCache; failure
  // is swallowed -- console.warn only, header just stays as it is today,
  // per the user's own "no error UI" ask) so the newly-known username(s)
  // show up on the very next header build. Calling FXM.render() directly
  // here (rather than main.js's debounced scheduleRender) is the same
  // pattern render()/reapplyActionMenu/boot() already use elsewhere in
  // this codebase -- main.js's MutationObserver recognizes the resulting
  // DOM changes as "own" (isOwnMutation/isOwnNode) and won't reschedule
  // again, so there's no render loop risk.
  function ensureOwnersFetched(data) {
    const ids = [data.home.header.teamId, data.away.header.teamId].filter(Boolean);
    const need = ids.filter((id) => !state.ownerCache.has(id) && !state.ownerInflight.has(id));
    if (!need.length) return;

    const leagueId = FXShared.fxpaLeagueId();
    const promise = FXShared.fxpaRequest(need.map((teamId) => ({ method: 'getTeamRosterInfo', data: { leagueId, teamId } })))
      .then((json) => {
        (json.responses || []).forEach((r, i) => {
          const info = r && r.data && r.data.teamHeadingInfo;
          const value = info && info.owners && info.owners.value;
          state.ownerCache.set(need[i], value || '');
        });
        render();
      })
      .catch((err) => {
        console.warn('[fx-owner] failed to fetch team manager username(s)', err);
        // Not cached on failure -- the next render() (live-score churn
        // will trigger one soon regardless) sees these ids still missing
        // from both maps and retries.
      })
      .finally(() => {
        need.forEach((id) => state.ownerInflight.delete(id));
      });
    need.forEach((id) => state.ownerInflight.set(id, promise));
  }

  function render() {
    const data = FXM.parseMatchup();
    if (!data) {
      // Mobile matchup LIST view, or Teams/Scores tabs -- remove our
      // container silently rather than showing a stale/empty pitch. Also
      // close any open tooltip -- it lives at document.body, not inside
      // state.container, so it wouldn't otherwise be cleaned up by the
      // container removal below. (The action menu doesn't need the same
      // treatment: closeActionMenu is driven by reapplyActionMenu's own
      // "player not found" branch, which this same FXM.parseMatchup()
      // returning null would also trigger the next time a menu is open and
      // a render happens -- see action-menu.js.)
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

    // Kick off (if needed) the manager-username lookup for both teams in
    // this matchup, before headers are built below -- see
    // renderTeamHeader's own comment for the "born with the right content"
    // timing this is designed around. ensureOwnersFetched no-ops
    // immediately if both are already cached (the common case after the
    // very first render of a given matchup) or already in flight.
    ensureOwnersFetched(data);
    // Refreshed every render (cheap) -- see state.js's own comment on why
    // action-menu.js's last-5 lookup needs this.
    state.homeTeamId = data.home.header.teamId;
    state.awayTeamId = data.away.header.teamId;

    if (state.bodyEl) state.bodyEl.remove();
    const body = el('div', 'fxm-body');
    body.style.display = state.hidden ? 'none' : '';
    // DOM order matches the wide-layout reading order (home header, away
    // header, field, home bench, away bench) -- matchup.css's
    // grid-template-areas reorders these visually at the narrow breakpoint
    // (each bench moves next to its own team's header) without any JS
    // branching here.
    // Computed once for the matchup, not per side, so the two headers can
    // never disagree about who won.
    const result = matchupResult(data);
    body.appendChild(renderTeamHeader(data.home, 'fxm-team-header--home', 'home', result && result.home));
    body.appendChild(renderTeamHeader(data.away, 'fxm-team-header--away', 'away', result && result.away));
    body.appendChild(renderField(data));
    body.appendChild(renderBenchSide(data.home.reserves, 'fxm-bench--home', 'home'));
    body.appendChild(renderBenchSide(data.away.reserves, 'fxm-bench--away', 'away'));
    container.appendChild(body);
    state.bodyEl = body;
    // Re-anchors an open action menu (action-menu.js) to this player's
    // freshly-rebuilt card, if one is open -- see state.js's
    // actionMenuIdentity comment for why this is needed on every render(),
    // not just on a scroll-driven stale check.
    FXM.reapplyActionMenu(data, body);
    requestAnimationFrame(() => applyNameMarquee(body));
  }

  FXM.jerseyFromCrest = jerseyFromCrest;
  FXM.ensureContainer = ensureContainer;
  FXM.render = render;
  // Consumed by action-menu.js: hideTooltip closes the hover tooltip before
  // the menu takes over (mirrors pitch-editor's FXP.hideCardTip), and
  // buildTooltipLines is reused verbatim to build the menu's own read-only
  // stats section on touch -- one set of breakdown lines, shown either in
  // the hover tooltip (desktop) or the action menu (touch), never
  // duplicated.
  FXM.hideTooltip = hideTooltip;
  FXM.buildTooltipLines = buildTooltipLines;
  // Also consumed by action-menu.js's last-5-gameweeks block: gameState
  // gates it to upcoming (not-yet-played) players only, same classification
  // buildTooltipLines/renderCard already use for projection messaging;
  // formatSigned turns a plain fpts string into the same "+N"/"N"/"-N"
  // shape every OTHER stat line in this codebase already uses before
  // handing it to FXShared.renderStatLine's pos/neg/zero coloring.
  FXM.gameState = gameState;
  FXM.formatSigned = formatSigned;
})(window.FXM);
