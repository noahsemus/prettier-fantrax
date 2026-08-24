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
 * ---------------------------------------------------------------------
 */
(function (FXM) {
  'use strict';
  const qa = FXM.qa;
  const state = FXM.state;

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

  // A line is either a plain string, or `{ text, paren, kind }` for a stat
  // line that has a color-coded parenthetical signed-points suffix (e.g.
  // "1 Assists (Total)" + a green/red/muted "(+6)" span) -- see
  // buildTooltipLines. Keeping the parenthetical as its own span (not
  // baked into the row's plain text) is what lets it carry its own color.
  function showTooltip(lines, x, y) {
    if (!lines || !lines.length) return;
    const tip = ensureTooltip();
    tip.innerHTML = '';
    lines.forEach((line, i) => {
      const row = el('div', i === 0 ? 'fxm-tip__title' : 'fxm-tip__row');
      if (typeof line === 'string') {
        row.textContent = line;
      } else {
        row.appendChild(document.createTextNode(`${line.text} `));
        row.appendChild(el('span', `fxm-tip__stat fxm-tip__stat--${line.kind}`, `(${line.paren})`));
      }
      tip.appendChild(row);
    });
    tip.classList.add('fxm-tip--visible');
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

  function signKind(text) {
    const n = parseFloat(text);
    return n > 0 ? 'pos' : n < 0 ? 'neg' : 'zero';
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
  // row's text actually looks like. Rather than guess a regex for it (and
  // risk mislabeling a real state on a card), unrecognized text just stays
  // 'unknown' -- render.js's dot logic (see gameDotInfo) deliberately shows
  // no dot at all for 'unknown' rather than a guessed one. If a genuinely
  // distinguishable live format ever turns up, add a dedicated branch (and
  // dot) then.
  function gameState(gameText) {
    if (!gameText) return 'unknown';
    if (/\sF$/.test(gameText)) return 'finished';
    if (/\d{1,2}:\d{2}\s*[AP]M/i.test(gameText)) return 'upcoming';
    return 'unknown';
  }

  // Pulls the scheduled kickoff substring (e.g. "Mon 3:00 PM") out of an
  // 'upcoming' gameText like "@FUL Mon 3:00 PM", for the upcoming dot's
  // tooltip -- falls back to null (caller uses a generic message) if the
  // text doesn't match the expected shape.
  function scheduledTimeText(gameText) {
    const m = gameText && gameText.match(/((?:[A-Za-z]{3}\s+)?\d{1,2}:\d{2}\s*[AP]M)/i);
    return m ? m[1] : null;
  }

  // Small colored dot rendered next to a card's name, signaling WHY their
  // points total reads the way it does (a 0 because they actually scored
  // 0, vs a 0 because they simply haven't played yet) -- see the user-
  // facing motivation in matchup.css's dot rules. Deliberately a different
  // color palette from .fxm-card__pts's gold/red pos/neg colors (same
  // card, different meaning -- reusing green/red here would read as
  // "positive/negative points" instead of "game state"). Returns null (no
  // dot at all) for 'unknown' -- see gameState's comment for why that
  // state exists and why it never gets a guessed dot.
  function gameDotInfo(gameText) {
    const st = gameState(gameText);
    if (st === 'finished') {
      return { kind: 'finished', title: 'Game finished' };
    }
    if (st === 'upcoming') {
      const when = scheduledTimeText(gameText);
      return {
        kind: 'upcoming',
        title: when ? `Hasn't played yet — kicks off ${when}` : "Hasn't played yet",
      };
    }
    return null;
  }

  // Preferred source: window.FXC (published by content.js) -- a merged
  // reading of BOTH the raw count and the fpts contribution for every stat
  // chip, keyed by player name. Falls back to this player's own current-
  // mode chips (parse.js's p.chips) when FXC is missing, or doesn't have
  // this player in *both* its raw and fpts maps ("lacks the player/mode").
  // Line format is raw-first: "«raw» «stat name» («+signedPts»)", e.g.
  // "1 Assists (Total) (+6)" -- matching pitch-editor/content.js's tooltip
  // format exactly, including the parenthetical being its own color-coded
  // span (green positive / red negative / muted zero -- see showTooltip
  // and matchup.css's .fxm-tip__stat--pos/neg/zero). Degrades to whichever
  // single value is known when only one side is available (no
  // parenthetical, plain text).
  //
  // "Loading breakdown…" is reserved for the genuinely transient case --
  // window.FXC hasn't been published at all yet (content.js's first
  // snapshot is still in flight). Once FXC exists, a player who still has
  // no data there and no chips of their own most likely just hasn't played
  // this gameweek -- that's a terminal state, not something to keep
  // "loading" forever, so it falls through to their projection (or an
  // explicit "hasn't played" line) instead.
  function buildTooltipLines(p) {
    const statNames = window.FX_STAT_NAMES || {};
    const fxc = window.FXC;
    if (!fxc) return ['Loading breakdown…'];

    const rawMap = fxc.raw && fxc.raw.get(p.name);
    const fptsMap = fxc.fpts && fxc.fpts.get(p.name);

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
            // Color-coded parenthetical -- own span (see showTooltip), not
            // baked into a plain string, so it can be green/red/muted
            // independent of the row's own text color.
            lines.push({ text: `${rawText} ${fullName}`, paren: formatSigned(ptsText), kind: signKind(ptsText) });
          } else if (rawText !== undefined) {
            lines.push(`${rawText} ${fullName}`);
          } else if (ptsText !== undefined) {
            lines.push(`${formatSigned(ptsText)} ${fullName}`);
          }
        });
        return lines;
      }
    }

    if (p.chips && p.chips.size) {
      const lines = [`${p.points || '0'} pts:`];
      p.chips.forEach((value, abbr) => {
        lines.push(`${value} ${statNames[abbr] || abbr}`);
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
  // threaded down from renderField/renderBenchBar through renderLine /
  // renderBenchCard -- there's no other per-card identity concept in this
  // module today (matchup cards have no synthetic key, per state.js's note
  // on state.hoveredName).
  function marqueeKey(side, isBench, name) {
    return `${side || '?'}:${isBench ? 'b' : 'p'}:${name}`;
  }

  function renderCard(p, extraClass, side) {
    const isBench = extraClass === 'fxm-card--bench';
    const card = el('div', extraClass ? `fxm-card ${extraClass}` : 'fxm-card');
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
    // detached fragment).
    const nameEl = el('div', 'fxm-card__name');
    // Game-state dot (see gameDotInfo) lives outside the name-text span so
    // it stays fixed in place while only the name text itself marquees --
    // same placement as pitch-editor/render.js's event-status dot relative
    // to .fx-card__name-inner.
    const dotInfo = p.name ? gameDotInfo(p.gameText) : null;
    if (dotInfo) {
      const dot = el('span', `fxm-card__dot fxm-card__dot--${dotInfo.kind}`);
      dot.title = dotInfo.title;
      nameEl.appendChild(dot);
    }
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
    card.appendChild(info);
    // Skip hover wiring on empty slots -- parse.js never actually hands us
    // one (parseSide returns null and callers skip it), but guard on p.name
    // anyway so this stays correct if that ever changes.
    if (p.name) attachHoverTooltip(card, p);
    return card;
  }

  function renderBenchCard(p, side) {
    return renderCard(p, 'fxm-card--bench', side);
  }

  // A name too wide for its card gets a slow back-and-forth marquee scroll
  // instead of an ellipsis, so the full name stays readable. Must run
  // after `root` is actually attached to the document (scrollWidth on a
  // still-detached fragment is meaningless) -- callers use
  // requestAnimationFrame after the DOM insertion, not before. Applies to
  // both pitch and bench cards since both share `.fxm-card__name`.
  //
  // matchup.css's `.fxm-card__name--marquee .fxm-card__name-text` animation
  // is declared `infinite alternate` (ping-pong) already -- that alone
  // would be enough on a static page. It isn't enough here because render()
  // tears down and fully rebuilds EVERY card's DOM on every re-render (the
  // MutationObserver in main.js fires often, well inside a single 6s
  // marquee cycle, as the live matchup page updates), and a freshly-created
  // element's CSS animation always restarts at 0% -- so without this, the
  // user never sees a leg of the ping-pong complete; it just looks like the
  // marquee keeps snapping back to the start. Fix: persist when each card's
  // cycle "started" (state.marqueeStarts, keyed by marqueeKey) across
  // re-renders, and apply a negative `animation-delay` to the freshly-built
  // node so the browser treats it as already partway through the cycle --
  // i.e. resumes mid-cycle instead of restarting.
  function applyNameMarquee(root) {
    // Defensive init here (not state.js) -- this codebase's convention for
    // a map that's only ever read/written by the one file that needs it;
    // state.js's FXM.state gets replaced wholesale on reload/re-eval, so a
    // fresh Map has to be able to reappear on demand rather than only at
    // state.js's own load time.
    state.marqueeStarts = state.marqueeStarts || new Map();
    const now = Date.now();
    const nextStarts = new Map(); // pruned copy -- only keys touched below survive

    qa('.fxm-card__name', root).forEach((nameEl) => {
      const overflow = nameEl.scrollWidth - nameEl.clientWidth;
      if (overflow <= 0) return;
      nameEl.classList.add('fxm-card__name--marquee');
      nameEl.style.setProperty('--fxm-marquee-dist', `-${overflow}px`);

      const key = nameEl.dataset.marqueeKey;
      const textEl = nameEl.querySelector('.fxm-card__name-text');
      if (!key || !textEl) return;
      const startTime = state.marqueeStarts.has(key) ? state.marqueeStarts.get(key) : now;
      nextStarts.set(key, startTime);
      const offsetSec = ((now - startTime) % 6000) / 1000;
      // Negative delay = "act as though the animation already ran this
      // long" -- resumes the ping-pong from the correct point instead of
      // restarting at 0% the way a brand-new node otherwise would.
      textEl.style.animationDelay = `-${offsetSec}s`;
    });

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

  function renderTeamHeader(side, extraClass) {
    const header = el('div', `fxm-team-header ${extraClass}`);
    header.appendChild(el('div', 'fxm-team-header__name', side.header.name || ''));
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

  function renderBenchSide(reserves, extraClass, side) {
    const bench = el('div', `fxm-bench ${extraClass}`);
    bench.appendChild(el('div', 'fxm-bench__label', 'Bench'));
    const row = el('div', 'fxm-bench__row');
    reserves.forEach((p) => row.appendChild(renderBenchCard(p, side)));
    bench.appendChild(row);
    return bench;
  }

  function renderBenchBar(data) {
    const bar = el('div', 'fxm-bench-bar');
    bar.appendChild(renderBenchSide(data.home.reserves, 'fxm-bench--home', 'home'));
    bar.appendChild(renderBenchSide(data.away.reserves, 'fxm-bench--away', 'away'));
    return bar;
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

  function render() {
    const data = FXM.parseMatchup();
    if (!data) {
      // Mobile matchup LIST view, or Teams/Scores tabs -- remove our
      // container silently rather than showing a stale/empty pitch.
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
    // header, field, bench) -- matchup.css's grid-template-areas reorders
    // these visually at the narrow breakpoint without any JS branching here.
    body.appendChild(renderTeamHeader(data.home, 'fxm-team-header--home'));
    body.appendChild(renderTeamHeader(data.away, 'fxm-team-header--away'));
    body.appendChild(renderField(data));
    body.appendChild(renderBenchBar(data));
    container.appendChild(body);
    state.bodyEl = body;
    requestAnimationFrame(() => applyNameMarquee(body));
  }

  FXM.jerseyFromCrest = jerseyFromCrest;
  FXM.ensureContainer = ensureContainer;
  FXM.render = render;
})(window.FXM);
