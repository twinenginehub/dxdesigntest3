// The editorial sections that share the post template. `docType` is the Sanity document type, `base` the public URL prefix.
export const SECTIONS = {
  blog: { id: 'blog', docType: 'post', base: '/blog', label: 'Blog' },
  franchise: { id: 'franchise', docType: 'franchisePost', base: '/franchise-blog', label: 'Franchise Blog' },
};
export const sectionById = (id) => SECTIONS[id] || SECTIONS.blog;
