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
  publishedAt: new Date(Date.UTC(2026, 10, 10 - i * 4)).toISOString(), image: { url: IMGS[i % IMGS.length], alt: '' }, chars: mins * 220 * 6,
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
