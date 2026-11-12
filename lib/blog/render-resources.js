// Resources hub at /resources: articles and gated downloads (checklists, courses, guides, reports, templates, tools, webinars).
// Filtering follows the Deel resource hub: a search bar and a Filter button that opens a slide-in drawer (collapsible groups with counts,
// "Clear all" and "Apply (N results)"), active filters shown as removable chips with "Showing X of Y results".
// Every card is in the server-rendered HTML; a small script filters them in the browser and keeps the URL in sync (?type=checklist&type=guide).
import { NAV, FOOTER } from './chrome.js';
import { esc } from './portable.js';
import { safeFile, abs } from './shell.js';
import { icon } from './icons.js';
import { RESOURCE_TYPES, resourceTypeById } from './types.js';
import { ctaFinal, CTA_CSS } from './cta.js';

const PER = 12;
const SIZE_ORDER = ['Startup', 'Mid-market', 'Enterprise'];
const clean = (s, n = 120) => String(s ?? '').trim().slice(0, n);
const arr = (a) => (Array.isArray(a) ? a : []).map((x) => clean(x, 60)).filter(Boolean);
const ARROW = '<svg viewBox="0 0 25.22 37.46" width="7" height="10" fill="currentColor" aria-hidden="true"><path d="M12.42,0H.87c3.92,6.27,8.39,13.51,12.19,18.73C9.26,23.95,4.79,31.19.87,37.46h11.55l12.93-18.73L12.42,0Z"/></svg>';

function norm(r) {
  const t = resourceTypeById(clean(r.assetType, 30));
  const slug = clean(r.slug, 100);
  return { r, t, slug, href: t.id === 'Article' ? `/blog/${encodeURIComponent(slug)}` : `/resources/${encodeURIComponent(slug)}`, minutes: Number(r.minutes) > 0 ? Math.round(Number(r.minutes)) : null, title: clean(r.title, 160), summary: clean(r.summary, 220), topic: clean(r.topic, 50), audience: arr(r.audience), size: arr(r.businessSize),
    cover: r.cover && safeFile(r.cover.url) ? r.cover : null, pages: Number(r.pages) > 0 ? Math.round(Number(r.pages)) : null };
}

