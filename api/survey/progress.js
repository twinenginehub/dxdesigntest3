import { query } from '../../lib/db.js';
import { send, methodGuard, jsonGuard, readBody, handle } from '../../lib/http.js';
import { isUuid, STEP_COUNT } from '../../lib/validate.js';

// Public, write-only drop-off tracking: a random session id and a step number. No answers, no personal data.
export default handle(async (req, res) => {
  if (!methodGuard(req, res, 'POST') || !jsonGuard(req, res)) return;
  const body = await readBody(req);
  const step = Number(body && body.step);
  if (!body || !isUuid(body.sid) || !Number.isInteger(step) || step < 0 || step > STEP_COUNT) return send(res, 400, { error: 'Invalid request' });
  await query(
    `insert into survey_progress (sid, max_step) values ($1, $2)
     on conflict (sid) do update set max_step = greatest(survey_progress.max_step, $2), updated_at = now()`,
    [body.sid, step]);
  send(res, 200, { ok: true });
});
