#!/usr/bin/env node
/**
 * Push EXPO_PUBLIC_* vars to EAS Environment Variables for a given environment.
 *
 * Local `.env` is for `expo start` only (LAN API + shared Maps key).
 * Production/preview API + platform Maps keys should already live on EAS.
 *
 * This script refuses to push a localhost/LAN API URL to preview|production
 * so a local .env cannot overwrite https://api.dahabi-sudan.com/api.
 *
 * Usage:
 *   npm run env:push:preview
 *   npm run env:push:production
 *   node scripts/push-eas-env.cjs development
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

function isLocalApiUrl(value) {
  try {
    const { hostname } = new URL(value);
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    );
  } catch {
    return false;
  }
}

loadDotEnv();

const eas = require(path.join(__dirname, '..', 'eas.json'));
const env = { ...(eas.build?.[environment]?.env ?? {}) };

for (const name of [
  'EXPO_PUBLIC_API_URL',
  'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY',
  'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID',
  'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS',
  'EXPO_PUBLIC_S3_PUBLIC_BASE_URL',
]) {
  const value = process.env[name]?.trim();
  if (value) env[name] = value;
}

// Never overwrite production/preview API with a LAN/dev URL from local .env.
if (
  (environment === 'production' || environment === 'preview') &&
  env.EXPO_PUBLIC_API_URL &&
  isLocalApiUrl(env.EXPO_PUBLIC_API_URL)
) {
  console.warn(
    `Skipping EXPO_PUBLIC_API_URL for "${environment}" — local/LAN URL detected (${env.EXPO_PUBLIC_API_URL}).`,
  );
  console.warn(
    'Keep production API on EAS as https://api.dahabi-sudan.com/api (set it in the Expo dashboard).',
  );
  delete env.EXPO_PUBLIC_API_URL;
}

const entries = Object.entries(env).filter(([key]) => key.startsWith('EXPO_PUBLIC_'));
if (entries.length === 0) {
  console.error(
    `No EXPO_PUBLIC_* keys to push for "${environment}". Set them in .env or process env first.`,
  );
  process.exit(1);
}

if (!env.EXPO_PUBLIC_API_URL && environment === 'development') {
  console.warn('Warning: EXPO_PUBLIC_API_URL not set for development.');
}
if (
  !env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID &&
  !env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS &&
  !env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
) {
  console.warn(
    'Warning: no Google Maps API key set — Maps will not work until ANDROID/IOS (or shared) keys are on EAS.',
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

console.log(
  `Done. OTA publishes can use: eas update --channel ${environment} --environment ${environment}`,
);
