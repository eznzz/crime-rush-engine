// Experimental road atmosphere palettes. Legacy preserves the approved renderer.
window.CrimeRushAtmospherePresets=Object.freeze({
 times:Object.freeze({
 dawn:{sky:['#536779','#f4c399'],ground:'#697354',road:'#68666a',light:'#ffd5ad',ambient:.78,sun:[.24,.84],shadow:[.55,.18]},
 day:{sky:['#4389bd','#c4e0e7'],ground:'#73894a',road:'#62666a',light:'#fff3d3',ambient:1,sun:[.58,.20],shadow:[-.10,.04]},
 sunset:{sky:['#67577e','#f2a36b'],ground:'#726544',road:'#65606a',light:'#ffc08b',ambient:.72,sun:[.78,.86],shadow:[-.60,.18]},
 night:{sky:['#10162a','#303b57'],ground:'#283a34',road:'#383e4a',light:'#849bc6',ambient:.30,sun:null,shadow:[0,0]}
 }),
 weather:Object.freeze({
 clear:{cloud:.12,fog:.04,wet:0,rain:'clear',diffuse:0},
 overcast:{cloud:.88,fog:.11,wet:0,rain:'clear',diffuse:.72},
 fog:{cloud:.55,fog:.85,wet:0,rain:'clear',diffuse:.65},
 rain:{cloud:.92,fog:.30,wet:.8,rain:'rain',diffuse:.8},
 storm:{cloud:1,fog:.50,wet:1,rain:'storm',diffuse:.94},
 afterrain:{cloud:.35,fog:.09,wet:.75,rain:'clear',diffuse:.25}
 })
});