window.FailrunLoading=(()=>{
 const el=document.getElementById('failrunLoading'),main=document.querySelector('main');
 const title=el.querySelector('.loading-title'),error=el.querySelector('.loading-error'),retry=el.querySelector('button');
 let active=true,failed=false;
 function show(){active=true;failed=false;title.textContent='ЗАГРУЗКА';error.hidden=true;retry.hidden=true;el.hidden=false;if(!main.hasAttribute('data-static-scene')){main.setAttribute('inert','');main.inert=true;}main.setAttribute('aria-busy','true');}
 function ready(){if(failed||!active)return;active=false;el.hidden=true;main.inert=false;main.removeAttribute('inert');main.removeAttribute('aria-busy');}
 function fail(message){if(!active)return;failed=true;title.textContent='ОШИБКА ЗАГРУЗКИ';error.textContent=String(message);error.hidden=false;retry.hidden=false;}
 retry.addEventListener('click',()=>location.reload());
 window.addEventListener('pageshow',e=>{if(e.persisted){failed=false;ready();}});
 show();
 return {show,ready,fail};
})();
