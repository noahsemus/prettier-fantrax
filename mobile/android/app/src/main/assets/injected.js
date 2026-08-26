window.FX_DIAGNOSTICS = false;

(function () {
  'use strict';
  if (document.getElementById('fx-styles')) return;
  var style = document.createElement('style');
  style.id = 'fx-styles';
  style.textContent = "/* ---- src/shared/theme.css ---- */\n/**\n * Prettier Fantrax -- shared theme tokens (light + dark)\n * ---------------------------------------------------------------------\n * Everything this extension draws used to be hardcoded dark, which looked\n * right only because Fantrax's own default is dark. Switch the site to\n * light mode and our panels/menus/tooltips stayed near-black in the middle\n * of a white page.\n *\n * HOW FANTRAX SIGNALS THEME (confirmed live on both desktop and the mobile\n * app): dark mode puts `theme--dark` on `<body>`; light mode carries NO\n * theme class at all -- `document.body.className` is literally empty. So\n * light is the DEFAULT here and dark is the override, which is also why\n * this needs no JS: `body.theme--dark` is a plain ancestor selector, so a\n * live theme switch restyles everything of ours on the spot, with no\n * reload, no MutationObserver, and no re-render. Every overlay we create\n * is appended inside <body> (menus and tooltips included), so all of them\n * inherit these values.\n *\n * The light values are Fantrax's OWN palette, read off their computed\n * styles rather than invented, so our surfaces sit naturally beside\n * theirs: their gray scale (--color-gray--50/100/150/400/500/700/900,\n * e.g. hsl(214 16% 93.5%) for the app background) and their real page\n * surfaces (white table rows on an hsl(214 16% 93.5%) app background).\n * We define our own tokens rather than consuming theirs directly because\n * theirs are an absolute scale (gray--50 is light in BOTH themes), not\n * semantic roles that flip.\n *\n * NOT everything flips. The pitch itself is a green field in both themes\n * -- that's the whole point of the feature -- so the field, its markings,\n * the player cards sitting on it, and their translucent dark text plates\n * keep their own colors and stay legible against grass regardless of\n * theme. What flips is the CHROME around the pitch: bench/hint panels,\n * tooltips, action menus, and the text/borders inside them.\n * ---------------------------------------------------------------------\n */\n\n:root {\n  /* --- surfaces (light: Fantrax's own white-on-light-gray page) --- */\n  --fx-surface: #fff; /* panels: bench strip, menus, tooltips */\n  --fx-surface-sunken: hsl(214 16% 93.5%); /* secondary strips (hint bar), = their --color-gray--100 */\n  --fx-surface-hover: hsl(214 16% 89%); /* = their --color-gray--150 */\n\n  /* --- text --- */\n  --fx-text: hsl(212 11% 24%); /* = their --color-gray--900 */\n  --fx-text-secondary: hsl(212 14% 31%); /* = --color-gray--700 */\n  --fx-text-muted: hsl(214 15% 47%); /* = --color-gray--500 */\n  --fx-text-faint: hsl(214 12% 60%); /* = --color-gray--400 */\n\n  /* --- lines --- */\n  --fx-border: rgba(0, 0, 0, 0.1);\n  --fx-border-strong: rgba(0, 0, 0, 0.16);\n  --fx-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);\n\n  /* --- points values on a THEMED surface (menus, tooltips). Two\n         DELIBERATELY different scales, preserved from the pre-theme code\n         rather than merged: a stat BREAKDOWN line marks a positive with\n         green (--fx-stat-*), while a card's/row's headline FPts total uses\n         gold (--fx-pts-*). Light variants are darkened to stay readable on\n         white -- the dark theme's #ffd166 gold and #5be08a green are both\n         near-invisible on a white menu. --- */\n  --fx-stat-pos: hsl(154 62% 28%);\n  --fx-stat-neg: hsl(6 78% 43%);\n  --fx-stat-zero: hsl(214 15% 47%);\n\n  --fx-pts-pos: hsl(38 92% 32%);\n  --fx-pts-neg: hsl(6 78% 43%);\n  --fx-pts-zero: hsl(214 15% 47%);\n\n  /* --- accents --- */\n  --fx-accent: hsl(154 62% 32%); /* our \"active\"/valid green, darkened for light */\n  --fx-accent-soft: hsl(154 62% 32% / 0.12);\n\n  /* --- W/L/D result chip (matchup team headers, completed matchups) ---\n         Tinted plate + saturated text in light; the inverse weighting in\n         dark, where a solid pale plate would glare. */\n  --fx-win-bg: hsl(154 62% 90%);\n  --fx-win-fg: hsl(154 62% 24%);\n  --fx-loss-bg: hsl(6 78% 94%);\n  --fx-loss-fg: hsl(6 78% 38%);\n  --fx-draw-bg: hsl(214 16% 89%);\n  --fx-draw-fg: hsl(212 14% 31%);\n\n  /* --- lineup-warning banner (a starter who isn't starting) --- */\n  --fx-warn-bg: hsl(38 92% 94%);\n  --fx-warn-fg: hsl(30 90% 26%);\n  --fx-warn-border: hsl(38 92% 78%);\n}\n\nbody.theme--dark {\n  --fx-surface: #14181f;\n  --fx-surface-sunken: #0e1116;\n  --fx-surface-hover: rgba(255, 255, 255, 0.06);\n\n  --fx-text: #fff;\n  --fx-text-secondary: #cfd6de;\n  --fx-text-muted: #9aa4b2;\n  --fx-text-faint: #7c8794;\n\n  --fx-border: rgba(255, 255, 255, 0.08);\n  --fx-border-strong: rgba(255, 255, 255, 0.14);\n  --fx-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);\n\n  --fx-stat-pos: #5be08a;\n  --fx-stat-neg: #ff8a80;\n  --fx-stat-zero: #aeb8c4;\n\n  --fx-pts-pos: #ffd166;\n  --fx-pts-neg: #ff8a80;\n  --fx-pts-zero: #aeb8c4;\n\n  --fx-accent: #5be08a;\n  --fx-accent-soft: rgba(91, 224, 138, 0.12);\n\n  --fx-win-bg: rgba(91, 224, 138, 0.18);\n  --fx-win-fg: #5be08a;\n  --fx-loss-bg: rgba(255, 138, 128, 0.18);\n  --fx-loss-fg: #ff8a80;\n  --fx-draw-bg: rgba(255, 255, 255, 0.12);\n  --fx-draw-fg: #cfd6de;\n\n  --fx-warn-bg: rgba(255, 209, 102, 0.14);\n  --fx-warn-fg: #ffd166;\n  --fx-warn-border: rgba(255, 209, 102, 0.35);\n}\n\n\n/* ---- src/content/content.css ---- */\n.fx-tooltip {\n  position: fixed;\n  z-index: 2147483647;\n  background: var(--fx-surface);\n  color: var(--fx-text);\n  border: 1px solid var(--fx-border-strong);\n  padding: 6px 10px;\n  border-radius: 6px;\n  font-size: 12px;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif;\n  line-height: 1.4;\n  pointer-events: none;\n  box-shadow: var(--fx-shadow);\n  max-width: 260px;\n  display: none;\n  white-space: nowrap;\n}\n\n.fx-tooltip.fx-tooltip--visible {\n  display: block;\n}\n\n/* Colored (+N)/(-N) points span inside the hybrid stat tooltip -- see\n   content.js's showTooltip(). Distinct names from pitch-editor/tooltip.css's\n   .fx-tip-pts* classes since content.css is the only stylesheet guaranteed\n   loaded alongside this script. */\n.fx-tooltip__pts--pos {\n  color: var(--fx-stat-pos);\n}\n\n.fx-tooltip__pts--neg {\n  color: var(--fx-stat-neg);\n}\n\n.fx-tooltip__pts--zero {\n  color: var(--fx-stat-zero);\n}\n\n/* Give the simple-view stat abbreviations a hover affordance so it's\n   discoverable that they now do something. */\n.scoring-table__cell__content li > b {\n  cursor: help;\n  border-bottom: 1px dotted var(--fx-border-strong);\n}\n\n/* Masks content.js's brief, programmatic Stats/Fpts pill flip\n   (snapshotCounterpart) used to read the OTHER mode's values -- the same\n   \"hide the flip with visibility:hidden, not display:none, so nothing\n   reflows\" technique src/pitch-editor/points-sync.js's ensureSyncStyle /\n   `fx-syncing` class already uses for its own analogous scrape-by-\n   flipping-real-UI-controls on the roster page. `visibility: hidden`\n   (never `display: none`) keeps every element's layout box exactly where\n   it was, so hiding/revealing it causes no reflow or size jump -- only\n   the mode pill-group and the scoring table's own content (the two\n   regions that actually change value between modes) are covered; nothing\n   else on the page is touched. */\nhtml.fx-livescoring-syncing pill-group[aria-label=\"Mode\"],\nhtml.fx-livescoring-syncing .scoring-table {\n  visibility: hidden;\n}\n\n\n/* ---- src/shared/touch-overlay.css ---- */\n/**\n * Prettier Fantrax -- shared touch-overlay module: color tokens\n * ---------------------------------------------------------------------\n * The ONE shared definition of the signed-points parenthetical color\n * classes built by touch-overlay.js's FXShared.renderStatLine, consumed by\n * both pitch-editor's tooltip/action-menu stat lines and matchup's\n * tooltip stat lines. Replaces the formerly-duplicated `.fx-tip-pts--*`\n * (pitch-editor/tooltip.css) and `.fxm-tip__stat--*` (matchup/matchup.css)\n * rules.\n *\n * Values: green/red match what both duplicated rulesets already agreed on\n * (#5be08a / #ff8a80). The muted \"zero\" gray had drifted slightly between\n * the two (#aeb8c4 in fx-tip-pts--zero vs #9aa4b2 in fxm-tip__stat--zero)\n * -- standardized on one value, which also matches the pts-color classes\n * on the cards themselves in both features (.fx-card__fpts--zero,\n * .fxm-card__pts--zero), so the \"zero\" gray now reads consistently\n * everywhere a stat number appears, not just in the two former tooltip\n * stylesheets.\n *\n * These lines only ever render inside a THEMED surface (a tooltip or an\n * action menu), never on the green pitch, so they take their values from\n * theme.css's flipping --fx-stat-* tokens: the dark theme keeps the\n * original bright-on-dark colors, and light mode swaps in darkened\n * equivalents, since #5be08a/#ff8a80 on a white menu are barely readable.\n * ---------------------------------------------------------------------\n */\n\n.fxs-stat-pts--pos {\n  color: var(--fx-stat-pos);\n}\n\n.fxs-stat-pts--neg {\n  color: var(--fx-stat-neg);\n}\n\n.fxs-stat-pts--zero {\n  color: var(--fx-stat-zero);\n}\n\n\n/* ---- src/pitch-editor/pitch.css ---- */\n.fx-pitch {\n  --fx-green-1: #1e6b3a;\n  --fx-green-2: #268049;\n  --fx-line: rgba(255, 255, 255, 0.55);\n  margin: 12px 0 18px;\n  border-radius: 12px;\n  overflow: hidden;\n  border: 1px solid var(--fx-border);\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif;\n}\n\n.fx-pitch__header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  background: var(--fx-surface-sunken);\n  padding: 8px 14px;\n  color: var(--fx-text);\n  font-size: 13px;\n}\n\n.fx-pitch__title {\n  font-weight: 700;\n  letter-spacing: 0.02em;\n}\n\n.fx-pitch__status {\n  font-size: 12px;\n  color: #aeb8c4;\n  min-height: 16px;\n  transition: color 0.2s ease;\n}\n\n.fx-pitch__status--ok {\n  color: #5be08a;\n}\n\n.fx-pitch__status--err {\n  color: #ff8a80;\n}\n\n.fx-pitch__field {\n  position: relative;\n  /* Clips the center circle's lower half (see .fx-pitch-marks__circle) --\n     its center sits exactly on the bottom boundary line so only the top\n     half bulges visibly into the field, same as a real pitch's halfway\n     line. Safe for drag/drop: native HTML5 drag uses a browser-painted\n     drag image (not a repositioned DOM node) and the touch-drag ghost is\n     `position: fixed` on <body> (see drag.js createTouchGhost), so neither\n     is clipped by this. */\n  overflow: hidden;\n  background: repeating-linear-gradient(\n    to bottom,\n    var(--fx-green-1) 0px,\n    var(--fx-green-1) 46px,\n    var(--fx-green-2) 46px,\n    var(--fx-green-2) 92px\n  );\n  padding: 18px 12px 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 14px;\n}\n\n.fx-pitch__field::before {\n  content: \"\";\n  position: absolute;\n  inset: 8px;\n  border: 2px solid var(--fx-line);\n  border-radius: 6px;\n  pointer-events: none;\n  opacity: 0.6;\n}\n\n/* ---------- pitch markings (goal end at top, half center-circle at bottom) ----------\n   This pitch renders ONE team's half: GK row at top down to F row near the\n   bottom, so the goal end belongs at the top and the bottom edge doubles as\n   the halfway line (its line is already drawn by .fx-pitch__field::before\n   above -- no separate halfway-line element needed). Built once per render\n   in render.js (buildPitchMarks) and appended before the position rows;\n   rows already sit at z-index: 1 so they layer on top of these regardless\n   of DOM order.\n\n   Same technique as matchup.css's `.fxm-marks`: plain divs, not an SVG with\n   a square viewBox stretched over the field's non-square box -- that\n   non-uniform scale turns circles into ellipses and strokes uneven\n   axis-to-axis. Round marks (circle, spots) use a fixed equal px\n   width/height -- never a percentage of two different-length axes -- so\n   they stay circular at any field width; rectangular marks use % width so\n   they stretch with the field like the boundary above. */\n.fx-pitch-marks {\n  position: absolute;\n  inset: 0;\n  z-index: 0;\n  pointer-events: none;\n}\n\n.fx-pitch-marks__box {\n  position: absolute;\n  top: 8px;\n  border: 1.5px solid var(--fx-line);\n  border-top: none; /* open onto the goal line, like a real box */\n  opacity: 0.6;\n  box-sizing: border-box;\n}\n\n.fx-pitch-marks__box--18 {\n  left: 20%;\n  right: 20%;\n  height: 64px;\n}\n\n.fx-pitch-marks__box--6 {\n  left: 37%;\n  right: 37%;\n  height: 28px;\n}\n\n.fx-pitch-marks__goal {\n  position: absolute;\n  top: -3px; /* pokes slightly above the boundary line, sitting on the goal line */\n  left: 45%;\n  right: 45%;\n  height: 7px;\n  border: 1.5px solid var(--fx-line);\n  border-bottom: none; /* open toward the pitch */\n  opacity: 0.6;\n  box-sizing: border-box;\n}\n\n.fx-pitch-marks__spot {\n  position: absolute;\n  width: 4px;\n  height: 4px;\n  margin: -2px 0 0 -2px;\n  background: var(--fx-line);\n  border-radius: 50%;\n  opacity: 0.6;\n}\n\n.fx-pitch-marks__spot--penalty {\n  top: 56px;\n  left: 50%;\n}\n\n.fx-pitch-marks__spot--center {\n  left: 50%;\n  bottom: 6px; /* 8px boundary inset - 2px radius: centers the dot on the halfway line */\n  margin: 0 0 0 -2px;\n}\n\n.fx-pitch-marks__circle {\n  position: absolute;\n  left: 50%;\n  /* 8px (boundary inset, i.e. the halfway line's position) - 45px (radius):\n     centers the circle exactly on the halfway line so it bulges up into\n     the field; the lower half falls outside .fx-pitch__field's border box\n     and is clipped by its overflow: hidden. */\n  bottom: -37px;\n  width: 90px;\n  height: 90px;\n  margin-left: -45px;\n  border: 1.5px solid var(--fx-line);\n  border-radius: 50%;\n  opacity: 0.6;\n  box-sizing: border-box;\n}\n\n/* Narrow (mobile, ~414px) viewports get a proportionally smaller field --\n   shrink the circle to match, same fixed-px approach matchup.css uses at\n   its own breakpoint. Box marks need no adjustment: their % widths already\n   scale with the field. */\n@media (max-width: 480px) {\n  .fx-pitch-marks__circle {\n    width: 64px;\n    height: 64px;\n    margin-left: -32px;\n    bottom: -24px; /* 8px - 32px radius */\n  }\n}\n\n.fx-pitch__row {\n  display: flex;\n  justify-content: center;\n  gap: 10px;\n  flex-wrap: wrap;\n  position: relative;\n  z-index: 1;\n}\n\n.fx-bench {\n  background: var(--fx-surface);\n  padding: 12px 14px 16px;\n  border-top: 1px solid var(--fx-border);\n}\n\n.fx-bench__label {\n  color: var(--fx-text-muted);\n  font-size: 11px;\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n  margin-bottom: 8px;\n}\n\n.fx-bench__row {\n  display: flex;\n  gap: 10px;\n  flex-wrap: wrap;\n}\n\n.fx-pitch__hint {\n  padding: 6px 14px 10px;\n  background: var(--fx-surface);\n  color: var(--fx-text-faint);\n  font-size: 11px;\n  border-top: 1px solid var(--fx-border);\n}\n\n.fx-list-collapsed {\n  display: none !important;\n}\n\n/* Neutralizes Fantrax's OWN `.pill--active` styling on Easy Click/Classic\n   back to a plain (inactive) `.pill`'s look, but ONLY while our own\n   \"Pitch Editor\" pill is the active one -- tabs.js toggles\n   `fx-pitch-tab-mode-on` on the shared `<nav>` those pills live in (see\n   that file's header comment, fix #2, for the full \"why\": Fantrax's own\n   Angular keeps `.pill--active` on Easy Click regardless of whether our\n   tab is the one actually driving the view, so without this override BOTH\n   could visually read as active at once). Values are a literal copy of\n   the real page's own computed styles for an ACTIVE vs. an INACTIVE pill\n   (read live, not guessed): active is `rgba(54, 211, 153, 0.23)` background\n   / `rgb(165, 243, 207)` text; inactive is fully transparent background /\n   plain white text. `!important` because Fantrax's own `.pill--active`\n   rule is what this must win against. */\n.fx-pitch-tab-mode-on .pill--active {\n  background: rgba(0, 0, 0, 0) !important;\n  color: rgb(255, 255, 255) !important;\n}\n\n/* Fantrax's OWN native read-only pitch-view button -- a small green\n   icon-button (`mat-icon[svgicon=\"soccer_field\"]`) next to the roster\n   page's Gameweek selector that opens a modal showing Fantrax's own\n   built-in read-only pitch graphic. Entirely superseded by this\n   extension's own pitch editor, so hidden as a redundant, confusing\n   second \"show me the pitch\" entry point -- hidden via CSS (never\n   removed/detached), same \"Fantrax's own Angular owns this DOM, don't\n   fight it structurally\" principle as `.fx-list-collapsed` above, so it\n   keeps re-hiding itself correctly however/whenever Fantrax re-renders\n   this button. Always hidden, not scoped to `fx-pitch-tab-mode-on` --\n   there's no Fantrax-native mode where this button is still useful once\n   our own pitch editor exists.\n   Confirmed live this does NOT break render.js's buildJerseyMap (which\n   reads jersey images out of the SAME widget this button opens,\n   `league-team-roster-pitch-view figure.pitch-view__player`): nothing in\n   this codebase ever opens that modal programmatically, so buildJerseyMap\n   was already relying on its own jerseyFromCrest (crest-derived) fallback\n   in every normal session before this button was ever hidden -- jerseys\n   still render correctly (verified live) since that fallback path is\n   completely unaffected by this button's visibility. */\nbutton:has(> mat-icon[svgicon=\"soccer_field\"]) {\n  display: none !important;\n}\n\n/* The \"Pitch Editor\" tab injected next to Fantrax's own \"Easy Click\" /\n   \"Classic\" pills. Styled to match rather than relying on their\n   (possibly view-encapsulated) CSS actually applying to a node we\n   inserted ourselves. */\n.fx-pitch-tab {\n  appearance: none;\n  border: none;\n  cursor: pointer;\n  padding: 7px 16px;\n  border-radius: 999px;\n  font-size: 13px;\n  font-weight: 600;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif;\n  color: var(--fx-text-secondary);\n  background: transparent;\n  transition: background 0.15s ease, color 0.15s ease;\n}\n\n.fx-pitch-tab:hover {\n  background: var(--fx-surface-hover);\n}\n\n.fx-pitch-tab--active {\n  background: #1e6b3a;\n  color: #fff;\n}\n\n.fx-pitch-tab--active:hover {\n  background: #1e6b3a;\n}\n\n/* Touch: keep a tap-and-hold on a card from triggering iOS's text-selection\n   callout or Android's native \"copy/share\" context menu -- that gesture is\n   reserved for lifting the card into drag mode (see drag.js touchstart). */\n.fx-card,\n.fx-card * {\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  user-select: none;\n}\n\n/* Floating clone that tracks the finger during a touch drag (drag.js\n   createTouchGhost). The real card stays in place, dimmed via the same\n   .fx-card--dragging rule the mouse path uses, so layout doesn't shift\n   under the thumb -- this is the \"lifted\" feedback the user actually sees. */\n.fx-card--touch-ghost {\n  position: fixed;\n  pointer-events: none;\n  z-index: 99999;\n  transform: scale(1.08);\n  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(91, 224, 138, 0.5);\n  opacity: 0.95;\n  transition: none;\n}\n\n/* ---------- initial-load / gameweek-switch loading state ----------\n   render.js swaps the field+bench for this block (buildLoadingOverlay())\n   for exactly the FIRST points-sync since page load or a gameweek switch --\n   see that file's header comment for the full \"why\". Reuses the same field\n   gradient (--fx-green-1/2, from .fx-pitch) so the loading state reads as\n   \"the same pitch, still settling\" rather than a totally different screen,\n   and a min-height roughly matching a typical field+bench so the swap to\n   real cards, once the sync resolves, isn't a big layout jump either. */\n.fx-pitch__loading {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 10px;\n  min-height: 220px;\n  padding: 20px 14px;\n  background: repeating-linear-gradient(\n    to bottom,\n    var(--fx-green-1) 0px,\n    var(--fx-green-1) 46px,\n    var(--fx-green-2) 46px,\n    var(--fx-green-2) 92px\n  );\n}\n\n.fx-pitch__spinner {\n  width: 26px;\n  height: 26px;\n  border-radius: 50%;\n  border: 3px solid rgba(255, 255, 255, 0.25);\n  border-top-color: #fff;\n  animation: fx-pitch-spin 0.8s linear infinite;\n}\n\n.fx-pitch__loading-label {\n  color: rgba(255, 255, 255, 0.85);\n  font-size: 12px;\n  font-weight: 600;\n  letter-spacing: 0.02em;\n}\n\n/* Card-shaped placeholders hinting at the bench row that's about to\n   render -- same footprint as a real .fx-card (card.css) so there's\n   nothing to reflow around once actual cards take their place. */\n.fx-pitch__skeleton-row {\n  display: flex;\n  gap: 10px;\n  flex-wrap: wrap;\n  justify-content: center;\n  margin-top: 12px;\n}\n\n.fx-pitch__skeleton-card {\n  width: 88px;\n  height: 92px;\n  border-radius: 8px;\n  background: linear-gradient(\n    100deg,\n    rgba(255, 255, 255, 0.08) 30%,\n    rgba(255, 255, 255, 0.18) 50%,\n    rgba(255, 255, 255, 0.08) 70%\n  );\n  background-size: 200% 100%;\n  animation: fx-pitch-shimmer 1.4s ease-in-out infinite;\n}\n\n@keyframes fx-pitch-spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n@keyframes fx-pitch-shimmer {\n  0% {\n    background-position: 200% 0;\n  }\n  100% {\n    background-position: -200% 0;\n  }\n}\n\n/* Respect the OS-level reduced-motion preference -- the loading state is\n   purely decorative feedback, not information conveyed only via motion, so\n   freezing it is a safe no-op rather than a functionality loss. */\n@media (prefers-reduced-motion: reduce) {\n  .fx-pitch__spinner,\n  .fx-pitch__skeleton-card {\n    animation: none;\n  }\n}\n\n/* ---------- \"your starter isn't starting\" banner ----------\n   Shown when a player in the ACTIVE lineup is benched or left out by their\n   real club and their game hasn't kicked off yet -- see\n   src/shared/lineup-alerts.js for the detection and for why this in-page\n   banner exists alongside the desktop/mobile notifications (it's the one\n   delivery layer that always works, with no permission and nothing needing\n   to be running in the background).\n\n   Sits directly under the pitch header, above the field, because it's\n   time-sensitive and about the lineup you're looking at -- putting it down\n   with the hint text would bury the one thing worth acting on. Warning\n   colors come from theme.css so it follows light/dark like everything\n   else. */\n.fx-pitch__alert {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 14px;\n  background: var(--fx-warn-bg);\n  color: var(--fx-warn-fg);\n  border-bottom: 1px solid var(--fx-warn-border);\n  font-size: 12px;\n  font-weight: 600;\n  line-height: 1.35;\n}\n\n/* A warning triangle, drawn in text rather than shipped as an asset --\n   inline so it can't be selected or read out as content by a screen\n   reader (the banner itself carries role=\"status\", so the text is already\n   announced). */\n.fx-pitch__alert::before {\n  content: \"⚠\";\n  flex: 0 0 auto;\n  font-size: 14px;\n  line-height: 1;\n}\n\n\n/* ---- src/pitch-editor/card.css ---- */\n.fx-card {\n  position: relative;\n  width: 88px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  cursor: grab;\n  user-select: none;\n  /* iOS's own long-press callout (the copy/share sheet) would otherwise\n     fight the tap-and-hold lift gesture, same way Android's native\n     long-press drag did -- see the dragstart veto in drag.js. */\n  -webkit-touch-callout: none;\n  border-radius: 8px;\n  padding: 5px 4px 6px;\n  background: transparent;\n  border: 1px solid transparent;\n  transition: box-shadow 0.12s ease, border-color 0.12s ease, background 0.12s ease, opacity 0.12s ease;\n}\n\n.fx-card:hover:not(.fx-card--locked):not(.fx-card--empty) {\n  background: rgba(0, 0, 0, 0.22);\n}\n\n.fx-card--locked {\n  cursor: not-allowed;\n}\n\n/* Empty slots are only meaningful while a swap is in progress (native drag,\n   or a card armed via \"Start Swap\") -- removed from layout entirely\n   otherwise, so a partially-filled row centers around its real players\n   only and reads like an actual formation instead of a full-width grid. */\n.fx-card--empty {\n  display: none;\n  cursor: default;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px dashed rgba(255, 255, 255, 0.25);\n  min-height: 78px;\n  justify-content: center;\n}\n\n.fx-card--empty.fx-card--empty-visible {\n  display: flex;\n}\n\n.fx-card--dragging {\n  opacity: 0.35;\n}\n\n.fx-card--armed {\n  border-color: #ffd166;\n  box-shadow: 0 0 0 2px rgba(255, 209, 102, 0.35);\n  background: rgba(255, 209, 102, 0.1);\n}\n\n/* A legal target, not currently under the cursor. */\n.fx-card--drag-target-valid {\n  box-shadow: 0 0 0 1px rgba(91, 224, 138, 0.35);\n}\n\n/* A legal target directly under the cursor during a native drag. */\n.fx-card--drop-target {\n  border-color: #5be08a;\n  box-shadow: 0 0 0 2px rgba(91, 224, 138, 0.4);\n  background: rgba(91, 224, 138, 0.12);\n}\n\n/* Not a legal target for the player currently being moved. */\n.fx-card--drag-invalid {\n  opacity: 0.35;\n  pointer-events: none;\n}\n\n/* Touch tap-select dimming -- action-menu.js's openActionMenu, via\n   FXShared.selectAndDim (src/shared/touch-overlay.js), dims every OTHER\n   card while the action menu is anchored to one on a coarse-pointer\n   (touch) device, so it's unambiguous which player the menu belongs to.\n   Cleared by closeActionMenu via FXShared.clearDim. Mirrors\n   matchup.css's `.fxm-card--dimmed` exactly (same opacity, same\n   transition) for visual consistency between the two features -- own\n   class name/own rule here rather than a shared CSS class, since each\n   feature's card component is styled independently. */\n.fx-card--dimmed {\n  opacity: 0.35;\n  transition: opacity 0.2s ease;\n}\n\n.fx-card__crest {\n  width: auto;\n  height: 46px;\n  max-width: 52px;\n  object-fit: contain;\n  margin-bottom: 2px;\n  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.55));\n  pointer-events: none;\n}\n\n.fx-card__pos {\n  position: absolute;\n  top: 2px;\n  left: 2px;\n  font-size: 8px;\n  font-weight: 700;\n  color: #0e1116;\n  background: rgba(245, 247, 250, 0.9);\n  border-radius: 3px;\n  padding: 0 3px;\n  pointer-events: none;\n}\n\n/* Groups the name/fpts/opp text below the jersey on its own translucent dark\n   plate -- the pitch background is bright green and varies row to row, so\n   white text alone isn't reliably legible without it. Stretches to the\n   card's full (fixed) width regardless of how narrow its own text is. The\n   card's own :hover background (above) sits underneath this and is mostly\n   swallowed by it -- keep the alpha here moderate so a hover still reads as\n   a highlight rather than the text going fully opaque-on-black. */\n.fx-card__info {\n  align-self: stretch;\n  background: rgba(0, 0, 0, 0.45);\n  border-radius: 6px;\n  padding: 2px 5px 3px;\n  /* Centers all children (name/fpts/opp, and anything added later) in one\n     place rather than relying on each child to carry its own text-align. */\n  text-align: center;\n}\n\n.fx-card__name {\n  font-size: 10.5px;\n  color: #fff;\n  text-align: center;\n  line-height: 1.2;\n  max-width: 84px;\n  overflow: hidden;\n  /* clip, never ellipsis: the name text is an inline-block span (an atomic\n     inline), and text-overflow: ellipsis hides a partially-fitting atomic\n     inline ENTIRELY -- an overflowing name rendered as a bare \"...\" in the\n     gap before render.js's applyMarquee measurement pass runs, or forever\n     when a sub-pixel overflow rounded to scrollWidth === clientWidth and\n     never tripped the marquee at all (constant on Android, where Roboto\n     runs wider). Real overflow marquees instead of truncating (below), so\n     ellipsis has no case left where it helps. */\n  text-overflow: clip;\n  white-space: nowrap;\n  pointer-events: none;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);\n  margin-top: 1px;\n}\n\n/* Long names that don't fit in the 84px box marquee instead of truncating.\n   render.js measures every card after each render and only adds\n   .fx-card__name--marquee (plus --fx-marquee-dist, how far left the inner\n   span needs to travel) to names that actually overflow -- names that fit\n   are left completely alone. The event-status dot lives outside\n   `.fx-card__name-inner` (see renderCard in render.js) so it stays fixed\n   in place while only the name text scrolls. */\n.fx-card__name-inner {\n  display: inline-block;\n  will-change: transform;\n}\n\n.fx-card__name--marquee .fx-card__name-inner {\n  animation: fx-marquee 6s ease-in-out infinite alternate;\n}\n\n/* Hold at each extreme (0%-15% and 85%-100%) so the reader gets a beat to\n   start/finish reading before the direction reverses, instead of the text\n   immediately snapping into motion. */\n@keyframes fx-marquee {\n  0%,\n  15% {\n    transform: translateX(0);\n  }\n  85%,\n  100% {\n    transform: translateX(var(--fx-marquee-dist));\n  }\n}\n\n/* Fantrax's own real-life \"is this player playing\" indicator, reused here.\n   See EVENT_STATUS_MAP in roster.js for what each color means. */\n.fx-card__dot {\n  display: inline-block;\n  width: 6px;\n  height: 6px;\n  border-radius: 50%;\n  margin-right: 3px;\n  margin-bottom: 1px;\n  pointer-events: auto;\n}\n\n.fx-card__dot--starting {\n  background: hsl(160 84% 38%);\n}\n\n.fx-card__dot--expected {\n  background: hsl(27 100% 61%);\n}\n\n.fx-card__dot--bench {\n  background: hsl(46 97% 65%);\n}\n\n.fx-card__dot--out {\n  background: hsl(349.7 80% 60.2%);\n}\n\n.fx-card__fpts {\n  font-size: 11px;\n  font-weight: 700;\n  pointer-events: none;\n  margin-top: 1px;\n}\n\n.fx-card__fpts--pos {\n  color: #ffd166;\n}\n\n.fx-card__fpts--neg {\n  color: #ff8a80;\n}\n\n.fx-card__fpts--zero {\n  color: #aeb8c4;\n}\n\n.fx-card__opp {\n  font-size: 8.5px;\n  color: #cfe0ea;\n  opacity: 0.75;\n  text-align: center;\n  line-height: 1.25;\n  max-width: 86px;\n  overflow: hidden;\n  text-overflow: clip;\n  white-space: nowrap;\n  pointer-events: none;\n  margin-top: 2px;\n}\n\n/* Long game/opponent lines that don't fit in the 86px box marquee instead of\n   truncating -- same mechanism as the name marquee above (see that comment\n   and applyMarquee/MARQUEE_SETS in render.js), just applied to a different\n   element and reusing the SAME fx-marquee keyframes rather than a\n   duplicate declaration. The base rule's text-overflow is already `clip`\n   (same atomic-inline reasoning as .fx-card__name), so the marquee class\n   needs no override of its own. */\n.fx-card__opp-inner {\n  display: inline-block;\n  will-change: transform;\n}\n\n.fx-card__opp--marquee .fx-card__opp-inner {\n  animation: fx-marquee 6s ease-in-out infinite alternate;\n}\n\n.fx-card__plus {\n  font-size: 20px;\n  color: rgba(255, 255, 255, 0.35);\n  pointer-events: none;\n}\n\n/* ---------- per-card swap-in-progress state ----------\n   Applied by swap.js's attemptSwap to just the source and target cards for\n   the ~1-2s a real swap takes clicking through Fantrax's own controls --\n   NOT the whole-pitch overlay pitch.css's .fx-pitch__loading uses for the\n   initial points sync. That overlay means \"we don't have anything to show\n   yet\"; this means \"the data's fine, these two cards are mid-request,\" so\n   it stays scoped to the two cards actually involved. Dims/desaturates the\n   card and centers a small spinner over it -- reuses pitch.css's\n   `fx-pitch-spin` keyframes (both files load together, so the keyframe\n   name is shared) rather than redefining the same rotation.\n   `.fx-card--empty` is `display: none` by default (only shown mid-drag via\n   `.fx-card--empty-visible`, cleared by drag.js's `dragend` handler on the\n   very next event tick after a drop) -- force it visible here too, since an\n   empty-slot target dropped onto should still show its own loading card for\n   the duration of the swap instead of just disappearing. */\n.fx-card--swapping {\n  position: relative;\n  pointer-events: none;\n  filter: grayscale(0.6);\n  opacity: 0.55;\n}\n\n.fx-card--empty.fx-card--swapping {\n  display: flex;\n}\n\n.fx-card--swapping::after {\n  content: '';\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  width: 20px;\n  height: 20px;\n  margin: -10px 0 0 -10px;\n  border-radius: 50%;\n  border: 2.5px solid rgba(255, 255, 255, 0.3);\n  border-top-color: #fff;\n  animation: fx-pitch-spin 0.8s linear infinite;\n}\n\n/* Reduced motion: keep the dim + static ring, drop only the spin -- same\n   policy as pitch.css's own loading state. */\n@media (prefers-reduced-motion: reduce) {\n  .fx-card--swapping::after {\n    animation: none;\n    border-top-color: rgba(255, 255, 255, 0.75);\n  }\n}\n\n/* ---------- bench cards in light mode ----------\n   Bench cards are the one place a card does NOT sit on grass: they sit on\n   .fx-bench, which follows the site theme (see src/shared/theme.css). The\n   translucent-black info plate and white text below are tuned for green,\n   and over a white bench panel they read as gray boxes with washed-out\n   text. Re-tone just those cards for light mode -- the pitch's own cards,\n   and everything in dark mode (where the plate over #14181f already looks\n   right), are untouched. The text-shadow goes too: it exists to lift white\n   text off grass, and only muddies dark text on a light plate. */\nbody:not(.theme--dark) .fx-bench .fx-card__info {\n  background: rgba(0, 0, 0, 0.05);\n}\n\nbody:not(.theme--dark) .fx-bench .fx-card__name {\n  color: var(--fx-text);\n  text-shadow: none;\n}\n\nbody:not(.theme--dark) .fx-bench .fx-card__opp {\n  color: var(--fx-text-muted);\n  opacity: 1;\n}\n\nbody:not(.theme--dark) .fx-bench .fx-card__fpts--pos {\n  color: var(--fx-pts-pos);\n}\n\nbody:not(.theme--dark) .fx-bench .fx-card__fpts--neg {\n  color: var(--fx-pts-neg);\n}\n\nbody:not(.theme--dark) .fx-bench .fx-card__fpts--zero {\n  color: var(--fx-pts-zero);\n}\n\n\n/* ---- src/pitch-editor/tooltip.css ---- */\n.fx-card-tip {\n  position: fixed;\n  z-index: 2147483647;\n  background: var(--fx-surface);\n  color: var(--fx-text);\n  border: 1px solid var(--fx-border-strong);\n  padding: 8px 10px;\n  border-radius: 6px;\n  font-size: 11.5px;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif;\n  line-height: 1.5;\n  pointer-events: none;\n  box-shadow: var(--fx-shadow);\n  width: max-content;\n  max-width: min(260px, calc(100vw - 16px));\n  box-sizing: border-box;\n  display: none;\n}\n\n.fx-card-tip--visible {\n  display: block;\n}\n\n.fx-card-tip__title {\n  font-weight: 700;\n  color: var(--fx-text);\n  margin-bottom: 3px;\n  white-space: normal;\n  overflow-wrap: break-word;\n}\n\n.fx-card-tip__row {\n  color: var(--fx-text-secondary);\n  white-space: normal;\n  overflow-wrap: break-word;\n}\n\n/* Colored (+N)/(-N) points span inside a hybrid stat line -- built by\n   FXShared.renderStatLine (src/shared/touch-overlay.js), classed\n   `fxs-stat-pts fxs-stat-pts--pos|neg|zero` and styled once in\n   src/shared/touch-overlay.css. Was `.fx-tip-pts--*` here; removed in\n   favor of the shared classes (also used by matchup's tooltip) so the\n   color values can't drift between the two features again. */\n\n\n/* ---- src/pitch-editor/action-menu.css ---- */\n.fx-action-menu {\n  position: fixed;\n  z-index: 2147483647;\n  background: var(--fx-surface);\n  border: 1px solid var(--fx-border-strong);\n  border-radius: 8px;\n  padding: 4px;\n  min-width: 160px;\n  box-shadow: var(--fx-shadow);\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif;\n  display: flex;\n  flex-direction: column;\n  gap: 1px;\n}\n\n.fx-action-menu__item {\n  appearance: none;\n  border: none;\n  background: transparent;\n  color: var(--fx-text);\n  font-size: 12.5px;\n  text-align: left;\n  padding: 8px 10px;\n  border-radius: 5px;\n  cursor: pointer;\n}\n\n.fx-action-menu__item:hover:not(:disabled) {\n  background: var(--fx-surface-hover);\n}\n\n.fx-action-menu__item--danger {\n  color: var(--fx-stat-neg);\n}\n\n.fx-action-menu__item--disabled,\n.fx-action-menu__item:disabled {\n  color: var(--fx-text-faint);\n  cursor: not-allowed;\n}\n\n/* Read-only stats block (coarse-pointer/touch only -- see action-menu.js).\n   Mirrors the hover tooltip's title/row hierarchy at menu-appropriate\n   sizing. Not a button: default cursor, no hover state, doesn't act. */\n.fx-action-menu__stats {\n  cursor: default;\n  max-height: 40vh;\n  overflow-y: auto;\n  padding: 6px 10px;\n}\n\n.fx-action-menu__stats-title {\n  font-size: 12px;\n  font-weight: 700;\n  color: var(--fx-text);\n  margin-bottom: 3px;\n  white-space: normal;\n  overflow-wrap: break-word;\n}\n\n.fx-action-menu__stats-row {\n  font-size: 11.5px;\n  color: var(--fx-text-secondary);\n  line-height: 1.5;\n  white-space: normal;\n  overflow-wrap: break-word;\n}\n\n.fx-action-menu__divider {\n  height: 1px;\n  margin: 4px 6px;\n  background: var(--fx-border-strong);\n  flex: none;\n}\n\n/* \"Recent performances\" block (src/shared/last5.js's fetched data,\n   coarse-pointer/touch only -- see action-menu.js, which also explains why\n   it's limited to players whose game hasn't kicked off yet). Styled as\n   SUPPORTING info below the stats block: smaller, more muted, and set off\n   by a thin top border rather than a second full divider, which would read\n   heavier than this block deserves. Mirrors matchup's own\n   .fxm-action-menu__last5 rules exactly, per this codebase's\n   shared-logic/own-feature-scoped-CSS convention. */\n.fx-action-menu__last5 {\n  cursor: default;\n  padding: 6px 10px 4px;\n  margin-top: 2px;\n  border-top: 1px solid var(--fx-border);\n  white-space: normal;\n  overflow-wrap: break-word;\n}\n\n.fx-action-menu__last5-title {\n  font-size: 10px;\n  font-weight: 700;\n  color: var(--fx-text-muted);\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  margin-bottom: 3px;\n}\n\n/* Loading placeholder only -- swapped out (never toggled back on) by\n   refreshLast5UI once the fetch resolves, so this is a one-way\n   transitional state, not a persistent style variant. */\n.fx-action-menu__last5-title--loading {\n  text-transform: none;\n  letter-spacing: normal;\n  font-weight: 600;\n  font-style: italic;\n  color: var(--fx-text-faint);\n}\n\n.fx-action-menu__last5-row {\n  font-size: 11px;\n  color: var(--fx-text-secondary);\n  line-height: 1.5;\n}\n\n/* Stands in for the rows when there aren't any: either no games on record\n   yet, or a failed fetch (see renderLast5Rows). Muted and italic so it\n   reads as an explanation, not as a performance line missing its number. */\n.fx-action-menu__last5-row--muted {\n  color: var(--fx-text-faint);\n  font-style: italic;\n}\n\n\n/* ---- src/matchup/matchup.css ---- */\n/**\n * Prettier Fantrax -- Matchup Pitch styles\n * ---------------------------------------------------------------------\n * All classes are prefixed `fxm-` (never `fx-`) -- Fantrax's own code uses\n * an `fx-` prefix itself (fx-nav, fx-layout__pane, ...) and this\n * extension's existing pitch-editor feature also uses `fx-card`/`fx-pitch`\n * etc., so a distinct prefix avoids any collision with either.\n *\n * The single breakpoint below (760px) is what flips the pitch between the\n * wide \"horizontal\" layout (teams face each other left/right) and the\n * narrow \"vertical\" one (teams face each other top/bottom) -- render.js's\n * DOM is identical in both cases; only flex-direction and which field-mark\n * group is visible change. Kept in sync with FXM.NARROW_BREAKPOINT_PX in\n * state.js (that constant isn't read by this file, it's just a comment\n * pointer for anyone changing one side to change the other).\n * ---------------------------------------------------------------------\n */\n\n.fxm-matchup {\n  --fxm-green-1: #1e6b3a;\n  --fxm-green-2: #268049;\n  --fxm-line: rgba(255, 255, 255, 0.55);\n  margin: 12px 0 18px;\n  border-radius: 12px;\n  overflow: hidden;\n  border: 1px solid var(--fx-border);\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif;\n}\n\n/* ---------- top bar (title + hide/show toggle) ---------- */\n\n.fxm-topbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  background: var(--fx-surface-sunken);\n  padding: 8px 14px;\n  color: var(--fx-text);\n  font-size: 13px;\n  border-bottom: 1px solid var(--fx-border);\n}\n\n.fxm-topbar__title {\n  font-weight: 700;\n  letter-spacing: 0.02em;\n}\n\n.fxm-toggle-btn {\n  appearance: none;\n  border: none;\n  cursor: pointer;\n  padding: 5px 14px;\n  border-radius: 999px;\n  font-size: 12px;\n  font-weight: 600;\n  font-family: inherit;\n  color: var(--fx-text-secondary);\n  background: var(--fx-surface-hover);\n  transition: background 0.15s ease;\n}\n\n.fxm-toggle-btn:hover {\n  background: var(--fx-border-strong);\n}\n\n/* ---------- body layout + team headers ---------- */\n/* .fxm-body is a CSS grid so each team header AND each team's bench strip\n   can be its own top-level grid item (neither nested in a shared \"header\n   bar\"/\"bench bar\" wrapper) and get repositioned purely by which named\n   area matchup.css assigns it at each breakpoint -- wide: both headers\n   share one row above the field and both benches share one row below it\n   (visually the old single header bar / single bench bar). Narrow: home's\n   header+bench sit above the field next to home's half, away's\n   header+bench sit below the field next to away's half -- see the\n   `@media (max-width: 760px)` override below for the split. */\n.fxm-body {\n  display: grid;\n  /* minmax(0, 1fr), not plain 1fr -- a bare `1fr` track still has an\n     implicit automatic minimum width equal to its content's min-content\n     size, so an oversized grid item (e.g. .fxm-field, if its own pitch\n     cards ever force it wider than intended -- see the narrow-viewport\n     card-shrink rules below) would inflate the WHOLE column/row instead of\n     being contained by it, dragging every other item sharing that track\n     (the team headers) wider too. minmax(0, 1fr) removes that implicit\n     minimum so the track -- and everything in it -- is bounded by the grid\n     container's actual width, the same role min-width:0 plays on a flex\n     item. */\n  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);\n  grid-template-areas:\n    \"home-header away-header\"\n    \"field field\"\n    \"home-bench away-bench\";\n}\n\n.fxm-team-header {\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  background: var(--fx-surface-sunken);\n  padding: 10px 14px;\n  color: var(--fx-text);\n}\n\n.fxm-team-header--home {\n  grid-area: home-header;\n}\n\n.fxm-team-header--away {\n  grid-area: away-header;\n  align-items: flex-end;\n  text-align: right;\n}\n\n/* Name row: crest + team name side by side. Its own flex row (not just\n   `.fxm-team-header` itself, which stays a flex COLUMN stacking this row\n   above `.fxm-team-header__scores`) so it can be independently reversed per\n   side below. min-width: 0 lets `.fxm-team-header__name` actually shrink\n   (and marquee) inside this flex row instead of forcing the row wider. */\n.fxm-team-header__top {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  min-width: 0;\n  max-width: 100%;\n}\n\n/* Away side is right-aligned (see `.fxm-team-header--away` above) -- mirror\n   the crest to the OUTER (right) edge of the name instead of always\n   sitting to the name's left, so the row reads as a coherent unit flush\n   against the header's own right-aligned edge. */\n.fxm-team-header--away .fxm-team-header__top {\n  flex-direction: row-reverse;\n}\n\n/* Modest, fixed size -- this is a compact header row, not a player card;\n   crest comes straight off Fantrax's own DOM (parse.js's readCrestFromFigure\n   on figure.scoring-header__logo) so it's never stretched/distorted here.\n   flex: 0 0 auto keeps it from ever being squeezed by the name's marquee\n   sizing next to it.\n   object-fit: cover + border-radius match Fantrax's OWN real rendering of\n   this exact crest, live-checked on Fantrax's own page:\n   figure.scoring-header__logo there computes to background-size: cover\n   (crops to fill, never letterboxes) with border-radius: 12px at their own\n   ~62px size -- i.e. a ratio of roughly width/5. `contain` (the old value)\n   letterboxed the image instead of cropping it, and had no rounding at all,\n   so it read visibly differently from Fantrax's own crest chip elsewhere on\n   the same page. border-radius: 6px here keeps that same ~width/5 ratio at\n   this element's own 30px base size (mobile scales both together -- see the\n   narrow-breakpoint override below). */\n.fxm-team-header__logo {\n  flex: 0 0 auto;\n  width: 30px;\n  height: 30px;\n  object-fit: cover;\n  border-radius: 6px;\n  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45));\n}\n\n/* text-overflow is `clip`, never `ellipsis`, exactly per .fxm-card__name's\n   own comment below: a name that fits never truncates at all, so an\n   \"ellipsis for the fits case\" rule is both pointless and risky -- it can\n   only ever fire during the timing gap before render.js's\n   applyNameMarquee/applyMarqueeToSet measurement pass runs (fresh DOM,\n   animation not yet applied), which is exactly how a real overflowing name\n   could flash as a bare \"...\" with nothing else visible. `max-width` here\n   is only the OVERFLOW TRIGGER boundary applyMarqueeToSet reads\n   (scrollWidth vs. clientWidth) -- not a hard clip; a too-long team name\n   marquees instead of truncating, same treatment as player card names.\n   min-width: 0 is required now that this sits in `.fxm-team-header__top`'s\n   flex row (next to the optional crest) -- without it, a flex item's\n   default auto min-width would refuse to shrink below its content size,\n   defeating both the max-width clamp and the overflow-driven marquee.\n   Same reasoning holds at the narrow breakpoint below, where\n   `.fxm-team-header__top` becomes `display: contents` and this element is\n   promoted to a direct grid item of `.fxm-team-header` (grid-area: name) --\n   a grid item's default auto min-width refuses to shrink below its content\n   size for exactly the same reason a flex item's does, so this same\n   min-width: 0 (already unconditional, not scoped to the flex case) keeps\n   doing the same job there with no separate override needed. */\n.fxm-team-header__name {\n  min-width: 0;\n  font-weight: 700;\n  font-size: 13px;\n  max-width: 240px;\n  overflow: hidden;\n  text-overflow: clip;\n  white-space: nowrap;\n}\n\n.fxm-team-header__name-text {\n  display: inline-block;\n}\n\n/* Applied by render.js's applyNameMarquee/applyMarqueeToSet only when the\n   name actually overflows its box -- mirrors .fxm-card__name--marquee's\n   own comment below, adapted for a header name that can be either\n   naturally left-aligned (home side, inherited default) or right-aligned\n   (away side, via .fxm-team-header--away's own `text-align: right` above,\n   which otherwise inherits straight down onto this element).\n   .fxm-team-header__name-text is display: inline-block, so its resting\n   (0%) static position sits wherever the CURRENT text-align puts it --\n   on the away side that's flush right, i.e. 0% would already show the\n   TAIL of the name with the start clipped off, and the translateX(0) ->\n   translateX(var(--fxm-marquee-dist)) range (computed by\n   applyMarqueeToSet as the exact scrollWidth - clientWidth overflow)\n   wouldn't line up with the text's true start/end either. Forcing\n   `text-align: left` here -- regardless of side -- makes the inner\n   span's static position flush with the box's left edge on BOTH sides\n   once marqueeing, so 0% always shows the real start of the name and the\n   animation's endpoint always shows the real end, exactly like\n   .fxm-card__name--marquee. Reuses the SAME `fxm-marquee` keyframes\n   player card names use (already parametrized entirely by\n   --fxm-marquee-dist, so nothing side-specific needs duplicating here). */\n.fxm-team-header__name--marquee {\n  text-align: left;\n}\n\n.fxm-team-header__name--marquee .fxm-team-header__name-text {\n  animation: fxm-marquee 6s ease-in-out infinite alternate;\n}\n\n/* Manager username (e.g. \"noahsemus\"), fetched same-origin by render.js's\n   ensureOwnersFetched (see fxpa.js's header comment for why this needs a\n   fetch at all -- this data is nowhere in this header's own DOM). A\n   DIRECT child of `.fxm-team-header`, not `.fxm-team-header__top` -- it's\n   its own row under the crest+name row, not squeezed into that row\n   alongside them. Sizing/overflow handling mirrors `.fxm-team-header__name`\n   above (min-width: 0 so it can actually shrink and marquee instead of\n   forcing the header wider; text-overflow: clip for the same \"never\n   flashes a bare ellipsis before the marquee measurement pass runs\"\n   reason documented there) at a smaller, muted size befitting supporting\n   info rather than the team's own headline name. text-align inherits\n   naturally from `.fxm-team-header`/`.fxm-team-header--away` (right on the\n   away side) with no extra rule needed here, same as `__name` above. */\n.fxm-team-header__owner {\n  min-width: 0;\n  font-size: 10.5px;\n  font-weight: 600;\n  color: var(--fx-text-muted);\n  max-width: 240px;\n  overflow: hidden;\n  text-overflow: clip;\n  white-space: nowrap;\n  margin-top: 1px;\n}\n\n.fxm-team-header__owner-text {\n  display: inline-block;\n}\n\n/* Same \"force text-align: left so the marquee's 0%/100% line up with the\n   text's real start/end regardless of the box's own (possibly right-\n   aligned) resting alignment\" fix as `.fxm-team-header__name--marquee`'s\n   own comment above -- identical reasoning, just for this element. */\n.fxm-team-header__owner--marquee {\n  text-align: left;\n}\n\n.fxm-team-header__owner--marquee .fxm-team-header__owner-text {\n  animation: fxm-marquee 6s ease-in-out infinite alternate;\n}\n\n/* Hero totals: the LIVE score is the whole point of this header, so it\n   reads first and reads big -- the projected total stays present but\n   deliberately secondary (small, muted) right beneath it. Stacked in a\n   column (rather than the old side-by-side row) so the hero number has\n   room to be 2-3x its old size without forcing the header wider. */\n.fxm-team-header__scores {\n  display: flex;\n  flex-direction: column;\n  margin-top: 4px;\n}\n\n.fxm-team-header__live {\n  color: var(--fx-stat-pos);\n  font-weight: 800;\n  font-size: 34px;\n  line-height: 1;\n  letter-spacing: -0.01em;\n}\n\n.fxm-team-header__projected {\n  color: var(--fx-text-muted);\n  font-size: 12px;\n  font-weight: 600;\n  margin-top: 3px;\n}\n\n/* ---------- pitch field + markings ---------- */\n\n.fxm-field {\n  grid-area: field;\n  position: relative;\n  min-height: 480px;\n  padding: 16px 12px;\n  display: flex;\n  flex-direction: row;\n  background: repeating-linear-gradient(\n    to right,\n    var(--fxm-green-1) 0px,\n    var(--fxm-green-1) 46px,\n    var(--fxm-green-2) 46px,\n    var(--fxm-green-2) 92px\n  );\n}\n\n/* Plain divs (built once per render, both mark groups always present)\n   layered under the players; CSS alone decides which orientation's group\n   is visible so no re-render is needed on resize. Deliberately NOT an SVG\n   with a square viewBox stretched to the field's real (non-square) box --\n   that non-uniform scale turned the center circle into an ellipse and\n   made every stroke width uneven axis-to-axis. Round marks below use an\n   explicit equal px width/height (never a percentage of two\n   different-length axes) so they stay circular at any field size, and\n   every border is a real px value so stroke width stays uniform. */\n.fxm-marks {\n  position: absolute;\n  inset: 0;\n  z-index: 0;\n  pointer-events: none;\n}\n\n.fxm-marks__horizontal,\n.fxm-marks__vertical {\n  position: absolute;\n  inset: 0;\n}\n\n.fxm-marks__vertical {\n  display: none;\n}\n\n.fxm-marks__boundary {\n  position: absolute;\n  inset: 6px;\n  border: 1.5px solid var(--fxm-line);\n  border-radius: 6px;\n  opacity: 0.8;\n}\n\n/* halfway line -- vertical for the wide/horizontal orientation, horizontal\n   for the narrow/vertical one */\n.fxm-marks__halfway-v {\n  position: absolute;\n  top: 6px;\n  bottom: 6px;\n  left: 50%;\n  width: 1.5px;\n  background: var(--fxm-line);\n  opacity: 0.8;\n}\n\n.fxm-marks__halfway-h {\n  position: absolute;\n  left: 6px;\n  right: 6px;\n  top: 50%;\n  height: 1.5px;\n  background: var(--fxm-line);\n  opacity: 0.8;\n}\n\n.fxm-marks__circle {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  width: 96px;\n  height: 96px;\n  margin: -48px 0 0 -48px;\n  border: 1.5px solid var(--fxm-line);\n  border-radius: 50%;\n  opacity: 0.8;\n  box-sizing: border-box;\n}\n\n.fxm-marks__spot {\n  position: absolute;\n  width: 4px;\n  height: 4px;\n  margin: -2px 0 0 -2px;\n  background: var(--fxm-line);\n  border-radius: 50%;\n  opacity: 0.8;\n}\n\n.fxm-marks__spot--center {\n  top: 50%;\n  left: 50%;\n}\n\n.fxm-marks__spot--left {\n  top: 50%;\n  left: 10%;\n}\n\n.fxm-marks__spot--right {\n  top: 50%;\n  left: 90%;\n}\n\n.fxm-marks__spot--top {\n  top: 10%;\n  left: 50%;\n}\n\n.fxm-marks__spot--bottom {\n  top: 90%;\n  left: 50%;\n}\n\n.fxm-marks__box,\n.fxm-marks__box-inner {\n  position: absolute;\n  border: 1.5px solid var(--fxm-line);\n  opacity: 0.8;\n  box-sizing: border-box;\n}\n\n.fxm-marks__box--left {\n  left: 6px;\n  top: 26%;\n  bottom: 26%;\n  width: 15%;\n}\n\n.fxm-marks__box--right {\n  right: 6px;\n  top: 26%;\n  bottom: 26%;\n  width: 15%;\n}\n\n.fxm-marks__box-inner--left {\n  left: 6px;\n  top: 38%;\n  bottom: 38%;\n  width: 6%;\n}\n\n.fxm-marks__box-inner--right {\n  right: 6px;\n  top: 38%;\n  bottom: 38%;\n  width: 6%;\n}\n\n.fxm-marks__box--top {\n  top: 6px;\n  left: 26%;\n  right: 26%;\n  height: 15%;\n}\n\n.fxm-marks__box--bottom {\n  bottom: 6px;\n  left: 26%;\n  right: 26%;\n  height: 15%;\n}\n\n.fxm-marks__box-inner--top {\n  top: 6px;\n  left: 38%;\n  right: 38%;\n  height: 6%;\n}\n\n.fxm-marks__box-inner--bottom {\n  bottom: 6px;\n  left: 38%;\n  right: 38%;\n  height: 6%;\n}\n\n.fxm-half {\n  position: relative;\n  z-index: 1;\n  flex: 1;\n  min-width: 0;\n  display: flex;\n  flex-direction: row;\n  gap: 4px;\n}\n\n.fxm-line {\n  flex: 1;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  justify-content: space-evenly;\n  align-items: center;\n  gap: 10px;\n  padding: 4px 0;\n}\n\n/* ---------- player cards ---------- */\n\n.fxm-card {\n  position: relative;\n  width: 76px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  cursor: default;\n  /* Smooths the container-level dim/undim toggle below -- without this the\n     opacity change when the action menu opens/closes is an instant snap\n     rather than a fade. This only ever plays for a card that's already\n     sitting in the document when `.fxm-matchup--menu-open` toggles (a real\n     open/close); a BRAND NEW card created mid-open (render()'s live-score\n     rebuild -- see the rule below) is never subject to it, since a\n     transition only replays on a style CHANGE to an element already in the\n     render tree, never on an element's very first paint -- exactly why the\n     container-level approach below was needed at all. */\n  transition: opacity 0.2s ease;\n}\n\n/* Action-menu dimming -- container-level, NOT a per-card class the JS\n   toggles after the fact. `action-menu.js` sets/clears\n   `.fxm-matchup--menu-open` on the OUTER `.fxm-matchup` wrapper (which\n   persists across re-renders -- see render.js's ensureContainer, which\n   reuses the same container node rather than rebuilding it), and\n   `.fxm-card--menu-selected` is added to exactly one card -- by\n   render.js's renderCard itself, at creation time, checked against\n   `state.actionMenuIdentity` (see that function's own comment).\n   This used to be the mirror-of-roster's-dimming approach: JS looped every\n   `.fxm-card` after each render and toggled a `.fxm-card--dimmed` class on\n   the ones that weren't selected. That looked fine right after a tap, but\n   matchup's live-score re-renders tear down and rebuild EVERY `.fxm-card`\n   node constantly (far more often than roster's own re-renders) -- each\n   fresh batch of nodes was born with NEITHER class, painted a frame fully\n   undimmed, and only got dimmed by JS a tick later once reapplyActionMenu\n   ran -- a constant, \"super distracting\" flicker on every other player's\n   card, confirmed live. Doing it with plain CSS descendant selectors\n   instead fixes this for free: a freshly-created `.fxm-card` is dimmed\n   from its very FIRST paint (the rule already applies via\n   `.fxm-matchup--menu-open`, no JS needed to catch up afterward), and the\n   one card renderCard marks `--menu-selected` is exempted from the very\n   same first paint -- there's no \"before\" frame for either case to flash\n   through. */\n.fxm-matchup--menu-open .fxm-card {\n  opacity: 0.35;\n}\n\n.fxm-matchup--menu-open .fxm-card--menu-selected {\n  opacity: 1;\n}\n\n.fxm-card__crest {\n  width: auto;\n  height: 40px;\n  max-width: 46px;\n  object-fit: contain;\n  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.55));\n}\n\n/* Translucent dark plate behind the name/points, mirroring the\n   .fx-card__info treatment in pitch-editor/card.css -- the pitch\n   background is bright green and varies row to row, so plain white text\n   isn't reliably legible without it. Own class, own file: not shared with\n   pitch-editor's CSS. */\n.fxm-card__info {\n  align-self: stretch;\n  background: rgba(0, 0, 0, 0.45);\n  border-radius: 6px;\n  padding: 2px 4px 3px;\n  margin-top: 2px;\n}\n\n/* text-overflow is `clip`, never `ellipsis`, in EITHER state below. A name\n   that fits never truncates at all, so an \"ellipsis for the fits case\"\n   rule is both pointless and risky -- it can only ever fire during a\n   timing gap before render.js's applyNameMarquee measurement pass runs\n   (fresh DOM, animation not yet applied), which is exactly how a real\n   overflowing name could flash as a bare \"...\" with nothing else visible.\n   `clip` is safe unconditionally: a fitting name never overflows its box\n   in the first place, so there's nothing to clip either way. */\n.fxm-card__name {\n  font-size: 10px;\n  color: #fff;\n  text-align: center;\n  line-height: 1.2;\n  overflow: hidden;\n  text-overflow: clip;\n  white-space: nowrap;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);\n}\n\n.fxm-card__name-text {\n  display: inline-block;\n}\n\n/* Applied by render.js's applyNameMarquee only when the name actually\n   overflows its card -- a name that fits stays exactly as it was\n   (centered, non-animated). text-align switches to `left` here on\n   purpose: .fxm-card__name-text is display:inline-block, so under the\n   base `text-align: center` above its resting (0%) position is already\n   centered within the box -- i.e. clipped by roughly half the overflow on\n   BOTH sides before the animation even starts, and the translateX(0) ->\n   translateX(var(--fxm-marquee-dist)) range (computed by applyNameMarquee\n   as the exact scrollWidth - clientWidth overflow) then no longer lines up\n   with the text's true start/end. `text-align: left` makes the inner\n   span's static position flush with the box's left edge, so 0% shows the\n   real start of the name and the animation's endpoint shows the real end\n   -- the full name, not a middle slice. */\n.fxm-card__name--marquee {\n  text-align: left;\n}\n\n.fxm-card__name--marquee .fxm-card__name-text {\n  animation: fxm-marquee 6s ease-in-out infinite alternate;\n}\n\n@keyframes fxm-marquee {\n  0%,\n  15% {\n    transform: translateX(0);\n  }\n  85%,\n  100% {\n    transform: translateX(var(--fxm-marquee-dist));\n  }\n}\n\n/* Pre-kickoff player status dot -- Fantrax's OWN real-life \"is this player\n   playing\" indicator (the colored dot next to a player's name on the\n   roster list, driven by their `.scorer-icon--*` class -- see\n   parse.js's readEventStatus / render.js's EVENT_STATUS_LABEL), not a\n   guess of our own. Colors are a literal copy of pitch-editor/card.css's\n   .fx-card__dot--* values, for palette consistency between the two\n   features. Only rendered when parse.js actually found a `.scorer-icon`\n   for this player -- that indicator only exists pre-kickoff on Fantrax's\n   page, so a player whose game has started or finished simply gets no dot\n   at all (see render.js's renderCard); there's no \"finished\"/\"unknown\"\n   dot color any more.\n   Pinned to the CARD's own bottom-left corner (`.fxm-card` above is\n   `position: relative`) rather than inline next to the name -- inline\n   was eating width from an already name-space-starved box (that's the\n   whole reason names marquee) and could shrink a long name down to\n   nothing visible. Sitting over .fxm-card__info's rounded bottom-left\n   corner (the dark plate is the card's last/bottom child) keeps it clear\n   of the jersey image above and, since points text is centered, clear of\n   .fxm-card__pts too; the dark ring (box-shadow) keeps it legible even at\n   the rounded corner's edge where a sliver of the green pitch can show\n   through. Inset (positive offsets, not negative) so the whole dot sits\n   inside the card's box instead of straddling its edge.\n   Sitting in .fxm-card__info's bottom-left corner also puts it directly\n   over the START of .fxm-card__opp, .fxm-card__info's LAST child (the\n   game/opponent line, e.g. \"MUN 0 @ HUL 2 F\") -- and since that line's own\n   marquee scroll (see .fxm-card__opp--marquee below) rests flush left, the\n   dot would otherwise permanently sit on top of its first character(s).\n   render.js's renderCard adds `fxm-card--has-dot` to the CARD (only when\n   this dot actually renders) precisely so .fxm-card__opp can reserve left\n   padding clear of the dot's footprint -- see that rule below, next to\n   .fxm-card__opp's own styles. Same \"keep the dot clear of card content\"\n   intent as the jersey/points clearance above, just completing it for the\n   opp line too. */\n.fxm-card__dot {\n  position: absolute;\n  bottom: 4px;\n  left: 4px;\n  width: 7px;\n  height: 7px;\n  border-radius: 50%;\n  box-sizing: border-box;\n  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.55);\n  z-index: 2;\n}\n\n.fxm-card__dot--starting {\n  background: hsl(160 84% 38%);\n}\n\n.fxm-card__dot--expected {\n  background: hsl(27 100% 61%);\n}\n\n.fxm-card__dot--bench {\n  background: hsl(46 97% 65%);\n}\n\n.fxm-card__dot--out {\n  background: hsl(349.7 80% 60.2%);\n}\n\n.fxm-card__pts {\n  font-size: 11px;\n  font-weight: 700;\n  text-align: center;\n  margin-top: 1px;\n}\n\n.fxm-card__pts--pos {\n  color: #ffd166;\n}\n\n.fxm-card__pts--neg {\n  color: #ff8a80;\n}\n\n.fxm-card__pts--zero {\n  color: #aeb8c4;\n}\n\n/* Game/opponent line (e.g. \"MUN 0 @ HUL 2 F\"), under the points --\n   mirrors pitch-editor/card.css's .fx-card__opp treatment (small, muted,\n   centered) for visual consistency between the two features. Own class,\n   own rule: the shared piece is FXShared.formatOpp's formatting LOGIC\n   (src/shared/touch-overlay.js), not this CSS -- each feature's card\n   component is still styled independently, matching .fxm-card__dot's\n   comment on why colors are a literal copy rather than a shared class.\n   text-overflow is `clip`, never `ellipsis`, for the exact same reason as\n   .fxm-card__name above: a line that fits never truncates in the first\n   place, so an \"ellipsis for the fits case\" rule is both pointless and\n   risky -- it can only ever fire during the timing gap before render.js's\n   applyMarqueeToSet measurement pass runs. A too-long game/opponent line\n   marquees instead of truncating, same treatment as player card names and\n   team header names, and reuses the SAME `fxm-marquee` keyframes (see\n   .fxm-card__name--marquee) rather than a duplicate declaration. */\n.fxm-card__opp {\n  font-size: 8.5px;\n  color: #cfe0ea;\n  opacity: 0.75;\n  text-align: center;\n  line-height: 1.25;\n  overflow: hidden;\n  text-overflow: clip;\n  white-space: nowrap;\n  margin-top: 1px;\n}\n\n.fxm-card__opp-text {\n  display: inline-block;\n}\n\n/* Applied by render.js's applyMarqueeToSet only when the opp line actually\n   overflows its box -- text-align switches to `left` for the same reason\n   as .fxm-card__name--marquee's own comment above (the inner span's\n   resting 0% position must be flush with the box's true start, not its\n   centered default, for the translateX(0) -> translateX(var(\n   --fxm-marquee-dist)) range to line up with the text's real start/end). */\n.fxm-card__opp--marquee {\n  text-align: left;\n}\n\n.fxm-card__opp--marquee .fxm-card__opp-text {\n  animation: fxm-marquee 6s ease-in-out infinite alternate;\n}\n\n.fxm-card--bench .fxm-card__opp {\n  font-size: 7.5px;\n}\n\n/* Reserve room for .fxm-card__dot -- see that rule's own comment above for\n   the full \"why\" (the dot sits over .fxm-card__info's bottom-left corner,\n   the same corner .fxm-card__opp's text starts from). `.fxm-card--has-dot`\n   is added by render.js's renderCard ONLY when a dot actually renders for\n   this player, so a dot-less card's opp line keeps the full card width --\n   this must NOT be unconditional on .fxm-card__opp itself.\n   Sized from the dot's own real footprint (left offset + width + the 1px\n   box-shadow ring it's drawn with, plus ~2px breathing room), MINUS\n   .fxm-card__info's own existing left padding (4px main / 3px bench,\n   which .fxm-card__opp already sits behind before this rule even applies)\n   since that padding already buys back some of the clearance:\n     main:  dot right edge = 4px left + 7px wide + 1px ring = 12px;\n            + 2px breathing = 14px clear of the card's edge;\n            - 4px .fxm-card__info padding already there = 10px here.\n     bench: dot right edge = 2px left + 5px wide + 1px ring = 8px;\n            + 2px breathing = 10px clear of the card's edge;\n            - 3px .fxm-card__info padding already there = 7px here.\n   MUST be `margin-left`, not `padding-left` -- this was verified live (see\n   this feature's own test notes) and the difference matters a lot:\n   `overflow: hidden`'s clip boundary is the element's PADDING edge, so\n   padding is \"reserved\" only in the untransformed resting layout -- a\n   translateX() during the marquee scroll can still paint text INSIDE that\n   padding area. Live-testing a padding-left version by sweeping\n   translateX(0) through translateX(-overflow) in small steps and measuring\n   each frame's actual visible (clip-intersected) text box against the\n   dot's rect showed the two overlapping for nearly the ENTIRE scroll (every\n   sampled step past the very first few px) -- once the leading edge of the\n   text scrolls left of the box's own edge, the clip simply pins the\n   visible edge right back at that same left edge, i.e. still directly under\n   the dot, for the rest of the animation. `margin-left` fixes this for real\n   because margin sits OUTSIDE the box -- it moves the box's own edges (and\n   therefore `overflow: hidden`'s clip boundary) away from the dot, so no\n   content at any transform value can ever be painted in that reserved zone;\n   the same sweep test with margin-left instead showed zero overlap at every\n   sampled step across the full scroll range, both main and bench.\n   Still transparent to render.js's applyMarqueeToSet, which measures\n   .fxm-card__opp's own scrollWidth/clientWidth with no JS changes needed:\n   width: auto absorbs the new margin by shrinking the box's own computed\n   width (and therefore clientWidth) by that same amount, while scrollWidth\n   (still just the unclipped text width) doesn't shrink -- so the measured\n   overflow, and thus `--fxm-marquee-dist`, grows by exactly the margin\n   amount, identical to what a same-size padding-left would have produced\n   numerically (confirmed identical overflow-px readings in testing); the\n   difference is only in WHERE the reserved space physically lives (outside\n   the box vs. inside it), which is exactly what makes margin the one that\n   actually keeps the dot clear during the scroll, not just at rest.\n   Applies unconditionally (not just under `--marquee`) since a short,\n   non-scrolling opp line on a dotted card must also start clear of the dot\n   at rest, not just once it's overflowing. */\n.fxm-card--has-dot .fxm-card__opp {\n  margin-left: 10px;\n}\n\n.fxm-card--has-dot.fxm-card--bench .fxm-card__opp {\n  margin-left: 7px;\n}\n\n/* ---------- hover breakdown tooltip ---------- */\n/* Own `fxm-` classes mirroring pitch-editor/tooltip.css's `.fx-card-tip`\n   pattern exactly (fixed position, viewport-clamped by render.js's JS, own\n   stacking context) so the two features' tooltips never collide. */\n\n.fxm-tip {\n  position: fixed;\n  z-index: 2147483647;\n  background: var(--fx-surface);\n  color: var(--fx-text);\n  border: 1px solid var(--fx-border-strong);\n  padding: 8px 10px;\n  border-radius: 6px;\n  font-size: 11.5px;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif;\n  line-height: 1.5;\n  pointer-events: none;\n  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);\n  width: max-content;\n  max-width: min(260px, calc(100vw - 16px));\n  box-sizing: border-box;\n  display: none;\n}\n\n.fxm-tip--visible {\n  display: block;\n}\n\n.fxm-tip__title {\n  font-weight: 700;\n  color: var(--fx-text);\n  margin-bottom: 3px;\n  white-space: normal;\n  overflow-wrap: break-word;\n}\n\n.fxm-tip__row {\n  color: var(--fx-text-secondary);\n  white-space: normal;\n  overflow-wrap: break-word;\n}\n\n/* Color-coded parenthetical signed-points suffix on a stat line, e.g. the\n   \"(+6)\" in \"1 Assists (Total) (+6)\" -- its own span, built by\n   FXShared.renderStatLine (src/shared/touch-overlay.js), classed\n   `fxs-stat-pts fxs-stat-pts--pos|neg|zero` and styled once in\n   src/shared/touch-overlay.css. Was `.fxm-tip__stat--*` here; removed in\n   favor of the shared classes (also used by pitch-editor's tooltip/action\n   menu) so the color values can't drift between the two features again. */\n\n/* ---------- bench strip ---------- */\n/* Each team's bench is its own top-level `.fxm-body` grid item now, not\n   nested inside a shared \"bench bar\" wrapper -- same restructuring as the\n   team headers above, and for the same reason: it's what lets the narrow\n   breakpoint move home's bench next to home's header/half and away's bench\n   next to away's, instead of the two benches always sitting together. See\n   the `@media (max-width: 760px)` override below for the split; wide\n   layout's \"home-bench away-bench\" area (in .fxm-body above) keeps them\n   side by side in one row, visually the old single bench bar. */\n.fxm-bench {\n  min-width: 0;\n  background: var(--fx-surface);\n  padding: 10px 14px 14px;\n  border-top: 1px solid var(--fx-border);\n}\n\n.fxm-bench--home {\n  grid-area: home-bench;\n  /* Small gap from away-bench sharing the same wide-layout row (there's no\n     grid gap between them -- see .fxm-body's own comment on why a grid gap\n     isn't used for the header row above; same reasoning applies here).\n     Reset back to the base 14px in the narrow media query below, where\n     each bench is full-width and no longer needs the extra separation. */\n  padding-right: 20px;\n}\n\n.fxm-bench--away {\n  grid-area: away-bench;\n  text-align: right;\n  padding-left: 20px;\n}\n\n.fxm-bench__label {\n  color: var(--fx-text-muted);\n  font-size: 11px;\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n  margin-bottom: 6px;\n}\n\n.fxm-bench__row {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: flex-start;\n  gap: 6px;\n}\n\n.fxm-bench--away .fxm-bench__row {\n  justify-content: flex-end;\n}\n\n/* Bench cards are the exact same .fxm-card component as the pitch (see\n   \"player cards\" above) -- this modifier just shrinks it to fit a wrapping\n   strip instead of a fixed pitch line. */\n.fxm-card--bench {\n  width: 52px;\n}\n\n.fxm-card--bench .fxm-card__crest {\n  height: 28px;\n  max-width: 32px;\n}\n\n.fxm-card--bench .fxm-card__info {\n  padding: 1px 3px 2px;\n  margin-top: 1px;\n}\n\n.fxm-card--bench .fxm-card__name {\n  font-size: 8.5px;\n}\n\n.fxm-card--bench .fxm-card__dot {\n  width: 5px;\n  height: 5px;\n  bottom: 2px;\n  left: 2px;\n}\n\n.fxm-card--bench .fxm-card__pts {\n  font-size: 9.5px;\n  margin-top: 0;\n}\n\n/* ---------- narrow viewport: vertical pitch ---------- */\n\n@media (max-width: 760px) {\n  .fxm-marks__horizontal {\n    display: none;\n  }\n\n  .fxm-marks__vertical {\n    display: block;\n  }\n\n  /* Narrower field width in this orientation -- shrink the center circle\n     to match (still a fixed equal px width/height, so still perfectly\n     round; only the size differs). */\n  .fxm-marks__circle {\n    width: 76px;\n    height: 76px;\n    margin: -38px 0 0 -38px;\n  }\n\n  .fxm-field {\n    flex-direction: column;\n    min-height: 620px;\n    background: repeating-linear-gradient(\n      to bottom,\n      var(--fxm-green-1) 0px,\n      var(--fxm-green-1) 46px,\n      var(--fxm-green-2) 46px,\n      var(--fxm-green-2) 92px\n    );\n  }\n\n  .fxm-half {\n    flex-direction: column;\n  }\n\n  .fxm-line {\n    flex-direction: row;\n  }\n\n  /* Split each team's header AND bench onto its own side of the field:\n     home's header+bench stay above (next to home's half), away's\n     header+bench move below (next to away's half) instead of both headers\n     stacking together above the field and both benches stacking together\n     below it. Single column so each area is now its own full-width grid\n     row; bench sits between its own team's header and the field on each\n     side, mirrored top/bottom around the field. */\n  .fxm-body {\n    grid-template-columns: minmax(0, 1fr);\n    grid-template-areas:\n      \"home-header\"\n      \"home-bench\"\n      \"field\"\n      \"away-bench\"\n      \"away-header\";\n  }\n\n  /* Crest as a full-height LEFT column beside name+live+projected, not just\n     beside the name -- the wide layout's `.fxm-team-header__top` (crest+name\n     row) stacked ABOVE `.fxm-team-header__scores` (live+projected column)\n     inside `.fxm-team-header`'s flex-column reads fine side-by-side with\n     the opposing team's header, but at this breakpoint the header block is\n     the ONLY thing next to its own half of the (now vertical) field, so the\n     crest is promoted to a proper avatar spanning the whole block (now\n     four stacked lines of text once the owner line exists: name, owner,\n     hero live total, projected) instead of a small mark that only sits\n     next to the name.\n     `.fxm-team-header__top` is switched to `display: contents` so it\n     dissolves out of the layout -- its two children (`__logo`, `__name`)\n     become direct grid items of `.fxm-team-header` itself, independently\n     placeable by the grid-template-areas below, WITHOUT any DOM change in\n     render.js (that wrapper still exists in the markup and still does its\n     wide-layout flex-row job above this breakpoint; see render.js's\n     renderTeamHeader). `align-items: center` keeps the logo vertically\n     centered against the name+scores column rather than pinned to its top\n     edge. */\n  .fxm-team-header {\n    display: grid;\n    /* Third column exists solely for the W/L/D chip on the name's own row.\n       Without a named area of its own the chip is an UNPLACED grid item\n       (`.fxm-team-header__top` is `display: contents` here, so the chip is\n       promoted to a direct grid item just like `__logo`/`__name`) and\n       auto-flow drops it into a new row underneath the projected score --\n       which is exactly what it did before this rule existed. `owner` and\n       `scores` span the last two columns so only the name row is split. */\n    grid-template-columns: auto 1fr auto;\n    grid-template-areas:\n      \"logo name   result\"\n      \"logo owner  owner\"\n      \"logo scores scores\";\n    column-gap: 10px;\n    align-items: center;\n  }\n\n  .fxm-team-header__result {\n    grid-area: result;\n    /* Hugs the name rather than stretching across the auto column. */\n    justify-self: end;\n  }\n\n  .fxm-team-header__top {\n    display: contents;\n  }\n\n  /* `.fxm-team-header__owner` is a direct child of `.fxm-team-header` at\n     EVERY breakpoint already (see the base rule's own comment) -- unlike\n     `__logo`/`__name`, it needs no `display: contents` promotion here,\n     just its own named area in the grid above so it doesn't fall back to\n     un-placed auto-flow. */\n  .fxm-team-header__owner {\n    grid-area: owner;\n  }\n\n  .fxm-team-header__logo {\n    grid-area: logo;\n    align-self: center;\n    /* Bigger than the 30px wide-layout base -- at this breakpoint the crest\n       is the visual anchor for three stacked lines of text (name, hero live\n       total, projected) rather than a small mark beside just the name, so it\n       needs to read as a proper avatar. Sized to look proportionate next to\n       the 34px live-total number without competing with it for attention.\n       border-radius scaled to the same ~width/5 ratio as the base rule\n       above (Fantrax's own live-measured ratio), 46 / 5 ≈ 9. */\n    width: 46px;\n    height: 46px;\n    border-radius: 9px;\n  }\n\n  .fxm-team-header__name {\n    grid-area: name;\n  }\n\n  .fxm-team-header__scores {\n    grid-area: scores;\n    /* The 4px base margin-top (see the base `.fxm-team-header__scores` rule)\n       existed to separate it from `.fxm-team-header__top` when the two sat\n       stacked in normal flex-column flow. At this breakpoint `scores` is its\n       own grid row instead, immediately under `name`'s row with no\n       intervening flow content -- that base margin would now just add\n       uneven extra gap under the name specifically (not under the logo,\n       which spans both rows), so it's zeroed out here. */\n    margin-top: 0;\n  }\n\n  /* Crest is ALWAYS on the left at this breakpoint, home and away alike --\n     unlike the wide layout, where home/away sit side-by-side and are\n     mirrored (crest at the outer edge) so the two headers face each other,\n     here the two headers stack top/bottom around the (now vertical) field\n     and there's no \"facing\" pair to mirror for any more. Cancels the wide\n     layout's away-side mirroring: `flex-direction: row-reverse` (only\n     relevant if `.fxm-team-header__top` weren't already `display: contents`\n     here -- kept for clarity/safety in case that ever changes) and the\n     `align-items: flex-end` / `text-align: right` inherited from the base\n     `.fxm-team-header--away` rule above (which itself exists purely for the\n     wide side-by-side mirroring and is equally inapplicable here). */\n  .fxm-team-header--away .fxm-team-header__top {\n    flex-direction: row;\n  }\n\n  .fxm-team-header--away {\n    align-items: flex-start;\n    text-align: left;\n  }\n\n  /* Each bench is full-width by itself at this breakpoint (no longer\n     sharing a row with the other team's bench) -- back to the base\n     symmetric padding instead of the wide layout's one-sided 20px used to\n     separate the two when they sit side by side. */\n  .fxm-bench--home {\n    padding-right: 14px;\n  }\n\n  .fxm-bench--away {\n    padding-left: 14px;\n    text-align: left;\n  }\n\n  .fxm-bench--away .fxm-bench__row {\n    justify-content: flex-start;\n  }\n\n  /* A full 5-wide line (e.g. defense/midfield) of fixed 76px pitch cards\n     doesn't fit a narrow viewport once .fxm-line flips to row direction\n     above -- .fxm-half/.fxm-line both already have `min-width: 0` so\n     they're WILLING to shrink, but nothing upstream forces them to: five\n     76px cards plus gaps (~420px) simply become the half/line/field's own\n     preferred content width, which .fxm-matchup's `overflow: hidden`\n     then silently clips on the right instead of visibly scrolling --\n     either way, real cards end up cut off-screen on a ~380-400px-wide\n     phone viewport. Fix at the source: shrink just the un-modified\n     (non-bench -- that's already its own compact 52px size at every\n     width) pitch card, and tighten the line's gap, so a 5-across line\n     comfortably fits. 5 * 58px + 4 * 6px gap = 314px, well inside a real\n     phone's available width even after Fantrax's own page chrome margins\n     (measured ~380-390px on a 414px-wide viewport). */\n  .fxm-line {\n    gap: 6px;\n  }\n\n  .fxm-card:not(.fxm-card--bench) {\n    width: 58px;\n  }\n\n  .fxm-card:not(.fxm-card--bench) .fxm-card__crest {\n    height: 32px;\n    max-width: 36px;\n  }\n\n  .fxm-card:not(.fxm-card--bench) .fxm-card__name {\n    font-size: 9px;\n  }\n\n  .fxm-card:not(.fxm-card--bench) .fxm-card__pts {\n    font-size: 10px;\n  }\n}\n\n/* ---------- bench cards in light mode ----------\n   Same reasoning as pitch-editor/card.css's own bench block: matchup's\n   bench cards sit on .fxm-bench (a themed surface), not on the green\n   field, so their grass-tuned dark plate and white text need re-toning for\n   light mode. Dark mode and every card actually on the pitch are\n   untouched. */\nbody:not(.theme--dark) .fxm-bench .fxm-card__info {\n  background: rgba(0, 0, 0, 0.05);\n}\n\nbody:not(.theme--dark) .fxm-bench .fxm-card__name {\n  color: var(--fx-text);\n  text-shadow: none;\n}\n\nbody:not(.theme--dark) .fxm-bench .fxm-card__opp {\n  color: var(--fx-text-muted);\n  opacity: 1;\n}\n\nbody:not(.theme--dark) .fxm-bench .fxm-card__pts--pos {\n  color: var(--fx-pts-pos);\n}\n\nbody:not(.theme--dark) .fxm-bench .fxm-card__pts--neg {\n  color: var(--fx-pts-neg);\n}\n\nbody:not(.theme--dark) .fxm-bench .fxm-card__pts--zero {\n  color: var(--fx-pts-zero);\n}\n\n/* ---------- W/L/D result chip ----------\n   Rendered next to the team name only once every player's real-life game\n   has been played (see render.js's matchupResult for why \"the gameweek is\n   in the past\" isn't the test). Fantrax shows no result indicator of its\n   own anywhere in this header -- it just prints both totals -- so this is\n   the one place the outcome is stated outright instead of left as a\n   comparison of two decimals.\n\n   flex: 0 0 auto for the same reason the crest has it: the name beside it\n   marquees, and the chip must never be the thing that gets squeezed.\n   Colors come from theme.css so the chip follows light/dark like the rest\n   of the header. */\n.fxm-team-header__result {\n  flex: 0 0 auto;\n  min-width: 18px;\n  padding: 1px 5px;\n  border-radius: 4px;\n  font-size: 10px;\n  font-weight: 800;\n  line-height: 1.5;\n  text-align: center;\n  letter-spacing: 0.04em;\n}\n\n.fxm-team-header__result--w {\n  background: var(--fx-win-bg);\n  color: var(--fx-win-fg);\n}\n\n.fxm-team-header__result--l {\n  background: var(--fx-loss-bg);\n  color: var(--fx-loss-fg);\n}\n\n.fxm-team-header__result--d {\n  background: var(--fx-draw-bg);\n  color: var(--fx-draw-fg);\n}\n\n\n/* ---- src/matchup/action-menu.css ---- */\n/**\n * Prettier Fantrax -- Matchup Pitch: per-player action menu styles\n * ---------------------------------------------------------------------\n * Literal copy of pitch-editor/action-menu.css's colors/sizing/shadow\n * values under this feature's own `fxm-` prefix (never `fx-`, for the same\n * collision-avoidance reason as the rest of matchup.css) -- the two menus\n * are meant to look identical, just namespaced per feature like every\n * other matchup/pitch-editor pair (tooltip vs. tip, card vs. card). Colors\n * here already matched matchup.css's own dark-theme palette 1:1 before this\n * file existed (#12181f chrome, same border/font-family strings), so no\n * values needed to change in the copy.\n * ---------------------------------------------------------------------\n */\n\n.fxm-action-menu {\n  position: fixed;\n  z-index: 2147483647;\n  background: var(--fx-surface);\n  border: 1px solid var(--fx-border-strong);\n  border-radius: 8px;\n  padding: 4px;\n  min-width: 160px;\n  box-shadow: var(--fx-shadow);\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif;\n  display: flex;\n  flex-direction: column;\n  gap: 1px;\n}\n\n.fxm-action-menu__item {\n  appearance: none;\n  border: none;\n  background: transparent;\n  color: var(--fx-text);\n  font-size: 12.5px;\n  text-align: left;\n  padding: 8px 10px;\n  border-radius: 5px;\n  cursor: pointer;\n}\n\n.fxm-action-menu__item:hover:not(:disabled) {\n  background: var(--fx-surface-hover);\n}\n\n.fxm-action-menu__item--danger {\n  color: var(--fx-stat-neg);\n}\n\n.fxm-action-menu__item--disabled,\n.fxm-action-menu__item:disabled {\n  color: var(--fx-text-faint);\n  cursor: not-allowed;\n}\n\n/* Read-only stats block (coarse-pointer/touch only -- see action-menu.js).\n   Mirrors the hover tooltip's (.fxm-tip) title/row hierarchy at\n   menu-appropriate sizing. Not a button: default cursor, no hover state,\n   doesn't act. */\n.fxm-action-menu__stats {\n  cursor: default;\n  max-height: 40vh;\n  overflow-y: auto;\n  padding: 6px 10px;\n}\n\n.fxm-action-menu__stats-title {\n  font-size: 12px;\n  font-weight: 700;\n  color: var(--fx-text);\n  margin-bottom: 3px;\n  white-space: normal;\n  overflow-wrap: break-word;\n}\n\n.fxm-action-menu__stats-row {\n  font-size: 11.5px;\n  color: var(--fx-text-secondary);\n  line-height: 1.5;\n  white-space: normal;\n  overflow-wrap: break-word;\n}\n\n.fxm-action-menu__divider {\n  height: 1px;\n  margin: 4px 6px;\n  background: var(--fx-border-strong);\n  flex: none;\n}\n\n/* \"Recent performances\" block (last5.js's fetched data, coarse-pointer/\n   touch only -- see action-menu.js's own comment; shown regardless of\n   whether the tapped player's own game has started yet).\n   Deliberately styled as SUPPORTING info, not the headline: smaller and\n   more muted than .fxm-action-menu__stats above it, and separated by a\n   thin top border + its own padding rather than a second full divider,\n   which would read as visually heavier than this block deserves next to\n   the main stats/actions. Sits inside the SAME scroll region as\n   .fxm-action-menu__stats when the menu overflows (no separate\n   max-height/overflow of its own -- it's a continuation of that block,\n   not an independent one). */\n.fxm-action-menu__last5 {\n  cursor: default;\n  padding: 6px 10px 4px;\n  margin-top: 2px;\n  border-top: 1px solid var(--fx-border);\n  white-space: normal;\n  overflow-wrap: break-word;\n}\n\n.fxm-action-menu__last5-title {\n  font-size: 10px;\n  font-weight: 700;\n  color: var(--fx-text-muted);\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  margin-bottom: 3px;\n}\n\n/* Loading placeholder only -- swapped out (never toggled back on) by\n   action-menu.js's refreshLast5UI once last5.js's fetch resolves, so this\n   is a one-way transitional state, not a persistent style variant. */\n.fxm-action-menu__last5-title--loading {\n  text-transform: none;\n  letter-spacing: normal;\n  font-weight: 600;\n  font-style: italic;\n  color: var(--fx-text-faint);\n}\n\n.fxm-action-menu__last5-row {\n  font-size: 11px;\n  color: var(--fx-text-secondary);\n  line-height: 1.5;\n}\n\n/* Stand-in for the rows themselves when there aren't any: either the\n   player genuinely has no games on record yet, or the fetch failed (see\n   renderLast5Rows). Muted and italic so it reads as an explanation rather\n   than as a performance line with a missing number. */\n.fxm-action-menu__last5-row--muted {\n  color: var(--fx-text-faint);\n  font-style: italic;\n}\n";
  (document.head || document.documentElement).appendChild(style);
})();

