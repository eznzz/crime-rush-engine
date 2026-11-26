// Cached pixel scenery: mountain town, cultivated fields, and roadside grass.
window.DriveScenery=(()=>{
 const hash=n=>{const v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v)};
 const canvas=(w,h)=>{const a=document.createElement('canvas');a.width=w;a.height=h;return a};
 const fill=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const sprite=name=>{const a=new Image();a.src='scenery/'+name+'.png';return a};
 const horizon=sprite('mountain-town');
 const grassPatterns=[['.......','..l....','..l..h.','..m..l.','l.m.ml.','.mmmmd.','..ddd..'],['.........','.....h...','.l...l...','..l..m.l.','..m.mm.m.','...mmmm..','...dddd..'],['......','...l..','.h.l..','.l.m.l','..mmm.','..ddd.']];
 const palette={d:'#29472c',m:'#42613a',l:'#61804a',h:'#86935a'};
 const grass=grassPatterns.map(rows=>{const a=canvas(rows[0].length,rows.length),c=a.getContext('2d');rows.forEach((row,y)=>[...row].forEach((p,x)=>{if(palette[p])fill(c,palette[p],x,y,1,1)}));return a});
 const fields=['wheat-field','grass-field','meadow-field'].map(sprite);
 function skyline(c,W,hy){if(!horizon.naturalWidth)return;c.save();c.imageSmoothingEnabled=false;c.globalAlpha=.50;c.drawImage(horizon,0,hy-120,W,120);c.restore();}
 function ground(c,project,distance,depth,W){
  c.save();c.imageSmoothingEnabled=false;
  // Cultivated plots start far beyond the soil shoulder; project strips to the road plane.
  const block=330,first=Math.floor(distance/block),last=Math.ceil((distance+depth)/block);
  for(let i=last;i>=first;i--)for(const side of [-1,1]){
   const n=i*137+side*71;if(hash(n)<.22)continue;
   const near=Math.max(0,i*block+24-distance),far=Math.min(depth,(i+1)*block-25-distance);
   if(far<=near)continue;
   const inner=2.15+hash(n+1)*.65,outer=inner+1.8+hash(n+2)*2.4;
   const tile=fields[Math.floor(hash(n+3)*fields.length)];
   if(!tile.naturalWidth)continue;
   const top=project(far),bottom=project(near);
   for(let y=Math.ceil(top.y);y<Math.ceil(bottom.y);y++){
    const q=top.q+(bottom.q-top.q)*(y-top.y)/Math.max(.001,bottom.y-top.y);
    if(q<=0)continue;
    const z=Math.max(0,155*(1/q-1)),p=project(z);
    const x1=p.center+side*p.half*inner,x2=p.center+side*p.half*outer;
    const left=Math.round(Math.min(x1,x2)),right=Math.round(Math.max(x1,x2));
    if(right<0||left>W||right<=left)continue;
    const row=Math.min(tile.height-1,Math.max(0,Math.floor(((i+1)*block-25-distance-z)/(block-49)*tile.height)));
    c.globalAlpha=.35+.5*Math.min(1,q/.25);
    c.drawImage(tile,0,row,tile.width,1,left,y,right-left,1);
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
