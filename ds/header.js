/* DOXA site header: phone menu toggle. Delegated so it keeps working when a page re-renders its markup. */
(function () {
  function set(nav, open) {
    nav.classList.toggle('is-open', open);
    var b = nav.querySelector('.site-nav__toggle');
    if (b) { b.setAttribute('aria-expanded', open ? 'true' : 'false'); b.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.site-nav__toggle');
    if (t) { var nav = t.closest('.site-nav'); set(nav, !nav.classList.contains('is-open')); return; }
    document.querySelectorAll('.site-nav.is-open').forEach(function (n) { if (!n.contains(e.target)) set(n, false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') document.querySelectorAll('.site-nav.is-open').forEach(function (n) { set(n, false); var b = n.querySelector('.site-nav__toggle'); if (b) b.focus(); });
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) document.querySelectorAll('.site-nav.is-open').forEach(function (n) { set(n, false); });
  });
})();

/* Fade the sticky header out once the footer comes into view (checked on scroll so it survives page re-renders). */
(function () {
  function update() {
    var footer = document.querySelector('footer');
    var navs = document.querySelectorAll('.site-nav');
    if (!footer || !navs.length) return;
    var reached = footer.getBoundingClientRect().top < window.innerHeight - 100;
    navs.forEach(function (n) { n.classList.toggle('is-faded', reached && !n.classList.contains('is-open')); });
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  window.addEventListener('load', update);
  update();
})();
