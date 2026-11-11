import { fetchPosts } from '../../lib/blog/sanity.js';
import { renderList } from '../../lib/blog/render-list.js';
import { renderFranchiseList } from '../../lib/blog/render-franchise.js';

// Public, read-only listings. /blog (default) and /franchise-blog (?section=franchise). Filters (?type=, ?audience=, ?topic=, ?page=) are applied on
// the server so every view is crawlable.
export default async function handler(req, res) {
  const url = new URL(req.url, 'http://x');
  const franchise = url.searchParams.get('section') === 'franchise';
  const query = { type: url.searchParams.get('type') || '', audience: url.searchParams.get('audience') || '', topic: url.searchParams.get('topic') || '', page: url.searchParams.get('page') || '' };
  const send = (code, body, cache) => { res.statusCode = code; res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', cache); res.end(body); };
  try {
    const posts = await fetchPosts(franchise ? 'franchise' : 'blog');
    const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
    const base = (process.env.SITE_URL || `${proto}://${req.headers['x-forwarded-host'] || req.headers.host}`).replace(/\/$/, '');
    send(200, franchise ? renderFranchiseList(posts, query, base) : renderList(posts, query, base), 'public, s-maxage=300, stale-while-revalidate=86400');
  } catch (e) {
    console.error('blog list failed', e);
    send(502, '<!doctype html><meta charset="utf-8"><title>Blog unavailable</title><p>The blog is temporarily unavailable. Please try again shortly.</p>', 'no-store');
  }
}
