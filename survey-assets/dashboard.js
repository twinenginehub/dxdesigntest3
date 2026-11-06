// DOXA ICP survey dashboard. Data comes from /api/survey/results, which requires the dashboard session cookie.
// Every chart is clickable: a click filters all the other charts, the word cloud and the response table.
import { QUESTIONS, COMPANY, byId, OTHER } from './questions.js';

// Interface strings for the dashboard (not survey wording). Edit here.
const UI = {
  password: 'Password', signIn: 'Sign in', signingIn: 'Signing in…', badPassword: 'Incorrect password.', locked: 'Too many attempts. Try again in 15 minutes.',
  notConfigured: 'The dashboard is not configured yet.', loadFailed: 'Could not load the results.',
  title: 'ICP survey results', toc: 'Contents', email: 'Email address', tocOverview: 'Overview',
  hint: 'Click any bar, segment or word to filter every chart on this page. Click it again to undo.',
  showing: (n, total) => `Showing ${n} of ${total} responses`, clearAll: 'Clear all filters',
  responses: 'Responses', completion: 'Completion rate', nps: 'Net promoter score', median: 'Median time to complete',
  ofStarted: (c, s) => `${c} of ${s} who started`, noData: 'Not enough answers yet.',
  who: 'Who responded', why: 'What brought them to DOXA', choice: 'Why they chose DOXA', results: 'Results', words: 'In their own words', progress: 'How far people got', all: 'All responses',
  promoters: 'Promoters', passives: 'Passives', detractors: 'Detractors', scoreRange: '0 to 6 detractors · 7 to 8 passives · 9 to 10 promoters',
  rank1: 'Ranked 1st', rank2: 'Ranked 2nd', rank3: 'Ranked 3rd',
  tabOutcome: 'What they can do now', tabFollow: 'Who they would tell', tabBoth: 'Both',
  showAll: (n) => `Show all ${n}`, showFewer: 'Show fewer', prev: 'Previous', next: 'Next', pageOf: (p, t) => `Page ${p} of ${t}`,
  colCompany: 'Company', colEmail: 'Email', colIndustry: 'Industry', colNps: 'Score', colDate: 'Submitted',
  close: 'Close', notAnswered: 'Not answered',
};

const $ = (s, e = document) => e.querySelector(s);
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v; else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat()) if (k != null) n.append(k.nodeType ? k : document.createTextNode(String(k)));
  return n;
};
const api = async (path, opts) => fetch('/api/survey/' + path, { credentials: 'same-origin', ...opts });
const postJson = (path, body) => api(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });

const main = $('#dx-main');
let S = { rows: [], funnel: { started: 0, completed: 0, reach: {} }, filters: [], tab: 'outcome', page: 0, showAllQuotes: false };

// The trademark symbol is marked on its first appearance on the page only.
let tmUsed = false;
const L = (t) => { if (!t || !t.includes('™')) return t; if (tmUsed) return t.replace(/™/g, ''); tmUsed = true; return t; };

// ---------- boot / auth ----------
async function boot() {
  try {
    const s = await (await api('session')).json();
    if (!s.configured) return note(UI.notConfigured);
    if (s.authed) return load();
    renderLogin();
  } catch { note(UI.loadFailed); }
}
function note(text) { $('#dx-actions').hidden = true; main.replaceChildren(el('p', { class: 'dx-note' }, text)); }

function renderLogin() {
  $('#dx-actions').hidden = true;
  const err = el('p', { class: 'dx-error', role: 'alert' });
  const pw = el('input', { class: 'dx-input', type: 'password', id: 'dx-pw', autocomplete: 'current-password', required: true });
  const btn = el('button', { class: 'dx-btn', type: 'submit' }, UI.signIn);
  const form = el('form', { class: 'dx-login' }, el('h1', { class: 'dx-h1' }, UI.title),
    el('div', { class: 'dx-field' }, el('label', { class: 'dx-label', for: 'dx-pw' }, UI.password), pw), err, btn);
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); err.textContent = ''; btn.disabled = true; btn.textContent = UI.signingIn;
    try {
      const r = await postJson('login', { password: pw.value });
      if (r.ok) return load();
      err.textContent = r.status === 429 ? UI.locked : r.status === 503 ? UI.notConfigured : UI.badPassword;
    } catch { err.textContent = UI.loadFailed; }
    btn.disabled = false; btn.textContent = UI.signIn; pw.select();
  });
  main.replaceChildren(form); pw.focus();
}

