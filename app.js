// ═══════════════════════════════════════════════════
//  CogSpeed V18
// ═══════════════════════════════════════════════════

// ─── Version guard ───
(function(){
  const VER="cogspeed_v18", key="cogspeed_version";
  if(localStorage.getItem(key)!==VER){
    Object.keys(localStorage).forEach(k=>{ if(k.startsWith("cogspeed_")||k.startsWith("cogblock_")) localStorage.removeItem(k); });
    localStorage.setItem(key,VER);
  }
})();

// ─── Defaults ───
const DEFAULTS={
  adminPasscode:"4822",
  consecutiveMissesForBlock:2,
  spRestartSlowerByMs:375,
  spRestartWrongLimit:3,
  spRestartCorrectStreak:2,
  qualifyingBlockGapMs:250,
  rollMeanWindow:8,
  noResponseTimeoutMs:20000,
  wrongWindowSize:5,
  wrongThresholdStop:4,
  maxTrialCount:180,
  maxTestDurationMs:120000,
  minDurationMs:800,
  maxDurationMs:10000,
  initialUnusedCalibrationTrials:1,
  initialMeasuredCalibrationTrials:20,
  initialPacedPercent:0.70,
  calibrationStopErrors:5,
  calibrationStopSlowMs:10000,
  cpsBestMs:800,
  cpsWorstMs:3000,
  deviceBenchmarkEnabled:0
};

const ADMIN_FIELDS=[
  ["consecutiveMissesForBlock","Consecutive misses for block","number"],
  ["spRestartSlowerByMs","SP Restart: slowdown (ms)","number"],
  ["spRestartWrongLimit","SP Restart: wrong limit","number"],
  ["spRestartCorrectStreak","SP Restart: correct streak needed","number"],
  ["qualifyingBlockGapMs","Max block diff to end (ms)","number"],
  ["rollMeanWindow","Rolling mean window","number"],
  ["noResponseTimeoutMs","No-response timeout (ms)","number"],
  ["wrongWindowSize","Wrong-answer window","number"],
  ["wrongThresholdStop","Wrong threshold","number"],
  ["maxTrialCount","Max paced trials","number"],
  ["maxTestDurationMs","Max test time (ms)","number"],
  ["minDurationMs","Min paced duration (ms)","number"],
  ["maxDurationMs","Max paced duration (ms)","number"],
  ["initialUnusedCalibrationTrials","Unused calibration trials","number"],
  ["initialMeasuredCalibrationTrials","Measured calibration trials","number"],
  ["initialPacedPercent","Initial paced % of calibration","number"],
  ["calibrationStopErrors","Cal stop after N errors","number"],
  ["calibrationStopSlowMs","Cal stop if RT exceeds (ms)","number"],
  ["cpsBestMs","CPS best ms (score 100)","number"],
  ["cpsWorstMs","CPS worst ms (score 0)","number"],
  ["deviceBenchmarkEnabled","Benchmark before test (0/1)","number"],
  ["adminPasscode","Admin passcode","password"]
];

// ─── Patterns ───
const DOT_PATTERNS={
  1:[["dot",50,50]],
  2:[["dot",28,50],["dot",72,50]],
  3:[["dot",28,72],["dot",50,28],["dot",72,72]],
  4:[["dot",28,28],["dot",72,28],["dot",28,72],["dot",72,72]],
  5:[["dot",28,28],["dot",72,28],["dot",50,50],["dot",28,72],["dot",72,72]],
  6:[["dot",28,22],["dot",72,22],["dot",28,50],["dot",72,50],["dot",28,78],["dot",72,78]]
};
const LINE_PATTERNS={
  1:[["v",50,50]],
  2:[["v",25,50],["v",75,50]],
  3:[["v",50,18],["v",25,75],["v",75,75]],
  4:[["v",25,25],["v",75,25],["v",25,75],["v",75,75]],
  5:[["v",25,18],["v",75,18],["v",50,50],["v",25,82],["v",75,82]],
  6:[["v",17,28],["v",50,28],["v",83,28],["v",17,72],["v",50,72],["v",83,72]]
};
const SAMN_PERELLI=[
  [7,"Full alert, wide awake"],
  [6,"Very lively, responsive, but not at peak"],
  [5,"Okay, about normal"],
  [4,"Less than sharp, let down"],
  [3,"Feeling dull, losing focus"],
  [2,"Very difficult to concentrate, groggy"],
  [1,"Unable to function, ready to drop"]
];

// ─── Settings ───
function loadSettings(){
  const s=JSON.parse(localStorage.getItem("cogspeed_v18_settings")||"null");
  if(!s) return {...DEFAULTS};
  const m={...DEFAULTS};
  Object.keys(DEFAULTS).forEach(k=>{ if(s[k]!==undefined) m[k]=s[k]; });
  return m;
}
function saveSettings(){ localStorage.setItem("cogspeed_v18_settings",JSON.stringify(settings)); }
let settings=loadSettings();

// ─── State ───
const state={
  phase:"idle", duration:null, blockDuration:null,
  current:null, previous:null, unresolvedStreak:0,
  overloads:[], recoveries:[], recoveryCorrectCompleted:0,
  spCorrectStreak:0, spWrongCount:0, terminalBlockReason:null,
  history:JSON.parse(localStorage.getItem("cogspeed_v18_history")||"[]"),
  totalTrials:0, totalResponses:0, totalCorrect:0, totalIncorrect:0,
  missedTrials:0, pacedErrors:0, recoveryErrors:0, rollMeanLog:[],
  testStartTime:null, trialTimer:null, absoluteNoResponseTimer:null, maxTestTimer:null,
  lastFiveAnswers:[], samnPerelli:null, subjectId:null,
  calibrationTrialIndex:0, calibrationRTs:[], calibrationErrors:0,
  pacedRTs:[], rtLog:[], previousMissed:false, lastFrameDuration:null,
  trialOpenedAt:null, geo:null, benchmark:null, lastResultText:null
};

// ─── DOM ───
const $=id=>document.getElementById(id);
const stimGrid=$("stimGrid"), probeCell=$("probeCell"), probeInner=$("probeInner"),
      respGrid=$("respGrid"), rateOut=$("rateOut"), blocksOut=$("blocksOut"),
      recoveryOut=$("recoveryOut"), wrongOut=$("wrongOut"), fatigueOut=$("fatigueOut"),
      cpsOut=$("cpsOut"), statusLine=$("statusLine"), resultBox=$("resultBox"),
      phaseLabel=$("phaseLabel"), modeLabel=$("modeLabel"), metricsPanel=$("metricsPanel");
let deferredPrompt=null;

// ─── Utilities ───
function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function clamp(v,lo,hi){ return Math.min(hi,Math.max(lo,v)); }
function mean(a){ return a.length?a.reduce((x,y)=>x+y,0)/a.length:0; }
function stdDev(a){ if(a.length<2) return null; const m=mean(a); return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/(a.length-1)); }
function shuffle(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]; } return a; }
function subjectKey(id){ return id==="0"?"Guest":id; }
function setStatus(m){ statusLine.textContent=m; }
function formatDuration(ms){ if(ms==null) return "—"; const s=Math.round(ms/1000),m=Math.floor(s/60); return m>0?`${m}m ${s%60}s`:`${s}s`; }

// ─── CPS ───
function computeCPS(avgMs){
  const best=Number(settings.cpsBestMs),worst=Number(settings.cpsWorstMs),span=worst-best;
  if(!isFinite(best)||!isFinite(worst)||span<=0) return 0;
  return Math.max(0,Math.min(100,((worst-avgMs)/span)*100));
}
function updateCPSDisplay(avg){ cpsOut.textContent=avg!=null?computeCPS(avg).toFixed(0):"—"; }

// ─── Timers ───
function clearTimer(){ if(state.trialTimer) clearTimeout(state.trialTimer); state.trialTimer=null; }
function clearNoResponseTimer(){ if(state.absoluteNoResponseTimer) clearTimeout(state.absoluteNoResponseTimer); state.absoluteNoResponseTimer=null; }
function clearMaxTestTimer(){ if(state.maxTestTimer) clearTimeout(state.maxTestTimer); state.maxTestTimer=null; }
function armNoResponseTimer(){
  clearNoResponseTimer();
  state.absoluteNoResponseTimer=setTimeout(()=>{ state.endReason=`No response for ${settings.noResponseTimeoutMs}ms`; finish(); },settings.noResponseTimeoutMs);
}
function armMaxTestTimer(){
  clearMaxTestTimer();
  const ms=Number(settings.maxTestDurationMs)||120000;
  state.maxTestTimer=setTimeout(()=>{ state.endReason=`Max test time reached (${(ms/1000).toFixed(0)}s)`; finish(); },ms);
}
function noteAnyResponse(){ armNoResponseTimer(); }

// ─── Quiet mode ───
function setTestingQuiet(q){
  // Test screen is gears-only — nothing to show/hide during test
  if(resultBox) resultBox.classList.add("hidden");
}

// ─── Geo (fire and forget) ───
async function captureGeo(){
  const now=new Date();
  const base={local_time:now.toLocaleString(),gmt_time:now.toUTCString(),date_iso:now.toISOString()};
  if(!navigator.geolocation){ state.geo={...base,status:"unavailable"}; return; }
  const pos=await new Promise(r=>navigator.geolocation.getCurrentPosition(r,()=>r(null),{enableHighAccuracy:true,timeout:7000,maximumAge:0}));
  if(!pos){ state.geo={...base,status:"denied"}; return; }
  state.geo={...base,status:"ok",latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy_m:pos.coords.accuracy};
  try{
    const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`,{headers:{"Accept":"application/json"}});
    const d=await r.json(); state.geo.address=d.display_name||"";
  }catch(e){ state.geo.address_error="geocode_failed"; }
}

// ─── SVG rendering ───
function patternToSVG(pattern,size="large"){
  const dim=size==="probe"?72:size==="small"?40:56;
  const dotR=size==="probe"?8:size==="small"?5:7;
  const lw=size==="probe"?10:size==="small"?6:9;
  const lh=size==="probe"?26:size==="small"?15:22;
  const marks=pattern.map(([k,x,y])=>{
    const px=(x/100)*dim,py=(y/100)*dim;
    return k==="dot"
      ?`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${dotR}" fill="var(--text)"/>`
      :`<rect x="${(px-lw/2).toFixed(1)}" y="${(py-lh/2).toFixed(1)}" width="${lw}" height="${lh}" rx="2" fill="var(--text)"/>`;
  }).join("");
  return `<svg width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}" xmlns="http://www.w3.org/2000/svg">${marks}</svg>`;
}

