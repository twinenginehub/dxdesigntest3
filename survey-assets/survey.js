// DOXA ICP survey: renders one question per screen, keeps a local draft, reports drop-off and submits at the end.
import { COMPANY, QUESTIONS, TOTAL_QUESTIONS, OTHER, byId } from './questions.js';

// Interface strings that are not question wording. Edit here; nothing else needs to change.
const UI = {
  title: 'DOXA Talent ICP Client Survey',
  // Placeholder welcome copy: replace with approved wording.
  welcomeHeading: 'Welcome to the DOXA Talent client survey',
  welcomeBody: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  getStarted: 'Get Started',
  emailLabel: 'Email address',
  emailInvalid: 'Please enter a valid email address.',
  next: 'Next', back: 'Back', skip: 'Skip', submit: 'Submit', sending: 'Sending…',
  questionOf: (n, t) => `Question ${n} of ${t}`,
  chooseOne: 'Please choose an option.',
  chooseBoth: 'Please choose an option in each list.',
  chooseAny: 'Please select at least one.',
  specify: 'Please fill in the field above.',
  rankThree: 'Please choose three, in order.',
  needText: 'Please enter a value.',
  rankStatus: (n, max) => `${n} of ${max} chosen`,
  rankClear: 'Clear ranking',
  rankHint: 'Tap the options in order of importance. Tap a chosen option again to remove it.',
  scaleLow: 'Not at all likely',
  scaleHigh: 'Extremely likely',
  select: 'Select…',
  otherLabel: 'Please specify',
  thanks: 'Thank you.',
  failed: 'Something went wrong. Please try again.',
  rateLimited: 'Too many submissions from this network. Please try again later.',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DRAFT_KEY = 'dx_survey_draft_v1';
const CHECK = '<svg viewBox="0 0 10 8" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 4l2.5 2.5L9 1"/></svg>';
const CHEV = '<svg viewBox="0 0 25.22 37.46" aria-hidden="true"><path d="M12.42,0s-.09,0-.14,0H.87c3.92,6.27,7.96,12.01,11.76,17.94C8.5,24.29,4.42,30.57.26,36.98c-.05.08-.21.35-.26.43,0,0,.86.02,1.11.02,1.23,0,2.45,0,3.68,0,2.31,0,4.61,0,6.92.03h.08c.95-.01,1.41-.51,1.86-1.24,1.66-2.68,5.8-9.05,6.51-10.12l5.06-8.29-5.06-7.71c-.39-.54-.63-.85-.84-1.19-1.62-2.57-3.26-5.13-4.84-7.72-.49-.81-1.08-1.2-2-1.21h-.05Z"/></svg>';

const $ = (sel, el = document) => el.querySelector(sel);
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat()) if (k != null) n.append(k.nodeType ? k : document.createTextNode(k));
  return n;
};
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- state ----------
let state = loadDraft() || { sid: uid(), startedAt: Date.now(), answers: {}, stepId: 'welcome' };
const steps = () => {
  const a = state.answers;
  const list = [{ id: 'welcome', kind: 'welcome' }, { id: COMPANY.id, kind: 'company' }];
  for (const q of QUESTIONS) {
    if (q.id === 'main_trigger' && (a.triggers || []).length < 2) continue; // only ask when there is something to choose between
    list.push({ id: q.id, kind: 'question', q });
  }
  return list;
};

function loadDraft() {
  try { const d = JSON.parse(localStorage.getItem(DRAFT_KEY)); return d && d.sid && d.answers ? d : null; } catch { return null; }
}
function saveDraft() { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(state)); } catch { /* storage unavailable: carry on */ } }
function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } }

// ---------- drop-off pings (a random id and a step number; no answers) ----------
function ping(stepIndex) {
  try {
    fetch('/api/survey/progress', {
      method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sid: state.sid, step: stepIndex }),
    }).catch(() => {});
  } catch { /* best effort */ }
}

