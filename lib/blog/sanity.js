// Reads published posts from a Sanity dataset over its public HTTP API (no SDK, no token: the dataset must be public).
import { SAMPLE_POST, SAMPLE_POSTS } from './sample.js';

const API_VERSION = 'v2025-01-01';
const POST_QUERY = `*[_type == "post" && slug.current == $slug && defined(publishedAt) && publishedAt <= now()][0]{
  title, "slug": slug.current, contentType, excerpt, category, tags, publishedAt, _updatedAt, seoTitle, seoDescription,
  "author": author->{ name, role, "image": image.asset->url },
  "image": mainImage{ alt, caption, "url": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height },
  "body": body[]{ ..., _type == "image" => { ..., "url": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height } }
}`;

export const configured = () => !!process.env.SANITY_PROJECT_ID;

export async function fetchPost(slug) {
  // Before Sanity is connected the template can be previewed locally and on Vercel previews, never on production.
  if (!configured()) {
    const meta = SAMPLE_POSTS.find((p) => p.slug === slug);
    return meta && process.env.VERCEL_ENV !== 'production' ? { ...SAMPLE_POST, ...meta, slug } : null;
  }
  const ds = process.env.SANITY_DATASET || 'production';
  const url = `https://${process.env.SANITY_PROJECT_ID}.apicdn.sanity.io/${API_VERSION}/data/query/${ds}?query=${encodeURIComponent(POST_QUERY)}&%24slug=${encodeURIComponent(JSON.stringify(slug))}`;
  const r = await fetch(url, { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error(`Sanity responded ${r.status}`);
  const { result } = await r.json();
  return result || null;
}

const LIST_QUERY = `*[_type == "post" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()] | order(publishedAt desc)[0...300]{
  title, "slug": slug.current, contentType, featured, excerpt, category, publishedAt,
  "image": mainImage{ alt, "url": asset->url },
  "chars": length(pt::text(body))
}`;

// Every published post, newest first, with only the fields a card needs.
export async function fetchPosts() {
  if (!configured()) return process.env.VERCEL_ENV !== 'production' ? SAMPLE_POSTS : [];
  const ds = process.env.SANITY_DATASET || 'production';
  const url = `https://${process.env.SANITY_PROJECT_ID}.apicdn.sanity.io/${API_VERSION}/data/query/${ds}?query=${encodeURIComponent(LIST_QUERY)}`;
  const r = await fetch(url, { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error(`Sanity responded ${r.status}`);
  const { result } = await r.json();
  return result || [];
}
