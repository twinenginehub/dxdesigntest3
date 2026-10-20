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

/* Scroll-in fade for sections and cards. Only elements still below the fold are hidden, so nothing flashes in view
   and the page is fully visible without JS or with reduced motion. Re-scans when a page re-renders its markup. */
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  var SEC = 'section, .cta-final';
  var CARD = '.stat-card, .resp-card, .role-card, .tile, .cost-card, .related, [class*="role-card"]';
  var SKIP = 'nav, footer, .hero-wrap, header, .hero, .trust-bar, .testi, .rfr, .roles-carousel, .site-nav';
  var seen = new WeakSet();
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      io.unobserve(el);
      el.classList.add('rv-in');
      setTimeout(function () { el.classList.remove('rv', 'rv-in', 'rv-sec'); el.style.removeProperty('--rv-d'); }, 1100);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  function prep(el, isSec) {
    if (seen.has(el) || el.closest(SKIP)) return;
    seen.add(el);
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.94) return;   // already on screen: leave it alone
    if (isSec) el.classList.add('rv-sec');
    var sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    el.style.setProperty('--rv-d', (isSec ? 0 : Math.min(sibs, 5) * 0.08) + 's');
    el.classList.add('rv');
    io.observe(el);
  }
  function scan() {
    document.querySelectorAll(SEC).forEach(function (el) { prep(el, true); });
    document.querySelectorAll(CARD).forEach(function (el) { prep(el, false); });
  }
  var t;
  function later() { clearTimeout(t); t = setTimeout(scan, 120); }
  new MutationObserver(later).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'complete') later(); else window.addEventListener('load', later);
})();

/* Smooth anchor scrolling: eased, distance-scaled, honours reduced motion and scroll-margin-top. */
(function(){
  if(window.__smoothAnchors)return;window.__smoothAnchors=true;
  var raf=0;
  var ease=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
  function go(el,hash){
    var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    var off=parseFloat(getComputedStyle(el).scrollMarginTop)||0;
    var max=document.documentElement.scrollHeight-innerHeight;
    var to=Math.max(0,Math.min(max,el.getBoundingClientRect().top+scrollY-off));
    var from=scrollY,dist=to-from;
    cancelAnimationFrame(raf);
    if(reduce||Math.abs(dist)<2){scrollTo(0,to);return}
    var dur=Math.min(1400,Math.max(700,Math.abs(dist)*.6)),t0=performance.now();
    function step(now){
      var p=Math.min(1,(now-t0)/dur);
      scrollTo(0,from+dist*ease(p));
      if(p<1)raf=requestAnimationFrame(step);
    }
    raf=requestAnimationFrame(step);
  }
  addEventListener('wheel',function(){cancelAnimationFrame(raf)},{passive:true});
  addEventListener('touchstart',function(){cancelAnimationFrame(raf)},{passive:true});
  document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var a=e.target.closest&&e.target.closest('a[href*="#"]');if(!a)return;
    var u=new URL(a.href,location.href);
    if(u.pathname!==location.pathname||u.origin!==location.origin||!u.hash||u.hash==='#')return;
    var el=document.getElementById(decodeURIComponent(u.hash.slice(1)));if(!el)return;
    e.preventDefault();go(el);
    history.pushState(null,'',u.hash);
  });
})();
