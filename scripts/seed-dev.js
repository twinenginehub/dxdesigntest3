// DEV ONLY: fills the embedded local Postgres with synthetic responses so the dashboard can be reviewed.
// Refuses to run unless LOCAL_DB=pglite, so it can never touch a real database.
//   LOCAL_DB=pglite node scripts/seed-dev.js
import { query } from '../lib/db.js';
import { QUESTIONS, byId, OTHER, NONE_ELSE, NO_ALTERNATIVE, NO_READINESS, PROVIDER_OPTION } from '../survey-assets/questions.js';

if (process.env.LOCAL_DB !== 'pglite') { console.error('Refusing to seed: LOCAL_DB=pglite is not set.'); process.exit(1); }

let seed = 7;
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const pickMany = (a, min, max) => { const n = min + Math.floor(rnd() * (max - min + 1)); return [...a].sort(() => rnd() - 0.5).slice(0, n); };
const weighted = (a, w) => { let t = w.reduce((x, y) => x + y, 0) * rnd(); for (let i = 0; i < a.length; i++) { t -= w[i]; if (t <= 0) return a[i]; } return a[a.length - 1]; };

const outcomes = [
  'We cut our month-end close from nine days to four and save about 25 hours a week.',
  'Our open roles fill faster and our leaders stopped doing data entry. We reclaimed roughly 15 hours a week.',
  'We took on 12 new clients without hiring locally. Response time dropped from two days to same day.',
  'Billing backlog is gone and cash collection improved. Reporting is finally on time.',
  'Our team has more capacity for client work and growth. Costs are about 40% lower than a local hire.',
  'We can now run a second shift of support. Customer response time is under one hour.',
  'Leaders focus on strategy instead of admin. Our turnover in the role went to zero.',
  'Bookkeeping, reporting and reconciliations are handled and we expanded to a new service line.',
];
const follow = [
  'Other accounting firms in our network. I would tell them the team integrates quickly and stays.',
  'Peers in managed IT. I would say the security controls and direct employment made the decision easy.',
  'A friend running a law firm. I would tell them the hiring backlog disappears and the pricing is clear.',
  'Healthcare billing companies. I would say the quality of candidates was far better than we found locally.',
  'My board colleagues. Reliable people, honest pricing, and the team supports us after the hire.',
];
const companies = ['Harbor', 'Northwind', 'Summit', 'Evergreen', 'Cobalt', 'Lakeside', 'Granite', 'Pioneer', 'Meridian', 'Bluebird', 'Cedar', 'Atlas'];
const suffix = ['Advisory', 'Partners', 'Group', 'Health', 'Systems', 'Legal', 'Financial', 'Works'];

const N = 46;
for (let i = 0; i < N; i++) {
  const industry = weighted(byId.industry.options, [4, 3, 6, 3, 2, 3, 2, 3, 1, 1]);
  const triggers = pickMany(byId.triggers.options, 1, 4);
  const alts = rnd() < 0.12 ? [NO_ALTERNATIVE] : pickMany(byId.alternatives.options.filter((o) => o !== NO_ALTERNATIVE), 1, 3);
  const readiness = rnd() < 0.15 ? [NO_READINESS] : pickMany(byId.readiness.options.filter((o) => o !== NO_READINESS), 1, 3);
  const others = rnd() < 0.2 ? [NONE_ELSE] : pickMany(byId.role_decision.others.options.filter((o) => o !== NONE_ELSE), 1, 3);
  const nps = weighted([10, 9, 8, 7, 6, 5, 3], [30, 28, 14, 8, 4, 2, 1]);
  const done = i < 38;
  const sid = crypto.randomUUID();
  const base = { 0: 1, 1: 1 };
  if (done) {
    await query(
      `insert into survey_responses (sid, submitted_at, duration_seconds, company_name, industry, industry_other, employees, revenue, role, decision_others,
        triggers, trigger_other, main_trigger, alternatives, alternatives_provider, why_ranked, outcome, team_today, team_12mo, readiness, nps, referral_followup)
       values ($1, now() - ($2 || ' days')::interval, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
      [sid, String(Math.floor(rnd() * 40)), 90 + Math.floor(rnd() * 300), `Test Company ${String(i + 1).padStart(2, '0')} ${pick(companies)} ${pick(suffix)}`,
        industry, industry === OTHER ? 'Marketing agency' : null, pick(byId.company_size.fields[0].options), pick(byId.company_size.fields[1].options),
        pick(byId.role_decision.role.options), others, triggers, triggers.includes(OTHER) ? 'Lost our controller' : null, pick(triggers), alts,
        alts.includes(PROVIDER_OPTION) ? 'Another provider' : null, pickMany(byId.why_ranked.options, 3, 3), rnd() < 0.9 ? pick(outcomes) : null,
        pick(byId.team_size.fields[0].options), pick(byId.team_size.fields[1].options), readiness, nps, rnd() < 0.85 ? pick(follow) : null]);
  }
  const maxStep = done ? 99 : 1 + Math.floor(rnd() * 11);
  await query('insert into survey_progress (sid, max_step, completed) values ($1, $2, $3)', [sid, maxStep, done]);
}
console.log(`Seeded ${N} synthetic sessions (38 completed). Names start with "Test Company".`);
process.exit(0);
