// Cached pixel scenery: reference mountains, cultivated fields, and roadside grass.
window.DriveScenery=(()=>{
 const hash=n=>{const v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v)};
 const canvas=(w,h)=>{const a=document.createElement('canvas');a.width=w;a.height=h;return a};
 const fill=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const grassPatterns=[['.......','..l....','..l..h.','..m..l.','l.m.ml.','.mmmmd.','..ddd..'],['.........','.....h...','.l...l...','..l..m.l.','..m.mm.m.','...mmmm..','...dddd..'],['......','...l..','.h.l..','.l.m.l','..mmm.','..ddd.']];
 const palette={d:'#3f4725',m:'#596432',l:'#768246',h:'#9aa35b'};
 const grass=grassPatterns.map(rows=>{const a=canvas(rows[0].length,rows.length),c=a.getContext('2d');rows.forEach((row,y)=>[...row].forEach((p,x)=>{if(palette[p])fill(c,palette[p],x,y,1,1)}));return a});
 // Full upright pixel-art patches, layered from back to front in world space.
 const colors=[
 ['#434d3c','#5b6947','#7e8b58','#c8b261','#e2ce86','#665343'],
 ['#3e5043','#54684d','#82936b','#a6ad80','#c5c5a1','#66745a'],
 ['#41444c','#555d58','#75816b','#8c82a0','#b8a9c2','#605d73'],
 ['#444f40','#65734f','#899767','#c4a3ae','#e2d0c2','#a07e8c']
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
 // Field lengths are independent of empty terrain. All distances are world units.
 const FIELD_LENGTH_MIN=150,FIELD_LENGTH_MAX=650;
 const FIELD_GAP_SCALE=10,FIELD_BLOCK=560;
 const fieldCache=new Map();
 function fieldSegment(group,side){
  const n=group*137+side*71,start=30+hash(n+6)*160,end=FIELD_BLOCK-60-hash(n+7)*190;
  const active=hash(n+8)>.23;
  const length=active?FIELD_LENGTH_MIN+Math.floor(hash(n+19)*(FIELD_LENGTH_MAX-FIELD_LENGTH_MIN+1)):0;
  // Preserve the previous leading/trailing gaps, including completely empty blocks.
  const empty=active?FIELD_BLOCK-(end-start):FIELD_BLOCK;
  return {n,kind:Math.floor(hash(n)*fields.length),active,leading:active?start*FIELD_GAP_SCALE:0,length,span:length+empty*FIELD_GAP_SCALE};
 }
 function fieldPlot(world,side){
  if(!fieldCache.has(side))fieldCache.set(side,{positive:[],negative:[]});
  const cache=fieldCache.get(side),negative=world<0,list=negative?cache.negative:cache.positive,target=negative?-world:world;
  while(!list.length||target>=list[list.length-1].end){
   const group=negative?-list.length-1:list.length,seg=fieldSegment(group,side),offset=list.length?list[list.length-1].end:0;
   list.push({...seg,offset,end:offset+seg.span});
  }
  let lo=0,hi=list.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(target<list[mid].end)hi=mid;else lo=mid+1;}
  const seg=list[lo],local=negative?seg.span-(target-seg.offset):target-seg.offset;
  return {active:seg.active&&local>=seg.leading&&local<seg.leading+seg.length,kind:seg.kind,n:seg.n};
 }
 // Independent roadside equipment slots, never tied to fields or frames.
 const FARM_CHANCE=.12,FARM_STEP=1040,FARM_HORSE_GAP=400,FARM_FIELD_GAP=300;
 const FARM_FILES=['tractor-blue-hd.webp','tractor-red-hd.webp','dump-truck-hd.webp'];
 const farmBase=new URL('scenery/',document.currentScript.src);
 const farmImages=FARM_FILES.map(name=>{const a=new Image();a.src=new URL(name+'?v=27.84',farmBase).href;return a;});
 function fieldIntersects(from,to,side){
  fieldPlot(to,side);
  const list=fieldCache.get(side).positive;let lo=0,hi=list.length;
  while(lo<hi){const mid=(lo+hi)>>1;if(list[mid].end<=from)lo=mid+1;else hi=mid;}
  for(let i=lo;i<list.length&&list[i].offset<to;i++){const seg=list[i],a=seg.offset+seg.leading,b=a+seg.length;if(seg.active&&a<to&&b>from)return true;}
  return false;
 }
 function farmPlacement(slot,side){
  const n=slot*193+side*79;
  if(hash(n+203)>=FARM_CHANCE)return null;
  const world=slot*FARM_STEP+FARM_STEP*(.15+.7*hash(n+204));
  // Leave a buffer at both edges of every field for the landscape around the vehicle.
  if(RoadsideObjects.horseNearby(world,FARM_HORSE_GAP))return null;
  for(const fieldSide of [-1,1])if(fieldIntersects(Math.max(0,world-FARM_FIELD_GAP),world+FARM_FIELD_GAP,fieldSide))return null;
  return {world,side,lane:1.65+.25*hash(n+205),index:Math.floor(hash(n+206)*FARM_FILES.length)};
 }
 // Soft, shallow pixel ground shadow under the complete equipment scene.
 function farmShadow(c,x,y,w,h,z,edge,project){
  const fog=RoadsideObjects.groundMist(z,project);
  const rx=w*.46,ry=Math.max(1,h*.048);
  c.save();c.fillStyle='#252a20';
  // Three nested flat ellipses give soft edges without blurring the sprite.
  for(const [scale,alpha] of [[1,.07],[.82,.06],[.60,.05]]){
   c.globalAlpha=alpha*edge*(1-fog);
   c.beginPath();c.ellipse(Math.round(x),Math.round(y-ry*.25),Math.max(1,rx*scale),Math.max(.5,ry*scale),0,0,Math.PI*2);c.fill();
  }
  c.restore();
 }
 function farm(c,project,distance,depth,W,queue){
  const objects=[];
  for(const side of [-1,1])for(let i=Math.floor(distance/FARM_STEP);i<=Math.floor((distance+depth)/FARM_STEP);i++){
   const item=farmPlacement(i,side);
   if(item&&item.world>=distance&&item.world<=distance+depth)objects.push(item);
  }
  objects.sort((a,b)=>b.world-a.world);
  c.save();c.imageSmoothingEnabled=false;
  for(const item of objects){
   const a=farmImages[item.index];if(!a.complete||!a.naturalWidth)continue;
   const z=item.world-distance,p=project(z),w=[370,345,385][item.index]*p.q,h=w*a.naturalHeight/a.naturalWidth;
   const x=p.center+item.side*p.half*item.lane;
   if(x+w/2<0||x-w/2>W)continue;
   const edge=Math.max(0,Math.min(1,(depth-z)/240));
   queue(z,()=>{farmShadow(c,x,p.y,w,h,z,edge,project);
   RoadsideObjects.groundMistSprite(c,a,x,p.y,w,h,edge,z,project);},2);
  }
  c.restore();
 }
 function ground(c,project,distance,depth,W,queue){
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
    queue(z,()=>{RoadsideObjects.groundMistSprite(c,tile,left+width/2,p.y,width,height,.66+.34*Math.min(1,p.q/.3),z,project);},0);
   }
  }
  c.restore();
 }
 function verge(c,project,distance,depth,W,queue){
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
   queue(z,()=>RoadsideObjects.groundMistSprite(c,a,dx+w/2,p.y,w,h,Math.min(.9,(p.q-.085)/.16),z,project),0);
  }
  c.restore();
 }
 return {ground,verge,fieldPlot,farm};
})();
