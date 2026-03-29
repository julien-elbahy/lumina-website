# Lumina Website

## Architecture

- **Static HTML site** — no build system, no framework, no bundler, no package manager
- ~60 HTML files (EN + DE bilingual with hreflang)
- All CSS and JS are **inline** in each HTML file — no shared stylesheets or script files
- Hosted on **Netlify** (auto-deploys from `main` branch)
- **Cloudflare Worker** proxy at `lumina-proxy.julien-elbahy.workers.dev` (code in `worker/lumina-proxy.js`)
- GitHub repo: `julien-elbahy/lumina-website`

## Project Structure

```
/                       → English pages (index.html, about.html, support.html, etc.)
/de/                    → German mirror pages
/tools/                 → 26+ SEO/GEO tools, each in own folder (tools/keyword-research/index.html)
/de/tools/              → German tool mirrors
/blog/                  → Blog articles
/de/blog/               → German blog mirrors
/worker/                → Cloudflare Worker proxy (lumina-proxy.js)
/fonts/                 → Plus Jakarta Sans, JetBrains Mono (WOFF2)
/screenshots/           → Marketing assets
settings.js             → API key management modal (shared across tools)
_headers                → Netlify security/cache headers
_redirects              → Netlify URL redirects
llms.txt                → AI crawler guidance
sitemap.xml             → Sitemap
```

## Development Environment

- **Windows 11** with Git Bash
- **Only Perl 5.38** is available for scripting — no Python, no Node.js, no npm
- Use `perl` for scripting tasks, not Python or Node

## Key Rules

### Deployment
- Merge to `main` and push directly — do NOT create PRs
- Sole developer, Netlify auto-deploys from main

### Bulk Edits (Nav, Footer, CSS variables)
Nav and footer are duplicated in **all 58+ HTML files** (both `/` and `/de/`). For bulk changes:
1. **Always apply to BOTH English AND German pages** — never edit only one language
2. Use `perl -i -pe` with `find -exec` for mass edits
3. **Always use `\r?\n`** in regexes (Windows CRLF line endings)
4. **Test on one file first** without `-i` flag (dry run)
5. Verify with `grep -c` before and after
6. Avoid greedy regexes — a bad regex once deleted the entire mobile menu from all files

### Design System
- CSS variables for theming: `--bg`, `--bg2`, `--card`, `--text`, `--text2`, `--muted`, `--accent`, `--accent-h`, `--accent-soft`, `--accent-glow`, `--border`, `--border-h`, `--ok`, `--warn`, `--err`, `--ok-bg`, `--warn-bg`, `--err-bg`, `--ok-border`, `--warn-border`, `--err-border`, `--input-bg`, `--blur`, `--shadow-s`, `--font`, `--mono`
- Dark/light mode via `data-theme` attribute on `<html>`
- Accent color: orange (`#eca550` dark / `#c87a30` light)
- Responsive breakpoint: 640px
- Fonts: Plus Jakarta Sans (`--font`, UI), JetBrains Mono (`--mono`, code/data)

### Navigation Structure
- **Desktop:** Logo | Features About Support Blog Tools-dropdown | Theme-toggle | DE | CTA
- **Mobile (<=640px):** Logo ... [DE] | [burger-menu]
- `.lang-sw` must stay inside `.nr` for layout to work
- Mobile menu uses accordion pattern (`.mm-cat` headers + `.mm-links`)

### Worker Proxy (lumina-proxy.js)
- Routes: `/fetch`, `/deep`, `/scrape`, `/links`, `/check`, `/headers`, `/markdown`, `/screenshot`, `/redirect`, `/dfs`, `/ai`, `/psi`
- Per-tool daily quotas via `X-Lumina-Tool` header + KV storage
- CORS: only `lumina-seo.com`, `localhost`, and Pages preview allowed
- Client-side settings in localStorage with `lumina_key_` prefix
- AI model allowlist: `gpt-4.1`, `gpt-4.1-mini`, `gpt-4.1-nano`, `gpt-4o-mini`, `gpt-3.5-turbo`

### AI Models per Tool
- **GPT-4.1** (complex): Semantic Checker, Content Optimizer, Schema Validator, PageSpeed
- **GPT-4.1-mini** (simple): Keyword Research, SERP Preview, Meta-Tag Analyzer, Heading Checker, OG Preview

