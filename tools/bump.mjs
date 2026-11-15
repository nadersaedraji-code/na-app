/**
 * Bump the app version everywhere it matters, and add a release note.
 *
 *   node tools/bump.mjs 1.2.0 "What changed, in one sentence"
 *
 * This is what makes a change reach the phones: the service worker
 * compares its own VERSION, installs the new shell, tells the open
 * page, and the page refreshes once with a quiet "Updated" toast.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const version = process.argv[2];
const note = process.argv[3] || 'Small improvements.';

if (!/^\d+\.\d+\.\d+$/.test(version || '')) {
  console.error('Usage: node tools/bump.mjs <major.minor.patch> "note"');
  process.exit(1);
}

const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// app.js — version constant + release notes
const appPath = path.join(root, 'app.js');
let app = fs.readFileSync(appPath, 'utf8');
app = app.replace(
  /const APP_VERSION = '[^']+';/,
  `const APP_VERSION = '${version}';`
);
const entry = `  { v: '${version}', at: '${today}', notes: ${JSON.stringify(note)} },\n`;
if (!app.includes(`v: '${version}'`)) {
  app = app.replace('const RELEASES = [\n', `const RELEASES = [\n${entry}`);
}
fs.writeFileSync(appPath, app);

// sw.js — cache version
const swPath = path.join(root, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace(/const VERSION = '[^']+';/, `const VERSION = '${version}';`);
fs.writeFileSync(swPath, sw);

console.log(`N&A is now v${version} — “${note}”`);