// ---------- progress bar ----------
function renderProgress(list, idx, finished) {
  const fill = $('.sv-progress__fill'), label = $('.sv-progress__label'), bar = $('.sv-progress');
  const pct = finished ? 100 : Math.round((idx / list.length) * 100);
  fill.style.width = pct + '%';
  bar.setAttribute('aria-valuenow', String(pct));
  const s = list[idx];
  label.textContent = finished || s.kind === 'company' || s.kind === 'welcome' ? '' : UI.questionOf(s.q.n, TOTAL_QUESTIONS);
  bar.setAttribute('aria-valuetext', label.textContent || `${pct}%`);
}

// ---------- field builders ----------
function optionCard(type, name, value, checked, onChange, extra) {
  const input = el('input', { type, name, value, checked: checked || null });
  input.addEventListener('change', onChange);
  const mark = el('span', { class: 'sv-opt__mark', html: type === 'checkbox' ? CHECK : '' });
  return el('label', { class: 'sv-opt' + (type === 'checkbox' ? ' sv-opt--check' : '') }, input, mark, el('span', { class: 'sv-opt__text' }, value), extra);
}

function selectField(f, value, onChange) {
  const id = 'f_' + f.id;
  const sel = el('select', { class: 'sv-select', id, name: f.id }, el('option', { value: '' }, UI.select), f.options.map((o) => el('option', { value: o, selected: o === value || null }, o)));
  sel.addEventListener('change', () => onChange(sel.value));
  return el('div', { class: 'sv-field' }, el('label', { class: 'sv-label', for: id }, f.label), sel);
}

function otherInput(id, label, value, maxLength, onInput) {
  const input = el('input', { class: 'sv-input', type: 'text', id, maxlength: maxLength, value: value || '', autocomplete: 'off' });
  input.addEventListener('input', () => onInput(input.value));
  return el('div', { class: 'sv-other' }, el('label', { class: 'sv-label', for: id }, label), input);
}

// ---------- step renderers: each returns { node, valid(), focus } ----------
function renderCompany(a, refresh) {
  const input = el('input', { class: 'sv-input', type: 'text', id: 'f_company', name: 'company', maxlength: COMPANY.maxLength, autocomplete: 'organization', value: a.company_name || '', required: true });
  input.addEventListener('input', () => { a.company_name = input.value; refresh(); });
  return { node: el('div', { class: 'sv-body' }, el('div', { class: 'sv-field' }, el('label', { class: 'sv-label sv-sr', for: 'f_company' }, COMPANY.label), input)), valid: () => !!(a.company_name || '').trim(), msg: () => UI.needText, first: input };
}

function renderSingle(q, a, refresh, advance, options) {
  const opts = options || q.options;
  const wrap = el('div', { class: 'sv-body' });
  const otherHolder = el('div');
  const draw = () => {
    otherHolder.replaceChildren();
    if (q.other && a[q.id] === q.other.option) otherHolder.append(otherInput('f_' + q.other.field, UI.otherLabel, a[q.other.field], q.other.maxLength, (v) => { a[q.other.field] = v; refresh(); }));
  };
  opts.forEach((o) => {
    wrap.append(optionCard('radio', q.id, o, a[q.id] === o, () => {
      a[q.id] = o; draw(); refresh();
      if (!(q.other && o === q.other.option)) advance(true);
      else { const i = $('input[type=text]', otherHolder); if (i) i.focus(); }
    }));
  });
  wrap.append(otherHolder); draw();
  return { node: wrap, valid: () => !!a[q.id] && !(q.other && a[q.id] === q.other.option && !(a[q.other.field] || '').trim()), msg: () => (a[q.id] ? UI.specify : UI.chooseOne), first: $('input', wrap) };
}

function renderDual(q, a, refresh) {
  const wrap = el('div', { class: 'sv-body' });
  q.fields.forEach((f) => wrap.append(selectField(f, a[f.id], (v) => { a[f.id] = v || undefined; refresh(); })));
  return { node: wrap, valid: () => q.fields.every((f) => a[f.id]), msg: () => UI.chooseBoth, first: $('select', wrap) };
}

