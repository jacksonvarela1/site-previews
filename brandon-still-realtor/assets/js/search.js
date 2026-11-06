(function(){
'use strict';
var d=document,W=window,BS=W.BS,$=function(s,c){return (c||d).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))};
var M=function(){return BS.motion()},OUT='cubic-bezier(.23,1,.32,1)',ROOT=BS.base.replace(/assets\/$/,''),DATA=BS.base+'data/';
var A=null,aP=null,wk=null,qid=0,byId={},ctl=[],got=0,of=4,bOK=!(navigator.connection&&navigator.connection.saveData),MON='Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
var esc=function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')};
var mmss=function(s){s=Math.max(0,s|0);var h=s/3600|0,m=(s%3600)/60|0,x=s%60;return (h?h+':'+(m<10?'0':''):'')+m+':'+(x<10?'0':'')+x};
var when=function(e){var p=(e.d||'').split('-');return 'Ep. '+e.n+(p[1]?', '+MON[+p[1]-1]+' '+p[0]:'')};
var mark=function(x,h){var o='',at=0;(h||[]).forEach(function(r){o+=esc(x.slice(at,r[0]))+'<mark>'+esc(x.slice(r[0],r[1]))+'</mark>';at=r[1]});return o+esc(x.slice(at))};
var rise=function(el,i){if(M()&&el.animate)el.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:280,delay:Math.min(i,6)*40,easing:OUT,fill:'backwards'})};
var townName=function(s){var t=A&&A.towns.filter(function(x){return x[0]===s})[0];return t?t[1]:s};
var getA=function(){if(!aP)aP=fetch(DATA+'episodes.json').then(function(r){return r.json()}).then(function(j){A=j;A.by={};of=j.shards.length;j.eps.forEach(function(e){A.by[e.n]=e});
  wk=new Worker(BS.base+'js/search-worker.js');wk.onmessage=onMsg;wk.postMessage({type:'init',eps:j.eps,towns:j.towns,base:DATA,shards:j.shards});return j});return aP};
var onMsg=function(ev){var m=ev.data;if(m.type==='p'){got=m.got;ctl.forEach(function(c){c.stat()});return}var c=byId[m.id];if(!c||m.id!==c.id)return;
  if(m.type==='rand'){if(m.none){c.line('No moment came back. Try again.');return}c.q='';c.paint(m,0,1);return}c.paint(m)};
var snip=function(e,s){var lab=s.src==='n'?'From the show notes':s.sp==='b'?'Brandon, from the episode transcript':'From the episode transcript (automatic captions)';
  return '<li>'+(s.src==='n'||!e.yt?'':'<button class="sr-at" type="button" data-at="'+(s.s|0)+'" aria-label="Play '+when(e).split(',')[0]+' from '+mmss(s.s)+' (loads YouTube)">'+mmss(s.s)+'</button>')+'<q>'+mark(s.x,s.h)+'</q><p class="sr-src">'+lab+'</p></li>'};
var rowHTML=function(r){var e=A.by[r.n],h='<p class="sr-ep">'+when(e)+'</p><h3 class="sr-t">'+esc(e.t)+'</h3>';
  if(r.sn.length)h+='<ul class="sr-sn">'+r.sn.map(function(s){return snip(e,s)}).join('')+'</ul>';
  h+='<p class="sr-acts">'+(e.yt&&!r.sn.some(function(s){return s.src!=='n'})?'<button class="tbtn sr-at" type="button" data-at="0" aria-label="Play '+when(e).split(',')[0]+' from the start (loads YouTube)">Play the episode</button>':'')
    +(!e.yt&&e.tr?'<a class="tlink is-quiet" href="'+esc(e.tr)+'" target="_blank" rel="noopener">Listen on the show&rsquo;s site&nbsp;<span class="sr-dom">(transistor.fm)</span><span class="sr"> (opens in a new tab)</span></a>':'')
    +'<a class="tlink is-quiet" href="'+ROOT+'podcast.html#ep-'+e.n+'">All links for this episode</a></p>';return h};
