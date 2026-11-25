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
 function driveSetup(assets,images){
  const roles=['rear','left','leftmini','right','rightmini'];const cars=Object.entries(catalog.vehicles).filter(([id,f])=>roles.every(r=>f[r]));if(!cars.length)throw Error('Нет автомобиля с пятью ракурсами поездки');
  // Load the default aliases and every selectable vehicle. Alias swapping uses loaded images.
  for(const [id,f] of cars)for(const r of roles)assets['drive:'+id+':'+r]=[url(f[r])];
  for(const r of roles)assets[r]=[url(cars[0][1][r])];
  const el=document.createElement('select');el.id='driveCarChoice';select(el,cars.map(([id])=>[id,id]));const label=document.createElement('label');label.textContent='Автомобиль: ';label.append(el);document.querySelector('header').append(label);
  el.addEventListener('change',()=>{if(roles.every(r=>images['drive:'+el.value+':'+r]?.complete&&images['drive:'+el.value+':'+r].naturalWidth))for(const r of roles)images[r]=images['drive:'+el.value+':'+r];});
 }
 return {staticSetup,driveSetup};
})();