function multiGroup(group, a, refresh, { exclusive, other } = {}) {
  const field = group.id || group.fieldId;
  a[field] = a[field] || [];
  const holders = {};
  const wrap = el('div', { class: 'sv-body' });
  const drawOther = () => {
    if (!other) return;
    const h = holders[other.option];
    h.replaceChildren();
    if (a[field].includes(other.option)) h.append(otherInput('f_' + other.field, other.textLabel || UI.otherLabel, a[other.field], other.maxLength, (v) => { a[other.field] = v; refresh(); }));
  };
  group.options.forEach((o) => {
    const card = optionCard('checkbox', field, o, a[field].includes(o), (e) => {
      const on = e.target.checked;
      let list = a[field].filter((x) => x !== o);
      if (on) {
        list = exclusive === o ? [o] : list.filter((x) => x !== exclusive).concat(o);
      }
      a[field] = list;
      wrap.querySelectorAll('input[type=checkbox]').forEach((i) => { i.checked = list.includes(i.value); });
      drawOther(); refresh();
      if (on && other && o === other.option) { const i = $('input[type=text]', holders[o]); if (i) i.focus(); }
    });
    wrap.append(card);
    if (other && o === other.option) { holders[o] = el('div'); wrap.append(holders[o]); }
  });
  drawOther();
  return wrap;
}

function renderMulti(q, a, refresh) {
  const wrap = multiGroup({ id: q.id, options: q.options }, a, refresh, { exclusive: q.exclusive, other: q.other });
  return {
    node: wrap,
    valid: () => a[q.id].length > 0 && !(q.other && a[q.id].includes(q.other.option) && !(a[q.other.field] || '').trim()),
    msg: () => (a[q.id].length ? UI.specify : UI.chooseAny),
    first: $('input', wrap),
  };
}

function renderRole(q, a, refresh) {
  const roleG = el('fieldset', { class: 'sv-group' }, el('legend', { class: 'sv-legend' }, q.role.label),
    q.role.options.map((o) => optionCard('radio', q.role.id, o, a[q.role.id] === o, () => { a[q.role.id] = o; refresh(); })));
  const others = el('fieldset', { class: 'sv-group' }, el('legend', { class: 'sv-legend' }, q.others.label), multiGroup(q.others, a, refresh, { exclusive: q.others.exclusive }));
  return { node: el('div', { class: 'sv-body' }, roleG, others), valid: () => !!a[q.role.id] && (a[q.others.id] || []).length > 0, msg: () => (a[q.role.id] ? UI.chooseAny : UI.chooseOne), first: $('input', roleG) };
}

function renderRank(q, a, refresh) {
  a[q.id] = a[q.id] || [];
  const list = el('div', { class: 'sv-rank' });
  const status = el('div', { class: 'sv-rank__status' });
  const draw = () => {
    status.replaceChildren(el('span', { 'aria-live': 'polite' }, UI.rankStatus(a[q.id].length, q.max)), el('button', { type: 'button', class: 'sv-linkbtn', disabled: a[q.id].length ? null : true, onclick: () => { a[q.id] = []; draw(); refresh(); } }, UI.rankClear));
    list.replaceChildren(...q.options.map((o) => {
      const pos = a[q.id].indexOf(o);
      const full = a[q.id].length >= q.max && pos < 0;
      return el('button', {
        type: 'button', class: 'sv-rankopt', 'aria-pressed': pos >= 0 ? 'true' : 'false', disabled: full ? true : null,
        'aria-label': pos >= 0 ? `${o}, rank ${pos + 1}` : o,
        onclick: () => { if (pos >= 0) a[q.id].splice(pos, 1); else a[q.id].push(o); draw(); refresh(); },
      }, el('span', { class: 'sv-rankopt__badge', 'aria-hidden': 'true' }, pos >= 0 ? String(pos + 1) : ''), el('span', { class: 'sv-opt__text' }, o));
    }));
  };
  draw();
  return { node: el('div', { class: 'sv-body' }, status, list), valid: () => a[q.id].length === q.max, msg: () => UI.rankThree, first: null, hint: UI.rankHint };
}

