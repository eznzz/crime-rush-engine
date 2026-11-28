// Preview-only surface and markings. The base projection is not rescaled.
window.CrimeRushMotorwayPreview=(()=>{
const geometry=(d,z)=>CrimeRushRoadLayout.at(d+z);
function band(c,project,zs,d,left,right,color){if(zs.length<2)return;c.fillStyle=color;c.beginPath();for(let i=0;i<zs.length;i++){const z=zs[i],p=project(z),x=p.center+p.half*left(geometry(d,z));if(!i)c.moveTo(x,p.y);else c.lineTo(x,p.y);}for(let i=zs.length-1;i>=0;i--){const z=zs[i],p=project(z);c.lineTo(p.center+p.half*right(geometry(d,z)),p.y);}c.closePath();c.fill();}
function surface(c,project,zs,d,color){for(const side of [-1,1]){band(c,project,zs,d,g=>side*g.outer,g=>side*g.shoulder,'#777d7c');band(c,project,zs,d,g=>side*g.inner,g=>side*g.outer,color);}band(c,project,zs,d,g=>-g.median,g=>g.median,'#788653');}
function markings(c,project,zs,d){const paint='#deded6';for(const side of [-1,1]){band(c,project,zs,d,g=>side*(g.outer-.035),g=>side*(g.outer-.012),paint);band(c,project,zs,d,g=>side*(g.inner+.012),g=>side*(g.inner+.027),paint);
const end=zs[zs.length-1];for(let i=Math.floor(d/380);i<=Math.ceil((d+end)/380);i++){const a=Math.max(0,i*380-d),b=Math.min(end,i*380+100-d);if(b<=a)continue;const samples=[a,...zs.filter(z=>z>a&&z<b),b];band(c,project,samples,d,g=>side*(g.inner+.49),g=>side*(g.inner+.51),paint);
const third=samples.filter(z=>geometry(d,z).extra>.035);if(third.length>=2)band(c,project,third,d,g=>side*(g.inner+.99),g=>side*(g.inner+1.01),paint);}}}
return {surface,markings};})();
