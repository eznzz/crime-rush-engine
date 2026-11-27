// HUD state is separate from the driving physics; ready for future damage rules.
window.DriveHUD=(()=>{
 const MAX_HEALTH=5;let health=MAX_HEALTH,lastSpeed=null,score=0,lastScore=-1,bonusTime=0,nearBonus=0,heatNoticeTime=0,heatFlashes=0;
 const scoreEl=document.getElementById('hudScore'),scoreRate=document.getElementById('hudScoreRate');
 const speed=document.getElementById('hudSpeed'),hearts=document.getElementById('hudHearts'),radio=document.querySelector('.dash-radio .dash-radio-display');
 const ns='http://www.w3.org/2000/svg';
 const icons=Array.from({length:MAX_HEALTH},()=>{
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 12 12');svg.setAttribute('shape-rendering','crispEdges');svg.setAttribute('class','hud-heart');svg.setAttribute('aria-hidden','true');
  for(const [d,cls,fill] of [['M1 1H5V2H7V1H11V2H12V6H11V7H10V8H9V9H8V10H7V11H5V10H4V9H3V8H2V7H1V6H0V2H1Z','heart-outline','#291e29'],['M2 2H4V3H8V2H10V3H11V5H10V6H9V7H8V8H7V9H5V8H4V7H3V6H2V5H1V3H2Z','heart-fill',''],['M2 3H4V4H3V5H2Z','heart-light','']]){
   const path=document.createElementNS(ns,'path');path.setAttribute('d',d);path.setAttribute('class',cls);if(fill)path.setAttribute('fill',fill);svg.appendChild(path);
  }const half=document.createElementNS(ns,'path');half.setAttribute('d','M6 3H8V2H10V3H11V5H10V6H9V7H8V8H7V9H6Z');half.setAttribute('class','heart-half');svg.appendChild(half);hearts.appendChild(svg);return svg;
 });
 function setHealth(value){if(!Number.isFinite(value))return;health=Math.max(0,Math.min(MAX_HEALTH,Math.round(value*2)/2));icons.forEach((icon,i)=>{icon.classList.toggle('empty',i>=health);icon.classList.toggle('half',health-i===.5);});hearts.setAttribute('aria-label','Состояние автомобиля: '+health+' из '+MAX_HEALTH);}
 const toDisplaySpeed=CrimeRushSpeed.toDisplaySpeed;
 const toPhysicsSpeed=CrimeRushSpeed.toPhysicsSpeed;
 // Cosmetic alternator voltage, not a vehicle simulation or gameplay variable.
 const voltageLabel=document.getElementById('hudFakeVoltage'),voltageSegments=Array.from(document.querySelectorAll('.dash-voltage-track i'));
 function updateFakeVoltage(v){const voltage=13.2+Math.min(1,v/95)*.8+Math.sin(v*.11)*.08;const n=Math.round((voltage-10)/6*20);if(voltageLabel)voltageLabel.textContent=voltage.toFixed(1)+' V';voltageSegments.forEach((segment,i)=>segment.classList.toggle('lit',i<n));}
 const rpmNeedle=document.getElementById('hudRpmNeedle');
 const upshift=[25,50,80,110],gearTop=[25,50,80,110,150];
 let gear=1,rpm=850,shiftTime=0;
 function drawRpm(){rpmNeedle?.setAttribute('transform','rotate('+(-130+260*rpm/8000).toFixed(2)+' 50 50)');rpmNeedle?.setAttribute('data-gear',String(gear));}
 function resetRpm(){gear=1;rpm=850;shiftTime=0;drawRpm();}
 function tickRpm(dt,velocity){
  const v=toDisplaySpeed(velocity),previous=gear;
  while(gear<5&&v>=upshift[gear-1])gear++;
  while(gear>1&&v<upshift[gear-2]-4)gear--;
  if(gear!==previous)shiftTime=.16;
  const target=Math.max(850,Math.min(6500,550+v/gearTop[gear-1]*4650));
  const desired=shiftTime>0&&gear>previous?target*.88:target;
  rpm+=(desired-rpm)*(1-Math.exp(-dt*(shiftTime>0?13:7)));
  shiftTime=Math.max(0,shiftTime-dt);drawRpm();
 }
 function update(velocity){const v=Math.round(toDisplaySpeed(velocity));if(v!==lastSpeed){speed.textContent=String(v).padStart(3,'0');lastSpeed=v;updateFakeVoltage(v);speed.closest('.hud-speed').style.setProperty('--speed-percent',(v/CrimeRushSpeed.maxDisplaySpeedKmh*100)+'%');document.getElementById('hudSpeedNeedle')?.setAttribute('transform','rotate('+(-130+260*v/CrimeRushSpeed.dialMaxKmh)+' 50 50)');}}
 function updateScore(dt,travel,velocity,bonus=0){
  if(dt>0){tickWarnings(dt);tickTemperature(dt,velocity);tickRpm(dt,velocity);}
  const fast=toDisplaySpeed(velocity)>120;
  score+=Math.max(0,travel)/10*(fast?1.15:1)+bonus;
  const n=Math.floor(score);if(n!==lastScore){scoreEl.textContent=String(n).padStart(6,'0');lastScore=n;}
  scoreRate.hidden=true;
  bonusTime=Math.max(0,bonusTime-dt);heatNoticeTime=Math.max(0,heatNoticeTime-dt);
  if(bonus>0){nearBonus=bonus;bonusTime=1.5;window.PreviewAudio?.play('near');}
  drawNear();
 }
 function drawNear(){if(!radio)return;const hot=heatNoticeTime>0,active=bonusTime>0,label=hot?'ОПАСНОСТЬ ПЕРЕГРЕВА!':active?'БЛИЗКО +'+nearBonus:'FM 88.4';if(radio.textContent!==label)radio.textContent=label;radio.classList.toggle('near-bonus',active&&!hot);radio.classList.toggle('heat-warning',hot);}
 // Coolant temperature is driven by active driving time, not rendering FPS.
 const tempNeedle=document.getElementById('hudTemperatureNeedle'),tempLamp=document.getElementById('hudTemperatureWarning');
 let temperature=90,coolingTime=0,coolingStart=90,overheated=false,tempPhase=0;
 function drawTemperature(){
  const angle=temperature>=90?(temperature-90)*4:(temperature-90)*2.4;
  tempNeedle?.setAttribute('transform','rotate('+angle.toFixed(2)+' 50 50)');
  tempLamp?.classList.toggle('lit',overheated&&tempPhase<.5);
  if(tempLamp)tempLamp.setAttribute('data-temperature',temperature.toFixed(1));
 }
 function resetTemperature(){temperature=90;coolingTime=0;coolingStart=90;overheated=false;tempPhase=0;heatFlashes=0;heatNoticeTime=0;drawTemperature();}
 function tickTemperature(dt,velocity){
  const kmh=toDisplaySpeed(velocity),wasHot=overheated,oldPhase=tempPhase;
  if(kmh>118){coolingTime=0;temperature=Math.min(105,temperature+dt*.5);}
  else if(kmh<115&&kmh>0){
   if(coolingTime===0)coolingStart=temperature;
   coolingTime=Math.min(10,coolingTime+dt);
   temperature=90+(coolingStart-90)*(1-coolingTime/10);
   if(coolingTime>=10-1e-8){temperature=90;overheated=false;tempPhase=0;}
  }else{coolingTime=0;}
  if(temperature>=100-1e-8)overheated=true;
  if(overheated){tempPhase=(tempPhase+dt)%1;if(!wasHot||tempPhase<oldPhase){heatFlashes++;if(heatFlashes%5===0)heatNoticeTime=2.5;}}else{heatFlashes=0;heatNoticeTime=0;}
  drawTemperature();
 }
 const warningLamps=Array.from(document.querySelectorAll('.hud-warning-lamps .hud-warning:not(.temperature)'));
 const warningChance=document.getElementById('warningFlickerChance'),warningOutput=document.getElementById('warningFlickerValue');
 let warningClock=0,warningElapsed=0,warningCount=0,warningLamp=null;
 const warningProbability=()=>Math.max(0,Math.min(1,Number(warningChance?.value??.5)/100));
 function resetWarnings(){warningClock=0;warningElapsed=0;warningCount=0;warningLamp=null;warningLamps.forEach(l=>l.classList.remove('lit'));}
 warningChance?.addEventListener('input',()=>{if(warningOutput)warningOutput.textContent=Number(warningChance.value).toFixed(1)+'%';if(!warningProbability())resetWarnings();});
 // One lottery per second of active driving, independent of display frame rate.
 function tickWarnings(dt){
  if(!warningLamps.length||!warningProbability()){if(warningLamp)resetWarnings();return;}
  if(warningLamp){warningElapsed+=dt;const duration=warningCount===1?.12:.36;warningLamp.classList.toggle('lit',warningElapsed<.12||(warningCount===2&&warningElapsed>=.24&&warningElapsed<.36));if(warningElapsed>=duration){warningLamp.classList.remove('lit');warningLamp=null;} }
  warningClock+=dt;if(warningClock>=1){warningClock%=1;if(!warningLamp&&Math.random()<warningProbability()){warningLamp=warningLamps[Math.floor(Math.random()*warningLamps.length)];warningCount=Math.random()<.5?1:2;warningElapsed=0;warningLamp.classList.add('lit');}}
 }
 function resetScore(){resetWarnings();resetTemperature();resetRpm();score=0;lastScore=-1;bonusTime=0;updateScore(0,0,0);drawNear();}
 setHealth(MAX_HEALTH);resetScore();return {update,setHealth,getHealth:()=>health,MAX_HEALTH,toDisplaySpeed,toPhysicsSpeed,updateScore,resetScore,drawNear,resetWarnings,resetTemperature,getTemperature:()=>temperature,getRpm:()=>rpm,getGear:()=>gear,clearWarningLights:()=>{if(warningLamp){warningLamp.classList.remove('lit');warningLamp=null;}}};
})();