### Country & Language Selectors
- **All tools** with country/language selects use the **same 63 countries** and **39 languages**
- Country select: `id="locSelect"` with DataForSEO location codes (e.g., `2040` for Austria)
- Language select: `id="langSelect"` with ISO 639-1 codes (e.g., `de`, `en`)
- `defaultLangMap` object maps each location_code to its default language — auto-syncs on country change
- Tools with these selects: Keyword Research, AI Content Optimizer, SERP Checker, SERP Overlap
- **Custom searchable dropdowns** via `settings.js` (`csUpgrade`) replace ALL native `<select>` elements with 2+ options
- `window.csUpgrade` is exposed globally for dynamically-populated selects (e.g., GSC site selector)
- Dropdown panels auto-flip upward when near viewport bottom

---

## Tool Page Structure

### HTML Skeleton
Every tool page follows this structure:
```html
<nav class="tn"><!-- sticky top nav --></nav>
<div class="mobile-menu" id="mobileMenu"><!-- mobile accordion menu --></div>

<div class="ct" id="main-content">
  <div class="th">
    <div class="lb">Free SEO & GEO Tool</div>
    <h1>Tool Name</h1>
    <p>Short description</p>
  </div>

  <div class="cd">
    <!-- ONLY interactive UI: inputs, buttons, toolbar, results -->
    <div class="url-bar">
      <input type="text" id="urlIn" placeholder="https://example.com">
      <button class="ab" id="btnGo">Analyze</button>
    </div>
    <div id="toolbar" style="display:none;gap:6px;flex-wrap:wrap"></div>
    <div id="loading" style="display:none"><!-- skeleton loaders --></div>
    <div id="res" style="display:none"><!-- results rendered here --></div>
  </div>
  <!-- quota bar inserted automatically here by createBar() -->

  <div class="content">
    <!-- Educational content, FAQ, More tools, CTA — OUTSIDE .cd -->
    <h2>How This Tool Works</h2>
    <p>...</p>
    <h2>More tools</h2>
    <div class="other-tools"><!-- tool cards --></div>
    <h2>FAQ</h2>
    <div class="faq-item"><!-- accordion --></div>
    <div class="cta-box"><!-- Chrome extension CTA --></div>
  </div>
</div>

<footer class="tf"><!-- 5-column footer grid --></footer>
```

### CSS Class Reference

**Layout:**
| Class | Purpose |
|-------|---------|
| `.ct` | Content wrapper — `max-width:780px; margin:0 auto; padding:24px` |
| `.th` | Tool header — centered, contains `.lb`, `h1`, `p` |
| `.lb` | Accent label — uppercase, letter-spaced, `color:var(--accent)` |
| `.cd` | Card box — glass background, rounded, padded, contains ONLY interactive UI |
| `.content` | Educational content section — OUTSIDE `.cd` |

**Buttons:**
| Class | Purpose | Style |
|-------|---------|-------|
| `.ab` | Primary action button | Orange gradient, white text, rounded |
| `.bt` | Secondary/toggle button | Card background, border, 32px height |
| `.bc` | Chrome Web Store CTA | Orange solid, white text, compact |
| `.tb-btn` | Toolbar button (Copy/CSV) | Card background, border, 11px font, `.copied` state turns green |

**Status Banners:**
| Class | Purpose |
|-------|---------|
| `.sb.ok` | Success — green bg/border/text |
| `.sb.wn` | Warning — yellow bg/border/text |
| `.sb.er` | Error — red bg/border/text |

**Metrics Grid:**
| Class | Purpose |
|-------|---------|
| `.metrics` | Grid container — `repeat(auto,1fr)`, typically 3–5 columns |
| `.metric` | Stat box — centered, bg, border, rounded |
| `.mh` | Metric header label — tiny uppercase |
| `.metric p` | Metric value — large bold number, should animate on render |

**Result Rows:**
| Class | Purpose |
|-------|---------|
| `.sec` | Section divider — uppercase, accent-colored, bottom border. Use `display:flex; justify-content:space-between` for column labels |
| `.cr` | Result row — flex, hover highlight |
| `.cr-name` | Row label — bold, min-width |
| `.cr-note` | Row description — muted, flex:1 |
| `.cr-status` | Status badge — colored bg/border per state |

**Skeleton Loading:**
| Class | Purpose |
|-------|---------|
| `.skel` | Loading placeholder — shimmer animation |
| `.skel.w30/.w50/.w70/.w90` | Width variants |

**Other:**
| Class | Purpose |
|-------|---------|
| `.url-bar` | Input + button flex row |
| `.raw` | Raw text output — mono, scrollable, max-height:300px |
| `.other-tools` | Tool link grid — auto-fill columns, min 200px |
| `.cta-box` | Chrome extension CTA — centered, padded, `.bp` button |
| `.faq-item` | FAQ accordion — `.faq-q` (question, clickable) + `.faq-a` (answer, hidden) |
| `.ai-card` | AI feature card — `.ai-badge` (purple gradient label), `.ai-card-title`, `.ai-card-desc`, button in `.ai-card-body` |

