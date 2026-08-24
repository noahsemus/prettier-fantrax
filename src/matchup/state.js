/**
 * Prettier Fantrax -- Matchup Pitch: shared state + tiny DOM utils
 * ---------------------------------------------------------------------
 * Same pattern as pitch-editor/state.js: every matchup file is a plain
 * (non-module) script attached in manifest.json, so they share one global
 * scope. Rather than leaning on that implicitly, each file wraps itself in
 * an IIFE and reads/writes an explicit `window.FXM` namespace -- this file
 * creates it and must load first. State lives in one place (`FXM.state`)
 * so every module sees the same live object.
 *
 * Note: `FXM.state` itself gets replaced wholesale below every time this
 * file runs (matches pitch-editor/state.js's own behavior). main.js relies
 * on that for a clean "state" reset across re-boots, but keeps its own
 * `FXM.observer`/`FXM.booted` flags directly on the FXM namespace (not in
 * `state`) so a re-boot can always find and tear down the previous
 * MutationObserver even if this file re-ran first -- see main.js.
 * ---------------------------------------------------------------------
 */
window.FXM = window.FXM || {};
(function (FXM) {
  'use strict';

  FXM.POS_ORDER = ['G', 'D', 'M', 'F'];
  // Kept in sync with matchup.css's own `@media (max-width: 760px)` breakpoint --
  // not read by CSS, just documents the number for anyone changing one side.
  FXM.NARROW_BREAKPOINT_PX = 760;

  FXM.state = {
    container: null, // outer .fxm-matchup wrapper
    bodyEl: null, // .fxm-body -- what the show/hide toggle controls
    toggleBtn: null,
    hidden: false, // in-memory only, per spec -- resets on page load/navigation
    renderScheduled: false,

    // hover breakdown tooltip (pitch + bench cards) -- same fixed-position
    // singleton-element pattern as pitch-editor/tooltip.js, own `fxm-` class.
    tooltipEl: null,
    hoveredName: null, // player name currently under the pointer, keyed the
    // same way window.FXC and parse.js's chip maps are (by name, not a
    // synthetic per-card key -- matchup cards have no such key today)
    lastMouseX: 0,
    lastMouseY: 0,
    // Card element the tooltip is anchored to when opened via touch (tap),
    // vs. the desktop mouse path which tracks the cursor via lastMouseX/Y
    // instead and never sets this. Set on tap-open, cleared on hide -- see
    // render.js's showTooltipForCard/hideTooltip, which register/unregister
    // this element with FXShared.trackAnchor (src/shared/touch-overlay.js)
    // to keep the tip stuck to it through scroll.
    tooltipTargetEl: null,

    // Identity (not a DOM node reference) of the tap-selected player, e.g.
    // { side: 'home', isBench: false, name: 'Erling Haaland' } -- same
    // side:isBench:name shape render.js's marqueeKey already keys cards by,
    // for consistency. render() tears down and rebuilds EVERY `.fxm-card`
    // node on every re-render (a `tooltipTargetEl` DOM reference alone goes
    // stale the instant that happens), and this page's live-score updates
    // trigger that MutationObserver-driven rebuild often -- sometimes well
    // under a second after a tap. Tracking identity instead of a node lets
    // render() re-locate the SAME player's freshly-built card after a
    // rebuild and re-apply the dim/tooltip there, so a live-score-driven
    // re-render doesn't read to the user as their selection reverting. Set
    // by setSelectedCard, cleared by clearSelectedCard -- see render.js.
    selectedIdentity: null,
  };

  FXM.qa = function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  };
})(window.FXM);
