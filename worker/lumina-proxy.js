// Lumina SEO — Full Proxy Worker v7.0
// ═══════════════════════════════════════════════════════════════
// Changes v7.0:
//   - Per-tool quotas: each tool gets its own daily limit
//   - X-Lumina-Tool header for tool identification
//   - Separate KV keys per tool (dfs:{tool}:{ip}:{date})
// ═══════════════════════════════════════════════════════════════
// Endpoints:
//   GET  /fetch?url=             → Raw HTML (no JS rendering)
//   GET  /check?url=&bot=        → Bot server check
//   GET  /headers?url=           → Response headers + security analysis
//   GET  /deep?url=              → JS-rendered full HTML (BR /content)
//   POST /scrape?url=            → Targeted element extraction (BR /scrape)
//   GET  /links?url=             → All links structured (BR /links)
//   GET  /markdown?url=          → Clean markdown text (BR /markdown)
//   GET  /screenshot?url=        → Screenshot PNG (BR /screenshot)
//   GET  /redirect?url=          → Follow redirect chain
//   POST /dfs?endpoint=          → DataForSEO proxy (per-tool limits, or own key)
//   POST /ai                     → OpenAI proxy (per-tool limits, or own key)
//   GET  /psi?url=               → PageSpeed Insights proxy (50/day free)
//   GET  /                       → Health check
// ═══════════════════════════════════════════════════════════════

// ── Configuration ──

const ALLOWED_ORIGINS = [
  'https://lumina-seo.com', 'https://www.lumina-seo.com',
  'https://lumina-website-01p.pages.dev',
  'http://localhost:8080', 'http://localhost:3000', 'http://127.0.0.1:8080',
];

const BLOCKED_HOSTS = [
  'localhost', '127.0.0.1', '0.0.0.0', '10.', '172.16.', '172.17.', '172.18.',
  '172.19.', '172.20.', '172.21.', '172.22.', '172.23.', '172.24.', '172.25.',
  '172.26.', '172.27.', '172.28.', '172.29.', '172.30.', '172.31.', '192.168.',
  'workers.dev', 'lumina-proxy',
];

const BOT_AGENTS = {
  googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  bingbot: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
  duckduckbot: 'Mozilla/5.0 (compatible; DuckDuckBot/1.0; +https://duckduckgo.com/duckduckbot)',
  yandexbot: 'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
  baiduspider: 'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)',
  gptbot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)',
  'oai-searchbot': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)',
  'chatgpt-user': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ChatGPT-User/1.0; +https://openai.com/bot)',
  claudebot: 'Mozilla/5.0 (compatible; ClaudeBot/1.0; +https://anthropic.com/claudebot)',
  'claude-searchbot': 'Mozilla/5.0 (compatible; Claude-SearchBot/1.0; +https://anthropic.com/claude-searchbot)',
  'claude-user': 'Mozilla/5.0 (compatible; Claude-User/1.0; +https://anthropic.com/claude-user)',
  perplexitybot: 'Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://www.perplexity.ai/perplexitybot)',
  'google-extended': 'Mozilla/5.0 (compatible; Google-Extended; +http://www.google.com/bot.html)',
  'xai-web-crawler': 'Mozilla/5.0 (compatible; xAI-Web-Crawler/1.0; +https://x.ai/crawler)',
  'mistralai-user': 'Mozilla/5.0 (compatible; MistralAI-User/1.0; +https://mistral.ai)',
  'applebot-extended': 'Mozilla/5.0 (compatible; Applebot-Extended/0.1; +http://www.apple.com/go/applebot)',
  ccbot: 'CCBot/2.0 (https://commoncrawl.org/faq/)',
  'cohere-ai': 'CohereBot/1.0 (+https://cohere.com/)',
  bytespider: 'Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (compatible; Bytespider; https://zhanzhang.toutiao.com/)',
  'meta-external': 'Mozilla/5.0 (compatible; Meta-ExternalAgent/1.0; +https://developers.facebook.com/docs/sharing/webmasters/crawler)',
  applebot: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/600.2.5 (compatible; Applebot/0.1; +http://www.apple.com/go/applebot)',
  amazonbot: 'Mozilla/5.0 (compatible; Amazonbot/0.1; +https://developer.amazon.com/support/amazonbot)',
  bravebot: 'Mozilla/5.0 (compatible; BraveBot/1.0; +https://brave.com/)',
  youbot: 'Mozilla/5.0 (compatible; YouBot/1.0; +https://you.com)',
  'google-agent': 'Google-Agent',
  'anthropic-ai': 'Mozilla/5.0 (compatible; anthropic-ai/1.0; +https://anthropic.com)',
  deepseekbot: 'Mozilla/5.0 (compatible; DeepSeekBot/1.0; +https://deepseek.com)',
  facebookbot: 'Mozilla/5.0 (compatible; FacebookBot/1.0; +https://developers.facebook.com/docs/sharing/webmasters/crawler)',
  petalbot: 'Mozilla/5.0 (compatible; PetalBot; +https://webmaster.petalsearch.com/)',
  diffbot: 'Mozilla/5.0 (compatible; Diffbot/1.0; +https://diffbot.com)',
  'perplexity-user': 'Mozilla/5.0 (compatible; Perplexity-User/1.0; +https://perplexity.ai)',
  pinterest: 'Mozilla/5.0 (compatible; Pinterest/0.2; +https://www.pinterest.com/bot/)',
  linkedinbot: 'Mozilla/5.0 (compatible; LinkedInBot/1.0; +http://www.linkedin.com)',
  twitterbot: 'Mozilla/5.0 (compatible; Twitterbot/1.0)',
  slackbot: 'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
  facebookexternalhit: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
};

