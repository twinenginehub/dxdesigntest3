/* Typing animation for the home hero headline. Layout is reserved up front (untyped text stays in place, hidden),
   so nothing shifts while it types. Skipped for visitors who prefer reduced motion.
   The page swaps its markup when the app renders, so the headline is looked up again whenever the node is replaced. */
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var text = null, typed = null, rest = null, i = 0, started = false, done = false;

  var segs = null, parts = null;   // segs: [{t: text, g: gradient?}], parts: [{typed, rest, wrap}]

  function render() {
    var shown = i, active = -1;
    for (var k = 0; k < segs.length; k++) {
      var s = segs[k], n = Math.max(0, Math.min(s.t.length, shown));
      parts[k].typed.textContent = s.t.slice(0, n);
      parts[k].rest.textContent = s.t.slice(n);
      if (active < 0 && n < s.t.length) active = k;   // caret sits in the segment currently being typed
      shown -= s.t.length;
    }
    if (active < 0) active = segs.length - 1;
    for (var j = 0; j < parts.length; j++) parts[j].typed.className = j === active ? 'typing-caret' : '';
    typed = parts[active].typed;
  }

  function attach() {
    var h = document.querySelector('.hero-wrap h1, .sl-hero h1');
    if (!h) return false;
    if (text === null) {
      // Optional brand-gradient phrases are marked in the markup, e.g. <span class="tg">Build the Team.</span>
      segs = [];
      Array.prototype.forEach.call(h.childNodes, function (n) {
        var s = n.textContent;
        if (!s) return;
        segs.push({ t: s, g: n.nodeType === 1 && n.classList.contains('tg') });
      });
      text = segs.map(function (s) { return s.t; }).join('');
    }
    h.setAttribute('aria-label', text);
    h.textContent = '';
    parts = segs.map(function (s) {
      var wrap = document.createElement('span');
      if (s.g) wrap.className = 'tg';
      wrap.setAttribute('aria-hidden', 'true');
      var ty = document.createElement('span'), re = document.createElement('span');
      re.style.visibility = 'hidden';
      wrap.appendChild(ty);
      wrap.appendChild(re);
      h.appendChild(wrap);
      return { wrap: wrap, typed: ty, rest: re };
    });
    typed = parts[0].typed;
    rest = parts[parts.length - 1].rest;
    render();
    return true;
  }

  function tick() {
    if (!typed || !typed.isConnected) { if (!attach()) return setTimeout(tick, 100); }
    i++;
    render();
    if (i < text.length) {
      var c = text.charAt(i - 1);
      setTimeout(tick, c === '.' || c === ',' ? 260 : 42 + Math.random() * 40);
    } else {
      done = true;
      setTimeout(function () { if (typed) typed.classList.add('typing-done'); }, 1800);
    }
  }

  // Take over the headline immediately (so it never flashes in full) and again if the app swaps it out.
  function claim() {
    if (done) return;
    var h = document.querySelector('.hero-wrap h1, .sl-hero h1');
    if (h && !(parts && parts[0].wrap.parentNode === h)) attach();
  }
  claim();
  var mo = new MutationObserver(function () { if (done) mo.disconnect(); else claim(); });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  function start() {
    if (started) return;
    started = true;
    setTimeout(tick, 1600);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
