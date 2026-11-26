// Cached pixel scenery: mountain town, cultivated fields, and roadside grass.
window.DriveScenery=(()=>{
 const hash=n=>{const v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v)};
 const canvas=(w,h)=>{const a=document.createElement('canvas');a.width=w;a.height=h;return a};
 const horizon=canvas(432,94),hc=horizon.getContext('2d');
 const fill=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 // Stepped mountain ridges in muted sunset hues, no high-rise silhouette.
 for(let layer=0;layer<3;layer++){
  const colors=['#88838e','#8d8a8b','#92908a'];
  for(let x=0;x<432;x+=2){
   const peak=layer===0?26:layer===1?40:57;
   const y=Math.round((peak+Math.sin(x/(34+layer*11)+layer*2)*10+Math.sin(x/(13+layer*3)+layer)*5+Math.sin(x/7)*2)/2)*2;
   fill(hc,colors[layer],x,y,2,94-y);
  }
 }
 for(let i=0;i<57;i++){
  const n=i*79,x=Math.round(12+hash(n)*408);
  if(x>199&&x<233)continue;
  const w=4+Math.floor(hash(n+1)*8),h=4+Math.floor(hash(n+2)*9);
  const base=87-Math.round(hash(n+3)*9);
  fill(hc,['#797e7d','#85847d','#8b8277'][i%3],x,base-h,w,h);
  const roof=base-h-2;fill(hc,'#797471',x-1,roof+1,w+2,1);fill(hc,'#797471',x+1,roof,w-2,1);
  if(w>7){fill(hc,'#c2a68a',x+2,base-h+3,1,2);fill(hc,'#aaa08d',x+w-3,base-h+3,1,2)}
 }
 const grassPatterns=[['.......','..l....','..l..h.','..m..l.','l.m.ml.','.mmmmd.','..ddd..'],['.........','.....h...','.l...l...','..l..m.l.','..m.mm.m.','...mmmm..','...dddd..'],['......','...l..','.h.l..','.l.m.l','..mmm.','..ddd.']];
 const palette={d:'#29472c',m:'#42613a',l:'#61804a',h:'#86935a'};
 const grass=grassPatterns.map(rows=>{const a=canvas(rows[0].length,rows.length),c=a.getContext('2d');rows.forEach((row,y)=>[...row].forEach((p,x)=>{if(palette[p])fill(c,palette[p],x,y,1,1)}));return a});
 // Small repeating pixel tiles for different crops.
 const fieldColors=[['#526038','#667347','#879059'],['#6d6541','#8b794d','#a18a54'],['#3f5938','#567347','#6d8651']];
 const fields=fieldColors.map((p,j)=>{const a=canvas(32,16),c=a.getContext('2d');fill(c,p[0],0,0,32,16);for(let y=0;y<16;y+=4){fill(c,p[1],0,y,32,2);for(let x=0;x<32;x+=3)if(hash(x*23+y*71+j*89)>.42)fill(c,p[2],x,y,1,1)}return a});
 function skyline(c,W,hy){c.save();c.imageSmoothingEnabled=false;c.globalAlpha=.43;c.drawImage(horizon,0,hy-91,W,94);c.restore();}
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
   const top=project(far),bottom=project(near);
   for(let y=Math.ceil(top.y);y<Math.ceil(bottom.y);y++){
    const q=top.q+(bottom.q-top.q)*(y-top.y)/Math.max(.001,bottom.y-top.y);
    if(q<=0)continue;
    const z=Math.max(0,155*(1/q-1)),p=project(z);
    const x1=p.center+side*p.half*inner,x2=p.center+side*p.half*outer;
    const left=Math.round(Math.min(x1,x2)),right=Math.round(Math.max(x1,x2));
    if(right<0||left>W||right<=left)continue;
    const row=Math.floor((distance+z)/9)%tile.height;
    c.globalAlpha=.35+.5*Math.min(1,q/.25);
    c.drawImage(tile,0,row,32,1,left,y,right-left,1);
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
