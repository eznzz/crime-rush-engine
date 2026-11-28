// Road obstacles: independent world-space slots and one impact per object.
window.RoadObstacles=(()=>{
 const assetBase=new URL('../../../crime-rush-library/assets/',document.currentScript.src);
 const SLOT=480,LOOK=1800,SIZE=1.4,SIGN_LEAD=40,TYPES={
  pothole:{width:54,height:15,loss:.18,damage:0,depth:12},
  potholes:{width:94,height:39,loss:.28,damage:0,depth:22},
  roadwork:{width:325/SIZE,height:174.2/SIZE,loss:1,damage:5,depth:57.2/SIZE,lethal:true},
  tire:{width:42,height:25,loss:.25,damage:.5,depth:14},
  cone:{width:62,height:35,loss:.10,damage:0,depth:9},
  horse:{width:205/SIZE,height:205*254/384/SIZE,loss:1,damage:5,depth:24,lethal:true}
 };
 const hash=n=>{const v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v);};
 const controls={enabled:document.getElementById('obstaclesEnabled'),chance:document.getElementById('obstaclesChance'),horseChance:document.getElementById('horseChance'),roadworkChance:document.getElementById('roadworkChance'),damage:document.getElementById('obstaclesDamage'),types:Object.fromEntries(Object.keys(TYPES).map(k=>[k,document.getElementById('obstacle-'+k)]))};
 const output=document.getElementById('obstaclesChanceValue');
 controls.chance.addEventListener('input',()=>output.textContent=controls.chance.value+'%');
 controls.horseChance.addEventListener('input',()=>document.getElementById('horseChanceValue').textContent=Number(controls.horseChance.value).toFixed(1)+'%');
 controls.roadworkChance.addEventListener('input',()=>document.getElementById('roadworkChanceValue').textContent=Number(controls.roadworkChance.value).toFixed(1)+'%');
 const consumed=new Set(),passed=new Set(),near=new Map(),tires=new Map(),debris=[],explosions=[];
 function reset(){consumed.clear();passed.clear();near.clear();tires.clear();debris.length=0;explosions.length=0;}
 function assets(target){for(const k of [...Object.keys(TYPES),'warning','work-barriers'])target['obstacle:'+k]=[new URL(k==='work-barriers'?'webp/roadside/barriers/motorway-work-barriers.webp':k==='horse'?'webp/drive/horse-grazing-01.webp?v=28.41':k==='roadwork'?'webp/drive/tractor-red-hd.webp?v=28.50':'sources/drive/obstacles/'+k+'.svg?v=28.41',assetBase).href];}
 function items(distance,from=0,to=LOOK){
  if(!controls.enabled.checked)return [];
  const types=Object.keys(TYPES).filter(k=>!TYPES[k].lethal&&controls.types[k].checked),horseChance=controls.types.horse.checked?Number(controls.horseChance.value)/100:0,roadworkChance=controls.types.roadwork.checked?Number(controls.roadworkChance.value)/100:0;
  if(!types.length&&!horseChance&&!roadworkChance)return [];
  const out=[],chance=Number(controls.chance.value)/100;
  // Deterministic local priority: no two lethal hazards within the full visible road range.
  const lethalChance=horseChance+roadworkChance,spacing=LOOK+200;
  const worldAt=i=>i*SLOT+hash(i*19+8)*100;
  const candidate=i=>i>=1&&hash(i*19+17)<lethalChance&&!DriveCrossroads.blocked(worldAt(i),200);
  const accepted=i=>{const p=hash(i*19+57),world=worldAt(i),n=Math.ceil((spacing+100)/SLOT);for(let j=Math.max(1,i-n);j<=i+n;j++){if(j===i||!candidate(j)||Math.abs(worldAt(j)-world)>=spacing)continue;const q=hash(j*19+57);if(q<p||(q===p&&j<i))return false;}return true;};
  for(let i=Math.max(1,Math.floor((distance+from)/SLOT));i<=Math.ceil((distance+to)/SLOT);i++){
   const roll=hash(i*19+17),allow=candidate(i)&&accepted(i),horse=allow&&roll<horseChance,roadwork=allow&&!horse&&roll<lethalChance;
   if(!horse&&!roadwork&&(!types.length||hash(i*19+7)>=chance))continue;
   const z=i*SLOT+hash(i*19+8)*100-distance;
   if(DriveCrossroads.blocked(distance+z,200))continue;
   if(z<from||z>to||consumed.has(i))continue;
   const type=horse?'horse':roadwork?'roadwork':types[Math.min(types.length-1,Math.floor(hash(i*19+9)*types.length))];
   let lane=[-.75,-.25,.25,.75][Math.floor(hash(i*19+10)*4)]+(hash(i*19+11)*2-1)*.10;
   const motion=type==='tire'?tires.get(i):null;if(motion)lane=motion.lane;
   if(type==='roadwork')lane=[-.75,-.25,.25,.75].reduce((a,b)=>Math.abs(a-lane)<Math.abs(b-lane)?a:b);
   const spec=TYPES[type];out.push({id:i,type,lane,z,...spec,width:spec.width*SIZE,height:spec.height*SIZE,depth:spec.depth*SIZE,bounce:motion?Math.sin(Math.PI*Math.min(1,motion.age/.55)):0});
  }
  return out;
 }
 const isPothole=type=>type==='pothole'||type==='potholes';
 // Three separate cavities within the grouped hazard, normalized to the sprite canvas.
 const CLUSTER=[{left:0,right:47,top:23,bottom:37},{left:39,right:94,top:3,bottom:19},{left:63,right:87,top:23,bottom:31}];
 function draw(c,project,distance,images,queue,twoWay=false){
  for(const o of items(distance,-85,LOOK+85)){
   if(isPothole(o.type)&&(!twoWay||o.lane>0)){
    const z=o.z-SIGN_LEAD;
    if(z>=0&&z<=LOOK)for(const side of (twoWay?[1]:[-1,1])){const p=project(z),w=Math.max(1,Math.round(62*p.q)),h=Math.max(1,Math.round(138*p.q)),x=p.center+side*(p.half+w/2+2*p.q);
     // Draw directly, independently of SVG loading and other roadside assets.
     queue(z,()=>{c.save();c.globalAlpha=Math.min(1,(LOOK-z)/180);c.translate(Math.round(x),Math.round(p.y-h));c.scale(w/34,h/76);
      c.fillStyle='#858986';c.fillRect(-2,28,4,48);
      const tri=(color,a,b)=>{c.fillStyle=color;c.beginPath();c.moveTo(0,a);c.lineTo(-b,32-a*.3);c.lineTo(b,32-a*.3);c.closePath();c.fill();};
      tri('#302e2d',0,17);tri('#c74332',2,15);tri('#f3e6cb',8,10);
      c.fillStyle='#282b30';c.fillRect(-2,13,4,9);c.fillRect(-2,24,4,3);c.restore();},5);
    }
   }
   if(o.type!=='roadwork'&&(o.z<0||o.z>LOOK))continue;
   if(o.type==='potholes'){
    // Each cavity is projected onto the road surface at its own longitudinal position.
    const art=images['obstacle:pothole'];if(!art?.naturalWidth)continue;
    for(const k of CLUSTER){const z=o.z+(19.5-(k.top+k.bottom)/2)*SIZE;if(z<0||z>LOOK)continue;const p=project(z),x=p.center+p.half*(typeof physicalLane==='function'?physicalLane(o.z,o.lane):o.lane)+((k.left+k.right)/2-47)*SIZE*p.q,w=Math.max(1,Math.round((k.right-k.left)*SIZE*p.q)),h=Math.max(1,Math.round((k.bottom-k.top)*SIZE*p.q*.45));
     queue(z,()=>{c.save();c.globalAlpha=Math.min(1,(LOOK-z)/240);c.imageSmoothingEnabled=false;c.drawImage(art,Math.round(x-w/2),Math.round(p.y-h/2),w,h);c.restore();},1);
    }continue;
   }
   if(o.type==='roadwork'){
    const art=images['obstacle:roadwork'],barrier=images['obstacle:work-barriers'];
    const p=project(Math.max(0,o.z)),x=p.center+p.half*(typeof physicalLane==='function'?physicalLane(o.z,o.lane):o.lane),w=Math.max(1,Math.round(o.width*p.q)),h=art?.naturalWidth?w*art.naturalHeight/art.naturalWidth:0;
    if(h&&o.z>=0&&o.z<=LOOK)queue(o.z,()=>{c.save();c.globalAlpha=.15*(1-RoadsideObjects.groundMist(o.z,project));c.fillStyle='#22251e';c.beginPath();c.ellipse(x,p.y,w*.46,Math.max(1,h*.055),0,0,Math.PI*2);c.fill();RoadsideObjects.groundMistSprite(c,art,x,p.y,w,h,Math.min(1,(LOOK-o.z)/240),o.z,project);c.restore();},3);
    for(const side of (twoWay&&o.lane<0?[-1,1]:[-1])){const z=o.z+side*65;if(z<0||z>LOOK)continue;const p=project(z),cx=p.center+p.half*(typeof physicalLane==='function'?physicalLane(o.z,o.lane):o.lane),cw=Math.max(1,Math.round(p.half*.5)),ch=Math.max(1,Math.round(barrier?.naturalWidth?cw*barrier.naturalHeight/barrier.naturalWidth:cw*.36));if(!barrier?.naturalWidth)continue;queue(z,()=>{c.save();c.imageSmoothingEnabled=false;RoadsideObjects.groundMistSprite(c,barrier,cx,p.y,cw,ch,Math.min(1,(LOOK-z)/240),z,project);c.restore();},3);}
    continue;
   }
   const p=project(o.z),x=p.center+p.half*(typeof physicalLane==='function'?physicalLane(o.z,o.lane):o.lane),w=Math.max(1,Math.round(o.width*p.q)),a=images['obstacle:'+o.type],h=Math.max(1,Math.round(o.type==='horse'&&a?.naturalWidth?w*a.naturalHeight/a.naturalWidth:o.height*p.q));
   if(!a?.naturalWidth)continue;
   queue(o.z,()=>{c.save();const alpha=Math.min(1,(LOOK-o.z)/240);c.globalAlpha=alpha;c.imageSmoothingEnabled=false;
    if(o.type==='horse'){
     // Same cached distance-based ground mist and shadow attenuation as roadside horses.
     c.globalAlpha=.18*alpha*(1-RoadsideObjects.groundMist(o.z,project));c.fillStyle='#22251e';
     c.beginPath();c.ellipse(x,p.y,w*.40,Math.max(1,h*.065),0,0,Math.PI*2);c.fill();
     if(hash(o.id*19+12)>.5){c.translate(2*x,0);c.scale(-1,1);}
     RoadsideObjects.groundMistSprite(c,a,x,p.y,w,h,alpha,o.z,project);
    }else{
     if(!isPothole(o.type)){c.fillStyle='#17191d66';c.beginPath();c.ellipse(x,p.y-1,w*.51,Math.max(1,h*.10),0,0,Math.PI*2);c.fill();}
     c.drawImage(a,Math.round(x-w/2),Math.round(p.y-h-(o.bounce||0)*25*p.q),w,h);
    }
    c.restore();},isPothole(o.type)?1:3);
  }
  for(const e of explosions){
   const z=e.world-distance;if(z<0||z>LOOK)continue;
   const p=project(z),x=p.center+p.half*(typeof physicalLane==='function'?physicalLane(z,e.lane):e.lane),f=e.age/1.05;
   queue(z,()=>{c.save();c.globalAlpha=(1-f)*Math.min(1,(LOOK-z)/180);for(const d of e.particles){
    const t=Math.min(1,f*1.5),xx=x+d.dx*t*p.q,yy=p.y-(25+d.dy*t+Math.sin(Math.PI*t)*35)*p.q;
    const size=Math.max(1,Math.round(d.size*(d.white?1-t*.4:.65+t*.8)*p.q));c.fillStyle=d.white?d.color:f>.45?'#54535a':d.color;c.fillRect(Math.round(xx-size/2),Math.round(yy-size/2),size,size);
   }c.restore();},5);
  }
  for(const d of debris){
   const z=d.world-distance;if(z<0||z>LOOK)continue;
   const p=project(z),f=d.age/.65,x=p.center+p.half*((typeof physicalLane==='function'?physicalLane(z,d.lane):d.lane)+d.vx*f),y=p.y-(Math.sin(Math.PI*f)*d.height+12*(1-f))*p.q;
   queue(z,()=>{c.save();c.globalAlpha=1-f;c.fillStyle=d.color;const size=Math.max(1,Math.round(d.size*p.q));c.fillRect(Math.round(x),Math.round(y),size,Math.max(1,Math.round(size*.65)));c.restore();},4);
  }
 }
 function destroyCones(o,distance){
  if(consumed.has(o.id))return;
  consumed.add(o.id);near.delete(o.id);
  for(let i=0;i<14;i++)debris.push({world:distance+o.z+(Math.random()-.5)*18,lane:o.lane,vx:(Math.random()-.5)*.55,height:18+Math.random()*48,size:4+Math.random()*8,age:0,color:['#d66932','#f0a15c','#e7d9b9','#38383a'][i%4]});
  if(debris.length>84)debris.splice(0,debris.length-84);
 }
 function kick(o,actor){
  const old=tires.get(o.id);if(old&&(old.age<.8||old.actor===actor))return false;
  const centers=[-.75,-.25,.25,.75],index=centers.reduce((best,v,i)=>Math.abs(v-o.lane)<Math.abs(centers[best]-o.lane)?i:best,0);
  const options=[index-1,index+1].filter(i=>i>=0&&i<4),target=centers[options[Math.floor(Math.random()*options.length)]];
  tires.set(o.id,{lane:o.lane,from:o.lane,target,age:0,actor});return true;
 }
 function tick(dt,distance){for(let i=explosions.length-1;i>=0;i--){explosions[i].age+=dt;if(explosions[i].age>=1.05)explosions.splice(i,1);}for(let i=debris.length-1;i>=0;i--){debris[i].age+=dt;if(debris[i].age>=.65)debris.splice(i,1);}for(const [id,m] of tires){m.age+=dt;const f=Math.min(1,m.age/.55);m.lane=m.from+(m.target-m.from)*f*f*(3-2*f);if(id*SLOT<distance-LOOK)tires.delete(id);}}
 function trafficContact(car,prev,distance,travel,project,bounds,horseBounds){
  if(!car.model)return;
  const margin=Math.max(45,TYPES.roadwork.depth*SIZE);
  const from=Math.min(prev+travel,car.z)-margin,to=Math.max(prev+travel,car.z)+margin;
  for(const o of items(distance,from,to)){if(o.type!=='tire'&&o.type!=='cone'&&!o.lethal)continue;
   if(o.lethal&&(o.z<Math.min(prev+travel,car.z)-o.depth||o.z>Math.max(prev+travel,car.z)+o.depth))continue;
   const p=project(Math.max(0,o.z)),x=p.center+p.half*(typeof physicalLane==='function'?physicalLane(o.z,o.lane):o.lane),w=o.width*p.q,b=bounds(car,Math.max(0,o.z));
   const ob=o.lethal&&horseBounds?horseBounds(o,x,p.q):{left:x-w/2,right:x+w/2};
   if(b.left<ob.right&&b.right>ob.left){if(o.lethal){window.PreviewAudio?.play('crash');consumed.add(o.id);near.delete(o.id);explosions.push({world:distance+o.z,lane:o.lane,age:0,particles:[...Array.from({length:30},(_,i)=>({dx:(Math.random()-.5)*210,dy:Math.random()*120,size:9+Math.random()*22,color:['#ffdd82','#f38b39','#c14b30','#34343a'][i%4]})),...Array.from({length:48},(_,i)=>({dx:(Math.random()-.5)*370,dy:Math.random()*180-25,size:2+Math.random()*5,color:i%3?'#f8f5ed':'#ffffff',white:true}))]});if(explosions.length>8)explosions.shift();return true;}if(o.type==='cone')destroyCones(o,distance);else kick(o,car);}
  }
 }
 function horses(distance){return items(distance,0,LOOK).filter(o=>o.type==='horse'||o.type==='roadwork');}
 function step(previous,distance,pp,oldPP,project,horseBounds){
  // Sweep through the player's depth to avoid skipping objects at high speed.
  const travel=Math.max(0,distance-previous);
  const hits=[];let bonus=0;
  for(const o of items(distance,pp.z-travel-85,pp.z+85)){
   if(passed.has(o.id))continue;
   const p=project(pp.z),x=p.center+p.half*(typeof physicalLane==='function'?physicalLane(o.z,o.lane):o.lane),w=o.width*p.q;
   const left=Math.min(pp.left,oldPP.left),right=Math.max(pp.right,oldPP.right);
   const bounds=o.lethal&&horseBounds?horseBounds(o,x,p.q):{left:x-w/2,right:x+w/2};
   let gap=Math.max(left-bounds.right,bounds.left-right);
   if(o.type==='potholes'){
    // Test each cavity, not the empty gaps in the combined artwork.
    const gaps=CLUSTER.filter(k=>{const shift=(39-(k.top+k.bottom)/2-19.5)*SIZE;const d=o.z+shift;return d<=pp.z+10*SIZE&&d+travel>=pp.z-10*SIZE;}).map(k=>Math.max(left-(x+w*(k.right/94-.5)),x+w*(k.left/94-.5)-right));
    gap=gaps.length?Math.min(...gaps):Infinity;
   }
   if(o.z<=pp.z+o.depth&&o.z+travel>=pp.z-o.depth){
    if(gap<=0){if(o.type==='tire'){if(!kick(o,'player'))continue;passed.add(o.id);}else if(o.type==='cone')destroyCones(o,distance);else if(isPothole(o.type))passed.add(o.id);else consumed.add(o.id);near.delete(o.id);hits.push({...o,damage:controls.damage.checked?o.damage:0,damageEnabled:controls.damage.checked,direction:pp.px<x?-1:1});continue;}
    if(travel>0&&gap<=Math.max(5,pp.w*.18))near.set(o.id,true);
   }
   if(travel>0&&o.z<pp.z-o.depth&&o.z+travel>=pp.z-o.depth){passed.add(o.id);if(near.delete(o.id))bonus+=50;}
  }
  for(const id of consumed)if(id*SLOT<distance-LOOK)consumed.delete(id);
  for(const id of passed)if(id*SLOT<distance-LOOK)passed.delete(id);
  for(const id of near.keys())if(id*SLOT<distance-LOOK)near.delete(id);
  return {hits,bonus};
 }
 return {assets,draw,step,reset,tick,horses,trafficContact};
})();
