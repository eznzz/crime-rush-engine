// CRIME RUSH — existing calibrated speed scale, not a balance change.
window.CrimeRushSpeed = Object.freeze({
 referenceSpeedKmh: 115, worldSpeed: 1.55,
 maxDisplaySpeedKmh: 140, maxPhysicsSpeed: 180, dialMaxKmh: 160,
 acceleration: 32, braking: 65,
 toDisplaySpeed(v){return Math.max(0,Math.min(140,Number(v)*140/180||0));},
 toPhysicsSpeed(v){return Math.max(0,Math.min(180,Number(v)*180/140||0));}
});
