import { send, methodGuard, jsonGuard, readBody, handle } from '../../lib/http.js';
import { authConfigured, passwordMatches, makeSession, sessionCookie, loginLocked, recordFailedLogin } from '../../lib/auth.js';

export default handle(async (req, res) => {
  if (!methodGuard(req, res, 'POST') || !jsonGuard(req, res)) return;
  if (!authConfigured()) return send(res, 503, { error: 'Not configured' });
  if (await loginLocked(req)) return send(res, 429, { error: 'Too many attempts. Try again in 15 minutes.' }, { 'Retry-After': '900' });
  const body = await readBody(req);
  if (!body || !passwordMatches(body.password)) {
    await recordFailedLogin(req);
    return send(res, 401, { error: 'Incorrect password' });
  }
  send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie(req, makeSession()) });
});
