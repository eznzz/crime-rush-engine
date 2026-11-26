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
 return {create,frameFor,perspective,chooseModel,sameDirectionFrame};
})();
