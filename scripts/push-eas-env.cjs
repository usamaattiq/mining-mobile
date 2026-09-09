#!/usr/bin/env node
/**
 * Push EXPO_PUBLIC_* vars from eas.json build profiles to EAS Environment Variables.
 * Also pushes platform Maps keys from process env or local .env (never in eas.json).
 *
 * Usage:
 *   node scripts/push-eas-env.cjs production   # reads .env if present
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const environment = process.argv[2];
if (!environment || !['production', 'preview', 'development'].includes(environment)) {
  console.error('Usage: node scripts/push-eas-env.cjs <production|preview|development>');
  process.exit(1);
}

function loadDotEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

const eas = require(path.join(__dirname, '..', 'eas.json'));
const env = { ...(eas.build?.[environment]?.env ?? {}) };

for (const name of ['EXPO_PUBLIC_GOOGLE_MAPS_API_KEY']) {
  const value = process.env[name]?.trim();
  if (value) env[name] = value;
}

const entries = Object.entries(env).filter(([key]) => key.startsWith('EXPO_PUBLIC_'));
if (entries.length === 0) {
  console.error(`No EXPO_PUBLIC_* keys to push for "${environment}"`);
  process.exit(1);
}

if (!env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY) {
  console.warn(
    'Warning: EXPO_PUBLIC_GOOGLE_MAPS_API_KEY not set in process env or .env — Maps key will not be updated on EAS.',
  );
}

for (const [name, value] of entries) {
  console.log(`Setting ${name} on EAS environment "${environment}"…`);
  execFileSync(
    'eas',
    [
      'env:set',
      '--name',
      name,
      '--value',
      String(value),
      '--environment',
      environment,
      '--visibility',
      'plaintext',
      '--non-interactive',
    ],
    { stdio: 'inherit' },
  );
}

console.log(`Done. OTA publishes can use: eas update --environment ${environment}`);
