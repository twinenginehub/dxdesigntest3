// Page shell for templates that are not the standard post layout (press release, lead-magnet page, franchise listing).
import { NAV, FOOTER } from './chrome.js';
import { esc } from './portable.js';

export const safeHttps = (u) => { try { const x = new URL(String(u || '')); return x.protocol === 'https:' ? x.href : ''; } catch { return ''; } };
export const safeFile = (u) => safeHttps(u) || (/^\/[^/\\]/.test(String(u || '')) ? String(u) : '');
export const abs = (base, u) => (!u ? '' : /^https?:/i.test(u) ? u : base + u);
export const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

export function shell({ title, desc = '', canonical, ogType = 'website', ogImage = '', css = [], jsonLd = null, main, scripts = '', robots = '', published = '' }) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${robots ? `<meta name="robots" content="${esc(robots)}">` : ''}<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="${ogType}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(canonical)}">
${ogImage ? `<meta property="og:image" content="${esc(ogImage)}"><meta name="twitter:card" content="summary_large_image">` : ''}${published ? `<meta property="article:published_time" content="${esc(published)}">` : ''}
<link rel="stylesheet" href="/ds/tokens.css"><link rel="stylesheet" href="/ds/bundle.css"><link rel="stylesheet" href="/ds/header.css">${css.map((c) => `<link rel="stylesheet" href="${c}">`).join('')}
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : ''}
<script src="/ds/header.js" defer></script>
</head><body>
<a class="post-skip" href="#main-content">Skip to content</a>
${NAV}
<main id="main-content">${main}</main>
${FOOTER}
${scripts}
</body></html>`;
}
