// HUD state is separate from the driving physics; ready for future damage rules.
window.DriveHUD=(()=>{
 const MAX_HEALTH=5;let health=MAX_HEALTH,lastSpeed=null;
 const speed=document.getElementById('hudSpeed'),hearts=document.getElementById('hudHearts');
 const ns='http://www.w3.org/2000/svg';
 const icons=Array.from({length:MAX_HEALTH},()=>{
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 12 12');svg.setAttribute('shape-rendering','crispEdges');svg.setAttribute('class','hud-heart');svg.setAttribute('aria-hidden','true');
  for(const [d,cls,fill] of [['M1 1H5V2H7V1H11V2H12V6H11V7H10V8H9V9H8V10H7V11H5V10H4V9H3V8H2V7H1V6H0V2H1Z','heart-outline','#291e29'],['M2 2H4V3H8V2H10V3H11V5H10V6H9V7H8V8H7V9H5V8H4V7H3V6H2V5H1V3H2Z','heart-fill',''],['M2 3H4V4H3V5H2Z','heart-light','']]){
   const path=document.createElementNS(ns,'path');path.setAttribute('d',d);path.setAttribute('class',cls);if(fill)path.setAttribute('fill',fill);svg.appendChild(path);
  }hearts.appendChild(svg);return svg;
 });
 function setHealth(value){if(!Number.isFinite(value))return;health=Math.max(0,Math.min(MAX_HEALTH,Math.round(value)));icons.forEach((icon,i)=>icon.classList.toggle('empty',i>=health));hearts.setAttribute('aria-label','Состояние автомобиля: '+health+' из '+MAX_HEALTH);}
 const toDisplaySpeed=velocity=>Math.max(0,Math.min(140,Number(velocity)*140/180||0));
 const toPhysicsSpeed=value=>Math.max(0,Math.min(180,Number(value)*180/140||0));
 function update(velocity){const v=Math.round(toDisplaySpeed(velocity));if(v!==lastSpeed){speed.textContent=String(v).padStart(3,'0');lastSpeed=v;}}
 setHealth(MAX_HEALTH);return {update,setHealth,getHealth:()=>health,MAX_HEALTH,toDisplaySpeed,toPhysicsSpeed};
})();
