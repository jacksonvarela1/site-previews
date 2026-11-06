(function(){
'use strict';
var d=document,W=window,BS=W.BS,$=function(s,c){return (c||d).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))};
var ROOT=BS.base.replace(/assets\/$/,''),CL=null,cur=null;
var V=BS.voice={ready:false,playing:false};
var lbl=function(el,t){var l=$('.lbl',el);if(l)l.textContent=t};

function Player(el){/* el: a .voice card or a .vchip */
  var slug=el.dataset.clip||el.dataset.voice,c=CL[slug];if(!c)return null;
  var card=el.classList.contains('voice'),vid=card&&$('.voice-m video',el),line=!card&&d.querySelector(el.dataset.line||'[data-voice-line]');
  var cc=card?$('.cc',el):line&&$('.cc-live',line),bars=card?$$('.wave i',el):$$('.mini-wave i',el),ph=card&&$('.wave .ph',el),btn=card?$('.vbtn',el):el;
  var media,ctl=cc&&!vid?BS.cc.live(cc,c.words,26):null,raf=0,last=-1,self;
  var peaks=c.peaks||[];
  var step=function(){var t=media.currentTime,f=Math.min(1,t/(media.duration||c.len));
    if(ctl&&!(card&&el.classList.contains('cc-off')))ctl.at(t);
    if(card){var n=Math.floor(f*bars.length);if(n!==last){for(var i=0;i<bars.length;i++){var on=i<n;if(on!==bars[i].classList.contains('is-on')){bars[i].classList.toggle('is-on',on);if(on&&BS.motion()){bars[i].classList.remove('is-pop');void bars[i].offsetWidth;bars[i].classList.add('is-pop')}}}last=n}
      if(ph)ph.style.transform='translateX('+(f*ph.parentNode.clientWidth)+'px)'}
    else{var k=Math.floor(f*peaks.length);bars.forEach(function(b,i){var p=peaks[Math.min(peaks.length-1,k+i)]||.3;b.style.setProperty('--h',BS.motion()?(.25+p*.75).toFixed(2):'.6')})}
    raf=requestAnimationFrame(step)};
  var snd=function(){return !vid||vid._snd};
  var onPlay=function(){if(!snd())return;V.playing=true;el.classList.add('is-playing');btn.classList.add('is-playing');lbl(btn,'Pause');if(vid)vid.classList.add('is-on');cancelAnimationFrame(raf);raf=requestAnimationFrame(step)};
  var make=function(){if(media)return;
    if(vid){media=vid;if(!vid.src)vid.src=vid.dataset.src}
    else{media=new Audio();media.preload='auto';media.src=ROOT+c.media.audio}
    media.addEventListener('playing',onPlay);
    media.addEventListener('pause',function(){cancelAnimationFrame(raf);if(vid)vid.classList.remove('is-on');if(!snd())return;el.classList.remove('is-playing');btn.classList.remove('is-playing');if(!media.ended)lbl(btn,card?'Play with sound':'Hear it from Brandon, '+fmt(c.len))});
    media.addEventListener('ended',function(){cancelAnimationFrame(raf);if(!snd())return;V.playing=false;lbl(btn,card?'Play again':'Hear it from Brandon, '+fmt(c.len));
      if(vid){vid.classList.remove('is-on');vid.muted=true;vid._snd=0;var a=vid.closest('[data-auto]');if(a)a._user=2}/* holds on the poster with Play again (no restart) until the card leaves view */
      if(card)setTimeout(function(){bars.forEach(function(b){b.classList.remove('is-on','is-pop')});last=-1;if(ph)ph.style.transform=''},1000);else{bars.forEach(function(b){b.style.removeProperty('--h')});back()}
      ctl&&ctl.stop()})};
  var back=function(){if(!line)return;var go=function(){line.classList.remove('is-live');ctl&&ctl.reset()};if(BS.motion()&&line.animate){line.animate([{opacity:1},{opacity:0},{opacity:1}],{duration:480,easing:'cubic-bezier(.23,1,.32,1)'});setTimeout(go,240)}else go()};
  self={el:el,
    play:function(){make();if(cur&&cur!==self)cur.pause();cur=self;BS.stopOthers(vid||null);
      if(line&&!line.classList.contains('is-live')){var sw=function(){line.classList.add('is-live')};if(BS.motion()&&line.animate){line.animate([{opacity:1},{opacity:0},{opacity:1}],{duration:480,easing:'cubic-bezier(.23,1,.32,1)'});setTimeout(sw,240)}else sw()}
      if(vid){var a=vid.closest('[data-auto]');if(a)a._user=1;if(!vid._snd||media.ended)vid.currentTime=0;vid.muted=false;vid.loop=false;vid._snd=1}
      else if(media.ended)media.currentTime=0;
      if(ctl&&media.currentTime===0)ctl.reset();
      var p=media.play();p&&p.then&&p.then(function(){if(!media.paused&&!el.classList.contains('is-playing'))onPlay()},function(){lbl(btn,'Tap to play')});
      if('mediaSession' in navigator&&W.MediaMetadata){try{navigator.mediaSession.metadata=new MediaMetadata({title:c.title,artist:'Brandon Still',album:c.credit})}catch(e){}}},
    pause:function(){if(media&&!media.paused)media.pause();V.playing=false},
    toggle:function(){if(media&&!media.paused)self.pause();else self.play()}};
  return self;
}
function fmt(s){s=Math.round(s);return Math.floor(s/60)+':'+('0'+s%60).slice(-2)}
var players=new Map();
var get=function(el){var host=el.closest('.voice')||el;if(!players.has(host))players.set(host,Player(host));return players.get(host)};
V.press=function(el){var p=get(el);p&&p.toggle()};
V.init=function(){if(V.ready)return Promise.resolve();
  return fetch(BS.base+'data/clips.json').then(function(r){return r.json()}).then(function(j){CL=j;V.ready=true;
    $$('[data-voice]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();V.press(b)})});
    $$('.voice').forEach(function(v){v.addEventListener('keydown',function(e){if(e.key===' '&&e.target===v){e.preventDefault();V.press(v)}});
      var tg=$('[data-cc-toggle]',v);tg&&tg.addEventListener('click',function(){var off=v.classList.toggle('cc-off');tg.setAttribute('aria-pressed',off?'false':'true');tg.textContent=off?'Captions off':'Captions on';var cc=$('.cc',v);if(cc)cc.style.visibility=off?'hidden':''})})})};
})();