$('#dx-signout').addEventListener('click', async () => { await postJson('logout'); S = { ...S, rows: [], filters: [] }; renderLogin(); });

async function load() {
  const r = await api('results');
  if (r.status === 401) return renderLogin();
  if (!r.ok) return note(UI.loadFailed);
  const j = await r.json();
  S.rows = j.responses.map((x) => ({ ...x, submitted_at: new Date(x.submitted_at) }));
  S.funnel = j.funnel;
  $('#dx-actions').hidden = false;
  render();
}

// ---------- filtering ----------
const textOf = (r, tab) => (tab === 'outcome' ? [r.outcome] : tab === 'follow' ? [r.referral_followup] : [r.outcome, r.referral_followup]).filter(Boolean).join(' \n ');
const npsGroup = (n) => (n == null ? null : n >= 9 ? 'promoter' : n >= 7 ? 'passive' : 'detractor');
function match(r, f) {
  switch (f.kind) {
    case 'eq': return r[f.field] === f.value;
    case 'has': return (r[f.field] || []).includes(f.value);
    case 'nps': return r.nps === f.value;
    case 'npsGroup': return npsGroup(r.nps) === f.value;
    case 'word': return new RegExp('\\b' + f.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(textOf(r, f.tab));
    default: return true;
  }
}
const rowsFor = (exclude) => S.rows.filter((r) => S.filters.every((f) => (exclude && exclude.includes(f.field)) || match(r, f)));
const isOn = (field, value) => S.filters.some((f) => f.field === field && f.value === value);
function toggle(f) {
  const same = S.filters.find((x) => x.field === f.field && x.value === f.value);
  S.filters = S.filters.filter((x) => x.field !== f.field);
  if (!same) S.filters.push(f);
  S.page = 0; S.showAllQuotes = false;
  render();
}

// ---------- counting ----------
function countSingle(rows, field, options) {
  const answered = rows.filter((r) => r[field] != null);
  return { n: answered.length, items: options.map((o) => ({ value: o, label: o, count: answered.filter((r) => r[field] === o).length })) };
}
function countMulti(rows, field, options) {
  const answered = rows.filter((r) => (r[field] || []).length);
  return { n: answered.length, items: options.map((o) => ({ value: o, label: o, count: answered.filter((r) => r[field].includes(o)).length })) };
}
const byCount = (items) => items.slice().sort((a, b) => b.count - a.count);

// ---------- chart pieces ----------
function barChart({ items, n, field, kind, order = 'count' }) {
  if (!n) return el('p', { class: 'dx-empty' }, UI.noData);
  const list = order === 'count' ? byCount(items) : items;
  const max = Math.max(1, ...list.map((i) => i.count));
  return el('div', { class: 'dx-bars' }, list.map((i) => {
    const on = isOn(field, i.value);
    const pct = n ? Math.round((i.count / n) * 100) : 0;
    return el('button', {
      type: 'button', class: 'dx-bar' + (i.count ? '' : ' dx-bar--zero'), 'aria-pressed': on ? 'true' : 'false',
      'aria-label': `${i.label}: ${i.count} of ${n} (${pct}%)`,
      onclick: () => toggle({ field, kind, value: i.value, label: i.label }),
    }, el('span', { class: 'dx-bar__label' }, L(i.label)), el('span', { class: 'dx-bar__num' }, String(i.count), el('small', {}, pct + '%')),
    el('span', { class: 'dx-bar__track' }, el('span', { class: 'dx-bar__fill', style: `width:${(i.count / max) * 100}%` })));
  }));
}

function card(q, kids, { wide, sub } = {}) {
  return el('section', { class: 'dx-card' + (wide ? ' dx-card--wide' : '') },
    q.n ? el('p', { class: 'dx-card__eyebrow' }, `Question ${q.n}${q.sub || ''}`) : null, el('h2', {}, q.short || q.label), sub ? el('p', { class: 'dx-card__sub' }, sub) : el('p', { class: 'dx-card__sub' }), kids);
}

function singleCard(q, field, opts) {
  const o = opts || q.options;
  const c = countSingle(rowsFor([field]), field, o);
  return card(q, barChart({ ...c, field, kind: 'eq', order: opts && opts.order }), { sub: `n = ${c.n}` });
}
function multiCard(q, field = q.id) {
  const c = countMulti(rowsFor([field]), field, q.options);
  return card(q, barChart({ ...c, field, kind: 'has' }), { sub: `n = ${c.n} · respondents could pick more than one` });
}
function dualCard(q, f) {
  const c = countSingle(rowsFor([f.id]), f.id, f.options);
  return el('section', { class: 'dx-card' }, el('p', { class: 'dx-card__eyebrow' }, `Question ${q.n}`), el('h2', {}, f.label), el('p', { class: 'dx-card__sub' }, `n = ${c.n}`), barChart({ ...c, field: f.id, kind: 'eq', order: 'config' }));
}

function rankCard(q) {
  const rows = rowsFor(['why_ranked']).filter((r) => (r.why_ranked || []).length);
  const items = q.options.map((o) => {
    const at = [0, 1, 2].map((i) => rows.filter((r) => r.why_ranked[i] === o).length);
    return { value: o, at, score: at[0] * 3 + at[1] * 2 + at[2], any: at[0] + at[1] + at[2] };
  }).sort((a, b) => b.score - a.score);
  const body = rows.length ? el('div', {},
    el('div', { class: 'dx-rank__legend' }, el('span', {}, el('i', { class: 'r1' }), UI.rank1), el('span', {}, el('i', { class: 'r2' }), UI.rank2), el('span', {}, el('i', { class: 'r3' }), UI.rank3)),
    el('div', { class: 'dx-bars' }, items.map((i) => {
      const on = isOn('why_ranked', i.value);
      return el('button', {
        type: 'button', class: 'dx-bar', 'aria-pressed': on ? 'true' : 'false',
        'aria-label': `${i.value}: ranked 1st by ${i.at[0]}, 2nd by ${i.at[1]}, 3rd by ${i.at[2]}`,
        onclick: () => toggle({ field: 'why_ranked', kind: 'has', value: i.value, label: i.value }),
      }, el('span', { class: 'dx-bar__label' }, L(i.value)), el('span', { class: 'dx-bar__num' }, String(i.any), el('small', {}, `${Math.round((i.any / rows.length) * 100)}% in top 3`)),
      el('span', { class: 'dx-stack' }, ['r1', 'r2', 'r3'].map((c, k) => el('span', { class: c, style: `width:${(i.at[k] / rows.length) * 100}%`, title: `${[UI.rank1, UI.rank2, UI.rank3][k]}: ${i.at[k]}` }))));
    }))) : el('p', { class: 'dx-empty' }, UI.noData);
  return card(q, body, { wide: true, sub: `n = ${rows.length} · sorted by points (3 for 1st, 2 for 2nd, 1 for 3rd)` });
}

function npsCard(q) {
  const rows = rowsFor(['nps', 'nps_group']).filter((r) => r.nps != null);
  const n = rows.length;
  const g = { promoter: 0, passive: 0, detractor: 0 };
  rows.forEach((r) => g[npsGroup(r.nps)]++);
  const score = n ? Math.round(((g.promoter - g.detractor) / n) * 100) : null;
  const hist = Array.from({ length: 11 }, (_, i) => rows.filter((r) => r.nps === i).length);
  const maxH = Math.max(1, ...hist);
  const seg = (k, cls, label) => el('button', {
    type: 'button', class: `dx-nps__seg ${cls}`, style: `flex-grow:${Math.max(g[k], 0.0001)}`, 'aria-pressed': isOn('nps_group', k) ? 'true' : 'false',
    'aria-label': `${label}: ${g[k]} of ${n}`, onclick: () => toggle({ field: 'nps_group', kind: 'npsGroup', value: k, label }),
  }, g[k] ? `${Math.round((g[k] / n) * 100)}%` : '');
  const body = n ? el('div', {},
    el('div', { class: 'dx-nps' },
      el('div', {}, el('div', { class: 'dx-nps__score' }, String(score)), el('div', { class: 'dx-nps__cap' }, UI.nps)),
      el('div', {}, el('div', { class: 'dx-nps__split' }, g.detractor ? seg('detractor', 'seg-d', UI.detractors) : null, g.passive ? seg('passive', 'seg-n', UI.passives) : null, g.promoter ? seg('promoter', 'seg-p', UI.promoters) : null),
        el('div', { class: 'dx-nps__legend' }, [['detractor', 'seg-d', UI.detractors], ['passive', 'seg-n', UI.passives], ['promoter', 'seg-p', UI.promoters]].map(([k, cls, lab]) => el('span', {}, el('i', { class: cls }), `${lab} · ${g[k]}`))),
        el('p', { class: 'dx-card__sub', style: 'margin-top:6px' }, UI.scoreRange))),
    el('div', { class: 'dx-hist' }, hist.map((c, i) => el('button', {
      type: 'button', 'aria-pressed': isOn('nps', i) ? 'true' : 'false', 'aria-label': `Score ${i}: ${c} response${c === 1 ? '' : 's'}`,
      onclick: () => toggle({ field: 'nps', kind: 'nps', value: i, label: `Score ${i}` }),
    }, el('span', { class: 'dx-hist__n' }, c ? String(c) : ''), el('span', { class: 'dx-hist__bar ' + (c ? (i >= 9 ? 'seg-p' : i >= 7 ? 'seg-n' : 'seg-d') : 'seg-0'), style: `height:${(c / maxH) * 100}px` }), el('span', { class: 'dx-hist__x' }, String(i)))))) : el('p', { class: 'dx-empty' }, UI.noData);
  return card(q, body, { wide: true, sub: `n = ${n}` });
}

// ---------- word cloud ----------
const STOP = new Set(('a about above after again all also am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further get got had has have having he her here hers him his how i if in into is it its just like me more most my no nor not now of off on once only or other our ours out over own same she should so some such than that the their theirs them then there these they this those through to too under until up us very was we were what when where which while who whom why will with would you your yours yes really much many lot lots thing things way make made makes making able one two also etc still even per via using use used').split(/\s+/));
function tokens(text) {
  return (text.toLowerCase().match(/[a-z][a-z'’-]{2,}|\d[\d,.]*%?/g) || []).map((w) => w.replace(/[’']s$/, '').replace(/^[-']+|[-']+$/g, '')).filter((w) => w.length > 2 && !STOP.has(w));
}
function cloudCard() {
  const rows = rowsFor(['word']);
  const counts = new Map();
  rows.forEach((r) => new Set(tokens(textOf(r, S.tab))).forEach((w) => counts.set(w, (counts.get(w) || 0) + 1)));
  let words = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 60);
  const max = words.length ? words[0][1] : 1;
  const colors = ['var(--doxa-navy)', 'var(--doxa-cyan-700)', 'var(--doxa-green-dark)', 'var(--doxa-slate-600)'];
  // deterministic shuffle so big words sit in the middle and small ones around them
  words = words.map((w, i) => ({ w, i })).sort((a, b) => ((a.i * 7919) % 31) - ((b.i * 7919) % 31)).map((x) => x.w);
  const answered = rows.filter((r) => textOf(r, S.tab).trim()).length;
  const tabs = el('div', { class: 'dx-tabs', role: 'group', 'aria-label': UI.words }, [['outcome', UI.tabOutcome], ['follow', UI.tabFollow], ['both', UI.tabBoth]].map(([k, t]) => el('button', {
    type: 'button', class: 'dx-tab', 'aria-pressed': S.tab === k ? 'true' : 'false',
    onclick: () => { S.tab = k; S.filters = S.filters.filter((f) => f.kind !== 'word'); S.showAllQuotes = false; S.page = 0; render(); },
  }, t)));
  const cloud = words.length ? el('div', { class: 'dx-cloud' }, words.map(([w, c], i) => el('button', {
    type: 'button', class: 'dx-word', 'aria-pressed': isOn('word', w) ? 'true' : 'false', title: `${w}: ${c} response${c === 1 ? '' : 's'}`, 'aria-label': `${w}, mentioned in ${c} response${c === 1 ? '' : 's'}`,
    style: `font-size:${(14 + Math.sqrt(c / max) * 34).toFixed(1)}px;color:${colors[(w.length + c) % colors.length]}`,
    onclick: () => toggle({ field: 'word', kind: 'word', value: w, tab: S.tab, label: `Word: “${w}”` }),
  }, w))) : el('p', { class: 'dx-empty' }, UI.noData);
  // quotes (all active filters applied)
  const qrows = rowsFor().filter((r) => textOf(r, S.tab).trim());
  const wordF = S.filters.find((f) => f.kind === 'word');
  const shown = S.showAllQuotes ? qrows : qrows.slice(0, 6);
  const hi = (t) => {
    if (!wordF) return t;
    const re = new RegExp('(\\b' + wordF.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b)', 'ig');
    const frag = document.createDocumentFragment();
    t.split(re).forEach((part, i) => frag.append(i % 2 ? el('mark', {}, part) : document.createTextNode(part)));
    return frag;
  };
  const quotes = el('div', { class: 'dx-quotes' }, shown.map((r) => el('blockquote', { class: 'dx-quote' },
    [S.tab !== 'follow' && r.outcome ? el('div', {}, hi(r.outcome)) : null, S.tab !== 'outcome' && r.referral_followup ? el('div', {}, hi(r.referral_followup)) : null],
    el('cite', {}, r.company_name))),
  qrows.length > 6 ? el('button', { type: 'button', class: 'dx-clear', style: 'justify-self:start', onclick: () => { S.showAllQuotes = !S.showAllQuotes; render(); } }, S.showAllQuotes ? UI.showFewer : UI.showAll(qrows.length)) : null);
  return el('section', { class: 'dx-card dx-card--wide' }, el('p', { class: 'dx-card__eyebrow' }, 'Questions 7 and 10b'), el('h2', {}, UI.words), el('p', { class: 'dx-card__sub' }, `n = ${answered} · word size shows how many responses mention it`), tabs, cloud, quotes);
}

