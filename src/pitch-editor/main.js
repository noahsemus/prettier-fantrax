/**
 * Fantrax Refinements -- Pitch Editor: boot / keep in sync with live updates
 * ---------------------------------------------------------------------
 * Watches the page for changes (new gameweek, live score refresh, etc.)
 * and re-renders. Anything WE inserted (the pitch container, the injected
 * tab button, the hover tooltip, the action menu) is excluded from
 * "relevant" mutations -- otherwise our own tooltip/menu updates on every
 * mouseenter/click would themselves trigger a re-render, which tears down
 * and rebuilds every card mid-hover and reads as the hover state flickering.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const state = FXP.state;

  let renderScheduled = false;
  function scheduleRender() {
    if (state.busy || renderScheduled) return;
    renderScheduled = true;
    setTimeout(() => {
      renderScheduled = false;
      FXP.setupTabs(); // re-inject the tab if Fantrax re-rendered the nav out from under us
      if (state.tabActive) FXP.render();
    }, 500);
  }

  function isOwnMutation(target) {
    return (
      (state.container && state.container.contains(target)) ||
      (state.tabBtn && state.tabBtn.contains(target)) ||
      (state.tooltipEl && state.tooltipEl.contains(target)) ||
      (state.actionMenuEl && state.actionMenuEl.contains(target))
    );
  }

  const observer = new MutationObserver((mutations) => {
    if (state.busy) return;
    const relevant = mutations.some((m) => !isOwnMutation(m.target));
    if (relevant) scheduleRender();
  });

  function start() {
    if (!document.querySelector('.i-table')) {
      setTimeout(start, 500);
      return;
    }
    FXP.setupTabs();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  start();
})(window.FXP);
