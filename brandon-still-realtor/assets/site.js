/* Brandon Still v3 shared behavior. Vanilla, no trackers, no scroll listeners (IntersectionObserver only).
   Modules: menu, header state, bottom bar, reveals, hero video, reels, podcast, map, calculators, texting, form. */
(function(){
'use strict';
var d=document,de=d.documentElement,W=window;
var $=function(s,c){return (c||d).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))};
var mq=function(q){return W.matchMedia(q)};
var RM=mq('(prefers-reduced-motion: reduce)'),fine=mq('(hover: hover) and (pointer: fine)');
var IO='IntersectionObserver' in W;
var io=function(fn,opt){return IO?new IntersectionObserver(fn,opt):null};
clearTimeout(W.__mf);

/* menu sheet: aria-expanded, Escape, focus trap, focus return */
var mb=$('.menu-btn'),sheet=mb&&d.getElementById(mb.getAttribute('aria-controls'));
if(mb&&sheet){
  var open=function(on){mb.setAttribute('aria-expanded',on?'true':'false');mb.setAttribute('aria-label',on?'Close menu':'Open menu');sheet.classList.toggle('is-open',on);if(on){var f=$('a,button',sheet);f&&f.focus()}else mb.focus()};
  mb.addEventListener('click',function(){open(mb.getAttribute('aria-expanded')!=='true')});
  d.addEventListener('keydown',function(e){
    if(mb.getAttribute('aria-expanded')!=='true')return;
    if(e.key==='Escape'){open(false);return}
    if(e.key==='Tab'){var f=$$('a,button,input,select',sheet).concat([mb]),i=f.indexOf(d.activeElement);
      if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}}
  });
  $$('a',sheet).forEach(function(a){a.addEventListener('click',function(){if(a.hash&&a.pathname===location.pathname)open(false)})});
}

/* header over the home hero turns solid when the hero sentinel leaves view */
var hdr=$('.site-hdr.is-over'),sent=$('.hero-sentinel');
if(hdr&&sent&&IO)io(function(es){var e=es[0];hdr.classList.toggle('is-solid',!e.isIntersecting&&e.boundingClientRect.top<80)},{rootMargin:'-72px 0px 0px 0px'}).observe(sent);

/* bottom bar: on home it waits for the hero buttons to leave view; hides while typing and while the direct lines show */
var bar=$('.act-bar');
if(bar){
  var away={hero:false,form:false,direct:false},upd=function(){bar.classList.toggle('is-away',away.hero||away.form||away.direct)};
  var hb=$('[data-bar-after]');
  if(hb&&IO){away.hero=true;upd();io(function(es){away.hero=es[0].isIntersecting||es[0].boundingClientRect.top>0;upd()}).observe(hb)}
  var dl=$$('.direct');if(dl.length&&IO){var o=io(function(es){es.forEach(function(e){e.target._v=e.isIntersecting});away.direct=dl.some(function(x){return x._v});upd()});dl.forEach(function(x){o.observe(x)})}
  d.addEventListener('focusin',function(e){if(e.target.matches&&e.target.matches('input,select,textarea')){away.form=true;upd()}});
  d.addEventListener('focusout',function(){away.form=false;upd()});
}

