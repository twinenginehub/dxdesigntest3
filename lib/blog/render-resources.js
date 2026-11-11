// Resources hub at /resources: gated downloads (checklists, courses, guides, reports, templates) with a filter panel
// (resource type, topic, resources for, business size). Every card is in the server-rendered HTML; a small script filters them
// in the browser, updates the counts and keeps the URL in sync (?type=checklist&type=guide).
import { NAV, FOOTER } from './chrome.js';
import { esc } from './portable.js';
import { safeFile, abs } from './shell.js';
import { icon } from './icons.js';
import { RESOURCE_TYPES, resourceTypeById } from './types.js';
import { ctaFinal, CTA_CSS } from './cta.js';

const PER = 12;
const SIZE_ORDER = ['Under 50 employees', '50 to 500 employees', 'Over 500 employees'];
const clean = (s, n = 120) => String(s ?? '').trim().slice(0, n);
const arr = (a) => (Array.isArray(a) ? a : []).map((x) => clean(x, 60)).filter(Boolean);
const ARROW = '<svg viewBox="0 0 25.22 37.46" width="7" height="10" fill="currentColor" aria-hidden="true"><path d="M12.42,0H.87c3.92,6.27,8.39,13.51,12.19,18.73C9.26,23.95,4.79,31.19.87,37.46h11.55l12.93-18.73L12.42,0Z"/></svg>';

function norm(r) {
  const t = resourceTypeById(clean(r.assetType, 30));
  return { r, t, slug: clean(r.slug, 100), title: clean(r.title, 160), summary: clean(r.summary, 220), topic: clean(r.topic, 50), audience: arr(r.audience), size: arr(r.businessSize),
    cover: r.cover && safeFile(r.cover.url) ? r.cover : null, pages: Number(r.pages) > 0 ? Math.round(Number(r.pages)) : null };
}

function card(c, i) {
  const src = c.cover ? c.cover.url + (/sanity/.test(c.cover.url) ? '?w=640&auto=format' : '') : '';
  return `<li class="rs-item" data-type="${esc(c.t.slug)}" data-topic="${esc(c.topic)}" data-audience="${esc(c.audience.join('|'))}" data-size="${esc(c.size.join('|'))}">
  <a class="rs-card" href="/resources/${esc(c.slug)}">
    <div class="rs-card__media">${src ? `<img src="${esc(src)}" alt="${esc((c.cover && c.cover.alt) || '')}" loading="${i < 4 ? 'eager' : 'lazy'}">` : `<span class="rs-card__ph">${icon(c.t.icon, 44)}</span>`}</div>
    <div class="rs-card__body">
      <p class="rs-type">${icon(c.t.icon, 16)}<span>${esc(c.t.id)}</span>${c.pages ? `<span class="bl-dot" aria-hidden="true"></span><span>${c.pages} ${c.pages === 1 ? 'page' : 'pages'}</span>` : ''}</p>
      <h3>${esc(c.title)}</h3>
      ${c.summary ? `<p class="rs-summary">${esc(c.summary)}</p>` : ''}
      ${c.topic ? `<ul class="rs-tags"><li class="ds-tag">${esc(c.topic)}</li></ul>` : ''}
      <span class="bl-card__cta">${esc(c.t.cta)}${ARROW}</span>
    </div>
  </a></li>`;
}

