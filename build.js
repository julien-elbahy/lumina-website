#!/usr/bin/env node
/**
 * Lumina SEO — Build Script
 * 
 * Reads HTML source files containing partial markers:
 *   <!-- NAV -->          → injects nav-{lang}.html with correct lang-switch URL
 *   <!-- MOBILE_MENU -->  → injects mobile-{lang}.html
 *   <!-- FOOTER -->       → injects footer-{lang}.html
 *   <!-- CONSENT -->      → injects consent-{lang}.html
 *   <!-- SHARED_JS -->    → injects shared-js.html (theme, burger, FAQ)
 * 
 * Copies all non-HTML assets (fonts, images, CSS, etc.) to dist/.
 * Output: dist/ directory ready for Cloudflare Pages deployment.
 * 
 * Usage: node build.js
 */

const fs = require('fs');
const path = require('path');

const SRC = __dirname;
const DIST = path.join(__dirname, 'dist');
const PARTIALS = path.join(__dirname, '_partials');

// Directories to skip (not copied to dist)
const SKIP_DIRS = new Set(['dist', 'node_modules', '.git', '_partials']);

// ── Load Partials ──
function loadPartial(name) {
  return fs.readFileSync(path.join(PARTIALS, name), 'utf8');
}

const partials = {
  'nav-en': loadPartial('nav-en.html'),
  'nav-de': loadPartial('nav-de.html'),
  'mobile-en': loadPartial('mobile-en.html'),
  'mobile-de': loadPartial('mobile-de.html'),
  'footer-en': loadPartial('footer-en.html'),
  'footer-de': loadPartial('footer-de.html'),
  'consent-en': loadPartial('consent-en.html'),
  'consent-de': loadPartial('consent-de.html'),
  'shared-js': loadPartial('shared-js.html'),
};

// ── Detect language from file path ──
function getLang(filePath) {
  const rel = path.relative(SRC, filePath);
  return rel.startsWith('de/') || rel.startsWith('de\\') ? 'de' : 'en';
}

// ── Extract alternate-language URL from hreflang tags ──
function getLangSwitchUrl(html, lang) {
  // For EN pages, find the DE hreflang URL. For DE, find EN.
  const targetLang = lang === 'en' ? 'de' : 'en';
  const re = new RegExp(`hreflang="${targetLang}"\\s+href="([^"]+)"`, 'i');
  const m = html.match(re);
  if (m) {
    // Return path only (strip domain)
    return m[1].replace('https://lumina-seo.com', '');
  }
  // Fallback
  return lang === 'en' ? '/de/' : '/';
}

// ── Process one HTML file ──
function processHtml(srcPath) {
  let html = fs.readFileSync(srcPath, 'utf8');
  const lang = getLang(srcPath);
  const langUrl = getLangSwitchUrl(html, lang);

  // Replace markers
  html = html.replace('<!-- NAV -->', partials[`nav-${lang}`].replace('{{LANG_URL}}', langUrl));
  html = html.replace('<!-- MOBILE_MENU -->', partials[`mobile-${lang}`]);
  html = html.replace('<!-- FOOTER -->', partials[`footer-${lang}`]);
  html = html.replace('<!-- CONSENT -->', partials[`consent-${lang}`]);
  html = html.replace('<!-- SHARED_JS -->', partials['shared-js']);

  return html;
}

// ── Recursively copy directory ──
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    // Skip build.js itself
    if (entry.name === 'build.js') continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.name.endsWith('.html')) {
      // Process HTML files through partial injection
      const output = processHtml(srcPath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, output);
    } else {
      // Copy non-HTML files as-is
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ── Main ──
console.log('🔨 Building Lumina SEO website...');

// Clean dist
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true });
}

copyDir(SRC, DIST);

// Count outputs
let htmlCount = 0;
function countHtml(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) countHtml(path.join(dir, e.name));
    else if (e.name.endsWith('.html')) htmlCount++;
  }
}
countHtml(DIST);

console.log(`✅ Built ${htmlCount} HTML files → dist/`);
console.log('   Partials injected: NAV, MOBILE_MENU, FOOTER, CONSENT, SHARED_JS');
