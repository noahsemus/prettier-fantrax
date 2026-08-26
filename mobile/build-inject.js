/**
 * Prettier Fantrax -- Mobile: build the single injected bundle
 * ---------------------------------------------------------------------
 * The Capacitor shell has no manifest.json / content_scripts mechanism --
 * it just needs one script + one stylesheet to hand to the WebView. This
 * reads the real manifest.json (the extension's authoritative load order)
 * and concatenates every content-script CSS/JS file, in that order, into
 * mobile/injected.js, plus this repo's own mobile/diagnostics.js on the
 * end. The result is copied into both native asset locations. Run with
 * `node build-inject.js` from the mobile/ directory (paths are resolved
 * relative to this file, so cwd doesn't matter).
 * ---------------------------------------------------------------------
 */
'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const MANIFEST_PATH = path.join(REPO_ROOT, 'manifest.json');
const DIAGNOSTICS_PATH = path.join(__dirname, 'diagnostics.js');
const OUTPUT_PATH = path.join(__dirname, 'injected.js');

const NATIVE_ASSET_PATHS = [
  path.join(__dirname, 'ios', 'App', 'App', 'injected.js'),
  path.join(__dirname, 'android', 'app', 'src', 'main', 'assets', 'injected.js'),
];

function collectPaths(manifest) {
  const js = [];
  const css = [];
  const seenJs = new Set();
  const seenCss = new Set();

  for (const entry of manifest.content_scripts || []) {
    for (const rel of entry.js || []) {
      if (seenJs.has(rel)) continue;
      seenJs.add(rel);
      js.push(rel);
    }
    for (const rel of entry.css || []) {
      if (seenCss.has(rel)) continue;
      seenCss.add(rel);
      css.push(rel);
    }
  }

  return { js, css };
}

function readRepoFile(relPath) {
  return fs.readFileSync(path.join(REPO_ROOT, relPath), 'utf8');
}

function buildCssInjectionScript(cssFiles) {
  const combinedCss = cssFiles
    .map((relPath) => `/* ---- ${relPath} ---- */\n${readRepoFile(relPath)}`)
    .join('\n\n');

  // Keep this as a plain string template -- it's emitted verbatim into the
  // bundle, not executed here, so the embedded CSS is just data to it.
  return `(function () {
  'use strict';
  if (document.getElementById('fx-styles')) return;
  var style = document.createElement('style');
  style.id = 'fx-styles';
  style.textContent = ${JSON.stringify(combinedCss)};
  (document.head || document.documentElement).appendChild(style);
})();
`;
}

function buildBundle() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const { js, css } = collectPaths(manifest);

  const parts = [];

  // a) diagnostics flag, read by mobile/diagnostics.js below. OFF by
  //    default: the badge existed because a phone had no console to check
  //    when the selectors drifted, but the app is debuggable over USB now
  //    (chrome://inspect, or CDP against webview_devtools_remote_<pid>),
  //    which is strictly better -- and the badge sits over the site's own
  //    bottom nav, reading as a stray debug popup to anyone just using the
  //    app. Flip to `true` here (or set window.FX_DIAGNOSTICS from a
  //    console) to bring it back for a selector-drift hunt.
  const DIAGNOSTICS_ENABLED = false;
  parts.push(`window.FX_DIAGNOSTICS = ${DIAGNOSTICS_ENABLED};\n`);

  // b) guarded CSS injection
  parts.push(buildCssInjectionScript(css));

  // c) each JS file, in manifest order, with a header comment
  for (const relPath of js) {
    parts.push(`// ---- ${relPath} ----\n${readRepoFile(relPath)}`);
  }

  // d) diagnostics module, last
  const diagnosticsSrc = fs.readFileSync(DIAGNOSTICS_PATH, 'utf8');
  parts.push(`// ---- mobile/diagnostics.js ----\n${diagnosticsSrc}`);

  return { bundle: parts.join('\n'), js, css };
}

function writeOutputs(bundle) {
  fs.writeFileSync(OUTPUT_PATH, bundle, 'utf8');
  for (const dest of NATIVE_ASSET_PATHS) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(OUTPUT_PATH, dest);
  }
}

function main() {
  const { bundle, js, css } = buildBundle();
  writeOutputs(bundle);

  const sizeKb = (Buffer.byteLength(bundle, 'utf8') / 1024).toFixed(1);
  const fileCount = js.length + css.length + 1; // +1 for mobile/diagnostics.js

  console.log(`Built mobile/injected.js from ${fileCount} source files (${js.length} js, ${css.length} css, + diagnostics.js).`);
  console.log(`Bundle size: ${sizeKb} KB`);
  console.log('Output paths:');
  console.log(`  ${path.relative(REPO_ROOT, OUTPUT_PATH)}`);
  for (const dest of NATIVE_ASSET_PATHS) {
    console.log(`  ${path.relative(REPO_ROOT, dest)}`);
  }
}

main();
