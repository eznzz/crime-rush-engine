// Layered pixel-art shoulder. World-space noise keeps soil attached to the road.
window.RoadsideSoil=(()=>{
 const hash=n=>{const v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v)};
 const noise=(v,seed)=>{const i=Math.floor(v),f=v-i,k=f*f*(3-2*f);return hash(i+seed)*(1-k)+hash(i+1+seed)*k};
 function extent(z,side){return .10+.065*noise(z/85,side*79)+.035*noise(z/19,side*131);}
 function draw(c,project,distance,depth,width){
  c.save();c.imageSmoothingEnabled=false;
  // Scanline bands follow the exact road projection, with independent irregular edges.
  const near=project(0),far=project(depth);
  for(let y=Math.ceil(far.y);y<=Math.floor(near.y);y++){
   const q=(y-far.y+far.q*(near.y-far.y)/(1-far.q))/((near.y-far.y)/(1-far.q));
   if(q<=0||q>1.001)continue;
   const z=Math.max(0,155*(1/q-1)),p=project(z),world=distance+z;
   for(const side of [-1,1]){
    const edge=p.center+side*p.half,span=extent(world,side)*p.half;
    const band=(a,b,color)=>{const x1=Math.round(edge+side*a),x2=Math.round(edge+side*b);if(x1===x2)return;c.fillStyle=color;c.fillRect(Math.min(x1,x2),y,Math.abs(x2-x1),1)};
    const rough=noise(world/12,side*219);
    band(0,span*.26,'#514b46');
    band(span*.26,span*(.70+rough*.12),'#807463');
    band(span*(.70+rough*.12),span,'#6b6556');
    band(span,span*(1.12+rough*.27),'#2c341c');
   }
  }
  // Scattered soil/gravel pixels and green islands soften the transition.
  const step=8,first=Math.floor(distance/step),last=Math.ceil((distance+depth)/step);
  for(let i=last;i>=first;i--)for(const side of [-1,1])for(let j=0;j<9;j++){
   const n=i*193+side*71+j*29,world=i*step+hash(n+1)*step,z=world-distance;
   if(z<0||z>depth)continue;
   const p=project(z),q=p.q;if(q<.075)continue;
   const span=extent(world,side)*p.half,t=hash(n+2)*1.32;
   const x=p.center+side*(p.half+span*t),w=Math.max(1,Math.round((2+hash(n+3)*6)*q)),h=Math.max(1,Math.round((1+hash(n+4)*2)*q));
   const dx=side<0?Math.floor(x-w):Math.ceil(x);
   if(dx+w<0||dx>width)continue;
   const colors=t>.75?['#2c341c','#3c4424','#847866']:['#494641','#a0927a','#6b6257','#b0a088'];
   c.globalAlpha=Math.min(.9,(q-.075)/.15);
   c.fillStyle=colors[Math.floor(hash(n+5)*colors.length)];c.fillRect(dx,Math.round(p.y),w,h);
  }
  c.restore();
 }
 return {draw};
})();