// ─── Trial generation ───
function makeTrial(kind,lastCorrectPos,lastProbe){
  for(let attempt=0;attempt<500;attempt++){
    const probeFamily=Math.random()<0.5?"dots":"lines";
    const probeCount=randInt(1,6);
    // Reject if same probe as previous trial (subject can't tell a new trial started)
    if(lastProbe&&probeFamily===lastProbe.family&&probeCount===lastProbe.count) continue;
    const probePattern=probeFamily==="dots"?DOT_PATTERNS[probeCount]:LINE_PATTERNS[probeCount];
    const oppFamily=probeFamily==="dots"?"lines":"dots";
    const correctPos=(()=>{
      if(lastCorrectPos==null) return randInt(0,5);
      let p,t=0; do{ p=randInt(0,5);t++; }while(p===lastCorrectPos&&t<20); return p;
    })();
    const counts=shuffle([1,2,3,4,5,6]);
    const ei=counts.indexOf(probeCount);
    [counts[correctPos],counts[ei]]=[counts[ei],counts[correctPos]];
    const families=[];
    for(let i=0;i<6;i++){
      if(i===correctPos){ families.push(oppFamily); }
      else{ families.push(counts[i]===probeCount?probeFamily:(Math.random()<0.5?"dots":"lines")); }
    }
    const topItems=counts.map((c,i)=>({ count:c,family:families[i],pattern:families[i]==="dots"?DOT_PATTERNS[c]:LINE_PATTERNS[c] }));
    const correct=topItems.filter(x=>x.count===probeCount&&x.family===oppFamily);
    if(correct.length!==1) continue;
    if(topItems[correctPos].count!==probeCount||topItems[correctPos].family!==oppFamily) continue;
    if(correctPos===lastCorrectPos) continue;
    return { kind,probePattern,probeCount,probeFamily,topItems,correctPos,resolved:false };
  }
  throw new Error("makeTrial: could not generate valid trial after 500 attempts");
}


// ── 7 unique realistic mechanical cog definitions ──
// 0=probe, 1-6=cell/button pairs. Flat-topped teeth, proper gear geometry.
// Colors: near-black → dark gray → medium gray → light silver
const GEARS=[
  // 0: PROBE — 20 teeth, dark navy-steel, blue accent
  {n:20,rP:36,add:7,ded:5,tf:0.44,body:"#1a2430",stroke:"#5ab0e0",rim:"#7fd7ff",hub:9,hFill:"#0e1820",hStroke:"#9ae0ff",spokes:5},
  // 1: 10 teeth, near-black iron
  {n:10,rP:37,add:8,ded:6,tf:0.46,body:"#1a1a1a",stroke:"#404040",rim:"#505050",hub:8,hFill:"#0e0e0e",hStroke:"#505050",spokes:0},
  // 2: 14 teeth, dark charcoal
  {n:14,rP:36,add:7,ded:5,tf:0.45,body:"#2e2e2e",stroke:"#505050",rim:"#606060",hub:7,hFill:"#1e1e1e",hStroke:"#606060",spokes:3},
  // 3: 12 teeth, medium-dark steel
  {n:12,rP:37,add:7,ded:5,tf:0.46,body:"#484848",stroke:"#686868",rim:"#787878",hub:8,hFill:"#303030",hStroke:"#787878",spokes:0},
  // 4: 16 teeth, medium gray
  {n:16,rP:36,add:6,ded:5,tf:0.44,body:"#686868",stroke:"#888888",rim:"#989898",hub:7,hFill:"#484848",hStroke:"#989898",spokes:4},
  // 5: 11 teeth, light steel
  {n:11,rP:37,add:8,ded:5,tf:0.46,body:"#909090",stroke:"#b0b0b0",rim:"#c0c0c0",hub:8,hFill:"#686868",hStroke:"#c0c0c0",spokes:0},
  // 6: 18 teeth, bright silver
  {n:18,rP:36,add:6,ded:5,tf:0.44,body:"#b8b8b8",stroke:"#d0d0d0",rim:"#e0e0e0",hub:7,hFill:"#909090",hStroke:"#e8e8e8",spokes:3},
];

// Build realistic gear path: flat-topped teeth with root/tip circular arcs
function gearPath(cx,cy,nT,rP,add,ded,tf){
  const Ra=rP+add, Rd=rP-ded;
  const ap=(2*Math.PI)/nT, ta=ap*(tf||0.46), ga=ap-ta, ch=ap*0.028;
  const parts=[];
  for(let i=0;i<nT;i++){
    const base=i*ap-Math.PI/2;
    const gS=base, gE=base+ga, tE=gE+ta;
    const c=Math.cos, s=Math.sin;
    const rx0=(cx+Rd*c(gS)).toFixed(2), ry0=(cy+Rd*s(gS)).toFixed(2);
    if(i===0) parts.push(`M${rx0},${ry0}`); else parts.push(`L${rx0},${ry0}`);
    parts.push(`A${Rd.toFixed(2)},${Rd.toFixed(2)} 0 0,1 ${(cx+Rd*c(gE)).toFixed(2)},${(cy+Rd*s(gE)).toFixed(2)}`);
    parts.push(`L${(cx+Ra*c(gE+ch)).toFixed(2)},${(cy+Ra*s(gE+ch)).toFixed(2)}`);
    parts.push(`A${Ra.toFixed(2)},${Ra.toFixed(2)} 0 0,1 ${(cx+Ra*c(tE-ch)).toFixed(2)},${(cy+Ra*s(tE-ch)).toFixed(2)}`);
    parts.push(`L${(cx+Rd*c(tE)).toFixed(2)},${(cy+Rd*s(tE)).toFixed(2)}`);
  }
  parts.push("Z");
  return parts.join(" ");
}

function buildGearSVG(si,pattern,size,spinClass){
  const g=GEARS[si];
  const uid=si+"_"+(Math.random()*9999|0).toString(36);
  const cx=50,cy=50;
  const path=gearPath(cx,cy,g.n,g.rP,g.add,g.ded,g.tf);
  const lgt=lighten(g.body,30), drk=darken(g.body,10);
  // Spokes
  let spokes="";
  if(g.spokes>0){
    const rI=g.hub+2, rO=g.rP-g.ded-5;
    for(let i=0;i<g.spokes;i++){
      const a=(i/g.spokes)*Math.PI*2-Math.PI/2;
      spokes+=`<line x1="${(cx+rI*Math.cos(a)).toFixed(1)}" y1="${(cy+rI*Math.sin(a)).toFixed(1)}" x2="${(cx+rO*Math.cos(a)).toFixed(1)}" y2="${(cy+rO*Math.sin(a)).toFixed(1)}" stroke="${g.stroke}" stroke-width="3" stroke-linecap="round"/>`;
    }
  }
  const ringR=g.rP-g.ded-3;
  // Pattern marks — fill inside gear body
  let marks="";
  if(pattern){
    const iR=(g.rP-g.ded-4)*0.72;
    const dotR=size==="probe"?6:5, lw=size==="probe"?9:7, lh=size==="probe"?14:10;
    marks=pattern.map(([k,px,py])=>{
      const ix=cx+(px/100-0.5)*iR*1.95, iy=cy+(py/100-0.5)*iR*1.95;
      if(k==="dot") return `<circle cx="${ix.toFixed(1)}" cy="${iy.toFixed(1)}" r="${dotR}" fill="white" opacity="0.95"/>`;
      return `<rect x="${(ix-lw/2).toFixed(1)}" y="${(iy-lh/2).toFixed(1)}" width="${lw}" height="${lh}" rx="2.5" fill="white" opacity="0.95"/>`;
    }).join("");
  }
  const sc=spinClass||"";
  return `<svg class="${sc}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;width:100%;height:100%">
  <defs>
    <radialGradient id="rg${uid}" cx="38%" cy="32%" r="65%">
      <stop offset="0%" stop-color="${lgt}"/>
      <stop offset="100%" stop-color="${drk}"/>
    </radialGradient>
    <!-- hub gradient removed -->
  </defs>
  <g class="g-rot" style="transform-origin:50px 50px">
    <path d="${path}" fill="url(#rg${uid})" stroke="${g.stroke}" stroke-width="0.8"/>
    <!-- inner ring removed -->
    ${spokes}
    <!-- hub removed to avoid obscuring pattern -->
  </g>
  <g class="g-pat">${marks}</g>
</svg>`;
}
function lighten(hex,amt){ const n=parseInt(hex.slice(1),16),r=Math.min(255,(n>>16)+amt),g=Math.min(255,((n>>8)&0xff)+amt),b=Math.min(255,(n&0xff)+amt); return `rgb(${r},${g},${b})`; }
function darken(hex,amt){ const n=parseInt(hex.slice(1),16),r=Math.max(0,(n>>16)-amt),g=Math.max(0,((n>>8)&0xff)-amt),b=Math.max(0,(n&0xff)-amt); return `rgb(${r},${g},${b})`; }

function lighten(hex, amt) {
  const n = parseInt(hex.slice(1),16);
  const r = Math.min(255,(n>>16)+amt), g = Math.min(255,((n>>8)&0xff)+amt), b = Math.min(255,(n&0xff)+amt);
  return `rgb(${r},${g},${b})`;
}
function darken(hex, amt) {
  const n = parseInt(hex.slice(1),16);
  const r = Math.max(0,(n>>16)-amt), g = Math.max(0,((n>>8)&0xff)-amt), b = Math.max(0,(n&0xff)-amt);
  return `rgb(${r},${g},${b})`;
}
// ─── Render trial (gear version) ───
function renderTrial(trial){
  const ts=$("testScreen"); if(ts) ts.classList.remove("hidden");
  stimGrid.innerHTML="";
  for(let i=0;i<6;i++){
    const cell=document.createElement("div");
    cell.className="stim-cell";
    const lbl=document.createElement("div"); lbl.className="cell-label"; lbl.textContent=String(i+1);
    cell.appendChild(lbl);
    cell.innerHTML+=buildGearSVG(i+1,trial.topItems[i].pattern,"large",""); // no rotation during test
    stimGrid.appendChild(cell);
  }
  // Clear ALL spin/animation classes before rendering probe
  probeCell.classList.remove("idle","gspin-f","gspin-r","gidle-f","gidle-r");
  probeInner.innerHTML=buildGearSVG(0,trial.probePattern,"probe",""); // no rotation during test
  respGrid.innerHTML="";
  for(let i=0;i<6;i++){
    const btn=document.createElement("div"); btn.className="resp-btn";
    const pos=document.createElement("div"); pos.className="resp-pos"; pos.textContent=String(i+1);
    btn.appendChild(pos);
    btn.innerHTML+=buildGearSVG(i+1,null,"large",""); // no rotation during test
    const idx=i;
    btn.addEventListener("pointerdown",()=>handleTap(idx));
    respGrid.appendChild(btn);
  }
}
function flashBtn(index,ok){
  const btns=respGrid.querySelectorAll(".resp-btn");
  if(!btns[index]) return;
  const cls=ok?"correct-flash":"wrong-flash";
  btns[index].classList.add(cls);
  setTimeout(()=>btns[index].classList.remove(cls),200);
}
function setProbeIdle(){
  probeCell.classList.add("idle");
  probeInner.innerHTML="";
  stimGrid.innerHTML="";
  respGrid.innerHTML="";
}

