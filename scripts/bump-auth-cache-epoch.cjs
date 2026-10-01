#!/usr/bin/env node
/**
 * Bumps EXPO_PUBLIC_AUTH_CACHE_EPOCH in Apex/.env so the next app load
 * wipes rememberedAccount / session secrets after a backend DB reset.
 */
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const key = 'EXPO_PUBLIC_AUTH_CACHE_EPOCH';
const nextEpoch = String(Date.now());

let contents = '';
if (fs.existsSync(envPath)) {
  contents = fs.readFileSync(envPath, 'utf8');
}

const line = `${key}=${nextEpoch}`;
const pattern = new RegExp(`^${key}\\s*=.*$`, 'm');

if (pattern.test(contents)) {
  contents = contents.replace(pattern, line);
} else {
  const needsNewline = contents.length > 0 && !contents.endsWith('\n');
  contents = `${contents}${needsNewline ? '\n' : ''}${line}\n`;
}

fs.writeFileSync(envPath, contents, 'utf8');
console.log(`Bumped ${key}=${nextEpoch} in Apex/.env`);
console.log('Restart Metro (or reload with a fresh bundle) so the app clears its local cache.');
