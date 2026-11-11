// Sanity Studio schema for the blog, franchise blog and gated downloads. Copy into the Studio project's schemaTypes folder and register every exported type (see the last line).
// Field names match what lib/blog/sanity.js queries; rename one and the other must change too.
import { defineType, defineField, defineArrayMember } from 'sanity';

export const author = defineType({
  name: 'author', title: 'Author', type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'role', type: 'string', description: 'Shown under the name, e.g. "Head of Recruiting".' }),
    defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
  ],
});

export const callout = defineType({
  name: 'callout', title: 'Callout', type: 'object',
  fields: [defineField({ name: 'title', type: 'string' }), defineField({ name: 'text', type: 'text', rows: 3, validation: (r) => r.required() })],
  preview: { select: { title: 'title', subtitle: 'text' } },
});


// ---- data blocks for long-form posts (whitepapers, reports). Rendered as charts, number grids and tables on the site. ----
export const chart = defineType({
  name: 'chart', title: 'Chart', type: 'object',
  description: 'A simple chart drawn from the numbers below.',
  fields: [
    defineField({ name: 'title', type: 'string', description: 'e.g. "Figure 1. Where the budget goes"' }),
    defineField({ name: 'chartType', title: 'Chart type', type: 'string', initialValue: 'bar', validation: (r) => r.required(),
      options: { layout: 'radio', list: [{ title: 'Horizontal bars', value: 'bar' }, { title: 'Columns', value: 'column' }, { title: 'Line (trend over time)', value: 'line' }, { title: 'Donut (parts of a whole)', value: 'donut' }] } }),
    defineField({ name: 'data', title: 'Data points', type: 'array', validation: (r) => r.required().min(1).max(24), of: [defineArrayMember({
      type: 'object', fields: [
        defineField({ name: 'label', type: 'string', validation: (r) => r.required() }),
        defineField({ name: 'value', type: 'number', validation: (r) => r.required().min(0) }),
      ], preview: { select: { title: 'label', subtitle: 'value' } } })] }),
    defineField({ name: 'prefix', type: 'string', description: 'Shown before every number, e.g. $', validation: (r) => r.max(4) }),
    defineField({ name: 'unit', type: 'string', description: 'Shown after every number, e.g. % or " days" (include the space).', validation: (r) => r.max(8) }),
    defineField({ name: 'startAtZero', title: 'Start line chart at zero', type: 'boolean', initialValue: true, description: 'Line charts only. Turn off to zoom in on small changes (the axis then starts near your lowest value).' }),
    defineField({ name: 'caption', type: 'string' }),
    defineField({ name: 'source', type: 'string', description: 'e.g. "DOXA customer survey, 2026, n = 500"' }),
  ],
  preview: { select: { title: 'title', subtitle: 'chartType' } },
});

export const statGrid = defineType({
  name: 'statGrid', title: 'Key numbers', type: 'object',
  fields: [defineField({ name: 'items', type: 'array', validation: (r) => r.required().min(1).max(6), of: [defineArrayMember({
    type: 'object', fields: [
      defineField({ name: 'value', type: 'string', description: 'The big number, e.g. 42%, 3.4x, $48K', validation: (r) => r.required().max(14) }),
      defineField({ name: 'label', type: 'string', validation: (r) => r.required().max(120) }),
      defineField({ name: 'note', type: 'string', description: 'Optional small print.' }),
    ], preview: { select: { title: 'value', subtitle: 'label' } } })] })],
  preview: { prepare: () => ({ title: 'Key numbers' }) },
});

