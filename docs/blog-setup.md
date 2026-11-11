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
