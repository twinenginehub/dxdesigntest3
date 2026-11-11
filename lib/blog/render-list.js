import { NAV, FOOTER } from './chrome.js';
import { esc, slugify } from './portable.js';
import { TYPES, typeById, typeBySlug } from './types.js';

const PER_PAGE = 12, ROW = 3;
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
const mins = (p) => Math.max(1, Math.round((p.chars || 0) / 6 / 220));
const img = (u, w) => (u ? u + (/sanity/.test(u) ? `?w=${w}&auto=format` : '') : '');
const icon = (t) => `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${t.icon}</svg>`;
const qs = (o) => { const p = new URLSearchParams(Object.entries(o).filter(([, v]) => v)); const s = p.toString(); return '/blog' + (s ? '?' + s : ''); };

function meta(p, t) {
  const m = p.contentType === 'podcast' ? `${mins(p)} min listen` : p.contentType === 'press' ? fmtDate(p.publishedAt) : `${mins(p)} min read`;
  return `<p class="bl-type">${icon(t)}<span>${esc(t.singular)}</span>${m ? `<span class="bl-dot" aria-hidden="true"></span><span>${esc(m)}</span>` : ''}</p>`;
}
function card(p, o = {}) {
  const t = typeById(p.contentType), src = img(p.image && p.image.url, o.lead ? 1200 : 640);
  return `<a class="bl-card${o.lead ? ' bl-card--lead' : ''}${o.row ? ' bl-card--row' : ''}" href="/blog/${esc(p.slug)}">
  <div class="bl-card__media">${src ? `<img src="${esc(src)}" alt="${esc((p.image && p.image.alt) || '')}" loading="${o.eager ? 'eager' : 'lazy'}">` : `<span class="bl-card__ph">${icon(t)}</span>`}</div>
  <div class="bl-card__body">${meta(p, t)}<h3>${esc(p.title)}</h3>${p.excerpt && (o.lead || o.excerpt !== false) ? `<p class="bl-excerpt">${esc(p.excerpt)}</p>` : ''}<span class="bl-card__cta">${esc(t.cta)}<svg viewBox="0 0 25.22 37.46" width="7" height="10" fill="currentColor" aria-hidden="true"><path d="M12.42,0H.87c3.92,6.27,7.96,12.01,11.76,17.94C8.5,24.29,4.42,30.57.26,37h11.2c.95-.01,1.41-.51,1.86-1.24l11.57-18.1z"/></svg></span></div></a>`;
}

