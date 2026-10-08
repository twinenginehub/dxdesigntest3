/* Typing animation for the home hero headline. Layout is reserved up front (untyped text stays in place, hidden),
   so nothing shifts while it types. Skipped for visitors who prefer reduced motion.
   The page swaps its markup when the app renders, so the headline is looked up again whenever the node is replaced. */
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var text = null, typed = null, rest = null, i = 0, started = false, done = false;

  function attach() {
    var h = document.querySelector('.hero-wrap h1');
    if (!h) return false;
    if (text === null) text = h.textContent;
    h.setAttribute('aria-label', text);
    h.textContent = '';
    typed = document.createElement('span');
    rest = document.createElement('span');
    typed.className = 'typing-caret';
    typed.setAttribute('aria-hidden', 'true');
    rest.setAttribute('aria-hidden', 'true');
    rest.style.visibility = 'hidden';
    typed.textContent = text.slice(0, i);
    rest.textContent = text.slice(i);
    h.appendChild(typed);
    h.appendChild(rest);
    return true;
  }

  function tick() {
    if (!typed || !typed.isConnected) { if (!attach()) return setTimeout(tick, 100); }
    i++;
    typed.textContent = text.slice(0, i);
    rest.textContent = text.slice(i);
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
    var h = document.querySelector('.hero-wrap h1');
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
