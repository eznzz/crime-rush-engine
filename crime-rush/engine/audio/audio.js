// Adapted from STANCE CRIME BEETLE BRAWL audio.js: original procedural effects, new sunset cruise music. No external assets.
const BEETLE_SOUNDS = Object.freeze({
 explosion:[[145,28,.48,'noise',.95],[85,22,.30,'sawtooth',.66]],near:[[740,920,.065,'triangle',.34],[1100,1480,.095,'triangle',.42]],
 menu:[[520,780,.055,'triangle',.32],[780,1040,.045,'square',.18]],start:[[220,330,.12],[330,440,.12],[440,660,.18]],
 dash:[[780,75,.22,'swing-heavy',.80]],swing:[[420,85,.16,'noise',.62]],hit:[[190,65,.105,'punch',1]],
 defeat:[[150,48,.12,'fall-punch',1]],damage:[[260,65,.26,'sawtooth',.88],[130,45,.17,'noise',.58]],crash:[[134,42,.16,'crash-punch',1]],
 drop:[[440,880,.10,'triangle',.47],[880,1200,.08,'triangle',.28]],good:[[440,550,.09],[660,880,.12],[880,1320,.14,'triangle',.5]],
 bad:[[390,220,.13,'sawtooth',.6],[220,75,.18,'sawtooth',.5]],destroy:[[420,90,.21,'noise',.88],[110,35,.14,'sawtooth',.65]],
 over:[[440,330,.19],[330,220,.19],[220,82,.36,'sawtooth',.55]],record:[[523,659,.12],[659,784,.12],[784,1047,.14],[1047,1319,.28,'triangle',.55]]
});
// 16-bit console-inspired FM / PCM synthesis, not a hardware emulator.
function chipVoice(phase, t, kind){
  const p=phase*2*Math.PI;
  if(kind==='noise')return Math.sin(p*.61+3*Math.sin(p*1.73))*0.55+Math.sin(p*2.37)*.25;
  if(kind==='bass')return .78*Math.sin(p+1.4*Math.exp(-t*5)*Math.sin(p*2))+.22*Math.sin(p*2);
  if(kind==='bell')return .8*Math.sin(p+2.1*Math.exp(-t*9)*Math.sin(p*3))+.2*Math.sin(p*2);
  return .72*Math.sin(p+(.8+1.9*Math.exp(-t*10))*Math.sin(p*2))+.18*Math.sin(p*3)+.10*Math.sin(p*.997);
}
function pcm16(v){return Math.round(Math.max(-1,Math.min(1,v))*32767)/32767;}
// Layered 16-bit-style effects: transient, body, harmonics and short tail.
const SWING_PRESETS=Object.freeze({wide:[980,120,.28,'swing-wide',.86],heavy:[680,65,.30,'swing-heavy',.92],dash:[780,75,.22,'swing-heavy',.80],double:[1200,100,.32,'swing-double',.85]});
function makeSwing(ctx,preset){
 const [from,to,duration,type,volume]=SWING_PRESETS[preset]||SWING_PRESETS.heavy;
 const rate=ctx.sampleRate,n=Math.ceil(rate*duration),b=ctx.createBuffer(2,n,rate);let seed=9171;
 for(let ch=0;ch<2;ch++){const data=b.getChannelData(ch);let low=0,mid=0,phase=0;for(let i=0;i<n;i++){const t=i/rate,u=t/duration;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1;low+=.045*(noise-low);mid+=.23*(noise-mid);phase+=from*(to/from)**u/rate;const env=Math.sin(Math.PI*u)**.8;const sweep=type==='swing-double'?.45+.55*Math.abs(Math.sin(2*Math.PI*u)):1;const pan=ch===0?1.15-.30*u:.85+.30*u;const body=type==='swing-heavy'?.55:.22;data[i]=pcm16(Math.tanh((1.5*(mid-low)+.32*(noise-mid)+body*Math.sin(phase*2*Math.PI)+.25*low)*2.1)*env*sweep*pan*volume);}}
 return b;
}
// Compact punch: dry crack, dense low-mid body, no long echo.
function makePunch(ctx){
 const rate=ctx.sampleRate,n=Math.ceil(rate*.105),b=ctx.createBuffer(2,n,rate);let seed=3181,low=0,mid=0,phase=0;
 for(let i=0;i<n;i++){const t=i/rate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1;low+=.08*(noise-low);mid+=.37*(noise-mid);phase+=(65+125*Math.exp(-t*55))/rate;
 const crack=(noise-mid)*1.3*Math.exp(-t*165),smack=(mid-low)*1.9*Math.exp(-t*65),body=.85*Math.sin(phase*2*Math.PI)*Math.exp(-t*42)+.24*Math.sin(phase*4*Math.PI)*Math.exp(-t*55);const env=Math.min(1,t/.0015,(n-i)/(rate*.012));const v=Math.tanh((crack+smack+body)*1.7)*env*.95;
 for(let ch=0;ch<2;ch++)b.getChannelData(ch)[i]=pcm16(v);}
 return b;
}
// Short landing punch: dry slap, lower body impact and a tiny grit tail.
function makeFallPunch(ctx){
 const rate=ctx.sampleRate,n=Math.ceil(rate*.12),b=ctx.createBuffer(2,n,rate),l=b.getChannelData(0),r=b.getChannelData(1);let seed=7193,low=0,mid=0,phase=0;
 for(let i=0;i<n;i++){const t=i/rate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1;low+=.09*(noise-low);mid+=.36*(noise-mid);phase+=(48+102*Math.exp(-t*48))/rate;
 const slap=1.2*(noise-mid)*Math.exp(-t*140)+1.65*(mid-low)*Math.exp(-t*57),body=.95*Math.sin(phase*2*Math.PI)*Math.exp(-t*34)+.30*Math.sin(phase*4*Math.PI)*Math.exp(-t*49),grit=.19*(mid-low)*Math.exp(-t*29);const env=Math.min(1,t/.0015,(n-i)/(rate*.012));
 l[i]=pcm16(Math.tanh((slap+body+grit)*1.7)*env*.93);r[i]=pcm16(Math.tanh((slap+body-grit*.3)*1.7)*env*.93);}
 return b;
}
// Stereo arcade impact: sharp attack, falling body, debris and short spatial reflections.
function makeBeetleEffect(ctx,from,to,duration,type,volume){
 const rate=ctx.sampleRate,n=Math.ceil(rate*duration),buffer=ctx.createBuffer(2,n,rate),dry=new Float32Array(n);let phase=0,low=0,mid=0,seed=92345;
 const heavy=type==='noise'||type==='sawtooth'||from<200;
 for(let i=0;i<n;i++){const t=i/rate,u=t/duration;phase+=from*(to/from)**u/rate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1;low+=.045*(noise-low);mid+=.24*(noise-mid);const p=phase*2*Math.PI,attack=Math.exp(-t*48),body=Math.exp(-t*9),tail=Math.min(1,t/.002,(duration-t)/.025);let v;
 if(heavy){const thump=Math.sin(2*Math.PI*(48*t+2.4*(1-Math.exp(-t*35))));v=.72*thump*body+.45*Math.tanh(2*Math.sin(p)+Math.sin(p*2.01))*body+.95*(noise-mid)*attack+.65*(mid-low)*Math.exp(-t*15);if(type==='noise')v+=.45*(noise-low)*Math.exp(-t*12);}
 else v=.62*chipVoice(phase,t,'lead')*body+.28*chipVoice(phase*1.5,t,'bell')*Math.exp(-t*5)+.20*chipVoice(phase*.5,t,'bass')*body+.18*(noise-mid)*attack;
 dry[i]=Math.tanh(v*1.7)*Math.max(0,tail)*volume;}
 for(let ch=0;ch<2;ch++){const data=buffer.getChannelData(ch),delay=Math.round(rate*(ch===0?.018:.029)),delay2=Math.round(rate*(ch===0?.043:.051));for(let i=0;i<n;i++){const end=Math.min(1,(n-i)/(rate*.018));data[i]=pcm16(Math.tanh(dry[i]+.27*(dry[i-delay]||0)-.13*(dry[i-delay2]||0))*end);}}
 return buffer;
}
// Original stereo rock'n'roll loop: power chords, walking bass, lead guitar and drums.
// Original sunset cruise music: 76 BPM, warm electric keys and gentle bass.
// Circular mixing keeps note tails continuous at the loop boundary.
function makeBeetleMusic(ctx,dynamic=false){
 if(dynamic)return makeFogDriveMusic(ctx);
 const beat=60/76,rate=ctx.sampleRate;
 const chords=[[48,55,59,64],[45,52,55,60],[41,48,52,57],[43,50,53,59],[48,55,59,64],[45,52,55,60],[41,48,52,57],[43,50,55,62]];
 const length=Math.round(chords.length*4*beat*rate),buffer=ctx.createBuffer(2,length,rate),l=buffer.getChannelData(0),r=buffer.getChannelData(1);
 function put(i,v,p){i%=length;l[i]+=v*(1-p*.48);r[i]+=v*(1+p*.48);}
 function note(midi,start,dur,amp,kind,pan=0){
  const f=440*2**((midi-69)/12),first=Math.round(start*rate),n=Math.round(dur*rate);
  for(let i=0;i<n;i++){const t=i/rate,p=2*Math.PI*f*t,fade=Math.max(0,Math.min(1,t/(kind==='pad'?.25:.035),(dur-t)/(kind==='pad'?.45:.16)));
   let v;if(kind==='pad')v=(.78*Math.sin(p)+.13*Math.sin(p*2)+.09*Math.sin(p*1.003))*fade;
   else if(kind==='bass')v=(.9*Math.sin(p)+.1*Math.sin(2*p))*fade*Math.exp(-t*.6);
   else v=(.82*Math.sin(p+.28*Math.exp(-t*3)*Math.sin(p*2))+.12*Math.sin(2*p)+.06*Math.sin(p*3))*fade*Math.exp(-t*1.7);
   put(first+i,v*amp,pan);
   if(kind==='key')put(first+i+Math.round(rate*.29),v*amp*.13,-pan);
  }
 }
 const melody=[[76,null,74,71],[72,null,69,null],[69,72,null,76],[74,null,71,null],[76,79,null,74],[72,null,76,69],[69,null,72,74],[71,null,74,null]];
 chords.forEach((ch,b)=>{const t=b*4*beat;
  ch.forEach((m,i)=>note(m,t,4.65*beat,.047,'pad',(i-1.5)*.43));
  note(ch[0]-12,t,1.85*beat,.14,'bass');note(ch[0]-12,t+2*beat,1.7*beat,.10,'bass');
  [0,1,2,3].forEach(k=>{note(ch[1+(k%3)]+12,t+(k+.5)*beat,1.25*beat,.035,'key',k%2?.4:-.4);const m=melody[b][k];if(m!==null)note(m,t+k*beat,1.65*beat,.085,'key',.1);});
 });
 for(let i=0;i<length;i++){l[i]=pcm16(Math.tanh(l[i]*1.25)*.9);r[i]=pcm16(Math.tanh(r[i]*1.25)*.9);}return buffer;
}
// Original minor-key 112 BPM driving loop with soft stereo pads, pulsing bass and restrained drums.
function makeFogDriveMusic(ctx){
 const rate=ctx.sampleRate,beat=60/112,bars=8,length=Math.round(bars*4*beat*rate),buffer=ctx.createBuffer(2,length,rate),l=buffer.getChannelData(0),r=buffer.getChannelData(1);
 let seed=8371;const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
 const put=(i,v,pan=0)=>{i%=length;l[i]+=v*(1-pan*.55);r[i]+=v*(1+pan*.55);};
 function note(m,start,dur,amp,kind,pan=0){const f=440*2**((m-69)/12),first=Math.round(start*rate),n=Math.round(dur*rate);for(let i=0;i<n;i++){const t=i/rate,p=2*Math.PI*f*t,env=Math.max(0,Math.min(1,t/(kind==='pad'?.18:.008),(dur-t)/(kind==='pad'?.35:.065)));const v=kind==='pad'?(Math.sin(p)*.66+Math.sin(p*1.003)*.24+Math.sin(p*2)*.10):kind==='bass'?(Math.sin(p)*.8+Math.sin(2*p)*.2)*Math.exp(-t*2):(Math.sin(p+.55*Math.exp(-t*8)*Math.sin(p*2))*.86+Math.sin(p*2)*.14)*Math.exp(-t*4);put(first+i,v*amp*env,pan);if(kind==='key')put(first+i+Math.round(rate*.24),v*amp*env*.22,-pan);}}
 function drum(start,kind){const first=Math.round(start*rate),dur=kind==='kick'?.21:kind==='snare'?.16:.07;let low=0;for(let i=0;i<rate*dur;i++){const t=i/rate,n=noise();low+=.12*(n-low);let v=kind==='kick'?Math.sin(2*Math.PI*(49*t+1.8*(1-Math.exp(-t*42))))*Math.exp(-t*19)*.24:kind==='snare'?((n-low)*.8+Math.sin(t*2*Math.PI*172)*.2)*Math.exp(-t*27)*.10:(n-low)*Math.exp(-t*65)*.047;put(first+i,v*Math.min(1,t/.002),kind==='hat'?.35:0);}}
 const chords=[[45,52,60,64],[41,48,57,60],[48,55,59,64],[43,50,57,62],[45,52,60,67],[41,48,57,64],[48,55,60,67],[43,50,59,62]];
 const melody=[[76,72,74,69],[72,69,67,69],[76,79,74,71],[74,71,69,67],[76,79,81,76],[72,76,69,72],[79,76,74,72],[71,74,69,67]];
 chords.forEach((ch,b)=>{const t=b*4*beat;ch.forEach((m,i)=>note(m,t,4.5*beat,.044,'pad',(i-1.5)*.44));for(let k=0;k<8;k++){note(ch[0]-12+(k===6?7:0),t+k*.5*beat,.44*beat,k%2?.085:.125,'bass');note(ch[1+k%3]+12,t+k*.5*beat,.7*beat,.031,'key',k%2?.5:-.5);drum(t+k*.5*beat,'hat');}for(let k=0;k<4;k++){drum(t+k*beat,k%2?'snare':'kick');note(melody[b][k],t+k*beat,.78*beat,.065,'key',.15);}});
 for(let i=0;i<length;i++){l[i]=pcm16(Math.tanh(l[i]*1.1)*.88);r[i]=pcm16(Math.tanh(r[i]*1.1)*.88);}return buffer;
}

