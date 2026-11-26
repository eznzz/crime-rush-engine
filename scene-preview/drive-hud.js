// HUD state is separate from the driving physics; ready for future damage rules.
window.DriveHUD=(()=>{
 const MAX_HEALTH=5;let health=MAX_HEALTH,lastSpeed=null,score=0,lastScore=-1,bonusTime=0,nearBonus=0;
 const scoreEl=document.getElementById('hudScore'),scoreRate=document.getElementById('hudScoreRate');
 const speed=document.getElementById('hudSpeed'),hearts=document.getElementById('hudHearts');
 const ns='http://www.w3.org/2000/svg';
 const icons=Array.from({length:MAX_HEALTH},()=>{
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 12 12');svg.setAttribute('shape-rendering','crispEdges');svg.setAttribute('class','hud-heart');svg.setAttribute('aria-hidden','true');
  for(const [d,cls,fill] of [['M1 1H5V2H7V1H11V2H12V6H11V7H10V8H9V9H8V10H7V11H5V10H4V9H3V8H2V7H1V6H0V2H1Z','heart-outline','#291e29'],['M2 2H4V3H8V2H10V3H11V5H10V6H9V7H8V8H7V9H5V8H4V7H3V6H2V5H1V3H2Z','heart-fill',''],['M2 3H4V4H3V5H2Z','heart-light','']]){
   const path=document.createElementNS(ns,'path');path.setAttribute('d',d);path.setAttribute('class',cls);if(fill)path.setAttribute('fill',fill);svg.appendChild(path);
  }const half=document.createElementNS(ns,'path');half.setAttribute('d','M6 3H8V2H10V3H11V5H10V6H9V7H8V8H7V9H6Z');half.setAttribute('class','heart-half');svg.appendChild(half);hearts.appendChild(svg);return svg;
 });
 function setHealth(value){if(!Number.isFinite(value))return;health=Math.max(0,Math.min(MAX_HEALTH,Math.round(value*2)/2));icons.forEach((icon,i)=>{icon.classList.toggle('empty',i>=health);icon.classList.toggle('half',health-i===.5);});hearts.setAttribute('aria-label','Состояние автомобиля: '+health+' из '+MAX_HEALTH);}
 const toDisplaySpeed=velocity=>Math.max(0,Math.min(140,Number(velocity)*140/180||0));
 const toPhysicsSpeed=value=>Math.max(0,Math.min(180,Number(value)*180/140||0));
 function update(velocity){const v=Math.round(toDisplaySpeed(velocity));if(v!==lastSpeed){speed.textContent=String(v).padStart(3,'0');lastSpeed=v;}}
 function updateScore(dt,travel,velocity,bonus=0){
  const fast=toDisplaySpeed(velocity)>120;
  score+=Math.max(0,travel)/10*(fast?1.15:1)+bonus;
  const n=Math.floor(score);if(n!==lastScore){scoreEl.textContent=String(n).padStart(6,'0');lastScore=n;}
  scoreRate.hidden=!fast;
  bonusTime=Math.max(0,bonusTime-dt);
  if(bonus>0){nearBonus=bonus;bonusTime=1.5;}
 }
 function drawNear(c,x,y){
  if(bonusTime<=0)return;
  c.save();c.font='11px BeetlePixel,monospace';c.textAlign='center';c.textBaseline='middle';
  const label='БЛИЗКО +'+nearBonus,w=Math.ceil(c.measureText(label).width)+12,h=19;
  x=Math.round(Math.max(w/2+2,Math.min(c.canvas.width-w/2-2,x)));y=Math.round(Math.max(12,y-9));
  c.fillStyle='#171620';c.fillRect(x-w/2+2,y-h/2,w-4,h);c.fillRect(x-w/2,y-h/2+2,w,h-4);
  c.fillStyle='#f0bc79';c.fillRect(x-w/2+3,y-h/2+1,w-6,1);c.fillRect(x-w/2+3,y+h/2-2,w-6,1);
  c.fillText(label,x,y);c.restore();
 }
 function resetScore(){score=0;lastScore=-1;bonusTime=0;updateScore(0,0,0);}
 setHealth(MAX_HEALTH);resetScore();return {update,setHealth,getHealth:()=>health,MAX_HEALTH,toDisplaySpeed,toPhysicsSpeed,updateScore,resetScore,drawNear};
})();
