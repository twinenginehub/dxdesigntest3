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
    defineField({ name: 'slug', type: 'slug', options: { source: 'title', maxLength: 80 }, validation: (r) => r.required(), description: 'The URL: /blog/<slug>' }),
    defineField({ name: 'publishedAt', title: 'Publish date', type: 'datetime', description: 'A post goes live on this date. Leave empty to keep it unpublished.' }),
    defineField({ name: 'category', type: 'string' }),
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
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string', description: 'Optional. Defaults to the post title.' }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 2, validation: (r) => r.max(170) }),
  ],
  orderings: [{ title: 'Newest first', name: 'dateDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'category', media: 'mainImage' } },
});