// Original instrumental chiptune arrangements for the three FAILRUN difficulty levels.
function makeRaceMusic(ctx,style){
 // Original 78 BPM low-key hip-hop loop. A single soundtrack for every difficulty.
 const rate=22050,beat=60/78,bars=4,length=Math.round(bars*4*beat*rate),buffer=ctx.createBuffer(2,length,rate),l=buffer.getChannelData(0),r=buffer.getChannelData(1);
 let seed=8921;const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
 const put=(i,v,pan=0)=>{i%=length;l[i]+=v*(1-pan*.4);r[i]+=v*(1+pan*.4);};
 function note(m,start,dur,amp,bass=false,pan=0){const f=440*2**((m-69)/12),first=Math.round(start*rate),n=Math.round(dur*rate);for(let i=0;i<n;i++){const t=i/rate,p=2*Math.PI*f*t,env=Math.max(0,Math.min(1,t/.024,(dur-t)/.09));const v=bass?(Math.sin(p)*.87+Math.sin(p*2)*.13)*Math.exp(-t*.9):(Math.sin(p)*.89+Math.sin(p*2)*.09+Math.sin(p*3)*.02)*Math.exp(-t*1.8);put(first+i,v*amp*env,pan);}}
 function drum(start,kind){const first=Math.round(start*rate),dur=kind==='kick'?.34:kind==='snare'?.15:.045;let low=0;for(let i=0;i<rate*dur;i++){const t=i/rate;low+=(kind==='hat'?.27:.12)*(noise()-low);const v=kind==='kick'?Math.sin(2*Math.PI*(46*t+1.3*(1-Math.exp(-t*37))))*Math.exp(-t*12)*.32:kind==='snare'?(.67*low+.33*Math.sin(2*Math.PI*142*t))*Math.exp(-t*27)*.16:low*Math.exp(-t*72)*.055;put(first+i,v*Math.min(1,t/.004),kind==='hat'?.25:0);}}
 const chords=[[45,48,52,55],[41,45,48,52],[48,52,55,59],[43,47,50,53]];
 chords.forEach((ch,b)=>{const t=b*4*beat;for(const k of [0,1.65,3.1])note(ch[0]-12,t+k*beat,(k===0?1.45:.85)*beat,.19,true);for(const k of [0,.0+2.55])ch.forEach((m,j)=>note(m+12,t+k*beat,1.15*beat,.035,false,(j-1.5)*.35));for(const k of [0,1.65,2.7,3.55])drum(t+k*beat,'kick');for(const k of [1,3])drum(t+(k+.035)*beat,'snare');for(let k=0;k<8;k++)drum(t+(k*.5+(k%2?.075:0))*beat,'hat');});
 for(let i=0;i<length;i++){l[i]=pcm16(Math.tanh(l[i]*1.05)*.86);r[i]=pcm16(Math.tanh(r[i]*1.05)*.86);}return buffer;
}

