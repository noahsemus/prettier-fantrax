/**
 * Prettier Fantrax -- Pitch Editor: render the pitch + bench
 * ---------------------------------------------------------------------
 * This file now loads on every fantrax.com page (see main.js), so render()
 * gates on the roster-only "Easy Click"/"Classic" nav before touching the
 * DOM -- otherwise a non-roster page with its own `.i-table` (standings,
 * players lists, ...) would get a stray empty `.fx-pitch` container.
 *
 * ---------- initial-load / gameweek-switch loading state ----------
 * points-sync.js briefly flips Fantrax's real Stats/Fantasy Points tabs
 * (and, rarely, the Stats period dropdown) to scrape per-player points and
 * season-average data -- see that file's header comment for why, and how it masks the
 * flip itself. That masking hides the REAL table's churn, but the pitch
 * cards render() builds are still visibly affected: the very first render
 * for a gameweek necessarily uses whatever numbers happen to already be on
 * the page (no synced cache exists yet), then a couple of seconds later --
 * once the sync completes -- a second render swaps in the freshly-synced
 * breakdown/average numbers. Two renders, same cards, different numbers:
 * exactly the "ui swapping and numbers updating" a user notices.
 *
 * render() avoids that by checking needsInitialSync: true only when the
 * CURRENTLY DISPLAYED gwKey has neither a committed cache
 * (state.pointsCacheGwKey) nor a finished sync attempt
 * (state.pointsSyncAttemptedGwKey) yet -- i.e. only for the very first sync
 * since page load or a gameweek switch, never for the routine 60s
 * background resyncs that follow (those only ever run once a gwKey already
 * has a committed cache, so needsInitialSync is already false by then).
 * When true, the field+bench are replaced with buildLoadingOverlay()
 * instead of real cards, and maybeSyncPointsData() is still called to
 * kick off (or continue) the sync. points-sync.js's syncPointsData()
 * guarantees state.pointsSyncAttemptedGwKey gets set -- and a follow-up
 * render() triggered -- on every exit path, success or failure, so this
 * can never get stuck showing the overlay: worst case, it clears the
 * instant that one sync attempt finishes.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const qa = FXP.qa;
  const state = FXP.state;
  const FXShared = window.FXShared;

  // ---------- live-game detection from the roster's own Opp cell ----------
  // Delegates to the ONE shared classifier (src/shared/game-status.js,
  // which documents the confirmed text formats of BOTH pages) so the two
  // pitches can never drift on what counts as live.
  function isLiveGame(oppText) {
    return FXShared.classifyGame && FXShared.classifyGame(oppText) === 'live';
  }

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

  // ---------- initial-load / gameweek-switch loading overlay ----------
  // Stands in for the field+bench while needsInitialSync is true (see this
  // file's header comment). Roughly mirrors the real layout's shape -- a
  // green field block plus a row of card-sized placeholders -- so swapping
  // it out for the actual cards, once the sync settles, isn't itself a big
  // layout jump. Lives inside `container` (appended alongside the header,
  // same as the real field/bench), so it stays covered by main.js's
  // isOwnMutation() check without needing any OWN_BODY_CLASSES entry.
  function buildLoadingOverlay() {
    const loading = document.createElement('div');
    loading.className = 'fx-pitch__loading';

    const spinner = document.createElement('div');
    spinner.className = 'fx-pitch__spinner';
    loading.appendChild(spinner);

    const label = document.createElement('div');
    label.className = 'fx-pitch__loading-label';
    label.textContent = 'Loading lineup…';
    loading.appendChild(label);

    const skeletonRow = document.createElement('div');
    skeletonRow.className = 'fx-pitch__skeleton-row';
    for (let i = 0; i < 5; i++) {
      const card = document.createElement('div');
      card.className = 'fx-pitch__skeleton-card';
      skeletonRow.appendChild(card);
    }
    loading.appendChild(skeletonRow);

    return loading;
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

    // See the "initial-load / gameweek-switch loading state" block in this
    // file's header comment. gwKey is read defensively (FXP.getGameweekNumber
    // is defined by points-sync.js, which loads AFTER this file -- safe at
    // call time since render() only ever runs once the page is live, but
    // guard anyway in case load order ever changes).
    const gwKey = FXP.getGameweekNumber ? FXP.getGameweekNumber() : null;
    const needsInitialSync = gwKey !== state.pointsCacheGwKey && gwKey !== state.pointsSyncAttemptedGwKey;
    if (needsInitialSync) {
      container.appendChild(buildLoadingOverlay());
      FXP.maybeSyncPointsData(); // kick off (or continue) the sync that will clear this overlay
      return;
    }

    // "Your starter isn't starting" check. Runs here, after the
    // loading-overlay early return above, so it only ever sees a fully
    // parsed roster for the gameweek actually on screen -- never a
    // half-loaded one mid-gameweek-switch, which would otherwise fire
    // alerts off transient state. Detection, dedupe and the notification
    // channels all live in src/shared/lineup-alerts.js; this file only
    // renders the banner, per this codebase's shared-logic /
    // own-feature-DOM convention.
    const lineupCheck = FXShared.checkLineup ? FXShared.checkLineup(players, gwKey) : null;
    if (lineupCheck && lineupCheck.banner) {
      const alertEl = document.createElement('div');
      alertEl.className = 'fx-pitch__alert';
      alertEl.setAttribute('role', 'status');
      alertEl.textContent = lineupCheck.banner;
      container.appendChild(alertEl);
    }

    const jerseyMap = buildJerseyMap();

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
      // Rows pan horizontally when they can't fit (pitch.css) -- this
      // maintains the fade-in edge arrows that say which way more cards
      // lie. Shared with matchup's .fxm-line, per the parity rule.
      if (FXShared.attachScrollAffordance) FXShared.attachScrollAffordance(row);
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
      "how they got their points, or their season average if they haven't played yet. Switch to " +
      '"Easy Click" or "Classic" above to use Fantrax\'s own list instead.';
    container.appendChild(hint);

    FXP.maybeSyncPointsData();
    applyMarquee(container);
  }

  // ---------- marquee for long player names + game/opponent text ----------
  // Truncating with an ellipsis (the old .fx-card__name/.fx-card__opp
  // behavior) hides part of the text entirely; this instead lets text that
  // overflows its fixed box scroll slowly back and forth so the whole
  // string is readable. Text that already fits is untouched -- no
  // class/property gets added and the inner span just sits static like
  // plain text always did. Originally name-only; now shared (via
  // MARQUEE_SETS below) with the game/opponent line under a player's fpts
  // (.fx-card__opp), for the exact same reason and mechanism.
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
  // Element sets that get the marquee treatment, each with its own inner
  // span selector + marquee class. `keyPrefix` namespaces the persisted
  // state.marqueeStarts key derived from the card's own p.key
  // (card.dataset.key) so the SAME card's name entry and opp-line entry can
  // never collide -- mirrors matchup/render.js's 'opp:' prefix over its own
  // marqueeKey scheme for the exact same reason.
  const MARQUEE_SETS = [
    { selector: '.fx-card__name', innerSelector: '.fx-card__name-inner', marqueeClass: 'fx-card__name--marquee', keyPrefix: '' },
    { selector: '.fx-card__opp', innerSelector: '.fx-card__opp-inner', marqueeClass: 'fx-card__opp--marquee', keyPrefix: 'opp:' },
  ];

  function applyMarquee(container) {
    // Defensive init (not part of state.js's shape) -- see comment above.
    state.marqueeStarts = state.marqueeStarts || new Map();
    requestAnimationFrame(() => {
      const overflowing = [];
      // Pass 1: measure only, across both element sets above (name AND
      // opp/game-text line -- same mechanism, same rAF pass, so measuring
      // one never gets invalidated by a style write made for the other).
      MARQUEE_SETS.forEach(({ selector, innerSelector, marqueeClass, keyPrefix }) => {
        qa(selector, container).forEach((el) => {
          const inner = el.querySelector(innerSelector);
          if (!inner) return;
          // Measure the box's full content overflow (el.scrollWidth), not
          // the inner span's own width: the event-status dot sits OUTSIDE
          // the inner span (see renderCard), so measuring the span alone
          // left a window where the text alone fit but dot+text overflowed
          // -- no marquee, and text-overflow's ellipsis hides a partially
          // fitting atomic inline (the inline-block span) entirely,
          // collapsing the whole name to a bare "..." (constant on
          // Android, where Roboto runs wider than desktop fonts). Same
          // container-based measure matchup's applyMarqueeToSet uses. The
          // travel distance is identical either way: the span's right edge
          // must reach the box's right edge.
          const dist = el.scrollWidth - el.clientWidth;
          if (dist > 0) {
            const card = el.closest('.fx-card');
            const key = card && card.dataset.key ? `${keyPrefix}${card.dataset.key}` : null;
            overflowing.push({ el, inner, dist, key, marqueeClass });
          }
        });
      });
      // Pass 2: write only.
      const now = Date.now();
      const cycleMs = 6000; // must match fx-marquee's animation-duration in card.css
      // Rebuild the map with only this render's marqueeing keys, carrying
      // forward their existing start times -- drops players (and opp lines)
      // that are no longer present or no longer overflowing so it can't
      // grow unbounded.
      const nextStarts = new Map();
      overflowing.forEach(({ el, inner, dist, key, marqueeClass }) => {
        el.classList.add(marqueeClass);
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
      // Fantrax's own scorer-icon (p.eventStatus) exists only pre-kickoff,
      // so during a LIVE game the dot is derived instead (user request
      // 2026-08-28): green for a player actually on the pitch, amber for
      // one still on the real bench. "On the pitch" = has any raw stat
      // recorded for this gameweek (points-sync's rawStatsCache, now
      // gameweek-scoped) -- a starter always has at least GS 1 there.
      // No dot once the game is finished (or on historical weeks): the
      // real number has replaced the question the dot answers.
      let dotStatus = p.eventStatus || null;
      let dotTitle = dotStatus ? FXP.EVENT_STATUS_LABEL[dotStatus] || '' : '';
      if (!dotStatus && p.locked && isLiveGame(p.oppText)) {
        // Shared on-pitch rule (src/shared/game-status.js) -- NOT a bare
        // "has any raw-stat entry" check: gameweek-scoped stat cells read
        // "0" for benched players, so that painted the whole bench green.
        const onPitch = FXShared.hasOnPitchStats && FXShared.hasOnPitchStats(state.rawStatsCache.get(p.name));
        dotStatus = onPitch ? 'starting' : 'bench';
        dotTitle = onPitch ? 'Playing now' : 'On the bench';
      }
      if (dotStatus) {
        const dot = document.createElement('span');
        dot.className = `fx-card__dot fx-card__dot--${dotStatus}`;
        dot.title = dotTitle;
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

      // For a player who hasn't played in the CURRENTLY VIEWED gameweek,
      // p.fptsText reflects whatever Fantrax's own FPts column shows for
      // that (unplayed) week, which isn't a meaningful "points" figure
      // yet. What replaces it depends on WHICH week is on screen (see
      // src/shared/gameweek.js):
      //   - a FUTURE gameweek: their season average (points-sync.js's
      //     state.averageCache, the roster table's own FP/G column) -- a
      //     labeled-by-context preview of what they usually score;
      //   - the ACTIVE (or a past) gameweek: a plain 0 -- there, "hasn't
      //     scored yet" is real information, and any other number
      //     (average, or Fantrax's projection, which used to show here)
      //     reads as a fake earned score. Per user request 2026-08-28.
      let fptsText = p.fptsText;
      if (p.locked) {
        // Locked (game live or finished): the viewed gameweek's own points
        // (points-sync.js's gwPointsCache -- see state.js for why
        // p.fptsText, the table's period-scoped FPts column, can't serve
        // here). '-' means Fantrax reports no score for them this week
        // (e.g. an unused sub) -- that's an earned 0, shown as one.
        const gwPts = state.gwPointsCache.get(p.name);
        if (gwPts !== undefined && gwPts !== null && gwPts !== '') {
          fptsText = gwPts === '-' ? '0' : gwPts;
        }
      } else if (FXShared.isFutureGameweek && FXShared.isFutureGameweek()) {
        const average = state.averageCache.get(p.name);
        fptsText = average !== undefined && average !== null && average !== '-' ? average : '0';
      } else {
        fptsText = '0';
      }
      if (fptsText && fptsText !== '-') {
        const fpts = document.createElement('div');
        const n = parseFloat(fptsText);
        const kind = n > 0 ? 'pos' : n < 0 ? 'neg' : 'zero';
        fpts.className = `fx-card__fpts fx-card__fpts--${kind}`;
        fpts.textContent = fptsText;
        info.appendChild(fpts);
      }

      const opp = FXShared.formatOpp(p.oppText);
      if (opp) {
        const oppEl = document.createElement('div');
        oppEl.className = 'fx-card__opp';
        // Text lives in an inner span, mirroring .fx-card__name-inner --
        // see applyMarquee/MARQUEE_SETS, which measures/animates this
        // exactly like a player card's name (own 'opp:'-prefixed
        // state.marqueeStarts key so it can't collide with this same
        // card's name entry).
        const oppInner = document.createElement('span');
        oppInner.className = 'fx-card__opp-inner';
        oppInner.appendChild(document.createTextNode(opp));
        oppEl.appendChild(oppInner);
        info.appendChild(oppEl);
      }

      card.appendChild(info);
    }

    state.cardsByKey.set(p.key, card);
    FXP.wireCardInteractions(card, p);
    return card;
  }

  FXP.buildJerseyMap = buildJerseyMap;
  FXP.isLiveGame = isLiveGame;
  FXP.jerseyFromCrest = jerseyFromCrest;
  FXP.buildLoadingOverlay = buildLoadingOverlay;
  FXP.ensureContainer = ensureContainer;
  FXP.buildPitchMarks = buildPitchMarks;
  FXP.render = render;
  FXP.renderCard = renderCard;
})(window.FXP);
