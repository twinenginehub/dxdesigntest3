# Blog setup (Sanity + Vercel)

Posts live in Sanity. Each post is rendered at `/blog/<slug>` by `api/blog/post.js` using the site nav and footer, so
search engines get full HTML. Pages are cached at the edge for 5 minutes and refreshed in the background.

## One-time setup
1. Create a Sanity project at sanity.io (free plan is enough) and note the **project ID**.
2. Create a Studio: `npm create sanity@latest` in a separate folder. Copy `sanity/post.schema.js` into the Studio's
   `schemaTypes` folder and register `post`, `author` and `callout`.
3. Keep the dataset **public** (the default, `production`). The site reads published posts without a token.
4. In the Sanity project settings, API > CORS origins: not needed (reads happen on the server).
5. In Vercel > Project > Settings > Environment Variables add (plain values, not secrets):
   - `SANITY_PROJECT_ID` = your project ID
   - `SANITY_DATASET` = `production` (optional, this is the default)
   - `SITE_URL` = the public site URL, e.g. `https://www.example.com` (used for canonical and social tags)
6. Redeploy.

## Publishing
A post is live when it has a `slug` and a `publishedAt` date that is in the past. Until Sanity is connected, the template can
be previewed at `/blog/sample-post` locally and on Vercel preview deployments (never on production).

## Local preview
`npm run dev`, then open http://localhost:4200/blog/sample-post. To preview real content locally, set
`SANITY_PROJECT_ID` in `.env.local`.

## Changing the nav or footer
Blog pages carry a generated copy of the site nav and footer. After editing them, run `python3 scripts/build-blog-chrome.py`.

## Blog page (/blog)
The listing page at `/blog` shows six content types (Articles, Case Studies, Learning, Podcast, Press, Whitepapers). Each post needs a
**Content type** in Sanity (copy the updated `sanity/post.schema.js`; posts without one count as Articles). Tick **Featured** on up to
three posts to control "Featured and trending" (otherwise the three newest show). "Browse by topic" is built from each post's Category.
Views: `/blog?type=case-studies`, `/blog?topic=hiring`, `/blog?type=articles&page=2`. Search runs in the browser.

## Podcast episodes
Set **Content type** to Podcast and a "Podcast episode" group appears in the Studio: episode and season numbers, duration, audio file URL (direct https
MP3 from your podcast host, which gives a built-in player and clickable chapter times), an optional embed URL (Spotify, Apple Podcasts, YouTube, Vimeo,
Simplecast, Buzzsprout, Transistor, SoundCloud, Captivate or Megaphone only), "Listen on" links, guests, chapters and an optional transcript. The post
body becomes the show notes. Preview locally at `/blog/sample-podcast-4`. Audio is not stored in Sanity; host files with your podcast provider.
The page marks the series as "DOXA Podcast" in its structured data (`lib/blog/podcast.js`); rename it there if the show has another name.

## Whitepapers
Content type **Whitepaper** adds a "Whitepaper details" group: executive summary, page count, PDF (upload or link), optional **gated download page**
(a Gated download document; the button then goes to its form instead of the file) and up to four **key numbers** shown in a band under the summary.
The body gets numbered sections. For data, add these body blocks in the Studio: **Chart** (horizontal bars, columns, line or donut; every chart also
carries a text table for screen readers and search), **Key numbers** (a row of big figures) and **Table** (first row is the header). They work in any post.
Preview: `/blog/sample-whitepaper-5`.

## Press releases
Content type **Press** switches to the press layout: "For immediate release" flag, dateline (city + date added to the first paragraph),
"About DOXA Talent" boilerplate (edit in the Studio or leave empty for the standard text), media contacts, downloads and a print button
(printing hides the site header and footer). Preview: `/blog/sample-press-6`.

## Franchise Blog (/franchise-blog)
A separate section with its own Sanity document type, **Franchise post** (audience: Franchisors or Franchisees). Listing at `/franchise-blog`
(`?topic=growth`, `?page=2`; tabs are the post categories), posts at `/franchise-blog/<slug>`. It reuses the post template and the listing styles. Preview: `/franchise-blog`.

