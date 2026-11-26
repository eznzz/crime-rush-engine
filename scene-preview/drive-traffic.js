// Opposing vehicles travel towards the player independently of same-direction traffic.
window.DriveTraffic=(()=>{
 const laneOffset=random=>(random()*2-1)*.075;
 const MODELS=['traffic-vaz-01','traffic-vaz-02'];
 function chooseModel(available,opposite=true,random=Math.random){
  const role=opposite?'front':'rear',pool=MODELS.filter(id=>available('traffic:'+id+':'+role));
  return pool.length?pool[Math.min(pool.length-1,Math.floor(random()*pool.length))]:null;
 }
 // Same-direction traffic: rightmost lane mirrors the source 6-degree sprite to expose the vehicle's left side.
 function sameDirectionFrame(model,lane,available){
  if(!MODELS.includes(model))return null;
  const base='traffic:'+model+':',roles=lane>.5?['rear-06','rear']:['rear','rear-06'];
  const role=roles.find(r=>available(base+r));
  return role?{name:base+role,flip:role==='rear-06'}:null;
 }
 function frameFor(model,angle,available,opposite=true){
  if(!opposite)return sameDirectionFrame(model,0,available);
  const roles=[[0,'front'],[6,'front-06'],[15,'front-15'],[35,'front-quarter']];
  if(!MODELS.includes(model))return null;
  const options=roles.filter(([_,role])=>available('traffic:'+model+':'+role));
  if(!options.length)return null;
  const target=Math.abs(angle),best=options.reduce((a,b)=>Math.abs(b[0]-target)<Math.abs(a[0]-target)?b:a);
  return {name:'traffic:'+model+':'+best[1],flip:best[0]>0&&angle<0};
 }
 function perspective(project,z,lane){
  const p=project(z),ahead=project(z+20),behind=project(Math.max(0,z-20));
  const centerSlope=Math.atan2(ahead.center-behind.center,Math.max(1,behind.y-ahead.y))*180/Math.PI;
  return Math.max(-35,Math.min(35,-lane*24*p.q+centerSlope*.65));
 }
 function create(random=Math.random,available=()=>true){
  const cars=[{lane:-.75,z:1250,opposite:true,hit:false},{lane:-.25,z:1750,opposite:true,hit:false}];
  let cooldown=0;
  const choose=()=>chooseModel(available,true,random);
  for(const car of cars){car.model=choose();car.offset=laneOffset(random);car.baseOffset=car.offset;car.avoidLane=null;car.cruiseLane=car.lane;car.laneCheck=2+random()*3;car.near=false;car.scored=false;}
  function reset(){cars[0].z=1250;cars[1].z=1750;for(const car of cars){car.hit=false;car.model=choose();car.offset=laneOffset(random);car.baseOffset=car.offset;car.avoidLane=null;car.cruiseLane=car.lane;car.laneCheck=2+random()*3;car.near=false;car.scored=false;}cooldown=0;}
  function step(dt,velocity,ratio,playerZ,overlaps,observe=()=>{},avoid=()=>1){
   cooldown=Math.max(0,cooldown-dt);let result=null;
   const closing=(Math.max(0,velocity)+85*Math.max(80,Math.min(150,ratio))/100)*3;
   for(const car of cars){
    const prev=car.z;car.z-=closing*dt*avoid(car);
    // Swept crossing of the player's collision plane, even at maximum closing speed.
    if(car.model&&!car.hit&&prev>=playerZ-18&&car.z<=playerZ+18&&overlaps(car.lane+car.offset,car)){
     car.hit=true;if(cooldown===0){cooldown=.65;result=car;}
    }
    observe(car,prev);
    if(car.z<0){car.z+=1800;car.hit=false;car.model=choose();car.offset=laneOffset(random);car.baseOffset=car.offset;car.avoidLane=null;car.cruiseLane=car.lane;car.laneCheck=2+random()*3;car.near=false;car.scored=false;}
   }
   return result;
  }
  return {cars,reset,step};
 }
 // Passing cars enter from behind the camera and yield before the player's occupied lanes.
 function createPassing(lanes,random=Math.random,available=()=>true){
  const START=-155,END=1460,GUARD=65;
  const cars=lanes.map(lane=>({lane,z:START,delay:0,model:null,active:false,hit:false,offset:0}));
  const choose=()=>chooseModel(available,false,random);
  function respawn(car,delay=1+random()*3){Object.assign(car,{z:START,delay,model:choose(),active:false,hit:false,offset:laneOffset(random),near:false,scored:false,baseOffset:null,avoidLane:null,cruiseLane:car.lane,laneCheck:2+random()*3});}
  function reset(){cars.forEach((car,i)=>respawn(car,i*.85+random()*.5));}
  function step(dt,velocity,ratio,playerZ,playerLane,twoWay,halfWidth=.13,contact=()=>false,observe=()=>{},avoid=()=>1){
   const advance=Math.max(0,velocity)*3*(Math.max(80,Math.min(150,ratio))/100-1)*dt;
   let hit=null;
   for(const car of cars){
    if(twoWay&&car.lane<=0)continue;
    if(!car.model)car.model=choose();
    if(!car.model)continue;
    if(car.delay>0){car.delay=Math.max(0,car.delay-dt);continue;}
    const blocked=Math.abs(car.lane+car.offset-playerLane)<=.25+halfWidth;
    if(!car.active){if(blocked||advance===0)continue;car.z=advance<0?END:START;car.active=true;}
    // Active cars are never deleted when the player changes lanes.
    // Only a new approach is held back in an occupied lane.
    const prev=car.z;
    const delta=(advance>0&&car.z<playerZ+25?Math.min(advance,95*dt):advance)*avoid(car);
    // Hold a rear car short of the player until the player clears its lane.
    if(delta>0&&blocked&&!car.hit&&car.z<playerZ-45)car.z=Math.min(car.z+delta,playerZ-45);
    else car.z+=delta;
    if(!car.hit&&contact(car,prev)){
     car.hit=true;
     const direction=car.lane+car.offset>=playerLane?-1:1;
     car.offset=-direction*.10;
     if(!hit)hit={car,direction};
    }
    observe(car,prev);
    if(car.z>END||car.z<START)respawn(car);
   }
   return hit;
  }
  function visible(twoWay){return cars.filter(car=>(!twoWay||car.lane>0)&&car.model&&car.active);}
  return {cars,reset,step,visible};
 }
 return {create,createPassing,frameFor,perspective,chooseModel,sameDirectionFrame};
})();
