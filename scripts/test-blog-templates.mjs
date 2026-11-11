// Safety checks for the blog templates: hostile data must come out escaped and bad URLs must be dropped. Run: node scripts/test-blog-templates.mjs
import { chartHtml, statGridHtml, dataTableHtml } from '../lib/blog/charts.js';
import { renderPress } from '../lib/blog/press.js';
import { renderGated } from '../lib/blog/gated.js';
import { whitepaperView } from '../lib/blog/whitepaper.js';
import { renderCaseStudies } from '../lib/blog/render-cases.js';
import assert from 'node:assert/strict';

const X = '<img src=x onerror=alert(1)>';
// charts
const bar = chartHtml({ chartType: 'bar', title: X, unit: X, prefix: X, caption: X, source: X, data: [{ label: X, value: 5 }, { label: 'bad', value: 'abc' }, { label: 'neg', value: -3 }, { label: 'ok', value: '1,200' }] });
assert(!bar.includes('<img'), 'chart escapes HTML');
assert(bar.includes('1,200'), 'numeric strings are parsed');
assert.equal(chartHtml({ chartType: 'line', data: [{ label: 'a', value: 1 }] }), '', 'line needs 2+ points');
assert.equal(chartHtml({ chartType: 'bar', data: [] }), '', 'empty data renders nothing');
assert.equal(chartHtml({ chartType: 'donut', data: [{ label: 'a', value: 0 }] }), '', 'all-zero donut renders nothing');
for (const t of ['bar', 'column', 'line', 'donut']) assert(chartHtml({ chartType: t, data: [{ label: 'a', value: 3 }, { label: 'b', value: 7 }] }).includes('<table class="sr-only">'), t + ' has a text table');
assert(!statGridHtml({ items: [{ value: X, label: X, note: X }] }).includes('<img'), 'stat grid escapes');
assert(!dataTableHtml({ caption: X, source: X, rows: [{ cells: [X, 'b'] }, { cells: [X, X] }] }).includes('<img'), 'table escapes');
assert.equal(dataTableHtml({ rows: [{ cells: ['only header'] }] }), '', 'table needs 2+ rows');

// press release
const press = renderPress({ title: X, slug: 's', excerpt: X, publishedAt: '2026-11-01T00:00:00Z', body: [{ _type: 'block', style: 'normal', children: [{ _type: 'span', text: X, marks: [] }], markDefs: [] }],
  press: { location: X, boilerplate: X, contacts: [{ name: X, title: X, email: 'a"b@c.com', phone: 'javascript:1' }, { name: 'Ok', email: 'ok@example.com', phone: '(555) 010-0199' }], assets: [{ title: 'x', url: 'javascript:alert(1)' }, { title: 'y', url: 'http://insecure.test/a.pdf' }, { title: 'z', url: 'https://cdn.sanity.io/a.pdf' }] } }, 'https://x.test');
assert(!press.includes('<img src=x'), 'press escapes');
assert(!press.includes('javascript:'), 'press drops javascript: urls');
assert(!press.includes('insecure.test'), 'press drops http urls');
assert(press.includes('cdn.sanity.io/a.pdf') && press.includes('mailto:ok@example.com'), 'press keeps good links');
assert(!press.includes('a&quot;b@c.com') && !press.includes('mailto:a"b'), 'press drops malformed email');

// gated page
const gated = renderGated({ title: 't', slug: 's', headline: X, subheadline: X, assetType: X, bullets: [X], buttonLabel: X, thankYouTitle: X, thankYouText: X, downloadUrl: 'javascript:alert(1)', cover: { url: 'javascript:1', alt: X } }, 'https://x.test');
assert(!gated.includes('<img src=x'), 'gated escapes');
assert(!gated.includes('javascript:'), 'gated drops javascript: urls');
assert(!gated.includes('class="ds-btn ds-btn-accent gt-download"'), 'no download button without a safe file');

// whitepaper: gate slug must be a plain slug, file must be https or root-relative
const wp = whitepaperView({ title: 't', whitepaper: { gateSlug: '../evil"', fileUrl: 'javascript:1', keyStats: [{ value: X, label: X }] }, image: null }, 'https://x.test', { html: '', headings: [], minutes: 3 });
assert(!wp.top.includes('javascript:') && !wp.top.includes('evil'), 'whitepaper drops bad gate and file');
assert(!wp.before.includes('<img'), 'whitepaper stats escape');
// case studies listing
const cs = renderCaseStudies([{ title: X, slug: 's', excerpt: X, publishedAt: '2026-11-01T00:00:00Z', image: { url: 'javascript:1', alt: X },
  cs: { clientName: X, logo: 'javascript:1', industry: X, companySize: X, region: X, useCase: X, keyResultValue: X, keyResultLabel: X } }], 'https://x.test');
assert(!cs.includes('<img src=x'), 'case studies escape');
assert(!cs.includes('javascript:'), 'case studies drop unsafe image urls');
assert(renderCaseStudies([], 'https://x.test').includes('No case studies have been published yet'), 'empty state');
console.log('all blog template safety checks passed');