export const dataTable = defineType({
  name: 'dataTable', title: 'Table', type: 'object',
  fields: [
    defineField({ name: 'caption', type: 'string' }),
    defineField({ name: 'rows', type: 'array', description: 'The first row is the header row.', validation: (r) => r.required().min(2), of: [defineArrayMember({
      type: 'object', fields: [defineField({ name: 'cells', type: 'array', of: [{ type: 'string' }], validation: (r) => r.required().min(1).max(12) })],
      preview: { select: { cells: 'cells' }, prepare: ({ cells }) => ({ title: (cells || []).join('  |  ') }) } })] }),
    defineField({ name: 'source', type: 'string' }),
  ],
  preview: { select: { title: 'caption' }, prepare: ({ title }) => ({ title: title || 'Table' }) },
});

const bodyField = defineField({ name: 'body', type: 'array', of: [
  defineArrayMember({ type: 'block',
    styles: [{ title: 'Paragraph', value: 'normal' }, { title: 'Heading 2', value: 'h2' }, { title: 'Heading 3', value: 'h3' }, { title: 'Heading 4', value: 'h4' }, { title: 'Quote', value: 'blockquote' }],
    lists: [{ title: 'Bullets', value: 'bullet' }, { title: 'Numbered', value: 'number' }] }),
  defineArrayMember({ type: 'image', options: { hotspot: true }, fields: [
    defineField({ name: 'alt', type: 'string', title: 'Alt text', validation: (r) => r.required() }),
    defineField({ name: 'caption', type: 'string' }),
  ] }),
  defineArrayMember({ type: 'callout' }),
  defineArrayMember({ type: 'chart' }),
  defineArrayMember({ type: 'statGrid' }),
  defineArrayMember({ type: 'dataTable' }),
] });

