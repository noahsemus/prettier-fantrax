/**
 * Prettier Fantrax -- build the userscript bundle
 * ---------------------------------------------------------------------
 * Emits prettier-fantrax.user.js at the repo root: the same
 * manifest-ordered content-script bundle mobile/build-inject.js produces
 * for the phone app's WebView, wrapped in a userscript metadata block.
 * This is the free iOS path -- the open-source "Userscripts" Safari
 * extension (App Store) runs it in real Safari on iPhone/iPad/Mac, with
 * no Apple Developer account, sideloading, or 7-day expiry involved.
 *
 * Differences from the WebView bundle: no mobile/diagnostics.js (that
 * badge is WebView-specific) and no FX_DIAGNOSTICS flag it would read.
 * The one extension API the content scripts touch (chrome.runtime in
 * src/shared/lineup-alerts.js) already no-ops when it's absent, so the
 * body needs no shims -- in a userscript the lineup warning is the
 * on-pitch banner only, with no system notification.
 *
 * @version comes from manifest.json, so a release only bumps it in one
 * place. @updateURL/@downloadURL point at this file's raw URL on main --
 * raw.githubusercontent.com serves it as text, which is what the
 * Userscripts app's tap-to-install flow needs (a release-asset URL
 * force-downloads instead) -- so the built file is committed, like
 * mobile/injected.js. Run with `node build-userscript.js` from anywhere
 * (paths resolve relative to this file).
 * ---------------------------------------------------------------------
 */
'use strict';

const fs = require('fs');
const path = require('path');

const {
  REPO_ROOT,
  MANIFEST_PATH,
  collectPaths,
  readRepoFile,
  buildCssInjectionScript,
} = require('./mobile/build-inject.js');

const OUTPUT_PATH = path.join(REPO_ROOT, 'prettier-fantrax.user.js');
const RAW_BASE = 'https://raw.githubusercontent.com/noahsemus/prettier-fantrax/main';

function buildHeader(manifest) {
  const lines = [
    ['@name', manifest.name],
    ['@description', manifest.description],
    ['@version', manifest.version],
    ['@author', 'Noah Semus'],
    ['@homepageURL', 'https://github.com/noahsemus/prettier-fantrax'],
    ['@icon', `${RAW_BASE}/icons/icon48.png`],
    ['@updateURL', `${RAW_BASE}/prettier-fantrax.user.js`],
    ['@downloadURL', `${RAW_BASE}/prettier-fantrax.user.js`],
    ['@match', 'https://www.fantrax.com/*'],
    ['@run-at', 'document-idle'],
    // The extension's content_scripts don't set all_frames, so they run
    // top-frame only; @noframes keeps the userscript's behavior identical.
    ['@noframes', ''],
    ['@grant', 'none'],
  ];

  const pad = Math.max(...lines.map(([key]) => key.length)) + 2;
  return [
    '// ==UserScript==',
    ...lines.map(([key, value]) => `// ${key.padEnd(pad)}${value}`.trimEnd()),
    '// ==/UserScript==',
  ].join('\n');
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const { js, css } = collectPaths(manifest);

  const parts = [buildHeader(manifest) + '\n'];
  parts.push(buildCssInjectionScript(css));
  for (const relPath of js) {
    parts.push(`// ---- ${relPath} ----\n${readRepoFile(relPath)}`);
  }

  const bundle = parts.join('\n');
  fs.writeFileSync(OUTPUT_PATH, bundle, 'utf8');

  const sizeKb = (Buffer.byteLength(bundle, 'utf8') / 1024).toFixed(1);
  console.log(`Built ${path.relative(REPO_ROOT, OUTPUT_PATH)} v${manifest.version} from ${js.length} js + ${css.length} css files.`);
  console.log(`Bundle size: ${sizeKb} KB`);
}

main();
