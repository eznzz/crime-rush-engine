const m412ShadowCache=new WeakMap(),shadowBoundsCache=new WeakMap();
function m412ShadowShape(asset){
 if(m412ShadowCache.has(asset))return m412ShadowCache.get(asset);
 let shape=null;
 try{
  const w=asset.naturalWidth,h=asset.naturalHeight,cv=document.createElement('canvas');
  cv.width=w;cv.height=h;const ctx=cv.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(asset,0,0);const data=ctx.getImageData(0,0,w,h).data;
  const floor=new Int32Array(w).fill(-1);let bottom=-1,top=h;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(data[(y*w+x)*4+3]>=180){floor[x]=y;bottom=Math.max(bottom,y);top=Math.min(top,y);}
  const bh=bottom-top+1,points=[];
  if(bh>4){
   // Sample the lower silhouette in narrow bins. Ignore roof and bumper
   // overhang above the wheel region; retain the lowest contact in each bin.
   const step=Math.max(1,Math.floor(w/48));
   for(let x=0;x<w;x+=step){
    let best=-1,bx=x;
    for(let j=x;j<Math.min(w,x+step);j++)if(floor[j]>best){best=floor[j];bx=j;}
    if(best<bottom-bh*.32)continue;
    points.push([bx/w,(best+1)/h+.009],[bx/w,(best+1)/h-.105*bh/h]);
   }
   // Convex ground footprint connects the wheel contact regions under the chassis.
   const cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
   points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
   const half=ps=>{const out=[];for(const p of ps){while(out.length>=2&&cross(out[out.length-2],out[out.length-1],p)<=0)out.pop();out.push(p);}return out;};
   const lo=half(points),hi=half(points.slice().reverse()),hull=lo.slice(0,-1).concat(hi.slice(0,-1));
   if(hull.length>=3)shape=hull;
  }
 }catch(e){/* retain the original footprint if image pixels are inaccessible */}
 m412ShadowCache.set(asset,shape);return shape;
}
function prepareVehicleShadow(asset){const shape=m412ShadowShape(asset);if(!shape)return null;let bounds=shadowBoundsCache.get(asset);if(!bounds){bounds=[Math.min(...shape.map(p=>p[0])),Math.max(...shape.map(p=>p[0])),Math.min(...shape.map(p=>p[1])),Math.max(...shape.map(p=>p[1]))];shadowBoundsCache.set(asset,bounds);}return bounds;}
// Soft contact shadow: a single feathered footprint, with no dark overlapping bands.
const softShadowTextures=new Map();
function softShadowTexture(personal){if(softShadowTextures.has(personal))return softShadowTextures.get(personal);const cv=document.createElement('canvas');cv.width=cv.height=128;const ctx=cv.getContext('2d'),g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,personal?'rgba(22,24,25,.90)':'rgba(22,24,25,.30)');g.addColorStop(.45,personal?'rgba(22,24,25,.82)':'rgba(22,24,25,.24)');g.addColorStop(.72,personal?'rgba(22,24,25,.52)':'rgba(22,24,25,.12)');g.addColorStop(1,'rgba(22,24,25,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);softShadowTextures.set(personal,cv);return cv;}
function softCarShadow(x,y,rx,ry,personal=false){if(rx<=0||ry<=0)return;c.drawImage(softShadowTexture(personal),x-rx,y-ry,rx*2,ry*2);}
function vehicleShadow(name,x,y,h,flip=false,groundOffset=0){
 const asset=I[name];if(!asset?.naturalWidth)return;
 const w=asset.width*h/asset.height,dx=x-w/2,dy=y-h+groundOffset;
 const shape=m412ShadowShape(asset),personal=!name.startsWith('traffic:');
 c.save();if(flip){c.translate(2*x,0);c.scale(-1,1);}
 if(shape){
  const bounds=prepareVehicleShadow(asset);
  const minX=dx+bounds[0]*w,maxX=dx+bounds[1]*w,minY=dy+bounds[2]*h,maxY=dy+bounds[3]*h;
  const depth=maxY-minY,extra=personal?Math.max(depth*.35,h*.055):0;
  const cx=(minX+maxX)/2,cy=(minY+maxY+extra)/2;
  softCarShadow(cx,cy,Math.max(.5,(maxX-minX)*.52),Math.max(.5,(depth+extra)*.53),personal);
 }else{
  const extra=personal?h*.055:0;
  softCarShadow(x,y-h*.055+groundOffset+extra/2,w*.46,h*.075+extra/2,personal);
 }
 c.restore();
}
// Highway uses fixed vertical geometry and an expandable horizontal desktop viewport.