### Metric Animation
Metrics (`.metric p`) should count up from 0 when results render. Standard pattern:
```javascript
function animateMetrics(){
  document.querySelectorAll('.metric p').forEach(function(el){
    var target=parseInt(el.textContent.replace(/[^0-9]/g,''),10);
    if(isNaN(target)||target===0)return;
    var prefix=el.textContent.match(/^[^0-9]*/)[0]||'';
    var suffix=el.textContent.match(/[^0-9]*$/)[0]||'';
    var start=performance.now();var dur=600;
    function tick(now){
      var p=Math.min((now-start)/dur,1);
      var ease=1-Math.pow(1-p,3);
      el.textContent=prefix+Math.round(target*ease)+suffix;
      if(p<1)requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}
```
Call `animateMetrics()` after setting `res.innerHTML` and making the results visible.

### Tool UX Standards
Each tool should have where it makes sense:
- **Cross-tool links** — always, in `.other-tools` grid inside `.content`
- **Toolbar** (`#toolbar` div with `.tb-btn` buttons) — always, inside `.cd` above results. Show on results render with `display:flex`
- **Quota handling** — visible by default, positioned **below the `.cd` card** (right-aligned) via `luminaQuota.createBar()` from `settings.js`. Do NOT put `<div id="lq_*">` elements inside the card HTML — `createBar` inserts them automatically after the container. Always include a **clickable Settings link** (`luminaSettings.open()`) in error messages.
- **Score ring** — only for tools where a quality score is meaningful (e.g., Content Optimizer, Schema Validator). Not for purely informational tools like Tech Stack Detector.
- **AI Card pattern** — AI features should use the `.ai-card` pattern with `.ai-badge`, `.ai-card-title`, `.ai-card-desc`, and button inside `.ai-card-body`. Not bare buttons in a row.
- **AI suggestions** — only where actionable recommendations add real value. Skip if it would just be filler.
- **Results layout** — detected/found items always at the top, prominent and visible. Empty/missing items collapsed or hidden below.
- **Card structure** — the `.cd` card box contains ONLY the tool's interactive UI (inputs, buttons, toolbar, results). "How it works", "More tools", FAQ, and CTA sections go in a `<div class="content">` OUTSIDE the `.cd` box.
- **Metric animation** — `.metric p` values should count up from 0 using `animateMetrics()` after results render.

### JavaScript Patterns

**Proxy variable:**
```javascript
var W='https://lumina-proxy.julien-elbahy.workers.dev';
// or for tools with fallback:
var WORKER=W, WORKER_PRIMARY=W+'/deep', WORKER_FALLBACK=W+'/fetch';
```

**Fetch with fallback:**
```javascript
fetch(WORKER_PRIMARY+'?url='+encodeURIComponent(url))
  .then(function(r){return r.json()})
  .then(function(data){if(data.error)throw new Error(data.error); /* ... */})
  .catch(function(e){/* try WORKER_FALLBACK or show .sb.er error */})
  .finally(function(){btn.disabled=false;btn.textContent='Analyze'});
```

**AI requests (POST):**
```javascript
fetch(W+'/ai',{method:'POST',headers:{'Content-Type':'application/json','X-Lumina-Tool':'tool-name','X-OAI-Key':localStorage.getItem('lumina_key_openai')||''},body:JSON.stringify({model:'gpt-4.1-mini',messages:[{role:'system',content:'...'},{role:'user',content:'...'}],max_tokens:2048})})
```
Note: system prompt goes in messages array as `{role:'system'}`, NOT as a top-level `system` parameter.

**Toolbar rendering:**
```javascript
function showToolbar(){
  var tb=document.getElementById('toolbar');
  tb.style.display='flex';
  tb.innerHTML='<button class="tb-btn" onclick="copyText()">📋 Copy</button><button class="tb-btn" onclick="copyCSV()">📊 CSV</button>';
}
```

**Escape function (always needed):**
```javascript
function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}
```

### Semantic HTML
- Nav links, mobile menu links, and footer links are wrapped in `<ul><li>` for accessibility
- CSS reset: `.tools-sub ul,.mm-links ul,.tf-col ul{list-style:none;padding:0;margin:0}`

---

## Language
- Bilingual: English (primary) + German (`/de/`)
- hreflang tags on all pages
- Settings modal (settings.js) is bilingual
