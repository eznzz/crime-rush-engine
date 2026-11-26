// Mutually exclusive weather roll per page load; manual preview override.
window.DriveRain=(()=>{
 const roll=Math.random(),weather=roll<.04?'storm':roll<.14?'rain':'clear',mode=document.getElementById('rainMode');
 const current=()=>mode.value==='auto'?weather:mode.value;
 const isStorm=()=>current()==='storm';
 const drops=Array.from({length:465},()=>({x:Math.random(),y:Math.random(),v:.65+Math.random()*.65,l:5+Math.random()*9}));
 let opacity=0;
 function draw(c,dt,W,H,kmh){
  const storm=isStorm(),active=current()!=='clear';
  opacity+=(Number(active)-opacity)*Math.min(1,dt*3);
  if(opacity<.005)return;
  c.save();c.globalAlpha=opacity*(storm?.26:.12);c.fillStyle='#52677b';c.fillRect(0,0,W,H);
  const count=storm?465:155;
  for(let i=0;i<count;i++){const d=drops[i];
   d.y=(d.y+dt*d.v*(.65+kmh/200)*(storm?1.7:1))%1;d.x=((d.x-dt*(storm?.32:.12)*d.v)%1+1)%1;
   const x=Math.round(d.x*W),y=Math.round(d.y*H),len=Math.round(d.l*(storm?1.55:1));
   c.globalAlpha=opacity*(.16+.12*d.v)*(storm?1.35:1);c.fillStyle='#d6e3e8';
   for(let k=0;k<len;k++)c.fillRect(x-Math.floor(k/(storm?2:3)),y+k,1,1);
  }c.restore();
 }
 return {draw,isStorm};
})();