/* reveals: [data-reveal] groups (media and cards only) and one .curtain per page */
var motion=de.classList.contains('motion-ok')&&!de.classList.contains('motion-done');
$$('[data-reveal]').forEach(function(g){Array.prototype.slice.call(g.children,0,4).forEach(function(c,i){c.style.setProperty('--i',i)})});
if(motion&&IO){
  var ro=io(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');ro.unobserve(e.target)}})},{threshold:.15,rootMargin:'0px 0px -10% 0px'});
  $$('[data-reveal],.curtain').forEach(function(el){ro.observe(el)});
}else $$('[data-reveal],.curtain').forEach(function(el){el.classList.add('is-in')});
d.addEventListener('focusin',function(e){var g=e.target.closest&&e.target.closest('[data-reveal]');g&&g.classList.add('is-in')});

/* hero video: src after load; skipped on reduced motion, saveData and 2g/3g (poster stays) */
var hero=$('.hero'),hv=hero&&$('.hero-media video',hero),hp=hero&&$('.hero-pause',hero);
if(hv){
  var c=navigator.connection||{},slow=c.saveData||/(^|-)(2g|3g)$/.test(c.effectiveType||'');
  var setBtn=function(paused){if(!hp)return;hp.dataset.state=paused?'paused':'playing';hp.setAttribute('aria-label',paused?'Play background video':'Pause background video')};
  var start=function(){if(!hv.src){hv.src=mq('(min-width: 768px)').matches?hv.dataset.src:hv.dataset.srcSm}var p=hv.play();p&&p.catch&&p.catch(function(){setBtn(true)});setBtn(false)};
  hv.addEventListener('playing',function(){hv.classList.add('is-on')});
  if(RM.matches||slow)setBtn(true);else if(d.readyState==='complete')start();else W.addEventListener('load',start);
  hp&&hp.addEventListener('click',function(){if(hv.paused){hv._user=0;start()}else{hv._user=1;hv.pause();setBtn(true)}});
  IO&&io(function(es){if(!hv.src)return;if(es[0].isIntersecting){if(!hv._user&&!RM.matches)hv.play().catch(function(){})}else hv.pause()}).observe(hero);
}

/* reels: native video with sound on press; one at a time; pause when out of view */
var reels=$$('.reel');
var stopOthers=function(keep){$$('video').forEach(function(v){if(v!==keep&&!v.closest('.hero')&&!v.paused)v.pause()})};
reels.forEach(function(r){
  var v=$('video',r),b=$('.reel-play',r);if(!v)return;
  v.removeAttribute('controls');
  var go=function(){r.classList.add('is-started');v.setAttribute('controls','');stopOthers(v);var p=v.play();p&&p.catch&&p.catch(function(){})};
  b&&b.addEventListener('click',go);
  v.addEventListener('play',function(){stopOthers(v);r.classList.add('is-playing')});
  v.addEventListener('pause',function(){r.classList.remove('is-playing')});
});
if(reels.length&&IO){var vo=io(function(es){es.forEach(function(e){if(!e.isIntersecting){var v=$('video',e.target);v&&!v.paused&&v.pause()}})},{threshold:.2});reels.forEach(function(r){vo.observe(r)})}

/* podcast: facade (no YouTube request before the click), episode rows swap the player */
$$('.pod-player').forEach(function(p){
  var face=$('.pod-facade',p);
  var load=function(){var f=d.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+p.dataset.yt+'?autoplay=1&rel=0';f.title=p.dataset.title||'NWA Investing episode';f.allow='autoplay; encrypted-media; picture-in-picture';f.allowFullscreen=true;f.loading='lazy';face.hidden=true;p.appendChild(f)};
  face&&face.addEventListener('click',load);
  var cap=p.dataset.cap&&d.getElementById(p.dataset.cap);
  $$('[data-play-in="'+p.id+'"]').forEach(function(row,_,all){
    row.addEventListener('click',function(){
      var f=$('iframe',p);f&&f.remove();face.hidden=false;
      p.dataset.yt=row.dataset.yt;p.dataset.title='NWA Investing, Ep. '+row.dataset.n;
      var img=$('img',face);if(img&&row.dataset.thumb){img.src=row.dataset.thumb}
      var fn=$('[data-face="n"]',face),ft=$('[data-face="t"]',face),rt=$('.ep-t',row);if(fn)fn.textContent='Ep. '+row.dataset.n;if(ft&&rt)ft.textContent=rt.textContent;
      face.setAttribute('aria-label','Play episode '+row.dataset.n+' of NWA Investing (loads YouTube)');
      if(cap){var t=$('.ep-t',row);cap.querySelector('[data-cap="n"]').textContent='Ep. '+row.dataset.n;cap.querySelector('[data-cap="t"]').textContent=t?t.textContent:'';cap.querySelector('[data-cap="d"]').textContent=row.dataset.date||'';var yl=cap.querySelector('[data-cap="yt"]');if(yl)yl.href='https://www.youtube.com/watch?v='+row.dataset.yt}
      all.forEach(function(x){x.setAttribute('aria-pressed',x===row?'true':'false')});
    });
  });
});

/* map: dots and list rows share data-town; hover or focus lights both; fine pointers get the docked preview card */
$$('.map-mod').forEach(function(m){
  var card=$('.map-card',m),def=card&&card.innerHTML;
  var hot=function(slug,on){$$('[data-town="'+slug+'"]',m).forEach(function(x){x.classList.toggle('is-hot',on)});
    var a=$('.town[data-town="'+slug+'"]',m);
    if(card&&a&&on){card.innerHTML='<p class="h3s"></p><p class="meta"></p><p class="small"></p><p class="small"></p>';var ps=$$('p',card);ps[0].textContent=a.dataset.name;ps[1].textContent=a.dataset.county+' County';ps[2].textContent=a.dataset.line||'';ps[3].textContent=a.dataset.page?'Open the '+a.dataset.name+' guide':''}
    else if(card&&!on)card.innerHTML=def};
  $$('[data-town]',m).forEach(function(el){var s=el.dataset.town;
    ['mouseenter','focusin'].forEach(function(t){el.addEventListener(t,function(){hot(s,true)})});
    ['mouseleave','focusout'].forEach(function(t){el.addEventListener(t,function(){hot(s,false)})});
  });
  var f=m.dataset.focus;if(f){var t=$('.town[data-town="'+f+'"]',m);t&&t.classList.add('is-current')}
});

/* texting: sms: on phones; on a desktop (fine pointer) the same words go out as an email, since sms: does little there */
var MAIL='brandonstillnwa@gmail.com',PH='+14792362900';
var msgSync=function(a){var body=a.dataset.sms||'',desk=fine.matches;
  a.href=desk?'mailto:'+MAIL+'?subject='+encodeURIComponent(a.dataset.subj||'Hello from your website')+'&body='+encodeURIComponent(body):'sms:'+PH+'?&body='+encodeURIComponent(body);
  var lab=$('.lab',a)||a;if(!a._t)a._t=lab.textContent;lab.textContent=desk&&a.dataset.mail?a.dataset.mail:a._t};
var msgAll=function(){$$('a[data-sms]').forEach(msgSync)};msgAll();
fine.addEventListener&&fine.addEventListener('change',msgAll);

/* calculators. Markup contract: root [data-calc=buydown|mortgage|rental] with an id;
   inputs [data-k]; outputs [data-o]; bars [data-bar]; stacked segments [data-seg]; sms link [data-sms-link]. */
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
  rental:function(g,o,root){
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
var qp=new URLSearchParams(location.search);
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
/* presets, e.g. the seller-credit callout: <button data-preset="#buydown-home" data-values='{"price":475000,"credit":10000}' data-focus="rate"> */
$$('[data-preset]').forEach(function(b){b.addEventListener('click',function(){var r=$(b.dataset.preset);if(!r||!r._set)return;try{r._set(JSON.parse(b.dataset.values||'{}'))}catch(e){}
  var f=b.dataset.focus&&$('[data-k="'+b.dataset.focus+'"]',r);r.scrollIntoView({behavior:RM.matches?'auto':'smooth',block:'start'});f&&setTimeout(function(){f.focus({preventScroll:true});f.select&&f.select()},RM.matches?0:400)})});

/* lead form: ?goal= and ?town= prefill; name plus email or phone; the preview never sends */
var form=$('#lead-form');
if(form){
  var goal=form.elements.goal,msg=form.elements.message,sub=$('button[type="submit"]',form);
  try{var gq=qp.get('goal'),tq=qp.get('town');if(gq&&goal&&$('option[value="'+gq+'"]',goal))goal.value=gq;
    if(tq&&msg&&/^[a-z-]{2,30}$/.test(tq)){msg.value='About '+tq.split('-').map(function(w){return w.charAt(0).toUpperCase()+w.slice(1)}).join(' ')+': '}}catch(e){}
  if(sub)sub.disabled=false;
  form.addEventListener('submit',function(e){e.preventDefault();
    var E=form.elements,ok=true,err=function(n,t){var p=d.getElementById('e-'+n);if(p)p.textContent=t;if(t){ok=false;E[n].setAttribute('aria-invalid','true')}else E[n].removeAttribute('aria-invalid')};
    err('name',E.name.value.trim()?'':'Please add your name.');
    var em=E.email.value.trim(),ph=E.phone.value.replace(/\D/g,'');
    err('email',em&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)?'That email looks incomplete.':!em&&ph.length<10?'Add an email or a phone number so Brandon can reach you.':'');
    if(!ok){var bad=$('[aria-invalid="true"]',form);bad&&bad.focus();return}
    var s=$('.sent',form);if(s){s.hidden=false;s.focus&&s.focus()}
  });
}

/* scrollspy: <nav data-spy> holding links to on-page #ids (guide contents, tools chips). aria-current follows the section crossing
   a band near the top of the viewport; a sideways-scrolling chip row keeps the current chip in view. IntersectionObserver only. */
if(IO)$$('[data-spy]').forEach(function(nav){
  var links=$$('a[href^="#"]',nav).filter(function(a){return a.hash.length>1&&d.getElementById(a.hash.slice(1))});if(!links.length)return;
  var seen={},cur=null;
  var set=function(a){if(a===cur)return;cur=a;links.forEach(function(x){if(x===a)x.setAttribute('aria-current','true');else x.removeAttribute('aria-current')});
    var sc=a.offsetParent;if(sc&&nav.contains(sc)&&sc.scrollWidth>sc.clientWidth+1)sc.scrollTo({left:Math.max(0,a.offsetLeft-16),behavior:RM.matches?'auto':'smooth'})};
  var first=d.getElementById(links[0].hash.slice(1));
  var spy=io(function(es){es.forEach(function(e){seen[e.target.id]=e.isIntersecting});for(var i=0;i<links.length;i++){if(seen[links[i].hash.slice(1)]){set(links[i]);return}}
    /* nothing crosses the band: above the first section, the first link is current (QA fix D-m5) */
    if(first.getBoundingClientRect().top>W.innerHeight*.3)set(links[0])},{rootMargin:'-30% 0px -60% 0px'});
  links.forEach(function(a){spy.observe(d.getElementById(a.hash.slice(1)))});
});

/* footer notes: a link to #privacy or #sources opens that <details> before it scrolls (QA fix D-m12) */
var openNote=function(id){var t=id&&d.getElementById(id);if(t&&t.tagName==='DETAILS'){t.open=true;return t}};
d.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;var t=openNote(a.hash.slice(1));if(t){e.preventDefault();t.scrollIntoView({behavior:RM.matches?'auto':'smooth',block:'start'});$('summary',t).focus({preventScroll:true});try{history.replaceState(null,'',a.hash)}catch(x){}}});
W.addEventListener('hashchange',function(){openNote(location.hash.slice(1))});openNote(location.hash.slice(1));

