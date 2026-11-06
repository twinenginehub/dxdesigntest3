// Database access. Production uses DATABASE_URL (any PostgreSQL: Neon, Vercel Postgres, Supabase).
// Local development without a server can set LOCAL_DB=pglite (embedded Postgres, stored in .dev-data/).
import { SCHEMA } from './schema.js';

export class NotConfiguredError extends Error {
  constructor(msg) { super(msg); this.name = 'NotConfiguredError'; }
}

let client; // { query(text, params) -> { rows } }
let ready;

async function connect() {
  if (process.env.LOCAL_DB === 'pglite') {
    const { PGlite } = await import('@electric-sql/pglite');
    (await import('node:fs')).mkdirSync('.dev-data', { recursive: true });
    const db = new PGlite('.dev-data/pg');
    await db.waitReady;
    return { query: (text, params) => db.query(text, params), exec: (text) => db.exec(text) };
  }
  const url = process.env.DATABASE_URL;
  if (!url) throw new NotConfiguredError('DATABASE_URL is not set');
  const pg = (await import('pg')).default;
  const pool = new pg.Pool({ connectionString: url, max: 1, idleTimeoutMillis: 10000 });
  return { query: (text, params) => pool.query(text, params), exec: (text) => pool.query(text) };
}

export async function db() {
  if (!ready) {
    ready = (async () => {
      client = await connect();
      await client.exec(SCHEMA);
      return client;
    })().catch((e) => { ready = undefined; throw e; });
  }
  return ready;
}

export async function query(text, params = []) {
  const c = await db();
  return c.query(text, params);
}
