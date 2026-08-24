/**
 * Prettier Fantrax -- Matchup Pitch: boot / keep in sync with live updates
 * ---------------------------------------------------------------------
 * Watches the page for changes (matchup carousel switching to a different
 * matchup, live score refresh, gameweek change) and re-renders. Anything
 * WE inserted (the .fxm-matchup container) is excluded from "relevant"
 * mutations -- otherwise our own toggle button's style changes would
 * themselves trigger a re-render loop, same reasoning as
 * pitch-editor/main.js's isOwnMutation.
 *
 * Since the content_scripts entry now matches every fantrax.com page (not
 * just livescoring URLs, to survive SPA navigation -- see manifest.json),
 * render() itself inserting/removing `.fxm-matchup` is a mutation this same
 * observer will see. A naive "is m.target inside our container" check
 * misses the case where the mutation's target is the container's PARENT
 * (our container being inserted before the anchor, or removed from it) --
 * that mutation's target is NOT contained by state.container, so it reads
 * as "relevant" and schedules a useless re-render. isOwnNode below also
 * inspects addedNodes/removedNodes so that case is recognized too, same
 * pattern as pitch-editor/main.js's isOwnNode (ported from there).
 *
 * Idempotent boot: `FXM.booted` / `FXM.observer` are read/written directly
 * on the `FXM` namespace object rather than inside `FXM.state`, because
 * state.js unconditionally replaces `FXM.state` with a fresh object every
 * time it runs. During normal extension use these files only ever load
 * once, but during live iteration (evaluating the four files by hand,
 * repeatedly, to test changes) state.js re-running first would otherwise
 * orphan the previous run's container reference and MutationObserver.
 * Keeping the observer directly on `FXM` means a fresh boot() can always
 * find and disconnect the old one, and teardown() also queries the DOM
 * directly for `.fxm-matchup` rather than trusting `state.container`, for
 * the same reason.
 * ---------------------------------------------------------------------
 */
(function (FXM) {
  'use strict';
  const state = FXM.state;

  function isOwnMutation(target) {
    return !!(state.container && state.container.contains(target));
  }

  // True when `node` is part of our own UI. Checked two ways, mirroring
  // pitch-editor/main.js's isOwnNode: state.container can already be null by
  // the time this runs (render() nulls it out synchronously on removal,
  // while the MutationObserver callback fires as a microtask afterward), so
  // the class-name fallback covers a just-removed container node that the
  // state-ref check above can no longer recognize. Exact class match only,
  // never a prefix/startsWith check -- Fantrax's own classes use an `fx-`
  // prefix (fx-nav, fx-layout__pane, ...), distinct from ours (`fxm-`), but
  // a prefix check would still be the wrong tool here.
  const OWN_BODY_CLASSES = ['fxm-matchup'];
  function isOwnNode(node) {
    if (!node || node.nodeType !== 1) return false;
    if (isOwnMutation(node)) return true;
    return OWN_BODY_CLASSES.some((c) => node.classList.contains(c));
  }

  function scheduleRender() {
    if (state.renderScheduled) return;
    state.renderScheduled = true;
    setTimeout(() => {
      state.renderScheduled = false;
      FXM.render();
    }, 400);
  }

  function teardown() {
    if (FXM.observer) {
      FXM.observer.disconnect();
      FXM.observer = null;
    }
    qaRemove('.fxm-matchup');
  }

  function qaRemove(sel) {
    Array.from(document.querySelectorAll(sel)).forEach((n) => n.remove());
  }

  function boot() {
    if (FXM.booted) teardown();
    FXM.booted = true;

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
    FXM.observer = observer;

    FXM.render();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  boot();
})(window.FXM);
