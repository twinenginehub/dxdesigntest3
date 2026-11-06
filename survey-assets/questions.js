// Single source of truth for the DOXA ICP survey: used by the survey page, the dashboard and the API validator.
// Question wording and option text are taken verbatim from "DOXA ICP Survey Setup.docx".

export const SURVEY_VERSION = 1;
export const OTHER = 'Other (please specify)';
export const NONE_ELSE = 'No one else';
export const NO_ALTERNATIVE = "We didn't consider anything else";
export const NO_READINESS = 'None of these';
export const PROVIDER_OPTION = 'Another offshore or nearshore staffing company (please name it)';

export const COMPANY = {
  id: 'company_name',
  label: 'Which company do you work for?',
  maxLength: 200,
};

export const QUESTIONS = [
  {
    id: 'industry', n: 1, type: 'single', short: 'Industry',
    label: 'Which best describes your company?',
    options: [
      'Healthcare provider or practice (clinic, dental office, medical group)',
      'Healthcare services company that supports providers (billing, RCM, MSO, staffing, telehealth operations)',
      'Accounting or CPA firm',
      'Financial services or wealth management',
      'Retirement plan administration (TPA, recordkeeper)',
      'Managed IT service provider (MSP) or IT services',
      'SaaS or software company',
      'Law firm',
      'Other professional services',
      OTHER,
    ],
    other: { option: OTHER, field: 'industry_other', maxLength: 300 },
  },
  {
    id: 'company_size', n: 2, type: 'dual', short: 'Company size',
    label: 'About how many employees does your company have, and what is its annual revenue?',
    fields: [
      { id: 'employees', label: 'Employees', options: ['Under 25', '25-49', '50-99', '100-249', '250-499', '500+'] },
      { id: 'revenue', label: 'Annual revenue', options: ['Under $5M', '$5-10M', '$10-25M', '$25-75M', '$75-150M', 'Over $150M', 'Prefer not to say'] },
    ],
  },
  {
    id: 'role_decision', n: 3, type: 'role', short: 'Role and decision',
    label: 'What is your role, and who else was involved in the decision to work with DOXA?',
    role: {
      id: 'role', label: 'Your role',
      options: ['Owner/CEO/President', 'COO or operations leader', 'CFO or finance leader', 'HR, people or recruiting leader', 'Department or team leader', 'Other'],
    },
    others: {
      id: 'decision_others', label: 'Others involved', exclusive: NONE_ELSE,
      options: [NONE_ELSE, 'CEO or owner', 'Finance', 'HR', 'IT or security', 'The leader who manages the VIP', 'Board or partners'],
    },
  },
  {
    id: 'triggers', n: 4, type: 'multi', short: 'Trigger event',
    label: 'What was happening in your business when you first started looking for help? Select all that apply.',
    options: [
      'A role stayed open too long',
      'Labor costs were rising faster than revenue',
      'Growth outpaced our team',
      'Turnover in a key role',
      'Leaders were spending time on work below their level',
      'A merger, acquisition or reorganization',
      'A bad experience with another outsourcing provider',
      "We needed skills our team didn't have, including AI",
      OTHER,
    ],
    other: { option: OTHER, field: 'trigger_other', maxLength: 300 },
  },
  {
    id: 'main_trigger', n: 4, sub: 'b', type: 'single', pipeFrom: 'triggers', short: 'Main trigger',
    label: 'Which one was the main trigger?',
  },
  {
    id: 'alternatives', n: 5, type: 'multi', short: 'Alternatives considered',
    label: 'Before choosing DOXA, what else did you seriously consider? Select all that apply.',
    options: [
      'Hiring in the U.S.',
      'Freelancers or a marketplace such as Upwork',
      PROVIDER_OPTION,
      'An employer of record (EOR) platform where we would find the person ourselves',
      'Software or AI automation instead of a hire',
      'Asking our current team to absorb the work',
      NO_ALTERNATIVE,
    ],
    exclusive: NO_ALTERNATIVE,
    other: { option: PROVIDER_OPTION, field: 'alternatives_provider', maxLength: 300, textLabel: 'Provider name' },
  },
  {
    id: 'why_ranked', n: 6, type: 'rank', max: 3, short: 'Why DOXA',
    label: 'Rank the top three reasons you chose DOXA.',
    options: [
      'The quality of the candidates we were shown',
      'How DOXA treats its professionals: direct employment, benefits and ongoing development (Conscious Outsourcing™)',
      'Security and compliance (SOC 2)',
      'One all-in monthly rate with no setup or recruiting fees',
      '30-day cancellation',
      'Time zone and location of the talent',
      'AI certification for the professionals on our team',
      'A referral or recommendation from someone we trust',
      'The DOXA team we worked with during the sale',
    ],
  },
  {
    id: 'outcome', n: 7, type: 'text', maxLength: 4000, short: 'Outcome',
    label: "What can your business do now that it couldn't before DOXA? Include a number if you have one (hours saved, cost saved, revenue, response time).",
  },
  {
    id: 'team_size', n: 8, type: 'dual', short: 'Team size and expansion',
    label: 'How many DOXA professionals do you have today, and how many do you expect to have 12 months from now?',
    fields: [
      { id: 'team_today', label: 'Today', options: ['1', '2', '3-5', '6-10', '11+'] },
      { id: 'team_12mo', label: 'In 12 months', options: ['Fewer', 'About the same', '1-2 more', '3-5 more', '6+ more'] },
    ],
  },
  {
    id: 'readiness', n: 9, type: 'multi', exclusive: NO_READINESS, short: 'Readiness',
    label: 'Before DOXA, which of these applied to your business? Select all that apply.',
    options: [
      'Our team was already partly or fully remote',
      'We had used offshore or nearshore talent before',
      'We had used freelancers or contractors',
      NO_READINESS,
    ],
  },
  {
    id: 'nps', n: 10, type: 'scale', min: 0, max: 10, short: 'Likelihood to recommend',
    label: 'How likely are you to recommend DOXA to a peer?',
  },
  {
    id: 'referral_followup', n: 10, sub: 'b', type: 'text', maxLength: 4000, short: 'Referral follow-up',
    label: 'Who specifically would you recommend DOXA to, and what would you tell them?',
  },
];

export const TOTAL_QUESTIONS = 10; // company name is not counted
export const byId = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
