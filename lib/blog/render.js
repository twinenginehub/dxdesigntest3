import { NAV, FOOTER } from './chrome.js';
import { toHtml, esc } from './portable.js';
import { podcastView } from './podcast.js';

const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
const abs = (base, u) => (!u ? '' : /^https?:/i.test(u) ? u : base + u);

export function renderPost(post, base) {
  const { html, headings, words } = toHtml(post.body);
  const minutes = Math.max(1, Math.round(words / 220));
  const tags = (post.tags || []).filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim());
  const category = typeof post.category === 'string' ? post.category.trim() : '';
  const labels = [...new Set([category, ...tags].filter(Boolean))]; // category first, then tags, no duplicates
  const pod = post.contentType === 'podcast' && post.podcast ? podcastView(post, base) : null;
  const navHeadings = pod ? pod.headings : headings;
  const title = post.seoTitle || post.title;
  const desc = post.seoDescription || post.excerpt || '';
  const url = `${base}/blog/${post.slug}`;
  const img = post.image && post.image.url ? post.image : null;
  const imgSrc = img ? img.url + (/sanity/.test(img.url) ? '?w=1600&auto=format' : '') : '';
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: desc, mainEntityOfPage: url,
    datePublished: post.publishedAt, dateModified: post._updatedAt || post.publishedAt,
    ...(tags.length ? { keywords: tags.join(', ') } : {}),
    ...(post.category ? { articleSection: post.category } : {}),
    ...(post.author ? { author: { '@type': 'Person', name: post.author.name } } : {}),
    ...(img ? { image: abs(base, imgSrc) } : {}),
    publisher: { '@type': 'Organization', name: 'DOXA Talent', logo: { '@type': 'ImageObject', url: `${base}/doxa-logo-navy.png` } },
  };
  const toc = navHeadings.length > 1 ? `<nav class="post-toc" aria-label="On this page"><p class="post-toc__title">On this page</p><ul>${navHeadings.map((h) => `<li class="l${h.level}"><a href="#${h.id}" data-toc="${h.id}">${esc(h.text)}</a></li>`).join('')}</ul></nav>` : '';
  const author = post.author ? `<div class="post-meta__author">${post.author.image ? `<img src="${esc(post.author.image)}?w=96&h=96&fit=crop&auto=format" alt="" width="44" height="44">` : `<span class="post-meta__avatar" aria-hidden="true">${esc(post.author.name.trim()[0] || '')}</span>`}<span><strong>${esc(post.author.name)}</strong>${post.author.role ? `<small>${esc(post.author.role)}</small>` : ''}</span></div>` : '';

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} | DOXA Talent</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(url)}">
${img ? `<meta property="og:image" content="${esc(abs(base, imgSrc))}"><meta name="twitter:card" content="summary_large_image">` : ''}
<meta property="article:published_time" content="${esc(post.publishedAt)}">
<link rel="stylesheet" href="/ds/tokens.css"><link rel="stylesheet" href="/ds/bundle.css"><link rel="stylesheet" href="/ds/header.css"><link rel="stylesheet" href="/blog-assets/post.css">${pod ? '<link rel="stylesheet" href="/blog-assets/podcast.css">' : ''}
<script type="application/ld+json">${JSON.stringify(pod ? (({ headline, ...rest }) => ({ ...rest, ...pod.jsonLd }))(jsonLd) : jsonLd).replace(/</g, '\\u003c')}</script>
<script src="/ds/header.js" defer></script>
</head><body>
<a class="post-skip" href="#main-content">Skip to content</a>
${NAV}
<main id="main-content">
  <header class="post-hero"><div class="post-hero__inner">
    <ol class="post-crumbs" aria-label="Breadcrumb"><li><a href="/index.html">Home</a></li><li><a href="/blog">Blog</a></li><li aria-current="page">${esc(post.title)}</li></ol>
    <h1>${esc(post.title)}</h1>
    ${post.excerpt ? `<p class="post-dek">${esc(post.excerpt)}</p>` : ''}
    <div class="post-meta">${author}<span class="post-meta__item"><time datetime="${esc(post.publishedAt)}">${fmtDate(post.publishedAt)}</time></span>${pod ? pod.metaItems : `<span class="post-meta__item">${minutes} min read</span>`}</div>
  </div></header>
  ${pod && pod.hasPlayer ? pod.player : img ? `<figure class="post-feature"><img src="${esc(imgSrc)}" alt="${esc(img.alt || '')}"${img.width ? ` width="${Number(img.width)}" height="${Number(img.height)}"` : ''} fetchpriority="high">${img.caption ? `<figcaption>${esc(img.caption)}</figcaption>` : ''}</figure>` : ''}
  <div class="post-layout${toc ? '' : ' post-layout--solo'}">
    ${toc}
    <div class="post-main"><article class="post-body">${pod ? pod.articleHtml : html}</article>
    ${labels.length ? `<footer class="post-tags"><h2 class="post-tags__title">Tags</h2><ul>${labels.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></footer>` : ''}</div>
  </div>
</main>
${FOOTER}
<script>
(function(){var l=[].slice.call(document.querySelectorAll('.post-toc a'));if(!l.length||!('IntersectionObserver' in window))return;
var m={};l.forEach(function(a){m[a.dataset.toc]=a});
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){l.forEach(function(a){a.classList.remove('is-active');a.removeAttribute('aria-current')});var a=m[e.target.id];if(a){a.classList.add('is-active');a.setAttribute('aria-current','location')}}})},{rootMargin:'-120px 0px -65% 0px'});
Object.keys(m).forEach(function(id){var h=document.getElementById(id);if(h)io.observe(h)});})();
</script>
${pod ? pod.script : ''}
</body></html>`;
}

export function renderNotFound() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Post not found | DOXA Talent</title><link rel="stylesheet" href="/ds/tokens.css"><link rel="stylesheet" href="/ds/bundle.css"><link rel="stylesheet" href="/ds/header.css"><link rel="stylesheet" href="/blog-assets/post.css"><script src="/ds/header.js" defer></script></head><body>${NAV}<main id="main-content"><header class="post-hero"><div class="post-hero__inner"><h1>We couldn't find that post</h1><p class="post-dek">It may have moved or isn't published yet.</p><p><a class="ds-btn ds-btn-accent" href="/index.html">Back to home</a></p></div></header></main>${FOOTER}</body></html>`;
}
