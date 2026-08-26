/**
 * Prettier Fantrax -- Matchup Pitch: recent-performances FPts (same-origin fetch)
 * ---------------------------------------------------------------------
 * Feeds action-menu.js's "Recent performances" block -- see fxpa.js's
 * header comment for why this needs a same-origin fetch at all (this data
 * is nowhere in the matchup page's own DOM).
 *
 * Two-step lookup, both confirmed live against the real endpoint:
 *   1. Fantrax's own real "recent games" log is served per-player by
 *      `getPlayerProfile`, keyed by an internal player id (their own
 *      `scorerId`) -- NOT by name, and that id is nowhere in the matchup
 *      page's rendered DOM either (checked every attribute on a player's
 *      row -- nothing). It DOES show up in `getLiveScoringStats`'s own
 *      `scorerMap` (the exact data this whole livescoring page's Angular
 *      app is built from) alongside each player's FULL name, so that's
 *      fetched once (ensureScorerIdMap) to build a lookup covering every
 *      player in the league, not just this matchup's two teams.
 *   2. getPlayerProfile(scorerId) returns several stat tables under
 *      sectionContent.OVERVIEW.tables; the one we want is picked by its
 *      HEADER KEYS (`date` + `fpts` both present), not by caption text --
 *      Fantrax's response also has a superficially similar "Recent Trends"
 *      table (7/14/30-day rolling aggregates, own `dateRange`+`fpts` keys)
 *      that a caption-only or fpts-only check would wrongly match instead.
 *      The same table also carries an `opponent` column (e.g. "@NEW" for
 *      an away game, "HUL" for a home one) -- read alongside date/fpts so
 *      action-menu.js can show who each performance was against.
 *
 * BUG FOUND AND FIXED (live user report + empirical diagnosis, 2026-08-26):
 * the section only ever appeared for a handful of players. Instrumented
 * every player in a real matchup (32 players, both sides, starters +
 * bench) and categorized every failure -- ALL 28 failures were
 * "name-miss" (zero scorerId found); zero were missing tables, empty
 * rows, or fetch errors. Root cause: matchup cards render an ABBREVIATED
 * name ("S. Lammens", "M. Sangaré", "K. Lewis-Potter"), but scorerMap
 * stores each player's FULL name ("Senne Lammens", "Mamadou Sangaré",
 * "Keane Lewis-Potter") -- an exact-string lookup only ever matched the
 * minority of players whose matchup-card name HAPPENS to already be their
 * full name (Alisson Becker, Matheus Cunha, Mateus Fernandes, Estevao --
 * all 4 of the diagnostic's successes, and no others). Fixed by
 * resolveScorerId below: exact match first (covers those un-abbreviated
 * names), then an initial+surname match against the SAME fantasy team's
 * own roster first (scorerMap's own teamId groups an entry under whichever
 * fantasy team currently owns that real player -- the matchup already
 * knows which of its two teams a given card belongs to), falling back to
 * a league-wide search only if the team-scoped search finds nothing, and
 * refusing to resolve at all if more than one candidate remains at either
 * step -- never guesses between two same-surname/initial players.
 *
 * Ordering: "Recent Games" rows read newest-first (confirmed against a
 * real multi-row response during this same diagnosis, e.g. Alisson
 * Becker's own log listed his one 2026-27 game before older 2025-26 ones
 * once more than one row existed for other players checked).
 * ---------------------------------------------------------------------
 */
