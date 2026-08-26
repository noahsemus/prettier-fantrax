/**
 * Prettier Fantrax -- Pitch Editor: "Pitch Editor" tab next to Easy Click / Classic
 * ---------------------------------------------------------------------
 * Injects a third pill into Fantrax's real "Lineup change system" nav so
 * switching to/from the pitch view behaves exactly like switching between
 * Fantrax's own two options.
 *
 * Two real bugs fixed here (both confirmed live on the mobile roster page):
 *
 * 1. Fantrax keeps TWO separate copies of the "Lineup change system"
 *    Easy Click/Classic `button.pill` pair in the DOM AT THE SAME TIME --
 *    one inside a `.fx-layout__pane.hide--phablet` pane (a desktop-only
 *    copy, permanently `display: none` on our narrow mobile viewport via
 *    that class) and one inside a `.filter-panel__row--expandable`
 *    accordion row (the real mobile one -- ALSO `display: none` at rest,
 *    but only because that accordion starts collapsed; opening the
 *    roster page's own filter-panel toggle reveals it). A plain
 *    `qa('button.pill').find(...)` picks whichever comes first in DOM
 *    order, which turned out to be the desktop-only, permanently-hidden
 *    copy -- so our own injected "Pitch Editor" pill was appended into a
 *    `<nav>` that never renders on mobile at all, nowhere near the real,
 *    visible Easy Click/Classic pills the user actually sees once they
 *    open that filter panel. Both copies read as plain `display: none`
 *    while the accordion is collapsed, so a check that just walks the
 *    ancestor chain looking for ANY `display: none` can't tell them apart
 *    at exactly the moment (fresh page load) this needs to succeed --
 *    isHiddenForViewport below instead looks for Fantrax's own `hide--*`
 *    responsive-utility class specifically, which only ever marks the
 *    permanently-desktop-only copy, not a merely-collapsed-right-now one.
 *    main.js already retries setupTabs() on every render, so once the
 *    user opens that panel (or Fantrax's own Angular otherwise reveals
 *    it), a later pass succeeds against the correct copy either way.
 *
 * 2. Fantrax's own Angular fully owns `.pill--active` on Easy Click/
 *    Classic -- it doesn't get removed just because OUR tab is the one
 *    actually driving what's shown, so Easy Click could still visibly read
 *    as "active" (its own green highlight) at the exact same time our own
 *    "Pitch Editor" pill also shows active. activateTab now also toggles
 *    `fx-pitch-tab-mode-on` on the shared `<nav>` (state.tabNav) whenever
 *    our tab is on; pitch.css neutralizes `.pill--active` back to a plain
 *    `.pill`'s own (inactive) look ONLY inside that scope -- exact color
 *    values read live off the real page (an active pill's own computed
 *    background/color vs. an inactive one's), not guessed. Clicking Easy
 *    Click/Classic already deactivates our tab via the capture-phase
 *    listener below (removing `fx-pitch-tab-mode-on` too), so the reverse
 *    direction -- picking Fantrax's own option un-does our override and
 *    lets ITS real `.pill--active` show through again -- already worked
 *    and still does; verified live both directions.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const qa = FXP.qa;
  const state = FXP.state;

  // Excludes only a VIEWPORT-based hide (Fantrax's own `hide--phablet` /
  // `hide--*` responsive utility classes, confirmed live), not a
  // collapsed-accordion hide. Both look identical as plain
  // `display: none` right now (the real mobile copy of this nav lives
  // inside a `.filter-panel__row--expandable` accordion row that's
  // ALSO `display: none` at rest, collapsed, until the roster page's own
  // filter-panel toggle is opened) -- confirmed live that a naive "walk
  // every ancestor, reject on ANY display:none" check wrongly rejects
  // BOTH copies whenever that accordion happens to be collapsed (i.e. on
  // a fresh page load, before the user has ever opened it), which is
  // exactly when setupTabs() first needs this to succeed. Checking for
  // the SPECIFIC `hide--*` class name instead of literal computed display
  // correctly tells "will never render on this viewport" (the desktop-only
  // copy) apart from "not rendered RIGHT NOW, but could be" (the real
  // mobile one, mid-collapse) -- main.js retries setupTabs() on every
  // render anyway, so once the user opens that panel (or Fantrax's own
  // Angular otherwise reveals it), this succeeds on a later pass.
  function isHiddenForViewport(el) {
    for (let node = el; node; node = node.parentElement) {
      if (node.classList && Array.from(node.classList).some((c) => /^hide--/.test(c))) return true;
    }
    return false;
  }

  function findLineupSystemNav() {
    const buttons = qa('button.pill').filter((b) => !isHiddenForViewport(b));
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
    state.tabNav = nav;

    [easy, classic].forEach((btn) => {
      btn.addEventListener('click', () => activateTab(false), true);
    });

    activateTab(state.tabActive);
  }

  function activateTab(on) {
    state.tabActive = on;
    if (state.tabBtn) state.tabBtn.classList.toggle('fx-pitch-tab--active', on);
    // See this file's header comment (fix #2) -- CSS-only, never touches
    // Fantrax's own `.pill--active` class itself, just neutralizes its
    // visual effect while our tab is the one actually active.
    if (state.tabNav) state.tabNav.classList.toggle('fx-pitch-tab-mode-on', on);
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
