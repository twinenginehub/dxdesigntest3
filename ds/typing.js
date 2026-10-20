/* Typing animation for the home hero headline. Layout is reserved up front (untyped text stays in place, hidden),
   so nothing shifts while it types. Skipped for visitors who prefer reduced motion.
   The page swaps its markup when the app renders, so the headline is looked up again whenever the node is replaced. */
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var text = null, typed = null, rest = null, i = 0, started = false, done = false;

  var g = 0, gT = null, gR = null;

  function render() {
    var gi = Math.min(i, g), ti = Math.max(i - g, 0);
    gT.textContent = text.slice(0, gi);
    gR.textContent = text.slice(gi, g);
    typed.textContent = text.slice(g, g + ti);
    rest.textContent = text.slice(g + ti);
    var onG = g > 0 && i < g;
    gT.className = onG ? 'typing-caret' : '';
    typed.className = onG ? '' : 'typing-caret';
  }

  function attach() {
    var h = document.querySelector('.hero-wrap h1, .sl-hero h1');
    if (!h) return false;
    if (text === null) {
      text = h.textContent;
      var tg = h.querySelector('.tg');   // optional brand-gradient prefix, e.g. <span class="tg">Build the Team.</span>
      g = tg ? tg.textContent.length : 0;
    }
    h.setAttribute('aria-label', text);
    h.textContent = '';
    var wrap = document.createElement('span');
    wrap.className = 'tg';
    gT = document.createElement('span');
    gR = document.createElement('span');
    gR.style.visibility = 'hidden';
    wrap.appendChild(gT);
    wrap.appendChild(gR);
    typed = document.createElement('span');
    rest = document.createElement('span');
    wrap.setAttribute('aria-hidden', 'true');
    typed.setAttribute('aria-hidden', 'true');
    rest.setAttribute('aria-hidden', 'true');
    rest.style.visibility = 'hidden';
    h.appendChild(wrap);
    h.appendChild(typed);
    h.appendChild(rest);
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
    if (h && !(typed && typed.parentNode === h)) attach();
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
