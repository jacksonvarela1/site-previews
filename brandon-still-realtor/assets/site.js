/* Brandon Still v4 shared behavior (design-v4.md 5, 8, 9). Vanilla, no trackers, no scroll listeners, no rAF loops: IntersectionObserver only.
   Modules: menu, header state, bottom bar, photo fade, hero entrance, map, lightbox, reels, podcast and mini player, texting, form,
   scrollspy, footer notes, episode filter. Calculators live in tools.js (tools and the two guides only). */
(function(){
'use strict';
var d=document,de=d.documentElement,W=window;
var $=function(s,c){return (c||d).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))};
var mq=function(q){return W.matchMedia(q)};
var RM=mq('(prefers-reduced-motion: reduce)'),fine=mq('(hover: hover) and (pointer: fine)');
var IO='IntersectionObserver' in W;
var io=function(fn,opt){return IO?new IntersectionObserver(fn,opt):null};
var motion=de.classList.contains('motion-ok')&&!de.classList.contains('motion-done');
clearTimeout(W.__mf);
var qp=new URLSearchParams(location.search);
if(qp.has('capture')||qp.has('smoke'))de.classList.add('is-capture');  /* full-page captures render every content-visibility section */

/* menu sheet: aria-expanded, Escape, focus trap, focus return */
var mb=$('.menu-btn'),sheet=mb&&d.getElementById(mb.getAttribute('aria-controls'));
if(mb&&sheet){
  var open=function(on,quiet){mb.setAttribute('aria-expanded',on?'true':'false');mb.setAttribute('aria-label',on?'Close menu':'Open menu');sheet.classList.toggle('is-open',on);if(on){var f=$('a,button',sheet);f&&f.focus()}else if(!quiet)mb.focus()};
  mb.addEventListener('click',function(){open(mb.getAttribute('aria-expanded')!=='true')});
  d.addEventListener('keydown',function(e){
    if(mb.getAttribute('aria-expanded')!=='true')return;
    if(e.key==='Escape'){open(false);return}
    if(e.key==='Tab'){var f=$$('a,button,input,select',sheet).concat([mb]),i=f.indexOf(d.activeElement);
      if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}}
  });
  $$('a',sheet).forEach(function(a){a.addEventListener('click',function(){if(a.hash&&a.pathname===location.pathname)open(false,true)})});
}

/* header over the home hero turns solid once the hero has scrolled out from under it (the whole hero is observed, so a jump
   straight past it, an anchor link or a fast fling, still flips the state) */
var hdr=$('.site-hdr.is-over'),heroEl=$('.hero');  /* 72px is --hdr at 900+; no layout read during the entrance (F16) */
if(hdr&&heroEl&&IO)io(function(es){hdr.classList.toggle('is-solid',!es[0].isIntersecting)},{rootMargin:'-72px 0px 0px 0px'}).observe(heroEl);
if(hdr&&!IO)hdr.classList.add('is-solid');

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

/* photos: the dominant color shows first, the photo fades in once decoded (only under motion-ok; otherwise simply visible) */
$$('.ph img').forEach(function(im){var on=function(){im.classList.add('is-loaded')};if(im.complete&&im.naturalWidth)on();else{im.addEventListener('load',on,{once:true});im.addEventListener('error',on,{once:true})}});

/* hero entrance: the page's one authored moment, gated on the webfonts (600 ms budget, else the final state shows at once) */
var hero=$('.hero');
if(hero){
  if(motion){
    var hd=false,go=function(cls){if(hd)return;hd=true;
      hero.classList.add(cls);if(cls==='is-in')setTimeout(function(){hero.classList.add('is-done')},1500)};  /* layer hints end with the entrance */
    var ht=setTimeout(function(){go('is-static')},600);
    (d.fonts&&d.fonts.ready?d.fonts.ready:Promise.resolve()).then(function(){clearTimeout(ht);requestAnimationFrame(function(){go('is-in')})});
  }else hero.classList.add('is-static');
}

