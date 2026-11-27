// Provisional art for unfinished environments only. Approved assets have no procedural substitutes.
(function(root){const art={
'deciduous-tree':[56,72,300,[[24,34,8,38,'#665044'],[7,12,42,35,'#3e6145'],[13,4,30,32,'#547b4b'],[3,25,42,15,'#36543b']]],
'city-tree':[56,72,240,[[25,33,6,39,'#685b4b'],[9,8,38,32,'#426149'],[3,21,48,20,'#36523e'],[18,3,23,20,'#62815a']]],
'city-building':[80,112,540,[[4,4,72,108,'#8b8d89'],[55,4,21,108,'#686e70'],[2,0,76,5,'#535c62'],...Array.from({length:6},(_,y)=>Array.from({length:3},(_,x)=>[10+x*15,12+y*15,9,9,(x+y)%3?'#536a78':'#c0b492'])).flat()]],
'road-sign':[48,64,150,[[22,18,4,46,'#787e7f'],[3,3,42,23,'#c7c9c4'],[5,5,38,19,'#426d91'],[11,11,26,3,'#e8e8dc'],[30,8,4,9,'#e8e8dc']]]};const api=Object.freeze(art);if(typeof module!=='undefined')module.exports=api;else root.CrimeRushEnvironmentArt=api;})(typeof window!=='undefined'?window:globalThis);