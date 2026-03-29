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
- CSS variables for theming: `--bg`, `--text`, `--accent`, `--border`, etc.
- Dark/light mode via `data-theme` attribute
- Accent color: orange (`#eca550` / `#d4843a`)
- Responsive breakpoint: 640px
- Fonts: Plus Jakarta Sans (UI), JetBrains Mono (code)

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

### Tool UX Standards
Each tool should have where it makes sense:
- **Cross-tool links** — always
- **Toolbar** (copy/CSV/report) — always
- **Quota handling** — no visible counter by default. Only show a clear error message when the daily limit is actually reached. Don't create artificial scarcity UX. Always include a **clickable ⚙️ Settings link** (`luminaSettings.open()`) in error messages.
- **Score ring** — only for tools where a quality score is meaningful (e.g., Content Optimizer, Schema Validator). Not for purely informational tools like Tech Stack Detector.
- **AI Card pattern** — AI features should use the `.ai-card` pattern with `.ai-badge`, `.ai-card-title`, `.ai-card-desc`, and button inside `.ai-card-body`. Not bare buttons in a row.
- **AI suggestions** — only where actionable recommendations add real value. Skip if it would just be filler.
- **Results layout** — detected/found items always at the top, prominent and visible. Empty/missing items collapsed or hidden below.

### Semantic HTML
- Nav links, mobile menu links, and footer links are wrapped in `<ul><li>` for accessibility
- CSS reset: `.tools-sub ul,.mm-links ul,.tf-col ul{list-style:none;padding:0;margin:0}`

## Language
- Bilingual: English (primary) + German (`/de/`)
- hreflang tags on all pages
- Settings modal (settings.js) is bilingual
