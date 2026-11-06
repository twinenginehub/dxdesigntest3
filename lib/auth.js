import crypto from 'node:crypto';
import { query } from './db.js';

const COOKIE = 'dx_survey_session';
const MAX_AGE = 60 * 60 * 8; // 8 hours

const b64u = (b) => Buffer.from(b).toString('base64url');
const secret = () => process.env.SESSION_SECRET || '';
const hmac = (data) => crypto.createHmac('sha256', secret()).update(data).digest('base64url');

export function authConfigured() {
  return Boolean(process.env.DASHBOARD_PASSWORD && secret().length >= 32);
}

export function clientIp(req) {
  const xf = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return xf || req.socket?.remoteAddress || 'unknown';
}

export function ipHash(req) {
  return crypto.createHmac('sha256', secret() || 'dx-survey').update(clientIp(req)).digest('hex').slice(0, 32);
}

export function passwordMatches(input) {
  const a = crypto.createHash('sha256').update(String(input || '')).digest();
  const b = crypto.createHash('sha256').update(String(process.env.DASHBOARD_PASSWORD || '')).digest();
  return crypto.timingSafeEqual(a, b);
}

export function makeSession() {
  const payload = b64u(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + MAX_AGE, v: 1 }));
  return `${payload}.${hmac(payload)}`;
}

function parseCookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function isAuthed(req) {
  if (!authConfigured()) return false;
  const tok = parseCookies(req)[COOKIE];
  if (!tok) return false;
  const [payload, sig] = tok.split('.');
  if (!payload || !sig) return false;
  const expected = hmac(payload);
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')).exp > Date.now() / 1000; }
  catch { return false; }
}

const isHttps = (req) => (req.headers['x-forwarded-proto'] || '').includes('https') || process.env.VERCEL === '1';

export function sessionCookie(req, value, maxAge = MAX_AGE) {
  return `${COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${isHttps(req) ? '; Secure' : ''}`;
}

// 5 failed sign-ins per 15 minutes per network address.
export async function loginLocked(req) {
  const { rows } = await query(
    "select count(*)::int as n from survey_login_attempts where ip_hash = $1 and at > now() - interval '15 minutes'",
    [ipHash(req)]);
  return rows[0].n >= 5;
}
export async function recordFailedLogin(req) {
  await query('insert into survey_login_attempts (ip_hash) values ($1)', [ipHash(req)]);
  await query("delete from survey_login_attempts where at < now() - interval '1 day'");
}
