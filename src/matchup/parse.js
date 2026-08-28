/**
 * Prettier Fantrax -- Matchup Pitch: parse the livescoring matchup DOM
 * ---------------------------------------------------------------------
 * Reads the two `.scoring-table` elements Fantrax already renders inside
 * `league-livescoring-standard-table` ([0] = starters, [1] = reserves)
 * plus the two `league-livescoring-table-header` elements, and turns them
 * into plain { home, away } data for render.js. Every selector below was
 * confirmed live in the browser against the real matchup page -- don't
 * trust row/cell textContent instead, it runs together with no separator
 * (a player's fpts cell is "<dt>2<i>.5</i></dt><dd>2.5</dd>" across
 * sibling nodes, which textContent alone renders as ambiguous "2.5.5"-ish
 * soup once you're several levels up from it).
 * ---------------------------------------------------------------------
 */
(function (FXM) {
  'use strict';
  const qa = FXM.qa;

  // Every row (roster + matchup pages alike) paints its team crest as a CSS
  // background-image on `figure.scorer__image` -- some layouts have no
  // <img> at all. Same technique as pitch-editor/roster.js's
  // readCrestFromFigure; duplicated here (not imported/shared) because this
  // module must stand on its own -- script load order between the two
  // features isn't guaranteed.
  function readCrestFromFigure(fig) {
    if (!fig) return null;
    const bg = getComputedStyle(fig).backgroundImage;
    if (!bg || bg === 'none') return null;
    const m = bg.match(/^url\((['"]?)(.*)\1\)$/);
    return m ? m[2] : null;
  }

  // `.scoring-header__score-primary h2` is laid out as
  // "<mark>Gameweek</mark>54<i>.75</i>" (label + whole-number text node +
  // decimal in its own <i>) -- strip the label and collapse whitespace to
  // get back a plain "54.75". `.scoring-header__score-secondary` is a
  // plain "62.27" with no such split. `figure.scoring-header__logo` is the
  // team crest, painted as a CSS background-image exactly like a player's
  // `figure.scorer__image` -- same readCrestFromFigure helper, different
  // figure (see dot-tooltip-recon.md's "Team header logo" section).
  function parseHeader(headerEl) {
    if (!headerEl) return null;
    const nameA = headerEl.querySelector('.scoring-header__name a');
    const primaryH2 = headerEl.querySelector('.scoring-header__score-primary h2');
    const secondaryEl = headerEl.querySelector('.scoring-header__score-secondary');
    const logo = readCrestFromFigure(headerEl.querySelector('figure.scoring-header__logo'));
    const live = primaryH2
      ? primaryH2.textContent.replace(/Gameweek/i, '').replace(/\s+/g, '').trim()
      : '';
    const projected = secondaryEl ? secondaryEl.textContent.trim() : '';
    // The team-name link's own href is Fantrax's real
    // `/team/roster;teamId=<id>` URL -- confirmed live -- so this reads the
    // team's Fantrax id straight off the DOM rather than guessing it from
    // the (not-guaranteed-unique) team name. Used by render.js/fxpa.js's
    // same-origin manager-username fetch (see fxpa.js's header comment for
    // why that fetch exists at all); parse.js itself has no other use for
    // it, but this is the ONE place that ever reads this href, so it lives
    // here rather than being re-parsed elsewhere.
    const href = nameA ? nameA.getAttribute('href') : null;
    const teamIdMatch = href ? href.match(/teamId=([^;&]+)/) : null;
    return {
      name: nameA ? nameA.textContent.trim() : '',
      teamId: teamIdMatch ? teamIdMatch[1] : null,
      logo,
      live,
      projected,
    };
  }

  function parseHeaders() {
    const headers = qa('league-livescoring-table-header');
    if (headers.length < 2) return null;
    // DOM order is [home (no --away modifier), away] -- confirmed live.
    return [parseHeader(headers[0]), parseHeader(headers[1])];
  }

  // Each player cell's own stat chips (`ul > li`, abbr from the nested
  // `b`, value = the chip's remaining text) -- same technique content.js
  // uses per-row, scoped here to one side of the row so a matchup row's two
  // players (home cell + away cell) never mix chips. This is the CURRENT
  // view's value (raw count or fpts, whichever mode's pill is active right
  // now) -- render.js's tooltip fallback path uses it verbatim when
  // window.FXC doesn't have a merged (raw + fpts) reading for this player.
  function parseChips(cell) {
    const chips = new Map();
    qa('ul > li', cell).forEach((li) => {
      const b = li.querySelector('b');
      if (!b) return;
      const abbr = b.textContent.trim();
      if (!abbr) return;
      const value = li.textContent.replace(abbr, '').trim();
      chips.set(abbr, value);
    });
    return chips;
  }

  // cells[0] = my player, cells[1] = center gutter (position letter or
  // "Res"), cells[2] = opponent. A row can have an empty side (that team
  // had no player in this slot) -- parseSide returns null and callers just
  // skip pushing anything for that side, so the rendered line ends up with
  // fewer cards on the side that was empty.
  // `dl.scoring-table__cell__fpts dd` holds TWO different kinds of number
  // depending on whether the player's game has started: once it has, it's
  // their actual (possibly zero) score; before it has, Fantrax shows their
  // projection there instead -- same-looking text, different meaning. The
  // reliable way to tell them apart is the opponent/game text in
  // `.scoring-table__cell__content ul a`: a finished game reads like
  // "CRY 0  @ EVE 2 F" (trailing "F"), an upcoming one shows a scheduled
  // time like "@FUL Mon 3:00 PM" instead of a final score. render.js uses
  // this (see gameState) to keep an unplayed player's card from showing
  // their projection as if it were an earned score.
  function parseSide(cell) {
    if (!cell) return null;
    const nameA = cell.querySelector('.scorer__info__name a');
    if (!nameA) return null;
    const posSpans = qa('.scorer__info__positions span', cell);
    const pos = posSpans[0] ? posSpans[0].textContent.trim() : null;
    const fig = cell.querySelector('figure.scorer__image');
    const crest = readCrestFromFigure(fig);
    const ptsEl = cell.querySelector('dl.scoring-table__cell__fpts dd');
    const points = ptsEl ? ptsEl.textContent.trim() : '';
    const chips = parseChips(cell);
    const gameA = cell.querySelector('.scoring-table__cell__content ul a');
    const gameText = gameA ? gameA.textContent.replace(/\s+/g, ' ').trim() : '';
    const eventStatus = readEventStatus(cell);
    return { name: nameA.textContent.trim(), pos, crest, points, chips, gameText, eventStatus };
  }

  // Fantrax's own real-life "is this player playing" indicator (a colored
  // dot next to their name), read the exact same way
  // pitch-editor/roster.js's readEventStatus does -- see EVENT_STATUS_MAP
  // there. Duplicated (not imported) for the same stand-alone-module reason
  // as readCrestFromFigure above: this module must work regardless of
  // script load order between the pitch-editor and matchup features. Only
  // present pre-kickoff; there's nothing to show once a player's game has
  // started or finished, which is exactly why render.js shows no dot at
  // all when this comes back null.
  const EVENT_STATUS_MAP = {
    'scorer-icon--IN_UPCOMING_EVENT': 'starting',
    'scorer-icon--IN_UPCOMING_EVENT_EXPECTED': 'expected',
    'scorer-icon--BENCH_UPCOMING_EVENT': 'bench',
    'scorer-icon--NOT_IN_UPCOMING_EVENT': 'out',
  };

  function readEventStatus(cell) {
    for (const icon of qa('.scorer-icon', cell)) {
      for (const cls of icon.classList) {
        if (EVENT_STATUS_MAP[cls]) return EVENT_STATUS_MAP[cls];
      }
    }
    return null;
  }

  function parseRow(row) {
    const cells = qa(':scope > .scoring-table__cell', row);
    if (cells.length !== 3) return null; // section header ("GOALKEEPER"/"OUTFIELDER") or spacer row
    const midCell = cells[1];
    const posLabel = midCell ? midCell.textContent.trim() : '';
    return { posLabel, left: parseSide(cells[0]), right: parseSide(cells[2]) };
  }

  // Which starters bucket a side belongs in. The center gutter's label is
  // used when it's a plain G/D/M/F -- but it is NOT required to be:
  // parseRow used to reject any row whose gutter label wasn't exactly
  // G/D/M/F/Res, and a real Android user's league (reported 2026-08-28)
  // rendered gutter labels that matched none of those, so their ENTIRE
  // starting lineup was dropped -- team headers and bench strips rendered
  // (parseHeaders and the reserves table were fine) around a completely
  // empty field, which is exactly the reported symptom. Starters vs
  // reserves doesn't actually need the label at all (the page's two
  // .scoring-table elements already split them -- see parseMatchup), so an
  // unrecognized label now falls back to the PLAYER'S OWN first listed
  // position (parseSide's posSpans read, e.g. "D" from a "D,M" player)
  // instead of throwing the row away. Footer rows ("Total") still drop
  // out naturally: they have no player-name link, so parseSide returns
  // null for both sides.
  function starterBucket(posLabel, side) {
    if (POS_BUCKETS[posLabel]) return posLabel;
    const own = side && side.pos ? side.pos.trim().charAt(0).toUpperCase() : '';
    return POS_BUCKETS[own] ? own : null;
  }

  const POS_BUCKETS = { G: true, D: true, M: true, F: true };

  function emptyPosBuckets() {
    return { G: [], D: [], M: [], F: [] };
  }

  function parseMatchup() {
    // Absent on the mobile matchup LIST view (before a matchup is picked)
    // and on the Teams/Scores tabs -- nothing to render there.
    const stdTable = document.querySelector('league-livescoring-standard-table');
    if (!stdTable) return null;
    const tables = qa('.scoring-table', stdTable);
    if (tables.length < 2) return null;
    const headers = parseHeaders();
    if (!headers) return null;

    const home = { header: headers[0], starters: emptyPosBuckets(), reserves: [] };
    const away = { header: headers[1], starters: emptyPosBuckets(), reserves: [] };

    // Starters vs reserves comes from WHICH TABLE a row lives in
    // ([0] = starters, [1] = reserves -- see parseMatchup's own header
    // comment), not from the gutter label; see starterBucket above for
    // why the label is only a hint. The 'Res' guard on the starters table
    // stays as belt-and-suspenders against a layout that ever mixes them.
    qa('.scoring-table__row', tables[0]).forEach((row) => {
      const parsed = parseRow(row);
      if (!parsed || parsed.posLabel === 'Res') return;
      const leftBucket = starterBucket(parsed.posLabel, parsed.left);
      const rightBucket = starterBucket(parsed.posLabel, parsed.right);
      if (parsed.left && leftBucket) home.starters[leftBucket].push(parsed.left);
      if (parsed.right && rightBucket) away.starters[rightBucket].push(parsed.right);
    });

    qa('.scoring-table__row', tables[1]).forEach((row) => {
      const parsed = parseRow(row);
      if (!parsed) return;
      if (parsed.left) home.reserves.push(parsed.left);
      if (parsed.right) away.reserves.push(parsed.right);
    });

    // Diagnostic for the next unrecognized-layout report: if the starters
    // table visibly has players but nothing landed in any bucket, log the
    // actual gutter labels once so a user's console screenshot tells us
    // exactly what their league renders (this is what the 2026-08-28
    // Android report was missing).
    const starterCount = FXM.POS_ORDER.reduce(
      (n, pos) => n + home.starters[pos].length + away.starters[pos].length,
      0
    );
    if (starterCount === 0) {
      const labels = Array.from(
        new Set(
          qa('.scoring-table__row', tables[0]).map((row) => {
            const cells = qa(':scope > .scoring-table__cell', row);
            return cells.length === 3 && cells[1] ? cells[1].textContent.trim() : '';
          })
        )
      ).filter(Boolean);
      if (labels.length) console.warn('[fx-matchup] no starters parsed; gutter labels were:', labels);
    }

    return { home, away };
  }

  FXM.readCrestFromFigure = readCrestFromFigure;
  FXM.parseMatchup = parseMatchup;
})(window.FXM);
