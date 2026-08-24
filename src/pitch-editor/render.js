/**
 * Fantrax Refinements -- Pitch Editor: render the pitch + bench
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
      const jerseySrc = (jerseyMap && jerseyMap.get(lastWord)) || p.crest;
      if (jerseySrc) {
        const img = document.createElement('img');
        img.className = 'fx-card__crest';
        img.src = jerseySrc;
        img.alt = '';
        img.draggable = false;
        card.appendChild(img);
      }

      const name = document.createElement('div');
      name.className = 'fx-card__name';
      if (p.eventStatus) {
        const dot = document.createElement('span');
        dot.className = `fx-card__dot fx-card__dot--${p.eventStatus}`;
        dot.title = FXP.EVENT_STATUS_LABEL[p.eventStatus] || '';
        name.appendChild(dot);
      }
      name.appendChild(document.createTextNode(p.name));
      card.appendChild(name);

      if (p.fptsText && p.fptsText !== '-') {
        const fpts = document.createElement('div');
        const n = parseFloat(p.fptsText);
        const kind = n > 0 ? 'pos' : n < 0 ? 'neg' : 'zero';
        fpts.className = `fx-card__fpts fx-card__fpts--${kind}`;
        fpts.textContent = p.fptsText;
        card.appendChild(fpts);
      }

      const opp = formatOpp(p.oppText);
      if (opp) {
        const oppEl = document.createElement('div');
        oppEl.className = 'fx-card__opp';
        oppEl.textContent = opp;
        card.appendChild(oppEl);
      }
    }

    state.cardsByKey.set(p.key, card);
    FXP.wireCardInteractions(card, p);
    return card;
  }

  FXP.buildJerseyMap = buildJerseyMap;
  FXP.formatOpp = formatOpp;
  FXP.ensureContainer = ensureContainer;
  FXP.render = render;
  FXP.renderCard = renderCard;
})(window.FXP);
