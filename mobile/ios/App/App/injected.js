window.FX_DIAGNOSTICS = true;

(function () {
  'use strict';
  if (document.getElementById('fx-styles')) return;
  var style = document.createElement('style');
  style.id = 'fx-styles';
  style.textContent = "/* ---- src/content/content.css ---- */\n.fx-tooltip {\n  position: fixed;\n  z-index: 2147483647;\n  background: #12181f;\n  color: #f5f7fa;\n  border: 1px solid rgba(255, 255, 255, 0.14);\n  padding: 6px 10px;\n  border-radius: 6px;\n  font-size: 12px;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif;\n  line-height: 1.4;\n  pointer-events: none;\n  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);\n  max-width: 260px;\n  display: none;\n  white-space: nowrap;\n}\n\n.fx-tooltip.fx-tooltip--visible {\n  display: block;\n}\n\n/* Colored (+N)/(-N) points span inside the hybrid stat tooltip -- see\n   content.js's showTooltip(). Distinct names from pitch-editor/tooltip.css's\n   .fx-tip-pts* classes since content.css is the only stylesheet guaranteed\n   loaded alongside this script. */\n.fx-tooltip__pts--pos {\n  color: #5be08a;\n}\n\n.fx-tooltip__pts--neg {\n  color: #ff8a80;\n}\n\n.fx-tooltip__pts--zero {\n  color: #aeb8c4;\n}\n\n/* Give the simple-view stat abbreviations a hover affordance so it's\n   discoverable that they now do something. */\n.scoring-table__cell__content li > b {\n  cursor: help;\n  border-bottom: 1px dotted rgba(255, 255, 255, 0.35);\n}\n\n/* Masks content.js's brief, programmatic Stats/Fpts pill flip\n   (snapshotCounterpart) used to read the OTHER mode's values -- the same\n   \"hide the flip with visibility:hidden, not display:none, so nothing\n   reflows\" technique src/pitch-editor/points-sync.js's ensureSyncStyle /\n   `fx-syncing` class already uses for its own analogous scrape-by-\n   flipping-real-UI-controls on the roster page. `visibility: hidden`\n   (never `display: none`) keeps every element's layout box exactly where\n   it was, so hiding/revealing it causes no reflow or size jump -- only\n   the mode pill-group and the scoring table's own content (the two\n   regions that actually change value between modes) are covered; nothing\n   else on the page is touched. */\nhtml.fx-livescoring-syncing pill-group[aria-label=\"Mode\"],\nhtml.fx-livescoring-syncing .scoring-table {\n  visibility: hidden;\n}\n\n\n/* ---- src/shared/touch-overlay.css ---- */\n/**\n * Fantrax Refinements -- shared touch-overlay module: color tokens\n * ---------------------------------------------------------------------\n * The ONE shared definition of the signed-points parenthetical color\n * classes built by touch-overlay.js's FXShared.renderStatLine, consumed by\n * both pitch-editor's tooltip/action-menu stat lines and matchup's\n * tooltip stat lines. Replaces the formerly-duplicated `.fx-tip-pts--*`\n * (pitch-editor/tooltip.css) and `.fxm-tip__stat--*` (matchup/matchup.css)\n * rules.\n *\n * Values: green/red match what both duplicated rulesets already agreed on\n * (#5be08a / #ff8a80). The muted \"zero\" gray had drifted slightly between\n * the two (#aeb8c4 in fx-tip-pts--zero vs #9aa4b2 in fxm-tip__stat--zero)\n * -- standardized here on #aeb8c4, which also matches the pts-color\n * classes on the cards themselves in both features (.fx-card__fpts--zero,\n * .fxm-card__pts--zero), so the \"zero\" gray now reads consistently\n * everywhere a stat number appears, not just in the two former tooltip\n * stylesheets.\n * ---------------------------------------------------------------------\n */\n\n.fxs-stat-pts--pos {\n  color: #5be08a;\n}\n\n.fxs-stat-pts--neg {\n  color: #ff8a80;\n}\n\n.fxs-stat-pts--zero {\n  color: #aeb8c4;\n}\n\n\n/* ---- src/pitch-editor/pitch.css ---- */\n.fx-pitch {\n  --fx-green-1: #1e6b3a;\n  --fx-green-2: #268049;\n  --fx-line: rgba(255, 255, 255, 0.55);\n  margin: 12px 0 18px;\n  border-radius: 12px;\n  overflow: hidden;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif;\n}\n\n.fx-pitch__header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  background: #0e1116;\n  padding: 8px 14px;\n  color: #f5f7fa;\n  font-size: 13px;\n}\n\n.fx-pitch__title {\n  font-weight: 700;\n  letter-spacing: 0.02em;\n}\n\n.fx-pitch__status {\n  font-size: 12px;\n  color: #aeb8c4;\n  min-height: 16px;\n  transition: color 0.2s ease;\n}\n\n.fx-pitch__status--ok {\n  color: #5be08a;\n}\n\n.fx-pitch__status--err {\n  color: #ff8a80;\n}\n\n.fx-pitch__field {\n  position: relative;\n  /* Clips the center circle's lower half (see .fx-pitch-marks__circle) --\n     its center sits exactly on the bottom boundary line so only the top\n     half bulges visibly into the field, same as a real pitch's halfway\n     line. Safe for drag/drop: native HTML5 drag uses a browser-painted\n     drag image (not a repositioned DOM node) and the touch-drag ghost is\n     `position: fixed` on <body> (see drag.js createTouchGhost), so neither\n     is clipped by this. */\n  overflow: hidden;\n  background: repeating-linear-gradient(\n    to bottom,\n    var(--fx-green-1) 0px,\n    var(--fx-green-1) 46px,\n    var(--fx-green-2) 46px,\n    var(--fx-green-2) 92px\n  );\n  padding: 18px 12px 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 14px;\n}\n\n.fx-pitch__field::before {\n  content: \"\";\n  position: absolute;\n  inset: 8px;\n  border: 2px solid var(--fx-line);\n  border-radius: 6px;\n  pointer-events: none;\n  opacity: 0.6;\n}\n\n/* ---------- pitch markings (goal end at top, half center-circle at bottom) ----------\n   This pitch renders ONE team's half: GK row at top down to F row near the\n   bottom, so the goal end belongs at the top and the bottom edge doubles as\n   the halfway line (its line is already drawn by .fx-pitch__field::before\n   above -- no separate halfway-line element needed). Built once per render\n   in render.js (buildPitchMarks) and appended before the position rows;\n   rows already sit at z-index: 1 so they layer on top of these regardless\n   of DOM order.\n\n   Same technique as matchup.css's `.fxm-marks`: plain divs, not an SVG with\n   a square viewBox stretched over the field's non-square box -- that\n   non-uniform scale turns circles into ellipses and strokes uneven\n   axis-to-axis. Round marks (circle, spots) use a fixed equal px\n   width/height -- never a percentage of two different-length axes -- so\n   they stay circular at any field width; rectangular marks use % width so\n   they stretch with the field like the boundary above. */\n.fx-pitch-marks {\n  position: absolute;\n  inset: 0;\n  z-index: 0;\n  pointer-events: none;\n}\n\n.fx-pitch-marks__box {\n  position: absolute;\n  top: 8px;\n  border: 1.5px solid var(--fx-line);\n  border-top: none; /* open onto the goal line, like a real box */\n  opacity: 0.6;\n  box-sizing: border-box;\n}\n\n.fx-pitch-marks__box--18 {\n  left: 20%;\n  right: 20%;\n  height: 64px;\n}\n\n.fx-pitch-marks__box--6 {\n  left: 37%;\n  right: 37%;\n  height: 28px;\n}\n\n.fx-pitch-marks__goal {\n  position: absolute;\n  top: -3px; /* pokes slightly above the boundary line, sitting on the goal line */\n  left: 45%;\n  right: 45%;\n  height: 7px;\n  border: 1.5px solid var(--fx-line);\n  border-bottom: none; /* open toward the pitch */\n  opacity: 0.6;\n  box-sizing: border-box;\n}\n\n.fx-pitch-marks__spot {\n  position: absolute;\n  width: 4px;\n  height: 4px;\n  margin: -2px 0 0 -2px;\n  background: var(--fx-line);\n  border-radius: 50%;\n  opacity: 0.6;\n}\n\n.fx-pitch-marks__spot--penalty {\n  top: 56px;\n  left: 50%;\n}\n\n.fx-pitch-marks__spot--center {\n  left: 50%;\n  bottom: 6px; /* 8px boundary inset - 2px radius: centers the dot on the halfway line */\n  margin: 0 0 0 -2px;\n}\n\n.fx-pitch-marks__circle {\n  position: absolute;\n  left: 50%;\n  /* 8px (boundary inset, i.e. the halfway line's position) - 45px (radius):\n     centers the circle exactly on the halfway line so it bulges up into\n     the field; the lower half falls outside .fx-pitch__field's border box\n     and is clipped by its overflow: hidden. */\n  bottom: -37px;\n  width: 90px;\n  height: 90px;\n  margin-left: -45px;\n  border: 1.5px solid var(--fx-line);\n  border-radius: 50%;\n  opacity: 0.6;\n  box-sizing: border-box;\n}\n\n/* Narrow (mobile, ~414px) viewports get a proportionally smaller field --\n   shrink the circle to match, same fixed-px approach matchup.css uses at\n   its own breakpoint. Box marks need no adjustment: their % widths already\n   scale with the field. */\n@media (max-width: 480px) {\n  .fx-pitch-marks__circle {\n    width: 64px;\n    height: 64px;\n    margin-left: -32px;\n    bottom: -24px; /* 8px - 32px radius */\n  }\n}\n\n.fx-pitch__row {\n  display: flex;\n  justify-content: center;\n  gap: 10px;\n  flex-wrap: wrap;\n  position: relative;\n  z-index: 1;\n}\n\n.fx-bench {\n  background: #14181f;\n  padding: 12px 14px 16px;\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\n}\n\n.fx-bench__label {\n  color: #9aa4b2;\n  font-size: 11px;\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n  margin-bottom: 8px;\n}\n\n.fx-bench__row {\n  display: flex;\n  gap: 10px;\n  flex-wrap: wrap;\n}\n\n.fx-pitch__hint {\n  padding: 6px 14px 10px;\n  background: #14181f;\n  color: #7c8794;\n  font-size: 11px;\n  border-top: 1px solid rgba(255, 255, 255, 0.06);\n}\n\n.fx-list-collapsed {\n  display: none !important;\n}\n\n/* The \"Pitch Editor\" tab injected next to Fantrax's own \"Easy Click\" /\n   \"Classic\" pills. Styled to match rather than relying on their\n   (possibly view-encapsulated) CSS actually applying to a node we\n   inserted ourselves. */\n.fx-pitch-tab {\n  appearance: none;\n  border: none;\n  cursor: pointer;\n  padding: 7px 16px;\n  border-radius: 999px;\n  font-size: 13px;\n  font-weight: 600;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif;\n  color: #cfd6de;\n  background: transparent;\n  transition: background 0.15s ease, color 0.15s ease;\n}\n\n.fx-pitch-tab:hover {\n  background: rgba(255, 255, 255, 0.08);\n}\n\n.fx-pitch-tab--active {\n  background: #1e6b3a;\n  color: #fff;\n}\n\n.fx-pitch-tab--active:hover {\n  background: #1e6b3a;\n}\n\n/* Touch: keep a tap-and-hold on a card from triggering iOS's text-selection\n   callout or Android's native \"copy/share\" context menu -- that gesture is\n   reserved for lifting the card into drag mode (see drag.js touchstart). */\n.fx-card,\n.fx-card * {\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  user-select: none;\n}\n\n/* Floating clone that tracks the finger during a touch drag (drag.js\n   createTouchGhost). The real card stays in place, dimmed via the same\n   .fx-card--dragging rule the mouse path uses, so layout doesn't shift\n   under the thumb -- this is the \"lifted\" feedback the user actually sees. */\n.fx-card--touch-ghost {\n  position: fixed;\n  pointer-events: none;\n  z-index: 99999;\n  transform: scale(1.08);\n  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(91, 224, 138, 0.5);\n  opacity: 0.95;\n  transition: none;\n}\n\n\n/* ---- src/pitch-editor/card.css ---- */\n.fx-card {\n  position: relative;\n  width: 88px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  cursor: grab;\n  user-select: none;\n  border-radius: 8px;\n  padding: 5px 4px 6px;\n  background: transparent;\n  border: 1px solid transparent;\n  transition: box-shadow 0.12s ease, border-color 0.12s ease, background 0.12s ease, opacity 0.12s ease;\n}\n\n.fx-card:hover:not(.fx-card--locked):not(.fx-card--empty) {\n  background: rgba(0, 0, 0, 0.22);\n}\n\n.fx-card--locked {\n  cursor: not-allowed;\n}\n\n/* Empty slots are only meaningful while a swap is in progress (native drag,\n   or a card armed via \"Start Swap\") -- removed from layout entirely\n   otherwise, so a partially-filled row centers around its real players\n   only and reads like an actual formation instead of a full-width grid. */\n.fx-card--empty {\n  display: none;\n  cursor: default;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px dashed rgba(255, 255, 255, 0.25);\n  min-height: 78px;\n  justify-content: center;\n}\n\n.fx-card--empty.fx-card--empty-visible {\n  display: flex;\n}\n\n.fx-card--dragging {\n  opacity: 0.35;\n}\n\n.fx-card--armed {\n  border-color: #ffd166;\n  box-shadow: 0 0 0 2px rgba(255, 209, 102, 0.35);\n  background: rgba(255, 209, 102, 0.1);\n}\n\n/* A legal target, not currently under the cursor. */\n.fx-card--drag-target-valid {\n  box-shadow: 0 0 0 1px rgba(91, 224, 138, 0.35);\n}\n\n/* A legal target directly under the cursor during a native drag. */\n.fx-card--drop-target {\n  border-color: #5be08a;\n  box-shadow: 0 0 0 2px rgba(91, 224, 138, 0.4);\n  background: rgba(91, 224, 138, 0.12);\n}\n\n/* Not a legal target for the player currently being moved. */\n.fx-card--drag-invalid {\n  opacity: 0.35;\n  pointer-events: none;\n}\n\n/* Touch tap-select dimming -- action-menu.js's openActionMenu, via\n   FXShared.selectAndDim (src/shared/touch-overlay.js), dims every OTHER\n   card while the action menu is anchored to one on a coarse-pointer\n   (touch) device, so it's unambiguous which player the menu belongs to.\n   Cleared by closeActionMenu via FXShared.clearDim. Mirrors\n   matchup.css's `.fxm-card--dimmed` exactly (same opacity, same\n   transition) for visual consistency between the two features -- own\n   class name/own rule here rather than a shared CSS class, since each\n   feature's card component is styled independently. */\n.fx-card--dimmed {\n  opacity: 0.35;\n  transition: opacity 0.2s ease;\n}\n\n.fx-card__crest {\n  width: auto;\n  height: 46px;\n  max-width: 52px;\n  object-fit: contain;\n  margin-bottom: 2px;\n  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.55));\n  pointer-events: none;\n}\n\n.fx-card__pos {\n  position: absolute;\n  top: 2px;\n  left: 2px;\n  font-size: 8px;\n  font-weight: 700;\n  color: #0e1116;\n  background: rgba(245, 247, 250, 0.9);\n  border-radius: 3px;\n  padding: 0 3px;\n  pointer-events: none;\n}\n\n/* Groups the name/fpts/opp text below the jersey on its own translucent dark\n   plate -- the pitch background is bright green and varies row to row, so\n   white text alone isn't reliably legible without it. Stretches to the\n   card's full (fixed) width regardless of how narrow its own text is. The\n   card's own :hover background (above) sits underneath this and is mostly\n   swallowed by it -- keep the alpha here moderate so a hover still reads as\n   a highlight rather than the text going fully opaque-on-black. */\n.fx-card__info {\n  align-self: stretch;\n  background: rgba(0, 0, 0, 0.45);\n  border-radius: 6px;\n  padding: 2px 5px 3px;\n  /* Centers all children (name/fpts/opp, and anything added later) in one\n     place rather than relying on each child to carry its own text-align. */\n  text-align: center;\n}\n\n.fx-card__name {\n  font-size: 10.5px;\n  color: #fff;\n  text-align: center;\n  line-height: 1.2;\n  max-width: 84px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  pointer-events: none;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);\n  margin-top: 1px;\n}\n\n/* Long names that don't fit in the 84px box marquee instead of truncating.\n   render.js measures every card after each render and only adds this class\n   (plus --fx-marquee-dist, how far left the inner span needs to travel) to\n   names that actually overflow -- names that fit are left completely alone.\n   The event-status dot lives outside `.fx-card__name-inner` (see renderCard\n   in render.js) so it stays fixed in place while only the name text\n   scrolls. text-overflow only matters for the non-marquee ellipsis case\n   above, but `clip` here avoids Safari/Firefox drawing an ellipsis over the\n   animating text at the extremes of its travel. */\n.fx-card__name--marquee {\n  text-overflow: clip;\n}\n\n.fx-card__name-inner {\n  display: inline-block;\n  will-change: transform;\n}\n\n.fx-card__name--marquee .fx-card__name-inner {\n  animation: fx-marquee 6s ease-in-out infinite alternate;\n}\n\n/* Hold at each extreme (0%-15% and 85%-100%) so the reader gets a beat to\n   start/finish reading before the direction reverses, instead of the text\n   immediately snapping into motion. */\n@keyframes fx-marquee {\n  0%,\n  15% {\n    transform: translateX(0);\n  }\n  85%,\n  100% {\n    transform: translateX(var(--fx-marquee-dist));\n  }\n}\n\n/* Fantrax's own real-life \"is this player playing\" indicator, reused here.\n   See EVENT_STATUS_MAP in roster.js for what each color means. */\n.fx-card__dot {\n  display: inline-block;\n  width: 6px;\n  height: 6px;\n  border-radius: 50%;\n  margin-right: 3px;\n  margin-bottom: 1px;\n  pointer-events: auto;\n}\n\n.fx-card__dot--starting {\n  background: hsl(160 84% 38%);\n}\n\n.fx-card__dot--expected {\n  background: hsl(27 100% 61%);\n}\n\n.fx-card__dot--bench {\n  background: hsl(46 97% 65%);\n}\n\n.fx-card__dot--out {\n  background: hsl(349.7 80% 60.2%);\n}\n\n.fx-card__fpts {\n  font-size: 11px;\n  font-weight: 700;\n  pointer-events: none;\n  margin-top: 1px;\n}\n\n.fx-card__fpts--pos {\n  color: #ffd166;\n}\n\n.fx-card__fpts--neg {\n  color: #ff8a80;\n}\n\n.fx-card__fpts--zero {\n  color: #aeb8c4;\n}\n\n.fx-card__opp {\n  font-size: 8.5px;\n  color: #cfe0ea;\n  opacity: 0.75;\n  text-align: center;\n  line-height: 1.25;\n  max-width: 86px;\n  overflow: hidden;\n  text-overflow: clip;\n  white-space: nowrap;\n  pointer-events: none;\n  margin-top: 2px;\n}\n\n/* Long game/opponent lines that don't fit in the 86px box marquee instead of\n   truncating -- same mechanism as .fx-card__name--marquee above (see that\n   comment and applyMarquee/MARQUEE_SETS in render.js), just applied to a\n   different element and reusing the SAME fx-marquee keyframes rather than a\n   duplicate declaration. text-overflow stays `clip` here too, avoiding\n   Safari/Firefox drawing an ellipsis over the animating text at the\n   extremes of its travel. */\n.fx-card__opp--marquee {\n  text-overflow: clip;\n}\n\n.fx-card__opp-inner {\n  display: inline-block;\n  will-change: transform;\n}\n\n.fx-card__opp--marquee .fx-card__opp-inner {\n  animation: fx-marquee 6s ease-in-out infinite alternate;\n}\n\n.fx-card__plus {\n  font-size: 20px;\n  color: rgba(255, 255, 255, 0.35);\n  pointer-events: none;\n}\n\n\n/* ---- src/pitch-editor/tooltip.css ---- */\n.fx-card-tip {\n  position: fixed;\n  z-index: 2147483647;\n  background: #12181f;\n  color: #f5f7fa;\n  border: 1px solid rgba(255, 255, 255, 0.14);\n  padding: 8px 10px;\n  border-radius: 6px;\n  font-size: 11.5px;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif;\n  line-height: 1.5;\n  pointer-events: none;\n  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);\n  width: max-content;\n  max-width: min(260px, calc(100vw - 16px));\n  box-sizing: border-box;\n  display: none;\n}\n\n.fx-card-tip--visible {\n  display: block;\n}\n\n.fx-card-tip__title {\n  font-weight: 700;\n  color: #fff;\n  margin-bottom: 3px;\n  white-space: normal;\n  overflow-wrap: break-word;\n}\n\n.fx-card-tip__row {\n  color: #cfd6de;\n  white-space: normal;\n  overflow-wrap: break-word;\n}\n\n/* Colored (+N)/(-N) points span inside a hybrid stat line -- built by\n   FXShared.renderStatLine (src/shared/touch-overlay.js), classed\n   `fxs-stat-pts fxs-stat-pts--pos|neg|zero` and styled once in\n   src/shared/touch-overlay.css. Was `.fx-tip-pts--*` here; removed in\n   favor of the shared classes (also used by matchup's tooltip) so the\n   color values can't drift between the two features again. */\n\n\n/* ---- src/pitch-editor/action-menu.css ---- */\n.fx-action-menu {\n  position: fixed;\n  z-index: 2147483647;\n  background: #12181f;\n  border: 1px solid rgba(255, 255, 255, 0.14);\n  border-radius: 8px;\n  padding: 4px;\n  min-width: 160px;\n  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif;\n  display: flex;\n  flex-direction: column;\n  gap: 1px;\n}\n\n.fx-action-menu__item {\n  appearance: none;\n  border: none;\n  background: transparent;\n  color: #f5f7fa;\n  font-size: 12.5px;\n  text-align: left;\n  padding: 8px 10px;\n  border-radius: 5px;\n  cursor: pointer;\n}\n\n.fx-action-menu__item:hover:not(:disabled) {\n  background: rgba(255, 255, 255, 0.08);\n}\n\n.fx-action-menu__item--danger {\n  color: #ff8a80;\n}\n\n.fx-action-menu__item--disabled,\n.fx-action-menu__item:disabled {\n  color: #5b6472;\n  cursor: not-allowed;\n}\n\n/* Read-only stats block (coarse-pointer/touch only -- see action-menu.js).\n   Mirrors the hover tooltip's title/row hierarchy at menu-appropriate\n   sizing. Not a button: default cursor, no hover state, doesn't act. */\n.fx-action-menu__stats {\n  cursor: default;\n  max-height: 40vh;\n  overflow-y: auto;\n  padding: 6px 10px;\n}\n\n.fx-action-menu__stats-title {\n  font-size: 12px;\n  font-weight: 700;\n  color: #fff;\n  margin-bottom: 3px;\n  white-space: normal;\n  overflow-wrap: break-word;\n}\n\n.fx-action-menu__stats-row {\n  font-size: 11.5px;\n  color: #cfd6de;\n  line-height: 1.5;\n  white-space: normal;\n  overflow-wrap: break-word;\n}\n\n.fx-action-menu__divider {\n  height: 1px;\n  margin: 4px 6px;\n  background: rgba(255, 255, 255, 0.14);\n  flex: none;\n}\n\n\n/* ---- src/matchup/matchup.css ---- */\n/**\n * Fantrax Refinements -- Matchup Pitch styles\n * ---------------------------------------------------------------------\n * All classes are prefixed `fxm-` (never `fx-`) -- Fantrax's own code uses\n * an `fx-` prefix itself (fx-nav, fx-layout__pane, ...) and this\n * extension's existing pitch-editor feature also uses `fx-card`/`fx-pitch`\n * etc., so a distinct prefix avoids any collision with either.\n *\n * The single breakpoint below (760px) is what flips the pitch between the\n * wide \"horizontal\" layout (teams face each other left/right) and the\n * narrow \"vertical\" one (teams face each other top/bottom) -- render.js's\n * DOM is identical in both cases; only flex-direction and which field-mark\n * group is visible change. Kept in sync with FXM.NARROW_BREAKPOINT_PX in\n * state.js (that constant isn't read by this file, it's just a comment\n * pointer for anyone changing one side to change the other).\n * ---------------------------------------------------------------------\n */\n\n.fxm-matchup {\n  --fxm-green-1: #1e6b3a;\n  --fxm-green-2: #268049;\n  --fxm-line: rgba(255, 255, 255, 0.55);\n  margin: 12px 0 18px;\n  border-radius: 12px;\n  overflow: hidden;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif;\n}\n\n/* ---------- top bar (title + hide/show toggle) ---------- */\n\n.fxm-topbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  background: #0e1116;\n  padding: 8px 14px;\n  color: #f5f7fa;\n  font-size: 13px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\n}\n\n.fxm-topbar__title {\n  font-weight: 700;\n  letter-spacing: 0.02em;\n}\n\n.fxm-toggle-btn {\n  appearance: none;\n  border: none;\n  cursor: pointer;\n  padding: 5px 14px;\n  border-radius: 999px;\n  font-size: 12px;\n  font-weight: 600;\n  font-family: inherit;\n  color: #cfd6de;\n  background: rgba(255, 255, 255, 0.08);\n  transition: background 0.15s ease;\n}\n\n.fxm-toggle-btn:hover {\n  background: rgba(255, 255, 255, 0.16);\n}\n\n/* ---------- body layout + team headers ---------- */\n/* .fxm-body is a CSS grid so each team header AND each team's bench strip\n   can be its own top-level grid item (neither nested in a shared \"header\n   bar\"/\"bench bar\" wrapper) and get repositioned purely by which named\n   area matchup.css assigns it at each breakpoint -- wide: both headers\n   share one row above the field and both benches share one row below it\n   (visually the old single header bar / single bench bar). Narrow: home's\n   header+bench sit above the field next to home's half, away's\n   header+bench sit below the field next to away's half -- see the\n   `@media (max-width: 760px)` override below for the split. */\n.fxm-body {\n  display: grid;\n  /* minmax(0, 1fr), not plain 1fr -- a bare `1fr` track still has an\n     implicit automatic minimum width equal to its content's min-content\n     size, so an oversized grid item (e.g. .fxm-field, if its own pitch\n     cards ever force it wider than intended -- see the narrow-viewport\n     card-shrink rules below) would inflate the WHOLE column/row instead of\n     being contained by it, dragging every other item sharing that track\n     (the team headers) wider too. minmax(0, 1fr) removes that implicit\n     minimum so the track -- and everything in it -- is bounded by the grid\n     container's actual width, the same role min-width:0 plays on a flex\n     item. */\n  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);\n  grid-template-areas:\n    \"home-header away-header\"\n    \"field field\"\n    \"home-bench away-bench\";\n}\n\n.fxm-team-header {\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  background: #0e1116;\n  padding: 10px 14px;\n  color: #f5f7fa;\n}\n\n.fxm-team-header--home {\n  grid-area: home-header;\n}\n\n.fxm-team-header--away {\n  grid-area: away-header;\n  align-items: flex-end;\n  text-align: right;\n}\n\n/* text-overflow is `clip`, never `ellipsis`, exactly per .fxm-card__name's\n   own comment below: a name that fits never truncates at all, so an\n   \"ellipsis for the fits case\" rule is both pointless and risky -- it can\n   only ever fire during the timing gap before render.js's\n   applyNameMarquee/applyMarqueeToSet measurement pass runs (fresh DOM,\n   animation not yet applied), which is exactly how a real overflowing name\n   could flash as a bare \"...\" with nothing else visible. `max-width` here\n   is only the OVERFLOW TRIGGER boundary applyMarqueeToSet reads\n   (scrollWidth vs. clientWidth) -- not a hard clip; a too-long team name\n   marquees instead of truncating, same treatment as player card names. */\n.fxm-team-header__name {\n  font-weight: 700;\n  font-size: 13px;\n  max-width: 240px;\n  overflow: hidden;\n  text-overflow: clip;\n  white-space: nowrap;\n}\n\n.fxm-team-header__name-text {\n  display: inline-block;\n}\n\n/* Applied by render.js's applyNameMarquee/applyMarqueeToSet only when the\n   name actually overflows its box -- mirrors .fxm-card__name--marquee's\n   own comment below, adapted for a header name that can be either\n   naturally left-aligned (home side, inherited default) or right-aligned\n   (away side, via .fxm-team-header--away's own `text-align: right` above,\n   which otherwise inherits straight down onto this element).\n   .fxm-team-header__name-text is display: inline-block, so its resting\n   (0%) static position sits wherever the CURRENT text-align puts it --\n   on the away side that's flush right, i.e. 0% would already show the\n   TAIL of the name with the start clipped off, and the translateX(0) ->\n   translateX(var(--fxm-marquee-dist)) range (computed by\n   applyMarqueeToSet as the exact scrollWidth - clientWidth overflow)\n   wouldn't line up with the text's true start/end either. Forcing\n   `text-align: left` here -- regardless of side -- makes the inner\n   span's static position flush with the box's left edge on BOTH sides\n   once marqueeing, so 0% always shows the real start of the name and the\n   animation's endpoint always shows the real end, exactly like\n   .fxm-card__name--marquee. Reuses the SAME `fxm-marquee` keyframes\n   player card names use (already parametrized entirely by\n   --fxm-marquee-dist, so nothing side-specific needs duplicating here). */\n.fxm-team-header__name--marquee {\n  text-align: left;\n}\n\n.fxm-team-header__name--marquee .fxm-team-header__name-text {\n  animation: fxm-marquee 6s ease-in-out infinite alternate;\n}\n\n/* Hero totals: the LIVE score is the whole point of this header, so it\n   reads first and reads big -- the projected total stays present but\n   deliberately secondary (small, muted) right beneath it. Stacked in a\n   column (rather than the old side-by-side row) so the hero number has\n   room to be 2-3x its old size without forcing the header wider. */\n.fxm-team-header__scores {\n  display: flex;\n  flex-direction: column;\n  margin-top: 4px;\n}\n\n.fxm-team-header__live {\n  color: #5be08a;\n  font-weight: 800;\n  font-size: 34px;\n  line-height: 1;\n  letter-spacing: -0.01em;\n}\n\n.fxm-team-header__projected {\n  color: #9aa4b2;\n  font-size: 12px;\n  font-weight: 600;\n  margin-top: 3px;\n}\n\n/* ---------- pitch field + markings ---------- */\n\n.fxm-field {\n  grid-area: field;\n  position: relative;\n  min-height: 480px;\n  padding: 16px 12px;\n  display: flex;\n  flex-direction: row;\n  background: repeating-linear-gradient(\n    to right,\n    var(--fxm-green-1) 0px,\n    var(--fxm-green-1) 46px,\n    var(--fxm-green-2) 46px,\n    var(--fxm-green-2) 92px\n  );\n}\n\n/* Plain divs (built once per render, both mark groups always present)\n   layered under the players; CSS alone decides which orientation's group\n   is visible so no re-render is needed on resize. Deliberately NOT an SVG\n   with a square viewBox stretched to the field's real (non-square) box --\n   that non-uniform scale turned the center circle into an ellipse and\n   made every stroke width uneven axis-to-axis. Round marks below use an\n   explicit equal px width/height (never a percentage of two\n   different-length axes) so they stay circular at any field size, and\n   every border is a real px value so stroke width stays uniform. */\n.fxm-marks {\n  position: absolute;\n  inset: 0;\n  z-index: 0;\n  pointer-events: none;\n}\n\n.fxm-marks__horizontal,\n.fxm-marks__vertical {\n  position: absolute;\n  inset: 0;\n}\n\n.fxm-marks__vertical {\n  display: none;\n}\n\n.fxm-marks__boundary {\n  position: absolute;\n  inset: 6px;\n  border: 1.5px solid var(--fxm-line);\n  border-radius: 6px;\n  opacity: 0.8;\n}\n\n/* halfway line -- vertical for the wide/horizontal orientation, horizontal\n   for the narrow/vertical one */\n.fxm-marks__halfway-v {\n  position: absolute;\n  top: 6px;\n  bottom: 6px;\n  left: 50%;\n  width: 1.5px;\n  background: var(--fxm-line);\n  opacity: 0.8;\n}\n\n.fxm-marks__halfway-h {\n  position: absolute;\n  left: 6px;\n  right: 6px;\n  top: 50%;\n  height: 1.5px;\n  background: var(--fxm-line);\n  opacity: 0.8;\n}\n\n.fxm-marks__circle {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  width: 96px;\n  height: 96px;\n  margin: -48px 0 0 -48px;\n  border: 1.5px solid var(--fxm-line);\n  border-radius: 50%;\n  opacity: 0.8;\n  box-sizing: border-box;\n}\n\n.fxm-marks__spot {\n  position: absolute;\n  width: 4px;\n  height: 4px;\n  margin: -2px 0 0 -2px;\n  background: var(--fxm-line);\n  border-radius: 50%;\n  opacity: 0.8;\n}\n\n.fxm-marks__spot--center {\n  top: 50%;\n  left: 50%;\n}\n\n.fxm-marks__spot--left {\n  top: 50%;\n  left: 10%;\n}\n\n.fxm-marks__spot--right {\n  top: 50%;\n  left: 90%;\n}\n\n.fxm-marks__spot--top {\n  top: 10%;\n  left: 50%;\n}\n\n.fxm-marks__spot--bottom {\n  top: 90%;\n  left: 50%;\n}\n\n.fxm-marks__box,\n.fxm-marks__box-inner {\n  position: absolute;\n  border: 1.5px solid var(--fxm-line);\n  opacity: 0.8;\n  box-sizing: border-box;\n}\n\n.fxm-marks__box--left {\n  left: 6px;\n  top: 26%;\n  bottom: 26%;\n  width: 15%;\n}\n\n.fxm-marks__box--right {\n  right: 6px;\n  top: 26%;\n  bottom: 26%;\n  width: 15%;\n}\n\n.fxm-marks__box-inner--left {\n  left: 6px;\n  top: 38%;\n  bottom: 38%;\n  width: 6%;\n}\n\n.fxm-marks__box-inner--right {\n  right: 6px;\n  top: 38%;\n  bottom: 38%;\n  width: 6%;\n}\n\n.fxm-marks__box--top {\n  top: 6px;\n  left: 26%;\n  right: 26%;\n  height: 15%;\n}\n\n.fxm-marks__box--bottom {\n  bottom: 6px;\n  left: 26%;\n  right: 26%;\n  height: 15%;\n}\n\n.fxm-marks__box-inner--top {\n  top: 6px;\n  left: 38%;\n  right: 38%;\n  height: 6%;\n}\n\n.fxm-marks__box-inner--bottom {\n  bottom: 6px;\n  left: 38%;\n  right: 38%;\n  height: 6%;\n}\n\n.fxm-half {\n  position: relative;\n  z-index: 1;\n  flex: 1;\n  min-width: 0;\n  display: flex;\n  flex-direction: row;\n  gap: 4px;\n}\n\n.fxm-line {\n  flex: 1;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  justify-content: space-evenly;\n  align-items: center;\n  gap: 10px;\n  padding: 4px 0;\n}\n\n/* ---------- player cards ---------- */\n\n.fxm-card {\n  position: relative;\n  width: 76px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  cursor: default;\n  /* Smooths the dim/undim toggle below -- without this the opacity change\n     on tap-select is an instant snap rather than a fade. Harmless on\n     desktop, where .fxm-card--dimmed is never applied (see render.js's\n     setSelectedCard -- touch-tap-only by design). */\n  transition: opacity 0.2s ease;\n}\n\n/* Touch tap-to-select (render.js's setSelectedCard, wired only off the\n   touchend tap path in attachHoverTooltip -- never off desktop\n   mouseenter/mouseleave) -- dims every OTHER card on the pitch/bench so\n   the tapped player's tooltip is unambiguous about which card it belongs\n   to. `.fxm-card--selected` carries no styling of its own on purpose: the\n   tapped card simply never gets `--dimmed`, so it stays exactly as it\n   already looked -- the class exists as a hook (and to make the \"who's\n   selected\" state explicit in the DOM) rather than to add its own visual\n   treatment. Cleared everywhere hideTooltip() is, since that's the single\n   choke point every close path (toggle-close, tap-outside, stale-target\n   scroll-hide) already routes through.\n   */\n.fxm-card--dimmed {\n  opacity: 0.35;\n}\n\n.fxm-card__crest {\n  width: auto;\n  height: 40px;\n  max-width: 46px;\n  object-fit: contain;\n  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.55));\n}\n\n/* Translucent dark plate behind the name/points, mirroring the\n   .fx-card__info treatment in pitch-editor/card.css -- the pitch\n   background is bright green and varies row to row, so plain white text\n   isn't reliably legible without it. Own class, own file: not shared with\n   pitch-editor's CSS. */\n.fxm-card__info {\n  align-self: stretch;\n  background: rgba(0, 0, 0, 0.45);\n  border-radius: 6px;\n  padding: 2px 4px 3px;\n  margin-top: 2px;\n}\n\n/* text-overflow is `clip`, never `ellipsis`, in EITHER state below. A name\n   that fits never truncates at all, so an \"ellipsis for the fits case\"\n   rule is both pointless and risky -- it can only ever fire during a\n   timing gap before render.js's applyNameMarquee measurement pass runs\n   (fresh DOM, animation not yet applied), which is exactly how a real\n   overflowing name could flash as a bare \"...\" with nothing else visible.\n   `clip` is safe unconditionally: a fitting name never overflows its box\n   in the first place, so there's nothing to clip either way. */\n.fxm-card__name {\n  font-size: 10px;\n  color: #fff;\n  text-align: center;\n  line-height: 1.2;\n  overflow: hidden;\n  text-overflow: clip;\n  white-space: nowrap;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);\n}\n\n.fxm-card__name-text {\n  display: inline-block;\n}\n\n/* Applied by render.js's applyNameMarquee only when the name actually\n   overflows its card -- a name that fits stays exactly as it was\n   (centered, non-animated). text-align switches to `left` here on\n   purpose: .fxm-card__name-text is display:inline-block, so under the\n   base `text-align: center` above its resting (0%) position is already\n   centered within the box -- i.e. clipped by roughly half the overflow on\n   BOTH sides before the animation even starts, and the translateX(0) ->\n   translateX(var(--fxm-marquee-dist)) range (computed by applyNameMarquee\n   as the exact scrollWidth - clientWidth overflow) then no longer lines up\n   with the text's true start/end. `text-align: left` makes the inner\n   span's static position flush with the box's left edge, so 0% shows the\n   real start of the name and the animation's endpoint shows the real end\n   -- the full name, not a middle slice. */\n.fxm-card__name--marquee {\n  text-align: left;\n}\n\n.fxm-card__name--marquee .fxm-card__name-text {\n  animation: fxm-marquee 6s ease-in-out infinite alternate;\n}\n\n@keyframes fxm-marquee {\n  0%,\n  15% {\n    transform: translateX(0);\n  }\n  85%,\n  100% {\n    transform: translateX(var(--fxm-marquee-dist));\n  }\n}\n\n/* Pre-kickoff player status dot -- Fantrax's OWN real-life \"is this player\n   playing\" indicator (the colored dot next to a player's name on the\n   roster list, driven by their `.scorer-icon--*` class -- see\n   parse.js's readEventStatus / render.js's EVENT_STATUS_LABEL), not a\n   guess of our own. Colors are a literal copy of pitch-editor/card.css's\n   .fx-card__dot--* values, for palette consistency between the two\n   features. Only rendered when parse.js actually found a `.scorer-icon`\n   for this player -- that indicator only exists pre-kickoff on Fantrax's\n   page, so a player whose game has started or finished simply gets no dot\n   at all (see render.js's renderCard); there's no \"finished\"/\"unknown\"\n   dot color any more.\n   Pinned to the CARD's own bottom-left corner (`.fxm-card` above is\n   `position: relative`) rather than inline next to the name -- inline\n   was eating width from an already name-space-starved box (that's the\n   whole reason names marquee) and could shrink a long name down to\n   nothing visible. Sitting over .fxm-card__info's rounded bottom-left\n   corner (the dark plate is the card's last/bottom child) keeps it clear\n   of the jersey image above and, since points text is centered, clear of\n   .fxm-card__pts too; the dark ring (box-shadow) keeps it legible even at\n   the rounded corner's edge where a sliver of the green pitch can show\n   through. Inset (positive offsets, not negative) so the whole dot sits\n   inside the card's box instead of straddling its edge.\n   Sitting in .fxm-card__info's bottom-left corner also puts it directly\n   over the START of .fxm-card__opp, .fxm-card__info's LAST child (the\n   game/opponent line, e.g. \"MUN 0 @ HUL 2 F\") -- and since that line's own\n   marquee scroll (see .fxm-card__opp--marquee below) rests flush left, the\n   dot would otherwise permanently sit on top of its first character(s).\n   render.js's renderCard adds `fxm-card--has-dot` to the CARD (only when\n   this dot actually renders) precisely so .fxm-card__opp can reserve left\n   padding clear of the dot's footprint -- see that rule below, next to\n   .fxm-card__opp's own styles. Same \"keep the dot clear of card content\"\n   intent as the jersey/points clearance above, just completing it for the\n   opp line too. */\n.fxm-card__dot {\n  position: absolute;\n  bottom: 4px;\n  left: 4px;\n  width: 7px;\n  height: 7px;\n  border-radius: 50%;\n  box-sizing: border-box;\n  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.55);\n  z-index: 2;\n}\n\n.fxm-card__dot--starting {\n  background: hsl(160 84% 38%);\n}\n\n.fxm-card__dot--expected {\n  background: hsl(27 100% 61%);\n}\n\n.fxm-card__dot--bench {\n  background: hsl(46 97% 65%);\n}\n\n.fxm-card__dot--out {\n  background: hsl(349.7 80% 60.2%);\n}\n\n.fxm-card__pts {\n  font-size: 11px;\n  font-weight: 700;\n  text-align: center;\n  margin-top: 1px;\n}\n\n.fxm-card__pts--pos {\n  color: #ffd166;\n}\n\n.fxm-card__pts--neg {\n  color: #ff8a80;\n}\n\n.fxm-card__pts--zero {\n  color: #aeb8c4;\n}\n\n/* Game/opponent line (e.g. \"MUN 0 @ HUL 2 F\"), under the points --\n   mirrors pitch-editor/card.css's .fx-card__opp treatment (small, muted,\n   centered) for visual consistency between the two features. Own class,\n   own rule: the shared piece is FXShared.formatOpp's formatting LOGIC\n   (src/shared/touch-overlay.js), not this CSS -- each feature's card\n   component is still styled independently, matching .fxm-card__dot's\n   comment on why colors are a literal copy rather than a shared class.\n   text-overflow is `clip`, never `ellipsis`, for the exact same reason as\n   .fxm-card__name above: a line that fits never truncates in the first\n   place, so an \"ellipsis for the fits case\" rule is both pointless and\n   risky -- it can only ever fire during the timing gap before render.js's\n   applyMarqueeToSet measurement pass runs. A too-long game/opponent line\n   marquees instead of truncating, same treatment as player card names and\n   team header names, and reuses the SAME `fxm-marquee` keyframes (see\n   .fxm-card__name--marquee) rather than a duplicate declaration. */\n.fxm-card__opp {\n  font-size: 8.5px;\n  color: #cfe0ea;\n  opacity: 0.75;\n  text-align: center;\n  line-height: 1.25;\n  overflow: hidden;\n  text-overflow: clip;\n  white-space: nowrap;\n  margin-top: 1px;\n}\n\n.fxm-card__opp-text {\n  display: inline-block;\n}\n\n/* Applied by render.js's applyMarqueeToSet only when the opp line actually\n   overflows its box -- text-align switches to `left` for the same reason\n   as .fxm-card__name--marquee's own comment above (the inner span's\n   resting 0% position must be flush with the box's true start, not its\n   centered default, for the translateX(0) -> translateX(var(\n   --fxm-marquee-dist)) range to line up with the text's real start/end). */\n.fxm-card__opp--marquee {\n  text-align: left;\n}\n\n.fxm-card__opp--marquee .fxm-card__opp-text {\n  animation: fxm-marquee 6s ease-in-out infinite alternate;\n}\n\n.fxm-card--bench .fxm-card__opp {\n  font-size: 7.5px;\n}\n\n/* Reserve room for .fxm-card__dot -- see that rule's own comment above for\n   the full \"why\" (the dot sits over .fxm-card__info's bottom-left corner,\n   the same corner .fxm-card__opp's text starts from). `.fxm-card--has-dot`\n   is added by render.js's renderCard ONLY when a dot actually renders for\n   this player, so a dot-less card's opp line keeps the full card width --\n   this must NOT be unconditional on .fxm-card__opp itself.\n   Sized from the dot's own real footprint (left offset + width + the 1px\n   box-shadow ring it's drawn with, plus ~2px breathing room), MINUS\n   .fxm-card__info's own existing left padding (4px main / 3px bench,\n   which .fxm-card__opp already sits behind before this rule even applies)\n   since that padding already buys back some of the clearance:\n     main:  dot right edge = 4px left + 7px wide + 1px ring = 12px;\n            + 2px breathing = 14px clear of the card's edge;\n            - 4px .fxm-card__info padding already there = 10px here.\n     bench: dot right edge = 2px left + 5px wide + 1px ring = 8px;\n            + 2px breathing = 10px clear of the card's edge;\n            - 3px .fxm-card__info padding already there = 7px here.\n   MUST be `margin-left`, not `padding-left` -- this was verified live (see\n   this feature's own test notes) and the difference matters a lot:\n   `overflow: hidden`'s clip boundary is the element's PADDING edge, so\n   padding is \"reserved\" only in the untransformed resting layout -- a\n   translateX() during the marquee scroll can still paint text INSIDE that\n   padding area. Live-testing a padding-left version by sweeping\n   translateX(0) through translateX(-overflow) in small steps and measuring\n   each frame's actual visible (clip-intersected) text box against the\n   dot's rect showed the two overlapping for nearly the ENTIRE scroll (every\n   sampled step past the very first few px) -- once the leading edge of the\n   text scrolls left of the box's own edge, the clip simply pins the\n   visible edge right back at that same left edge, i.e. still directly under\n   the dot, for the rest of the animation. `margin-left` fixes this for real\n   because margin sits OUTSIDE the box -- it moves the box's own edges (and\n   therefore `overflow: hidden`'s clip boundary) away from the dot, so no\n   content at any transform value can ever be painted in that reserved zone;\n   the same sweep test with margin-left instead showed zero overlap at every\n   sampled step across the full scroll range, both main and bench.\n   Still transparent to render.js's applyMarqueeToSet, which measures\n   .fxm-card__opp's own scrollWidth/clientWidth with no JS changes needed:\n   width: auto absorbs the new margin by shrinking the box's own computed\n   width (and therefore clientWidth) by that same amount, while scrollWidth\n   (still just the unclipped text width) doesn't shrink -- so the measured\n   overflow, and thus `--fxm-marquee-dist`, grows by exactly the margin\n   amount, identical to what a same-size padding-left would have produced\n   numerically (confirmed identical overflow-px readings in testing); the\n   difference is only in WHERE the reserved space physically lives (outside\n   the box vs. inside it), which is exactly what makes margin the one that\n   actually keeps the dot clear during the scroll, not just at rest.\n   Applies unconditionally (not just under `--marquee`) since a short,\n   non-scrolling opp line on a dotted card must also start clear of the dot\n   at rest, not just once it's overflowing. */\n.fxm-card--has-dot .fxm-card__opp {\n  margin-left: 10px;\n}\n\n.fxm-card--has-dot.fxm-card--bench .fxm-card__opp {\n  margin-left: 7px;\n}\n\n/* ---------- hover breakdown tooltip ---------- */\n/* Own `fxm-` classes mirroring pitch-editor/tooltip.css's `.fx-card-tip`\n   pattern exactly (fixed position, viewport-clamped by render.js's JS, own\n   stacking context) so the two features' tooltips never collide. */\n\n.fxm-tip {\n  position: fixed;\n  z-index: 2147483647;\n  background: #12181f;\n  color: #f5f7fa;\n  border: 1px solid rgba(255, 255, 255, 0.14);\n  padding: 8px 10px;\n  border-radius: 6px;\n  font-size: 11.5px;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif;\n  line-height: 1.5;\n  pointer-events: none;\n  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);\n  width: max-content;\n  max-width: min(260px, calc(100vw - 16px));\n  box-sizing: border-box;\n  display: none;\n}\n\n.fxm-tip--visible {\n  display: block;\n}\n\n.fxm-tip__title {\n  font-weight: 700;\n  color: #fff;\n  margin-bottom: 3px;\n  white-space: normal;\n  overflow-wrap: break-word;\n}\n\n.fxm-tip__row {\n  color: #cfd6de;\n  white-space: normal;\n  overflow-wrap: break-word;\n}\n\n/* Color-coded parenthetical signed-points suffix on a stat line, e.g. the\n   \"(+6)\" in \"1 Assists (Total) (+6)\" -- its own span, built by\n   FXShared.renderStatLine (src/shared/touch-overlay.js), classed\n   `fxs-stat-pts fxs-stat-pts--pos|neg|zero` and styled once in\n   src/shared/touch-overlay.css. Was `.fxm-tip__stat--*` here; removed in\n   favor of the shared classes (also used by pitch-editor's tooltip/action\n   menu) so the color values can't drift between the two features again. */\n\n/* ---------- bench strip ---------- */\n/* Each team's bench is its own top-level `.fxm-body` grid item now, not\n   nested inside a shared \"bench bar\" wrapper -- same restructuring as the\n   team headers above, and for the same reason: it's what lets the narrow\n   breakpoint move home's bench next to home's header/half and away's bench\n   next to away's, instead of the two benches always sitting together. See\n   the `@media (max-width: 760px)` override below for the split; wide\n   layout's \"home-bench away-bench\" area (in .fxm-body above) keeps them\n   side by side in one row, visually the old single bench bar. */\n.fxm-bench {\n  min-width: 0;\n  background: #14181f;\n  padding: 10px 14px 14px;\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\n}\n\n.fxm-bench--home {\n  grid-area: home-bench;\n  /* Small gap from away-bench sharing the same wide-layout row (there's no\n     grid gap between them -- see .fxm-body's own comment on why a grid gap\n     isn't used for the header row above; same reasoning applies here).\n     Reset back to the base 14px in the narrow media query below, where\n     each bench is full-width and no longer needs the extra separation. */\n  padding-right: 20px;\n}\n\n.fxm-bench--away {\n  grid-area: away-bench;\n  text-align: right;\n  padding-left: 20px;\n}\n\n.fxm-bench__label {\n  color: #9aa4b2;\n  font-size: 11px;\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n  margin-bottom: 6px;\n}\n\n.fxm-bench__row {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: flex-start;\n  gap: 6px;\n}\n\n.fxm-bench--away .fxm-bench__row {\n  justify-content: flex-end;\n}\n\n/* Bench cards are the exact same .fxm-card component as the pitch (see\n   \"player cards\" above) -- this modifier just shrinks it to fit a wrapping\n   strip instead of a fixed pitch line. */\n.fxm-card--bench {\n  width: 52px;\n}\n\n.fxm-card--bench .fxm-card__crest {\n  height: 28px;\n  max-width: 32px;\n}\n\n.fxm-card--bench .fxm-card__info {\n  padding: 1px 3px 2px;\n  margin-top: 1px;\n}\n\n.fxm-card--bench .fxm-card__name {\n  font-size: 8.5px;\n}\n\n.fxm-card--bench .fxm-card__dot {\n  width: 5px;\n  height: 5px;\n  bottom: 2px;\n  left: 2px;\n}\n\n.fxm-card--bench .fxm-card__pts {\n  font-size: 9.5px;\n  margin-top: 0;\n}\n\n/* ---------- narrow viewport: vertical pitch ---------- */\n\n@media (max-width: 760px) {\n  .fxm-marks__horizontal {\n    display: none;\n  }\n\n  .fxm-marks__vertical {\n    display: block;\n  }\n\n  /* Narrower field width in this orientation -- shrink the center circle\n     to match (still a fixed equal px width/height, so still perfectly\n     round; only the size differs). */\n  .fxm-marks__circle {\n    width: 76px;\n    height: 76px;\n    margin: -38px 0 0 -38px;\n  }\n\n  .fxm-field {\n    flex-direction: column;\n    min-height: 620px;\n    background: repeating-linear-gradient(\n      to bottom,\n      var(--fxm-green-1) 0px,\n      var(--fxm-green-1) 46px,\n      var(--fxm-green-2) 46px,\n      var(--fxm-green-2) 92px\n    );\n  }\n\n  .fxm-half {\n    flex-direction: column;\n  }\n\n  .fxm-line {\n    flex-direction: row;\n  }\n\n  /* Split each team's header AND bench onto its own side of the field:\n     home's header+bench stay above (next to home's half), away's\n     header+bench move below (next to away's half) instead of both headers\n     stacking together above the field and both benches stacking together\n     below it. Single column so each area is now its own full-width grid\n     row; bench sits between its own team's header and the field on each\n     side, mirrored top/bottom around the field. */\n  .fxm-body {\n    grid-template-columns: minmax(0, 1fr);\n    grid-template-areas:\n      \"home-header\"\n      \"home-bench\"\n      \"field\"\n      \"away-bench\"\n      \"away-header\";\n  }\n\n  .fxm-team-header--away {\n    align-items: flex-start;\n    text-align: left;\n  }\n\n  /* Each bench is full-width by itself at this breakpoint (no longer\n     sharing a row with the other team's bench) -- back to the base\n     symmetric padding instead of the wide layout's one-sided 20px used to\n     separate the two when they sit side by side. */\n  .fxm-bench--home {\n    padding-right: 14px;\n  }\n\n  .fxm-bench--away {\n    padding-left: 14px;\n    text-align: left;\n  }\n\n  .fxm-bench--away .fxm-bench__row {\n    justify-content: flex-start;\n  }\n\n  /* A full 5-wide line (e.g. defense/midfield) of fixed 76px pitch cards\n     doesn't fit a narrow viewport once .fxm-line flips to row direction\n     above -- .fxm-half/.fxm-line both already have `min-width: 0` so\n     they're WILLING to shrink, but nothing upstream forces them to: five\n     76px cards plus gaps (~420px) simply become the half/line/field's own\n     preferred content width, which .fxm-matchup's `overflow: hidden`\n     then silently clips on the right instead of visibly scrolling --\n     either way, real cards end up cut off-screen on a ~380-400px-wide\n     phone viewport. Fix at the source: shrink just the un-modified\n     (non-bench -- that's already its own compact 52px size at every\n     width) pitch card, and tighten the line's gap, so a 5-across line\n     comfortably fits. 5 * 58px + 4 * 6px gap = 314px, well inside a real\n     phone's available width even after Fantrax's own page chrome margins\n     (measured ~380-390px on a 414px-wide viewport). */\n  .fxm-line {\n    gap: 6px;\n  }\n\n  .fxm-card:not(.fxm-card--bench) {\n    width: 58px;\n  }\n\n  .fxm-card:not(.fxm-card--bench) .fxm-card__crest {\n    height: 32px;\n    max-width: 36px;\n  }\n\n  .fxm-card:not(.fxm-card--bench) .fxm-card__name {\n    font-size: 9px;\n  }\n\n  .fxm-card:not(.fxm-card--bench) .fxm-card__pts {\n    font-size: 10px;\n  }\n}\n";
  (document.head || document.documentElement).appendChild(style);
})();

