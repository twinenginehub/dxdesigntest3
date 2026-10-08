/* Typing animation for the home hero headline. Layout is reserved up front (untyped text stays in place, hidden),
   so nothing shifts while it types. Skipped for visitors who prefer reduced motion. */
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var h = document.querySelector('.hero-wrap h1');
  if (!h || h.dataset.typing) return;
  var text = h.textContent;
  h.dataset.typing = '1';
  h.setAttribute('aria-label', text);
  h.textContent = '';
  var typed = document.createElement('span');
  var rest = document.createElement('span');
  typed.className = 'typing-caret';
  typed.setAttribute('aria-hidden', 'true');
  rest.setAttribute('aria-hidden', 'true');
  rest.style.visibility = 'hidden';
  rest.textContent = text;
  h.appendChild(typed);
  h.appendChild(rest);
  var i = 0;
  function tick() {
    i++;
    typed.textContent = text.slice(0, i);
    rest.textContent = text.slice(i);
    if (i < text.length) {
      var c = text.charAt(i - 1);
      setTimeout(tick, c === '.' || c === ',' ? 260 : 42 + Math.random() * 40);
    } else {
      setTimeout(function () { typed.classList.add('typing-done'); }, 1800);
    }
  }
  setTimeout(tick, 1600);
})();