// ---- src/shared/stat-names.js ----
/**
 * Prettier Fantrax -- shared stat abbreviation dictionary
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
 * Prettier Fantrax
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
 * Prettier Fantrax -- shared touch/mobile overlay mechanics
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

// ---- src/shared/fantrax-api.js ----
/**
 * Prettier Fantrax -- shared: same-origin Fantrax API fetch helper
 * ---------------------------------------------------------------------
 * DELIBERATE SCOPE EXTENSION: this extension's whole premise (per the
 * project README) is "read Fantrax's rendered DOM and click Fantrax's own
 * real controls -- no API access." Two matchup features genuinely can't be
 * built that way, because the data they need is NOT anywhere in the
 * rendered DOM at all, confirmed live:
 *   - action-menu.js's "last 5 gameweeks" stat block (a player's own
 *     recent-games FPts log -- Fantrax renders this inside the player-card
 *     modal, itself already fetched from this same endpoint, but nothing
 *     about it is present in the matchup page's own markup).
 *   - render.js's team-header manager-username line (not present in
 *     `league-livescoring-table-header` at all -- confirmed by dumping
 *     both header elements in full; only present on the ROSTER page's own
 *     markup, per team, not here).
 * Both are same-origin POSTs to fantrax.com's own `/fxpa/req` endpoint --
 * the exact same request the Fantrax web app itself fires when a user
 * opens a player-card modal or a team's roster page. Nothing leaves
 * fantrax.com, no new auth/credentials are introduced (the browser attaches
 * this page's own session cookies automatically, same as any same-origin
 * fetch), and the request bodies below were reverse-engineered by watching
 * this exact page's own Network activity while performing the equivalent
 * actions a user would (opening a player-card modal / a team's roster
 * page) -- not guessed.
 * ---------------------------------------------------------------------
 */
