window.SpriteLibrary = (()=>{
 const catalog=window.SPRITE_CATALOG;
 const url=p=>'../'+p.split('/').map(encodeURIComponent).join('/');
 const select=(el,items)=>{el.replaceChildren();for(const [id,label] of items){const o=new Option(label,id);el.add(o);}};
 const poses={'man-front':'Спереди','man':'¾ спереди','man-side':'Сбоку','man-three-quarter-back':'¾ сзади','man-back':'Сзади'};
 function staticSetup(assets,library){
  for(const [id,files] of Object.entries(catalog.characters)){const p={};for(const pose of Object.keys(poses)){if(files[pose]){const key='character:'+id+':'+pose;assets[key]=[url(files[pose])];p[pose]=key;}}if(Object.keys(p).length)library.characters[id]={poses:p};}
  for(const [id,files] of Object.entries(catalog.vehicles)){if(!files.side)continue;const key='vehicle:'+id+':side';assets[key]=[url(files.side)];library.vehicles[id]={side:key};}
  if(!Object.keys(library.characters).length||!Object.keys(library.vehicles).length)throw Error('Нет подходящих персонажей или автомобилей в каталоге');
  const m=document.getElementById('manChoice'),p=document.getElementById('pose'),v=document.getElementById('carChoice');
  select(m,Object.keys(library.characters).map(x=>[x,x]));select(v,Object.keys(library.vehicles).map(x=>[x,x]));
  const update=()=>{const old=p.value;select(p,Object.keys(library.characters[m.value].poses).map(x=>[x,poses[x]]));if([...p.options].some(o=>o.value===old))p.value=old;};m.addEventListener('change',update);update();
 }
 const angles=[5,10,15,20,30,40];
 const legacyRoles=['rear','left','leftmini','right','rightmini'];
 const angleRoles=angles.map(a=>'rear-'+String(a).padStart(2,'0'));
 let activeDrive=null;
 function driveSetup(assets,images){
  const cars=Object.entries(catalog.vehicles).map(([id,f])=>({id,f,modern:['rear',...angleRoles].every(r=>f[r])})).filter(c=>c.modern||legacyRoles.every(r=>c.f[r]));
  if(!cars.length)throw Error('Нет автомобиля с ракурсами поездки');
  const roles=c=>[...(c.modern?['rear',...angleRoles]:legacyRoles),...['front','front-quarter'].filter(r=>c.f[r])];
  for(const c of cars)for(const r of roles(c))assets['drive:'+c.id+':'+r]=[url(c.f[r])];
  const apply=c=>{activeDrive=c;for(const r of roles(c))images[r]=images['drive:'+c.id+':'+r];};
  activeDrive=cars[0];for(const r of roles(activeDrive))assets[r]=[url(activeDrive.f[r])];
  const el=document.createElement('select');el.id='driveCarChoice';select(el,cars.map(c=>[c.id,c.id]));const label=document.createElement('label');label.textContent='Автомобиль: ';label.append(el);document.querySelector('header').append(label);
  el.addEventListener('change',()=>{const c=cars.find(c=>c.id===el.value);if(c&&roles(c).every(r=>images['drive:'+c.id+':'+r]?.naturalWidth))apply(c);});
 }
 function driveFrame(steer){
  if(!activeDrive?.modern)return {name:steer<-.68?'left':steer<-.12?'leftmini':steer>.68?'right':steer>.12?'rightmini':'rear',flip:false};
  const target=Math.min(40,Math.abs(steer)*40), angle=[0,...angles].reduce((best,a)=>Math.abs(a-target)<Math.abs(best-target)?a:best,0);
  return {name:angle?'rear-'+String(angle).padStart(2,'0'):'rear',flip:angle>0&&steer<0};
 }
 function driveReferenceHeight(images){return activeDrive?.modern?204:images.rear.height;}
 return {staticSetup,driveSetup,driveFrame,driveReferenceHeight};
})();