window.FXShared = window.FXShared || {};
(function (FX) {
  'use strict';
  // Session caches live HERE rather than in either feature's own state
  // object: this module is shared by the matchup pitch and the roster
  // pitch editor, which have separate namespaces (FXM/FXP) but one set of
  // caches. What that definitely shares is `scorerIdMap` -- the expensive
  // league-wide name->scorerId lookup, now fetched ONCE per page load no
  // matter which feature asks first, instead of once per feature.
  // Per-player rows are keyed by `teamId|name` (see cacheKey), so the two
  // features share an entry only when they agree on the teamId: they do
  // when the roster URL carries one, and don't for Fantrax's default
  // "your own roster" URL, which has no teamId and caches under null. The
  // cost of that miss is one extra profile fetch for that player, not a
  // wrong answer, so it isn't worth weakening the composite key (which is
  // what keeps two same-named players on opposite sides of a matchup from
  // sharing a slot). Note also that a full page load -- not Fantrax's own
  // in-app navigation -- resets all of this, as any module state would.
  // Semantics
  // are unchanged from when these lived on FXM.state: PRESENCE in
  // last5Cache means resolved (an empty array is a valid cached "no games
  // on record"), failures are never cached so the next tap retries, and
  // last5Inflight holds at most one live fetch per key.
  const state = {
    last5Cache: new Map(),
    last5Inflight: new Map(),
    scorerIdMap: null,
    scorerIdMapPromise: null,
  };

  // ---------- name normalization + abbreviated-name matching ----------
  // Strips accents/diacritics (Sangaré -> sangare, Gyökeres -> gyokeres)
  // and punctuation/case so "M. Sangaré" and "Mamadou Sangaré" compare
  // equal on their shared surname even if one side's rendering ever drops
  // an accent the other keeps -- confirmed live that THIS league's data
  // actually preserves accents consistently on both sides, but normalizing
  // anyway costs nothing and removes an entire class of future mismatch.
  function normalizeName(s) {
    return (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Matchup cards render a player's Fantrax "short name", which is either
  // their full name verbatim (Alisson Becker, Matheus Cunha -- no
  // abbreviation happened, exact match handles these) or "F. Surname"
  // (first-initial + surname, e.g. "S. Lammens", "M. Lewis-Skelly").
  // Surname is taken verbatim (can itself be multi-word/hyphenated: "De
  // Cuyper", "Lewis-Skelly") -- everything after the leading "F." token.
  function parseAbbreviatedName(name) {
    const m = /^([A-Za-z])\.?\s+(.+)$/.exec((name || '').trim());
    if (!m) return null;
    return { initial: m[1], surname: m[2] };
  }

  // `fullName` is a scorerMap entry's own full name (e.g. "Keane
  // Lewis-Potter") -- its first whitespace-separated token is always the
  // first name, everything after is the surname (itself possibly
  // multi-word, e.g. "Maxim De Cuyper" -> surname "De Cuyper"). Comparing
  // the WHOLE surname for equality (not a substring/prefix check) is what
  // keeps "M. Lewis-Skelly" from ever matching "Lewis Hall" -- Hall's own
  // surname is just "Hall", not "Lewis" anything, so it's never a
  // candidate in the first place, even though a naive substring search
  // over raw names would wrongly surface it (confirmed during diagnosis).
  function matchesAbbreviated(fullName, initial, surname) {
    const parts = (fullName || '').trim().split(/\s+/);
    if (parts.length < 2) return false;
    const entryFirst = parts[0];
    const entrySurname = parts.slice(1).join(' ');
    return normalizeName(entrySurname) === normalizeName(surname) && normalizeName(entryFirst).charAt(0) === normalizeName(initial).charAt(0);
  }

  // ---------- scorerId lookup (fetched at most once per session) ----------
  // Built as three views over the same entries so resolveScorerId can go
  // exact -> team-scoped-abbreviated -> league-wide-abbreviated without
  // re-deriving any of them per call:
  //   exactByName: normalized full name -> scorerId (handles un-abbreviated
  //     matchup names verbatim).
  //   byTeam: fantasy teamId -> [{name, scorerId}] (scorerMap's OWN
  //     grouping -- whichever fantasy team currently owns that real player,
  //     not the real player's own football club) -- the tiebreak scope.
  //   all: every {name, scorerId}, for the whole-league fallback.
  function ensureScorerIdMap() {
    if (state.scorerIdMap) return Promise.resolve(state.scorerIdMap);
    if (state.scorerIdMapPromise) return state.scorerIdMapPromise;

    state.scorerIdMapPromise = FX.fxpaRequest([
      { method: 'getLiveScoringStats', data: { sppId: '-1', mobileMatchupView: true, newView: true } },
    ])
      .then((json) => {
        const exactByName = new Map();
        const byTeam = new Map();
        const all = [];
        const data = json && json.responses && json.responses[0] && json.responses[0].data;
        const scorerMap = data && data.scorerMap; // { BENCH: {teamId: {posGroupId: [...]}}, ACTIVE: {...} }
        if (scorerMap) {
          ['BENCH', 'ACTIVE'].forEach((bucket) => {
            const perTeam = scorerMap[bucket];
            if (!perTeam) return;
            Object.keys(perTeam).forEach((teamId) => {
              const perPosGroup = perTeam[teamId];
              Object.keys(perPosGroup || {}).forEach((posGroup) => {
                (perPosGroup[posGroup] || []).forEach((entry) => {
                  const scorer = entry && entry.scorer;
                  if (!scorer || !scorer.name || !scorer.scorerId) return;
                  const record = { name: scorer.name, scorerId: scorer.scorerId };
                  exactByName.set(normalizeName(scorer.name), scorer.scorerId);
                  if (!byTeam.has(teamId)) byTeam.set(teamId, []);
                  byTeam.get(teamId).push(record);
                  all.push(record);
                });
              });
            });
          });
        }
        const map = { exactByName, byTeam, all };
        state.scorerIdMap = map;
        return map;
      })
      .catch((err) => {
        console.warn('[fx-last5] failed to load scorer id map', err);
        // Reset (not left set to the rejected promise) so the NEXT lookup
        // retries instead of failing forever for the rest of the session.
        state.scorerIdMapPromise = null;
        throw err;
      });
    return state.scorerIdMapPromise;
  }

  // `teamId` is the FANTASY team (scorerMap's own grouping) the tapped
  // card's side belongs to -- render.js threads this through from
  // parse.js's parseHeader (data.home/away.header.teamId), NOT the real
  // player's real-life football club. Resolution order: exact name match
  // anywhere in the league; else an abbreviated initial+surname match
  // scoped to THIS team's own roster first (small enough that a
  // surname+initial collision within one team is rare, and this is the
  // team we already know the card belongs to); else the same abbreviated
  // match across the WHOLE league, but ONLY if that yields exactly one
  // candidate. Ambiguous at any step -> null, never a guess (the
  // scorerMap is league-wide, so a genuine surname+initial collision
  // across different teams is real, e.g. two different "J. Smith"s).
  function resolveScorerId(map, cardName, teamId) {
    const exact = map.exactByName.get(normalizeName(cardName));
    if (exact) return exact;

    const parsed = parseAbbreviatedName(cardName);
    if (!parsed) return null;

    const scoped = (teamId && map.byTeam.get(teamId)) || [];
    const scopedMatches = scoped.filter((e) => matchesAbbreviated(e.name, parsed.initial, parsed.surname));
    if (scopedMatches.length === 1) return scopedMatches[0].scorerId;
    if (scopedMatches.length > 1) return null; // ambiguous even within the known team -- refuse

    const allMatches = map.all.filter((e) => matchesAbbreviated(e.name, parsed.initial, parsed.surname));
    if (allMatches.length === 1) return allMatches[0].scorerId;
    return null; // 0 or >1 whole-league candidates -- refuse rather than guess
  }

  // ---------- getPlayerProfile -> "Recent Games" rows ----------
  // Picked by header KEYS, not caption text -- see this file's header
  // comment for why ('Recent Trends' has a near-identical shape with a
  // `dateRange` key instead of `date`). Also reads the `opponent` column
  // (e.g. "@NEW" away, "HUL" home) alongside date/fpts, for
  // action-menu.js's per-row opponent abbreviation.
  // Fantrax RATE-LIMITS rapid profile views, and does it with an HTTP 200:
  // the response body carries `pageError` ("You're viewing player profiles
  // too quickly. Please slow down and try again shortly.") and no `data` at
  // all. That shape used to fall straight through extractRecentGames's
  // `if (!tables) return []` and be cached by getLast5 as a legitimate
  // "this player has no games on record" -- so any player tapped during a
  // burst stayed permanently blank for the rest of the session, even on
  // re-tap. Confirmed live against this league: tapping through one
  // matchup's 32 players trips it partway down the list, which is exactly
  // the "some players are missing recent performances" the user saw.
  // Recognized here so it becomes a THROWN failure instead: getLast5 never
  // caches those, so the next tap retries. queueProfileRequest below also
  // paces our own requests so we mostly don't trip it to begin with.
  function rateLimitMessage(json) {
    const r0 = json && json.responses && json.responses[0];
    const pageError = (r0 && r0.pageError) || (json && json.pageError);
    if (!pageError) return null;
    return pageError.text || 'Fantrax rejected the request';
  }

  function extractRecentGames(json) {
    const rateLimited = rateLimitMessage(json);
    if (rateLimited) throw new Error(rateLimited);
    const data = json && json.responses && json.responses[0] && json.responses[0].data;
    const tables = data && data.sectionContent && data.sectionContent.OVERVIEW && data.sectionContent.OVERVIEW.tables;
    if (!tables) return [];
    const table = tables.find((t) => {
      const keys = ((t.header && t.header.cells) || []).map((c) => c.key);
      return keys.indexOf('date') !== -1 && keys.indexOf('fpts') !== -1;
    });
    if (!table) return [];
    const keys = table.header.cells.map((c) => c.key);
    const dateIdx = keys.indexOf('date');
    const fptsIdx = keys.indexOf('fpts');
    const oppIdx = keys.indexOf('opponent');
    return (table.rows || []).map((row) => ({
      date: (row.cells[dateIdx] && row.cells[dateIdx].content) || '',
      fpts: (row.cells[fptsIdx] && row.cells[fptsIdx].content) || '',
      opponent: (oppIdx !== -1 && row.cells[oppIdx] && row.cells[oppIdx].content) || '',
    }));
  }

  // ---------- public: getLast5(name, teamId) -> Promise<Array<{date,fpts,opponent}>> ----------
  // Cached per (player, team) for the session -- state.last5Cache/
  // last5Inflight, composite-keyed so the rare case of two same-named
  // players on opposite sides of the SAME matchup can never share a cache
  // entry. One in-flight fetch per key max -- see state.js's own comment
  // on both maps for exactly what "cached"/"in-flight" mean here and why
  // failures are deliberately NOT cached (allows retry on the next tap
  // instead of permanently blanking a player for a transient network
  // blip). `null` result means "couldn't resolve or fetch" -- distinct
  // from a resolved-but-empty array (player genuinely has no games on
  // record yet); action-menu.js treats both as "nothing to show".
  function cacheKey(name, teamId) {
    return `${teamId || ''}|${name}`;
  }

  // ---------- paced + retrying getPlayerProfile ----------
  // Every profile request in the session goes through ONE serialized chain
  // with a minimum gap between requests. Rationale: the rate limiter above
  // is trivially tripped by a user tapping quickly through a matchup (each
  // distinct player is one profile request), and once tripped it costs a
  // whole player's data. Pacing costs nothing perceptible -- results are
  // cached per player for the session, so this only ever throttles the
  // FIRST view of each player, and a single tap never waits on anything
  // but its own request.
  //
  // If we trip the limiter anyway (another tab, or Fantrax's own window
  // being shorter than ours), retry with a widening backoff rather than
  // giving up: the failure is explicitly transient and the alternative is
  // a blank section the user has to notice and re-tap to clear.
  const MIN_PROFILE_GAP_MS = 700;
  // Three widening steps rather than two: measured against the live
  // endpoint, a deliberately abusive burst (all 32 players of a matchup
  // back to back, far beyond real tapping) tripped the limiter six times
  // and two players still exhausted a two-step backoff. The third step
  // costs nothing in normal use -- it only ever runs after a request has
  // already come back rate-limited.
  const RETRY_DELAYS_MS = [1200, 2500, 5000];
  let profileChain = Promise.resolve();
  let lastProfileAt = 0;

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function fetchProfile(scorerId) {
    return FX.fxpaRequest([{ method: 'getPlayerProfile', data: { playerId: scorerId } }]);
  }

  // Runs `attempt` after the pacing gap, retrying only rate-limit failures
  // (a genuine network error fails fast -- retrying it just delays the
  // section disappearing). Resolves with the raw JSON envelope; the caller
  // still runs extractRecentGames, which throws if the LAST attempt was
  // rate-limited too.
  function queueProfileRequest(scorerId) {
    const run = profileChain.then(async () => {
      for (let i = 0; i <= RETRY_DELAYS_MS.length; i += 1) {
        await delay(Math.max(0, MIN_PROFILE_GAP_MS - (Date.now() - lastProfileAt)));
        lastProfileAt = Date.now();
        const json = await fetchProfile(scorerId);
        if (!rateLimitMessage(json)) return json;
        if (i === RETRY_DELAYS_MS.length) return json; // out of retries -- let extractRecentGames throw
        await delay(RETRY_DELAYS_MS[i]);
      }
      return null;
    });
    // The shared chain must survive an individual failure, or one rejected
    // request would poison every later player's turn in the queue.
    profileChain = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  }

  function getLast5(name, teamId) {
    const key = cacheKey(name, teamId);
    if (state.last5Cache.has(key)) return Promise.resolve(state.last5Cache.get(key));
    if (state.last5Inflight.has(key)) return state.last5Inflight.get(key);

    const promise = ensureScorerIdMap()
      .then((map) => {
        const scorerId = resolveScorerId(map, name, teamId);
        if (!scorerId) {
          console.warn('[fx-last5] could not resolve a unique scorerId for player', name, 'team', teamId);
          return [];
        }
        return queueProfileRequest(scorerId).then(extractRecentGames);
      })
      .then((rows) => {
        const last5 = rows.slice(0, 5);
        state.last5Cache.set(key, last5);
        state.last5Inflight.delete(key);
        return last5;
      })
      .catch((err) => {
        console.warn('[fx-last5] failed to fetch recent performances for', name, err);
        state.last5Inflight.delete(key);
        return null; // caller treats null as "couldn't load" -- section just doesn't appear
      });

    state.last5Inflight.set(key, promise);
    return promise;
  }

  FX.getLast5 = getLast5;
  // Synchronous cache peek: returns cached rows (possibly an empty array),
  // or `undefined` when this player has never been fetched. Both features'
  // action menus use it to choose between rendering immediately and
  // showing a "loading…" placeholder; they previously reached into
  // FXM.state.last5Cache directly, which a shared module can't offer.
  function peekLast5(name, teamId) {
    return state.last5Cache.get(cacheKey(name, teamId));
  }
  FX.peekLast5 = peekLast5;
  // Exported so action-menu.js's buildLast5Section can check
  // state.last5Cache synchronously with the EXACT same key format this
  // file uses internally, rather than re-deriving (and risking drift from)
  // the `teamId|name` join elsewhere.
  FX.last5CacheKey = cacheKey;
})(window.FXShared);
