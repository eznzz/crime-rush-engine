// World-space road geometry. All lateral values use the legacy road half-width.
// Classic four lanes remain exactly [-.75,-.25,.25,.75]; the median opens
// symmetrically and the third lane grows only at the outside of each carriageway.
(function(root){
const cycle=30000,segments=Object.freeze([
['classic',0,2400,0,0],['entry',2400,4800,0,1],['2+2',4800,9000,1,1],
['widen',9000,11400,1,2],['3+3',11400,18600,2,2],
['narrow',18600,21000,2,1],['2+2',21000,25200,1,1],
['exit',25200,27600,1,0],['classic',27600,30000,0,0]].map(Object.freeze));
const smooth=t=>t*t*(3-2*t);
function at(world,enabled=true){if(!Number.isFinite(world))throw Error('Invalid road position');const w=((world%cycle)+cycle)%cycle;
const s=enabled?segments.find(s=>w>=s[1]&&w<s[2]):segments[0];
const progress=smooth(Math.max(0,Math.min(1,(w-s[1])/(s[2]-s[1])))),level=s[3]+(s[4]-s[3])*progress;
const median=.23*Math.min(1,level),extra=.5*Math.max(0,level-1),inner=median,outer=median+1+extra;
const lanes=[inner+.25,inner+.75];if(extra>=.499999)lanes.push(inner+1.25);
// Translate the road, not the camera. On motorway the forward carriageway is centered; on classic road the original center is restored.
const anchor=level===0?0:-(inner+outer)/2*Math.min(1,level);
const innerShoulder=.085*Math.min(1,level),innerRail=median-innerShoulder;
return {phase:s[0],level,median,extra,inner,outer,anchor,innerShoulder,innerRail,shoulder:outer+.22,rail:outer+.28,lanes,opposite:lanes.map(x=>-x),thirdWidth:extra,transition:s[3]!==s[4],world};}
function relativeLane(world,lane){const g=at(world);if(g.level===0)return lane;const center=(g.inner+g.outer)/2;const normalized=(lane-center)/((g.outer-g.inner)/2);return lane+(normalized-lane)*Math.min(1,g.level);}
const api=Object.freeze({cycle,segments,at,relativeLane});if(typeof module!=='undefined')module.exports=api;else root.CrimeRushRoadLayout=api;
})(typeof window!=='undefined'?window:globalThis);
