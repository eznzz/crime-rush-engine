// Absolute probabilities per 480 world units; legacy sliders are multipliers.
(function(root){
const types=['pothole','potholes','tire','cone','roadwork','horse'];
const rows={town:[.007,.004,.002,.010,.005,0],rural:[.010,.008,.004,.003,.006,.008],village:[.012,.010,.002,.003,.003,.005],forest:[.007,.005,.003,.002,.002,0],motorway:[.0015,0,.008,.007,.005,0],industrial:[.011,.010,.008,.010,.008,0]};
const speeds={town:[40,65],rural:[65,100],village:[35,55],forest:[65,95],motorway:[85,140],industrial:[35,65]};
const density={town:1.35,rural:1,village:.65,forest:.65,motorway:1.35,industrial:1};
const profiles=Object.fromEntries(Object.keys(rows).map(k=>[k,Object.freeze({events:Object.freeze(Object.fromEntries(types.map((t,i)=>[t,rows[k][i]]))),speed:Object.freeze(speeds[k]),density:density[k]})]));
function hash(seed,slot,channel=0){let x=(seed^Math.imul(slot,0x9e3779b1)^Math.imul(channel+1,0x85ebca6b))>>>0;x=Math.imul(x^(x>>>16),0x7feb352d);x=Math.imul(x^(x>>>15),0x846ca68b);return ((x^(x>>>16))>>>0)/4294967296;}
function choose(environment,roll,multipliers={},enabled=types){const p=profiles[environment]||profiles.rural;let sum=0;for(const t of types){if(!enabled.includes(t))continue;sum+=p.events[t]*Math.max(0,multipliers[t]??1);if(roll<sum)return t;}return null;}
const api=Object.freeze({types:Object.freeze(types),profiles:Object.freeze(profiles),hash,choose,slot:480,lethalSpacing:2000});
if(typeof module!=='undefined')module.exports=api;else root.CrimeRushRoadEvents=api;
})(typeof window!=='undefined'?window:globalThis);