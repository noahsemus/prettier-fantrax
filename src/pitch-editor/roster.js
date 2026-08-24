/**
 * Prettier Fantrax -- Pitch Editor: read the real roster list
 * ---------------------------------------------------------------------
 * The pitch/bench view is never a separate source of truth -- it's built
 * fresh from Fantrax's own `.i-table__row` list every render, using that
 * list's own real controls (buttons, links) for every action. This file
 * is the only place that parses those rows into plain player objects.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const qa = FXP.qa;

  function getListRows() {
    return qa('.i-table__row').filter((r) => r.querySelector('button.lineup-btn'));
  }

  // Fantrax's own real-life "is this player playing" indicator (a colored
  // dot next to their name in the list) -- reused here instead of inventing
  // our own. Only present pre-kickoff; there's nothing to show once a
  // player's game has started.
  const EVENT_STATUS_MAP = {
    'scorer-icon--IN_UPCOMING_EVENT': 'starting',
    'scorer-icon--IN_UPCOMING_EVENT_EXPECTED': 'expected',
    'scorer-icon--BENCH_UPCOMING_EVENT': 'bench',
    'scorer-icon--NOT_IN_UPCOMING_EVENT': 'out',
  };

  // Wording for 'starting'/'bench' is Fantrax's OWN tooltip text, read live
  // off their real mat-tooltip elements (not guessed, not our own hedged
  // paraphrase) -- see the recon doc for the exact technique and readings.
  // Notably neither hedges with "expected"/"confirmed" the way our old
  // copy did (e.g. old bench label was literally "Expected to be on the
  // bench" -- that "Expected" was our invention, not Fantrax's, and was
  // the user's exact complaint). 'expected'/'out' have no live-confirmed
  // example (no player with either class was found on any roster/matchup/
  // gameweek reachable this session) -- kept as best-effort, deliberately
  // non-hedged wording justified from the class name alone rather than
  // silently inventing hedged language; update these two for real the
  // moment a live example turns up.
  const EVENT_STATUS_LABEL = {
    starting: 'Starting in upcoming/current game', // live-confirmed
    expected: 'Likely to play', // best-effort, unconfirmed
    bench: 'On the bench, potential substitute', // live-confirmed
    out: 'Not in the squad for this game', // best-effort, unconfirmed
  };

  function readEventStatus(row) {
    for (const icon of qa('.scorer-icon', row)) {
      for (const cls of icon.classList) {
        if (EVENT_STATUS_MAP[cls]) return EVENT_STATUS_MAP[cls];
      }
    }
    return null;
  }

  // On Fantrax's mobile roster layout there's no `<img>` jersey/crest at all
  // (the desktop-only pitch widget these rows would otherwise borrow from
  // doesn't exist there), but every row -- mobile and desktop, roster and
  // matchup alike -- has a `figure.scorer__image` whose crest is painted as a
  // CSS background-image. Fall back to reading that when there's no `<img>`.
  function readCrestFromFigure(row) {
    const fig = row.querySelector('figure.scorer__image');
    if (!fig) return null;
    const bg = getComputedStyle(fig).backgroundImage;
    if (!bg || bg === 'none') return null;
    const m = bg.match(/^url\((['"]?)(.*)\1\)$/);
    return m ? m[2] : null;
  }

  function findRowByName(name) {
    return getListRows().find((r) => {
      const a = r.querySelector('.scorer__info__name a');
      return a && a.textContent.trim() === name;
    });
  }

  function parseRoster() {
    const rows = getListRows();
    const emptyCounters = {};
    return rows.map((row) => {
      const btn = row.querySelector('button.lineup-btn');
      const pos = btn.textContent.trim();
      const nameA = row.querySelector('.scorer__info__name a');
      const name = nameA ? nameA.textContent.trim() : null;
      const isReserve = row.classList.contains('row--amber');
      const cells = qa(':scope > .i-table__cell', row);
      const oppText = cells[2] ? cells[2].textContent.replace(/\s+/g, ' ').trim() : '';
      const fptsText = cells[3] ? cells[3].textContent.replace(/\s+/g, ' ').trim() : '';
      const img = row.querySelector('img');
      const crest = img ? img.src : readCrestFromFigure(row);
      const isEmpty = !name;
      let emptyIndex = null;
      if (isEmpty) {
        const bucket = pos + '|' + isReserve;
        emptyCounters[bucket] = (emptyCounters[bucket] || 0) + 1;
        emptyIndex = emptyCounters[bucket] - 1;
      }
      // Locked = no upcoming kickoff time visible for this player, meaning
      // their game has already started or finished. Conservative on purpose.
      // (Matches "11:30AM" / "3:00 PM" etc. -- a plain /\b(AM|PM)\b/ misses
      // these because there's no word boundary between a digit and a letter.)
      const locked = isEmpty ? false : !/\d{1,2}:\d{2}\s*(am|pm)/i.test(oppText);
      return {
        key: isEmpty ? `empty-${pos}-${isReserve}-${emptyIndex}` : name,
        name,
        pos,
        isReserve,
        isEmpty,
        emptyIndex,
        oppText,
        fptsText,
        crest,
        locked,
        eventStatus: isEmpty ? null : readEventStatus(row),
      };
    });
  }

  FXP.getListRows = getListRows;
  FXP.findRowByName = findRowByName;
  FXP.parseRoster = parseRoster;
  FXP.readEventStatus = readEventStatus;
  FXP.EVENT_STATUS_LABEL = EVENT_STATUS_LABEL;
})(window.FXP);
