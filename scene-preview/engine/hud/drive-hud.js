// CRIME RUSH HUD: DOM presentation only.
window.DriveHUD=(()=>{const MAX_HEALTH=CrimeRushHealth.max;let lastHealth=null,lastSpeed=null,lastScore=-1;
 const scoreEl=document.getElementById('hudScore'),scoreRate=document.getElementById('hudScoreRate');
 const speed=document.getElementById('hudSpeed'),hearts=document.getElementById('hudHearts'),radio=document.querySelector('.dash-radio .dash-radio-display');
 const ns='http://www.w3.org/2000/svg';
 const icons=Array.from({length:MAX_HEALTH},()=>{
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 12 12');svg.setAttribute('shape-rendering','crispEdges');svg.setAttribute('class','hud-heart');svg.setAttribute('aria-hidden','true');
  for(const [d,cls,fill] of [['M1 1H5V2H7V1H11V2H12V6H11V7H10V8H9V9H8V10H7V11H5V10H4V9H3V8H2V7H1V6H0V2H1Z','heart-outline','#291e29'],['M2 2H4V3H8V2H10V3H11V5H10V6H9V7H8V8H7V9H5V8H4V7H3V6H2V5H1V3H2Z','heart-fill',''],['M2 3H4V4H3V5H2Z','heart-light','']]){
   const path=document.createElementNS(ns,'path');path.setAttribute('d',d);path.setAttribute('class',cls);if(fill)path.setAttribute('fill',fill);svg.appendChild(path);
  }const half=document.createElementNS(ns,'path');half.setAttribute('d','M6 3H8V2H10V3H11V5H10V6H9V7H8V8H7V9H6Z');half.setAttribute('class','heart-half');svg.appendChild(half);hearts.appendChild(svg);return svg;
 });
 function drawHealth(){const health=CrimeRushHealth.get();if(health===lastHealth)return;lastHealth=health;icons.forEach((icon,i)=>{icon.classList.toggle('empty',i>=health);icon.classList.toggle('half',health-i===.5);});hearts.setAttribute('aria-label','Состояние автомобиля: '+health+' из '+MAX_HEALTH);}
 const toDisplaySpeed=CrimeRushSpeed.toDisplaySpeed;
 const voltageLabel=document.getElementById('hudFakeVoltage'),voltageSegments=Array.from(document.querySelectorAll('.dash-voltage-track i'));
 function updateFakeVoltage(v){const {value,segments}=CrimeRushInstruments.voltage(v);if(voltageLabel)voltageLabel.textContent=value.toFixed(1)+' V';voltageSegments.forEach((segment,i)=>segment.classList.toggle('lit',i<segments));}
 const rpmNeedle=document.getElementById('hudRpmNeedle');
 function drawRpm(){rpmNeedle?.setAttribute('transform','rotate('+(-130+260*CrimeRushInstruments.getRpm()/CrimeRushIndicatorsConfig.rpm.dialMax).toFixed(2)+' 50 50)');rpmNeedle?.setAttribute('data-gear',String(CrimeRushInstruments.getGear()));}
 function update(velocity){const v=Math.round(toDisplaySpeed(velocity));if(v!==lastSpeed){speed.textContent=String(v).padStart(3,'0');lastSpeed=v;updateFakeVoltage(v);speed.closest('.hud-speed').style.setProperty('--speed-percent',(v/CrimeRushSpeed.maxDisplaySpeedKmh*100)+'%');document.getElementById('hudSpeedNeedle')?.setAttribute('transform','rotate('+(-130+260*v/CrimeRushSpeed.dialMaxKmh)+' 50 50)');}}
 function drawScore(){const n=CrimeRushScore.get();if(n!==lastScore){scoreEl.textContent=String(n).padStart(6,'0');lastScore=n;}scoreRate.hidden=true;}
 function drawNear(){if(!radio)return;const {hot,active,label}=CrimeRushNotifications.get();if(radio.textContent!==label)radio.textContent=label;radio.classList.toggle('near-bonus',active&&!hot);radio.classList.toggle('heat-warning',hot);}
 const tempNeedle=document.getElementById('hudTemperatureNeedle'),tempLamp=document.getElementById('hudTemperatureWarning');
 function drawTemperature(){const temperature=CrimeRushTemperature.get(),angle=temperature>=90?(temperature-90)*4:(temperature-90)*2.4;tempNeedle?.setAttribute('transform','rotate('+angle.toFixed(2)+' 50 50)');tempLamp?.classList.toggle('lit',CrimeRushNotifications.get().temperatureLit);if(tempLamp)tempLamp.setAttribute('data-temperature',temperature.toFixed(1));}
 const warningLamps=Array.from(document.querySelectorAll('.hud-warning-lamps .hud-warning:not(.temperature)'));
 const warningChance=document.getElementById('warningFlickerChance'),warningOutput=document.getElementById('warningFlickerValue');
 const warningProbability=()=>Math.max(0,Math.min(1,Number(warningChance?.value??CrimeRushIndicatorsConfig.warning.defaultChancePercent)/100));
 function drawWarnings(){const active=CrimeRushWarningFlicker.get();warningLamps.forEach((lamp,i)=>lamp.classList.toggle('lit',i===active));}
 warningChance?.addEventListener('input',()=>{if(warningOutput)warningOutput.textContent=Number(warningChance.value).toFixed(1)+'%';if(!warningProbability()){CrimeRushWarningFlicker.reset();drawWarnings();}});
 function render(){drawHealth();drawScore();drawNear();drawTemperature();drawRpm();drawWarnings();}
 render();
 return {update,render,warningProbability,warningLampCount:()=>warningLamps.length,drawHealth,drawNear};
})();
