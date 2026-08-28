/**
 * Prettier Fantrax -- shared: classify a player's game from its status text
 * ---------------------------------------------------------------------
 * ONE classifier for both pitches. The matchup pitch and the roster pitch
 * previously each hand-rolled their own live/finished/upcoming detection
 * against their own page's text format, and each copy had blind spots the
 * other didn't (the matchup copy missed halftime, the roster copy didn't
 * exist at all for a while) -- exactly the kind of drift this shared
 * module exists to end. Confirmed formats, all read live (2026-08-28):
 *
 *   matchup, upcoming:  "@FUL Mon 3:00 PM"          (kickoff time)
 *   matchup, live:      "MCI 1 @ CRY 0 26'"          (score + match clock)
 *   matchup, halftime:  "MCI 1 @ CRY 0 Halftime"     (score + word)
 *   matchup, finished:  "CRY 0 @ EVE 2 F"            (score + trailing F)
 *   roster,  upcoming:  "IPSSun 11:30AM"             (kickoff time)
 *   roster,  live:      "MCI 1@CRY 0"                (score, no marker)
 *   roster,  finished:  "BOU 1@MCI 2 F"              (score + trailing F)
 *
 * Rather than enumerating Fantrax's in-progress markers (26', Halftime,
 * and whatever stoppage/extra-time text exists that hasn't been observed
 * yet), the rule is subtractive: a game that shows a SCORE (any digit)
 * and is positively neither finished (trailing " F") nor upcoming (a
 * kickoff clock time) is in progress. Anything unrecognized returns
 * 'unknown', which callers treat like 'finished' -- trust the number
 * shown -- the same fail-safe bias the old per-feature copies had.
 * ---------------------------------------------------------------------
 */
window.FXShared = window.FXShared || {};
(function (FX) {
  'use strict';

  function classifyGame(gameText) {
    const t = (gameText || '').replace(/\s+/g, ' ').trim();
    if (!t) return 'unknown';
    if (/\sF$/.test(t)) return 'finished';
    if (/\d{1,2}:\d{2}\s*[AP]M/i.test(t)) return 'upcoming';
    if (/\d/.test(t)) return 'live';
    return 'unknown';
  }

  FX.classifyGame = classifyGame;

  // "Is this player actually ON the pitch?" during a live game, from a
  // Map(statAbbr -> valueText) of their recorded stats -- true only when
  // some stat is NONZERO. The zero-filter is the whole point, and is what
  // the roster pitch's first local version got wrong: under the roster
  // table's gameweek-scoped period a benched player's stat cells read
  // literal "0" (not "-"), so an any-entry check painted every benched
  // player as playing (green dot) -- while the matchup's chips (which
  // only ever exist for nonzero stats) got it right. One shared rule now:
  // a player on the pitch always has SOMETHING nonzero recorded -- GS 1
  // for a starter (confirmed live from kickoff), minutes for a
  // substitute -- and a player on the bench has all zeros.
  function hasOnPitchStats(statMap) {
    if (!statMap || !statMap.size) return false;
    for (const value of statMap.values()) {
      const n = parseFloat(value);
      if (!Number.isNaN(n) && n !== 0) return true;
    }
    return false;
  }

  FX.hasOnPitchStats = hasOnPitchStats;
})(window.FXShared);
