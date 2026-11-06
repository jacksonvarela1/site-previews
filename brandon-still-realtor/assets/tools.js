/* Brandon Still v4 calculators (tools.html and the two guides only; needs site.js first, both defer).
   Math, defaults, fine print and URL state are v3's, unchanged (guidelines P4). Markup contract: root [data-calc=buydown|mortgage|rental|deal]
   with an id; inputs [data-k]; outputs [data-o]; bars [data-bar]; stacked segments [data-seg]; sms link [data-sms-link]. */
(function(){
'use strict';
var B=window.BS;if(!B)return;
var d=document,$=B.$,$$=B.$$,RM=B.RM,qp=B.qp,msgSync=B.msgSync;
var usd=function(n){n=Math.round(n);return (n<0?'−':'')+'$'+Math.abs(n).toLocaleString('en-US')};
var money=function(n){return '$'+Math.round(n).toLocaleString('en-US')};
var pct=function(n){n=Math.round(n*10)/10;return (n<0?'−':'')+Math.abs(n).toFixed(1)+'%'};
var num=function(n){return String(+(+n).toFixed(3))};
var pmt=function(loan,r,n){n=n||360;r=r/100/12;if(loan<=0)return 0;if(r<=0)return loan/n;return loan*r/(1-Math.pow(1+r,-n))};
var CALC={
  buydown:function(g,o){
    var price=g('price'),down=g('down')/100,rate=g('rate'),credit=g('credit'),per=g('pt')||.25;
    var loan=price*(1-down),base=pmt(loan,rate),cut=base-pmt(Math.max(0,(price-credit)*(1-down)),rate);
    var pts=loan>0?credit/(loan*.01):0,nr=Math.max(0,rate-pts*per),buy=base-pmt(loan,nr),win=buy>=cut,max=Math.max(cut,buy,1);
    var ratio=Math.min(cut,buy)>0?Math.max(cut,buy)/Math.min(cut,buy):0;
    o.t('cut',usd(cut));o.t('buy',usd(buy));o.t('newrate',nr.toFixed(2)+'%');
    o.bar('cut',cut/max,!win);o.bar('buy',buy/max,win);
    o.t('verdict',credit<=0?'Enter a seller credit to compare.':(win?'The buydown wins: ':'The price cut wins: ')+'about '+(ratio?ratio.toFixed(1)+' times ':'')+'as much saved each month. A '+usd(credit)+' buydown takes the rate from '+rate.toFixed(2)+'% to about '+nr.toFixed(2)+'%.');
    o.sms('Hi Brandon, '+money(price)+' at '+num(rate)+'% with '+num(down*100)+'% down: '+(credit<=0?'can we compare a price cut and a rate buydown':win?'a '+money(credit)+' credit saves about '+money(buy)+'/mo vs '+money(cut)+'/mo for a price cut':'a '+money(credit)+' price cut saves about '+money(cut)+'/mo vs '+money(buy)+'/mo for a rate buydown')+'. Can we talk?');
  },
  mortgage:function(g,o){
    var price=g('price'),down=g('down')/100,rate=g('rate'),yrs=g('term')||30,tax=g('tax')/12,ins=g('ins')/12,hoa=g('hoa');
    var loan=price*(1-down),pi=pmt(loan,rate,yrs*12),tot=pi+tax+ins+hoa;
    o.t('total',usd(tot));o.t('pi',usd(pi));o.t('tax',usd(tax));o.t('ins',usd(ins));o.t('hoa',usd(hoa));o.t('loan',money(loan));
    o.seg({pi:pi,tax:tax,ins:ins,hoa:hoa});
    o.t('verdict',price<=0?'Enter a price to see the payment.':'About '+usd(tot)+' a month. '+usd(pi)+' of it is principal and interest on a '+money(loan)+' loan over '+yrs+' years.');
    o.sms('Hi Brandon, a '+money(price)+' home with '+num(down*100)+'% down at '+num(rate)+'% for '+yrs+' years: about '+money(tot)+'/mo with taxes, insurance and HOA ('+money(pi)+' principal and interest). Can we talk?');
  },
  rental:function(g,o){
    var hh=g('hh')===1,price=g('price'),down=g('down')/100,rate=g('rate'),rent=g('rent'),fixed=g('tax'),vr=g('exp')/100;
    var noi=rent-fixed-rent*vr,pi=pmt(price*(1-down),rate),cf=noi-pi,cash=price*down+price*.03;
    var cap=price>0?noi*12/price*100:0,coc=cash>0?cf*12/cash*100:0;
    o.l('rent',hh?'Rent from the other unit(s)':'Total monthly rent');o.l('cf',hh?'Your monthly cost to live there':'Monthly cash flow');
    o.t('cf',hh?usd(Math.max(0,-cf)):usd(cf));o.t('cap',pct(cap));o.t('coc',pct(coc));o.t('dscr',pi>0?(noi/pi).toFixed(2):'n/a');
    o.part('kpis',!hh);o.part('solve',!hh);o.part('quote',!hh&&rent>0&&cf<100);
    o.t('verdict',hh?(rent<=0?'Enter the rent from the other unit(s).':cf>=0?'The other unit covers the whole payment, with about '+usd(cf)+' a month left over.':'Rent from the other unit covers about '+Math.round(rent/(rent-cf)*100)+'% of your monthly costs.'):
      rent<=0?'Enter the rent to see the numbers.':cf<0?'This one costs about '+usd(-cf)+' a month to hold. A bigger down payment, a lower price or higher rents would change that.':cf<100?'Roughly break-even. The return here comes from paying down the loan and appreciation, not monthly cash.':'Cash-flow positive at about '+usd(cf)+' a month before any surprises.');
    var want=g('goal'),need=noi-want,r=rate/100/12,fac=r>0?(1-Math.pow(1+r,-360))/r:360,P=down<1?need*fac/(1-down):0;
    o.t('solve',rent<=0?'enter the rent above first':cf>=want?'you’re already there at this price':need<=0||down>=1?'this rent won’t get there at any price':'you’d need a price near '+money(Math.round(P/5000)*5000));
    o.sms(hh?'Hi Brandon, a '+money(price)+' house hack at '+num(rate)+'% with '+num(down*100)+'% down, living in one unit with '+money(rent)+'/mo rent from the other: '+(cf>=0?'the rent covers it with about '+usd(cf)+'/mo left over':'about '+usd(-cf)+'/mo to live there')+'. Can we talk?':
      'Hi Brandon, a '+money(price)+' rental at '+num(rate)+'% with '+num(down*100)+'% down and '+money(rent)+'/mo rent: about '+usd(cf)+'/mo cash flow, a '+pct(cap)+' cap rate. Can we talk?');
  },
  /* deal check: Brandon's "numbers that matter" (his WP investing guide): every expense line, NOI, cap rate, cash flow, cash-on-cash, DSCR */
  deal:function(g,o){
    var price=g('price'),rent=g('rent'),down=g('down')/100,rate=g('rate'),tax=g('tax')/12,ins=g('ins')/12;
    var opx=rent*(g('vac')+g('rep')+g('capx')+g('mgmt'))/100+tax+ins,noi=rent-opx,debt=pmt(price*(1-down),rate),cf=noi-debt;
    var cash=price*down+g('close')+g('rehab'),cap=price>0?noi*12/price*100:0,coc=cash>0?cf*12/cash*100:0,dscr=debt>0?noi/debt:0;
    o.t('cf',usd(cf));o.t('noi',usd(noi*12));o.t('cap',pct(cap));o.t('coc',pct(coc));o.t('dscr',debt>0?dscr.toFixed(2):'n/a');
    o.t('opx',usd(opx));o.t('debt',usd(debt));o.t('cfl',usd(cf));o.t('cash',money(cash));
    o.seg({debt:debt,opx:opx,cf:cf});
    o.t('verdict',rent<=0?'Enter the rent to see the numbers.':(cf<0?'After every expense line, this one costs about '+usd(-cf)+' a month to hold.':cf<100?'After every expense line, this one roughly breaks even.':'After every expense line, about '+usd(cf)+' a month of cash flow.')+(debt>0?' A DSCR of '+dscr.toFixed(2)+(dscr>=1.2?' clears':' is under')+' the 1.2 many investment lenders want.':''));
    o.sms('Hi Brandon, a '+money(price)+' rental with '+money(rent)+'/mo rent, '+num(down*100)+'% down at '+num(rate)+'%: about '+usd(cf)+'/mo cash flow after every expense, a '+pct(cap)+' cap rate and a '+(debt>0?dscr.toFixed(2):'n/a')+' DSCR. Can we talk?');
  }
};
var parse=function(el){if(el.type==='checkbox')return el.checked?1:0;var v=parseFloat(String(el.value).replace(/[^0-9.]/g,''));return isFinite(v)?v:0};
var fmt=function(el){if(el.tagName!=='INPUT'||el.type!=='text'||String(el.value).trim()==='')return;el.value=parse(el).toLocaleString('en-US',{maximumFractionDigits:+(el.dataset.dec||0)})};
$$('[data-calc]').forEach(function(root){
  var kind=root.dataset.calc,fn=CALC[kind];if(!fn)return;
  var F={};$$('[data-k]',root).forEach(function(el){F[el.dataset.k]=el});
  if(qp.get('calc')===root.id){Object.keys(F).forEach(function(k){var v=qp.get(k),el=F[k];if(v===null||!/^-?\d*\.?\d+$/.test(v))return;if(el.type==='checkbox')el.checked=v==='1';else{el.value=v;fmt(el)}})}
  var g=function(k){return F[k]?parse(F[k]):0};
  var O=function(k){return $('[data-o="'+k+'"]',root)};
  var o={
    t:function(k,v){var e=O(k);if(e)e.textContent=v},
    l:function(k,v){var e=$('[data-l="'+k+'"]',root);if(e)e.textContent=v},
    bar:function(k,f,win){var e=$('[data-bar="'+k+'"]',root);if(e){e.style.transform='scaleX('+Math.max(0,f).toFixed(4)+')';e.classList.toggle('win',!!win)}},
    seg:function(m){Object.keys(m).forEach(function(k){var e=$('[data-seg="'+k+'"]',root);if(e){e.style.flexGrow=Math.max(0,m[k]).toFixed(2);e.hidden=m[k]<=0}})},
    part:function(k,on){var e=$('[data-part="'+k+'"]',root);if(e)e.hidden=!on},
    sms:function(t){var a=$('[data-sms-link]',root);if(a){a.dataset.sms=t;msgSync(a)}}
  };
  var run=function(){fn(g,o,root)};
  var sync=function(k){var rg=$('.range[data-for="'+k+'"]',root);if(rg){rg.value=Math.min(+rg.max,Math.max(+rg.min,g(k)));rg.setAttribute('aria-valuetext',/rate/.test(k)?rg.value+'%':'$'+(+rg.value).toLocaleString('en-US'))}};
  Object.keys(F).forEach(function(k){var el=F[k];
    el.addEventListener(el.tagName==='SELECT'||el.type==='checkbox'?'change':'input',function(){sync(k);run()});
    el.addEventListener('blur',function(){fmt(el)});sync(k);
  });
  $$('.range[data-for]',root).forEach(function(rg){rg.addEventListener('input',function(){var el=F[rg.dataset.for];if(el){el.value=(+rg.value).toLocaleString('en-US',{maximumFractionDigits:2});run()}})});
  $$('.ins',root).forEach(function(i){i.addEventListener('click',function(e){var inp=$('input',i);if(e.target!==inp)inp.focus()})});
  if(kind==='rental'&&F.hh)F.hh.addEventListener('change',function(){var r=F.rent,cur=g('rent'),a=F.hh.checked?2900:1450,b=F.hh.checked?1450:2900;if(r&&cur===a){r.value=b.toLocaleString('en-US');sync('rent');run()}});
  var cp=$('[data-copy-link]',root),note=$('.copied',root);
  cp&&cp.addEventListener('click',function(){
    var q=new URLSearchParams();q.set('calc',root.id);Object.keys(F).forEach(function(k){q.set(k,F[k].type==='checkbox'?(F[k].checked?'1':'0'):num(g(k)))});
    var url=location.origin+location.pathname+'?'+q+'#'+root.id;try{history.replaceState(null,'',url)}catch(e){}
    var done=function(ok){if(note){note.textContent=ok?'Link copied':'Link is in the address bar';setTimeout(function(){note.textContent=''},2400)}};
    navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(url).then(function(){done(true)},function(){done(false)}):done(false);
  });
  root._set=function(vals){Object.keys(vals).forEach(function(k){if(F[k]){F[k].value=vals[k];fmt(F[k]);sync(k)}});run()};
  run();
});
/* presets, e.g. the seller-credit case study: <button data-preset="#buydown-home" data-values='{"price":475000,"credit":10000}' data-focus="rate"> */
$$('[data-preset]').forEach(function(b){b.addEventListener('click',function(){var r=$(b.dataset.preset);if(!r||!r._set)return;try{r._set(JSON.parse(b.dataset.values||'{}'))}catch(e){}
  var f=b.dataset.focus&&$('[data-k="'+b.dataset.focus+'"]',r);r.scrollIntoView({behavior:RM.matches?'auto':'smooth',block:'start'});f&&setTimeout(function(){f.focus({preventScroll:true});f.select&&f.select()},RM.matches?0:400)})});
})();
