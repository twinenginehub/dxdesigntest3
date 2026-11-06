import { query } from '../../lib/db.js';
import { send, methodGuard, jsonGuard, readBody, handle } from '../../lib/http.js';
import { normalizeSubmission, isUuid } from '../../lib/validate.js';
import { ipHash } from '../../lib/auth.js';
import { SURVEY_VERSION } from '../../survey-assets/questions.js';

// Public endpoint: write-only. There is no way to read anything back through it.
export default handle(async (req, res) => {
  if (!methodGuard(req, res, 'POST') || !jsonGuard(req, res)) return;
  const body = await readBody(req);
  if (!body) return send(res, 400, { error: 'Invalid request' });

  if (body.website) return send(res, 200, { ok: true }); // honeypot: bots fill hidden fields

  const { row, error } = normalizeSubmission(body.answers);
  if (error) return send(res, 400, { error });

  const sid = isUuid(body.sid) ? body.sid : null;
  const hash = ipHash(req);

  const recent = await query(
    "select count(*)::int as n from survey_responses where ip_hash = $1 and submitted_at > now() - interval '10 minutes'",
    [hash]);
  if (recent.rows[0].n >= 10) return send(res, 429, { error: 'Too many submissions. Please try again later.' });

  const duration = Number.isInteger(body.duration_seconds) && body.duration_seconds >= 0 && body.duration_seconds < 86400 ? body.duration_seconds : null;
  const ua = String(req.headers['user-agent'] || '').slice(0, 200);

  const cols = ['sid', 'survey_version', 'duration_seconds', 'ip_hash', 'user_agent', ...Object.keys(row)];
  const vals = [sid, SURVEY_VERSION, duration, hash, ua, ...Object.values(row)];
  const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
  // A repeated submit of the same survey session is simply acknowledged.
  await query(`insert into survey_responses (${cols.join(', ')}) values (${placeholders}) on conflict (sid) do nothing`, vals);

  if (sid) {
    await query(
      `insert into survey_progress (sid, max_step, completed) values ($1, 99, true)
       on conflict (sid) do update set completed = true, max_step = greatest(survey_progress.max_step, 99), updated_at = now()`,
      [sid]);
  }
  send(res, 200, { ok: true });
});
