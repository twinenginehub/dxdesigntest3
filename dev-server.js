// Local development server: serves the static site, applies the vercel.json rewrites and runs the /api functions.
// Usage: npm run dev   (reads .env.local; LOCAL_DB=pglite uses an embedded Postgres in .dev-data/)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4200);

// minimal .env.local loader
for (const f of ['.env.local', '.env']) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon',
};

function matchRoute(pattern, url) {
  // supports "/path" and "/path/(.*)"
  const re = new RegExp('^' + pattern.replace(/\(\.\*\)/g, '.*') + '$');
  return re.test(url);
}

function applyHeaders(res, url) {
  for (const rule of vercel.headers || []) {
    if (matchRoute(rule.source, url)) for (const h of rule.headers) res.setHeader(h.key, h.value);
  }
}

function serveFile(res, file) {
  fs.readFile(file, (err, data) => {
    if (err) { res.statusCode = 404; return res.end('Not found'); }
    res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] || 'application/octet-stream');
    res.end(data);
  });
}

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  let pathname = decodeURIComponent(u.pathname);
  applyHeaders(res, pathname);

  if (/^\/blog\/?$/.test(pathname)) pathname = '/api/blog/index';
  const blog = pathname.match(/^\/blog\/([^/]+)\/?$/);
  if (blog) { req.url = '/api/blog/post?slug=' + encodeURIComponent(blog[1]); pathname = '/api/blog/post'; }
  if (/^\/franchise-blog\/?$/.test(pathname)) { req.url = '/api/blog/index?section=franchise' + (u.search ? '&' + u.search.slice(1) : ''); pathname = '/api/blog/index'; }
  const fr = pathname.match(/^\/franchise-blog\/([^/]+)\/?$/);
  if (fr) { req.url = '/api/blog/post?section=franchise&slug=' + encodeURIComponent(fr[1]); pathname = '/api/blog/post'; }
  const rs = pathname.match(/^\/resources\/([^/]+)\/?$/);
  if (rs) { req.url = '/api/blog/post?kind=resource&slug=' + encodeURIComponent(rs[1]); pathname = '/api/blog/post'; }

  if (pathname.startsWith('/api/')) {
    const name = pathname.replace(/^\/api\//, '').replace(/\/+$/, '');
    const file = path.join(root, 'api', name + '.js');
    if (!file.startsWith(path.join(root, 'api')) || !fs.existsSync(file)) { res.statusCode = 404; return res.end('Not found'); }
    try {
      const mod = await import(pathToFileURL(file).href + '?t=' + fs.statSync(file).mtimeMs);
      await mod.default(req, res);
    } catch (e) { console.error(e); res.statusCode = 500; res.end('Server error'); }
    return;
  }

  for (const rw of vercel.rewrites || []) {
    if (rw.source === pathname) { pathname = rw.destination; break; }
  }
  let file = path.join(root, pathname);
  if (!file.startsWith(root)) { res.statusCode = 403; return res.end('Forbidden'); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  serveFile(res, file);
}).listen(port, () => console.log(`dev server on http://localhost:${port}`));