// ─── Metrics ───
function updateMetrics(){
  rateOut.textContent=state.duration?`${Math.round(state.duration)}ms`:"—";
  blocksOut.textContent=String(state.overloads.length);
  recoveryOut.textContent=String(state.recoveries.length);
  wrongOut.textContent=String(state.lastFiveAnswers.filter(v=>v===false).length+state.calibrationErrors);
  fatigueOut.textContent=state.samnPerelli?String(state.samnPerelli.score):"—";
}

// ─── Trial log ───
function logTrial({phase,rt,outcome,responseIndex}){
  const trial=state.current; if(!trial) return;
  const ci=trial.topItems[trial.correctPos];
  const ri=responseIndex!=null?trial.topItems[responseIndex]:null;
  state.rtLog.push({
    seq:state.rtLog.length+1, phase, clockTime:new Date().toISOString(),
    durationMs:state.duration?Math.round(state.duration):null,
    rt:rt!=null?Math.round(rt):null, outcome,
    probe:`${trial.probeFamily}:${trial.probeCount}`,
    correctCell:ci?`${ci.family}:${ci.count} @${trial.correctPos+1}`:"—",
    response:ri?`${ri.family}:${ri.count} @${responseIndex+1}`:(responseIndex!=null?`pos${responseIndex+1}`:"no_response")
  });
}

// ─── Answer recording ───
function trialMatches(trial,index){ return trial&&index===trial.correctPos; }
function recordAnswer(ok,isMiss){
  if(!isMiss){
    state.lastFiveAnswers.push(ok);
    if(state.lastFiveAnswers.length>settings.wrongWindowSize) state.lastFiveAnswers.shift();
    state.rollMeanLog.push(ok);
    const win=Math.max(1,Math.round(Number(settings.rollMeanWindow)||8));
    if(state.rollMeanLog.length>win) state.rollMeanLog.shift();
    if(state.rollMeanLog.length===win){
      const ratio=state.rollMeanLog.filter(v=>v===true).length/win;
      if(ratio<0.70){ state.endReason=`Rolling accuracy below 70% (${(ratio*100).toFixed(0)}%)`; finish(); return true; }
    }
    const wc=state.lastFiveAnswers.filter(v=>v===false).length;
    if(state.lastFiveAnswers.length===settings.wrongWindowSize&&wc>settings.wrongThresholdStop){
      state.endReason=`Too many wrong (${wc}/${settings.wrongWindowSize})`; finish(); return true;
    }
  }
  updateMetrics(); return false;
}
function avgLast2Blocks(){
  if(state.overloads.length<2) return null;
  return(state.overloads[state.overloads.length-1]+state.overloads[state.overloads.length-2])/2;
}
function maybeTriggerTerminalRule(){
  if(state.overloads.length<2) return false;
  const n=state.overloads.length,b1=state.overloads[n-2],b2=state.overloads[n-1],diff=Math.abs(b2-b1);
  if(diff<settings.qualifyingBlockGapMs){
    state.terminalBlockReason=`Blocks ${n-1}&${n} within ${settings.qualifyingBlockGapMs}ms (${b1.toFixed(0)}ms,${b2.toFixed(0)}ms,diff=${diff.toFixed(0)}ms)`;
    state.phase="terminal_recovery"; state.recoveryCorrectCompleted=0; state.spCorrectStreak=0; state.spWrongCount=0;
    openTrial("terminal_recovery"); return true;
  }
  return false;
}
function failCalibration(reason){ state.endReason=reason+" Retest required."; finish(); }
function finishCalibration(){
  const avg=mean(state.calibrationRTs);
  state.duration=clamp(avg*settings.initialPacedPercent,settings.minDurationMs,settings.maxDurationMs);
  state.phase="paced"; state.testStartTime=performance.now();
  armMaxTestTimer();
  setStatus(`Machine-paced start: ${state.duration.toFixed(0)}ms`);
  openTrial("paced");
}

// ─── Pacing ───
function applyPacing(rt,correct){
  if(correct){ const r=rt/state.duration; state.duration=clamp(state.duration+(0.1*r-0.1)*state.duration,settings.minDurationMs,settings.maxDurationMs); }
  else{ state.duration=clamp(state.duration+100,settings.minDurationMs,settings.maxDurationMs); }
}

// ─── Finish ───
function finish(){
  clearTimer(); clearNoResponseTimer(); clearMaxTestTimer();
  state.phase="finished";
  const avg2=avgLast2Blocks(), cps=avg2!=null?computeCPS(avg2):null;
  const sd=stdDev(state.pacedRTs);
  const blockDiff=state.overloads.length>=2?state.overloads[state.overloads.length-1]-state.overloads[state.overloads.length-2]:null;
  const testDurMs=state.testStartTime!=null?performance.now()-state.testStartTime:null;
  const result={
    subjectId:subjectKey(state.subjectId||"0"),
    samnPerelli:state.samnPerelli,
    calibrationAverageMs:state.calibrationRTs.length?mean(state.calibrationRTs):null,
    blocks:[...state.overloads], blockCount:state.overloads.length,
    averageLast2BlockingScoresMs:avg2, blockScoreDifferenceMs:blockDiff,
    cognitivePerformanceScore:cps, totalResponses:state.totalResponses,
    totalTrials:state.totalTrials, totalCorrect:state.totalCorrect,
    totalIncorrect:state.totalIncorrect, missedTrials:state.missedTrials,
    pacedErrors:state.pacedErrors, recoveryErrors:state.recoveryErrors, pacedResponseCount:state.pacedRTs.length,
    pacedResponseMeanMs:state.pacedRTs.length?mean(state.pacedRTs):null,
    pacedResponseSdMs:sd, testDurationMs:testDurMs,
    rtLog:[...state.rtLog], endReason:state.endReason||"Run complete",
    time:new Date().toISOString(), geo:state.geo
  };
  state.history.push(result);
  localStorage.setItem("cogspeed_v18_history",JSON.stringify(state.history));
  updateCPSDisplay(avg2); setProbeIdle();
  // Build the display text (also used for email)
  buildSummary(result);
  state.lastResultText = $("summaryText") ? $("summaryText").textContent : "";
  showResultsPage();
}

// ─── Open trial ───
function openTrial(kind){
  clearTimer();
  state.previous=state.current;
  const lastPos=state.current?state.current.correctPos:null;
  const lastProbe=state.current?{family:state.current.probeFamily,count:state.current.probeCount}:null;
  state.current=makeTrial(kind,lastPos,lastProbe);
  state.hadResponse=false;
  state.trialOpenedAt=performance.now();
  renderTrial(state.current);
  updateMetrics();
  if(kind==="calibration"){
    const idx=state.calibrationTrialIndex+1,total=settings.initialUnusedCalibrationTrials+settings.initialMeasuredCalibrationTrials;
    phaseLabel.textContent=`Cal ${idx}/${total}`;
    setStatus(idx<=settings.initialUnusedCalibrationTrials?"Self-paced (unused)":"Self-paced (measured)");
  }else if(kind==="paced"){
    phaseLabel.textContent=`Paced · ${Math.round(state.duration)}ms`;
    setStatus("Machine-paced");
    state.trialTimer=setTimeout(onPacedFrameEnd,state.duration);
  }else if(kind==="recovery"){
    phaseLabel.textContent=`SP Restart ${state.spCorrectStreak}✓ ${state.spWrongCount}✗`;
    setStatus(`SP Restart — need ${settings.spRestartCorrectStreak} correct in a row`);
  }else if(kind==="terminal_recovery"){
    phaseLabel.textContent=`Final SP ${state.recoveryCorrectCompleted+1}/${settings.spRestartCorrectStreak}`;
    setStatus("Final self-paced recovery");
  }
}

// ─── Paced frame end ───
function onPacedFrameEnd(){
  if(state.phase!=="paced") return;
  state.totalTrials+=1;
  // True miss = no tap at all. Wrong tap = had response but unresolved.
  // Only true misses count toward block threshold.
  const truelyMissed=state.current&&!state.current.resolved&&!state.hadResponse;
  const wrongAndUnresolved=state.current&&!state.current.resolved&&state.hadResponse;
  if(truelyMissed){
    logTrial({phase:"missed",rt:null,outcome:"missed",responseIndex:null});
    state.missedTrials+=1; state.previousMissed=true; state.lastFrameDuration=state.duration;
    if(recordAnswer(false,true)) return;
  }else{ state.previousMissed=false; state.lastFrameDuration=null; }
  // Wrong responses reset the miss streak (subject DID respond, just incorrectly)
  state.unresolvedStreak=truelyMissed?state.unresolvedStreak+1:0;
  if(state.unresolvedStreak>=settings.consecutiveMissesForBlock){
    state.blockDuration=state.duration; state.overloads.push(state.blockDuration);
    state.unresolvedStreak=0; state.previousMissed=false; state.lastFrameDuration=null;
    updateCPSDisplay(avgLast2Blocks());
    if(maybeTriggerTerminalRule()) return;
    state.phase="recovery"; state.recoveryCorrectCompleted=0; state.spCorrectStreak=0; state.spWrongCount=0;
    openTrial("recovery"); return;
  }
  if(state.totalTrials>=settings.maxTrialCount){ state.endReason=`Trial cap (${settings.maxTrialCount})`; finish(); }
  else openTrial("paced");
}

