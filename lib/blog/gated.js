// Resource landing page at /resources/<slug>: a gated download (guide, checklist, template, course, report, one-sheet).
// Simple resources show the hero + form; richer ones (one-sheets) also show an explainer, key takeaways, what is inside, steps,
// benefits, who it is for, FAQs and related resources, followed by the shared end-of-page CTA.
// Front end only for now: the form validates in the browser and then reveals the download. Submissions are NOT stored or sent anywhere yet.
import { esc, toHtml } from './portable.js';
import { shell, safeFile, abs } from './shell.js';
import { icon } from './icons.js';
import { resourceTypeById } from './types.js';
import { ctaFinal, CTA_CSS } from './cta.js';

const FIELDS = [
  { id: 'first', label: 'First name', type: 'text', auto: 'given-name', req: true },
  { id: 'last', label: 'Last name', type: 'text', auto: 'family-name', req: true },
  { id: 'email', label: 'Work email', type: 'email', auto: 'email', req: true, wide: true },
  { id: 'company', label: 'Company', type: 'text', auto: 'organization', req: true },
  { id: 'title', label: 'Job title', type: 'text', auto: 'organization-title', req: false },
];
const clean = (s, n = 200) => String(s ?? '').trim().slice(0, n);
const list = (a, max, n = 200) => (Array.isArray(a) ? a : []).map((x) => clean(x, n)).filter(Boolean).slice(0, max);

