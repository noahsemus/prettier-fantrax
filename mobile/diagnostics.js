/**
 * Prettier Fantrax -- Mobile: on-page diagnostics badge
 * ---------------------------------------------------------------------
 * fantrax.com is an Angular SPA, and its mobile layout may not carry the
 * same DOM structure the desktop selectors above were written against --
 * and there's no console to check on a phone. This module probes for the
 * anchor elements each feature depends on and renders a small on-page
 * badge showing what was (and wasn't) found, so a layout mismatch is
 * visible without plugging into a computer. It only runs when
 * `window.FX_DIAGNOSTICS` is set (by the mobile injection bundle) and is
 * inert everywhere else.
 * ---------------------------------------------------------------------
 */
(function () {
  'use strict';
  if (!window.FX_DIAGNOSTICS) return;

  const PROBE_GROUPS = [
    {
      name: 'Live scoring',
      selectors: [
        'pill-group[aria-label="Mode"]',
        '.scoring-table__row',
        '.scoring-table__cell__content li > b',
      ],
    },
    {
      name: 'Pitch editor',
      selectors: [
        '.i-table__row',
        'button.lineup-btn',
        'league-team-roster-pitch-view figure.pitch-view__player',
        'button.tabs__item',
      ],
    },
  ];

  const state = {
    badgeEl: null,
    expanded: false,
    dismissed: false,
    results: [], // [{ name, selectors: [{ selector, count }] }]
    settleTimer: null,
    initialTimer: null,
  };

  // ---------- probing ----------

  function runProbe() {
    return PROBE_GROUPS.map((group) => ({
      name: group.name,
      selectors: group.selectors.map((selector) => {
        let count = 0;
        try {
          count = document.querySelectorAll(selector).length;
        } catch (err) {
          count = 0;
        }
        return { selector, count };
      }),
    }));
  }

  function groupStatus(group) {
    const total = group.selectors.length;
    const found = group.selectors.filter((s) => s.count > 0).length;
    let color = '#e03131'; // red -- none found
    if (found === total) color = '#2f9e44'; // green -- all found
    else if (found > 0) color = '#f08c00'; // orange -- partial
    return { found, total, color };
  }

  // ---------- badge ----------

  function ensureBadge() {
    if (state.badgeEl) return state.badgeEl;

    const badge = document.createElement('div');
    badge.id = 'fx-diag';
    applyStyle(badge, {
      position: 'fixed',
      left: '8px',
      bottom: '8px',
      zIndex: '2147483647',
      background: 'rgba(20, 20, 20, 0.92)',
      color: '#fff',
      font: '12px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
      padding: '8px 10px',
      maxWidth: '85vw',
      maxHeight: '70vh',
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
      boxSizing: 'border-box',
      userSelect: 'none',
      WebkitUserSelect: 'none',
    });

    document.body.appendChild(badge);
    state.badgeEl = badge;
    return badge;
  }

  function applyStyle(el, styles) {
    for (const key in styles) {
      el.style[key] = styles[key];
    }
  }

  function clearEl(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function renderBadge() {
    if (state.dismissed) return;
    const badge = ensureBadge();
    clearEl(badge);

    if (!state.expanded) {
      renderCollapsed(badge);
    } else {
      renderExpanded(badge);
    }
  }

  function renderCollapsed(badge) {
    const row = document.createElement('div');
    applyStyle(row, {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      minHeight: '32px',
    });
    row.addEventListener('click', () => {
      state.expanded = true;
      renderBadge();
    });

    const label = document.createElement('span');
    label.textContent = 'FX diag';
    applyStyle(label, { fontWeight: '600', opacity: '0.85' });
    row.appendChild(label);

    state.results.forEach((group) => {
      const { found, total, color } = groupStatus(group);
      const pill = document.createElement('span');
      pill.textContent = group.name + ' ' + found + '/' + total;
      applyStyle(pill, {
        background: color,
        color: '#fff',
        borderRadius: '6px',
        padding: '3px 7px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
      });
      row.appendChild(pill);
    });

    if (!state.results.length) {
      const pending = document.createElement('span');
      pending.textContent = 'probing…';
      applyStyle(pending, { opacity: '0.7' });
      row.appendChild(pending);
    }

    const closeBtn = makeCloseButton();
    row.appendChild(closeBtn);

    badge.appendChild(row);
  }

  function renderExpanded(badge) {
    const header = document.createElement('div');
    applyStyle(header, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      cursor: 'pointer',
      minHeight: '32px',
      marginBottom: '4px',
    });
    header.addEventListener('click', (e) => {
      if (e.target && e.target.getAttribute && e.target.getAttribute('data-fx-diag-close')) return;
      state.expanded = false;
      renderBadge();
    });

    const label = document.createElement('span');
    label.textContent = 'FX diagnostics';
    applyStyle(label, { fontWeight: '600' });
    header.appendChild(label);
    header.appendChild(makeCloseButton());
    badge.appendChild(header);

    state.results.forEach((group) => {
      const { color } = groupStatus(group);
      const groupTitle = document.createElement('div');
      groupTitle.textContent = group.name;
      applyStyle(groupTitle, {
        fontWeight: '600',
        marginTop: '8px',
        color: color,
      });
      badge.appendChild(groupTitle);

      const list = document.createElement('div');
      applyStyle(list, { marginTop: '2px' });
      group.selectors.forEach((s) => {
        const line = document.createElement('div');
        applyStyle(line, {
          display: 'flex',
          alignItems: 'flex-start',
          gap: '6px',
          padding: '2px 0',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '11px',
          wordBreak: 'break-all',
        });

        const mark = document.createElement('span');
        mark.textContent = s.count > 0 ? '✓' : '✗';
        applyStyle(mark, {
          color: s.count > 0 ? '#2f9e44' : '#e03131',
          fontWeight: '700',
          flex: '0 0 auto',
        });
        line.appendChild(mark);

        const text = document.createElement('span');
        text.textContent = s.selector + ' (' + s.count + ')';
        line.appendChild(text);

        list.appendChild(line);
      });
      badge.appendChild(list);
    });

    if (!state.results.length) {
      const pending = document.createElement('div');
      pending.textContent = 'probing…';
      applyStyle(pending, { opacity: '0.7', marginTop: '8px' });
      badge.appendChild(pending);
    }
  }

  function makeCloseButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '✕';
    btn.setAttribute('data-fx-diag-close', '1');
    applyStyle(btn, {
      background: 'transparent',
      border: 'none',
      color: '#fff',
      opacity: '0.8',
      fontSize: '16px',
      lineHeight: '1',
      cursor: 'pointer',
      minWidth: '32px',
      minHeight: '32px',
      padding: '0',
      flex: '0 0 auto',
    });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismiss();
    });
    return btn;
  }

  function dismiss() {
    state.dismissed = true;
    if (state.settleTimer) clearTimeout(state.settleTimer);
    if (state.initialTimer) clearTimeout(state.initialTimer);
    try {
      observer.disconnect();
    } catch (err) {
      // ignore
    }
    if (state.badgeEl && state.badgeEl.parentNode) {
      state.badgeEl.parentNode.removeChild(state.badgeEl);
    }
    state.badgeEl = null;
  }

  // ---------- probe + render, guarded ----------

  function probeAndRender() {
    if (state.dismissed) return;
    try {
      state.results = runProbe();
      renderBadge();
    } catch (err) {
      // never throw -- diagnostics must not break the page
    }
  }

  // ---------- mutation observer, debounced ~5s after mutations settle ----------

  const SETTLE_MS = 5000;

  const observer = new MutationObserver(() => {
    if (state.dismissed) return;
    if (state.settleTimer) clearTimeout(state.settleTimer);
    state.settleTimer = setTimeout(probeAndRender, SETTLE_MS);
  });

  function start() {
    try {
      observer.observe(document.body, { childList: true, subtree: true });
    } catch (err) {
      // ignore -- body may not exist yet; the initial probe below still fires
    }
    state.initialTimer = setTimeout(probeAndRender, SETTLE_MS);
  }

  try {
    start();
  } catch (err) {
    // never throw
  }
})();