// ─── Handle tap ───
function handleTap(index){
  if(!["calibration","paced","recovery","terminal_recovery"].includes(state.phase)) return;
  noteAnyResponse();

  // Calibration
  if(state.phase==="calibration"){
    const rt=performance.now()-state.trialOpenedAt, ok=trialMatches(state.current,index);
    flashBtn(index,ok); state.totalResponses+=1;
    if(ok) state.totalCorrect+=1; else state.totalIncorrect+=1;
    logTrial({phase:"calibration",rt,outcome:ok?"correct":"wrong",responseIndex:index});
    if(!ok){
      state.calibrationErrors+=1; updateMetrics();
      if(state.calibrationErrors>settings.calibrationStopErrors){ failCalibration(`>${settings.calibrationStopErrors} calibration errors.`); return; }
    }else{
      if(rt>settings.calibrationStopSlowMs){ failCalibration(`Calibration RT exceeded ${settings.calibrationStopSlowMs}ms.`); return; }
      if(state.calibrationTrialIndex>=settings.initialUnusedCalibrationTrials) state.calibrationRTs.push(rt);
    }
    state.calibrationTrialIndex+=1;
    if(state.calibrationTrialIndex>=settings.initialUnusedCalibrationTrials+settings.initialMeasuredCalibrationTrials) finishCalibration();
    else openTrial("calibration");
    return;
  }

  // Recovery (SP Restart)
  if(state.phase==="recovery"){
    clearTimer();
    const rt=performance.now()-state.trialOpenedAt, ok=trialMatches(state.current,index);
    flashBtn(index,ok); state.totalResponses+=1;
    if(ok) state.totalCorrect+=1; else state.totalIncorrect+=1;
    logTrial({phase:"recovery",rt,outcome:ok?"correct":"wrong",responseIndex:index});
    if(ok){
      state.spCorrectStreak+=1; state.current.resolved=true;
      const need=Math.max(1,Number(settings.spRestartCorrectStreak)||2);
      if(state.spCorrectStreak>=need){
        const slower=clamp(state.blockDuration+(Number(settings.spRestartSlowerByMs)||375),settings.minDurationMs,settings.maxDurationMs);
        state.recoveries.push(slower); state.phase="paced"; state.duration=slower;
        state.spCorrectStreak=0; state.spWrongCount=0;
        setStatus(`SP Restart passed — resuming at ${slower.toFixed(0)}ms`);
        setTimeout(()=>openTrial("paced"),180);
      }else{
        setStatus(`SP Restart: ${state.spCorrectStreak}/${need} correct`);
        setTimeout(()=>openTrial("recovery"),160);
      }
    }else{
      state.spCorrectStreak=0; state.spWrongCount+=1; state.recoveryErrors+=1;
      const limit=Math.max(1,Number(settings.spRestartWrongLimit)||3);
      if(state.spWrongCount>=limit){ state.endReason=`SP Restart failed: ${limit} wrong before ${settings.spRestartCorrectStreak} correct in a row`; finish(); return; }
      setStatus(`SP Restart: ${state.spWrongCount}/${limit} wrong`);
      setTimeout(()=>openTrial("recovery"),160);
    }
    recordAnswer(ok); return;
  }

  // Terminal recovery
  if(state.phase==="terminal_recovery"){
    clearTimer();
    const rt=performance.now()-state.trialOpenedAt, ok=trialMatches(state.current,index);
    flashBtn(index,ok); state.totalResponses+=1;
    if(ok) state.totalCorrect+=1; else state.totalIncorrect+=1;
    logTrial({phase:"terminal_recovery",rt,outcome:ok?"correct":"wrong",responseIndex:index});
    if(recordAnswer(ok)) return;
    if(ok){
      state.current.resolved=true; state.recoveryCorrectCompleted+=1;
      const need=Math.max(1,Number(settings.spRestartCorrectStreak)||2);
      if(state.recoveryCorrectCompleted>=need){ state.endReason=`Convergent blocks — ${state.terminalBlockReason||"2 consecutive blocks within threshold"}. Completed ${need} final trials.`; finish(); return; }
      setTimeout(()=>openTrial("terminal_recovery"),160);
    }else setTimeout(()=>openTrial("terminal_recovery"),160);
    return;
  }

  // Paced
  const rt=performance.now()-state.trialOpenedAt;
  if(state.previousMissed&&rt<600){
    const correctForLast=state.previous&&!state.previous.resolved&&trialMatches(state.previous,index);
    state.totalResponses+=1; state.previousMissed=false; state.lastFrameDuration=null;
    // Subject responded during this frame — mark it so the current trial is NOT a true miss
    state.hadResponse=true;
    if(correctForLast){
      state.previous.resolved=true; const eRT=rt+(state.lastFrameDuration||state.duration);
      applyPacing(eRT,true); state.totalCorrect+=1; state.pacedRTs.push(rt);
      logTrial({phase:"paced_late_correct",rt,outcome:"correct",responseIndex:index}); flashBtn(index,true);
      if(recordAnswer(true)) return;
    }else{
      applyPacing(null,false); state.totalIncorrect+=1; state.pacedErrors+=1;
      logTrial({phase:"paced_late_wrong",rt,outcome:"wrong",responseIndex:index}); flashBtn(index,false);
      if(recordAnswer(false)) return;
    }
    return;
  }
  state.previousMissed=false; state.lastFrameDuration=null; state.lastProbe=null;
  if(state.current&&!state.current.resolved&&trialMatches(state.current,index)){
    state.current.resolved=true; state.totalResponses+=1; state.totalCorrect+=1;
    applyPacing(rt,true); state.pacedRTs.push(rt);
    logTrial({phase:"paced",rt,outcome:"correct",responseIndex:index}); flashBtn(index,true);
    if(recordAnswer(true)) return; return;
  }
  state.hadResponse=true;
  state.totalResponses+=1; state.totalIncorrect+=1; state.pacedErrors+=1;
  applyPacing(null,false);
  logTrial({phase:"paced_wrong",rt:performance.now()-state.trialOpenedAt,outcome:"wrong",responseIndex:index});
  flashBtn(index,false); recordAnswer(false);
}

// ─── Refresher ───
function renderRefresher(){
  const grid=$("refresherGrid"); grid.innerHTML="";
  for(let i=1;i<=6;i++){
    const c=document.createElement("div"); c.className="ref-card";
    c.innerHTML=`<div class="ref-num">${i}</div><div class="ref-row"><div><div class="ref-lbl">dots</div>${patternToSVG(DOT_PATTERNS[i],"small")}</div><div class="ref-arrow">↔</div><div><div class="ref-lbl">lines</div>${patternToSVG(LINE_PATTERNS[i],"small")}</div></div>`;
    grid.appendChild(c);
  }
}

// ─── Fatigue checklist ───
function renderFatigueChecklist(){
  const f=$("fatigueList"); f.innerHTML="";
  f.style.cssText="display:flex;flex-direction:column;gap:8px;flex:1";
  for(const [score,label] of SAMN_PERELLI){
    const b=document.createElement("button"); b.className="fatigue-item";
    b.style.cssText="flex:1;font-size:18px;font-weight:600;padding:0 18px;display:flex;align-items:center;gap:14px;min-height:52px";
    const num=document.createElement("span");
    num.style.cssText="font-size:28px;font-weight:900;color:var(--accent);min-width:32px;text-align:center;flex-shrink:0";
    num.textContent=String(score);
    const txt=document.createElement("span"); txt.textContent=label;
    b.appendChild(num); b.appendChild(txt);
    b.onclick=()=>{
      f.querySelectorAll(".fatigue-item").forEach(el=>el.style.background="");
      b.style.background="rgba(0,180,255,0.22)";
      state.samnPerelli={score,label}; fatigueOut.textContent=String(score);
      setStatus(`SP-FS: ${score} — ${label}`);
      const sb=$("fatigueStartBtn"); if(sb) sb.classList.remove("hidden");
    };
    f.appendChild(b);
  }
}

// ─── Admin ───
function renderAdmin(){
  const w=$("adminSettings"); w.innerHTML="";
  for(const [k,l,t] of ADMIN_FIELDS){
    const r=document.createElement("div");
    r.style.cssText="display:grid;grid-template-columns:1fr 140px;gap:8px;align-items:center;margin-bottom:8px";
    r.innerHTML=`<label style="font-size:14px;color:var(--text)">${l}<div style="font-size:11px;color:var(--muted)">${k}</div></label><input id="adm_${k}" type="${t}" value="${settings[k]}" style="padding:9px;border:1px solid var(--edge);border-radius:10px;background:#0a1629;color:var(--text);font-size:14px;width:100%">`;
    w.appendChild(r);
  }
  renderHistoryGraphs();
}
function readAdmin(){ for(const [k,,t] of ADMIN_FIELDS){ const el=$("adm_"+k); if(el) settings[k]=t==="number"?Number(el.value):el.value; } }
function resetAdmin(){ settings={...DEFAULTS}; saveSettings(); renderAdmin(); }

