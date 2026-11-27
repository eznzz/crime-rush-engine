// Approved pixel breathing: lower body remains fixed, upper body moves by at most one logical pixel.
(function(root){
function sample(time,amplitude=.009,angularFrequency=2.3){return Math.sin(time*angularFrequency)*amplitude;}
function drawSideBreath(ctx,source,sx,sy,sw,sh,x,y,w,h,breathe){
 // Keep the lower 48% of the sprite at its original size and position.
 // Only the upper body changes height; transparent foot margins never move.
 const top=Math.max(1,Math.min(sh-1,Math.round(sh*.52))),bottom=sh-top;
 const dw=Math.max(1,Math.round(w)),dh=Math.max(2,Math.round(h)),left=Math.round(x-w/2),ground=Math.round(y);
 const lower=Math.max(1,Math.min(dh-1,Math.round(dh*bottom/sh))),joint=ground-lower;
 const upper=dh-lower,delta=Math.max(-1,Math.min(1,breathe/.006))*Math.min(1,dh*.006),stretch=Math.max(1,upper+Math.round(delta));
 ctx.drawImage(source,sx,sy,sw,top,left,joint-stretch,dw,stretch);
 ctx.drawImage(source,sx,sy+top,sw,bottom,left,joint,dw,lower);
}
function draw(ctx,source,sx,sy,sw,sh,x,y,w,h,breathe,lockFeet=true){if(lockFeet&&sh>1)return drawSideBreath(ctx,source,sx,sy,sw,sh,x,y,w,h,breathe);ctx.drawImage(source,sx,sy,sw,sh,Math.round(x-w/2),Math.round(y-h*(1+breathe)),Math.round(w),Math.round(h*(1+breathe)));}
const api=Object.freeze({sample,draw,drawSideBreath});if(typeof module!=='undefined')module.exports=api;else root.CrimeRushBreathing=api;
})(typeof window!=='undefined'?window:globalThis);
