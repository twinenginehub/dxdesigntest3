#!/usr/bin/env python3
"""Design-system audit of the blog templates. Run: python3 scripts/audit-blog-design.py
Checks every blog stylesheet and the inline styles in lib/blog/*.js against the DOXA design system tokens and rules."""
import re, glob, collections, sys

TOKEN_HEX = {  # hex values that exist as tokens (lowercase, normalised to 6 digits)
    '052538': '--navy', '00aeef': '--cyan', '05af72': '--green', 'ffffff': '--white', 'd41a69': '--magenta', 'f1af21': '--gold',
    '0d3a52': '--navy-10', '164c6c': '--navy-20', '0090c8': '--cyan-dark', '007099': '--cyan-700', 'e6f7fe': '--cyan-50', 'cceffd': '--cyan-100',
    '048f5d': '--green-dark', 'e7edf1': '--fog-100', 'cdd9e0': '--fog-200', '6b8494': '--slate-400', '3d5566': '--slate-600', 'f0f6f9': '--navy-50',
    'dfe9ef': '--navy-100', 'c8d7df': '--navy-200', '8ea5b4': '--navy-300', '5f7684': '--navy-400', '435663': '--navy-500', '1d3543': '--navy-700',
    '007956': '--emerald-700', 'f7fafc': '--paper-soft',
}
RADII_OK = re.compile(r'^(0|none|inherit|50%|var\(--radius-(sm|md|lg|circle)[^)]*\)( var\(--radius-(sm|md|lg)\))*( 0)*|2px|5px|8px)$')
files = sorted(glob.glob('blog-assets/*.css')) + sorted(glob.glob('lib/blog/*.js'))
files = [f for f in files if not f.endswith('chrome.js') and not f.endswith('sample.js')]
issues = collections.defaultdict(list)

def add(kind, f, line, text):
    issues[kind].append((f, line, text.strip()[:110]))

for f in files:
    src = open(f).read()
    for n, line in enumerate(src.split('\n'), 1):
        # hex colours not wrapped in a token fallback var(--x, #hex) and not a known token value
        for m in re.finditer(r'(?<![a-z0-9-])#([0-9a-fA-F]{3,6})\b', line):
            fallback = re.search(r'var\(--[a-z0-9-]+,\s*$', line[:m.start()]) is not None  # #hex used as the fallback inside var(--token, #hex)
            h = m.group(1).lower()
            if len(h) == 3: h = ''.join(c * 2 for c in h)
            if len(h) != 6 or 'url(' in line[max(0, m.start() - 12):m.start()] or '&#' in line[max(0, m.start() - 2):m.start()]: continue
            if f.endswith('.js') and not re.search(r'style=|<style|stroke=|fill=', line): continue
            if h not in TOKEN_HEX: add('Colour outside the token set', f, n, line)
            elif f.endswith('.css') and not fallback:
                add('Literal hex where a token exists', f, n, f'#{h} -> var({TOKEN_HEX[h]})  |  ' + line)
        for m in re.finditer(r'border-radius:\s*([^;}]+)', line):
            v = m.group(1).strip().replace('!important', '').strip()
            v = re.sub(r'var\((--radius-[a-z]+),\s*[^)]*\)', r'var(\1)', v)
            if not RADII_OK.match(v): add('Radius off the 2/5/8 scale (or pill)', f, n, line)
        for m in re.finditer(r'box-shadow:\s*([^;}]+)', line):
            v = m.group(1)
            if 'var(--shadow' not in v and 'none' not in v and 'inset 0 0 0' not in v: add('Shadow not from the token set', f, n, line)
        for m in re.finditer(r'font-weight:\s*(\d+)', line):
            if m.group(1) not in ('400', '500', '600', '700'): add('Font weight outside 400-700', f, n, line)
        for m in re.finditer(r'transition:\s*([^;}]+)', line):
            if re.search(r'\d(\.\d+)?m?s', m.group(1)) and 'var(--duration' not in m.group(1) and 'visibility 0s' not in m.group(1): add('Transition not using duration tokens', f, n, line)
            if 'box-shadow' in m.group(1): add('Animates box-shadow (system animates colour/background and position/size only)', f, n, line)
        if re.search(r'linear-gradient\(', line) and 'var(--brand-gradient' not in line and 'data:image' not in line and 'color-mix' not in line:
            add('Gradient not using --brand-gradient', f, n, line)
        if re.search(r'rgba\(5,\s*37,\s*56', re.sub(r'var\(--shadow[^)]*\)', '', line)) and f.endswith('.css'): add('rgba navy literal (use a token or colour-mix)', f, n, line)
        if re.search(r'letter-spacing:\s*\.12em', line): add('Eyebrow tracking literal (use --tracking-eyebrow)', f, n, line)
        if re.search(r'text-transform:\s*uppercase', line) and not re.search(r'eyebrow|__label|-label|__title|caption|--text-caption|--text-eyebrow|font-size:\s*(var\(--text-(caption|eyebrow)|\.7|\.8)', line):
            add('Uppercase outside an eyebrow/tag/label context (check)', f, n, line)
        if re.search(r'border-radius:\s*(999|99|50%)', line) and 'avatar' not in line and '::before' not in line and 'logo' not in line:
            add('Circle/pill shape (circles are for avatars, icon buttons, knobs only)', f, n, line)

order = ['Colour outside the token set', 'Literal hex where a token exists', 'Radius off the 2/5/8 scale (or pill)', 'Shadow not from the token set', 'Font weight outside 400-700',
         'Transition not using duration tokens', 'Animates box-shadow (system animates colour/background and position/size only)', 'Gradient not using --brand-gradient',
         'rgba navy literal (use a token or colour-mix)', 'Eyebrow tracking literal (use --tracking-eyebrow)', 'Uppercase outside an eyebrow/tag/label context (check)',
         'Circle/pill shape (circles are for avatars, icon buttons, knobs only)']
total = 0
for k in order:
    items = issues.get(k, [])
    total += len(items)
    print(f'\n## {k}: {len(items)}')
    for f, n, t in items[:40]: print(f'  {f}:{n}  {t}')
    if len(items) > 40: print(f'  ... {len(items) - 40} more')
print(f'\nTOTAL findings: {total}')
sys.exit(0)
