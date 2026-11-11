// Whitepaper variant of the post template: summary + download panel, key-numbers band, long body with charts, closing CTA.
import { icon } from './icons.js';
import { esc } from './portable.js';
import { statGridHtml } from './charts.js';
import { safeFile } from './shell.js';

export function whitepaperView(post, base, { html, headings, minutes }) {
  const w = post.whitepaper || {};
  const pages = Number.isFinite(Number(w.pages)) && Number(w.pages) > 0 ? Math.round(Number(w.pages)) : null;
  const file = safeFile(w.fileUrl);
  const gate = typeof w.gateSlug === 'string' && /^[a-z0-9][a-z0-9-]{0,100}$/i.test(w.gateSlug) ? w.gateSlug : '';
  const href = gate ? `/resources/${gate}` : file;
  const label = gate ? 'Get the whitepaper' : 'Download the PDF';
  const summary = typeof w.executiveSummary === 'string' ? w.executiveSummary.split(/\n{1,}/).map((s) => s.trim()).filter(Boolean) : [];
  const img = post.image && safeFile(post.image.url) ? post.image : null;
  const stats = statGridHtml({ items: w.keyStats });

  const metaItems = [pages ? `${pages} pages` : '', `${minutes} min read`].filter(Boolean).map((t) => `<span class="post-meta__item">${esc(t)}</span>`).join('');
  const button = href ? `<a class="ds-btn ds-btn-accent wp-btn" href="${esc(href)}"${!gate ? ' download rel="noopener"' : ''}>${icon('download', 18)}${label}</a>` : '';
  const cover = img ? `<img src="${esc(img.url)}${/sanity/.test(img.url) ? '?w=520&auto=format' : ''}" alt="${esc(img.alt || '')}" width="260" fetchpriority="high">` : `<span class="wp-cover__ph" aria-hidden="true"><b>${esc(post.title.slice(0, 28))}</b></span>`;

  const top = summary.length || href ? `<section class="post-feature wp-panel" aria-label="About this whitepaper"><div class="wp-panel__inner"><div class="wp-cover">${cover}</div><div class="wp-panel__main"><p class="wp-label">Executive summary</p>${summary.map((s) => `<p class="wp-summary">${esc(s)}</p>`).join('')}${button ? `<div class="wp-actions">${button}<span class="wp-fine">PDF${pages ? ` · ${pages} pages` : ''}</span></div>` : ''}</div></div></section>` : '';
  const before = stats ? `<section class="wp-stats" aria-labelledby="wp-stats-h"><div class="wp-stats__inner"><h2 id="wp-stats-h" class="wp-stats__title">Key numbers</h2>${stats}</div></section>` : '';
  const after = href ? `<section class="wp-cta" aria-labelledby="wp-cta-h"><div class="wp-cta__inner"><div><h2 id="wp-cta-h">Keep this for your team</h2><p>Download the full whitepaper to share and reference.</p></div>${button}</div></section>` : '';

  const jsonLd = {
    '@type': 'Report',
    ...(pages ? { numberOfPages: pages } : {}),
    ...(file ? { encoding: { '@type': 'MediaObject', contentUrl: file.startsWith('/') ? base + file : file, encodingFormat: 'application/pdf' } } : {}),
  };
  return { top, before, after, metaItems, articleHtml: html, headings, jsonLd, css: '<link rel="stylesheet" href="/blog-assets/whitepaper.css">' };
}
