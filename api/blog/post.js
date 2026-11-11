import { fetchPost, fetchResource } from '../../lib/blog/sanity.js';
import { renderPost, renderNotFound } from '../../lib/blog/render.js';
import { renderGated } from '../../lib/blog/gated.js';

// Public, read-only. One function serves blog posts, franchise-blog posts (?section=franchise) and lead-magnet pages (?kind=resource),
// rendered on the server so search engines get full HTML; cached at the edge and refreshed in the background.
export default async function handler(req, res) {
  const sp = new URL(req.url, 'http://x').searchParams;
  const slug = String((req.query && req.query.slug) || sp.get('slug') || '');
  const section = sp.get('section') === 'franchise' ? 'franchise' : 'blog';
  const kind = sp.get('kind') === 'resource' ? 'resource' : 'post';
  const html = (code, body, cache) => { res.statusCode = code; res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', cache); res.end(body); };
  if (!/^[a-z0-9][a-z0-9-]{0,100}$/i.test(slug)) return html(404, renderNotFound(), 'public, s-maxage=60');
  try {
    const item = kind === 'resource' ? await fetchResource(slug) : await fetchPost(slug, section);
    if (!item) return html(404, renderNotFound(), 'public, s-maxage=60');
    const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
    const base = (process.env.SITE_URL || `${proto}://${req.headers['x-forwarded-host'] || req.headers.host}`).replace(/\/$/, '');
    const out = kind === 'resource' ? renderGated(item, base) : renderPost(item, base, section);
    return html(200, out, 'public, s-maxage=300, stale-while-revalidate=86400');
  } catch (e) {
    console.error('blog post failed', e);
    return html(502, renderNotFound(), 'no-store');
  }
}