// ---------- funnel ----------
function funnelCard() {
  const f = S.funnel, started = f.started;
  const labels = [COMPANY.label.replace(/\?$/, ''), ...QUESTIONS.map((q) => `${q.n}${q.sub || ''}. ${q.short}`)];
  const rowsEl = labels.map((lab, i) => {
    const c = f.reach[i] || 0;
    return el('div', { class: 'dx-funnel__row' }, el('span', {}, lab), el('span', { class: 'dx-funnel__track' }, el('span', { class: 'dx-funnel__fill', style: `width:${started ? (c / started) * 100 : 0}%` })), el('span', { class: 'dx-funnel__pct' }, started ? Math.round((c / started) * 100) + '%' : '–'));
  });
  rowsEl.push(el('div', { class: 'dx-funnel__row' }, el('strong', {}, UI.completion), el('span', { class: 'dx-funnel__track' }, el('span', { class: 'dx-funnel__fill', style: `width:${started ? (f.completed / started) * 100 : 0}%` })), el('strong', { class: 'dx-funnel__pct' }, started ? Math.round((f.completed / started) * 100) + '%' : '–')));
  return el('section', { class: 'dx-card dx-card--wide' }, el('p', { class: 'dx-card__eyebrow' }, 'All visitors who opened the survey'), el('h2', {}, UI.progress),
    el('p', { class: 'dx-card__sub' }, `${started} started · share of starters who reached each question. Not affected by the filters above.`), el('div', { class: 'dx-funnel' }, rowsEl));
}

