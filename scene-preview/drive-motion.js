// Procedural transparent wheel overlays, cached per original sprite.
window.DriveMotion=(()=>{
 const cache=new WeakMap();
 function build(img){
  const w=img.naturalWidth,h=img.naturalHeight,cv=document.createElement('canvas');cv.width=w;cv.height=h;
  const ctx=cv.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
  const src=ctx.getImageData(0,0,w,h).data;
  let bottom=0,top=h,left=w,right=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(src[(y*w+x)*4+3]>200){bottom=Math.max(bottom,y);top=Math.min(top,y);left=Math.min(left,x);right=Math.max(right,x);}}
  const bh=bottom-top+1,bw=right-left+1;
  if(bh<8||bw<8)return [];
  // Detect actual wheel contact lobes, including the higher/far wheel in yawed views.
  const floor=new Int32Array(w).fill(-1),score=new Float32Array(w);
  const neutral=(k,max=55)=>Math.max(src[k],src[k+1],src[k+2])-Math.min(src[k],src[k+1],src[k+2])<=max;
  const lum=k=>(src[k]+src[k+1]+src[k+2])/3;
  for(let x=left;x<=right;x++){
   for(let y=bottom;y>=top;y--)if(src[(y*w+x)*4+3]>200){floor[x]=y;break;}
   const f=floor[x];if(f<bottom-bh*.35)continue;
   let dark=0,solid=0;
   for(let y=Math.max(top,Math.round(f-bh*.075));y<=f;y++){const k=(y*w+x)*4;if(src[k+3]>220){solid++;if(lum(k)<96&&neutral(k,35))dark++;}}
   if(solid&&dark/solid>.65)score[x]=dark/solid;
  }
  // Merge neighbouring columns into isolated contact groups; reject bumper-wide bands.
  const groups=[],gap=Math.max(2,Math.round(bw*.012));let start=-1,last=-1;
  for(let x=left;x<=right+gap+1;x++){if(x<=right&&score[x]>.65){if(start<0)start=x;last=x;}else if(start>=0&&x-last>gap){if(last-start+1>=bw*.024&&last-start+1<=bw*.32)groups.push([start,last]);start=-1;}}
  const wheels=[];
  for(const [a,b] of groups){
   const width=b-a+1,center=(a+b)/2;let ground=-1;
   for(let x=a;x<=b;x++)ground=Math.max(ground,floor[x]);
   const rx=Math.max(width*.62,bw*.018),ry=Math.min(bh*.16,Math.max(bh*.055,width*.92)),cy=ground-ry;
   // A visible rim needs an enclosed, brighter neutral area. Straight-on tread
   // has none and gets no artificial spinning disk.
   let n=0,sx=0,sy=0,minX=w,maxX=-1,minY=h,maxY=-1;
   for(let y=Math.max(top,Math.floor(cy-ry*.67));y<=Math.min(bottom,Math.ceil(cy+ry*.67));y++)for(let x=Math.max(left,Math.floor(center-rx*.68));x<=Math.min(right,Math.ceil(center+rx*.68));x++){
    if(((x-center)/rx)**2+((y-cy)/ry)**2>.55)continue;
    const k=(y*w+x)*4;if(src[k+3]<245||!neutral(k,34)||lum(k)<105)continue;
    n++;sx+=x;sy+=y;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
   }
   if(n<Math.max(4,rx*ry*.045)||maxX-minX<2||maxY-minY<2)continue;
   const cx=sx/n,yy=sy/n,rrx=Math.min(rx*.82,Math.max(2,(maxX-minX+1)*.58)),rry=Math.min(ry*.82,Math.max(2,(maxY-minY+1)*.58));
   // Reject horizontal trim and implausibly displaced highlights.
   if(rrx/rry>1.65||Math.abs(cx-center)>rx*.45||Math.abs(yy-cy)>ry*.55)continue;
   wheels.push({cx,cy:yy,rx:rrx,ry:rry});
  }
  if(!wheels.length)return [];
  // Rotate texture in each projected ellipse, not the full vehicle or tire.
  return Array.from({length:4},(_,phase)=>{
   const layer=document.createElement('canvas');layer.width=w;layer.height=h;
   const lc=layer.getContext('2d'),out=lc.createImageData(w,h),angle=phase*Math.PI/2;
   for(const wheel of wheels){const {cx,cy,rx,ry}=wheel;
    for(let y=Math.max(1,Math.floor(cy-ry));y<=Math.min(h-2,Math.ceil(cy+ry));y++)for(let x=Math.max(1,Math.floor(cx-rx));x<=Math.min(w-2,Math.ceil(cx+rx));x++){
     const u=(x-cx)/rx,v=(y-cy)/ry,r2=u*u+v*v,k=(y*w+x)*4;
     if(r2>.88||src[k+3]<245||!neutral(k,42)||src[k-4+3]<220||src[k+4+3]<220||src[k-w*4+3]<220||src[k+w*4+3]<220)continue;
     let sum=0,weight=0;
     for(let j=-2;j<=2;j++){const a=angle+j*.19,xx=Math.round(cx+rx*(u*Math.cos(a)-v*Math.sin(a))),yy=Math.round(cy+ry*(u*Math.sin(a)+v*Math.cos(a)));
      if(xx<0||xx>=w||yy<0||yy>=h)continue;const q=(yy*w+xx)*4;if(src[q+3]<245||!neutral(q,42))continue;const wt=3-Math.abs(j);sum+=lum(q)*wt;weight+=wt;}
     if(!weight)continue;const delta=(sum/weight-lum(k))*.85;
     for(let i=0;i<3;i++)out.data[k+i]=Math.max(0,Math.min(255,src[k+i]+delta));
     out.data[k+3]=Math.round(245*Math.min(1,(.9-r2)*8));
    }
   }lc.putImageData(out,0,0);return layer;
  });

 }
 function draw(ctx,img,x,y,w,h,travel,speed){
  if(speed<=0||h<12)return;
  let frames=cache.get(img);
  if(!frames){try{frames=build(img)}catch(e){frames=[]}cache.set(img,frames);}
  if(!frames.length)return;
  const phase=((Math.floor(travel/5)%frames.length)+frames.length)%frames.length;
  ctx.save();ctx.imageSmoothingEnabled=false;
  ctx.globalAlpha*=Math.min(.88,speed/45);
  ctx.drawImage(frames[phase],x,y,w,h);ctx.restore();
 }
 function bounce(travel,speed,height,phase=0){
  if(speed<=0)return 0;
  const a=Math.min(1,speed/45)*Math.min(1,height/120);
  return Math.round(a*(.75*Math.sin(travel/19+phase)+.48*Math.sin(travel/43+phase*1.7)));
 }
 return {draw,bounce};
})();
