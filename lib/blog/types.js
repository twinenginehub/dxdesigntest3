// The six content types in the resource hub. `id` is stored in Sanity; `slug` is used in /blog?type=<slug>.
export const TYPES = [
  { id: 'article', slug: 'articles', label: 'Articles', singular: 'Article', cta: 'Read article',
    icon: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>' },
  { id: 'case-study', slug: 'case-studies', label: 'Case Studies', singular: 'Case study', cta: 'Read case study',
    icon: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>' },
  { id: 'learning', slug: 'learning', label: 'Learning', singular: 'Learning', cta: 'Start learning',
    icon: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/>' },
  { id: 'podcast', slug: 'podcast', label: 'Podcast', singular: 'Podcast', cta: 'Listen now',
    icon: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/>' },
  { id: 'press', slug: 'press', label: 'Press', singular: 'Press', cta: 'Read release',
    icon: '<path d="M3 11v3l12 5V6z"/><path d="M15 9a3 3 0 0 1 0 6M6 14.5V19"/>' },
  { id: 'whitepaper', slug: 'whitepapers', label: 'Whitepapers', singular: 'Whitepaper', cta: 'Download',
    icon: '<path d="M6 3h9l4 4v14H6z"/><path d="M12 11v6M9.5 14.5L12 17l2.5-2.5"/>' },
];
export const typeById = (id) => TYPES.find((t) => t.id === id) || TYPES[0];
export const typeBySlug = (slug) => TYPES.find((t) => t.slug === slug) || null;
