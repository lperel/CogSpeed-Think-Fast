// ═══════════════════════════════════════════════════
//  CogSpeed V17
// ═══════════════════════════════════════════════════

// ─── Version guard ───
(function(){
  const VER="cogspeed_v17", key="cogspeed_version";
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
  2:[["dot",22,50],["dot",78,50]],
  3:[["dot",50,18],["dot",22,75],["dot",78,75]],
  4:[["dot",22,22],["dot",78,22],["dot",22,78],["dot",78,78]],
  5:[["dot",22,22],["dot",78,22],["dot",50,50],["dot",22,78],["dot",78,78]],
  6:[["dot",22,18],["dot",78,18],["dot",22,50],["dot",78,50],["dot",22,82],["dot",78,82]]
};
const LINE_PATTERNS={
  1:[["v",50,50]],
  2:[["v",22,50],["v",78,50]],
  3:[["v",15,50],["v",50,50],["v",85,50]],
  4:[["v",22,25],["v",78,25],["v",22,75],["v",78,75]],
  5:[["v",22,22],["v",78,22],["v",50,50],["v",22,78],["v",78,78]],
  6:[["v",15,18],["v",50,18],["v",85,18],["v",15,78],["v",50,78],["v",85,78]]
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
  const s=JSON.parse(localStorage.getItem("cogspeed_v17_settings")||"null");
  if(!s) return {...DEFAULTS};
  const m={...DEFAULTS};
  Object.keys(DEFAULTS).forEach(k=>{ if(s[k]!==undefined) m[k]=s[k]; });
  return m;
}
function saveSettings(){ localStorage.setItem("cogspeed_v17_settings",JSON.stringify(settings)); }
let settings=loadSettings();

// ─── State ───
const state={
  phase:"idle", duration:null, blockDuration:null,
  current:null, previous:null, unresolvedStreak:0,
  overloads:[], recoveries:[], recoveryCorrectCompleted:0,
  spCorrectStreak:0, spWrongCount:0, terminalBlockReason:null,
  history:JSON.parse(localStorage.getItem("cogspeed_v17_history")||"[]"),
  totalTrials:0, totalResponses:0, totalCorrect:0, totalIncorrect:0,
  missedTrials:0, pacedErrors:0, rollMeanLog:[],
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
  metricsPanel.style.display=q?"none":"grid";
  statusLine.style.display=q?"none":"block";
  resultBox.classList.add("hidden");
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
function makeTrial(kind,lastCorrectPos){
  for(let attempt=0;attempt<500;attempt++){
    const probeFamily=Math.random()<0.5?"dots":"lines";
    const probeCount=randInt(1,6);
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

// ─── Render trial ───
function renderTrial(trial){
  stimGrid.innerHTML="";
  for(let i=0;i<6;i++){
    const cell=document.createElement("div");
    cell.className="stim-cell";
    const lbl=document.createElement("div"); lbl.className="cell-label"; lbl.textContent=String(i+1);
    cell.appendChild(lbl);
    cell.innerHTML+=patternToSVG(trial.topItems[i].pattern,"large");
    stimGrid.appendChild(cell);
  }
  probeCell.classList.remove("idle");
  probeInner.innerHTML=patternToSVG(trial.probePattern,"probe");
  respGrid.innerHTML="";
  for(let i=0;i<6;i++){
    const btn=document.createElement("div"); btn.className="resp-btn";
    const pos=document.createElement("div"); pos.className="resp-pos"; pos.textContent=String(i+1);
    btn.appendChild(pos);
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
function setProbeIdle(){ probeCell.classList.add("idle"); probeInner.innerHTML=""; stimGrid.innerHTML=""; respGrid.innerHTML=""; }

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
    pacedErrors:state.pacedErrors, pacedResponseCount:state.pacedRTs.length,
    pacedResponseMeanMs:state.pacedRTs.length?mean(state.pacedRTs):null,
    pacedResponseSdMs:sd, testDurationMs:testDurMs,
    rtLog:[...state.rtLog], endReason:state.endReason||"Run complete",
    time:new Date().toISOString(), geo:state.geo
  };
  state.history.push(result);
  localStorage.setItem("cogspeed_v17_history",JSON.stringify(state.history));
  updateCPSDisplay(avg2); setProbeIdle();
  let geoStr="unavailable";
  if(result.geo){ geoStr=result.geo.status==="ok"?(result.geo.address||`${result.geo.latitude.toFixed(5)},${result.geo.longitude.toFixed(5)}`)+` (±${Math.round(result.geo.accuracy_m)}m)`:result.geo.status; }
  const spf=result.samnPerelli?`${result.samnPerelli.score} (${result.samnPerelli.label})`:"not recorded";
  const blockList=result.blocks.length?result.blocks.map((b,i)=>`  Block ${i+1}: ${b.toFixed(0)}ms`).join("\n"):"  none";
  const hr="─────────────────────────";
  const text=`CogSpeed V17  —  Test Results\n${hr}\nDate:       ${new Date(result.time).toLocaleString()}\nSubject:    ${result.subjectId}\nLocation:   ${geoStr}\n${hr}\nFATIGUE (S-PF)\n  ${spf}\n${hr}\nCALIBRATION\n  Avg RT: ${result.calibrationAverageMs!=null?result.calibrationAverageMs.toFixed(1)+"ms":"—"}\n${hr}\nMACHINE-PACED\n${blockList}\n  Avg last 2 blocks: ${avg2!=null?avg2.toFixed(1)+"ms":"—"}\n  CPS: ${cps!=null?cps.toFixed(1)+"/100":"—"}\n${hr}\nSTATISTICS\n  Taps: ${result.totalResponses}  Correct: ${result.totalCorrect}  Wrong: ${result.totalIncorrect}\n  Missed: ${result.missedTrials}  Test time: ${formatDuration(testDurMs)}\n${hr}\nEND\n  ${result.endReason}`;
  state.lastResultText=text;
  showResultsPage(text);
}

// ─── Open trial ───
function openTrial(kind){
  clearTimer();
  state.previous=state.current;
  const lastPos=state.current?state.current.correctPos:null;
  state.current=makeTrial(kind,lastPos);
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
  const missed=state.current&&!state.current.resolved;
  if(missed){
    logTrial({phase:"missed",rt:null,outcome:"missed",responseIndex:null});
    state.missedTrials+=1; state.previousMissed=true; state.lastFrameDuration=state.duration;
    if(recordAnswer(false,true)) return;
  }else{ state.previousMissed=false; state.lastFrameDuration=null; }
  state.unresolvedStreak=missed?state.unresolvedStreak+1:0;
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
      state.spCorrectStreak=0; state.spWrongCount+=1;
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
  state.previousMissed=false; state.lastFrameDuration=null;
  if(state.current&&!state.current.resolved&&trialMatches(state.current,index)){
    state.current.resolved=true; state.totalResponses+=1; state.totalCorrect+=1;
    applyPacing(rt,true); state.pacedRTs.push(rt);
    logTrial({phase:"paced",rt,outcome:"correct",responseIndex:index}); flashBtn(index,true);
    if(recordAnswer(true)) return; return;
  }
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
  for(const [score,label] of SAMN_PERELLI){
    const b=document.createElement("button"); b.className="fatigue-item";
    b.textContent=`${score}. ${label}`;
    b.onclick=()=>{
      f.querySelectorAll(".fatigue-item").forEach(el=>el.style.background="");
      b.style.background="rgba(0,180,255,0.18)";
      state.samnPerelli={score,label}; fatigueOut.textContent=String(score);
      setStatus(`S-PF: ${score} — ${label}`);
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
  drawCombinedChart($("adminHistChart"),state.history);
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
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="cogspeed_v17_results.json"; a.click();
}
function emailResults(){
  const last=state.history[state.history.length-1];
  if(!last){ setStatus("No results to email."); return; }
  window.location.href=`mailto:?subject=CogSpeed V17 Results&body=${encodeURIComponent(state.lastResultText||JSON.stringify(last,null,2))}`;
}

// ─── FX (fire/sparks on thinking overlay) ───
let _fxRaf=null, _fxParticles=[];
function startFX(){
  const canvas=$("fxCanvas"); if(!canvas) return;
  const ctx=canvas.getContext("2d");
  canvas.width=canvas.offsetWidth||300; canvas.height=canvas.offsetHeight||200;
  _fxParticles=[];
  function frame(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(Math.random()<0.3) _fxParticles.push({x:canvas.width/2+(Math.random()-0.5)*60,y:canvas.height*0.6,vx:(Math.random()-0.5)*2,vy:-(1+Math.random()*3),life:1,type:Math.random()<0.5?"spark":"ember"});
    _fxParticles=_fxParticles.filter(p=>p.life>0);
    _fxParticles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.vy*=0.98; p.life-=0.018;
      if(p.type==="spark"){ ctx.strokeStyle=`hsla(45,100%,${60+p.life*40}%,${p.life})`; ctx.lineWidth=p.life*2; ctx.lineCap="round"; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x-p.vx*3,p.y-p.vy*3); ctx.stroke(); }
      else{ const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,4); g.addColorStop(0,`rgba(255,${100+p.life*155},0,${p.life})`); g.addColorStop(1,"rgba(255,60,0,0)"); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,4,0,Math.PI*2); ctx.fill(); }
    });
    _fxRaf=requestAnimationFrame(frame);
  }
  if(_fxRaf) cancelAnimationFrame(_fxRaf); frame();
}
function stopFX(){ if(_fxRaf){ cancelAnimationFrame(_fxRaf); _fxRaf=null; } }

// ─── Overlay management ───
function hideAllOverlays(){
  ["subjectOverlay","refresherOverlay","fatigueOverlay","adminOverlay","resultsOverlay","summaryOverlay","trialLogOverlay","thinkingOverlay","outcomeOverlay"].forEach(id=>{ const el=$(id); if(el) el.classList.add("hidden"); });
}
function showOnly(id){
  ["subjectOverlay","refresherOverlay","fatigueOverlay","adminOverlay","resultsOverlay","summaryOverlay","trialLogOverlay"].forEach(oid=>{ const el=$(oid); if(el) el.classList[oid===id?"remove":"add"]("hidden"); });
}
function isTestSuccess(r){ return (r||"").toLowerCase().startsWith("convergent"); }

// ─── Summary ───
function buildSummary(result){
  const el=id=>{ const e=$(id); if(e) e.textContent=id; };
  const set=(id,v)=>{ const e=$(id); if(e) e.textContent=v; };
  set("sumSubject",result.subjectId);
  set("sumSPF",result.samnPerelli?`${result.samnPerelli.score} — ${result.samnPerelli.label}`:"—");
  set("sumCPS",result.cognitivePerformanceScore!=null?result.cognitivePerformanceScore.toFixed(1):"—");
  set("sumBlocks",String(result.blockCount||0));
  set("sumAvgBlock",result.averageLast2BlockingScoresMs!=null?result.averageLast2BlockingScoresMs.toFixed(0)+"ms":"—");
  set("sumCalRT",result.calibrationAverageMs!=null?result.calibrationAverageMs.toFixed(0)+"ms":"—");
  set("sumDuration",formatDuration(result.testDurationMs));
  set("sumEndReason",result.endReason);
}

// ─── Results page ───
function showResultsPage(text){
  const thinking=$("thinkingOverlay"),outcome=$("outcomeOverlay"),outcomeText=$("outcomeText"),summary=$("summaryOverlay");
  const last=state.history[state.history.length-1];
  const success=last?isTestSuccess(last.endReason):false;
  if(thinking){ thinking.classList.remove("hidden"); startFX(); }
  setTimeout(()=>{
    stopFX(); if(thinking) thinking.classList.add("hidden");
    if(outcome&&outcomeText){ outcomeText.textContent=success?"SUCCESS!":"Test Failed"; outcomeText.className="outcome-text "+(success?"success":"failed"); outcome.classList.remove("hidden"); }
    setTimeout(()=>{
      if(outcome) outcome.classList.add("hidden");
      if(last) buildSummary(last);
      if(summary) summary.classList.remove("hidden");
      const box=$("resultsPageBox"); if(box) box.textContent=text;
      renderHistoryGraphs();
      if(last) drawRTScatterChart($("resultsRTChart"),last.rtLog||[],last.blocks||[],last.pacedResponseMeanMs,last.pacedResponseSdMs);
      setTestingQuiet(false);
    },3000);
  },6000);
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
  ["thinkingOverlay","outcomeOverlay"].forEach(id=>{ const el=$(id); if(el) el.classList.add("hidden"); });
  stopFX(); setStatus("Ready"); showOnly("subjectOverlay");
}
function startOverFlow(){
  clearCurrentSession(); state.subjectId=null; state.samnPerelli=null;
  fatigueOut.textContent="—"; $("subjectIdInput").value="";
  setStatus("Reset. Enter Subject ID."); showOnly("subjectOverlay");
}

// ─── START TEST ───
function startTest(){
  if(!state.subjectId){ showOnly("subjectOverlay"); setStatus("Enter Subject ID first"); return; }
  if(!state.samnPerelli){ showOnly("fatigueOverlay"); setStatus("Select fatigue rating first"); return; }
  // Preserve identity across session reset
  const sid=state.subjectId, spf=state.samnPerelli;
  clearCurrentSession();
  state.subjectId=sid; state.samnPerelli=spf;
  fatigueOut.textContent=String(spf.score);
  hideAllOverlays();
  state.phase="calibration";
  setTestingQuiet(true);
  captureGeo(); // fire and forget
  noteAnyResponse();
  openTrial("calibration");
}

// ─── Trial log ───
function buildTrialLog(){
  const tbody=$("trialLogBody"); if(!tbody) return;
  tbody.innerHTML="";
  const last=state.history[state.history.length-1];
  const log=last?last.rtLog:state.rtLog;
  if(!log||!log.length){ tbody.innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--muted)">No data</td></tr>'; return; }
  log.forEach(e=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${e.seq}</td><td>${e.phase}</td><td>${e.rt!=null?e.rt+"ms":"—"}</td><td>${e.outcome}</td><td>${e.probe}</td><td>${e.correctCell}</td><td>${e.response}</td>`;
    tbody.appendChild(tr);
  });
  const meta=$("trialLogMeta"); if(meta) meta.textContent=`${log.length} trials logged`;
}
function downloadTrialLogCSV(){
  const last=state.history[state.history.length-1];
  const log=last?last.rtLog:state.rtLog;
  if(!log||!log.length) return;
  const hdr="seq,phase,rt_ms,outcome,probe,correctCell,response\n";
  const rows=log.map(e=>[e.seq,e.phase,e.rt!=null?e.rt:"",e.outcome,e.probe,e.correctCell,e.response].join(",")).join("\n");
  const blob=new Blob([hdr+rows],{type:"text/csv"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="cogspeed_v17_trials.csv"; a.click();
}

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

// ─── Event wiring ───
$("subjectNextBtn").onclick=()=>{
  const raw=$("subjectIdInput").value.trim();
  if(raw==="0"){ state.subjectId="0"; showOnly("refresherOverlay"); setStatus("Guest session"); return; }
  if(!/^[A-Za-z0-9]{6}$/.test(raw)){ setStatus("ID must be 6 letters/numbers, or 0 for Guest"); return; }
  state.subjectId=raw.toUpperCase(); showOnly("refresherOverlay"); setStatus(`Subject: ${state.subjectId}`);
};
$("skipRefresherBtn").onclick=()=>{
  const sb=$("fatigueStartBtn"); if(sb) sb.classList.add("hidden");
  $("fatigueList").querySelectorAll(".fatigue-item").forEach(el=>el.style.background="");
  showOnly("fatigueOverlay"); setStatus("Refresher skipped");
};
$("refBackBtn").onclick=()=>goToStartPage();
$("refStartOverBtn").onclick=()=>startOverFlow();
$("fatigueBackBtn").onclick=()=>goToStartPage();
$("fatigueStartOverBtn").onclick=()=>startOverFlow();
const _fsb=$("fatigueStartBtn");
if(_fsb) _fsb.onclick=startTest;
$("adminOpenBtn").onclick=()=>{ $("adminOverlay").classList.remove("hidden"); $("adminGate").classList.remove("hidden"); $("adminBody").classList.add("hidden"); $("adminPass").value=""; };
$("unlockBtn").onclick=()=>{
  const v=$("adminPass").value;
  if(v===settings.adminPasscode||v==="4822"){ $("adminGate").classList.add("hidden"); $("adminBody").classList.remove("hidden"); renderAdmin(); setStatus("Admin unlocked"); }
  else setStatus("Incorrect passcode — default is 4822");
};
$("closeAdminBtn").onclick=()=>$("adminOverlay").classList.add("hidden");
$("closeAdminBtn2").onclick=()=>$("adminOverlay").classList.add("hidden");
$("saveAdminBtn").onclick=()=>{ readAdmin(); saveSettings(); renderAdmin(); setStatus("Settings saved"); };
$("resetAdminBtn").onclick=()=>{ resetAdmin(); setStatus("Settings reset to defaults"); };
$("exportAdminBtn").onclick=()=>{ const blob=new Blob([JSON.stringify(settings,null,2)],{type:"application/json"}),a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="cogspeed_v17_settings.json"; a.click(); };
$("adminTrialLogBtn").onclick=()=>{ buildTrialLog(); $("trialLogOverlay").classList.remove("hidden"); };
$("trialLogCloseBtn").onclick=()=>$("trialLogOverlay").classList.add("hidden");
$("trialLogCsvBtn").onclick=()=>downloadTrialLogCSV();
$("adminBackBtn").onclick=()=>goToStartPage();
$("adminBackBtn2").onclick=()=>goToStartPage();
$("adminStartOverBtn").onclick=()=>startOverFlow();
$("adminStartOverBtn2").onclick=()=>startOverFlow();
$("benchRunBtn").onclick=()=>runDeviceBenchmark(true);
$("benchMainBtn").onclick=()=>{ $("benchmarkOverlay").classList.add("hidden"); };
$("startBtn").onclick=startTest;
$("backToStartBtn").onclick=goToStartPage;
$("startOverBtn").onclick=startOverFlow;
$("summaryViewResultsBtn").onclick=()=>{ $("summaryOverlay").classList.add("hidden"); showOnly("resultsOverlay"); };
$("summaryRestartBtn").onclick=()=>{ $("summaryOverlay").classList.add("hidden"); goToStartPage(); };
$("resultsBackBtn").onclick=goToStartPage;
$("resultsStartOverBtn").onclick=startOverFlow;
$("resultsExportBtn").onclick=exportResults;
$("resultsEmailBtn").onclick=emailResults;
window.addEventListener("beforeinstallprompt",e=>{ e.preventDefault(); deferredPrompt=e; $("installBtn").disabled=false; });
$("installBtn").onclick=async()=>{ if(!deferredPrompt) return; deferredPrompt.prompt(); const c=await deferredPrompt.userChoice; deferredPrompt=null; setStatus(c.outcome==="accepted"?"App added to home screen.":"Cancelled."); };

// ─── Init ───
modeLabel.textContent="Subject mode";
renderFatigueChecklist();
renderRefresher();
updateMetrics();
renderHistoryGraphs();
