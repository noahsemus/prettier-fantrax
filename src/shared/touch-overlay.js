/**
 * Fantrax Refinements -- shared touch/mobile overlay mechanics
 * ---------------------------------------------------------------------
 * The pitch-editor (`FXP`, `fx-*` classes) and matchup (`FXM`, `fxm-*`
 * classes) features each render their own mobile tap-opened overlay (an
 * action menu / a stat-breakdown tooltip) anchored to a player card, and
 * each needed the exact same mechanics to get it right: anchor the overlay
 * above/below the card without covering it, keep it stuck to the card
 * through a scroll, dim every other card while one is selected, and tell a
 * genuine tap apart from a touchend that's really the tail end of a
 * scroll. Both features had their own hand-rolled (and separately
 * bug-fixed) copies of all of this. This module is the ONE implementation
 * both features call into -- neither hardcodes the other's class prefix or
 * state shape; callers pass in their own elements/selectors/classes.
 *
 * Loaded once, right after stat-names.js, in BOTH the pitch-editor and
 * matchup manifest.json content_scripts entries, so `window.FXShared` is
 * ready before either feature's own files run. Like FXM/FXP, this file
 * must be able to re-run within the same page load (dev iteration) without
 * double-wiring listeners or losing already-registered trackers, hence the
 * `window.FXShared = window.FXShared || {}` + guarded-listener pattern
 * mirrored from state.js in both other features.
 * ---------------------------------------------------------------------
 */
