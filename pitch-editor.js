/**
 * Fantrax Refinements -- Pitch Editor
 * ---------------------------------------------------------------------
 * Turns the Team Roster page into a drag-and-drop lineup editor. It does
 * NOT talk to any private Fantrax API -- it builds its own pitch+bench
 * view from the real roster list already on the page, and when you drop
 * one player onto another it drives Fantrax's own real controls (the
 * per-row "lineup" button used by the "Easy Click" lineup system) to
 * perform the swap, then re-reads the list to confirm it actually
 * happened before reporting success.
 *
 * IMPORTANT CAVEAT: the exact click sequence here is inferred from the
 * DOM (there is a real `button.lineup-btn` per player row, and it is
 * the only control Fantrax exposes for this), but it was not possible
 * to verify end-to-end against a live swap during development because
 * no same-position pair of not-yet-started players was available to
 * test with safely. Every swap is verified after the fact by re-reading
 * the list -- if Fantrax didn't actually apply it, this reports failure
 * rather than claiming success. If swaps consistently fail for you,
 * that's a sign the click sequence needs adjusting.
 * ---------------------------------------------------------------------
 */
(function () {
  'use strict';

  const POS_ORDER = ['G', 'D', 'M', 'F'];

  const state = {
    container: null,
    statusEl: null,
    armed: null, // { key, player, el }
    busy: false,
    tabActive: true, // pitch editor is the default sub-tab
    tabBtn: null,
  };

  function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

  // ---------- read the real roster list ----------

  function getListRows() {
    return qa('.i-table__row').filter((r) => r.querySelector('button.lineup-btn'));
  }

  function findRowByName(name) {
    return getListRows().find((r) => {
      const a = r.querySelector('.scorer__info__name a');
      return a && a.textContent.trim() === name;
    });
  }

  function parseRoster() {
    const rows = getListRows();
    const emptyCounters = {};
    return rows.map((row) => {
      const btn = row.querySelector('button.lineup-btn');
      const pos = btn.textContent.trim();
      const nameA = row.querySelector('.scorer__info__name a');
      const name = nameA ? nameA.textContent.trim() : null;
      const isReserve = row.classList.contains('row--amber');
      const cells = qa(':scope > .i-table__cell', row);
      const oppText = cells[2] ? cells[2].textContent.replace(/\s+/g, ' ').trim() : '';
      const fptsText = cells[3] ? cells[3].textContent.replace(/\s+/g, ' ').trim() : '';
      const img = row.querySelector('img');
      const isEmpty = !name;
      let emptyIndex = null;
      if (isEmpty) {
        const bucket = pos + '|' + isReserve;
        emptyCounters[bucket] = (emptyCounters[bucket] || 0) + 1;
        emptyIndex = emptyCounters[bucket] - 1;
      }
      // Locked = no upcoming kickoff time visible for this player, meaning
      // their game has already started or finished. Conservative on purpose.
      // (Matches "11:30AM" / "3:00 PM" etc. -- a plain /\b(AM|PM)\b/ misses
      // these because there's no word boundary between a digit and a letter.)
      const locked = isEmpty ? false : !/\d{1,2}:\d{2}\s*(am|pm)/i.test(oppText);
      return {
        key: isEmpty ? `empty-${pos}-${isReserve}-${emptyIndex}` : name,
        name,
        pos,
        isReserve,
        isEmpty,
        emptyIndex,
        oppText,
        fptsText,
        crest: img ? img.src : null,
        locked,
      };
    });
  }

  // ---------- "Pitch Editor" tab next to Easy Click / Classic ----------

  function findLineupSystemNav() {
    const buttons = qa('button.pill');
    const easy = buttons.find((b) => b.textContent.trim() === 'Easy Click');
    const classic = buttons.find((b) => b.textContent.trim() === 'Classic');
    if (!easy || !classic) return null;
    return { easy, classic, nav: easy.closest('nav') || easy.parentElement };
  }

  function setupTabs() {
    if (state.tabBtn && document.body.contains(state.tabBtn)) return; // already there
    const found = findLineupSystemNav();
    if (!found) return;
    const { easy, classic, nav } = found;

    const tabBtn = document.createElement('button');
    tabBtn.type = 'button';
    tabBtn.className = 'fx-pitch-tab';
    tabBtn.textContent = 'Pitch Editor';
    tabBtn.addEventListener('click', () => activateTab(true));
    nav.appendChild(tabBtn);
    state.tabBtn = tabBtn;

    [easy, classic].forEach((btn) => {
      btn.addEventListener('click', () => activateTab(false), true);
    });

    activateTab(state.tabActive);
  }

  function activateTab(on) {
    state.tabActive = on;
    if (state.tabBtn) state.tabBtn.classList.toggle('fx-pitch-tab--active', on);
    qa('.i-table').forEach((t) => t.classList.toggle('fx-list-collapsed', on));
    if (on) {
      render();
      if (state.container) state.container.style.display = '';
    } else if (state.container) {
      state.container.style.display = 'none';
    }
  }

  // ---------- render the pitch + bench ----------

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
    const players = parseRoster();
    if (!players.length) return;

    container.innerHTML = '';
    state.armed = null;
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
    POS_ORDER.forEach((pos) => {
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
      'Drag a player onto another to swap them (or click one, then click another). ' +
      "Greyed-out players have already started/finished and can't be moved. Switch to " +
      '"Easy Click" or "Classic" above to use Fantrax\'s own list instead.';
    container.appendChild(hint);
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
      name.textContent = p.name;
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

    wireCardInteractions(card, p);
    return card;
  }

  // ---------- drag / click-to-select interactions ----------

  function wireCardInteractions(card, p) {
    const canDrag = !p.isEmpty && !p.locked;
    card.draggable = canDrag;

    card.addEventListener('dragstart', (e) => {
      if (!canDrag) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.setData('text/plain', p.key);
      e.dataTransfer.effectAllowed = 'move';
      card.classList.add('fx-card--dragging');
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('fx-card--dragging');
    });
    card.addEventListener('dragover', (e) => {
      e.preventDefault();
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
      const source = parseRoster().find((x) => x.key === sourceKey);
      if (!source) return;
      attemptSwap(source, p);
    });

    card.addEventListener('click', () => {
      if (state.busy) return;
      if (!state.armed) {
        if (!p.isEmpty && !p.locked) armCard(card, p);
        return;
      }
      if (state.armed.key === p.key) {
        clearArmed();
        return;
      }
      const source = state.armed.player;
      clearArmed();
      attemptSwap(source, p);
    });
  }

  function armCard(card, p) {
    clearArmed();
    card.classList.add('fx-card--armed');
    state.armed = { key: p.key, player: p, el: card };
  }

  function clearArmed() {
    if (state.armed && state.armed.el) state.armed.el.classList.remove('fx-card--armed');
    state.armed = null;
  }

  // ---------- swap execution against the real Fantrax controls ----------

  function setStatus(text, kind) {
    if (!state.statusEl) return;
    state.statusEl.textContent = text;
    state.statusEl.className = 'fx-pitch__status' + (kind ? ' fx-pitch__status--' + kind : '');
  }

  function overlayChildCount() {
    const oc = document.querySelector('.cdk-overlay-container');
    return oc ? oc.children.length : 0;
  }

  function findTargetButton(target) {
    if (!target.isEmpty) {
      const row = findRowByName(target.name);
      return row ? row.querySelector('button.lineup-btn') : null;
    }
    const candidates = getListRows().filter((r) => {
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
    const sourceRow = findRowByName(source.name);
    const sourceBtn = sourceRow && sourceRow.querySelector('button.lineup-btn');
    if (!sourceBtn) {
      setStatus("Couldn't find that player in the list anymore — try again.", 'err');
      state.busy = false;
      render();
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
      render();
      return;
    }

    targetBtn.click();
    await delay(450);

    if (overlayChildCount() > beforeOverlay) {
      setStatus('Fantrax opened its own picker for this — finish the swap there, then check back.', 'err');
      state.busy = false;
      return;
    }

    const after = parseRoster();
    const newSource = after.find((x) => !x.isEmpty && x.name === source.name);
    const success = !!newSource && (newSource.isReserve !== source.isReserve || newSource.pos !== source.pos);

    state.busy = false;
    render();

    if (success) {
      setStatus(`Swapped ${source.name} ↔ ${target.isEmpty ? 'active slot' : target.name}.`, 'ok');
    } else {
      setStatus(
        "That didn't go through. This can happen if either player's game has already started, or your league locks lineup changes once the gameweek begins.",
        'err'
      );
    }
  }

  // ---------- boot / keep in sync with live updates ----------

  let renderScheduled = false;
  function scheduleRender() {
    if (state.busy || renderScheduled) return;
    renderScheduled = true;
    setTimeout(() => {
      renderScheduled = false;
      setupTabs(); // re-inject the tab if Fantrax re-rendered the nav out from under us
      if (state.tabActive) render();
    }, 500);
  }

  const observer = new MutationObserver((mutations) => {
    if (state.busy) return;
    const relevant = mutations.some(
      (m) => (!state.container || !state.container.contains(m.target)) && (!state.tabBtn || !state.tabBtn.contains(m.target))
    );
    if (relevant) scheduleRender();
  });

  function start() {
    if (!document.querySelector('.i-table')) {
      setTimeout(start, 500);
      return;
    }
    setupTabs();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  start();
})();
