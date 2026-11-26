window.SpriteLibrary = (()=>{
 const catalog=window.SPRITE_CATALOG;
 const url=p=>'../'+p.split('/').map(encodeURIComponent).join('/');
 const select=(el,items)=>{el.replaceChildren();for(const [id,label] of items){const o=new Option(label,id);el.add(o);}};
 const poses={'man-front':'Спереди','man':'¾ спереди','man-side':'Сбоку'};
 function staticSetup(assets,library){
  for(const [id,files] of Object.entries(catalog.characters)){const p={};for(const pose of Object.keys(poses)){if(files[pose]){const key='character:'+id+':'+pose;assets[key]=[url(files[pose])+'?v=28.72'];p[pose]=key;}}if(Object.keys(p).length)library.characters[id]={poses:p};}
  for(const [id,files] of Object.entries(catalog.vehicles)){if(id.startsWith('traffic-')||!files.side)continue;const key='vehicle:'+id+':side';assets[key]=[url(files.side)+(id==='sputnik08'?'?v=28.72':'')];library.vehicles[id]={side:key};}
  if(!Object.keys(library.characters).length||!Object.keys(library.vehicles).length)throw Error('Нет подходящих персонажей или автомобилей в каталоге');
  const m=document.getElementById('manChoice'),p=document.getElementById('pose'),v=document.getElementById('carChoice');
  select(m,Object.keys(library.characters).map(x=>[x,x]));if(library.characters['gubernator'])m.value='gubernator';select(v,Object.keys(library.vehicles).map(x=>[x,x]));if(library.vehicles['pobeditel01'])v.value='pobeditel01';
  const update=()=>{const old=p.value;select(p,Object.keys(library.characters[m.value].poses).map(x=>[x,poses[x]]));if([...p.options].some(o=>o.value===old))p.value=old;};m.addEventListener('change',update);update();
 }
 const angles=[5,10,15,20,30,40];
 const legacyRoles=['rear','left','leftmini','right','rightmini'];
 const angleRoles=angles.map(a=>'rear-'+String(a).padStart(2,'0'));
 let activeDrive=null,initializeDrive=null;
 function driveSetup(assets,images){
  const cars=Object.entries(catalog.vehicles).filter(([id])=>!id.startsWith('traffic-')).map(([id,f])=>({id,f,modern:['rear',...angleRoles.filter(r=>r!=='rear-05')].every(r=>f[r])})).filter(c=>c.modern||legacyRoles.every(r=>c.f[r]));
  if(!cars.length)throw Error('Нет автомобиля с ракурсами поездки');
  const roles=c=>[...(c.modern?['rear',...angleRoles.filter(r=>c.f[r])]:legacyRoles),...['front','front-06','front-15','front-quarter'].filter(r=>c.f[r])];
  for(const [id,f] of Object.entries(catalog.vehicles))if(id.startsWith('traffic-')&&(f.front||f.rear))for(const role of ['front','front-06','front-15','front-quarter','rear','rear-05','rear-06','rear-10','rear-15','rear-20','rear-30','rear-40'])if(f[role])assets['traffic:'+id+':'+role]=[url(f[role])];
  for(const c of cars)for(const r of roles(c))assets['drive:'+c.id+':'+r]=[url(c.f[r])+(c.id==='sputnik08'?'?v=28.72':'')];
  const apply=c=>{activeDrive=c;for(const r of roles(c))images[r]=images['drive:'+c.id+':'+r];};
  const startup=cars.find(c=>c.id==='sputnik08')||cars[0];activeDrive=startup;
  const el=document.createElement('select');el.id='driveCarChoice';select(el,cars.map(c=>[c.id,c.id]));el.value=activeDrive.id;const label=document.createElement('label');label.textContent='Автомобиль для теста: ';label.append(el);document.querySelector('header').append(label);
  el.addEventListener('change',()=>{const c=cars.find(c=>c.id===el.value);if(c&&roles(c).every(r=>images['drive:'+c.id+':'+r]?.naturalWidth))apply(c);});
  initializeDrive=()=>{if(!roles(startup).every(r=>images['drive:'+startup.id+':'+r]?.naturalWidth))throw Error('Не удалось загрузить стартовый автомобиль');apply(startup);el.value=startup.id;};
 }
 function driveFrame(steer){
  if(!activeDrive?.modern)return {name:steer<-.68?'left':steer<-.12?'leftmini':steer>.68?'right':steer>.12?'rightmini':'rear',flip:false};
  const target=Math.min(40,Math.abs(steer)*40), available=[0,...angles.filter(a=>activeDrive?.f?.['rear-'+String(a).padStart(2,'0')])], angle=available.reduce((best,a)=>Math.abs(a-target)<Math.abs(best-target)?a:best,0);
  return {name:angle?'rear-'+String(angle).padStart(2,'0'):'rear',flip:angle>0&&steer<0};
 }
 function driveReferenceHeight(images){return activeDrive?.modern?204:images.rear.height;}
 // Calibrate independently drawn M412 and Sputnik once using the straight rear view of the VAZ.
 // Keep one source-pixel scale for every angle, preserving natural perspective.
 const normalizedCars=new Set(['schoolboy-vaz-01','sputnik08','pobeditel01']);
 const sizeFactor=id=>id==='pobeditel01'?1.1:1;
 // Shared projected width curve; interpolate rather than use HD source pixel widths.
 const widthCurve=[[0,1],[5,1.10],[10,1.22],[15,1.36],[20,1.48],[30,1.65],[40,1.80]];
 function turnWidth(angle){
  const a=Math.min(40,Math.abs(angle));for(let i=1;i<widthCurve.length;i++){const [x,y]=widthCurve[i-1],[xx,yy]=widthCurve[i];if(a<=xx)return y+(yy-y)*(a-x)/(xx-x);}return 1.8;
 }
 function staticCarHeight(images,library,id,base){
  if(!normalizedCars.has(id))return base;
  const a=images[library.vehicles[id]?.side],ref=images[library.vehicles['schoolboy-vaz-01']?.side];
  if(!a?.naturalWidth||!ref?.naturalWidth)return base*sizeFactor(id);
  return base*ref.naturalWidth/ref.naturalHeight*a.naturalHeight/a.naturalWidth*sizeFactor(id);
 }
 function drivePlayerHeight(images,role,baseHeight,visualAngle){
  const id=activeDrive?.id,current=images[role],reference=images['drive:schoolboy-vaz-01:rear'];
  if(!current?.naturalWidth||!reference?.naturalWidth)return baseHeight;
  if(normalizedCars.has(id)){
   const angle=visualAngle??(Number(role.split('-')[1])||0);
   return baseHeight*reference.naturalWidth/reference.naturalHeight*turnWidth(angle)*sizeFactor(id)*current.naturalHeight/current.naturalWidth;
  }
  if(id!=='m412-01')return baseHeight;
  const rear=images['drive:'+id+':rear'];
  return rear?.naturalWidth?baseHeight*(reference.naturalWidth/reference.naturalHeight)*current.naturalHeight/rear.naturalWidth:baseHeight;
 }

 return {staticSetup,driveSetup,driveFrame,driveReferenceHeight,drivePlayerHeight,staticCarHeight,driveInitialize:()=>initializeDrive?.()};
})();
