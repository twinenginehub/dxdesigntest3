// The six content types in the resource hub. `icon` is a Tabler icon name (see icons.js). `id` is stored in Sanity; `slug` is used in /blog?type=<slug>.
export const TYPES = [
  { id: 'article', slug: 'articles', label: 'Articles', singular: 'Article', cta: 'Read article',
    icon: 'article' },
  { id: 'case-study', slug: 'case-studies', label: 'Case Studies', singular: 'Case study', cta: 'Read case study',
    icon: 'briefcase' },
  { id: 'learning', slug: 'learning', label: 'Learning', singular: 'Learning', cta: 'Start learning',
    icon: 'school' },
  { id: 'podcast', slug: 'podcast', label: 'Podcast', singular: 'Podcast', cta: 'Listen now',
    icon: 'microphone' },
  { id: 'press', slug: 'press', label: 'Press', singular: 'Press', cta: 'Read release',
    icon: 'building-broadcast-tower' },
  { id: 'whitepaper', slug: 'whitepapers', label: 'Whitepapers', singular: 'Whitepaper', cta: 'Download',
    icon: 'file-download' },
];
export const typeById = (id) => TYPES.find((t) => t.id === id) || TYPES[0];
export const typeBySlug = (slug) => TYPES.find((t) => t.slug === slug) || null;
