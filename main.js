/* Luka Brada · Online sistem — demo landing
   Bez zavisnosti. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- Hero slika: fade-in kad se učita; ako fajl ne postoji, ostaje tamna pozadina ---------- */
  document.querySelectorAll('.hero-media img').forEach(function (img) {
    var fig = img.closest('.hero-media');
    function ok() { fig.classList.add('is-loaded'); }
    function fail() { img.remove(); }
    if (img.complete) { img.naturalWidth > 0 ? ok() : fail(); }
    else {
      img.addEventListener('load', ok, { once: true });
      img.addEventListener('error', fail, { once: true });
    }
  });

  /* ---------- Hero naslov: slova ulaze sa leve strane ---------- */
  var title = document.querySelector('[data-split]');
  if (title && !reduceMotion) {
    var text = title.textContent.trim().replace(/\s+/g, ' ');
    var words = text.split(' ');
    var n = 0;
    title.setAttribute('aria-label', text);
    title.textContent = '';
    words.forEach(function (word, w) {
      var ws = document.createElement('span');
      ws.className = 'w';
      ws.setAttribute('aria-hidden', 'true');
      Array.from(word).forEach(function (letter) {
        var c = document.createElement('span');
        c.className = 'ch';
        c.textContent = letter;
        c.style.setProperty('--i', n++);
        ws.appendChild(c);
      });
      title.appendChild(ws);
      if (w < words.length - 1) title.appendChild(document.createTextNode(' '));
    });
    title.classList.add('is-split');
  }

  /* ---------- Header: pozadina posle vrha stranice ---------- */
  var header = document.querySelector('[data-header]');
  if (header && hasIO) {
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none;';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (e) {
      header.classList.toggle('is-scrolled', !e[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ---------- Reveal pri skrolu ---------- */
  var reveals = document.querySelectorAll('[data-reveal]');
  if (!hasIO || reduceMotion) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    // elementi koji se pojave zajedno ulaze jedan po jedan, redom
    var revealIO = new IntersectionObserver(function (entries) {
      entries.filter(function (en) { return en.isIntersecting; }).forEach(function (en, k) {
        var el = en.target, delay = k * 140;
        el.style.transitionDelay = delay + 'ms';
        el.classList.add('is-in');
        revealIO.unobserve(el);
        // kad ulazak završi, skini kašnjenje da hover reaguje odmah
        setTimeout(function () { el.style.transitionDelay = ''; el.classList.add('is-done'); }, delay + 950);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { revealIO.observe(el); });
  }

  /* ---------- Saradnja: kuglice i linije se pune belom dok skroluješ ---------- */
  var stepsList = document.querySelector('.steps');
  if (stepsList) {
    var steps = Array.prototype.slice.call(stepsList.querySelectorAll('.step'));
    var wide = window.matchMedia('(min-width: 1000px)');
    var clamp01 = function (v) { return Math.max(0, Math.min(1, v)); };
    var ticking = false;
    var updateSteps = function () {
      ticking = false;
      var line = window.innerHeight * 0.6; // „linija čitanja" na 60% visine ekrana
      if (wide.matches) {
        // vodoravno: napredak kroz ceo red koraka dok se red penje kroz ekran
        var vh = window.innerHeight;
        var r = stepsList.getBoundingClientRect();
        // kraj animacije: gde god red može da stigne na dnu stranice (najkasnije na 35% ekrana)
        var maxScroll = document.documentElement.scrollHeight - vh;
        var topAtBottom = r.top - (maxScroll - window.scrollY);
        var endTop = Math.max(topAtBottom, vh * 0.35);
        var startTop = vh * 0.85;
        var p = clamp01((startTop - r.top) / Math.max(1, startTop - endTop)) * (steps.length - 1);
        steps.forEach(function (st, i) {
          st.classList.toggle('is-active', p >= i - 0.001 && r.top < startTop);
          st.style.setProperty('--fill', clamp01(p - i).toFixed(3));
        });
      } else {
        // uspravno: korak je aktivan kad njegova kuglica pređe liniju čitanja;
        // na dnu stranice se pale svi (visoki ekrani ne mogu da dovedu poslednji korak do linije)
        var atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
        if (atBottom) line = Infinity;
        steps.forEach(function (st) {
          var sr = st.getBoundingClientRect();
          st.classList.toggle('is-active', sr.top + 18 <= line);
          var top = sr.top + 40, bottom = sr.bottom - 4;
          st.style.setProperty('--fill', clamp01((line - top) / (bottom - top)).toFixed(3));
        });
      }
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(updateSteps); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateSteps();
  }

  /* ---------- Sticky CTA na mobilnom: pojavi se kad hero dugmad nestanu sa ekrana ---------- */
  var sticky = document.querySelector('[data-sticky-cta]');
  var heroCta = document.querySelector('[data-hero-cta]');
  if (sticky && heroCta && hasIO) {
    var stickyLink = sticky.querySelector('a');
    new IntersectionObserver(function (en) {
      var e = en[0];
      var on = !e.isIntersecting && e.boundingClientRect.top < 0;
      sticky.classList.toggle('is-visible', on);
      sticky.setAttribute('aria-hidden', on ? 'false' : 'true');
      stickyLink.tabIndex = on ? 0 : -1;
    }).observe(heroCta);
  }
})();
