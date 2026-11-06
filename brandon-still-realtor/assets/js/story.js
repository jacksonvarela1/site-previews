(function(){
'use strict';
var d=document,W=window,BS=W.BS,$=function(s,c){return (c||d).querySelector(s)},M=function(){return BS.motion()};
var ROOT=BS.base.replace(/assets\/$/,''),LIFT='cubic-bezier(.7,0,.25,1)',S=null,sP=null,dlg,fr,vid,img,typ,bars,foot,sheet,i=0,raf=0,t0=0,el=0,held=0,hold=0,snd=0,from=null,opener=null,pre=null;
var esc=function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')};
var ic=function(id,c){return '<svg class="ic'+(c?' '+c:'')+'" aria-hidden="true"><use href="#'+id+'"/></svg>'};
var getS=function(){if(!sP)sP=fetch(BS.base+'data/stories.json').then(function(r){return r.json()}).then(function(j){S=j;build();return j});return sP};
var build=function(){dlg=d.createElement('dialog');dlg.className='stories';dlg.setAttribute('aria-label','Brandon’s reels, '+S.length+' stories');
  dlg.innerHTML='<div class="st-frame" tabindex="-1" role="group" aria-roledescription="story"><div class="st-bars" aria-hidden="true">'+S.map(function(){return '<span><i></i></span>'}).join('')+'</div>'
    +'<div class="st-media"><img class="st-poster" alt="" decoding="async"><video playsinline muted preload="metadata"></video><div class="st-type" hidden></div></div><div class="st-tap" aria-hidden="true"></div>'
    +'<button class="rbtn st-x" type="button" aria-label="Close the stories">'+ic('i-x')+'</button>'
    +'<div class="st-foot"><p class="st-tag"></p><p class="st-t"></p><p class="st-d"></p><div class="st-acts"></div></div>'
    +'<div class="st-sheet" role="region" aria-label="Transcript" hidden><div class="st-sheet-b"></div><button class="tbtn st-sheet-x" type="button">Close the transcript</button></div></div>'
    +'<button class="rbtn st-prev" type="button" aria-label="Previous story">'+ic('i-caret','is-l')+'</button><button class="rbtn st-next" type="button" aria-label="Next story">'+ic('i-caret','is-r')+'</button>';
  d.body.appendChild(dlg);fr=$('.st-frame',dlg);vid=$('video',dlg);img=$('.st-poster',dlg);typ=$('.st-type',dlg);bars=dlg.querySelectorAll('.st-bars i');foot=$('.st-foot',dlg);sheet=$('.st-sheet',dlg);
  $('.st-x',dlg).addEventListener('click',function(){close()});$('.st-prev',dlg).addEventListener('click',function(){go(i-1)});$('.st-next',dlg).addEventListener('click',function(){go(i+1)});
  dlg.addEventListener('cancel',function(e){e.preventDefault();if(!sheet.hidden)tx(0);else close()});
  dlg.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();go(i+1)}else if(e.key==='ArrowLeft'){e.preventDefault();go(i-1)}});
  $('.st-sheet-x',dlg).addEventListener('click',function(){tx(0)});
  vid.addEventListener('playing',function(){vid.classList.add('is-on');loop()});
  vid.addEventListener('pause',function(){cancelAnimationFrame(raf);if(!held)vid.classList.remove('is-on')});
  vid.addEventListener('ended',function(){go(i+1)});
  foot.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.dataset.a==='tx')tx(1);if(b.dataset.a==='snd'){snd=1;BS.stopOthers&&BS.stopOthers(vid);vid.currentTime=0;vid.muted=false;vid.play().catch(function(){});b.hidden=true}});
  var tap=$('.st-tap',dlg),sx=0,sy=0,dy=0,drag=0,down=0;
  tap.addEventListener('pointerdown',function(e){down=1;sx=e.clientX;sy=e.clientY;dy=0;drag=0;try{tap.setPointerCapture(e.pointerId)}catch(x){}hold=setTimeout(function(){held=1;pause()},220)});
  tap.addEventListener('pointermove',function(e){if(!down)return;var y=e.clientY-sy,x=e.clientX-sx;if(!drag&&y>12&&y>Math.abs(x)){drag=1;clearTimeout(hold)}if(drag){dy=Math.max(0,y);fr.style.transform='translateY('+dy+'px)';fr.style.opacity=1-Math.min(.5,dy/600)}});
  var up=function(e,cancel){if(!down)return;down=0;clearTimeout(hold);
    if(drag){if(dy>120&&!cancel)close(1);else{fr.style.transition='transform 240ms '+LIFT+',opacity 240ms';fr.style.transform='';fr.style.opacity='';setTimeout(function(){fr.style.transition=''},260)}return}
    if(held){held=0;resume();return}if(cancel)return;var r=fr.getBoundingClientRect();go((e.clientX-r.left)/r.width<.4?i-1:i+1)};
  tap.addEventListener('pointerup',function(e){up(e)});tap.addEventListener('pointercancel',function(e){up(e,1)});
  d.addEventListener('visibilitychange',function(){if(d.hidden&&dlg.open)pause();else if(dlg.open&&sheet.hidden)resume()})};