export const post = defineType({
  name: 'post', title: 'Post', type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required().max(120) }),
    defineField({ name: 'contentType', title: 'Content type', type: 'string', initialValue: 'article', validation: (r) => r.required(),
      options: { list: [{ title: 'Article', value: 'article' }, { title: 'Case study', value: 'case-study' }, { title: 'Learning', value: 'learning' }, { title: 'Podcast', value: 'podcast' }, { title: 'Press', value: 'press' }, { title: 'Whitepaper', value: 'whitepaper' }], layout: 'radio' } }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false, description: 'Shows in "Featured and trending" at the top of the blog page (the three most recent featured posts).' }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title', maxLength: 80 }, validation: (r) => r.required(), description: 'The URL: /blog/<slug>' }),
    defineField({ name: 'publishedAt', title: 'Publish date', type: 'datetime', description: 'A post goes live on this date. Leave empty to keep it unpublished.' }),
    defineField({ name: 'category', type: 'string' }),
    defineField({ name: 'tags', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' }, description: 'Shown at the bottom of the post.' }),
    defineField({ name: 'author', type: 'reference', to: [{ type: 'author' }] }),
    defineField({ name: 'excerpt', type: 'text', rows: 3, validation: (r) => r.max(220), description: 'Shown under the title and used as the search description if none is set.' }),
    defineField({ name: 'mainImage', title: 'Featured image', type: 'image', options: { hotspot: true }, fields: [
      defineField({ name: 'alt', type: 'string', title: 'Alt text', validation: (r) => r.required() }),
      defineField({ name: 'caption', type: 'string' }),
    ] }),
    bodyField,
    defineField({
      name: 'podcast', title: 'Podcast episode', type: 'object',
      description: 'Only for the Podcast content type. The body above becomes the show notes.',
      hidden: ({ document }) => document?.contentType !== 'podcast',
      options: { collapsible: false },
      fields: [
        defineField({ name: 'episodeNumber', title: 'Episode number', type: 'number', validation: (r) => r.integer().min(0) }),
        defineField({ name: 'season', type: 'number', validation: (r) => r.integer().min(0) }),
        defineField({ name: 'duration', type: 'string', description: 'Length as m:ss or h:mm:ss, e.g. 42:10.', validation: (r) => r.regex(/^(\d{1,2}:)?\d{1,2}:\d{2}$/, { name: 'time' }).error('Use m:ss or h:mm:ss, e.g. 42:10') }),
        defineField({ name: 'audioUrl', title: 'Audio file URL', type: 'url', description: 'Direct https link to the episode MP3 from your podcast host. Shows a built-in player and lets chapters jump to a time.', validation: (r) => r.uri({ scheme: ['https'] }) }),
        defineField({ name: 'embedUrl', title: 'Player embed URL (optional)', type: 'url', description: 'Used when there is no audio file URL. Spotify, Apple Podcasts, YouTube, Vimeo, Simplecast, Buzzsprout, Transistor, SoundCloud, Captivate or Megaphone embed links only.', validation: (r) => r.uri({ scheme: ['https'] }) }),
        defineField({ name: 'platforms', title: 'Listen on', type: 'array', of: [defineArrayMember({
          type: 'object', fields: [
            defineField({ name: 'name', type: 'string', description: 'e.g. Spotify, Apple Podcasts, YouTube', validation: (r) => r.required() }),
            defineField({ name: 'url', type: 'url', validation: (r) => r.required().uri({ scheme: ['https'] }) }),
          ], preview: { select: { title: 'name', subtitle: 'url' } } })] }),
        defineField({ name: 'guests', type: 'array', of: [defineArrayMember({
          type: 'object', fields: [
            defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'role', type: 'string' }),
            defineField({ name: 'company', type: 'string' }),
            defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
            defineField({ name: 'linkedin', title: 'LinkedIn URL', type: 'url', validation: (r) => r.uri({ scheme: ['https'] }) }),
          ], preview: { select: { title: 'name', subtitle: 'role', media: 'image' } } })] }),
        defineField({ name: 'chapters', type: 'array', description: 'Timestamps shown as a list. With an audio file URL, clicking a time jumps the player there.', of: [defineArrayMember({
          type: 'object', fields: [
            defineField({ name: 'time', type: 'string', description: 'm:ss or h:mm:ss', validation: (r) => r.required().regex(/^(\d{1,2}:)?\d{1,2}:\d{2}$/, { name: 'time' }) }),
            defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
          ], preview: { select: { title: 'title', subtitle: 'time' } } })] }),
        defineField({ name: 'transcript', type: 'array', description: 'Optional. Plain paragraphs; shown in a collapsed section (good for search engines and accessibility).', of: [defineArrayMember({ type: 'block', styles: [{ title: 'Paragraph', value: 'normal' }], lists: [], marks: { decorators: [{ title: 'Bold', value: 'strong' }, { title: 'Italic', value: 'em' }], annotations: [] } })] }),
      ],
    }),
    defineField({
      name: 'whitepaper', title: 'Whitepaper details', type: 'object',
      description: 'Only for the Whitepaper content type. Use Chart, Key numbers and Table blocks in the body for data.',
      hidden: ({ document }) => document?.contentType !== 'whitepaper',
      options: { collapsible: false },
      fields: [
        defineField({ name: 'executiveSummary', title: 'Executive summary', type: 'text', rows: 6, description: 'Shown next to the cover at the top. Separate paragraphs with a blank line.' }),
        defineField({ name: 'pages', title: 'Number of pages', type: 'number', validation: (r) => r.integer().min(1) }),
        defineField({ name: 'file', title: 'PDF file', type: 'file', options: { accept: 'application/pdf' }, description: 'Upload the PDF here, or paste a link below.' }),
        defineField({ name: 'fileUrl', title: 'PDF link (if not uploading)', type: 'url', validation: (r) => r.uri({ scheme: ['https'] }) }),
        defineField({ name: 'gate', title: 'Gated download page (optional)', type: 'reference', to: [{ type: 'leadMagnet' }], description: 'If set, the button sends readers to that form page instead of downloading directly.' }),
        defineField({ name: 'keyStats', title: 'Key numbers', type: 'array', validation: (r) => r.max(4), description: 'Up to four headline numbers shown in a band under the summary.', of: [defineArrayMember({
          type: 'object', fields: [
            defineField({ name: 'value', type: 'string', description: 'e.g. 62%', validation: (r) => r.required().max(14) }),
            defineField({ name: 'label', type: 'string', validation: (r) => r.required().max(120) }),
            defineField({ name: 'note', type: 'string' }),
          ], preview: { select: { title: 'value', subtitle: 'label' } } })] }),
      ],
    }),
    defineField({
      name: 'press', title: 'Press release details', type: 'object',
      description: 'Only for the Press content type. The excerpt becomes the sub-headline and the body is the release text.',
      hidden: ({ document }) => document?.contentType !== 'press',
      options: { collapsible: false },
      fields: [
        defineField({ name: 'location', title: 'Dateline city', type: 'string', description: 'e.g. Austin, TX. Appears before the first paragraph.' }),
        defineField({ name: 'contacts', title: 'Media contacts', type: 'array', of: [defineArrayMember({
          type: 'object', fields: [
            defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'title', type: 'string' }),
            defineField({ name: 'email', type: 'string', validation: (r) => r.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { name: 'email' }) }),
            defineField({ name: 'phone', type: 'string' }),
          ], preview: { select: { title: 'name', subtitle: 'email' } } })] }),
        defineField({ name: 'assets', title: 'Downloads', type: 'array', description: 'Press kit, logos, photos.', of: [defineArrayMember({
          type: 'object', fields: [
            defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'file', type: 'file', validation: (r) => r.required() }),
          ], preview: { select: { title: 'title' } } })] }),
        defineField({ name: 'boilerplate', title: 'About DOXA Talent (boilerplate)', type: 'text', rows: 4, description: 'Leave empty to use the standard company description.' }),
      ],
    }),
    defineField({
      name: 'caseStudy', title: 'Case study details', type: 'object',
      description: 'Only for the Case study content type. These power the search filters and the cards on /case-studies.',
      hidden: ({ document }) => document?.contentType !== 'case-study',
      options: { collapsible: false },
      fields: [
        defineField({ name: 'clientName', title: 'Client name', type: 'string', description: 'Use a generic description if the client is anonymous, e.g. "A mid-size accounting firm".' }),
        defineField({ name: 'logo', title: 'Client logo', type: 'image', description: 'Optional. A white or transparent logo works best on the card.', fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })] }),
        defineField({ name: 'industry', type: 'string', description: 'e.g. Accounting, Healthcare, Legal. Becomes a filter option, so spell it the same way every time.' }),
        defineField({ name: 'companySize', title: 'Company size', type: 'string', options: { list: ['1–10 employees', '11–50 employees', '51–200 employees', '201–500 employees', '501–1,000 employees', '1,000+ employees'] } }),
        defineField({ name: 'region', type: 'string', options: { list: ['North America', 'Europe', 'Latin America', 'Asia Pacific', 'Middle East & Africa'] } }),
        defineField({ name: 'useCase', title: 'Use case', type: 'string', description: 'e.g. Bookkeeping, Customer support, Payroll. Becomes a filter option.' }),
        defineField({ name: 'keyResultValue', title: 'Key result (number)', type: 'string', description: 'The headline figure shown on the card, e.g. 62% or 3x.', validation: (r) => r.max(14) }),
        defineField({ name: 'keyResultLabel', title: 'Key result (label)', type: 'string', description: 'e.g. lower cost per hire', validation: (r) => r.max(80) }),
      ],
    }),
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string', description: 'Optional. Defaults to the post title.' }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 2, validation: (r) => r.max(170) }),
  ],
  orderings: [{ title: 'Newest first', name: 'dateDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'category', media: 'mainImage' } },
});

