// Portable scene schema; all resource references are relative to LIBRARY.
(function(root){
const clone=x=>JSON.parse(JSON.stringify(x)), number=(x,min,max)=>Number.isFinite(x)&&x>=min&&x<=max;
const times=['day','dawn','sunset','night'],weather=['clear','fog','rain'];
function validate(s,catalog,assets){
 if(!s||s.schemaVersion!==1||!/^[-a-z0-9]+$/.test(s.id)||typeof s.title!=='string'||!number(s.width,1,4096)||!number(s.height,1,4096)||!times.includes(s.timeOfDay)||!weather.includes(s.atmosphere)||!Array.isArray(s.layers)||!Array.isArray(s.actors)||s.layers.length+s.actors.length>200)throw Error('Некорректная конфигурация сцены');
 const ids=new Set();for(const o of [...s.layers,...s.actors]){if(typeof o.id!=='string'||!o.id||ids.has(o.id)||!number(o.x,-4096,8192)||!number(o.y,-4096,8192)||!number(o.z,-1000,1000)||!number(o.height,1,4096))throw Error('Некорректный объект: '+o.id);ids.add(o.id);}
 for(const l of s.layers)if(!assets.includes(l.asset)||!number(l.width,1,4096)||![undefined,'drift'].includes(l.motion))throw Error('Неизвестный слой: '+l.id);
 for(const a of s.actors)if(!['vehicles','characters'].includes(a.kind)||!Object.hasOwn(catalog[a.kind]||{},a.sprite)||!Object.hasOwn(catalog[a.kind][a.sprite],a.view)||typeof a.shadow!=='boolean')throw Error('Неизвестный спрайт: '+a.id);
 for(const a of s.actors)if(a.animation!==undefined){const q=a.animation;if(a.kind!=='characters'||!q||q.type!=='breathing'||typeof q.enabled!=='boolean'||!number(q.amplitude,0,.025)||!number(q.frequency,0,20)||typeof q.lockFeet!=='boolean')throw Error('Некорректная анимация: '+a.id);}
 return s;
}
const api={clone,validate,times,weather,fromPreset:p=>({schemaVersion:1,...clone(p)})};if(typeof module!=='undefined')module.exports=api;else root.CrimeRushSceneModel=api;
})(typeof window!=='undefined'?window:globalThis);
