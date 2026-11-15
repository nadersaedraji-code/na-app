/**
 * Publish N&A to GitHub Pages.
 *
 *   GITHUB_TOKEN=ghp_xxx GITHUB_REPO=nader/na-app node tools/deploy.mjs
 *
 * The token needs "Contents: read and write" on the repo (and
 * "Administration" + "Pages" if the repo does not exist yet).
 * Running this again publishes the current folder as a new commit —
 * that is how a change here reaches the phones.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPO;

if (!token) {
  console.error('Missing GITHUB_TOKEN. Create a token, then:\n  GITHUB_TOKEN=... GITHUB_REPO=you/repo node tools/deploy.mjs');
  process.exit(1);
}
if (!repo || !repo.includes('/')) {
  console.error('Missing GITHUB_REPO (owner/name).');
  process.exit(1);
}

const [owner, name] = repo.split('/');
const api = 'https://api.github.com';
const call = async (method, url, body) => {
  const res = await fetch(api + url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'na-app-deploy',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* not json */ }
  return { ok: res.ok, status: res.status, json, text };
};

const git = (...args) =>
  execFileSync('git', args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();

// 1. who are we
const me = await call('GET', '/user');
if (!me.ok) {
  console.error(`Token rejected (${me.status}). Check that it is valid and not expired.`);
  process.exit(1);
}
console.log(`Signed in as ${me.json.login}`);

// 2. repository
const found = await call('GET', `/repos/${owner}/${name}`);
if (found.status === 404) {
  console.log(`Creating ${owner}/${name}…`);
  const created = await call('POST', '/user/repos', {
    name,
    description: 'N&A — a quiet space for two',
    private: false,
    auto_init: false,
  });
  if (!created.ok) {
    console.error(`Could not create the repo (${created.status}): ${created.text.slice(0, 300)}`);
    process.exit(1);
  }
} else if (!found.ok) {
  console.error(`Could not read the repo (${found.status}).`);
  process.exit(1);
} else {
  console.log(`Using ${owner}/${name}`);
}

// 3. commit and push
if (!fs.existsSync(path.join(root, '.git'))) {
  git('init', '-b', 'main');
}
git('config', 'user.name', 'N&A');
git('config', 'user.email', `${me.json.login}@users.noreply.github.com`);
git('add', '-A');
try {
  git('commit', '-m', `N&A ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`);
} catch {
  console.log('Nothing new to commit.');
}
const remote = `https://x-access-token:${token}@github.com/${owner}/${name}.git`;
try { git('remote', 'remove', 'origin'); } catch { /* no remote yet */ }
git('remote', 'add', 'origin', remote);
try {
  git('push', '-u', 'origin', 'main');
} catch {
  // The repo already had commits (a README, say). Publish over it.
  git('push', '-u', 'origin', 'main', '--force');
}
git('remote', 'set-url', 'origin', `https://github.com/${owner}/${name}.git`);
console.log('Pushed main.');

// 4. Pages
const pages = await call('POST', `/repos/${owner}/${name}/pages`, {
  source: { branch: 'main', path: '/' },
});
if (pages.ok) {
  console.log('GitHub Pages enabled.');
} else if (pages.status === 409) {
  console.log('GitHub Pages already enabled.');
} else {
  console.log(`Pages could not be enabled automatically (${pages.status}).`);
  console.log(`Turn it on at https://github.com/${owner}/${name}/settings/pages — source: main / root.`);
}

const url = me.json.login.toLowerCase() === owner.toLowerCase()
  ? `https://${owner}.github.io/${name}/`
  : `https://${owner}.github.io/${name}/`;
console.log(`\nLive (first build takes about a minute):\n  ${url}`);