// ─── Charts ───
function drawCombinedChart(canvas,hist){
  if(!canvas) return;
  const ctx=canvas.getContext("2d"),W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle="#081321"; ctx.fillRect(0,0,W,H);
  const PAD={top:32,right:52,bottom:38,left:48},cW=W-PAD.left-PAD.right,cH=H-PAD.top-PAD.bottom;
  if(!hist.length){ ctx.fillStyle="#d7e7f8"; ctx.font="bold 13px sans-serif"; ctx.textAlign="center"; ctx.fillText("No data yet",W/2,H/2); return; }
  const slice=hist.slice(-20),n=slice.length,xStep=n>1?cW/(n-1):cW;
  const cpsVals=slice.map(x=>x.cognitivePerformanceScore??null);
  const blockVals=slice.map(x=>x.averageLast2BlockingScoresMs??null);
  const spfVals=slice.map(x=>x.samnPerelli?x.samnPerelli.score:null);
  const bValid=blockVals.filter(v=>v!=null);
  const bMax=bValid.length?Math.ceil(Math.max(...bValid)/500)*500||3000:3000;
  const bMin=bValid.length?Math.max(0,Math.floor(Math.min(...bValid)/500)*500):0;
  function yL(v,lo,hi){ return PAD.top+cH-((v-lo)/((hi-lo)||1))*cH; }
  function xO(i){ return PAD.left+(n>1?i*xStep:cW/2); }
  ctx.strokeStyle="rgba(79,111,153,0.25)"; ctx.lineWidth=1;
  [0,25,50,75,100].forEach(v=>{ const y=yL(v,0,100); ctx.beginPath(); ctx.moveTo(PAD.left,y); ctx.lineTo(PAD.left+cW,y); ctx.stroke(); });
  ctx.font="10px sans-serif"; ctx.fillStyle="#7fd7ff"; ctx.textAlign="right";
  [0,25,50,75,100].forEach(v=>ctx.fillText(String(v),PAD.left-4,yL(v,0,100)+4));
  ctx.fillStyle="#ff9f40"; ctx.textAlign="left";
  for(let t=0;t<=5;t++){ const v=bMin+(t/5)*(bMax-bMin); ctx.fillText(v>=1000?(v/1000).toFixed(1)+"s":Math.round(v)+"ms",PAD.left+cW+4,PAD.top+cH-(t/5)*cH+4); }
  ctx.fillStyle="#7fa0c0"; ctx.font="10px sans-serif"; ctx.textAlign="center";
  for(let i=0;i<n;i++) ctx.fillText(String(i+1),xO(i),PAD.top+cH+14);
  function drawSeries(vals,toY,color){
    ctx.strokeStyle=color; ctx.lineWidth=2.2; ctx.beginPath(); let started=false;
    vals.forEach((v,i)=>{ if(v==null){started=false;return;} const x=xO(i),y=toY(v); if(!started){ctx.moveTo(x,y);started=true;}else ctx.lineTo(x,y); });
    ctx.stroke();
    vals.forEach((v,i)=>{ if(v==null) return; ctx.fillStyle=color; ctx.beginPath(); ctx.arc(xO(i),toY(v),3.5,0,Math.PI*2); ctx.fill(); ctx.font="9px sans-serif"; ctx.textAlign="center"; ctx.fillText(v>100?(v/1000).toFixed(1)+"s":v.toFixed(0),xO(i),toY(v)-6); ctx.textAlign="left"; });
  }
  function blockToY(v){ return PAD.top+cH-((v-bMin)/((bMax-bMin)||1))*cH; }
  function spfToY(v){ return yL(v,1,7); }
  drawSeries(blockVals,blockToY,"#ff9f40");
  drawSeries(cpsVals,v=>yL(v,0,100),"#7fd7ff");
  drawSeries(spfVals,spfToY,"#88ff88");
  ctx.fillStyle="#7fd7ff"; ctx.font="bold 9px sans-serif"; ctx.textAlign="left"; ctx.fillText("■ CPS",PAD.left,PAD.top-4);
  ctx.fillStyle="#ff9f40"; ctx.fillText("■ Block ms",PAD.left+50,PAD.top-4);
  ctx.fillStyle="#88ff88"; ctx.fillText("■ S-PF",PAD.left+110,PAD.top-4);
}
function renderHistoryGraphs(){
  drawCombinedChart($("resultsHistChart"),state.history);
  // adminHistChart removed — history now in historyOverlay
}

// ─── RT scatter chart ───
function drawRTScatterChart(canvas,rtLog,blocks,meanRT,sdRT){
  if(!canvas||!rtLog.length) return;
  const ctx=canvas.getContext("2d"),W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle="#081321"; ctx.fillRect(0,0,W,H);
  const PAD={top:20,right:20,bottom:30,left:48},cW=W-PAD.left-PAD.right,cH=H-PAD.top-PAD.bottom;
  const rts=rtLog.filter(e=>e.rt!=null).map(e=>e.rt);
  if(!rts.length) return;
  const maxRT=Math.max(...rts,1000);
  const n=rtLog.length;
  function xO(i){ return PAD.left+(i/(n-1||1))*cW; }
  function yO(v){ return PAD.top+cH-(v/maxRT)*cH; }
  ctx.strokeStyle="rgba(79,111,153,0.2)"; ctx.lineWidth=1;
  [250,500,750,1000].filter(v=>v<=maxRT+100).forEach(v=>{ ctx.beginPath(); ctx.moveTo(PAD.left,yO(v)); ctx.lineTo(PAD.left+cW,yO(v)); ctx.stroke(); ctx.fillStyle="#7fa0c0"; ctx.font="9px sans-serif"; ctx.textAlign="right"; ctx.fillText(`${v}ms`,PAD.left-3,yO(v)+3); });
  const colorMap={correct:"#00ff88",wrong:"#ff4466",missed:"#888",paced:"#00ff88",paced_wrong:"#ff4466","paced_late_correct":"#ffff00","paced_late_wrong":"#ff8800",calibration:"#88aaff",recovery:"#ffaa00",terminal_recovery:"#ff88ff"};
  rtLog.forEach((e,i)=>{
    if(e.rt==null) return;
    ctx.fillStyle=colorMap[e.phase]||colorMap[e.outcome]||"#aaa";
    ctx.beginPath(); ctx.arc(xO(i),yO(e.rt),3,0,Math.PI*2); ctx.fill();
  });
  if(meanRT){ ctx.strokeStyle="rgba(127,215,255,0.6)"; ctx.lineWidth=1.5; ctx.setLineDash([4,3]); ctx.beginPath(); ctx.moveTo(PAD.left,yO(meanRT)); ctx.lineTo(PAD.left+cW,yO(meanRT)); ctx.stroke(); ctx.setLineDash([]); }
  ctx.fillStyle="#7fa0c0"; ctx.font="9px sans-serif"; ctx.textAlign="center"; ctx.fillText("Trial →",PAD.left+cW/2,H-2);
}

// ─── Export / Email ───
function exportResults(){
  const blob=new Blob([JSON.stringify({settings,history:state.history},null,2)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="cogspeed_v18_results.json"; a.click();
}
function emailResults(){
  const last=state.history[state.history.length-1];
  if(!last){ setStatus("No results to email."); return; }
  window.location.href=`mailto:?subject=CogSpeed V18 Results&body=${encodeURIComponent(state.lastResultText||JSON.stringify(last,null,2))}`;
}

// ─── FX (steam + sparks from each gear corner) ───
let _fxRaf=null, _fxParticles=[];
function startFX(){
  const canvas=$("fxCanvas"); if(!canvas) return;
  const ctx=canvas.getContext("2d");
  const box=canvas.parentElement;
  const br=box.getBoundingClientRect();
  const BW=Math.round(br.width), BH=Math.round(br.height);
  // Extend canvas 80px beyond box in all directions
  const O=80;
  canvas.style.position="absolute";
  canvas.style.inset=`-${O}px`;
  canvas.style.width=(BW+O*2)+"px";
  canvas.style.height=(BH+O*2)+"px";
  canvas.style.pointerEvents="none";
  canvas.width=BW+O*2; canvas.height=BH+O*2;
  // Gear corners: O px offset + 14px from box corner
  const GEARS=[
    {x:O+14,    y:O+14},
    {x:O+BW-14, y:O+14},
    {x:O+14,    y:O+BH-14},
    {x:O+BW-14, y:O+BH-14}
  ];
  _fxParticles=[];
  function frame(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    GEARS.forEach(g=>{
      if(Math.random()<0.22){
        const ang=-Math.PI/2+(Math.random()-0.5)*0.8;
        _fxParticles.push({
          x:g.x+(Math.random()-0.5)*8, y:g.y,
          vx:Math.cos(ang)*0.6, vy:Math.sin(ang)*1.2,
          life:1, size:5+Math.random()*4, type:"steam"
        });
      }
      if(Math.random()<0.08){
        const ang=Math.random()*Math.PI*2, spd=1.8+Math.random()*2.2;
        _fxParticles.push({
          x:g.x+(Math.random()-0.5)*6, y:g.y+(Math.random()-0.5)*6,
          vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd,
          life:0.9, type:"spark"
        });
      }
    });
    _fxParticles=_fxParticles.filter(p=>p.life>0);
    _fxParticles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.vx*=0.97; p.vy*=0.97;
      if(p.type==="steam"){
        p.life-=0.008; p.size+=0.5;
        const a=p.life*0.20;
        const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size);
        g.addColorStop(0,`rgba(170,185,210,${a})`);
        g.addColorStop(0.5,`rgba(130,150,180,${a*0.5})`);
        g.addColorStop(1,"rgba(80,100,130,0)");
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
      }else{
        p.life-=0.028;
        ctx.strokeStyle=`hsla(45,90%,${55+p.life*45}%,${p.life*0.7})`;
        ctx.lineWidth=1+p.life; ctx.lineCap="round";
        ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x-p.vx*3,p.y-p.vy*3); ctx.stroke();
      }
    });
    _fxRaf=requestAnimationFrame(frame);
  }
  if(_fxRaf) cancelAnimationFrame(_fxRaf); frame();
}
function stopFX(){ if(_fxRaf){ cancelAnimationFrame(_fxRaf); _fxRaf=null; } }

// ─── Overlay management ───
function hideAllOverlays(){
  ["subjectOverlay","refresherOverlay","fatigueOverlay","tutorialOverlay","adminOverlay","resultsOverlay","summaryOverlay","trialLogOverlay","historyOverlay","thinkingOverlay","outcomeOverlay"].forEach(id=>{ const el=$(id); if(el) el.classList.add("hidden"); });
}
function showOnly(id){
  ["subjectOverlay","refresherOverlay","fatigueOverlay","adminOverlay","resultsOverlay","summaryOverlay","trialLogOverlay","historyOverlay"].forEach(oid=>{ const el=$(oid); if(el) el.classList[oid===id?"remove":"add"]("hidden"); });
}
function isTestSuccess(r){ return (r||"").toLowerCase().startsWith("convergent"); }

// ─── Summary ───
function buildSummary(result){
  const el=$("summaryText"); if(!el) return;
  const hr="─────────────────────────";
  const spf=result.samnPerelli?`${result.samnPerelli.score}  (${result.samnPerelli.label})`:"not recorded";
  let geoStr="unavailable";
  if(result.geo){
    geoStr=result.geo.status==="ok"
      ?(result.geo.address||`${result.geo.latitude.toFixed(5)}, ${result.geo.longitude.toFixed(5)}`)+` (±${Math.round(result.geo.accuracy_m)}m)`
      :result.geo.status;
  }
  const blockList=result.blocks&&result.blocks.length
    ?result.blocks.map((b,i)=>`  Block ${i+1}: ${b.toFixed(0)} ms`).join("\n"):"  none";
  const avg2=result.averageLast2BlockingScoresMs;
  const diff=result.blockScoreDifferenceMs;
  const diffStr=diff!=null?`${diff>0?"+":""}${diff.toFixed(0)} ms  (${diff>0?"slower":diff<0?"faster":"no change"})`:"—";
  const cps=result.cognitivePerformanceScore;
  const sd=result.pacedResponseSdMs;
  el.textContent=
`CogSpeed V18  —  Test Results
${hr}
Subject ID:    ${result.subjectId}
Date / Time:   ${new Date(result.time).toLocaleString()}
Test duration:         ${formatDuration(result.testDurationMs)}
Location:      ${geoStr}
${hr}
FATIGUE (S-PF)
  Pre-test rating:  ${spf}
${hr}
CALIBRATION
  Average RT:  ${result.calibrationAverageMs!=null?result.calibrationAverageMs.toFixed(1)+" ms":"—"}
${hr}
MACHINE-PACED PERFORMANCE
  Block scores:
${blockList}
  Avg last 2 blocks:   ${avg2!=null?avg2.toFixed(1)+" ms":"—"}
  Block score diff:    ${diffStr}
  CPS:                 ${cps!=null?cps.toFixed(1)+" / 100":"—"}
${hr}
RESPONSE STATISTICS
  Total taps:            ${result.totalResponses}
    Correct:             ${result.totalCorrect}
    Incorrect:           ${result.totalIncorrect}
  Missed (no response):  ${result.missedTrials}
  Paced correct taps:    ${result.pacedResponseCount||0}
  Paced wrong taps:      ${result.pacedErrors||0}
  SP Restart wrong taps: ${result.recoveryErrors||0}
  Mean paced RT:         ${result.pacedResponseMeanMs!=null?result.pacedResponseMeanMs.toFixed(1)+" ms":"—"}
  Paced RT SD:           ${sd!=null?sd.toFixed(1)+" ms":"—"}
${hr}
END REASON
  ${result.endReason}`;
}