// ---- src/shared/stat-names.js ----
/**
 * Fantrax Refinements -- shared stat abbreviation dictionary
 * ---------------------------------------------------------------------
 * Abbreviation -> full name, scraped from Fantrax's own Classic-view
 * header tooltips so it stays accurate to this league's stat set.
 * Shared between content.js (Simple-view tooltips) and pitch-editor.js
 * (points-breakdown hover) so the two don't drift out of sync.
 * ---------------------------------------------------------------------
 */
window.FX_STAT_NAMES = {
  GS: 'Games Started',
  Min: 'Minutes Played',
  CS: 'Clean Sheets On Field',
  GA: 'Goals Against',
  Sv: 'Saves',
  YC: 'Yellow Cards',
  RC: 'Red Cards',
  PKS: 'Penalty Kick Saves',
  SBON: 'Substitutions On',
  SBOF: 'Substitutions Off',
  TkW: 'Tackles Won',
  DIS: 'Dispossessed',
  G: 'Goals',
  KP: 'Key Passes (Assists on Shots)',
  AT: 'Assists (Total)',
  Int: 'Interceptions',
  CLR: 'Effective Clearances',
  CoS: 'Successful Dribbles (Contests Succeeded)',
  AER: 'Aerials Won',
  HCS: 'High Claims Succeeded',
  Sm: 'Smothers',
  OG: 'Own Goals',
  SOT: 'Shots on Target',
  SOP: 'Shots off the Post',
  ACNC: 'Accurate Crosses (No Corners)',
  BS: 'Blocked Shots',
  BCC: 'Big Chances Created',
  BCM: 'Big Chances Missed',
  PKM: 'Penalty Kicks Missed',
  PKD: 'Penalty Kicks Drawn',
  GAO: 'Goals Against Outfielders',
};

