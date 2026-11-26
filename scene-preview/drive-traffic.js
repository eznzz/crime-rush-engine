// Opposing vehicles travel towards the player independently of same-direction traffic.
window.DriveTraffic=(()=>{
 function create(){
  const cars=[{lane:-.75,z:1250,opposite:true,hit:false},{lane:-.25,z:1750,opposite:true,hit:false}];
  let cooldown=0;
  function reset(){cars[0].z=1250;cars[1].z=1750;for(const car of cars)car.hit=false;cooldown=0;}
  function step(dt,velocity,ratio,playerZ,overlaps){
   cooldown=Math.max(0,cooldown-dt);let result=null;
   const closing=(Math.max(0,velocity)+85*Math.max(105,ratio)/100)*3;
   for(const car of cars){
    const prev=car.z;car.z-=closing*dt;
    // Swept crossing of the player's collision plane, even at maximum closing speed.
    if(!car.hit&&prev>=playerZ-18&&car.z<=playerZ+18&&overlaps(car.lane)){
     car.hit=true;if(cooldown===0){cooldown=.65;result=car;}
    }
    if(car.z<0){car.z+=1800;car.hit=false;}
   }
   return result;
  }
  return {cars,reset,step};
 }
 return {create};
})();
