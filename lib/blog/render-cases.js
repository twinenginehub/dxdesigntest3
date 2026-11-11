// Case Studies listing at /case-studies: filters (industry, company size, region, use case) + "Load more".
// Every card is in the server-rendered HTML (crawlable); a small script filters them in the browser and keeps the URL in sync.
import { NAV, FOOTER } from './chrome.js';
import { esc } from './portable.js';
import { safeFile, abs } from './shell.js';

const PER = 12;
const FILTERS = [
  { key: 'industry', data: 'industry', label: 'Industry' },
  { key: 'size', data: 'size', label: 'Company size', field: 'companySize' },
  { key: 'region', data: 'region', label: 'Region' },
  { key: 'use', data: 'use', label: 'Use case', field: 'useCase' },
];
const SIZE_ORDER = ['1–10', '11–50', '51–200', '201–500', '501–1,000', '1,000+'];
const clean = (s, n = 120) => String(s ?? '').trim().slice(0, n);
const ARROW = '<svg viewBox="0 0 25.22 37.46" width="7" height="10" fill="currentColor" aria-hidden="true"><path d="M12.42,0H.87c3.92,6.27,8.39,13.51,12.19,18.73C9.26,23.95,4.79,31.19.87,37.46h11.55l12.93-18.73L12.42,0Z"/></svg>';

function norm(p) {
  const c = p.cs || {};
  return {
    p, slug: p.slug, title: clean(p.title, 160), excerpt: clean(p.excerpt, 220),
    client: clean(c.clientName, 80), industry: clean(c.industry || p.category, 50), size: clean(c.companySize, 40), region: clean(c.region, 40), use: clean(c.useCase, 50),
    value: clean(c.keyResultValue, 14), label: clean(c.keyResultLabel, 80),
    logo: safeFile(c.logo), img: p.image && safeFile(p.image.url) ? p.image : null,
  };
}
const imgSrc = (u, w) => u + (/sanity/.test(u) ? `?w=${w}&auto=format` : '');

function card(c, i) {
  const media = c.img
    ? `<img src="${esc(imgSrc(c.img.url, 640))}" alt="${esc(c.img.alt || '')}" loading="${i < 3 ? 'eager' : 'lazy'}">`
    : '';
  const mark = c.logo ? `<span class="cs-logo"><img src="${esc(imgSrc(c.logo, 240))}" alt="${esc(c.client)}" loading="lazy"></span>` : c.client ? `<span class="cs-client">${esc(c.client)}</span>` : '';
  return `<li class="cs-item" data-industry="${esc(c.industry)}" data-size="${esc(c.size)}" data-region="${esc(c.region)}" data-use="${esc(c.use)}">
  <a class="cs-card" href="/blog/${esc(c.slug)}">
    <div class="cs-card__media">${media}${mark}</div>
    <div class="cs-card__body">
      ${c.value ? `<p class="cs-result"><strong>${esc(c.value)}</strong><span>${esc(c.label)}</span></p>` : ''}
      <h3>${esc(c.title)}</h3>
      ${c.industry || c.size ? `<ul class="cs-tags">${[c.industry, c.size].filter(Boolean).map((t) => `<li class="ds-tag">${esc(t)}</li>`).join('')}</ul>` : ''}
      <span class="bl-card__cta">Read case study${ARROW}</span>
    </div>
  </a></li>`;
}

