// Side sprites face left. Keep the original silhouette intact; animate only inner rim textures.
(function(root){
const wheels=Object.freeze({pobeditel:[[.174,.780,.048],[.762,.780,.048]],yaichnitsa:[[.154,.785,.041],[.754,.785,.041]],'m412-01':[[.181,.779,.026],[.751,.779,.026]],sputnik:[[.208,.780,.058],[.823,.780,.058]],vasilek:[[.157,.798,.044],[.753,.798,.044]]});
function departureMotion(ms,duration=4400){const u=Math.max(0,Math.min(1,(ms-650)/(duration-650))),progress=u*u*(1.18-.18*u),speed=u*(2.36-.54*u);return {progress,speed,idle:ms<650};}
function toneImage(image,values){if(!Array.isArray(values)||values.length!==5||!values.every(Number.isFinite))return image;const b=document.createElement('canvas');b.width=image.width;b.height=image.height;const g=b.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0);try{const d=g.getImageData(0,0,b.width,b.height),q=d.data,[br,co,sa,wa,ni]=values;for(let j=0;j<q.length;j+=4){if(!q[j+3])continue;const l=.2126*q[j]+.7152*q[j+1]+.0722*q[j+2];for(let k=0;k<3;k++){let z=((l+(q[j+k]-l)*sa/100-52)*co/100+52)*br/100;z+=wa*(k===0?.8:k===2?-.8:.1);q[j+k]=z*(1-ni/100)+[19,35,68][k]*ni/100;}}g.putImageData(d,0,0);return b;}catch(e){if(e.name!=='SecurityError')throw e;return image;}}
function bodyMotion(ms){const t=Math.max(0,ms-650),load=ms<=650||t>=850?0:Math.sin(Math.PI*t/850),pitch=load*.0198,squat=load*.006;return {shake:Math.sin(ms*.055)*.12,pitch,squat};}
// Fade by leading edge, not wall-clock: start before the left-side exit and hold black.
function departureFade(x,w,start=260,end=90){const u=Math.max(0,Math.min(1,(start-(x-w/2))/(start-end)));return u*u*(3-2*u);}
// Estimate the outer tire radius from the original alpha silhouette beneath each calibrated hub.
function wheelGeometry(width,height,disks,alpha){
 return disks.map(([nx,ny,nr])=>{
  let x=nx*width,y=ny*height,disk=nr*width;
  // A tire has a local low point in the alpha silhouette. Search each axle
  // independently near its nominal hub, including horizontal sprite margins.
  if(alpha){
   const nominalX=x,nominalY=y,span=Math.max(disk*1.8,width*.035),lo=Math.max(0,Math.floor(x-span)),hi=Math.min(width-1,Math.ceil(x+span));
   const floor=xx=>{for(let yy=height-1;yy>=Math.floor(nominalY);yy--)if(alpha[(yy*width+xx)*4+3]>=128)return yy+.5;return -1;};
   let low=-1,points=[];for(let xx=lo;xx<=hi;xx++){const yy=floor(xx);if(yy>low){low=yy;points=[xx];}else if(yy===low&&yy>=0)points.push(xx);}
   if(low>nominalY+disk*.7&&points.length){const middle=(points[0]+points[points.length-1])/2;if(Math.abs(middle-nominalX)<=span)x=middle;}
  }
  let bottom=-1;
  if(alpha){const cx=Math.round(x);for(let yy=Math.min(height-1,Math.ceil(y+disk*3));yy>=Math.ceil(y);yy--){if(alpha[(yy*width+Math.min(width-1,Math.max(0,cx)))*4+3]>=128){bottom=yy+.5;break;}}}
  const tire=bottom>y?Math.max(disk*1.08,Math.min(disk*3,bottom-y)):disk*1.55;
  return {x,y,disk,tire};
 });
}
function rimRadius(radius){return radius*.95;}
function wheelAngle(travel,tireRadius){return -travel/Math.max(1,tireRadius);}
// Use only the central 55% of the calibrated rim radius, then retain the
// approved 95% overlay scale. Never sample or erase the outer tire or arch.
function innerRimRadius(radius){return radius*.55;}
function safeRimGeometry(width,height,disks,alpha){
 const measured=wheelGeometry(width,height,disks,alpha);
 return disks.map(([nx,ny,nr],i)=>{
  const x=nx*width,y=ny*height,disk=nr*width,tire=measured[i].tire;
  let core=innerRimRadius(disk);
  // Keep the calibrated hub, not a center inferred from the fender silhouette.
  // Shrink the sample if its square intersects transparent sprite pixels.
  if(alpha){const opaque=r=>{for(const dx of [-r,0,r])for(const dy of [-r,0,r]){const xx=Math.round(x+dx),yy=Math.round(y+dy);if(xx<0||xx>=width||yy<0||yy>=height||alpha[(yy*width+xx)*4+3]<250)return false;}return true;};while(core>=1&&!opaque(core))core*=.8;if(core<1)core=0;}
  return {x,y,disk,tire,core};
 });
}
// Extend the existing opaque diameter by 20%, with a transparent outer edge.
function featherRadius(core){return core*1.2;}
function featherAlpha(distance,core){if(core<=0)return 0;const t=Math.max(0,Math.min(1,(distance-core)/(featherRadius(core)-core)));return 1-t*t*(3-2*t);}
function featheredRim(car,a){
 if(a.core<=0)return null;
 const outer=featherRadius(a.core),size=Math.max(2,Math.ceil(outer*2)),c=document.createElement('canvas');c.width=c.height=size;
 const g=c.getContext('2d');g.imageSmoothingEnabled=false;
 g.drawImage(car,a.x-outer,a.y-outer,outer*2,outer*2,0,0,size,size);
 const mask=g.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
 for(let i=0;i<=12;i++){const t=i/12;mask.addColorStop(t,'rgba(0,0,0,'+featherAlpha(t*outer,a.core)+')');}
 g.globalCompositeOperation='destination-in';g.fillStyle=mask;g.fillRect(0,0,size,size);g.globalCompositeOperation='source-over';return c;
}
function suspensionLayers(car,disks){
 const c=document.createElement('canvas');c.width=car.width;c.height=car.height;
 const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(car,0,0);
 let alpha;try{alpha=g.getImageData(0,0,c.width,c.height).data;}catch(e){if(e.name!=='SecurityError')throw e;}
 return {geometry:safeRimGeometry(car.width,car.height,disks,alpha).map(a=>({...a,texture:featheredRim(car,a)}))};
}
// Continuous vertical deformation: upper pixels move with the suspension,
// taper to zero at the wheel band; lower pixels stay at their original anchors.
// No holes, erased pixels, detached arches or separate tire layers.
// One continuous longitudinal load transfer: front rises as rear compresses.
// Side sprites face left. Use a linear field rather than an isolated rear warp.
function loadTransferOffset(x,front,rear,width,squat=0){const mid=(front+rear)/2,half=Math.max(1,(rear-front)/2);return width*squat*(x-mid)/half;}
function suspensionOffset(x,pivot,pitch,shake,extra=0){return (x-pivot)*Math.tan(pitch)+shake+extra;}
function drawSuspendedSprite(ctx,car,left,top,dw,dh,geometry,body){
 if(!geometry.length||(!body.pitch&&!body.shake&&!body.squat)){ctx.drawImage(car,left,top,dw,dh);return;}
 const sx=dw/car.width,sy=dh/car.height;
 const pivot=geometry.reduce((sum,a)=>sum+a.x*sx,0)/geometry.length;
 const anchor=Math.max(1,Math.min(dh-1,Math.round(Math.min(...geometry.map(a=>(a.y-a.disk)*sy)))));
 const sourceAnchor=anchor/sy,front=Math.min(...geometry.map(a=>a.x*sx)),rear=Math.max(...geometry.map(a=>a.x*sx));
 for(let i=0;i<dw;i++){
  const extra=loadTransferOffset(i+.5,front,rear,dw,body.squat),offset=Math.min(anchor-1,suspensionOffset(i+.5,pivot,body.pitch,body.shake,extra)),sourceX=i/sx,sourceWidth=1/sx;
  ctx.drawImage(car,sourceX,0,sourceWidth,sourceAnchor,left+i,top+offset,1,anchor-offset);
 }
 // Draw the entire lower band in one pass; fixed seam meets every upper column.
 ctx.drawImage(car,0,sourceAnchor,car.width,car.height-sourceAnchor,left,top+anchor,dw,dh-anchor);
}
function mount(area,cfg,root,done){let alive=true,raf=0;const canvas=document.createElement('canvas');canvas.width=864;canvas.height=486;canvas.style.cssText=cfg.departure?'position:fixed;inset:0;width:100%;height:100%;object-fit:cover;object-position:center bottom;image-rendering:pixelated;background:#171620':'width:min(100%,1100px);height:auto;image-rendering:pixelated';if(cfg.departure){if(matchMedia('(any-pointer:coarse),(hover:none),(max-width:1024px),(display-mode:standalone)').matches)canvas.style.cssText+=';inset:auto 0 0;width:100%;height:auto;object-fit:fill';else if(innerWidth<innerHeight)canvas.style.objectFit='contain';}const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;const title=document.createElement('h1');title.textContent=cfg.title||'';const text=document.createElement('p');text.textContent=cfg.text||'';area.append(canvas);if(!cfg.departure)area.append(title,text);const load=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Ресурс анимации недоступен'));i.src=new URL(src,root).href;});const button=()=>{const b=document.createElement('button');b.textContent='Продолжить';b.onclick=done;area.append(b);};Promise.all([load(cfg.background),load(cfg.vehicle)]).then(([bg,car])=>{if(!alive)return;if(cfg.departure&&cfg.geometry){bg=toneImage(bg,cfg.geometry.bgTone);car=toneImage(car,cfg.geometry.carTone);}let start;const disks=wheels[cfg.vehicleId]||[],particles=[];let emitted=0;const layers=cfg.departure?suspensionLayers(car,disks):null;const drawCar=(x,y,w,h,angle,body)=>{ctx.save();ctx.translate(Math.round(x),Math.round(y));const left=Math.round(-w/2),top=Math.round(-h),dw=Math.round(w),dh=Math.round(h),sx=dw/car.width,sy=dh/car.height;
 drawSuspendedSprite(ctx,car,left,top,dw,dh,layers.geometry,body);
 // Only the inner hub texture rotates; the original rim border, tire and
 // overlapping fender pixels remain in the intact base sprite.
 for(const a of layers.geometry){if(!a.texture)continue;const dx=left+a.x*sx,dy=top+a.y*sy,r=rimRadius(featherRadius(a.core)*sx);ctx.save();ctx.translate(dx,dy);ctx.rotate(wheelAngle(angle,a.tire*sx));ctx.drawImage(a.texture,-r,-r,r*2,r*2);ctx.restore();}
 ctx.restore();};function frame(now){if(!alive)return;start??=now;const elapsed=Math.min(cfg.duration,now-start),u=Math.min(1,elapsed/Math.max(1,cfg.duration)),motion=departureMotion(elapsed,cfg.duration),v=cfg.departure?motion.progress:u*u*(3-2*u),mix=k=>cfg.from[k]+(cfg.to[k]-cfg.from[k])*v;ctx.drawImage(bg,0,0,864,486);const g=cfg.departure&&cfg.geometry,h=g?g.height:486*mix('scale'),w=h*car.width/car.height,x=g?g.x+(864*cfg.to.x-g.x)*v:864*mix('x'),y=g?g.y:486*mix('y');if(cfg.departure){const origin=g?g.x:864*cfg.from.x,travel=origin-x,body=bodyMotion(elapsed);ctx.save();for(const [scale,alpha] of [[1.1,.5],[1,.95]]){ctx.fillStyle='rgba(5,5,7,'+alpha+')';ctx.beginPath();ctx.ellipse(x,g?g.shadowY:y-3,w*.5*scale,(g?g.shadowRy:10)*scale,0,0,Math.PI*2);ctx.fill();}ctx.restore();while(emitted<Math.floor(elapsed/115)){emitted++;const at=emitted*115,px=origin+(864*cfg.to.x-origin)*departureMotion(at,cfg.duration).progress;particles.push({at,x:px+w*.49,y:y-7,seed:emitted});}for(const p of particles){const age=(elapsed-p.at)/1000;if(age<0||age>1.15)continue;const k=1-age/1.15;ctx.globalAlpha=.22*k;ctx.fillStyle=p.seed%2?'#a4a3a1':'#777b7b';const size=3+age*12;ctx.fillRect(Math.round(p.x+age*25),Math.round(p.y-age*13),Math.round(size),Math.round(size*.65));}ctx.globalAlpha=1;while(particles.length&&elapsed-particles[0].at>1150)particles.shift();drawCar(x,y,w,h,travel,body);const fade=departureFade(x,w,cfg.fadeStart,cfg.fadeEnd);if(fade>0){ctx.save();ctx.globalAlpha=fade;ctx.fillStyle='#000';ctx.fillRect(0,0,864,486);ctx.restore();}}else ctx.drawImage(car,Math.round(x-w/2),Math.round(y-h),Math.round(w),Math.round(h));if(u<1)raf=requestAnimationFrame(frame);else if(cfg.confirm)button();else done();}raf=requestAnimationFrame(frame);}).catch(e=>{if(alive){text.textContent=e.message;area.append(text);button();}});return()=>{alive=false;cancelAnimationFrame(raf);};}
const api={mount,departureMotion,bodyMotion,departureFade,wheelGeometry,wheelAngle,rimRadius,innerRimRadius,safeRimGeometry,featherRadius,featherAlpha,featheredRim,loadTransferOffset,suspensionOffset,drawSuspendedSprite,suspensionLayers,wheels};if(typeof module!=='undefined')module.exports=api;else root.CrimeRushAnimation=api;
})(typeof window!=='undefined'?window:globalThis);