// ---- src/content/content.js ----
/**
 * Fantrax Refinements
 * ---------------------------------------------------------------------
 * 1) In "Simple" (Standard) live-scoring view, hovering a stat abbreviation
 *    (KP, INT, TkW, ...) shows a tooltip with what it stands for -- the
 *    same tooltip text Fantrax already shows on column headers in
 *    Classic view, just surfaced here too.
 *
 * 2) The tooltip is hybrid: it shows the raw counting stat AND the fantasy
 *    points it produced, regardless of which mode (Stats/Fpts) the table
 *    is currently in, e.g. hovering "AT 6" in Fpts mode (or "AT 1" in
 *    Stats mode) shows "1 Assists (Total) (+6)", with the "(+6)" part
 *    color-coded by sign (green positive / red negative / gray zero) via
 *    a <span class="fx-tooltip__pts--pos|neg|zero"> built with
 *    createElement/createTextNode -- see showTooltip(). This is a
 *    self-contained rendering path with its own classes in content.css,
 *    distinct from (and not reusing) pitch-editor/tooltip.js's or
 *    matchup/render.js's tooltips, since this content script may run
 *    before FXP/FXShared have populated window.FXP/window.FXShared.
 *    Because each mode only renders one of those two numbers at a time,
 *    this script periodically (throttled to every 30s, and only when
 *    the SET of distinct players on screen changes -- via a sorted
 *    name signature, not just a count, since switching to a different
 *    matchup via the page's own carousel is an SPA route change that
 *    swaps in an entirely different set of players but usually keeps
 *    the SAME roster size on each side -- or the throttle window has
 *    elapsed) briefly flips the Stats/Fpts toggle to the
 *    mode NOT currently showing, so it can snapshot that view's
 *    per-player values, then flips back to whatever mode the user was
 *    already in. The user's chosen mode is never changed permanently --
 *    this script only ever visits the other mode for a moment to read
 *    it, then restores the original.
 *
 * 3) That flip used to be genuinely VISIBLE -- the mode pill and the
 *    scoring table's values would visibly swap for a moment, most
 *    jarringly right on page load -- so it was removed entirely for one
 *    session. It's back, but now MASKED: while the flip-and-restore
 *    sequence is running, `fx-livescoring-syncing` is added to
 *    <html> and content.css hides (via `visibility: hidden`, never
 *    `display: none`, so nothing reflows) the mode pill-group and the
 *    scoring table's content -- the two regions that actually change
 *    value during the flip. The class comes off again once the sequence
 *    fully completes, success or failure. This is the exact same
 *    technique -- mask a programmatic UI flip with CSS visibility so the
 *    user never sees it -- that src/pitch-editor/points-sync.js already
 *    uses for its own analogous scrape (its `ensureSyncStyle`/
 *    `fx-syncing` class hides the roster page's Stats/Fantasy Points tab
 *    flip and period-dropdown overlay); this file is the live-scoring
 *    page's counterpart to that mechanism.
 *
 * 4) Snapshot caches are keyed by player name, not row position: on the
 *    matchup view a single ".scoring-table__row" holds TWO players (a
 *    home cell and an away cell side by side), so indexing by row would
 *    mix their stats together. Each stat chip's owning player is
 *    resolved via its ".scoring-table__cell" (falling back to the row)
 *    and its ".scorer__info__name a" text.
 *
 * 5) After each successful snapshot, the caches are published to
 *    window.FXC = { raw, fpts, capturedAt } for src/matchup/render.js to
 *    read as an ENHANCEMENT layer on top of its own always-available
 *    per-chip fallback (read-only; may be undefined before the first
 *    capture). This is the same cross-file-global mechanism as
 *    window.FXP/FX_STAT_NAMES, since content scripts of one extension
 *    share the isolated world.
 * ---------------------------------------------------------------------
 */
(function () {
  'use strict';

  // Abbreviation -> full name (shared with pitch-editor.js via stat-names.js).
  const ABBR_MAP = window.FX_STAT_NAMES;

  const THROTTLE_MS = 30000; // don't re-snapshot the counterpart mode more than every 30s
  const MASK_CLASS = 'fx-livescoring-syncing'; // see content.css; masks the flip below

  const state = {
    isToggling: false,
    lastCaptureAt: 0,
    lastNameSignature: null, // sorted, joined player names as of the last capture; see getPlayerNameSignature()
    rawCache: new Map(), // playerName -> Map(abbr -> raw stat value)
    fptsCache: new Map(), // playerName -> Map(abbr -> fantasy points value)
    tooltipEl: null,
  };

  // ---------- small DOM helpers ----------

  function getModeButtons() {
    const group = document.querySelector('pill-group[aria-label="Mode"]');
    if (!group) return null;
    const buttons = Array.from(group.querySelectorAll('button.pill'));
    const stats = buttons.find((b) => b.textContent.trim() === 'Stats');
    const fpts = buttons.find((b) => b.textContent.trim() === 'Fpts');
    if (!stats || !fpts) return null;
    return { stats, fpts };
  }

  function isActive(btn) {
    return btn.classList.contains('pill--active');
  }

  function getStatRows() {
    return Array.from(document.querySelectorAll('.scoring-table__row')).filter((row) =>
      row.querySelector('ul > li > b')
    );
  }

  // A ".scoring-table__row" can hold one player (Simple view) or two
  // (matchup view: a home cell and an away cell side by side), so stat
  // chips must be attributed to a player via their containing cell, not
  // the row -- falling back to the row's own name if there's no cell
  // wrapper (e.g. Simple view).
  function resolvePlayerName(b) {
    const cell = b.closest('.scoring-table__cell');
    const nameA =
      (cell && cell.querySelector('.scorer__info__name a')) ||
      b.closest('.scoring-table__row').querySelector('.scorer__info__name a');
    return nameA ? nameA.textContent.trim() : null;
  }

  // Signature of the SET of players currently rendered, used as the "did
  // the table change" signal for the capture throttle heuristic. Built
  // from ".scorer__info__name a" (not row count) since matchup rows hold
  // two players each. A plain COUNT of names is not enough: switching to
  // a different matchup via the page's own carousel replaces every player
  // on screen but almost always keeps the same roster size on each side,
  // so the count alone doesn't change -- the count-based heuristic missed
  // that case and left the caches (and window.FXC) holding the previous
  // matchup's players, keyed by names that no longer matched anything on
  // screen, until the time-based throttle eventually expired. Sorting
  // before joining keeps the signature stable regardless of DOM order, so
  // a live-score update for the SAME players (who didn't change) still
  // produces the SAME signature and correctly falls through to the
  // time-based throttle rather than re-snapshotting on every mutation.
  function getPlayerNameSignature() {
    const names = Array.from(
      document.querySelectorAll('.scoring-table__row .scorer__info__name a')
    )
      .map((a) => a.textContent.trim())
      .filter(Boolean);
    names.sort();
    return names.join('|');
  }

  function waitForNextRender() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 40)));
    });
  }

  function debounce(fn, ms) {
    let t = null;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  // ---------- per-player snapshot cache ----------

  // Reads whichever mode is currently live in the DOM into the given cache
  // (state.rawCache or state.fptsCache), keyed by player name: Map(playerName
  // -> Map(abbr -> value)). Keying by name (rather than row index) is what
  // keeps the two players sharing a matchup row from clobbering each other.
  function captureCache(cacheKey) {
    const map = new Map();
    document.querySelectorAll('.scoring-table__row ul > li > b').forEach((b) => {
      const abbr = b.textContent.trim();
      if (!abbr) return;
      const name = resolvePlayerName(b);
      if (!name) return; // no resolvable owning player -- skip this chip
      const li = b.closest('li');
      const value = li.textContent.replace(abbr, '').trim();
      if (!map.has(name)) map.set(name, new Map());
      map.get(name).set(abbr, value);
    });
    state[cacheKey] = map;
  }

  function lookupFromCache(bEl, cacheKey) {
    const name = resolvePlayerName(bEl);
    if (!name) return null;
    const playerMap = state[cacheKey].get(name);
    if (!playerMap) return null;
    const abbr = bEl.textContent.trim();
    return playerMap.get(abbr) || null;
  }

  // Publishes the current snapshot caches for src/matchup/* to consume.
  // Shape: { raw: Map(playerName -> Map(abbr -> rawValue)),
  //          fpts: Map(playerName -> Map(abbr -> fptsValue)),
  //          capturedAt: <Date.now() at capture time> }.
  // Replaced wholesale on every successful capture; treat as read-only.
  // May be undefined before the first capture completes.
  function publishFXC() {
    window.FXC = { raw: state.rawCache, fpts: state.fptsCache, capturedAt: Date.now() };
  }

  // ---------- counterpart-mode snapshot flow ----------

  // Whatever mode is currently active, capture it, briefly flip to the
  // OTHER mode and capture that too, then flip back to the original mode.
  // Only runs when actually needed (the set of on-screen players changed,
  // or the throttle window elapsed) -- never on every mutation. The flip
  // itself is masked (see the header comment, point 3) so it's never
  // visible to the user.
  async function snapshotCounterpart() {
    if (state.isToggling) return;
    const buttons = getModeButtons();
    if (!buttons) return; // mode toggle not found -- do nothing
    const { stats, fpts } = buttons;

    const onStats = isActive(stats);
    const onFpts = isActive(fpts);
    if (!onStats && !onFpts) return; // neither pill active -- unknown state, bail

    const rows = getStatRows();
    if (rows.length === 0) return;

    const nameSignature = getPlayerNameSignature();
    const needsCapture =
      state.lastNameSignature !== nameSignature || Date.now() - state.lastCaptureAt > THROTTLE_MS;
    if (!needsCapture) return;

    state.isToggling = true;
    const originalBtn = onStats ? stats : fpts;
    const otherBtn = onStats ? fpts : stats;
    try {
      // Capture whichever view is live right now -- no click involved, so
      // nothing to mask for this read.
      captureCache(onStats ? 'rawCache' : 'fptsCache');

      // Flip to the counterpart mode, capture it, then always flip back --
      // even if capturing throws -- so the user's mode is never left
      // changed. Masked for the whole flip-and-restore-back sequence (mask
      // added right before the first click, removed in `finally` once the
      // sequence fully completes) so the pill/table swap the user would
      // otherwise see never actually paints.
      document.documentElement.classList.add(MASK_CLASS);
      try {
        otherBtn.click();
        await waitForNextRender();
        captureCache(onStats ? 'fptsCache' : 'rawCache');
      } finally {
        if (!isActive(originalBtn)) {
          originalBtn.click();
          await waitForNextRender();
        }
        document.documentElement.classList.remove(MASK_CLASS);
      }

      state.lastNameSignature = nameSignature;
      state.lastCaptureAt = Date.now();
      publishFXC();
    } finally {
      state.isToggling = false;
    }
  }

  // ---------- tooltip ----------

  function ensureTooltipEl() {
    if (state.tooltipEl) return state.tooltipEl;
    const el = document.createElement('div');
    el.className = 'fx-tooltip';
    document.body.appendChild(el);
    state.tooltipEl = el;
    return el;
  }

  // `line` is either a plain string (rendered via textContent, as before)
  // or a hybrid { text, pts } object -- text is the raw-count/stat-name
  // part, pts is the already-signed points value WITHOUT parens. The
  // object case is rendered as "<text> (" + a colored pts span + ")",
  // built with createElement/createTextNode -- never innerHTML with
  // interpolated data.
  function showTooltip(line, x, y) {
    const el = ensureTooltipEl();
    while (el.firstChild) el.removeChild(el.firstChild);
    if (typeof line === 'string') {
      el.textContent = line;
    } else {
      el.appendChild(document.createTextNode(`${line.text} (`));
      const span = document.createElement('span');
      const n = parseFloat(line.pts);
      const cls = n > 0 ? 'fx-tooltip__pts--pos' : n < 0 ? 'fx-tooltip__pts--neg' : 'fx-tooltip__pts--zero';
      span.className = cls;
      span.textContent = line.pts;
      el.appendChild(span);
      el.appendChild(document.createTextNode(')'));
    }
    el.classList.add('fx-tooltip--visible');
    positionTooltip(x, y);
  }

  function positionTooltip(x, y) {
    const el = state.tooltipEl;
    if (!el) return;
    const offset = 14;
    let left = x + offset;
    let top = y + offset;
    const rect = el.getBoundingClientRect();
    if (left + rect.width > window.innerWidth - 8) {
      left = x - rect.width - offset;
    }
    if (top + rect.height > window.innerHeight - 8) {
      top = y - rect.height - offset;
    }
    el.style.left = `${Math.max(4, left)}px`;
    el.style.top = `${Math.max(4, top)}px`;
  }

  function hideTooltip() {
    if (state.tooltipEl) state.tooltipEl.classList.remove('fx-tooltip--visible');
  }

  function formatSigned(text) {
    const n = parseFloat(text);
    return n > 0 ? `+${text}` : text;
  }

  function findStatB(target) {
    return target.closest('.scoring-table__cell__content li > b');
  }

  document.addEventListener(
    'mouseover',
    (e) => {
      const b = findStatB(e.target);
      if (!b) return;
      const abbr = b.textContent.trim();
      const fullName = ABBR_MAP[abbr];
      if (!fullName) return;

      // The value under the cursor is always live/correct; only its
      // counterpart (the other mode's number) may come from cache.
      const li = b.closest('li');
      const liveValue = li ? li.textContent.replace(abbr, '').trim() : null;

      const buttons = getModeButtons();
      const onFpts = buttons && isActive(buttons.fpts);

      let raw = null;
      let fpts = null;
      if (onFpts) {
        fpts = liveValue;
        raw = lookupFromCache(b, 'rawCache');
      } else {
        raw = liveValue;
        fpts = lookupFromCache(b, 'fptsCache');
      }

      let line = fullName;
      if (raw && fpts) {
        line = { text: `${raw} ${fullName}`, pts: formatSigned(fpts) };
      } else if (raw) {
        line = `${fullName}, ${raw}`;
      } else if (fpts) {
        line = `${fullName}, ${fpts}`;
      }

      showTooltip(line, e.clientX, e.clientY);
    },
    true
  );

  document.addEventListener(
    'mousemove',
    (e) => {
      if (state.tooltipEl && state.tooltipEl.classList.contains('fx-tooltip--visible')) {
        if (findStatB(e.target)) positionTooltip(e.clientX, e.clientY);
      }
    },
    true
  );

  document.addEventListener(
    'mouseout',
    (e) => {
      if (findStatB(e.target)) hideTooltip();
    },
    true
  );

  // ---------- observe for SPA navigation / live updates ----------

  const debouncedSnapshot = debounce(snapshotCounterpart, 400);

  const observer = new MutationObserver(() => {
    if (state.isToggling) return;
    debouncedSnapshot();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // Initial run.
  snapshotCounterpart();
})();

// ---- src/shared/touch-overlay.js ----
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

// ---- src/pitch-editor/state.js ----
/**
 * Fantrax Refinements -- Pitch Editor: shared state + tiny DOM utils
 * ---------------------------------------------------------------------
 * Every pitch-editor file is a plain (non-module) script attached in
 * manifest.json, so they share one global scope. Rather than leaning on
 * that implicitly, each file wraps itself in an IIFE and reads/writes an
 * explicit `window.FXP` namespace -- this file creates it and must load
 * first. State lives in one place (`FXP.state`) so every module sees the
 * same live object.
 * ---------------------------------------------------------------------
 */
window.FXP = window.FXP || {};
(function (FXP) {
  'use strict';

  FXP.POS_ORDER = ['G', 'D', 'M', 'F'];
  FXP.POINTS_SYNC_THROTTLE_MS = 60000; // don't re-scrape the breakdown/projection tables more than every 60s
  FXP.PROJECTED_OPTION_TEXT = 'Projected - Per Game';

  FXP.state = {
    container: null,
    statusEl: null,
    armed: null, // { key, player }
    busy: false,
    tabActive: true, // pitch editor is the default sub-tab
    tabBtn: null,

    // last render's data, kept around so drag/arm interactions can look up
    // "is this other card a legal target" without re-scraping the page
    players: [],
    cardsByKey: new Map(), // player key -> rendered .fx-card element
    dragSource: null, // player currently mid native-drag (null otherwise)

    actionMenuEl: null,

    // hover: how a player got their points (or their projection, if unplayed)
    breakdownCache: new Map(), // name -> { lines: [{abbr, label, text}] }
    projectedCache: new Map(), // name -> projected FPts text for this gameweek
    pointsCacheAt: 0,
    pointsCacheGwKey: null,
    pointsSyncInFlight: false,
    tooltipEl: null,
    hoveredKey: null,
    lastMouseX: 0,
    lastMouseY: 0,
  };

  FXP.qa = function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  };

  FXP.delay = function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  FXP.overlayChildCount = function overlayChildCount() {
    const oc = document.querySelector('.cdk-overlay-container');
    return oc ? oc.children.length : 0;
  };
})(window.FXP);

