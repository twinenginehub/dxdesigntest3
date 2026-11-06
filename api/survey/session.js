import { send, methodGuard, handle } from '../../lib/http.js';
import { isAuthed, authConfigured } from '../../lib/auth.js';

// Names only, never values, and only while setup is incomplete, so a missing variable is easy to spot.
function missingSettings() {
  const out = [];
  if (!process.env.DASHBOARD_PASSWORD) out.push('DASHBOARD_PASSWORD');
  if (!process.env.SESSION_SECRET) out.push('SESSION_SECRET');
  else if (process.env.SESSION_SECRET.length < 32) out.push('SESSION_SECRET (needs 32 or more characters)');
  if (!process.env.DATABASE_URL) out.push('DATABASE_URL');
  return out;
}

// Tells the dashboard page whether to show the sign-in form. Reveals nothing else.
export default handle(async (req, res) => {
  if (!methodGuard(req, res, 'GET')) return;
  const missing = missingSettings();
  send(res, 200, { authed: isAuthed(req), configured: authConfigured(), ...(missing.length ? { missing } : {}) });
});
