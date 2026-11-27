const friendChance=document.getElementById('friendCarChance'),friendStatus=document.getElementById('friendCarStatus');
const friendModels=()=>SpriteLibrary.friendModels();
let friendReady=false;if(!CRIME_RUSH_GAME)friendChance.disabled=true;
function updateFriendStatus(){const all=friendModels(),ready=SpriteLibrary.readyFriendModels(I);friendReady=all.length>0&&ready.length===all.length;friendChance.disabled=!friendReady;friendStatus.textContent=friendReady?'Готово '+ready.length+'/'+all.length+': '+ready.map(id=>SpriteLibrary.vehicleLabel?.(id)||id).join(', ')+'. Шанс применяется к новым машинам.':'Подготовлено '+ready.length+'/'+all.length+' машин друзей.';}
if(!CRIME_RUSH_GAME)friendChance.addEventListener('input',()=>document.getElementById('friendCarChanceValue').textContent=friendChance.value+'%');
const passing=CRIME_RUSH_GAME?DriveTraffic.createPassing(LANE_CENTERS,Math.random,trafficAvailable,()=>SpriteLibrary.friendModels()):DriveTraffic.createPassing(LANE_CENTERS,Math.random,trafficAvailable,friendModels,()=>friendReady?Number(friendChance.value)/100:0);