// ---------- table + drawer ----------
function industryLabel(r) { return r.industry === OTHER ? `Other: ${r.industry_other || ''}` : r.industry || '–'; }
const fmtDate = (d) => d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
const PAGE = 10;
function tableCard(rows) {
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  S.page = Math.min(S.page, pages - 1);
  const slice = rows.slice(S.page * PAGE, S.page * PAGE + PAGE);
  const tbody = el('tbody', {}, slice.map((r) => el('tr', { onclick: () => openDrawer(r) },
    el('td', {}, el('button', { type: 'button', onclick: (e) => { e.stopPropagation(); openDrawer(r); } }, r.company_name)), el('td', { class: 'dx-table__email' }, r.email || '–'), el('td', {}, industryLabel(r)), el('td', {}, r.nps == null ? '–' : String(r.nps)), el('td', {}, fmtDate(r.submitted_at)))));
  return el('section', { class: 'dx-card dx-card--wide' }, el('h2', {}, UI.all), el('p', { class: 'dx-card__sub' }, UI.showing(rows.length, S.rows.length)),
    el('div', { class: 'dx-tablewrap' }, el('table', { class: 'dx-table' }, el('thead', {}, el('tr', {}, [UI.colCompany, UI.colEmail, UI.colIndustry, UI.colNps, UI.colDate].map((h) => el('th', { scope: 'col' }, h)))), tbody)),
    el('div', { class: 'dx-pager' }, el('button', { type: 'button', disabled: S.page === 0 ? true : null, onclick: () => { S.page--; render(); } }, UI.prev), el('span', {}, UI.pageOf(S.page + 1, pages)), el('button', { type: 'button', disabled: S.page >= pages - 1 ? true : null, onclick: () => { S.page++; render(); } }, UI.next)));
}

