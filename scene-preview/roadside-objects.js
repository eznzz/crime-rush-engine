// Replaceable roadside sprites and connected perspective geometry. Visual only.
window.RoadsideObjects=(()=>{
 const hash=n=>{const v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v)};
 const canvas=(w,h)=>{const a=document.createElement('canvas');a.width=w;a.height=h;return a};
 const rect=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
 const poly=(c,color,pts)=>{c.fillStyle=color;c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);c.closePath();c.fill()};
 // High-resolution pixel-painted assets. The raster master is independent of projection.
 const pixel=(c,col,x,y,w=1,h=1)=>{c.fillStyle=col;c.fillRect(x|0,y|0,w,h)};
 function line(c,x,y,xx,yy,col,w=1){const n=Math.max(Math.abs(xx-x),Math.abs(yy-y),1);for(let i=0;i<=n;i++)pixel(c,col,Math.round(x+(xx-x)*i/n),Math.round(y+(yy-y)*i/n),w,w)}
 const leaf=['#293b30','#354a38','#465a41','#596b49','#71805a','#89936b','#a2a780'];
 const stonePal=['#343c40','#454e51','#596265','#697376','#7d8584','#969a92','#b4b3a6'];
 const wood=['#3b3b38','#4c4841','#60584c','#776958','#8b7964','#a18b71','#b6a18a'];
 function rasterPoly(c,pts,paint){
  const minY=Math.floor(Math.min(...pts.map(p=>p[1]))),maxY=Math.ceil(Math.max(...pts.map(p=>p[1])));
  for(let y=minY;y<maxY;y++){const xs=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=y+.5&&b[1]>y+.5)||(b[1]<=y+.5&&a[1]>y+.5))xs.push(a[0]+(y+.5-a[1])*(b[0]-a[0])/(b[1]-a[1]))}xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2)for(let x=Math.ceil(xs[i]-.5);x<xs[i+1]-.5;x++)pixel(c,paint(x,y),x,y);}
 }
 const rocks=Array.from({length:4},(_,k)=>{
  const a=canvas(384,256),c=a.getContext('2d'),seed=k*1297;
  // Silhouette built from branching clusters, not a single geometric bush.
  for(let j=0;j<19;j++){
   const n=seed+j*137,x=45+hash(n)*290,y=92+hash(n+1)*94,r=18+hash(n+2)*30;
   line(c,Math.round(x),229,Math.round(x-9),Math.round(y),leaf[0],3);
   for(let i=0;i<8;i++){
    const n2=n+i*31,xx=x+(hash(n2+3)-.5)*r*2,yy=y+(hash(n2+4)-.5)*r*1.6,rr=8+hash(n2+5)*15;
    for(let py=Math.floor(yy-rr);py<yy+rr;py++)for(let px=Math.floor(xx-rr);px<xx+rr;px++){
     const u=(px-xx)/rr,v=(py-yy)/(rr*.73),t=hash(Math.floor(px/2)*73+Math.floor(py/2)*41+n2);
     if(u*u+v*v>1+.24*t||t<.13)continue;
     const l=Math.max(0,Math.min(6,Math.floor(2.7-v*1.7+t*2.1)));
     pixel(c,leaf[l],px,py);
    }
   }
  }
  const formations=[
   [[126,222,88,108],[252,235,66,72],[65,241,44,41]],
   [[203,229,100,142],[82,238,51,66],[304,241,49,51]],
   [[102,228,68,78],[237,232,97,106],[323,243,36,39]],
   [[164,231,110,90],[287,240,57,66],[62,242,36,45]]
  ][k];
  for(const [x,y,w,h] of formations){
   const p=[[x-w*.98,y-11],[x-w*.90,y-h*.48],[x-w*.47,y-h*.91],[x+w*.20,y-h],[x+w*.77,y-h*.74],[x+w,y-h*.26],[x+w*.81,y],[x-w*.67,y+3]];
   const ridge=[x-w*.12,y-h*.45],tip=[x+w*.20,y-h],left=[x-w*.90,y-h*.48],right=[x+w*.77,y-h*.74];
   const face=(pts,base)=>rasterPoly(c,pts,(xx,yy)=>{const grain=hash(Math.floor(xx/3)*59+Math.floor(yy/3)*91+seed),streak=hash(Math.floor((xx+yy*.48)/6)*117+seed);return stonePal[Math.max(0,Math.min(6,base+(grain>.86?1:grain<.13?-1:0)+(streak>.94?-1:0)))];});
   face(p,2);face([p[1],p[2],tip,right,ridge],5);face([p[0],left,ridge,p[7]],3);face([ridge,right,p[5],p[6],p[7]],2);face([p[2],tip,[x-w*.09,y-h*.76],left],6);
   for(let j=0;j<3;j++){const xx=Math.round(x-w*.34+j*w*.23),yy=Math.round(y-h*.36+j*h*.045);line(c,xx,yy,xx+Math.round(w*.12),yy+Math.round(h*.15),stonePal[1],2);line(c,xx+Math.round(w*.12),yy+Math.round(h*.15),xx+Math.round(w*.07),yy+Math.round(h*.24),stonePal[1]);}
   // Sparse moss flecks along the upper shoulder.
   for(let j=0;j<36;j++){const n=seed+j*97+x,xx=Math.round(x-w*.45+hash(n)*w*.8),yy=Math.round(y-h*.76+hash(n+1)*h*.15);if(hash(n+2)>.4)pixel(c,leaf[3+j%3],xx,yy,2+j%4,2);}
  }
  for(let i=0;i<155;i++){const n=seed+i*67,x=Math.floor(hash(n)*380),y=239+Math.floor(hash(n+1)*13),h=6+Math.floor(hash(n+2)*27),lean=Math.floor(hash(n+3)*25)-12;line(c,x,y,x+lean,y-h,leaf[1+i%5],1+i%2);if(i%23===0){pixel(c,'#d4d2b8',x+lean-2,y-h,5,2);pixel(c,'#e5dfc5',x+lean,y-h-2,2,6)}}
  return a;
 });
 function timber(c,x,y,w,h,seed){for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const n=hash(seed+Math.floor(xx/2)*13+Math.floor(yy/11)*37),side=xx/w;pixel(c,wood[Math.min(6,Math.max(0,(side<.15?5:side>.77?1:3)+(n>.82?1:n<.15?-1:0)))],x+xx,y+yy)}}
 const pole=canvas(264,600),pc=pole.getContext('2d');
 // Tapered weathered wooden shaft, steel straps, crossarms and ceramic insulators.
 rasterPoly(pc,[[122,9],[142,9],[150,598],[113,598]],(x,y)=>{const t=(x-113)/37,n=hash(Math.floor(x/2)*71+Math.floor(y/18)*31);return wood[Math.max(0,Math.min(6,(t<.36?5:t>.75?1:3)+(n>.83?1:n<.14?-1:0)))];});
 for(let i=0;i<10;i++){const x=124+i*2,y=16+Math.floor(hash(i*71)*420);line(pc,x,y,x-1,y+35+Math.floor(hash(i+17)*87),wood[i%2?2:4]);}
 for(const y of [78,168]){
  timber(pc,15,y,234,18,y*31);
  for(const side of [-1,1]){const x=132+side*89;line(pc,x,y+17,132,y+79,wood[1],7);line(pc,x,y+17,132,y+79,wood[4],2);}
  for(const x of [36,132,228]){
   pixel(pc,'#404848',x-3,y-27,7,29);
   for(let j=0;j<4;j++){const yy=y-29+j*5;pixel(pc,'#75837f',x-10,yy,20,4);pixel(pc,'#b7c3b9',x-8,yy,16,2);pixel(pc,'#d2d9cb',x-7,yy,5,2);}
   pixel(pc,'#cbd3c5',x-5,y-39,10,11);pixel(pc,'#e0e2d4',x-3,y-39,4,5);
   pixel(pc,'#4c5351',x-5,y+6,9,8);pixel(pc,'#a1a49a',x-3,y+7,3,3);
  }
  pixel(pc,'#555d59',114,y+20,37,8);pixel(pc,'#9ba39b',115,y+20,35,2);
 }
 for(const y of [288,467]){pixel(pc,'#4d5350',117,y,31,7);pixel(pc,'#a0a59c',118,y,29,2);}
 const post=canvas(24,64),fc=post.getContext('2d');timber(fc,5,5,14,59,31);pixel(fc,wood[5],6,3,12,3);
 for(const y of [17,43]){pixel(fc,'#3d4442',12,y,3,3);pixel(fc,'#aeb3a8',12,y,1,1)}
 const board=canvas(96,12),bc=board.getContext('2d');for(let y=0;y<12;y++)for(let x=0;x<96;x++){const n=hash(Math.floor(x/7)*71+y*13);pixel(bc,wood[Math.max(0,Math.min(5,(y<2?5:y>9?1:3)+(n>.8?1:n<.2?-1:0)))],x,y)}
 // Approved external WebP assets, with original raster fallback until uploaded.
 const assetBase=new URL('scenery/',document.currentScript.src);
 function loadHD(name){const image=new Image();image.src=new URL(name+'?v=27.60',assetBase).href;return image;}
 const hdPole=loadHD('utility-pole-hd.webp');
 const hdRocks=rocks.map((_,i)=>loadHD('rock-bush-hd-'+(i+1)+'.webp'));
 const ready=a=>a.complete&&a.naturalWidth>0;
 const POLE_HEIGHT=510,POLE_WIDTH=140,FENCE_SCALE=2,ROCK_SCALE=2.2;
 const fade=q=>Math.max(0,Math.min(1,(q-.035)/.17));
 const anchor=(project,z,side,lane)=>{const p=project(Math.max(0,z));return {x:p.center+side*p.half*lane,y:p.y,q:p.q,z}};
 const sprite=(c,a,x,y,w,h,alpha)=>{if(alpha<=0)return;c.globalAlpha=alpha;c.drawImage(a,Math.round(x-w/2),Math.round(y-h),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
 // Distance-based mist affects the entire silhouette, even above the horizon veil.
 const clamp01=v=>Math.max(0,Math.min(1,v));
 // Match the ground veil at the object's world depth, never its screen height.
 const mist=z=>{const f=clamp01((z-460)/950);return .58*f*f*(3-2*f);};
 const visibility=(q,z,depth)=>fade(q)*clamp01((depth-z)/240);
 const mistCanvas=document.createElement('canvas'),mistContext=mistCanvas.getContext('2d');
 function mistSprite(c,a,x,y,w,h,alpha,z){
  if(alpha<=0)return;
  const amount=mist(z),dw=Math.max(1,Math.round(w)),dh=Math.max(1,Math.round(h));
  if(amount<=0){sprite(c,a,x,y,w,h,alpha);return;}
  if(mistCanvas.width!==dw)mistCanvas.width=dw;
  if(mistCanvas.height!==dh)mistCanvas.height=dh;
  mistContext.globalCompositeOperation='source-over';mistContext.globalAlpha=1;mistContext.imageSmoothingEnabled=false;
  mistContext.clearRect(0,0,dw,dh);mistContext.drawImage(a,0,0,dw,dh);
  mistContext.globalCompositeOperation='source-atop';mistContext.globalAlpha=amount*.16;mistContext.fillStyle='#8f9088';mistContext.fillRect(0,0,dw,dh);
  mistContext.globalAlpha=amount*.42;mistContext.fillStyle='#f3f4ef';mistContext.fillRect(0,0,dw,dh);
  mistContext.globalAlpha=1;mistContext.globalCompositeOperation='source-over';
  sprite(c,mistCanvas,x,y,w,h,alpha*(1-amount*.22));
 }
 function wireSpans(distance,depth,step){
  const spans=[];
  for(let i=Math.floor((distance+depth)/step);i>=Math.floor(distance/step);i--){
   const start=i*step-distance,end=start+step,from=Math.max(0,start),to=Math.min(depth,end);
   if(to>from)spans.push({start,end,from,to});
  }
  return spans;
 }
 function power(c,project,distance,depth,W){
  const step=1040,side=1,lane=1.33,first=Math.floor(distance/step),last=Math.ceil((distance+depth)/step);
  // Same world-space anchor for poles and the three sagging cables.
  const useHD=ready(hdPole),poleArt=useHD?hdPole:pole,poleWidth=useHD?POLE_HEIGHT*hdPole.naturalWidth/hdPole.naturalHeight:POLE_WIDTH;
  const insulators=useHD?[[34/232-.5,35/475],[73/232-.5,39/475],[205/232-.5,32/475]]:[[-96/264,13/200],[0,13/200],[96/264,13/200]];
  const points=[];
  for(let i=first;i<=last;i++){const z=i*step-distance;if(z<0||z>depth)continue;const p=anchor(project,z,side,lane);points.push(p)}
  // Keep the section of every span intersecting the visible depth, even if its pole is outside it.
  for(const span of wireSpans(distance,depth,step)){
   for(const [u,v] of insulators){
    const cablePoint=z=>{const p=anchor(project,z,side,lane),t=(z-span.start)/step;return {x:p.x+u*poleWidth*p.q,y:p.y-(1-v)*POLE_HEIGHT*p.q+Math.sin(Math.PI*t)*78*p.q,q:p.q};};
    const count=Math.max(1,Math.ceil((span.to-span.from)/20));
    for(let j=0;j<count;j++){
     const z0=span.from+(span.to-span.from)*j/count,z1=span.from+(span.to-span.from)*(j+1)/count,mid=(z0+z1)/2,a=cablePoint(z0),b=cablePoint(z1),p=anchor(project,mid,side,lane);
     const f=mist(mid),rgb=[83,92,88].map((v,i)=>Math.round(v+([243,244,239][i]-v)*f*.42));
     c.globalAlpha=visibility(p.q,mid,depth)*.82*(1-f*.22);c.strokeStyle='rgb('+rgb.join(',')+')';c.lineWidth=1;
     c.beginPath();c.moveTo(Math.round(a.x),Math.round(a.y));c.lineTo(Math.round(b.x),Math.round(b.y));c.stroke();
    }
   }
  }
  for(let i=points.length-1;i>=0;i--){const p=points[i];if(p.x+poleWidth*.5*p.q<0||p.x-poleWidth*.5*p.q>W)continue;mistSprite(c,poleArt,p.x,p.y,poleWidth*p.q,POLE_HEIGHT*p.q,visibility(p.q,p.z,depth),p.z)}

 }
 function fence(c,project,distance,depth,W,fieldPlot){
  const step=55,first=Math.floor(distance/step),last=Math.ceil((distance+depth)/step);
  for(let i=last;i>=first;i--)for(const side of [-1,1]){
   const world=i*step,z=world-distance;if(z<0||z>depth)continue;
   const aPlot=fieldPlot(world,side),bPlot=fieldPlot(world+step,side);
   if(!aPlot.active||hash(aPlot.n+81)<.28)continue;
   const lane=1.45,p=anchor(project,z,side,lane);
   if(bPlot.active&&aPlot.n===bPlot.n&&z+step<=depth){
    const q=anchor(project,z+step,side,lane);
    c.globalAlpha=Math.min(fade(p.q),fade(q.q));
    for(const h of [11,25])for(let j=0;j<12;j++){
      const aa=anchor(project,z+step*j/12,side,lane),bb=anchor(project,z+step*(j+1)/12,side,lane);
      const ax=aa.x,ay=aa.y-(h+5)*FENCE_SCALE*aa.q,bx=bb.x,by=bb.y-(h+5)*FENCE_SCALE*bb.q;
      c.save();c.transform((bx-ax)/8,(by-ay)/8,0,Math.max(1,5*FENCE_SCALE*(aa.q+bb.q)/2)/12,ax,ay);
      c.drawImage(board,j*8,0,8,12,0,0,8.3,12);c.restore();
    }
   }
   if(p.x+12*FENCE_SCALE*p.q>=0&&p.x-12*FENCE_SCALE*p.q<=W)sprite(c,post,p.x,p.y,15*FENCE_SCALE*p.q,40*FENCE_SCALE*p.q,fade(p.q));
  }
 }
 function stone(c,project,distance,depth,W){
  const step=310,first=Math.floor(distance/step),last=Math.ceil((distance+depth)/step);
  for(let i=last;i>=first;i--)for(const side of [-1,1]){
   const n=i*173+side*53;if(hash(n)<.95)continue;
   const z=i*step+hash(n+1)*step-distance;if(z<0||z>depth)continue;
   const p=anchor(project,z,side,1.27+hash(n+2)*.13),index=Math.floor(hash(n+3)*rocks.length),a=ready(hdRocks[index])?hdRocks[index]:rocks[index],w=(84+hash(n+4)*38)*ROCK_SCALE*p.q,h=w*a.height/a.width;
   const road=project(z),edge=road.center+side*road.half;
   p.x=edge+side*Math.max(Math.abs(p.x-edge),w/2+3);
   if(p.x+w/2<0||p.x-w/2>W)continue;
   // Ground-level rocks already receive the scene mist; avoid a second white overlay.
   sprite(c,a,p.x,p.y,w,h,clamp01((depth-z)/240));
  }
 }
 function drawGround(c,project,distance,depth,W,controls,fieldPlot){
  c.save();c.imageSmoothingEnabled=false;
  if(controls.fence.checked&&controls.fields.checked)fence(c,project,distance,depth,W,fieldPlot);
  if(controls.rocks.checked)stone(c,project,distance,depth,W);
  c.restore();
 }
 function drawPower(c,project,distance,depth,W,controls){
  if(!controls.power.checked)return;
  c.save();c.imageSmoothingEnabled=false;power(c,project,distance,depth,W);c.restore();
 }
 return {drawGround,drawPower};
})();
