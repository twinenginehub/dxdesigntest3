import { fetchPost } from '../../lib/blog/sanity.js';
import { renderPost, renderNotFound } from '../../lib/blog/render.js';

// Public, read-only. Rendered on the server so search engines get full HTML; cached at the edge and refreshed in the background.
export default async function handler(req, res) {
  const slug = String((req.query && req.query.slug) || new URL(req.url, 'http://x').searchParams.get('slug') || '');
  const html = (code, body, cache) => { res.statusCode = code; res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', cache); res.end(body); };
  if (!/^[a-z0-9][a-z0-9-]{0,100}$/i.test(slug)) return html(404, renderNotFound(), 'public, s-maxage=60');
  try {
    const post = await fetchPost(slug);
    if (!post) return html(404, renderNotFound(), 'public, s-maxage=60');
    const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
    const base = process.env.SITE_URL || `${proto}://${req.headers['x-forwarded-host'] || req.headers.host}`;
    return html(200, renderPost(post, base.replace(/\/$/, '')), 'public, s-maxage=300, stale-while-revalidate=86400');
  } catch (e) {
    console.error('blog post failed', e);
    return html(502, renderNotFound(), 'no-store');
  }
}
