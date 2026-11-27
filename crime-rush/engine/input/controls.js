const touchControls=new Map();
const mobileButtons=[...document.querySelectorAll('#mobileDrive button[data-drive]')];
function drivePressed(key){return !!keys[key]||[...touchControls.values()].includes(key);}
function refreshMobileButtons(){for(const b of mobileButtons)b.classList.toggle('pressed',[...touchControls.values()].includes(b.dataset.drive));}
function clearMobileControls(){touchControls.clear();refreshMobileButtons();}
window.addEventListener('previewfullscreenchange',()=>{keys={};clearMobileControls();});
for(const b of mobileButtons){
 b.addEventListener('pointerdown',e=>{if(e.button!==0||document.getElementById('settingsDialog').open)return;e.preventDefault();touchControls.set(e.pointerId,b.dataset.drive);b.setPointerCapture(e.pointerId);refreshMobileButtons();});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,e=>{touchControls.delete(e.pointerId);refreshMobileButtons();});
 b.addEventListener('contextmenu',e=>e.preventDefault());
}
window.addEventListener('blur',clearMobileControls);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearMobileControls();});
document.getElementById('openSettings').addEventListener('click',clearMobileControls);

window.addEventListener('crime-rush-orientation-change',()=>{keys={};clearMobileControls();});
