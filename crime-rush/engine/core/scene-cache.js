// Bounded, cancellable frame cache for static-scene animations.
(function(root){
const MAX_BYTES=12*1024*1024,START=650,END=1500;
function plan(width,height,budget=MAX_BYTES){const pad=Math.ceil(width*.05+2),bytes=width*(height+pad*2)*4,capacity=Math.floor(budget/bytes);const count=Math.max(0,Math.min(52,capacity-3));return {width,height,pad,bytes,count,totalBytes:count>1?(count+3)*bytes:0};}
function index(ms,count){if(ms<START||ms>=END)return -1;return Math.min(count-1,Math.max(0,Math.round((ms-START)/(END-START)*(count-1))));}
const yieldTask=()=>new Promise(resolve=>setTimeout(resolve,0));
async function build(width,height,draw,{cancelled=()=>false,budget=MAX_BYTES}={}){
 const p=plan(width,height,budget);if(p.count<2)return null;const frames=[],idle=[];
 for(let i=0;i<p.count+3;i++){if(cancelled())return null;const c=document.createElement('canvas');c.width=width;c.height=height+p.pad*2;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;const ms=i<p.count?START+(END-START)*i/(p.count-1):null;draw(ctx,p.pad,ms,i-p.count);(i<p.count?frames:idle).push(c);await yieldTask();}
 return cancelled()?null:{...p,frames,idle};
}
function select(cache,ms,shake){if(!cache)return null;const i=index(ms,cache.count);return i<0?cache.idle[shake<-.06?0:shake>.06?2:1]:cache.frames[i];}
function metrics(){let first=null,last=null,frames=0,slow=0,max=0,work=0;return {sample(now,ms){if(first===null)first=now;if(last!==null){const dt=now-last;max=Math.max(max,dt);if(dt>25)slow++;}last=now;frames++;work+=ms;},report(){return {frames,fps:frames>1&&last>first?Math.round((frames-1)*1000/(last-first)):0,slowFrames:slow,maxFrameMs:+max.toFixed(1),avgDrawMs:frames?+(work/frames).toFixed(2):0};}};}
const api={MAX_BYTES,plan,index,build,select,metrics};if(typeof module!=='undefined')module.exports=api;else root.CrimeRushSceneCache=api;
})(typeof window!=='undefined'?window:globalThis);