// ---- src/pitch-editor/roster.js ----
/**
 * Fantrax Refinements -- Pitch Editor: read the real roster list
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

  const EVENT_STATUS_LABEL = {
    starting: 'Confirmed starting',
    expected: 'Expected to play',
    bench: 'Expected to be on the bench',
    out: 'Not expected to play',
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

// ---- src/pitch-editor/tabs.js ----
/**
 * Fantrax Refinements -- Pitch Editor: "Pitch Editor" tab next to Easy Click / Classic
 * ---------------------------------------------------------------------
 * Injects a third pill into Fantrax's real "Lineup change system" nav so
 * switching to/from the pitch view behaves exactly like switching between
 * Fantrax's own two options.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const qa = FXP.qa;
  const state = FXP.state;

  function findLineupSystemNav() {
    const buttons = qa('button.pill');
    const easy = buttons.find((b) => b.textContent.trim() === 'Easy Click');
    const classic = buttons.find((b) => b.textContent.trim() === 'Classic');
    if (!easy || !classic) return null;
    return { easy, classic, nav: easy.closest('nav') || easy.parentElement };
  }

  function setupTabs() {
    if (state.tabBtn && document.body.contains(state.tabBtn)) return; // already there
    const found = findLineupSystemNav();
    if (!found) return;
    const { easy, classic, nav } = found;

    const tabBtn = document.createElement('button');
    tabBtn.type = 'button';
    tabBtn.className = 'fx-pitch-tab';
    tabBtn.textContent = 'Pitch Editor';
    tabBtn.addEventListener('click', () => activateTab(true));
    nav.appendChild(tabBtn);
    state.tabBtn = tabBtn;

    [easy, classic].forEach((btn) => {
      btn.addEventListener('click', () => activateTab(false), true);
    });

    activateTab(state.tabActive);
  }

  function activateTab(on) {
    state.tabActive = on;
    if (state.tabBtn) state.tabBtn.classList.toggle('fx-pitch-tab--active', on);
    qa('.i-table').forEach((t) => t.classList.toggle('fx-list-collapsed', on));
    if (on) {
      FXP.render();
      if (state.container) state.container.style.display = '';
    } else if (state.container) {
      state.container.style.display = 'none';
    }
  }

  FXP.findLineupSystemNav = findLineupSystemNav;
  FXP.setupTabs = setupTabs;
  FXP.activateTab = activateTab;
})(window.FXP);

// ---- src/pitch-editor/render.js ----
/**
 * Fantrax Refinements -- Pitch Editor: render the pitch + bench
 * ---------------------------------------------------------------------
 * This file now loads on every fantrax.com page (see main.js), so render()
 * gates on the roster-only "Easy Click"/"Classic" nav before touching the
 * DOM -- otherwise a non-roster page with its own `.i-table` (standings,
 * players lists, ...) would get a stray empty `.fx-pitch` container.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const qa = FXP.qa;
  const state = FXP.state;
  const FXShared = window.FXShared;

  // ---------- jersey images (borrowed from Fantrax's own read-only pitch widget) ----------

  function buildJerseyMap() {
    const map = new Map();
    qa('league-team-roster-pitch-view figure.pitch-view__player').forEach((fig) => {
      const img = fig.querySelector('img');
      const capSpan = fig.querySelector('figcaption span');
      if (!img || !capSpan) return;
      const abbrName = capSpan.textContent.trim(); // e.g. "I. Maatsen"
      const lastWord = abbrName.split(/\s+/).pop();
      if (lastWord) map.set(lastWord.toLowerCase(), img.src);
    });
    return map;
  }

  // ---------- jersey URL construction from crest (mobile fallback + future matchup view) ----------
  // Fantrax's own crest images live at
  //   <origin>/assets/images/logos/sportsteam/<league>/<Team_Name>.png
  // and (EPL only) jersey images live at
  //   <origin>/assets/images/jerseys/epl/Premier-League-jersey_<Team_Name>.png       (outfield)
  //   <origin>/assets/images/jerseys/epl/Premier-League-jersey-logo_goalkeeper.png   (goalkeepers)
  // The "Premier-League-" filename prefix is EPL-specific, so this only applies when the
  // crest URL's league segment is "epl" -- other leagues have no known jersey URL pattern
  // and callers should fall back to showing the crest image itself.
  function jerseyFromCrest(crestUrl, pos) {
    if (!crestUrl) return null;
    const m = crestUrl.match(/^(.*)\/assets\/images\/logos\/sportsteam\/epl\/([^/]+)\.png$/);
    if (!m) return null;
    const origin = m[1];
    if (pos === 'G') return `${origin}/assets/images/jerseys/epl/Premier-League-jersey-logo_goalkeeper.png`;
    return `${origin}/assets/images/jerseys/epl/Premier-League-jersey_${m[2]}.png`;
  }

  // ---------- pitch field markings (goal end + half center-circle) ----------
  // Built once per render (render() wipes container.innerHTML every time
  // anyway) and appended to `.fx-pitch__field` before the position rows --
  // see the "pitch markings" comment block in pitch.css for the layout
  // rationale and why divs rather than a stretched SVG.
  function buildPitchMarks() {
    const marks = document.createElement('div');
    marks.className = 'fx-pitch-marks';

    const box18 = document.createElement('div');
    box18.className = 'fx-pitch-marks__box fx-pitch-marks__box--18';
    marks.appendChild(box18);

    const box6 = document.createElement('div');
    box6.className = 'fx-pitch-marks__box fx-pitch-marks__box--6';
    marks.appendChild(box6);

    const goal = document.createElement('div');
    goal.className = 'fx-pitch-marks__goal';
    marks.appendChild(goal);

    const penaltySpot = document.createElement('div');
    penaltySpot.className = 'fx-pitch-marks__spot fx-pitch-marks__spot--penalty';
    marks.appendChild(penaltySpot);

    const circle = document.createElement('div');
    circle.className = 'fx-pitch-marks__circle';
    marks.appendChild(circle);

    const centerSpot = document.createElement('div');
    centerSpot.className = 'fx-pitch-marks__spot fx-pitch-marks__spot--center';
    marks.appendChild(centerSpot);

    return marks;
  }

  function ensureContainer() {
    if (state.container && document.body.contains(state.container)) return state.container;
    const anchor = document.querySelector('.i-table');
    if (!anchor) return null;
    const wrapper = document.createElement('div');
    wrapper.className = 'fx-pitch';
    anchor.parentElement.insertBefore(wrapper, anchor);
    state.container = wrapper;
    return wrapper;
  }

  function render() {
    if (!state.tabActive) return;
    // The content script now runs on every fantrax.com page (SPA navigation
    // means the roster URL match alone can't be relied on to inject us), so
    // bail before touching the DOM unless we're actually on the roster page
    // -- identified by the "Easy Click"/"Classic" lineup-system nav that only
    // exists there. Without this, ensureContainer() would insert an empty
    // `.fx-pitch` next to any `.i-table` on non-roster pages (standings,
    // players lists, etc. all use that class too).
    if (!FXP.findLineupSystemNav()) return;
    const container = ensureContainer();
    if (!container) return;
    const players = FXP.parseRoster();
    if (!players.length) return;

    container.innerHTML = '';
    FXP.closeActionMenu();
    state.armed = null;
    state.dragSource = null;
    state.players = players;
    state.cardsByKey = new Map();
    const jerseyMap = buildJerseyMap();

    const header = document.createElement('div');
    header.className = 'fx-pitch__header';
    const title = document.createElement('div');
    title.className = 'fx-pitch__title';
    title.textContent = 'Lineup (drag to swap)';
    const status = document.createElement('div');
    status.className = 'fx-pitch__status';
    header.appendChild(title);
    header.appendChild(status);
    container.appendChild(header);
    state.statusEl = status;

    const field = document.createElement('div');
    field.className = 'fx-pitch__field';
    field.appendChild(buildPitchMarks());
    const active = players.filter((p) => !p.isReserve);
    FXP.POS_ORDER.forEach((pos) => {
      const rowPlayers = active.filter((p) => p.pos === pos);
      if (!rowPlayers.length) return;
      const row = document.createElement('div');
      row.className = 'fx-pitch__row';
      rowPlayers.forEach((p) => row.appendChild(renderCard(p, jerseyMap)));
      field.appendChild(row);
    });
    container.appendChild(field);

    const bench = document.createElement('div');
    bench.className = 'fx-bench';
    const label = document.createElement('div');
    label.className = 'fx-bench__label';
    label.textContent = 'Bench';
    const benchRow = document.createElement('div');
    benchRow.className = 'fx-bench__row';
    players.filter((p) => p.isReserve).forEach((p) => benchRow.appendChild(renderCard(p, jerseyMap)));
    bench.appendChild(label);
    bench.appendChild(benchRow);
    container.appendChild(bench);

    const hint = document.createElement('div');
    hint.className = 'fx-pitch__hint';
    hint.textContent =
      'Drag a player onto another to swap them, or click a player for more actions. Only ' +
      'legal targets light up while dragging or after "Start Swap". Hover a player to see ' +
      "how they got their points, or their projection if they haven't played yet. Switch to " +
      '"Easy Click" or "Classic" above to use Fantrax\'s own list instead.';
    container.appendChild(hint);

    FXP.maybeSyncPointsData();
    applyMarquee(container);
  }

  // ---------- marquee for long player names + game/opponent text ----------
  // Truncating with an ellipsis (the old .fx-card__name/.fx-card__opp
  // behavior) hides part of the text entirely; this instead lets text that
  // overflows its fixed box scroll slowly back and forth so the whole
  // string is readable. Text that already fits is untouched -- no
  // class/property gets added and the inner span just sits static like
  // plain text always did. Originally name-only; now shared (via
  // MARQUEE_SETS below) with the game/opponent line under a player's fpts
  // (.fx-card__opp), for the exact same reason and mechanism.
  //
  // Reads (scrollWidth/clientWidth) and writes (class/style) are batched into
  // two separate passes over all cards so measuring one card's layout never
  // gets invalidated by a style write made for another card (avoids thrash).
  // The whole thing runs inside a rAF so it happens after the browser has
  // laid out the cards just appended to `container`.
  //
  // card.css declares `fx-marquee` as `... infinite alternate`, i.e. it
  // already plays forward then reverses (ping-pongs) on its own -- but
  // render() calls container.innerHTML = '' and rebuilds every card from
  // scratch on *every* re-render (this pitch editor re-renders often: the
  // MutationObserver debounce, points-sync, gameweek changes, ...), and a
  // freshly-created DOM node's CSS animation always restarts at 0%. Since
  // re-renders happen well inside a single 6s cycle, a marqueeing name never
  // gets to finish a leg -- let alone reverse -- before it's torn down and
  // recreated at position 0, which reads to the user as "it keeps resetting
  // to the start" rather than the ping-pong it's declared to be. To fix
  // that, we persist each marqueeing player's cycle start time (keyed by
  // their stable roster `p.key`) across renders in state.marqueeStarts, and
  // apply a negative `animation-delay` below equal to how far into the
  // current 6s cycle we already are -- a negative delay tells the browser to
  // act as though the animation already ran that long, so a brand-new node
  // resumes mid-cycle instead of restarting at 0%.
  // Element sets that get the marquee treatment, each with its own inner
  // span selector + marquee class. `keyPrefix` namespaces the persisted
  // state.marqueeStarts key derived from the card's own p.key
  // (card.dataset.key) so the SAME card's name entry and opp-line entry can
  // never collide -- mirrors matchup/render.js's 'opp:' prefix over its own
  // marqueeKey scheme for the exact same reason.
  const MARQUEE_SETS = [
    { selector: '.fx-card__name', innerSelector: '.fx-card__name-inner', marqueeClass: 'fx-card__name--marquee', keyPrefix: '' },
    { selector: '.fx-card__opp', innerSelector: '.fx-card__opp-inner', marqueeClass: 'fx-card__opp--marquee', keyPrefix: 'opp:' },
  ];

  function applyMarquee(container) {
    // Defensive init (not part of state.js's shape) -- see comment above.
    state.marqueeStarts = state.marqueeStarts || new Map();
    requestAnimationFrame(() => {
      const overflowing = [];
      // Pass 1: measure only, across both element sets above (name AND
      // opp/game-text line -- same mechanism, same rAF pass, so measuring
      // one never gets invalidated by a style write made for the other).
      MARQUEE_SETS.forEach(({ selector, innerSelector, marqueeClass, keyPrefix }) => {
        qa(selector, container).forEach((el) => {
          const inner = el.querySelector(innerSelector);
          if (!inner) return;
          const dist = inner.scrollWidth - el.clientWidth;
          if (dist > 1) {
            const card = el.closest('.fx-card');
            const key = card && card.dataset.key ? `${keyPrefix}${card.dataset.key}` : null;
            overflowing.push({ el, inner, dist, key, marqueeClass });
          }
        });
      });
      // Pass 2: write only.
      const now = Date.now();
      const cycleMs = 6000; // must match fx-marquee's animation-duration in card.css
      // Rebuild the map with only this render's marqueeing keys, carrying
      // forward their existing start times -- drops players (and opp lines)
      // that are no longer present or no longer overflowing so it can't
      // grow unbounded.
      const nextStarts = new Map();
      overflowing.forEach(({ el, inner, dist, key, marqueeClass }) => {
        el.classList.add(marqueeClass);
        el.style.setProperty('--fx-marquee-dist', `-${dist}px`);
        if (!key) return;
        const startTime = state.marqueeStarts.get(key) || now;
        nextStarts.set(key, startTime);
        const offsetSec = ((now - startTime) % cycleMs) / 1000;
        inner.style.animationDelay = `-${offsetSec}s`;
      });
      state.marqueeStarts = nextStarts;
    });
  }

  function renderCard(p, jerseyMap) {
    const card = document.createElement('div');
    card.className = 'fx-card';
    card.dataset.key = p.key;
    if (p.isEmpty) card.classList.add('fx-card--empty');
    if (p.locked) card.classList.add('fx-card--locked');

    if (p.isEmpty) {
      const plus = document.createElement('div');
      plus.className = 'fx-card__plus';
      plus.textContent = '+';
      card.appendChild(plus);
      const posTag = document.createElement('div');
      posTag.className = 'fx-card__pos';
      posTag.textContent = p.pos;
      card.appendChild(posTag);
    } else {
      const posTag = document.createElement('div');
      posTag.className = 'fx-card__pos';
      posTag.textContent = p.pos;
      card.appendChild(posTag);

      const lastWord = p.name.split(/\s+/).pop().toLowerCase();
      const mapHit = jerseyMap && jerseyMap.get(lastWord);
      const constructed = !mapHit && jerseyFromCrest(p.crest, p.pos);
      const jerseySrc = mapHit || constructed || p.crest;
      if (jerseySrc) {
        const img = document.createElement('img');
        img.className = 'fx-card__crest';
        img.src = jerseySrc;
        img.alt = '';
        img.draggable = false;
        // A constructed URL is a guess (see jerseyFromCrest above) -- if it 404s,
        // degrade to the crest image instead of leaving a broken-image icon.
        if (constructed && p.crest && constructed !== p.crest) {
          img.onerror = () => {
            img.onerror = null;
            img.src = p.crest;
          };
        }
        card.appendChild(img);
      }

      const info = document.createElement('div');
      info.className = 'fx-card__info';

      const name = document.createElement('div');
      name.className = 'fx-card__name';
      if (p.eventStatus) {
        const dot = document.createElement('span');
        dot.className = `fx-card__dot fx-card__dot--${p.eventStatus}`;
        dot.title = FXP.EVENT_STATUS_LABEL[p.eventStatus] || '';
        name.appendChild(dot);
      }
      // The dot (real-life event-status indicator) stays put outside the
      // scrolling span -- only the name text itself marquees. See the
      // measure/apply pass at the end of render() for how
      // `fx-card__name--marquee` and `--fx-marquee-dist` get set on `name`.
      const nameInner = document.createElement('span');
      nameInner.className = 'fx-card__name-inner';
      nameInner.appendChild(document.createTextNode(p.name));
      name.appendChild(nameInner);
      info.appendChild(name);

      if (p.fptsText && p.fptsText !== '-') {
        const fpts = document.createElement('div');
        const n = parseFloat(p.fptsText);
        const kind = n > 0 ? 'pos' : n < 0 ? 'neg' : 'zero';
        fpts.className = `fx-card__fpts fx-card__fpts--${kind}`;
        fpts.textContent = p.fptsText;
        info.appendChild(fpts);
      }

      const opp = FXShared.formatOpp(p.oppText);
      if (opp) {
        const oppEl = document.createElement('div');
        oppEl.className = 'fx-card__opp';
        // Text lives in an inner span, mirroring .fx-card__name-inner --
        // see applyMarquee/MARQUEE_SETS, which measures/animates this
        // exactly like a player card's name (own 'opp:'-prefixed
        // state.marqueeStarts key so it can't collide with this same
        // card's name entry).
        const oppInner = document.createElement('span');
        oppInner.className = 'fx-card__opp-inner';
        oppInner.appendChild(document.createTextNode(opp));
        oppEl.appendChild(oppInner);
        info.appendChild(oppEl);
      }

      card.appendChild(info);
    }

    state.cardsByKey.set(p.key, card);
    FXP.wireCardInteractions(card, p);
    return card;
  }

  FXP.buildJerseyMap = buildJerseyMap;
  FXP.jerseyFromCrest = jerseyFromCrest;
  FXP.ensureContainer = ensureContainer;
  FXP.buildPitchMarks = buildPitchMarks;
  FXP.render = render;
  FXP.renderCard = renderCard;
})(window.FXP);

// ---- src/pitch-editor/drag.js ----
/**
 * Fantrax Refinements -- Pitch Editor: drag / click-to-select interactions
 * ---------------------------------------------------------------------
 * A "source" player becomes active either by starting a native drag, by
 * tap-and-hold on a touch device, or by choosing "Start Swap" from a
 * card's action menu. Either way, every other card is immediately
 * classified as a legal or illegal target for that source and styled
 * accordingly (illegal targets dim and stop accepting clicks/drops; empty
 * slots -- normally invisible -- only appear where the source could
 * actually land). This is the single source of truth for "can X go here"
 * so the drag preview and the click-arm flow can't disagree.
 *
 * Touch devices never fire the HTML5 drag* events below (a touch gesture
 * just scrolls the page), so touchstart/touchmove/touchend/touchcancel
 * listeners run a parallel gesture: hold a draggable card for ~375ms
 * without moving more than a few px to "lift" it (a floating ghost clone
 * tracks the finger from then on), then drag over a target and release.
 * That path re-parses the roster on drop and calls FXP.attemptSwap just
 * like the mouse `drop` handler, and reuses isValidDropTarget/
 * highlightValidTargets so both paths agree on "can X go here."
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const state = FXP.state;

  const TOUCH_LONG_PRESS_MS = 375; // hold this long without moving to lift a card
  const TOUCH_MOVE_CANCEL_PX = 10; // finger moves more than this before the hold fires => treat as a scroll

  // Touch gesture state. Only one touch drag can be in flight at a time
  // (same invariant as state.dragSource for mouse), so this lives at
  // module scope rather than per-card -- touchmove/touchend always retarget
  // to the element that received the touchstart, so the same closure keeps
  // receiving events for the whole gesture even as the finger moves.
  let touchTimer = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchActive = false; // true once the long-press has "lifted" the card
  let touchSourcePlayer = null;
  let touchSourceCard = null;
  let touchGhostEl = null;
  let touchTargetCard = null; // card currently under the finger, if valid
  let suppressNextClick = false; // swallow the synthetic click browsers fire after a touch drag

  function isValidDropTarget(source, target) {
    if (!source || !target) return false;
    if (source.key === target.key) return false;
    if (source.locked || target.locked) return false;
    if (source.pos !== target.pos) return false;
    if (!target.isEmpty && source.isReserve === target.isReserve) return false;
    return true;
  }

  function highlightValidTargets(source) {
    state.players.forEach((p) => {
      if (p.key === source.key) return;
      const card = state.cardsByKey.get(p.key);
      if (!card) return;
      const valid = isValidDropTarget(source, p);
      if (p.isEmpty) {
        card.classList.toggle('fx-card--empty-visible', valid);
      } else {
        card.classList.toggle('fx-card--drag-invalid', !valid);
        card.classList.toggle('fx-card--drag-target-valid', valid);
      }
    });
  }

  function clearTargetHighlights() {
    state.cardsByKey.forEach((card) => {
      card.classList.remove(
        'fx-card--drag-invalid',
        'fx-card--drag-target-valid',
        'fx-card--empty-visible',
        'fx-card--drop-target'
      );
    });
  }

  // ---------- touch (tap-and-hold drag) ----------

  function clearTouchTimer() {
    if (touchTimer) {
      clearTimeout(touchTimer);
      touchTimer = null;
    }
  }

  function createTouchGhost(card) {
    const rect = card.getBoundingClientRect();
    const ghost = card.cloneNode(true);
    ghost.classList.add('fx-card--touch-ghost');
    ghost.style.position = 'fixed';
    ghost.style.left = `${rect.left}px`;
    ghost.style.top = `${rect.top}px`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.margin = '0';
    document.body.appendChild(ghost);
    return ghost;
  }

  function moveTouchGhost(x, y) {
    if (!touchGhostEl) return;
    // Offset above the fingertip so the thumb doesn't hide the card it's carrying.
    touchGhostEl.style.left = `${x - touchGhostEl.offsetWidth / 2}px`;
    touchGhostEl.style.top = `${y - touchGhostEl.offsetHeight / 2 - 28}px`;
  }

  function startTouchDrag(card, p, x, y) {
    touchTimer = null;
    if (state.busy || p.isEmpty || p.locked) return;
    FXP.closeActionMenu();
    if (state.armed && state.armed.key !== p.key) clearArmed(); // one active source at a time
    touchActive = true;
    touchSourcePlayer = p;
    touchSourceCard = card;
    state.dragSource = p;
    touchGhostEl = createTouchGhost(card); // clone the pristine card before dimming the original below
    card.classList.add('fx-card--dragging'); // same "this is the source" look as the mouse path
    highlightValidTargets(p);
    moveTouchGhost(x, y);
  }

  function updateTouchTarget(x, y) {
    const el = document.elementFromPoint(x, y);
    const cardEl = el && el.closest && el.closest('.fx-card');
    if (cardEl === touchTargetCard) return;
    if (touchTargetCard) touchTargetCard.classList.remove('fx-card--drop-target');
    touchTargetCard = null;
    if (!cardEl || !touchSourcePlayer) return;
    const target = state.players.find((x) => x.key === cardEl.dataset.key);
    if (target && isValidDropTarget(touchSourcePlayer, target)) {
      cardEl.classList.add('fx-card--drop-target');
      touchTargetCard = cardEl;
    }
  }

  function endTouchDrag() {
    if (touchSourceCard) touchSourceCard.classList.remove('fx-card--dragging');
    if (touchGhostEl) {
      touchGhostEl.remove();
      touchGhostEl = null;
    }
    touchTargetCard = null;
    touchActive = false;
    touchSourcePlayer = null;
    touchSourceCard = null;
    state.dragSource = null;
    clearTargetHighlights();
  }

  function finishTouchDrag() {
    const dropCard = touchTargetCard;
    const sourcePlayer = touchSourcePlayer;
    endTouchDrag();
    suppressNextClick = true;
    setTimeout(() => {
      suppressNextClick = false;
    }, 500);
    if (!dropCard || !sourcePlayer) return;
    const target = state.players.find((x) => x.key === dropCard.dataset.key);
    // Re-parse the roster for a fresh source, mirroring the mouse `drop` handler.
    const source = FXP.parseRoster().find((x) => x.key === sourcePlayer.key);
    if (!source || !target || !isValidDropTarget(source, target)) return;
    FXP.attemptSwap(source, target);
  }

  function wireCardInteractions(card, p) {
    const canDrag = !p.isEmpty && !p.locked;
    card.draggable = canDrag;

    card.addEventListener('dragstart', (e) => {
      if (!canDrag) {
        e.preventDefault();
        return;
      }
      FXP.closeActionMenu();
      if (state.armed && state.armed.key !== p.key) clearArmed(); // one active source at a time
      e.dataTransfer.setData('text/plain', p.key);
      e.dataTransfer.effectAllowed = 'move';
      card.classList.add('fx-card--dragging');
      state.dragSource = p;
      highlightValidTargets(p);
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('fx-card--dragging');
      state.dragSource = null;
      clearTargetHighlights();
    });
    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!state.dragSource || !isValidDropTarget(state.dragSource, p)) return;
      e.dataTransfer.dropEffect = 'move';
      card.classList.add('fx-card--drop-target');
    });
    card.addEventListener('dragleave', () => {
      card.classList.remove('fx-card--drop-target');
    });
    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.classList.remove('fx-card--drop-target');
      const sourceKey = e.dataTransfer.getData('text/plain');
      if (!sourceKey || sourceKey === p.key) return;
      const source = FXP.parseRoster().find((x) => x.key === sourceKey);
      if (!source || !isValidDropTarget(source, p)) return;
      FXP.attemptSwap(source, p);
    });

    // touchstart/touchmove/touchend/touchcancel never fire on mouse-only
    // (desktop) devices, so this block only meaningfully engages on touch --
    // the mouse drag* listeners above are untouched by its presence.
    card.addEventListener(
      'touchstart',
      (e) => {
        if (!canDrag) return;
        if (e.touches.length !== 1) return; // ignore multi-touch (pinch/scroll gestures)
        const t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        clearTouchTimer();
        touchTimer = setTimeout(() => startTouchDrag(card, p, t.clientX, t.clientY), TOUCH_LONG_PRESS_MS);
      },
      { passive: false }
    );

    card.addEventListener(
      'touchmove',
      (e) => {
        if (touchActive) {
          e.preventDefault(); // block page scroll once a card is lifted
          const t = e.touches[0];
          moveTouchGhost(t.clientX, t.clientY);
          updateTouchTarget(t.clientX, t.clientY);
          return;
        }
        if (!touchTimer) return;
        const t = e.touches[0];
        const dx = t.clientX - touchStartX;
        const dy = t.clientY - touchStartY;
        if (Math.hypot(dx, dy) > TOUCH_MOVE_CANCEL_PX) {
          clearTouchTimer(); // finger is scrolling, not holding -- let the page scroll
        }
      },
      { passive: false }
    );

    card.addEventListener(
      'touchend',
      (e) => {
        if (touchActive) {
          e.preventDefault();
          finishTouchDrag();
          return;
        }
        clearTouchTimer(); // released before the hold fired -- treat as a plain tap, let `click` handle it
      },
      { passive: false }
    );

    card.addEventListener('touchcancel', () => {
      clearTouchTimer();
      if (touchActive) endTouchDrag();
    });

    // iOS/Android's native long-press context menu would otherwise fight the lift gesture.
    card.addEventListener('contextmenu', (e) => {
      if (touchActive) e.preventDefault();
    });

    card.addEventListener('click', (e) => {
      if (suppressNextClick) return; // swallow the synthetic click after a completed touch-drag
      if (state.busy) return;
      if (!state.armed) {
        if (p.isEmpty) return; // nothing to act on
        FXP.openActionMenu(card, p, e.clientX, e.clientY);
        return;
      }
      if (state.armed.key === p.key) {
        clearArmed();
        return;
      }
      if (!isValidDropTarget(state.armed.player, p)) return;
      const source = state.armed.player;
      clearArmed();
      FXP.attemptSwap(source, p);
    });

    if (!p.isEmpty) {
      card.addEventListener('mouseenter', (e) => {
        state.hoveredKey = p.key;
        state.lastMouseX = e.clientX;
        state.lastMouseY = e.clientY;
        FXP.showCardTip(FXP.buildTooltipLines(p), e.clientX, e.clientY);
      });
      card.addEventListener('mousemove', (e) => {
        state.lastMouseX = e.clientX;
        state.lastMouseY = e.clientY;
        if (state.tooltipEl && state.tooltipEl.classList.contains('fx-card-tip--visible')) {
          FXP.positionCardTip(e.clientX, e.clientY);
        }
      });
      card.addEventListener('mouseleave', FXP.hideCardTip);
    }
  }

  function armCard(p) {
    clearArmed();
    const card = state.cardsByKey.get(p.key);
    if (!card) return;
    card.classList.add('fx-card--armed');
    state.armed = { key: p.key, player: p };
    highlightValidTargets(p);
  }

  function clearArmed() {
    if (state.armed) {
      const card = state.cardsByKey.get(state.armed.key);
      if (card) card.classList.remove('fx-card--armed');
    }
    state.armed = null;
    clearTargetHighlights();
  }

  FXP.isValidDropTarget = isValidDropTarget;
  FXP.highlightValidTargets = highlightValidTargets;
  FXP.clearTargetHighlights = clearTargetHighlights;
  FXP.wireCardInteractions = wireCardInteractions;
  FXP.armCard = armCard;
  FXP.clearArmed = clearArmed;
})(window.FXP);

// ---- src/pitch-editor/tooltip.js ----
/**
 * Fantrax Refinements -- Pitch Editor: hover tooltip
 * ---------------------------------------------------------------------
 * How a player got their points (a breakdown by scoring stat), or their
 * projection for the gameweek if they haven't played yet. Data comes from
 * points-sync.js's background cache. For a locked (already-played) player,
 * each breakdown line leads with the raw count, followed by the stat name,
 * then the signed points contribution in parentheses, e.g. "4 Saves (+2)"
 * -- falling back to the points-only form if a raw count isn't cached for
 * that stat yet.
 *
 * buildTooltipLines(p) returns an array whose entries are either a plain
 * string (title/loading/projection/fallback lines, rendered via
 * textContent) or, for a hybrid raw+points line, an object
 * { text: '4 Saves', pts: '+2' } -- text is the raw-count/stat-name part,
 * pts is the already-signed points value WITHOUT its parentheses. Rendering
 * is FXShared.renderStatLine (src/shared/touch-overlay.js), shared with
 * action-menu.js's buildStatsSection AND matchup/render.js's tooltip --
 * turns the object into "<text> (" + a colored
 * <span class="fxs-stat-pts fxs-stat-pts--pos|neg|zero"> + ")", built with
 * createElement/createTextNode -- never innerHTML with interpolated data.
 * The color reflects the sign of pts: green for positive, red for
 * negative, muted gray for zero.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const state = FXP.state;
  const FXShared = window.FXShared;

  // Defensive: state.js (owned elsewhere) may not yet declare this cache.
  state.rawStatsCache = state.rawStatsCache || new Map();

  function ensureCardTip() {
    if (state.tooltipEl && document.body.contains(state.tooltipEl)) return state.tooltipEl;
    const el = document.createElement('div');
    el.className = 'fx-card-tip';
    document.body.appendChild(el);
    state.tooltipEl = el;
    return el;
  }

  function showCardTip(lines, x, y) {
    if (!lines || !lines.length) return;
    const el = ensureCardTip();
    el.innerHTML = '';
    lines.forEach((line, i) => {
      const row = document.createElement('div');
      row.className = i === 0 ? 'fx-card-tip__title' : 'fx-card-tip__row';
      FXShared.renderStatLine(row, line);
      el.appendChild(row);
    });
    el.classList.add('fx-card-tip--visible');
    positionCardTip(x, y);
  }

  function positionCardTip(x, y) {
    const el = state.tooltipEl;
    if (!el) return;
    const offset = 14;
    let left = x + offset;
    let top = y + offset;
    const rect = el.getBoundingClientRect();
    if (left + rect.width > window.innerWidth - 8) left = x - rect.width - offset;
    if (top + rect.height > window.innerHeight - 8) top = y - rect.height - offset;
    el.style.left = `${Math.max(4, left)}px`;
    el.style.top = `${Math.max(4, top)}px`;
  }

  function hideCardTip() {
    if (state.tooltipEl) state.tooltipEl.classList.remove('fx-card-tip--visible');
    state.hoveredKey = null;
  }

  // Re-render the currently-open tooltip in place once a background sync
  // finishes -- covers the case where the user hovered before the data
  // (which takes a couple of seconds to fetch) had arrived.
  function refreshOpenTooltip() {
    if (!state.hoveredKey || !state.tooltipEl || !state.tooltipEl.classList.contains('fx-card-tip--visible')) return;
    const p = FXP.parseRoster().find((x) => x.key === state.hoveredKey);
    if (!p) return;
    showCardTip(buildTooltipLines(p), state.lastMouseX, state.lastMouseY);
  }

  function formatSigned(text) {
    const n = parseFloat(text);
    return n > 0 ? `+${text}` : text;
  }

  function buildTooltipLines(p) {
    if (p.isEmpty) return null;
    if (p.locked) {
      const entry = state.breakdownCache.get(p.name);
      if (!entry) return ['Loading points breakdown…'];
      if (!entry.lines.length) {
        return [`${p.fptsText || '0'} pts — no scoring stats this gameweek`];
      }
      const rawStats = state.rawStatsCache.get(p.name);
      const lines = [`${p.fptsText} pts:`];
      entry.lines.forEach((l) => {
        const raw = rawStats && rawStats.get(l.abbr);
        if (raw !== undefined) {
          lines.push({ text: `${raw} ${l.label}`, pts: formatSigned(l.text) });
        } else {
          lines.push(`${formatSigned(l.text)}  ${l.label}`);
        }
      });
      return lines;
    }
    const proj = state.projectedCache.get(p.name);
    if (proj === undefined) return ['Projected points not available yet'];
    const gw = FXP.getGameweekNumber();
    return [`Projected: ${proj} pts${gw ? ` (Gameweek ${gw})` : ''}`];
  }

  FXP.ensureCardTip = ensureCardTip;
  FXP.showCardTip = showCardTip;
  FXP.positionCardTip = positionCardTip;
  FXP.hideCardTip = hideCardTip;
  FXP.refreshOpenTooltip = refreshOpenTooltip;
  FXP.buildTooltipLines = buildTooltipLines;
})(window.FXP);

// ---- src/pitch-editor/points-sync.js ----
/**
 * Fantrax Refinements -- Pitch Editor: background scrape for points breakdown + projections
 * ---------------------------------------------------------------------
 * Fantrax's own roster table can show either raw stat counts, each stat's
 * Fantasy Points contribution, or a points *projection* -- but only one at
 * a time, chosen via the "Stats/Fantasy Points/..." tabs and the
 * "Stats: <period>" dropdown above the list. There's no API for this, so --
 * same approach as content.js's Stats/Fpts toggle on the live-scoring page
 * -- this briefly flips those real controls to snapshot the data, then
 * flips them back to whatever the user had. The pitch/bench view itself
 * doesn't move (the real list is hidden underneath it).
 *
 * Each run visits the Fantasy Points tab (per-stat points contributions,
 * `breakdownCache`) *and* the Stats tab (the same rows' raw counting
 * stats, `rawStatsCache`) so the hover tooltip can show both together, e.g.
 * "4 Saves (+2 pts)". The Stats tab is visited last and the original tab
 * is restored from there.
 *
 * The "Stats" period dropdown opens as a `mat-select` overlay -- on mobile
 * that overlay renders as a huge sheet, and the tab bar is a scrolling
 * strip, so without care this scrape reads as the whole page flickering
 * between filters. Two mitigations, both scoped to this file:
 *   1. While a sync is in flight we add `fx-syncing` to <html> and inject
 *      a one-time stylesheet that hides `.cdk-overlay-container` (and
 *      freezes its transitions), so the programmatically-opened dropdown
 *      sheet never actually paints. Only the brief Fantasy Points/Stats
 *      tab flip stays visible -- we don't hide the tab bar itself, since
 *      blanking it would just trade one flicker for another.
 *   2. On coarse-pointer (touch/mobile) devices we skip the normal 60s
 *      re-scrape throttle entirely and only sync when the Gameweek
 *      changes (or on a fresh page load) -- rare enough that the tab flip
 *      is a non-issue. Desktop keeps the 60s cadence.
 * A run that ends without committing fresh caches (unexpected layout, a
 * menu already open, a mid-flight abort) also backs off for
 * POINTS_SYNC_RETRY_MS before the next attempt, so a page that doesn't
 * match our expected layout doesn't retry on every render.
 *
 * Two more cases are treated as non-commits, both guarding against
 * scraping a gameweek's table while it's still mid-load right after a
 * gameweek switch: (1) if the Gameweek select no longer reads the same
 * value it did when this run started, the scrape belongs to a gameweek
 * that's no longer current, so it's discarded rather than committed over
 * good data; (2) if the roster visibly has players but the scrape came
 * back with zero rows, that's read as a still-loading table rather than a
 * genuinely empty breakdown, so it's discarded too. Both fall through to
 * the same `committed=false` backoff/retry path as any other failure.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const qa = FXP.qa;
  const delay = FXP.delay;
  const state = FXP.state;
  const overlayChildCount = FXP.overlayChildCount;

  // Defensive: state.js (owned elsewhere) may not yet declare this cache.
  state.rawStatsCache = state.rawStatsCache || new Map();

  // Local-only constants (state.js is owned elsewhere -- see file header).
  const POINTS_SYNC_RETRY_MS = 15000; // backoff before retrying a run that didn't commit fresh caches
  const SYNC_STYLE_ID = 'fx-sync-style';

  function isCoarsePointer() {
    // Evaluated at call time, not cached at module load -- device emulation
    // (devtools, or a real device's mode switch) can toggle this live.
    return window.matchMedia('(pointer: coarse)').matches;
  }

  function ensureSyncStyle() {
    if (document.getElementById(SYNC_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = SYNC_STYLE_ID;
    style.textContent =
      '.fx-syncing .cdk-overlay-container { visibility: hidden !important; }\n' +
      '.fx-syncing .cdk-overlay-container * { transition: none !important; }';
    document.head.appendChild(style);
  }

  function findStatsTabs() {
    const buttons = qa('button.tabs__item');
    const stats = buttons.find((b) => b.textContent.trim() === 'Stats');
    const fpts = buttons.find((b) => b.textContent.trim() === 'Fantasy Points');
    if (!stats || !fpts) return null;
    return { stats, fpts, buttons };
  }

  function isTabSelected(btn) {
    return btn.classList.contains('tabs__item--selected');
  }

  function findSelectByLabel(labelText) {
    return (
      qa('mat-select').find((s) => {
        const ff = s.closest('mat-form-field');
        const label = ff && ff.querySelector('.mdc-floating-label, mat-label, label');
        return label && label.textContent.trim() === labelText;
      }) || null
    );
  }

  function getGameweekNumber() {
    const gwSelect = findSelectByLabel('Gameweek');
    if (!gwSelect) return null;
    const m = gwSelect.textContent.trim().match(/^(\d+)/);
    return m ? m[1] : null;
  }

  async function chooseSelectOption(select, optionText) {
    select.click();
    await delay(300);
    const option = qa('mat-option').find((o) => o.textContent.trim() === optionText);
    if (!option) {
      document.body.click(); // best-effort: close whatever opened
      return false;
    }
    option.click();
    await delay(350);
    return true;
  }

  function readAllRows() {
    const out = [];
    qa('.i-table').forEach((t) => {
      // Desktop marks the header row `.i-table__row--header`. Mobile has no
      // such row -- its real header is `.i-table__row.i-table__header`, but
      // an *empty* decoy `div.single-header` (zero `.i-table__cell` kids)
      // also matches the old catch-all `[class*="header"]` selector and
      // would sort first, yielding an empty `headers` array. Pick the first
      // candidate that actually has header cells instead.
      const headerRow = qa(
        '.i-table__row--header, .i-table__row.i-table__header, [class*="header"]',
        t
      ).find((r) => r.querySelector(':scope > .i-table__cell'));
      if (!headerRow) return;
      const headers = qa(':scope > .i-table__cell', headerRow).map((c) => c.textContent.trim());
      qa('.i-table__row', t).forEach((row) => {
        const nameA = row.querySelector('.scorer__info__name a');
        if (!nameA) return; // header row / empty slot -- skip
        const cells = qa(':scope > .i-table__cell', row).map((c) => c.textContent.trim());
        out.push({ name: nameA.textContent.trim(), headers, cells });
      });
    });
    return out;
  }

  function maybeSyncPointsData() {
    if (state.pointsSyncInFlight) return;
    if (Date.now() - (state.pointsLastAttemptAt || 0) < POINTS_SYNC_RETRY_MS) return; // just tried and failed/aborted -- back off

    const gwKey = getGameweekNumber();
    if (gwKey !== state.pointsCacheGwKey) {
      syncPointsData(); // new gameweek (or first load ever) -- always resync
      return;
    }
    if (isCoarsePointer()) return; // mobile: only resync on a gameweek change, never on the 60s throttle

    const stale = Date.now() - state.pointsCacheAt > FXP.POINTS_SYNC_THROTTLE_MS;
    if (stale) syncPointsData();
  }

  async function syncPointsData() {
    if (state.pointsSyncInFlight || state.busy) return;
    const tabs = findStatsTabs();
    const periodSelect = findSelectByLabel('Stats');
    if (!tabs || !periodSelect) {
      state.pointsLastAttemptAt = Date.now(); // page isn't laid out as expected -- skip silently, but don't retry every render
      return;
    }
    if (overlayChildCount() > 0) {
      state.pointsLastAttemptAt = Date.now(); // don't fight an already-open menu
      return;
    }

    state.pointsSyncInFlight = true;
    state.busy = true;
    ensureSyncStyle();
    document.documentElement.classList.add('fx-syncing');
    const originalTabBtn = tabs.buttons.find(isTabSelected) || tabs.stats;
    const originalPeriodText = periodSelect.textContent.trim();
    const gwKey = getGameweekNumber();
    let committed = false;

    try {
      if (originalTabBtn !== tabs.fpts) {
        tabs.fpts.click();
        await delay(500);
      }
      if (overlayChildCount() > 0) return;

      const breakdown = new Map();
      readAllRows().forEach(({ name, headers, cells }) => {
        const lines = [];
        for (let i = 5; i < headers.length && i < cells.length; i++) {
          if (!parseFloat(cells[i])) continue; // 0, '-', empty -- not a contributor
          const abbr = headers[i];
          lines.push({ abbr, label: window.FX_STAT_NAMES[abbr] || abbr, text: cells[i] });
        }
        breakdown.set(name, { lines });
      });

      let projected = state.projectedCache;
      const opened = await chooseSelectOption(periodSelect, FXP.PROJECTED_OPTION_TEXT);
      if (opened) {
        projected = new Map();
        readAllRows().forEach(({ name, cells }) => projected.set(name, cells[3]));
        await chooseSelectOption(periodSelect, originalPeriodText);
      }

      // Stats tab: the same rows' raw counting stats. A stat can be worth 0
      // points yet still have a meaningful raw count (e.g. 0-value saves),
      // so keep every non-empty cell here rather than the breakdown loop's
      // "truthy points" filter -- only '-'/empty (no stat recorded) is skipped.
      tabs.stats.click();
      await delay(500);
      if (overlayChildCount() > 0) return;

      const raw = new Map();
      readAllRows().forEach(({ name, headers, cells }) => {
        const statMap = new Map();
        for (let i = 5; i < headers.length && i < cells.length; i++) {
          const text = cells[i];
          if (text === '' || text === '-') continue;
          statMap.set(headers[i], text);
        }
        raw.set(name, statMap);
      });

      // We always end this run on the Stats tab (above), so restore
      // whatever the user actually had selected, whenever that differs.
      if (originalTabBtn !== tabs.stats) {
        originalTabBtn.click();
        await delay(400);
      }

      // Guard 1: the gameweek select changed while we were mid-scrape (the
      // user flipped gameweeks again, or the new gameweek's table only
      // just finished swapping in under us). gwKey was captured at the
      // start of this run, so a mismatch here means everything we just
      // read belongs to a gameweek that's no longer current -- committing
      // it would overwrite good data with stale/wrong data. Leave the
      // existing caches alone; the `committed=false` backoff path below
      // will retry in POINTS_SYNC_RETRY_MS once things settle.
      const gwChangedMidSync = getGameweekNumber() !== gwKey;

      // Guard 2: an obviously-empty scrape. If the roster visibly has
      // players but readAllRows() found no rows/headers to read (breakdown
      // ends up empty), the table was almost certainly still mid-load when
      // we scraped it -- don't commit that as "the roster has no points
      // data". A roster that's *actually* empty (no name links at all) has
      // nothing false to report, so that case is still allowed to commit.
      const rosterHasPlayers = !!document.querySelector('.i-table .scorer__info__name a');
      const emptyScrape = rosterHasPlayers && breakdown.size === 0;

      if (!gwChangedMidSync && !emptyScrape) {
        state.breakdownCache = breakdown;
        state.rawStatsCache = raw;
        state.projectedCache = projected;
        state.pointsCacheAt = Date.now();
        state.pointsCacheGwKey = gwKey;
        committed = true;
        FXP.refreshOpenTooltip();
      }
    } catch (err) {
      // best-effort background sync -- leave the previous cache in place
    } finally {
      if (!committed) state.pointsLastAttemptAt = Date.now(); // didn't finish -- back off before the next attempt
      document.documentElement.classList.remove('fx-syncing');
      state.pointsSyncInFlight = false;
      state.busy = false;
    }
  }

  FXP.findStatsTabs = findStatsTabs;
  FXP.isTabSelected = isTabSelected;
  FXP.findSelectByLabel = findSelectByLabel;
  FXP.getGameweekNumber = getGameweekNumber;
  FXP.chooseSelectOption = chooseSelectOption;
  FXP.readAllRows = readAllRows;
  FXP.maybeSyncPointsData = maybeSyncPointsData;
  FXP.syncPointsData = syncPointsData;
})(window.FXP);

// ---- src/pitch-editor/swap.js ----
/**
 * Fantrax Refinements -- Pitch Editor: swap execution against the real Fantrax controls
 * ---------------------------------------------------------------------
 * A swap is: click the source player's `lineup-btn`, wait, click the
 * target's `lineup-btn`, wait, then re-read the list to see if the
 * source's active/reserve status (or position) actually changed. If
 * Fantrax opens its own popup/menu partway through (this happens if your
 * account's "Lineup change system" setting is "Classic" instead of
 * "Easy Click"), this backs off and lets you finish it there rather than
 * guessing which menu item to click.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const state = FXP.state;
  const delay = FXP.delay;
  const overlayChildCount = FXP.overlayChildCount;

  function setStatus(text, kind) {
    if (!state.statusEl) return;
    state.statusEl.textContent = text;
    state.statusEl.className = 'fx-pitch__status' + (kind ? ' fx-pitch__status--' + kind : '');
  }

  function findTargetButton(target) {
    if (!target.isEmpty) {
      const row = FXP.findRowByName(target.name);
      return row ? row.querySelector('button.lineup-btn') : null;
    }
    const candidates = FXP.getListRows().filter((r) => {
      const a = r.querySelector('.scorer__info__name a');
      const btn = r.querySelector('button.lineup-btn');
      const isReserve = r.classList.contains('row--amber');
      return !a && btn && btn.textContent.trim() === target.pos && isReserve === target.isReserve;
    });
    const row = candidates[target.emptyIndex];
    return row ? row.querySelector('button.lineup-btn') : null;
  }

  async function attemptSwap(source, target) {
    if (state.busy) return;
    if (source.locked || target.locked) {
      setStatus("Can't move a player whose game has already started or finished.", 'err');
      return;
    }
    if (source.isEmpty) {
      setStatus('Drag a player onto the empty slot, not the other way around.', 'err');
      return;
    }
    if (source.isReserve === target.isReserve && !target.isEmpty) {
      setStatus('Those are both ' + (source.isReserve ? 'on the bench' : 'active') + ' already — nothing to swap.', 'err');
      return;
    }

    state.busy = true;
    setStatus(`Swapping ${source.name} ↔ ${target.isEmpty ? 'empty slot' : target.name}…`);

    const beforeOverlay = overlayChildCount();
    const sourceRow = FXP.findRowByName(source.name);
    const sourceBtn = sourceRow && sourceRow.querySelector('button.lineup-btn');
    if (!sourceBtn) {
      setStatus("Couldn't find that player in the list anymore — try again.", 'err');
      state.busy = false;
      FXP.render();
      return;
    }

    sourceBtn.click();
    await delay(250);

    // A menu-based flow (e.g. "Classic" lineup change system) opens an overlay.
    // Back off and let the user finish it themselves rather than guessing which
    // menu item to pick.
    if (overlayChildCount() > beforeOverlay) {
      setStatus('Fantrax opened its own picker for this — finish the swap there, then check back.', 'err');
      state.busy = false;
      return;
    }

    const targetBtn = findTargetButton(target);
    if (!targetBtn) {
      setStatus("Couldn't find the target slot — try again.", 'err');
      state.busy = false;
      FXP.render();
      return;
    }

    targetBtn.click();
    await delay(450);

    if (overlayChildCount() > beforeOverlay) {
      setStatus('Fantrax opened its own picker for this — finish the swap there, then check back.', 'err');
      state.busy = false;
      return;
    }

    const after = FXP.parseRoster();
    const newSource = after.find((x) => !x.isEmpty && x.name === source.name);
    const success = !!newSource && (newSource.isReserve !== source.isReserve || newSource.pos !== source.pos);

    state.busy = false;
    FXP.render();

    if (success) {
      setStatus(`Swapped ${source.name} ↔ ${target.isEmpty ? 'active slot' : target.name}.`, 'ok');
    } else {
      setStatus(
        "That didn't go through. This can happen if either player's game has already started, or your league locks lineup changes once the gameweek begins.",
        'err'
      );
    }
  }

  FXP.setStatus = setStatus;
  FXP.findTargetButton = findTargetButton;
  FXP.attemptSwap = attemptSwap;
})(window.FXP);

// ---- src/pitch-editor/action-menu.js ----
/**
 * Fantrax Refinements -- Pitch Editor: per-player action menu
 * ---------------------------------------------------------------------
 * Clicking a player opens a small menu instead of immediately arming a
 * swap. "Start Swap" reuses the existing arm/highlight flow; Trade, Drop,
 * and View Player Card just click the equivalent real control already
 * sitting in that player's (hidden) list row -- Fantrax's own Trade
 * picker, Drop confirmation, and full player-card modal (Stats/Splits/
 * News/Watch List/Compare/Notes, all of Fantrax's own UI) open exactly as
 * they would from the real list, so none of that needs reimplementing here.
 *
 * Touch devices have no hover, so the points-breakdown/projection tooltip
 * (tooltip.js's FXP.buildTooltipLines) is otherwise unreachable there. On a
 * coarse-pointer device (checked at open time), this menu prepends a
 * read-only stats section above the action buttons with exactly those
 * tooltip lines, separated by a divider -- a static, non-clickable block
 * that just happens to live inside the same menu; it doesn't add any
 * behavior to the doc-click-outside-closes-menu or Escape-closes-menu
 * logic below. Desktop (fine pointer) keeps the plain button-only menu,
 * since the hover tooltip already covers stats there.
 *
 * buildTooltipLines() entries are either plain strings or hybrid
 * { text, pts } objects (see tooltip.js); buildStatsSection renders both
 * via the shared FXShared.renderStatLine() (src/shared/touch-overlay.js),
 * so the colored (+N)/(-N) points span looks identical here, in the hover
 * tooltip, AND in matchup's tooltip -- all three now go through one
 * function and one set of CSS classes (touch-overlay.css) instead of each
 * feature maintaining its own copy.
 *
 * On a coarse-pointer (touch) device this menu is anchored to the tapped
 * card -- not the raw tap coordinates -- via FXShared.anchorToElement, kept
 * stuck to the card through a scroll via FXShared.trackAnchor (closing the
 * menu if the card ever goes stale/detached), and dims every other
 * `.fx-card` via FXShared.selectAndDim while it's open. This mirrors
 * matchup's touch-tooltip mechanics exactly (same shared module, keyed
 * 'fxp' so its scroll-tracker can't collide with matchup's 'fxm' one). The
 * desktop (fine-pointer) menu keeps the original raw-coordinate
 * positioning (positionMenu below) -- it isn't anchored to any one card in
 * the same "don't cover the tapped player" sense a touch tap is, since a
 * mouse click's own cursor position is never mistaken for the card itself.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const state = FXP.state;
  const FXShared = window.FXShared;

  function triggerRowAction(p, selector) {
    const row = FXP.findRowByName(p.name);
    const el = row && row.querySelector(selector);
    if (el) el.click();
  }

  function buildMenuItems(p) {
    return [
      {
        label: 'Start Swap',
        disabled: p.locked,
        title: p.locked ? "Can't move -- their game has already started or finished." : '',
        action: () => FXP.armCard(p),
      },
      {
        label: 'Trade…',
        action: () => triggerRowAction(p, 'button.mat-gray--fill'),
      },
      {
        label: 'Drop…',
        danger: true,
        action: () => triggerRowAction(p, 'button.mat-red--fill'),
      },
      {
        label: 'View Player Card',
        action: () => triggerRowAction(p, '.scorer__info__name a'),
      },
    ];
  }

  function isCoarsePointer() {
    return window.matchMedia('(pointer: coarse)').matches;
  }

  // Read-only stats block for touch devices (no hover => no tooltip access).
  // Mirrors the hover tooltip's own line styling (title + muted rows), just
  // sized for the menu. Returns null when there's nothing to show, so the
  // caller can skip the section (and its divider) entirely.
  function buildStatsSection(p) {
    const lines = FXP.buildTooltipLines(p);
    if (!lines || !lines.length) return null;
    const section = document.createElement('div');
    section.className = 'fx-action-menu__stats';
    lines.forEach((line, i) => {
      const row = document.createElement('div');
      row.className = i === 0 ? 'fx-action-menu__stats-title' : 'fx-action-menu__stats-row';
      FXShared.renderStatLine(row, line);
      section.appendChild(row);
    });
    return section;
  }

  function onDocClick(e) {
    if (state.actionMenuEl && !state.actionMenuEl.contains(e.target)) closeActionMenu();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') closeActionMenu();
  }

  function closeActionMenu() {
    if (state.actionMenuEl) {
      state.actionMenuEl.remove();
      state.actionMenuEl = null;
    }
    // Single choke point for every close path (tap-outside via onDocClick,
    // Escape via onKeydown, or picking a menu item) -- tearing down the
    // scroll-tracker and clearing the tap-select dimming here means none
    // of those callers need to remember to do it themselves. Both are
    // no-ops when the menu was opened on the desktop (fine-pointer) path,
    // since only the coarse-pointer path below ever registers/dims them.
    FXShared.stopTrackingAnchor('fxp');
    FXShared.clearDim(state.container || document, '.fx-card', 'fx-card--dimmed');
    document.removeEventListener('click', onDocClick, true);
    document.removeEventListener('keydown', onKeydown, true);
  }

  // Desktop (fine-pointer) positioning only -- raw tap/click coordinates,
  // clamped to the viewport. See openActionMenu for why the coarse-pointer
  // (touch) path uses FXShared.anchorToElement against the card instead.
  function positionMenu(menu, x, y) {
    const rect = menu.getBoundingClientRect();
    let left = x;
    let top = y;
    if (left + rect.width > window.innerWidth - 8) left = window.innerWidth - rect.width - 8;
    if (top + rect.height > window.innerHeight - 8) top = window.innerHeight - rect.height - 8;
    menu.style.left = `${Math.max(4, left)}px`;
    menu.style.top = `${Math.max(4, top)}px`;
  }

  function openActionMenu(card, p, x, y) {
    closeActionMenu();
    FXP.hideCardTip();

    const menu = document.createElement('div');
    menu.className = 'fx-action-menu';
    const coarse = isCoarsePointer();

    if (coarse) {
      const statsSection = buildStatsSection(p);
      if (statsSection) {
        menu.appendChild(statsSection);
        const divider = document.createElement('div');
        divider.className = 'fx-action-menu__divider';
        menu.appendChild(divider);
      }
    }

    buildMenuItems(p).forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fx-action-menu__item' + (item.danger ? ' fx-action-menu__item--danger' : '');
      btn.textContent = item.label;
      if (item.title) btn.title = item.title;
      if (item.disabled) {
        btn.disabled = true;
        btn.classList.add('fx-action-menu__item--disabled');
      } else {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          closeActionMenu();
          item.action();
        });
      }
      menu.appendChild(btn);
    });

    document.body.appendChild(menu);
    state.actionMenuEl = menu;

    if (coarse) {
      // Anchor to the CARD (mirrors matchup's touch tooltip) rather than
      // the raw tap coordinates, so the menu never covers the tapped
      // player card -- the exact complaint that was just fixed for
      // matchup. FXShared.trackAnchor keeps it stuck to the card through a
      // scroll, closing the menu (via closeActionMenu, which also tears
      // down the tracker) if the card ever goes stale/detached from a
      // re-render.
      const reposition = () => FXShared.anchorToElement(menu, card, { gap: 8, margin: 8 });
      reposition();
      FXShared.trackAnchor('fxp', {
        overlayEl: menu,
        targetEl: card,
        isVisible: () => !!state.actionMenuEl,
        onReposition: reposition,
        onStale: closeActionMenu,
      });
      // Dim every other player card so it's unambiguous which one this
      // menu belongs to -- roster's equivalent of matchup's tap-select
      // dimming. Touch path only; desktop's menu isn't tied to a single
      // "selected" card in the same way.
      FXShared.selectAndDim(state.container || document, '.fx-card', card, 'fx-card--dimmed');
    } else {
      positionMenu(menu, x, y);
    }

    // Deferred so the click that opened the menu doesn't immediately close it.
    setTimeout(() => {
      document.addEventListener('click', onDocClick, true);
      document.addEventListener('keydown', onKeydown, true);
    }, 0);
  }

  FXP.openActionMenu = openActionMenu;
  FXP.closeActionMenu = closeActionMenu;
  FXP.triggerRowAction = triggerRowAction;
})(window.FXP);

// ---- src/pitch-editor/main.js ----
/**
 * Fantrax Refinements -- Pitch Editor: boot / keep in sync with live updates
 * ---------------------------------------------------------------------
 * Watches the page for changes (new gameweek, live score refresh, etc.)
 * and re-renders. Anything WE inserted (the pitch container, the injected
 * tab button, the hover tooltip, the action menu) is excluded from
 * "relevant" mutations -- otherwise our own tooltip/menu updates on every
 * mouseenter/click would themselves trigger a re-render, which tears down
 * and rebuilds every card mid-hover and reads as the hover state flickering.
 *
 * The tooltip, action menu, and touch-drag ghost are all appended directly
 * to document.body (not inside our container), so their insertion/removal
 * mutations have `target === document.body` -- not something a plain
 * "is the target inside one of our elements" check catches. Those
 * body-level insertions are excluded too: a mutation is treated as our own
 * whenever every added/removed node it carries is one of our elements, even
 * when the mutation's target itself is body.
 *
 * This file now loads on every fantrax.com page (SPA client-side navigation
 * means matching only the roster URL leaves the extension un-injected when
 * a user navigates to the roster without a full page load), so start()
 * caps its `.i-table` polling and starts observing regardless -- see
 * below. setupTabs() and render() each independently gate on roster-only
 * DOM markers, so observing off-roster is a safe no-op.
 *
 * points-sync.js sets `state.busy` for the ~2-3s it spends flipping the
 * real Stats/Fantasy Points tabs to scrape data (e.g. right after a
 * gameweek switch, while the new gameweek's table is still loading). We
 * never drop mutations that arrive during that window and never render
 * against a table mid-scrape: the observer callback always evaluates
 * relevance and calls scheduleRender(), and scheduleRender()'s deferred
 * callback (runScheduledRender) re-arms itself on a ~500ms timer for as
 * long as state.busy stays true, only rendering once it clears. That
 * guarantees the gameweek's final state gets rendered instead of silently
 * discarding the mutations a busy sync would otherwise have swallowed.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const state = FXP.state;

  let renderScheduled = false;
  function scheduleRender() {
    if (renderScheduled) return;
    renderScheduled = true;
    setTimeout(runScheduledRender, 500);
  }

  function runScheduledRender() {
    if (state.busy) {
      // A points-sync is in flight (e.g. mid-gameweek-switch). Don't render
      // against a table that's being flipped between Stats/Fantasy
      // Points/period tabs, and don't drop this render either -- keep
      // renderScheduled true and retry in ~500ms until busy clears. This
      // can't spin forever: points-sync.js always clears state.busy in its
      // `finally`, bounded by that function's own handful of ~300-500ms
      // delays, so the retry loop is bounded too.
      setTimeout(runScheduledRender, 500);
      return;
    }
    renderScheduled = false;
    FXP.setupTabs(); // re-inject the tab if Fantrax re-rendered the nav out from under us
    if (state.tabActive) FXP.render();
  }

  function isOwnMutation(target) {
    return (
      (state.container && state.container.contains(target)) ||
      (state.tabBtn && state.tabBtn.contains(target)) ||
      (state.tooltipEl && state.tooltipEl.contains(target)) ||
      (state.actionMenuEl && state.actionMenuEl.contains(target))
    );
  }

  // True when `node` is part of our own UI. Checked two ways, because a
  // body-appended element (tooltip / action menu / touch ghost) can already
  // be gone from `state` by the time this runs: MutationObserver callbacks
  // fire as a microtask, and e.g. closeActionMenu() nulls out
  // state.actionMenuEl synchronously right after removing the element, so a
  // just-*removed* menu node can no longer be recognized via the state
  // refs above. The class-name fallback covers that case. This must stay an
  // exact match (classList.contains), never a prefix/startsWith check --
  // Fantrax's own site classes also start with `fx-` (e.g. `fx-nav`), so a
  // prefix check would misclassify real Fantrax mutations as ours.
  const OWN_BODY_CLASSES = ['fx-card-tip', 'fx-action-menu', 'fx-card--touch-ghost'];
  function isOwnNode(node) {
    if (!node || node.nodeType !== 1) return false;
    if (isOwnMutation(node)) return true;
    return OWN_BODY_CLASSES.some((c) => node.classList.contains(c));
  }

  const observer = new MutationObserver((mutations) => {
    const relevant = mutations.some((m) => {
      if (isOwnMutation(m.target)) return false;
      const nodeCount = m.addedNodes.length + m.removedNodes.length;
      if (nodeCount === 0) return true; // nothing to inspect -- fall back to the target check above
      for (let i = 0; i < m.addedNodes.length; i++) {
        if (!isOwnNode(m.addedNodes[i])) return true;
      }
      for (let i = 0; i < m.removedNodes.length; i++) {
        if (!isOwnNode(m.removedNodes[i])) return true;
      }
      return false;
    });
    if (relevant) scheduleRender();
  });

  // The content script now runs on every fantrax.com page (SPA navigation
  // means the roster URL match alone can't be relied on to inject us), so
  // `.i-table` may never appear here at all -- e.g. on a page with no table
  // widget. Poll for it a bounded number of times (10 x 500ms = 5s, plenty
  // for a same-page async load) and start observing regardless once that
  // cap is hit, so a later SPA navigation into the roster page is still
  // caught by the observer. setupTabs()/render() both independently no-op
  // off-roster, so observing early (before `.i-table` shows up) is safe.
  const START_MAX_ATTEMPTS = 10;
  function start(attempt) {
    attempt = attempt || 0;
    if (!document.querySelector('.i-table') && attempt < START_MAX_ATTEMPTS) {
      setTimeout(() => start(attempt + 1), 500);
      return;
    }
    FXP.setupTabs();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  start();
})(window.FXP);

// ---- src/matchup/state.js ----
/**
 * Fantrax Refinements -- Matchup Pitch: shared state + tiny DOM utils
 * ---------------------------------------------------------------------
 * Same pattern as pitch-editor/state.js: every matchup file is a plain
 * (non-module) script attached in manifest.json, so they share one global
 * scope. Rather than leaning on that implicitly, each file wraps itself in
 * an IIFE and reads/writes an explicit `window.FXM` namespace -- this file
 * creates it and must load first. State lives in one place (`FXM.state`)
 * so every module sees the same live object.
 *
 * Note: `FXM.state` itself gets replaced wholesale below every time this
 * file runs (matches pitch-editor/state.js's own behavior). main.js relies
 * on that for a clean "state" reset across re-boots, but keeps its own
 * `FXM.observer`/`FXM.booted` flags directly on the FXM namespace (not in
 * `state`) so a re-boot can always find and tear down the previous
 * MutationObserver even if this file re-ran first -- see main.js.
 * ---------------------------------------------------------------------
 */
