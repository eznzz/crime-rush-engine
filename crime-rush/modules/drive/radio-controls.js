(()=>{const audio=window.PreviewAudio,power=document.getElementById('radioPower'),buttons=[...document.querySelectorAll('[data-radio-track]')];if(!audio||!power)return;const frequencies=["88.4","91.2","94.6","98.1","102.5","106.8"];let track=1,on=true;
 function sync(){power.setAttribute('aria-pressed',String(on));power.setAttribute('aria-label',on?'Выключить музыку':'Включить музыку');for(const b of buttons)b.setAttribute('aria-pressed',String(Number(b.dataset.radioTrack)===track));window.DriveHUD?.drawNear();}
 window.CrimeRushRadio={label:()=>on?'FM '+frequencies[track-1]:'FM OFF',ready:()=>{audio.setRadioTrack(track);audio.setRadioEnabled(on);sync();}};
 power.addEventListener('click',()=>{on=!on;audio.setRadioEnabled(on);if(on)audio.unlock();sync();power.blur();});
 for(const b of buttons)b.addEventListener('click',()=>{track=Number(b.dataset.radioTrack);on=true;audio.setRadioTrack(track);audio.setRadioEnabled(true);audio.unlock();sync();b.blur();});
 for(const el of [power,...buttons,...document.querySelectorAll('[data-heater-mode]')])el.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter')e.stopPropagation();});
 sync();
})();
