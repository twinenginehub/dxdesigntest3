import { send, methodGuard, handle } from '../../lib/http.js';
import { isAuthed, authConfigured } from '../../lib/auth.js';

// Tells the dashboard page whether to show the sign-in form. Reveals nothing else.
export default handle(async (req, res) => {
  if (!methodGuard(req, res, 'GET')) return;
  send(res, 200, { authed: isAuthed(req), configured: authConfigured() });
});
