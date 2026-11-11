// Reads published posts from a Sanity dataset over its public HTTP API (no SDK, no token: the dataset must be public).
import { SAMPLE_POST } from './sample.js';

const API_VERSION = 'v2025-01-01';
const POST_QUERY = `*[_type == "post" && slug.current == $slug && defined(publishedAt) && publishedAt <= now()][0]{
  title, "slug": slug.current, excerpt, category, tags, publishedAt, _updatedAt, seoTitle, seoDescription,
  "author": author->{ name, role, "image": image.asset->url },
  "image": mainImage{ alt, caption, "url": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height },
  "body": body[]{ ..., _type == "image" => { ..., "url": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height } }
}`;

export const configured = () => !!process.env.SANITY_PROJECT_ID;

export async function fetchPost(slug) {
  // Before Sanity is connected the template can be previewed locally and on Vercel previews, never on production.
  if (!configured()) return slug === SAMPLE_POST.slug && process.env.VERCEL_ENV !== 'production' ? SAMPLE_POST : null;
  const ds = process.env.SANITY_DATASET || 'production';
  const url = `https://${process.env.SANITY_PROJECT_ID}.apicdn.sanity.io/${API_VERSION}/data/query/${ds}?query=${encodeURIComponent(POST_QUERY)}&%24slug=${encodeURIComponent(JSON.stringify(slug))}`;
  const r = await fetch(url, { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error(`Sanity responded ${r.status}`);
  const { result } = await r.json();
  return result || null;
}
