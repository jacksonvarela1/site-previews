/* v1.5 blend motion and media for Brandon Still's site (child theme assets/js/bs-motion.js, enqueued with defer).
   A one-line inline script in <head> adds .bs-js before first paint and removes it again if this file never runs.
   No libraries, no network calls except the YouTube player a visitor taps to load. */
(function () {
  'use strict';
  var d = document, html = d.documentElement, w = window;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = !!(navigator.connection && navigator.connection.saveData);
  var hasIO = 'IntersectionObserver' in w;
  w.bsMotion = 1;
  html.classList.add('bs-js');
  function each(sel, fn) { Array.prototype.forEach.call(d.querySelectorAll(sel), fn); }
  function playSafe(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }

  // header height for scroll-padding-top (anchors and focused fields never sit under the sticky header)
  var head = d.querySelector('.wp-site-blocks > header.wp-block-template-part');
  function setHead() { if (head) html.style.setProperty('--bs-head', head.offsetHeight + 'px'); }
  setHead();
  if (head && 'ResizeObserver' in w) new ResizeObserver(setHead).observe(head);

  // M3 header settle: a 1 px sentinel at the top of the page
  if (hasIO && head) {
    var s = d.createElement('div');
    s.className = 'bs-sentinel';
    s.setAttribute('aria-hidden', 'true');
    s.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
    d.body.insertBefore(s, d.body.firstChild);
    new IntersectionObserver(function (es) { html.classList.toggle('bs-scrolled', !es[0].isIntersecting); }).observe(s);
  }

  // M1 reveal and M2 settle, once each
  function show(el) {
    var img = el.classList.contains('bs-settle') && el.querySelector('img');
    if (img && img.decode && !reduce) {
      var done = function () { el.classList.add('is-in'); };
      img.decode().then(done, done);
      setTimeout(done, 1500);
    } else {
      el.classList.add('is-in');
    }
  }
  var items = d.querySelectorAll('.bs-reveal, .bs-settle');
  if (reduce || !hasIO) {
    Array.prototype.forEach.call(items, function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  // M6 count-up on the market snapshot band (numbers already printed in the HTML)
  if (!reduce && hasIO) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        Array.prototype.forEach.call(e.target.querySelectorAll('.bs-stat-num'), function (n) {
          var m = /^(\D*)([\d,]+(?:\.\d+)?)(.*)$/.exec(n.textContent.trim());
          if (!m) return;
          var to = parseFloat(m[2].replace(/,/g, '')), dec = (m[2].split('.')[1] || '').length, comma = m[2].indexOf(',') > -1;
          var fmt = function (x) { return comma ? x.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : x.toFixed(dec); };
          var t0 = null, final = n.textContent;
          var step = function (t) {
            if (t0 === null) t0 = t;
            var k = Math.min(1, (t - t0) / 900), v = to * (1 - Math.pow(1 - k, 3));
            n.textContent = k < 1 ? m[1] + fmt(v) + m[3] : final;
            if (k < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      });
    }, { threshold: 0.4 });
    each('.bs-count', function (el) { cio.observe(el); });
  }

  // Home hero loop: pause button (WCAG 2.2.2), no autoplay with reduced motion or Save-Data, pause off screen
  each('.bs-hero-video video', function (v) {
    var b = d.createElement('button'), userPaused = false, autoPaused = false;
    b.type = 'button';
    b.className = 'bs-video-toggle';
    function label() {
      b.textContent = v.paused ? 'Play background video' : 'Pause background video';
      b.setAttribute('data-state', v.paused ? 'paused' : 'playing');
    }
    b.addEventListener('click', function () {
      if (v.paused) { userPaused = false; playSafe(v); } else { userPaused = true; v.pause(); }
    });
    v.addEventListener('play', label);
    v.addEventListener('pause', label);
    v.muted = true;
    (v.closest('.wp-block-cover') || v.parentNode).appendChild(b);
    label();
    if (reduce || saveData) { v.removeAttribute('autoplay'); v.pause(); } else { playSafe(v); }
    if (hasIO) new IntersectionObserver(function (es) {
      var e = es[0];
      if (e.intersectionRatio < 0.1) { if (!v.paused) { autoPaused = true; v.pause(); } }
      else if (autoPaused && !userPaused) { autoPaused = false; playSafe(v); }
    }, { threshold: [0, 0.1] }).observe(v);
  });

  // Reels: one plays at a time
  d.addEventListener('play', function (e) {
    if (!e.target.closest || !e.target.closest('.bs-reel')) return;
    each('.bs-reel video', function (o) { if (o !== e.target) o.pause(); });
  }, true);

  // YouTube facade: the player loads only on click (youtube-nocookie)
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.bs-yt');
    if (!a) return;
    e.preventDefault();
    var f = d.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + a.getAttribute('data-yt') + '?autoplay=1&rel=0';
    f.title = a.getAttribute('data-title') || 'YouTube video';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    f.setAttribute('allowfullscreen', '');
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    a.parentNode.replaceChild(f, a);
    f.focus();
  });

  // Review arrows work from the keyboard too
  d.addEventListener('keydown', function (e) {
    var t = e.target;
    if ((e.key === 'Enter' || e.key === ' ') && t.matches && t.matches('.ti-next, .ti-prev')) { e.preventDefault(); t.click(); }
  });
})();