window.FXM = window.FXM || {};
(function (FXM) {
  'use strict';

  FXM.POS_ORDER = ['G', 'D', 'M', 'F'];
  // Kept in sync with matchup.css's own `@media (max-width: 760px)` breakpoint --
  // not read by CSS, just documents the number for anyone changing one side.
  FXM.NARROW_BREAKPOINT_PX = 760;

  FXM.state = {
    container: null, // outer .fxm-matchup wrapper
    bodyEl: null, // .fxm-body -- what the show/hide toggle controls
    toggleBtn: null,
    hidden: false, // in-memory only, per spec -- resets on page load/navigation
    renderScheduled: false,

    // hover breakdown tooltip (pitch + bench cards) -- same fixed-position
    // singleton-element pattern as pitch-editor/tooltip.js, own `fxm-` class.
    tooltipEl: null,
    hoveredName: null, // player name currently under the pointer, keyed the
    // same way window.FXC and parse.js's chip maps are (by name, not a
    // synthetic per-card key -- matchup cards have no such key today)
    lastMouseX: 0,
    lastMouseY: 0,
    // Card element the tooltip is anchored to when opened via touch (tap),
    // vs. the desktop mouse path which tracks the cursor via lastMouseX/Y
    // instead and never sets this. Set on tap-open, cleared on hide -- see
    // render.js's showTooltipForCard/hideTooltip, which register/unregister
    // this element with FXShared.trackAnchor (src/shared/touch-overlay.js)
    // to keep the tip stuck to it through scroll.
    tooltipTargetEl: null,

    // Identity (not a DOM node reference) of the tap-selected player, e.g.
    // { side: 'home', isBench: false, name: 'Erling Haaland' } -- same
    // side:isBench:name shape render.js's marqueeKey already keys cards by,
    // for consistency. render() tears down and rebuilds EVERY `.fxm-card`
    // node on every re-render (a `tooltipTargetEl` DOM reference alone goes
    // stale the instant that happens), and this page's live-score updates
    // trigger that MutationObserver-driven rebuild often -- sometimes well
    // under a second after a tap. Tracking identity instead of a node lets
    // render() re-locate the SAME player's freshly-built card after a
    // rebuild and re-apply the dim/tooltip there, so a live-score-driven
    // re-render doesn't read to the user as their selection reverting. Set
    // by setSelectedCard, cleared by clearSelectedCard -- see render.js.
    selectedIdentity: null,
  };

  FXM.qa = function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  };
})(window.FXM);

