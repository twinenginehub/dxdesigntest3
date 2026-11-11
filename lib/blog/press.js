// Press release template: dateline, "for immediate release" flag, body, boilerplate, media contacts and downloads. Prints cleanly.
import { icon } from './icons.js';
import { esc, toHtml } from './portable.js';
import { shell, safeFile, abs, fmtDate } from './shell.js';

const BOILERPLATE = 'DOXA Talent recruits, directly employs, equips, develops, and supports dedicated offshore professionals for its clients.';
const clean = (s, n = 200) => String(s ?? '').trim().slice(0, n);
const EMAIL = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;

export function renderPress(post, base) {
  const p = post.press || {};
  const { html } = toHtml(post.body);
  const date = fmtDate(post.publishedAt);
  const city = clean(p.location, 60);
  const dateline = `<strong>${esc(city ? `${city.toUpperCase()}, ` : '')}${esc(date)}</strong> — `;
  const body = /^<p>/.test(html) ? html.replace(/^<p>/, `<p class="pr-lead">${dateline}`) : (city || date ? `<p class="pr-lead">${dateline}</p>` : '') + html;
  const boiler = clean(p.boilerplate, 1200) || BOILERPLATE;
  const contacts = (Array.isArray(p.contacts) ? p.contacts : []).filter((c) => c && clean(c.name)).slice(0, 4);
  const assets = (Array.isArray(p.assets) ? p.assets : []).map((a) => ({ title: clean(a && a.title, 120), url: safeFile(a && a.url) })).filter((a) => a.title && a.url).slice(0, 10);
  const img = post.image && safeFile(post.image.url) ? post.image : null;
  const url = `${base}/blog/${post.slug}`;
  const title = post.seoTitle || post.title;
  const desc = post.seoDescription || post.excerpt || '';
  const imgSrc = img ? img.url + (/sanity/.test(img.url) ? '?w=1600&auto=format' : '') : '';

  const contactHtml = contacts.length ? `<section class="pr-card" aria-labelledby="pr-contact"><h2 id="pr-contact">Media contact</h2>${contacts.map((c) => {
    const em = EMAIL.test(clean(c.email)) ? clean(c.email) : '';
    const ph = clean(c.phone, 30).replace(/[^\d+()\-.\s]/g, '');
    return `<p class="pr-contact"><strong>${esc(clean(c.name))}</strong>${c.title ? `<span>${esc(clean(c.title))}</span>` : ''}${em ? `<a href="mailto:${esc(em)}">${esc(em)}</a>` : ''}${ph ? `<a href="tel:${esc(ph.replace(/[^\d+]/g, ''))}">${esc(ph)}</a>` : ''}</p>`;
  }).join('')}</section>` : '';
  const assetHtml = assets.length ? `<section class="pr-card" aria-labelledby="pr-assets"><h2 id="pr-assets">Downloads</h2><ul class="pr-assets">${assets.map((a) => `<li><a href="${esc(a.url)}" download rel="noopener">${icon('download', 16)}${esc(a.title)}</a></li>`).join('')}</ul></section>` : '';

  const main = `
  <header class="pr-hero"><div class="pr-hero__inner">
    <ol class="post-crumbs" aria-label="Breadcrumb"><li><a href="/index.html">Home</a></li><li><a href="/blog">Blog</a></li><li><a href="/blog?type=press">Press</a></li><li aria-current="page">${esc(post.title)}</li></ol>
    <p class="pr-flag">For immediate release</p>
    <h1>${esc(post.title)}</h1>
    ${post.excerpt ? `<p class="post-dek">${esc(post.excerpt)}</p>` : ''}
    <p class="pr-date"><time datetime="${esc(post.publishedAt)}">${esc(date)}</time>${city ? `<span>${esc(city)}</span>` : ''}</p>
  </div></header>
  ${img ? `<figure class="post-feature pr-feature"><img src="${esc(imgSrc)}" alt="${esc(img.alt || '')}"${img.width ? ` width="${Number(img.width)}" height="${Number(img.height)}"` : ''} fetchpriority="high">${img.caption ? `<figcaption>${esc(img.caption)}</figcaption>` : ''}</figure>` : ''}
  <div class="pr-layout">
    <article class="pr-main post-body">${body}
      <p class="pr-end" aria-hidden="true">###</p>
      <section class="pr-about" aria-labelledby="pr-about"><h2 id="pr-about">About DOXA Talent</h2><p>${esc(boiler)}</p></section>
    </article>
    <aside class="pr-aside" aria-label="Press resources">${contactHtml}${assetHtml}<button type="button" class="pr-print" id="pr-print">Print this release</button></aside>
  </div>`;

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'NewsArticle', headline: post.title, description: desc, mainEntityOfPage: url,
    datePublished: post.publishedAt, dateModified: post._updatedAt || post.publishedAt,
    ...(city ? { dateline: `${city}, ${date}` } : {}),
    author: { '@type': 'Organization', name: 'DOXA Talent' },
    ...(img ? { image: abs(base, imgSrc) } : {}),
    publisher: { '@type': 'Organization', name: 'DOXA Talent', logo: { '@type': 'ImageObject', url: `${base}/doxa-logo-navy.png` } },
  };
  return shell({
    title: `${title} | DOXA Talent`, desc, canonical: url, ogType: 'article', ogImage: img ? abs(base, imgSrc) : '', published: post.publishedAt,
    css: ['/blog-assets/post.css', '/blog-assets/data.css', '/blog-assets/press.css'], jsonLd, main,
    scripts: `<script>var b=document.getElementById('pr-print');if(b)b.addEventListener('click',function(){window.print()});</script>`,
  });
}
