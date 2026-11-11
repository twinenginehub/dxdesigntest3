// Data blocks for long-form posts (whitepapers, reports): charts, stat grids and tables.
// Rendered on the server as plain HTML/SVG (no chart library), each with a text equivalent for screen readers and search.
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const num = (v) => { const n = typeof v === 'string' ? parseFloat(v.replace(/,/g, '')) : v; return typeof n === 'number' && Number.isFinite(n) ? n : null; };
const text = (v, max = 80) => String(v ?? '').trim().slice(0, max);
const COLORS = 6; // c0..c5 are defined in post.css

function points(b, min) {
  const pts = (Array.isArray(b.data) ? b.data : []).slice(0, 24)
    .map((d) => ({ label: text(d && d.label, 60), value: num(d && d.value) }))
    .filter((d) => d.label && d.value !== null && d.value >= 0);
  return pts.length >= min ? pts : null;
}
const fmtFor = (b) => {
  const pre = String(b.prefix ?? '').slice(0, 4), unit = String(b.unit ?? '').slice(0, 8); // not trimmed: units like " days" need their space
  return (v) => `${esc(pre)}${v.toLocaleString('en-US', { maximumFractionDigits: 2 })}${esc(unit)}`;
};

function frame(b, kind, plot, pts, fmt) {
  const title = text(b.title, 140);
  const table = `<table class="sr-only"><caption>${esc(title || 'Chart data')}</caption><thead><tr><th scope="col">Item</th><th scope="col">Value</th></tr></thead><tbody>${pts.map((p) => `<tr><th scope="row">${esc(p.label)}</th><td>${fmt(p.value)}</td></tr>`).join('')}</tbody></table>`;
  const note = [b.caption && esc(text(b.caption, 300)), b.source && `Source: ${esc(text(b.source, 200))}`].filter(Boolean).join(' ');
  return `<figure class="chart chart--${kind}" role="group"${title ? ` aria-label="${esc(title)}"` : ''}>${title ? `<p class="chart__title">${esc(title)}</p>` : ''}${plot}${table}${note ? `<figcaption class="chart__note">${note}</figcaption>` : ''}</figure>`;
}

function bar(b, pts, fmt) {
  const max = Math.max(...pts.map((p) => p.value)) || 1;
  return frame(b, 'bar', `<div class="bars" aria-hidden="true">${pts.map((p) => `<div class="bars__row"><span class="bars__label">${esc(p.label)}</span><span class="bars__track"><span class="bars__fill" style="width:${(p.value / max * 100).toFixed(1)}%"></span></span><span class="bars__val">${fmt(p.value)}</span></div>`).join('')}</div>`, pts, fmt);
}

function column(b, pts, fmt) {
  const max = Math.max(...pts.map((p) => p.value)) || 1;
  return frame(b, 'column', `<div class="cols" aria-hidden="true">${pts.map((p) => `<div class="cols__col"><div class="cols__stack"><span class="cols__bar" style="height:${(p.value / max * 100).toFixed(1)}%"><b class="cols__val">${fmt(p.value)}</b></span></div><span class="cols__label">${esc(p.label)}</span></div>`).join('')}</div>`, pts, fmt);
}

// Round axis steps (1, 2, 2.5, 5 x 10^n) so tick labels read cleanly.
function niceScale(lo, hi) {
  const span = hi - lo || hi || 1, raw = span / 4, mag = Math.pow(10, Math.floor(Math.log10(raw))), norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const min = Math.floor(lo / step) * step, max = Math.ceil(hi / step) * step;
  const ticks = []; for (let t = min; t <= max + step / 1e6; t += step) ticks.push(Number(t.toFixed(10)));
  return { min, max: max === min ? min + step : max, ticks };
}

