/**
 * Prettier Fantrax -- shared: is the displayed gameweek in the future?
 * ---------------------------------------------------------------------
 * Both the roster page and the livescoring page carry an identical
 * mat-select labeled exactly "Gameweek" whose selected text includes the
 * gameweek's real date range -- confirmed live on both pages
 * (2026-08-28): "2 (Aug 28 - Sep 3)", and the options list runs
 * "1 (Aug 21 - Aug 27)" ... "38 (May 28 - May 30)". That date range is
 * what makes "is this gameweek in the future?" answerable WITHOUT any
 * "which week is current" marker (Fantrax exposes none) and without
 * calibration state: a gameweek is future if and only if its START date
 * is after today.
 *
 * Both features need the answer for the same reason: a not-yet-played
 * player's card shows their season average as a preview number ONLY on a
 * future gameweek. On the ACTIVE gameweek a 0 is real information
 * ("hasn't scored yet"), so the average must never replace it there.
 *
 * The range has no year, and a season spans two calendar years (Aug ->
 * May). Rather than inferring years, months are compared in SEASON order:
 * July maps to 0, August 1, ... June 12 -- so "Jan 5" correctly sorts
 * after "Dec 29" within one season, with no year arithmetic at all. This
 * is valid because the selector only ever shows one season's weeks.
 *
 * Fails SAFE: any parse failure (no select, unexpected text, unknown
 * month) returns false -- callers then treat the week as not-future and
 * show their ordinary number, never a preview. Being wrong in that
 * direction just hides the preview; the other direction would put a
 * fake-looking score on a live week, which is the bug this exists to
 * prevent.
 * ---------------------------------------------------------------------
 */
window.FXShared = window.FXShared || {};
(function (FX) {
  'use strict';

  const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

  // Calendar month (0-11) -> position within a July-anchored season year.
  function seasonOrder(monthIdx) {
    return (monthIdx - 6 + 12) % 12;
  }

  function findGameweekSelect() {
    return (
      Array.from(document.querySelectorAll('mat-select')).find((s) => {
        const ff = s.closest('mat-form-field');
        const label = ff && ff.querySelector('.mdc-floating-label, mat-label, label');
        return label && label.textContent.trim() === 'Gameweek';
      }) || null
    );
  }

  function isFutureGameweek() {
    const select = findGameweekSelect();
    if (!select) return false;
    // "2 (Aug 28 - Sep 3)" -> start month "Aug", start day 28.
    const m = select.textContent.trim().match(/^\d+\s*\(\s*([A-Za-z]{3,})\s+(\d{1,2})\s*-/);
    if (!m) return false;
    const startMonth = MONTHS[m[1].slice(0, 3).toLowerCase()];
    if (startMonth === undefined) return false;
    const startDay = parseInt(m[2], 10);
    const today = new Date();
    const startPos = seasonOrder(startMonth) * 100 + startDay;
    const todayPos = seasonOrder(today.getMonth()) * 100 + today.getDate();
    return startPos > todayPos;
  }

  FX.isFutureGameweek = isFutureGameweek;
})(window.FXShared);
