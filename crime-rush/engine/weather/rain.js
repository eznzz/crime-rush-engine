// Mutually exclusive weather roll per page load; manual preview override.
window.DriveRain=(()=>{
 const roll=Math.random(),mode=document.getElementById('rainMode');
 let weather=roll<.04?'storm':roll<.14?'rain':'clear',remaining=weather==='clear'?20:18+Math.random()*22;
 function tick(dt){if(mode.value!=='auto')return;remaining-=dt;if(remaining>0)return;if(weather!=='clear'){weather='clear';remaining=20;return;}const n=Math.random();weather=n<.04?'storm':n<.14?'rain':'clear';remaining=weather==='clear'?10:18+Math.random()*22;}
 const current=()=>mode.value==='auto'?weather:mode.value;
 const isStorm=()=>current()==='storm';
 const drops=Array.from({length:690},()=>({x:Math.random(),y:Math.random(),v:.65+Math.random()*.65,l:5+Math.random()*9}));
 let opacity=0;const streaks=new Map();function streak(len,step){const key=len+':'+step;if(streaks.has(key))return streaks.get(key);const cv=document.createElement('canvas');cv.width=Math.floor((len-1)/step)+1;cv.height=len;const ctx=cv.getContext('2d');ctx.fillStyle='#d6e3e8';for(let k=0;k<len;k++)ctx.fillRect(cv.width-1-Math.floor(k/step),k,1,1);streaks.set(key,cv);return cv;}
 function draw(c,dt,W,H,kmh){
  const storm=isStorm(),active=current()!=='clear';
  opacity+=(Number(active)-opacity)*Math.min(1,dt*3);
  if(opacity<.005)return;
  c.save();c.globalAlpha=opacity*(storm?.26:.12);c.fillStyle='#52677b';c.fillRect(0,0,W,H);
  const experimental=!!window.CrimeRushAtmosphere?.get();const count=storm?(experimental?(W>1000?690:620):465):155;
  for(let i=0;i<count;i++){const d=drops[i];
   d.y=(d.y+dt*d.v*(.65+kmh/200)*(storm?1.7:1))%1;d.x=((d.x-dt*(storm?.32:.12)*d.v)%1+1)%1;
   const x=Math.round(d.x*W),y=Math.round(d.y*H),len=Math.round(d.l*(storm?1.55:1));
   c.globalAlpha=opacity*(.16+.12*d.v)*(storm?1.35:1);c.fillStyle='#d6e3e8';
   const art=streak(len,storm?2:3);c.drawImage(art,x-art.width+1,y);
  }c.restore();
 }
 function reset(force=null){const n=Math.random();weather=force||(n<.04?'storm':n<.14?'rain':'clear');remaining=weather==='clear'?20:18+Math.random()*22;mode.value='auto';opacity=weather==='clear'?0:1;}return {draw,isStorm,current,tick,reset};
})();
