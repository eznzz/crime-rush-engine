// Cached pixel scenery: reference mountains, cultivated fields, and roadside grass.
window.DriveScenery=(()=>{
 const hash=n=>{const v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v)};
 const canvas=(w,h)=>{const a=document.createElement('canvas');a.width=w;a.height=h;return a};
 const fill=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const grassPatterns=[['.......','..l....','..l..h.','..m..l.','l.m.ml.','.mmmmd.','..ddd..'],['.........','.....h...','.l...l...','..l..m.l.','..m.mm.m.','...mmmm..','...dddd..'],['......','...l..','.h.l..','.l.m.l','..mmm.','..ddd.']];
 const palette={d:'#353b30',m:'#51543a',l:'#787445',h:'#a08e56'};
 const grass=grassPatterns.map(rows=>{const a=canvas(rows[0].length,rows.length),c=a.getContext('2d');rows.forEach((row,y)=>[...row].forEach((p,x)=>{if(palette[p])fill(c,palette[p],x,y,1,1)}));return a});
 // Full upright pixel-art patches, layered from back to front in world space.
 const colors=[
 ['#373b2e','#565c36','#817c45','#d59a45','#f4b969','#694238'],
 ['#323c33','#4b593d','#848750','#a79a61','#c6aa79','#5d6348'],
 ['#38343d','#504c48','#736f52','#846390','#b684a7','#59445e'],
 ['#393b31','#5b603e','#87884c','#ce8b91','#e8b79e','#9e626a']
 ];
 const fields=colors.map((p,kind)=>Array.from({length:3},(_,variant)=>{
  const a=canvas(128,56),c=a.getContext('2d');
  for(let row=0;row<4;row++)for(let i=0;i<29;i++){
   const n=kind*1973+variant*601+row*131+i*47,x=Math.round(i*4.6+hash(n)*5-3),base=30+row*8+Math.floor(hash(n+1)*4),h=12+Math.floor(hash(n+2)*17),lean=Math.floor(hash(n+3)*7)-3,top=base-h;
   for(let j=0;j<h;j++)fill(c,j%3===0?p[2]:p[1],x+Math.round(lean*j/h),base-j,1+(row>1?1:0),1);
   for(let j=0;j<4;j++){fill(c,p[0],x-j,base-4-j,3,2);fill(c,p[2],x+j,base-9-j,2,1)}
   const tx=x+lean;
   if(kind===0){fill(c,p[3],tx-2,top-4,5,8);fill(c,p[3],tx-4,top-2,9,4);fill(c,p[4],tx-2,top-4,4,1);fill(c,p[5],tx-2,top-1,4,4);}
   else if(kind===2){for(let j=0;j<9;j++){fill(c,j%3?p[3]:p[4],tx-1+(j%2),top-j,2+(j%3===0),2);}fill(c,p[5],tx,top-2,1,5);}
   else if(kind===3){fill(c,p[3],tx-2,top-2,5,3);fill(c,p[3],tx-1,top-3,3,5);fill(c,p[4],tx,top-1,1,1);}
   else {for(let j=0;j<7;j++){fill(c,p[2],tx-Math.floor(j/3),top+j,1,1);if(j%3===0)fill(c,p[3],tx+1,top+j,1,1);}}
  }
  return a;
 }));
 // HD sunset panorama; no utility poles or wires.
 const horizon=new Image();horizon.src=new URL('scenery/sunset-horizon-hd.png?v=27.53',document.currentScript.src).href;
 function skyline(c,W,hy,t=0){if(!horizon.naturalWidth)return;c.save();c.imageSmoothingEnabled=false;c.drawImage(horizon,0,0,W,hy);c.restore();}
 function fieldPlot(world,side){
  const block=560,group=Math.floor(world/block),n=group*137+side*71,local=world-group*block;
  const start=30+hash(n+6)*160,end=block-60-hash(n+7)*190;
  return {active:hash(n+8)>.23&&local>=start&&local<end,kind:Math.floor(hash(n)*fields.length),n};
 }
 function ground(c,project,distance,depth,W){
  c.save();c.imageSmoothingEnabled=false;
  const step=32,first=Math.floor(distance/step),last=Math.ceil((distance+depth)/step);
  for(let i=last;i>=first;i--)for(const side of [-1,1]){
   const z=i*step-distance;if(z<0||z>depth)continue;
   const p=project(z);if(p.q<.055)continue;
   const plot=fieldPlot(distance+z,side),{n,kind}=plot;
   if(!plot.active)continue;
   const inner=1.52+hash(n+1)*.18;
   for(let j=3;j>=0;j--){
    const tile=fields[kind][Math.floor(hash(i*41+side*23+j*13)*3)];
    const width=Math.max(2,Math.round(p.half*.91)),height=Math.max(2,Math.round((kind===0?82:kind===2?62:kind===3?55:68)*p.q));
    const edge=p.center+side*p.half*(inner+j*.82),left=side<0?Math.round(edge-width):Math.round(edge);
    if(left+width<0||left>W)continue;
    c.globalAlpha=.66+.34*Math.min(1,p.q/.3);
    c.drawImage(tile,left,Math.round(p.y-height),width,height);
   }
  }
  c.restore();
 }
 function verge(c,project,distance,depth,W){
  c.save();c.imageSmoothingEnabled=false;
  const step=31,first=Math.floor(distance/step),last=Math.ceil((distance+depth)/step);
  for(let i=last;i>=first;i--)for(const side of [-1,1])for(let j=0;j<2;j++){
   const n=i*173+side*53+j*31,z=i*step+hash(n+1)*step-distance;
   if(z<0||z>depth||hash(n+6)<.22)continue;
   const p=project(z);if(p.q<.085)continue;
   const x=p.center+side*p.half*(1.29+j*.19+hash(n+2)*.13);
   const a=grass[Math.floor(hash(n+3)*grass.length)],scale=(1.35+hash(n+4)*1.4)*p.q;
   const w=Math.max(1,Math.round(a.width*scale)),h=Math.max(1,Math.round(a.height*scale));
   const dx=side<0?Math.min(Math.round(x-w/2),Math.floor(p.center-p.half*1.29-w)):Math.max(Math.round(x-w/2),Math.ceil(p.center+p.half*1.29));
   if(dx+w<0||dx>W)continue;
   c.globalAlpha=Math.min(.9,(p.q-.085)/.16);
   c.drawImage(a,dx,Math.round(p.y-h),w,h);
  }
  c.restore();
 }
 return {skyline,ground,verge};
})();
