// Three transparent pixel-art grass sprites, generated once and reused.
window.RoadsideGrass=(()=>{
 const palette={d:'#23432b',m:'#38603a',l:'#527b43',h:'#819453'};
 const patterns=[
 ['..........','......h...','..l...l...','..l..lm...','...m.m..l.','l..m.m.l..','.m.mmm.m..','.dmmmmmd..','..dddddd..'],
 ['............','....h.......','....l...l...','.l..l...m...','..m.m..m..h.','..m.mm.m.l..','...mmmmmm...','..dmmmmmd...','...ddddd....'],
 ['........','.....l..','.h...l..','.l..m...','..m.m.l.','..mmm.m.','..dmmmd.','...ddd..']
 ];
 const sprites=patterns.map(rows=>{const cv=document.createElement('canvas');cv.width=rows[0].length;cv.height=rows.length;const c=cv.getContext('2d');for(let y=0;y<rows.length;y++)for(let x=0;x<rows[y].length;x++){const color=palette[rows[y][x]];if(color){c.fillStyle=color;c.fillRect(x,y,1,1)}}return cv});
 const hash=n=>{const v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v)};
 function draw(c,project,distance,depth,width){
  const step=36,first=Math.floor(distance/step),last=Math.ceil((distance+depth)/step);
  c.save();c.imageSmoothingEnabled=false;
  for(let i=last;i>=first;i--)for(const side of [-1,1])for(let j=0;j<3;j++){
   const n=i*173+side*53+j*31,z=i*step+hash(n+1)*step-distance;
   if(z<0||z>depth)continue;
   const p=project(z),q=p.q;if(q<.075)continue;
   const x=p.center+side*p.half*(1.045+j*.12+hash(n+2)*.10);
   const sprite=sprites[Math.floor(hash(n+3)*sprites.length)],scale=(1.6+hash(n+4)*1.9)*q;
   const w=Math.max(1,Math.round(sprite.width*scale)),h=Math.max(1,Math.round(sprite.height*scale));
   const dx=side<0?Math.min(Math.round(x-w/2),Math.floor(p.center-p.half-w-1)):Math.max(Math.round(x-w/2),Math.ceil(p.center+p.half+1));
   if(dx+w<0||dx>width)continue;
   c.globalAlpha=Math.min(1,(q-.075)/.17);
   c.drawImage(sprite,dx,Math.round(p.y-h),w,h);
  }
  c.restore();
 }
 return {draw};
})();
