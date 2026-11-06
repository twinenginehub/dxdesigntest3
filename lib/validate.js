import { QUESTIONS, COMPANY, byId, NONE_ELSE } from '../survey-assets/questions.js';

const clean = (v, max) => {
  if (v == null) return null;
  const s = String(v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
  return s ? s.slice(0, max) : null;
};
const oneOf = (v, list) => (typeof v === 'string' && list.includes(v) ? v : null);
const manyOf = (v, list, max = 20) => {
  if (!Array.isArray(v)) return [];
  const out = [];
  for (const x of v) if (typeof x === 'string' && list.includes(x) && !out.includes(x)) out.push(x);
  return out.slice(0, max);
};

// Turns whatever the browser sent into a row we are willing to store; anything not on the allow-list is dropped.
export function normalizeSubmission(a) {
  if (!a || typeof a !== 'object') return { error: 'Invalid submission' };
  const company = clean(a.company_name, COMPANY.maxLength);
  if (!company) return { error: 'Company name is required' };

  const q = byId;
  const row = { company_name: company };

  row.industry = oneOf(a.industry, q.industry.options);
  row.industry_other = row.industry === q.industry.other.option ? clean(a.industry_other, 300) : null;

  for (const f of q.company_size.fields) row[f.id] = oneOf(a[f.id], f.options);
  for (const f of q.team_size.fields) row[f.id] = oneOf(a[f.id], f.options);

  row.role = oneOf(a.role, q.role_decision.role.options);
  row.decision_others = manyOf(a.decision_others, q.role_decision.others.options);
  if (row.decision_others.includes(NONE_ELSE)) row.decision_others = [NONE_ELSE];

  row.triggers = manyOf(a.triggers, q.triggers.options);
  row.trigger_other = row.triggers.includes(q.triggers.other.option) ? clean(a.trigger_other, 300) : null;
  row.main_trigger = oneOf(a.main_trigger, row.triggers);

  row.alternatives = manyOf(a.alternatives, q.alternatives.options);
  if (row.alternatives.includes(q.alternatives.exclusive)) row.alternatives = [q.alternatives.exclusive];
  row.alternatives_provider = row.alternatives.includes(q.alternatives.other.option) ? clean(a.alternatives_provider, 300) : null;

  row.why_ranked = manyOf(a.why_ranked, q.why_ranked.options, q.why_ranked.max);
  row.outcome = clean(a.outcome, q.outcome.maxLength);

  row.readiness = manyOf(a.readiness, q.readiness.options);
  if (row.readiness.includes(q.readiness.exclusive)) row.readiness = [q.readiness.exclusive];

  const n = Number(a.nps);
  row.nps = a.nps !== '' && a.nps != null && Number.isInteger(n) && n >= 0 && n <= 10 ? n : null;
  row.referral_followup = clean(a.referral_followup, q.referral_followup.maxLength);
  return { row };
}

export const isUuid = (s) => typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
export const STEP_COUNT = QUESTIONS.length + 1;