function renderText(q, a, refresh) {
  const ta = el('textarea', { class: 'sv-textarea', id: 'f_' + q.id, name: q.id, maxlength: q.maxLength, rows: 6 }, a[q.id] || '');
  ta.addEventListener('input', () => { a[q.id] = ta.value; refresh(); });
  return { node: el('div', { class: 'sv-body' }, el('label', { class: 'sv-label sv-sr', for: 'f_' + q.id }, q.label), ta), valid: () => true, msg: () => '', first: ta, optional: true };
}

function renderScale(q, a, refresh, advance) {
  const group = el('fieldset', { class: 'sv-scale', role: 'radiogroup', 'aria-label': q.label });
  for (let i = q.min; i <= q.max; i++) {
    const input = el('input', { type: 'radio', name: q.id, value: String(i), checked: a[q.id] === i || null });
    input.addEventListener('change', () => { a[q.id] = i; refresh(); advance(true); });
    group.append(el('label', { class: 'sv-scale__item' }, input, el('span', {}, String(i))));
  }
  const ends = el('div', { class: 'sv-scale__ends', 'aria-hidden': 'true' }, el('span', {}, UI.scaleLow), el('span', {}, UI.scaleHigh));
  return { node: el('div', { class: 'sv-body' }, group, ends), valid: () => typeof a[q.id] === 'number', msg: () => UI.chooseOne, first: $('input', group) };
}

function build(step, a, refresh, advance) {
  if (step.kind === 'company') return renderCompany(a, refresh);
  const q = step.q;
  switch (q.type) {
    case 'single':
      if (q.pipeFrom) return renderSingle(q, a, refresh, advance, a[q.pipeFrom] || []);
      return renderSingle(q, a, refresh, advance);
    case 'dual': return renderDual(q, a, refresh);
    case 'multi': return renderMulti(q, a, refresh);
    case 'role': return renderRole(q, a, refresh);
    case 'rank': return renderRank(q, a, refresh);
    case 'text': return renderText(q, a, refresh);
    case 'scale': return renderScale(q, a, refresh, advance);
    default: return null;
  }
}

// ---------- flow ----------
const card = $('#sv-card');
let current; // { valid, msg }

function stepIndex(list) { const i = list.findIndex((s) => s.id === state.stepId); return i < 0 ? 0 : i; }
function questionNumber(step) { return step.kind === 'company' ? 0 : QUESTIONS.findIndex((q) => q.id === step.id) + 1; }

