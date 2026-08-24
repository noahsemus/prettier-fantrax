/**
 * Fantrax Refinements -- Pitch Editor: render the pitch + bench
 * ---------------------------------------------------------------------
 * This file now loads on every fantrax.com page (see main.js), so render()
 * gates on the roster-only "Easy Click"/"Classic" nav before touching the
 * DOM -- otherwise a non-roster page with its own `.i-table` (standings,
 * players lists, ...) would get a stray empty `.fx-pitch` container.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const qa = FXP.qa;
  const state = FXP.state;

  // ---------- jersey images (borrowed from Fantrax's own read-only pitch widget) ----------

  function buildJerseyMap() {
    const map = new Map();
    qa('league-team-roster-pitch-view figure.pitch-view__player').forEach((fig) => {
      const img = fig.querySelector('img');
      const capSpan = fig.querySelector('figcaption span');
      if (!img || !capSpan) return;
      const abbrName = capSpan.textContent.trim(); // e.g. "I. Maatsen"
      const lastWord = abbrName.split(/\s+/).pop();
      if (lastWord) map.set(lastWord.toLowerCase(), img.src);
    });
    return map;
  }

  // ---------- jersey URL construction from crest (mobile fallback + future matchup view) ----------
  // Fantrax's own crest images live at
  //   <origin>/assets/images/logos/sportsteam/<league>/<Team_Name>.png
  // and (EPL only) jersey images live at
  //   <origin>/assets/images/jerseys/epl/Premier-League-jersey_<Team_Name>.png       (outfield)
  //   <origin>/assets/images/jerseys/epl/Premier-League-jersey-logo_goalkeeper.png   (goalkeepers)
  // The "Premier-League-" filename prefix is EPL-specific, so this only applies when the
  // crest URL's league segment is "epl" -- other leagues have no known jersey URL pattern
  // and callers should fall back to showing the crest image itself.
  function jerseyFromCrest(crestUrl, pos) {
    if (!crestUrl) return null;
    const m = crestUrl.match(/^(.*)\/assets\/images\/logos\/sportsteam\/epl\/([^/]+)\.png$/);
    if (!m) return null;
    const origin = m[1];
    if (pos === 'G') return `${origin}/assets/images/jerseys/epl/Premier-League-jersey-logo_goalkeeper.png`;
    return `${origin}/assets/images/jerseys/epl/Premier-League-jersey_${m[2]}.png`;
  }

  function formatOpp(oppText) {
    if (!oppText) return '';
    return oppText
      .replace(/@/g, ' @ ')
      .replace(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/g, ' $1')
      .replace(/([A-Za-z]{2,4})(\d)/g, '$1 $2')
      .replace(/(\d)(AM|PM)/gi, '$1 $2')
      .replace(/(\d)(F)$/, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ---------- pitch field markings (goal end + half center-circle) ----------
  // Built once per render (render() wipes container.innerHTML every time
  // anyway) and appended to `.fx-pitch__field` before the position rows --
  // see the "pitch markings" comment block in pitch.css for the layout
  // rationale and why divs rather than a stretched SVG.
  function buildPitchMarks() {
    const marks = document.createElement('div');
    marks.className = 'fx-pitch-marks';

    const box18 = document.createElement('div');
    box18.className = 'fx-pitch-marks__box fx-pitch-marks__box--18';
    marks.appendChild(box18);

    const box6 = document.createElement('div');
    box6.className = 'fx-pitch-marks__box fx-pitch-marks__box--6';
    marks.appendChild(box6);

    const goal = document.createElement('div');
    goal.className = 'fx-pitch-marks__goal';
    marks.appendChild(goal);

    const penaltySpot = document.createElement('div');
    penaltySpot.className = 'fx-pitch-marks__spot fx-pitch-marks__spot--penalty';
    marks.appendChild(penaltySpot);

    const circle = document.createElement('div');
    circle.className = 'fx-pitch-marks__circle';
    marks.appendChild(circle);

    const centerSpot = document.createElement('div');
    centerSpot.className = 'fx-pitch-marks__spot fx-pitch-marks__spot--center';
    marks.appendChild(centerSpot);

    return marks;
  }

  function ensureContainer() {
    if (state.container && document.body.contains(state.container)) return state.container;
    const anchor = document.querySelector('.i-table');
    if (!anchor) return null;
    const wrapper = document.createElement('div');
    wrapper.className = 'fx-pitch';
    anchor.parentElement.insertBefore(wrapper, anchor);
    state.container = wrapper;
    return wrapper;
  }

  function render() {
    if (!state.tabActive) return;
    // The content script now runs on every fantrax.com page (SPA navigation
    // means the roster URL match alone can't be relied on to inject us), so
    // bail before touching the DOM unless we're actually on the roster page
    // -- identified by the "Easy Click"/"Classic" lineup-system nav that only
    // exists there. Without this, ensureContainer() would insert an empty
    // `.fx-pitch` next to any `.i-table` on non-roster pages (standings,
    // players lists, etc. all use that class too).
    if (!FXP.findLineupSystemNav()) return;
    const container = ensureContainer();
    if (!container) return;
    const players = FXP.parseRoster();
    if (!players.length) return;

    container.innerHTML = '';
    FXP.closeActionMenu();
    state.armed = null;
    state.dragSource = null;
    state.players = players;
    state.cardsByKey = new Map();
    const jerseyMap = buildJerseyMap();

    const header = document.createElement('div');
    header.className = 'fx-pitch__header';
    const title = document.createElement('div');
    title.className = 'fx-pitch__title';
    title.textContent = 'Lineup (drag to swap)';
    const status = document.createElement('div');
    status.className = 'fx-pitch__status';
    header.appendChild(title);
    header.appendChild(status);
    container.appendChild(header);
    state.statusEl = status;

    const field = document.createElement('div');
    field.className = 'fx-pitch__field';
    field.appendChild(buildPitchMarks());
    const active = players.filter((p) => !p.isReserve);
    FXP.POS_ORDER.forEach((pos) => {
      const rowPlayers = active.filter((p) => p.pos === pos);
      if (!rowPlayers.length) return;
      const row = document.createElement('div');
      row.className = 'fx-pitch__row';
      rowPlayers.forEach((p) => row.appendChild(renderCard(p, jerseyMap)));
      field.appendChild(row);
    });
    container.appendChild(field);

    const bench = document.createElement('div');
    bench.className = 'fx-bench';
    const label = document.createElement('div');
    label.className = 'fx-bench__label';
    label.textContent = 'Bench';
    const benchRow = document.createElement('div');
    benchRow.className = 'fx-bench__row';
    players.filter((p) => p.isReserve).forEach((p) => benchRow.appendChild(renderCard(p, jerseyMap)));
    bench.appendChild(label);
    bench.appendChild(benchRow);
    container.appendChild(bench);

    const hint = document.createElement('div');
    hint.className = 'fx-pitch__hint';
    hint.textContent =
      'Drag a player onto another to swap them, or click a player for more actions. Only ' +
      'legal targets light up while dragging or after "Start Swap". Hover a player to see ' +
      "how they got their points, or their projection if they haven't played yet. Switch to " +
      '"Easy Click" or "Classic" above to use Fantrax\'s own list instead.';
    container.appendChild(hint);

    FXP.maybeSyncPointsData();
    applyMarquee(container);
  }

  // ---------- marquee for long player names ----------
  // Truncating with an ellipsis (the old .fx-card__name behavior) hides part
  // of the name entirely; this instead lets names that overflow their fixed
  // 84px box scroll slowly back and forth so the whole name is readable.
  // Names that already fit are untouched -- no class/property gets added and
  // .fx-card__name-inner just sits static like plain text always did.
  //
  // Reads (scrollWidth/clientWidth) and writes (class/style) are batched into
  // two separate passes over all cards so measuring one card's layout never
  // gets invalidated by a style write made for another card (avoids thrash).
  // The whole thing runs inside a rAF so it happens after the browser has
  // laid out the cards just appended to `container`.
  //
  // card.css declares `fx-marquee` as `... infinite alternate`, i.e. it
  // already plays forward then reverses (ping-pongs) on its own -- but
  // render() calls container.innerHTML = '' and rebuilds every card from
  // scratch on *every* re-render (this pitch editor re-renders often: the
  // MutationObserver debounce, points-sync, gameweek changes, ...), and a
  // freshly-created DOM node's CSS animation always restarts at 0%. Since
  // re-renders happen well inside a single 6s cycle, a marqueeing name never
  // gets to finish a leg -- let alone reverse -- before it's torn down and
  // recreated at position 0, which reads to the user as "it keeps resetting
  // to the start" rather than the ping-pong it's declared to be. To fix
  // that, we persist each marqueeing player's cycle start time (keyed by
  // their stable roster `p.key`) across renders in state.marqueeStarts, and
  // apply a negative `animation-delay` below equal to how far into the
  // current 6s cycle we already are -- a negative delay tells the browser to
  // act as though the animation already ran that long, so a brand-new node
  // resumes mid-cycle instead of restarting at 0%.
  function applyMarquee(container) {
    // Defensive init (not part of state.js's shape) -- see comment above.
    state.marqueeStarts = state.marqueeStarts || new Map();
    requestAnimationFrame(() => {
      const names = qa('.fx-card__name', container);
      const overflowing = [];
      // Pass 1: measure only.
      names.forEach((el) => {
        const inner = el.querySelector('.fx-card__name-inner');
        if (!inner) return;
        const dist = inner.scrollWidth - el.clientWidth;
        if (dist > 1) {
          const card = el.closest('.fx-card');
          const key = card && card.dataset.key;
          overflowing.push({ el, inner, dist, key });
        }
      });
      // Pass 2: write only.
      const now = Date.now();
      const cycleMs = 6000; // must match fx-marquee's animation-duration in card.css
      // Rebuild the map with only this render's marqueeing keys, carrying
      // forward their existing start times -- drops players that are no
      // longer present or no longer overflowing so it can't grow unbounded.
      const nextStarts = new Map();
      overflowing.forEach(({ el, inner, dist, key }) => {
        el.classList.add('fx-card__name--marquee');
        el.style.setProperty('--fx-marquee-dist', `-${dist}px`);
        if (!key) return;
        const startTime = state.marqueeStarts.get(key) || now;
        nextStarts.set(key, startTime);
        const offsetSec = ((now - startTime) % cycleMs) / 1000;
        inner.style.animationDelay = `-${offsetSec}s`;
      });
      state.marqueeStarts = nextStarts;
    });
  }

  function renderCard(p, jerseyMap) {
    const card = document.createElement('div');
    card.className = 'fx-card';
    card.dataset.key = p.key;
    if (p.isEmpty) card.classList.add('fx-card--empty');
    if (p.locked) card.classList.add('fx-card--locked');

    if (p.isEmpty) {
      const plus = document.createElement('div');
      plus.className = 'fx-card__plus';
      plus.textContent = '+';
      card.appendChild(plus);
      const posTag = document.createElement('div');
      posTag.className = 'fx-card__pos';
      posTag.textContent = p.pos;
      card.appendChild(posTag);
    } else {
      const posTag = document.createElement('div');
      posTag.className = 'fx-card__pos';
      posTag.textContent = p.pos;
      card.appendChild(posTag);

      const lastWord = p.name.split(/\s+/).pop().toLowerCase();
      const mapHit = jerseyMap && jerseyMap.get(lastWord);
      const constructed = !mapHit && jerseyFromCrest(p.crest, p.pos);
      const jerseySrc = mapHit || constructed || p.crest;
      if (jerseySrc) {
        const img = document.createElement('img');
        img.className = 'fx-card__crest';
        img.src = jerseySrc;
        img.alt = '';
        img.draggable = false;
        // A constructed URL is a guess (see jerseyFromCrest above) -- if it 404s,
        // degrade to the crest image instead of leaving a broken-image icon.
        if (constructed && p.crest && constructed !== p.crest) {
          img.onerror = () => {
            img.onerror = null;
            img.src = p.crest;
          };
        }
        card.appendChild(img);
      }

      const info = document.createElement('div');
      info.className = 'fx-card__info';

      const name = document.createElement('div');
      name.className = 'fx-card__name';
      if (p.eventStatus) {
        const dot = document.createElement('span');
        dot.className = `fx-card__dot fx-card__dot--${p.eventStatus}`;
        dot.title = FXP.EVENT_STATUS_LABEL[p.eventStatus] || '';
        name.appendChild(dot);
      }
      // The dot (real-life event-status indicator) stays put outside the
      // scrolling span -- only the name text itself marquees. See the
      // measure/apply pass at the end of render() for how
      // `fx-card__name--marquee` and `--fx-marquee-dist` get set on `name`.
      const nameInner = document.createElement('span');
      nameInner.className = 'fx-card__name-inner';
      nameInner.appendChild(document.createTextNode(p.name));
      name.appendChild(nameInner);
      info.appendChild(name);

      if (p.fptsText && p.fptsText !== '-') {
        const fpts = document.createElement('div');
        const n = parseFloat(p.fptsText);
        const kind = n > 0 ? 'pos' : n < 0 ? 'neg' : 'zero';
        fpts.className = `fx-card__fpts fx-card__fpts--${kind}`;
        fpts.textContent = p.fptsText;
        info.appendChild(fpts);
      }

      const opp = formatOpp(p.oppText);
      if (opp) {
        const oppEl = document.createElement('div');
        oppEl.className = 'fx-card__opp';
        oppEl.textContent = opp;
        info.appendChild(oppEl);
      }

      card.appendChild(info);
    }

    state.cardsByKey.set(p.key, card);
    FXP.wireCardInteractions(card, p);
    return card;
  }

  FXP.buildJerseyMap = buildJerseyMap;
  FXP.jerseyFromCrest = jerseyFromCrest;
  FXP.formatOpp = formatOpp;
  FXP.ensureContainer = ensureContainer;
  FXP.buildPitchMarks = buildPitchMarks;
  FXP.render = render;
  FXP.renderCard = renderCard;
})(window.FXP);