var openAt=function(b){var row=b.closest('[data-yt]');if(!row)return;$$('.sr-frame').forEach(function(f){f.remove()});BS.stopOthers&&BS.stopOthers(null);
  var s=+b.dataset.at||0,n=row.dataset.n,fr=d.createElement('div');fr.className='sr-frame';
  fr.innerHTML='<div class="sr-vid"><iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(row.dataset.yt)+'?start='+s+'&amp;autoplay=1&amp;rel=0" title="NWA Investing, Ep. '+esc(n)+', from '+mmss(s)+'" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div><button class="tbtn sr-x" type="button">Close the video</button>';
  row.appendChild(fr);rise(fr,0);$('.sr-x',fr).addEventListener('click',function(){fr.remove();b.focus()});fr.scrollIntoView({block:'nearest',behavior:M()?'smooth':'auto'})};
var C=function(f){
  var c={f:f,id:0,q:'',lim:0,res:[],inp:$('input[type="search"]',f),town:f.dataset.searchTown||'',hid:$('input[name="t"]',f),big:f.classList.contains('is-big')};
  var per=c.big?6:3,out=$('.srch-out',f),pod=c.big&&$('#ep-all'),saved=null,tm=0;
  out.removeAttribute('aria-live');
  out.innerHTML='<p class="sr-stat" role="status" aria-live="polite"></p><span class="sr-bar" aria-hidden="true" hidden><i></i></span><ol class="sr-list"></ol><button class="btn btn-line sr-more" type="button" hidden></button>';
  var st=$('.sr-stat',out),bar=$('.sr-bar',out),list=$('.sr-list',out),more=$('.sr-more',out);
  var tws=c.big?A.towns.map(function(t){return t[0]}):c.town?[c.town]:[];
  if(tws.length){var tg=d.createElement('div');tg.className='sr-towns';tg.innerHTML='<div class="toggles" role="group" aria-label="Filter the show by town">'+tws.map(function(s){return '<button class="tog" type="button" data-t="'+s+'">'+esc(townName(s))+'</button>'}).join('')+'<button class="tog" type="button" data-t="">All towns</button></div>';
    var help=$('.help',f);f.insertBefore(tg,help?help.nextSibling:out);var row=$('.toggles',tg);
    var setT=function(){$$('.tog',row).forEach(function(b){b.setAttribute('aria-pressed',b.dataset.t===c.town?'true':'false')});BS.glide(row)};
    $$('.tog',row).forEach(function(b){b.addEventListener('click',function(){c.town=b.dataset.t;if(c.hid)c.hid.value=c.town;setT();b.scrollIntoView({block:'nearest',inline:'nearest',behavior:M()?'smooth':'auto'});c.run(1)})});setT();c.setT=setT}
  c.line=function(t){st.textContent=t};
  c.stat=function(){var busy=c.id&&bOK&&got<of;bar.hidden=!busy;bar.firstChild.style.transform='scaleX('+(got/of)+')';if(busy)c.line('Searching '+A.ntr+' transcripts')};
  c.label=function(){return c.q||(c.town?townName(c.town):'')};
  c.paint=function(m,keep,rnd){c.res=m.res;if(!keep||!c.lim)c.lim=per;var n=m.n,keys={};
    if(!(bOK&&got<of)||rnd)c.line(!n?'No episode matches that yet. Try a town name, like Springdale.':rnd?'A random moment from the show.':n===1?'1 episode matches “'+c.label()+'”':n+' episodes match “'+c.label()+'”');c.stat();
    var old={};$$('.sr-row',list).forEach(function(li){old[li.dataset.n]=li});var k=0;
    m.res.slice(0,c.lim).forEach(function(r){var h=rowHTML(r),li=old[r.n];keys[r.n]=1;
      if(!li){li=d.createElement('li');li.className='sr-row';li.dataset.n=r.n;if(A.by[r.n].yt)li.dataset.yt=A.by[r.n].yt;li.innerHTML=h;li._h=h;list.appendChild(li);rise(li,k++)}
      else{if(li._h!==h&&!$('.sr-frame',li)){li.innerHTML=h;li._h=h}list.appendChild(li)}});
    Object.keys(old).forEach(function(n){if(!keys[n])old[n].remove()});
    var left=rnd?0:n-Math.min(n,c.lim);more.hidden=!left;more.textContent='Show more results ('+left+')';
    if(!bOK&&!rnd&&!$('.sr-b',out)){var b=d.createElement('button');b.className='tbtn sr-b';b.type='button';b.textContent='Also search the transcripts (about '+A.mb+' MB)';out.insertBefore(b,list);
      b.addEventListener('click',function(){bOK=true;b.remove();wk.postMessage({type:'b'});c.run(1)})}
    if(pod)filterList(m)};
  var filterList=function(m){var items=$$('.ep-line',pod),cnt=$('[data-count]');if(!saved)saved={h:items.map(function(li){return li.hidden}),t:cnt&&cnt.textContent};
    var hit={};m.res.forEach(function(r){hit[r.n]=1});items.forEach(function(li){li.hidden=!hit[li.id.slice(3)]});
    if(cnt)cnt.textContent=m.n?'Showing the '+(m.n===1?'episode that matches':m.n+' episodes that match')+' “'+c.label()+'”.':'No episode matches “'+c.label()+'”.'};
  var unfilter=function(){if(!saved)return;$$('.ep-line',pod).forEach(function(li,i){li.hidden=saved.h[i]});var cnt=$('[data-count]');if(cnt&&saved.t)cnt.textContent=saved.t;saved=null};
  c.clear=function(){c.id=0;c.res=[];list.innerHTML='';more.hidden=true;bar.hidden=true;c.line('');if(pod)unfilter()};
  c.run=function(now){clearTimeout(tm);var go=function(){c.q=c.inp.value.trim();if(c.big)try{var u=new URLSearchParams();if(c.q)u.set('q',c.q);if(c.town)u.set('t',c.town);history.replaceState(null,'',location.pathname+(String(u)?'?'+u:''))}catch(x){}
    if(!c.q&&!c.town||(c.q&&c.q.replace(/\s/g,'').length<2&&!c.town)){c.clear();return}
    c.id=++qid;byId[c.id]=c;c.stat();wk.postMessage({type:'q',id:c.id,q:c.q,t:c.town,b:bOK})};if(now)go();else tm=setTimeout(go,120)};
  c.rand=function(){c.id=++qid;byId[c.id]=c;if(!bOK){bOK=true;var b=$('.sr-b',out);b&&b.remove()}c.line('Finding a moment');wk.postMessage({type:'rand',id:c.id})};
  c.inp.addEventListener('input',function(){c.run()});
  f.addEventListener('submit',function(e){e.preventDefault();c.run(1)});
  more.addEventListener('click',function(){var first=c.lim;c.lim+=per;c.paint({res:c.res,n:c.res.length},1);var li=$$('.sr-row',list)[first];if(li){li.tabIndex=-1;li.focus({preventScroll:false})}});
  var r=$('[data-search-random]',f);if(r)r.hidden=false;
  ctl.push(c);return c};
var bootP=null,boot=function(){if(!bootP){bootP=getA().then(function(){var qp=new URLSearchParams(location.search);
  $$('[data-search]').forEach(function(f){var c=f._c=C(f);if(c.big&&(qp.get('q')||qp.get('t'))){c.inp.value=qp.get('q')||'';var t=qp.get('t');if(t&&A.towns.some(function(x){return x[0]===t})){c.town=t;c.setT&&c.setT()}c.run(1)}else if(c.inp.value.trim())c.run(1)});
  W.addEventListener('resize',function(){$$('.sr-towns .toggles').forEach(BS.glide)},{passive:true})});BS.searchReady=aP}return bootP};
var press=function(b){if(b.matches('[data-at]'))openAt(b);else boot().then(function(){var f=b.closest('[data-search]'),c=f&&f._c;c&&c.rand()})};
BS.search={press:press,boot:boot};
d.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-at],[data-search-random]');if(b){e.preventDefault();press(b)}});
if(!BS.searchIdle)boot();
})();
