// Intermittent pixel sparks from the lowered player car. Visual only.
window.DriveSparks=(()=>{
 const particles=[];
 const rand=(a,b)=>a+Math.random()*(b-a);
 let gap=.35,burst=0,emit=0;
 function clear(){particles.length=0;gap=.35;burst=0;emit=0;}
 function update(dt,speed,px,py,h,w,flip,angle){
  if(speed<=0){clear();return;}
  const intensity=Math.min(1,speed/85);
  for(let i=particles.length-1;i>=0;i--){
   const p=particles[i];p.age+=dt;
   if(p.age>=p.life){particles.splice(i,1);continue;}
   p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=105*dt;
   p.vx*=Math.pow(.45,dt);
  }
  if(burst<=0){
   gap-=dt*(.45+.55*intensity);
   if(gap<=0){burst=rand(.12,.31);emit=0;gap=rand(.36,1.05);}
  }
  if(burst>0){
   burst-=dt;emit+=dt*(35+35*intensity);
   const dir=flip?-1:1;
   while(emit>=1&&particles.length<100){
    emit--;
    const offset=angle?-.10*dir:0;
    particles.push({
     x:px+w*(offset+rand(-.18,.18)),y:py-h*rand(.008,.055),
     vx:rand(-48,48)-dir*angle*1.1,vy:rand(34,95)*(.65+.35*intensity),
     age:0,life:rand(.12,.34),size:Math.random()>.82?2:1
    });
   }
  }
 }
 function draw(c){
  c.save();
  for(const p of particles){
   const f=1-p.age/p.life;
   c.globalAlpha=Math.min(1,f*1.5);
   const x=Math.round(p.x),y=Math.round(p.y);
   c.fillStyle=f>.65?'#fff0ae':f>.30?'#ffb54b':'#bd592d';
   c.fillRect(x,y,p.size,p.size);
   if(f>.3){
    c.globalAlpha=f*.7;c.fillStyle='#f18b32';
    c.fillRect(x-Math.sign(p.vx),y-2,1,2);
   }
  }
  c.restore();
 }
 return {update,draw,clear};
})();
