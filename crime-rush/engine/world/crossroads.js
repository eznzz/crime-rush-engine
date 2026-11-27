// Independent, deterministic empty crossroads in world coordinates.
window.DriveCrossroads=(()=>{
 const SLOT=4800,CHANCE=.10,HALF=95,ZEBRA=26*2.3*2,GAP=18;
 const control=document.getElementById('showCrossroads');
 const hash=n=>{const v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v);};
 function spans(from,to,margin=0){
  if(!control.checked)return [];
  const result=[];
  for(let i=Math.max(0,Math.floor((from-margin-HALF)/SLOT)-1);i<=Math.ceil((to+margin+HALF)/SLOT);i++){
   if(hash(i*37+892)>=CHANCE)continue;
   const center=i*SLOT+SLOT*(.25+.5*hash(i*37+893)),a=center-HALF,b=center+HALF;
   if(a-margin<=to&&b+margin>=from)result.push({id:i,a,b,center});
  }return result;
 }
 const blocked=(world,margin=0)=>{if(!control.checked)return false;for(let i=Math.max(0,Math.floor((world-margin-HALF)/SLOT)-1);i<=Math.ceil((world+margin+HALF)/SLOT);i++){if(hash(i*37+892)>=CHANCE)continue;const center=i*SLOT+SLOT*(.25+.5*hash(i*37+893));if(Math.abs(world-center)<=HALF+margin)return true;}return false;};
 const intersects=(a,b,margin=0)=>spans(Math.min(a,b),Math.max(a,b),margin).length>0;
 function visible(distance,depth){return spans(distance,distance+depth,ZEBRA+GAP).map(s=>({...s,a:s.a-distance,b:s.b-distance}));}
 function draw(c,project,distance,depth,W){
  c.save();c.fillStyle='#5a6065';
  for(const s of visible(distance,depth)){
   const a=Math.max(0,s.a),b=Math.min(depth,s.b);if(b<=a)continue;
   // Horizontal side roads extend beyond the viewport, with the same ground plane as the highway.
   const y1=project(b).y,y2=project(a).y;
   c.fillRect(0,Math.floor(y1),W,Math.max(1,Math.ceil(y2)-Math.floor(y1)));
   // World-locked asphalt speckles across the full junction, no roadside vegetation.
   for(let z=Math.ceil((distance+a)/8)*8;z<distance+b;z+=8){
    const p=project(z-distance);if(p.q<.075)continue;
    const reach=Math.ceil(W/(Math.max(1,p.half)*2))+1;
    for(let j=-reach*16;j<=reach*16;j++){
     const n=Math.floor(z/8)*173+j*19;
     if(hash(n)<.35)continue;
     const x=p.center+p.half*(j/8+(hash(n+1)-.5)*.10);if(x<0||x>W)continue;
     c.fillStyle=['#4d5358','#53595e','#666d72','#747b7e'][Math.floor(hash(n+2)*4)];
     c.globalAlpha=.55*Math.min(1,(p.q-.075)/.18);
     c.fillRect(Math.round(x),Math.round(p.y),Math.max(1,Math.round(4*p.q)),1);
    }
   }c.globalAlpha=1;c.fillStyle='#5a6065';
  }c.restore();
 }
 function markings(distance,depth,worn){
  for(const s of visible(distance,depth)){
   for(const [start,end] of [[s.a-GAP-ZEBRA,s.a-GAP],[s.b+GAP,s.b+GAP+ZEBRA]]){
    const a=Math.max(0,start),b=Math.min(depth,end);if(b<=a)continue;
    for(let j=0;j<12;j++){const l=-.94+j*(1.88/12);worn(a,b,l,l+.095,'#deded6',97+j*7,true);}
   }
  }
 }
 return {blocked,intersects,visible,draw,markings,markingMargin:ZEBRA+GAP+2};
})();