// ─── Results page — gear spin outro then thinking box ───
function showResultsPage(){
  const last=state.history[state.history.length-1];
  const success=last?isTestSuccess(last.endReason):false;
  // 1. Spin all gears fast for 1.5s
  stimGrid.querySelectorAll(".stim-cell").forEach((c,i)=>{
    c.classList.remove("gidle-f","gidle-r");
    c.classList.add(i%2===0?"gspin-f":"gspin-r");
  });
  respGrid.querySelectorAll(".resp-btn").forEach((b,i)=>{
    b.classList.remove("gidle-f","gidle-r");
    b.classList.add(i%2===0?"gspin-f":"gspin-r");
  });
  probeCell.classList.remove("gidle-f"); probeCell.classList.add("gspin-f");
  // 2. Close curtain
  const curtain=$("curtain"); if(curtain) curtain.classList.remove("open");
  setTimeout(()=>{
    // 3. Show thinking box
    const ts=$("testScreen"); if(ts) ts.classList.add("hidden");
    const thinking=$("thinkingOverlay");
    if(thinking){ thinking.classList.remove("hidden"); startFX(); }
    setTimeout(()=>{
      stopFX(); if(thinking) thinking.classList.add("hidden");
      const outcome=$("outcomeOverlay"),outcomeText=$("outcomeText");
      if(outcome&&outcomeText){
        outcomeText.textContent=success?"SUCCESS!":"Test Failed";
        outcomeText.className="outcome-text "+(success?"success":"failed");
        outcome.classList.remove("hidden");
      }
      setTimeout(()=>{
        if(outcome) outcome.classList.add("hidden");
        $("summaryOverlay").classList.remove("hidden");
        setTestingQuiet(false);
      },3000);
    },6000);
  },1500);
}

// ─── Session control ───
function clearCurrentSession(){
  clearTimer(); clearNoResponseTimer(); clearMaxTestTimer();
  state.phase="idle"; state.duration=null; state.blockDuration=null;
  state.current=null; state.previous=null; state.unresolvedStreak=0;
  state.overloads=[]; state.recoveries=[]; state.recoveryCorrectCompleted=0;
  state.spCorrectStreak=0; state.spWrongCount=0; state.terminalBlockReason=null;
  state.totalTrials=0; state.endReason=""; state.totalResponses=0; state.pacedErrors=0;
  state.testStartTime=null; state.totalCorrect=0; state.totalIncorrect=0;
  state.missedTrials=0; state.rollMeanLog=[]; state.lastFiveAnswers=[];
  state.calibrationTrialIndex=0; state.calibrationRTs=[]; state.calibrationErrors=0;
  state.pacedRTs=[]; state.rtLog=[]; state.previousMissed=false; state.lastFrameDuration=null;
  state.geo=null; state.benchmark=null; state.lastResultText=null;
  updateCPSDisplay(null); updateMetrics(); setProbeIdle(); setTestingQuiet(false);
}
function goToStartPage(){
  clearCurrentSession();
  ["thinkingOverlay","outcomeOverlay","testScreen"].forEach(id=>{ const el=$(id); if(el) el.classList.add("hidden"); });
  const curtain=$("curtain"); if(curtain) curtain.classList.remove("open");
  probeCell.classList.remove("gspin-f","gspin-r","gidle-f","gidle-r");
  stopFX(); setStatus("Ready"); showOnly("subjectOverlay");
}
function startOverFlow(){
  clearCurrentSession(); state.subjectId=null; state.samnPerelli=null;
  fatigueOut.textContent="—"; $("subjectIdInput").value="";
  _adminUnlocked=false;
  setStatus("Reset. Enter Subject ID."); showOnly("subjectOverlay");
}

// ─── Gear spin intro then start ───
function runGearSpinThenStart(callback) {
  // Show test screen with gears, no pattern, spin fast for 2s, then callback
  const ts = $("testScreen"); if(ts) ts.classList.remove("hidden");
  // Render blank gears for the spin
  stimGrid.innerHTML = "";
  for(let i=0;i<6;i++){
    const cell = document.createElement("div");
    cell.className = "stim-cell";
    cell.innerHTML = buildGearSVG(i+1, null, "large", i%2===0?"gspin-f":"gspin-r");
    stimGrid.appendChild(cell);
  }
  probeCell.classList.remove("idle");
  probeInner.innerHTML = buildGearSVG(0, null, "probe", "gspin-f");
  respGrid.innerHTML = "";
  for(let i=0;i<6;i++){
    const btn = document.createElement("div"); btn.className = "resp-btn";
    btn.innerHTML = buildGearSVG(i+1, null, "large", i%2===0?"gspin-f":"gspin-r");
    respGrid.appendChild(btn);
  }
  setTimeout(()=>{
    // Open curtain
    const curtain = $("curtain"); if(curtain) curtain.classList.add("open");
    setTimeout(()=>{
      callback();
    }, 750);
  }, 1800);
}

// ─── START TEST ───
function startTest(){
  if(!state.subjectId){ showOnly("subjectOverlay"); setStatus("Enter Subject ID first"); return; }
  if(!state.samnPerelli){ showOnly("fatigueOverlay"); setStatus("Select fatigue rating first"); return; }
  const sid=state.subjectId, spf=state.samnPerelli;
  clearCurrentSession();
  state.subjectId=sid; state.samnPerelli=spf;
  const fo=$("fatigueOut"); if(fo) fo.textContent=String(spf.score);
  hideAllOverlays();
  setTestingQuiet(true);
  captureGeo();
  noteAnyResponse();
  runGearSpinThenStart(()=>{
    state.phase="calibration";
    openTrial("calibration");
  });
}