function show() {
  const list = steps();
  const idx = stepIndex(list);
  const step = list[idx];
  const a = state.answers;

  // when only one trigger was chosen, it is the main trigger: no extra question needed
  if ((a.triggers || []).length === 1) a.main_trigger = a.triggers[0];
  else if ((a.triggers || []).length === 0 || !(a.triggers || []).includes(a.main_trigger)) delete a.main_trigger;

  renderProgress(list, idx, false);
  saveDraft();

  if (step.kind === 'welcome') {
    const start = el('button', { type: 'submit', class: 'sv-btn', id: 'sv-start' }, UI.getStarted, el('span', { html: CHEV }));
    const h = el('h1', { class: 'sv-q', tabindex: '-1', id: 'sv-q' }, UI.welcomeHeading);
    const email = el('input', { class: 'sv-input', type: 'email', id: 'f_email', name: 'email', maxlength: 254, autocomplete: 'email', inputmode: 'email', value: a.email || '', required: true, 'aria-describedby': 'sv-error' });
    const err = el('p', { class: 'sv-error', id: 'sv-error', role: 'alert' });
    email.addEventListener('input', () => { a.email = email.value.trim(); err.textContent = ''; saveDraft(); });
    const form = el('form', { class: 'sv-step sv-welcome', novalidate: true, 'aria-labelledby': 'sv-q' },
      h, el('p', { class: 'sv-welcome__body' }, UI.welcomeBody),
      el('div', { class: 'sv-body' }, el('div', { class: 'sv-field' }, el('label', { class: 'sv-label', for: 'f_email' }, UI.emailLabel), email), err),
      el('div', { class: 'sv-actions sv-actions--start' }, start));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      a.email = email.value.trim();
      if (!EMAIL_RE.test(a.email)) { err.textContent = UI.emailInvalid; email.focus(); return; }
      move(1);
    });
    card.replaceChildren(form);
    window.scrollTo({ top: 0, behavior: 'auto' });
    h.focus({ preventScroll: true });
    return;
  }
  ping(questionNumber(step));

  const isLast = idx === list.length - 1;
  const errBox = el('p', { class: 'sv-error', id: 'sv-error', role: 'alert' });
  const nextBtn = el('button', { type: 'submit', class: 'sv-btn', id: 'sv-next' }, isLast ? UI.submit : UI.next, isLast ? null : el('span', { html: CHEV }));
  const refresh = () => { saveDraft(); errBox.textContent = ''; };
  let advancing = false;
  const advance = (fromAuto) => {
    if (advancing) return;
    if (!current.valid()) { errBox.textContent = current.msg(); return; }
    advancing = true;
    const go = () => (isLast ? finish() : move(1));
    if (fromAuto && !reduceMotion) setTimeout(go, 260); else go();
  };

  current = build(step, a, refresh, advance);
  const q = step.q;
  const heading = el('h1', { class: 'sv-q', tabindex: '-1', id: 'sv-q' }, step.kind === 'company' ? COMPANY.label : q.label);
  const hint = current.hint ? el('p', { class: 'sv-hint' }, current.hint) : null;

  const back = idx > 0 ? el('button', { type: 'button', class: 'sv-linkbtn', onclick: () => move(-1) }, UI.back) : el('span');
  const skip = step.kind !== 'company' && !current.optional ? el('button', { type: 'button', class: 'sv-linkbtn', onclick: () => skipStep(step, isLast) }, UI.skip) : null;

  const form = el('form', { class: 'sv-step', novalidate: true, 'aria-labelledby': 'sv-q' },
    heading, hint, current.node, errBox,
    el('div', { class: 'sv-hp', 'aria-hidden': 'true' }, el('label', {}, 'Leave this empty', el('input', { type: 'text', name: 'website', tabindex: '-1', autocomplete: 'off' }))),
    el('div', { class: 'sv-actions' }, back, el('div', { class: 'sv-actions__right' }, skip, nextBtn)));
  form.addEventListener('submit', (e) => { e.preventDefault(); advance(false); });
  card.replaceChildren(form);
  window.scrollTo({ top: 0, behavior: 'auto' });
  heading.focus({ preventScroll: true });
}

function move(dir) {
  const list = steps();
  const next = list[Math.min(list.length - 1, Math.max(0, stepIndex(list) + dir))];
  state.stepId = next.id;
  show();
}

function skipStep(step, isLast) {
  const a = state.answers;
  const q = step.q;
  const clear = (k) => { delete a[k]; };
  if (q.type === 'dual') q.fields.forEach((f) => clear(f.id));
  else if (q.type === 'role') { clear(q.role.id); a[q.others.id] = []; }
  else if (['multi', 'rank'].includes(q.type)) { a[q.id] = []; if (q.other) clear(q.other.field); }
  else { clear(q.id); if (q.other) clear(q.other.field); }
  isLast ? finish() : move(1);
}

async function finish() {
  const btn = $('#sv-next');
  const err = $('#sv-error');
  if (btn) { btn.disabled = true; btn.textContent = UI.sending; }
  const a = state.answers;
  const payload = { sid: state.sid, duration_seconds: Math.round((Date.now() - state.startedAt) / 1000), website: ($('input[name=website]') || {}).value || '', answers: a };
  try {
    const r = await fetch('/api/survey/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!r.ok) throw Object.assign(new Error('submit'), { status: r.status });
    clearDraft();
    renderProgress(steps(), 0, true);
    card.replaceChildren(el('div', { class: 'sv-done sv-step', role: 'status' },
      el('span', { class: 'sv-done__tick', html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' }),
      el('h1', { class: 'sv-q', tabindex: '-1', id: 'sv-q' }, UI.thanks)));
    $('#sv-q').focus({ preventScroll: true });
  } catch (e) {
    if (err) err.textContent = e.status === 429 ? UI.rateLimited : UI.failed;
    if (btn) { btn.disabled = false; btn.textContent = UI.submit; }
  }
}

document.title = UI.title;
show();