/* everything below the hero waits for an idle moment, so the entrance frames stay free (F16) */
var idle=W.requestIdleCallback?function(f){W.requestIdleCallback(f,{timeout:500})}:function(f){setTimeout(f,60)};
idle(function(){

/* map: dots and list rows share data-town; hover or focus lights both.
   The Atlas draws itself once when 30% of the map is visible. */
$$('.map-mod').forEach(function(m){
  var card=$('.map-card',m),def=card&&card.innerHTML,tm;
  var paint=function(slug){if(!card)return;clearTimeout(tm);card.classList.add('is-swap');
    tm=setTimeout(function(){
      var a=slug&&$('.town[data-town="'+slug+'"]',m);card.textContent='';
      if(!a){card.innerHTML=def}else{
        var add=function(c,t){if(!t)return;var p=d.createElement('p');p.className=c;p.textContent=t;card.appendChild(p)};
        var row=$('.town-row[data-town="'+slug+'"] .town-row-line',m);
        add('mc-t',a.dataset.name);add('mc-l',a.dataset.county+' County');if(a.dataset.line&&a.dataset.line!=='Town guide')add('mc-l',a.dataset.line);
        if(row)add('mc-l',row.textContent);if(a.dataset.page)add('mc-go','Open the '+a.dataset.name+' guide')}
      card.classList.remove('is-swap')},120)};
  var hot=function(slug,on){$$('[data-town="'+slug+'"]',m).forEach(function(x){x.classList.toggle('is-hot',on)});paint(on?slug:null)};
  $$('[data-town]',m).forEach(function(el){var s=el.dataset.town;
    ['mouseenter','focusin'].forEach(function(t){el.addEventListener(t,function(){hot(s,true)})});
    ['mouseleave','focusout'].forEach(function(t){el.addEventListener(t,function(){hot(s,false)})});
  });
  var f=m.dataset.focus;if(f){var t=$('.town[data-town="'+f+'"]',m);t&&t.classList.add('is-current')}
});
$$('.atlas').forEach(function(a){
  var settle=function(){a.classList.add('is-drawn');setTimeout(function(){a.classList.add('is-settled')},1200)};
  var fig=$('.map-fig',a)||a;
  if(!motion||!IO){a.classList.add('is-drawn','is-settled');return}
  var o=io(function(es){if(es[0].isIntersecting){o.disconnect();settle()}},{threshold:.3});o.observe(fig);
});

/* lightbox: one modal dialog for sold photos (with previous and next) and for reels (video plus transcript).
   Same-document view transition morphs the clicked image into the dialog where supported. */
var lb,lbItems=[],lbIdx=0,lbLast=null;
var lbBuild=function(){
  lb=d.createElement('dialog');lb.className='lb';lb.setAttribute('aria-label','Enlarged view');
  lb.innerHTML='<div class="lb-in"><div class="lb-media"></div><div class="lb-side"></div>'+
    '<button class="lb-btn lb-x" type="button" aria-label="Close"><svg class="ic" aria-hidden="true"><use href="#i-x"/></svg></button>'+
    '<button class="lb-btn lb-prev" type="button" aria-label="Previous home"><svg class="ic" aria-hidden="true"><use href="#i-caret-l"/></svg></button>'+
    '<button class="lb-btn lb-next" type="button" aria-label="Next home"><svg class="ic" aria-hidden="true"><use href="#i-caret-r"/></svg></button></div>';
  d.body.appendChild(lb);
  lb.addEventListener('click',function(e){if(e.target===lb||e.target.classList.contains('lb-in'))lb.close()});
  $('.lb-x',lb).addEventListener('click',function(){lb.close()});
  $('.lb-prev',lb).addEventListener('click',function(){lbShow(lbIdx-1)});
  $('.lb-next',lb).addEventListener('click',function(){lbShow(lbIdx+1)});
  lb.addEventListener('keydown',function(e){if(lbItems.length>1&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){e.preventDefault();lbShow(lbIdx+(e.key==='ArrowRight'?1:-1))}});
  lb.addEventListener('close',function(){var v=$('video',lb);v&&v.pause();$('.lb-media',lb).textContent='';lbLast&&lbLast.focus&&lbLast.focus()});
};
var lbShow=function(i){
  var n=lbItems.length;lbIdx=(i+n)%n;var it=lbItems[lbIdx],m=$('.lb-media',lb),s=$('.lb-side',lb);
  m.textContent='';s.textContent='';s.className='lb-side';$('.lb-in',lb).classList.toggle('is-reel',it.kind!=='photo');
  $('.lb-prev',lb).hidden=$('.lb-next',lb).hidden=n<2;
  if(it.kind==='photo'){
    var pic=$('picture',it.el).cloneNode(true);pic.removeAttribute('class');pic.removeAttribute('style');
    $$('source,img',pic).forEach(function(x){x.setAttribute('sizes','(min-width: 900px) calc(100vw - 560px), 100vw')});
    var im=$('img',pic);im.loading='eager';im.removeAttribute('class');im.style.opacity='1';m.appendChild(pic);
    s.appendChild($('.sold-txt',it.el).cloneNode(true));
  }else{
    var v=d.createElement('video');v.src=it.src;v.poster=it.poster;v.muted=true;v.playsInline=true;v.controls=true;v.preload='auto';v.width=540;v.height=960;
    v.setAttribute('aria-label',it.label||'Silent reel with on-screen captions');m.appendChild(v);
    s.classList.add('is-panel');
    ['.reel-title','.meta'].forEach(function(q){var x=$(q,it.el);x&&s.appendChild(x.cloneNode(true))});
    var tb=$('.transcript-body',it.el);tb&&s.appendChild(tb.cloneNode(true));
    var p=v.play();p&&p.catch&&p.catch(function(){});
  }
};
var lbOpen=function(items,i,trigger){
  if(!lb)lbBuild();lbItems=items;lbLast=trigger;
  var src=$('img',trigger);
  var run=function(){lbShow(i);if(!lb.open)lb.showModal();$('.lb-x',lb).focus({preventScroll:true})};
  if(d.startViewTransition&&motion&&!RM.matches&&src){
    src.style.viewTransitionName='lb-media';
    var vt=d.startViewTransition(function(){src.style.viewTransitionName='';run();var t=$('.lb-media img,.lb-media video',lb);if(!t)return;t.style.viewTransitionName='lb-media';
      return Promise.race([t.decode?t.decode().catch(function(){}):Promise.resolve(),new Promise(function(r){setTimeout(r,260)})])});
    vt.finished.finally(function(){var t=lb&&$('.lb-media img,.lb-media video',lb);t&&(t.style.viewTransitionName='')});
  }else run();
};
$$('[data-lb-group]').forEach(function(g){
  var els=$$('.sold',g);  /* only the homes the filter shows (homes.html) */
  els.forEach(function(el){var b=$('.sold-media',el);b&&b.addEventListener('click',function(){var vis=els.filter(function(x){return !x.hidden});
    lbOpen(vis.map(function(x){return {kind:'photo',el:x}}),Math.max(0,vis.indexOf(el)),b)})});
});
$$('a.reel-media[data-reel]').forEach(function(a){
  a.addEventListener('click',function(e){if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button)return;e.preventDefault();
    var r=a.closest('.reel'),im=$('img',a);lbOpen([{kind:'video',el:r,src:a.dataset.reel,poster:im?(im.currentSrc||im.src):'',label:a.getAttribute('aria-label')}],0,a)});
});

/* v3 reel cards on interior pages: native video in place; one at a time; pause when out of view */
var stopOthers=function(keep){$$('video').forEach(function(v){if(v!==keep&&!v.paused)v.pause()})};
var reels=$$('.reel').filter(function(r){return $('video',r)&&$('.reel-play',r)});
reels.forEach(function(r){
  var v=$('video',r),b=$('button.reel-play',r);v.removeAttribute('controls');
  var go=function(){r.classList.add('is-started');v.setAttribute('controls','');stopOthers(v);var p=v.play();p&&p.catch&&p.catch(function(){})};
  b&&b.addEventListener('click',go);
  v.addEventListener('play',function(){stopOthers(v);r.classList.add('is-playing')});
  v.addEventListener('pause',function(){r.classList.remove('is-playing')});
});
if(reels.length&&IO){var vo=io(function(es){es.forEach(function(e){if(!e.isIntersecting){var v=$('video',e.target);v&&!v.paused&&v.pause()}})},{threshold:.2});reels.forEach(function(r){vo.observe(r)})}

/* home film rail (F12): two round buttons step it one poster at a time; IntersectionObserver (no scroll listener) dims an end */
var rail=d.getElementById('reel-rail'),rb=$$('[data-rail]');
if(rail&&rb.length===2){
  var cards=$$('.reel',rail);
  rb.forEach(function(b){b.addEventListener('click',function(){var c=cards[0],w=c?c.getBoundingClientRect().width+24:300;rail.scrollBy({left:+b.dataset.rail*w,behavior:RM.matches?'auto':'smooth'})})});
  if(IO&&cards.length){rb[0].disabled=true;
    var ro=io(function(es){es.forEach(function(e){(e.target===cards[0]?rb[0]:rb[1]).disabled=e.intersectionRatio>.97})},{root:rail,threshold:[0,.5,.97,1]});ro.observe(cards[0]);ro.observe(cards[cards.length-1])}
}

/* podcast: no YouTube request before a press. Episode rows load into the page's player; a playing player docks to the corner
   when its box is under 30% visible (the iframe never moves in the DOM, only the wrapper's position changes). */
/* podcast.html: every episode line with a YouTube video gets a round play button for the page's main player
   (built here from the line's own link, so the 98-row list stays light; without JS the line keeps its links) */
if(d.getElementById('pod-main'))$$('.ep-line[id]').forEach(function(li){
  var a=$('a[href*="youtube.com/watch"]',li),m=a&&/v=([\w-]+)/.exec(a.href);if(!m||$('.ep-play',li))return;
  var n=li.id.slice(3),dt=/([A-Z][a-z]{2} \d{1,2}, \d{4})/.exec(li.textContent),b=d.createElement('button');
  b.type='button';b.className='ep-play';b.setAttribute('aria-pressed','false');b.setAttribute('aria-label','Play Ep. '+n+' in the player at the top of the page');
  b.dataset.playIn='pod-main';b.dataset.yt=m[1];b.dataset.n=n;b.dataset.date=dt?dt[1]:'';
  b.innerHTML='<span class="ep-go" aria-hidden="true"><svg class="ic"><use href="#i-play"/></svg></span>';li.appendChild(b)});
$$('.pod-player').forEach(function(p){
  var face=$('.pod-facade',p),slot=p.parentNode&&p.parentNode.classList.contains('player-slot')?p.parentNode:null;
  var cap=p.dataset.cap&&d.getElementById(p.dataset.cap),db=null,vis=1;
  var dock=function(){p.classList.toggle('is-docked',!!$('iframe',p)&&vis<.3)};
  var load=function(){if($('iframe',p))return;var f=d.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+p.dataset.yt+'?autoplay=1&rel=0';
    f.title=p.dataset.title||'NWA Investing episode';f.allow='autoplay; encrypted-media; picture-in-picture';f.allowFullscreen=true;face.hidden=true;p.appendChild(f);
    if(db)$('b',db).textContent='Ep. '+(p.dataset.n||'');dock()};
  var stop=function(){var f=$('iframe',p);f&&f.remove();face.hidden=false;p.classList.remove('is-docked')};
  face&&face.addEventListener('click',load);
  if(slot&&IO){
    db=d.createElement('div');db.className='dock-bar';
    db.innerHTML='<b></b><button type="button" class="dock-back">Back to the episode</button><button type="button" class="dock-x" aria-label="Close the player"><svg class="ic" aria-hidden="true"><use href="#i-x"/></svg></button>';
    p.insertBefore(db,p.firstChild);
    $('.dock-back',db).addEventListener('click',function(){slot.scrollIntoView({behavior:RM.matches?'auto':'smooth',block:'center'})});
    $('.dock-x',db).addEventListener('click',stop);
    io(function(es){vis=es[0].intersectionRatio;dock()},{threshold:[0,.3,.6]}).observe(slot);
  }
  $$('[data-play-in="'+p.id+'"]').forEach(function(row,_,all){
    row.addEventListener('click',function(){
      stop();p.dataset.yt=row.dataset.yt;p.dataset.n=row.dataset.n;p.dataset.title='NWA Investing, Ep. '+row.dataset.n;
      var rt=$('.ep-t',row)||$('.ep-t',row.closest('li')||row),fn=$('[data-face="n"]',face),ft=$('[data-face="t"]',face),fd=$('[data-face="d"]',face);
      if(fn)fn.textContent='Ep. '+row.dataset.n;if(ft&&rt)ft.textContent=rt.textContent;if(fd)fd.textContent=row.dataset.date||'';
      face.setAttribute('aria-label','Play episode '+row.dataset.n+' of NWA Investing (loads YouTube)');
      if(cap){var q=function(k){return cap.querySelector('[data-cap="'+k+'"]')};q('n')&&(q('n').textContent='Ep. '+row.dataset.n);q('t')&&(q('t').textContent=rt?rt.textContent:'');q('d')&&(q('d').textContent=row.dataset.date||'');var yl=q('yt');if(yl)yl.href='https://www.youtube.com/watch?v='+row.dataset.yt}
      all.forEach(function(x){x.setAttribute('aria-pressed',x===row?'true':'false')});
      if($('.ep-go',row))load();
    });
  });
});

});  /* end idle */