// ---- Franchise blog: same fields as a post, with an audience instead of a content type. Lives at /franchise-blog/<slug>. ----
const FRANCHISE_KEEP = ['title', 'featured', 'slug', 'publishedAt', 'category', 'tags', 'author', 'excerpt', 'mainImage', 'body', 'seoTitle', 'seoDescription'];
export const franchisePost = defineType({
  name: 'franchisePost', title: 'Franchise post', type: 'document',
  fields: [
    ...post.fields.filter((f) => FRANCHISE_KEEP.includes(f.name)).map((f) => (f.name === 'slug'
      ? defineField({ ...f, description: 'The URL: /franchise-blog/<slug>' })
      : f.name === 'featured' ? defineField({ ...f, description: 'Shows in "Featured" at the top of the franchise blog (the three most recent featured posts).' }) : f)),
    defineField({ name: 'audience', type: 'string', validation: (r) => r.required(), options: { layout: 'radio', list: [{ title: 'Franchisors', value: 'Franchisors' }, { title: 'Franchisees', value: 'Franchisees' }] } }),
  ],
  orderings: post.orderings,
  preview: { select: { title: 'title', subtitle: 'audience', media: 'mainImage' } },
});

// ---- Gated download / lead-magnet landing page. Lives at /resources/<slug>. ----
export const leadMagnet = defineType({
  name: 'leadMagnet', title: 'Gated download', type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', description: 'Internal name.', validation: (r) => r.required().max(120) }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title', maxLength: 80 }, validation: (r) => r.required(), description: 'The URL: /resources/<slug>' }),
    defineField({ name: 'publishedAt', title: 'Publish date', type: 'datetime', description: 'The page goes live on this date. Leave empty to keep it unpublished.' }),
    defineField({ name: 'assetType', title: 'Type of download', type: 'string', initialValue: 'Guide', options: { list: ['Guide', 'Whitepaper', 'Report', 'Checklist', 'Template', 'Ebook', 'Playbook'] } }),
    defineField({ name: 'headline', type: 'string', description: 'Big heading on the page.', validation: (r) => r.required().max(120) }),
    defineField({ name: 'subheadline', type: 'text', rows: 3, validation: (r) => r.max(300) }),
    defineField({ name: 'bullets', title: 'What you\'ll learn', type: 'array', of: [{ type: 'string' }], validation: (r) => r.max(8), description: 'Three to five short benefits.' }),
    defineField({ name: 'pages', title: 'Number of pages', type: 'number', validation: (r) => r.integer().min(1) }),
    defineField({ name: 'cover', title: 'Cover image', type: 'image', options: { hotspot: true }, fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text', validation: (r) => r.required() })] }),
    defineField({ name: 'file', title: 'File to download', type: 'file', description: 'Upload the file here, or paste a link below. Note: the download link is delivered to the browser after the form is filled in, so treat the file as "low friction", not secret.' }),
    defineField({ name: 'fileUrl', title: 'File link (if not uploading)', type: 'url', validation: (r) => r.uri({ scheme: ['https'] }) }),
    defineField({ name: 'buttonLabel', title: 'Form button label', type: 'string', initialValue: 'Get the guide', validation: (r) => r.max(40) }),
    defineField({ name: 'thankYouTitle', title: 'Thank-you heading', type: 'string' }),
    defineField({ name: 'thankYouText', title: 'Thank-you text', type: 'text', rows: 2 }),
    defineField({ name: 'about', title: 'More about this download (optional)', type: 'array', of: [
      defineArrayMember({ type: 'block', styles: [{ title: 'Paragraph', value: 'normal' }, { title: 'Heading 2', value: 'h2' }, { title: 'Heading 3', value: 'h3' }], lists: [{ title: 'Bullets', value: 'bullet' }, { title: 'Numbered', value: 'number' }] }),
    ] }),
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string' }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 2, validation: (r) => r.max(170) }),
  ],
  preview: { select: { title: 'title', subtitle: 'assetType', media: 'cover' } },
});

// Register everything in the Studio: schemaTypes = [post, franchisePost, leadMagnet, author, callout, chart, statGrid, dataTable]
