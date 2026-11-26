// Replaceable roadside sprites and connected perspective geometry. Visual only.
window.RoadsideObjects=(()=>{
 const hash=n=>{const v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v)};
 const canvas=(w,h)=>{const a=document.createElement('canvas');a.width=w;a.height=h;return a};
 const rect=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
 const poly=(c,color,pts)=>{c.fillStyle=color;c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);c.closePath();c.fill()};
 // Detailed pixel-painted sprites, cached once.
 const pixel=(c,col,x,y,w=1,h=1)=>{c.fillStyle=col;c.fillRect(x|0,y|0,w,h)};
 function line(c,x,y,xx,yy,col){const n=Math.max(Math.abs(xx-x),Math.abs(yy-y),1);for(let i=0;i<=n;i++)pixel(c,col,Math.round(x+(xx-x)*i/n),Math.round(y+(yy-y)*i/n))}
 const leaf=['#344639','#40523e','#536448','#667653','#7a8a60','#929b73'],stonePal=['#454c50','#555b5e','#646a6c','#757b7b','#8b908c','#a4a49a'],wood=['#45443f','#585349','#6d6252','#85745e','#a08b6d','#b8a185'];
 const rocks=Array.from({length:3},(_,k)=>{
  const a=canvas(120,80),c=a.getContext('2d'),seed=k*397;
  for(let j=0;j<24;j++){
   const n=seed+j*79,x=12+hash(n)*96,y=29+hash(n+1)*25,r=6+hash(n+2)*14;
   for(let yy=Math.floor(y-r);yy<y+r;yy++)for(let xx=Math.floor(x-r);xx<x+r;xx++){
    const d=((xx-x)/r)**2+((yy-y)/(r*.85))**2;
    if(d>1+hash(xx*23+yy*19+n)*.25||hash(xx*31+yy*61+n)<.14)continue;
    pixel(c,leaf[Math.max(0,Math.min(5,Math.floor(2.4+(y-yy)/r*1.6+hash(xx*47+yy*13+n)*2)))],xx,yy);
   }
  }
  for(let j=0;j<3;j++){
   const n=seed+j*131,x=24+j*33,y=69+hash(n)*4,rx=15+hash(n+1)*7,ry=12+hash(n+2)*12;
   for(let yy=Math.floor(y-ry*2);yy<=y;yy++)for(let xx=Math.floor(x-rx);xx<=x+rx;xx++){
    const u=(xx-x)/rx,v=(yy-y+ry)/ry;
    if(Math.abs(u)**1.6+Math.abs(v)**1.7>1+.12*hash(xx*23+yy*17+n))continue;
    const facet=v<-.36?4:u<-.15?3:u>.52?1:2,tex=hash(xx*19+yy*41+n);
    pixel(c,stonePal[Math.max(0,Math.min(5,facet+(tex>.88?1:tex<.16?-1:0)))],xx,yy);
   }
  }
  for(let i=0;i<85;i++){const n=seed+i*67,x=Math.floor(hash(n)*118),y=74+Math.floor(hash(n+1)*5),h=3+Math.floor(hash(n+2)*11),lean=Math.floor(hash(n+3)*9)-4;line(c,x,y,x+lean,y-h,leaf[2+i%4]);if(i%17===0)pixel(c,'#d6d3bc',x+lean,y-h,2,2)}
  return a;
 });
 function timber(c,x,y,w,h,seed){for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const n=hash(seed+xx*13+Math.floor(yy/7)*37),side=xx/w;pixel(c,wood[Math.min(5,Math.max(0,(side<.18?4:side>.72?1:3)+(n>.8?1:n<.2?-1:0)))],x+xx,y+yy)}}
 const pole=canvas(88,200),pc=pole.getContext('2d');timber(pc,39,4,10,196,77);
 for(const y of [26,56]){timber(pc,5,y,78,6,y*31);line(pc,12,y+6,43,y+24,wood[1]);line(pc,76,y+6,45,y+24,wood[1]);for(const x of [12,44,76]){pixel(pc,'#444b49',x-2,y-9,5,10);pixel(pc,'#8e9994',x-3,y-8,7,3);pixel(pc,'#c2c8bf',x-2,y-12,5,4);pixel(pc,'#e0dfcd',x-1,y-13,2,2)}}
 const post=canvas(24,64),fc=post.getContext('2d');timber(fc,5,5,14,59,31);pixel(fc,wood[5],6,3,12,3);
 for(const y of [17,43]){pixel(fc,'#3d4442',12,y,3,3);pixel(fc,'#aeb3a8',12,y,1,1)}
 const board=canvas(96,12),bc=board.getContext('2d');for(let y=0;y<12;y++)for(let x=0;x<96;x++){const n=hash(Math.floor(x/7)*71+y*13);pixel(bc,wood[Math.max(0,Math.min(5,(y<2?5:y>9?1:3)+(n>.8?1:n<.2?-1:0)))],x,y)}
 const fade=q=>Math.max(0,Math.min(1,(q-.035)/.17));
 const anchor=(project,z,side,lane)=>{const p=project(Math.max(0,z));return {x:p.center+side*p.half*lane,y:p.y,q:p.q,z}};
 const sprite=(c,a,x,y,w,h,alpha)=>{if(alpha<=0)return;c.globalAlpha=alpha;c.drawImage(a,Math.round(x-w/2),Math.round(y-h),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
 function power(c,project,distance,depth,W){
  const step=190,side=1,lane=1.33,first=Math.floor(distance/step),last=Math.ceil((distance+depth)/step);
  // Same world-space anchor for poles and the three sagging cables.
  const points=[];
  for(let i=first;i<=last;i++){const z=i*step-distance;if(z<0||z>depth)continue;const p=anchor(project,z,side,lane);points.push(p)}
  for(let i=points.length-1;i>0;i--){
   const a=points[i],b=points[i-1];c.globalAlpha=Math.min(fade(a.q),fade(b.q))*.82;
   c.strokeStyle='#535c58';c.lineWidth=1;
   for(const u of [-32/88,0,32/88]){
    c.beginPath();
    for(let j=0;j<=16;j++){const t=j/16,p=anchor(project,a.z+(b.z-a.z)*t,side,lane),xx=p.x+u*70*p.q,yy=p.y-(1-13/200)*170*p.q+Math.sin(Math.PI*t)*22*p.q;if(j===0)c.moveTo(Math.round(xx),Math.round(yy));else c.lineTo(Math.round(xx),Math.round(yy))}
    c.stroke();
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
    for(const h of [11,25])for(let j=0;j<12;j++){
      const aa=anchor(project,z+step*j/12,side,lane),bb=anchor(project,z+step*(j+1)/12,side,lane);
      const ax=aa.x,ay=aa.y-(h+5)*aa.q,bx=bb.x,by=bb.y-(h+5)*bb.q;
      c.save();c.transform((bx-ax)/8,(by-ay)/8,0,Math.max(1,5*(aa.q+bb.q)/2)/12,ax,ay);
      c.drawImage(board,j*8,0,8,12,0,0,8.3,12);c.restore();
    }
   }
   if(p.x+12*p.q>=0&&p.x-12*p.q<=W)sprite(c,post,p.x,p.y,15*p.q,40*p.q,fade(p.q));
  }
 }
 function stone(c,project,distance,depth,W){
  const step=105,first=Math.floor(distance/step),last=Math.ceil((distance+depth)/step);
  for(let i=last;i>=first;i--)for(const side of [-1,1]){
   const n=i*173+side*53;if(hash(n)<.56)continue;
   const z=i*step+hash(n+1)*step-distance;if(z<0||z>depth)continue;
   const p=anchor(project,z,side,1.27+hash(n+2)*.13),a=rocks[Math.floor(hash(n+3)*rocks.length)],w=(84+hash(n+4)*38)*p.q,h=w*a.height/a.width;
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
