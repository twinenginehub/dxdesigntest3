# DOXA ICP client survey: setup and operations

Two pages and a small API, added to the static site.

| What | Address | Public? |
|---|---|---|
| The survey (one question per screen) | `/survey` | Yes, share this link |
| The results dashboard | `/survey/dashboard` | Sign-in required |
| API (submit, progress, login, results, export) | `/api/survey/*` | `submit` and `progress` are write-only; everything else needs the dashboard session |

## One-time setup in Vercel

The site stays static. Responses are stored in Postgres, reached only from the server-side functions in `api/`.

1. **Create a Postgres database.** In the Vercel project: Storage > Create Database > Neon (Postgres). Vercel adds `DATABASE_URL` automatically. Any Postgres works (Supabase included): paste its pooled connection string into `DATABASE_URL`.
2. **Add two more environment variables** (Project Settings > Environment Variables, for Production and Preview):
   - `DASHBOARD_PASSWORD`: the single dashboard login.
   - `SESSION_SECRET`: 32 or more random characters. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
3. **Redeploy.** Tables are created automatically on the first request (`lib/schema.js`).

Moving to Supabase later: create the project, set `DATABASE_URL` to its connection string, redeploy. The schema is plain SQL and uses no vendor features. To carry data over, export the three tables from Neon and import them into Supabase.

## What is protected, and how

- **The database is never reachable from a browser.** The connection string exists only in server environment variables. The public endpoints can add a response and nothing else.
- **Dashboard access** needs the password. A correct password sets a signed, `HttpOnly`, `SameSite=Strict`, `Secure` cookie that lasts 8 hours. `/api/survey/results` and `/api/survey/export` return 401 without it. Five wrong passwords from one network in 15 minutes locks sign-in for that network for 15 minutes.
- **Submissions are validated on the server.** Anything not on the allow-list of survey options is dropped, text is trimmed and length-limited, and arrays and ranking are re-checked. Requests must be JSON from this site's own origin. A hidden honeypot field and a per-network limit (10 per 10 minutes) slow bots.
- **Privacy.** Network addresses are stored only as a salted hash and are never returned by the API. The progress endpoint stores a random session id and a step number, no answers.
- **Not indexable or crawlable.** `X-Robots-Tag: noindex, nofollow, noarchive` headers on every survey and API path (`vercel.json`), a `noindex` meta tag on both pages, `Disallow` rules in `robots.txt`, no links to either page from the site, and the pages are excluded from any sitemap. The dashboard is also sent with `Cache-Control: no-store` and `X-Frame-Options: DENY`.
- CSV export neutralizes spreadsheet formulas.

## Running it locally

```bash
npm install
cp .env.example .env.local        # then fill it in; for local use set LOCAL_DB=pglite
node scripts/seed-dev.js          # optional: synthetic data (refuses to run unless LOCAL_DB=pglite)
npm run dev                       # http://localhost:4200/survey and /survey/dashboard
scripts/api-smoke-test.sh         # checks submit, validation, auth and export
```

## Where things live

- `survey-assets/questions.js`: every question and option, verbatim from the setup document. The survey, the dashboard and the server validator all read this one file.
- `survey-assets/survey.js`, `survey.css`: the survey. Interface strings that are not question wording are in the `UI` block at the top of `survey.js`.
- `survey-assets/dashboard.js`, `dashboard.css`: the dashboard. Its interface strings are in the `UI` block at the top.
- `lib/` and `api/survey/`: database, auth, validation and the endpoints.
