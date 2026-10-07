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
