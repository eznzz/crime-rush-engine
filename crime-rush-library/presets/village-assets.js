// Approved VILLAGE artwork: independent WebP assets with stable world-scale heights.
(function(root){
 const groups={"buildings":["village-house-01","village-house-02","village-house-03","village-house-04","village-shed-01","village-shed-02","village-bathhouse-01","village-woodstore-01"],"barriers":["village-fence-01","village-fence-02","village-gate-01","village-gate-02","village-wicket-01"],"vegetation":["village-blossom-01","village-garden-tree-01","village-lilac-01"]},sizes={"village-house-01":280,"village-house-02":265,"village-house-03":270,"village-house-04":260,"village-shed-01":165,"village-shed-02":155,"village-bathhouse-01":150,"village-woodstore-01":130,"village-fence-01":75,"village-fence-02":75,"village-gate-01":79,"village-gate-02":79,"village-wicket-01":75,"village-blossom-01":210,"village-garden-tree-01":225,"village-lilac-01":85,"village-tractor-blue":190};
 const entries=Object.entries(groups).flatMap(([category,ids])=>ids.map(id=>[id,Object.freeze({id,category,webp:'assets/webp/roadside/'+category+'/'+id+'.webp',size:sizes[id]})]));
 entries.push(['village-tractor-blue',Object.freeze({id:'village-tractor-blue',category:'equipment',webp:'assets/webp/drive/tractor-blue-hd.webp',size:sizes['village-tractor-blue']})]);
 const assets=Object.freeze(Object.fromEntries(entries));
 const variants=Object.freeze({'village-house':groups.buildings.slice(0,4),'village-shed':groups.buildings.slice(4),'village-fence':groups.barriers.slice(0,2),'village-gate':groups.barriers.slice(2,4),'village-wicket':['village-wicket-01'],'village-blossom':['village-blossom-01'],'village-garden-tree':['village-garden-tree-01'],'village-lilac':['village-lilac-01'],'village-tractor':['village-tractor-blue']});
 function hash(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;return ((h>>>0)%1000000)/1000000;}
 function pick(key,id){const list=variants[key];return list?assets[list[Math.floor(hash(id)*list.length)]]:null;}
 // One yard belongs to one seeded house anchor. Child placements never depend on the visible render window.
 function yard(anchor){const {id,world,side,offset,scale}=anchor,r=k=>hash(id+':'+k),out=[];
  function add(asset,part,dz,lane,s=1,length){out.push({id:id+':'+part,asset,world:world+dz,side,offset:lane,scale:s,yardCenter:world,...(length?{length}:{} )});}
  out.push({...anchor,yardCenter:world});
  add('village-shed','shed',125,offset+.70,.9+r('shed-size')*.15);
  if(r('blossom')<.76)add('village-blossom','blossom',-128,offset-.15,.9+r('blossom-size')*.2);
  add('village-garden-tree','garden-tree',160,offset+.32,.85+r('garden-size')*.25);
  if(r('lilac')<.7)add('village-lilac','lilac',-155,1.53,.9+r('lilac-size')*.25);
  let edge=-220;const pieces=[['village-fence',85],['village-fence',85],['village-gate',80],['village-wicket',20],['village-fence',85],['village-fence',85]];
  for(let i=0;i<pieces.length;i++){const [asset,len]=pieces[i];add(asset,'front-'+i,edge+len/2,1.30,1,len);edge+=len;}
  if(r('tractor')<.12)add('village-tractor','tractor',-75,1.70,1);
  return out;
 }
 const api=Object.freeze({assets,pick,yard,keys:Object.freeze(Object.keys(variants))});if(typeof module!=='undefined')module.exports=api;else root.CrimeRushVillageAssets=api;
})(typeof window!=='undefined'?window:globalThis);