const CF_ACCOUNT_ID = '045957bc690a89607c5ced094e3d11e4';
const BR_BASE = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/browser-rendering`;

// ── Per-Tool Daily Limits (when using OUR keys) ──
// Each tool gets its own independent quota
const TOOL_LIMITS = {
  // DataForSEO tools
  'keyword-research': { type: 'dfs', limit: 5 },
  'serp-checker':     { type: 'dfs', limit: 5 },
  'serp-overlap':     { type: 'dfs', limit: 10 },
  // OpenAI tools
  'serp-preview':     { type: 'ai', limit: 10 },
  'meta-analyzer':    { type: 'ai', limit: 10 },
  'schema-validator': { type: 'ai', limit: 10 },
  'heading-checker':  { type: 'ai', limit: 10 },
  'content-optimizer':{ type: 'ai', limit: 10 },
  // Ask AI (homepage copilot)
  'ask-ai':           { type: 'ai',  limit: 10 },
  'ask-ai-plan':      { type: 'ai',  limit: 30 },
  'ask-ai-dfs':       { type: 'dfs', limit: 30 },
};

// Fallback limits for unknown tools (backwards compatibility)
const DEFAULT_LIMITS = {
  dfs: 5,
  ai: 10,
  psi: 50,
};

function getToolLimit(toolName, apiType) {
  if (toolName && TOOL_LIMITS[toolName]) return TOOL_LIMITS[toolName].limit;
  return DEFAULT_LIMITS[apiType] || 5;
}

function getKvPrefix(apiType, toolName) {
  // Per-tool prefix: e.g. "dfs:keyword-research" or "ai:schema-validator"
  if (toolName) return `${apiType}:${toolName}`;
  return apiType; // fallback for old clients
}

// ── Rate Limiter (in-memory, per-minute, all endpoints) ──
const rateLimitMap = new Map();
const RATE_LIMIT = 120;
const RATE_WINDOW = 60_000;

function isRateLimited(ip, limit) {
  const max = limit || RATE_LIMIT;
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    if (rateLimitMap.size > 10000) {
      for (const [key, val] of rateLimitMap) {
        if (now - val.start > RATE_WINDOW) rateLimitMap.delete(key);
      }
    }
    return false;
  }
  entry.count++;
  return entry.count > max;
}

// ── KV Daily Rate Limiter (for paid APIs: DFS, OpenAI, PSI) ──
async function getDailyUsage(prefix, ip, kv) {
  const today = new Date().toISOString().split('T')[0];
  const key = `${prefix}:${ip}:${today}`;
  const val = await kv.get(key);
  return val ? parseInt(val) : 0;
}

async function incrementDailyUsage(prefix, ip, kv) {
  const today = new Date().toISOString().split('T')[0];
  const key = `${prefix}:${ip}:${today}`;
  const current = await getDailyUsage(prefix, ip, kv);
  await kv.put(key, String(current + 1), { expirationTtl: 86400 });
  return current + 1;
}

// Check daily limit; returns null if OK, or error response if exceeded
async function checkDailyLimit(prefix, ip, kv, limit, origin, toolName) {
  if (!kv) return jsonResponse({ error: 'Rate limit store not available.' }, 500, origin);
  const usage = await getDailyUsage(prefix, ip, kv);
  if (usage >= limit) {
    return jsonResponse({
      error: `Daily limit reached (${limit}). Provide your own API key for unlimited access.`,
      limit, used: usage, needsKey: true, tool: toolName || null,
    }, 429, origin);
  }
  return null; // OK
}

// ── Helpers ──
function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (origin.startsWith('chrome-extension://')) return true;
  return ALLOWED_ORIGINS.some(o => origin.startsWith(o));
}

function checkOrigin(origin, referer) {
  return isAllowedOrigin(origin) || ALLOWED_ORIGINS.some(o => (referer || '').startsWith(o));
}

function getCorsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin : 'https://lumina-seo.com',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-DFS-Key, X-OAI-Key, X-PSI-Key, X-Lumina-Tool',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) },
  });
}

function validateTargetUrl(targetUrl) {
  if (!targetUrl) return { error: 'Missing ?url=' };
  let parsed;
  try {
    parsed = new URL(targetUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw 0;
  } catch {
    return { error: 'Invalid URL' };
  }
  if (BLOCKED_HOSTS.some(h => parsed.hostname.startsWith(h) || parsed.hostname.includes(h))) {
    return { error: 'Blocked host' };
  }
  return { parsed };
}

// Standard auth + rate limit check for origin-protected endpoints
function authCheck(origin, referer, ip) {
  if (!checkOrigin(origin, referer)) return 'Forbidden';
  if (isRateLimited(ip)) return 'Rate limited.';
  return null;
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const referer = request.headers.get('Referer') || '';

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
    }

    const url = new URL(request.url);
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    // ══════════════════════════════════════════════════════════
    // HEALTH CHECK
    // ══════════════════════════════════════════════════════════
    if (url.pathname === '/' || url.pathname === '/health') {
      return jsonResponse({
        status: 'ok', service: 'lumina-proxy', version: '7.0',
        endpoints: ['/fetch', '/check', '/headers', '/deep', '/scrape', '/links', '/markdown', '/screenshot', '/redirect', '/dfs', '/ai', '/psi'],
        bots: Object.keys(BOT_AGENTS).length,
        perToolQuotas: true,
      }, 200, origin);
    }

    // ══════════════════════════════════════════════════════════
    // /check — Bot Server Check (no origin restriction)
    // ══════════════════════════════════════════════════════════
    if (url.pathname === '/check') {
      if (isRateLimited(ip)) return jsonResponse({ error: 'Rate limited.' }, 429, origin);
      const targetUrl = url.searchParams.get('url');
      const bot = (url.searchParams.get('bot') || 'googlebot').toLowerCase();
      const { error, parsed } = validateTargetUrl(targetUrl);
      if (error) return jsonResponse({ error }, 400, origin);
      const userAgent = BOT_AGENTS[bot] || BOT_AGENTS['googlebot'];
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const resp = await fetch(parsed.href, {
          method: 'GET', headers: { 'User-Agent': userAgent },
          redirect: 'follow', signal: controller.signal,
        });
        clearTimeout(timeout);
        return jsonResponse({ statusCode: resp.status, statusText: resp.statusText, bot, url: parsed.href }, 200, origin);
      } catch (err) {
        clearTimeout(timeout);
        return jsonResponse({ statusCode: 0, bot, error: err.name === 'AbortError' ? 'Timeout' : err.message }, 200, origin);
      }
    }

    // ══════════════════════════════════════════════════════════
    // /fetch — Raw HTML (no JS rendering)
    // ══════════════════════════════════════════════════════════
    if (url.pathname === '/fetch') {
      const authErr = authCheck(origin, referer, ip);
      if (authErr) return jsonResponse({ error: authErr }, authErr === 'Forbidden' ? 403 : 429, origin);
      const { error, parsed } = validateTargetUrl(url.searchParams.get('url'));
      if (error) return jsonResponse({ error }, 400, origin);
      const start = Date.now();
      try {
        const resp = await fetch(parsed.href, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LuminaSEO/1.0; +https://lumina-seo.com)',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
          },
          redirect: 'follow',
          cf: { cacheTtl: 300, cacheEverything: true },
        });
        const ct = resp.headers.get('Content-Type') || '';
        if (!ct.includes('text/') && !ct.includes('html') && !ct.includes('xml')) {
          return jsonResponse({ error: 'Not HTML', contentType: ct }, 400, origin);
        }
        const html = await resp.text();
        if (html.length > 2_000_000) return jsonResponse({ error: 'Page too large' }, 400, origin);
        return jsonResponse({ html, status: resp.status, url: resp.url, time: Date.now() - start }, 200, origin);
      } catch (err) {
        return jsonResponse({ error: 'Fetch failed: ' + err.message }, 502, origin);
      }
    }

    // ══════════════════════════════════════════════════════════
    // /headers — Response Headers + Security Analysis
    // ══════════════════════════════════════════════════════════
    if (url.pathname === '/headers') {
      const authErr = authCheck(origin, referer, ip);
      if (authErr) return jsonResponse({ error: authErr }, authErr === 'Forbidden' ? 403 : 429, origin);
      const { error, parsed } = validateTargetUrl(url.searchParams.get('url'));
      if (error) return jsonResponse({ error }, 400, origin);
      const start = Date.now();
      try {
        const resp = await fetch(parsed.href, {
          method: 'HEAD',
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LuminaSEO/1.0; +https://lumina-seo.com)' },
          redirect: 'follow',
        });
        const headers = {};
        for (const [key, value] of resp.headers.entries()) headers[key.toLowerCase()] = value;
        return jsonResponse({
          url: parsed.href, statusCode: resp.status, statusText: resp.statusText,
          security: {
            hsts: headers['strict-transport-security'] || null,
            csp: headers['content-security-policy'] || null,
            xFrameOptions: headers['x-frame-options'] || null,
            xContentType: headers['x-content-type-options'] || null,
            referrerPolicy: headers['referrer-policy'] || null,
            permissionsPolicy: headers['permissions-policy'] || null,
            xXssProtection: headers['x-xss-protection'] || null,
            crossOriginOpenerPolicy: headers['cross-origin-opener-policy'] || null,
            crossOriginEmbedderPolicy: headers['cross-origin-embedder-policy'] || null,
            crossOriginResourcePolicy: headers['cross-origin-resource-policy'] || null,
          },
          tech: {
            server: headers['server'] || null,
            poweredBy: headers['x-powered-by'] || null,
            cfRay: headers['cf-ray'] || null,
            via: headers['via'] || null,
          },
          redirect: { finalUrl: resp.url, redirected: resp.url !== parsed.href, statusCode: resp.status },
          headers,
          time: Date.now() - start,
        }, 200, origin);
      } catch (err) {
        return jsonResponse({ error: 'Headers fetch failed: ' + err.message }, 502, origin);
      }
    }

    // ══════════════════════════════════════════════════════════
    // /deep — Full JS-rendered HTML (Browser Rendering /content)
    // ══════════════════════════════════════════════════════════
    if (url.pathname === '/deep') {
      const authErr = authCheck(origin, referer, ip);
      if (authErr) return jsonResponse({ error: authErr }, authErr === 'Forbidden' ? 403 : 429, origin);
      const { error, parsed } = validateTargetUrl(url.searchParams.get('url'));
      if (error) return jsonResponse({ error }, 400, origin);
      const apiToken = env.CF_BR_TOKEN;
      if (!apiToken) return jsonResponse({ error: 'Browser Rendering not configured.' }, 500, origin);
      const start = Date.now();
      try {
        const brResp = await fetch(`${BR_BASE}/content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiToken}` },
          body: JSON.stringify({
            url: parsed.href,
            gotoOptions: { waitUntil: 'networkidle2', timeout: 20000 },
            rejectResourceTypes: ['image', 'media', 'font'],
          }),
        });
        if (!brResp.ok) return jsonResponse({ error: 'Browser Rendering error: ' + brResp.status }, 502, origin);
        const html = await brResp.text();
        if (html.length > 3_000_000) return jsonResponse({ error: 'Rendered page too large' }, 400, origin);
        return jsonResponse({
          html, rendered: true, url: parsed.href,
          time: Date.now() - start,
          browserMs: parseInt(brResp.headers.get('X-Browser-Ms-Used') || '0'),
        }, 200, origin);
      } catch (err) {
        return jsonResponse({ error: 'Deep scan failed: ' + err.message }, 502, origin);
      }
    }

    // ══════════════════════════════════════════════════════════
    // /scrape — Targeted element extraction (Browser Rendering /scrape)
    // ══════════════════════════════════════════════════════════
    if (url.pathname === '/scrape') {
      const authErr = authCheck(origin, referer, ip);
      if (authErr) return jsonResponse({ error: authErr }, authErr === 'Forbidden' ? 403 : 429, origin);
      const { error, parsed } = validateTargetUrl(url.searchParams.get('url'));
      if (error) return jsonResponse({ error }, 400, origin);
      const apiToken = env.CF_BR_TOKEN;
      if (!apiToken) return jsonResponse({ error: 'Browser Rendering not configured.' }, 500, origin);

      let elements;
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          elements = body.elements;
        } catch { return jsonResponse({ error: 'Invalid JSON body' }, 400, origin); }
      } else {
        const selectors = url.searchParams.get('selectors') || 'title,meta[name="description"]';
        elements = selectors.split(',').map(s => ({ selector: s.trim() }));
      }

      if (!elements || !elements.length) return jsonResponse({ error: 'No selectors provided' }, 400, origin);
      if (elements.length > 30) return jsonResponse({ error: 'Max 30 selectors' }, 400, origin);

      const start = Date.now();
      try {
        const brResp = await fetch(`${BR_BASE}/scrape`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiToken}` },
          body: JSON.stringify({
            url: parsed.href,
            elements,
            gotoOptions: { waitUntil: 'networkidle2', timeout: 20000 },
            rejectResourceTypes: ['image', 'media', 'font'],
          }),
        });
        if (!brResp.ok) {
          const errText = await brResp.text().catch(() => '');
          return jsonResponse({ error: 'Scrape error: ' + brResp.status, detail: errText }, 502, origin);
        }
        const result = await brResp.json();
        return jsonResponse({
          ...result, url: parsed.href,
          time: Date.now() - start,
          browserMs: parseInt(brResp.headers.get('X-Browser-Ms-Used') || '0'),
        }, 200, origin);
      } catch (err) {
        return jsonResponse({ error: 'Scrape failed: ' + err.message }, 502, origin);
      }
    }

    // ══════════════════════════════════════════════════════════
    // /links — All links structured (Browser Rendering /links)
    // ══════════════════════════════════════════════════════════
    if (url.pathname === '/links') {
      const authErr = authCheck(origin, referer, ip);
      if (authErr) return jsonResponse({ error: authErr }, authErr === 'Forbidden' ? 403 : 429, origin);
      const { error, parsed } = validateTargetUrl(url.searchParams.get('url'));
      if (error) return jsonResponse({ error }, 400, origin);
      const apiToken = env.CF_BR_TOKEN;
      if (!apiToken) return jsonResponse({ error: 'Browser Rendering not configured.' }, 500, origin);
      const start = Date.now();
      try {
        const brResp = await fetch(`${BR_BASE}/links`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiToken}` },
          body: JSON.stringify({
            url: parsed.href,
            gotoOptions: { waitUntil: 'networkidle2', timeout: 20000 },
            rejectResourceTypes: ['image', 'media', 'font'],
          }),
        });
        if (!brResp.ok) return jsonResponse({ error: 'Links error: ' + brResp.status }, 502, origin);
        const result = await brResp.json();
        return jsonResponse({
          ...result, url: parsed.href,
          time: Date.now() - start,
          browserMs: parseInt(brResp.headers.get('X-Browser-Ms-Used') || '0'),
        }, 200, origin);
      } catch (err) {
        return jsonResponse({ error: 'Links failed: ' + err.message }, 502, origin);
      }
    }

    // ══════════════════════════════════════════════════════════
    // /markdown — Clean text extraction (Browser Rendering /markdown)
    // ══════════════════════════════════════════════════════════
    if (url.pathname === '/markdown') {
      const authErr = authCheck(origin, referer, ip);
      if (authErr) return jsonResponse({ error: authErr }, authErr === 'Forbidden' ? 403 : 429, origin);
      const { error, parsed } = validateTargetUrl(url.searchParams.get('url'));
      if (error) return jsonResponse({ error }, 400, origin);
      const apiToken = env.CF_BR_TOKEN;
      if (!apiToken) return jsonResponse({ error: 'Browser Rendering not configured.' }, 500, origin);
      const start = Date.now();
      try {
        const brResp = await fetch(`${BR_BASE}/markdown`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiToken}` },
          body: JSON.stringify({
            url: parsed.href,
            gotoOptions: { waitUntil: 'networkidle2', timeout: 20000 },
            rejectResourceTypes: ['image', 'media', 'font'],
          }),
        });
        if (!brResp.ok) return jsonResponse({ error: 'Markdown error: ' + brResp.status }, 502, origin);
        const result = await brResp.json();
        return jsonResponse({
          ...result, url: parsed.href,
          time: Date.now() - start,
          browserMs: parseInt(brResp.headers.get('X-Browser-Ms-Used') || '0'),
        }, 200, origin);
      } catch (err) {
        return jsonResponse({ error: 'Markdown failed: ' + err.message }, 502, origin);
      }
    }

    // ══════════════════════════════════════════════════════════
    // /screenshot — Screenshot PNG (Browser Rendering /screenshot)
    // ══════════════════════════════════════════════════════════
    if (url.pathname === '/screenshot') {
      const authErr = authCheck(origin, referer, ip);
      if (authErr) return jsonResponse({ error: authErr }, authErr === 'Forbidden' ? 403 : 429, origin);
      const { error, parsed } = validateTargetUrl(url.searchParams.get('url'));
      if (error) return jsonResponse({ error }, 400, origin);
      const apiToken = env.CF_BR_TOKEN;
      if (!apiToken) return jsonResponse({ error: 'Browser Rendering not configured.' }, 500, origin);

      const device = (url.searchParams.get('device') || 'desktop').toLowerCase();
      const viewport = device === 'mobile'
        ? { width: 390, height: 844, deviceScaleFactor: 2 }
        : device === 'tablet'
          ? { width: 834, height: 1194, deviceScaleFactor: 2 }
          : { width: 1440, height: 900, deviceScaleFactor: 1 };

      try {
        const brResp = await fetch(`${BR_BASE}/screenshot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiToken}` },
          body: JSON.stringify({
            url: parsed.href,
            gotoOptions: { waitUntil: 'networkidle2', timeout: 20000 },
            viewport,
            screenshotOptions: {
              fullPage: url.searchParams.get('full') === '1',
              type: 'png',
            },
          }),
        });
        if (!brResp.ok) return jsonResponse({ error: 'Screenshot error: ' + brResp.status }, 502, origin);
        return new Response(await brResp.arrayBuffer(), {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=300',
            ...getCorsHeaders(origin),
          },
        });
      } catch (err) {
        return jsonResponse({ error: 'Screenshot failed: ' + err.message }, 502, origin);
      }
    }

    // ══════════════════════════════════════════════════════════
    // /redirect — Follow redirect chain
    // ══════════════════════════════════════════════════════════
    if (url.pathname === '/redirect') {
      const authErr = authCheck(origin, referer, ip);
      if (authErr) return jsonResponse({ error: authErr }, authErr === 'Forbidden' ? 403 : 429, origin);
      const { error, parsed } = validateTargetUrl(url.searchParams.get('url'));
      if (error) return jsonResponse({ error }, 400, origin);

      const chain = [];
      let currentUrl = parsed.href;
      const maxHops = 10;

      for (let i = 0; i < maxHops; i++) {
        try {
          const resp = await fetch(currentUrl, {
            method: 'HEAD',
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LuminaSEO/1.0; +https://lumina-seo.com)' },
            redirect: 'manual',
          });
          const location = resp.headers.get('location');
          chain.push({
            url: currentUrl,
            statusCode: resp.status,
            statusText: resp.statusText,
            headers: { location: location || null, server: resp.headers.get('server') || null },
          });
          if (resp.status >= 300 && resp.status < 400 && location) {
            try { currentUrl = new URL(location, currentUrl).href; } catch { currentUrl = location; }
          } else {
            break;
          }
        } catch (err) {
          chain.push({ url: currentUrl, statusCode: 0, error: err.message });
          break;
        }
      }

      return jsonResponse({
        originalUrl: parsed.href,
        finalUrl: chain.length > 0 ? chain[chain.length - 1].url : parsed.href,
        hops: chain.length - 1,
        chain,
        isHttpToHttps: parsed.href.startsWith('http://') && chain.length > 0 && chain[chain.length - 1].url.startsWith('https://'),
      }, 200, origin);
    }

    // ══════════════════════════════════════════════════════════
    // /dfs — DataForSEO Proxy (per-tool limits, or user's own key)
    // ══════════════════════════════════════════════════════════
    if (url.pathname === '/dfs') {
      if (!checkOrigin(origin, referer)) return jsonResponse({ error: 'Forbidden' }, 403, origin);

      const endpoint = url.searchParams.get('endpoint');
      if (!endpoint) return jsonResponse({ error: 'Missing ?endpoint=' }, 400, origin);

      const allowedEndpoints = [
        'serp/google/organic/live/regular',
        'keywords_data/google_ads/search_volume/live',
        'keywords_data/google_ads/keywords_for_keywords/live',
        'dataforseo_labs/google/keyword_suggestions/live',
        'dataforseo_labs/google/related_keywords/live',
        'dataforseo_labs/locations_and_languages',
      ];
      if (!allowedEndpoints.includes(endpoint)) return jsonResponse({ error: 'Endpoint not allowed' }, 403, origin);

      // Tool identification for per-tool quotas
      const toolName = request.headers.get('X-Lumina-Tool') || url.searchParams.get('tool') || '';
      const kvPrefix = getKvPrefix('dfs', toolName);
      const toolLimit = getToolLimit(toolName, 'dfs');

      // User key bypasses our limits
      const userKey = request.headers.get('X-DFS-Key') || url.searchParams.get('dfs_key') || '';

      let dfsAuth;
      if (userKey) {
        dfsAuth = userKey;
      } else {
        const ourKey = env.DFS_API_KEY;
        if (!ourKey) return jsonResponse({ error: 'DataForSEO not configured. Provide your own API key.', needsKey: true }, 403, origin);

        const limitErr = await checkDailyLimit(kvPrefix, ip, env.RATE_LIMITS, toolLimit, origin, toolName);
        if (limitErr) return limitErr;

        dfsAuth = ourKey;
        await incrementDailyUsage(kvPrefix, ip, env.RATE_LIMITS);
      }

      let body;
      if (request.method === 'POST') {
        body = await request.text();
      } else {
        body = url.searchParams.get('data') || '[]';
      }

      try {
        const dfsResp = await fetch(`https://api.dataforseo.com/v3/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${dfsAuth}` },
          body,
        });
        const result = await dfsResp.json();
        const remaining = userKey ? 'unlimited' : (toolLimit - await getDailyUsage(kvPrefix, ip, env.RATE_LIMITS));

        return jsonResponse({
          ...result,
          _lumina: { remaining, limit: userKey ? null : toolLimit, ownKey: !!userKey, tool: toolName || null },
        }, dfsResp.status, origin);
      } catch (err) {
        return jsonResponse({ error: 'DataForSEO request failed: ' + err.message }, 502, origin);
      }
    }

    // ══════════════════════════════════════════════════════════
    // /ai — OpenAI Proxy (per-tool limits, or user's own key)
    // ══════════════════════════════════════════════════════════
    if (url.pathname === '/ai') {
      if (!checkOrigin(origin, referer)) return jsonResponse({ error: 'Forbidden' }, 403, origin);
      if (request.method !== 'POST') return jsonResponse({ error: 'POST required' }, 405, origin);

      // Tool identification for per-tool quotas
      const toolName = request.headers.get('X-Lumina-Tool') || '';
      const kvPrefix = getKvPrefix('ai', toolName);
      const toolLimit = getToolLimit(toolName, 'ai');

      // User key bypasses our limits
      const userKey = request.headers.get('X-OAI-Key') || '';

      let oaiKey;
      if (userKey) {
        oaiKey = userKey;
      } else {
        const ourKey = env.OPENAI_API_KEY;
        if (!ourKey) return jsonResponse({ error: 'OpenAI not configured. Provide your own API key.', needsKey: true }, 403, origin);

        const limitErr = await checkDailyLimit(kvPrefix, ip, env.RATE_LIMITS, toolLimit, origin, toolName);
        if (limitErr) return limitErr;

        oaiKey = ourKey;
        await incrementDailyUsage(kvPrefix, ip, env.RATE_LIMITS);
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ error: 'Invalid JSON body' }, 400, origin);
      }

      // Security: enforce limits on the request
      const allowedModels = ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4o-mini', 'gpt-3.5-turbo', 'o3-mini', 'o4-mini'];
      if (body.model && !allowedModels.includes(body.model)) {
        body.model = 'gpt-4.1-mini';
      }
      if (!body.model) body.model = 'gpt-4.1-mini';
      body.max_tokens = Math.min(body.max_tokens || 500, 4000);
      body.stream = false;

      try {
        const oaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${oaiKey}`,
          },
          body: JSON.stringify(body),
        });
        const result = await oaiResp.json();

        if (result.system_fingerprint) delete result.system_fingerprint;

        const remaining = userKey ? 'unlimited' : (toolLimit - await getDailyUsage(kvPrefix, ip, env.RATE_LIMITS));
        return jsonResponse({
          ...result,
          _lumina: { remaining, limit: userKey ? null : toolLimit, ownKey: !!userKey, tool: toolName || null },
        }, oaiResp.status, origin);
      } catch (err) {
        return jsonResponse({ error: 'OpenAI request failed: ' + err.message }, 502, origin);
      }
    }

    // ══════════════════════════════════════════════════════════
    // /psi — PageSpeed Insights Proxy (50/day free)
    // ══════════════════════════════════════════════════════════
    if (url.pathname === '/psi') {
      const authErr = authCheck(origin, referer, ip);
      if (authErr) return jsonResponse({ error: authErr }, authErr === 'Forbidden' ? 403 : 429, origin);
      const { error, parsed } = validateTargetUrl(url.searchParams.get('url'));
      if (error) return jsonResponse({ error }, 400, origin);

      const userKey = request.headers.get('X-PSI-Key') || '';
      const toolName = request.headers.get('X-Lumina-Tool') || 'pagespeed';
      const kvPrefix = getKvPrefix('psi', toolName);
      const toolLimit = getToolLimit(toolName, 'psi');
      let usedCount = 0;

      if (userKey) {
        // User's own key — no limits
      } else if (env.RATE_LIMITS) {
        const limitErr = await checkDailyLimit(kvPrefix, ip, env.RATE_LIMITS, toolLimit, origin, toolName);
        if (limitErr) return limitErr;
      }

      const strategy = url.searchParams.get('strategy') || 'mobile';
      const categories = url.searchParams.get('categories') || 'performance,accessibility,best-practices,seo';

      let psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(parsed.href)}&strategy=${strategy}`;
      categories.split(',').forEach(c => { psiUrl += `&category=${c.trim()}`; });

      if (userKey) {
        psiUrl += `&key=${userKey}`;
      } else if (env.PSI_API_KEY) {
        psiUrl += `&key=${env.PSI_API_KEY}`;
      }

      try {
        const psiResp = await fetch(psiUrl);
        const result = await psiResp.json();

        if (result.error && result.error.message) {
          result.error.message = result.error.message.replace(/key=[^&]+/, 'key=***');
        }

        // Increment usage after successful call (not for user keys)
        if (!userKey && env.RATE_LIMITS) {
          usedCount = await incrementDailyUsage(kvPrefix, ip, env.RATE_LIMITS);
        }

        result._lumina = {
          remaining: userKey ? toolLimit : Math.max(0, toolLimit - usedCount),
          limit: toolLimit,
          ownKey: !!userKey,
          tool: toolName,
        };

        return jsonResponse(result, psiResp.status, origin);
      } catch (err) {
        return jsonResponse({ error: 'PageSpeed request failed: ' + err.message }, 502, origin);
      }
    }

    // ══════════════════════════════════════════════════════════
    // 404
    // ══════════════════════════════════════════════════════════
    return jsonResponse({
      error: 'Not found',
      endpoints: ['/fetch', '/check', '/headers', '/deep', '/scrape', '/links', '/markdown', '/screenshot', '/redirect', '/dfs', '/ai', '/psi'],
    }, 404, origin);
  },
};