function card(c, i) {
  const src = c.cover ? c.cover.url + (/sanity/.test(c.cover.url) ? '?w=640&auto=format' : '') : '';
  return `<li class="rs-item" data-type="${esc(c.t.slug)}" data-topic="${esc(c.topic)}" data-audience="${esc(c.audience.join('|'))}" data-size="${esc(c.size.join('|'))}" data-q="${esc([c.title, c.summary, c.topic, c.t.id, c.t.plural, c.audience.join(' '), c.size.join(' ')].join(' ').toLowerCase())}">
  <a class="rs-card" href="${esc(c.href)}">
    <div class="rs-card__media">${src ? `<img src="${esc(src)}" alt="${esc((c.cover && c.cover.alt) || '')}" loading="${i < 4 ? 'eager' : 'lazy'}">` : `<span class="rs-card__ph">${icon(c.t.icon, 44)}</span>`}</div>
    <div class="rs-card__body">
      <p class="rs-type">${icon(c.t.icon, 16)}<span>${esc(c.t.id)}</span>${c.pages ? `<span class="bl-dot" aria-hidden="true"></span><span>${c.pages} ${c.pages === 1 ? 'page' : 'pages'}</span>` : c.minutes ? `<span class="bl-dot" aria-hidden="true"></span><span>${c.minutes} min read</span>` : ''}</p>
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
  const facet = (key, legend, opts, open) => opts.length ? `<details class="rs-facet"${open ? ' open' : ''}><summary><span>${esc(legend)}</span>${icon('chevron-down', 18)}</summary><div class="rs-facet__opts" role="group" aria-label="${esc(legend)}">${opts.map((o, i) => `<label class="rs-opt"><input type="checkbox" name="${key}" value="${esc(o.value)}" id="rs-${key}-${i}"><span class="rs-box" aria-hidden="true">${icon('check', 14)}</span><span class="rs-opt__label">${esc(o.label)}</span><span class="rs-opt__count" data-count>${o.n}</span></label>`).join('')}</div></details>` : '';

  const body = !items.length
    ? '<section class="bl-section"><div class="bl-wrap"><p class="bl-empty">No resources have been published yet.</p></div></section>'
    : `<section class="rs-resultsbar" aria-label="Active filters"><div class="bl-wrap rs-resultsbar__row">
        <p class="rs-showing" id="rs-count" role="status" aria-live="polite">Showing ${Math.min(items.length, PER)} of ${items.length} results</p>
        <ul class="rs-chips" id="rs-chips" aria-label="Applied filters"></ul>
        <button type="button" class="rs-clearlink" id="rs-clear" hidden>Clear all</button>
      </div></section>
      <section class="bl-section rs-section" aria-label="Resources"><div class="bl-wrap">
        <ul class="rs-grid" id="rs-grid">${items.map(card).join('')}</ul>
        <div class="bl-empty cs-none" id="rs-none" hidden><p>No resources match your search and filters.</p><button type="button" class="ds-btn ds-btn-primary" id="rs-reset">Clear search and filters</button></div>
        <div class="cs-more"><button type="button" class="ds-btn ds-btn-primary" id="rs-more" hidden>Load more</button></div>
      </div></section>
      <div class="rs-scrim" id="rs-scrim" hidden></div>
      <aside class="rs-drawer" id="rs-drawer" role="dialog" aria-modal="true" aria-labelledby="rs-drawer-h" hidden>
        <div class="rs-drawer__head"><h2 id="rs-drawer-h">Filter resources</h2><button type="button" class="rs-close" id="rs-close" aria-label="Close filters">${icon('x', 20)}</button></div>
        <form class="rs-drawer__body" id="rs-form" onsubmit="return false">${facet('type', 'Resource types', typeOpts, true)}${facet('topic', 'Topics', topicOpts)}${facet('audience', 'Resources for', audOpts)}${facet('size', 'Business size', sizeOpts)}</form>
        <div class="rs-drawer__foot"><button type="button" class="rs-clearlink" id="rs-clear-pending">Clear all</button><button type="button" class="ds-btn ds-btn-primary btn-md" id="rs-apply"><span>Apply (<span id="rs-apply-n">${items.length}</span> results)</span></button></div>
      </aside>`;

  const url = `${base}/resources`;
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Resources', url, publisher: { '@type': 'Organization', name: 'DOXA Talent' },
    mainEntity: { '@type': 'ItemList', itemListElement: items.slice(0, 50).map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(base, c.href), name: c.title })) } };

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Resources | DOXA Talent</title>
<meta name="description" content="Placeholder description. Articles, checklists, courses, guides, reports and templates for building dedicated offshore teams.">
<link rel="canonical" href="${esc(url)}">
<link rel="stylesheet" href="/ds/tokens.css"><link rel="stylesheet" href="/ds/bundle.css"><link rel="stylesheet" href="/ds/header.css"><link rel="stylesheet" href="/blog-assets/list.css"><link rel="stylesheet" href="/blog-assets/cases.css"><link rel="stylesheet" href="/blog-assets/resources.css"><link rel="stylesheet" href="${CTA_CSS}">
<noscript><style>.rs-bar,.rs-resultsbar{display:none}</style></noscript>
<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
<script src="/ds/header.js" defer></script>
</head><body>
<a class="bl-skip" href="#main-content">Skip to content</a>
${NAV}
<main id="main-content">
  <header class="bl-hero rs-hero"><div class="bl-wrap">
    <ol class="bl-crumbs" aria-label="Breadcrumb"><li><a href="/index.html">Home</a></li><li aria-current="page">Resources</li></ol>
    <h1>Resources</h1>
    <p class="bl-intro">Placeholder intro. Articles, checklists, courses, guides, reports and templates for building and managing dedicated teams.</p>
    ${items.length ? `<div class="rs-bar">
      <form class="bl-search rs-search" role="search" onsubmit="return false"><label class="sr-only" for="rs-q">Find a resource</label>
        ${icon('search', 20)}<input id="rs-q" type="search" placeholder="Find a resource" autocomplete="off"></form>
      <button type="button" class="ds-btn ds-btn-secondary on-dark btn-md rs-open" id="rs-open" aria-haspopup="dialog" aria-controls="rs-drawer">${icon('filter', 18)}<span>Filter</span><span class="rs-open__n" id="rs-open-n" hidden></span></button>
    </div>` : ''}
  </div></header>
  ${body}
  ${ctaFinal()}
</main>
${FOOTER}
<script>
(function(){
var grid=document.getElementById('rs-grid');if(!grid)return;
var PER=${PER},items=[].slice.call(grid.children),boxes=[].slice.call(document.querySelectorAll('#rs-form input[type=checkbox]')),
q=document.getElementById('rs-q'),openBtn=document.getElementById('rs-open'),openN=document.getElementById('rs-open-n'),drawer=document.getElementById('rs-drawer'),scrim=document.getElementById('rs-scrim'),
closeBtn=document.getElementById('rs-close'),apply=document.getElementById('rs-apply'),applyN=document.getElementById('rs-apply-n'),clearPending=document.getElementById('rs-clear-pending'),
clear=document.getElementById('rs-clear'),reset=document.getElementById('rs-reset'),more=document.getElementById('rs-more'),count=document.getElementById('rs-count'),none=document.getElementById('rs-none'),chips=document.getElementById('rs-chips'),
KEYS=['type','topic','audience','size'],applied={type:[],topic:[],audience:[],size:[],q:''},shown=PER,tm;
function vals(it,k){var v=it.dataset[k]||'';return k==='audience'||k==='size'?(v?v.split('|'):[]):(v?[v]:[])}
function matches(it,s,skip){var w=s.q?s.q.toLowerCase().split(/\\s+/):[];for(var i=0;i<w.length;i++)if(it.dataset.q.indexOf(w[i])<0)return false;
for(var j=0;j<KEYS.length;j++){var k=KEYS[j];if(k===skip||!s[k].length)continue;var v=vals(it,k);if(!s[k].some(function(x){return v.indexOf(x)>-1}))return false}return true}
function readBoxes(){var s={q:applied.q};KEYS.forEach(function(k){s[k]=boxes.filter(function(b){return b.name===k&&b.checked}).map(function(b){return b.value})});return s}
function setBoxes(s){boxes.forEach(function(b){b.checked=s[b.name].indexOf(b.value)>-1})}
function labelOf(b){return b.parentNode.querySelector('.rs-opt__label').textContent}
function updateCounts(){var s=readBoxes();boxes.forEach(function(b){var n=items.filter(function(it){return matches(it,s,b.name)&&vals(it,b.name).indexOf(b.value)>-1}).length;b.parentNode.querySelector('[data-count]').textContent=n;b.parentNode.classList.toggle('is-empty',n===0&&!b.checked)});
var n=items.filter(function(it){return matches(it,s)}).length;applyN.textContent=n}
function sync(){try{var p=new URLSearchParams();if(applied.q)p.set('q',applied.q);KEYS.forEach(function(k){applied[k].forEach(function(v){p.append(k,v)})});var s=p.toString();history.replaceState(null,'',location.pathname+(s?'?'+s:''))}catch(e){}}
function render(resetShown,focusNew){
if(resetShown)shown=PER;
var hits=items.filter(function(it){return matches(it,applied)}),firstNew=hits[shown-PER],nf=KEYS.reduce(function(a,k){return a+applied[k].length},0),any=nf>0||!!applied.q;
items.forEach(function(it){it.hidden=true});hits.forEach(function(it,i){it.hidden=i>=shown});
var vis=Math.min(shown,hits.length);count.textContent='Showing '+vis+' of '+hits.length+' results';
chips.innerHTML='';KEYS.forEach(function(k){applied[k].forEach(function(v){var b=boxes.filter(function(x){return x.name===k&&x.value===v})[0];var li=document.createElement('li'),bt=document.createElement('button');bt.type='button';bt.className='ds-tag rs-chip';bt.setAttribute('aria-label','Remove filter: '+(b?labelOf(b):v));bt.dataset.k=k;bt.dataset.v=v;bt.innerHTML=${JSON.stringify(icon('x', 14))}+'<span></span>';bt.lastChild.textContent=b?labelOf(b):v;li.appendChild(bt);chips.appendChild(li)})});
none.hidden=hits.length>0;more.hidden=hits.length<=shown;clear.hidden=!any;
openN.hidden=nf===0;openN.textContent=nf;
if(focusNew&&firstNew){var a=firstNew.querySelector('a');if(a)a.focus()}
sync()}
var lastFocus=null;
function openDrawer(){lastFocus=document.activeElement;setBoxes(applied);updateCounts();drawer.hidden=false;scrim.hidden=false;document.documentElement.style.overflow='hidden';
requestAnimationFrame(function(){drawer.classList.add('is-open');scrim.classList.add('is-open')});closeBtn.focus();
KEYS.forEach(function(k){if(applied[k].length){var f=boxes.filter(function(b){return b.name===k})[0];if(f)f.closest('details').open=true}})}
function closeDrawer(commit){if(!commit)setBoxes(applied);drawer.classList.remove('is-open');scrim.classList.remove('is-open');document.documentElement.style.overflow='';
setTimeout(function(){drawer.hidden=true;scrim.hidden=true},200);if(lastFocus&&lastFocus.focus)lastFocus.focus()}
openBtn.addEventListener('click',openDrawer);closeBtn.addEventListener('click',function(){closeDrawer(false)});scrim.addEventListener('click',function(){closeDrawer(false)});
document.addEventListener('keydown',function(e){if(drawer.hidden)return;if(e.key==='Escape'){closeDrawer(false);return}
if(e.key==='Tab'){var f=[].slice.call(drawer.querySelectorAll('button,input,summary,[href]')).filter(function(x){return x.offsetParent!==null});if(!f.length)return;var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});
boxes.forEach(function(b){b.addEventListener('change',updateCounts)});
clearPending.addEventListener('click',function(){boxes.forEach(function(b){b.checked=false});updateCounts()});
apply.addEventListener('click',function(){var s=readBoxes();KEYS.forEach(function(k){applied[k]=s[k]});render(true);closeDrawer(true)});
chips.addEventListener('click',function(e){var b=e.target.closest('.rs-chip');if(!b)return;var k=b.dataset.k;applied[k]=applied[k].filter(function(v){return v!==b.dataset.v});render(true);openBtn.focus()});
function clearAll(){applied={type:[],topic:[],audience:[],size:[],q:''};q.value='';render(true);q.focus()}
clear.addEventListener('click',clearAll);reset.addEventListener('click',clearAll);
more.addEventListener('click',function(){shown+=PER;render(false,true)});
q.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(function(){applied.q=q.value.trim();render(true)},150)});
try{var p=new URLSearchParams(location.search);applied.q=(p.get('q')||'').trim();q.value=applied.q;KEYS.forEach(function(k){applied[k]=p.getAll(k).filter(function(v){return boxes.some(function(b){return b.name===k&&b.value===v})})})}catch(e){}
render(true);
})();
</script>
</body></html>`;
}