/* texting: sms: on phones; on a desktop (fine pointer) the same words go out as an email, since sms: does little there */
var MAIL='brandonstillnwa@gmail.com',PH='+14792362900';
var msgSync=function(a){var body=a.dataset.sms||'',desk=fine.matches;
  a.href=desk?'mailto:'+MAIL+'?subject='+encodeURIComponent(a.dataset.subj||'Hello from your website')+'&body='+encodeURIComponent(body):'sms:'+PH+'?&body='+encodeURIComponent(body);
  var lab=$('.lab',a)||a;if(!a._t)a._t=lab.textContent;lab.textContent=desk&&a.dataset.mail?a.dataset.mail:a._t};
var msgAll=function(){$$('a[data-sms]').forEach(msgSync)};msgAll();
fine.addEventListener&&fine.addEventListener('change',msgAll);

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

/* scrollspy: <nav data-spy> holding links to on-page #ids; aria-current follows the section crossing a band near the top */
if(IO)$$('[data-spy]').forEach(function(nav){
  var links=$$('a[href^="#"]',nav).filter(function(a){return a.hash.length>1&&d.getElementById(a.hash.slice(1))});if(!links.length)return;
  var seen={},cur=null;
  var set=function(a){if(a===cur)return;cur=a;links.forEach(function(x){if(x===a)x.setAttribute('aria-current','true');else x.removeAttribute('aria-current')});
    var sc=a.offsetParent;if(sc&&nav.contains(sc)&&sc.scrollWidth>sc.clientWidth+1)sc.scrollTo({left:Math.max(0,a.offsetLeft-16),behavior:RM.matches?'auto':'smooth'})};
  var first=d.getElementById(links[0].hash.slice(1));
  var spy=io(function(es){es.forEach(function(e){seen[e.target.id]=e.isIntersecting});for(var i=0;i<links.length;i++){if(seen[links[i].hash.slice(1)]){set(links[i]);return}}
    if(first.getBoundingClientRect().top>W.innerHeight*.3)set(links[0])},{rootMargin:'-30% 0px -60% 0px'});
  links.forEach(function(a){spy.observe(d.getElementById(a.hash.slice(1)))});
});

/* footer notes: a link to #privacy, #sources or #preview-notes opens that <details> before it scrolls */
var openNote=function(id){var t=id&&d.getElementById(id);if(t&&t.tagName==='DETAILS'){t.open=true;return t}};
d.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;var t=openNote(a.hash.slice(1));if(t){e.preventDefault();t.scrollIntoView({behavior:RM.matches?'auto':'smooth',block:'start'});$('summary',t).focus({preventScroll:true});try{history.replaceState(null,'',a.hash)}catch(x){}}});
W.addEventListener('hashchange',function(){openNote(location.hash.slice(1))});openNote(location.hash.slice(1));

/* episode filter (podcast.html): [data-f] buttons inside [data-ep-filter="#list"]; items [data-tags]. Without JS every episode shows. */
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

/* shared helpers for tools.js */
W.BS={$:$,$$:$$,RM:RM,qp:qp,msgSync:msgSync};
})();
