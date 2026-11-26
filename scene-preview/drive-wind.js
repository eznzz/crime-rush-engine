// Subtle pixel-art wake behind the player, using displayed km/h, not physics units.
window.DriveWind=(()=>{
 const particles=[];let timer=0,phase=0;
 function update(dt,kmh,x,y,w,h,enabled){
  if(!enabled){particles.length=0;timer=0;return;}
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.age+=dt;if(p.age>=p.life)particles.splice(i,1);}
  if(kmh<=120||!w||!h){timer=0;return;}
  const strength=Math.min(1,(kmh-120)/20);
  phase+=dt*9;timer-=dt;if(timer>0)return;timer=.065-strength*.025;
  for(const side of [-1,1]){
   particles.push({x:x+side*w*.35,y:y-h*.06,side,w,h,age:0,life:.35+strength*.18,phase:phase+side*Math.PI,strength});
  }
  if(particles.length>36)particles.splice(0,particles.length-36);
 }
 function draw(c){
  c.save();c.imageSmoothingEnabled=false;
  for(const p of particles){
   const f=p.age/p.life,fade=(1-f)*Math.min(1,f*9),spread=p.w*(.10+.31*f);
   const x=p.x+p.side*spread*f+Math.sin(p.phase+f*6)*p.w*.035*f,y=p.y+f*p.h*.46;
   const n=Math.max(3,Math.round(p.w*(.035+.045*f))),k=Math.max(1,Math.round(p.h*.012));
   c.globalAlpha=fade*(.13+.22*p.strength);c.fillStyle='#e3e9e7';
   for(let i=0;i<n;i++){const u=i/n,xx=Math.round(x+p.side*i),yy=Math.round(y+i*.38+Math.sin(u*3)*k);c.fillRect(xx,yy,1,k);}
   c.globalAlpha*=.55;c.fillStyle='#a7bbc5';c.fillRect(Math.round(x-p.side*n*.45),Math.round(y-3*k),Math.max(2,Math.round(n*.55)),k);
  }
  c.restore();
 }
 return {update,draw};
})();