// ---- src/matchup/parse.js ----
/**
 * Fantrax Refinements -- Matchup Pitch: parse the livescoring matchup DOM
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
  // plain "62.27" with no such split.
  function parseHeader(headerEl) {
    if (!headerEl) return null;
    const nameA = headerEl.querySelector('.scoring-header__name a');
    const primaryH2 = headerEl.querySelector('.scoring-header__score-primary h2');
    const secondaryEl = headerEl.querySelector('.scoring-header__score-secondary');
    const live = primaryH2
      ? primaryH2.textContent.replace(/Gameweek/i, '').replace(/\s+/g, '').trim()
      : '';
    const projected = secondaryEl ? secondaryEl.textContent.trim() : '';
    return {
      name: nameA ? nameA.textContent.trim() : '',
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

  const VALID_POS_LABELS = { G: true, D: true, M: true, F: true, Res: true };

  function parseRow(row) {
    const cells = qa(':scope > .scoring-table__cell', row);
    if (cells.length !== 3) return null; // section header ("GOALKEEPER"/"OUTFIELDER") or spacer row
    const midCell = cells[1];
    const posLabel = midCell ? midCell.textContent.trim() : '';
    if (!VALID_POS_LABELS[posLabel]) return null; // the "Total" footer row, or anything unexpected
    return { posLabel, left: parseSide(cells[0]), right: parseSide(cells[2]) };
  }

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

    qa('.scoring-table__row', tables[0]).forEach((row) => {
      const parsed = parseRow(row);
      if (!parsed || parsed.posLabel === 'Res') return;
      if (parsed.left) home.starters[parsed.posLabel].push(parsed.left);
      if (parsed.right) away.starters[parsed.posLabel].push(parsed.right);
    });

    qa('.scoring-table__row', tables[1]).forEach((row) => {
      const parsed = parseRow(row);
      if (!parsed || parsed.posLabel !== 'Res') return;
      if (parsed.left) home.reserves.push(parsed.left);
      if (parsed.right) away.reserves.push(parsed.right);
    });

    return { home, away };
  }

  FXM.readCrestFromFigure = readCrestFromFigure;
  FXM.parseMatchup = parseMatchup;
})(window.FXM);

// ---- src/matchup/render.js ----
/**
 * Fantrax Refinements -- Matchup Pitch: render the two-team pitch
 * ---------------------------------------------------------------------
 * Builds one full-pitch layout (both teams' starting lineups facing each
 * other, my team's half nearest their own goal at the outer edge) plus a
 * compact bench strip per team, from FXM.parseMatchup()'s output.
 *
 * The DOM is identical between wide and narrow viewports -- matchup.css's
 * media query alone flips `.fxm-field`/`.fxm-half`/`.fxm-line` between row
 * and column flex-direction (and swaps which of the two <g> mark groups is
 * visible) to switch between the horizontal (wide) and vertical (narrow)
 * pitch. See matchup.css for the breakpoint. Home is always the first half
 * in DOM order (G, D, M, F) and away the second, reversed (F, M, D, G) --
 * that single ordering reads correctly as "home left / away right,
 * mirrored" in row layout and "home top / away bottom, mirrored" in column
 * layout with no JS branching on orientation.
 *
 * The hover/tap breakdown tooltip (buildTooltipLines) LAYERS window.FXC on
 * top of each player's own currently-rendered stat chips (parse.js's
 * p.chips): content.js briefly, programmatically flips the page's
 * Stats/Fpts pill (now masked -- see content.js's header comment -- so
 * the user never sees it) to snapshot the OTHER mode and publishes a
 * merged raw+fpts reading to window.FXC, keyed by player name. When FXC
 * has BOTH readings for a given player, buildTooltipLines shows the
 * hybrid line (e.g. "1 Assists (Total) (+6)"); otherwise it falls back to
 * that player's own p.chips (single, currently-active-mode value) --
 * FXC is purely an enhancement layer, never a hard requirement, so the
 * tooltip is never stuck waiting on it (see buildTooltipLines' own
 * comment for why that distinction matters).
 *
 * render() tears down and rebuilds EVERY `.fxm-card` node on every
 * re-render, and this livescoring page's own DOM mutations (live score
 * updates) trigger that rebuild often via the MutationObserver in main.js
 * -- including while a player is tap-selected (dimmed + tooltip open) on
 * touch. Tracking WHO is selected by identity (state.selectedIdentity,
 * not a DOM node reference -- see state.js) rather than just a stale
 * `tooltipTargetEl` lets render() re-locate that same player's freshly
 * built card and re-apply the dim/tooltip there (reapplySelection, called
 * at the end of render()) instead of the selection silently reverting
 * within about a second of a live-score-driven re-render.
 * ---------------------------------------------------------------------
 */
