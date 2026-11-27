// Shared audio + fullscreen bridge for both preview pages.
(()=>{
 const sound=document.getElementById('audio-toggle'),full=document.getElementById('fullscreen-toggle'),status=document.getElementById('previewToolStatus');
 let storage;try{storage=window.localStorage;}catch(e){}
 const config=Object.freeze({enabled:true,effectsEnabled:true,musicEnabled:true,masterVolume:.5,effectsVolume:.6,musicVolume:.40,swingPreset:'heavy',storageKey:'stance-crime.sprite-lab.audio.v1'});
 const sceneLab=new URLSearchParams(location.search).has('roadLab');const audio=new BeetleAudio(config,sceneLab?null:storage);if(sceneLab)audio.setEnabled(false);window.PreviewAudio=audio;
 let noticeTimer;
 function notice(message){status.textContent=message;status.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>status.hidden=true,6500);}
 function syncSound(){sound.setAttribute('aria-pressed',String(audio.enabled));sound.setAttribute('aria-label',audio.enabled?'Выключить звук':'Включить звук');sound.title=sound.getAttribute('aria-label');}
 function unlock(){if(!document.hidden)audio.unlock();}
 for(const event of ['pointerdown','touchend','keydown','click'])window.addEventListener(event,e=>{if(!sound.contains(e.target))unlock();},{capture:true,passive:true});
 sound.addEventListener('click',()=>{audio.setEnabled(!audio.enabled);syncSound();if(audio.enabled)audio.play('menu');sound.blur();});
 document.addEventListener('click',e=>{const el=e.target.closest?.('#openSettings,#settingsDialog button,#settingsDialog a');if(el&&el.id!=='repairCar')audio.play('menu');});
 document.addEventListener('change',e=>{if(e.target.matches?.('#settingsDialog select,#settingsDialog input[type=checkbox]'))audio.play('menu');});
 document.addEventListener('visibilitychange',()=>{audio.setMusicAllowed(!document.hidden);if(document.hidden)audio.stop();else unlock();});
 window.addEventListener('pagehide',()=>{audio.setMusicAllowed(false);audio.stop();});
 window.addEventListener('pageshow',()=>{audio.setMusicAllowed(!document.hidden);unlock();});
 function active(){return Boolean(document.fullscreenElement||document.webkitFullscreenElement);}
 function syncFull(){const on=active();full.setAttribute('aria-pressed',String(on));full.setAttribute('aria-label',on?'Выйти из полноэкранного режима':'Полноэкранный режим');full.title=full.getAttribute('aria-label');}
 function clear(){window.dispatchEvent(new Event('previewfullscreenchange'));}
 full.addEventListener('click',async()=>{audio.play('menu');clear();try{
  if(active()){const exit=document.exitFullscreen||document.webkitExitFullscreen;if(exit)await exit.call(document);}
  else{const root=document.documentElement,request=root.requestFullscreen||root.webkitRequestFullscreen;if(!request)throw Error('fullscreen unavailable');await request.call(root);}
 }catch(e){notice('Полноэкранный режим недоступен. На iPhone: Поделиться → На экран Домой.');}finally{full.blur();syncFull();}});
 for(const event of ['fullscreenchange','webkitfullscreenchange'])document.addEventListener(event,()=>{clear();syncFull();});
 syncSound();syncFull();audio.setMusicAllowed(!document.hidden);
})();
