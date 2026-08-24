/**
 * Fantrax Refinements -- Matchup Pitch: shared state + tiny DOM utils
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
  };

  FXM.qa = function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  };
})(window.FXM);
