/**
 * Prettier Fantrax -- Pitch Editor: boot / keep in sync with live updates
 * ---------------------------------------------------------------------
 * Watches the page for changes (new gameweek, live score refresh, etc.)
 * and re-renders. Anything WE inserted (the pitch container, the injected
 * tab button, the hover tooltip, the action menu) is excluded from
 * "relevant" mutations -- otherwise our own tooltip/menu updates on every
 * mouseenter/click would themselves trigger a re-render, which tears down
 * and rebuilds every card mid-hover and reads as the hover state flickering.
 *
 * The tooltip, action menu, and touch-drag ghost are all appended directly
 * to document.body (not inside our container), so their insertion/removal
 * mutations have `target === document.body` -- not something a plain
 * "is the target inside one of our elements" check catches. Those
 * body-level insertions are excluded too: a mutation is treated as our own
 * whenever every added/removed node it carries is one of our elements, even
 * when the mutation's target itself is body.
 *
 * This file now loads on every fantrax.com page (SPA client-side navigation
 * means matching only the roster URL leaves the extension un-injected when
 * a user navigates to the roster without a full page load), so start()
 * caps its `.i-table` polling and starts observing regardless -- see
 * below. setupTabs() and render() each independently gate on roster-only
 * DOM markers, so observing off-roster is a safe no-op.
 *
 * points-sync.js sets `state.busy` for the ~2-3s it spends flipping the
 * real Stats/Fantasy Points tabs to scrape data (e.g. right after a
 * gameweek switch, while the new gameweek's table is still loading). We
 * never drop mutations that arrive during that window and never render
 * against a table mid-scrape: the observer callback always evaluates
 * relevance and calls scheduleRender(), and scheduleRender()'s deferred
 * callback (runScheduledRender) re-arms itself on a ~500ms timer for as
 * long as state.busy stays true, only rendering once it clears. That
 * guarantees the gameweek's final state gets rendered instead of silently
 * discarding the mutations a busy sync would otherwise have swallowed.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const state = FXP.state;

  let renderScheduled = false;
  function scheduleRender() {
    if (renderScheduled) return;
    renderScheduled = true;
    setTimeout(runScheduledRender, 500);
  }

  function runScheduledRender() {
    if (state.busy) {
      // A points-sync is in flight (e.g. mid-gameweek-switch). Don't render
      // against a table that's being flipped between Stats/Fantasy
      // Points/period tabs, and don't drop this render either -- keep
      // renderScheduled true and retry in ~500ms until busy clears. This
      // can't spin forever: points-sync.js always clears state.busy in its
      // `finally`, bounded by that function's own handful of ~300-500ms
      // delays, so the retry loop is bounded too.
      setTimeout(runScheduledRender, 500);
      return;
    }
    renderScheduled = false;
    FXP.setupTabs(); // re-inject the tab if Fantrax re-rendered the nav out from under us
    if (state.tabActive) FXP.render();
  }

  function isOwnMutation(target) {
    return (
      (state.container && state.container.contains(target)) ||
      (state.tabBtn && state.tabBtn.contains(target)) ||
      (state.tooltipEl && state.tooltipEl.contains(target)) ||
      (state.actionMenuEl && state.actionMenuEl.contains(target))
    );
  }

  // True when `node` is part of our own UI. Checked two ways, because a
  // body-appended element (tooltip / action menu / touch ghost) can already
  // be gone from `state` by the time this runs: MutationObserver callbacks
  // fire as a microtask, and e.g. closeActionMenu() nulls out
  // state.actionMenuEl synchronously right after removing the element, so a
  // just-*removed* menu node can no longer be recognized via the state
  // refs above. The class-name fallback covers that case. This must stay an
  // exact match (classList.contains), never a prefix/startsWith check --
  // Fantrax's own site classes also start with `fx-` (e.g. `fx-nav`), so a
  // prefix check would misclassify real Fantrax mutations as ours.
  const OWN_BODY_CLASSES = ['fx-card-tip', 'fx-action-menu', 'fx-card--touch-ghost'];
  function isOwnNode(node) {
    if (!node || node.nodeType !== 1) return false;
    if (isOwnMutation(node)) return true;
    return OWN_BODY_CLASSES.some((c) => node.classList.contains(c));
  }

  const observer = new MutationObserver((mutations) => {
    const relevant = mutations.some((m) => {
      if (isOwnMutation(m.target)) return false;
      const nodeCount = m.addedNodes.length + m.removedNodes.length;
      if (nodeCount === 0) return true; // nothing to inspect -- fall back to the target check above
      for (let i = 0; i < m.addedNodes.length; i++) {
        if (!isOwnNode(m.addedNodes[i])) return true;
      }
      for (let i = 0; i < m.removedNodes.length; i++) {
        if (!isOwnNode(m.removedNodes[i])) return true;
      }
      return false;
    });
    if (relevant) scheduleRender();
  });

  // The content script now runs on every fantrax.com page (SPA navigation
  // means the roster URL match alone can't be relied on to inject us), so
  // `.i-table` may never appear here at all -- e.g. on a page with no table
  // widget. Poll for it a bounded number of times (10 x 500ms = 5s, plenty
  // for a same-page async load) and start observing regardless once that
  // cap is hit, so a later SPA navigation into the roster page is still
  // caught by the observer. setupTabs()/render() both independently no-op
  // off-roster, so observing early (before `.i-table` shows up) is safe.
  const START_MAX_ATTEMPTS = 10;
  function start(attempt) {
    attempt = attempt || 0;
    if (!document.querySelector('.i-table') && attempt < START_MAX_ATTEMPTS) {
      setTimeout(() => start(attempt + 1), 500);
      return;
    }
    FXP.setupTabs();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  start();
})(window.FXP);