(function (FXM) {
  'use strict';
  const qa = FXM.qa;
  const state = FXM.state;
  const FXShared = window.FXShared;

  // ---------- jersey URL construction from crest ----------
  // Same rules as pitch-editor/render.js's jerseyFromCrest (EPL-only jersey
  // filenames derived from the crest URL; GK -> generic goalkeeper jersey;
  // non-EPL or unrecognized crest URL -> caller falls back to the crest
  // image itself). Duplicated locally on purpose, not shared -- this
  // module must stand on its own regardless of script load order between
  // the pitch-editor and matchup features.
  function jerseyFromCrest(crestUrl, pos) {
    if (!crestUrl) return null;
    const m = crestUrl.match(/^(.*)\/assets\/images\/logos\/sportsteam\/epl\/([^/]+)\.png$/);
    if (!m) return null;
    const origin = m[1];
    if (pos === 'G') return `${origin}/assets/images/jerseys/epl/Premier-League-jersey-logo_goalkeeper.png`;
    return `${origin}/assets/images/jerseys/epl/Premier-League-jersey_${m[2]}.png`;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // ---------- hover breakdown tooltip ----------
  // Mirrors pitch-editor/tooltip.js's mechanics exactly (fixed-position
  // singleton div, mouseenter/mousemove/mouseleave, viewport-edge
  // flipping) under our own `fxm-` classes so it doesn't collide with
  // pitch-editor's `.fx-card-tip`. Wired onto both pitch (starter) cards
  // and bench cards via attachHoverTooltip, called from renderCard itself
  // so every place a card gets built (line or bench) gets hover for free.

  function ensureTooltip() {
    if (state.tooltipEl && document.body.contains(state.tooltipEl)) return state.tooltipEl;
    const tip = document.createElement('div');
    tip.className = 'fxm-tip';
    document.body.appendChild(tip);
    state.tooltipEl = tip;
    return tip;
  }

  // A line is either a plain string, or `{ text, pts }` for a stat line
  // that has a color-coded parenthetical signed-points suffix (e.g.
  // "1 Assists (Total)" + a green/red/muted "(+6)" span) -- see
  // buildTooltipLines. Rendering (including the parenthetical's own
  // color-coded span) is FXShared.renderStatLine, shared with
  // pitch-editor's tooltip/action-menu stat lines -- see
  // src/shared/touch-overlay.js.
  //
  // Shared by both the mouse (showTooltip) and touch (showTooltipForCard)
  // paths -- building the row DOM is identical either way, only how the
  // tip then gets POSITIONED differs (raw cursor coords vs. anchored to a
  // card element), so that split lives one level up, not duplicated here.
  function renderTooltipContent(lines) {
    const tip = ensureTooltip();
    tip.innerHTML = '';
    lines.forEach((line, i) => {
      const row = el('div', i === 0 ? 'fxm-tip__title' : 'fxm-tip__row');
      FXShared.renderStatLine(row, line);
      tip.appendChild(row);
    });
    tip.classList.add('fxm-tip--visible');
    return tip;
  }

  // Desktop mouse path only -- positions the tip near the live cursor
  // coordinates, flipping to the other side of the pointer if it would
  // otherwise overflow the viewport. Untouched by the touch/anchor work
  // below; see attachHoverTooltip's mouseenter/mousemove.
  function showTooltip(lines, x, y) {
    if (!lines || !lines.length) return;
    renderTooltipContent(lines);
    positionTooltip(x, y);
  }

  function positionTooltip(x, y) {
    const tip = state.tooltipEl;
    if (!tip) return;
    const offset = 14;
    let left = x + offset;
    let top = y + offset;
    const rect = tip.getBoundingClientRect();
    if (left + rect.width > window.innerWidth - 8) left = x - rect.width - offset;
    if (top + rect.height > window.innerHeight - 8) top = y - rect.height - offset;
    tip.style.left = `${Math.max(4, left)}px`;
    tip.style.top = `${Math.max(4, top)}px`;
  }

  // Touch path -- see showTooltipForCard below for why this anchors to the
  // CARD element's rect instead of a raw touch point.
  const TIP_CARD_GAP = 8; // px gap kept between the tip and its anchor card
  // Net finger movement (px) between touchstart and touchend on a card
  // under which a touchend still counts as a tap rather than the tail end
  // of a scroll -- see attachHoverTooltip's FXShared.onTap wiring. Same
  // value and same idea as pitch-editor/drag.js's TOUCH_MOVE_CANCEL_PX.
  const TOUCH_TAP_MOVE_PX = 10;

  // Touch has no hover, so a tap anchors the tip to the CARD it just
  // tapped rather than to the touch point (positionTooltip above) -- a
  // tapped card is itself ~58-76px, so an offset-from-finger tip routinely
  // landed right on top of it. FXShared.anchorToElement (src/shared/
  // touch-overlay.js) owns the flush-above/below + viewport-clamp math --
  // the exact algorithm this file originally had inline, now shared with
  // pitch-editor's action menu. Registering with FXShared.trackAnchor
  // keeps the tip "stuck" to the card through a scroll (re-anchoring on
  // every scroll event) and hides it via hideTooltip if the card ever goes
  // stale -- detached from the document because render()'s
  // MutationObserver-driven re-renders tear down and rebuild EVERY
  // `.fxm-card` node from scratch (see render()'s own comment), which can
  // happen from Fantrax's own live-updating page content with no user
  // action at all. Keyed 'fxm' so this tracker can't collide with
  // pitch-editor's own 'fxp'-keyed action-menu tracker.
  function showTooltipForCard(lines, cardEl) {
    if (!lines || !lines.length) return;
    renderTooltipContent(lines);
    state.tooltipTargetEl = cardEl;
    const reposition = () => FXShared.anchorToElement(state.tooltipEl, cardEl, { gap: TIP_CARD_GAP, margin: 8 });
    reposition();
    FXShared.trackAnchor('fxm', {
      overlayEl: state.tooltipEl,
      targetEl: cardEl,
      isVisible: () => !!(state.tooltipEl && state.tooltipEl.classList.contains('fxm-tip--visible')),
      onReposition: reposition,
      onStale: hideTooltip,
    });
  }

  function hideTooltip() {
    if (state.tooltipEl) state.tooltipEl.classList.remove('fxm-tip--visible');
    state.hoveredName = null;
    state.tooltipTargetEl = null;
    FXShared.stopTrackingAnchor('fxm');
    // Single choke point for every close path (toggle-close, tap-outside via
    // onOutsideTap, mouseleave, and the stale-target scroll-hide via
    // FXShared.trackAnchor's onStale above) -- clearing the tap-select
    // dimming here means none of those callers need to remember to do it
    // themselves. A no-op on desktop/mouse closes since setSelectedCard is
    // only ever called from the touch tap path below, so there's nothing
    // to clear.
    clearSelectedCard();
  }

  // ---------- touch tap-select dimming ----------
  // Touch-only "which card did I just tap" affordance: dims every OTHER
  // `.fxm-card` (pitch and bench, both teams) so the tapped player reads
  // unambiguously against the rest of the pitch. Deliberately NOT wired off
  // desktop mouseenter -- that would dim the whole pitch on every hover,
  // a much more intrusive change to already-established hover behavior.
  // Scoped to state.container (falling back to the whole document if the
  // container ever isn't set) rather than a fixed root, since it must reach
  // both teams' halves and both benches, which live in the same body.
  //
  // The dim mechanic itself (FXShared.selectAndDim/clearDim) is shared with
  // pitch-editor's roster dimming -- purely mechanical class add/remove, so
  // `.fxm-card--dimmed` keeps its own name and its own CSS in matchup.css.
  // `.fxm-card--selected` carries no styling of its own (see matchup.css) --
  // kept as a plain DOM hook local to this feature, not part of the shared
  // module's contract.
  //
  // Also the ONE place state.selectedIdentity gets set/cleared (from the
  // card's own dataset -- see renderCard's data-side/data-bench/data-name)
  // -- see state.js's comment on why identity, not just a DOM ref, is
  // tracked. render()'s reapplySelection call below re-invokes this same
  // function on the freshly-rebuilt card, which is a harmless no-op
  // re-derivation of the same identity.
  function setSelectedCard(cardEl) {
    const root = state.container || document;
    FXShared.selectAndDim(root, '.fxm-card', cardEl, 'fxm-card--dimmed');
    FXM.qa('.fxm-card', root).forEach((c) => c.classList.toggle('fxm-card--selected', c === cardEl));
    state.selectedIdentity = cardEl
      ? { side: cardEl.dataset.side || null, isBench: cardEl.dataset.bench === '1', name: cardEl.dataset.name || null }
      : null;
  }

  function clearSelectedCard() {
    const root = state.container || document;
    FXShared.clearDim(root, '.fxm-card', 'fxm-card--dimmed');
    FXM.qa('.fxm-card', root).forEach((c) => c.classList.remove('fxm-card--selected'));
    state.selectedIdentity = null;
  }

  // Touch has no real hover -- mouseenter/mouseleave (attachHoverTooltip
  // below) may fire inconsistently on a tap, so the tooltip can otherwise
  // linger on-screen after the finger lifts. Fix: a document-level listener
  // that hides it on any tap OUTSIDE a card. Deliberately checks "is this
  // tap on ANY .fxm-card" rather than "is this the currently-open card" --
  // tapping a DIFFERENT card fires that card's own mouseenter (showing ITS
  // tooltip) in the same gesture, and this handler must not immediately
  // close what that just opened; ignoring every in-card tap sidesteps the
  // ordering question entirely (mirrors pitch-editor/action-menu.js's
  // onDocClick outside-closer, adapted from "outside the menu" to "outside
  // any card" since a card tap re-triggers its own show logic instead of a
  // single fixed menu element). Registered once, unconditionally (cheap: an
  // early return whenever no tooltip is visible) rather than only while a
  // tip is open, so there's no separate wire-up/tear-down to keep in sync
  // with show/hide. `FXM.outsideTapWired` guards against wiring a second
  // (redundant, if harmless) listener if this file is ever re-run within
  // the same page load (e.g. live iteration during development).
  function onOutsideTap(e) {
    if (!state.tooltipEl || !state.tooltipEl.classList.contains('fxm-tip--visible')) return;
    if (e.target.closest && e.target.closest('.fxm-card')) return;
    hideTooltip();
  }

  if (!FXM.outsideTapWired) {
    FXM.outsideTapWired = true;
    document.addEventListener('click', onOutsideTap, true);
    document.addEventListener('touchend', onOutsideTap, true);
  }

  function formatSigned(text) {
    const n = parseFloat(text);
    return n > 0 ? `+${text}` : text;
  }

  // Classifies a player's game from parse.js's p.gameText -- see parseSide's
  // comment for why this is necessary (the same DOM cell holds a real score
  // once the game starts and a mere projection before it, with no other
  // visible difference). 'finished' = trailing " F" (e.g. "CRY 0 @ EVE 2
  // F"); 'upcoming' = a scheduled clock time instead of a score (e.g.
  // "@FUL Mon 3:00 PM"); anything else falls back to 'unknown' and is
  // treated like 'finished' for display purposes -- i.e. trust the number
  // as real unless it's positively identified as a pre-game projection.
  //
  // No dedicated 'live'/in-progress state: checked the real livescoring DOM
  // across every open matchup/tab available (2026-08-24 -- a mix of
  // finished Sat/Sun games and Monday games not yet kicked off) and never
  // observed a gameText that was neither a trailing " F" score nor a
  // scheduled clock time, so there's nothing to confirm what an in-progress
  // row's text actually looks like. Rather than guess a regex for it, an
  // unrecognized gameText just stays 'unknown'. Still used by
  // buildTooltipLines (finished vs upcoming messaging) and renderCard (never
  // showing an upcoming player's projection as if it were an earned score)
  // -- NOT by the status dot any more, see EVENT_STATUS_LABEL/renderCard
  // below, which reads Fantrax's own pre-kickoff `.scorer-icon` indicator
  // instead (parse.js's p.eventStatus).
  function gameState(gameText) {
    if (!gameText) return 'unknown';
    if (/\sF$/.test(gameText)) return 'finished';
    if (/\d{1,2}:\d{2}\s*[AP]M/i.test(gameText)) return 'upcoming';
    return 'unknown';
  }

  // Status-dot label text, mirroring pitch-editor/roster.js's
  // EVENT_STATUS_LABEL exactly (own literal copy, not imported -- this
  // module must stand on its own regardless of script load order between
  // the pitch-editor and matchup features, same reasoning as
  // readCrestFromFigure in parse.js). Keyed by parse.js's p.eventStatus
  // values ('starting'/'expected'/'bench'/'out'), which parse.js derives
  // from the SAME `.scorer-icon` classes roster.js's readEventStatus reads
  // -- Fantrax's real pre-kickoff "is this player playing" indicator,
  // present only before kickoff. A player whose game has started or
  // finished simply has no `.scorer-icon` and no eventStatus, and
  // renderCard below shows no dot at all for them -- see matchup.css's
  // .fxm-card__dot comment for the exact "why".
  const EVENT_STATUS_LABEL = {
    starting: 'Confirmed starting',
    expected: 'Expected to play',
    bench: 'Expected to be on the bench',
    out: 'Not expected to play',
  };

  // Mode pill lookup (Stats/Fpts), same "Mode" pill-group content.js reads
  // -- duplicated locally rather than imported, for the same stand-alone-
  // module reason as jerseyFromCrest/readEventStatus above: this module
  // must work regardless of script load order between features.
  function getModeButtons() {
    const group = document.querySelector('pill-group[aria-label="Mode"]');
    if (!group) return null;
    const buttons = Array.from(group.querySelectorAll('button.pill'));
    const stats = buttons.find((b) => b.textContent.trim() === 'Stats');
    const fpts = buttons.find((b) => b.textContent.trim() === 'Fpts');
    if (!stats || !fpts) return null;
    return { stats, fpts };
  }

  // Layered: prefer window.FXC (published by content.js) -- a merged
  // reading of BOTH the raw count and the fpts contribution for every stat
  // chip, keyed by player name, captured via a brief, now-MASKED (see
  // content.js's header comment) Stats/Fpts pill flip -- when it actually
  // has BOTH readings for this player. Falls back to this player's own
  // currently-rendered stat chips (parse.js's p.chips, the CURRENT view's
  // per-chip value only) whenever FXC is absent or doesn't have this
  // player yet.
  //
  // FXC is an ENHANCEMENT layer only, never a hard requirement -- this
  // function used to `return ['Loading breakdown…']` outright whenever FXC
  // was absent, which left the tooltip stuck on that message forever for
  // anyone whose first snapshot hadn't landed (or who never gets one, e.g.
  // the mode toggle isn't found on their layout). That hard dependency is
  // gone: p.chips is always available the instant parse.js has run, so
  // FXC merely upgrades an already-showing single-value line into the
  // hybrid raw+fpts one the moment it becomes available for this player,
  // exactly mirroring content.js's own single-live-value tooltip
  // upgrading to hybrid once its counterpart-mode cache is populated.
  //
  // Line format is raw-first: "«raw» «stat name» («+signedPts»)", e.g.
  // "1 Assists (Total) (+6)" -- matching content.js's tooltip format
  // exactly, including the parenthetical being its own color-coded span
  // (FXShared.renderStatLine's `{ text, pts }` shape -- green positive /
  // red negative / muted zero). Degrades to whichever single value is
  // known when only one side is available (no parenthetical, plain text).
  function buildTooltipLines(p) {
    const statNames = window.FX_STAT_NAMES || {};
    const fxc = window.FXC;
    const rawMap = fxc && fxc.raw && fxc.raw.get(p.name);
    const fptsMap = fxc && fxc.fpts && fxc.fpts.get(p.name);

    if (rawMap && fptsMap) {
      const abbrs = [];
      const seen = new Set();
      [rawMap, fptsMap].forEach((m) => {
        m.forEach((_value, abbr) => {
          if (!seen.has(abbr)) {
            seen.add(abbr);
            abbrs.push(abbr);
          }
        });
      });
      if (abbrs.length) {
        const lines = [`${p.points || '0'} pts:`];
        abbrs.forEach((abbr) => {
          const fullName = statNames[abbr] || abbr;
          const ptsText = fptsMap.get(abbr);
          const rawText = rawMap.get(abbr);
          if (ptsText !== undefined && rawText !== undefined) {
            // { text, pts } -- rendered by FXShared.renderStatLine as
            // "<text> (" + a color-coded pts span + ")".
            lines.push({ text: `${rawText} ${fullName}`, pts: formatSigned(ptsText) });
          } else if (rawText !== undefined) {
            lines.push(`${rawText} ${fullName}`);
          } else if (ptsText !== undefined) {
            lines.push(`${formatSigned(ptsText)} ${fullName}`);
          }
        });
        return lines;
      }
    }

    // FXC enhancement unavailable for this player -- fall back to their
    // own currently-rendered stat chips (parse.js's p.chips), the CURRENT
    // view's per-chip value (raw count or fpts, whichever mode's pill is
    // active right now).
    if (p.chips && p.chips.size) {
      const buttons = getModeButtons();
      const onFpts = !!(buttons && buttons.fpts.classList.contains('pill--active'));
      const lines = [`${p.points || '0'} pts:`];
      p.chips.forEach((value, abbr) => {
        const fullName = statNames[abbr] || abbr;
        lines.push(`${onFpts ? formatSigned(value) : value} ${fullName}`);
      });
      return lines;
    }

    // Genuinely nothing on record for this player. Which terminal message
    // makes sense depends on whether their game has actually happened yet
    // (see gameState) -- otherwise "hasn't played" reads as a promise
    // they'll still get a chance to when their game already finished with
    // them not featuring at all.
    const state = gameState(p.gameText);
    if (state === 'upcoming') {
      if (p.points && p.points !== '-') return [`Projected: ${p.points} pts`];
      return ["No stats yet — hasn't played"];
    }
    if (state === 'finished') {
      return ['Did not play this gameweek'];
    }
    // unknown -- best effort, same as before this distinction existed.
    if (p.points && p.points !== '-') return [`Projected: ${p.points} pts`];
    return ["No stats yet — hasn't played"];
  }

  function attachHoverTooltip(card, p) {
    card.addEventListener('mouseenter', (e) => {
      state.hoveredName = p.name;
      state.lastMouseX = e.clientX;
      state.lastMouseY = e.clientY;
      showTooltip(buildTooltipLines(p), e.clientX, e.clientY);
    });
    card.addEventListener('mousemove', (e) => {
      state.lastMouseX = e.clientX;
      state.lastMouseY = e.clientY;
      if (state.tooltipEl && state.tooltipEl.classList.contains('fxm-tip--visible')) {
        positionTooltip(e.clientX, e.clientY);
      }
    });
    card.addEventListener('mouseleave', hideTooltip);

    // Tap-to-TOGGLE on touch devices. Without this, a tap is indistinguishable
    // from a mouseenter above (an unprevented touch gesture makes the browser
    // synthesize mouseenter/mousemove/click right after it), which can only
    // ever OPEN or reposition the tooltip -- there's no mouseleave-equivalent
    // to close it on a second tap of the SAME card, since touch has no
    // pointer to "leave" with. This handler owns the whole tap gesture
    // instead: calling preventDefault in touchend (when the event is
    // cancelable -- see below) suppresses that synthetic mouse-event chain
    // (well-established behavior -- preventDefault on touchstart OR touchend
    // blocks the compatibility mouse events for that gesture), so mouseenter
    // above never even fires for a tap and this is the ONLY logic that runs.
    // Desktop mouseenter/mousemove/mouseleave above are untouched --
    // touchend simply never fires for a real mouse.
    //
    // Anchored to the CARD, not the touch point: unlike the mouse path
    // (which follows the live cursor and so is never mistaken for covering
    // the pointed-at element), a tap's x/y IS the card the user just
    // touched -- offsetting a fixed amount from it routinely put the tip
    // right on top of the card. showTooltipForCard positions off the
    // card's own rect instead (via FXShared.anchorToElement), and tracks it
    // through scroll via FXShared.trackAnchor.
    //
    // The tap-vs-scroll gesture gating (net finger movement under
    // TOUCH_TAP_MOVE_PX between touchstart and touchend, cancelable-safe
    // preventDefault) is FXShared.onTap (src/shared/touch-overlay.js) --
    // the exact mechanics this file originally had inline, now shared with
    // anything else that needs "was this touchend a real tap." Not the
    // same concern as pitch-editor/drag.js's own long-press-vs-scroll state
    // machine (that one decides whether to START A DRAG); this one decides
    // whether to open/toggle the tooltip.
    FXShared.onTap(
      card,
      () => {
        const alreadyOpenHere =
          state.tooltipEl && state.tooltipEl.classList.contains('fxm-tip--visible') && state.hoveredName === p.name;
        if (alreadyOpenHere) {
          hideTooltip();
          return;
        }
        state.hoveredName = p.name;
        showTooltipForCard(buildTooltipLines(p), card);
        // Dim every other card so it's unambiguous which player this tip
        // belongs to. Touch-tap path only (see setSelectedCard) -- desktop
        // hover intentionally leaves every other card alone.
        setSelectedCard(card);
      },
      { moveThresholdPx: TOUCH_TAP_MOVE_PX }
    );
  }

  // ---------- player / bench cards ----------
  // Bench reuses the exact same card component as the pitch (jersey via
  // jerseyFromCrest, GK variant only when p.pos is the player's real
  // position letter -- parse.js's parseSide captures that from the
  // player's own `.scorer__info__positions` span even on reserve rows, not
  // the "Res" gutter label) with a `fxm-card--bench` size modifier class.

  // Stable per-card identity key for the marquee-persistence map (see
  // applyNameMarquee) -- must distinguish home/away AND pitch/bench so two
  // different cards (e.g. the same player name appearing as both a
  // starter and, implausibly but not impossibly, a same-named opponent's
  // reserve) never share a ping-pong timeline. `side` is 'home'/'away',
  // threaded down from renderField/render (renderBenchSide's caller) through
  // renderLine/renderBenchCard -- there's no other per-card identity concept in this
  // module today (matchup cards have no synthetic key, per state.js's note
  // on state.hoveredName).
  function marqueeKey(side, isBench, name) {
    return `${side || '?'}:${isBench ? 'b' : 'p'}:${name}`;
  }

  function renderCard(p, extraClass, side) {
    const isBench = extraClass === 'fxm-card--bench';
    const card = el('div', extraClass ? `fxm-card ${extraClass}` : 'fxm-card');
    // Identity attributes, not just for marqueeKey (below) any more --
    // render()'s reapplySelection also reads these back off the FRESHLY
    // rebuilt card to re-locate whichever player was tap-selected before a
    // live-score-driven rebuild tore the old node out from under it. Same
    // side:isBench:name shape as marqueeKey, so the two stay in lockstep.
    if (p.name) {
      card.dataset.side = side || '';
      card.dataset.bench = isBench ? '1' : '0';
      card.dataset.name = p.name;
    }
    const constructed = jerseyFromCrest(p.crest, p.pos);
    const jerseySrc = constructed || p.crest;
    if (jerseySrc) {
      const img = el('img', 'fxm-card__crest');
      img.src = jerseySrc;
      img.alt = '';
      img.draggable = false;
      // A constructed URL is a guess -- if it 404s, degrade to the crest
      // image instead of leaving a broken-image icon.
      if (constructed && p.crest && constructed !== p.crest) {
        img.onerror = () => {
          img.onerror = null;
          img.src = p.crest;
        };
      }
      card.appendChild(img);
    }
    const info = el('div', 'fxm-card__info');
    // Name text lives in an inner span so it can be measured/animated
    // independently of the (overflow: hidden) outer container -- see
    // applyNameMarquee, called once per render after the cards are
    // actually laid out in the document (scrollWidth is meaningless on a
    // detached fragment). No status dot in this row any more -- it used to
    // sit inline before the name text, which ate into an already
    // space-starved name box (that's exactly why names marquee at all) and
    // could shrink a long name's available width down to almost nothing.
    // The dot is now a corner badge on the card itself -- see below.
    const nameEl = el('div', 'fxm-card__name');
    // Stashed for applyNameMarquee to read back once this card is actually
    // laid out in the document -- see marqueeKey above.
    if (p.name) nameEl.dataset.marqueeKey = marqueeKey(side, isBench, p.name);
    nameEl.appendChild(el('span', 'fxm-card__name-text', p.name));
    info.appendChild(nameEl);
    // Always show a points value -- a player whose game hasn't started (or
    // who played and scored exactly 0) previously rendered with no number
    // at all, which reads as broken/missing rather than "zero". Falls back
    // to '0' when parse.js came back with nothing, and the zero case gets
    // its own muted color (matching the roster pitch's
    // .fx-card__fpts--zero) instead of the gold positive-points color.
    //
    // For an upcoming (not-yet-started) game, p.points actually holds
    // Fantrax's own PROJECTION for this cell, not a score -- showing that
    // on the card would look like an already-earned result. Force the
    // muted zero there instead; the projection still surfaces on hover
    // (see buildTooltipLines).
    const isUpcoming = gameState(p.gameText) === 'upcoming';
    const ptsText = !isUpcoming && p.points && p.points !== '-' ? p.points : '0';
    const ptsN = parseFloat(ptsText);
    const ptsKind = ptsN > 0 ? 'pos' : ptsN < 0 ? 'neg' : 'zero';
    info.appendChild(el('div', `fxm-card__pts fxm-card__pts--${ptsKind}`, ptsText));
    // Game/opponent line (e.g. "MUN 0 @ HUL 2 F"), directly under the
    // points -- same formatting logic as pitch-editor's .fx-card__opp
    // (FXShared.formatOpp, src/shared/touch-overlay.js: shared LOGIC, own
    // feature-scoped DOM/CSS, per the user's "these should be the same
    // component"). Skipped entirely when there's no text at all (e.g. an
    // empty slot never reaches here since p.name is required below, but a
    // real player can still have an empty gameText in edge cases).
    const opp = FXShared.formatOpp(p.gameText);
    if (opp) {
      const oppEl = el('div', 'fxm-card__opp');
      // Own marquee-key namespace ('opp:' prefix over the SAME
      // side:isBench:name identity marqueeKey builds for the name row) so
      // this element's persisted cycle-start time in state.marqueeStarts
      // can never collide with the name row's own entry for the same card
      // -- see applyMarqueeToSet's comment for why the two must stay
      // disjoint.
      if (p.name) oppEl.dataset.marqueeKey = `opp:${marqueeKey(side, isBench, p.name)}`;
      oppEl.appendChild(el('span', 'fxm-card__opp-text', opp));
      info.appendChild(oppEl);
    }
    card.appendChild(info);
    // Status dot, pinned to the card's own bottom-left corner (matchup.css
    // gives .fxm-card position: relative and positions the dot absolutely
    // against IT, not against .fxm-card__info or the name row) -- ONLY when
    // parse.js actually found a `.scorer-icon` for this player, which on
    // Fantrax's own page only exists pre-kickoff. No eventStatus means the
    // player's game has already started or finished, and no dot is shown
    // at all for them -- not a fallback color, just nothing.
    //
    // `fxm-card--has-dot` on the CARD itself (not just the dot span) is what
    // lets matchup.css reserve room for the dot on .fxm-card__opp, the
    // game/opponent line -- that's the LAST child of .fxm-card__info and so
    // sits in the same bottom-left corner the dot occupies. See the dot's
    // own CSS comment for why the opp line needs a left-padding reservation
    // that a dot-less card must NOT get (unconditional padding would misalign
    // every non-dotted card's opp line for nothing).
    if (p.name && p.eventStatus) {
      card.classList.add('fxm-card--has-dot');
      const dot = el('span', `fxm-card__dot fxm-card__dot--${p.eventStatus}`);
      dot.title = EVENT_STATUS_LABEL[p.eventStatus] || '';
      card.appendChild(dot);
    }
    // Skip hover wiring on empty slots -- parse.js never actually hands us
    // one (parseSide returns null and callers skip it), but guard on p.name
    // anyway so this stays correct if that ever changes.
    if (p.name) attachHoverTooltip(card, p);
    return card;
  }

  function renderBenchCard(p, side) {
    return renderCard(p, 'fxm-card--bench', side);
  }

  // A name too wide for its box gets a slow back-and-forth marquee scroll
  // instead of an ellipsis/clip, so the full name stays readable. Must run
  // after `root` is actually attached to the document (scrollWidth on a
  // still-detached fragment is meaningless) -- callers use
  // requestAnimationFrame after the DOM insertion, not before. Shared by
  // both player-card names (`.fxm-card__name`, both pitch and bench, since
  // both share that class) AND the per-team header names
  // (`.fxm-team-header__name`) -- one generic measure/apply pass
  // (applyMarqueeToSet) run once per selector pair below, rather than two
  // parallel copies of the same logic.
  //
  // matchup.css's `<selector>--marquee <selector>-text` animation is
  // declared `infinite alternate` (ping-pong) already -- that alone would
  // be enough on a static page. It isn't enough here because render() tears
  // down and fully rebuilds EVERY card and header node on every re-render
  // (the MutationObserver in main.js fires often, well inside a single 6s
  // marquee cycle, as the live matchup page updates), and a freshly-created
  // element's CSS animation always restarts at 0% -- so without this, the
  // user never sees a leg of the ping-pong complete; it just looks like the
  // marquee keeps snapping back to the start. Fix: persist when each
  // element's cycle "started" (state.marqueeStarts, keyed by
  // data-marquee-key) across re-renders, and apply a negative
  // `animation-delay` to the freshly-built node so the browser treats it as
  // already partway through the cycle -- i.e. resumes mid-cycle instead of
  // restarting. Player-card name keys (marqueeKey, e.g.
  // "home:p:Erling Haaland"), that same card's own game/opponent-line key
  // (e.g. "opp:home:p:Erling Haaland" -- see renderCard), and header keys
  // (e.g. "header:home") are all disjoint by construction (a player name
  // never starts with "opp:" or "header:"), so all three sets safely share
  // the one state.marqueeStarts map with no collision risk.
  function applyMarqueeToSet(root, nameSelector, textSelector, marqueeClass, nextStarts, now) {
    qa(nameSelector, root).forEach((nameEl) => {
      const overflow = nameEl.scrollWidth - nameEl.clientWidth;
      if (overflow <= 0) return;
      nameEl.classList.add(marqueeClass);
      nameEl.style.setProperty('--fxm-marquee-dist', `-${overflow}px`);

      const key = nameEl.dataset.marqueeKey;
      const textEl = nameEl.querySelector(textSelector);
      if (!key || !textEl) return;
      const startTime = state.marqueeStarts.has(key) ? state.marqueeStarts.get(key) : now;
      nextStarts.set(key, startTime);
      const offsetSec = ((now - startTime) % 6000) / 1000;
      // Negative delay = "act as though the animation already ran this
      // long" -- resumes the ping-pong from the correct point instead of
      // restarting at 0% the way a brand-new node otherwise would.
      textEl.style.animationDelay = `-${offsetSec}s`;
    });
  }

  function applyNameMarquee(root) {
    // Defensive init here (not state.js) -- this codebase's convention for
    // a map that's only ever read/written by the one file that needs it;
    // state.js's FXM.state gets replaced wholesale on reload/re-eval, so a
    // fresh Map has to be able to reappear on demand rather than only at
    // state.js's own load time.
    state.marqueeStarts = state.marqueeStarts || new Map();
    const now = Date.now();
    const nextStarts = new Map(); // pruned copy -- only keys touched below survive

    applyMarqueeToSet(root, '.fxm-card__name', '.fxm-card__name-text', 'fxm-card__name--marquee', nextStarts, now);
    applyMarqueeToSet(
      root,
      '.fxm-team-header__name',
      '.fxm-team-header__name-text',
      'fxm-team-header__name--marquee',
      nextStarts,
      now
    );
    // Game/opponent line (e.g. "MUN 0 @ HUL 2 F"), same mechanism, own
    // 'opp:'-prefixed key namespace (see renderCard/marqueeKey) so it can't
    // collide with that same card's name entry above.
    applyMarqueeToSet(root, '.fxm-card__opp', '.fxm-card__opp-text', 'fxm-card__opp--marquee', nextStarts, now);

    // Drop start times for any key not touched this render (player no
    // longer overflowing, subbed out, or a different matchup entirely) so
    // this map can't grow without bound across a long live-scoring session.
    state.marqueeStarts = nextStarts;
  }

  // ---------- team headers ----------
  // Each team's header (name + hero live total + projected) is its own
  // top-level `.fxm-body` grid item now, not nested inside a shared
  // "header bar" wrapper -- matchup.css's grid-template-areas is what
  // decides where each one sits: wide layout puts them side by side in one
  // row above the field (visually the old single header bar); narrow
  // layout separates them, home above the field next to home's half, away
  // below the field next to away's bench. See matchup.css.

  // `key` is 'home'/'away' -- team identity is stable across re-renders
  // (unlike a player, who at least theoretically could change), so a plain
  // "header:home"/"header:away" data-marquee-key is enough; no need for the
  // richer side:isBench:name shape marqueeKey builds for player cards.
  function renderTeamHeader(side, extraClass, key) {
    const header = el('div', `fxm-team-header ${extraClass}`);
    const nameEl = el('div', 'fxm-team-header__name');
    nameEl.dataset.marqueeKey = `header:${key}`;
    // Name text lives in an inner span, mirroring .fxm-card__name-text --
    // see applyNameMarquee/applyMarqueeToSet, which measures/animates this
    // exactly like a player card's name.
    nameEl.appendChild(el('span', 'fxm-team-header__name-text', side.header.name || ''));
    header.appendChild(nameEl);
    const scores = el('div', 'fxm-team-header__scores');
    scores.appendChild(el('span', 'fxm-team-header__live', side.header.live || '-'));
    scores.appendChild(el('span', 'fxm-team-header__projected', `proj ${side.header.projected || '-'}`));
    header.appendChild(scores);
    return header;
  }

  // ---------- pitch (markings + both halves) ----------

  // Field markings as plain absolutely-positioned divs layered under the
  // players -- NOT an SVG with a square viewBox stretched non-uniformly to
  // fit the field's real (non-square) box. That stretch was the original
  // implementation and it visibly distorted every round mark (center
  // circle rendered as an ellipse) and every stroke (border widths
  // stretched differently on each axis). Divs sidestep the problem
  // entirely: circles use an explicit equal px width/height (never a
  // percentage of two different-length axes) so they're always round
  // regardless of the field's aspect ratio, and border-width is always a
  // real px value so strokes stay uniform. Both mark sets (horizontal for
  // the wide layout, vertical for the narrow one) are always in the DOM;
  // CSS shows only the one matching the current orientation, mirroring how
  // the field itself switches flex-direction instead of re-rendering.
  function buildMarks() {
    const wrap = el('div', 'fxm-marks');
    wrap.appendChild(el('div', 'fxm-marks__boundary'));

    const horiz = el('div', 'fxm-marks__horizontal');
    horiz.appendChild(el('div', 'fxm-marks__halfway-v'));
    horiz.appendChild(el('div', 'fxm-marks__circle'));
    horiz.appendChild(el('div', 'fxm-marks__spot fxm-marks__spot--center'));
    horiz.appendChild(el('div', 'fxm-marks__box fxm-marks__box--left'));
    horiz.appendChild(el('div', 'fxm-marks__box-inner fxm-marks__box-inner--left'));
    horiz.appendChild(el('div', 'fxm-marks__spot fxm-marks__spot--left'));
    horiz.appendChild(el('div', 'fxm-marks__box fxm-marks__box--right'));
    horiz.appendChild(el('div', 'fxm-marks__box-inner fxm-marks__box-inner--right'));
    horiz.appendChild(el('div', 'fxm-marks__spot fxm-marks__spot--right'));
    wrap.appendChild(horiz);

    const vert = el('div', 'fxm-marks__vertical');
    vert.appendChild(el('div', 'fxm-marks__halfway-h'));
    vert.appendChild(el('div', 'fxm-marks__circle'));
    vert.appendChild(el('div', 'fxm-marks__spot fxm-marks__spot--center'));
    vert.appendChild(el('div', 'fxm-marks__box fxm-marks__box--top'));
    vert.appendChild(el('div', 'fxm-marks__box-inner fxm-marks__box-inner--top'));
    vert.appendChild(el('div', 'fxm-marks__spot fxm-marks__spot--top'));
    vert.appendChild(el('div', 'fxm-marks__box fxm-marks__box--bottom'));
    vert.appendChild(el('div', 'fxm-marks__box-inner fxm-marks__box-inner--bottom'));
    vert.appendChild(el('div', 'fxm-marks__spot fxm-marks__spot--bottom'));
    wrap.appendChild(vert);

    return wrap;
  }

  function renderLine(players, pos, side) {
    const line = el('div', 'fxm-line');
    line.dataset.pos = pos;
    players.forEach((p) => line.appendChild(renderCard(p, undefined, side)));
    return line;
  }

  function renderField(data) {
    const field = el('div', 'fxm-field');
    field.appendChild(buildMarks());

    const homeHalf = el('div', 'fxm-half fxm-half--home');
    FXM.POS_ORDER.forEach((pos) => {
      const players = data.home.starters[pos];
      if (players.length) homeHalf.appendChild(renderLine(players, pos, 'home'));
    });

    const awayHalf = el('div', 'fxm-half fxm-half--away');
    FXM.POS_ORDER.slice()
      .reverse()
      .forEach((pos) => {
        const players = data.away.starters[pos];
        if (players.length) awayHalf.appendChild(renderLine(players, pos, 'away'));
      });

    field.appendChild(homeHalf);
    field.appendChild(awayHalf);
    return field;
  }

  // ---------- bench strip ----------
  // Each team's bench is its own top-level `.fxm-body` grid item now, not
  // nested inside a shared "bench bar" wrapper -- same restructuring as
  // renderTeamHeader above, and for the same reason: matchup.css's
  // grid-template-areas is what decides where each one sits. Wide layout
  // puts them side by side in one row below the field (visually the old
  // single bench bar); narrow layout pairs each bench with its own team's
  // header on its own side of the field. See matchup.css.

  function renderBenchSide(reserves, extraClass, side) {
    const bench = el('div', `fxm-bench ${extraClass}`);
    bench.appendChild(el('div', 'fxm-bench__label', 'Bench'));
    const row = el('div', 'fxm-bench__row');
    reserves.forEach((p) => row.appendChild(renderBenchCard(p, side)));
    bench.appendChild(row);
    return bench;
  }

  // ---------- container + top-level render ----------

  // Looks up the player object matching a state.selectedIdentity (see
  // state.js) inside `data`, the same parsed structure renderField/
  // renderBenchSide just built the fresh cards from -- so if a card with
  // that identity exists in the just-rendered DOM, this is guaranteed to
  // find its matching player object too. Used by reapplySelection below.
  function findPlayerByIdentity(data, identity) {
    if (!identity) return null;
    const sideData = data[identity.side];
    if (!sideData) return null;
    const list = identity.isBench ? sideData.reserves : FXM.POS_ORDER.flatMap((pos) => sideData.starters[pos]);
    return list.find((p) => p.name === identity.name) || null;
  }

  // Re-locates the tap-selected player (if any) among the cards render()
  // JUST rebuilt, and re-applies the dim + tooltip there -- see state.js's
  // comment on state.selectedIdentity for why this exists: render() tears
  // down and rebuilds every `.fxm-card` node on every re-render, and this
  // livescoring page's own DOM mutations trigger that rebuild often (a
  // MutationObserver in main.js reacts to Fantrax's live score updates),
  // including while a player is tap-selected. Without this, the dimming
  // and tooltip would revert to "nothing selected" within ~1s of a tap --
  // reads as the selection mysteriously undoing itself, even though the
  // user didn't touch anything.
  //
  // Found: re-select + re-dim (setSelectedCard), then re-render the
  // tooltip's content AND re-anchor/re-track it via showTooltipForCard --
  // reusing that function (rather than only repositioning) means the
  // scroll-tracker's targetEl also gets updated to the new node, and the
  // stat lines reflect this render's freshest data, exactly as if the user
  // had just tapped the new card themselves.
  //
  // Not found (player genuinely no longer in the lineup/data at all -- a
  // real edge case, e.g. a sub) -- close the tooltip and clear the
  // identity, same as any other stale-target close (mirrors
  // FXShared.trackAnchor's onStale handling for the scroll path).
  function reapplySelection(data, root) {
    const identity = state.selectedIdentity;
    if (!identity) return;
    const match = qa('.fxm-card', root).find(
      (c) => c.dataset.side === identity.side && (c.dataset.bench === '1') === identity.isBench && c.dataset.name === identity.name
    );
    const p = match && findPlayerByIdentity(data, identity);
    if (!match || !p) {
      hideTooltip();
      return;
    }
    setSelectedCard(match);
    showTooltipForCard(buildTooltipLines(p), match);
  }

  function ensureContainer() {
    if (state.container && document.body.contains(state.container)) return state.container;
    const anchor = document.querySelector('league-livescoring-standard-table');
    if (!anchor) return null;
    const wrapper = el('div', 'fxm-matchup');

    const topbar = el('div', 'fxm-topbar');
    topbar.appendChild(el('div', 'fxm-topbar__title', 'Matchup Pitch'));
    const toggleBtn = el('button', 'fxm-toggle-btn', state.hidden ? 'Show pitch' : 'Hide pitch');
    toggleBtn.type = 'button';
    toggleBtn.addEventListener('click', () => {
      state.hidden = !state.hidden;
      toggleBtn.textContent = state.hidden ? 'Show pitch' : 'Hide pitch';
      if (state.bodyEl) state.bodyEl.style.display = state.hidden ? 'none' : '';
    });
    topbar.appendChild(toggleBtn);
    wrapper.appendChild(topbar);
    state.toggleBtn = toggleBtn;

    anchor.parentElement.insertBefore(wrapper, anchor);
    state.container = wrapper;
    return wrapper;
  }

  function render() {
    const data = FXM.parseMatchup();
    if (!data) {
      // Mobile matchup LIST view, or Teams/Scores tabs -- remove our
      // container silently rather than showing a stale/empty pitch. Also
      // close any open tooltip/selection (hideTooltip clears
      // state.selectedIdentity via clearSelectedCard) -- the tooltip lives
      // at document.body, not inside state.container, so it wouldn't
      // otherwise be cleaned up by the container removal above.
      hideTooltip();
      if (state.container) {
        state.container.remove();
        state.container = null;
        state.bodyEl = null;
        state.toggleBtn = null;
      }
      return;
    }

    const container = ensureContainer();
    if (!container) return;

    if (state.bodyEl) state.bodyEl.remove();
    const body = el('div', 'fxm-body');
    body.style.display = state.hidden ? 'none' : '';
    // DOM order matches the wide-layout reading order (home header, away
    // header, field, home bench, away bench) -- matchup.css's
    // grid-template-areas reorders these visually at the narrow breakpoint
    // (each bench moves next to its own team's header) without any JS
    // branching here.
    body.appendChild(renderTeamHeader(data.home, 'fxm-team-header--home', 'home'));
    body.appendChild(renderTeamHeader(data.away, 'fxm-team-header--away', 'away'));
    body.appendChild(renderField(data));
    body.appendChild(renderBenchSide(data.home.reserves, 'fxm-bench--home', 'home'));
    body.appendChild(renderBenchSide(data.away.reserves, 'fxm-bench--away', 'away'));
    container.appendChild(body);
    state.bodyEl = body;
    reapplySelection(data, body);
    requestAnimationFrame(() => applyNameMarquee(body));
  }

  FXM.jerseyFromCrest = jerseyFromCrest;
  FXM.ensureContainer = ensureContainer;
  FXM.render = render;
})(window.FXM);

// ---- src/matchup/main.js ----
/**
 * Fantrax Refinements -- Matchup Pitch: boot / keep in sync with live updates
 * ---------------------------------------------------------------------
 * Watches the page for changes (matchup carousel switching to a different
 * matchup, live score refresh, gameweek change) and re-renders. Anything
 * WE inserted (the .fxm-matchup container) is excluded from "relevant"
 * mutations -- otherwise our own toggle button's style changes would
 * themselves trigger a re-render loop, same reasoning as
 * pitch-editor/main.js's isOwnMutation.
 *
 * Since the content_scripts entry now matches every fantrax.com page (not
 * just livescoring URLs, to survive SPA navigation -- see manifest.json),
 * render() itself inserting/removing `.fxm-matchup` is a mutation this same
 * observer will see. A naive "is m.target inside our container" check
 * misses the case where the mutation's target is the container's PARENT
 * (our container being inserted before the anchor, or removed from it) --
 * that mutation's target is NOT contained by state.container, so it reads
 * as "relevant" and schedules a useless re-render. isOwnNode below also
 * inspects addedNodes/removedNodes so that case is recognized too, same
 * pattern as pitch-editor/main.js's isOwnNode (ported from there).
 *
 * Idempotent boot: `FXM.booted` / `FXM.observer` are read/written directly
 * on the `FXM` namespace object rather than inside `FXM.state`, because
 * state.js unconditionally replaces `FXM.state` with a fresh object every
 * time it runs. During normal extension use these files only ever load
 * once, but during live iteration (evaluating the four files by hand,
 * repeatedly, to test changes) state.js re-running first would otherwise
 * orphan the previous run's container reference and MutationObserver.
 * Keeping the observer directly on `FXM` means a fresh boot() can always
 * find and disconnect the old one, and teardown() also queries the DOM
 * directly for `.fxm-matchup` rather than trusting `state.container`, for
 * the same reason.
 * ---------------------------------------------------------------------
 */
(function (FXM) {
  'use strict';
  const state = FXM.state;

  function isOwnMutation(target) {
    return !!(state.container && state.container.contains(target));
  }

  // True when `node` is part of our own UI. Checked two ways, mirroring
  // pitch-editor/main.js's isOwnNode: state.container can already be null by
  // the time this runs (render() nulls it out synchronously on removal,
  // while the MutationObserver callback fires as a microtask afterward), so
  // the class-name fallback covers a just-removed container node that the
  // state-ref check above can no longer recognize. Exact class match only,
  // never a prefix/startsWith check -- Fantrax's own classes use an `fx-`
  // prefix (fx-nav, fx-layout__pane, ...), distinct from ours (`fxm-`), but
  // a prefix check would still be the wrong tool here.
  const OWN_BODY_CLASSES = ['fxm-matchup'];
  function isOwnNode(node) {
    if (!node || node.nodeType !== 1) return false;
    if (isOwnMutation(node)) return true;
    return OWN_BODY_CLASSES.some((c) => node.classList.contains(c));
  }

  function scheduleRender() {
    if (state.renderScheduled) return;
    state.renderScheduled = true;
    setTimeout(() => {
      state.renderScheduled = false;
      FXM.render();
    }, 400);
  }

  function teardown() {
    if (FXM.observer) {
      FXM.observer.disconnect();
      FXM.observer = null;
    }
    qaRemove('.fxm-matchup');
  }

  function qaRemove(sel) {
    Array.from(document.querySelectorAll(sel)).forEach((n) => n.remove());
  }

  function boot() {
    if (FXM.booted) teardown();
    FXM.booted = true;

    const observer = new MutationObserver((mutations) => {
      const relevant = mutations.some((m) => {
        if (isOwnMutation(m.target)) return false;
        const nodeCount = m.addedNodes.length + m.removedNodes.length;
        if (nodeCount === 0) return true; // nothing to inspect -- fall back to the target check above
        for (let i = 0; i < m.addedNodes.length; i++) {
          if (!isOwnNode(m.addedNodes[i])) return true;
        }
        for (let i = 0; i < m.removedNodes.length; i++) {
          if (!isOwnNode(m.removedNodes[i])) return true;
        }
        return false;
      });
      if (relevant) scheduleRender();
    });
    FXM.observer = observer;

    FXM.render();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  boot();
})(window.FXM);

// ---- mobile/diagnostics.js ----
/**
 * Fantrax Refinements -- Mobile: on-page diagnostics badge
 * ---------------------------------------------------------------------
 * fantrax.com is an Angular SPA, and its mobile layout may not carry the
 * same DOM structure the desktop selectors above were written against --
 * and there's no console to check on a phone. This module probes for the
 * anchor elements each feature depends on and renders a small on-page
 * badge showing what was (and wasn't) found, so a layout mismatch is
 * visible without plugging into a computer. It only runs when
 * `window.FX_DIAGNOSTICS` is set (by the mobile injection bundle) and is
 * inert everywhere else.
 * ---------------------------------------------------------------------
 */
(function () {
  'use strict';
  if (!window.FX_DIAGNOSTICS) return;

  const PROBE_GROUPS = [
    {
      name: 'Live scoring',
      selectors: [
        'pill-group[aria-label="Mode"]',
        '.scoring-table__row',
        '.scoring-table__cell__content li > b',
      ],
    },
    {
      name: 'Pitch editor',
      selectors: [
        '.i-table__row',
        'button.lineup-btn',
        'league-team-roster-pitch-view figure.pitch-view__player',
        'button.tabs__item',
      ],
    },
  ];

  const state = {
    badgeEl: null,
    expanded: false,
    dismissed: false,
    results: [], // [{ name, selectors: [{ selector, count }] }]
    settleTimer: null,
    initialTimer: null,
  };

  // ---------- probing ----------

  function runProbe() {
    return PROBE_GROUPS.map((group) => ({
      name: group.name,
      selectors: group.selectors.map((selector) => {
        let count = 0;
        try {
          count = document.querySelectorAll(selector).length;
        } catch (err) {
          count = 0;
        }
        return { selector, count };
      }),
    }));
  }

  function groupStatus(group) {
    const total = group.selectors.length;
    const found = group.selectors.filter((s) => s.count > 0).length;
    let color = '#e03131'; // red -- none found
    if (found === total) color = '#2f9e44'; // green -- all found
    else if (found > 0) color = '#f08c00'; // orange -- partial
    return { found, total, color };
  }

  // ---------- badge ----------

  function ensureBadge() {
    if (state.badgeEl) return state.badgeEl;

    const badge = document.createElement('div');
    badge.id = 'fx-diag';
    applyStyle(badge, {
      position: 'fixed',
      left: '8px',
      bottom: '8px',
      zIndex: '2147483647',
      background: 'rgba(20, 20, 20, 0.92)',
      color: '#fff',
      font: '12px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
      padding: '8px 10px',
      maxWidth: '85vw',
      maxHeight: '70vh',
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
      boxSizing: 'border-box',
      userSelect: 'none',
      WebkitUserSelect: 'none',
    });

    document.body.appendChild(badge);
    state.badgeEl = badge;
    return badge;
  }

  function applyStyle(el, styles) {
    for (const key in styles) {
      el.style[key] = styles[key];
    }
  }

  function clearEl(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function renderBadge() {
    if (state.dismissed) return;
    const badge = ensureBadge();
    clearEl(badge);

    if (!state.expanded) {
      renderCollapsed(badge);
    } else {
      renderExpanded(badge);
    }
  }

  function renderCollapsed(badge) {
    const row = document.createElement('div');
    applyStyle(row, {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      minHeight: '32px',
    });
    row.addEventListener('click', () => {
      state.expanded = true;
      renderBadge();
    });

    const label = document.createElement('span');
    label.textContent = 'FX diag';
    applyStyle(label, { fontWeight: '600', opacity: '0.85' });
    row.appendChild(label);

    state.results.forEach((group) => {
      const { found, total, color } = groupStatus(group);
      const pill = document.createElement('span');
      pill.textContent = group.name + ' ' + found + '/' + total;
      applyStyle(pill, {
        background: color,
        color: '#fff',
        borderRadius: '6px',
        padding: '3px 7px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
      });
      row.appendChild(pill);
    });

    if (!state.results.length) {
      const pending = document.createElement('span');
      pending.textContent = 'probing…';
      applyStyle(pending, { opacity: '0.7' });
      row.appendChild(pending);
    }

    const closeBtn = makeCloseButton();
    row.appendChild(closeBtn);

    badge.appendChild(row);
  }

  function renderExpanded(badge) {
    const header = document.createElement('div');
    applyStyle(header, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      cursor: 'pointer',
      minHeight: '32px',
      marginBottom: '4px',
    });
    header.addEventListener('click', (e) => {
      if (e.target && e.target.getAttribute && e.target.getAttribute('data-fx-diag-close')) return;
      state.expanded = false;
      renderBadge();
    });

    const label = document.createElement('span');
    label.textContent = 'FX diagnostics';
    applyStyle(label, { fontWeight: '600' });
    header.appendChild(label);
    header.appendChild(makeCloseButton());
    badge.appendChild(header);

    state.results.forEach((group) => {
      const { color } = groupStatus(group);
      const groupTitle = document.createElement('div');
      groupTitle.textContent = group.name;
      applyStyle(groupTitle, {
        fontWeight: '600',
        marginTop: '8px',
        color: color,
      });
      badge.appendChild(groupTitle);

      const list = document.createElement('div');
      applyStyle(list, { marginTop: '2px' });
      group.selectors.forEach((s) => {
        const line = document.createElement('div');
        applyStyle(line, {
          display: 'flex',
          alignItems: 'flex-start',
          gap: '6px',
          padding: '2px 0',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '11px',
          wordBreak: 'break-all',
        });

        const mark = document.createElement('span');
        mark.textContent = s.count > 0 ? '✓' : '✗';
        applyStyle(mark, {
          color: s.count > 0 ? '#2f9e44' : '#e03131',
          fontWeight: '700',
          flex: '0 0 auto',
        });
        line.appendChild(mark);

        const text = document.createElement('span');
        text.textContent = s.selector + ' (' + s.count + ')';
        line.appendChild(text);

        list.appendChild(line);
      });
      badge.appendChild(list);
    });

    if (!state.results.length) {
      const pending = document.createElement('div');
      pending.textContent = 'probing…';
      applyStyle(pending, { opacity: '0.7', marginTop: '8px' });
      badge.appendChild(pending);
    }
  }

  function makeCloseButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '✕';
    btn.setAttribute('data-fx-diag-close', '1');
    applyStyle(btn, {
      background: 'transparent',
      border: 'none',
      color: '#fff',
      opacity: '0.8',
      fontSize: '16px',
      lineHeight: '1',
      cursor: 'pointer',
      minWidth: '32px',
      minHeight: '32px',
      padding: '0',
      flex: '0 0 auto',
    });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismiss();
    });
    return btn;
  }

  function dismiss() {
    state.dismissed = true;
    if (state.settleTimer) clearTimeout(state.settleTimer);
    if (state.initialTimer) clearTimeout(state.initialTimer);
    try {
      observer.disconnect();
    } catch (err) {
      // ignore
    }
    if (state.badgeEl && state.badgeEl.parentNode) {
      state.badgeEl.parentNode.removeChild(state.badgeEl);
    }
    state.badgeEl = null;
  }

  // ---------- probe + render, guarded ----------

  function probeAndRender() {
    if (state.dismissed) return;
    try {
      state.results = runProbe();
      renderBadge();
    } catch (err) {
      // never throw -- diagnostics must not break the page
    }
  }

  // ---------- mutation observer, debounced ~5s after mutations settle ----------

  const SETTLE_MS = 5000;

  const observer = new MutationObserver(() => {
    if (state.dismissed) return;
    if (state.settleTimer) clearTimeout(state.settleTimer);
    state.settleTimer = setTimeout(probeAndRender, SETTLE_MS);
  });

  function start() {
    try {
      observer.observe(document.body, { childList: true, subtree: true });
    } catch (err) {
      // ignore -- body may not exist yet; the initial probe below still fires
    }
    state.initialTimer = setTimeout(probeAndRender, SETTLE_MS);
  }

  try {
    start();
  } catch (err) {
    // never throw
  }
})();
