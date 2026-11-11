// Case study variant of the post template (structure follows a customer-story page):
// logo + outcome headline + team photo, key results row, "at a glance" fact sheet beside labelled sections
// (challenge / solution / results, each with an optional pull quote) and a closing call to action.
import { esc, toHtml } from './portable.js';
import { statGridHtml } from './charts.js';
import { safeFile } from './shell.js';

const clean = (s, n = 200) => String(s ?? '').trim().slice(0, n);
const linkOk = (u) => { const t = clean(u, 300); return /^\/[^/\\]/.test(t) || /^https:\/\//i.test(t) ? t : ''; };

export function caseStudyView(post, base, { html }) {
  const c = post.caseStudy || {};
  const logo = safeFile(c.logo);
  const client = clean(c.clientName, 80);
  const sections = (Array.isArray(c.sections) ? c.sections : []).filter((s) => s && (clean(s.heading) || (Array.isArray(s.body) && s.body.length) || (s.quote && clean(s.quote.text))));
  const services = (Array.isArray(c.services) ? c.services : []).map((s) => ({ label: clean(s && s.label, 80), url: linkOk(s && s.url) })).filter((s) => s.label);
  const facts = [['Client', client], ['Industry', clean(c.industry, 60)], ['Region', clean(c.region, 60)], ['Company size', clean(c.companySize, 60)]].filter(([, v]) => v);
  const stats = statGridHtml({ items: c.keyStats });

  const heroTop = logo ? `<p class="csp-logo"><span><img src="${esc(logo)}" alt="${esc(client || 'Client logo')}" height="40"></span></p>` : '';
  const crumb = '<li><a href="/case-studies">Case Studies</a></li>';
  const before = stats ? `<section class="csp-stats" aria-label="Key results"><div class="csp-stats__inner">${stats}</div></section>` : '';

  const rail = facts.length || services.length
    ? `<aside class="csp-facts" aria-label="Customer profile"><p class="post-toc__title">At a glance</p><dl>${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}${services.length ? `<div><dt>Services</dt><dd><ul>${services.map((s) => `<li>${s.url ? `<a href="${esc(s.url)}">${esc(s.label)}</a>` : esc(s.label)}</li>`).join('')}</ul></dd></div>` : ''}</dl></aside>`
    : '';

  const articleHtml = sections.map((s, i) => {
    const label = clean(s.label, 40), heading = clean(s.heading, 160), q = s.quote || {};
    const body = Array.isArray(s.body) ? toHtml(s.body).html : '';
    const id = `csp-${i + 1}`;
    const who = [clean(q.name, 80) && `<strong>${esc(clean(q.name, 80))}</strong>`, clean(q.title, 100) && esc(clean(q.title, 100)), clean(q.company, 100) && esc(clean(q.company, 100))].filter(Boolean).join(', ');
    return `<section class="csp-section" aria-labelledby="${id}">${heading && label ? `<p class="csp-label">${esc(label)}</p>` : ''}<h2 id="${id}">${esc(heading || label)}</h2>${body}${clean(q.text, 600) ? `<figure class="csp-quote"><blockquote><p>${esc(clean(q.text, 600))}</p></blockquote>${who ? `<figcaption>${who}</figcaption>` : ''}</figure>` : ''}</section>`;
  }).join('') + (html || '');

  const after = `<section class="csp-cta" aria-labelledby="csp-cta-h"><div class="csp-cta__inner"><div><h2 id="csp-cta-h">Ready to build your team?</h2><p>Placeholder call-to-action copy. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p></div><a class="ds-btn ds-btn-accent" href="/index.html#build-your-team">Build Your Team</a></div></section>`;

  return { heroTop, crumb, before, rail, after, articleHtml, headings: [], metaItems: '', jsonLd: {}, css: '<link rel="stylesheet" href="/blog-assets/casestudy.css">' };
}
