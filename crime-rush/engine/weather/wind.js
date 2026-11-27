// Straight pixel airflow streaks over the roof and beside the body.
window.DriveWind=(()=>{
 let phase=0,state=null,alpha=0;
 function update(dt,kmh,x,y,w,h,enabled,intensity=1){
  const target=enabled&&kmh>120&&w&&h?Math.min(1,(kmh-120)/20):0;
  alpha+=(target-alpha)*Math.min(1,dt*9);phase=(phase+dt*(2+target*3)*(intensity>1?1.7:1))%1;
  if(!enabled){alpha=0;state=null;return;}state={x,y,w,h,intensity};
 }
 function draw(c){
  if(!state||alpha<.01)return;
  const {x,y,w,h,intensity}=state;c.save();c.fillStyle='#e0e8e8';
  const streams=[[-.34,-.93,-.20,.40],[.34,-.93,.20,.40],[-.53,-.70,-.24,.53],[.53,-.70,.24,.53],[-.55,-.34,-.16,.43],[.55,-.34,.16,.43]];
  if(intensity>1)streams.push([-.18,-1.03,-.14,.37],[.18,-1.03,.14,.37],[-.62,-.86,-.24,.58],[.62,-.86,.24,.58]);
  for(const [u,v,dx,dy] of streams){
   const count=Math.max(1,Math.round(2*intensity));
   for(let i=0;i<count;i++){const f=(phase+i/count+Math.abs(u)*.7)%1,fade=Math.min(1,f*5,(1-f)*5);
    c.globalAlpha=alpha*fade*(intensity<1?.045:.38);
    const sx=x+w*(u+dx*f),sy=y+h*(v+dy*f),n=Math.max(4,Math.round(h*.14*(intensity>1?1.35:intensity<1?.65:1)));
    for(let k=0;k<n;k++){const q=k/n;c.fillRect(Math.round(sx+w*dx*.28*q),Math.round(sy+h*dy*.28*q),1,1);}
   }
  }c.restore();
 }
 return {update,draw};
})();