export function renderList(posts, query, base) {
  const type = typeBySlug(query.type);
  const topics = new Map();
  for (const p of posts) if (p.category) { const s = slugify(p.category); const e = topics.get(s) || { name: p.category, n: 0 }; e.n++; topics.set(s, e); }
  const topic = query.topic && topics.has(query.topic) ? query.topic : '';
  const counts = Object.fromEntries(TYPES.map((t) => [t.id, posts.filter((p) => (p.contentType || 'article') === t.id).length]));
  const norm = posts.map((p) => ({ ...p, contentType: p.contentType || 'article' }));

  const tabs = `<nav class="bl-tabs" aria-label="Content type"><ul>
    <li><a href="/blog"${!type && !topic ? ' aria-current="page"' : ''}>All<span>${norm.length}</span></a></li>
    ${TYPES.map((t) => `<li><a href="${qs({ type: t.slug })}"${type && type.id === t.id ? ' aria-current="page"' : ''}>${esc(t.label)}<span>${counts[t.id]}</span></a></li>`).join('')}</ul></nav>`;

  let title = 'Blog', body;
  const filtered = type || topic;
  if (filtered) {
    let list = norm.filter((p) => (!type || p.contentType === type.id) && (!topic || slugify(p.category || '') === topic));
    title = type ? type.label : topics.get(topic).name;
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE)), page = Math.min(pages, Math.max(1, parseInt(query.page, 10) || 1));
    list = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const link = (n) => qs({ type: query.type, topic, page: n > 1 ? n : '' });
    body = `<section class="bl-section"><div class="bl-wrap">
      <div class="bl-head"><div>${topic && !type ? '<p class="bl-eyebrow">Topic</p>' : ''}<h2>${esc(title)}</h2></div></div>
      ${list.length ? `<div class="bl-grid">${list.map((p) => card(p)).join('')}</div>` : '<p class="bl-empty">Nothing here yet. Check back soon.</p>'}
      ${pages > 1 ? `<nav class="bl-pager" aria-label="Pagination">${page > 1 ? `<a href="${link(page - 1)}" rel="prev">Previous</a>` : '<span></span>'}<span>Page ${page} of ${pages}</span>${page < pages ? `<a href="${link(page + 1)}" rel="next">Next</a>` : '<span></span>'}</nav>` : ''}
    </div></section>`;
  } else if (!norm.length) {
    body = '<section class="bl-section"><div class="bl-wrap"><p class="bl-empty">No posts have been published yet.</p></div></section>';
  } else {
    const feat = (norm.filter((p) => p.featured).length >= 3 ? norm.filter((p) => p.featured) : norm).slice(0, 3);
    const topicChips = [...topics.entries()].sort((a, b) => b[1].n - a[1].n).map(([s, t]) => `<li><a href="${qs({ topic: s })}">${esc(t.name)}</a></li>`).join('');
    body = `
    <section class="bl-section" aria-labelledby="bl-feat"><div class="bl-wrap">
      <div class="bl-head"><h2 id="bl-feat">Featured and trending</h2></div>
      <div class="bl-feature">${card(feat[0], { lead: true, eager: true })}<div class="bl-feature__side">${feat.slice(1).map((p) => card(p, { row: true, excerpt: false })).join('')}</div></div>
    </div></section>
    ${topicChips ? `<section class="bl-section bl-section--tint" aria-labelledby="bl-topics"><div class="bl-wrap"><div class="bl-head"><h2 id="bl-topics">Browse by topic</h2></div><ul class="bl-chips">${topicChips}</ul></div></section>` : ''}
    ${TYPES.filter((t) => counts[t.id]).map((t, i) => `<section class="bl-section${i % 2 ? ' bl-section--tint' : ''}" aria-labelledby="bl-${t.id}"><div class="bl-wrap">
      <div class="bl-head"><h2 id="bl-${t.id}">${esc(t.label)}</h2><a class="bl-viewall" href="${qs({ type: t.slug })}">View all<span class="sr-only"> ${esc(t.label)}</span></a></div>
      <div class="bl-grid">${norm.filter((p) => p.contentType === t.id).slice(0, ROW).map((p) => card(p)).join('')}</div></div></section>`).join('')}
    <section class="bl-cta"><div class="bl-wrap bl-cta__inner"><div><h2>Ready to build your team?</h2><p>Placeholder call-to-action copy. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p></div><a class="ds-btn ds-btn-accent" href="/index.html#build-your-team">Build Your Team</a></div></section>`;
  }

  const index = norm.map((p) => ({ t: p.title, s: p.slug, k: p.category || '', e: p.excerpt || '', c: p.contentType, d: p.publishedAt, m: mins(p), i: p.image && p.image.url ? img(p.image.url, 640) : '', a: (p.image && p.image.alt) || '' }));
  const types = Object.fromEntries(TYPES.map((t) => [t.id, { l: t.singular, c: t.cta, i: t.icon }]));
  const pageTitle = filtered ? `${title} | Blog | DOXA Talent` : 'Blog | DOXA Talent';
  const canonical = `${base}/blog${type ? '?type=' + type.slug : topic ? '?topic=' + topic : ''}`;

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(pageTitle)}</title>
<meta name="description" content="Placeholder description. Articles, case studies, learning, podcast episodes, press and whitepapers from DOXA Talent.">
<link rel="canonical" href="${esc(canonical)}">
<link rel="stylesheet" href="/ds/tokens.css"><link rel="stylesheet" href="/ds/bundle.css"><link rel="stylesheet" href="/ds/header.css"><link rel="stylesheet" href="/blog-assets/list.css">
<script src="/ds/header.js" defer></script>
</head><body>
<a class="bl-skip" href="#main-content">Skip to content</a>
${NAV}
<main id="main-content">
  <header class="bl-hero"><div class="bl-wrap">
    <ol class="bl-crumbs" aria-label="Breadcrumb"><li><a href="/index.html">Home</a></li>${filtered ? `<li><a href="/blog">Blog</a></li><li aria-current="page">${esc(title)}</li>` : '<li aria-current="page">Blog</li>'}</ol>
    <h1>${esc(title)}</h1>
    <p class="bl-intro">Placeholder intro. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.</p>
    <form class="bl-search" role="search" onsubmit="return false"><label class="sr-only" for="bl-q">Search the blog</label>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
      <input id="bl-q" type="search" placeholder="Search the blog" autocomplete="off"></form>
    ${tabs}
  </div></header>
  <div id="bl-results" hidden><section class="bl-section"><div class="bl-wrap"><div class="bl-head"><h2 id="bl-results-title" tabindex="-1">Results</h2></div><div class="bl-grid" id="bl-results-grid"></div><p class="bl-empty" id="bl-none" hidden>No matches. Try a different word.</p></div></section></div>
  <div id="bl-sections">${body}</div>
</main>
${FOOTER}
<script type="application/json" id="bl-index">${JSON.stringify({ posts: index, types }).replace(/</g, '\\u003c')}</script>
<script>
(function(){
var d=JSON.parse(document.getElementById('bl-index').textContent),q=document.getElementById('bl-q'),res=document.getElementById('bl-results'),sec=document.getElementById('bl-sections'),grid=document.getElementById('bl-results-grid'),none=document.getElementById('bl-none'),title=document.getElementById('bl-results-title'),tm;
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function card(p){var t=d.types[p.c]||d.types.article,ic='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+t.i+'</svg>';
return '<a class="bl-card" href="/blog/'+encodeURIComponent(p.s)+'"><div class="bl-card__media">'+(p.i?'<img src="'+esc(p.i)+'" alt="'+esc(p.a)+'" loading="lazy">':'<span class="bl-card__ph">'+ic+'</span>')+'</div><div class="bl-card__body"><p class="bl-type">'+ic+'<span>'+esc(t.l)+'</span></p><h3>'+esc(p.t)+'</h3>'+(p.e?'<p class="bl-excerpt">'+esc(p.e)+'</p>':'')+'<span class="bl-card__cta">'+esc(t.c)+'</span></div></a>'}
function run(){var v=q.value.trim().toLowerCase();if(!v){res.hidden=true;sec.hidden=false;return}
var w=v.split(/\\s+/),hits=d.posts.filter(function(p){var h=(p.t+' '+p.e+' '+p.k+' '+((d.types[p.c]||{}).l||'')).toLowerCase();return w.every(function(x){return h.indexOf(x)>-1})});
grid.innerHTML=hits.map(card).join('');none.hidden=hits.length>0;title.textContent=hits.length+(hits.length===1?' result':' results');res.hidden=false;sec.hidden=true}
q.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(run,150)});
})();
</script>
</body></html>`;
}
