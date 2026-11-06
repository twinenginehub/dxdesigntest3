import { query } from '../../lib/db.js';
import { send, methodGuard, handle } from '../../lib/http.js';
import { isAuthed } from '../../lib/auth.js';

const COLS = ['submitted_at', 'company_name', 'email', 'industry', 'industry_other', 'employees', 'revenue', 'role', 'decision_others',
  'triggers', 'trigger_other', 'main_trigger', 'alternatives', 'alternatives_provider', 'why_ranked', 'outcome',
  'team_today', 'team_12mo', 'readiness', 'nps', 'referral_followup'];

// Cells starting with = + - @ are prefixed so spreadsheets never run them as formulas.
function cell(v) {
  if (v == null) return '';
  let s = Array.isArray(v) ? v.join('; ') : v instanceof Date ? v.toISOString() : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

export default handle(async (req, res) => {
  if (!methodGuard(req, res, 'GET')) return;
  if (!isAuthed(req)) return send(res, 401, { error: 'Sign in required' });
  const { rows } = await query(`select ${COLS.join(', ')} from survey_responses order by submitted_at desc`);
  const csv = [COLS.join(','), ...rows.map((r) => COLS.map((c) => cell(r[c])).join(','))].join('\r\n');
  send(res, 200, csv, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': 'attachment; filename="doxa-icp-survey.csv"',
  });
});
