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

    // hover breakdown tooltip (pitch + bench cards, DESKTOP ONLY -- a touch
    // tap opens action-menu.js's menu instead, see render.js's
    // attachHoverTooltip) -- same fixed-position singleton-element pattern
    // as pitch-editor/tooltip.js, own `fxm-` class.
    tooltipEl: null,
    hoveredName: null, // player name currently under the pointer, keyed the
    // same way window.FXC and parse.js's chip maps are (by name, not a
    // synthetic per-card key -- matchup cards have no such key today)
    lastMouseX: 0,
    lastMouseY: 0,

    // Per-player action menu (action-menu.js) -- own singleton element,
    // mirroring pitch-editor's FXP.state.actionMenuEl. Opened by BOTH a
    // touch tap (with a read-only stats section prepended) and a desktop
    // click (buttons only, the hover tooltip above already covers stats
    // there) -- see render.js's attachHoverTooltip. Keyed 'fxm-menu' in
    // FXShared.trackAnchor, distinct from the tooltip's own 'fxm' key, so
    // the two scroll-trackers can never collide even though in practice
    // only one of {tooltip, menu} is ever open at a time.
    actionMenuEl: null,
    // Identity (not a DOM node reference) of the player the menu is
    // currently anchored to on a coarse-pointer (touch) open, e.g. { side:
    // 'home', isBench: false, name: 'Erling Haaland' } -- null on a
    // fine-pointer (desktop) open, which positions at fixed click
    // coordinates and doesn't need to survive a card rebuild. render()
    // tears down and rebuilds EVERY `.fxm-card` node on every re-render,
    // and matchup's own live-score updates trigger that MUCH more often
    // than roster's re-renders -- action-menu.js's reapplyActionMenu (called
    // from the end of render(), same spot the old tooltip's
    // reapplySelection used to be) uses this identity to re-locate the same
    // player's freshly-built card and re-anchor/re-dim the STILL-OPEN menu
    // there, instead of the menu/dim reverting to "nothing selected" within
    // a second of the tap that opened it (confirmed live -- reads to the
    // user as it "immediately fading back up"). Set by openActionMenu,
    // cleared by closeActionMenu -- see action-menu.js.
    actionMenuIdentity: null,

    // NOTE: the recent-performances cache, in-flight map and Fantrax
    // scorerId map used to live here. They moved to src/shared/last5.js's
    // own module scope when that feature became shared with the roster
    // pitch editor -- one fetch and one cache now serve both features,
    // which two per-feature state objects could not.

    // Team manager-username cache (render.js's renderTeamHeader), same
    // same-origin-fetch justification as recent performances (see
    // src/shared/fantrax-api.js) --
    // keyed by teamId (parse.js's parseHeader reads it off the header's own
    // team-name link href, `.../team/roster;teamId=<id>`) rather than team
    // name, since a team's roster page itself is keyed by id, not name.
    // ownerCache: Map<teamId, string> -- PRESENCE means "resolved" (an
    // empty string is a valid, if unlikely, resolution); absence means
    // "not fetched yet, or a prior attempt failed and can be retried."
    // Fetched for BOTH teams in the CURRENT matchup in one batched request
    // (render()'s ensureOwnersFetched) the first time either isn't cached
    // yet -- covers most of a session after the very first render, since
    // the same two teams' matchup is what's on screen the whole time.
    ownerCache: new Map(),
    // ownerInflight: Map<teamId, Promise> -- in-flight dedupe, same pattern
    // as last5Inflight above.
    ownerInflight: new Map(),

    // This matchup's two fantasy teamIds (parse.js's parseHeader ->
    // data.home/away.header.teamId), refreshed every render() -- kept here
    // so action-menu.js's buildLast5Section can pass the tapped card's own
    // team to FXShared.getLast5 without needing the full parsed `data` object
    // threaded all the way down to it. See last5.js's resolveScorerId for
    // why the team matters: it's the tiebreak scope for an abbreviated
    // ("S. Lammens") name match against scorerMap's own full names.
    homeTeamId: null,
    awayTeamId: null,
  };

  FXM.qa = function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  };
})(window.FXM);
