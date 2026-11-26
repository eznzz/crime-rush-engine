// Opposing vehicles travel towards the player independently of same-direction traffic.
window.DriveTraffic=(()=>{
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
  for(const car of cars)car.model=choose();
  function reset(){cars[0].z=1250;cars[1].z=1750;for(const car of cars){car.hit=false;car.model=choose();}cooldown=0;}
  function step(dt,velocity,ratio,playerZ,overlaps){
   cooldown=Math.max(0,cooldown-dt);let result=null;
   const closing=(Math.max(0,velocity)+85*Math.max(105,ratio)/100)*3;
   for(const car of cars){
    const prev=car.z;car.z-=closing*dt;
    // Swept crossing of the player's collision plane, even at maximum closing speed.
    if(car.model&&!car.hit&&prev>=playerZ-18&&car.z<=playerZ+18&&overlaps(car.lane)){
     car.hit=true;if(cooldown===0){cooldown=.65;result=car;}
    }
    if(car.z<0){car.z+=1800;car.hit=false;car.model=choose();}
   }
   return result;
  }
  return {cars,reset,step};
 }
 // Passing cars enter from behind the camera and yield before the player's occupied lanes.
 function createPassing(lanes,random=Math.random,available=()=>true){
  // z=0 is the bottom road plane; all new cars begin behind it, never ahead.
  const START=-155,END=1460,GUARD=65;
  const cars=lanes.map(lane=>({lane,z:START,delay:0,model:null}));
  const choose=()=>chooseModel(available,false,random);
  function respawn(car,delay=1+random()*3){car.z=START;car.delay=delay;car.model=choose();}
  function reset(){cars.forEach((car,i)=>respawn(car,i*.85+random()*.5));}
  function step(dt,velocity,ratio,playerZ,playerLane,twoWay,halfWidth=.13){
   const advance=Math.max(0,velocity)*3*(Math.max(105,ratio)/100-1)*dt;
   for(const car of cars){
    if(twoWay&&car.lane<=0)continue;
    if(!car.model)car.model=choose();
    if(!car.model||advance<=0)continue;
    if(car.delay>0){car.delay=Math.max(0,car.delay-dt);continue;}
    const blocked=Math.abs(car.lane-playerLane)<=.25+halfWidth;
    // A blocked rear car remains entirely off-screen until its lane is clear.
    if(blocked&&car.z<=playerZ+GUARD){
     if(car.z<0)continue;
     respawn(car);continue;
    }
    // Limit screen-space approach speed so the rear entry remains visible even at 220% traffic speed.
    car.z+=car.z<playerZ+25?Math.min(advance,95*dt):advance;
    if(car.z>END)respawn(car);
   }
  }
  function visible(twoWay,playerZ,playerLane,halfWidth=.13){
   return cars.filter(car=>(!twoWay||car.lane>0)&&car.model&&car.z>=START&&!(Math.abs(car.lane-playerLane)<=.25+halfWidth&&car.z<=playerZ+GUARD));
  }
  return {cars,reset,step,visible};
 }
 return {create,createPassing,frameFor,perspective,chooseModel,sameDirectionFrame};
})();
