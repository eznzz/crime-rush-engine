// Replaceable roadside sprites and connected perspective geometry. Visual only.
window.RoadsideObjects=(()=>{
 const hash=n=>{const v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v)};
 const canvas=(w,h)=>{const a=document.createElement('canvas');a.width=w;a.height=h;return a};
 const rect=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
 const poly=(c,color,pts)=>{c.fillStyle=color;c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);c.closePath();c.fill()};
 // Three distinct rock-and-bush silhouettes, cached as transparent pixel sprites.
 const rocks=Array.from({length:3},(_,k)=>{
  const a=canvas(48,32),c=a.getContext('2d');
  const n=k*71;
  for(let i=0;i<8;i++){
   const x=5+Math.floor(hash(n+i*19)*37),y=11+Math.floor(hash(n+i*19+1)*12),w=5+Math.floor(hash(n+i*19+2)*9);
   poly(c,'#435541',[[x-4,y+7],[x-5,y+2],[x-2,y-4],[x+3,y-7],[x+w,y-2],[x+w+2,y+4],[x+w-1,y+8]]);
   rect(c,'#64765a',x-1,y-3,5,3);rect(c,'#819071',x+2,y-5,3,2);
   rect(c,'#52644d',x+4,y+2,5,3);
  }
  for(let i=0;i<3;i++){
   const x=4+i*13+Math.floor(hash(n+i+11)*4),y=28-Math.floor(hash(n+i+12)*4),w=10+Math.floor(hash(n+i+13)*6),h=6+Math.floor(hash(n+i+14)*7);
   poly(c,'#555b5b',[[x,y],[x-2,y-4],[x+2,y-h],[x+w-3,y-h-1],[x+w,y-4],[x+w-1,y]]);
   poly(c,'#8b9290',[[x-2,y-4],[x+2,y-h],[x+w-3,y-h-1],[x+w-5,y-5],[x+3,y-3]]);
   poly(c,'#707977',[[x+3,y-3],[x+w-5,y-5],[x+w,y-4],[x+w-1,y],[x,y]]);
   rect(c,'#a9ada5',x+3,y-h+1,3,1);
  }
  return a;
 });
 const pole=canvas(44,100),pc=pole.getContext('2d');
 rect(pc,'#555956',20,5,5,95);rect(pc,'#777b74',20,5,2,94);rect(pc,'#424947',24,10,2,90);
 for(const y of [12,27]){rect(pc,'#4d5551',3,y,38,3);rect(pc,'#858a82',3,y,38,1);for(const x of [5,21,37]){rect(pc,'#444c4a',x,y-5,3,5);rect(pc,'#a1aaa2',x-1,y-5,5,1)}}
 const post=canvas(12,32),fc=post.getContext('2d');
 rect(fc,'#625e50',3,3,6,29);rect(fc,'#9a8b70',3,3,2,28);rect(fc,'#b0a18a',4,1,4,3);rect(fc,'#494b43',8,5,1,26);rect(fc,'#7b725f',5,9,1,16);
 const fade=q=>Math.max(0,Math.min(1,(q-.045)/.29));
 const anchor=(project,z,side,lane)=>{const p=project(Math.max(0,z));return {x:p.center+side*p.half*lane,y:p.y,q:p.q}};
 const sprite=(c,a,x,y,w,h,alpha)=>{if(alpha<=0)return;c.globalAlpha=alpha;c.drawImage(a,Math.round(x-w/2),Math.round(y-h),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
 function power(c,project,distance,depth,W){
  const step=250,side=1,lane=1.39,first=Math.floor(distance/step),last=Math.ceil((distance+depth)/step);
  // Same world-space anchor for poles and the three sagging cables.
  const points=[];
  for(let i=first;i<=last;i++){const z=i*step-distance;if(z<0||z>depth)continue;const p=anchor(project,z,side,lane);points.push(p)}
  for(let i=points.length-1;i>0;i--){
   const a=points[i],b=points[i-1];c.globalAlpha=Math.min(fade(a.q),fade(b.q))*.82;
   c.strokeStyle='#535c58';c.lineWidth=1;
   for(const u of [-.36,0,.36]){
    const ax=a.x+u*61*a.q,ay=a.y-151*a.q,bx=b.x+u*61*b.q,by=b.y-151*b.q;
    c.beginPath();c.moveTo(Math.round(ax),Math.round(ay));c.quadraticCurveTo(Math.round((ax+bx)/2),Math.round((ay+by)/2+18*(a.q+b.q)),Math.round(bx),Math.round(by));c.stroke();
   }
  }
  for(let i=points.length-1;i>=0;i--){const p=points[i];if(p.x+35*p.q<0||p.x-35*p.q>W)continue;sprite(c,pole,p.x,p.y,70*p.q,170*p.q,fade(p.q))}
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
    for(const h of [11,25]){
     poly(c,'#645e51',[[Math.round(p.x),Math.round(p.y-h*p.q)],[Math.round(q.x),Math.round(q.y-h*q.q)],[Math.round(q.x),Math.round(q.y-(h+5)*q.q)],[Math.round(p.x),Math.round(p.y-(h+5)*p.q)]]);
     poly(c,'#9a8e78',[[Math.round(p.x),Math.round(p.y-(h+5)*p.q)],[Math.round(q.x),Math.round(q.y-(h+5)*q.q)],[Math.round(q.x),Math.round(q.y-(h+4)*q.q)],[Math.round(p.x),Math.round(p.y-(h+4)*p.q)]]);
    }
   }
   if(p.x+12*p.q>=0&&p.x-12*p.q<=W)sprite(c,post,p.x,p.y,15*p.q,40*p.q,fade(p.q));
  }
 }
 function stone(c,project,distance,depth,W){
  const step=86,first=Math.floor(distance/step),last=Math.ceil((distance+depth)/step);
  for(let i=last;i>=first;i--)for(const side of [-1,1]){
   const n=i*173+side*53;if(hash(n)<.56)continue;
   const z=i*step+hash(n+1)*step-distance;if(z<0||z>depth)continue;
   const p=anchor(project,z,side,1.27+hash(n+2)*.13),a=rocks[Math.floor(hash(n+3)*rocks.length)],w=(53+hash(n+4)*27)*p.q,h=w*a.height/a.width;
   const road=project(z),edge=road.center+side*road.half;
   if(Math.abs(p.x-edge)<w/2+2||p.x+w/2<0||p.x-w/2>W)continue;
   sprite(c,a,p.x,p.y,w,h,fade(p.q));
  }
 }
 function draw(c,project,distance,depth,W,controls,fieldPlot){
  c.save();c.imageSmoothingEnabled=false;
  if(controls.power.checked)power(c,project,distance,depth,W);
  if(controls.fence.checked&&controls.fields.checked)fence(c,project,distance,depth,W,fieldPlot);
  if(controls.rocks.checked)stone(c,project,distance,depth,W);
  c.restore();
 }
 return {draw};
})();
