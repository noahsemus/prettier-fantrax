/**
 * Prettier Fantrax -- Pitch Editor: shared state + tiny DOM utils
 * ---------------------------------------------------------------------
 * Every pitch-editor file is a plain (non-module) script attached in
 * manifest.json, so they share one global scope. Rather than leaning on
 * that implicitly, each file wraps itself in an IIFE and reads/writes an
 * explicit `window.FXP` namespace -- this file creates it and must load
 * first. State lives in one place (`FXP.state`) so every module sees the
 * same live object.
 * ---------------------------------------------------------------------
 */
window.FXP = window.FXP || {};
(function (FXP) {
  'use strict';

  FXP.POS_ORDER = ['G', 'D', 'M', 'F'];
  FXP.POINTS_SYNC_THROTTLE_MS = 60000; // don't re-scrape the breakdown/projection tables more than every 60s
  FXP.PROJECTED_OPTION_TEXT = 'Projected - Per Game';

  FXP.state = {
    container: null,
    statusEl: null,
    armed: null, // { key, player }
    busy: false,
    tabActive: true, // pitch editor is the default sub-tab
    tabBtn: null,

    // last render's data, kept around so drag/arm interactions can look up
    // "is this other card a legal target" without re-scraping the page
    players: [],
    cardsByKey: new Map(), // player key -> rendered .fx-card element
    dragSource: null, // player currently mid native-drag (null otherwise)

    actionMenuEl: null,

    // hover: how a player got their points (or their projection, if unplayed)
    breakdownCache: new Map(), // name -> { lines: [{abbr, label, text}] }
    projectedCache: new Map(), // name -> projected FPts text for this gameweek
    pointsCacheAt: 0,
    pointsCacheGwKey: null,
    pointsSyncInFlight: false,
    // gwKey (see points-sync.js's getGameweekNumber) that the most recent
    // points-sync attempt has already RUN FOR, success or failure -- set in
    // that file's syncPointsData(), always, no matter how the attempt ends.
    // render.js shows a loading overlay instead of the field/bench whenever
    // the CURRENT gwKey has neither a committed cache (pointsCacheGwKey)
    // nor a finished attempt (this field) yet -- i.e. only for the very
    // first sync since page load or a gameweek switch, and bounded to at
    // most one attempt's duration so a sync that never succeeds can't leave
    // the overlay stuck showing forever.
    pointsSyncAttemptedGwKey: undefined,
    tooltipEl: null,
    hoveredKey: null,
    lastMouseX: 0,
    lastMouseY: 0,
  };

  FXP.qa = function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  };

  FXP.delay = function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  FXP.overlayChildCount = function overlayChildCount() {
    const oc = document.querySelector('.cdk-overlay-container');
    return oc ? oc.children.length : 0;
  };
})(window.FXP);
