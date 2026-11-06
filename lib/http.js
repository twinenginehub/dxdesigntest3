import { NotConfiguredError } from './db.js';

export function send(res, status, body, headers = {}) {
  res.statusCode = status;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  if (typeof body === 'string') {
    res.setHeader('Content-Type', headers['Content-Type'] || 'text/plain; charset=utf-8');
    res.end(body);
  } else {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
  }
}

export function methodGuard(req, res, method) {
  if (req.method !== method) { send(res, 405, { error: 'Method not allowed' }, { Allow: method }); return false; }
  return true;
}

// State-changing requests must be JSON from our own origin (blocks cross-site form posts).
export function jsonGuard(req, res) {
  const ct = String(req.headers['content-type'] || '');
  if (!ct.toLowerCase().startsWith('application/json')) { send(res, 415, { error: 'Expected JSON' }); return false; }
  const origin = req.headers.origin;
  if (origin) {
    let ok = false;
    try { ok = new URL(origin).host === req.headers.host; } catch { /* ignore */ }
    if (!ok) { send(res, 403, { error: 'Forbidden' }); return false; }
  }
  return true;
}

export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return null; } }
  const chunks = [];
  let size = 0;
  for await (const c of req) { size += c.length; if (size > 64 * 1024) return null; chunks.push(c); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return null; }
}

export function handle(fn) {
  return async (req, res) => {
    try { await fn(req, res); }
    catch (e) {
      if (e instanceof NotConfiguredError) return send(res, 503, { error: 'Not configured' });
      console.error('survey api error:', e && e.message);
      send(res, 500, { error: 'Something went wrong' });
    }
  };
}