/* episode filter (podcast.html): chips [data-f] inside [data-ep-filter="#list"]; items [data-tags]. Without JS every episode shows.
   With JS the "all" view shows the newest data-clip items plus a [data-more] button; a #ep-NN link opens the full list. */
$$('[data-ep-filter]').forEach(function(box){
  var sel=box.dataset.epFilter,list=$(sel);if(!list)return;
  var items=$$('[data-tags]',list),chips=$$('[data-f]',box),more=$('[data-more="'+sel+'"]'),count=$('[data-count]',box);
  var clip=+(list.dataset.clip||0),open=false,f='all';
  var hit=function(){var t=location.hash.length>1&&d.getElementById(location.hash.slice(1));return t&&items.indexOf(t)>-1?t:null};
  if(hit())open=true;
  var apply=function(){var n=0,shown=0;
    items.forEach(function(li){var on=f==='all'||(' '+li.dataset.tags+' ').indexOf(' '+f+' ')>-1;if(on)n++;var vis=on&&(f!=='all'||open||!clip||n<=clip);li.hidden=!vis;if(vis)shown++});
    if(more)more.hidden=!(f==='all'&&clip&&!open&&n>clip);
    chips.forEach(function(c){c.setAttribute('aria-pressed',c.dataset.f===f?'true':'false')});
    if(count){var lab=$('[data-f="'+f+'"]',box);count.textContent=f==='all'?(shown<n?'Showing the newest '+shown+' of '+n+' episodes.':'Showing all '+n+' episodes.'):n+(n===1?' episode':' episodes')+': '+(lab?lab.textContent:'')+'.'}};
  chips.forEach(function(c){c.addEventListener('click',function(){f=c.dataset.f;apply()})});
  more&&more.addEventListener('click',function(){var first=items.filter(function(li){return li.hidden})[0];open=true;apply();if(first){first.setAttribute('tabindex','-1');first.focus()}});
  W.addEventListener('hashchange',function(){var t=hit();if(t&&t.hidden){f='all';open=true;apply();t.scrollIntoView()}});
  apply();
});
})();
