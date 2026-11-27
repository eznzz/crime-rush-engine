// Composition root: remove or disable modules here; no engine modifications needed.
window.CrimeRushProject={schemaVersion:1,id:'reference',title:'CRIME RUSH',modules:[
{id:'garage',kind:'interior',title:'Гараж',entry:'modules/garage/index.html',enabled:true},
{id:'drive',kind:'drive',title:'Поездка',entry:'modules/drive/index.html',enabled:true}
],missions:[
{id:'reference-drive',title:'Свободная поездка',enabled:true,settings:{},stages:[{id:'drive',kind:'drive',module:'drive',objective:{kind:'endless'},onFailure:'failure'},{id:'failure',kind:'screen',title:'Автомобиль повреждён',text:'Поездка завершена.',actions:[{label:'Повторить',next:'drive'},{label:'В меню',next:null}]}]},
{id:'reference-mission',title:'Тестовая миссия',enabled:true,settings:{rainMode:'clear'},stages:[{id:'intro',kind:'animation',animation:'departure',config:{text:'Наберите 100 очков, сохранив автомобиль.'},next:'drive'},{id:'drive',kind:'drive',module:'drive',objective:{kind:'score',target:100},onSuccess:'arrival',onFailure:'failure'},{id:'arrival',kind:'animation',animation:'arrival',next:'success'},{id:'success',kind:'screen',title:'Миссия выполнена',actions:[{label:'Повторить',next:'intro'},{label:'В меню',next:null}]},{id:'failure',kind:'screen',title:'Миссия не выполнена',actions:[{label:'Повторить',next:'intro'},{label:'В меню',next:null}]}]}
]};
