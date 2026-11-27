// Shared mobile landscape gate. Keep user pause state independent of orientation.
(()=>{if(window.CrimeRushRoadLab)return;
 const mobile=matchMedia('(any-pointer:coarse), (pointer:coarse)');
 const portrait=matchMedia('(orientation:portrait)');
 const standalone=matchMedia('(display-mode:standalone)');
 const isMobile=()=>mobile.matches||navigator.standalone===true||(standalone.matches&&navigator.maxTouchPoints>0);
 const gate=document.createElement('dialog');gate.id='crimeRushOrientation';gate.setAttribute('aria-label','Поверните устройство');gate.innerHTML='<svg viewBox="0 0 96 96" aria-hidden="true" shape-rendering="crispEdges"><g class="rotate-phone"><rect x="31" y="18" width="34" height="60" rx="3" fill="none" stroke="currentColor" stroke-width="5"/><path d="M43 70h10" stroke="currentColor" stroke-width="4"/></g><path d="M16 40V22h18M16 22l8 8M80 56v18H62M80 74l-8-8" fill="none" stroke="currentColor" stroke-width="4"/></svg><strong>ПОВЕРНИТЕ УСТРОЙСТВО</strong><span>Для игры необходим горизонтальный режим</span>';
 document.body.append(gate);
 let blocked=false;
 function sync(){const next=isMobile()&&portrait.matches;if(next===blocked)return;blocked=next;document.documentElement.classList.toggle('orientation-blocked',blocked);if(blocked){try{gate.showModal()}catch(e){gate.setAttribute('open','')}}else if(gate.open)gate.close();window.dispatchEvent(new Event('crime-rush-orientation-change'));}
 window.CrimeRushOrientation=Object.freeze({blocked:()=>blocked});
 gate.addEventListener('cancel',e=>e.preventDefault());
 for(const name of ['pointerdown','pointerup','touchstart','touchend','click','keydown','keyup','contextmenu'])window.addEventListener(name,e=>{if(blocked){if(e.cancelable)e.preventDefault();e.stopImmediatePropagation();}},{capture:true,passive:false});
 for(const query of [mobile,portrait,standalone]){if(query.addEventListener)query.addEventListener('change',sync);else query.addListener(sync);}
 for(const event of ['resize','orientationchange','pageshow'])window.addEventListener(event,sync);
 sync();
})();
