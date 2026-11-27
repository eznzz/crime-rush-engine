
// Game-specific menu and presets; sandbox page remains independent.
const gameMenu=document.getElementById('gameMenu'),gameStart=document.getElementById('gameStart'),gameResult=document.getElementById('gameResult');
const GAME_LEVELS=RaceConfig.levels;
const raceParams=new URLSearchParams(location.search),racePair=RaceConfig.pairs[Number(raceParams.get('pair'))],raceLevel=raceParams.get('level'),raceRecordsOnly=raceParams.get('records')==='1';
const canonicalCar=id=>({pobeditel01:'pobeditel','schoolboy-vaz-01':'yaichnitsa',sputnik08:'sputnik','vaz03-tan':'vasilek'}[id]||id);
const CAR_NAMES={'m412-01':'Москвич 412','pobeditel01':'Победа','schoolboy-vaz-01':'ВАЗ 2101','sputnik08':'Спутник 2108','vaz03-tan':'ВАЗ 2103'};
let chosenCar='sputnik',chosenLevel='normal',gameReady=false,runId=null,runCar=null,runLevel=null,pendingRecord=null,lastSavedId=null;
const recordForm=document.getElementById('driveRecordForm'),recordInput=document.getElementById('driveRecordName'),recordPanel=document.getElementById('driveRecordsPanel'),recordLevel={value:'normal'},recordOpen=document.getElementById('driveRecordsOpen'),gameChoices=document.getElementById('gameChoices');
function showMenuChoices(){recordPanel.hidden=true;recordForm.hidden=true;gameChoices.hidden=false;gameStart.hidden=false;recordOpen.hidden=false;gameStart.disabled=!gameReady;}
function showDriveRecords(level){gameResult.hidden=true;recordLevel.value=level;document.getElementById('driveRecordsAgain').hidden=raceRecordsOnly;recordPanel.hidden=false;recordForm.hidden=true;gameChoices.hidden=true;gameStart.hidden=true;recordOpen.hidden=true;renderDriveRecords();}
function renderDriveRecords(){const order=['easy','normal','hard'];document.getElementById('driveRecordsLevelLabel').textContent=GAME_LEVELS[recordLevel.value].label.toUpperCase()+' · '+(order.indexOf(recordLevel.value)+1)+' / 3';const body=document.querySelector('#driveRecordsTable tbody'),rows=DriveRecords.list(recordLevel.value);body.replaceChildren();for(let i=0;i<10;i++){const row=rows[i],tr=document.createElement('tr');if(row?.id===lastSavedId)tr.className='current';for(const value of [String(i+1).padStart(2,'0'),row?.name||'—',row?(GAME_LEVELS[row.level]?.label||row.level):'—',row?String(row.score).padStart(6,'0'):'------']){const td=document.createElement('td');td.textContent=value;tr.append(td);}body.append(tr);}document.getElementById('driveRecordStatus').textContent=DriveRecords.persisted()?'Локальные рекорды':'Хранилище недоступно: результаты только в памяти';}
recordOpen.addEventListener('click',()=>showDriveRecords(chosenLevel));function shiftRecords(d){const order=['easy','normal','hard'];recordLevel.value=order[(order.indexOf(recordLevel.value)+d+3)%3];renderDriveRecords();window.PreviewAudio?.play('menu');}document.getElementById('driveRecordsPrev').addEventListener('click',()=>shiftRecords(-1));document.getElementById('driveRecordsNext').addEventListener('click',()=>shiftRecords(1));window.addEventListener('keydown',e=>{if(!gameMenu.hidden&&!recordPanel.hidden&&(e.code==='ArrowLeft'||e.code==='ArrowRight')){e.preventDefault();if(!e.repeat)shiftRecords(e.code==='ArrowLeft'?-1:1);}});document.getElementById('driveRecordsAgain').addEventListener('click',()=>{if(racePair&&Object.hasOwn(GAME_LEVELS,raceLevel))location.reload();else location.href='../../../stance-crime/game/race-garage.html?v=alpha28';});document.getElementById('driveRecordsBack').addEventListener('click',()=>location.href='../../../stance-crime/game/race-garage.html?v=alpha28');
recordForm.addEventListener('submit',e=>{e.preventDefault();if(!pendingRecord)return;const name=DriveRecords.normalize(recordInput.value);if(!name){document.getElementById('driveRecordError').textContent='Имя: 1–16 букв, цифр, пробелов или дефисов.';recordInput.focus();return;}const record={...pendingRecord,name};pendingRecord=null;DriveRecords.save(record);lastSavedId=record.id;recordInput.blur();window.PreviewAudio?.play('record');showDriveRecords(record.level);});
async function initGameMenu(){
 gameReady=true;gameStart.disabled=false;document.getElementById('gameLoad').hidden=true;
 if(raceRecordsOnly){showDriveRecords('normal');gameMenu.hidden=false;return true;}
 if(racePair&&Object.hasOwn(GAME_LEVELS,raceLevel)){chosenCar=canonicalCar(racePair.car);chosenLevel=raceLevel;return await startGame();}
 location.replace('../../../stance-crime/game/race-garage.html?v=alpha28');return false;

}
function refreshGameMenu(){for(const b of document.querySelectorAll('#gameCars button'))b.setAttribute('aria-pressed',String(b.dataset.car===chosenCar));for(const b of document.querySelectorAll('#gameLevels button'))b.setAttribute('aria-pressed',String(b.dataset.level===chosenLevel));document.getElementById('levelDescription').textContent=GAME_LEVELS[chosenLevel].description;}
let startingGame=false;
async function startGame(){
 if(!gameReady||pendingRecord||startingGame)return false;startingGame=true;gameStart.disabled=true;gameMenu.hidden=true;
 const level=GAME_LEVELS[chosenLevel];
 try{if(!await CrimeRushDrive.start({car:chosenCar,music:chosenLevel,health:level.health,weather:level.storm?'storm':null,controls:{trafficMode:level.mode,trafficSpeed:level.traffic,obstaclesChance:level.obstacles,horseChance:level.horse,roadworkChance:level.roadwork}}))return false;runId=DriveRecords.id();runCar=racePair?.car||chosenCar;runLevel=chosenLevel;lastSavedId=null;showMenuChoices();gameResult.hidden=true;gameMenu.hidden=true;gameStart.blur();return true;}catch(e){CrimeRushDrive.error(e.message);return false;}finally{startingGame=false;gameStart.disabled=!gameReady;}
}
function showGameResult(){if(pendingRecord||!runId)return;const {score,reason}=CrimeRushDrive.snapshot();pendingRecord={id:runId,car:runCar,level:runLevel,score,date:new Date().toISOString()};runId=null;gameResult.textContent=({both:'АВАРИЯ',driver:'ВОДИТЕЛЬ НЕ МОЖЕТ ПРОДОЛЖАТЬ',vehicle:'КРИТИЧЕСКАЯ НЕИСПРАВНОСТЬ'}[reason]||'ПОЕЗДКА ЗАВЕРШЕНА')+' · Очки: '+String(score).padStart(6,'0');gameResult.hidden=false;gameStart.textContent='НОВАЯ ПОЕЗДКА';gameMenu.hidden=false;gameChoices.hidden=true;recordPanel.hidden=true;recordForm.hidden=false;gameStart.hidden=true;recordOpen.hidden=true;recordInput.value='';document.getElementById('driveRecordError').textContent='';CrimeRushDrive.clearInput();if(matchMedia('(pointer:fine)').matches)recordInput.focus({preventScroll:true});}
gameStart.addEventListener('click',startGame);
document.getElementById('gameMenuButton').addEventListener('click',()=>{location.href='../../../stance-crime/game/race-garage.html?v=alpha28';});
document.getElementById('settingsDialog').addEventListener('close',()=>{if(gameMenu.hidden)CrimeRushDrive.pause(false);});
document.getElementById('settingsDialog').addEventListener('cancel',()=>{if(gameMenu.hidden)CrimeRushDrive.pause(false);});
document.getElementById('openSettings').addEventListener('click',()=>{if(gameMenu.hidden)CrimeRushDrive.pause();});
document.getElementById('settingsDialog').addEventListener('focusin',()=>{if(document.getElementById('settingsDialog').open&&gameMenu.hidden)CrimeRushDrive.pause();});

CrimeRushDrive.initialize(canonicalCar(racePair?.car)).then(async()=>{if(await initGameMenu())CrimeRushDrive.play();}).catch(e=>CrimeRushDrive.error('Ошибка загрузки сцены: '+e.message));

window.CrimeRushDriveIntegration={onFinish:showGameResult,loadingReady:()=>!startingGame&&!!(runId||raceRecordsOnly),blocksInput:()=>!gameMenu.hidden};
