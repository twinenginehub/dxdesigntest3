// Reads published content from a Sanity dataset over its public HTTP API (no SDK, no token: the dataset must be public).
import { SAMPLE_POST, SAMPLE_POSTS, SAMPLE_PODCAST, SAMPLE_WHITEPAPER, SAMPLE_WHITEPAPER_BODY, SAMPLE_PRESS, SAMPLE_PRESS_BODY, SAMPLE_FRANCHISE, SAMPLE_RESOURCES, SAMPLE_RESOURCE_PAGES, SAMPLE_CASE_STUDIES, SAMPLE_CASE_STUDY_DETAILS } from './sample.js';
import { sectionById } from './sections.js';

const API_VERSION = 'v2025-01-01';
export const configured = () => !!process.env.SANITY_PROJECT_ID;
// Before Sanity is connected the templates can be previewed locally and on Vercel previews, never on production.
const sampleOk = () => process.env.VERCEL_ENV !== 'production';

async function query(groq, params = {}) {
  const ds = process.env.SANITY_DATASET || 'production';
  const extra = Object.entries(params).map(([k, v]) => `&%24${k}=${encodeURIComponent(JSON.stringify(v))}`).join('');
  const url = `https://${process.env.SANITY_PROJECT_ID}.apicdn.sanity.io/${API_VERSION}/data/query/${ds}?query=${encodeURIComponent(groq)}${extra}`;
  const r = await fetch(url, { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error(`Sanity responded ${r.status}`);
  const { result } = await r.json();
  return result || null;
}

const BODY = `"body": body[]{ ..., _type == "image" => { ..., "url": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height } }`;
const postQuery = (docType) => `*[_type == "${docType}" && slug.current == $slug && defined(publishedAt) && publishedAt <= now()][0]{
  title, "slug": slug.current, contentType, audience, excerpt, category, tags, publishedAt, _updatedAt, seoTitle, seoDescription,
  "author": author->{ name, role, "image": image.asset->url },
  "image": mainImage{ alt, caption, "url": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height },
  "caseStudy": caseStudy{ clientName, "logo": logo.asset->url, industry, companySize, region, useCase,
    "keyStats": keyStats[]{ value, label, note },
    "services": services[]{ label, url },
    "sections": sections[]{ label, heading, body, quote }
  },
  "podcast": podcast{ episodeNumber, season, duration, audioUrl, embedUrl,
    "platforms": platforms[]{ name, url },
    "guests": guests[]{ name, role, company, linkedin, "image": image.asset->url },
    "chapters": chapters[]{ time, title },
    "transcript": transcript[]
  },
  "whitepaper": whitepaper{ pages, executiveSummary, "fileUrl": coalesce(file.asset->url, fileUrl), "gateSlug": gate->slug.current, "keyStats": keyStats[]{ value, label, note } },
  "press": press{ location, boilerplate, "contacts": contacts[]{ name, title, email, phone }, "assets": assets[]{ title, "url": file.asset->url } },
  ${BODY}
}`;

export async function fetchPost(slug, sectionId = 'blog') {
  const section = sectionById(sectionId);
  if (!configured()) {
    if (!sampleOk()) return null;
    if (section.id === 'franchise') { const m = SAMPLE_FRANCHISE.find((p) => p.slug === slug); return m ? { ...SAMPLE_POST, ...m, slug } : null; }
    const cs = SAMPLE_CASE_STUDIES.find((p) => p.slug === slug); // listing samples open as a generic sample case study
    if (cs) return { ...SAMPLE_POST, ...cs, contentType: 'case-study', slug, caseStudy: { ...cs.cs, ...SAMPLE_CASE_STUDY_DETAILS }, body: [] };
    const meta = SAMPLE_POSTS.find((p) => p.slug === slug);
    if (!meta) return null;
    const extra = meta.contentType === 'podcast' ? { podcast: SAMPLE_PODCAST }
      : meta.contentType === 'whitepaper' ? { whitepaper: SAMPLE_WHITEPAPER, body: SAMPLE_WHITEPAPER_BODY }
      : meta.contentType === 'press' ? { press: SAMPLE_PRESS, body: SAMPLE_PRESS_BODY } : {};
    return { ...SAMPLE_POST, ...meta, slug, ...extra };
  }
  return query(postQuery(section.docType), { slug });
}

const listQuery = (docType) => `*[_type == "${docType}" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()] | order(publishedAt desc)[0...300]{
  title, "slug": slug.current, contentType, audience, featured, excerpt, category, publishedAt,
  "image": mainImage{ alt, "url": asset->url },
  "chars": length(pt::text(body))
}`;

// Every published post in a section, newest first, with only the fields a card needs.
export async function fetchPosts(sectionId = 'blog') {
  const section = sectionById(sectionId);
  if (!configured()) return !sampleOk() ? [] : section.id === 'franchise' ? SAMPLE_FRANCHISE : SAMPLE_POSTS;
  return (await query(listQuery(section.docType))) || [];
}

// Resource (gated download) landing page content.
const PUBLISHED = 'defined(slug.current) && defined(publishedAt) && publishedAt <= now()';
const RESOURCE_QUERY = `*[_type == "leadMagnet" && slug.current == $slug && defined(publishedAt) && publishedAt <= now()][0]{
  title, "slug": slug.current, assetType, topic, audience, businessSize, headline, subheadline, bullets, pages, publishedAt, _updatedAt, seoTitle, seoDescription,
  buttonLabel, thankYouTitle, thankYouText, takeaways, previewTitle, previewItems, steps, benefits, faqs,
  "cover": cover{ alt, "url": asset->url },
  "downloadUrl": coalesce(file.asset->url, fileUrl),
  "body": about[]{ ..., _type == "image" => { ..., "url": asset->url } },
  "related": coalesce(related[]->{ title, "slug": slug.current, assetType, topic }, *[_type == "leadMagnet" && ${PUBLISHED} && slug.current != ^.slug.current && (assetType == ^.assetType || topic == ^.topic)] | order(publishedAt desc)[0...6]{ title, "slug": slug.current, assetType, topic })
}`;

export async function fetchResource(slug) {
  if (!configured()) {
    if (!sampleOk()) return null;
    const page = SAMPLE_RESOURCE_PAGES.find((r) => r.slug === slug);
    if (page) return page;
    const item = SAMPLE_RESOURCES.find((r) => r.slug === slug); // list samples open as a simple sample page
    return item ? { ...SAMPLE_RESOURCE_PAGES[0], ...item, headline: item.title, subheadline: item.summary, bullets: SAMPLE_RESOURCE_PAGES[0].bullets, related: [] } : null;
  }
  return query(RESOURCE_QUERY, { slug });
}

// Every published resource for the /resources hub, plus the blog articles (shown as the "Article" type, linking to /blog/<slug>).
const RESOURCES_QUERY = `*[_type == "leadMagnet" && ${PUBLISHED}] | order(publishedAt desc)[0...300]{
  title, "slug": slug.current, assetType, topic, audience, businessSize, "summary": subheadline, pages, publishedAt,
  "cover": cover{ alt, "url": asset->url }
}`;
const ARTICLES_QUERY = `*[_type == "post" && (contentType == "article" || !defined(contentType)) && ${PUBLISHED}] | order(publishedAt desc)[0...300]{
  title, "slug": slug.current, "topic": category, "summary": excerpt, publishedAt,
  "cover": mainImage{ alt, "url": asset->url },
  "chars": length(pt::text(body))
}`;
const toArticle = (p) => ({ title: p.title, slug: p.slug, assetType: 'Article', topic: p.category || p.topic || '', audience: [], businessSize: [], summary: p.excerpt || p.summary || '',
  pages: null, minutes: p.chars ? Math.max(1, Math.round(p.chars / 1320)) : null, publishedAt: p.publishedAt, cover: p.image || p.cover || null, href: `/blog/${p.slug}` });

export async function fetchResources() {
  let items, articles;
  if (!configured()) {
    if (!sampleOk()) return [];
    items = SAMPLE_RESOURCES;
    articles = SAMPLE_POSTS.filter((p) => p.contentType === 'article').map(toArticle);
  } else {
    [items, articles] = await Promise.all([query(RESOURCES_QUERY), query(ARTICLES_QUERY)]);
    articles = (articles || []).map(toArticle);
  }
  return [...(items || []), ...articles].sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
}

// Case-study cards for /case-studies: every published case study with the fields the cards and filters use.
const CASES_QUERY = `*[_type == "post" && contentType == "case-study" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()] | order(publishedAt desc)[0...300]{
  title, "slug": slug.current, excerpt, publishedAt, category,
  "image": mainImage{ alt, "url": asset->url },
  "cs": caseStudy{ clientName, "logo": logo.asset->url, industry, companySize, region, useCase, keyResultValue, keyResultLabel }
}`;

export async function fetchCaseStudies() {
  if (!configured()) return sampleOk() ? SAMPLE_CASE_STUDIES : [];
  return (await query(CASES_QUERY)) || [];
}
