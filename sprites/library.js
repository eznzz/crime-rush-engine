window.SpriteLibrary = (()=>{
 const catalog=window.SPRITE_CATALOG;
 const url=p=>'../'+p.split('/').map(encodeURIComponent).join('/');
 const select=(el,items)=>{el.replaceChildren();for(const [id,label] of items){const o=new Option(label,id);el.add(o);}};
 const poses={'man-front':'Спереди','man':'¾ спереди','man-side':'Сбоку'};
 function staticSetup(assets,library){
  for(const [id,files] of Object.entries(catalog.characters)){const p={};for(const pose of Object.keys(poses)){if(files[pose]){const key='character:'+id+':'+pose;assets[key]=[url(files[pose])+(id==='alex-tan'?'?v=28.84':'?v=28.83')];p[pose]=key;}}if(Object.keys(p).length)library.characters[id]={poses:p};}
  for(const [id,files] of Object.entries(catalog.vehicles)){if(id.startsWith('traffic-')||!files.side)continue;const key='vehicle:'+id+':side';assets[key]=[url(files.side)+(['sputnik08','m412-01','vaz03-tan'].includes(id)?'?v=28.83':'')];library.vehicles[id]={side:key};}
  if(!Object.keys(library.characters).length||!Object.keys(library.vehicles).length)throw Error('Нет подходящих персонажей или автомобилей в каталоге');
  const m=document.getElementById('manChoice'),p=document.getElementById('pose'),v=document.getElementById('carChoice');
  select(m,Object.keys(library.characters).map(x=>[x,x]));if(library.characters['gubernator'])m.value='gubernator';select(v,Object.keys(library.vehicles).map(x=>[x,x]));if(library.vehicles['pobeditel01'])v.value='pobeditel01';
  const update=()=>{const old=p.value;select(p,Object.keys(library.characters[m.value].poses).map(x=>[x,poses[x]]));if([...p.options].some(o=>o.value===old))p.value=old;};m.addEventListener('change',update);update();
 }
 const angles=[5,10,15,20,30,40];
 const legacyRoles=['rear','left','leftmini','right','rightmini'];
 const angleRoles=angles.map(a=>'rear-'+String(a).padStart(2,'0'));
 let activeDrive=null,initializeDrive=null;
 // A resource is published only after a successful load. Concurrent requests share
 // one promise; failures remain retryable. Existing images are never replaced mid-frame.
 const pendingByStore=new WeakMap();
 function loadAssets(assets,images,keys=Object.keys(assets),priority='auto'){
  let pending=pendingByStore.get(images);if(!pending){pending=new Map();pendingByStore.set(images,pending);}
  return Promise.all([...new Set(keys)].map(key=>{
   if(images[key]?.naturalWidth)return Promise.resolve(null);
   if(pending.has(key))return pending.get(key);
   const urls=assets[key];if(!urls?.length)return Promise.resolve(key+': отсутствует в каталоге');
   const task=new Promise(resolve=>{const img=new Image();let i=0;img.fetchPriority=priority;
    img.onload=()=>{images[key]=img;resolve(null);};
    img.onerror=()=>{if(++i<urls.length)img.src=urls[i];else resolve(key+': '+urls.join(' | '));};
    img.src=urls[0];
   }).finally(()=>pending.delete(key));pending.set(key,task);return task;
  })).then(results=>{const missing=results.filter(Boolean);if(missing.length)throw Error('Не удалось загрузить спрайты: '+missing.join(', '));});
 }
 function driveManifest(){
  const cars=Object.entries(catalog.vehicles).filter(([id])=>!id.startsWith('traffic-')).map(([id,f])=>({id,f,modern:['rear',...angleRoles.filter(r=>r!=='rear-05')].every(r=>f[r])})).filter(c=>c.modern||legacyRoles.every(r=>c.f[r]));
  const roles=c=>c.modern?['rear',...angleRoles.filter(r=>c.f[r])]:legacyRoles;
  const traffic={},personal={};
  for(const [id,f] of Object.entries(catalog.vehicles))if(id.startsWith('traffic-')&&(f.front||f.rear))for(const role of ['front','front-06','front-15','front-quarter','rear','rear-05','rear-06','rear-10','rear-15','rear-20','rear-30','rear-40'])if(f[role])traffic['traffic:'+id+':'+role]=[url(f[role])];
  for(const car of cars)for(const r of roles(car))personal['drive:'+car.id+':'+r]=[url(car.f[r])+(['sputnik08','m412-01','vaz03-tan'].includes(car.id)?'?v=28.83':'')];
  const keys=car=>roles(car).map(r=>'drive:'+car.id+':'+r);
  const reference='drive:schoolboy-vaz-01:rear';
  return {cars,roles,traffic,personal,keys,reference};
 }
 let selectDrive=null;
 function driveSetup(assets,images,preferred){
  const {cars,roles,traffic,personal,keys,reference}=driveManifest();
  if(!cars.length)throw Error('Нет автомобиля с ракурсами поездки');
  const startup=cars.find(c=>c.id===preferred)||cars.find(c=>c.id==='sputnik08')||cars[0];
  Object.assign(assets,traffic);for(const key of [...keys(startup),reference])if(personal[key])assets[key]=personal[key];
  const apply=c=>{for(const r of new Set([...legacyRoles,...angleRoles,'front','front-06','front-15','front-quarter']))delete images[r];activeDrive=c;for(const r of roles(c))images[r]=images['drive:'+c.id+':'+r];};
  activeDrive=startup;
  const el=document.createElement('select');el.id='driveCarChoice';select(el,cars.map(c=>[c.id,c.id]));el.value=startup.id;const label=document.createElement('label');label.textContent='Автомобиль для теста: ';label.append(el);document.querySelector('header').append(label);
  let selection=0;
  selectDrive=async id=>{const car=cars.find(c=>c.id===id);if(!car)throw Error('Неизвестный автомобиль: '+id);const token=++selection;el.disabled=true;el.value=activeDrive.id;
   try{await loadAssets(personal,images,keys(car));if(token!==selection)return false;apply(car);el.value=car.id;return true;}
   finally{if(token===selection){el.disabled=false;el.value=activeDrive.id;}}
  };
  el.addEventListener('change',()=>{const id=el.value;selectDrive(id).catch(e=>{console.error(e);window.alert(e.message);});});
  initializeDrive=()=>{if(!keys(startup).every(k=>images[k]?.naturalWidth))throw Error('Не удалось загрузить стартовый автомобиль');apply(startup);el.value=startup.id;};
 }
 // Warm the browser's ordinary HTTP cache from the garage. A new selection
 // supersedes the queue; at most one low-priority image is requested at a time.
 let warmGeneration=0,warmChain=Promise.resolve();const warmed=new Set();
 function prefetchDrive(id){
  const generation=++warmGeneration,{cars,traffic,personal,keys,reference}=driveManifest(),car=cars.find(c=>c.id===id);
  if(!car||navigator.connection?.saveData||['slow-2g','2g'].includes(navigator.connection?.effectiveType))return;
  const obstacles=['./assets/webp/drive/horse-grazing-01.webp?v=28.41','./assets/webp/drive/tractor-red-hd.webp?v=28.50',...['pothole','potholes','tire','cone','warning'].map(k=>'./assets/sources/drive/obstacles/'+k+'.svg?v=28.41')];
  const urls=[...new Set([...keys(car),reference].flatMap(k=>personal[k]||[]).concat(Object.values(traffic).flat(),obstacles))];
  warmChain=warmChain.catch(()=>{}).then(async()=>{for(const src of urls){if(generation!==warmGeneration||document.hidden)return;if(warmed.has(src))continue;await new Promise(resolve=>{const img=new Image();img.fetchPriority='low';img.onload=()=>{warmed.add(src);resolve();};img.onerror=resolve;img.src=src;});}});return warmChain;
 }
 function driveFrame(steer){
  if(!activeDrive?.modern)return {name:steer<-.68?'left':steer<-.12?'leftmini':steer>.68?'right':steer>.12?'rightmini':'rear',flip:false};
  const target=Math.min(40,Math.abs(steer)*40), available=[0,...angles.filter(a=>activeDrive?.f?.['rear-'+String(a).padStart(2,'0')])], angle=available.reduce((best,a)=>Math.abs(a-target)<Math.abs(best-target)?a:best,0);
  return {name:angle?'rear-'+String(angle).padStart(2,'0'):'rear',flip:angle>0&&steer<0};
 }
 function driveReferenceHeight(images){return activeDrive?.modern?204:images.rear.height;}
 // Calibrate independently drawn M412 and Sputnik once using the straight rear view of the VAZ.
 // Keep one source-pixel scale for every angle, preserving natural perspective.
 const normalizedCars=new Set(['schoolboy-vaz-01','sputnik08','pobeditel01','m412-01','vaz03-tan']);
 const sizeFactor=id=>id==='pobeditel01'?1.1:1;
 function staticCarHeight(images,library,id,base){
  if(!normalizedCars.has(id))return base;
  const a=images[library.vehicles[id]?.side],ref=images[library.vehicles['schoolboy-vaz-01']?.side];
  if(!a?.naturalWidth||!ref?.naturalWidth)return base*sizeFactor(id);
  return base*ref.naturalWidth/ref.naturalHeight*a.naturalHeight/a.naturalWidth*sizeFactor(id);
 }
 // M412 HD frames have different canvas proportions. Measure the visible
 // silhouette once per image, independently of transparent export margins.
 const silhouetteCache=new WeakMap();
 function silhouette(image){
  if(!image?.naturalWidth||!image.naturalHeight)return {height:1,bottom:1};
  if(silhouetteCache.has(image))return silhouetteCache.get(image);
  let result={height:1,bottom:1};
  try{
   const cv=document.createElement('canvas');cv.width=image.naturalWidth;cv.height=image.naturalHeight;
   const ctx=cv.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
   const data=ctx.getImageData(0,0,cv.width,cv.height).data;
   let top=cv.height,bottom=-1;
   for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++){
    if(data[(y*cv.width+x)*4+3]>=128){top=Math.min(top,y);bottom=y;break;}
   }
   if(bottom>=top)result={height:(bottom-top+1)/cv.height,bottom:(bottom+1)/cv.height};
  }catch(e){/* Full canvas fallback if pixels are unavailable. */}
  silhouetteCache.set(image,result);return result;
 }
 function driveGroundOffset(images,role,height){
  if(!['m412-01','vaz03-tan'].includes(activeDrive?.id))return 0;
  return height*(1-silhouette(images[role]).bottom);
 }
 function drivePlayerHeight(images,role,baseHeight,visualAngle){
  const id=activeDrive?.id,current=images[role],reference=images['drive:schoolboy-vaz-01:rear'];
  if(!current?.naturalWidth||!reference?.naturalWidth)return baseHeight;
  // Lock vertical scale to the straight rear silhouette; turning changes only
  // the natural aspect ratio of the selected sprite, not the car's zoom.
  if(normalizedCars.has(id)){
   const rear=images['drive:'+id+':rear'];
   if(!rear?.naturalWidth||!rear.naturalHeight)return baseHeight*sizeFactor(id);
   const h=baseHeight*(reference.naturalWidth/reference.naturalHeight)/(rear.naturalWidth/rear.naturalHeight)*sizeFactor(id);
   return ['m412-01','vaz03-tan'].includes(id)?h*silhouette(rear).height/silhouette(current).height:h;
  }
  if(id!=='m412-01')return baseHeight;
  const rear=images['drive:'+id+':rear'];
  return rear?.naturalWidth?baseHeight*(reference.naturalWidth/reference.naturalHeight)*current.naturalHeight/rear.naturalWidth:baseHeight;
 }

 return {staticSetup,driveSetup,loadAssets,prefetchDrive,driveSelect:id=>selectDrive(id),driveFrame,driveReferenceHeight,drivePlayerHeight,driveGroundOffset,staticCarHeight,driveInitialize:()=>initializeDrive?.()};
})();