export function renderGated(r, base) {
  const type = resourceTypeById(clean(r.assetType, 30) || 'Guide');
  const kind = type.id;
  const headline = clean(r.headline, 160) || r.title;
  const sub = clean(r.subheadline, 400);
  const bullets = list(r.bullets, 8);
  const file = safeFile(r.downloadUrl);
  const cover = r.cover && safeFile(r.cover.url) ? r.cover : null;
  const about = r.body ? toHtml(r.body).html : '';
  const pages = Number.isFinite(Number(r.pages)) && Number(r.pages) > 0 ? Math.round(Number(r.pages)) : null;
  const url = `${base}/resources/${r.slug}`;
  const title = clean(r.seoTitle, 120) || headline;
  const desc = clean(r.seoDescription, 200) || sub;
  const btn = clean(r.buttonLabel, 40) || `Get the ${kind.toLowerCase()}`;
  const coverSrc = cover ? cover.url + (/sanity/.test(cover.url) ? '?w=640&auto=format' : '') : '';
  const topic = clean(r.topic, 50);

  const takeaways = list(r.takeaways, 5);
  const previewItems = list(r.previewItems, 12);
  const previewTitle = clean(r.previewTitle, 80) || 'What is inside';
  const steps = (Array.isArray(r.steps) ? r.steps : []).map((s) => ({ title: clean(s && s.title, 80), text: clean(s && s.text, 300) })).filter((s) => s.title).slice(0, 8);
  const benefits = list(r.benefits, 8);
  const audience = list(r.audience, 8, 60);
  const faqs = (Array.isArray(r.faqs) ? r.faqs : []).map((f) => ({ q: clean(f && f.question, 200), a: clean(f && f.answer, 800) })).filter((f) => f.q && f.a).slice(0, 12);
  const related = (Array.isArray(r.related) ? r.related : []).filter((x) => x && /^[a-z0-9][a-z0-9-]{0,100}$/i.test(String(x.slug || '')) && clean(x.title)).slice(0, 6);
  const rich = !!(about || takeaways.length || previewItems.length || steps.length || benefits.length || audience.length || faqs.length || related.length);

  const field = (f) => `<div class="gt-field${f.wide ? ' gt-field--wide' : ''}"><label for="gt-${f.id}">${esc(f.label)}${f.req ? ' <span aria-hidden="true">*</span><span class="sr-only">(required)</span>' : ' <span class="gt-opt">(optional)</span>'}</label><input id="gt-${f.id}" name="${f.id}" type="${f.type}" autocomplete="${f.auto}"${f.req ? ' required aria-required="true"' : ''} aria-describedby="gt-${f.id}-err"><p class="gt-err" id="gt-${f.id}-err" hidden></p></div>`;

  const section = (id, heading, inner) => `<section class="gt-section" aria-labelledby="${id}"><h2 id="${id}">${esc(heading)}</h2>${inner}</section>`;
  const body = !rich ? '' : `
  <section class="gt-main"><div class="gt-main__inner"><article class="post-body gt-article">
    ${coverSrc ? `<figure class="gt-cover"><img src="${esc(coverSrc)}" alt="${esc(cover.alt || '')}" loading="lazy"></figure>` : ''}
    ${about}
    ${takeaways.length ? `<aside class="gt-takeaways" aria-labelledby="gt-take"><h2 id="gt-take">Key takeaways</h2><ul>${takeaways.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></aside>` : ''}
    ${previewItems.length ? section('gt-inside', previewTitle, `<ol class="gt-inside">${previewItems.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>`) : ''}
    ${steps.length ? section('gt-steps', 'How to use it', `<ol class="gt-steps">${steps.map((s) => `<li><strong>${esc(s.title)}</strong>${s.text ? `<span>${esc(s.text)}</span>` : ''}</li>`).join('')}</ol>`) : ''}
    ${benefits.length ? section('gt-benefits', 'Why use it', `<ul>${benefits.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`) : ''}
    ${audience.length ? section('gt-for', 'Who it is for', `<ul>${audience.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`) : ''}
    ${faqs.length ? section('gt-faq', 'Frequently asked questions', `<div class="gt-faqs">${faqs.map((f) => `<details class="gt-faq" name="gt-faq"><summary><span>${esc(f.q)}</span>${icon('plus', 20)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>`) : ''}
    ${related.length ? section('gt-more', 'More resources', `<ol class="gt-related">${related.map((x) => `<li><a href="/resources/${esc(x.slug)}"><span class="gt-related__type">${esc(clean(x.assetType, 30) || 'Resource')}</span>${esc(clean(x.title, 140))}</a></li>`).join('')}</ol>`) : ''}
  </article></div></section>
  <section class="gt-strip" aria-label="Download"><div class="gt-strip__inner"><p>Ready to use it?</p><div><a class="ds-btn ds-btn-primary btn-md" href="#gt-card" data-gt-scroll>Download for free</a>${previewItems.length ? '<a class="gt-strip__link" href="#gt-inside">See what is inside</a>' : ''}</div></div></section>`;

  const main = `
  <header class="gt-hero"><div class="gt-hero__inner">
    <div class="gt-copy">
      <ol class="post-crumbs" aria-label="Breadcrumb"><li><a href="/index.html">Home</a></li><li><a href="/resources">Resources</a></li><li aria-current="page">${esc(clean(r.title, 80))}</li></ol>
      <p class="gt-kind">${icon(type.icon, 16)}<span>${esc(kind)}</span>${pages ? `<span aria-hidden="true"> · </span><span>${pages} ${pages === 1 ? 'page' : 'pages'}</span>` : ''}<span aria-hidden="true"> · </span><span>Free download</span></p>
      <h1>${esc(headline)}</h1>
      ${sub ? `<p class="gt-sub">${esc(sub)}</p>` : ''}
      ${topic ? `<ul class="gt-tags"><li class="ds-tag">${esc(topic)}</li></ul>` : ''}
      ${bullets.length ? `<h2 class="gt-learn">What you'll learn</h2><ul class="gt-bullets">${bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
    </div>
    <div class="gt-card" id="gt-card" tabindex="-1">
      <div id="gt-form-wrap">
        <h2 class="gt-card__title">Get your free ${esc(kind.toLowerCase())}</h2>
        <form id="gt-form" novalidate>
          <div class="gt-grid">${FIELDS.map(field).join('')}</div>
          <p class="gt-summary" id="gt-summary" role="alert" hidden></p>
          <button class="ds-btn ds-btn-accent gt-submit" type="submit">${esc(btn)}</button>
          <p class="gt-fine">We'll use your details to send the download and occasional updates from DOXA Talent.</p>
        </form>
      </div>
      <div id="gt-thanks" hidden tabindex="-1">
        <h2 class="gt-card__title">${esc(clean(r.thankYouTitle, 120) || 'Thanks. Your download is ready.')}</h2>
        <p>${esc(clean(r.thankYouText, 400) || 'Use the button below to download it now.')}</p>
        ${file ? `<a class="ds-btn ds-btn-accent gt-download" href="${esc(file)}" download rel="noopener">Download the ${esc(kind.toLowerCase())}</a>` : ''}
      </div>
    </div>
  </div></header>
  ${body}
  ${!rich && coverSrc ? `<section class="gt-about"><div class="gt-about__inner"><div class="gt-cover"><img src="${esc(coverSrc)}" alt="${esc(cover.alt || '')}" loading="lazy"></div></div></section>` : ''}
  ${ctaFinal()}`;

  const script = `<script>
(function(){
var f=document.getElementById('gt-form');if(!f)return;
var RE=/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,sum=document.getElementById('gt-summary');
function err(i,m){var e=document.getElementById(i.id+'-err');if(m){e.textContent=m;e.hidden=false;i.setAttribute('aria-invalid','true')}else{e.hidden=true;e.textContent='';i.removeAttribute('aria-invalid')}}
f.addEventListener('submit',function(ev){ev.preventDefault();var bad=[];
[].slice.call(f.querySelectorAll('input')).forEach(function(i){var v=i.value.trim(),m='';
if(i.required&&!v)m='Enter your '+f.querySelector('label[for='+i.id+']').firstChild.textContent.trim().toLowerCase()+'.';
else if(i.type==='email'&&v&&!RE.test(v))m='Enter a valid email address.';
err(i,m);if(m)bad.push(i)});
if(bad.length){sum.textContent='Please fix '+bad.length+(bad.length===1?' field':' fields')+' to continue.';sum.hidden=false;bad[0].focus();return}
sum.hidden=true;
/* Front end only: nothing is sent or stored yet. Wire submissions here before launch. */
document.getElementById('gt-form-wrap').hidden=true;var t=document.getElementById('gt-thanks');t.hidden=false;t.focus();
});
[].slice.call(document.querySelectorAll('[data-gt-scroll]')).forEach(function(a){a.addEventListener('click',function(e){var c=document.getElementById('gt-card');if(!c)return;e.preventDefault();c.scrollIntoView({behavior:'smooth',block:'center'});var i=c.querySelector('input:not([hidden])');setTimeout(function(){(i||c).focus({preventScroll:true})},350)})});
})();
</script>`;

  const page = { '@type': 'WebPage', name: headline, description: desc, url, ...(cover ? { primaryImageOfPage: abs(base, coverSrc) } : {}), publisher: { '@type': 'Organization', name: 'DOXA Talent' } };
  const jsonLd = faqs.length
    ? { '@context': 'https://schema.org', '@graph': [page, { '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }] }
    : { '@context': 'https://schema.org', ...page };
  return shell({ title: `${title} | DOXA Talent`, desc, canonical: url, ogImage: cover ? abs(base, coverSrc) : '', css: ['/blog-assets/post.css', '/blog-assets/gated.css', CTA_CSS], jsonLd, main, scripts: script });
}