## Gated downloads (/resources/<slug>)
Sanity document type **Gated download**: headline, benefits list, cover, file (upload or link), button and thank-you text. The page shows a form
(first name, last name, work email, company, job title) and reveals the download after it validates.
**The form is front end only for now: submissions are not stored or sent anywhere.** Wire it to a database, CRM or email service in
`lib/blog/gated.js` (look for the comment "Front end only") before launch. The download link is in the page source, so this is a lead-capture
speed bump, not real access control. Preview: `/resources/sample-guide`.

## Local checks
`sh scripts/dev-restart-and-check.sh` restarts the dev server and checks every template route. `node scripts/test-blog-templates.mjs` runs the safety tests
(escaping, URL checks). All sample pages use dummy data and are never served on production.
After copying `sanity/post.schema.js` into the Studio, register every exported type (see the last line of that file).

## Case Studies listing (/case-studies)
A filter page for every published post with Content type **Case study**. Four filters (Industry, Company size, Region, Use case) combine; "Clear all" resets;
12 cards at a time with "Load more". The URL keeps the state (`/case-studies?industry=Accounting&region=Europe`) so views can be shared. All cards are in the page
HTML for search engines. There is no text search on this page.
Cards use the **Case study details** group in the Studio (client name or anonymous description, optional logo, industry, company size, region, use case and a
headline result). Filter options come from the values you enter, so spell industries and use cases consistently. Preview: `/case-studies`.
The Case Studies tab and "View all" on `/blog` link here.

## Case study page
Content type **Case study** uses the customer-story layout: client logo, outcome headline and team photo in the header; a row of up to three key results;
an "At a glance" box (client, industry, region, company size, services with optional links) beside the story; then **Story sections** (label, headline, text and an
optional pull quote with name, title and company; typically the challenge, the solution and the results) and a closing call to action.
Everything lives in the **Case study details** group in the Studio. The main body text is optional and appears after the sections. Preview: `/blog/sample-case-study-3`.

## Resources hub (/resources)
Every **Resource (gated download)** in the Studio appears on `/resources`. Filtering works like the Deel resource hub: a search bar ("Find a resource") and a
**Filter** button that opens a slide-in drawer with four collapsible groups (**Resource types**, **Topics**, **Resources for**, **Business size**), a count beside each
option, "Clear all" and "Apply (N results)". Selections only take effect when you press Apply (Esc or the close button discards them). Active filters show as removable
chips under the header with "Showing X of Y results" and "Clear all"; "Load more" reveals 12 at a time. The URL keeps the state, e.g.
`/resources?type=checklist&type=template&topic=Onboarding&q=review`.
Resource types: Checklist, Course, Guide, Report, Template, Tool, Webinar (a type only appears in the drawer once a resource uses it). Resources for: Finance, Founders,
HR, IT managers, Legal, Operations, Talent acquisition, Franchise brands. Business size: Startup, Mid-market, Enterprise. Topics come from each resource's Topic field, so spell
them the same way every time. Preview: `/resources`.

## Resource pages and one-sheets (/resources/<slug>)
A resource page is the gated download (hero with the form). Fill in the optional fields and it becomes a full **one-sheet page**: explainer text, key takeaways,
"what is inside", numbered how-to steps, benefits, who it is for, FAQs (also added as structured data), and "More resources" (hand-picked, or the same type or topic
automatically), then a "Download for free" strip and the shared end-of-page CTA. The example PDF is `blog-assets/sample-one-sheet.pdf`, built from
`scripts/one-sheet/sample-one-sheet.html` with `sh scripts/one-sheet/build.sh` (headless Chrome, US Letter, one page). Preview: `/resources/sample-one-sheet`.
The form is still front end only (see "Gated downloads").

## End-of-page call to action
All post templates (article, case study, learning, podcast, press, whitepaper, franchise post, case study page and resource pages) end with the same block,
modelled on the site's "cta-final": headline with a gradient second line, one paragraph, an "Explore talent" and a "Build your team" button. It lives in
`lib/blog/cta.js` and `blog-assets/cta.css`; change the wording there. Listing pages keep their navy band.
