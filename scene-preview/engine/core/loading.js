const sceneStatus=document.getElementById('sceneStatus');
function sceneError(message){sceneStatus.hidden=false;sceneStatus.textContent=message;window.FailrunLoading?.fail(message);}