function qaList(r) {
  const out = [];
  const add = (label, val) => {
    let node;
    if (Array.isArray(val)) node = val.length ? el('ul', {}, val.map((v) => el('li', {}, L(v)))) : null;
    else node = val != null && val !== '' ? document.createTextNode(String(val)) : null;
    out.push(el('div', { class: 'dx-qa' }, el('dt', {}, label), el('dd', {}, node || UI.notAnswered)));
  };
  add(UI.email, r.email);
  for (const q of QUESTIONS) {
    const lab = `${q.n}${q.sub || ''}. ${q.short}`;
    if (q.id === 'industry') add(lab, r.industry === OTHER ? `${r.industry}: ${r.industry_other || ''}` : r.industry);
    else if (q.id === 'company_size') { add(lab + ': ' + q.fields[0].label, r.employees); add(q.fields[1].label, r.revenue); }
    else if (q.id === 'role_decision') { add(lab + ': ' + q.role.label, r.role); add(q.others.label, r.decision_others); }
    else if (q.id === 'triggers') add(lab, r.triggers.map((t) => (t === OTHER && r.trigger_other ? `${t}: ${r.trigger_other}` : t)));
    else if (q.id === 'main_trigger') add(lab, r.main_trigger);
    else if (q.id === 'alternatives') add(lab, r.alternatives.map((t) => (r.alternatives_provider && t === q.other.option ? `${t}: ${r.alternatives_provider}` : t)));
    else if (q.id === 'why_ranked') { add(lab, null); const last = out.pop(); if (r.why_ranked.length) { last.querySelector('dd').replaceChildren(el('ol', {}, r.why_ranked.map((v) => el('li', {}, L(v))))); } out.push(last); }
    else if (q.id === 'outcome') add(lab, r.outcome);
    else if (q.id === 'team_size') { add(lab + ': ' + q.fields[0].label, r.team_today); add(q.fields[1].label, r.team_12mo); }
    else if (q.id === 'readiness') add(lab, r.readiness);
    else if (q.id === 'nps') add(lab, r.nps);
    else if (q.id === 'referral_followup') add(lab, r.referral_followup);
  }
  return el('dl', { class: 'dx-drawer__body' }, out);
}
function openDrawer(r) {
  const d = $('#dx-drawer');
  d.replaceChildren(el('div', { class: 'dx-drawer__head' }, el('div', {}, el('h2', { id: 'dx-drawer-title' }, r.company_name), el('small', {}, r.submitted_at.toLocaleString())),
    el('button', { type: 'button', class: 'dx-drawer__close', 'aria-label': UI.close, onclick: () => d.close() }, '×')), qaList(r));
  d.showModal();
}
$('#dx-drawer').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });

