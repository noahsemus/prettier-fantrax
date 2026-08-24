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

3. **Drag-and-drop pitch editor** (on the Team Roster page). Replaces
   the read-only pitch graphic with an interactive one: your full squad
   (starting XI + bench) laid out as cards, using the same jersey
   graphics as Fantrax's own pitch widget (matched by player name), with
   each player's fixture and points for the gameweek shown under their
   name. It lives as its own **"Pitch Editor"** option right next to
   Fantrax's own "Easy Click" / "Classic" pills under "Lineup change
   system" -- click it to switch to the pitch editor, click "Easy Click"
   or "Classic" to go back to Fantrax's normal list.

   - **Swapping.** Drag a player onto another, or click a player and
     choose "Start Swap" from its menu, then click a legal target. Only
     legal targets (same position, opposite active/bench side, not
     locked) light up while a swap is in progress -- everything else
     dims and stops accepting clicks/drops, and empty slots (invisible
     the rest of the time) only appear where the player you're moving
     could actually land. Players whose game has already started or
     finished can't be moved, since Fantrax won't let you move them
     anyway.
   - **Status dots.** Each name shows Fantrax's own real-life "is this
     player playing" indicator when one exists (green = confirmed
     starting, orange = expected to play, amber = expected on the real
     bench, red = not expected to play) -- the same colors Fantrax's own
     list uses, just surfaced on the pitch view too.
   - **Hover a player** to see how they got their points -- a breakdown
     by scoring stat (goals, tackles, clean sheet, etc.) for the
     gameweek -- or, if they haven't played yet, their projected points.
   - **Click a player** for a small action menu: Start Swap, Trade,
     Drop, and View Player Card. The last three just click the
     equivalent real control already sitting in that player's (hidden)
     list row, so Fantrax's own Trade picker / Drop confirmation / full
     player-card modal (Stats, Splits, News, Watch List, Compare, Notes)
     open exactly as they would from the real list.

   **Please read before relying on the swap feature:** it's done by
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

## Project layout

No build step -- everything is loaded directly by `manifest.json` as
plain scripts/stylesheets, in the order listed there.

```
src/
  shared/stat-names.js     stat abbreviation -> full name, shared by both features below
  content/                 Live Scoring tweaks (tooltips + Fpts default)
    content.js
    content.css
  pitch-editor/            Team Roster pitch editor
    state.js                shared `window.FXP` namespace + state + tiny DOM utils
    roster.js                parses Fantrax's real `.i-table__row` list into player objects
    tabs.js                   injects/toggles the "Pitch Editor" pill
    render.js                  builds the pitch + bench cards
    drag.js                     drag/click-to-arm interactions, legal-target highlighting
    tooltip.js                  hover tooltip (points breakdown / projection)
    points-sync.js               background scrape of Fantrax's Fantasy Points + Projected views
    swap.js                       drives Fantrax's real lineup buttons to perform a swap
    action-menu.js                per-player click menu (Start Swap / Trade / Drop / View Player Card)
    main.js                       boot + MutationObserver to stay in sync with live updates
    *.css                         one stylesheet per concern (pitch shell, cards, tooltip, menu)
```

Since these are plain (non-module) scripts sharing one global scope,
`pitch-editor/*.js` files avoid relying on that implicitly and instead
read/write an explicit `window.FXP` namespace (created by `state.js`,
which must load first; `main.js`, which calls `start()`, must load
last -- everything in between can reference any `FXP.xxx` function
regardless of file order, since those references only get looked up
once the page actually runs, not while the files are loading).

## How it works (for future tweaking)

- The abbreviation dictionary in `src/shared/stat-names.js` (`FX_STAT_NAMES`)
  was scraped directly from Fantrax's own Classic-view header tooltips
  for this league, so it should already cover every stat category in
  play.
