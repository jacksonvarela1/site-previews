/* Mortgage payment calculator for Brandon Still's site (child theme assets/js/bs-mortgage.js, enqueued with defer only
   on the Mortgage calculator page). Ported from the v5 preview's payment tool, restyled in his theme.
   Markup contract: a root [data-bs-calc=mortgage] holding a form with inputs [data-k=price|loan|rate|term|tax|ins|hoa],
   range sliders [data-for=price|rate], outputs [data-o=total|pi|tax|ins|hoa|verdict] and bar segments [data-seg].
   No down-payment input (a Regulation Z trigger term in ads): the loan amount follows the price until edited.
   No network calls, nothing stored, nothing sent. */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  function usd(n) { return '$' + nf.format(Math.round(n)); }
  function num(s) { var n = parseFloat(String(s).replace(/[^0-9.]/g, '')); return isFinite(n) ? n : 0; }
  function pmt(loan, ratePct, months) {
    if (loan <= 0 || months <= 0) return 0;
    var r = ratePct / 100 / 12;
    return r <= 0 ? loan / months : loan * r / (1 - Math.pow(1 + r, -months));
  }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  each(d.querySelectorAll('[data-bs-calc="mortgage"]'), function (root) {
    var form = root.querySelector('form');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); });
    var k = {};
    each(root.querySelectorAll('[data-k]'), function (el) { k[el.getAttribute('data-k')] = el; });
    var out = {};
    each(root.querySelectorAll('[data-o]'), function (el) { out[el.getAttribute('data-o')] = el; });
    var seg = {};
    each(root.querySelectorAll('[data-seg]'), function (el) { seg[el.getAttribute('data-seg')] = el; });
    var ranges = root.querySelectorAll('input[type=range][data-for]');
    var share = num(k.price.value) > 0 ? num(k.loan.value) / num(k.price.value) : 0.9;
    var loanEdited = false, queued = false, last = {};

    function set(name, text) {
      var el = out[name];
      if (!el || el.textContent === text) return;
      el.textContent = text;
      // a quick settle when a figure changes: a small rise with motion on, a fade under reduced motion
      if (name === 'total' && el.animate) {
        el.animate(reduce ? [{ opacity: 0.4 }, { opacity: 1 }] : [{ opacity: 0.4, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
          { duration: 220, easing: 'cubic-bezier(.2,.7,.2,1)' });
      }
    }
    function calc() {
      queued = false;
      var price = num(k.price.value), loan = num(k.loan.value), rate = num(k.rate.value), yrs = num(k.term.value) || 30;
      var tax = num(k.tax.value) / 12, ins = num(k.ins.value) / 12, hoa = num(k.hoa.value);
      var pi = pmt(loan, rate, yrs * 12), total = pi + tax + ins + hoa;
      set('total', usd(total));
      set('pi', usd(pi)); set('tax', usd(tax)); set('ins', usd(ins)); set('hoa', usd(hoa));
      var parts = { pi: pi, tax: tax, ins: ins, hoa: hoa };
      for (var p in seg) { seg[p].style.flexGrow = String(Math.max(0, parts[p] || 0)); seg[p].hidden = !(parts[p] > 0); }
      var v = price <= 0 && loan <= 0 ? 'Enter a home price to see a monthly payment.' :
        'With these numbers: about ' + usd(total) + ' a month, ' + usd(pi) + ' of it principal and interest.';
      if (last.v !== v) { last.v = v; set('verdict', v); }
    }
    function queue() { if (!queued) { queued = true; (w.requestAnimationFrame || setTimeout)(calc); } }
    function fmt(el) {
      if (el.tagName !== 'INPUT' || el.type === 'range') return;
      var dec = el.getAttribute('data-dec');
      var n = num(el.value);
      if (el.value.trim() === '') return;
      el.value = dec ? String(+n.toFixed(+dec)) : nf.format(Math.round(n));
    }
    function syncRange(name) {
      each(ranges, function (r) { if (r.getAttribute('data-for') === name) r.value = String(num(k[name].value)); });
    }
    each(root.querySelectorAll('[data-k]'), function (el) {
      var name = el.getAttribute('data-k');
      el.addEventListener('input', function () {
        if (name === 'loan') loanEdited = true;
        if (name === 'price' && !loanEdited) k.loan.value = nf.format(Math.round(num(el.value) * share));
        syncRange(name);
        queue();
      });
      el.addEventListener('change', queue);
      el.addEventListener('blur', function () { fmt(el); });
    });
    each(ranges, function (r) {
      r.addEventListener('input', function () {
        var name = r.getAttribute('data-for'), t = k[name];
        t.value = t.getAttribute('data-dec') ? String(+(+r.value).toFixed(+t.getAttribute('data-dec'))) : nf.format(+r.value);
        if (name === 'price' && !loanEdited) k.loan.value = nf.format(Math.round(+r.value * share));
        queue();
      });
    });
    root.setAttribute('data-ready', '1');
    calc();
  });
})();
