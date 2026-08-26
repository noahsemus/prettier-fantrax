/**
 * Prettier Fantrax -- shared: same-origin Fantrax API fetch helper
 * ---------------------------------------------------------------------
 * DELIBERATE SCOPE EXTENSION: this extension's whole premise (per the
 * project README) is "read Fantrax's rendered DOM and click Fantrax's own
 * real controls -- no API access." Two matchup features genuinely can't be
 * built that way, because the data they need is NOT anywhere in the
 * rendered DOM at all, confirmed live:
 *   - action-menu.js's "last 5 gameweeks" stat block (a player's own
 *     recent-games FPts log -- Fantrax renders this inside the player-card
 *     modal, itself already fetched from this same endpoint, but nothing
 *     about it is present in the matchup page's own markup).
 *   - render.js's team-header manager-username line (not present in
 *     `league-livescoring-table-header` at all -- confirmed by dumping
 *     both header elements in full; only present on the ROSTER page's own
 *     markup, per team, not here).
 * Both are same-origin POSTs to fantrax.com's own `/fxpa/req` endpoint --
 * the exact same request the Fantrax web app itself fires when a user
 * opens a player-card modal or a team's roster page. Nothing leaves
 * fantrax.com, no new auth/credentials are introduced (the browser attaches
 * this page's own session cookies automatically, same as any same-origin
 * fetch), and the request bodies below were reverse-engineered by watching
 * this exact page's own Network activity while performing the equivalent
 * actions a user would (opening a player-card modal / a team's roster
 * page) -- not guessed.
 * ---------------------------------------------------------------------
 */
window.FXShared = window.FXShared || {};
(function (FX) {
  'use strict';

  // Fantrax's own SPA always includes this envelope shape around one or
  // more `{ method, data }` messages -- confirmed live across every real
  // request the app itself made during this recon (login, getPlayerProfile,
  // getFantasyTeams, getTeamRosterInfo, getLiveScoringStats, ...). `uiv`/
  // `dt`/`at`/`v` are literal copies of the app's own real values (its
  // internal protocol/app version numbers, not tied to any specific user
  // action) -- the server doesn't appear to validate `v` strictly (this
  // module's own test requests succeeded with these hardcoded values), but
  // `refUrl`/`tz` are derived live since those genuinely vary per session.
  const UI_VERSION = 3;
  const DEVICE_TYPE = 2;
  const APP_TYPE = 0;
  const APP_VERSION = '185.4.7';

  function leagueIdFromUrl() {
    const m = location.pathname.match(/\/league\/([^/]+)\//);
    return m ? m[1] : null;
  }

  // `msgs` is an array of `{ method, data }` -- callers can batch more than
  // one call into a single request (e.g. one owner-username lookup per
  // team, in one round trip) exactly like Fantrax's own app does. Resolves
  // to the parsed `{ data, roles, responses: [...] }` envelope; throws on a
  // non-2xx response OR a malformed body so every caller's own `.catch`
  // handles both the same way.
  function fxpaRequest(msgs) {
    const leagueId = leagueIdFromUrl();
    const url = leagueId ? `/fxpa/req?leagueId=${encodeURIComponent(leagueId)}` : '/fxpa/req';
    const body = JSON.stringify({
      msgs,
      uiv: UI_VERSION,
      refUrl: location.href,
      dt: DEVICE_TYPE,
      at: APP_TYPE,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      v: APP_VERSION,
    });
    return fetch(url, {
      method: 'POST',
      // Same-origin by construction (a relative URL against fantrax.com);
      // 'same-origin' here is just belt-and-suspenders documentation of
      // that intent, not a behavior change from fetch's own default.
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body,
    }).then((res) => {
      if (!res.ok) throw new Error(`fxpa request failed: HTTP ${res.status}`);
      return res.json();
    });
  }

  FX.fxpaRequest = fxpaRequest;
  FX.fxpaLeagueId = leagueIdFromUrl;
})(window.FXShared);
