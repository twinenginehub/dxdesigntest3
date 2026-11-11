// Placeholder post used to preview the template when SANITY_PROJECT_ID is not set. Dummy copy, not for publishing.
const b = (style, text, extra = {}) => ({ _type: 'block', style, children: [{ _type: 'span', text, marks: [] }], markDefs: [], ...extra });
export const SAMPLE_POST = {
  title: 'Sample post: how to build a dedicated offshore team',
  slug: 'sample-post',
  excerpt: 'Placeholder excerpt. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
  category: 'Hiring',
  tags: ['Offshore hiring', 'Onboarding', 'Team building', 'Remote work'],
  publishedAt: '2026-11-05T09:00:00Z',
  _updatedAt: '2026-11-06T09:00:00Z',
  author: { name: 'DOXA Team', role: 'Editorial', image: null },
  image: { url: '/hero-team.jpg', alt: 'A DOXA team on a video call', caption: 'Placeholder caption for the featured image.' },
  body: [
    b('normal', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'),
    b('h2', 'Start with the role, not the résumé'),
    { _type: 'block', style: 'normal', markDefs: [{ _key: 'l1', _type: 'link', href: '/solutions.html' }], children: [
      { _type: 'span', text: 'Duis aute irure dolor in reprehenderit in voluptate velit esse. ', marks: [] },
      { _type: 'span', text: 'Bold statement', marks: ['strong'] }, { _type: 'span', text: ', an ', marks: [] }, { _type: 'span', text: 'italic aside', marks: ['em'] },
      { _type: 'span', text: ' and a ', marks: [] }, { _type: 'span', text: 'link to solutions', marks: ['l1'] }, { _type: 'span', text: '.', marks: [] }] },
    b('h3', 'What to define first'),
    b('normal', 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', {}),
    b('normal', 'Clear scope of work', { listItem: 'bullet', level: 1 }),
    b('normal', 'Hours and time-zone overlap', { listItem: 'bullet', level: 1 }),
    b('normal', 'Tools and access', { listItem: 'bullet', level: 1 }),
    b('blockquote', 'Placeholder pull quote. The principles behind a strong team do not stop applying because the person works in another country.'),
    b('h2', 'Onboard like it is a local hire'),
    b('normal', 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.'),
    b('normal', 'Week one: introductions and access', { listItem: 'number', level: 1 }),
    b('normal', 'Week two: shadow the process', { listItem: 'number', level: 1 }),
    b('normal', 'Week four: own the workflow', { listItem: 'number', level: 1 }),
    { _type: 'callout', title: 'Placeholder callout', text: 'Use this for a tip, a definition or a key takeaway. Lorem ipsum dolor sit amet.' },
    { _type: 'image', url: '/about-team.jpg', alt: 'DOXA team members smiling', caption: 'Placeholder inline image with a caption.' },
    b('h2', 'Measure what matters'),
    b('normal', 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.'),
  ],
};

// Placeholder listing data (dummy titles) so the /blog page can be previewed before Sanity is connected. Never served on production.
// Placeholder cards use the gradient fallback, not photos (IMGS kept for reference only).
const IMGS = ['/hero-team.jpg', '/about-team.jpg', '/dd-team-smiles.webp', '/dd-team-video-call.webp', '/office-team.png', '/pricing-team.jpg', '/better-way-team.webp', '/accountant-team.webp'];
const rows = [
  ['article', 'Placeholder article one: lorem ipsum dolor sit amet', 'Hiring', 5],
  ['article', 'Placeholder article two: consectetur adipiscing elit', 'Operations', 7],
  ['case-study', 'Placeholder case study: how a firm scaled with a dedicated team', 'Accounting', 9],
  ['podcast', 'Placeholder episode: a conversation about building global teams', 'Leadership', 34],
  ['whitepaper', 'Placeholder whitepaper: the complete guide to offshore staffing', 'Hiring', 22],
  ['press', 'Placeholder press release: company announcement', 'News', 3],
  ['learning', 'Placeholder learning: onboarding a remote hire in 30 days', 'Onboarding', 12],
  ['article', 'Placeholder article three: sed do eiusmod tempor', 'Compliance', 6],
  ['case-study', 'Placeholder case study two: results after twelve months', 'Healthcare', 8],
  ['article', 'Placeholder article four: ut labore et dolore magna', 'Hiring', 4],
  ['podcast', 'Placeholder episode two: lessons from remote managers', 'Leadership', 41],
  ['whitepaper', 'Placeholder whitepaper two: cost comparison framework', 'Operations', 18],
  ['learning', 'Placeholder learning two: running a weekly one-on-one', 'Management', 9],
  ['press', 'Placeholder press release two: new certification', 'News', 2],
  ['article', 'Placeholder article five: quis nostrud exercitation', 'Onboarding', 5],
  ['case-study', 'Placeholder case study three: from three hires to thirty', 'Legal', 10],
];
export const SAMPLE_POSTS = rows.map(([contentType, title, category, mins], i) => ({
  title, slug: i === 0 ? 'sample-post' : `sample-${contentType}-${i + 1}`, contentType, featured: i < 3, category,
  excerpt: 'Placeholder summary. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
  publishedAt: new Date(Date.UTC(2026, 10, 10 - i * 4)).toISOString(), image: null, chars: mins * 220 * 6,
}));

// Extra fields for sample podcast episodes (slugs sample-podcast-*). The audio file is a short silent placeholder.
export const SAMPLE_PODCAST = {
  episodeNumber: 12, season: 2, duration: '34:12',
  audioUrl: '/blog-assets/sample-episode.wav',
  platforms: [{ name: 'Spotify', url: 'https://open.spotify.com/' }, { name: 'Apple Podcasts', url: 'https://podcasts.apple.com/' }, { name: 'YouTube', url: 'https://www.youtube.com/' }],
  guests: [
    { name: 'Alex Morgan', role: 'Chief Operating Officer', company: 'Placeholder Advisory', linkedin: 'https://www.linkedin.com/' },
    { name: 'Jordan Lee', role: 'Head of People', company: 'Sample Co.' },
  ],
  chapters: [
    { time: '0:00', title: 'Introductions' }, { time: '3:45', title: 'Why teams go offshore' },
    { time: '12:30', title: 'The first ninety days' }, { time: '24:10', title: 'Lessons learned and mistakes to avoid' }, { time: '31:50', title: 'Rapid-fire questions' },
  ],
  transcript: [b('normal', 'Host: Placeholder transcript. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.'), b('normal', 'Guest: Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.')],
};

// ---- Whitepaper sample (dummy numbers, for previewing the chart and stat blocks) ----
export const SAMPLE_WHITEPAPER = {
  pages: 24,
  executiveSummary: 'Placeholder executive summary. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  fileUrl: '/blog-assets/sample-download.pdf',
  keyStats: [
    { value: '62%', label: 'Placeholder: lower cost per hire', note: 'Illustrative figure' },
    { value: '3.4x', label: 'Placeholder: faster time to fill' },
    { value: '$48K', label: 'Placeholder: average annual saving per role' },
    { value: '91%', label: 'Placeholder: twelve-month retention' },
  ],
};
export const SAMPLE_WHITEPAPER_BODY = [
  b('h2', 'The cost pressure facing growing firms'),
  b('normal', 'Placeholder text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. All figures in this sample are dummy values for previewing the template.'),
  { _type: 'chart', chartType: 'bar', title: 'Figure 1. Where the budget goes', unit: '%', caption: 'Placeholder data: share of total staffing cost by category.', source: 'Placeholder survey, n = 500',
    data: [{ label: 'Salary and benefits', value: 58 }, { label: 'Recruiting fees', value: 17 }, { label: 'Office and equipment', value: 12 }, { label: 'Training', value: 8 }, { label: 'Other', value: 5 }] },
  b('h2', 'Time to fill, quarter by quarter'),
  b('normal', 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.'),
  { _type: 'chart', chartType: 'column', title: 'Figure 2. Average days to fill a role', unit: ' days', caption: 'Placeholder data.',
    data: [{ label: 'Q1', value: 64 }, { label: 'Q2', value: 52 }, { label: 'Q3', value: 41 }, { label: 'Q4', value: 28 }] },
  { _type: 'statGrid', items: [{ value: '28', label: 'days to fill, down from 64' }, { value: '56%', label: 'reduction in vacancy time' }, { value: '12', label: 'roles filled in the pilot' }] },
  b('h2', 'Retention and growth'),
  b('normal', 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.'),
  { _type: 'chart', chartType: 'line', title: 'Figure 3. Twelve-month retention', unit: '%', startAtZero: false, source: 'Placeholder data',
    data: [{ label: 'Jan', value: 78 }, { label: 'Mar', value: 82 }, { label: 'May', value: 85 }, { label: 'Jul', value: 88 }, { label: 'Sep', value: 90 }, { label: 'Nov', value: 91 }] },
  b('blockquote', 'Placeholder pull quote. The numbers only matter if the team behind them stays.'),
  b('h2', 'Where the work comes from'),
  { _type: 'chart', chartType: 'donut', title: 'Figure 4. Roles by function', unit: '', caption: 'Placeholder data: number of roles by function.',
    data: [{ label: 'Accounting', value: 42 }, { label: 'Administration', value: 28 }, { label: 'Customer support', value: 18 }, { label: 'IT', value: 12 }] },
  { _type: 'dataTable', caption: 'Table 1. Placeholder cost comparison', source: 'Placeholder data',
    rows: [{ cells: ['Role', 'Local cost', 'Dedicated team cost', 'Saving'] }, { cells: ['Bookkeeper', '$62,000', '$24,000', '61%'] }, { cells: ['Payroll specialist', '$68,000', '$27,000', '60%'] }, { cells: ['AR/AP clerk', '$54,000', '$21,000', '61%'] }] },
  { _type: 'callout', title: 'Key takeaway', text: 'Placeholder takeaway. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  b('h2', 'Methodology'),
  b('normal', 'Placeholder methodology. Describe the sample, time period and how the figures were calculated so readers can trust the numbers.'),
];

// ---- Press release sample ----
export const SAMPLE_PRESS = {
  location: 'Austin, TX',
  contacts: [{ name: 'Jamie Rivera', title: 'Head of Communications', email: 'press@example.com', phone: '(555) 010-0199' }],
  assets: [{ title: 'Press kit (PDF)', url: '/blog-assets/sample-download.pdf' }, { title: 'Logo pack', url: '/blog-assets/sample-download.pdf' }],
};
export const SAMPLE_PRESS_BODY = [
  b('normal', 'DOXA Talent today announced a placeholder milestone. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'),
  b('normal', 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.'),
  b('blockquote', '"Placeholder quote. This is where an executive explains why the announcement matters to customers and to the team," said Alex Morgan, Chief Executive Officer of DOXA Talent.'),
  b('h2', 'Key details'),
  b('normal', 'Placeholder detail one', { listItem: 'bullet', level: 1 }),
  b('normal', 'Placeholder detail two', { listItem: 'bullet', level: 1 }),
  b('normal', 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'),
];

// ---- Franchise blog sample ----
const FR = [
  ['Franchisors', 'Growth', 'Placeholder: scaling support operations across 100 locations'],
  ['Franchisees', 'Operations', 'Placeholder: how a single-unit owner staffs the back office'],
  ['Franchisors', 'Compliance', 'Placeholder: standardizing bookkeeping across your system'],
  ['Franchisees', 'Finance', 'Placeholder: payroll without a full-time hire'],
  ['Franchisors', 'Technology', 'Placeholder: shared services that franchisees actually use'],
  ['Franchisees', 'Growth', 'Placeholder: opening your second location'],
  ['Franchisors', 'Operations', 'Placeholder: onboarding new franchisees in 30 days'],
  ['Franchisees', 'Hiring', 'Placeholder: hiring and training a remote assistant'],
];
export const SAMPLE_FRANCHISE = FR.map(([audience, category, title], i) => ({
  title, slug: `sample-franchise-${i + 1}`, audience, category, featured: i < 3,
  excerpt: 'Placeholder summary. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
  publishedAt: new Date(Date.UTC(2026, 10, 9 - i * 5)).toISOString(), image: null, chars: (4 + i) * 220 * 6,
}));

// ---- Gated download sample (slug: sample-guide) ----
export const SAMPLE_RESOURCE = {
  title: 'Sample guide: the offshore hiring checklist', slug: 'sample-guide', assetType: 'Guide', pages: 18,
  headline: 'The offshore hiring checklist',
  subheadline: 'Placeholder subheading. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
  bullets: ['Placeholder: the five questions to ask before you hire', 'Placeholder: a 30-day onboarding plan you can copy', 'Placeholder: how to compare cost, quality and compliance', 'Placeholder: red flags to watch for in any provider'],
  downloadUrl: '/blog-assets/sample-download.pdf',
  publishedAt: '2026-11-01T09:00:00Z', _updatedAt: '2026-11-06T09:00:00Z',
  buttonLabel: 'Get the guide', thankYouTitle: 'Thanks. Your guide is ready.', thankYouText: 'Placeholder thank-you copy. Use the button to download it now.',
  body: [b('h2', 'Who this is for'), b('normal', 'Placeholder text. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.')],
};

// ---- Case studies listing sample (/case-studies). Dummy clients and numbers. ----
const CS = [
  ['A mid-size accounting firm', 'Accounting', '51–200 employees', 'North America', 'Bookkeeping', '62%', 'lower cost per hire'],
  ['A regional healthcare group', 'Healthcare', '501–1,000 employees', 'North America', 'Customer support', '3x', 'faster response times'],
  ['A boutique law firm', 'Legal', '11–50 employees', 'North America', 'Administrative support', '18 hrs', 'saved per week'],
  ['A property management company', 'Real estate', '201–500 employees', 'North America', 'Back office', '40%', 'lower operating cost'],
  ['An e-commerce brand', 'E-commerce', '51–200 employees', 'Europe', 'Customer support', '24/7', 'coverage in 30 days'],
  ['A managed services provider', 'IT services', '51–200 employees', 'North America', 'Help desk', '91%', 'twelve-month retention'],
  ['An insurance agency', 'Insurance', '11–50 employees', 'North America', 'Administrative support', '2x', 'policies processed'],
  ['A logistics company', 'Logistics', '1,000+ employees', 'Latin America', 'Back office', '35%', 'faster invoicing'],
  ['A growing CPA practice', 'Accounting', '11–50 employees', 'North America', 'Payroll', '28 days', 'to fill, down from 64'],
  ['A dental support organization', 'Healthcare', '201–500 employees', 'North America', 'Administrative support', '50%', 'fewer open roles'],
  ['A software company', 'Technology', '51–200 employees', 'Europe', 'Customer support', '4.8/5', 'customer satisfaction'],
  ['A franchise brand', 'Franchising', '1,000+ employees', 'Asia Pacific', 'Back office', '100+', 'locations supported'],
];
export const SAMPLE_CASE_STUDIES = CS.map(([clientName, industry, companySize, region, useCase, keyResultValue, keyResultLabel], i) => ({
  title: `Placeholder: how ${clientName.toLowerCase()} improved ${useCase.toLowerCase()} with DOXA`, slug: i === 0 ? 'sample-case-study-3' : `sample-case-study-${i + 100}`,
  excerpt: 'Placeholder summary. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
  publishedAt: new Date(Date.UTC(2026, 10, 10 - i * 6)).toISOString(), category: industry, image: null,
  cs: { clientName, logo: null, industry, companySize, region, useCase, keyResultValue, keyResultLabel },
}));