window.FXShared = window.FXShared || {};
(function (FX) {
  'use strict';

  // Fantrax's own SPA always includes this envelope shape around one or
  // more `{ method, data }` messages -- confirmed live across every real
  // request the app itself made during this recon (login, getPlayerProfile,
  // getFantasyTeams, getTeamRosterInfo, getLiveScoringStats, ...). `uiv`/
  // `dt`/`at`/`v` are literal copies of the app's own real values (its
  // internal protocol/app version numbers, not tied to any specific user
  // action) -- the server doesn't appear to validate `v` strictly (this
  // module's own test requests succeeded with these hardcoded values), but
  // `refUrl`/`tz` are derived live since those genuinely vary per session.
  const UI_VERSION = 3;
  const DEVICE_TYPE = 2;
  const APP_TYPE = 0;
  const APP_VERSION = '185.4.7';

  function leagueIdFromUrl() {
    const m = location.pathname.match(/\/league\/([^/]+)\//);
    return m ? m[1] : null;
  }

  // `msgs` is an array of `{ method, data }` -- callers can batch more than
  // one call into a single request (e.g. one owner-username lookup per
  // team, in one round trip) exactly like Fantrax's own app does. Resolves
  // to the parsed `{ data, roles, responses: [...] }` envelope; throws on a
  // non-2xx response OR a malformed body so every caller's own `.catch`
  // handles both the same way.
  function fxpaRequest(msgs) {
    const leagueId = leagueIdFromUrl();
    const url = leagueId ? `/fxpa/req?leagueId=${encodeURIComponent(leagueId)}` : '/fxpa/req';
    const body = JSON.stringify({
      msgs,
      uiv: UI_VERSION,
      refUrl: location.href,
      dt: DEVICE_TYPE,
      at: APP_TYPE,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      v: APP_VERSION,
    });
    return fetch(url, {
      method: 'POST',
      // Same-origin by construction (a relative URL against fantrax.com);
      // 'same-origin' here is just belt-and-suspenders documentation of
      // that intent, not a behavior change from fetch's own default.
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body,
    }).then((res) => {
      if (!res.ok) throw new Error(`fxpa request failed: HTTP ${res.status}`);
      return res.json();
    });
  }

  FX.fxpaRequest = fxpaRequest;
  FX.fxpaLeagueId = leagueIdFromUrl;
})(window.FXShared);

// ---- src/shared/last5.js ----
/**
 * Prettier Fantrax -- Matchup Pitch: recent-performances FPts (same-origin fetch)
 * ---------------------------------------------------------------------
 * Feeds action-menu.js's "Recent performances" block -- see fxpa.js's
 * header comment for why this needs a same-origin fetch at all (this data
 * is nowhere in the matchup page's own DOM).
 *
 * Two-step lookup, both confirmed live against the real endpoint:
 *   1. Fantrax's own real "recent games" log is served per-player by
 *      `getPlayerProfile`, keyed by an internal player id (their own
 *      `scorerId`) -- NOT by name, and that id is nowhere in the matchup
 *      page's rendered DOM either (checked every attribute on a player's
 *      row -- nothing). It DOES show up in `getLiveScoringStats`'s own
 *      `scorerMap` (the exact data this whole livescoring page's Angular
 *      app is built from) alongside each player's FULL name, so that's
 *      fetched once (ensureScorerIdMap) to build a lookup covering every
 *      player in the league, not just this matchup's two teams.
 *   2. getPlayerProfile(scorerId) returns several stat tables under
 *      sectionContent.OVERVIEW.tables; the one we want is picked by its
 *      HEADER KEYS (`date` + `fpts` both present), not by caption text --
 *      Fantrax's response also has a superficially similar "Recent Trends"
 *      table (7/14/30-day rolling aggregates, own `dateRange`+`fpts` keys)
 *      that a caption-only or fpts-only check would wrongly match instead.
 *      The same table also carries an `opponent` column (e.g. "@NEW" for
 *      an away game, "HUL" for a home one) -- read alongside date/fpts so
 *      action-menu.js can show who each performance was against.
 *
 * BUG FOUND AND FIXED (live user report + empirical diagnosis, 2026-08-26):
 * the section only ever appeared for a handful of players. Instrumented
 * every player in a real matchup (32 players, both sides, starters +
 * bench) and categorized every failure -- ALL 28 failures were
 * "name-miss" (zero scorerId found); zero were missing tables, empty
 * rows, or fetch errors. Root cause: matchup cards render an ABBREVIATED
 * name ("S. Lammens", "M. Sangaré", "K. Lewis-Potter"), but scorerMap
 * stores each player's FULL name ("Senne Lammens", "Mamadou Sangaré",
 * "Keane Lewis-Potter") -- an exact-string lookup only ever matched the
 * minority of players whose matchup-card name HAPPENS to already be their
 * full name (Alisson Becker, Matheus Cunha, Mateus Fernandes, Estevao --
 * all 4 of the diagnostic's successes, and no others). Fixed by
 * resolveScorerId below: exact match first (covers those un-abbreviated
 * names), then an initial+surname match against the SAME fantasy team's
 * own roster first (scorerMap's own teamId groups an entry under whichever
 * fantasy team currently owns that real player -- the matchup already
 * knows which of its two teams a given card belongs to), falling back to
 * a league-wide search only if the team-scoped search finds nothing, and
 * refusing to resolve at all if more than one candidate remains at either
 * step -- never guesses between two same-surname/initial players.
 *
 * Ordering: "Recent Games" rows read newest-first (confirmed against a
 * real multi-row response during this same diagnosis, e.g. Alisson
 * Becker's own log listed his one 2026-27 game before older 2025-26 ones
 * once more than one row existed for other players checked).
 * ---------------------------------------------------------------------
 */
window.FXShared = window.FXShared || {};
(function (FX) {
  'use strict';
  // Session caches live HERE rather than in either feature's own state
  // object: this module is shared by the matchup pitch and the roster
  // pitch editor, which have separate namespaces (FXM/FXP) but one set of
  // caches. What that definitely shares is `scorerIdMap` -- the expensive
  // league-wide name->scorerId lookup, now fetched ONCE per page load no
  // matter which feature asks first, instead of once per feature.
  // Per-player rows are keyed by `teamId|name` (see cacheKey), so the two
  // features share an entry only when they agree on the teamId: they do
  // when the roster URL carries one, and don't for Fantrax's default
  // "your own roster" URL, which has no teamId and caches under null. The
  // cost of that miss is one extra profile fetch for that player, not a
  // wrong answer, so it isn't worth weakening the composite key (which is
  // what keeps two same-named players on opposite sides of a matchup from
  // sharing a slot). Note also that a full page load -- not Fantrax's own
  // in-app navigation -- resets all of this, as any module state would.
  // Semantics
  // are unchanged from when these lived on FXM.state: PRESENCE in
  // last5Cache means resolved (an empty array is a valid cached "no games
  // on record"), failures are never cached so the next tap retries, and
  // last5Inflight holds at most one live fetch per key.
  const state = {
    last5Cache: new Map(),
    last5Inflight: new Map(),
    scorerIdMap: null,
    scorerIdMapPromise: null,
  };

  // ---------- name normalization + abbreviated-name matching ----------
  // Strips accents/diacritics (Sangaré -> sangare, Gyökeres -> gyokeres)
  // and punctuation/case so "M. Sangaré" and "Mamadou Sangaré" compare
  // equal on their shared surname even if one side's rendering ever drops
  // an accent the other keeps -- confirmed live that THIS league's data
  // actually preserves accents consistently on both sides, but normalizing
  // anyway costs nothing and removes an entire class of future mismatch.
  function normalizeName(s) {
    return (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Matchup cards render a player's Fantrax "short name", which is either
  // their full name verbatim (Alisson Becker, Matheus Cunha -- no
  // abbreviation happened, exact match handles these) or "F. Surname"
  // (first-initial + surname, e.g. "S. Lammens", "M. Lewis-Skelly").
  // Surname is taken verbatim (can itself be multi-word/hyphenated: "De
  // Cuyper", "Lewis-Skelly") -- everything after the leading "F." token.
  function parseAbbreviatedName(name) {
    const m = /^([A-Za-z])\.?\s+(.+)$/.exec((name || '').trim());
    if (!m) return null;
    return { initial: m[1], surname: m[2] };
  }

  // `fullName` is a scorerMap entry's own full name (e.g. "Keane
  // Lewis-Potter") -- its first whitespace-separated token is always the
  // first name, everything after is the surname (itself possibly
  // multi-word, e.g. "Maxim De Cuyper" -> surname "De Cuyper"). Comparing
  // the WHOLE surname for equality (not a substring/prefix check) is what
  // keeps "M. Lewis-Skelly" from ever matching "Lewis Hall" -- Hall's own
  // surname is just "Hall", not "Lewis" anything, so it's never a
  // candidate in the first place, even though a naive substring search
  // over raw names would wrongly surface it (confirmed during diagnosis).
  function matchesAbbreviated(fullName, initial, surname) {
    const parts = (fullName || '').trim().split(/\s+/);
    if (parts.length < 2) return false;
    const entryFirst = parts[0];
    const entrySurname = parts.slice(1).join(' ');
    return normalizeName(entrySurname) === normalizeName(surname) && normalizeName(entryFirst).charAt(0) === normalizeName(initial).charAt(0);
  }

  // ---------- scorerId lookup (fetched at most once per session) ----------
  // Built as three views over the same entries so resolveScorerId can go
  // exact -> team-scoped-abbreviated -> league-wide-abbreviated without
  // re-deriving any of them per call:
  //   exactByName: normalized full name -> scorerId (handles un-abbreviated
  //     matchup names verbatim).
  //   byTeam: fantasy teamId -> [{name, scorerId}] (scorerMap's OWN
  //     grouping -- whichever fantasy team currently owns that real player,
  //     not the real player's own football club) -- the tiebreak scope.
  //   all: every {name, scorerId}, for the whole-league fallback.
  function ensureScorerIdMap() {
    if (state.scorerIdMap) return Promise.resolve(state.scorerIdMap);
    if (state.scorerIdMapPromise) return state.scorerIdMapPromise;

    state.scorerIdMapPromise = FX.fxpaRequest([
      { method: 'getLiveScoringStats', data: { sppId: '-1', mobileMatchupView: true, newView: true } },
    ])
      .then((json) => {
        const exactByName = new Map();
        const byTeam = new Map();
        const all = [];
        const data = json && json.responses && json.responses[0] && json.responses[0].data;
        const scorerMap = data && data.scorerMap; // { BENCH: {teamId: {posGroupId: [...]}}, ACTIVE: {...} }
        if (scorerMap) {
          ['BENCH', 'ACTIVE'].forEach((bucket) => {
            const perTeam = scorerMap[bucket];
            if (!perTeam) return;
            Object.keys(perTeam).forEach((teamId) => {
              const perPosGroup = perTeam[teamId];
              Object.keys(perPosGroup || {}).forEach((posGroup) => {
                (perPosGroup[posGroup] || []).forEach((entry) => {
                  const scorer = entry && entry.scorer;
                  if (!scorer || !scorer.name || !scorer.scorerId) return;
                  const record = { name: scorer.name, scorerId: scorer.scorerId };
                  exactByName.set(normalizeName(scorer.name), scorer.scorerId);
                  if (!byTeam.has(teamId)) byTeam.set(teamId, []);
                  byTeam.get(teamId).push(record);
                  all.push(record);
                });
              });
            });
          });
        }
        const map = { exactByName, byTeam, all };
        state.scorerIdMap = map;
        return map;
      })
      .catch((err) => {
        console.warn('[fx-last5] failed to load scorer id map', err);
        // Reset (not left set to the rejected promise) so the NEXT lookup
        // retries instead of failing forever for the rest of the session.
        state.scorerIdMapPromise = null;
        throw err;
      });
    return state.scorerIdMapPromise;
  }

  // `teamId` is the FANTASY team (scorerMap's own grouping) the tapped
  // card's side belongs to -- render.js threads this through from
  // parse.js's parseHeader (data.home/away.header.teamId), NOT the real
  // player's real-life football club. Resolution order: exact name match
  // anywhere in the league; else an abbreviated initial+surname match
  // scoped to THIS team's own roster first (small enough that a
  // surname+initial collision within one team is rare, and this is the
  // team we already know the card belongs to); else the same abbreviated
  // match across the WHOLE league, but ONLY if that yields exactly one
  // candidate. Ambiguous at any step -> null, never a guess (the
  // scorerMap is league-wide, so a genuine surname+initial collision
  // across different teams is real, e.g. two different "J. Smith"s).
  function resolveScorerId(map, cardName, teamId) {
    const exact = map.exactByName.get(normalizeName(cardName));
    if (exact) return exact;

    const parsed = parseAbbreviatedName(cardName);
    if (!parsed) return null;

    const scoped = (teamId && map.byTeam.get(teamId)) || [];
    const scopedMatches = scoped.filter((e) => matchesAbbreviated(e.name, parsed.initial, parsed.surname));
    if (scopedMatches.length === 1) return scopedMatches[0].scorerId;
    if (scopedMatches.length > 1) return null; // ambiguous even within the known team -- refuse

    const allMatches = map.all.filter((e) => matchesAbbreviated(e.name, parsed.initial, parsed.surname));
    if (allMatches.length === 1) return allMatches[0].scorerId;
    return null; // 0 or >1 whole-league candidates -- refuse rather than guess
  }

  // ---------- getPlayerProfile -> "Recent Games" rows ----------
  // Picked by header KEYS, not caption text -- see this file's header
  // comment for why ('Recent Trends' has a near-identical shape with a
  // `dateRange` key instead of `date`). Also reads the `opponent` column
  // (e.g. "@NEW" away, "HUL" home) alongside date/fpts, for
  // action-menu.js's per-row opponent abbreviation.
  // Fantrax RATE-LIMITS rapid profile views, and does it with an HTTP 200:
  // the response body carries `pageError` ("You're viewing player profiles
  // too quickly. Please slow down and try again shortly.") and no `data` at
  // all. That shape used to fall straight through extractRecentGames's
  // `if (!tables) return []` and be cached by getLast5 as a legitimate
  // "this player has no games on record" -- so any player tapped during a
  // burst stayed permanently blank for the rest of the session, even on
  // re-tap. Confirmed live against this league: tapping through one
  // matchup's 32 players trips it partway down the list, which is exactly
  // the "some players are missing recent performances" the user saw.
  // Recognized here so it becomes a THROWN failure instead: getLast5 never
  // caches those, so the next tap retries. queueProfileRequest below also
  // paces our own requests so we mostly don't trip it to begin with.
  function rateLimitMessage(json) {
    const r0 = json && json.responses && json.responses[0];
    const pageError = (r0 && r0.pageError) || (json && json.pageError);
    if (!pageError) return null;
    return pageError.text || 'Fantrax rejected the request';
  }

  function extractRecentGames(json) {
    const rateLimited = rateLimitMessage(json);
    if (rateLimited) throw new Error(rateLimited);
    const data = json && json.responses && json.responses[0] && json.responses[0].data;
    const tables = data && data.sectionContent && data.sectionContent.OVERVIEW && data.sectionContent.OVERVIEW.tables;
    if (!tables) return [];
    const table = tables.find((t) => {
      const keys = ((t.header && t.header.cells) || []).map((c) => c.key);
      return keys.indexOf('date') !== -1 && keys.indexOf('fpts') !== -1;
    });
    if (!table) return [];
    const keys = table.header.cells.map((c) => c.key);
    const dateIdx = keys.indexOf('date');
    const fptsIdx = keys.indexOf('fpts');
    const oppIdx = keys.indexOf('opponent');
    return (table.rows || []).map((row) => ({
      date: (row.cells[dateIdx] && row.cells[dateIdx].content) || '',
      fpts: (row.cells[fptsIdx] && row.cells[fptsIdx].content) || '',
      opponent: (oppIdx !== -1 && row.cells[oppIdx] && row.cells[oppIdx].content) || '',
    }));
  }

  // ---------- public: getLast5(name, teamId) -> Promise<Array<{date,fpts,opponent}>> ----------
  // Cached per (player, team) for the session -- state.last5Cache/
  // last5Inflight, composite-keyed so the rare case of two same-named
  // players on opposite sides of the SAME matchup can never share a cache
  // entry. One in-flight fetch per key max -- see state.js's own comment
  // on both maps for exactly what "cached"/"in-flight" mean here and why
  // failures are deliberately NOT cached (allows retry on the next tap
  // instead of permanently blanking a player for a transient network
  // blip). `null` result means "couldn't resolve or fetch" -- distinct
  // from a resolved-but-empty array (player genuinely has no games on
  // record yet); action-menu.js treats both as "nothing to show".
  function cacheKey(name, teamId) {
    return `${teamId || ''}|${name}`;
  }

  // ---------- paced + retrying getPlayerProfile ----------
  // Every profile request in the session goes through ONE serialized chain
  // with a minimum gap between requests. Rationale: the rate limiter above
  // is trivially tripped by a user tapping quickly through a matchup (each
  // distinct player is one profile request), and once tripped it costs a
  // whole player's data. Pacing costs nothing perceptible -- results are
  // cached per player for the session, so this only ever throttles the
  // FIRST view of each player, and a single tap never waits on anything
  // but its own request.
  //
  // If we trip the limiter anyway (another tab, or Fantrax's own window
  // being shorter than ours), retry with a widening backoff rather than
  // giving up: the failure is explicitly transient and the alternative is
  // a blank section the user has to notice and re-tap to clear.
  const MIN_PROFILE_GAP_MS = 700;
  // Three widening steps rather than two: measured against the live
  // endpoint, a deliberately abusive burst (all 32 players of a matchup
  // back to back, far beyond real tapping) tripped the limiter six times
  // and two players still exhausted a two-step backoff. The third step
  // costs nothing in normal use -- it only ever runs after a request has
  // already come back rate-limited.
  const RETRY_DELAYS_MS = [1200, 2500, 5000];
  let profileChain = Promise.resolve();
  let lastProfileAt = 0;

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function fetchProfile(scorerId) {
    return FX.fxpaRequest([{ method: 'getPlayerProfile', data: { playerId: scorerId } }]);
  }

  // Runs `attempt` after the pacing gap, retrying only rate-limit failures
  // (a genuine network error fails fast -- retrying it just delays the
  // section disappearing). Resolves with the raw JSON envelope; the caller
  // still runs extractRecentGames, which throws if the LAST attempt was
  // rate-limited too.
  function queueProfileRequest(scorerId) {
    const run = profileChain.then(async () => {
      for (let i = 0; i <= RETRY_DELAYS_MS.length; i += 1) {
        await delay(Math.max(0, MIN_PROFILE_GAP_MS - (Date.now() - lastProfileAt)));
        lastProfileAt = Date.now();
        const json = await fetchProfile(scorerId);
        if (!rateLimitMessage(json)) return json;
        if (i === RETRY_DELAYS_MS.length) return json; // out of retries -- let extractRecentGames throw
        await delay(RETRY_DELAYS_MS[i]);
      }
      return null;
    });
    // The shared chain must survive an individual failure, or one rejected
    // request would poison every later player's turn in the queue.
    profileChain = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  }

  function getLast5(name, teamId) {
    const key = cacheKey(name, teamId);
    if (state.last5Cache.has(key)) return Promise.resolve(state.last5Cache.get(key));
    if (state.last5Inflight.has(key)) return state.last5Inflight.get(key);

    const promise = ensureScorerIdMap()
      .then((map) => {
        const scorerId = resolveScorerId(map, name, teamId);
        if (!scorerId) {
          console.warn('[fx-last5] could not resolve a unique scorerId for player', name, 'team', teamId);
          return [];
        }
        return queueProfileRequest(scorerId).then(extractRecentGames);
      })
      .then((rows) => {
        const last5 = rows.slice(0, 5);
        state.last5Cache.set(key, last5);
        state.last5Inflight.delete(key);
        return last5;
      })
      .catch((err) => {
        console.warn('[fx-last5] failed to fetch recent performances for', name, err);
        state.last5Inflight.delete(key);
        return null; // caller treats null as "couldn't load" -- section just doesn't appear
      });

    state.last5Inflight.set(key, promise);
    return promise;
  }

  FX.getLast5 = getLast5;
  // Synchronous cache peek: returns cached rows (possibly an empty array),
  // or `undefined` when this player has never been fetched. Both features'
  // action menus use it to choose between rendering immediately and
  // showing a "loading…" placeholder; they previously reached into
  // FXM.state.last5Cache directly, which a shared module can't offer.
  function peekLast5(name, teamId) {
    return state.last5Cache.get(cacheKey(name, teamId));
  }
  FX.peekLast5 = peekLast5;
  // Exported so action-menu.js's buildLast5Section can check
  // state.last5Cache synchronously with the EXACT same key format this
  // file uses internally, rather than re-deriving (and risking drift from)
  // the `teamId|name` join elsewhere.
  FX.last5CacheKey = cacheKey;
})(window.FXShared);

// ---- src/shared/lineup-alerts.js ----
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

// ---- src/pitch-editor/state.js ----
/**
 * Prettier Fantrax -- Pitch Editor: shared state + tiny DOM utils
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
    // The <nav> our own tabBtn is appended into (findLineupSystemNav's
    // "the SAME nav" -- see tabs.js). Stored so activateTab can toggle a
    // marker class on it (CSS then neutralizes Fantrax's own
    // `.pill--active` styling on Easy Click/Classic while it's set --
    // see tabs.js's own comment for why this is needed at all).
    tabNav: null,

    // last render's data, kept around so drag/arm interactions can look up
    // "is this other card a legal target" without re-scraping the page
    players: [],
    cardsByKey: new Map(), // player key -> rendered .fx-card element
    dragSource: null, // player currently mid native-drag (null otherwise)

    actionMenuEl: null,
    // Which player's card the open action menu belongs to (p.key), so a
    // recent-performances fetch that resolves after the user has moved on
    // paints into nothing instead of the wrong player's menu. Cleared by
    // closeActionMenu alongside actionMenuEl. See action-menu.js.
    actionMenuPlayerKey: null,

    // hover: how a player got their points (or their projection, if unplayed)
    breakdownCache: new Map(), // name -> { lines: [{abbr, label, text}] }
    projectedCache: new Map(), // name -> projected FPts text for this gameweek
    pointsCacheAt: 0,
    pointsCacheGwKey: null,
    pointsSyncInFlight: false,
    // gwKey (see points-sync.js's getGameweekNumber) that the most recent
    // points-sync attempt has already RUN FOR, success or failure -- set in
    // that file's syncPointsData(), always, no matter how the attempt ends.
    // render.js shows a loading overlay instead of the field/bench whenever
    // the CURRENT gwKey has neither a committed cache (pointsCacheGwKey)
    // nor a finished attempt (this field) yet -- i.e. only for the very
    // first sync since page load or a gameweek switch, and bounded to at
    // most one attempt's duration so a sync that never succeeds can't leave
    // the overlay stuck showing forever.
    pointsSyncAttemptedGwKey: undefined,
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

  // A player can be eligible for more than one position (e.g. "D,M"), shown
  // as the first comma-separated span in `.scorer__info__positions` -- this
  // is DISTINCT from `lineup-btn`'s text, which only shows their CURRENT
  // slot. Empty slots have no positions element; they're only ever the one
  // position their row belongs to.
  function readEligiblePositions(row, pos) {
    const posEl = row.querySelector('.scorer__info__positions');
    const firstSpan = posEl && posEl.querySelector('span');
    const text = firstSpan ? firstSpan.textContent.trim() : '';
    if (!text) return [pos];
    return text.split(',').map((s) => s.trim()).filter(Boolean);
  }

  // ---------- column lookup by header text, not fixed index ----------
  // The roster page's own view tabs (Simple/Stats/Fantasy Points/Trends/
  // Schedule - Period/Schedule - Full/...) all render the SAME
  // `.i-table__row` list but with a DIFFERENT set of `.i-table__cell`
  // columns per view -- confirmed live across every one of them. Stats/
  // Fantasy Points/Trends happen to share one layout (icon-buttons cell,
  // then Opp, then FPts, at indices 1/2/3) -- which is exactly what this
  // file used to hardcode as cells[2]/cells[3] -- but Simple has only 3
  // columns total (no icon-buttons cell, so FPts sits at index 2, not 3),
  // and Schedule - Period/Full have no single "Opp" column at all: the
  // opponent/kickoff text is spread across one column PER DAY OF THE WEEK
  // instead, with every day-column empty except whichever one that
  // player's actual game falls on. Locating "Opp"/"FPts" by the header
  // row's own text is what makes every view actually parse correctly
  // instead of silently reading the wrong cell (or reading past the end
  // of a shorter row) in every view except whichever one this was
  // originally written against.
  function getHeaderCells() {
    const headerRow = qa('.i-table__row').find((r) => r.classList.contains('i-table__header'));
    return headerRow ? qa(':scope > .i-table__cell', headerRow) : [];
  }

  function findColumnIndex(headerCells, label) {
    return headerCells.findIndex((c) => c.textContent.trim() === label);
  }

  // Game/opponent text for one row. When the current view has a dedicated
  // "Opp" column (Simple/Stats/Fantasy Points/Trends), that's the whole
  // answer. Views with NO such column (Schedule - Period/Full) instead
  // spread the same text across per-day-of-week columns -- scanning every
  // cell for an upcoming-kickoff-time pattern finds it regardless of which
  // day it falls on (a player has at most one game in view at a time, so
  // at most one cell ever matches). `oppIdx` of -1 (findColumnIndex's own
  // not-found value) means "this view has no Opp column" -- the signal
  // that triggers the fallback scan.
  function findGameText(cells, oppIdx) {
    if (oppIdx !== -1 && cells[oppIdx]) return cells[oppIdx].textContent.replace(/\s+/g, ' ').trim();
    const dayCell = cells.find((c) => /\d{1,2}:\d{2}\s*(am|pm)/i.test(c.textContent));
    return dayCell ? dayCell.textContent.replace(/\s+/g, ' ').trim() : '';
  }

  function parseRoster() {
    const rows = getListRows();
    // See getHeaderCells/findColumnIndex/findGameText above for why these
    // are looked up by the header row's own text rather than assumed at a
    // fixed cells[2]/cells[3] -- confirmed live that the roster page's own
    // view tabs (Simple/Stats/Fantasy Points/Trends/Schedule - Period/
    // Schedule - Full/...) each lay the SAME `.i-table__row` out with a
    // DIFFERENT set of columns. Computed once per call, not per row --
    // the header doesn't change row to row.
    const headerCells = getHeaderCells();
    const oppIdx = findColumnIndex(headerCells, 'Opp');
    const fptsIdx = findColumnIndex(headerCells, 'FPts');
    const emptyCounters = {};
    return rows.map((row) => {
      const btn = row.querySelector('button.lineup-btn');
      const pos = btn.textContent.trim();
      const nameA = row.querySelector('.scorer__info__name a');
      const name = nameA ? nameA.textContent.trim() : null;
      const isReserve = row.classList.contains('row--amber');
      const cells = qa(':scope > .i-table__cell', row);
      const oppText = findGameText(cells, oppIdx);
      const fptsText = fptsIdx !== -1 && cells[fptsIdx] ? cells[fptsIdx].textContent.replace(/\s+/g, ' ').trim() : '';
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
        eligiblePositions: readEligiblePositions(row, pos),
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
 * Prettier Fantrax -- Pitch Editor: "Pitch Editor" tab next to Easy Click / Classic
 * ---------------------------------------------------------------------
 * Injects a third pill into Fantrax's real "Lineup change system" nav so
 * switching to/from the pitch view behaves exactly like switching between
 * Fantrax's own two options.
 *
 * Two real bugs fixed here (both confirmed live on the mobile roster page):
 *
 * 1. Fantrax keeps TWO separate copies of the "Lineup change system"
 *    Easy Click/Classic `button.pill` pair in the DOM AT THE SAME TIME --
 *    one inside a `.fx-layout__pane.hide--phablet` pane (a desktop-only
 *    copy, permanently `display: none` on our narrow mobile viewport via
 *    that class) and one inside a `.filter-panel__row--expandable`
 *    accordion row (the real mobile one -- ALSO `display: none` at rest,
 *    but only because that accordion starts collapsed; opening the
 *    roster page's own filter-panel toggle reveals it). A plain
 *    `qa('button.pill').find(...)` picks whichever comes first in DOM
 *    order, which turned out to be the desktop-only, permanently-hidden
 *    copy -- so our own injected "Pitch Editor" pill was appended into a
 *    `<nav>` that never renders on mobile at all, nowhere near the real,
 *    visible Easy Click/Classic pills the user actually sees once they
 *    open that filter panel. Both copies read as plain `display: none`
 *    while the accordion is collapsed, so a check that just walks the
 *    ancestor chain looking for ANY `display: none` can't tell them apart
 *    at exactly the moment (fresh page load) this needs to succeed --
 *    isHiddenForViewport below instead looks for Fantrax's own `hide--*`
 *    responsive-utility class specifically, which only ever marks the
 *    permanently-desktop-only copy, not a merely-collapsed-right-now one.
 *    main.js already retries setupTabs() on every render, so once the
 *    user opens that panel (or Fantrax's own Angular otherwise reveals
 *    it), a later pass succeeds against the correct copy either way.
 *
 * 2. Fantrax's own Angular fully owns `.pill--active` on Easy Click/
 *    Classic -- it doesn't get removed just because OUR tab is the one
 *    actually driving what's shown, so Easy Click could still visibly read
 *    as "active" (its own green highlight) at the exact same time our own
 *    "Pitch Editor" pill also shows active. activateTab now also toggles
 *    `fx-pitch-tab-mode-on` on the shared `<nav>` (state.tabNav) whenever
 *    our tab is on; pitch.css neutralizes `.pill--active` back to a plain
 *    `.pill`'s own (inactive) look ONLY inside that scope -- exact color
 *    values read live off the real page (an active pill's own computed
 *    background/color vs. an inactive one's), not guessed. Clicking Easy
 *    Click/Classic already deactivates our tab via the capture-phase
 *    listener below (removing `fx-pitch-tab-mode-on` too), so the reverse
 *    direction -- picking Fantrax's own option un-does our override and
 *    lets ITS real `.pill--active` show through again -- already worked
 *    and still does; verified live both directions.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const qa = FXP.qa;
  const state = FXP.state;

  // Excludes only a VIEWPORT-based hide (Fantrax's own `hide--phablet` /
  // `hide--*` responsive utility classes, confirmed live), not a
  // collapsed-accordion hide. Both look identical as plain
  // `display: none` right now (the real mobile copy of this nav lives
  // inside a `.filter-panel__row--expandable` accordion row that's
  // ALSO `display: none` at rest, collapsed, until the roster page's own
  // filter-panel toggle is opened) -- confirmed live that a naive "walk
  // every ancestor, reject on ANY display:none" check wrongly rejects
  // BOTH copies whenever that accordion happens to be collapsed (i.e. on
  // a fresh page load, before the user has ever opened it), which is
  // exactly when setupTabs() first needs this to succeed. Checking for
  // the SPECIFIC `hide--*` class name instead of literal computed display
  // correctly tells "will never render on this viewport" (the desktop-only
  // copy) apart from "not rendered RIGHT NOW, but could be" (the real
  // mobile one, mid-collapse) -- main.js retries setupTabs() on every
  // render anyway, so once the user opens that panel (or Fantrax's own
  // Angular otherwise reveals it), this succeeds on a later pass.
  // Fantrax renders TWO copies of the Easy Click/Classic pill pair: one
  // desktop-only (`hide--phablet`, i.e. hidden AT phablet width and below)
  // and one inside the mobile filter panel's collapsible row. We must
  // attach our own pill to whichever copy this viewport actually shows.
  //
  // Testing for a `hide--*` class alone is wrong in BOTH directions, and
  // did break desktop: `hide--phablet` marks the copy that is hidden on
  // narrow screens, which means it's the VISIBLE one on a wide screen --
  // so a class-name test excluded exactly the copy a desktop user sees,
  // our pill went into the collapsed mobile accordion, and the pitch
  // editor became unreachable on desktop entirely.
  //
  // A plain "is it visible" test is wrong too: the mobile copy lives in a
  // collapsed-by-default accordion, so it's `display: none` at rest even
  // on the viewport it belongs to.
  //
  // So: an element is hidden for THIS viewport only if some ancestor is
  // both marked with a responsive `hide--*` class AND actually computing
  // to `display: none` right now. That reads Fantrax's own breakpoints
  // straight from the live CSS instead of hardcoding them here, and
  // ignores the accordion's own collapsed state (no `hide--*` class),
  // which says nothing about which viewport the copy is for.
  function isHiddenForViewport(el) {
    for (let node = el; node; node = node.parentElement) {
      if (!node.classList || !Array.from(node.classList).some((c) => /^hide--/.test(c))) continue;
      if (getComputedStyle(node).display === 'none') return true;
    }
    return false;
  }

  function findLineupSystemNav() {
    const buttons = qa('button.pill').filter((b) => !isHiddenForViewport(b));
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
    state.tabNav = nav;

    [easy, classic].forEach((btn) => {
      btn.addEventListener('click', () => activateTab(false), true);
    });

    activateTab(state.tabActive);
  }

  function activateTab(on) {
    state.tabActive = on;
    if (state.tabBtn) state.tabBtn.classList.toggle('fx-pitch-tab--active', on);
    // See this file's header comment (fix #2) -- CSS-only, never touches
    // Fantrax's own `.pill--active` class itself, just neutralizes its
    // visual effect while our tab is the one actually active.
    if (state.tabNav) state.tabNav.classList.toggle('fx-pitch-tab-mode-on', on);
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
 * Prettier Fantrax -- Pitch Editor: render the pitch + bench
 * ---------------------------------------------------------------------
 * This file now loads on every fantrax.com page (see main.js), so render()
 * gates on the roster-only "Easy Click"/"Classic" nav before touching the
 * DOM -- otherwise a non-roster page with its own `.i-table` (standings,
 * players lists, ...) would get a stray empty `.fx-pitch` container.
 *
 * ---------- initial-load / gameweek-switch loading state ----------
 * points-sync.js briefly flips Fantrax's real Stats/Fantasy Points tabs
 * (and the Stats period dropdown) to scrape per-player points/projection
 * data -- see that file's header comment for why, and how it masks the
 * flip itself. That masking hides the REAL table's churn, but the pitch
 * cards render() builds are still visibly affected: the very first render
 * for a gameweek necessarily uses whatever numbers happen to already be on
 * the page (no synced cache exists yet), then a couple of seconds later --
 * once the sync completes -- a second render swaps in the freshly-synced
 * breakdown/projection numbers. Two renders, same cards, different numbers:
 * exactly the "ui swapping and numbers updating" a user notices.
 *
 * render() avoids that by checking needsInitialSync: true only when the
 * CURRENTLY DISPLAYED gwKey has neither a committed cache
 * (state.pointsCacheGwKey) nor a finished sync attempt
 * (state.pointsSyncAttemptedGwKey) yet -- i.e. only for the very first sync
 * since page load or a gameweek switch, never for the routine 60s
 * background resyncs that follow (those only ever run once a gwKey already
 * has a committed cache, so needsInitialSync is already false by then).
 * When true, the field+bench are replaced with buildLoadingOverlay()
 * instead of real cards, and maybeSyncPointsData() is still called to
 * kick off (or continue) the sync. points-sync.js's syncPointsData()
 * guarantees state.pointsSyncAttemptedGwKey gets set -- and a follow-up
 * render() triggered -- on every exit path, success or failure, so this
 * can never get stuck showing the overlay: worst case, it clears the
 * instant that one sync attempt finishes.
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

  // ---------- initial-load / gameweek-switch loading overlay ----------
  // Stands in for the field+bench while needsInitialSync is true (see this
  // file's header comment). Roughly mirrors the real layout's shape -- a
  // green field block plus a row of card-sized placeholders -- so swapping
  // it out for the actual cards, once the sync settles, isn't itself a big
  // layout jump. Lives inside `container` (appended alongside the header,
  // same as the real field/bench), so it stays covered by main.js's
  // isOwnMutation() check without needing any OWN_BODY_CLASSES entry.
  function buildLoadingOverlay() {
    const loading = document.createElement('div');
    loading.className = 'fx-pitch__loading';

    const spinner = document.createElement('div');
    spinner.className = 'fx-pitch__spinner';
    loading.appendChild(spinner);

    const label = document.createElement('div');
    label.className = 'fx-pitch__loading-label';
    label.textContent = 'Loading lineup…';
    loading.appendChild(label);

    const skeletonRow = document.createElement('div');
    skeletonRow.className = 'fx-pitch__skeleton-row';
    for (let i = 0; i < 5; i++) {
      const card = document.createElement('div');
      card.className = 'fx-pitch__skeleton-card';
      skeletonRow.appendChild(card);
    }
    loading.appendChild(skeletonRow);

    return loading;
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

    // See the "initial-load / gameweek-switch loading state" block in this
    // file's header comment. gwKey is read defensively (FXP.getGameweekNumber
    // is defined by points-sync.js, which loads AFTER this file -- safe at
    // call time since render() only ever runs once the page is live, but
    // guard anyway in case load order ever changes).
    const gwKey = FXP.getGameweekNumber ? FXP.getGameweekNumber() : null;
    const needsInitialSync = gwKey !== state.pointsCacheGwKey && gwKey !== state.pointsSyncAttemptedGwKey;
    if (needsInitialSync) {
      container.appendChild(buildLoadingOverlay());
      FXP.maybeSyncPointsData(); // kick off (or continue) the sync that will clear this overlay
      return;
    }

    // "Your starter isn't starting" check. Runs here, after the
    // loading-overlay early return above, so it only ever sees a fully
    // parsed roster for the gameweek actually on screen -- never a
    // half-loaded one mid-gameweek-switch, which would otherwise fire
    // alerts off transient state. Detection, dedupe and the notification
    // channels all live in src/shared/lineup-alerts.js; this file only
    // renders the banner, per this codebase's shared-logic /
    // own-feature-DOM convention.
    const lineupCheck = FXShared.checkLineup ? FXShared.checkLineup(players, gwKey) : null;
    if (lineupCheck && lineupCheck.banner) {
      const alertEl = document.createElement('div');
      alertEl.className = 'fx-pitch__alert';
      alertEl.setAttribute('role', 'status');
      alertEl.textContent = lineupCheck.banner;
      container.appendChild(alertEl);
    }

    const jerseyMap = buildJerseyMap();

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
          // Measure the box's full content overflow (el.scrollWidth), not
          // the inner span's own width: the event-status dot sits OUTSIDE
          // the inner span (see renderCard), so measuring the span alone
          // left a window where the text alone fit but dot+text overflowed
          // -- no marquee, and text-overflow's ellipsis hides a partially
          // fitting atomic inline (the inline-block span) entirely,
          // collapsing the whole name to a bare "..." (constant on
          // Android, where Roboto runs wider than desktop fonts). Same
          // container-based measure matchup's applyMarqueeToSet uses. The
          // travel distance is identical either way: the span's right edge
          // must reach the box's right edge.
          const dist = el.scrollWidth - el.clientWidth;
          if (dist > 0) {
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

      // For a player who hasn't played in the CURRENTLY VIEWED gameweek --
      // whether that's a future gameweek picked from the Gameweek selector,
      // or the current one pre-kickoff -- p.fptsText reflects whatever
      // Fantrax's own FPts column shows for that (unplayed) week, which
      // isn't a meaningful "points" figure yet. Prefer the background-
      // synced projection (points-sync.js's state.projectedCache, already
      // keyed to the currently-selected gameweek via pointsCacheGwKey) when
      // one's available, so switching to a future gameweek shows THAT
      // week's projected points instead of a stale/blank number left over
      // from whatever was last on screen.
      let fptsText = p.fptsText;
      if (!p.locked && state.projectedCache) {
        const projected = state.projectedCache.get(p.name);
        if (projected !== undefined && projected !== null && projected !== '-') fptsText = projected;
      }
      if (fptsText && fptsText !== '-') {
        const fpts = document.createElement('div');
        const n = parseFloat(fptsText);
        const kind = n > 0 ? 'pos' : n < 0 ? 'neg' : 'zero';
        fpts.className = `fx-card__fpts fx-card__fpts--${kind}`;
        fpts.textContent = fptsText;
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
  FXP.buildLoadingOverlay = buildLoadingOverlay;
  FXP.ensureContainer = ensureContainer;
  FXP.buildPitchMarks = buildPitchMarks;
  FXP.render = render;
  FXP.renderCard = renderCard;
})(window.FXP);

// ---- src/pitch-editor/drag.js ----
/**
 * Prettier Fantrax -- Pitch Editor: drag / click-to-select interactions
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
  let touchInProgress = false; // any finger currently down on a card (see the dragstart veto below)
  let touchActive = false; // true once the long-press has "lifted" the card
  let lastTouchTs = 0; // when a finger last touched any card -- see isTouchDerived

  // "Is this mouse event real, or synthesized from a touch gesture?" The
  // hover tooltip must only follow an actual mouse: Android dispatches
  // hover-emulation mouse events (mouseover/mouseenter/mousemove) at the
  // long-press moment once the native drag is vetoed (verified live
  // on-device: they land ~500ms into the hold, popping the tooltip in the
  // middle of a touch drag), and both platforms fire the standard
  // compatibility chain right after an unprevented tap's touchend. Three
  // tests, cheapest first: a finger is currently down (the mid-gesture
  // emulation case), the browser says so itself (sourceCapabilities is
  // Chromium-only but authoritative there), or a touch ended moments ago
  // (the after-tap chain on iOS, which lacks sourceCapabilities). A real
  // mouse used >1s after the last touch passes all three and hovers
  // normally.
  function isTouchDerived(e) {
    if (touchInProgress || touchActive) return true;
    if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return true;
    return Date.now() - lastTouchTs < 1000;
  }
  let touchSourcePlayer = null;
  let touchSourceCard = null;
  let touchGhostEl = null;
  let touchTargetCard = null; // card currently under the finger, if valid
  let suppressNextClick = false; // swallow the synthetic click browsers fire after a touch drag

  // What counts as a legal drop mirrors what Fantrax's own two-click lineup
  // flow can actually complete (verified live by arming real lineup-btns and
  // reading the `ineligible` classes + disabled buttons Fantrax puts on
  // every invalid destination). Two shapes of move exist:
  //
  //  - DIRECT: the incoming player is eligible for the exact slot the drop
  //    lands on (an empty slot, or the slot of the player they displace).
  //    One arm-click + one destination-click and Fantrax does the rest,
  //    including bumping the displaced player to the bench itself.
  //  - TWO-STEP (bench player replacing an active player of a position they
  //    can't play, e.g. a D-only bench player dropped on an active F): no
  //    single Fantrax op does this, but the sequence "bench player -> empty
  //    active slot of their own position, then displaced player -> the
  //    just-freed bench spot" completes it entirely through Fantrax's own
  //    controls. Only possible while the formation has an empty active slot
  //    the incoming player fits -- swap.js runs the sequence.
  //
  // Every combination below was verified against the live site; anything our
  // static rules get wrong is still caught at swap time, because swap.js
  // refuses to click a destination button Fantrax has disabled.
  function hasEmptyActiveSlotFor(player) {
    return state.players.some(
      (x) => x.isEmpty && !x.isReserve && !x.locked && player.eligiblePositions.includes(x.pos)
    );
  }

  function isValidDropTarget(source, target) {
    if (!source || !target) return false;
    if (source.key === target.key) return false;
    if (source.locked || target.locked) return false;
    if (source.isEmpty) return false;
    if (target.isEmpty) {
      // An empty bench slot only exists mid-shuffle; dropping an active
      // player there just benches them. Bench -> empty bench is pointless.
      if (target.isReserve) return !source.isReserve;
      return source.eligiblePositions.includes(target.pos);
    }
    // Bench <-> bench: neither player would become active -- pointless.
    if (source.isReserve && target.isReserve) return false;
    if (!source.isReserve && !target.isReserve) {
      // Active <-> active is a slot change; same slot type changes nothing.
      if (source.pos === target.pos) return false;
      return source.eligiblePositions.includes(target.pos);
    }
    // Active <-> bench: the bench player is coming in either way. They need
    // a slot -- the outgoing player's own, or any empty active slot they fit
    // (the two-step path).
    const incoming = source.isReserve ? source : target;
    const outgoing = source.isReserve ? target : source;
    return incoming.eligiblePositions.includes(outgoing.pos) || hasEmptyActiveSlotFor(incoming);
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
      // Android (WebView and Chrome) starts a NATIVE HTML5 drag on a
      // long-press of a draggable element at ~490ms -- right after our own
      // 375ms touch lift. Letting it start fires touchcancel, which tears
      // down the just-lifted ghost and kills the whole touch drag
      // (verified live on-device: touchstart -> [375ms] lift -> [491ms]
      // native dragstart -> [534ms] touchcancel -> everything reset). The
      // touch path owns any gesture that began with a finger, so veto the
      // native drag for the duration of the touch; mouse-initiated drags
      // never have a touch in flight and are unaffected.
      if (touchInProgress || touchActive) {
        e.preventDefault();
        return;
      }
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
        touchInProgress = true; // before any early return -- the dragstart veto must cover every touch
        lastTouchTs = Date.now();
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
        touchInProgress = false;
        lastTouchTs = Date.now();
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
      touchInProgress = false;
      lastTouchTs = Date.now();
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
        if (isTouchDerived(e)) return; // touch flows show stats via the action menu, never hover
        state.hoveredKey = p.key;
        state.lastMouseX = e.clientX;
        state.lastMouseY = e.clientY;
        FXP.showCardTip(FXP.buildTooltipLines(p), e.clientX, e.clientY);
      });
      card.addEventListener('mousemove', (e) => {
        if (isTouchDerived(e)) return;
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
 * Prettier Fantrax -- Pitch Editor: hover tooltip
 * ---------------------------------------------------------------------
 * How a player got their points (a breakdown by scoring stat), or their
 * projection for the gameweek if they haven't played yet. Data comes from
 * points-sync.js's background cache. For a locked (already-played) player,
 * each breakdown line leads with the raw count, followed by the stat name,
 * then the signed points contribution in parentheses, e.g. "4 Saves (+2)"
 * -- falling back to the points-only form if a raw count isn't cached for
 * that stat yet. For a not-yet-played player who also has a pre-kickoff
 * status dot (p.eventStatus, roster.js's FXP.EVENT_STATUS_LABEL), the
 * dot's own explanation (e.g. "Not expected to play") is prepended as the
 * first line, ahead of the projection line -- the dot's `title` attribute
 * never shows on a tap/touch device, so the tooltip is what carries that
 * explanation on mobile.
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
    // A player with an eventStatus (only ever set pre-kickoff -- see
    // roster.js's readEventStatus) has a colored status dot next to their
    // name on the list, but the dot's only explanation is an HTML `title`
    // attribute, which never shows on a tap/touch device. Prepend its label
    // (e.g. "Not expected to play") as its own line here so the tooltip
    // itself carries that explanation on mobile too, ahead of the
    // projection line below.
    const statusLine = p.eventStatus ? [FXP.EVENT_STATUS_LABEL[p.eventStatus]] : [];
    const proj = state.projectedCache.get(p.name);
    if (proj === undefined) return [...statusLine, 'Projected points not available yet'];
    const gw = FXP.getGameweekNumber();
    return [...statusLine, `Projected: ${proj} pts${gw ? ` (Gameweek ${gw})` : ''}`];
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
 * Prettier Fantrax -- Pitch Editor: background scrape for points breakdown + projections
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
 *   3. The tab flip and the period dropdown are both real Angular route/
 *      query-param navigations (the URL's view= param actually changes) --
 *      live-verified that either one trips Fantrax's own "Unsaved Changes"
 *      route guard whenever the user has a pending, unsubmitted lineup
 *      edit, popping its Leave/Stay modal on every sync cycle for as long
 *      as they sit mid-edit (the reported bug: it kept asking "sure you
 *      want to leave" while making several roster changes in a row). See
 *      hasPendingLineupChanges() -- syncPointsData skips the whole run
 *      whenever it's true, and resumes on its own the moment the change is
 *      submitted or discarded.
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

  // True whenever Fantrax is showing its own "Finalize all roster changes"
  // toast (Reset/Submit buttons) -- i.e. the user has an unsubmitted lineup
  // edit pending. Live-verified root cause of a real bug: the Fantasy
  // Points/Stats tab flip below, AND just OPENING the "Stats: <period>"
  // mat-select, are both real Angular route/query-param navigations (the
  // page's URL literally flips view=FPTS <-> view=STATS) -- so while a
  // change is pending, either one trips Fantrax's own CanDeactivate route
  // guard and pops its "Unsaved Changes" Leave/Stay modal, on every sync
  // cycle, for as long as the user sits mid-edit. That's exactly the
  // reported symptom ("keeps popping up asking if I'm sure I want to leave
  // ... every time"). Confirmed live: with a pending change, clicking the
  // real Stats tab -- or even just opening the period dropdown -- opened
  // the guard modal immediately and blocked the navigation (the URL's view
  // param didn't move); leaving the page alone with nothing clicked at all
  // reproduced the same modal within ~10s purely from this file's own
  // background scrape cadence. The toast is a `<toast>` custom element;
  // matched by its exact heading text rather than its class list (which
  // also covers Fantrax's other, differently-purposed toasts) since that
  // text is stable and unambiguous.
  function hasPendingLineupChanges() {
    return qa('toast').some((t) => t.textContent.includes('Finalize all roster changes'));
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
    // Captured up front (not just inside the try/finally below) so the two
    // early-return guards just below can also mark this gwKey as "attempted"
    // -- see state.pointsSyncAttemptedGwKey's comment in state.js. Without
    // that, a page that never lays out the tabs/select as expected (or one
    // stuck with a menu open) would leave render.js's loading overlay
    // showing indefinitely, since neither guard ever reaches the
    // try/finally block that normally marks the attempt done.
    const earlyGwKey = getGameweekNumber();
    if (hasPendingLineupChanges()) {
      // Flipping tabs (or even just opening the period dropdown) right now
      // would trip Fantrax's own route guard -- see hasPendingLineupChanges
      // above. Back off exactly like the other early-return guards below;
      // maybeSyncPointsData() naturally retries in POINTS_SYNC_RETRY_MS, and
      // resumes its normal cadence on its own the moment the pending change
      // is gone (submitted or discarded) -- nothing else has to notice.
      state.pointsLastAttemptAt = Date.now();
      state.pointsSyncAttemptedGwKey = earlyGwKey;
      return;
    }
    const tabs = findStatsTabs();
    const periodSelect = findSelectByLabel('Stats');
    if (!tabs || !periodSelect) {
      state.pointsLastAttemptAt = Date.now(); // page isn't laid out as expected -- skip silently, but don't retry every render
      state.pointsSyncAttemptedGwKey = earlyGwKey;
      return;
    }
    if (overlayChildCount() > 0) {
      state.pointsLastAttemptAt = Date.now(); // don't fight an already-open menu
      state.pointsSyncAttemptedGwKey = earlyGwKey;
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
      // Marks this run's gwKey "attempted" no matter how it ended --
      // render.js's needsInitialSync check (loading overlay) treats a gwKey
      // as done syncing once it's EITHER committed (state.pointsCacheGwKey)
      // OR merely attempted (this), so a run that hits Guard 1/2 above, or
      // throws, still bounds the overlay to this one attempt instead of
      // leaving it stuck. Set after busy/pointsSyncInFlight are already
      // cleared, both because it's semantically "this attempt is over" and
      // because the FXP.render() call below relies on them already being
      // false.
      state.pointsSyncAttemptedGwKey = gwKey;
      // Pitch cards for a not-yet-played player show state.projectedCache
      // (see render.js's renderCard), and the loading overlay above only
      // clears once render() actually runs again -- but nothing else
      // re-renders the pitch on its own (only an unrelated DOM mutation
      // would trigger main.js's observer). Without this, a gameweek switch
      // would show blank/stale numbers -- or, on a failed attempt, the
      // loading overlay -- until the user happens to cause some other
      // mutation. Re-render now, on every exit from this function
      // (committed or not), so the result is always shown immediately.
      // Safe against re-entrancy: this render()'s own end-of-function
      // maybeSyncPointsData() call sees pointsSyncInFlight already false,
      // but its backoff check (pointsLastAttemptAt, just set above on a
      // failed run) or its gwKey-already-cached check (on a committed run,
      // pointsCacheGwKey now equals gwKey) stop it from re-triggering a
      // sync synchronously in a loop.
      if (state.tabActive) FXP.render();
    }
  }

  FXP.hasPendingLineupChanges = hasPendingLineupChanges;
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
 * Prettier Fantrax -- Pitch Editor: swap execution against the real Fantrax controls
 * ---------------------------------------------------------------------
 * Every swap is executed through Fantrax's own lineup buttons, and
 * Fantrax's own eligibility logic is the gate: clicking a player's
 * `lineup-btn` "arms" them, and Fantrax immediately marks every invalid
 * destination row with an `ineligible` class and DISABLES its button.
 * We never re-derive those rules -- we just refuse to click a button
 * Fantrax has disabled, and report that Fantrax disallowed the move.
 *
 * THE MENU, AND WHAT ACTUALLY TRIGGERS IT (live-verified by scripting the
 * real page directly, arming/clicking dozens of combinations with a clean
 * discard-and-retry between each one):
 *
 * Fantrax's little "Move / Change to <pos>" menu has NOTHING to do with
 * click ordering or with whether *both* players are multi-position, despite
 * what an earlier version of this file assumed. The actual rule is simple:
 * clicking a RESERVE (bench) player's `lineup-btn` while nothing is
 * currently armed opens the menu IF AND ONLY IF that player has 2+ eligible
 * positions -- Fantrax can't yet highlight valid destinations without
 * knowing which discipline you mean to bring them on as. The exact same
 * player, clicked as the DESTINATION while someone else is already armed,
 * never opens it -- the target slot is already pinned by the armed
 * player's own position, so there's nothing left to disambiguate. Arming a
 * multi-position ACTIVE player is also always menu-free, armed first or
 * not, active players already occupy a definite slot.
 *
 * So: for a plain two-click swap between an active player and a bench
 * player, arming the ACTIVE side first and clicking the BENCH side as the
 * destination is live-verified to complete cleanly with no menu, for every
 * combination of single/multi-position tried on either side. (The previous
 * version of this file armed the bench side first "to avoid the menu" --
 * live testing showed that ordering is exactly backwards; it's what
 * *causes* the menu whenever the bench player has 2+ eligible positions,
 * which is the bug the user reported.)
 *
 * The menu is unavoidable in exactly one place: step 1 of the two-step
 * cross-position replacement below, where the player being armed has to be
 * the bench player (there's no active counterpart to arm instead -- the
 * destination is an empty slot, not a player). When that bench player has
 * 2+ eligible positions, the menu opens the instant they're armed. Of its
 * items ("import_exportMove" / "Change toM" / "Change toD" -- icon
 * ligatures glued onto the label text), "Move" was live-verified to always
 * work: it arms the player exactly as a direct click would have, ready for
 * the follow-up destination click. "Change to <pos>" was live-verified to
 * do the opposite of something useful -- it silently cancels the whole
 * selection (every row's disabled state resets) with no swap -- so we
 * never try it; if "Move" isn't there we give up and say so.
 *
 * A cross-position replacement (e.g. a D-only bench player replacing an
 * active F) has no single Fantrax op, but decomposes into two that do
 * exist (both live-verified):
 *   1. bench player -> empty active slot of a position they play
 *   2. displaced active player -> the bench spot freed by step 1
 *
 * The user should never see any of this: dragging is the whole interface,
 * and the driven menu (plus the auto-dismissed Unsaved-Changes nag, see
 * `dismissUnsavedChangesNag` below) still visually renders -- mispositioned
 * in the viewport's top-left corner, since it anchors to a lineup-btn we
 * keep hidden -- for the ~300-400ms between Fantrax opening it and us
 * clicking through it. So for the duration of attemptSwap we mask the
 * entire `.cdk-overlay-container` with `visibility: hidden`, the same
 * `fx-syncing`-style trick points-sync.js already uses for its own driven
 * flip (see its `ensureSyncStyle`). `visibility: hidden` was live-verified
 * to still allow `.click()` on the hidden buttons -- it's a rendering
 * property, not a hit-testing one, and `.click()` calls the element's
 * click handler directly rather than simulating a mouse event at
 * coordinates -- so driving the menu still works with it applied.
 * ---------------------------------------------------------------------
 */
(function (FXP) {
  'use strict';
  const state = FXP.state;
  const delay = FXP.delay;
  const overlayChildCount = FXP.overlayChildCount;

  const SWAP_STYLE_ID = 'fx-swap-style';
  const SWAP_DRIVING_CLASS = 'fx-swap-driving';

  function ensureSwapDrivingStyle() {
    if (document.getElementById(SWAP_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = SWAP_STYLE_ID;
    style.textContent =
      '.' +
      SWAP_DRIVING_CLASS +
      ' .cdk-overlay-container { visibility: hidden !important; }\n' +
      '.' +
      SWAP_DRIVING_CLASS +
      ' .cdk-overlay-container * { transition: none !important; }';
    document.head.appendChild(style);
  }

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

  // First empty ACTIVE slot the player is eligible for, preferring their
  // current listed position. Looked up fresh (not from state.players) so it
  // sees the list as it stands mid-sequence.
  //
  // Fantrax structurally renders these empty D/M/F rows up to the league's
  // formation MAX for each discipline (e.g. D:3-5) at all times, regardless
  // of whether the current active count is already at the 11-player total --
  // live-verified: from a full, valid 11/11 lineup, two extra empty D rows
  // and one extra empty F row are already sitting in the list, clickable.
  // Filling one of them is a real Fantrax op (it doesn't reject it), but it
  // pushes the total active count to 12 -- a legal *intermediate* state only
  // because step 2 below is expected to immediately bench someone and bring
  // it back to 11. There can be more than one candidate row for a given
  // position, and Fantrax may enable only some of them (`disabled`/
  // `ineligible` on the rest) -- skip any it has disabled, same rule as
  // every other destination in this file.
  function findEmptyActiveSlotButton(player) {
    const prefs = [player.pos].concat(player.eligiblePositions.filter((p) => p !== player.pos));
    for (const pos of prefs) {
      if (!player.eligiblePositions.includes(pos)) continue;
      const row = FXP.getListRows().find((r) => {
        const a = r.querySelector('.scorer__info__name a');
        const btn = r.querySelector('button.lineup-btn');
        return !a && btn && !btn.disabled && btn.textContent.trim() === pos && !r.classList.contains('row--amber');
      });
      if (row) return row.querySelector('button.lineup-btn');
    }
    return null;
  }

  // Empty bench spot (only exists mid-shuffle, e.g. right after step 1 of a
  // two-step replacement moves a bench player into the lineup).
  //
  // Live-verified root cause of a real bug: right after step 1 pushes active
  // to 12 (see findEmptyActiveSlotButton above), the reserve section renders
  // TWO empty amber rows, not one -- and the FIRST one in DOM order was
  // `disabled` + `ineligible` for the specific player step 2 arms, while the
  // SECOND was the real, clickable one (`eligible-to`, not disabled). The
  // old `.find()` here grabbed whichever came first with no disabled check,
  // so it silently clicked the wrong (disabled-but-still-clickable-via-JS)
  // row: nothing happened, the outgoing player stayed active, and the
  // lineup was left over-full at 12. Skip disabled rows here too.
  function findEmptyReserveSlotButton() {
    const row = FXP.getListRows().find((r) => {
      const a = r.querySelector('.scorer__info__name a');
      const btn = r.querySelector('button.lineup-btn');
      return !a && btn && !btn.disabled && r.classList.contains('row--amber');
    });
    return row ? row.querySelector('button.lineup-btn') : null;
  }

  // Fantrax also nags with its OWN "Unsaved Changes" dialog (buttons read
  // "arrow_backLeave" / "redoStay", icon ligature glued on) whenever a
  // lineup change is pending -- completely unrelated to swap mechanics, but
  // it lands in the same `.cdk-overlay-container` we watch for the real
  // "Move" menu. Root cause (found later, chasing a report that it kept
  // appearing during a run of several swaps): it's not a generic idle
  // timer -- points-sync.js's background scrape flips the real Fantasy
  // Points/Stats tabs (and opens the period `mat-select`) roughly every
  // 60s, both of which are real Angular route/query-param navigations, so
  // either one trips this exact guard while a change is pending. That file
  // now checks FXP.hasPendingLineupChanges() and skips its whole scrape
  // whenever one is, so in normal use this collision shouldn't happen
  // anymore -- state.busy also already blocks it for the full duration of
  // any swap this function itself is running. Dismissal stays here as a
  // safety net (e.g. a change left pending between two separate swaps,
  // right as a new one starts, before that guard has had a chance to back
  // the scrape off) -- Stay, since we're not navigating.
  function dismissUnsavedChangesNag() {
    const overlay = document.querySelector('.cdk-overlay-container');
    if (!overlay) return false;
    const stay = Array.from(overlay.querySelectorAll('button')).find((b) => /stay\s*$/i.test(b.textContent.trim()));
    if (!stay) return false;
    stay.click();
    return true;
  }

  // Best-effort driver for Fantrax's "Move / Change to <pos>" menu when it
  // opens on arming a multi-position bench player (see header). "Move" was
  // live-verified to always complete an arm; "Change to <pos>" was
  // live-verified to just cancel the selection, so we don't try it.
  async function driveSwapMenu() {
    const overlay = document.querySelector('.cdk-overlay-container');
    if (!overlay) return false;
    const items = Array.from(overlay.querySelectorAll('button, .mat-mdc-menu-item, [mat-menu-item], a'));
    const move = items.find((b) => /move\s*$/i.test(b.textContent.trim()));
    if (!move) return false;
    move.click();
    await delay(400);
    return true;
  }

  // If the overlay grew, first rule out the unrelated Unsaved-Changes nag
  // (dismiss and re-check), then try to drive a real "Move" menu. Returns
  // true once the overlay is back to baseline (whether nothing opened, the
  // nag was dismissed, or the menu was successfully driven).
  async function clearAnyOverlay(beforeOverlay) {
    if (overlayChildCount() <= beforeOverlay) return true;
    if (dismissUnsavedChangesNag()) {
      await delay(250);
      if (overlayChildCount() <= beforeOverlay) return true;
    }
    if (await driveSwapMenu()) {
      if (overlayChildCount() <= beforeOverlay) return true;
      // The menu itself might have been sitting behind the nag -- one more pass.
      if (dismissUnsavedChangesNag()) {
        await delay(250);
        if (overlayChildCount() <= beforeOverlay) return true;
      }
    }
    return overlayChildCount() <= beforeOverlay;
  }

  // One arm-click + one destination-click through the real list. `arm` is
  // always a named player; `destBtn` is resolved AFTER arming (Fantrax
  // re-flags rows the moment a player is armed). Returns true on success;
  // on failure it disarms (second click on the armed button) so the real
  // list isn't left in a half-armed state.
  async function runStep(arm, resolveDestBtn, beforeOverlay) {
    const armRow = FXP.findRowByName(arm.name);
    const armBtn = armRow && armRow.querySelector('button.lineup-btn');
    if (!armBtn) {
      setStatus("Couldn't find " + arm.name + ' in the list anymore — try again.', 'err');
      return false;
    }
    armBtn.click();
    await delay(300);

    if (!(await clearAnyOverlay(beforeOverlay))) {
      setStatus('Fantrax opened its own picker for this — finish the swap there, then check back.', 'err');
      return false;
    }

    const destBtn = resolveDestBtn();
    if (!destBtn) {
      armBtn.click(); // disarm
      await delay(200);
      setStatus("Couldn't find the destination slot — try again.", 'err');
      return false;
    }
    if (destBtn.disabled) {
      // Fantrax's own eligibility logic says no. Trust it.
      armBtn.click(); // disarm
      await delay(200);
      setStatus("Fantrax doesn't allow that move.", 'err');
      return false;
    }

    destBtn.click();
    await delay(450);

    if (!(await clearAnyOverlay(beforeOverlay))) {
      setStatus('Fantrax opened its own picker for this — finish the swap there, then check back.', 'err');
      return false;
    }
    return true;
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
    if (!FXP.isValidDropTarget(source, target)) {
      setStatus("That move isn't possible.", 'err');
      return;
    }

    state.busy = true;
    setStatus(`Swapping ${source.name} ↔ ${target.isEmpty ? 'empty slot' : target.name}…`);

    // Mask Fantrax's overlay container for the whole sequence -- see header.
    // Removal is unconditional (every exit path, including a thrown error)
    // because a stuck class would permanently hide ALL Fantrax overlays
    // (dialogs, menus, tooltips) site-wide, which is far worse than letting
    // one flash through.
    ensureSwapDrivingStyle();
    document.documentElement.classList.add(SWAP_DRIVING_CLASS);

    // Mark just the two involved cards as mid-swap (card.css's
    // .fx-card--swapping: dim + a small spinner) rather than taking over the
    // whole pitch the way the initial points-sync loading state does -- this
    // is "the data's fine, these two cards are mid-request," not "we don't
    // have anything to show yet." Covers the two-step path too: `incoming`/
    // `outgoing` below are just `source`/`target` relabeled, so marking
    // these two is enough for every shape (direct swap, empty-slot target,
    // two-step). An empty-slot target is normally `display: none` unless
    // mid-drag-hover (card.css .fx-card--empty), and drag.js's `dragend`
    // clears that hover state on the very next event tick -- before any of
    // this function's own delays -- so .fx-card--swapping also forces it
    // visible in card.css, otherwise the loading card would never be seen.
    const sourceCard = state.cardsByKey.get(source.key);
    const targetCard = state.cardsByKey.get(target.key);
    if (sourceCard) sourceCard.classList.add('fx-card--swapping');
    if (targetCard) targetCard.classList.add('fx-card--swapping');

    try {
      const beforeOverlay = overlayChildCount();

      // Build the click plan.
      let ok;
      let twoStep = false;
      let incoming, outgoing;
      if (target.isEmpty || (!source.isReserve && !target.isReserve)) {
        // Empty-slot or active<->active: arm source directly, click the
        // target. Arming an active player never opens the menu; arming a
        // reserve player here only happens when the target is an empty slot
        // (no active counterpart to arm instead), which is exactly step 1's
        // shape below and is handled the same way if the menu opens.
        ok = await runStep(source, () => findTargetButton(target), beforeOverlay);
      } else {
        incoming = source.isReserve ? source : target;
        outgoing = source.isReserve ? target : source;
        if (incoming.eligiblePositions.includes(outgoing.pos)) {
          // Direct active<->bench swap: arm the ACTIVE side (outgoing) first
          // and click the BENCH side (incoming) as the destination. Live-
          // verified menu-free regardless of single/multi-position on either
          // side -- see header. (Arming the bench side first is what
          // triggers the menu; don't do that here.)
          ok = await runStep(outgoing, () => findTargetButton(incoming), beforeOverlay);
        } else {
          // Two-step replacement: incoming -> empty active slot they fit,
          // then outgoing -> the bench spot that just opened up. Step 1 has
          // no active counterpart to arm instead, so if incoming has 2+
          // eligible positions the menu WILL open on arming -- runStep drives
          // it via "Move". Step 1 alone leaves the lineup over-full (12
          // active) until step 2 lands -- see findEmptyActiveSlotButton.
          twoStep = true;
          setStatus(`Bringing ${incoming.name} in and benching ${outgoing.name}…`);
          ok = await runStep(incoming, () => findEmptyActiveSlotButton(incoming), beforeOverlay);
          if (ok) {
            ok = await runStep(outgoing, () => findEmptyReserveSlotButton(), beforeOverlay);
          }
        }
      }

      if (!ok) {
        return;
      }

      const after = FXP.parseRoster();

      if (twoStep) {
        // Step 1 succeeding only means `incoming` is active -- it says
        // nothing about whether step 2 actually benched `outgoing`. Checking
        // only the drag's `source` (as the single-op paths below do) would
        // report success here even when step 2 silently failed, leaving an
        // invalid over-full (12-active) lineup with the user none the wiser
        // -- exactly what was reported live. Require BOTH halves to have
        // actually landed before calling it a swap.
        const newIncoming = after.find((x) => !x.isEmpty && x.name === incoming.name);
        const newOutgoing = after.find((x) => !x.isEmpty && x.name === outgoing.name);
        const incomingLanded = !!newIncoming && !newIncoming.isReserve;
        const outgoingBenched = !!newOutgoing && newOutgoing.isReserve;
        if (incomingLanded && outgoingBenched) {
          setStatus(`Swapped ${source.name} ↔ ${target.name}.`, 'ok');
        } else if (incomingLanded) {
          setStatus(
            `Brought ${incoming.name} in, but couldn't bench ${outgoing.name} — the lineup now has an extra ` +
              `active player. Drag ${outgoing.name} to the bench, or fix it in Fantrax's own list.`,
            'err'
          );
        } else {
          setStatus(
            "That didn't go through. This can happen if either player's game has already started, or your league locks lineup changes once the gameweek begins.",
            'err'
          );
        }
      } else {
        const newSource = after.find((x) => !x.isEmpty && x.name === source.name);
        const success = !!newSource && (newSource.isReserve !== source.isReserve || newSource.pos !== source.pos);
        if (success) {
          setStatus(`Swapped ${source.name} ↔ ${target.isEmpty ? 'active slot' : target.name}.`, 'ok');
        } else {
          setStatus(
            "That didn't go through. This can happen if either player's game has already started, or your league locks lineup changes once the gameweek begins.",
            'err'
          );
        }
      }
    } finally {
      document.documentElement.classList.remove(SWAP_DRIVING_CLASS);
      // Belt-and-braces: FXP.render() below rebuilds every card from scratch
      // (including cardsByKey) whenever it actually runs, which already
      // drops .fx-card--swapping -- but render() no-ops off the roster page,
      // so an explicit removal here is what actually guarantees these two
      // specific elements aren't left permanently dimmed/spinning if that
      // happens.
      if (sourceCard) sourceCard.classList.remove('fx-card--swapping');
      if (targetCard) targetCard.classList.remove('fx-card--swapping');
      state.busy = false;
      FXP.render();
    }
  }

  FXP.setStatus = setStatus;
  FXP.findTargetButton = findTargetButton;
  FXP.attemptSwap = attemptSwap;
})(window.FXP);

// ---- src/pitch-editor/action-menu.js ----
/**
 * Prettier Fantrax -- Pitch Editor: per-player action menu
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

  // ---------- "Recent performances" (src/shared/last5.js) ----------
  // The same block matchup's action menu carries, built on the SAME shared
  // module (src/shared/last5.js), so both features share one league-wide
  // scorerId lookup per page load and one cache -- see that file's own
  // comment for exactly how far the per-player sharing goes.
  //
  // Shown only for players whose game hasn't kicked off yet (roster.js
  // sets `locked` when the opp cell no longer carries a clock time, i.e.
  // the game has started or finished). On a FUTURE gameweek that's the
  // whole squad, which is the case the user asked for -- and on the
  // current one it keeps showing form for players still to play, exactly
  // when "should I start them?" is the live question, while staying out of
  // the way for players whose points are already real and on the card.
  //
  // Fantrax's scorerMap is league-wide, so resolving an abbreviated card
  // name ("M. Sangaré") is disambiguated by the fantasy team that owns the
  // player -- here, whichever team's roster is on screen, read off the
  // URL's own `teamId` matrix param. That param is absent when Fantrax
  // renders your own default roster, in which case this passes null and
  // last5.js falls back to its league-wide unique-match rule (which still
  // refuses rather than guessing when two players genuinely collide).
  function rosterTeamId() {
    const m = /[;&?]teamId=([^;&?]+)/.exec(location.href);
    return m ? m[1] : null;
  }

  function formatSigned(text) {
    const n = parseFloat(text);
    return n > 0 ? `+${text}` : text;
  }

  function formatRecentOpponent(oppText) {
    const trimmed = (oppText || '').trim();
    if (!trimmed) return '';
    if (trimmed.charAt(0) === '@') return `@ ${trimmed.slice(1).trim()}`;
    return `vs ${trimmed}`;
  }

  // Three outcomes, three renderings -- never a silently absent section.
  // `rows === null` is a failed fetch (last5.js throws rather than caching
  // Fantrax's rate-limit response, so re-tapping genuinely does retry); an
  // empty array is a player with no games on record yet. Mirrors matchup's
  // renderLast5Rows exactly.
  function buildLast5Message(text) {
    const row = document.createElement('div');
    row.className = 'fx-action-menu__last5-row fx-action-menu__last5-row--muted';
    row.textContent = text;
    return row;
  }

  function renderLast5Rows(rows) {
    const nodes = [];
    const title = document.createElement('div');
    title.className = 'fx-action-menu__last5-title';
    title.textContent = 'Recent performances';
    nodes.push(title);
    if (!rows) {
      nodes.push(buildLast5Message('Couldn’t load — tap again to retry'));
      return nodes;
    }
    if (!rows.length) {
      nodes.push(buildLast5Message('No games played yet'));
      return nodes;
    }
    rows.forEach((g) => {
      const row = document.createElement('div');
      row.className = 'fx-action-menu__last5-row';
      const ptsText = g.fpts !== '' && g.fpts != null ? formatSigned(g.fpts) : '0';
      const oppText = formatRecentOpponent(g.opponent) || g.date || '';
      FXShared.renderStatLine(row, { text: oppText, pts: ptsText });
      nodes.push(row);
    });
    return nodes;
  }

  // Re-renders into WHATEVER menu is currently open rather than a captured
  // element, and only if it's still this player's -- by the time the fetch
  // resolves the user may have tapped someone else, and painting one
  // player's form into another's menu is exactly the bug that guard
  // prevents. The roster's menu is only ever open for one card at a time
  // (state.actionMenuPlayerKey, set in openActionMenu).
  function refreshLast5UI(playerKey, rows) {
    if (!state.actionMenuEl || state.actionMenuPlayerKey !== playerKey) return;
    const container = state.actionMenuEl.querySelector('.fx-action-menu__last5');
    if (!container) return;
    container.innerHTML = '';
    renderLast5Rows(rows).forEach((n) => container.appendChild(n));
  }

  function buildLast5Section(p) {
    if (p.isEmpty || p.locked) return null; // already played -- the real number is on the card
    const teamId = rosterTeamId();
    const container = document.createElement('div');
    container.className = 'fx-action-menu__last5';
    const cached = FXShared.peekLast5(p.name, teamId);
    if (cached !== undefined) {
      renderLast5Rows(cached).forEach((n) => container.appendChild(n));
    } else {
      const loading = document.createElement('div');
      loading.className = 'fx-action-menu__last5-title fx-action-menu__last5-title--loading';
      loading.textContent = 'Recent performances: loading…';
      container.appendChild(loading);
      FXShared.getLast5(p.name, teamId).then((rows) => refreshLast5UI(p.key, rows));
    }
    return container;
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
    state.actionMenuPlayerKey = null;
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

    // Tracked so refreshLast5UI can tell whether the menu that's open when
    // a fetch resolves is still the one that started it.
    state.actionMenuPlayerKey = p.key;

    if (coarse) {
      const statsSection = buildStatsSection(p);
      if (statsSection) menu.appendChild(statsSection);
      // Recent form sits under the stats block as supporting info (same
      // ordering and reasoning as matchup's menu), and only one divider
      // goes in above the buttons regardless of which of the two
      // read-only sections are present.
      const last5Section = buildLast5Section(p);
      if (last5Section) menu.appendChild(last5Section);
      if (statsSection || last5Section) {
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
 * Prettier Fantrax -- Pitch Editor: boot / keep in sync with live updates
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
 * Prettier Fantrax -- Matchup Pitch: shared state + tiny DOM utils
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

    // hover breakdown tooltip (pitch + bench cards, DESKTOP ONLY -- a touch
    // tap opens action-menu.js's menu instead, see render.js's
    // attachHoverTooltip) -- same fixed-position singleton-element pattern
    // as pitch-editor/tooltip.js, own `fxm-` class.
    tooltipEl: null,
    hoveredName: null, // player name currently under the pointer, keyed the
    // same way window.FXC and parse.js's chip maps are (by name, not a
    // synthetic per-card key -- matchup cards have no such key today)
    lastMouseX: 0,
    lastMouseY: 0,

    // Per-player action menu (action-menu.js) -- own singleton element,
    // mirroring pitch-editor's FXP.state.actionMenuEl. Opened by BOTH a
    // touch tap (with a read-only stats section prepended) and a desktop
    // click (buttons only, the hover tooltip above already covers stats
    // there) -- see render.js's attachHoverTooltip. Keyed 'fxm-menu' in
    // FXShared.trackAnchor, distinct from the tooltip's own 'fxm' key, so
    // the two scroll-trackers can never collide even though in practice
    // only one of {tooltip, menu} is ever open at a time.
    actionMenuEl: null,
    // Identity (not a DOM node reference) of the player the menu is
    // currently anchored to on a coarse-pointer (touch) open, e.g. { side:
    // 'home', isBench: false, name: 'Erling Haaland' } -- null on a
    // fine-pointer (desktop) open, which positions at fixed click
    // coordinates and doesn't need to survive a card rebuild. render()
    // tears down and rebuilds EVERY `.fxm-card` node on every re-render,
    // and matchup's own live-score updates trigger that MUCH more often
    // than roster's re-renders -- action-menu.js's reapplyActionMenu (called
    // from the end of render(), same spot the old tooltip's
    // reapplySelection used to be) uses this identity to re-locate the same
    // player's freshly-built card and re-anchor/re-dim the STILL-OPEN menu
    // there, instead of the menu/dim reverting to "nothing selected" within
    // a second of the tap that opened it (confirmed live -- reads to the
    // user as it "immediately fading back up"). Set by openActionMenu,
    // cleared by closeActionMenu -- see action-menu.js.
    actionMenuIdentity: null,

    // NOTE: the recent-performances cache, in-flight map and Fantrax
    // scorerId map used to live here. They moved to src/shared/last5.js's
    // own module scope when that feature became shared with the roster
    // pitch editor -- one fetch and one cache now serve both features,
    // which two per-feature state objects could not.

    // Team manager-username cache (render.js's renderTeamHeader), same
    // same-origin-fetch justification as recent performances (see
    // src/shared/fantrax-api.js) --
    // keyed by teamId (parse.js's parseHeader reads it off the header's own
    // team-name link href, `.../team/roster;teamId=<id>`) rather than team
    // name, since a team's roster page itself is keyed by id, not name.
    // ownerCache: Map<teamId, string> -- PRESENCE means "resolved" (an
    // empty string is a valid, if unlikely, resolution); absence means
    // "not fetched yet, or a prior attempt failed and can be retried."
    // Fetched for BOTH teams in the CURRENT matchup in one batched request
    // (render()'s ensureOwnersFetched) the first time either isn't cached
    // yet -- covers most of a session after the very first render, since
    // the same two teams' matchup is what's on screen the whole time.
    ownerCache: new Map(),
    // ownerInflight: Map<teamId, Promise> -- in-flight dedupe, same pattern
    // as last5Inflight above.
    ownerInflight: new Map(),

    // This matchup's two fantasy teamIds (parse.js's parseHeader ->
    // data.home/away.header.teamId), refreshed every render() -- kept here
    // so action-menu.js's buildLast5Section can pass the tapped card's own
    // team to FXShared.getLast5 without needing the full parsed `data` object
    // threaded all the way down to it. See last5.js's resolveScorerId for
    // why the team matters: it's the tiebreak scope for an abbreviated
    // ("S. Lammens") name match against scorerMap's own full names.
    homeTeamId: null,
    awayTeamId: null,
  };

  FXM.qa = function qa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  };
})(window.FXM);

// ---- src/matchup/parse.js ----
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
 * Prettier Fantrax -- Matchup Pitch: render the two-team pitch
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
 * updates) trigger that rebuild often via the MutationObserver in main.js.
 * The hover tooltip (desktop only, see attachHoverTooltip below) copes with
 * that for free: it follows the live cursor position rather than anchoring
 * to a specific card element, and removing the hovered card from the DOM
 * mid-render fires its `mouseleave` (hiding the tooltip) same as actually
 * moving the mouse off it would. Tapping a card on touch no longer opens
 * this tooltip at all -- see action-menu.js, which owns the per-player
 * action menu (stats + real controls) that replaced it there, and closes
 * itself outright (rather than re-anchoring) if ITS card goes stale
 * mid-render -- see that file's own comment on why the simpler behavior is
 * enough for it.
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

  // ---------- hover breakdown tooltip (desktop only) ----------
  // Mirrors pitch-editor/tooltip.js's mechanics exactly (fixed-position
  // singleton div, mouseenter/mousemove/mouseleave, viewport-edge
  // flipping) under our own `fxm-` classes so it doesn't collide with
  // pitch-editor's `.fx-card-tip`. Wired onto both pitch (starter) cards
  // and bench cards via attachHoverTooltip, called from renderCard itself
  // so every place a card gets built (line or bench) gets hover for free.
  // Touch never shows this any more -- see attachHoverTooltip's own tap
  // wiring below, which opens action-menu.js's menu instead.

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

  // Net finger movement (px) between touchstart and touchend on a card
  // under which a touchend still counts as a tap rather than the tail end
  // of a scroll -- see attachHoverTooltip's FXShared.onTap wiring (now
  // gating whether a tap opens action-menu.js's menu, not this tooltip --
  // see that function's own comment). Same value and same idea as
  // pitch-editor/drag.js's TOUCH_MOVE_CANCEL_PX.
  const TOUCH_TAP_MOVE_PX = 10;

  function hideTooltip() {
    if (state.tooltipEl) state.tooltipEl.classList.remove('fxm-tip--visible');
    state.hoveredName = null;
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
  // 'starting'/'bench' wording is Fantrax's OWN tooltip text, read live off
  // their real mat-tooltip elements (not guessed) -- see the recon doc for
  // the exact technique and readings. Neither hedges with "expected"/
  // "confirmed" the way our old copy did (old bench label was literally
  // "Expected to be on the bench" -- that "Expected" was our invention,
  // not Fantrax's, and was the exact wording the user objected to).
  // 'expected'/'out' have no live-confirmed example (no player with either
  // class was found on any roster/matchup/gameweek reachable this
  // session) -- kept as best-effort, deliberately non-hedged wording
  // justified from the class name alone rather than silently inventing
  // hedged language; update these two for real the moment a live example
  // turns up.
  const EVENT_STATUS_LABEL = {
    starting: 'Starting in upcoming/current game', // live-confirmed
    expected: 'Likely to play', // best-effort, unconfirmed
    bench: 'On the bench, potential substitute', // live-confirmed
    out: 'Not in the squad for this game', // best-effort, unconfirmed
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
  //
  // For a not-yet-played ('upcoming', and the 'unknown' best-effort
  // fallback right after it) player who also has a pre-kickoff status dot
  // (p.eventStatus, this file's own EVENT_STATUS_LABEL copy above), the
  // dot's own explanation (e.g. "Not expected to play") is prepended as
  // the first line, ahead of the projected/no-stats line -- the dot's
  // `title` attribute never shows on a tap/touch device, so the tooltip is
  // what carries that explanation on mobile.
  // parse.js's p.points comes from `dl.scoring-table__cell__fpts dd`, which
  // can disagree with the player's ACTUAL stat breakdown once their game is
  // live -- confirmed against a real match (Joao Pedro, 3' into a live
  // game: dd read ~18.4 while Fantrax's own player-card popup showed the
  // correct live total of 11, exactly matching this file's own breakdown
  // lines -- Goal +9, Shots on Target +2 -- summed by hand). Rather than
  // trust dd for a player we already have a proven-accurate per-stat fpts
  // reading for (window.FXC's fptsMap, the SAME data the breakdown lines
  // below are built from), derive the displayed total by SUMMING those
  // contributions instead -- pure arithmetic on data already validated
  // against the real total, no new DOM selector to get wrong. Falls back to
  // p.points (dd) only when no fptsMap reading exists yet for this player
  // (FXC not loaded, or this player not in it) -- same enhancement-layer-
  // over-fallback pattern the rest of this function already uses. Must NOT
  // be used for the 'upcoming' (not-yet-played) branches further down --
  // an unplayed player's fptsMap is empty (nothing scored yet), so summing
  // it would wrongly zero out p.points there, which legitimately holds
  // Fantrax's own PROJECTION in that case, not a stale/wrong total.
  function resolvePoints(p) {
    const fxc = window.FXC;
    const fptsMap = fxc && fxc.fpts && fxc.fpts.get(p.name);
    if (fptsMap && fptsMap.size) {
      let sum = 0;
      fptsMap.forEach((v) => {
        const n = parseFloat(v);
        if (!isNaN(n)) sum += n;
      });
      return String(Math.round(sum * 100) / 100);
    }
    return p.points;
  }

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
        const lines = [`${resolvePoints(p)} pts:`];
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
      const lines = [`${resolvePoints(p)} pts:`];
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
      // A player with an eventStatus (only ever set pre-kickoff -- see
      // parse.js/roster.js's readEventStatus) has a colored status dot next
      // to their name, but the dot's only explanation is an HTML `title`
      // attribute, which never shows on a tap/touch device. Prepend its
      // label (e.g. "Not expected to play") as its own line here so the
      // tooltip itself carries that explanation on mobile too, ahead of the
      // projected/no-stats line below.
      const statusLine = p.eventStatus ? [EVENT_STATUS_LABEL[p.eventStatus]] : [];
      if (p.points && p.points !== '-') return [...statusLine, `Projected: ${p.points} pts`];
      return [...statusLine, "No stats yet — hasn't played"];
    }
    if (state === 'finished') {
      return ['Did not play this gameweek'];
    }
    // unknown -- best effort, same as before this distinction existed. Same
    // eventStatus prepend as the 'upcoming' branch above, for consistency --
    // in practice a player with eventStatus set is always classified
    // 'upcoming', but this branch duplicates the same projected/no-stats
    // logic so it gets the same treatment rather than silently diverging.
    const statusLine = p.eventStatus ? [EVENT_STATUS_LABEL[p.eventStatus]] : [];
    if (p.points && p.points !== '-') return [...statusLine, `Projected: ${p.points} pts`];
    return [...statusLine, "No stats yet — hasn't played"];
  }

  function attachHoverTooltip(card, p, side) {
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

    // Desktop (fine-pointer) click -- opens action-menu.js's per-player
    // menu at the click coordinates, action buttons only (no stats section:
    // the hover tooltip above already covers that on desktop). Mirrors
    // pitch-editor's plain `click` listener (drag.js) exactly; matchup has
    // no drag/swap system competing for this card's click, so there's no
    // "armed" branching to do here -- every desktop click just (re)opens
    // the menu for whichever card it landed on. A touch tap's synthetic
    // click is already suppressed by FXShared.onTap's preventDefault below,
    // so in practice this only ever fires for a real mouse.
    card.addEventListener('click', (e) => {
      FXM.openActionMenu(card, p, side, e.clientX, e.clientY);
    });

    // Tap on touch devices -- opens the SAME action menu, but with a
    // read-only stats section prepended (action-menu.js's own
    // buildStatsSection, built from THIS file's buildTooltipLines) since
    // touch has no hover and would otherwise never see those numbers. This
    // REPLACES the old tap-to-toggle tooltip entirely: touch never shows
    // `.fxm-tip` any more, only the menu (see FXM.openActionMenu's own
    // isCoarsePointer() branch). Preserved from that old behavior: calling
    // preventDefault in touchend (when the event is cancelable -- see
    // below) suppresses the browser's synthetic mouseenter/mousemove/click
    // chain that would otherwise follow an unprevented tap, so the desktop
    // mouseenter/click listeners above never fire for a tap and this is the
    // ONLY logic that runs. Desktop mouseenter/mousemove/mouseleave/click
    // above are untouched -- touchend simply never fires for a real mouse.
    //
    // The tap-vs-scroll gesture gating (net finger movement under
    // TOUCH_TAP_MOVE_PX between touchstart and touchend, cancelable-safe
    // preventDefault) is FXShared.onTap (src/shared/touch-overlay.js) --
    // the exact mechanics this file originally had inline, now shared with
    // anything else that needs "was this touchend a real tap." Not the
    // same concern as pitch-editor/drag.js's own long-press-vs-scroll state
    // machine (that one decides whether to START A DRAG); this one decides
    // whether to open the menu at all.
    FXShared.onTap(
      card,
      (e) => {
        const t = e.changedTouches && e.changedTouches[0];
        FXM.openActionMenu(card, p, side, t ? t.clientX : 0, t ? t.clientY : 0);
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
    // Identity attributes -- same side:isBench:name shape as marqueeKey
    // (below). Also what action-menu.js's reapplyActionMenu re-locates a
    // card by after a rebuild, and what the `--menu-selected` check right
    // below reads back on THIS same freshly-built card.
    if (p.name) {
      card.dataset.side = side || '';
      card.dataset.bench = isBench ? '1' : '0';
      card.dataset.name = p.name;

      // Marks the ONE card action-menu.js's menu is currently anchored to
      // (state.actionMenuIdentity, set by openActionMenu -- see its own
      // comment) so matchup.css's `.fxm-matchup--menu-open .fxm-card`
      // dimming rule can exempt it via `.fxm-card--menu-selected`, checked
      // right here at CREATION time -- before this card is ever inserted
      // into the document. That timing is the whole fix for a "flicker"
      // bug: render() tears down and rebuilds EVERY `.fxm-card` node on
      // every re-render (matchup's live-score updates trigger that often,
      // sometimes multiple times a second), and the previous approach
      // (JS looping over cards AFTER each render to toggle a `--dimmed`
      // class) let every fresh batch of cards paint one full frame
      // completely undimmed before catching up a tick later -- a constant,
      // visible flash on every OTHER player's card, confirmed live. Doing
      // the check here instead means a freshly-created non-selected card's
      // very FIRST paint is already dimmed (no class to add after the
      // fact, matchup.css's descendant selector just applies), and the
      // selected card's very first paint is already exempted -- there's no
      // "before" frame for either one to flash through.
      const identity = state.actionMenuIdentity;
      if (identity && identity.side === (side || '') && identity.isBench === isBench && identity.name === p.name) {
        card.classList.add('fxm-card--menu-selected');
      }
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
    const resolvedPoints = isUpcoming ? null : resolvePoints(p);
    const ptsText = resolvedPoints && resolvedPoints !== '-' ? resolvedPoints : '0';
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
    if (p.name) attachHoverTooltip(card, p, side);
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
    // Stale-pass guard -- fixes a real race where the ping-pong marquee
    // appeared to "just reset" instead of resuming mid-cycle. render()
    // schedules this via requestAnimationFrame(() => applyNameMarquee(body))
    // AFTER building a fresh `body`, but that scheduling is async -- if a
    // SECOND render() runs before the first render's rAF callback fires
    // (this page's MutationObserver in main.js can trigger back-to-back
    // renders well inside a single 6s marquee cycle), render() synchronously
    // does `state.bodyEl.remove()` on the OLD body before attaching the new
    // one. The OLDER rAF callback then fires with a `root` that is already
    // detached from the document. Every element's scrollWidth/clientWidth
    // measure as 0 on a detached node, so `overflow <= 0` is true for
    // everything and applyMarqueeToSet's `overflowing` loop below never
    // touches ANY key -- but this function still unconditionally did
    // `state.marqueeStarts = nextStarts` at the end, stomping the real map
    // with that (near-)empty one. The very next genuine (attached, correctly
    // measuring) pass then finds no prior start time for a still-overflowing
    // element's key, falls back to `now`, and its animation-delay resets to
    // 0 -- reading to the user as "it just reset" even though the underlying
    // ping-pong/persistence mechanism is otherwise correct.
    //
    // Fix: bail out here, before touching state.marqueeStarts at all, when
    // `root` is no longer attached. render() always removes the previous
    // body SYNCHRONOUSLY before scheduling the next rAF, so by the time a
    // stale callback's rAF actually fires, its captured root is reliably
    // already detached -- regardless of which order the two rAF callbacks
    // end up firing in. A simple isConnected check is enough; no generation
    // counter/token needed since detachment itself is the exact, reliable
    // signal of staleness here.
    if (!root.isConnected) return;

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
    // Team header manager-username line (renderTeamHeader) -- own
    // 'owner:'-prefixed key namespace, disjoint from 'header:' (team name)
    // above for the same team. Usernames are typically short (no spaces),
    // so this rarely if ever actually overflows, but the mechanism is
    // there for the unusual long one rather than silently clipping it.
    applyMarqueeToSet(root, '.fxm-team-header__owner', '.fxm-team-header__owner-text', 'fxm-team-header__owner--marquee', nextStarts, now);

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
  // ---------- W/L/D result chip (completed matchups only) ----------
  // Fantrax marks a finished matchup nowhere in this page's own header --
  // it just keeps showing both totals (confirmed live on a past gameweek:
  // "It's Carrick, You Know FC 74.55" vs "Fodenfreezone 80.68", with no
  // result indicator anywhere), so who actually won is left for the reader
  // to work out by comparing two decimals. This derives it.
  //
  // "Completed" deliberately means EVERY player's real-life game has been
  // played, not merely "this gameweek is in the past": mid-gameweek, one
  // side leading with fixtures still to come is not a result, and labelling
  // it W/L would be actively misleading. gameState() already classifies a
  // player's game from its own text, so the test is simply that nothing is
  // still 'upcoming' ('unknown' counts as done -- see gameState's own
  // comment on why it trusts a number it can't positively identify as a
  // projection). Returns null when the matchup isn't finished, or when
  // either total isn't a number we can compare, so callers render no chip
  // at all rather than a wrong or empty one.
  // Only STARTERS decide a matchup -- reserves don't score in Fantrax, so a
  // bench player with a later kickoff doesn't keep the result open. Note
  // parse.js's own shape: starters are bucketed by position ({G,D,M,F}),
  // reserves are a flat list; there is no combined `players` array.
  function startersOf(side) {
    const buckets = (side && side.starters) || {};
    return Object.keys(buckets).reduce((acc, pos) => acc.concat(buckets[pos] || []), []);
  }

  function matchupResult(data) {
    const players = startersOf(data.home).concat(startersOf(data.away));
    if (!players.length) return null;
    // Every starter's game must be POSITIVELY finished. Testing for the
    // absence of 'upcoming' instead would call a matchup done while games
    // were still in progress: a kicked-off game shows a score with no
    // trailing "F" and no clock time, which gameState reports as 'unknown'.
    if (!players.every((p) => gameState(p.gameText) === 'finished')) return null;

    const homeScore = parseFloat(data.home.header.live);
    const awayScore = parseFloat(data.away.header.live);
    if (!isFinite(homeScore) || !isFinite(awayScore)) return null;

    if (homeScore === awayScore) return { home: 'D', away: 'D' };
    const homeWon = homeScore > awayScore;
    return { home: homeWon ? 'W' : 'L', away: homeWon ? 'L' : 'W' };
  }

  const RESULT_LABEL = { W: 'Won', L: 'Lost', D: 'Drew' };

  function renderResultChip(result) {
    const chip = el('div', `fxm-team-header__result fxm-team-header__result--${result.toLowerCase()}`);
    chip.textContent = result;
    // The letter alone is the whole visual, so give assistive tech (and a
    // desktop hover) the word rather than making them infer it.
    chip.title = RESULT_LABEL[result] || '';
    chip.setAttribute('aria-label', RESULT_LABEL[result] || result);
    return chip;
  }

  function renderTeamHeader(side, extraClass, key, result) {
    const header = el('div', `fxm-team-header ${extraClass}`);
    // Name row: team crest (when present) beside the team name -- see
    // matchup.css's `.fxm-team-header__top` for how this row itself gets
    // mirrored (logo-then-name vs. name-then-logo) between the home/away
    // sides. `top` is its own wrapper (not just appending logo/name
    // straight to `header`) so it can be a flex row independent of
    // `header`'s own flex-column stacking of [name row] above [scores].
    const top = el('div', 'fxm-team-header__top');
    // Team crest, read straight off Fantrax's own header DOM (parse.js's
    // parseHeader -> readCrestFromFigure on figure.scoring-header__logo --
    // see dot-tooltip-recon.md's "Team header logo" section). Unlike
    // jerseyFromCrest's CONSTRUCTED jersey URLs elsewhere in this file,
    // this URL comes straight off the DOM (never guessed/constructed), so
    // a broken image is very unlikely -- simplest safe handling is to just
    // skip rendering the <img> entirely when there's no logo, rather than
    // showing a broken-image icon.
    if (side.header.logo) {
      const logo = el('img', 'fxm-team-header__logo');
      logo.src = side.header.logo;
      logo.alt = '';
      logo.draggable = false;
      top.appendChild(logo);
    }
    const nameEl = el('div', 'fxm-team-header__name');
    nameEl.dataset.marqueeKey = `header:${key}`;
    // Name text lives in an inner span, mirroring .fxm-card__name-text --
    // see applyNameMarquee/applyMarqueeToSet, which measures/animates this
    // exactly like a player card's name.
    nameEl.appendChild(el('span', 'fxm-team-header__name-text', side.header.name || ''));
    top.appendChild(nameEl);
    // Result chip beside the name. `top` is a flex row that CSS mirrors for
    // the away side, so appending here puts the chip on the correct edge of
    // each header without either side needing its own ordering logic. Only
    // rendered for a genuinely completed matchup -- see matchupResult.
    if (result) top.appendChild(renderResultChip(result));
    header.appendChild(top);
    // Manager username, e.g. "noahsemus" -- NOT present anywhere in this
    // header's own DOM (confirmed live; see fxpa.js's header comment), so
    // this only renders once ensureOwnersFetched (called from render(),
    // which has both teams' ids in scope) has a cached value for THIS
    // team's id. A header built before that resolves simply has no owner
    // line at all -- no "loading" placeholder -- since the fetch already
    // covers both teams in one request kicked off at the top of render(),
    // and typically resolves well before the next re-render (matchup's own
    // live-score churn) rebuilds this header anyway; ensureOwnersFetched's
    // own .then triggers exactly one extra FXM.render() call once it
    // settles, so the very next header built after that already has it
    // from its first paint -- same "born with the right content, no flash"
    // principle as the dimming fix (matchup.css/action-menu.js).
    const ownerName = side.header.teamId ? state.ownerCache.get(side.header.teamId) : null;
    if (ownerName) {
      const ownerEl = el('div', 'fxm-team-header__owner');
      ownerEl.dataset.marqueeKey = `owner:${key}`;
      ownerEl.appendChild(el('span', 'fxm-team-header__owner-text', ownerName));
      header.appendChild(ownerEl);
    }
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

  // Ensures a same-origin fetch is in flight (or already resolved) for
  // BOTH teams' manager usernames in `data`, batched into ONE request when
  // both are missing (mirrors the real Fantrax app batching multiple
  // `getTeamRosterInfo` calls together) -- see fxpa.js's header comment for
  // why this fetch exists at all, and state.js's ownerCache/ownerInflight
  // comments for the caching contract. Schedules exactly one FXM.render()
  // re-run once the fetch settles (success populates ownerCache; failure
  // is swallowed -- console.warn only, header just stays as it is today,
  // per the user's own "no error UI" ask) so the newly-known username(s)
  // show up on the very next header build. Calling FXM.render() directly
  // here (rather than main.js's debounced scheduleRender) is the same
  // pattern render()/reapplyActionMenu/boot() already use elsewhere in
  // this codebase -- main.js's MutationObserver recognizes the resulting
  // DOM changes as "own" (isOwnMutation/isOwnNode) and won't reschedule
  // again, so there's no render loop risk.
  function ensureOwnersFetched(data) {
    const ids = [data.home.header.teamId, data.away.header.teamId].filter(Boolean);
    const need = ids.filter((id) => !state.ownerCache.has(id) && !state.ownerInflight.has(id));
    if (!need.length) return;

    const leagueId = FXShared.fxpaLeagueId();
    const promise = FXShared.fxpaRequest(need.map((teamId) => ({ method: 'getTeamRosterInfo', data: { leagueId, teamId } })))
      .then((json) => {
        (json.responses || []).forEach((r, i) => {
          const info = r && r.data && r.data.teamHeadingInfo;
          const value = info && info.owners && info.owners.value;
          state.ownerCache.set(need[i], value || '');
        });
        render();
      })
      .catch((err) => {
        console.warn('[fx-owner] failed to fetch team manager username(s)', err);
        // Not cached on failure -- the next render() (live-score churn
        // will trigger one soon regardless) sees these ids still missing
        // from both maps and retries.
      })
      .finally(() => {
        need.forEach((id) => state.ownerInflight.delete(id));
      });
    need.forEach((id) => state.ownerInflight.set(id, promise));
  }

  function render() {
    const data = FXM.parseMatchup();
    if (!data) {
      // Mobile matchup LIST view, or Teams/Scores tabs -- remove our
      // container silently rather than showing a stale/empty pitch. Also
      // close any open tooltip -- it lives at document.body, not inside
      // state.container, so it wouldn't otherwise be cleaned up by the
      // container removal below. (The action menu doesn't need the same
      // treatment: closeActionMenu is driven by reapplyActionMenu's own
      // "player not found" branch, which this same FXM.parseMatchup()
      // returning null would also trigger the next time a menu is open and
      // a render happens -- see action-menu.js.)
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

    // Kick off (if needed) the manager-username lookup for both teams in
    // this matchup, before headers are built below -- see
    // renderTeamHeader's own comment for the "born with the right content"
    // timing this is designed around. ensureOwnersFetched no-ops
    // immediately if both are already cached (the common case after the
    // very first render of a given matchup) or already in flight.
    ensureOwnersFetched(data);
    // Refreshed every render (cheap) -- see state.js's own comment on why
    // action-menu.js's last-5 lookup needs this.
    state.homeTeamId = data.home.header.teamId;
    state.awayTeamId = data.away.header.teamId;

    if (state.bodyEl) state.bodyEl.remove();
    const body = el('div', 'fxm-body');
    body.style.display = state.hidden ? 'none' : '';
    // DOM order matches the wide-layout reading order (home header, away
    // header, field, home bench, away bench) -- matchup.css's
    // grid-template-areas reorders these visually at the narrow breakpoint
    // (each bench moves next to its own team's header) without any JS
    // branching here.
    // Computed once for the matchup, not per side, so the two headers can
    // never disagree about who won.
    const result = matchupResult(data);
    body.appendChild(renderTeamHeader(data.home, 'fxm-team-header--home', 'home', result && result.home));
    body.appendChild(renderTeamHeader(data.away, 'fxm-team-header--away', 'away', result && result.away));
    body.appendChild(renderField(data));
    body.appendChild(renderBenchSide(data.home.reserves, 'fxm-bench--home', 'home'));
    body.appendChild(renderBenchSide(data.away.reserves, 'fxm-bench--away', 'away'));
    container.appendChild(body);
    state.bodyEl = body;
    // Re-anchors an open action menu (action-menu.js) to this player's
    // freshly-rebuilt card, if one is open -- see state.js's
    // actionMenuIdentity comment for why this is needed on every render(),
    // not just on a scroll-driven stale check.
    FXM.reapplyActionMenu(data, body);
    requestAnimationFrame(() => applyNameMarquee(body));
  }

  FXM.jerseyFromCrest = jerseyFromCrest;
  FXM.ensureContainer = ensureContainer;
  FXM.render = render;
  // Consumed by action-menu.js: hideTooltip closes the hover tooltip before
  // the menu takes over (mirrors pitch-editor's FXP.hideCardTip), and
  // buildTooltipLines is reused verbatim to build the menu's own read-only
  // stats section on touch -- one set of breakdown lines, shown either in
  // the hover tooltip (desktop) or the action menu (touch), never
  // duplicated.
  FXM.hideTooltip = hideTooltip;
  FXM.buildTooltipLines = buildTooltipLines;
  // Also consumed by action-menu.js's last-5-gameweeks block: gameState
  // gates it to upcoming (not-yet-played) players only, same classification
  // buildTooltipLines/renderCard already use for projection messaging;
  // formatSigned turns a plain fpts string into the same "+N"/"N"/"-N"
  // shape every OTHER stat line in this codebase already uses before
  // handing it to FXShared.renderStatLine's pos/neg/zero coloring.
  FXM.gameState = gameState;
  FXM.formatSigned = formatSigned;
})(window.FXM);

// ---- src/matchup/action-menu.js ----
/**
 * Prettier Fantrax -- Matchup Pitch: per-player action menu
 * ---------------------------------------------------------------------
 * Tapping/clicking a player on the matchup pitch opens a small menu of
 * real actions instead of (touch) toggling the stat tooltip or (desktop)
 * doing nothing beyond the hover tooltip. This is pitch-editor/
 * action-menu.js's exact model, re-namespaced under FXM/`fxm-`: on a
 * coarse-pointer (touch) device the menu prepends a read-only stats
 * section (this feature's own buildTooltipLines, rendered via the SAME
 * FXShared.renderStatLine every stat line in this codebase now goes
 * through) above the action buttons, since touch has no hover and would
 * otherwise never see those numbers at all. Desktop (fine pointer) skips
 * the stats section -- the hover tooltip (render.js's attachHoverTooltip)
 * already covers that there, untouched by this file.
 *
 * Unlike pitch-editor's roster, the matchup page has no separate "hidden
 * list" of per-player rows to drive real controls from -- parse.js already
 * reads player data straight off Fantrax's own REAL, visible
 * `league-livescoring-standard-table` (render.js's ensureContainer inserts
 * our pitch overlay as a sibling BEFORE that table, never hiding or
 * removing it -- confirmed live and in this file's own recon). So
 * triggerCellAction below re-finds that same live table/row/cell by name
 * (mirroring parse.js's own selectors) and clicks whatever real control
 * sits inside it, exactly the same "find the row, click the control"
 * principle as pitch-editor's triggerRowAction, just against a visible
 * table instead of a hidden one.
 *
 * The one wrinkle matchup has that roster doesn't: a single
 * `.scoring-table__row` holds BOTH teams' players side by side (home in
 * cells[0], the position-letter gutter in cells[1], away in cells[2] --
 * see parse.js's parseRow/parseSide) -- so "find this player's row" alone
 * is ambiguous; every lookup here also takes the tapped card's OWN side
 * ('home'/'away', threaded down from render.js's renderCard/
 * attachHoverTooltip, same as it already threads through to marqueeKey)
 * and reads the matching cell, never just "the row".
 *
 * Trade recon (live, on-device, 2026-08-26): matchup's scoring-table cell
 * itself has no inline Trade/Drop/Claim buttons at all (unlike roster's
 * `.i-table__row`, which carries `button.mat-gray--fill`/
 * `button.mat-red--fill` right in the row) -- the ONLY real control there
 * is the name link. But Fantrax's OWN player-card modal (opened by that
 * same link) has a real header icon button, confirmed live via its
 * `title="Trade"` attribute: `button.mat-gray--fill[title="Trade"]`, same
 * class Fantrax uses for roster's inline Trade button, just relocated into
 * this modal. No Drop/Claim control exists anywhere in that modal either
 * (checked its "..." expand_more control too -- reveals nothing, and a
 * text search of every button in the modal for drop/claim/add/waiver came
 * up empty) -- makes sense, since a matchup player is always on SOME
 * team's roster already (mine or my opponent's), so Drop/Claim (only
 * meaningful for MY OWN roster or a free agent) don't apply the way Trade
 * does. See triggerTrade below for how the async "open modal, wait for it,
 * click Trade inside it" flow works.
 * ---------------------------------------------------------------------
 */
(function (FXM) {
  'use strict';
  const qa = FXM.qa;
  const state = FXM.state;
  const FXShared = window.FXShared;

  // Re-finds the SAME cell parse.js originally read this player's data
  // from -- searches both scoring tables (tables[0] = starters, tables[1]
  // = reserves, per parse.js/parseMatchup) since a tapped card can be
  // either. `side` picks which of the row's two player cells to read
  // (cells[0] = home/left, cells[2] = away/right -- cells[1] is just the
  // position-letter/"Res" gutter, never a player). Matched by name via the
  // exact same `.scorer__info__name a` selector parse.js's parseSide uses.
  function findScoringCell(name, side) {
    const anchor = document.querySelector('league-livescoring-standard-table');
    if (!anchor) return null;
    const cellIdx = side === 'home' ? 0 : 2;
    for (const table of qa('.scoring-table', anchor)) {
      for (const row of qa('.scoring-table__row', table)) {
        const cells = qa(':scope > .scoring-table__cell', row);
        if (cells.length !== 3) continue;
        const cell = cells[cellIdx];
        const nameA = cell && cell.querySelector('.scorer__info__name a');
        if (nameA && nameA.textContent.trim() === name) return cell;
      }
    }
    return null;
  }

  function triggerCellAction(p, side, selector) {
    const cell = findScoringCell(p.name, side);
    const el = cell && cell.querySelector(selector);
    if (el) el.click();
  }

  // Fantrax's player-card modal renders asynchronously into its own
  // `.cdk-overlay-container` (confirmed live: anywhere from ~150ms up to
  // ~1s after the name link is clicked) -- there's no synchronous signal
  // to wait on, so this polls briefly for its real Trade button
  // (`button.mat-gray--fill[title="Trade"]`, see this file's own header
  // comment for the recon that found it) and clicks it the moment it
  // appears. Gives up silently past `deadline` if the modal (or its Trade
  // button) never shows -- e.g. Fantrax changes the modal, or it's slow
  // enough to exceed this budget -- rather than leaving a dangling timer
  // that fires long after the user's moved on.
  const TRADE_MODAL_POLL_MS = 120;
  const TRADE_MODAL_TIMEOUT_MS = 2500;

  function pollForTradeButton(deadline) {
    const btn = document.querySelector('.cdk-overlay-container button.mat-gray--fill[title="Trade"]');
    if (btn) {
      btn.click();
      return;
    }
    if (Date.now() >= deadline) return;
    setTimeout(() => pollForTradeButton(deadline), TRADE_MODAL_POLL_MS);
  }

  // Opens Fantrax's OWN player-card modal (same control "View Player Card"
  // below uses) and, once it's rendered, clicks its real Trade button --
  // see this file's header comment for the live recon confirming both that
  // this modal is the only place a Trade control exists for a matchup
  // player, and that it's real (Fantrax's own UI, not reimplemented here).
  function triggerTrade(p, side) {
    triggerCellAction(p, side, '.scorer__info__name a');
    pollForTradeButton(Date.now() + TRADE_MODAL_TIMEOUT_MS);
  }

  // "View Player Card" is the one real, directly-clickable control inside
  // matchup's own scoring-table cell (`.scorer__info__name a`) -- opens
  // Fantrax's OWN full player-card modal (Overview/Stats/Splits/News/etc.)
  // exactly as clicking it on the real page would, nothing reimplemented.
  // "Trade…" goes through that SAME modal (triggerTrade above) since
  // matchup's read-only scoring-table row has no inline Trade control of
  // its own the way roster's list rows do.
  function buildMenuItems(p, side) {
    return [
      {
        label: 'View Player Card',
        action: () => triggerCellAction(p, side, '.scorer__info__name a'),
      },
      {
        label: 'Trade…',
        action: () => triggerTrade(p, side),
      },
    ];
  }

  function isCoarsePointer() {
    return window.matchMedia('(pointer: coarse)').matches;
  }

  // Read-only stats block for touch devices (no hover => no tooltip
  // access) -- literal structure copy of pitch-editor/action-menu.js's
  // buildStatsSection, just reusing THIS feature's own buildTooltipLines
  // (render.js) instead of tooltip.js's. Returns null when there's nothing
  // to show, so the caller can skip the section (and its divider) entirely.
  function buildStatsSection(p) {
    const lines = FXM.buildTooltipLines(p);
    if (!lines || !lines.length) return null;
    const section = document.createElement('div');
    section.className = 'fxm-action-menu__stats';
    lines.forEach((line, i) => {
      const row = document.createElement('div');
      row.className = i === 0 ? 'fxm-action-menu__stats-title' : 'fxm-action-menu__stats-row';
      FXShared.renderStatLine(row, line);
      section.appendChild(row);
    });
    return section;
  }

  // ---------- "Recent performances" (last5.js) ----------
  // Feature-user request: "on future matchups have the player's last 5
  // weekly fpts hauls when i tap on them." Data comes from last5.js's
  // same-origin fetch (see fxpa.js's header comment for the "no API
  // access" scope extension both required) -- this file only renders
  // whatever last5.js's cache/fetch layer hands it.
  //
  // Originally gated to gameState 'upcoming' only (mirroring
  // buildTooltipLines' own projection-vs-real-number split), but per
  // user feedback recent form is useful context regardless of whether
  // THIS gameweek has started for the tapped player -- removed that gate
  // (see buildLast5Section below); a live/finished player just also gets
  // this section now, same as an upcoming one.
  //
  // Row format: opponent abbreviation (e.g. "@ NEW" away, "vs HUL" home --
  // last5.js's own `opponent` column already carries the "@" convention;
  // this just adds the "vs" counterpart for a home game so the row reads
  // unambiguously either way) + the color-coded FPts for that game, e.g.
  // "@ NEW (+4.5)". Deliberately NOT the date -- per the user's own
  // example format ("ARS (+6.5)") and "keep rows compact" ask, opponent is
  // the more useful compact identifier here than a bare date once the
  // section itself is already titled "Recent performances".

  function formatRecentOpponent(oppText) {
    const trimmed = (oppText || '').trim();
    if (!trimmed) return '';
    if (trimmed.charAt(0) === '@') return `@ ${trimmed.slice(1).trim()}`;
    return `vs ${trimmed}`;
  }

  // Three distinct outcomes, three distinct renderings -- never a silently
  // absent section. `rows === null` is a failed fetch (last5.js throws on
  // Fantrax's rate-limit response rather than caching it, so a re-tap
  // genuinely does retry -- hence the retry wording); an empty array is a
  // player who really has no games on record yet (early-season signings,
  // and confirmed live: Fantrax's own player card shows them no "Recent
  // Games" table at all). Those two used to render identically -- as
  // nothing -- which is what made a rate-limited player look like a broken
  // feature instead of a transient hiccup.
  function buildLast5Message(text) {
    const row = document.createElement('div');
    row.className = 'fxm-action-menu__last5-row fxm-action-menu__last5-row--muted';
    row.textContent = text;
    return row;
  }

  function renderLast5Rows(rows) {
    const nodes = [];
    const title = document.createElement('div');
    title.className = 'fxm-action-menu__last5-title';
    title.textContent = 'Recent performances';
    nodes.push(title);
    if (!rows) {
      nodes.push(buildLast5Message('Couldn’t load — tap again to retry'));
      return nodes;
    }
    if (!rows.length) {
      nodes.push(buildLast5Message('No games played yet'));
      return nodes;
    }
    rows.forEach((g) => {
      const row = document.createElement('div');
      row.className = 'fxm-action-menu__last5-row';
      const ptsText = g.fpts !== '' && g.fpts != null ? FXM.formatSigned(g.fpts) : '0';
      const oppText = formatRecentOpponent(g.opponent) || g.date || ''; // date is a fallback label if opponent is ever missing
      FXShared.renderStatLine(row, { text: oppText, pts: ptsText });
      nodes.push(row);
    });
    return nodes;
  }

  // Re-renders the last-5 block INSIDE WHATEVER the current menu is,
  // rather than a captured element reference -- by the time last5.js's
  // fetch resolves, reapplyActionMenu may already have rebuilt the stats
  // section (a live-score re-render, or the user tapping a DIFFERENT
  // player entirely) one or more times, so a stale reference could easily
  // be updating a detached node nobody sees, or worse, painting a
  // previous player's fetched data into whatever's now open for someone
  // else. Guards on state.actionMenuIdentity still matching `name` before
  // touching anything.
  // `side` (not just `name`) must still match -- last5.js's cache is keyed
  // by `teamId|name` precisely to keep two same-named players on OPPOSITE
  // sides of the same matchup from ever sharing a slot; checking only
  // `name` here would let a stale promise for "the other side's Smith"
  // paint into a menu now open for a DIFFERENT Smith.
  function refreshLast5UI(name, side, rows) {
    if (!state.actionMenuEl || !state.actionMenuIdentity) return;
    if (state.actionMenuIdentity.name !== name || state.actionMenuIdentity.side !== side) return;
    const container = state.actionMenuEl.querySelector('.fxm-action-menu__last5');
    if (!container) return; // stats section may have been rebuilt without one (shouldn't happen now that this is unconditional, but stays defensive)
    container.innerHTML = '';
    // renderLast5Rows always returns nodes now (it renders its own "no
    // games"/"couldn't load" message), so the section stays put instead of
    // vanishing and leaving the user unable to tell empty from broken.
    renderLast5Rows(rows).forEach((n) => container.appendChild(n));
  }

  // `side` resolves to this matchup's own fantasy teamId (state.js's
  // homeTeamId/awayTeamId, refreshed every render()) -- last5.js's
  // resolveScorerId needs it as the tiebreak scope for an abbreviated
  // ("S. Lammens") name match (see that file's header comment for the
  // full diagnosis of why this exists at all: a plain exact-name lookup
  // only ever matched a minority of players). Synchronous: shows the
  // cached rows immediately if last5.js already has them, otherwise a
  // "loading…" placeholder that refreshLast5UI (above) swaps out once the
  // fetch resolves. Mirrors buildStatsSection's own null-means-skip-me
  // contract.
  //
  // Gated to players whose own game hasn't been played yet. On a
  // HISTORICAL matchup every game is finished, and the most recent
  // performance IS the game whose score is already on the card being
  // tapped -- so the section just restated what the user was looking at,
  // which read as a duplicate. Recent form answers "will they do
  // anything?", a question that only exists before kickoff; afterwards
  // the real number has replaced it. Same rule the roster's own menu
  // uses (there via `locked`), so the two features behave alike.
  function buildLast5Section(p, side) {
    if (FXM.gameState(p.gameText) !== 'upcoming') return null;
    const teamId = side === 'home' ? state.homeTeamId : state.awayTeamId;
    const container = document.createElement('div');
    container.className = 'fxm-action-menu__last5';
    const cached = FXShared.peekLast5(p.name, teamId);
    if (cached !== undefined) {
      renderLast5Rows(cached).forEach((n) => container.appendChild(n));
    } else {
      const loading = document.createElement('div');
      loading.className = 'fxm-action-menu__last5-title fxm-action-menu__last5-title--loading';
      loading.textContent = 'Recent performances: loading…';
      container.appendChild(loading);
      FXShared.getLast5(p.name, teamId).then((rows) => refreshLast5UI(p.name, side, rows));
    }
    return container;
  }

  function onDocClick(e) {
    if (state.actionMenuEl && !state.actionMenuEl.contains(e.target)) closeActionMenu();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') closeActionMenu();
  }

  // Removes the "this is the selected one, don't dim me" marker from
  // whatever card currently carries it (there's ever only one). Called
  // before marking a NEW card in openActionMenu (in case the menu is
  // re-opened on a different player without an intervening render() --
  // renderCard only ever ADDS this class at creation time, so nothing else
  // would otherwise clear a stale one off the OLD card's still-live node)
  // and unconditionally in closeActionMenu, so no stray marker survives
  // into whatever gets tapped/rendered next.
  function clearMenuSelectedMark() {
    qa('.fxm-card--menu-selected', state.container || document).forEach((c) => c.classList.remove('fxm-card--menu-selected'));
  }

  function closeActionMenu() {
    if (state.actionMenuEl) {
      state.actionMenuEl.remove();
      state.actionMenuEl = null;
    }
    // Single choke point for every close path (tap-outside via onDocClick,
    // Escape via onKeydown, picking a menu item, or the anchor player
    // genuinely disappearing from the lineup -- see reapplyActionMenu's
    // "not found" branch below) -- tearing down the scroll-tracker and
    // clearing the dimming here means none of those callers need to
    // remember to do it themselves. Removing `.fxm-matchup--menu-open`
    // turns dimming off instantly for every EXISTING `.fxm-card` via
    // matchup.css's descendant selector (see that rule's own comment for
    // why this is container-level, not a per-card class this file loops
    // over) -- clearMenuSelectedMark then just tidies up the now-inert
    // `--menu-selected` marker so it can't linger onto whatever's tapped
    // next. Both are no-ops when the menu was opened via the desktop
    // (fine-pointer) path, since only the coarse-pointer path below ever
    // sets them. Keyed 'fxm-menu' -- distinct from render.js's own
    // 'fxm'-keyed tooltip tracker -- so the two can never step on each
    // other even though, in practice, only one of {tooltip, menu} is ever
    // open on touch at a time (see openActionMenu's FXM.hideTooltip() call
    // below).
    FXShared.stopTrackingAnchor('fxm-menu');
    if (state.container) state.container.classList.remove('fxm-matchup--menu-open');
    clearMenuSelectedMark();
    document.removeEventListener('click', onDocClick, true);
    document.removeEventListener('keydown', onKeydown, true);
    state.actionMenuIdentity = null;
  }

  // Desktop (fine-pointer) positioning only -- raw click coordinates,
  // clamped to the viewport. Identical math to pitch-editor/
  // action-menu.js's positionMenu; not shared since it's a handful of
  // lines and each feature already keeps its own copy of the sibling
  // anchoring/positioning logic (see render.js's positionTooltip).
  function positionMenu(menu, x, y) {
    const rect = menu.getBoundingClientRect();
    let left = x;
    let top = y;
    if (left + rect.width > window.innerWidth - 8) left = window.innerWidth - rect.width - 8;
    if (top + rect.height > window.innerHeight - 8) top = window.innerHeight - rect.height - 8;
    menu.style.left = `${Math.max(4, left)}px`;
    menu.style.top = `${Math.max(4, top)}px`;
  }

  // `side` ('home'/'away', threaded down from render.js) is required --
  // every action above needs it to pick the right cell out of a shared row
  // (see findScoringCell). `x`/`y` are only used on the desktop
  // (fine-pointer) path; the coarse-pointer path anchors to `card` itself
  // instead (see below), same split as pitch-editor's openActionMenu.
  function openActionMenu(card, p, side, x, y) {
    closeActionMenu();
    // Closes any open hover tooltip before the menu takes over -- mirrors
    // pitch-editor/action-menu.js's FXP.hideCardTip() call. Mostly matters
    // on desktop (a mouse can hover a card, showing its tooltip, then
    // click it); on touch the tooltip is never open in the first place any
    // more (see attachHoverTooltip's tap handler in render.js), so this is
    // a harmless no-op there.
    FXM.hideTooltip();

    const menu = document.createElement('div');
    menu.className = 'fxm-action-menu';
    const coarse = isCoarsePointer();

    if (coarse) {
      const statsSection = buildStatsSection(p);
      if (statsSection) menu.appendChild(statsSection);
      const last5Section = buildLast5Section(p, side);
      if (last5Section) menu.appendChild(last5Section);
      if (statsSection || last5Section) {
        const divider = document.createElement('div');
        divider.className = 'fxm-action-menu__divider';
        menu.appendChild(divider);
      }
    }

    buildMenuItems(p, side).forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fxm-action-menu__item' + (item.danger ? ' fxm-action-menu__item--danger' : '');
      btn.textContent = item.label;
      if (item.title) btn.title = item.title;
      if (item.disabled) {
        btn.disabled = true;
        btn.classList.add('fxm-action-menu__item--disabled');
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
      // Anchor to the CARD (mirrors pitch-editor's action menu) rather
      // than raw tap coordinates, so the menu never covers the tapped
      // player. FXShared.trackAnchor keeps it stuck to the card through a
      // scroll, closing the menu if the card goes stale mid-scroll with no
      // render() to fix it up first.
      const reposition = () => FXShared.anchorToElement(menu, card, { gap: 8, margin: 8 });
      reposition();
      FXShared.trackAnchor('fxm-menu', {
        overlayEl: menu,
        targetEl: card,
        isVisible: () => !!state.actionMenuEl,
        onReposition: reposition,
        onStale: closeActionMenu,
      });
      // Dim every other player card (both teams, pitch and bench) so it's
      // unambiguous which one this menu belongs to -- container-level (see
      // matchup.css's `.fxm-matchup--menu-open .fxm-card` rule for the
      // full "why", including the flicker bug this replaced): setting one
      // class on the (persistent-across-renders) container dims every
      // EXISTING `.fxm-card` via CSS alone, and clearMenuSelectedMark +
      // marking `card` itself here is what exempts the tapped one. A card
      // created LATER by a live-score re-render gets the same treatment
      // for free from renderCard (render.js), which checks
      // state.actionMenuIdentity (set right below) at creation time --
      // no JS loop needed after the fact, so a fresh card is never
      // undimmed even for a single frame.
      clearMenuSelectedMark();
      card.classList.add('fxm-card--menu-selected');
      if (state.container) state.container.classList.add('fxm-matchup--menu-open');
      // Identity (not a DOM node reference), e.g. { side: 'home', isBench:
      // false, name: 'Erling Haaland' } -- render.js tears down and
      // rebuilds EVERY `.fxm-card` node on every re-render (live scoring
      // updates trigger that MUCH more often than roster's own re-renders,
      // sometimes under a second after opening this menu), which would
      // otherwise detach `card` out from under the menu and read to the
      // user as the menu "immediately fading back up" right after they tap
      // -- confirmed live. reapplyActionMenu below (called from the end of
      // render(), mirroring the old tooltip's reapplySelection) uses this
      // identity to re-anchor the menu to the SAME player's freshly-built
      // card; renderCard uses this SAME identity to mark that same fresh
      // card `--menu-selected` at creation, which is what actually keeps
      // the dimming glitch-free across a rebuild (see that rule's comment).
      // Fine-pointer opens never set this (positionMenu's fixed x/y
      // doesn't depend on the card surviving a rebuild, and dimming is
      // coarse-pointer only), so reapplyActionMenu is naturally a no-op
      // for those.
      state.actionMenuIdentity = { side, isBench: card.dataset.bench === '1', name: p.name };
    } else {
      positionMenu(menu, x, y);
    }

    // Deferred so the click/tap that opened the menu doesn't immediately
    // close it via onDocClick.
    setTimeout(() => {
      document.addEventListener('click', onDocClick, true);
      document.addEventListener('keydown', onKeydown, true);
    }, 0);
  }

  // Looks up the player object matching a state.actionMenuIdentity (see
  // openActionMenu) inside `data`, the same parsed structure render()'s
  // renderField/renderBenchSide just built the fresh cards from -- so if a
  // card with that identity exists in the just-rendered DOM, this is
  // guaranteed to find its matching player object too. Used by
  // reapplyActionMenu below. Literal port of the old render.js
  // findPlayerByIdentity (removed when the touch tooltip's own
  // identity-tracking was replaced by this menu) -- needed again here for
  // the exact same reason it existed there.
  function findPlayerByIdentity(data, identity) {
    if (!identity) return null;
    const sideData = data[identity.side];
    if (!sideData) return null;
    const list = identity.isBench ? sideData.reserves : FXM.POS_ORDER.flatMap((pos) => sideData.starters[pos]);
    return list.find((p) => p.name === identity.name) || null;
  }

  // Called from the end of render() (mirroring the old tooltip's
  // reapplySelection call) every time the matchup pitch's cards get torn
  // down and rebuilt from a live-score-driven re-render. Without this, an
  // open menu's `card`/`targetEl` goes stale the instant that happens --
  // which live testing showed can be under a second after opening -- and
  // reads to the user as the menu immediately closing/repositioning wrong
  // right after their tap, even though they haven't touched anything.
  //
  // NOTE what this does NOT do any more: touch dimming. That used to be
  // re-applied here too (a `FXShared.selectAndDim` call at the end), but
  // doing it AFTER render() already painted a fresh, undimmed batch of
  // cards is exactly what caused a visible flicker on every OTHER player's
  // card on every live-score re-render (matchup.css's
  // `.fxm-matchup--menu-open` rule + render.js's renderCard now handle
  // dimming a freshly-created card from its very first paint instead --
  // see that rule's own comment for the full story). This function only
  // has to worry about the menu ELEMENT itself.
  //
  // Found: re-anchor the SAME `state.actionMenuEl` (never torn down/
  // recreated -- only its position and stats content update) to the
  // freshly-built card, and refresh its stats section with this render's
  // newest numbers (live scoring keeps changing while the menu sits open).
  // The action buttons are left untouched: their closures only ever
  // capture `p.name`/`side` (stable player identity), never the `p` object
  // itself, so they stay correct without rebuilding -- rebuilding the
  // whole menu on every re-render (some matchups re-render multiple times
  // a second) would otherwise flicker the buttons for no reason.
  //
  // Not found (player genuinely no longer in the lineup/data at all -- a
  // real edge case, e.g. a sub) -- close the menu, same as any other
  // stale-target close.
  function reapplyActionMenu(data, root) {
    const identity = state.actionMenuIdentity;
    if (!identity || !state.actionMenuEl) return;
    const match = qa('.fxm-card', root).find(
      (c) => c.dataset.side === identity.side && (c.dataset.bench === '1') === identity.isBench && c.dataset.name === identity.name
    );
    const p = match && findPlayerByIdentity(data, identity);
    if (!match || !p) {
      closeActionMenu();
      return;
    }

    const menu = state.actionMenuEl;
    const oldStats = menu.querySelector('.fxm-action-menu__stats');
    if (oldStats) {
      const freshStats = buildStatsSection(p);
      if (freshStats) oldStats.replaceWith(freshStats);
    }
    // Same idea for the last-5 block -- if it's already cached this is a
    // cheap synchronous re-render (no new fetch); if it's still loading,
    // buildLast5Section calls FXShared.getLast5 again, but that just returns
    // the SAME in-flight promise (last5.js dedupes per player) and attaches
    // one more harmless, identity-guarded refreshLast5UI callback to it.
    const oldLast5 = menu.querySelector('.fxm-action-menu__last5');
    if (oldLast5) {
      const freshLast5 = buildLast5Section(p, identity.side);
      if (freshLast5) oldLast5.replaceWith(freshLast5);
      else oldLast5.remove();
    }

    const reposition = () => FXShared.anchorToElement(menu, match, { gap: 8, margin: 8 });
    reposition();
    FXShared.trackAnchor('fxm-menu', {
      overlayEl: menu,
      targetEl: match,
      isVisible: () => !!state.actionMenuEl,
      onReposition: reposition,
      onStale: closeActionMenu,
    });
  }

  FXM.openActionMenu = openActionMenu;
  FXM.closeActionMenu = closeActionMenu;
  FXM.triggerCellAction = triggerCellAction;
  FXM.reapplyActionMenu = reapplyActionMenu;
})(window.FXM);

// ---- src/matchup/main.js ----
/**
 * Prettier Fantrax -- Matchup Pitch: boot / keep in sync with live updates
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
 * Prettier Fantrax -- Mobile: on-page diagnostics badge
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