// Six original 32-bit console-era inspired instrumental hip-hop loops.
// Render once into stereo Float32 AudioBuffers, 22050Hz; no external samples.
const RADIO_STATIONS=Object.freeze([
 {bpm:96,roots:[45,41,48,43],riff:[0,7,10,12,7,3,10,7],kick:[0,1.5,2.75,3.5],swing:.055,voice:0},
 {bpm:104,roots:[43,46,48,41],riff:[0,3,7,12,10,7,3,5],kick:[0,.75,2,3.25],swing:.035,voice:1},
 {bpm:92,roots:[40,43,45,47],riff:[7,12,10,7,3,5,7,0],kick:[0,1.75,2.5,3.75],swing:.085,voice:2},
 {bpm:110,roots:[42,45,40,47],riff:[0,12,7,10,3,7,12,10],kick:[0,.5,1.75,2.5,3.5],swing:.025,voice:1},
 {bpm:100,roots:[48,45,41,43],riff:[7,9,12,14,12,7,4,9],kick:[0,1.25,2.75,3.5],swing:.06,voice:0},
 {bpm:108,roots:[47,43,45,42],riff:[0,7,3,10,12,10,7,3],kick:[0,.75,1.5,2.75,3.25],swing:.045,voice:2}
]);
function makeRadioMusic(ctx,station){
 const cfg=RADIO_STATIONS[station-1]||RADIO_STATIONS[0],rate=22050,beat=60/cfg.bpm,bars=8,length=Math.round(bars*4*beat*rate),buffer=ctx.createBuffer(2,length,rate),l=buffer.getChannelData(0),r=buffer.getChannelData(1);
 let seed=1731+station*937;const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
 function put(i,v,pan=0){i%=length;l[i]+=v*(1-pan*.45);r[i]+=v*(1+pan*.45);}
 function note(m,start,dur,amp,kind,pan=0){const f=440*2**((m-69)/12),first=Math.round(start*rate),n=Math.round(dur*rate);for(let i=0;i<n;i++){const t=i/rate,p=2*Math.PI*f*t,env=Math.max(0,Math.min(1,t/.008,(dur-t)/.065));let v;
 if(kind==='bass')v=(.84*Math.sin(p)+.16*Math.sin(2*p))*Math.exp(-t*1.5);
 else if(kind==='chord')v=(.72*Math.sin(p)+.18*Math.sin(p*2)+.10*Math.sin(p*3))*Math.exp(-t*3.4);
 else if(cfg.voice===1)v=(.64*Math.sin(p+1.1*Math.exp(-t*12)*Math.sin(2*p))+.24*Math.sin(p*2)+.12*Math.sin(p*3))*Math.exp(-t*5);
 else if(cfg.voice===2)v=(.70*Math.sin(p)+.22*Math.sin(3*p)+.08*Math.sin(5*p))*Math.exp(-t*4);
 else v=(.84*Math.sin(p+.55*Math.exp(-t*8)*Math.sin(2*p))+.16*Math.sin(p*2))*Math.exp(-t*3);
 v*=amp*env;put(first+i,v,pan);if(kind==='lead')put(first+i+Math.round(rate*beat*.75),v*.15,-pan);}}
 function drum(start,kind,accent=1){const first=Math.round(start*rate),dur=kind==='kick'?.28:kind==='snare'?.17:kind==='open'?.15:.055;let low=0;for(let i=0;i<rate*dur;i++){const t=i/rate,n=noise();low+=.16*(n-low);const hi=n-low;let v=kind==='kick'?(.80*Math.sin(2*Math.PI*(48*t+1.9*(1-Math.exp(-t*45))))+.20*hi*Math.exp(-t*80))*Math.exp(-t*15)*.39:kind==='snare'?(.70*hi+.30*Math.sin(2*Math.PI*175*t))*Math.exp(-t*24)*.19:hi*Math.exp(-t*(kind==='open'?25:65))*.065;put(first+i,v*accent*Math.min(1,t/.002),kind==='hat'?.35:kind==='open'?-.35:0);}}
 for(let b=0;b<bars;b++){const root=cfg.roots[b%4],t=b*4*beat,minor=station!==5;for(const k of cfg.kick){drum(t+k*beat,'kick');note(root-12+(k>3?7:0),t+k*beat,.65*beat,.20,'bass');}for(const k of [1,3])drum(t+(k+.02)*beat,'snare');for(let k=0;k<8;k++){drum(t+(k*.5+(k%2?cfg.swing:0))*beat,k===7?'open':'hat',k%2?.66:1);if((k+b)%3!==1)note(root+24+cfg.riff[(k+(b%2)*2)%8],t+(k*.5+(k%2?cfg.swing:0))*beat,.35*beat,.065,'lead',k%2?.30:-.25);}for(const k of [.5,2.5])for(const [j,m] of [0,minor?3:4,7,10].entries())note(root+12+m,t+k*beat,.7*beat,.033,'chord',(j-1.5)*.35);}
 for(let i=0;i<length;i++){l[i]=Math.tanh(l[i]*1.15)*.88;r[i]=Math.tanh(r[i]*1.15)*.88;}return buffer;
}

