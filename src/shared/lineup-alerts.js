/**
 * Prettier Fantrax -- shared: "your starter isn't starting" alerts
 * ---------------------------------------------------------------------
 * The problem this solves: real-life lineups are published about an hour
 * before kickoff, and if one of your ACTIVE players is benched or left out
 * by their actual club, you want to swap them out before the game starts.
 * Fantrax already knows -- it puts a status icon on every player row -- but
 * nothing tells you; you have to notice a small colored dot on the right
 * player at the right time.
 *
 * WHAT COUNTS AS AN ALERT: a player in your active lineup (never a
 * reserve -- benching a bench player is not news) whose real-life status
 * is 'bench' or 'out', and whose own game hasn't kicked off yet (once it
 * has, the information is useless -- you can no longer move them, which
 * is exactly what roster.js's `locked` already means). Statuses come from
 * Fantrax's own scorer-icon classes, parsed by roster.js's
 * readEventStatus, so this adds no new data source at all.
 *
 * DELIVERY, best-effort and layered -- this project has no backend, and
 * deliberately isn't getting one, so there is no server to push from:
 *
 *   1. An in-page banner on the pitch itself. Always works, needs no
 *      permission, and is the only layer guaranteed to be seen.
 *   2. A real desktop notification in Chrome, via the extension's own
 *      background service worker (see background.js). Fires whenever a
 *      Fantrax tab is open in Chrome, even in the background.
 *   3. A local notification in the mobile app, via Capacitor's
 *      LocalNotifications plugin when it's present.
 *
 * The honest limitation of every no-backend design: something of ours has
 * to be RUNNING to notice. Layers 2 and 3 need a Fantrax tab open (or the
 * app open) at the time lineups drop. A notification that arrives with
 * everything closed would need a server polling on your behalf, which is
 * exactly the infrastructure this project doesn't have.
 *
 * DEDUPE: the roster re-renders constantly (live scores, the observer in
 * main.js), and re-alerting on every render would be unusable. Each alert
 * is remembered in localStorage under a key of gameweek + player + status,
 * so you get told once per player per gameweek -- and again, correctly, if
 * their status later changes (expected -> out is genuinely new news).
 * ---------------------------------------------------------------------
 */
