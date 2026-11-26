// Road obstacles: independent world-space slots and one impact per object.
window.RoadObstacles=(()=>{
 const SLOT=480,LOOK=1800,SIZE=1.4,SIGN_LEAD=40,TYPES={
  pothole:{width:54,height:15,loss:.18,damage:0,depth:12},
  tire:{width:42,height:25,loss:.25,damage:.5,depth:14},
  cone:{width:62,height:35,loss:.10,damage:0,depth:9},
  horse:{width:205/SIZE,height:205*254/384/SIZE,loss:1,damage:5,depth:24,lethal:true}
 };
 const hash=n=>{const v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v);};
 const controls={enabled:document.getElementById('obstaclesEnabled'),chance:document.getElementById('obstaclesChance'),horseChance:document.getElementById('horseChance'),damage:document.getElementById('obstaclesDamage'),types:Object.fromEntries(Object.keys(TYPES).map(k=>[k,document.getElementById('obstacle-'+k)]))};
 const output=document.getElementById('obstaclesChanceValue');
 controls.chance.addEventListener('input',()=>output.textContent=controls.chance.value+'%');
 controls.horseChance.addEventListener('input',()=>document.getElementById('horseChanceValue').textContent=Number(controls.horseChance.value).toFixed(1)+'%');
 const consumed=new Set(),passed=new Set(),near=new Map(),tires=new Map(),debris=[],explosions=[];
 function reset(){consumed.clear();passed.clear();near.clear();tires.clear();debris.length=0;explosions.length=0;}
 function assets(target){for(const k of [...Object.keys(TYPES),'warning'])target['obstacle:'+k]=[k==='horse'?'./assets/webp/drive/horse-grazing-01.webp?v=28.41':'./assets/sources/drive/obstacles/'+k+'.svg?v=28.41'];}
 function items(distance,from=0,to=LOOK){
  if(!controls.enabled.checked)return [];
  const types=Object.keys(TYPES).filter(k=>k!=='horse'&&controls.types[k].checked),horseChance=controls.types.horse.checked?Number(controls.horseChance.value)/100:0;
  if(!types.length&&!horseChance)return [];
  const out=[],chance=Number(controls.chance.value)/100;
  for(let i=Math.max(1,Math.floor((distance+from)/SLOT));i<=Math.ceil((distance+to)/SLOT);i++){
   const horse=hash(i*19+17)<horseChance;
   if(!horse&&(!types.length||hash(i*19+7)>=chance))continue;
   const z=i*SLOT+hash(i*19+8)*100-distance;
   if(z<from||z>to||consumed.has(i))continue;
   const type=horse?'horse':types[Math.min(types.length-1,Math.floor(hash(i*19+9)*types.length))];
   let lane=[-.75,-.25,.25,.75][Math.floor(hash(i*19+10)*4)]+(hash(i*19+11)*2-1)*.10;
   const motion=type==='tire'?tires.get(i):null;if(motion)lane=motion.lane;
   const spec=TYPES[type];out.push({id:i,type,lane,z,...spec,width:spec.width*SIZE,height:spec.height*SIZE,depth:spec.depth*SIZE,bounce:motion?Math.sin(Math.PI*Math.min(1,motion.age/.55)):0});
  }
  return out;
 }
 function draw(c,project,distance,images,queue,twoWay=false){
  for(const o of items(distance,0,LOOK+SIGN_LEAD)){
   if(o.type==='pothole'&&(!twoWay||o.lane>0)){
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
   if(o.z>LOOK)continue;
   const p=project(o.z),x=p.center+p.half*o.lane,w=Math.max(1,Math.round(o.width*p.q)),a=images['obstacle:'+o.type],h=Math.max(1,Math.round(o.type==='horse'&&a?.naturalWidth?w*a.naturalHeight/a.naturalWidth:o.height*p.q));
   if(!a?.naturalWidth)continue;
   queue(o.z,()=>{c.save();const alpha=Math.min(1,(LOOK-o.z)/240);c.globalAlpha=alpha;c.imageSmoothingEnabled=false;
    if(o.type==='horse'){
     // Same cached distance-based ground mist and shadow attenuation as roadside horses.
     c.globalAlpha=.18*alpha*(1-RoadsideObjects.groundMist(o.z,project));c.fillStyle='#22251e';
     c.beginPath();c.ellipse(x,p.y,w*.40,Math.max(1,h*.065),0,0,Math.PI*2);c.fill();
     if(hash(o.id*19+12)>.5){c.translate(2*x,0);c.scale(-1,1);}
     RoadsideObjects.groundMistSprite(c,a,x,p.y,w,h,alpha,o.z,project);
    }else{
     if(o.type!=='pothole'){c.fillStyle='#17191d66';c.beginPath();c.ellipse(x,p.y-1,w*.51,Math.max(1,h*.10),0,0,Math.PI*2);c.fill();}
     c.drawImage(a,Math.round(x-w/2),Math.round(p.y-h-(o.bounce||0)*25*p.q),w,h);
    }
    c.restore();},o.type==='pothole'?1:3);
  }
  for(const e of explosions){
   const z=e.world-distance;if(z<0||z>LOOK)continue;
   const p=project(z),x=p.center+p.half*e.lane,f=e.age/1.05;
   queue(z,()=>{c.save();c.globalAlpha=(1-f)*Math.min(1,(LOOK-z)/180);for(const d of e.particles){
    const t=Math.min(1,f*1.5),xx=x+d.dx*t*p.q,yy=p.y-(25+d.dy*t+Math.sin(Math.PI*t)*35)*p.q;
    const size=Math.max(1,Math.round(d.size*(.65+t*.8)*p.q));c.fillStyle=f>.45?'#54535a':d.color;c.fillRect(Math.round(xx-size/2),Math.round(yy-size/2),size,size);
   }c.restore();},5);
  }
  for(const d of debris){
   const z=d.world-distance;if(z<0||z>LOOK)continue;
   const p=project(z),f=d.age/.65,x=p.center+p.half*(d.lane+d.vx*f),y=p.y-(Math.sin(Math.PI*f)*d.height+12*(1-f))*p.q;
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
  const from=Math.min(prev+travel,car.z)-36,to=Math.max(prev+travel,car.z)+36;
  for(const o of items(distance,from,to)){if(o.type!=='tire'&&o.type!=='cone'&&o.type!=='horse')continue;
   const p=project(Math.max(0,o.z)),x=p.center+p.half*o.lane,w=o.width*p.q,b=bounds(car,Math.max(0,o.z));
   const ob=o.type==='horse'&&horseBounds?horseBounds(o,x,p.q):{left:x-w/2,right:x+w/2};
   if(b.left<ob.right&&b.right>ob.left){if(o.type==='horse'){consumed.add(o.id);near.delete(o.id);explosions.push({world:distance+o.z,lane:o.lane,age:0,particles:Array.from({length:30},(_,i)=>({dx:(Math.random()-.5)*210,dy:Math.random()*120,size:9+Math.random()*22,color:['#ffdd82','#f38b39','#c14b30','#34343a'][i%4]}))});if(explosions.length>8)explosions.shift();return true;}if(o.type==='cone')destroyCones(o,distance);else kick(o,car);}
  }
 }
 function horses(distance){return items(distance,0,LOOK).filter(o=>o.type==='horse');}
 function step(previous,distance,pp,oldPP,project,horseBounds){
  // Sweep through the player's depth to avoid skipping objects at high speed.
  const travel=Math.max(0,distance-previous);
  const hits=[];let bonus=0;
  for(const o of items(distance,pp.z-travel-36,pp.z+36)){
   if(passed.has(o.id))continue;
   const p=project(pp.z),x=p.center+p.half*o.lane,w=o.width*p.q;
   const left=Math.min(pp.left,oldPP.left),right=Math.max(pp.right,oldPP.right);
   const bounds=o.type==='horse'&&horseBounds?horseBounds(o,x,p.q):{left:x-w/2,right:x+w/2};
   const gap=Math.max(left-bounds.right,bounds.left-right);
   if(o.z<=pp.z+o.depth&&o.z+travel>=pp.z-o.depth){
    if(gap<=0){if(o.type==='tire'){if(!kick(o,'player'))continue;passed.add(o.id);}else if(o.type==='cone')destroyCones(o,distance);else consumed.add(o.id);near.delete(o.id);hits.push({...o,damage:controls.damage.checked?o.damage:0,direction:pp.px<x?-1:1});continue;}
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
