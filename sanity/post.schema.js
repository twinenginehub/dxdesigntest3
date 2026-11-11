// Sanity Studio schema for blog posts. Copy into the Studio project's schemaTypes folder and add `post`, `author` and `callout` to its schema list.
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
    defineField({ name: 'body', type: 'array', of: [
      defineArrayMember({ type: 'block',
        styles: [{ title: 'Paragraph', value: 'normal' }, { title: 'Heading 2', value: 'h2' }, { title: 'Heading 3', value: 'h3' }, { title: 'Heading 4', value: 'h4' }, { title: 'Quote', value: 'blockquote' }],
        lists: [{ title: 'Bullets', value: 'bullet' }, { title: 'Numbered', value: 'number' }] }),
      defineArrayMember({ type: 'image', options: { hotspot: true }, fields: [
        defineField({ name: 'alt', type: 'string', title: 'Alt text', validation: (r) => r.required() }),
        defineField({ name: 'caption', type: 'string' }),
      ] }),
      defineArrayMember({ type: 'callout' }),
    ] }),
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
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string', description: 'Optional. Defaults to the post title.' }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 2, validation: (r) => r.max(170) }),
  ],
  orderings: [{ title: 'Newest first', name: 'dateDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'category', media: 'mainImage' } },
});