window.FXShared = window.FXShared || {};
(function (FX) {
  'use strict';

  const STORAGE_KEY = 'fx-lineup-alerts-seen';
  const ALERT_STATUSES = ['bench', 'out'];
  const STATUS_TEXT = {
    bench: 'is on the bench',
    out: 'is not in the squad',
  };

  // Everything here is wrapped: localStorage throws outright in some
  // privacy configurations, and an alerting feature must never be the
  // thing that breaks the pitch it's attached to.
  function readSeen() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      return {};
    }
  }

  function writeSeen(seen) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
    } catch (err) {
      /* full, disabled, or blocked -- alerts just repeat next session */
    }
  }

  // Keyed by gameweek too, so the same player benched in a later gameweek
  // is a fresh alert rather than being suppressed forever by an old one.
  function alertKey(gameweek, player) {
    return `${gameweek || '?'}|${player.name}|${player.eventStatus}`;
  }

  // Old gameweeks' keys would otherwise accumulate forever in
  // localStorage. Anything not from the current gameweek is dropped on
  // each write -- the only thing suppression needs to remember is what
  // we've already said about the gameweek in play.
  function pruneToGameweek(seen, gameweek) {
    const prefix = `${gameweek || '?'}|`;
    const next = {};
    Object.keys(seen).forEach((k) => {
      if (k.indexOf(prefix) === 0) next[k] = seen[k];
    });
    return next;
  }

  function findProblems(players) {
    if (!Array.isArray(players)) return [];
    return players.filter(
      (p) =>
        p &&
        !p.isEmpty &&
        !p.isReserve && // only players you're actually starting
        !p.locked && // their game hasn't started; you can still act
        ALERT_STATUSES.indexOf(p.eventStatus) !== -1
    );
  }

  function describe(player) {
    return `${player.name} ${STATUS_TEXT[player.eventStatus] || 'may not play'}`;
  }

  // ---------- delivery layer 2: Chrome desktop notification ----------
  // Content scripts can't call chrome.notifications directly, so this hands
  // off to the extension's background service worker (background.js). The
  // whole thing is feature-detected: in the mobile app (plain injected
  // script, no extension APIs at all) `chrome.runtime` is undefined and
  // this is simply skipped.
  function notifyViaExtension(problems) {
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) return false;
      chrome.runtime.sendMessage({
        type: 'fx-lineup-alert',
        title: problems.length === 1 ? 'Lineup warning' : `${problems.length} lineup warnings`,
        body: problems.map(describe).join('\n'),
      });
      return true;
    } catch (err) {
      // The extension context can be invalidated (e.g. after a reload)
      // while an old content script is still running -- never fatal here.
      return false;
    }
  }

  // ---------- delivery layer 3: mobile local notification ----------
  // Capacitor's LocalNotifications plugin, present only inside the mobile
  // app build. Permission is requested lazily -- the first time there's
  // something real to say, rather than with a prompt on first launch for a
  // notification the user may never need.
  // Its own Android channel, created at LOW importance: the notification
  // lands silently in the shade -- no sound, no vibration, no heads-up
  // banner interrupting whatever you're doing -- which is what you want
  // from something that may fire while you're mid-something and is only
  // worth acting on when you next look at your phone. Channel importance
  // is fixed at creation time on Android and can't be lowered later in
  // code, so this must be created BEFORE the first notification is
  // scheduled on it (afterwards, only the user can change it in system
  // settings). createChannel is a no-op if the channel already exists.
  const CHANNEL_ID = 'fx-lineup-alerts';

  function ensureChannel(plugin) {
    if (!plugin.createChannel) return Promise.resolve(); // iOS has no channels
    return plugin
      .createChannel({
        id: CHANNEL_ID,
        name: 'Lineup alerts',
        description: "Tells you when a player you're starting has been benched or left out by their real club.",
        importance: 2, // LOW: shows in the shade, makes no sound
        visibility: 1, // public: readable on the lock screen, where it's most useful
        vibration: false,
      })
      .catch(() => {
        /* older plugin or platform without channels -- schedule anyway */
      });
  }

  // Never let a call hang this chain forever. Observed on-device: a
  // schedule() naming a custom channel can sit unsettled indefinitely
  // (the WebView suspending while the app is backgrounded will do it),
  // and an alert that never resolves is an alert the user never gets.
  function withTimeout(promise, ms) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          reject(new Error('timeout'));
        }
      }, ms);
      Promise.resolve(promise).then(
        (v) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(v);
        },
        (e) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          reject(e);
        }
      );
    });
  }

  function buildNotification(problems, channelId) {
    const notification = {
      // A stable-ish id keeps a burst from stacking into a pile of
      // near-identical notifications; Android requires a 32-bit int.
      id: Math.floor(Date.now() / 1000) % 2147483647,
      title: problems.length === 1 ? 'Lineup warning' : `${problems.length} lineup warnings`,
      body: problems.map(describe).join('\n'),
    };
    if (channelId) notification.channelId = channelId;
    return { notifications: [notification] };
  }

  function notifyViaCapacitor(problems) {
    const cap = window.Capacitor;
    const plugin = cap && cap.Plugins && cap.Plugins.LocalNotifications;
    if (!plugin) return false;
    Promise.resolve()
      .then(() => (plugin.requestPermissions ? plugin.requestPermissions() : { display: 'granted' }))
      .then((res) => {
        if (res && res.display && res.display !== 'granted') return null;
        // Preferred path: our own silent, low-importance channel.
        return withTimeout(
          ensureChannel(plugin).then(() => plugin.schedule(buildNotification(problems, CHANNEL_ID))),
          4000
        ).catch(() =>
          // Fallback: schedule with no channel at all, which lands on the
          // plugin's default channel. Louder than we'd like, but GETTING
          // the warning matters more than how quietly it arrives -- and
          // this path is the one confirmed working on-device.
          plugin.schedule(buildNotification(problems, null))
        );
      })
      .catch(() => {
        /* denied or unavailable -- the in-page banner still shows */
      });
    return true;
  }

  // ---------- delivery layer 1: in-page banner ----------
  // Rendered by the caller into its own pitch (each feature owns its DOM
  // and CSS, per this codebase's convention), so this module just returns
  // what to say. Returns null when there's nothing wrong, so the caller
  // can skip the element entirely.
  function bannerText(problems) {
    if (!problems.length) return null;
    if (problems.length === 1) return `${describe(problems[0])} — consider swapping them out.`;
    return `${problems.length} starters may not play: ${problems.map((p) => p.name).join(', ')}.`;
  }

  // Main entry point. `players` is roster.js's parsed list; `gameweek` is
  // whatever identifies the currently-viewed week (points-sync.js's
  // getGameweekNumber). Returns the full problem list every time so the
  // banner can always reflect the CURRENT state, while only firing
  // notifications for problems not already announced.
  function checkLineup(players, gameweek) {
    const problems = findProblems(players);
    if (!problems.length) return { problems: [], banner: null, notified: [] };

    const seen = readSeen();
    const fresh = problems.filter((p) => !seen[alertKey(gameweek, p)]);

    if (fresh.length) {
      const delivered = notifyViaExtension(fresh) || notifyViaCapacitor(fresh);
      // Only record as "said" what we actually managed to say -- if no
      // notification channel exists at all (a plain browser page with the
      // extension's background worker unavailable), leaving these unmarked
      // means a later page load can still deliver them.
      if (delivered) {
        const next = pruneToGameweek(seen, gameweek);
        fresh.forEach((p) => {
          next[alertKey(gameweek, p)] = 1;
        });
        writeSeen(next);
      }
    }

    return { problems, banner: bannerText(problems), notified: fresh };
  }

  FX.checkLineup = checkLineup;
  FX.findLineupProblems = findProblems;
  FX.describeLineupProblem = describe;
})(window.FXShared);
