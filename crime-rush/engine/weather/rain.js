// Mutually exclusive weather roll per page load; manual preview override.
window.DriveRain=(()=>{
 const roll=Math.random(),mode=document.getElementById('rainMode');
 let weather=roll<.04?'storm':roll<.14?'rain':'clear',remaining=weather==='clear'?20:18+Math.random()*22;
 function tick(dt){if(mode.value!=='auto')return;remaining-=dt;if(remaining>0)return;if(weather!=='clear'){weather='clear';remaining=20;return;}const n=Math.random();weather=n<.04?'storm':n<.14?'rain':'clear';remaining=weather==='clear'?10:18+Math.random()*22;}
 const current=()=>{const p=window.CrimeRushAtmosphere?.get();return p?.dynamic?(p.precipitation>.7?'storm':p.precipitation>.005?'rain':'clear'):mode.value==='auto'?weather:mode.value;};
 const isStorm=()=>current()==='storm';
 const drops=Array.from({length:690},()=>({x:Math.random(),y:Math.random(),v:.65+Math.random()*.65,l:5+Math.random()*9}));
 let opacity=0;const streaks=new Map();function streak(len,step){const key=len+':'+step;if(streaks.has(key))return streaks.get(key);const cv=document.createElement('canvas');cv.width=Math.floor((len-1)/step)+1;cv.height=len;const ctx=cv.getContext('2d');ctx.fillStyle='#d6e3e8';for(let k=0;k<len;k++)ctx.fillRect(cv.width-1-Math.floor(k/step),k,1,1);streaks.set(key,cv);return cv;}
 function draw(c,dt,W,H,kmh){
  const p=window.CrimeRushAtmosphere?.get(),strength=p?.dynamic?p.precipitation:null,storm=isStorm(),active=current()!=='clear';
  opacity=strength===null?opacity+(Number(active)-opacity)*Math.min(1,dt*3):Math.min(1,strength/.4);
  if(opacity<.005)return;
  c.save();c.globalAlpha=opacity*(strength===null?(storm?.26:.12):.12+.14*Math.max(0,(strength-.4)/.6));c.fillStyle='#52677b';c.fillRect(0,0,W,H);
  const experimental=!!window.CrimeRushAtmosphere?.get();const max=W>1000?690:620;const count=strength===null?(storm?(experimental?max:465):155):Math.ceil(strength<=.4?155*strength/.4:155+(max-155)*(strength-.4)/.6);
  for(let i=0;i<count;i++){const d=drops[i],heavy=strength===null?Number(storm):Math.max(0,(strength-.4)/.6);
   d.y=(d.y+dt*d.v*(.65+kmh/200)*(1+.7*heavy))%1;d.x=((d.x-dt*(.12+.20*heavy)*d.v)%1+1)%1;
   const x=Math.round(d.x*W),y=Math.round(d.y*H),len=Math.round(d.l*(1+.55*heavy));
   c.globalAlpha=opacity*(.16+.12*d.v)*(1+.35*heavy);c.fillStyle='#d6e3e8';
   const art=streak(len,heavy>.5?2:3);c.drawImage(art,x-art.width+1,y);
  }c.restore();
 }
 function reset(force=null){const n=Math.random();weather=force||(n<.04?'storm':n<.14?'rain':'clear');remaining=weather==='clear'?20:18+Math.random()*22;mode.value='auto';opacity=weather==='clear'?0:1;}return {draw,isStorm,current,tick,reset};
})();
