/* Common garage scale: preserve sprite proportions and measure visible alpha bounds. */
window.GarageScale=(()=>{
 const lengths={'pobeditel01':4665,'schoolboy-vaz-01':4073,'m412-01':4120,'sputnik08':4006};
 const cache=new WeakMap(), referenceWidth=182*.76*486/432*950/326;
 function bounds(a){if(cache.has(a))return cache.get(a);let b={x:0,y:0,w:a.naturalWidth,h:a.naturalHeight};try{const cv=document.createElement('canvas');cv.width=b.w;cv.height=b.h;const g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(a,0,0);const d=g.getImageData(0,0,b.w,b.h).data;let x0=b.w,y0=b.h,x1=-1,y1=-1;for(let y=0;y<b.h;y++)for(let x=0;x<b.w;x++)if(d[(y*b.w+x)*4+3]>16){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}if(x1>=x0)b={x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};}catch(e){if(e.name!=='SecurityError')throw e;}cache.set(a,b);return b;}
 function geometry(a,id){const b=bounds(a),w=referenceWidth*(lengths[id]||4073)/4073;return {...b,width:w,height:w*b.h/b.w};}
 function draw(c,source,a,id,x,y){const b=geometry(a,id);c.drawImage(source,b.x,b.y,b.w,b.h,Math.round(x-b.width/2),Math.round(y-b.height),Math.round(b.width),Math.round(b.height));}
 return {geometry,draw};
})();