// ---------- KPI strip ----------
function median(a) { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
const fmtDur = (s) => (s == null ? '–' : s < 60 ? `${Math.round(s)} s` : `${Math.floor(s / 60)} min ${Math.round(s % 60)} s`);
function kpis(rows) {
  const f = S.funnel;
  const scored = rows.filter((r) => r.nps != null);
  const nps = scored.length ? Math.round(((scored.filter((r) => r.nps >= 9).length - scored.filter((r) => r.nps <= 6).length) / scored.length) * 100) : null;
  const med = median(rows.map((r) => r.duration_seconds).filter((x) => x != null && x <= 3600));
  const k = (v, label, small) => el('div', { class: 'dx-kpi' }, el('b', {}, v), el('span', {}, label), small ? el('small', {}, small) : null);
  return el('div', { class: 'dx-kpis' },
    k(String(rows.length), UI.responses, S.filters.length ? `of ${S.rows.length} total` : null),
    k(f.started ? Math.round((f.completed / f.started) * 100) + '%' : '–', UI.completion, f.started ? UI.ofStarted(f.completed, f.started) : null),
    k(nps == null ? '–' : String(nps), UI.nps, scored.length ? `n = ${scored.length}` : null),
    k(fmtDur(med), UI.median, 'times over an hour are left out'));
}


// ---------- table of contents: highlight the section being read ----------
let spy;
function watchSections(ids) {
  if (spy) spy.disconnect();
  const links = new Map(ids.map((id) => [id, $(`.dx-toc [data-toc="${id}"]`)]));
  const setActive = (id) => links.forEach((a, k) => { if (a) { a.classList.toggle('is-active', k === id); if (k === id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); } });
  const visible = new Set();
  spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
    const first = ids.find((id) => visible.has(id));
    if (first) setActive(first);
  }, { rootMargin: '-150px 0px -65% 0px' });
  ids.forEach((id) => { const t = document.getElementById(id); if (t) spy.observe(t); });
  setActive(ids[0]);
}

