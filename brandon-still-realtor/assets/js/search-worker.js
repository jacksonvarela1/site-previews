'use strict';
var E=[],T=[],W=[],base='',files=[],got=0,asked=false,cur=null;
var norm=function(s){return ' '+String(s).toLowerCase().replace(/[‘’ʼ'`]/g,'').replace(/[^a-z0-9]+/g,' ').trim()+' '};
var esc=function(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')};
var stem=function(t){if(t.length>4&&/(x|ch|sh|ss)es$/.test(t))return t.slice(0,-2);if(t.length>3&&/[^s]s$/.test(t))return t.slice(0,-1);return t};
var term=function(w,phrase){var ws=w.split(' ').filter(Boolean);if(!ws.length)return null;var last=stem(ws[ws.length-1]),short=!phrase&&last.length<=3;
  var nd=' '+ws.slice(0,-1).concat([last]).join(' ')+(short?' ':'');
  var rx=ws.slice(0,-1).map(esc).concat([esc(last)+(short?'s?\\b':'[\\w’\']*')]).join('[^A-Za-z0-9]+');
  return {nd:nd,ph:ws.length>1,re:new RegExp('\\b'+rx,'gi'),alt:short?' '+last+'s ':null}};
var has=function(k,t){return k.indexOf(t.nd)>-1||(t.alt&&k.indexOf(t.alt)>-1)};
var parse=function(q){var ts=[],s=' '+norm(q.replace(/"([^"]+)"/g,function(_,p){var t=term(norm(p).trim(),1);t&&ts.push(t);return ' '}))+' ';
  T.forEach(function(tw){var n=' '+tw[1].toLowerCase()+' ';if(n.split(' ').length>3&&s.indexOf(n)>-1){s=s.replace(n,' ');ts.push(term(n.trim(),1))}});
  s.trim().split(/\s+/).forEach(function(w){if(w){var t=term(w);t&&ts.push(t)}});return ts};
var all=function(k,ts){for(var i=0;i<ts.length;i++)if(!has(k,ts[i]))return false;return true};
var hl=function(x,ts){var r=[];ts.forEach(function(t){t.re.lastIndex=0;var m;while((m=t.re.exec(x))){r.push([m.index,m.index+m[0].length]);if(!m[0].length)t.re.lastIndex++}});
  r.sort(function(a,b){return a[0]-b[0]});var o=[];r.forEach(function(p){var l=o[o.length-1];if(l&&(p[0]<=l[1]||p[0]-l[1]===1&&/[\s-]/.test(x.charAt(l[1]))))l[1]=Math.max(l[1],p[1]);else o.push(p.slice())});return o};
var cut=function(x,ts){var h=hl(x,ts),ws=x.split(' ');if(ws.length>34&&h.length){var at=x.slice(0,h[0][0]).split(' ').length-1,a=Math.max(0,Math.min(at-10,ws.length-30));
  x=((a>0?'…':'')+ws.slice(a,a+30).join(' ')+(a+30<ws.length?'…':'')).replace(/…(\s*…)+/g,'…');h=hl(x,ts)}return {x:x,h:h}};
var townOf=function(slug){for(var i=0;i<T.length;i++)if(T[i][0]===slug)return T[i];return null};
var run=function(){if(!cur)return;var q=cur.q||'',tw=cur.t?townOf(cur.t):null,ts=parse(q),tt=tw?tw[2].map(function(p){return term(p,1)}):null;
  if(!ts.length&&!tt){postMessage({type:'r',id:cur.id,res:[],n:0,got:got,of:files.length});return}
  var t0=Date.now(),by={},inTown=function(k){return tt.some(function(t){return has(k,t)})},ph=ts.some(function(t){return t.ph})||ts.length>1;
  E.forEach(function(e){var sc=0;if(ts.length){if(all(e.kt,ts))sc=3;else if(all(e.ka,ts))sc=2}
    if(tt){var tin=e.towns&&e.towns.indexOf(cur.t)>-1||inTown(e.ka);if(!tin)e._tin=0;else e._tin=1;if(!ts.length&&tin)sc=2}
    by[e.n]={n:e.n,sc:sc,w:[],nt:ts.length&&e.kn&&all(e.kn,ts)?1:0}});
  var qs=ts.length?ts:tt,pj=' '+ts.map(function(t){return t.nd.trim()}).join(' ');
  for(var i=0;i<W.length;i++){var w=W[i];if(ts.length?!all(w.k,ts):!inTown(w.k))continue;var r=by[w.e];if(!r)continue;
    var s=1+(ph&&ts.length&&w.k.indexOf(pj)>-1?1:0)+(w.sp==='b'?1:0);r.w.push([s,w])}
  var res=[];E.forEach(function(e){var r=by[e.n],best=0;r.w.forEach(function(p){if(p[0]>best)best=p[0]});
    if(tt&&!e._tin&&!r.w.some(function(p){return inTown(p[1].k)}))return;
    var sc=r.sc+best;if(!sc)return;r.w.sort(function(a,b){return b[0]-a[0]||a[1].s-b[1].s});
    var ww=r.w.filter(function(p){return p[1].s>=30});if(!ww.length)ww=r.w;/* intro windows (0:00) only when they are the episode's only hit */
    var sn=ww.slice(0,2).map(function(p){var c=cut(p[1].x,qs);return {s:p[1].s,x:c.x,h:c.h,sp:p[1].sp||''}});
    if(!sn.length&&r.nt){var c=cut(e.notes,ts);sn.push({x:c.x,h:c.h,src:'n'})}
    res.push({n:e.n,sc:sc,sn:sn,m:r.w.length})});
  res.sort(function(a,b){return b.sc-a.sc||b.n-a.n});
  postMessage({type:'r',id:cur.id,res:res,n:res.length,got:got,of:files.length,ms:Date.now()-t0})};
var loadB=function(){if(asked)return;asked=true;files.forEach(function(f){fetch(base+f).then(function(r){return r.json()}).then(function(a){
  a.forEach(function(w){w.k=norm(w.x);W.push(w)});got++;postMessage({type:'p',got:got,of:files.length});run();if(pend)rand(pend)}).catch(function(){got++;postMessage({type:'p',got:got,of:files.length,err:1})})})};
self.onmessage=function(m){var a=m.data;
  if(a.type==='init'){T=a.towns;base=a.base;files=a.shards;E=a.eps.map(function(e){e.kt=norm(e.t);e.kn=e.notes?norm(e.notes):'';e.ka=norm([e.t,e.g,e.notes||'',(e.tags||[]).join(' '),(e.towns||[]).map(function(s){var t=townOf(s);return t?t[1]:''}).join(' ')].join(' '));return e});return}
  if(a.type==='q'){cur=a;if(a.b&&((a.q||'').replace(/\s/g,'').length>=2||a.t))loadB();run();return}
  if(a.type==='b'){loadB();return}
  if(a.type==='rand')rand(a)};
var pend=null,rand=function(a){var pool=W.filter(function(w){return w.x.split(' ').length>=25});if(!pool.length){pend=a;loadB();if(got>=files.length)postMessage({type:'rand',id:a.id,none:1});return}pend=null;
  var w=pool[Math.floor(Math.random()*pool.length)];postMessage({type:'rand',id:a.id,res:[{n:w.e,sc:1,sn:[{s:w.s,x:w.x,h:[],sp:w.sp||''}],m:1}],n:1})};