// ─── Trial detail log ───
function buildTrialLog(sessionIndex){
  const tbody=$("trialLogBody"); if(!tbody) return;
  // Populate session selector
  const sel=$("trialLogSessionSelect");
  if(sel){
    sel.innerHTML="";
    // Most recent first
    [...state.history].reverse().forEach((r,i)=>{
      const idx=state.history.length-1-i;
      const opt=document.createElement("option");
      opt.value=String(idx);
      opt.textContent=`Session ${idx+1} — ${r.subjectId} — ${new Date(r.time).toLocaleString()} — CPS: ${r.cognitivePerformanceScore!=null?r.cognitivePerformanceScore.toFixed(0):"—"}`;
      sel.appendChild(opt);
    });
    if(sessionIndex!=null) sel.value=String(sessionIndex);
  }
  const idx=sel?Number(sel.value):state.history.length-1;
  const result=state.history[idx];
  const log=result?result.rtLog:state.rtLog;
  tbody.innerHTML="";
  if(!log||!log.length){
    tbody.innerHTML='<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:12px">No trial data for this session</td></tr>';
    const meta=$("trialLogMeta"); if(meta) meta.textContent="No data";
    return;
  }
  // Color coding
  const outcomeColor={correct:"#00ff88",wrong:"#ff4466",missed:"#888"};
  log.forEach(e=>{
    const tr=document.createElement("tr");
    const timeStr=e.clockTime?new Date(e.clockTime).toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit",fractionalSecondDigits:3}):"—";
    const rtStr=e.rt!=null?e.rt.toLocaleString():"—";
    const durStr=e.durationMs!=null?e.durationMs.toLocaleString()+"ms":"—";
    const oc=outcomeColor[e.outcome]||"var(--muted)";
    tr.innerHTML=`<td style="font-weight:700">${e.seq}</td><td style="font-size:10px">${timeStr}</td><td style="font-size:10px;color:var(--muted)">${e.phase}</td><td>${durStr}</td><td style="font-weight:700">${rtStr}</td><td style="color:${oc};font-weight:700">${e.outcome}</td><td>${e.probe}</td><td style="color:var(--accent)">${e.correctCell}</td><td style="color:${oc==="var(--muted)"?"var(--muted)":oc}">${e.response}</td>`;
    tbody.appendChild(tr);
  });
  const meta=$("trialLogMeta"); if(meta) meta.textContent=`${log.length} trials — Session ${idx+1}: ${result?result.subjectId:"current"}`;
}
function downloadTrialLogCSV(){
  const sel=$("trialLogSessionSelect");
  const idx=sel?Number(sel.value):state.history.length-1;
  const result=state.history[idx];
  const log=result?result.rtLog:state.rtLog;
  if(!log||!log.length){ setStatus("No trial data to download"); return; }
  const hdr="trial#,clockTime,phase,presentationRateMs,rtMs,outcome,probe,correctCell,response\n";
  const rows=log.map(e=>[
    e.seq,
    e.clockTime||"",
    e.phase,
    e.durationMs!=null?e.durationMs:"",
    e.rt!=null?e.rt:"",
    e.outcome,
    e.probe,
    e.correctCell,
    `"${e.response}"`
  ].join(",")).join("\n");
  const subj=result?result.subjectId:"current";
  const blob=new Blob([hdr+rows],{type:"text/csv"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`cogspeed_v18_trials_${subj}.csv`; a.click();
}

// ─── History & Graphs overlay ───
function buildHistoryOverlay(){
  // Draw chart
  drawCombinedChart($("histGraphChart"),state.history);
  // Build session table
  const tbody=$("historyTableBody"); if(!tbody) return;
  tbody.innerHTML="";
  if(!state.history.length){
    tbody.innerHTML='<tr><td colspan="10" style="text-align:center;color:var(--muted);padding:12px">No history yet</td></tr>';
    return;
  }
  [...state.history].reverse().forEach((r,ri)=>{
    const idx=state.history.length-1-ri;
    const tr=document.createElement("tr");
    const date=new Date(r.time).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
    const spf=r.samnPerelli?r.samnPerelli.score:"—";
    const calRT=r.calibrationAverageMs!=null?r.calibrationAverageMs.toFixed(0)+"ms":"—";
    const avgBlk=r.averageLast2BlockingScoresMs!=null?r.averageLast2BlockingScoresMs.toFixed(0)+"ms":"—";
    const cps=r.cognitivePerformanceScore!=null?r.cognitivePerformanceScore.toFixed(1):"—";
    const dur=formatDuration(r.testDurationMs);
    const endShort=(r.endReason||"").substring(0,30)+((r.endReason||"").length>30?"…":"");
    tr.style.cursor="pointer";
    tr.title="Click to view trial detail";
    tr.onclick=()=>{ buildHistoryOverlay._closeAndOpenTrial(idx); };
    tr.innerHTML=`<td style="font-weight:700;color:var(--accent)">${idx+1}</td><td style="font-size:11px">${date}</td><td>${r.subjectId}</td><td style="color:#88ff88">${spf}</td><td>${calRT}</td><td>${r.blockCount||0}</td><td style="color:#ff9f40">${avgBlk}</td><td style="color:var(--accent);font-weight:800">${cps}</td><td>${dur}</td><td style="font-size:10px;color:var(--muted)">${endShort}</td>`;
    tbody.appendChild(tr);
  });
}
buildHistoryOverlay._closeAndOpenTrial=function(idx){
  $("historyOverlay").classList.add("hidden");
  buildTrialLog(idx);
  $("trialLogOverlay").classList.remove("hidden");
};

// ─── Device benchmark ───
async function runDeviceBenchmark(force){
  const enabled=force||Number(settings.deviceBenchmarkEnabled||0)===1;
  if(!enabled){ state.benchmark=null; return; }
  const BENCH=1000;
  const ov=$("benchmarkOverlay"),bs=$("benchStatusLine"),bst=$("benchStats"),bg=$("benchGrade"),bc=$("benchChart"),bb=$("benchBtns");
  if(ov) ov.classList.remove("hidden");
  if(bg) bg.style.display="none"; if(bc) bc.style.display="none"; if(bb) bb.style.display="none";
  if(bst) bst.innerHTML="";
  if(bs) bs.textContent="Phase 1: Processor speed…";
  await new Promise(r=>setTimeout(r,50));
  const pt=[];
  for(let i=0;i<BENCH;i++){ const t0=performance.now(); const tr=makeTrial("paced",i>0?i%6:null); renderTrial(tr); pt.push(performance.now()-t0); if(bs&&i%10===9) bs.textContent=`Phase 1: ${i+1}/${BENCH}…`; }
  setProbeIdle();
  const avgP=mean(pt),minP=Math.min(...pt),maxP=Math.max(...pt),sdP=stdDev(pt)||0,floor=Math.ceil(avgP+sdP*2);
  if(bs) bs.textContent="Phase 2: Scheduler speed…";
  await new Promise(r=>setTimeout(r,50));
  const st=[];
  await new Promise(resolve=>{ let n=0; function next(){ if(n>=BENCH){resolve();return;} const t0=performance.now(); setTimeout(()=>{ st.push(performance.now()-t0); n++; if(bs&&n%100===0) bs.textContent=`Phase 2: ${n}/${BENCH}…`; next(); },0); } next(); });
  const avgS=mean(st),minS=Math.min(...st),maxS=Math.max(...st),sdS=stdDev(st)||0;
  const ps=Math.max(0,Math.min(100,Math.round(100-(avgP/20)*100)));
  const ss=Math.max(0,Math.min(100,Math.round(100-(avgS/20)*100)));
  const os=Math.round((ps+ss)/2);
  const grade=os>=90?"A":os>=75?"B":os>=55?"C":"D";
  state.benchmark={enabled:true,trials:BENCH,avgProcMs:avgP,minProcMs:minP,maxProcMs:maxP,procSd:sdP,minPossibleDurMs:floor,avgSchedMs:avgS,minSchedMs:minS,maxSchedMs:maxS,schedSd:sdS,procScore:ps,schedScore:ss,overallScore:os,grade};
  if(bs) bs.textContent="Benchmark complete";
  if(bg){ bg.textContent=`Grade: ${grade} (${os}/100)`; bg.className=`bench-grade ${grade.toLowerCase()}`; bg.style.display="block"; }
  const rows=[["─ PROCESSOR ─",""],["Avg render",`${avgP.toFixed(2)}ms`],["Min/Max",`${minP.toFixed(2)}/${maxP.toFixed(2)}ms`],["Floor",`~${floor}ms`],["Score",`${ps}/100`],["─ SCHEDULER ─",""],["Avg setTimeout(0)",`${avgS.toFixed(2)}ms`],["Min/Max",`${minS.toFixed(2)}/${maxS.toFixed(2)}ms`],["Score",`${ss}/100`],["─ OVERALL ─",""],["Score",`${os}/100`],["Grade",grade]];
  if(bst) bst.innerHTML=rows.map(([l,v])=>v===""?`<div style="font-size:11px;color:var(--accent);font-weight:700;margin-top:8px">${l}</div>`:`<div class="bench-stat"><span class="bench-label">${l}</span><span class="bench-val">${v}</span></div>`).join("");
  if(bb) bb.style.display="grid";
}


// ═══════════════════════════════════════════════════
//  TUTORIAL
// ═══════════════════════════════════════════════════

let _tutStep = 0;
let _tutTimer = null;

// Demo trial: probe=lines:3, correct=dots:3 @position 3
const TUT_PROBE_FAM  = "lines";
const TUT_PROBE_CNT  = 3;
const TUT_CORRECT_POS = 2;  // 0-based, position 3
const TUT_ITEMS = [
  {family:"dots",  count:5, pattern:null},
  {family:"lines", count:1, pattern:null},
  {family:"dots",  count:3, pattern:null},  // ← correct answer
  {family:"lines", count:4, pattern:null},
  {family:"dots",  count:2, pattern:null},
  {family:"lines", count:6, pattern:null},
];
// Fill patterns after patterns are defined
function tutFillPatterns(){
  TUT_ITEMS.forEach(it=>{
    it.pattern = it.family==="dots" ? DOT_PATTERNS[it.count] : LINE_PATTERNS[it.count];
  });
}

function buildTutGearGrid(highlightPos, showPatterns){
  let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;width:100%;max-width:340px">';
  TUT_ITEMS.forEach((it,i)=>{
    const isHL = highlightPos===i;
    const border = isHL ? "2px solid #7fd7ff" : "2px solid transparent";
    const glow = isHL ? "drop-shadow(0 0 8px rgba(127,215,255,0.8))" : "none";
    const pat = showPatterns ? it.pattern : null;
    html += `<div style="border:${border};border-radius:10px;filter:${glow};aspect-ratio:1">
      ${buildGearSVG(i+1, pat, "large", "")}
    </div>`;
  });
  html += '</div>';
  return html;
}

function buildTutProbe(pulsing){
  const pat = LINE_PATTERNS[TUT_PROBE_CNT];
  const anim = pulsing ? "animation:probePulseG 1.2s ease-in-out infinite" : "animation:none";
  return `<div style="width:clamp(110px,32vw,170px);height:clamp(110px,32vw,170px);${anim}">
    ${buildGearSVG(0, pat, "probe", "")}
  </div>`;
}

function buildTutRespGrid(flashPos){
  let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;width:100%;max-width:340px">';
  for(let i=0;i<6;i++){
    const isFL = flashPos===i;
    const bg = isFL ? "rgba(0,255,136,0.25)" : "rgba(255,255,255,0.04)";
    const border = isFL ? "2px solid #00ff88" : "2px solid rgba(255,255,255,0.1)";
    const scale = isFL ? "transform:scale(0.92)" : "";
    html += `<div style="aspect-ratio:1;border-radius:10px;background:${bg};border:${border};display:flex;align-items:center;justify-content:center;${scale}">
      <span style="font-size:20px;font-weight:800;color:rgba(255,255,255,0.4)">${i+1}</span>
    </div>`;
  }
  html += '</div>';
  return html;
}

const TUT_STEPS = [
  // Step 1: The probe
  {
    dur: 0,  // manual advance
    build: ()=>{
      return `
        <div style="font-size:13px;letter-spacing:.1em;color:rgba(127,215,255,0.7);text-transform:uppercase;margin-bottom:8px">The Probe</div>
        <div style="margin-bottom:16px">${buildTutProbe(true)}</div>
        <div style="font-size:20px;font-weight:700;color:#f5fbff;margin-bottom:8px;max-width:300px">This glowing gear is the <span style="color:#7fd7ff">PROBE</span></div>
        <div style="font-size:16px;color:rgba(255,255,255,0.65);max-width:300px">Count the marks inside it — dots or lines</div>
      `;
    }
  },
  // Step 2: The targets
  {
    dur: 0,
    build: ()=>{
      return `
        <div style="font-size:13px;letter-spacing:.1em;color:rgba(127,215,255,0.7);text-transform:uppercase;margin-bottom:8px">The Targets</div>
        <div style="margin-bottom:12px">${buildTutGearGrid(-1, true)}</div>
        <div style="font-size:20px;font-weight:700;color:#f5fbff;margin-bottom:8px;max-width:300px">These 6 gears are your <span style="color:#7fd7ff">TARGETS</span></div>
        <div style="font-size:16px;color:rgba(255,255,255,0.65);max-width:300px">Each has dots or lines — count them</div>
      `;
    }
  },
  // Step 3: The rule
  {
    dur: 0,
    build: ()=>{
      return `
        <div style="font-size:13px;letter-spacing:.1em;color:rgba(127,215,255,0.7);text-transform:uppercase;margin-bottom:10px">The Rule</div>
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;flex-wrap:wrap;justify-content:center">
          <div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:4px">PROBE</div>
            <div style="width:clamp(70px,22vw,100px);height:clamp(70px,22vw,100px)">${buildGearSVG(0, LINE_PATTERNS[3], "probe", "")}</div>
            <div style="font-size:14px;color:#7fd7ff;margin-top:4px;font-weight:700">lines : 3</div>
          </div>
          <div style="font-size:28px;color:#ffaa44;font-weight:900">↔</div>
          <div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:4px">MATCH</div>
            <div style="width:clamp(70px,22vw,100px);height:clamp(70px,22vw,100px);border:2px solid #7fd7ff;border-radius:10px;box-shadow:0 0 14px rgba(127,215,255,0.5)">${buildGearSVG(3, DOT_PATTERNS[3], "probe", "")}</div>
            <div style="font-size:14px;color:#00ff88;margin-top:4px;font-weight:700">dots : 3 ✓</div>
          </div>
        </div>
        <div style="background:rgba(127,215,255,0.08);border:1px solid rgba(127,215,255,0.3);border-radius:12px;padding:12px 16px;max-width:300px">
          <div style="font-size:18px;font-weight:800;color:#7fd7ff">Same COUNT</div>
          <div style="font-size:15px;color:rgba(255,255,255,0.6);margin:2px 0">3 lines → find 3 dots</div>
          <div style="font-size:18px;font-weight:800;color:#ffaa44;margin-top:6px">Opposite TYPE</div>
          <div style="font-size:15px;color:rgba(255,255,255,0.6)">lines ↔ dots</div>
        </div>
      `;
    }
  },
  // Step 4: Tap the response
  {
    dur: 0,
    build: ()=>{
      return `
        <div style="font-size:13px;letter-spacing:.1em;color:rgba(127,215,255,0.7);text-transform:uppercase;margin-bottom:8px">Tap the Match</div>
        <div style="margin-bottom:6px;opacity:0.7">${buildTutGearGrid(TUT_CORRECT_POS, true)}</div>
        <div style="display:flex;align-items:center;gap:8px;margin:6px 0">
          <div style="flex:1;height:1px;background:rgba(255,255,255,0.1)"></div>
          <div style="font-size:12px;color:rgba(255,255,255,0.4)">same position below</div>
          <div style="flex:1;height:1px;background:rgba(255,255,255,0.1)"></div>
        </div>
        <div>${buildTutRespGrid(TUT_CORRECT_POS)}</div>
        <div style="font-size:16px;color:rgba(255,255,255,0.65);margin-top:10px;max-width:300px">Tap the <span style="color:#00ff88;font-weight:700">button below</span> that matches the highlighted gear</div>
      `;
    }
  },
  // Step 5: React fast!
  {
    dur: 0,
    build: ()=>{
      return `
        <div style="font-size:60px;margin-bottom:4px">⚡</div>
        <div style="font-size:30px;font-weight:900;color:#7fd7ff;letter-spacing:.06em;margin-bottom:8px">REACT FAST!</div>
        <div style="font-size:17px;color:rgba(255,255,255,0.7);max-width:300px;margin-bottom:20px;line-height:1.5">Each gear appears for only a few seconds.<br>Respond before it disappears!</div>
        <div style="background:rgba(127,215,255,0.08);border:1px solid rgba(127,215,255,0.25);border-radius:12px;padding:14px 20px;max-width:300px;font-size:15px;color:rgba(255,255,255,0.6);line-height:1.7">
          Missing a trial is OK — the test adjusts.<br>Wrong answers are OK too.<br><strong style="color:rgba(255,255,255,0.85)">Just respond as fast as you can.</strong>
        </div>
      `;
    }
  },
];

function tutSetStep(n){
  _tutStep = n;
  // Update dots
  for(let i=0;i<5;i++){
    const d=$("tdot"+i);
    if(d) d.style.background = i===n ? "#7fd7ff" : "rgba(127,215,255,0.25)";
  }
  // Update content
  const content=$("tutorialContent");
  if(content) content.innerHTML = TUT_STEPS[n].build();
  // Update next button
  const btn=$("tutNextBtn");
  if(btn) btn.textContent = n===4 ? "▶ Start Test!" : "Next →";
  if(btn) btn.style.background = n===4 ? "linear-gradient(180deg,#0d4a1a,#062a10)" : "";
  if(btn) btn.style.borderColor = n===4 ? "#00ff88" : "";
  if(btn) btn.style.color = n===4 ? "#00ff88" : "";
}

function showTutorial(){
  tutFillPatterns();
  _tutStep = 0;
  $("tutorialOverlay").classList.remove("hidden");
  tutSetStep(0);
}

function tutNext(){
  if(_tutStep < 4){
    tutSetStep(_tutStep + 1);
  } else {
    // Done — go to fatigue
    $("tutorialOverlay").classList.add("hidden");
    const sb=$("fatigueStartBtn"); if(sb) sb.classList.add("hidden");
    $("fatigueList").querySelectorAll(".fatigue-item").forEach(el=>el.style.background="");
    showOnly("fatigueOverlay");
  }
}

function tutSkip(){
  if(_tutTimer) clearTimeout(_tutTimer);
  $("tutorialOverlay").classList.add("hidden");
  const sb=$("fatigueStartBtn"); if(sb) sb.classList.add("hidden");
  $("fatigueList").querySelectorAll(".fatigue-item").forEach(el=>el.style.background="");
  showOnly("fatigueOverlay");
}

// ─── Event wiring ───
$("subjectNextBtn").onclick=()=>{
  const raw=$("subjectIdInput").value.trim();
  if(raw==="0"){ state.subjectId="0"; showOnly("refresherOverlay"); setStatus("Guest session"); return; }
  if(!/^[A-Za-z0-9]{6}$/.test(raw)){ setStatus("ID must be 6 letters/numbers, or 0 for Guest"); return; }
  state.subjectId=raw.toUpperCase(); showOnly("refresherOverlay"); setStatus(`Subject: ${state.subjectId}`);
};
$("skipRefresherBtn").onclick=()=>{
  showTutorial(); setStatus("Tutorial");
};
$("refBackBtn").onclick=()=>goToStartPage();
$("refStartOverBtn").onclick=()=>startOverFlow();
$("fatigueBackBtn").onclick=()=>goToStartPage();
$("fatigueStartOverBtn").onclick=()=>startOverFlow();
const _fsb=$("fatigueStartBtn");
if(_fsb) _fsb.onclick=startTest;
let _adminUnlocked = false;
$("adminOpenBtn").onclick=()=>{
  $("adminOverlay").classList.remove("hidden");
  if(_adminUnlocked){
    $("adminGate").classList.add("hidden");
    $("adminBody").classList.remove("hidden");
    renderAdmin();
  } else {
    $("adminGate").classList.remove("hidden");
    $("adminBody").classList.add("hidden");
    $("adminPass").value="";
  }
};
$("tutNextBtn").onclick=()=>tutNext();
$("tutSkipBtn").onclick=()=>tutSkip();
$("unlockBtn").onclick=()=>{
  const v=$("adminPass").value;
  if(v===settings.adminPasscode||v==="4822"){
    _adminUnlocked=true;
    $("adminGate").classList.add("hidden"); $("adminBody").classList.remove("hidden"); renderAdmin(); setStatus("Admin unlocked");
  } else setStatus("Incorrect passcode — default is 4822");
};
$("closeAdminBtn").onclick=()=>$("adminOverlay").classList.add("hidden");
$("closeAdminBtn2").onclick=()=>$("benchmarkOverlay").classList.add("hidden");
$("saveAdminBtn").onclick=()=>{ readAdmin(); saveSettings(); renderAdmin(); setStatus("Settings saved"); };
$("resetAdminBtn").onclick=()=>{ resetAdmin(); setStatus("Settings reset to defaults"); };
$("exportAdminBtn").onclick=()=>{ const blob=new Blob([JSON.stringify(settings,null,2)],{type:"application/json"}),a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="cogspeed_v18_settings.json"; a.click(); };
$("adminTrialLogBtn").onclick=()=>{ buildTrialLog(state.history.length-1); $("trialLogOverlay").classList.remove("hidden"); };
$("adminHistoryBtn").onclick=()=>{ buildHistoryOverlay(); $("historyOverlay").classList.remove("hidden"); };
$("adminLastResultBtn").onclick=()=>{
  const last=state.history[state.history.length-1];
  if(!last){ setStatus("No results yet."); return; }
  $("adminOverlay").classList.add("hidden");
  buildSummary(last);
  $("summaryOverlay").classList.remove("hidden");
};
$("trialLogCloseBtn").onclick=()=>$("trialLogOverlay").classList.add("hidden");
$("trialLogCsvBtn").onclick=()=>downloadTrialLogCSV();
$("historyCloseBtn").onclick=()=>$("historyOverlay").classList.add("hidden");
$("historyClearBtn").onclick=()=>{
  if(!confirm("Clear ALL session history? This cannot be undone.")) return;
  state.history=[]; localStorage.removeItem("cogspeed_v18_history");
  buildHistoryOverlay(); setStatus("History cleared.");
};
const _tsel=$("trialLogSessionSelect");
if(_tsel) _tsel.onchange=()=>buildTrialLog();
$("adminBackBtn").onclick=()=>goToStartPage();
$("adminStartOverBtn").onclick=()=>startOverFlow();
$("benchRunBtn").onclick=()=>runDeviceBenchmark(true);
$("benchMainBtn").onclick=()=>{ $("benchmarkOverlay").classList.add("hidden"); };
$("startBtn").onclick=startTest;
$("backToStartBtn").onclick=goToStartPage;
$("startOverBtn").onclick=startOverFlow;
$("summaryRestartBtn").onclick=()=>{ $("summaryOverlay").classList.add("hidden"); goToStartPage(); };
$("summaryEmailBtn").onclick=emailResults;
$("summaryAdminBtn").onclick=()=>{
  $("summaryOverlay").classList.add("hidden");
  $("adminOverlay").classList.remove("hidden");
  if(_adminUnlocked){
    $("adminGate").classList.add("hidden"); $("adminBody").classList.remove("hidden"); renderAdmin();
  } else {
    $("adminGate").classList.remove("hidden"); $("adminBody").classList.add("hidden"); $("adminPass").value="";
  }
};
$("resultsBackBtn").onclick=goToStartPage;
$("resultsStartOverBtn").onclick=startOverFlow;
$("resultsExportBtn").onclick=exportResults;
$("resultsEmailBtn").onclick=emailResults;
window.addEventListener("beforeinstallprompt",e=>{
  e.preventDefault(); deferredPrompt=e;
  const hb=$("installBtnHome"); if(hb) hb.disabled=false;
});
async function _doInstall(){
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  const c=await deferredPrompt.userChoice;
  deferredPrompt=null;
  const msg=c.outcome==="accepted"?"App added to home screen.":"Cancelled.";
  setStatus(msg);
}
const _ihb=$("installBtnHome"); if(_ihb) _ihb.onclick=_doInstall;

// ─── Init ───
modeLabel.textContent="Subject mode";
renderFatigueChecklist();
renderRefresher();
updateMetrics();
renderHistoryGraphs();
