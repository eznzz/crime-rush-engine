// Local TOP 10 per difficulty, matching BEETLE BRAWL name and ranking rules.
window.DriveRecords=(()=>{
 const KEY='stance-crime.drive.top10.v1',levels=['easy','normal','hard'];let rows=[],persisted=true;
 const normalize=value=>{const name=String(value??'').trim().replace(/ +/g,' ').toUpperCase();return /^[A-ZА-ЯЁ0-9 -]{1,16}$/u.test(name)?name:'';};
 function rank(input){const ids=new Set();return (Array.isArray(input)?input:[]).filter(r=>r&&typeof r.id==='string'&&/^[a-zA-Z0-9-]{8,80}$/.test(r.id)&&normalize(r.name)&&Number.isSafeInteger(r.score)&&r.score>=0&&levels.includes(r.level)&&typeof r.car==='string'&&typeof r.date==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(r.date)).sort((a,b)=>b.score-a.score||a.date.localeCompare(b.date)||a.id.localeCompare(b.id)).filter(r=>{if(ids.has(r.id))return false;ids.add(r.id);return true;});}
 function trim(input){const ranked=rank(input);return levels.flatMap(level=>ranked.filter(r=>r.level===level).slice(0,10));}
 try{rows=trim(JSON.parse(localStorage.getItem(KEY)||'[]'));}catch(e){persisted=false;}
 function save(record){rows=trim([...rows,record]);try{localStorage.setItem(KEY,JSON.stringify(rows));persisted=true;}catch(e){persisted=false;}return persisted;}
 return {normalize,save,list:level=>rows.filter(r=>r.level===level),persisted:()=>persisted,id:()=>globalThis.crypto?.randomUUID?.()||('run-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2))};
})();