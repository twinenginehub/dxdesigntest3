// Gated download / lead-magnet landing page at /resources/<slug>.
// Front end only for now: the form validates in the browser and then reveals the download. Submissions are NOT stored or sent anywhere yet.
import { esc, toHtml } from './portable.js';
import { shell, safeFile, abs } from './shell.js';

const FIELDS = [
  { id: 'first', label: 'First name', type: 'text', auto: 'given-name', req: true },
  { id: 'last', label: 'Last name', type: 'text', auto: 'family-name', req: true },
  { id: 'email', label: 'Work email', type: 'email', auto: 'email', req: true, wide: true },
  { id: 'company', label: 'Company', type: 'text', auto: 'organization', req: true },
  { id: 'title', label: 'Job title', type: 'text', auto: 'organization-title', req: false },
];
const clean = (s, n = 200) => String(s ?? '').trim().slice(0, n);

export function renderGated(r, base) {
  const kind = clean(r.assetType, 30) || 'Guide';
  const headline = clean(r.headline, 160) || r.title;
  const sub = clean(r.subheadline, 400);
  const bullets = (Array.isArray(r.bullets) ? r.bullets : []).map((b) => clean(b, 200)).filter(Boolean).slice(0, 8);
  const file = safeFile(r.downloadUrl);
  const cover = r.cover && safeFile(r.cover.url) ? r.cover : null;
  const about = r.body ? toHtml(r.body).html : '';
  const pages = Number.isFinite(Number(r.pages)) && Number(r.pages) > 0 ? Math.round(Number(r.pages)) : null;
  const url = `${base}/resources/${r.slug}`;
  const title = clean(r.seoTitle, 120) || headline;
  const desc = clean(r.seoDescription, 200) || sub;
  const btn = clean(r.buttonLabel, 40) || `Get the ${kind.toLowerCase()}`;
  const coverSrc = cover ? cover.url + (/sanity/.test(cover.url) ? '?w=640&auto=format' : '') : '';

  const field = (f) => `<div class="gt-field${f.wide ? ' gt-field--wide' : ''}"><label for="gt-${f.id}">${esc(f.label)}${f.req ? ' <span aria-hidden="true">*</span><span class="sr-only">(required)</span>' : ' <span class="gt-opt">(optional)</span>'}</label><input id="gt-${f.id}" name="${f.id}" type="${f.type}" autocomplete="${f.auto}"${f.req ? ' required aria-required="true"' : ''} aria-describedby="gt-${f.id}-err"><p class="gt-err" id="gt-${f.id}-err" hidden></p></div>`;

  const main = `
  <header class="gt-hero"><div class="gt-hero__inner">
    <div class="gt-copy">
      <p class="gt-kind">${esc(kind)}${pages ? `<span aria-hidden="true"> · </span><span>${pages} pages</span>` : ''}<span aria-hidden="true"> · </span><span>Free download</span></p>
      <h1>${esc(headline)}</h1>
      ${sub ? `<p class="gt-sub">${esc(sub)}</p>` : ''}
      ${bullets.length ? `<h2 class="gt-learn">What you'll learn</h2><ul class="gt-bullets">${bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
    </div>
    <div class="gt-card" id="gt-card">
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
  ${coverSrc || about ? `<section class="gt-about"><div class="gt-about__inner">${coverSrc ? `<div class="gt-cover"><img src="${esc(coverSrc)}" alt="${esc(cover.alt || '')}" loading="lazy"></div>` : ''}${about ? `<div class="post-body gt-about__body">${about}</div>` : ''}</div></section>` : ''}`;

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
})();
</script>`;

  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebPage', name: headline, description: desc, url, ...(cover ? { primaryImageOfPage: abs(base, coverSrc) } : {}), publisher: { '@type': 'Organization', name: 'DOXA Talent' } };
  return shell({ title: `${title} | DOXA Talent`, desc, canonical: url, ogImage: cover ? abs(base, coverSrc) : '', css: ['/blog-assets/post.css', '/blog-assets/gated.css'], jsonLd, main, scripts: script });
}
