import { query } from '../../lib/db.js';
import { send, methodGuard, handle } from '../../lib/http.js';
import { isAuthed } from '../../lib/auth.js';
import { STEP_COUNT } from '../../lib/validate.js';

const COLUMNS = `id, submitted_at, survey_version, duration_seconds, company_name, industry, industry_other, employees, revenue,
  role, decision_others, triggers, trigger_other, main_trigger, alternatives, alternatives_provider, why_ranked, outcome,
  team_today, team_12mo, readiness, nps, referral_followup`;

// Requires a signed-in dashboard session. IP hashes and user agents are never returned.
export default handle(async (req, res) => {
  if (!methodGuard(req, res, 'GET')) return;
  if (!isAuthed(req)) return send(res, 401, { error: 'Sign in required' });

  const responses = (await query(`select ${COLUMNS} from survey_responses order by submitted_at desc`)).rows;
  const prog = (await query('select max_step, completed from survey_progress')).rows;
  const reach = {};
  for (const p of prog) {
    const top = p.completed ? STEP_COUNT - 1 : Math.min(p.max_step, STEP_COUNT - 1);
    for (let s = 0; s <= top; s++) reach[s] = (reach[s] || 0) + 1;
  }
  send(res, 200, {
    responses,
    funnel: { started: prog.length, completed: prog.filter((p) => p.completed).length, reach },
  });
});
