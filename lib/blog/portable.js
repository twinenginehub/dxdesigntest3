// Converts Sanity Portable Text blocks to safe HTML. Every string is escaped; only http(s), mailto, tel and root-relative links are kept.
export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
export const slugify = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'section';
const safeUrl = (u) => (/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(String(u || '').trim()) ? String(u).trim() : null);
const safeImg = (u) => (/^https:\/\/cdn\.sanity\.io\//.test(String(u || '')) || /^\/(?!\/)/.test(String(u || '')) ? u : null);

function spans(block) {
  const defs = Object.fromEntries((block.markDefs || []).map((d) => [d._key, d]));
  return (block.children || []).map((c) => {
    if (c._type !== 'span') return '';
    let h = esc(c.text).replace(/\n/g, '<br>');
    for (const m of c.marks || []) {
      if (m === 'strong') h = `<strong>${h}</strong>`;
      else if (m === 'em') h = `<em>${h}</em>`;
      else if (m === 'underline') h = `<u>${h}</u>`;
      else if (m === 'code') h = `<code>${h}</code>`;
      else if (defs[m] && defs[m]._type === 'link') {
        const href = safeUrl(defs[m].href);
        if (href) h = `<a href="${esc(href)}"${/^https?:/i.test(href) ? ' rel="noopener noreferrer" target="_blank"' : ''}>${h}</a>`;
      }
    }
    return h;
  }).join('');
}
const plain = (block) => (block.children || []).map((c) => c.text || '').join('');

// Returns { html, headings: [{ id, text, level }], words }
export function toHtml(blocks = []) {
  const out = [], headings = [], used = new Set();
  let words = 0, list = null; // list = { tag, level }[] stack
  const closeLists = (to = 0) => { while (list && list.length > to) out.push(`</li></${list.pop().tag}>`); if (list && !list.length) list = null; };

  for (const b of blocks) {
    if (b._type === 'block' && b.listItem) {
      const tag = b.listItem === 'number' ? 'ol' : 'ul', level = Math.min(b.level || 1, 3);
      list = list || [];
      if (list.length < level) { while (list.length < level) { out.push(`<${tag}>`); list.push({ tag }); } out.push('<li>'); }
      else { closeLists(level); out.push('</li><li>'); }
      out.push(spans(b)); words += plain(b).split(/\s+/).filter(Boolean).length;
      continue;
    }
    closeLists();
    if (b._type === 'block') {
      const style = b.style || 'normal', inner = spans(b), text = plain(b);
      words += text.split(/\s+/).filter(Boolean).length;
      if (!text.trim()) continue;
      if (style === 'h2' || style === 'h3' || style === 'h4') {
        let id = slugify(text), n = 2; const base = id;
        while (used.has(id)) id = `${base}-${n++}`;
        used.add(id);
        if (style !== 'h4') headings.push({ id, text, level: Number(style[1]) });
        out.push(`<${style} id="${id}">${inner}</${style}>`);
      } else if (style === 'blockquote') out.push(`<blockquote><p>${inner}</p></blockquote>`);
      else out.push(`<p>${inner}</p>`);
    } else if (b._type === 'image') {
      const src = safeImg(b.url);
      if (src) out.push(`<figure><img src="${esc(src)}${/sanity/.test(src) ? '?w=1400&auto=format' : ''}" alt="${esc(b.alt || '')}" loading="lazy"${b.width ? ` width="${Number(b.width)}" height="${Number(b.height)}"` : ''}>${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ''}</figure>`);
    } else if (b._type === 'callout') {
      out.push(`<aside class="callout">${b.title ? `<strong>${esc(b.title)}</strong>` : ''}<p>${esc(b.text)}</p></aside>`);
    }
  }
  closeLists();
  return { html: out.join('\n'), headings, words };
}