export function renderCaseStudies(posts, base) {
  const items = posts.map(norm);
  const options = (f) => {
    const vals = [...new Set(items.map((c) => c[f.data]).filter(Boolean))];
    if (f.key === 'size') vals.sort((a, b) => (SIZE_ORDER.findIndex((s) => a.startsWith(s)) + 1 || 99) - (SIZE_ORDER.findIndex((s) => b.startsWith(s)) + 1 || 99));
    else vals.sort((a, b) => a.localeCompare(b));
    return vals;
  };
  const selects = FILTERS.map((f) => {
    const vals = options(f);
    return vals.length ? `<div class="cs-select"><label class="sr-only" for="cs-${f.key}">${esc(f.label)}</label><select id="cs-${f.key}" data-key="${f.data}"><option value="">${esc(f.label)}</option>${vals.map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join('')}</select></div>` : '';
  }).join('');

  const body = !items.length
    ? '<section class="bl-section"><div class="bl-wrap"><p class="bl-empty">No case studies have been published yet.</p></div></section>'
    : `<section class="cs-filters" aria-label="Filters"><div class="bl-wrap cs-filters__row">
      <span class="cs-filters__label" aria-hidden="true">Filter by</span>${selects}
      <button type="button" class="cs-clear" id="cs-clear" hidden>Clear all</button>
      <p class="cs-count" id="cs-count" role="status" aria-live="polite">${items.length} case ${items.length === 1 ? 'study' : 'studies'}</p>
    </div></section>
    <section class="bl-section" aria-label="Case studies"><div class="bl-wrap">
      <ul class="cs-grid" id="cs-grid">${items.map(card).join('')}</ul>
      <div class="bl-empty cs-none" id="cs-none" hidden><p>No case studies match those filters.</p><button type="button" class="ds-btn ds-btn-primary" id="cs-reset">Clear filters</button></div>
      <div class="cs-more"><button type="button" class="ds-btn ds-btn-primary" id="cs-more" hidden>Load more</button></div>
    </div></section>`;

  const url = `${base}/case-studies`;
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Case Studies', url, publisher: { '@type': 'Organization', name: 'DOXA Talent' },
    mainEntity: { '@type': 'ItemList', itemListElement: items.slice(0, 50).map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(base, `/blog/${c.slug}`), name: c.title })) } };

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Case Studies | DOXA Talent</title>
<meta name="description" content="Placeholder description. See how growing firms build dedicated offshore teams with DOXA Talent.">
<link rel="canonical" href="${esc(url)}">
<link rel="stylesheet" href="/ds/tokens.css"><link rel="stylesheet" href="/ds/bundle.css"><link rel="stylesheet" href="/ds/header.css"><link rel="stylesheet" href="/blog-assets/list.css"><link rel="stylesheet" href="/blog-assets/cases.css">
<noscript><style>.cs-filters{display:none}</style></noscript>
<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
<script src="/ds/header.js" defer></script>
</head><body>
<a class="bl-skip" href="#main-content">Skip to content</a>
${NAV}
<main id="main-content">
  <header class="bl-hero cs-hero"><div class="bl-wrap">
    <ol class="bl-crumbs" aria-label="Breadcrumb"><li><a href="/index.html">Home</a></li><li aria-current="page">Case Studies</li></ol>
    <h1>Case Studies</h1>
    <p class="bl-intro">Placeholder intro. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.</p>
  </div></header>
  ${body}
  <section class="bl-cta"><div class="bl-wrap bl-cta__inner"><div><h2>Ready to build your team?</h2><p>Placeholder call-to-action copy. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p></div><a class="ds-btn ds-btn-accent" href="/index.html#build-your-team">Build Your Team</a></div></section>
</main>
${FOOTER}
<script>
(function(){
var grid=document.getElementById('cs-grid');if(!grid)return;
var PER=${PER},items=[].slice.call(grid.children),sels=[].slice.call(document.querySelectorAll('.cs-select select')),
clear=document.getElementById('cs-clear'),reset=document.getElementById('cs-reset'),more=document.getElementById('cs-more'),count=document.getElementById('cs-count'),none=document.getElementById('cs-none'),shown=PER;
function active(){var f={};sels.forEach(function(s){if(s.value)f[s.dataset.key]=s.value});return f}
function sync(f){try{var p=new URLSearchParams();Object.keys(f).forEach(function(k){p.set(k,f[k])});var s=p.toString();history.replaceState(null,'',location.pathname+(s?'?'+s:''))}catch(e){}}
function run(resetShown,focusNew){
if(resetShown)shown=PER;
var f=active(),keys=Object.keys(f);
var hits=items.filter(function(it){for(var j=0;j<keys.length;j++)if(it.dataset[keys[j]]!==f[keys[j]])return false;return true});
var firstNew=hits[shown-PER];
items.forEach(function(it){it.hidden=true});
hits.forEach(function(it,i){it.hidden=i>=shown});
var n=hits.length,filtered=keys.length>0;
count.textContent=filtered?n+(n===1?' result':' results'):n+' case '+(n===1?'study':'studies');
none.hidden=n>0;more.hidden=n<=shown;clear.hidden=!filtered;
if(focusNew&&firstNew){var a=firstNew.querySelector('a');if(a)a.focus()}
sync(f)}
function clearAll(){sels.forEach(function(s){s.value=''});run(true);if(sels[0])sels[0].focus()}
sels.forEach(function(s){s.addEventListener('change',function(){run(true)})});
clear.addEventListener('click',clearAll);reset.addEventListener('click',clearAll);
more.addEventListener('click',function(){shown+=PER;run(false,true)});
try{var p=new URLSearchParams(location.search);sels.forEach(function(s){var val=p.get(s.dataset.key);if(val)s.value=val;if(s.value!==val&&val)s.value=''})}catch(e){}
run(true);
})();
</script>
</body></html>`;
}
