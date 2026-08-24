/**
 * Prettier Fantrax -- Pitch Editor: "Pitch Editor" tab next to Easy Click / Classic
 * ---------------------------------------------------------------------
 * Injects a third pill into Fantrax's real "Lineup change system" nav so
 * switching to/from the pitch view behaves exactly like switching between
 * Fantrax's own two options.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const qa = FXP.qa;
  const state = FXP.state;

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
      FXP.render();
      if (state.container) state.container.style.display = '';
    } else if (state.container) {
      state.container.style.display = 'none';
    }
  }

  FXP.findLineupSystemNav = findLineupSystemNav;
  FXP.setupTabs = setupTabs;
  FXP.activateTab = activateTab;
})(window.FXP);
