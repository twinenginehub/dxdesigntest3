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

// Resource hub (gated downloads at /resources). `id` is stored in Sanity (leadMagnet.assetType); `slug` is the URL filter value.
export const RESOURCE_TYPES = [
  { id: 'Checklist', slug: 'checklist', plural: 'Checklists', cta: 'Get the checklist', icon: 'list-check' },
  { id: 'Course', slug: 'course', plural: 'Courses', cta: 'Start the course', icon: 'school' },
  { id: 'Guide', slug: 'guide', plural: 'Guides', cta: 'Get the guide', icon: 'book' },
  { id: 'Report', slug: 'report', plural: 'Reports', cta: 'Get the report', icon: 'file-description' },
  { id: 'Template', slug: 'template', plural: 'Templates', cta: 'Get the template', icon: 'template' },
  { id: 'Tool', slug: 'tool', plural: 'Tools', cta: 'Get the tool', icon: 'device-desktop' },
  { id: 'Webinar', slug: 'webinar', plural: 'Webinars', cta: 'Watch the webinar', icon: 'video' },
];
export const resourceTypeById = (id) => RESOURCE_TYPES.find((t) => t.id === id) || RESOURCE_TYPES[2];
