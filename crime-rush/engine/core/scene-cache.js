// Lightweight timing diagnostics for static-scene animations.
(function(root){
function metrics(){let first=null,last=null,frames=0,slow=0,max=0,work=0;return {sample(now,ms){if(first===null)first=now;if(last!==null){const dt=now-last;max=Math.max(max,dt);if(dt>25)slow++;}last=now;frames++;work+=ms;},report(){return {frames,fps:frames>1&&last>first?Math.round((frames-1)*1000/(last-first)):0,slowFrames:slow,maxFrameMs:+max.toFixed(1),avgDrawMs:frames?+(work/frames).toFixed(2):0};}};}
const api={metrics};if(typeof module!=='undefined')module.exports=api;else root.CrimeRushSceneCache=api;
})(typeof window!=='undefined'?window:globalThis);
