// One weather roll per page load; optional manual override for preview testing.
window.DriveRain=(()=>{
 const rainy=Math.random()<.30,mode=document.getElementById('rainMode');
 const drops=Array.from({length:155},()=>({x:Math.random(),y:Math.random(),v:.65+Math.random()*.65,l:5+Math.random()*9}));
 let opacity=0;
 function draw(c,dt,W,H,kmh){
  const active=mode.value==='rain'||(mode.value==='auto'&&rainy);
  opacity+=(Number(active)-opacity)*Math.min(1,dt*3);
  if(opacity<.005)return;
  c.save();c.globalAlpha=opacity*.12;c.fillStyle='#52677b';c.fillRect(0,0,W,H);
  for(const d of drops){
   d.y=(d.y+dt*d.v*(.65+kmh/200))%1;d.x=((d.x-dt*.12*d.v)%1+1)%1;
   const x=Math.round(d.x*W),y=Math.round(d.y*H),len=Math.round(d.l);
   c.globalAlpha=opacity*(.16+.12*d.v);c.fillStyle='#d6e3e8';
   for(let k=0;k<len;k++)c.fillRect(x-Math.floor(k/3),y+k,1,1);
  }
  c.restore();
 }
 return {draw};
})();