export function renderResources(resources, base) {
  const items = resources.map(norm);
  const count = (get, v) => items.filter((c) => get(c).includes(v)).length;
  const typeOpts = RESOURCE_TYPES.map((t) => ({ value: t.slug, label: t.plural, n: items.filter((c) => c.t.id === t.id).length })).filter((o) => o.n);
  const uniq = (get) => [...new Set(items.flatMap(get))];
  const topicOpts = uniq((c) => (c.topic ? [c.topic] : [])).sort((a, b) => a.localeCompare(b)).map((v) => ({ value: v, label: v, n: count((c) => (c.topic ? [c.topic] : []), v) }));
  const audOpts = uniq((c) => c.audience).sort((a, b) => a.localeCompare(b)).map((v) => ({ value: v, label: v, n: count((c) => c.audience, v) }));
  const sizeOpts = uniq((c) => c.size).sort((a, b) => (SIZE_ORDER.indexOf(a) + 1 || 99) - (SIZE_ORDER.indexOf(b) + 1 || 99)).map((v) => ({ value: v, label: v, n: count((c) => c.size, v) }));
  const facet = (key, legend, opts) => opts.length ? `<details class="rs-facet" open><summary><span>${esc(legend)}</span>${icon('chevron-down', 18)}</summary><div class="rs-facet__opts" role="group" aria-label="${esc(legend)}">${opts.map((o, i) => `<label class="rs-opt"><input type="checkbox" name="${key}" value="${esc(o.value)}" id="rs-${key}-${i}"><span class="rs-box" aria-hidden="true">${icon('check', 14)}</span><span class="rs-opt__label">${esc(o.label)}</span><span class="rs-opt__count" data-count>(${o.n})</span></label>`).join('')}</div></details>` : '';

  const body = !items.length
    ? '<section class="bl-section"><div class="bl-wrap"><p class="bl-empty">No resources have been published yet.</p></div></section>'
    : `<section class="bl-section rs-section"><div class="bl-wrap rs-layout">
      <aside class="rs-filters" aria-label="Filter resources">
        <button type="button" class="rs-toggle" id="rs-toggle" aria-expanded="false" aria-controls="rs-panel">${icon('filter', 18)}<span>Filter resources</span></button>
        <form id="rs-panel" class="rs-panel" onsubmit="return false">
          <p class="rs-panel__title">Filter resources</p>
          ${facet('type', 'Resource type', typeOpts)}${facet('topic', 'Topic', topicOpts)}${facet('audience', 'Resources for', audOpts)}${facet('size', 'Business size', sizeOpts)}
          <button type="button" class="rs-clear" id="rs-clear" hidden>Clear all</button>
        </form>
      </aside>
      <div class="rs-results">
        <p class="sr-only" id="rs-count" role="status" aria-live="polite">${items.length} ${items.length === 1 ? 'resource' : 'resources'}</p>
        <ul class="rs-grid" id="rs-grid">${items.map(card).join('')}</ul>
        <div class="bl-empty cs-none" id="rs-none" hidden><p>No resources match those filters.</p><button type="button" class="ds-btn ds-btn-primary" id="rs-reset">Clear filters</button></div>
        <div class="cs-more"><button type="button" class="ds-btn ds-btn-primary" id="rs-more" hidden>Load more</button></div>
      </div>
    </div></section>`;

  const url = `${base}/resources`;
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Resources', url, publisher: { '@type': 'Organization', name: 'DOXA Talent' },
    mainEntity: { '@type': 'ItemList', itemListElement: items.slice(0, 50).map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(base, `/resources/${c.slug}`), name: c.title })) } };

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Resources | DOXA Talent</title>
<meta name="description" content="Placeholder description. Free checklists, courses, guides, reports and templates for building dedicated offshore teams.">
<link rel="canonical" href="${esc(url)}">
<link rel="stylesheet" href="/ds/tokens.css"><link rel="stylesheet" href="/ds/bundle.css"><link rel="stylesheet" href="/ds/header.css"><link rel="stylesheet" href="/blog-assets/list.css"><link rel="stylesheet" href="/blog-assets/cases.css"><link rel="stylesheet" href="/blog-assets/resources.css"><link rel="stylesheet" href="${CTA_CSS}">
<noscript><style>.rs-filters{display:none}</style></noscript>
<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
<script src="/ds/header.js" defer></script>
</head><body>
<a class="bl-skip" href="#main-content">Skip to content</a>
${NAV}
<main id="main-content">
  <header class="bl-hero rs-hero"><div class="bl-wrap">
    <ol class="bl-crumbs" aria-label="Breadcrumb"><li><a href="/index.html">Home</a></li><li aria-current="page">Resources</li></ol>
    <h1>Resources</h1>
    <p class="bl-intro">Placeholder intro. Free checklists, courses, guides, reports and templates for building and managing dedicated teams.</p>
  </div></header>
  ${body}
  ${ctaFinal()}
</main>
${FOOTER}
<script>
(function(){
var grid=document.getElementById('rs-grid');if(!grid)return;
var PER=${PER},items=[].slice.call(grid.children),boxes=[].slice.call(document.querySelectorAll('.rs-panel input[type=checkbox]')),
clear=document.getElementById('rs-clear'),reset=document.getElementById('rs-reset'),more=document.getElementById('rs-more'),count=document.getElementById('rs-count'),none=document.getElementById('rs-none'),
toggle=document.getElementById('rs-toggle'),panel=document.getElementById('rs-panel'),shown=PER;
var KEYS=['type','topic','audience','size'];
function vals(it,k){var v=it.dataset[k]||'';return k==='audience'||k==='size'?(v?v.split('|'):[]):(v?[v]:[])}
function selected(){var s={};KEYS.forEach(function(k){s[k]=boxes.filter(function(b){return b.name===k&&b.checked}).map(function(b){return b.value})});return s}
function matches(it,s,skip){for(var i=0;i<KEYS.length;i++){var k=KEYS[i];if(k===skip||!s[k].length)continue;var v=vals(it,k);if(!s[k].some(function(x){return v.indexOf(x)>-1}))return false}return true}
function sync(s){try{var p=new URLSearchParams();KEYS.forEach(function(k){s[k].forEach(function(v){p.append(k,v)})});var q=p.toString();history.replaceState(null,'',location.pathname+(q?'?'+q:''))}catch(e){}}
function run(resetShown,focusNew){
if(resetShown)shown=PER;
var s=selected(),any=KEYS.some(function(k){return s[k].length}),hits=items.filter(function(it){return matches(it,s)}),firstNew=hits[shown-PER];
items.forEach(function(it){it.hidden=true});hits.forEach(function(it,i){it.hidden=i>=shown});
boxes.forEach(function(b){var n=items.filter(function(it){return matches(it,s,b.name)&&vals(it,b.name).indexOf(b.value)>-1}).length;var c=b.parentNode.querySelector('[data-count]');c.textContent='('+n+')';b.parentNode.classList.toggle('is-empty',n===0&&!b.checked)});
var n=hits.length;count.textContent=n+(n===1?' resource':' resources');
none.hidden=n>0;more.hidden=n<=shown;clear.hidden=!any;
if(focusNew&&firstNew){var a=firstNew.querySelector('a');if(a)a.focus()}
sync(s)}
function clearAll(){boxes.forEach(function(b){b.checked=false});run(true);if(boxes[0])boxes[0].focus()}
boxes.forEach(function(b){b.addEventListener('change',function(){run(true)})});
clear.addEventListener('click',clearAll);reset.addEventListener('click',clearAll);
more.addEventListener('click',function(){shown+=PER;run(false,true)});
toggle.addEventListener('click',function(){var o=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!o));panel.classList.toggle('is-open',!o)});
try{var p=new URLSearchParams(location.search);boxes.forEach(function(b){if(p.getAll(b.name).indexOf(b.value)>-1)b.checked=true})}catch(e){}
run(true);
})();
</script>
</body></html>`;
}