// Dry, muffled collision punch: short low-frequency body with filtered noise, no echo.
function makeCrashPunch(ctx){
 const rate=ctx.sampleRate,n=Math.ceil(rate*.16),b=ctx.createBuffer(1,n,rate),d=b.getChannelData(0);let seed=3181,low=0,phase=0;
 for(let i=0;i<n;i++){const t=i/rate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;low+=Math.min(.22,2*Math.PI*380/rate)*(seed/2147483648-1-low);phase+=(42+92*Math.exp(-t*48))/rate;const env=Math.max(0,Math.min(1,t/.002,(n-i)/(rate*.018)));d[i]=pcm16(Math.tanh((1.35*Math.sin(phase*2*Math.PI)*Math.exp(-t*27)+.42*low*Math.exp(-t*33))*1.5)*env*.88);}
 return b;
}

class BeetleAudio {
  constructor(config, storage, Context=globalThis.AudioContext||globalThis.webkitAudioContext){
    this.config=config;this.storage=storage;this.Context=Context;this.enabled=config.effectsEnabled||config.musicEnabled;this.musicSource=null;this.musicBuffer=null;this.musicStyle=null;this.raceBuffers=new Map();this.musicAllowed=true;this.radioEnabled=true;this.radioTrack=null;this.ctx=null;this.voices=new Set();this.effectBuffers=new Map();
    try{const v=storage?.getItem(config.storageKey);if(v==='off'||v==='on')this.enabled=v==='on';}catch(e){}
  }
  unlock(){if(!this.config.enabled||!this.enabled||!this.Context)return;try{if(!this.ctx){this.ctx=new this.Context();this.master=this.ctx.createGain();this.master.gain.value=this.config.masterVolume*this.config.effectsVolume;if(this.ctx.createBiquadFilter){this.effectFilter=this.ctx.createBiquadFilter();this.effectFilter.type='lowpass';this.effectFilter.frequency.value=850;this.effectFilter.Q.value=.65;this.master.connect(this.effectFilter);this.effectFilter.connect(this.ctx.destination);}else this.master.connect(this.ctx.destination);this.musicGain=this.ctx.createGain();this.musicGain.gain.value=this.config.masterVolume*this.config.musicVolume;this.musicGain.connect(this.ctx.destination);}if(this.ctx.state!=='running')Promise.resolve(this.ctx.resume()).then(()=>this.syncMusic()).catch(()=>{});else this.syncMusic();}catch(e){}}
  setEnabled(value){this.enabled=!!value;try{this.storage?.setItem(this.config.storageKey,value?'on':'off');}catch(e){}if(!value){this.stop();this.stopMusic();}else this.unlock();}
  setRaceMusic(style){const next=['easy','normal','hard','cruise'].includes(style)?'cruise':null;if(next===this.musicStyle)return;this.stopMusic();this.musicStyle=next;this.musicBuffer=null;this.syncMusic();}
  setRadioEnabled(value){this.radioEnabled=!!value;this.syncMusic();}
  setRadioTrack(track){track=Number(track);if(!Number.isInteger(track)||track<1||track>6)return false;if(this.radioTrack!==track){this.stopMusic();this.radioTrack=track;this.musicBuffer=null;}this.syncMusic();return true;}
  async prepareRadioTracks(){const C=globalThis.OfflineAudioContext||globalThis.webkitOfflineAudioContext;if(!C&&!this.ctx)return false;const ctx=this.ctx||new C(2,1,22050);for(let i=1;i<=6;i++){const key='radio:'+i;if(!this.raceBuffers.has(key))this.raceBuffers.set(key,makeRadioMusic(ctx,i));await new Promise(resolve=>setTimeout(resolve,0));}return true;}
  setMusicAllowed(value){this.musicAllowed=!!value;this.syncMusic();}
  stopMusic(){if(this.musicSource){const source=this.musicSource;this.musicSource=null;try{source.stop();source.disconnect();}catch(e){}}}
  syncMusic(){if(!this.config.enabled||!this.enabled||!this.config.musicEnabled||!this.musicAllowed||!this.radioEnabled){this.stopMusic();return;}if(!this.ctx||this.ctx.state!=='running'||this.musicSource)return;try{if(this.radioTrack!==null){const key='radio:'+this.radioTrack;if(!this.raceBuffers.has(key))this.raceBuffers.set(key,makeRadioMusic(this.ctx,this.radioTrack));this.musicBuffer=this.raceBuffers.get(key);}else if(this.musicStyle){if(!this.raceBuffers.has('cruise'))this.raceBuffers.set('cruise',makeRaceMusic(this.ctx,'cruise'));this.musicBuffer=this.raceBuffers.get('cruise');}else this.musicBuffer ||= makeBeetleMusic(this.ctx,typeof document!=='undefined'&&!!document.getElementById('cv')&&!!document.getElementById('trafficMode'));const source=this.ctx.createBufferSource();source.buffer=this.musicBuffer;source.loop=true;source.connect(this.musicGain);source.start();this.musicSource=source;}catch(e){}}
  stop(){for(const v of this.voices){try{v.stop();}catch(e){}}this.voices.clear();}
  play(name){const ctx=this.ctx;if(!this.config.enabled||!this.enabled||!this.config.effectsEnabled||!ctx||ctx.state!=='running'||!BEETLE_SOUNDS[name])return;try{let t=ctx.currentTime+.005;for(const [from,to,duration,type='square',volume=.3] of (name==='swing'?[SWING_PRESETS[this.config.swingPreset]||SWING_PRESETS.heavy]:BEETLE_SOUNDS[name])){if(this.voices.size>=24)break;const source=ctx.createBufferSource();const key=[name,from,to,duration,type,volume,this.config.swingPreset].join(':');if(!this.effectBuffers.has(key))this.effectBuffers.set(key,name==='dash'?makeSwing(ctx,'dash'):name==='swing'?makeSwing(ctx,this.config.swingPreset):name==='hit'?makePunch(ctx):name==='crash'?makeCrashPunch(ctx):name==='defeat'?makeFallPunch(ctx):makeBeetleEffect(ctx,from,to,duration,type,volume));source.buffer=this.effectBuffers.get(key);const gain=ctx.createGain();gain.gain.setValueAtTime(.001,t);gain.gain.linearRampToValueAtTime(1,t+.005);gain.gain.exponentialRampToValueAtTime(.001,t+duration);source.connect(gain);gain.connect(this.master);this.voices.add(source);source.onended=()=>{this.voices.delete(source);source.disconnect();gain.disconnect();};source.start(t);source.stop(t+duration+.005);t+=duration;}}catch(e){}}
}
if(typeof module!=='undefined')module.exports={BeetleAudio,BEETLE_SOUNDS,makeBeetleMusic,makeBeetleEffect,makeSwing,makePunch,makeFallPunch,makeRaceMusic,makeRadioMusic,RADIO_STATIONS,makeCrashPunch,SWING_PRESETS};
