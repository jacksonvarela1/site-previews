(function(){
'use strict';
var d=document,de=d.documentElement,W=window,BS=W.BS=W.BS||{};
var $=function(s,c){return (c||d).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))};
var mq=function(q){return W.matchMedia(q)},fine=mq('(hover: hover) and (pointer: fine)'),RMQ=mq('(prefers-reduced-motion: reduce)');
var IO='IntersectionObserver' in W;
var M=BS.motion=function(){return de.dataset.motion==='on'};
var conn=navigator.connection||{};
var slowNet=function(){return !!conn.saveData||/(^|-)(2g|3g)$/.test(conn.effectiveType||'')};
BS.canAuto=function(){return M()&&!conn.saveData&&(!conn.effectiveType||conn.effectiveType==='4g')&&!d.hidden};
var SPRING='linear(0,.13 6%,.45 13%,.78 20%,.97 27%,1.04 34%,1.05 40%,1.03 48%,1.005 60%,.998 75%,1)',OUT='cubic-bezier(.23,1,.32,1)',IOE='cubic-bezier(.65,0,.35,1)';
try{if(!(W.CSS&&CSS.supports&&CSS.supports('transition-timing-function',SPRING)))SPRING=OUT}catch(e){SPRING=OUT}
var base=(d.currentScript&&d.currentScript.src||'').replace(/site\.js(\?.*)?$/,'');
BS.base=base;
var vy=W.scrollY,vt=performance.now(),vel=0,moved=0,held=[],ht=0,RV=BS.reveals={play:0,held:0,snap:0};
W.addEventListener('scroll',function(){var t=performance.now(),y=W.scrollY;if(t-vt>16){vel=Math.abs(y-vy)/(t-vt);vy=y;vt=t}moved=t},{passive:true});
var sample=function(){if(performance.now()-moved>120)vel=0;return vel};
var hio=IO&&new IntersectionObserver(function(es){es.forEach(function(e){e.target._iv=e.isIntersecting})});
var inView=function(el){if(hio)return el._iv!==false;var r=el.getBoundingClientRect();return r.bottom>0&&r.top<W.innerHeight};
var snap=function(el,fn,quick){RV.snap++;if(quick){quick(el);return}el.classList.add('is-snap');fn(el);requestAnimationFrame(function(){requestAnimationFrame(function(){el.classList.remove('is-snap')})})};
var unwatch=function(el){if(el&&hio)hio.unobserve(el)};
var unhold=function(){ht=0;var still=performance.now()-moved>240;held=held.filter(function(h){if(h[0]&&!inView(h[0])){unwatch(h[0]);snap(h[0],h[1],h[2]);return false}if(still){RV.play++;unwatch(h[0]);h[1](h[0]);return false}return true});if(held.length)ht=setTimeout(unhold,120)};
var reveal=BS.reveal=function(el,fn,quick){if(!M()||sample()<=1){RV.play++;fn(el);return}RV.held++;held.push([el,fn,quick]);if(el&&hio){el._iv=true;hio.observe(el)}if(!ht)ht=setTimeout(unhold,120)};
var whenStill=BS.whenStill=function(fn){if(sample()<=1&&performance.now()-moved>240){fn();return}held.push([null,fn]);if(!ht)ht=setTimeout(unhold,120)};
var once=function(els,fn,opt,gate){if(!els.length)return;if(!IO){els.forEach(fn);return}
var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){o.unobserve(e.target);if(gate)reveal(e.target,fn);else fn(e.target)}})},opt||{threshold:.25});els.forEach(function(el){o.observe(el)})};
var load=BS.load=function(src){return new Promise(function(ok,no){var s=d.createElement('script');s.src=base+src;s.onload=ok;s.onerror=no;d.head.appendChild(s)})};
de.classList.add('js-ready');
var dimg=$$('img[data-src],source[data-srcset]');
if(dimg.length){var relImg=function(){if(!dimg)return;dimg.forEach(function(x){if(x.dataset.srcset){x.srcset=x.dataset.srcset;x.removeAttribute('data-srcset')}if(x.dataset.src){x.src=x.dataset.src;x.removeAttribute('data-src')}});dimg=null};
if(de.classList.contains('is-capture'))relImg();
else{try{new PerformanceObserver(function(l,o){if(l.getEntries().some(function(e){return e.name==='first-contentful-paint'})){o.disconnect();setTimeout(relImg,0)}}).observe({type:'paint',buffered:true})}catch(e){}setTimeout(relImg,1500)}}
if(de.classList.contains('is-capture'))$$('img').forEach(function(i){i.loading='eager';i.decoding='sync'});
var toastEl,toastT;
BS.toast=function(msg){if(!toastEl){toastEl=d.createElement('p');toastEl.className='toast';toastEl.setAttribute('role','status');d.body.appendChild(toastEl)}
toastEl.innerHTML='';toastEl.append(msg,d.createElement('i'));toastEl.classList.remove('is-on');void toastEl.offsetWidth;toastEl.classList.add('is-on');
clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('is-on')},2600)};
var glide=BS.glide=function(row){var ind=$('.ind',row);if(!ind){ind=d.createElement('span');ind.className='ind';ind.setAttribute('aria-hidden','true');row.appendChild(ind);row.classList.add('has-ind')}
var cur=$('[aria-pressed="true"],[aria-current]',row);if(!cur){ind.style.opacity=0;return}
ind.style.opacity=1;ind.style.transform='translateX('+cur.offsetLeft+'px) scaleX('+(cur.offsetWidth/100)+')';ind.style.top=(cur.offsetTop+cur.offsetHeight-8)+'px';ind.style.bottom='auto'};
var setMotion=function(pref){
try{if(pref==='auto')localStorage.removeItem('bs-motion');else localStorage.setItem('bs-motion',pref)}catch(e){}
var was=M(),m=pref==='auto'?(RMQ.matches?'off':'on'):pref;
de.dataset.motionPref=pref;
if(m==='on'&&!was){var h=W.innerHeight;$$('.sh,.wl,.scard,.map-draw,[data-rise],.qr-box').forEach(function(el){if(el.getBoundingClientRect().top<h)el.classList.add('is-in')});$$('.wave').forEach(function(w){w.classList.add('is-grown')})}
de.dataset.motion=m;
$$('.motion-ctl').forEach(function(c){$$('[data-m]',c).forEach(function(b){b.setAttribute('aria-pressed',b.dataset.m===pref?'true':'false')});glide($('.toggles',c))});
d.dispatchEvent(new CustomEvent('bs:motion',{detail:m}));
};
var raf1=function(f){(W.requestAnimationFrame||setTimeout)(f)};
$$('.motion-ctl').forEach(function(c){var p=de.dataset.motionPref||'auto';$$('[data-m]',c).forEach(function(b){b.setAttribute('aria-pressed',b.dataset.m===p?'true':'false');b.addEventListener('click',function(){setMotion(b.dataset.m)})});raf1(function(){glide($('.toggles',c))})});
RMQ.addEventListener&&RMQ.addEventListener('change',function(){if((de.dataset.motionPref||'auto')==='auto')setMotion('auto')});
var hdr=$('.site-hdr.is-over'),sent=$('.meet-sent')||$('.hero-sentinel');
if(hdr&&sent&&IO)raf1(function(){var hh=hdr.offsetHeight||72;new IntersectionObserver(function(es){hdr.classList.toggle('is-solid',es[0].boundingClientRect.top<=hh)},{rootMargin:'-'+hh+'px 0px 0px 0px',threshold:[0,1]}).observe(sent)})
$$('.hdr-nav').forEach(function(nav){var ind=d.createElement('span');ind.className='nav-ind';ind.setAttribute('aria-hidden','true');nav.appendChild(ind);
$$('.nav-a',nav).forEach(function(a){a.addEventListener('pointerenter',function(){ind.style.transform='translateX('+a.offsetLeft+'px) scaleX('+(a.offsetWidth/100)+')';nav.classList.add('is-hov')})});
nav.addEventListener('pointerleave',function(){nav.classList.remove('is-hov')})});
var mb=$('.menu-btn'),sheet=mb&&d.getElementById(mb.getAttribute('aria-controls'));
if(mb&&sheet){
$$('.m-links a',sheet).forEach(function(a,i){a.style.setProperty('--i',Math.min(i,7))});
var open=function(on){mb.setAttribute('aria-expanded',on?'true':'false');mb.setAttribute('aria-label',on?'Close menu':'Open menu');sheet.classList.toggle('is-open',on);if(on){var f=$('a,button',sheet);f&&f.focus()}else mb.focus()};
mb.addEventListener('click',function(){open(mb.getAttribute('aria-expanded')!=='true')});
d.addEventListener('keydown',function(e){if(mb.getAttribute('aria-expanded')!=='true')return;if(e.key==='Escape'){open(false);return}
if(e.key==='Tab'){var f=$$('a,button,input,select',sheet).concat([mb]),i=f.indexOf(d.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}}});
$$('a',sheet).forEach(function(a){a.addEventListener('click',function(){if(a.hash&&a.pathname===location.pathname)open(false)})});
}
var fontsReady=new Promise(function(ok){var t=setTimeout(ok,600);d.fonts&&d.fonts.ready.then(function(){clearTimeout(t);ok()})});
(function(){var roof=$('.site-hdr .roof');if(!roof||!roof.animate)return;var seen;try{seen=sessionStorage.getItem('bs-intro');sessionStorage.setItem('bs-intro','1')}catch(e){}
if(seen||!M())return;var ps=$$('path',roof),rs=$$('rect',roof),sw=$('.site-hdr .lockup-sweep');
ps.forEach(function(p){p.style.strokeDashoffset=1});rs.forEach(function(r){r.style.transform='scale(.2)'});
fontsReady.then(function(){ps.forEach(function(p,i){var a=p.animate([{strokeDashoffset:1},{strokeDashoffset:0}],{duration:420,delay:i*60,easing:IOE,fill:'forwards'});a.onfinish=function(){p.style.strokeDashoffset=0;a.cancel()}});
rs.forEach(function(r,i){var a=r.animate([{transform:'scale(.2)'},{transform:'scale(1)'}],{duration:280,delay:300+i*40,easing:SPRING,fill:'forwards'});a.onfinish=function(){r.style.transform='';a.cancel()}});
if(sw)sw.animate([{opacity:1,transform:'scaleX(0)'},{opacity:1,transform:'scaleX(1)',offset:.27},{opacity:1,transform:'scaleX(1)',offset:.79},{opacity:0,transform:'scaleX(1)'}],{duration:1400,delay:520,easing:'linear'})})})();
var CC=BS.cc={
place:function(cc,w){var cur=$('.cc-cur',cc);if(!cur)return;if(!w){cur.style.opacity=0;return}
var r=cc.getBoundingClientRect(),b=w.getBoundingClientRect(),ps=getComputedStyle(w),pl=parseFloat(ps.paddingLeft)||0,pr=parseFloat(ps.paddingRight)||0;
cur.style.opacity=1;cur.style.transform='translate('+(b.left-r.left+pl)+'px,'+(b.bottom-r.top-3)+'px) scaleX('+Math.max(.08,(b.width-pl-pr)/100)+')'},
mark:function(ws,i){for(var k=0;k<ws.length;k++){var c=ws[k].classList;c.toggle('is-done',k<i);c.toggle('is-now',k===i);c.toggle('w',k>i)}},
chunks:function(words,max){var out=[],cur=[],len=0;words.forEach(function(w,i){var t=w.w;if(cur.length&&len+1+t.length>max){out.push(cur);cur=[];len=0}cur.push(i);len+=(cur.length>1?1:0)+t.length;if(/[,.?!:;]$/.test(t)&&len>=max*.5){out.push(cur);cur=[];len=0}});if(cur.length)out.push(cur);return out},
live:function(cc,words,max){/* returns {at(t), stop()} for a .cc with a .cc-chunks child */
var box=$('.cc-chunks',cc)||cc.appendChild(Object.assign(d.createElement('div'),{className:'cc-chunks'}));
if(!$('.cc-cur',cc)){var cu=d.createElement('span');cu.className='cc-cur';cc.appendChild(cu)}
var ch=CC.chunks(words,max||26),cOf=[],pair=-1,idx=-2,spans=[];ch.forEach(function(c,ci){c.forEach(function(i){cOf[i]=ci})});
var render=function(p){var html='';[ch[p*2],ch[p*2+1]].forEach(function(c){if(!c)return;html+='<span class="cc-l">'+c.map(function(i){return '<span class="w" data-i="'+i+'">'+words[i].w.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</span>'}).join(' ')+'</span>'});
box.innerHTML=html;spans=$$('[data-i]',box);box.classList.remove('is-out');box.classList.add('is-in')};
var find=function(t){var lo=0,hi=words.length-1,r=-1;while(lo<=hi){var m=(lo+hi)>>1;if(words[m].s<=t){r=m;lo=m+1}else hi=m-1}return r};
cc.classList.add('is-live');
return {at:function(t){var i=find(t);if(i===idx)return;idx=i;var p=Math.floor(cOf[Math.max(0,i)]/2);
if(p!==pair){var first=pair<0;pair=p;if(first||!M())render(p);else{box.classList.add('is-out');box.classList.remove('is-in');setTimeout(function(){if(pair===p){render(p);sync()}},120);return}}sync();
function sync(){var loc=spans.map(function(s){return +s.dataset.i});CC.mark(spans,loc.indexOf(idx)<0?(idx>loc[loc.length-1]?spans.length:-1):loc.indexOf(idx));CC.place(cc,spans[loc.indexOf(idx)])}},
stop:function(){cc.classList.remove('is-live');var cu=$('.cc-cur',cc);cu&&(cu.style.opacity=0)},
reset:function(){pair=-1;idx=-2;box.innerHTML=''}};
}
};
var hero=$('.hero[data-hero]');
if(hero){
var flow=$('.cc-flow',hero),fws=flow?$$('.wd',flow):[],hv=$('.hero-film video',hero),fb=$('.film-btn',hero),userPaused=false,covered=false;
var lineUp=function(){if(!fws.length)return;var y0=null,line=-1,top=null,fw=flow.getBoundingClientRect();fws.forEach(function(w){var t=w.offsetTop;if(t!==top){top=t;line++}w.style.setProperty('--wd',(520+line*60+Math.round((w.offsetLeft/fw.width)*160))+'ms')})};
var heroSet=function(){setTimeout(function(){hero.classList.add('is-set');warm()},400)};
var speak=function(){if(!M()||!fws.length){CC.mark(fws,fws.length);heroSet();return}var i=0;flow.classList.add('is-live');
var tick=function(){CC.mark(fws,i);CC.place(flow,fws[i]);i++;if(i<fws.length)setTimeout(tick,120);else setTimeout(function(){CC.mark(fws,fws.length);var cu=$('.cc-cur',flow);if(cu){cu.style.opacity=0}flow.classList.remove('is-live');heroSet()},320)};
setTimeout(tick,760)};
if(M())CC.mark(fws,-1);else CC.mark(fws,fws.length);
fontsReady.then(function(){requestAnimationFrame(function(){setTimeout(function(){lineUp();hero.classList.add('is-go');speak()},0)})});
var msC=$('.meet-sent');
if(msC&&IO)new IntersectionObserver(function(es){hero.classList.toggle('is-covered',!es[0].isIntersecting&&es[0].boundingClientRect.top<0)},{rootMargin:'0px 0px 100000px 0px'}).observe(msC);
var setBtn=function(paused,label){if(!fb)return;fb.dataset.state=paused?'paused':'playing';fb.setAttribute('aria-label',label||(paused?'Play film':'Pause film'))};
var big=mq('(min-width: 768px)').matches;
var start=function(){if(!hv)return;if(!hv.src)hv.src=big?hv.dataset.src:hv.dataset.srcSm;var p=hv.play();setBtn(false);p&&p.catch&&p.catch(function(){setBtn(true)})};
if(hv){
hv.addEventListener('playing',function(){hv.classList.add('is-on')});
if(slowNet())setBtn(true,'Play film (1 MB)');else if(!M())setBtn(true);
var auto=function(){if(M()&&!slowNet()&&!userPaused&&!covered)start()};
var idle=function(){(W.requestIdleCallback||function(f){setTimeout(f,200)})(auto,{timeout:1200})};
if(d.readyState==='complete')idle();else W.addEventListener('load',idle);
fb&&fb.addEventListener('click',function(){if(hv.paused){userPaused=false;start()}else{userPaused=true;hv.pause();setBtn(true)}});
var ms=$('.meet-sent');
if(ms&&IO)new IntersectionObserver(function(es){var e=es[0];covered=!e.isIntersecting;if(!hv.src)return;if(covered)hv.pause();else if(!userPaused&&M())hv.play().catch(function(){})},{rootMargin:(big?'0px':'-50%')+' 0px 100000px 0px'}).observe(ms);
d.addEventListener('visibilitychange',function(){if(!hv.src)return;if(d.hidden)hv.pause();else if(!userPaused&&!covered&&M())hv.play().catch(function(){})});
d.addEventListener('bs:motion',function(e){if(e.detail==='off'){if(hv.src&&!hv.paused){hv.pause();setBtn(true)}}else if(!userPaused&&!covered&&!slowNet())start()});
}
}
var vlP=null,loadV=function(){if(!vlP)vlP=load('js/voice.js');return vlP};
var voiceP=null,needVoice=function(){if(!voiceP)voiceP=loadV().then(function(){return BS.voice&&BS.voice.init()});return voiceP};
var vEls=$$('[data-voice]');
if(vEls.length){
vEls.forEach(function(el){['pointerenter','focusin'].forEach(function(t){el.addEventListener(t,needVoice,{once:true})});
el.addEventListener('click',function(e){if(BS.voice&&BS.voice.ready)return;e.preventDefault();needVoice().then(function(){BS.voice.press(el)})})});
if(IO){var vo=new IntersectionObserver(function(es){if(es.some(function(e){return e.isIntersecting})){vo.disconnect();needVoice()}},{rootMargin:'600px 0px'});$$('.voice').forEach(function(v){vo.observe(v)})}
$$('.wave').forEach(function(w){$$('i',w).forEach(function(b,i){b.style.setProperty('--i',i)})});
once($$('.wave'),function(w){w.classList.add('is-grown')},{threshold:.4},1);
}
once($$('.wl'),function(el){el.classList.add('is-in')},{threshold:.25},1);
$$('[data-pip]').forEach(function(pip){
var v=$('video',pip),cc=$('.cc',pip),btn=$('.pip-btn',pip),words;try{words=JSON.parse(pip.dataset.words).map(function(a){return {w:a[0],s:a[1],e:a[2]}})}catch(e){words=[]}
var ctl=cc&&CC.live(cc,words,16),raf=0,lbl=$('.lbl',btn);
var loop=function(){ctl.at(v.currentTime);raf=requestAnimationFrame(loop)};
var play=function(){if(!v.src)v.src=v.dataset.src;pip.classList.remove('is-done','is-idle');pip.classList.add('is-up');ctl.reset();v.currentTime=0;var p=v.play();p&&p.catch&&p.catch(function(){pip.classList.add('is-idle')})};
v.addEventListener('playing',function(){v.classList.add('is-on');cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)});
v.addEventListener('ended',function(){cancelAnimationFrame(raf);v.classList.remove('is-on');ctl.stop();setTimeout(function(){pip.classList.add('is-done');if(lbl)lbl.textContent=pip.dataset.replay||'Replay, 0:03'},240)});
v.addEventListener('pause',function(){cancelAnimationFrame(raf)});
btn&&btn.addEventListener('click',play);
if(!IO){pip.classList.add('is-idle');return}
var host=pip.closest('section')||pip;
new IntersectionObserver(function(es){var e=es[0];if(e.isIntersecting){var wait=host.dataset.seen?0:700;reveal(pip,function(){if(BS.canAuto())setTimeout(play,wait);else pip.classList.add('is-idle')},function(){pip.classList.add('is-idle')});host.dataset.seen=1}else if(!v.paused){v.pause();v.classList.remove('is-on');pip.classList.add('is-done')}},{threshold:.35}).observe(host.querySelector('.meet-media,.ab-talk')||pip);
});
if(!(W.CSS&&CSS.supports&&CSS.supports('animation-timeline:view()')))once($$('.oe-lead'),function(p){$$('.oe',p).forEach(function(o,i){setTimeout(function(){o.classList.add('is-lit')},M()?i*180:0)})},{threshold:.5});
var popped=function(b){b&&b.classList.add('is-popped')};
once($$('.map-draw'),function(m){m.classList.add('is-in');var b=m.closest('.band-map');if(b)setTimeout(function(){popped(b)},M()?1500:0)},{threshold:.2},1);
once($$('.mini-map.is-forest'),function(m){m.classList.add('is-pop')},{threshold:.6},1);
$$('.map-mod').forEach(function(m){
var rd=$('.map-read',m),def=rd&&rd.innerHTML;
var hot=function(slug,on){$$('[data-town="'+slug+'"]',m).forEach(function(x){x.classList.toggle('is-hot',on)});
if(!rd)return;var a=$('.town[data-town="'+slug+'"]',m);if(on&&a&&a.dataset.read){rd.textContent=a.dataset.read}else if(!on)rd.innerHTML=def};
$$('[data-town]',m).forEach(function(el){var s=el.dataset.town;
['mouseenter','focusin'].forEach(function(t){el.addEventListener(t,function(){hot(s,true)})});
['mouseleave','focusout'].forEach(function(t){el.addEventListener(t,function(){hot(s,false)})})});
var f=m.dataset.focus;if(f){var t=$('.town[data-town="'+f+'"]',m);t&&t.classList.add('is-current')}
var rail=$('.trail',m);
if(rail&&IO){var lit=null;
var ro=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&e.intersectionRatio>=.6){if(lit&&lit!==e.target.dataset.town)hot(lit,false);lit=e.target.dataset.town;hot(lit,true)}})},{root:rail,threshold:.6});$$('.tcard',rail).forEach(function(c){ro.observe(c)})}
});
$$('.ticker').forEach(function(t){var set=$('.tick-set',t);if(set&&!set.nextElementSibling){var c=set.cloneNode(true);c.setAttribute('aria-hidden','true');$$('a',c).forEach(function(a){a.tabIndex=-1});set.parentNode.appendChild(c)}var b=$('.rbtn',t);b&&b.addEventListener('click',function(){var p=t.classList.toggle('is-paused');b.setAttribute('aria-pressed',p?'true':'false');b.setAttribute('aria-label',p?'Play the town list':'Pause the town list')});
IO&&new IntersectionObserver(function(es){t.classList.toggle('is-off',!es[0].isIntersecting);if(es[0].isIntersecting&&!t._pt)t._pt=setTimeout(function(){popped(t.closest('.band-map'))},2500)}).observe(t)});
once($$('.scard'),function(c){c.classList.add('is-in');var w=$('.wl',c);w&&w.classList.add('is-in')},{threshold:.3},1);
var splitH=function(h){if(h._sp)return;h._sp=1;if(h.querySelector('.hw')||h.children.length>1)return;var txt=h.textContent.trim().split(/\s+/);if(txt.length>24)return;
h.innerHTML=txt.map(function(w,i){return '<span class="hw"><span style="--i:'+i+'">'+w.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</span></span>'}).join(' ')};
var splitSh=function(s){if(s._spl)return;s._spl=1;$$('.h2,.h1',s).forEach(splitH)},shs=$$('.sh');
var splitRest=function(){var q=shs.slice(3).filter(function(s){return !s._spl}),ric=W.requestIdleCallback||function(f){setTimeout(function(){f({timeRemaining:function(){return 8}})},60)};
var go=function(dl){var n=0;while(q.length&&(n<2||dl.timeRemaining()>6)){splitSh(q.shift());n++}if(q.length)ric(go,{timeout:3000})};if(q.length)ric(go,{timeout:3000})};
shs.slice(0,3).forEach(splitSh);
if(IO&&shs.length>3){var spo=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;spo.unobserve(e.target);var s=e.target,b=e.boundingClientRect;splitSh(s);
if(M()&&b.top<W.innerHeight&&b.bottom>0&&!s.classList.contains('is-in'))snap(s,function(x){x.classList.add('is-in')})})},{rootMargin:'100% 0px'});shs.slice(3).forEach(function(s){spo.observe(s)})}
else shs.slice(3).forEach(splitSh);
once(shs,function(s){s.classList.add('is-in')},{threshold:0,rootMargin:'0px 0px -12% 0px'},1);
var RISE='.irows[data-rise],.ql-more[data-rise],.rules[data-rise],.reno-rules[data-rise],.mic[data-rise],.grows.is-hub[data-rise]';
$$(RISE).forEach(function(g){Array.prototype.slice.call(g.children).forEach(function(c,i){c.style.setProperty('--i',Math.min(i,6))})});
once($$(RISE),function(g){g.classList.add('is-in')},{threshold:.12},1);
once($$('.qr-box'),function(q){q.classList.add('is-in')},{threshold:.6});
d.addEventListener('focusin',function(e){var g=e.target.closest&&e.target.closest('.sh,.wl,.scard,[data-rise]');g&&g.classList.add('is-in')});
$$('.reel video[src]').forEach(function(v){v.dataset.src=v.getAttribute('src');v.removeAttribute('src');v.removeAttribute('controls');v.removeAttribute('poster');v.loop=true;var r=v.closest('.reel');r&&r.setAttribute('data-auto','')});/* v3 reel markup on pages builder 2 has not rolled yet */
var vids=$$('video[data-src]').filter(function(v){return !v.closest('.hero,.pip')});
if(IO&&vids.length){var near=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&!e.target.src){e.target.preload='metadata';e.target.src=e.target.dataset.src;near.unobserve(e.target)}})},{rootMargin:'100% 0px'});vids.forEach(function(v){near.observe(v)})}
var stopOthers=BS.stopOthers=function(keep){$$('video,audio').forEach(function(v){if(v!==keep&&!v.closest('.hero')&&!v.paused)v.pause()})};
var autos=$$('[data-auto]'),vis=new Map(),active=null;
var pick=function(){var best=null,br=.6;vis.forEach(function(r,el){if(r>=br){br=r;best=el}});
autos.forEach(function(el){var v=$('video',el);if(!v)return;if(el===best&&BS.canAuto()&&!el._user){if(!v.src)v.src=v.dataset.src;if(v.paused&&!(BS.voice&&BS.voice.playing)){v.muted=true;v._snd=0;v.play().catch(function(){})}}else if(!el._user&&!v.paused)v.pause()});active=best};
var pickQ=0,pickSoon=function(){if(pickQ)return;pickQ=1;whenStill(function(){pickQ=0;pick()})};
autos.forEach(function(el){var v=$('video',el),bar=$('.reel-prog i',el),pa=null;if(!v)return;
var prog=function(){if(!bar)return;if(pa){pa.cancel();pa=null}var dur=v.duration,t=v.currentTime;if(!dur||!isFinite(dur))return;var f=Math.min(1,t/dur);bar.style.transform='scaleX('+f.toFixed(4)+')';
if(!v.paused&&!v.ended&&bar.animate)pa=bar.animate([{transform:'scaleX('+f.toFixed(4)+')'},{transform:'scaleX(1)'}],{duration:Math.max(0,(dur-t)/(v.playbackRate||1))*1000,easing:'linear'})};
v.addEventListener('playing',function(){v.classList.add('is-on');el.classList.add('is-playing');prog()});
v.addEventListener('seeked',prog);
v.addEventListener('pause',function(){prog();el.classList.remove('is-playing');if(!el._user)v.classList.remove('is-on')});
v.addEventListener('ended',function(){el._user=0;v.classList.remove('is-on');if(pa){pa.cancel();pa=null}if(bar)bar.style.transform=''});
var pb=$('.reel-play',el);pb&&pb.addEventListener('click',function(e){e.preventDefault();if(!v.src)v.src=v.dataset.src;if(v.paused){el._user=1;stopOthers(v);v.play().catch(function(){})}else{v.pause();el._user=0}});
});
if(IO&&autos.length){var ao=new IntersectionObserver(function(es){es.forEach(function(e){vis.set(e.target,e.isIntersecting?e.intersectionRatio:0);if(!e.isIntersecting){var v=$('video',e.target);e.target._user=0;v&&!v.paused&&v.pause()}});pickSoon()},{threshold:[0,.6,.8,1]});autos.forEach(function(el){ao.observe(el)})}
d.addEventListener('visibilitychange',function(){if(d.hidden)$$('video,audio').forEach(function(v){if(!v.closest('.hero')&&!v.paused){v._hid=1;v.pause()}});else pick()});
d.addEventListener('bs:motion',function(e){if(e.detail==='off')autos.forEach(function(el){var v=$('video',el);if(v&&!el._user&&!v.paused)v.pause()});else pick()});
$$('.btn-line').forEach(function(b){if($('.trace',b))return;b.insertAdjacentHTML('beforeend','<svg class="trace" aria-hidden="true" focusable="false"><rect width="100%" height="100%" pathLength="1"/></svg>')});
d.addEventListener('pointerdown',function(e){var b=e.target.closest&&e.target.closest('.btn-red');if(!b||!M()||!b.animate)return;var r=b.getBoundingClientRect();b.style.setProperty('--rx',(e.clientX-r.left)+'px');b.style.setProperty('--ry',(e.clientY-r.top)+'px');
try{b.animate([{opacity:.5,transform:'scale(.2)'},{opacity:0,transform:'scale(1.6)'}],{duration:600,easing:OUT,pseudoElement:'::before'})}catch(x){}});
var mags=[],magIO=IO&&new IntersectionObserver(function(es){es.forEach(function(e){var i=mags.indexOf(e.target);if(e.isIntersecting&&i<0)mags.push(e.target);else if(!e.isIntersecting&&i>-1){mags.splice(i,1);e.target.style.removeProperty('--mx');e.target.style.removeProperty('--my')}})});
if(magIO)$$('.btn-red').forEach(function(b){if(!b.closest('.act-bar,.menu-sheet'))magIO.observe(b)});
var px=0,py=0,pt=null,queued=false,tilt=null,spot=null;
var frame=function(){queued=false;if(!M())return;
mags.forEach(function(b){var r=b.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=px-cx,dy=py-cy,out=Math.max(Math.abs(dx)-r.width/2,Math.abs(dy)-r.height/2);
if(out<80){var k=1-Math.max(0,out)/80;b.style.setProperty('--mx',(Math.max(-1,Math.min(1,dx/(r.width/2)))*6*k).toFixed(1)+'px');b.style.setProperty('--my',(Math.max(-1,Math.min(1,dy/(r.height/2)))*4*k).toFixed(1)+'px')}else{b.style.removeProperty('--mx');b.style.removeProperty('--my')}});
var m=pt&&pt.closest&&pt.closest('.scard-m');if(tilt&&tilt!==m){tilt.style.removeProperty('--tx');tilt.style.removeProperty('--ty');tilt.classList.remove('is-tilt');tilt=null}
if(m){var r=m.getBoundingClientRect(),fx=(px-r.left)/r.width-.5,fy=(py-r.top)/r.height-.5;m.classList.add('is-tilt');m.style.setProperty('--tx',(fx*12).toFixed(2)+'deg');m.style.setProperty('--ty',(-fy*12).toFixed(2)+'deg');m.style.setProperty('--gx',(fx*r.width).toFixed(0)+'px');m.style.setProperty('--gy',(fy*r.height).toFixed(0)+'px');tilt=m}
var s=pt&&pt.closest&&pt.closest('.band-pod');if(spot&&spot!==s){spot.classList.remove('is-spot');spot=null}
if(s){var sp=$('.spot',s),rr=s.getBoundingClientRect();if(sp){sp.style.setProperty('--sx',(px-rr.left)+'px');sp.style.setProperty('--sy',(py-rr.top)+'px')}s.classList.add('is-spot');spot=s}};
var onMove=function(e){px=e.clientX;py=e.clientY;pt=e.target;if(!queued){queued=true;requestAnimationFrame(frame)}};
var bindMove=function(){if(fine.matches)d.addEventListener('pointermove',onMove,{passive:true});else d.removeEventListener('pointermove',onMove)};
bindMove();fine.addEventListener&&fine.addEventListener('change',bindMove);
$$('[data-share]').forEach(function(b){b.addEventListener('click',function(){var u=location.href.split('#')[0];
if(navigator.share){navigator.share({title:d.title,url:u}).catch(function(){})}
else{var said=0,say=function(m){if(!said){said=1;BS.toast(m)}},to=setTimeout(function(){say('Copy the link from the address bar')},900);
if(navigator.clipboard)navigator.clipboard.writeText(u).then(function(){clearTimeout(to);say('Link copied')},function(){clearTimeout(to);say('Copy the link from the address bar')});else{clearTimeout(to);say('Copy the link from the address bar')}}})});
var bar=$('.act-bar');
if(bar){var away={hero:false,form:false,direct:false},upd=function(){bar.classList.toggle('is-away',away.hero||away.form||away.direct)};
var hb=$('[data-bar-after]');if(hb&&IO){away.hero=true;upd();new IntersectionObserver(function(es){away.hero=es[0].isIntersecting||es[0].boundingClientRect.top>0;upd()}).observe(hb)}
var dl=$$('.direct');if(dl.length&&IO){var o=new IntersectionObserver(function(es){es.forEach(function(e){e.target._v=e.isIntersecting});away.direct=dl.some(function(x){return x._v});upd()});dl.forEach(function(x){o.observe(x)})}
d.addEventListener('focusin',function(e){if(e.target.matches&&e.target.matches('input,select,textarea')){away.form=true;upd()}});
d.addEventListener('focusout',function(){away.form=false;upd()})}
$$('.pod-player').forEach(function(p){var face=$('.pod-facade',p);
var go=function(){var f=d.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+p.dataset.yt+'?autoplay=1&rel=0';f.title=p.dataset.title||'NWA Investing episode';f.allow='autoplay; encrypted-media; picture-in-picture';f.allowFullscreen=true;face.hidden=true;p.classList.add('is-live');stopOthers(null);p.appendChild(f)};
face&&face.addEventListener('click',go);var cap=p.dataset.cap&&d.getElementById(p.dataset.cap);
$$('[data-play-in="'+p.id+'"]').forEach(function(row,_,all){row.addEventListener('click',function(){var f=$('iframe',p);f&&f.remove();face.hidden=false;p.classList.remove('is-live');p.dataset.yt=row.dataset.yt;p.dataset.title='NWA Investing, Ep. '+row.dataset.n;
var fn=$('[data-face="n"]',face),ft=$('[data-face="t"]',face),fd=$('[data-face="d"]',face),rt=$('.ep-t',row);if(fn)fn.textContent='Ep. '+row.dataset.n;if(fd)fd.textContent=row.dataset.date||'';if(ft&&rt)ft.textContent=rt.textContent;
if(cap){cap.querySelector('[data-cap="n"]').textContent='Ep. '+row.dataset.n;cap.querySelector('[data-cap="t"]').textContent=rt?rt.textContent:'';cap.querySelector('[data-cap="d"]').textContent=row.dataset.date||'';var yl=cap.querySelector('[data-cap="yt"]');if(yl)yl.href='https://www.youtube.com/watch?v='+row.dataset.yt}
all.forEach(function(x){x.setAttribute('aria-pressed',x===row?'true':'false')})})})});
var MAIL='brandonstillnwa@gmail.com',PH='+14792362900';
var msgSync=BS.msgSync=function(a){var body=a.dataset.sms||'',desk=fine.matches;a.href=desk?'mailto:'+MAIL+'?subject='+encodeURIComponent(a.dataset.subj||'Hello from your website')+'&body='+encodeURIComponent(body):'sms:'+PH+'?&body='+encodeURIComponent(body);
var lab=$('.lab',a)||a;if(!a._t)a._t=lab.textContent;lab.textContent=desk&&a.dataset.mail?a.dataset.mail:a._t};
var msgAll=function(){$$('a[data-sms]').forEach(msgSync)};msgAll();fine.addEventListener&&fine.addEventListener('change',msgAll);
var calcs=$$('[data-calc]');
var tlP=null,tl=function(){if(!tlP)tlP=load('js/tools.js');return tlP};
if(calcs.length){var tlIdle=function(){(W.requestIdleCallback||function(f){setTimeout(f,120)})(function(){tl()},{timeout:900})};
if(IO){var co=new IntersectionObserver(function(es){if(es.some(function(e){return e.isIntersecting})){co.disconnect();whenStill(tlIdle)}},{rootMargin:'1500px 0px'});calcs.forEach(function(c){co.observe(c)})}else tl();
if(/[?&]calc=|#[\w-]+=v1&|#(buydown|mortgage|rental|deal|sc|payment)/.test(location.search+location.hash))tl()}
var srP=null,loadS=function(){if(!srP)srP=load('js/search.js');return srP},needS=function(){return loadS().then(function(){return BS.search.boot()})},EXS=['Try Lowell','Try duplexes','Try short-term rentals'];
if(mq('(max-width: 479px)').matches)$$('[data-search]:not(.is-big) input[type="search"]').forEach(function(i){i.placeholder='Try Lowell or duplexes'});
$$('[data-search]').forEach(function(f){var i=$('input[type="search"]',f),r=$('[data-search-random]',f);['focusin','keydown'].forEach(function(t){f.addEventListener(t,needS,{once:true})});i&&i.addEventListener('pointerenter',needS,{once:true});if(r)r.hidden=false});
d.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-at],[data-search-random]');if(!b||BS.search)return;e.preventDefault();needS().then(function(){BS.search.press(b)})});
if($('[data-search]')&&/[?&][qt]=/.test(location.search))needS();
once($$('.srch-row'),function(r){var inp=$('input[type="search"]',r);if(!inp||!M()||inp.value||d.activeElement===inp)return;var o=d.createElement('span'),i=0,t;o.className='sr-roll';o.setAttribute('aria-hidden','true');r.appendChild(o);r.classList.add('is-roll');
var step=function(){var s=d.createElement('span'),p=o.lastChild;s.textContent=EXS[i++%3];o.appendChild(s);if(p){p.className='is-out';setTimeout(function(){p.remove()},300)}};
var end=function(){clearInterval(t);r.classList.remove('is-roll');o.remove()};step();t=setInterval(function(){if(i>=9||!M())end();else step()},2600);
['focus','input'].forEach(function(e){inp.addEventListener(e,end,{once:true})})},{threshold:.6});
var txP=null;$$('.transcript-body[data-tx]').forEach(function(b){var dt=b.closest('details');dt&&dt.addEventListener('toggle',function(){if(!dt.open||b._tx)return;b._tx=1;
if(!txP)txP=fetch(base+'data/reel-tx.json').then(function(r){return r.json()});txP.then(function(j){if(j[b.dataset.tx])b.innerHTML=j[b.dataset.tx]},function(){b._tx=0;txP=null})})});
var stP=null;$$('.reel .reel-media').forEach(function(m){if(m.closest('.watch,.watch-reel'))return;m.addEventListener('click',function(e){if(e.target.closest('a'))return;e.preventDefault();e.stopPropagation();
if(!stP)stP=load('js/story.js');stP.then(function(){BS.story.open(m.closest('.reel'))})},true)});
var warmed=0,warm=function(){if(warmed)return;warmed=1;var q=[];if($('[data-voice]'))q.push(loadV);if($('[data-search]'))q.push(function(){BS.searchIdle=1;return loadS()});if(calcs.length)q.push(tl);q.push(function(){splitRest();return Promise.resolve()});
var ric=W.requestIdleCallback||function(f){setTimeout(f,200)},next=function(){var f=q.shift();if(f)ric(function(){f().then(next,next)},{timeout:2000})};next()};
if(!hero){var wl=function(){(W.requestIdleCallback||function(f){setTimeout(f,300)})(warm,{timeout:2000})};if(d.readyState==='complete')wl();else W.addEventListener('load',wl)}
var form=$('#lead-form'),qp=new URLSearchParams(location.search);
if(form){var goal=form.elements.goal,msg=form.elements.message,sub=$('button[type="submit"]',form);
try{var gq=qp.get('goal'),tq=qp.get('town');if(gq&&goal&&$('option[value="'+gq+'"]',goal))goal.value=gq;if(tq&&msg&&/^[a-z-]{2,30}$/.test(tq))msg.value='About '+tq.split('-').map(function(w){return w.charAt(0).toUpperCase()+w.slice(1)}).join(' ')+': '}catch(e){}
if(sub)sub.disabled=false;
form.addEventListener('submit',function(e){e.preventDefault();var E=form.elements,ok=true,err=function(n,t){var p=d.getElementById('e-'+n);if(p)p.textContent=t;if(t){ok=false;E[n].setAttribute('aria-invalid','true')}else E[n].removeAttribute('aria-invalid')};
err('name',E.name.value.trim()?'':'Please add your name.');var em=E.email.value.trim(),ph=E.phone.value.replace(/\D/g,'');
err('email',em&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)?'That email looks incomplete.':!em&&ph.length<10?'Add an email or a phone number so Brandon can reach you.':'');
if(!ok){var bad=$('[aria-invalid="true"]',form);bad&&bad.focus();return}var s=$('.sent',form);if(s){s.hidden=false;s.focus&&s.focus()}})}
if(IO)$$('[data-spy]').forEach(function(nav){var links=$$('a[href^="#"]',nav).filter(function(a){return a.hash.length>1&&d.getElementById(a.hash.slice(1))});if(!links.length)return;
var seen={},cur=null,row=$('.chips,.toggles',nav);
var set=function(a){if(a===cur)return;cur=a;links.forEach(function(x){if(x===a)x.setAttribute('aria-current','true');else x.removeAttribute('aria-current')});row&&glide(row);
var sc=a.offsetParent;if(sc&&nav.contains(sc)&&sc.scrollWidth>sc.clientWidth+1)sc.scrollTo({left:Math.max(0,a.offsetLeft-16),behavior:M()?'smooth':'auto'})};
var first=d.getElementById(links[0].hash.slice(1));
var spy=new IntersectionObserver(function(es){es.forEach(function(e){seen[e.target.id]=e.isIntersecting});for(var i=0;i<links.length;i++){if(seen[links[i].hash.slice(1)]){set(links[i]);return}}if(first.getBoundingClientRect().top>W.innerHeight*.3)set(links[0])},{rootMargin:'-30% 0px -60% 0px'});
links.forEach(function(a){spy.observe(d.getElementById(a.hash.slice(1)))})});
var openNote=function(id){var t=id&&d.getElementById(id);if(t&&t.tagName==='DETAILS'){t.open=true;return t}};
d.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;var t=openNote(a.hash.slice(1));if(t){e.preventDefault();t.scrollIntoView({behavior:M()?'smooth':'auto',block:'start'});$('summary',t).focus({preventScroll:true});try{history.replaceState(null,'',a.hash)}catch(x){}}});
W.addEventListener('hashchange',function(){openNote(location.hash.slice(1))});openNote(location.hash.slice(1));
$$('[data-ep-filter]').forEach(function(box){var sel=box.dataset.epFilter,list=$(sel);if(!list)return;
var items=$$('[data-tags]',list),chips=$$('[data-f]',box),more=$('[data-more="'+sel+'"]'),count=$('[data-count]',box),clip=+(list.dataset.clip||0),open=false,f='all';
var hit=function(){var t=location.hash.length>1&&d.getElementById(location.hash.slice(1));return t&&items.indexOf(t)>-1?t:null};if(hit())open=true;
var apply=function(){var n=0,shown=0;items.forEach(function(li){var on=f==='all'||(' '+li.dataset.tags+' ').indexOf(' '+f+' ')>-1;if(on)n++;var vis=on&&(f!=='all'||open||!clip||n<=clip);li.hidden=!vis;if(vis)shown++});
if(more)more.hidden=!(f==='all'&&clip&&!open&&n>clip);chips.forEach(function(c){c.setAttribute('aria-pressed',c.dataset.f===f?'true':'false')});var r=chips[0]&&chips[0].parentNode;raf1(function(){r&&r.classList.contains('chips')&&glide(r);$$('.toggles',box).forEach(glide)});
if(count){var lab=$('[data-f="'+f+'"]',box);count.textContent=f==='all'?(shown<n?'Showing the newest '+shown+' of '+n+' episodes.':'Showing all '+n+' episodes.'):n+(n===1?' episode':' episodes')+': '+(lab?lab.textContent:'')+'.'}};
chips.forEach(function(c){c.addEventListener('click',function(){f=c.dataset.f;apply()})});
more&&more.addEventListener('click',function(){var first=items.filter(function(li){return li.hidden})[0];open=true;apply();if(first){first.setAttribute('tabindex','-1');first.focus()}});
W.addEventListener('hashchange',function(){var t=hit();if(t&&t.hidden){f='all';open=true;apply();t.scrollIntoView()}});apply()});
$$('.chips').forEach(function(r){if($('[aria-pressed="true"],[aria-current]',r))raf1(function(){glide(r)})});
W.addEventListener('resize',function(){$$('.has-ind').forEach(glide)},{passive:true});
})();
