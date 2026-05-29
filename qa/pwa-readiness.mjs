/**
 * PWA readiness audit against production build output.
 * Run: node qa/pwa-readiness.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, '..', 'dist');

const findings = { pass: [], fail: [], warn: [] };

function pass(msg) {
  findings.pass.push(msg);
}
function fail(msg) {
  findings.fail.push(msg);
}
function warn(msg) {
  findings.warn.push(msg);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

if (!fs.existsSync(dist)) {
  console.error('dist/ missing — run npm run build first');
  process.exit(1);
}

// Manifest
const manifestPath = path.join(dist, 'manifest.webmanifest');
if (!fs.existsSync(manifestPath)) {
  fail('manifest.webmanifest missing from dist');
} else {
  const manifest = readJson(manifestPath);
  if (manifest.name === 'PawStreak') pass('manifest.name = PawStreak');
  else fail(`manifest.name = ${manifest.name}`);

  if (manifest.short_name === 'PawStreak') pass('manifest.short_name = PawStreak');
  else fail(`manifest.short_name = ${manifest.short_name}`);

  if (manifest.start_url === '/app' || manifest.start_url?.startsWith('/app')) pass('manifest.start_url → /app');
  else fail(`manifest.start_url = ${manifest.start_url}`);

  if (manifest.scope === '/' || manifest.scope === '') pass('manifest.scope = /');
  else warn(`manifest.scope = ${manifest.scope}`);

  if (manifest.display === 'standalone') pass('manifest.display = standalone');
  else fail(`manifest.display = ${manifest.display}`);

  if (manifest.theme_color) pass(`manifest.theme_color = ${manifest.theme_color}`);
  else fail('manifest.theme_color missing');

  if (manifest.background_color) pass(`manifest.background_color = ${manifest.background_color}`);
  else fail('manifest.background_color missing');

  const icons = manifest.icons ?? [];
  const has192 = icons.some((i) => i.sizes === '192x192');
  const has512 = icons.some((i) => i.sizes === '512x512');
  if (has192 && has512) pass('manifest icons include 192x192 and 512x512');
  else fail('manifest missing required icon sizes');
}

// Service worker
const swPath = path.join(dist, 'sw.js');
if (fs.existsSync(swPath)) {
  pass('sw.js present in dist');
  const sw = fs.readFileSync(swPath, 'utf8');
  if (sw.includes('precacheAndRoute') || sw.includes('workbox')) pass('sw.js uses Workbox');
  else warn('sw.js may not use Workbox precaching');
} else {
  fail('sw.js missing — Android install criteria will fail');
}

const workboxFiles = fs.readdirSync(dist).filter((f) => f.startsWith('workbox-') && f.endsWith('.js'));
if (workboxFiles.length) pass(`workbox runtime: ${workboxFiles[0]}`);
else warn('no workbox-*.js in dist');

// Icons on disk
for (const icon of [
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'apple-touch-icon.png',
]) {
  const p = path.join(dist, icon);
  if (fs.existsSync(p)) pass(`${icon} in dist`);
  else fail(`${icon} missing from dist`);
}

// index.html meta
const indexHtml = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
if (indexHtml.includes('manifest.webmanifest')) pass('index.html links manifest');
else fail('index.html missing manifest link');

if (indexHtml.includes('apple-mobile-web-app-capable')) pass('apple-mobile-web-app-capable meta');
else fail('apple-mobile-web-app-capable missing');

if (indexHtml.includes('apple-mobile-web-app-title')) pass('apple-mobile-web-app-title meta');
else fail('apple-mobile-web-app-title missing');

if (indexHtml.includes('apple-touch-icon')) pass('apple-touch-icon link');
else fail('apple-touch-icon missing');

if (indexHtml.includes('registerSW') || indexHtml.includes('virtual:pwa-register')) {
  pass('PWA registration bundled in index');
} else if (fs.readFileSync(path.join(dist, 'assets', fs.readdirSync(path.join(dist, 'assets')).find((f) => f.endsWith('.js')) || ''), 'utf8').includes('serviceWorker')) {
  pass('service worker registration in JS bundle');
} else {
  warn('could not confirm SW registration in HTML (check main bundle)');
}

// Supabase network-only check in sw
if (fs.existsSync(swPath)) {
  const sw = fs.readFileSync(swPath, 'utf8');
  if (sw.includes('supabase') || sw.includes('NetworkOnly')) pass('SW appears to avoid caching Supabase (NetworkOnly)');
  else warn('verify Supabase routes use NetworkOnly in vite.config Workbox runtimeCaching');
}

console.log('\n=== PWA Readiness Report ===\n');
console.log(`PASS (${findings.pass.length}):`);
findings.pass.forEach((m) => console.log(`  ✓ ${m}`));
if (findings.warn.length) {
  console.log(`\nWARN (${findings.warn.length}):`);
  findings.warn.forEach((m) => console.log(`  ⚠ ${m}`));
}
if (findings.fail.length) {
  console.log(`\nFAIL (${findings.fail.length}):`);
  findings.fail.forEach((m) => console.log(`  ✗ ${m}`));
  process.exit(1);
}
console.log('\nAll critical checks passed.\n');