function line(b, pts, fmt) {
  const W = 640, H = 280, L = 56, R = 24, T = 28, B = 44;
  const lo = b.startAtZero === false ? Math.min(...pts.map((p) => p.value)) : 0;
  const { min, max, ticks } = niceScale(lo, Math.max(...pts.map((p) => p.value)));
  const PAD = 24; // keeps the first and last points off the axis labels
  const x = (i) => L + PAD + (pts.length === 1 ? (W - L - R - 2 * PAD) / 2 : i * (W - L - R - 2 * PAD) / (pts.length - 1));
  const y = (v) => T + (H - T - B) * (1 - (v - min) / (max - min));
  const grid = ticks.map((v) => `<line x1="${L}" x2="${W - R}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="chart-grid"/><text x="${L - 8}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end" class="chart-axis">${fmt(v)}</text>`).join('');
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
  const showVals = pts.length <= 8;
  const dots = pts.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="4.5" class="chart-dot"/>${showVals ? `<text x="${x(i).toFixed(1)}" y="${(y(p.value) - 11).toFixed(1)}" text-anchor="middle" class="chart-val">${fmt(p.value)}</text>` : ''}<text x="${x(i).toFixed(1)}" y="${H - 16}" text-anchor="middle" class="chart-axis">${esc(p.label)}</text>`).join('');
  return frame(b, 'line', `<svg viewBox="0 0 ${W} ${H}" class="chart-svg" aria-hidden="true" focusable="false">${grid}<path d="${path}" class="chart-line"/>${dots}</svg>`, pts, fmt);
}

function donut(b, pts, fmt) {
  const total = pts.reduce((s, p) => s + p.value, 0);
  if (!total) return '';
  let acc = 0;
  const arcs = pts.map((p, i) => { const pct = p.value / total * 100, el = `<circle cx="21" cy="21" r="15.9155" fill="none" stroke-width="7" class="chart-arc c${i % COLORS}" stroke-dasharray="${pct.toFixed(3)} ${(100 - pct).toFixed(3)}" stroke-dashoffset="${(25 - acc).toFixed(3)}"/>`; acc += pct; return el; }).join('');
  const legend = `<ul class="donut__legend" aria-hidden="true">${pts.map((p, i) => `<li><span class="donut__sw c${i % COLORS}"></span><span class="donut__name">${esc(p.label)}</span><span class="donut__val">${fmt(p.value)} <small>${(p.value / total * 100).toFixed(0)}%</small></span></li>`).join('')}</ul>`;
  return frame(b, 'donut', `<div class="donut" aria-hidden="true"><svg viewBox="0 0 42 42" class="donut__svg" focusable="false"><circle cx="21" cy="21" r="15.9155" fill="none" stroke-width="7" class="chart-track"/>${arcs}</svg>${legend}</div>`, pts, fmt);
}

export function chartHtml(b) {
  const kind = ['bar', 'column', 'line', 'donut'].includes(b.chartType) ? b.chartType : 'bar';
  const pts = points(b, kind === 'line' ? 2 : 1);
  if (!pts) return '';
  const fmt = fmtFor(b);
  return { bar, column, line, donut }[kind](b, pts, fmt);
}

// Row of headline numbers, e.g. [{ value: "42%", label: "faster onboarding" }].
export function statGridHtml(b) {
  const items = (Array.isArray(b.items) ? b.items : []).slice(0, 6).filter((i) => i && text(i.value, 14) && text(i.label, 120));
  if (!items.length) return '';
  return `<ul class="stat-grid stat-grid--${Math.min(items.length, 4)}">${items.map((i) => `<li class="stat"><p class="stat__value">${esc(text(i.value, 14))}</p><p class="stat__label">${esc(text(i.label, 120))}</p>${i.note ? `<p class="stat__note">${esc(text(i.note, 140))}</p>` : ''}</li>`).join('')}</ul>`;
}

// First row is the header row.
export function dataTableHtml(b) {
  const rows = (Array.isArray(b.rows) ? b.rows : []).slice(0, 100).map((r) => (Array.isArray(r && r.cells) ? r.cells.slice(0, 12).map((c) => text(c, 200)) : [])).filter((r) => r.length);
  if (rows.length < 2) return '';
  const [head, ...rest] = rows;
  const cap = text(b.caption, 200);
  return `<div class="table-wrap" role="region" tabindex="0"${cap ? ` aria-label="${esc(cap)}"` : ' aria-label="Data table"'}><table>${cap ? `<caption>${esc(cap)}</caption>` : ''}<thead><tr>${head.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${rest.map((r) => `<tr>${r.map((c, i) => (i ? `<td>${esc(c)}</td>` : `<th scope="row">${esc(c)}</th>`)).join('')}</tr>`).join('')}</tbody></table>${b.source ? `<p class="chart__note">Source: ${esc(text(b.source, 200))}</p>` : ''}</div>`;
}
