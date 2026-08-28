/**
 * Prettier Fantrax -- shared: horizontal-scroll affordance arrows
 * ---------------------------------------------------------------------
 * Both pitches' position rows (.fx-pitch__row / .fxm-line) pan
 * horizontally when they can't fit (see each feature's narrow-breakpoint
 * CSS), with the scrollbar hidden -- so without an affordance there's no
 * visual hint that more cards exist off-screen. This module maintains two
 * direction classes on any container handed to attachScrollAffordance:
 *
 *   fxs-hscroll--left    it can scroll further left
 *   fxs-hscroll--right   it can scroll further right
 *
 * scroll-affordance.css renders those as small fade-in/out arrow chips,
 * built as the container's own ::before/::after (position: sticky, zero
 * net layout size) -- no extra DOM inside the rows, so nothing here can
 * interfere with either feature's own card queries, drag wiring, or
 * marquee measurement.
 *
 * attachScrollAffordance is idempotent and re-render-friendly: both
 * pitches rebuild their rows wholesale all the time, so render code just
 * calls it on every (re)built row. State updates on scroll (passive) and
 * on size changes via one module-level ResizeObserver -- which also fires
 * on initial observe, covering the first paint; observed elements are
 * held weakly, so rebuilt-and-discarded rows cost nothing.
 * ---------------------------------------------------------------------
 */
window.FXShared = window.FXShared || {};
(function (FX) {
  'use strict';

  function update(el) {
    const canLeft = el.scrollLeft > 1;
    const canRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    el.classList.toggle('fxs-hscroll--left', canLeft);
    el.classList.toggle('fxs-hscroll--right', canRight);
  }

  const resizeObserver =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver((entries) => entries.forEach((entry) => update(entry.target)))
      : null;

  function attachScrollAffordance(el) {
    if (!el) return;
    if (!el.classList.contains('fxs-hscroll')) {
      el.classList.add('fxs-hscroll');
      el.addEventListener('scroll', () => update(el), { passive: true });
      if (resizeObserver) resizeObserver.observe(el);
    }
    // Also update on a fresh frame regardless: the caller may attach
    // before the row has been laid out (mid-render), and re-attach calls
    // on an already-wired row still deserve a recheck.
    requestAnimationFrame(() => update(el));
  }

  FX.attachScrollAffordance = attachScrollAffordance;
})(window.FXShared);
