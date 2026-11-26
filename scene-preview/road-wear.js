// Sparse, deterministic world-space asphalt wear. Visual only.
window.RoadWear=(()=>{
 const hash=n=>{const v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v)};
 const step=105;
 function draw(c,project,distance,depth,width){
  const first=Math.floor((distance-100)/step),last=Math.ceil((distance+depth)/step);
  c.save();c.imageSmoothingEnabled=false;
  for(let i=last;i>=first;i--){
   const n=i*173,kind=hash(n+1);if(kind>.76)continue;
   const z=i*step+hash(n+2)*step-distance;
   if(z<-80||z>depth)continue;
   const lane=(Math.floor(hash(n+3)*4)-1.5)*.5+(hash(n+4)-.5)*.16;
   const q=project(Math.max(0,z)).q;
   if(q<.075)continue;
   const P=(u,v)=>{const p=project(Math.max(0,z+v));return [Math.round(p.center+p.half*Math.max(-.94,Math.min(.94,lane+u))),Math.round(p.y)]};
   const polygon=(pts,color)=>{c.fillStyle=color;c.beginPath();c.moveTo(...P(...pts[0]));for(const p of pts.slice(1))c.lineTo(...P(...p));c.closePath();c.fill()};
   // Rasterized stepped crack segments; no antialiased outlines.
   const line=(a,b,color,thick=1)=>{let [x,y]=P(...a),[ex,ey]=P(...b);const dx=Math.abs(ex-x),dy=-Math.abs(ey-y),sx=x<ex?1:-1,sy=y<ey?1:-1;let e=dx+dy;c.fillStyle=color;for(let k=0;k<1000;k++){if(x>=0&&x<width)c.fillRect(x,y,thick,thick);if(x===ex&&y===ey)break;const t=2*e;if(t>=dy){e+=dy;x+=sx}if(t<=dx){e+=dx;y+=sy}}};
   c.globalAlpha=Math.min(.9,Math.max(0,(q-.075)/.2));
   if(kind<.28){
    const w=.035+hash(n+5)*.055,d=20+hash(n+6)*38;
    const shape=[[-w,-d*.48],[-w*.35,-d*.56],[w*.65,-d*.46],[w,-d*.18],[w*.86,d*.45],[-w*.72,d*.55],[-w,d*.22]];
    polygon(shape,'#5c5460');polygon(shape.map(([x,y])=>[x*.86,y*.87]),hash(n+7)>.5?'#665e68':'#81747a');
    for(let j=0;j<6;j++){const p=P((hash(n+j*19+10)-.5)*w*1.4,(hash(n+j*19+11)-.5)*d*.7);c.fillStyle=j%2?'#847a80':'#5d5560';c.fillRect(p[0],p[1],Math.max(1,Math.round(q*2)),1)}
   }else if(kind<.60){
    const w=.035+hash(n+8)*.095,d=18+hash(n+9)*25,pts=[];
    for(let j=0;j<7;j++)pts.push([(j/6-.5)*w*2+(hash(n+j*13+12)-.5)*.022,(j/6-.5)*d+(hash(n+j*13+13)-.5)*12]);
    const t=q>.7?2:1;for(let j=1;j<pts.length;j++)line(pts[j-1],pts[j],'#4b444e',t);
    const a=pts[3],branch=[a,[a[0]-.018,a[1]+9],[a[0]-.033,a[1]+15]];for(let j=1;j<branch.length;j++)line(branch[j-1],branch[j],'#574f5a');
   }else{
    // Worn aggregate and short tar-filled repair seam.
    for(let j=0;j<14;j++){const p=P((hash(n+j*11+20)-.5)*.13,(hash(n+j*11+21)-.5)*35);c.fillStyle=j%3===0?'#8c8085':'#625b65';c.fillRect(p[0],p[1],Math.max(1,Math.round(q*(1+hash(n+j+24)*4))),1)}
    line([-.045,-8],[-.009,3],'#5d5560');line([-.009,3],[.034,6],'#5d5560');
   }
  }
  c.restore();
 }
 return {draw};
})();