- Fpts view doesn't expose the raw counting stat in the DOM, so
  `content.js` briefly flips the Mode toggle to "Stats", snapshots
  every player's raw values, and flips back to "Fpts" -- this can cause
  a very brief flicker (well under a second) right after the page loads
  or the live scores refresh. It's throttled to at most once every 30
  seconds, and skipped entirely while nothing on the page has changed.
- Everything in `content.js` is scoped to `scoring-table__row` /
  `scoring-table__cell__content` elements and the
  `pill-group[aria-label="Mode"]` toggle, which is what Fantrax's
  Simple view currently uses. If Fantrax changes those class names in a
  future redesign, this will need re-pointing at the new selectors.
- The pitch editor (`src/pitch-editor/roster.js`) reads the real roster
  table (`.i-table__row`, one row per player, with a `button.lineup-btn`
  that shows the player's current position letter) as its only source
  of truth for who's who and where they sit. It borrows jersey images
  from Fantrax's own official (read-only) pitch graphic elsewhere on
  the page -- matched to each roster row by last name -- rather than
  maintaining a separate team-to-jersey lookup, and falls back to the
  row's own crest image if no match is found. A player is considered
  "locked" (can't be dragged) unless their fixture cell shows an
  upcoming kickoff time like "3:00PM" -- that's deliberately
  conservative.
- The points breakdown / projection (`src/pitch-editor/points-sync.js`)
  works the same way as the live-scoring Fpts toggle above, but across
  two controls instead of one: Fantrax's own "Stats / Fantasy Points"
  tabs (to read each stat's point contribution) and its
  "Stats: <period>" dropdown (flipped to "Projected - Per Game" to read
  an unplayed gameweek's projection). Both get flipped back to whatever
  the user had immediately after. This is a heavier version of the same
  trade-off content.js makes: a real but brief (~2s) flicker in the
  controls above the pitch view, throttled to once a minute.
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
- The action menu's Trade/Drop/View Player Card items click the real
  `button.mat-gray--fill` (Trade), `button.mat-red--fill` (Drop), and
  `.scorer__info__name a` (player card) elements already present in
  that player's hidden list row -- same "drive the real control"
  approach as everything else here.

## Install (unpacked, dev mode)

1. Unzip this folder somewhere on disk.
2. In Chrome, go to `chrome://extensions`.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the unzipped `fantrax-ext` folder.
5. Open/refresh your Fantrax live scoring page -- the tweaks apply
   automatically on `https://www.fantrax.com/*`.

No permissions beyond running on fantrax.com are requested, and nothing
is sent off the page -- it's a pure content script.

## Mobile app

Chrome for Android/iOS doesn't support extensions, so there's no way to
load this on a phone's browser directly. Instead, `mobile/` holds a
small Capacitor-based app that wraps fantrax.com's mobile site in its
own WebView and injects the same scripts into it. `src/` stays the one
source of truth -- a build step bundles those files for the app rather
than forking them.

**Important limitation:** this enhances the fantrax.com *website*
running inside the app's own WebView, not the official Fantrax app --
that app can't be modified, so you open this one instead. You log into
Fantrax inside the app once and the session persists after that.

**Status: Phase 1.** The app shell is wired up and injects the scripts
correctly, plus an on-screen diagnostic badge showing which page
elements the features can actually find on the mobile layout. Fantrax's
mobile site doesn't necessarily use the same class names/structure as
desktop, so features built against the desktop selectors may not work
yet until they're adapted (and touch support added where needed) --
that's Phase 2.

### Build/run

Prereqs: Node, plus Xcode for iOS or Android Studio for Android.

```
cd mobile && npm install && npm run build
```

This runs `node build-inject.js && npx cap sync` -- bundling `src/` for
the WebView and syncing it into the native projects.

- **iOS:** `npx cap open ios`, then run it on your iPhone from Xcode.
  Sideloading with a free Apple ID works, but the app needs to be
  re-signed every 7 days; a paid Apple Developer account ($99/yr)
  stretches that to a year.
- **Android:** `npx cap open android`, then build/run on your device
  from Android Studio -- or build the APK and sideload it directly.
