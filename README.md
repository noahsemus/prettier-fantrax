# Fantrax Refinements (Chrome extension)

Two small tweaks for `fantrax.com`, built for the Live Scoring page:

1. **Simple-view stat tooltips.** Hovering a stat abbreviation (KP, INT,
   TkW, ...) under a player in Simple/Standard view now shows a tooltip
   naming the stat, the same wording Fantrax already shows on Classic
   view's column headers.
2. **Fpts as the permanent default.** The Stats/Fpts mode toggle is kept
   on Fpts automatically (on load, and whenever Fantrax would otherwise
   reset it, e.g. new gameweek/matchup). Because Fpts view only shows
   point contributions, hovering a stat also shows the underlying raw
   stat, e.g. hovering "AT 6" shows "Assists (Total), 1".

   If you manually click "Stats" yourself, the extension backs off for
   10 minutes and leaves you alone in Stats view (it won't fight you).

## How it works (for future tweaking)

- The abbreviation dictionary in `content.js` (`ABBR_MAP`) was scraped
  directly from Fantrax's own Classic-view header tooltips for this
  league, so it should already cover every stat category in play.
- Fpts view doesn't expose the raw counting stat in the DOM, so the
  script briefly flips the Mode toggle to "Stats", snapshots every
  player's raw values, and flips back to "Fpts" -- this can cause a
  very brief flicker (well under a second) right after the page loads
  or the live scores refresh. It's throttled to at most once every 30
  seconds, and skipped entirely while nothing on the page has changed.
- Everything is scoped to `scoring-table__row` / `scoring-table__cell__content`
  elements and the `pill-group[aria-label="Mode"]` toggle, which is what
  Fantrax's Simple view currently uses. If Fantrax changes those class
  names in a future redesign, this will need re-pointing at the new
  selectors.
- The pitch editor (`pitch-editor.js`) reads the real roster table
  (`.i-table__row`, one row per player, with a `button.lineup-btn` that
  shows the player's current position letter) as its only source of
  truth for who's who and where they sit. It borrows jersey images from
  Fantrax's own official (read-only) pitch graphic elsewhere on the page
  -- matched to each roster row by last name -- rather than maintaining
  a separate team-to-jersey lookup, and falls back to the row's own crest
  image if no match is found. Opponent/fixture text is reformatted from
  the roster table's own fixture cell. A player is considered "locked"
  (can't be dragged) unless their fixture cell shows an upcoming kickoff
  time like "3:00PM" -- that's deliberately conservative.
- It replaces Fantrax's list view by inserting a third **"Pitch Editor"**
  button into the real "Lineup change system" pill group (next to "Easy
  Click" / "Classic"), styled to match rather than relying on Fantrax's
  own CSS classes actually applying to a node the extension inserted.
  Clicking it shows the pitch editor and hides the underlying list;
  clicking either of Fantrax's own two options hides the pitch editor
  and restores their list, exactly like switching between two native
  tabs.
- A swap is: click the source player's `lineup-btn`, wait, click the
  target's `lineup-btn`, wait, then re-read the list to see if the
  source's active/reserve status (or position) actually changed. If
  Fantrax opens its own popup/menu partway through (this happens if
  your account's "Lineup change system" setting is "Classic" instead
  of "Easy Click"), the script backs off and lets you finish it there
  rather than guessing which menu item to click.

3. **Drag-and-drop pitch editor** (on the Team Roster page). Replaces
   the read-only pitch graphic with an interactive one: your full squad
   (starting XI + bench) laid out as draggable cards, using the same
   jersey graphics as Fantrax's own pitch widget (matched by player
   name), with each player's fixture for the gameweek shown under their
   points. Drag a player onto another (or click one, then click another)
   to swap them between bench and lineup. Players whose game has already
   started or finished are greyed out and can't be dragged, since
   Fantrax won't let you move them anyway.

   It lives as its own **"Pitch Editor"** option right next to Fantrax's
   own "Easy Click" / "Classic" pills under "Lineup change system" --
   click it to switch to the pitch editor, click "Easy Click" or
   "Classic" to go back to Fantrax's normal list.

   **Please read before relying on this one:** the swap is done by
   clicking Fantrax's own real lineup button for each player (there's
   no public API for this), in the sequence that seemed most plausible
   from inspecting the page. I was not able to fully verify a real
   swap end-to-end while building this -- every same-position pair of
   not-yet-started players was unavailable at the time (bench/starters
   were either mismatched positions or already locked). Every attempt
   is verified afterward by re-reading the list, so it will tell you
   plainly ("that didn't go through") rather than pretend it worked --
   but the very first real swap you try is effectively the last piece
   of testing this needs. If it fails consistently, let me know exactly
   which two players and what the status message said, and I can adjust
   the click sequence.

## Install (unpacked, dev mode)

1. Unzip this folder somewhere on disk.
2. In Chrome, go to `chrome://extensions`.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the unzipped `fantrax-ext` folder.
5. Open/refresh your Fantrax live scoring page -- the tweaks apply
   automatically on `https://www.fantrax.com/*`.

No permissions beyond running on fantrax.com are requested, and nothing
is sent off the page -- it's a pure content script.