// ---------- page ----------
function render() {
  tmUsed = false;
  const rows = rowsFor();
  const y = window.scrollY;
  const chips = S.filters.map((f) => el('button', { type: 'button', class: 'dx-chip', 'aria-label': `Remove filter: ${f.label}`, onclick: () => { S.filters = S.filters.filter((x) => x !== f); S.page = 0; render(); } }, L(f.label), el('span', { class: 'dx-chip__x', 'aria-hidden': 'true' }, '×')));
  const bar = el('div', { class: 'dx-filters', role: 'region', 'aria-label': 'Filters' },
    el('span', { class: 'dx-filters__count' }, UI.showing(rows.length, S.rows.length)),
    chips, chips.length ? el('button', { type: 'button', class: 'dx-clear', onclick: () => { S.filters = []; S.page = 0; render(); } }, UI.clearAll) : el('span', { class: 'dx-filters__hint' }, UI.hint));
  const q = byId;
  const withId = (node, id) => { node.id = id; return node; };
  const sections = [
    ['dx-overview', UI.tocOverview], ['dx-nps', UI.nps], ['dx-who', UI.who], ['dx-why', UI.why], ['dx-choice', UI.choice],
    ['dx-results', UI.results], ['dx-words', UI.words], ['dx-funnel', UI.progress], ['dx-responses', UI.all],
  ];
  const toc = el('nav', { class: 'dx-toc', 'aria-label': UI.toc },
    el('p', { class: 'dx-toc__title' }, UI.toc),
    el('ul', {}, sections.map(([id, label]) => el('li', {}, el('a', { href: '#' + id, 'data-toc': id }, label)))));
  const content = el('div', { class: 'dx-content' },
    el('h1', { class: 'dx-h1' }, UI.title), bar, withId(kpis(rows), 'dx-overview'),
    withId(npsCard(q.nps), 'dx-nps'),
    withId(el('h2', { class: 'dx-section-title' }, UI.who), 'dx-who'),
    el('div', { class: 'dx-grid' }, singleCard(q.industry, 'industry'), singleCard({ ...q.role_decision, short: q.role_decision.role.label }, 'role', q.role_decision.role.options),
      dualCard(q.company_size, q.company_size.fields[0]), dualCard(q.company_size, q.company_size.fields[1]),
      multiCard({ ...q.role_decision, short: q.role_decision.others.label, options: q.role_decision.others.options }, 'decision_others')),
    withId(el('h2', { class: 'dx-section-title' }, UI.why), 'dx-why'),
    el('div', { class: 'dx-grid' }, multiCard(q.triggers), singleCard(q.main_trigger, 'main_trigger', q.triggers.options), multiCard(q.alternatives), multiCard(q.readiness)),
    withId(el('h2', { class: 'dx-section-title' }, UI.choice), 'dx-choice'), el('div', { class: 'dx-grid' }, rankCard(q.why_ranked)),
    withId(el('h2', { class: 'dx-section-title' }, UI.results), 'dx-results'),
    el('div', { class: 'dx-grid' }, dualCard(q.team_size, q.team_size.fields[0]), dualCard(q.team_size, q.team_size.fields[1])),
    withId(el('h2', { class: 'dx-section-title' }, UI.words), 'dx-words'), el('div', { class: 'dx-grid' }, cloudCard()),
    withId(funnelCard(), 'dx-funnel'), withId(tableCard(rows), 'dx-responses'));
  main.replaceChildren(el('div', { class: 'dx-layout' }, toc, content));
  watchSections(sections.map(([id]) => id));
  window.scrollTo(0, y);
}

boot();
