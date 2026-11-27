// Procedural transparent wheel overlays, cached per original sprite.
window.DriveMotion=(()=>{
 const cache=new WeakMap(),toneCache=new WeakMap();
 function roadTone(img){if(toneCache.has(img))return toneCache.get(img);let result=img;try{const cv=document.createElement('canvas');cv.width=img.naturalWidth;cv.height=img.naturalHeight;const ctx=cv.getContext('2d');if('filter' in ctx){ctx.filter='brightness(.88) saturate(.72)';ctx.drawImage(img,0,0);result=cv;}}catch(e){}toneCache.set(img,result);return result;}
 function build(img){
  const w=img.naturalWidth,h=img.naturalHeight,cv=document.createElement('canvas');cv.width=w;cv.height=h;
  const ctx=cv.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
  const src=ctx.getImageData(0,0,w,h).data;
  let bottom=0,top=h,left=w,right=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(src[(y*w+x)*4+3]>200){bottom=Math.max(bottom,y);top=Math.min(top,y);left=Math.min(left,x);right=Math.max(right,x);}}
  const bh=bottom-top+1,bw=right-left+1;
  if(bh<8||bw<8)return [];
  // Identify only dark neutral tire pixels close to the lower silhouette.
  const floor=new Int32Array(w).fill(-1);
  for(let x=left;x<=right;x++)for(let y=bottom;y>=top;y--){if(src[(y*w+x)*4+3]>200){floor[x]=y;break;}}
  const mask=[];
  for(let x=left;x<=right;x++){
   const f=floor[x];if(f<bottom-bh*.13)continue;
   for(let y=Math.max(top,Math.floor(f-bh*.16),Math.floor(bottom-bh*.23));y<=f;y++){
    const k=(y*w+x)*4,R=src[k],G=src[k+1],B=src[k+2],lum=(R+G+B)/3;
    if(src[k+3]<235||lum<10||lum>105||Math.max(R,G,B)-Math.min(R,G,B)>28)continue;
    // Do not animate pixels at the silhouette edge or light bodywork.
    if(x<1||x>=w-1||y<1||y>=h-1||src[k-4+3]<200||src[k+4+3]<200||src[k-w*4+3]<200||src[k+w*4+3]<200)continue;
    mask.push([x,y,k]);
   }
  }
  // Restrict all generated motion pixels to the detected dark tire interior.
  const allowed=new Uint8Array(w*h);
  for(const [x,y] of mask)allowed[y*w+x]=1;
  const unit=Math.max(1,Math.round(bh/65));
  return Array.from({length:4},(_,phase)=>{
   const layer=document.createElement('canvas');layer.width=w;layer.height=h;
   const lc=layer.getContext('2d'),out=lc.createImageData(w,h);
   for(const [x,y,k] of mask){
    // Short directional smear along the tread, never across body or alpha edges.
    let sums=[0,0,0],weight=0;
    for(let d=-3;d<=3;d++){
     const yy=y+d*unit;if(yy<0||yy>=h||!allowed[yy*w+x])continue;
     const j=(yy*w+x)*4,wt=4-Math.abs(d);
     for(let i=0;i<3;i++)sums[i]+=src[j+i]*wt;
     weight+=wt;
    }
    const band=(Math.floor(y/unit)+Math.floor(x/(unit*3))+phase)%4;
    const delta=band===0?19:band===2?-12:band===1?6:-4;
    for(let i=0;i<3;i++)out.data[k+i]=Math.max(0,Math.min(255,sums[i]/weight+delta));
    out.data[k+3]=245;
   }
   lc.putImageData(out,0,0);return layer;
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
 return {draw,bounce,roadTone};
})();
