/**
 * Prettier Fantrax -- extension background service worker
 * ---------------------------------------------------------------------
 * Exists for exactly one job: showing a real desktop notification when a
 * player in your active lineup isn't in their club's real starting XI.
 * Content scripts can't call chrome.notifications themselves, so
 * src/shared/lineup-alerts.js detects the problem on the page (where it's
 * already parsing your roster) and posts a message here to display it.
 *
 * Why a message from the page rather than polling from here: this worker
 * could in principle fetch the roster itself on a chrome.alarms timer and
 * notify with no tab open at all -- but requests it makes are treated as
 * cross-site by the browser, so Fantrax's own session cookies aren't
 * reliably attached and the fetch can come back logged-out. The page has
 * the authenticated session for free. The tradeoff is stated plainly in
 * lineup-alerts.js's header and in the README: a Fantrax tab has to be
 * open for a notification to fire. Doing better means a server polling on
 * your behalf, which this project deliberately doesn't have.
 *
 * MV3 service workers are torn down when idle and restarted on the next
 * event, so this file must stay stateless -- everything it needs arrives
 * in the message. Deduplication lives on the page side (localStorage),
 * not here, for that reason.
 * ---------------------------------------------------------------------
 */
chrome.runtime.onMessage.addListener((message) => {
  if (!message || message.type !== 'fx-lineup-alert') return;

  chrome.notifications.create({
    type: 'basic',
    // Reuses the extension's own 128px icon rather than shipping a
    // notification-specific asset.
    iconUrl: chrome.runtime.getURL('icons/icon128.png'),
    title: message.title || 'Lineup warning',
    message: message.body || '',
    // Keeps it on screen until dismissed: the whole value of this alert is
    // time-sensitive and easily missed, and an auto-hiding toast that
    // appears while you're in another window is no better than not
    // sending it.
    requireInteraction: true,
  });
});

// Clicking the notification takes you where you can act on it -- the
// roster page of whichever Fantrax tab is already open, or a new one.
chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.tabs.query({ url: 'https://www.fantrax.com/*' }, (tabs) => {
    if (tabs && tabs.length) {
      chrome.tabs.update(tabs[0].id, { active: true });
      if (tabs[0].windowId != null) chrome.windows.update(tabs[0].windowId, { focused: true });
    } else {
      chrome.tabs.create({ url: 'https://www.fantrax.com/' });
    }
    chrome.notifications.clear(notificationId);
  });
});
