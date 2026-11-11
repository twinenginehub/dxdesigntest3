# Blog templates: design-system audit

Audited against `DOXA Design System v1` (DESIGN.md rules, tokens, type scale, motion principles, Input/Select/Tag/Card/Stat specs).
Re-run any time: `python3 scripts/audit-blog-design.py` (mechanical checks, expected result: 0 findings).

## Fixed
| Area | What was wrong | Now |
|---|---|---|
| Pills | Search box, tab counts, topic chips, post tags, "Listen on" links were pill-shaped | 5px radius (`--radius-md`); chips use the Tag style, post tags the cyan tag (`ds-tag ds-tag-cyan`) |
| Off-scale radii | 3, 4, 6 and 12px corners | 2/5/8 scale only |
| Invented colours | Error reds on the gated form, an extra light blue and navy-to-teal gradient in charts and covers, `#000` in print | Tokens only: error = `--state-error` (magenta), chart series use cyan-700, navy, green, cyan, slate, navy-300 |
| Literal hex | 83 hard-coded hex values | `var(--token)` everywhere |
| Shadows | Custom shadows | `--shadow-sm/md/lg/focus` |
| Weights | 800 on stat numbers; 700 on h2/h3 | 700 max; h2-h4 are 600 per the type scale; h1 stays 700 |
| h4 | Uppercase with tracking | Sentence case (uppercase is for eyebrows only) |
| Eyebrows | 700 weight, literal tracking | 600 weight, `--tracking-eyebrow` |
| Motion | Literal 150/180/350ms, animated box-shadow, image zoom on hover | Duration/ease tokens, colour and position only, no zoom; hover lift is disabled under reduced motion |
| Gradients | Hand-written cyan-to-green values | `--brand-gradient` |
| Contrast | White text on the cyan-to-green gradient (client names, avatars, placeholders) | Navy text on the gradient |
| Form fields | Border colour from a token that does not exist (`--fog-300`) | `--border-subtle`, 1.5px, `--shadow-focus`; select text 16px |
| Circles | Decorative dots and the check bullet were circles | Circles stay for avatars only |
| Spacing | 6/10/14/18/22/50px literals | Spacing scale (kept DS Input padding) |
| Links | Skip links lost their text on hover (global `a:hover`) | Guarded |

## Open items (need a decision)
1. **Sentence case.** The rule is sentence case except eyebrows. New page titles and tabs use title case ("Case Studies", "Franchise Blog", "Whitepapers"); the site's own CTA "Build Your Team" does too. Suggest "Case studies", "Franchise blog", etc.
2. **Primary button contrast (site-wide).** `.ds-btn-accent` on the live site is white text on the cyan-to-green gradient (about 2.4:1). The design system's accent button is cyan with navy text. The blog CTAs inherit the site's version.
3. **Icons.** The blog icons are custom-drawn outlines. The design system's icon folder is the filled Tabler set and lacks speakerphone and store icons. Switching changes the look from outline to filled.
4. **Type sizes between scale steps.** A few UI texts use 13px and 15px. `ds/header.css` also shrinks the body tokens by 2px site-wide against the spec.
5. **Placeholder text** uses `--slate-400` (about 3.6:1 on white), below 4.5:1. It is the design system's own muted token.
6. **Gradient use.** The brand gradient appears on header underlines and placeholder tiles. The design system says gradients are confined to the logo mark; the live site already uses it on its nav, so the blog matches the site.
7. **Copy.** Placeholder copy sometimes says "offshore staffing"; the brand vocabulary is "VIPs" and "professionals".
