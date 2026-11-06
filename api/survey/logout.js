import { send, methodGuard, jsonGuard, handle } from '../../lib/http.js';
import { sessionCookie } from '../../lib/auth.js';

export default handle(async (req, res) => {
  if (!methodGuard(req, res, 'POST') || !jsonGuard(req, res)) return;
  send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie(req, '', 0) });
});