window.FXShared = window.FXShared || {};
(function (FX) {
  'use strict';

  function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  // ---------- anchor an overlay element to a target element ----------
  // Flush above the target if there's room, else flush below; horizontally
  // centered on the target; clamped to the viewport on every edge. This is
  // exactly matchup/render.js's positionTooltipForCard algorithm (the
  // "don't cover the tapped card" fix), generalized: `overlayEl` used to
  // always be the one `.fxm-tip` singleton and `targetEl` always the
  // tapped `.fxm-card` -- now both are caller-supplied so the action menu
  // (roster) can reuse the identical math against its own `.fx-card`.
  function anchorToElement(overlayEl, targetEl, opts) {
    if (!overlayEl || !targetEl) return;
    opts = opts || {};
    const gap = opts.gap != null ? opts.gap : 8; // px kept between overlay and its anchor card
    const margin = opts.margin != null ? opts.margin : 8; // px kept between overlay and viewport edge

    const targetRect = targetEl.getBoundingClientRect();
    const rect = overlayEl.getBoundingClientRect();

    // Vertical: flush above when there's room, otherwise flush below --
    // either way the overlay's edge never crosses the target's edge, so
    // the target itself is never covered. Safety clamp for the (rare) case
    // neither side has room, e.g. a very short viewport.
    let top = targetRect.top - gap - rect.height;
    if (top < margin) top = targetRect.bottom + gap;
    if (top + rect.height > window.innerHeight - margin) top = window.innerHeight - margin - rect.height;
    if (top < margin) top = margin;

    // Horizontal: centered over the target's midpoint, then clamped so it
    // never crosses the viewport edges.
    let left = targetRect.left + targetRect.width / 2 - rect.width / 2;
    if (left + rect.width > window.innerWidth - margin) left = window.innerWidth - margin - rect.width;
    if (left < margin) left = margin;

    overlayEl.style.left = `${Math.max(4, left)}px`;
    overlayEl.style.top = `${Math.max(4, top)}px`;
  }

  // ---------- track an anchored overlay through scroll ----------
  // Backed by ONE shared capture-phase `scroll` listener (matchup previously
  // wired its own; this replaces that with a single listener that iterates
  // every active tracker across BOTH features) -- capture phase because the
  // real page can scroll inside nested containers, not just window/document.
  //
  // `key` namespaces callers ('fxp'/'fxm') so two features can each track
  // their own overlay independently without colliding or tearing down each
  // other's tracker.
  //
  // Generalizes the exact stale-target fix matchup just got: a re-render can
  // tear down and rebuild every card from scratch while an overlay is still
  // anchored to the OLD (now-detached) card. Positioning against a detached
  // element's all-zero getBoundingClientRect() makes the overlay visibly
  // jump to the viewport's top-left corner on the next scroll event, so
  // `onStale` (rather than `onReposition`) is called instead whenever
  // `targetEl` is no longer attached to the document -- the caller decides
  // what "stale" means for it (hide a tooltip, close a menu).
  const trackers = new Map(); // key -> { overlayEl, targetEl, isVisible, onReposition, onStale }

  function trackAnchor(key, opts) {
    trackers.set(key, opts);
  }

  function stopTrackingAnchor(key) {
    trackers.delete(key);
  }

  function handleScroll() {
    trackers.forEach((t) => {
      if (!t || typeof t.isVisible !== 'function' || !t.isVisible()) return;
      if (!t.targetEl || !document.body.contains(t.targetEl)) {
        if (t.onStale) t.onStale();
        return;
      }
      if (t.onReposition) t.onReposition();
    });
  }

  if (!FX.scrollTrackWired) {
    FX.scrollTrackWired = true;
    document.addEventListener('scroll', handleScroll, true);
  }

  // ---------- dim every element except the selected one ----------
  // Purely mechanical -- adds/removes a caller-named class -- so both
  // `fx-card--dimmed` and `fxm-card--dimmed` keep their own existing class
  // names and CSS (each feature's own stylesheet), rather than forcing a
  // single shared class name onto two independently-styled card
  // components.
  function selectAndDim(containerEl, itemSelector, selectedEl, dimmedClass) {
    const root = containerEl || document;
    qa(itemSelector, root).forEach((el) => {
      if (el === selectedEl) {
        el.classList.remove(dimmedClass);
      } else {
        el.classList.add(dimmedClass);
      }
    });
  }

  function clearDim(containerEl, itemSelector, dimmedClass) {
    const root = containerEl || document;
    qa(itemSelector, root).forEach((el) => el.classList.remove(dimmedClass));
  }

  // ---------- tap-vs-scroll gesture gating ----------
  // "Did the user actually tap this element, or was this touchend just a
  // scroll ending here" -- generalizes matchup's touchstart/touchend
  // move-threshold check plus its cancelable-safe preventDefault. Wires the
  // pair directly onto `el` and calls `handler(touchEndEvent)` only for a
  // genuine tap (net finger movement under `moveThresholdPx`).
  //
  // NOT used by pitch-editor/drag.js's own long-press-vs-tap-vs-scroll
  // state machine for initiating a DRAG -- that already correctly
  // distinguishes a drag-hold from a scroll/tap and is left untouched. This
  // helper is for the separate "should the info panel/tooltip open"
  // concern. Roster's action-menu tap-to-open already gets a clean `click`
  // event via drag.js's existing gesture recognizer (a plain tap that
  // never triggered a long-press drag falls through to `click`), so it
  // doesn't need this helper at all -- it's used by matchup, which has no
  // drag.js equivalent gating its taps.
  function onTap(el, handler, opts) {
    opts = opts || {};
    const moveThresholdPx = opts.moveThresholdPx != null ? opts.moveThresholdPx : 10;
    let startX = 0;
    let startY = 0;

    function onStart(e) {
      const t = e.touches[0];
      if (!t) return;
      startX = t.clientX;
      startY = t.clientY;
    }

    function onEnd(e) {
      const t = e.changedTouches && e.changedTouches[0];
      const dx = t ? t.clientX - startX : 0;
      const dy = t ? t.clientY - startY : 0;
      if (Math.hypot(dx, dy) > moveThresholdPx) return; // scroll-ending touchend, not a tap

      // A scroll-terminating touchend is non-cancelable, and calling
      // preventDefault() on a non-cancelable event just logs a console
      // violation without doing anything -- the move-distance check above
      // already routes genuine scroll-enders away from this line, but this
      // guard is a cheap general safety net regardless.
      if (e.cancelable) e.preventDefault();
      handler(e);
    }

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: false });

    return function unwire() {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchend', onEnd);
    };
  }

  // ---------- opponent/game-text line formatting ----------
  // Pure string formatting -- no DOM, no feature-specific class names.
  // Turns Fantrax's crammed raw game-text cell content (e.g. "MUN0@HUL2F"
  // or "@FULMon3:00PM") into a readable spaced line (e.g. "MUN 0 @ HUL 2
  // F" / "@ FUL Mon 3:00 PM"). Originally pitch-editor/render.js's own
  // formatOpp; moved here since matchup/render.js needs the exact same
  // formatting for its own equivalent raw text (parse.js's p.gameText) --
  // per the user, "these should be the same component." Each feature still
  // renders its own DOM element with its own CSS class (fx-card__opp /
  // fxm-card__opp) -- only the formatting LOGIC is shared.
  function formatOpp(oppText) {
    if (!oppText) return '';
    return oppText
      .replace(/@/g, ' @ ')
      .replace(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/g, ' $1')
      .replace(/([A-Za-z]{2,4})(\d)/g, '$1 $2')
      .replace(/(\d)(AM|PM)/gi, '$1 $2')
      .replace(/(\d)(F)$/, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ---------- color-coded stat line rendering ----------
  // `line` is either a plain string, or `{ text, pts }` where `pts` is an
  // already-signed points string (e.g. "+6"/"-2"/"0"). Builds `text` + a
  // trailing colored "(pts)" span via createElement/createTextNode --
  // never innerHTML with interpolated data -- classed with the ONE shared
  // naming scheme `fxs-stat-pts fxs-stat-pts--pos|neg|zero`, defined once
  // in touch-overlay.css. `buildTooltipLines` in both tooltip.js and
  // matchup/render.js still computes the LINES (feature-specific, since
  // the two features derive breakdowns differently) -- this function only
  // renders one line into a row element the caller already created.
  function statPtsClass(pts) {
    const n = parseFloat(pts);
    if (n > 0) return 'fxs-stat-pts--pos';
    if (n < 0) return 'fxs-stat-pts--neg';
    return 'fxs-stat-pts--zero';
  }

  function renderStatLine(rowEl, line) {
    if (typeof line === 'string') {
      rowEl.textContent = line;
      return;
    }
    rowEl.appendChild(document.createTextNode(`${line.text} (`));
    const span = document.createElement('span');
    span.className = `fxs-stat-pts ${statPtsClass(line.pts)}`;
    span.textContent = line.pts;
    rowEl.appendChild(span);
    rowEl.appendChild(document.createTextNode(')'));
  }

  FX.anchorToElement = anchorToElement;
  FX.trackAnchor = trackAnchor;
  FX.stopTrackingAnchor = stopTrackingAnchor;
  FX.selectAndDim = selectAndDim;
  FX.clearDim = clearDim;
  FX.onTap = onTap;
  FX.renderStatLine = renderStatLine;
  FX.formatOpp = formatOpp;
})(window.FXShared);
