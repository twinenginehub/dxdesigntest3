"""Applies the shared site header to every page. Run from the repo root: python3 ds/build_header.py
Pages built from the DoxaDS runtime carry the header inside their <template> (re-rendered on load);
the original static pages have a plain <nav class="site-nav"> that is swapped in place."""
import re, glob, os
ROLES=[('Finance & Accounting','role-finance-accounting'),('Assistants','role-assistants'),('Customer Support & Sales','role-customer-support-sales'),('Marketing','role-marketing'),('IT & Technology','role-it-technology'),('Human Resources','role-hr'),('Legal','role-legal'),('Healthcare','role-healthcare'),('ISP / MSP','role-isp-msp')]
CHEV='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.707 8.293a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1 -1.414 0l-6 -6a1 1 0 0 1 1.414 -1.414l5.293 5.293l5.293 -5.293a1 1 0 0 1 1.414 0"></path></svg>'
SEARCH='<svg class="site-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path><path d="M21 21l-6 -6"></path></svg>'
BURGER='<svg class="icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"></path></svg><svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6l-12 12M6 6l12 12"></path></svg>'
def current_for(page):
    n=os.path.basename(page)
    if n=='index.html': return 'Home'
    if n=='about.html': return 'About'
    if n in ('industries.html','accounting-firms.html'): return 'Industries'
    return 'Talent'   # talent pages, country pages, role pages, accountant-cpa
def header(cur):
    def a(label,href,extra=''):
        c=' class="nav-current" aria-current="page"' if label==cur else ''
        return f'<a href="{href}"{c}>{label}{extra}</a>'
    drop=''.join(f'<a href="{h}.html">{l.replace("&","&amp;")}</a>' for l,h in ROLES)
    return ('<nav class="site-nav" aria-label="Main">'
      '<a class="site-nav__logo" href="index.html" aria-label="DOXA Talent home"><img src="doxa-logo-white.png" alt="DOXA"></a>'
      '<div class="site-nav__links" id="site-menu">'
      f'<div class="nav-item">{a("Home","index.html")}</div>'
      f'<div class="nav-item">{a("Industries","industries.html")}</div>'
      f'<div class="nav-item">{a("About","about.html")}</div>'
      '<div class="nav-item nav-item--cta"><a class="site-nav__cta" href="index.html#build-your-team">Build your team</a></div>'
      '</div>'
      f'<div class="site-nav__right">{SEARCH}<a class="site-nav__cta" href="index.html#build-your-team">Build your team</a>'
      f'<button class="site-nav__toggle" type="button" aria-expanded="false" aria-controls="site-menu" aria-label="Open menu">{BURGER}</button></div>'
      '</nav>')
def add_assets(t):
    if 'ds/header.css' not in t:
        if 'href="ds/bundle.css"' in t:
            t=t.replace('<link rel="stylesheet" href="ds/bundle.css">','<link rel="stylesheet" href="ds/bundle.css"><link rel="stylesheet" href="ds/header.css">',1)
        else:
            t=t.replace('</head>','<link rel="stylesheet" href="ds/header.css">\n</head>',1)
    if 'ds/header.js' not in t:
        t=t.replace('</head>','<script src="ds/header.js" defer></script>\n</head>',1)
    return t
done=[]
for p in sorted(glob.glob('*.html')):
    t=open(p).read(); o=t; cur=current_for(p); h=header(cur)
    if '<x-import component-from-global-scope="DoxaDS.Nav"' in t:       # DoxaDS pages: swap template markup
        t,n=re.subn(r'<div style="position:sticky;top:0;z-index:30"><x-import component-from-global-scope="DoxaDS\.Nav".*?</x-import></div>',lambda m:h,t,count=1,flags=re.S)
        if not n: print('NO TEMPLATE NAV',p)
    elif '<nav class="site-nav"' in t:                                    # original static pages
        t,n=re.subn(r'<nav class="site-nav"[^>]*>.*?</nav>',lambda m:h,t,count=1,flags=re.S)
    else:
        continue
    t=add_assets(t)
    # sticky sub-nav offset follows the real header height (set by build step)
    if t!=o: open(p,'w').write(t); done.append(p)
print(len(done),'pages updated'); print(' '.join(done))
