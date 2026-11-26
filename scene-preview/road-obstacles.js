// Road obstacles: independent world-space slots and one impact per object.
window.RoadObstacles=(()=>{
 const SLOT=480,LOOK=1800,SIZE=1.4,SIGN_LEAD=220,TYPES={
  pothole:{width:54,height:15,loss:.18,damage:0,depth:12},
  tire:{width:42,height:25,loss:.25,damage:.5,depth:14},
  cone:{width:62,height:35,loss:.10,damage:0,depth:9},
  horse:{width:205/SIZE,height:205*254/384/SIZE,loss:1,damage:5,depth:24,lethal:true}
 };
 const hash=n=>{const v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v);};
 const controls={enabled:document.getElementById('obstaclesEnabled'),chance:document.getElementById('obstaclesChance'),damage:document.getElementById('obstaclesDamage'),types:Object.fromEntries(Object.keys(TYPES).map(k=>[k,document.getElementById('obstacle-'+k)]))};
 const output=document.getElementById('obstaclesChanceValue');
 controls.chance.addEventListener('input',()=>output.textContent=controls.chance.value+'%');
 const consumed=new Set(),passed=new Set(),near=new Map();
 function reset(){consumed.clear();passed.clear();near.clear();}
 function assets(target){for(const k of [...Object.keys(TYPES),'warning'])target['obstacle:'+k]=[k==='horse'?'./assets/webp/drive/horse-grazing-01.webp?v=28.41':'./assets/sources/drive/obstacles/'+k+'.svg?v=28.41'];}
 function items(distance,from=0,to=LOOK){
  if(!controls.enabled.checked)return [];
  const types=Object.keys(TYPES).filter(k=>controls.types[k].checked);
  if(!types.length)return [];
  const out=[],chance=Number(controls.chance.value)/100;
  for(let i=Math.max(1,Math.floor((distance+from)/SLOT));i<=Math.ceil((distance+to)/SLOT);i++){
   if(hash(i*19+7)>=chance)continue;
   const z=i*SLOT+hash(i*19+8)*100-distance;
   if(z<from||z>to||consumed.has(i))continue;
   const type=types[Math.min(types.length-1,Math.floor(hash(i*19+9)*types.length))];
   const lane=[-.75,-.25,.25,.75][Math.floor(hash(i*19+10)*4)]+(hash(i*19+11)*2-1)*.10;
   const spec=TYPES[type];out.push({id:i,type,lane,z,...spec,width:spec.width*SIZE,height:spec.height*SIZE,depth:spec.depth*SIZE});
  }
  return out;
 }
 function draw(c,project,distance,images,queue){
  for(const o of items(distance,0,LOOK+SIGN_LEAD)){
   if(o.type==='pothole'){
    const z=o.z-SIGN_LEAD,a=images['obstacle:warning'];
    if(z>=0&&z<=LOOK&&a?.naturalWidth){const p=project(z),side=o.lane<0?-1:1,w=Math.max(1,Math.round(60*p.q)),h=Math.max(1,Math.round(134*p.q)),x=p.center+side*(p.half+w/2+3*p.q);
     queue(z,()=>{c.save();c.globalAlpha=Math.min(1,(LOOK-z)/240);c.imageSmoothingEnabled=false;c.fillStyle='#17191d55';c.beginPath();c.ellipse(x,p.y,Math.max(1,w*.20),Math.max(1,h*.035),0,Math.PI*2);c.fill();c.drawImage(a,Math.round(x-w/2),Math.round(p.y-h),w,h);c.restore();},3);
    }
   }
   if(o.z>LOOK)continue;
   const p=project(o.z),x=p.center+p.half*o.lane,w=Math.max(1,Math.round(o.width*p.q)),a=images['obstacle:'+o.type],h=Math.max(1,Math.round(o.type==='horse'&&a?.naturalWidth?w*a.naturalHeight/a.naturalWidth:o.height*p.q));
   if(!a?.naturalWidth)continue;
   queue(o.z,()=>{c.save();c.globalAlpha=Math.min(1,(LOOK-o.z)/240);c.imageSmoothingEnabled=false;
    if(o.type!=='pothole'){c.fillStyle='#17191d66';c.beginPath();c.ellipse(x,p.y-1,w*.51,Math.max(1,h*.10),0,0,Math.PI*2);c.fill();}
    if(o.type==='horse'&&hash(o.id*19+12)>.5){c.translate(2*x,0);c.scale(-1,1);}
    c.drawImage(a,Math.round(x-w/2),Math.round(p.y-h),w,h);c.restore();},o.type==='pothole'?1:3);
  }
 }
 function step(previous,distance,pp,oldPP,project){
  // Sweep through the player's depth to avoid skipping objects at high speed.
  const travel=Math.max(0,distance-previous);
  const hits=[];let bonus=0;
  for(const o of items(distance,pp.z-travel-36,pp.z+36)){
   if(passed.has(o.id))continue;
   const p=project(pp.z),x=p.center+p.half*o.lane,w=o.width*p.q;
   const left=Math.min(pp.left,oldPP.left),right=Math.max(pp.right,oldPP.right);
   const gap=Math.max(left-(x+w/2),(x-w/2)-right);
   if(o.z<=pp.z+o.depth&&o.z+travel>=pp.z-o.depth){
    if(gap<=0){consumed.add(o.id);near.delete(o.id);hits.push({...o,damage:controls.damage.checked?o.damage:0,direction:pp.px<x?-1:1});continue;}
    if(travel>0&&gap<=Math.max(5,pp.w*.18))near.set(o.id,true);
   }
   if(travel>0&&o.z<pp.z-o.depth&&o.z+travel>=pp.z-o.depth){passed.add(o.id);if(near.delete(o.id))bonus+=50;}
  }
  for(const id of consumed)if(id*SLOT<distance-LOOK)consumed.delete(id);
  for(const id of passed)if(id*SLOT<distance-LOOK)passed.delete(id);
  for(const id of near.keys())if(id*SLOT<distance-LOOK)near.delete(id);
  return {hits,bonus};
 }
 return {assets,draw,step,reset};
})();
