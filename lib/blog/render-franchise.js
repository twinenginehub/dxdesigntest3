// Franchise Blog listing at /franchise-blog. Same visual system as /blog (list.css); filters by audience and topic.
import { NAV, FOOTER } from './chrome.js';
import { esc, slugify } from './portable.js';

const PER_PAGE = 12;
const BASE = '/franchise-blog';
const AUDIENCES = [{ slug: 'franchisors', label: 'Franchisors', match: 'Franchisors' }, { slug: 'franchisees', label: 'Franchisees', match: 'Franchisees' }];
const ICON = '<path d="M4 10l1.5-5h13L20 10M4 10v10h16V10M4 10h16M9 20v-5h6v5"/>';
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
const mins = (p) => Math.max(1, Math.round((p.chars || 0) / 6 / 220));
const img = (u, w) => (u ? u + (/sanity/.test(u) ? `?w=${w}&auto=format` : '') : '');
const svg = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON}</svg>`;
const qs = (o) => { const p = new URLSearchParams(Object.entries(o).filter(([, v]) => v)); const s = p.toString(); return BASE + (s ? '?' + s : ''); };
const ARROW = '<svg viewBox="0 0 25.22 37.46" width="7" height="10" fill="currentColor" aria-hidden="true"><path d="M12.42,0H.87c3.92,6.27,8.39,13.51,12.19,18.73C9.26,23.95,4.79,31.19.87,37.46h11.55l12.93-18.73L12.42,0Z"/></svg>';

function card(p, o = {}) {
  const src = img(p.image && p.image.url, o.lead ? 1200 : 640);
  return `<a class="bl-card${o.lead ? ' bl-card--lead' : ''}${o.row ? ' bl-card--row' : ''}" href="${BASE}/${esc(p.slug)}">
  <div class="bl-card__media">${src ? `<img src="${esc(src)}" alt="${esc((p.image && p.image.alt) || '')}" loading="${o.eager ? 'eager' : 'lazy'}">` : `<span class="bl-card__ph">${svg}</span>`}</div>
  <div class="bl-card__body"><p class="bl-type">${svg}<span>${esc(p.audience ? `For ${p.audience.toLowerCase()}` : 'Franchise')}</span><span class="bl-dot" aria-hidden="true"></span><span>${mins(p)} min read</span></p><h3>${esc(p.title)}</h3>${p.excerpt && (o.lead || o.excerpt !== false) ? `<p class="bl-excerpt">${esc(p.excerpt)}</p>` : ''}<span class="bl-card__cta">Read article${ARROW}</span></div></a>`;
}

export function renderFranchiseList(posts, query, base) {
  const aud = AUDIENCES.find((a) => a.slug === query.audience) || null;
  const topics = new Map();
  for (const p of posts) if (p.category) { const s = slugify(p.category); const e = topics.get(s) || { name: p.category, n: 0 }; e.n++; topics.set(s, e); }
  const topic = query.topic && topics.has(query.topic) ? query.topic : '';
  const count = (a) => posts.filter((p) => p.audience === a.match).length;
  const tabs = `<nav class="bl-tabs" aria-label="Audience"><ul><li><a href="${BASE}"${!aud && !topic ? ' aria-current="page"' : ''}>All<span>${posts.length}</span></a></li>${AUDIENCES.map((a) => `<li><a href="${qs({ audience: a.slug })}"${aud && aud.slug === a.slug ? ' aria-current="page"' : ''}>${esc(a.label)}<span>${count(a)}</span></a></li>`).join('')}</ul></nav>`;

  const filtered = aud || topic;
  let list = posts.filter((p) => (!aud || p.audience === aud.match) && (!topic || slugify(p.category || '') === topic));
  const title = aud ? `For ${aud.label.toLowerCase()}` : topic ? topics.get(topic).name : 'Franchise Blog';
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE)), page = Math.min(pages, Math.max(1, parseInt(query.page, 10) || 1));
  const shown = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const link = (n) => qs({ audience: aud ? aud.slug : '', topic, page: n > 1 ? n : '' });
  const grid = `${shown.length ? `<div class="bl-grid">${shown.map((p) => card(p)).join('')}</div>` : '<p class="bl-empty">Nothing here yet. Check back soon.</p>'}
    ${pages > 1 ? `<nav class="bl-pager" aria-label="Pagination">${page > 1 ? `<a href="${link(page - 1)}" rel="prev">Previous</a>` : '<span></span>'}<span>Page ${page} of ${pages}</span>${page < pages ? `<a href="${link(page + 1)}" rel="next">Next</a>` : '<span></span>'}</nav>` : ''}`;

  let body;
  if (!posts.length) body = '<section class="bl-section"><div class="bl-wrap"><p class="bl-empty">No posts have been published yet.</p></div></section>';
  else if (filtered || page > 1) body = `<section class="bl-section"><div class="bl-wrap"><div class="bl-head"><h2>${esc(title)}</h2></div>${grid}</div></section>`;
  else {
    const feat = (posts.filter((p) => p.featured).length >= 3 ? posts.filter((p) => p.featured) : posts).slice(0, 3);
    const chips = [...topics.entries()].sort((a, b) => b[1].n - a[1].n).map(([s, t]) => `<li><a href="${qs({ topic: s })}">${esc(t.name)}</a></li>`).join('');
    body = `${feat.length === 3 ? `<section class="bl-section" aria-labelledby="fr-feat"><div class="bl-wrap"><div class="bl-head"><h2 id="fr-feat">Featured</h2></div><div class="bl-feature">${card(feat[0], { lead: true, eager: true })}<div class="bl-feature__side">${feat.slice(1).map((p) => card(p, { row: true, excerpt: false })).join('')}</div></div></div></section>` : ''}
    ${chips ? `<section class="bl-section bl-section--tint" aria-labelledby="fr-topics"><div class="bl-wrap"><div class="bl-head"><h2 id="fr-topics">Browse by topic</h2></div><ul class="bl-chips">${chips}</ul></div></section>` : ''}
    <section class="bl-section" aria-labelledby="fr-latest"><div class="bl-wrap"><div class="bl-head"><h2 id="fr-latest">Latest</h2></div>${grid}</div></section>
    <section class="bl-cta"><div class="bl-wrap bl-cta__inner"><div><h2>Support every location from day one</h2><p>Placeholder call-to-action copy for franchise brands. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p></div><a class="ds-btn ds-btn-accent" href="/index.html#build-your-team">Build Your Team</a></div></section>`;
  }

  const index = posts.map((p) => ({ t: p.title, s: p.slug, k: p.category || '', a: p.audience || '', e: p.excerpt || '', m: mins(p), i: p.image && p.image.url ? img(p.image.url, 640) : '', x: (p.image && p.image.alt) || '' }));
  const canonical = `${base}${BASE}${aud ? '?audience=' + aud.slug : topic ? '?topic=' + topic : ''}`;
  const pageTitle = filtered ? `${title} | Franchise Blog | DOXA Talent` : 'Franchise Blog | DOXA Talent';

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(pageTitle)}</title>
<meta name="description" content="Placeholder description. Practical guidance for franchisors and franchisees on staffing, operations and growth.">
<link rel="canonical" href="${esc(canonical)}">
<link rel="stylesheet" href="/ds/tokens.css"><link rel="stylesheet" href="/ds/bundle.css"><link rel="stylesheet" href="/ds/header.css"><link rel="stylesheet" href="/blog-assets/list.css">
<script src="/ds/header.js" defer></script>
</head><body>
<a class="bl-skip" href="#main-content">Skip to content</a>
${NAV}
<main id="main-content">
  <header class="bl-hero"><div class="bl-wrap">
    <ol class="bl-crumbs" aria-label="Breadcrumb"><li><a href="/index.html">Home</a></li>${filtered ? `<li><a href="${BASE}">Franchise Blog</a></li><li aria-current="page">${esc(title)}</li>` : '<li aria-current="page">Franchise Blog</li>'}</ol>
    <h1>${esc(title)}</h1>
    <p class="bl-intro">Placeholder intro. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.</p>
    <form class="bl-search" role="search" onsubmit="return false"><label class="sr-only" for="bl-q">Search the franchise blog</label>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
      <input id="bl-q" type="search" placeholder="Search the franchise blog" autocomplete="off"></form>
    ${tabs}
  </div></header>
  <div id="bl-results" hidden><section class="bl-section"><div class="bl-wrap"><div class="bl-head"><h2 id="bl-results-title" tabindex="-1">Results</h2></div><div class="bl-grid" id="bl-results-grid"></div><p class="bl-empty" id="bl-none" hidden>No matches. Try a different word.</p></div></section></div>
  <div id="bl-sections">${body}</div>
</main>
${FOOTER}
<script type="application/json" id="bl-index">${JSON.stringify({ posts: index }).replace(/</g, '\\u003c')}</script>
<script>
(function(){
var d=JSON.parse(document.getElementById('bl-index').textContent),q=document.getElementById('bl-q'),res=document.getElementById('bl-results'),sec=document.getElementById('bl-sections'),grid=document.getElementById('bl-results-grid'),none=document.getElementById('bl-none'),title=document.getElementById('bl-results-title'),tm;
var ic='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON}</svg>';
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function card(p){return '<a class="bl-card" href="${BASE}/'+encodeURIComponent(p.s)+'"><div class="bl-card__media">'+(p.i?'<img src="'+esc(p.i)+'" alt="'+esc(p.x)+'" loading="lazy">':'<span class="bl-card__ph">'+ic+'</span>')+'</div><div class="bl-card__body"><p class="bl-type">'+ic+'<span>'+esc(p.a?'For '+p.a.toLowerCase():'Franchise')+'</span><span class="bl-dot" aria-hidden="true"></span><span>'+p.m+' min read</span></p><h3>'+esc(p.t)+'</h3>'+(p.e?'<p class="bl-excerpt">'+esc(p.e)+'</p>':'')+'<span class="bl-card__cta">Read article</span></div></a>'}
function run(){var v=q.value.trim().toLowerCase();if(!v){res.hidden=true;sec.hidden=false;return}
var w=v.split(/\\s+/),hits=d.posts.filter(function(p){var h=(p.t+' '+p.e+' '+p.k+' '+p.a).toLowerCase();return w.every(function(x){return h.indexOf(x)>-1})});
grid.innerHTML=hits.map(card).join('');none.hidden=hits.length>0;title.textContent=hits.length+(hits.length===1?' result':' results');res.hidden=false;sec.hidden=true}
q.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(run,150)});
})();
</script>
</body></html>`;
}
