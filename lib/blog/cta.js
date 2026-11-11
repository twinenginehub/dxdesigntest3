// End-of-page call to action, modelled on the site's "cta-final" block (centred headline with a gradient second line,
// one supporting paragraph, a secondary and an accent button). Used at the end of every post template.
import { esc } from './portable.js';

const CHEVRON = '<svg viewBox="0 0 25.22 37.46" width="7" height="10" fill="currentColor" aria-hidden="true"><path d="M12.42,0s-.09,0-.14,0H.87c3.92,6.27,7.96,12.01,11.76,17.94C8.5,24.29,4.42,30.57.26,36.98c-.05.08-.21.35-.26.43,0,0,.86.02,1.11.02,1.23,0,2.45,0,3.68,0,2.31,0,4.61,0,6.92.03h.08c.95-.01,1.41-.51,1.86-1.24,1.66-2.68,5.8-9.05,6.51-10.12l5.06-8.29-5.06-7.71c-.39-.54-.63-.85-.84-1.19-1.62-2.57-3.26-5.13-4.84-7.72-.49-.81-1.08-1.2-2-1.21h-.05Z"></path></svg>';

export const CTA_CSS = '/blog-assets/cta.css';

export function ctaFinal({
  heading = 'Build your team',
  accent = 'without expanding your overhead.',
  text = 'Move recurring work to a dedicated global team and give your senior professionals room to focus on what grows the business.',
} = {}) {
  return `<section class="cta-section" aria-labelledby="cta-final-h"><div class="cta-wrap"><div class="cta-final">
    <h2 id="cta-final-h">${esc(heading)} <span>${esc(accent)}</span></h2>
    <p>${esc(text)}</p>
    <div class="cta-final__actions">
      <a class="ds-btn ds-btn-secondary btn-md" href="/index.html#roles"><span>Explore talent</span></a>
      <a class="ds-btn ds-btn-accent btn-md" href="/index.html#build-your-team"><span>Build your team</span> ${CHEVRON}</a>
    </div></div></div></section>`;
}
