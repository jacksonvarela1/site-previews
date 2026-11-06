/* Preview layer for the static copy of Brandon's WordPress site. Nothing here sends data anywhere. */
(function () {
  'use strict';
  var NOTE = 'This is a preview: this form does not send anything.';
  var SEARCH_NOTE = 'This is a preview: home search runs through Lofty IDX on the WordPress site.';

  function noteAfter(el, text) {
    var n = el.nextElementSibling;
    if (!n || !n.classList || !n.classList.contains('bs-preview-note')) {
      n = document.createElement('p');
      n.className = 'bs-preview-note';
      n.setAttribute('role', 'status');
      n.textContent = text;
      el.parentNode.insertBefore(n, el.nextSibling);
    }
    n.classList.add('is-flash');
    setTimeout(function () { n.classList.remove('is-flash'); }, 1600);
  }

  // forms never submit in the preview
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f && f.tagName === 'FORM') { e.preventDefault(); noteAfter(f, NOTE); }
  }, true);
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-preview-submit]');
    if (b) { e.preventDefault(); var f = b.closest('form'); if (f) noteAfter(f, NOTE); return; }
    var s = e.target.closest && e.target.closest('.lofty-search-btn');
    if (s) { e.preventDefault(); var w = s.closest('.lofty-widget-quick-search-container') || s; noteAfter(w, SEARCH_NOTE); }
  }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var i = e.target.closest && e.target.closest('.lofty-widget-quick-search-container input');
    if (i) { e.preventDefault(); noteAfter(i.closest('.lofty-widget-quick-search-container'), SEARCH_NOTE); }
  }, true);

  // Trustindex reviews: the same slider layout his page gets from the Trustindex loader, done locally
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ago(sec, loc) {
    var p = (loc || '%d %s ago|today|day|days|week|weeks|month|months|year|years').split('|');
    var d = Math.floor((Date.now() / 1000 - sec) / 86400);
    if (d < 1) return p[1];
    var n, u;
    if (d < 7) { n = d; u = n === 1 ? p[2] : p[3]; }
    else if (d < 30) { n = Math.floor(d / 7); u = n === 1 ? p[4] : p[5]; }
    else if (d < 365) { n = Math.floor(d / 30); u = n === 1 ? p[6] : p[7]; }
    else { n = Math.floor(d / 365); u = n === 1 ? p[8] : p[9]; }
    return p[0].replace('%d', n).replace('%s', u);
  }
  function setup(w) {
    var box = w.querySelector('.ti-widget-container');
    var wrap = w.querySelector('.ti-reviews-container-wrapper');
    if (!box || !wrap) return;
    var items = [].slice.call(wrap.querySelectorAll('.ti-review-item'));
    var target = parseInt(w.getAttribute('data-review-target-width') || '300', 10);
    var maxCols = 3, m = /ti-col-(\d+)/.exec(box.className); if (m) maxCols = parseInt(m[1], 10);
    items.forEach(function (it) {
      var t = parseInt(it.getAttribute('data-time') || '0', 10), d = it.querySelector('.ti-date');
      if (t && d && !d.textContent.trim()) d.textContent = ago(t, w.getAttribute('data-time-locale'));
      var rm = it.querySelector('.ti-read-more'), tx = it.querySelector('.ti-review-text-container');
      if (rm && tx && !rm.firstChild) {
        var s = document.createElement('span'); s.textContent = rm.getAttribute('data-open-text') || 'Read more';
        s.setAttribute('role', 'button'); s.tabIndex = 0;
        var toggle = function () {
          var o = it.classList.toggle('ti-open');
          if (o) { tx.textContent = tx.getAttribute('data-full') || tx.textContent; } else { clampText(tx); }
          s.textContent = o ? (rm.getAttribute('data-collapse-text') || 'Hide') : (rm.getAttribute('data-open-text') || 'Read more');
        };
        s.addEventListener('click', toggle);
        s.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
        rm.appendChild(s);
      }
    });
    // like the Trustindex loader: cut the text at four lines on a word and add "..."
    function clampText(t) {
      var full = t.getAttribute('data-full');
      if (!full) { full = t.textContent.replace(/\s+/g, ' ').trim(); t.setAttribute('data-full', full); }
      t.textContent = full;
      if (t.scrollHeight <= t.clientHeight + 2) return false;
      var words = full.split(' '), lo = 0, hi = words.length;
      while (lo < hi) { var mid = (lo + hi + 1) >> 1; t.textContent = words.slice(0, mid).join(' ') + '...'; if (t.scrollHeight <= t.clientHeight + 2) lo = mid; else hi = mid - 1; }
      t.textContent = words.slice(0, lo).join(' ') + '...';
      return true;
    }
    var idx = 0, cols = 1, line = w.querySelector('.ti-controls-line'), dot = line && line.querySelector('.dot');
    if (line && !dot) { dot = document.createElement('div'); dot.className = 'dot'; line.appendChild(dot); }
    function layout() {
      cols = Math.max(1, Math.min(maxCols, Math.floor(wrap.clientWidth / target) || 1));
      box.className = box.className.replace(/ti-col-\d+/, 'ti-col-' + cols);
      items.forEach(function (it) {
        var t = it.querySelector('.ti-review-text-container'), rm = it.querySelector('.ti-read-more');
        if (t && rm && !it.classList.contains('ti-open')) rm.style.visibility = clampText(t) ? '' : 'hidden';
      });
      go(Math.min(idx, Math.max(0, items.length - cols)));
    }
    function go(i) {
      var last = Math.max(0, items.length - cols);
      idx = i > last ? 0 : (i < 0 ? last : i);
      items.forEach(function (it) { it.style.transform = idx ? 'translateX(' + (-idx * 100) + '%)' : ''; });
      if (dot) { dot.style.width = (cols / items.length * 100) + '%'; dot.style.left = (idx / items.length * 100) + '%'; }
      if (pv) pv.style.visibility = idx > 0 ? '' : 'hidden';
      if (n) n.style.visibility = idx < last ? '' : 'hidden';
    }
    var n = w.querySelector('.ti-next'), pv = w.querySelector('.ti-prev');
    if (n) n.addEventListener('click', function () { go(idx + 1); });
    if (pv) pv.addEventListener('click', function () { go(idx - 1); });
    var timer = null, sec = parseInt(w.getAttribute('data-pager-autoplay-timeout') || '0', 10);
    function play() { if (!reduce && sec > 0 && !timer) timer = setInterval(function () { go(idx + 1); }, sec * 1000); }
    function stop() { clearInterval(timer); timer = null; }
    w.addEventListener('mouseenter', stop); w.addEventListener('mouseleave', play);
    w.addEventListener('focusin', stop); w.addEventListener('focusout', play);
    window.addEventListener('resize', layout);
    layout(); play();
  }
  function init() { [].forEach.call(document.querySelectorAll('.ti-widget.ti-static'), setup); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
