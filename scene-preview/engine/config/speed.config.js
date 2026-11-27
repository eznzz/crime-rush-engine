// CRIME RUSH — calibrated speed scale, not a balance change.
window.CrimeRushSpeed=(()=>{
 const referenceSpeedKmh=115,worldSpeed=1.55,maxDisplaySpeedKmh=140,maxPhysicsSpeed=180,dialMaxKmh=160,acceleration=32,braking=65;
 const toDisplaySpeed=v=>Math.max(0,Math.min(maxDisplaySpeedKmh,Number(v)*maxDisplaySpeedKmh/maxPhysicsSpeed||0));
 const toPhysicsSpeed=v=>Math.max(0,Math.min(maxPhysicsSpeed,Number(v)*maxPhysicsSpeed/maxDisplaySpeedKmh||0));
 return Object.freeze({referenceSpeedKmh,worldSpeed,maxDisplaySpeedKmh,maxPhysicsSpeed,dialMaxKmh,acceleration,braking,toDisplaySpeed,toPhysicsSpeed});
})();