var loop=function(){cancelAnimationFrame(raf);var s=S[i],f=function(){var p=s.type?Math.min(1,(el+performance.now()-t0)/8000):vid.duration?vid.currentTime/vid.duration:0;
    bars[i].style.transform='scaleX('+p+')';if(!s.type&&p>.5&&!pre&&S[i+1]&&S[i+1].v){pre=d.createElement('video');pre.preload='metadata';pre.muted=true;pre.src=ROOT+S[i+1].v}
    if(s.type&&p>=1){go(i+1);return}raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f)};
var pause=function(){var s=S[i];if(s.type){el+=performance.now()-t0;cancelAnimationFrame(raf)}else vid.pause()};
var resume=function(){var s=S[i];if(s.type){t0=performance.now();loop()}else vid.play().catch(function(){})};
var tx=function(on){var s=S[i];if(on){$('.st-sheet-b',dlg).innerHTML=s.tx.map(function(p){return '<p>'+esc(p)+'</p>'}).join('')+(s.note?'<p class="fine">'+esc(s.note)+'</p>':'');sheet.hidden=false;pause();
    M()&&sheet.animate&&sheet.animate([{transform:'translateY(100%)'},{transform:'none'}],{duration:320,easing:LIFT});$('.st-sheet-x',dlg).focus()}
  else{sheet.hidden=true;resume();var b=$('[data-a="tx"]',foot);b&&b.focus()}};
var show=function(n){var s=S[n];i=n;el=0;pre=null;held=0;snd=0;cancelAnimationFrame(raf);sheet.hidden=true;
  for(var k=0;k<bars.length;k++)bars[k].style.transform='scaleX('+(k<n?1:0)+')';
  fr.setAttribute('aria-label','Story '+(n+1)+' of '+S.length+': '+s.t);
  $('.st-tag',foot).textContent='';$('.st-t',foot).textContent=s.t;$('.st-d',foot).textContent='Posted '+s.d+(s.tag?'. '+s.tag+'.':'');
  $('.st-acts',foot).innerHTML=(s.snd?'<button class="tbtn" type="button" data-a="snd">Play with sound</button>':'')+(s.tx?'<button class="tbtn" type="button" data-a="tx">Read the transcript</button>':'')
    +(s.w&&s.type?'<a class="tlink" href="'+ROOT+s.w+'">Read the full transcript</a>':'')+'<a class="tlink" href="'+esc(s.ig)+'" target="_blank" rel="noopener">See it on Instagram&nbsp;<span class="st-dom">(instagram.com)</span><span class="sr"> (opens in a new tab)</span></a>';
  vid.pause();vid.classList.remove('is-on');vid.muted=true;vid.removeAttribute('src');var tr=$('track',vid);tr&&tr.remove();
  if(s.type){img.hidden=true;vid.hidden=true;typ.hidden=false;typ.innerHTML='<p class="st-q">“'+esc(s.q)+'”</p><p class="st-c">'+esc(s.c)+'</p><ol class="picks">'+s.picks.map(function(p){return '<li>'+esc(p)+'</li>'}).join('')+'</ol><p class="st-n">'+esc(s.note)+'</p>';t0=performance.now();loop()}
  else{typ.hidden=true;img.hidden=false;vid.hidden=false;img.src=ROOT+s.p;if(s.vtt){var t=d.createElement('track');t.kind='captions';t.srclang='en';t.label='English';t.src=ROOT+s.vtt;vid.appendChild(t)}vid.src=ROOT+s.v;vid.play().catch(function(){})}
  if('mediaSession' in navigator&&s.snd)try{navigator.mediaSession.metadata=new MediaMetadata({title:s.t,artist:'Brandon Still'})}catch(x){}};
var go=function(n){if(n<0)n=0;if(n>=S.length){close();return}if(M()&&fr.animate)fr.animate([{opacity:.4},{opacity:1}],{duration:200,easing:'ease-out'});show(n)};
var vt=function(fn,a,b){if(!M()||!d.startViewTransition||!a){fn();if(M()&&fr.animate)fr.animate([{opacity:0},{opacity:1}],{duration:200});return}
  a.style.viewTransitionName='story';var t=d.startViewTransition(function(){a.style.viewTransitionName='';fn();if(b)b.style.viewTransitionName='story'});t.finished.finally(function(){if(b)b.style.viewTransitionName=''})};
var open=function(card){getS().then(function(){var id=(card&&card.id||'').replace(/^reel-/,''),n=0;S.forEach(function(s,k){if(s.k===id)n=k});
  from=card&&$('.reel-media',card);opener=card&&card.contains(d.activeElement)?d.activeElement:card&&$('.reel-play',card)||d.activeElement;BS.stopOthers&&BS.stopOthers(null);
  vt(function(){dlg.showModal();show(n);fr.focus()},from,fr)})};
var close=function(swipe){if(!dlg.open)return;cancelAnimationFrame(raf);vid.pause();var done=function(){fr.style.transform='';fr.style.opacity='';vid.removeAttribute('src');vid.load();dlg.close();opener&&opener.focus&&opener.focus()};
  if(swipe&&M()&&fr.animate){fr.animate([{transform:fr.style.transform||'none',opacity:fr.style.opacity||1},{transform:'translateY(100%)',opacity:0}],{duration:240,easing:LIFT}).onfinish=done;return}
  vt(done,fr,from&&d.contains(from)?from:null)};
BS.story={open:open};
})();
