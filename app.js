// ═══════════════════════════════════════════════════
// CogSpeed V317
// ═══════════════════════════════════════════════════
// Current visible build version used in UI and email subject lines.
const APP_VERSION = "V317";
const RELEASE = APP_VERSION.replace(/^V/i, "");
const STORAGE_PREFIX = `cogspeed_v${RELEASE}`;

// ─── Version guard ───
(function(){
 const VER=`${STORAGE_PREFIX}_profileguard`, key="cogspeed_version";
 const preserve = new Set([`${STORAGE_PREFIX}_profile`, key]);
 if(localStorage.getItem(key)!==VER){
  Object.keys(localStorage).forEach(k=>{
   if((k.startsWith("cogspeed_")||k.startsWith("cogblock_")) && !preserve.has(k)){
    localStorage.removeItem(k);
   }
  });
  localStorage.setItem(key,VER);
 }
})();

// ─── Defaults ───
// ═══════════════════════════════════════════════════════════════
// SECTION: DEFAULTS
// All configurable test parameters. Changes here affect ALL users.
// Admin panel allows per-device override (localStorage only).
// To permanently change a default, edit here and push to GitHub.
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// THREE TEST MODES
// mode1 = original adaptive CogSpeed test
// mode2 = Self-Paced Calibration (SPC) only
// mode3 = Self-Paced Calibration + fixed Machine-Paced (SPCMP)
// Mode 2 and Mode 3 use their own defaults below.
// ═══════════════════════════════════════════════════════════════
const DEFAULTS={
 adminPasscode:"4822",
 testMode:"mode1",
 mode2TrialLimit:150,
 mode2MaxDurationMs:120000,
 mode3CalibrationTrials:10,
 mode3PacedTrialLimit:140,
 mode3MaxDurationMs:120000,
 mode3BaselineFactor:1.3,
 consecutiveMissesForBlock:2,
  blockRestartPercent:1.2,
 wrongSlowdownMs:50,
 correctSpeedupFactor:0.20,
 minSpeedupOnCorrectMs:50,
 maxSpeedupOnCorrectMs:200,
 convergenceMinSpeedupOnCorrectMs:25,
 convergenceMaxSpeedupOnCorrectMs:50,
 convergenceClampThresholdMs:1400,
 spRestartWrongLimit:3,
 spRestartCorrectStreak:2,
 maxBlockCount:6,
 qualifyingBlockGapMs:250,
 rollMeanWindow:10,
 rollMeanThreshold:0.50,
 machinePacedNoResponseMs:15000,
 recoveryNoResponseMs:10000,
 calibrationFirstNoResponseMs:10000,
 calibrationNoResponseMs:6000,
 wrongWindowSize:5,
 wrongThresholdStop:4,
 maxTrialCount:180,
 maxPacedWrong:20,
 maxTestDurationMs:150000,
 minDurationMs:600,
 maxDurationMs:3500,
 initialUnusedCalibrationTrials:2,
 initialMeasuredCalibrationTrials:7,
 initialPacedPercent:1.2,
 calibrationStopErrors:4,
 calibrationStopSlowMs:6000,
 cpiBestMs:800,
 cpiWorstMs:2400,
 deviceBenchmarkEnabled:0,
 lateResponseThresholdMs:600 // first response <600ms on next frame may belong to prior frame; a second >=600ms response belongs to current frame
};

// ═══════════════════════════════════════════════════════════════
// SECTION: ADMIN PANEL — FIELD DEFINITIONS
// Each entry: [settingKey, label, type]
// Drives the admin form UI and maps to DEFAULTS keys above.
// ═══════════════════════════════════════════════════════════════
const ADMIN_FIELDS=[
 // 1. Admin passcode
 ["adminPasscode","1. Admin passcode","text"],

 // 2-16. Defaults used across all modes, ordered by use in the test
 ["initialUnusedCalibrationTrials","2. Warm-up calibration trials (default 2)","number"],
 ["initialMeasuredCalibrationTrials","3. Measured calibration trials (default 7)","number"],
 ["calibrationFirstNoResponseMs","4. Calibration first-trial no-response (ms, default 10000)","number"],
 ["calibrationNoResponseMs","5. Calibration later-trial no-response (ms, default 6000)","number"],
 ["calibrationStopErrors","6. Calibration stop after N wrong (default 4)","number"],
 ["calibrationStopSlowMs","7. Calibration avg RT limit (ms, default 6000)","number"],
 ["minDurationMs","8. MP frame minimum duration (ms, default 600)","number"],
 ["maxDurationMs","9. MP frame maximum duration (ms, default 3500)","number"],
 ["machinePacedNoResponseMs","10. MP no-response timeout (ms, default 15000)","number"],
 ["maxTestDurationMs","11. Max total test time (ms, default 150000)","number"],
 ["wrongWindowSize","12. Anti-spoof wrong window size (default 5)","number"],
 ["wrongThresholdStop","13. Anti-spoof max wrong in window (default 4)","number"],
 ["rollMeanWindow","14. Anti-spoof rolling mean window (default 10)","number"],
 ["rollMeanThreshold","15. Anti-spoof rolling mean threshold (default 0.50)","number"],

 // 16. Test mode
 ["testMode","16. Test mode","select:mode1|mode2|mode3"],

 // 17-35. Mode 1 settings, ordered by use
 ["initialPacedPercent","17. Mode 1 MP start: % of calibration avg (default 1.2)","number"],
 ["consecutiveMissesForBlock","18. Mode 1 misses to trigger block (default 2)","number"],
 ["blockRestartPercent","19. Mode 1 restart: % of block baseline (default 1.2)","number"],
 ["spRestartCorrectStreak","20. Mode 1 recovery correct streak to resume (default 2)","number"],
 ["spRestartWrongLimit","21. Mode 1 recovery max wrong before fail (default 3)","number"],
["wrongSlowdownMs","22. Mode 1 MP slowdown on wrong (ms, default 50)","number"],
["correctSpeedupFactor","23. Mode 1 MP correct formula factor (default 0.20)","number"],
["minSpeedupOnCorrectMs","24. Mode 1 MP minimum speedup on correct (ms, default 50)","number"],
["maxSpeedupOnCorrectMs","25. Mode 1 MP maximum speedup on correct (ms, default 200)","number"],
["convergenceMinSpeedupOnCorrectMs","26. Mode 1 convergent minimum speedup on correct (ms, default 25)","number"],
["convergenceMaxSpeedupOnCorrectMs","27. Mode 1 convergent maximum speedup on correct (ms, default 50)","number"],
["convergenceClampThresholdMs","28. Mode 1 convergent clamp threshold (ms, default 1400)","number"],
 ["recoveryNoResponseMs","29. Mode 1 recovery no-response timeout (ms, default 10000)","number"],
 ["maxBlockCount","30. Mode 1 max total blocks before fail (default 6)","number"],
 ["qualifyingBlockGapMs","31. Mode 1 convergent block max gap (ms, default 250)","number"],
 ["maxTrialCount","32. Mode 1 max paced trials (default 180)","number"],
 ["maxPacedWrong","33. Mode 1 max paced wrong before fail (default 20)","number"],
 ["cpiBestMs","34. Mode 1 CPI best ms anchor (default 800)","number"],
 ["cpiWorstMs","35. Mode 1 CPI worst ms anchor (default 2400)","number"],

 // 30-31. Mode 2 settings, ordered by use
 ["mode2TrialLimit","30. Mode 2 SPC trial limit (default 150)","number"],
 ["mode2MaxDurationMs","31. Mode 2 total duration ms (default 120000)","number"],

 // 32-36. Mode 3 settings, ordered by use
 ["mode3CalibrationTrials","32. Mode 3 self-paced calibration trials (default 10)","number"],
 ["mode3BaselineFactor","33. Mode 3 MP baseline factor from cal avg (default 1.3)","number"],
 ["mode3PacedTrialLimit","34. Mode 3 fixed machine-paced trial limit (default 140)","number"],
 ["mode3MaxDurationMs","35. Mode 3 total duration ms (default 120000)","number"],
 ["deviceBenchmarkEnabled","36. Device benchmark (0=off, 1=on)","number"],
];

// ─── Patterns ───
// ═══════════════════════════════════════════════════════════════
// SECTION: DOT / LINE PATTERN DEFINITIONS
// Patterns 1-6 for both families (dots and lines).
// Each entry: array of [type, x%, y%] marks drawn inside gear body.
// Type "dot"=circle, "v"=vertical rectangle (line).
// ═══════════════════════════════════════════════════════════════
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
// ═══════════════════════════════════════════════════════════════
// SECTION: SP-FS — SAMN-PERELLI FATIGUE SCALE
// 7-point Likert scale. Score 7=fully alert, 1=unable to function.
// Validated by Samn & Perelli (1982). Collected before each test.
// [PLANNED] Collect post-test SP-FS for fatigue change delta.
// ═══════════════════════════════════════════════════════════════
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
 const s=JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}_settings`)||"null");
 if(!s) return {...DEFAULTS};
 const m={...DEFAULTS};
 Object.keys(DEFAULTS).forEach(k=>{ if(s[k]!==undefined) m[k]=s[k]; });
 return m;
}
function saveSettings(){ localStorage.setItem(`${STORAGE_PREFIX}_settings`,JSON.stringify(settings)); }
let settings=loadSettings();

// ─── State ───
const state={
 phase:"idle", duration:null, blockDuration:null, profile:null,
 current:null, previous:null, unresolvedStreak:0,
 overloads:[], recoveries:[], recoveryCorrectCompleted:0,
 spCorrectStreak:0, spWrongCount:0, terminalBlockReason:null,
 history:(function(){ try { return JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}_history`)||"[]"); } catch(e){ return []; } })(),
 totalTrials:0, totalResponses:0, totalCorrect:0, totalIncorrect:0,
 missedTrials:0, pacedErrors:0, recoveryErrors:0, rollMeanLog:[],
 testStartTime:null, trialTimer:null, absoluteNoResponseTimer:null, maxTestTimer:null,
 lastFiveAnswers:[], samnPerelli:null, subjectId:null,
 calibrationTrialIndex:0, calibrationRTs:[], calibrationErrors:0,
 pacedRTs:[], rtLog:[], previousMissed:false, lastFrameDuration:null,
 presentedRoundDuration:null,
 activeMode:"mode1", selfPacedRTs:[], selfPacedCorrect:0, selfPacedWrong:0,
 fixedPacedBaseline:null, fixedPacedPresented:0, fixedPacedCorrect:0, fixedPacedWrong:0,
 hadResponse:false, endReason:"", blockRestartBaseline:null,
 trialOpenedAt:null, geo:null, benchmark:null, lastResultText:null,
 _prevTrialOpenedAt:null, _prevPresentedDurationMs:null,
 pendingPriorMiss:null, pendingLatePacing:null
 // pendingPriorMiss:
 //   stores the immediately previous paced frame when it LOOKED like a miss at frame end,
 //   but is still inside the late-response grace rule window.
 // pendingLatePacing:
 //   stores a provisional speedup/slowdown result for frame 1 when a <600 ms tap on frame 2
 //   is reassigned backward to frame 1. That provisional pacing change is applied only if
 //   frame 2 ends with no later response of its own. If frame 2 later gets its own response
 //   (>600 ms after frame 2 appeared), frame 1's provisional pacing change is discarded.
};

// ─── DOM ───
const $=id=>document.getElementById(id);
const stimGrid=$("stimGrid"), probeCell=$("probeCell"), probeInner=$("probeInner"),
   respGrid=$("respGrid"), rateOut=$("rateOut"), blocksOut=$("blocksOut"),
   recoveryOut=$("recoveryOut"), wrongOut=$("wrongOut"), fatigueOut=$("fatigueOut"),
   cpiOut=$("cpiOut"), statusLine=$("statusLine"), resultBox=$("resultBox"),
   phaseLabel=$("phaseLabel"), modeLabel=$("modeLabel");

function syncReleaseUI(){
 document.title = `CogSpeed ${APP_VERSION}`;
 const badge = $("versionBadge");
 if(badge) badge.textContent = APP_VERSION;
 if(statusLine) statusLine.textContent = `CogSpeed ${APP_VERSION}`;
}
syncReleaseUI();

// ─── Utilities ───
function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
// ─── MATH UTILITIES ───────────────────────────────────────────
function clamp(v,lo,hi){ return Math.min(hi,Math.max(lo,v)); }
function mean(a){ return a.length?a.reduce((x,y)=>x+y,0)/a.length:0; }
function stdDev(a){ if(a.length<2) return null; const m=mean(a); return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/(a.length-1)); }
function shuffle(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]; } return a; }
function subjectKey(id){ return id==="0"?"Guest":id; }
function setStatus(m){ statusLine.textContent=m; }
function formatDuration(ms){ if(ms==null) return "—"; const s=Math.round(ms/1000),m=Math.floor(s/60); return m>0?`${m}m ${s%60}s`:`${s}s`; }
// Mode helpers centralize mode checks so start / finish / summary logic
// can switch cleanly between CogSpeed, SPC, and SPCMP behavior.
function isMode1(){ return (settings.testMode||"mode1")==="mode1"; }
function isMode2(){ return (settings.testMode||"mode1")==="mode2"; }
function isMode3(){ return (settings.testMode||"mode1")==="mode3"; }
function currentModeLabel(){ return isMode1() ? "CogSpeed Mode" : isMode2() ? "SPC Mode" : "SPCMP Mode"; }
function getSessionMaxDurationMs(){ return isMode2() ? (Number(settings.mode2MaxDurationMs)||150000) : isMode3() ? (Number(settings.mode3MaxDurationMs)||150000) : (Number(settings.maxTestDurationMs)||150000); }

// ─── CPI ───
// ─── CPI SCORE CALCULATION ────────────────────────────────────
// Converts avg last 2 block durations (ms) to 0-100 CPI score.
// Scale: cpiBestMs=800ms → CPI 100, cpiWorstMs=3000ms → CPI 0.
// Source: Perelli (2026). Formula: (worst-ms)/(worst-best)*100
// ──────────────────────────────────────────────────────────────
function computeCPI(avgMs){
 const best=Number(settings.cpiBestMs),worst=Number(settings.cpiWorstMs),span=worst-best;
 if(!isFinite(best)||!isFinite(worst)||span<=0) return 0;
 return Math.max(0,Math.min(100,((worst-avgMs)/span)*100));
}
function updateCPIDisplay(avg){
 if(isMode2()||isMode3()){
  cpiOut.textContent=avg!=null?`${Math.round(avg)}ms`:"—";
  return;
 }
 cpiOut.textContent=avg!=null?computeCPI(avg).toFixed(0):"—";
 }

// ─── Timers ───
function clearTimer(){
 if(state.trialTimer){
  if(state._trialTimerIsRaf) cancelAnimationFrame(state.trialTimer);
  else clearTimeout(state.trialTimer);
 }
 state.trialTimer=null;
 state._trialTimerIsRaf=false;
}
function clearNoResponseTimer(){ if(state.absoluteNoResponseTimer) clearTimeout(state.absoluteNoResponseTimer); state.absoluteNoResponseTimer=null; }
function clearMaxTestTimer(){ if(state.maxTestTimer) clearTimeout(state.maxTestTimer); state.maxTestTimer=null; }
// Absolute "not responding" timer — keeps tests from hanging forever.
// Calibration trial 1 uses calibrationFirstNoResponseMs (default 10s).
// Later calibration trials use calibrationNoResponseMs (default 6s).
// Machine-paced uses machinePacedNoResponseMs (default 15s).
// Recovery uses recoveryNoResponseMs (default 10s).
// Fires finish() with a no-response end reason if nothing is tapped in time.
function armNoResponseTimer(){
 clearNoResponseTimer();
 let ms;
 switch(state.phase){
  case "recovery":
  case "terminal_recovery":
   ms = Number(settings.recoveryNoResponseMs)||10000;
   break;
  case "calibration":
   ms = state.calibrationTrialIndex===0
    ? (Number(settings.calibrationFirstNoResponseMs)||10000)
    : (Number(settings.calibrationNoResponseMs)||6000);
   break;
  case "paced":
  case "mode3_paced":
   // Machine-paced trials are governed by frame timers and block logic, not by absolute no-response timeout.
   return;
  default:
   ms = 10000;
 }
 state.absoluteNoResponseTimer=setTimeout(()=>{
  state.endReason = state.phase==="calibration"
   ? "NO RESPONSE — Retest"
   : "NOT RESPONDING IN TIME — Retest";
  finish();
 }, ms);
}
function armMaxTestTimer(){
 clearMaxTestTimer();
 const ms=getSessionMaxDurationMs();
 state.maxTestTimer=setTimeout(()=>{ state.endReason=(isMode2()||isMode3())?"Required test time reached":"Time limit reached"; finish(); },ms);
}
function noteAnyResponse(){
 if(state.phase==="calibration" || state.phase==="recovery" || state.phase==="terminal_recovery"){
  armNoResponseTimer();
 }
}

// ─── Quiet mode ───
function setTestingQuiet(q){
 if(resultBox) resultBox.classList[q?"add":"remove"]("hidden");
}

// ─── Geo (fire and forget) ───
// ─── GEO LOCATION CAPTURE ─────────────────────────────────────
// Fire-and-forget: requests GPS coords, reverse-geocodes via
// Nominatim API, stores human-readable address in state.geo.
// Saved with each result record for field deployment tracking.
// ──────────────────────────────────────────────────────────────
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
// Lines: black fill with white outline stroke in both tutorial and live test.
// Dots: white fill with black outline stroke (unchanged).

function patternToSVG(pattern,size="large"){
 const dim=size==="probe"?72:size==="small"?40:56;
 const dotR=size==="probe"?11:size==="small"?7:10;
 const lw=size==="probe"?12:size==="small"?7:9;
 const lh=size==="probe"?40:size==="small"?24:34;
 const marks=pattern.map(([k,x,y])=>{
  const px=(x/100)*dim,py=(y/100)*dim;
  return k==="dot"
   ?`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${dotR}" fill="var(--text)" stroke="black" stroke-width="3"/>`
   :`<rect x="${(px-lw/2).toFixed(1)}" y="${(py-lh/2).toFixed(1)}" width="${lw}" height="${lh}" rx="2" fill="#000000" stroke="#ffffff" stroke-width="3"/>`;
 }).join("");
 return `<svg width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}" xmlns="http://www.w3.org/2000/svg">${marks}</svg>`;
}

// ─── Trial generation ───
// ─── TRIAL GENERATION ─────────────────────────────────────────
// Creates one trial: randomly assigns probe (family+count),
// generates 6 target gears, places correct target at random position.
// Rule: correct target has SAME count as probe, OPPOSITE family.
// Constraint: consecutive trials never repeat probe family+count.
// ──────────────────────────────────────────────────────────────
function makeTrial(kind,lastCorrectPos,lastProbe){
 for(let attempt=0;attempt<500;attempt++){
  const probeFamily=Math.random()<0.5?"dots":"lines";
  const probeCount=randInt(1,6);
  // Reject if same probe as previous trial — never show the same probe twice in a row
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
   if(i===correctPos){
    families.push(oppFamily);
   } else {
    families.push(counts[i]===probeCount ? probeFamily : (Math.random()<0.5 ? "dots" : "lines"));
   }
  }
  // Force a true mix of dots and lines on the top targets while preserving exactly one correct answer.
  if(!families.includes("dots") || !families.includes("lines")) continue;
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
// ═══════════════════════════════════════════════════════════════
// SECTION: GEAR VISUAL DEFINITIONS
// 7 unique mechanical cog styles: index 0=probe, 1-6=cell pairs.
// Each: tooth count, radius, body/stroke colors, hub, spokes.
// Range: #4a4a4a (darkest) to #8c8c8c (lightest gray).
// Probe (0): dark navy + blue glow for clear visual distinction.
// ═══════════════════════════════════════════════════════════════

const GEAR_IMAGE_SRCS = {
 0: "./gear0.png",
 1: "./gear1.png",
 2: "./gear2.png",
 3: "./gear3.png",
 4: "./gear4.png",
 5: "./gear5.png",
 6: "./gear6.png",
};

function ensureGearImageStyles(){
 if(document.getElementById("gearImageStyles")) return;
 const st=document.createElement("style");
 st.id="gearImageStyles";
 st.textContent=`
  #testScreen{background:#6e6e6e!important;}
  .gear-img-wrap{
   position:relative;
   width:100%;
   height:100%;
   display:flex;
   align-items:center;
   justify-content:center;
   overflow:visible;
  }
  .gear-img-wrap img{
   position:relative;
   z-index:1;
   width:126%;
   height:126%;
   object-fit:contain;
   display:block;
   filter:contrast(1.14) saturate(0.95) brightness(1.02);
   transform-origin:50% 50%;
  }
  .gear-img-wrap.gspin-f img{ animation:gSpinF 1.0s linear infinite; }
  .gear-img-wrap.gspin-r img{ animation:gSpinR 1.0s linear infinite; }
  .gear-img-wrap.gidle-f img{ animation:gSpinF 9s linear infinite; }
  .gear-img-wrap.gidle-r img{ animation:gSpinR 9s linear infinite; }
  .gear-mark{
   position:absolute;
   z-index:2;
   transform:translate(-50%,-50%);
   background:#ffffff;
   border:3px solid #111;
   box-shadow:0 0 4px rgba(0,0,0,0.6);
   opacity:0.98;
   pointer-events:none;
  }
  .gear-mark.dot{
   border-radius:50%;
  }
  .gear-mark.line{
   border-radius:3px;
   background:#000000;
   border-color:#ffffff;
  }
  #testScreen .resp-btn.correct-flash .gear-img-wrap{
   filter:brightness(1.45) drop-shadow(0 0 16px rgba(220,255,220,.95));
  }
  #testScreen .resp-btn.wrong-flash .gear-img-wrap{
   filter:brightness(0.55) saturate(0);
  }
 `;
 document.head.appendChild(st);
}

// Build realistic gear path: flat-topped teeth with root/tip circular arcs
// ─── GEAR RENDERING ───────────────────────────────────────────
// Builds realistic mechanical gear SVG path with flat-topped teeth,
// circular root arcs, and tip chamfers.
// buildGearSVG() assembles full SVG with gradient, spokes, hub,
// and dot/line pattern marks rendered inside the gear body.
// spinClass: "gspin-f"|"gspin-r"|"" (no spin during test)
// ──────────────────────────────────────────────────────────────
function buildGearSVG(si,pattern,size,spinClass){
 ensureGearImageStyles();
 const marks = [];
 if(pattern){
  const scale = size==="probe" ? 0.64 : 0.60;
  const dotR = size==="probe" ? 13 : 11;
  const lw  = size==="probe" ? 15 : 13;
  const lh  = size==="probe" ? 38 : 30;
  pattern.forEach(([k,px,py])=>{
   const left = 50 + ((px/100)-0.5) * scale * 100;
   const top = 50 + ((py/100)-0.5) * scale * 100;
   if(k==="dot"){
    marks.push(`<div class="gear-mark dot" style="left:${left.toFixed(1)}%;top:${top.toFixed(1)}%;width:${dotR*2}px;height:${dotR*2}px"></div>`);
   } else {
    marks.push(`<div class="gear-mark line" style="left:${left.toFixed(1)}%;top:${top.toFixed(1)}%;width:${lw}px;height:${lh}px"></div>`);
   }
  });
 }
 const src = GEAR_IMAGE_SRCS[si] || GEAR_IMAGE_SRCS[0];
 return `<div class="gear-img-wrap ${spinClass||""}">
   <img src="${src}" alt="gear ${si}" draggable="false"/>
   ${marks.join("")}
  </div>`;
}
// ─── Render trial (gear version) ───
// ─── TRIAL RENDERING ──────────────────────────────────────────
// Renders probe gear + 6 stimulus gears + 6 response buttons.
// No rotation during test (spinClass=""). Clears all spin classes
// from probeCell to prevent carry-over from intro/outro spin.
// ──────────────────────────────────────────────────────────────
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
  // Pass event.timeStamp for tighter RT timing.
  btn.addEventListener("pointerdown",(e)=>handleTap(idx,e.timeStamp));
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
 wrongOut.textContent=String(state.totalIncorrect);
 fatigueOut.textContent=state.samnPerelli?String(state.samnPerelli.score):"—";
 if(modeLabel) modeLabel.textContent=currentModeLabel();
}

// ─── Trial log ───
// ─── TRIAL LOGGING ────────────────────────────────────────────
// Appends one entry to state.rtLog per trial response.
// Captures: phase, RT, outcome, probe, correct cell, response cell.
// Late-catch logs against previous trial (not current).
// ──────────────────────────────────────────────────────────────
function logTrial({phase,rt,outcome,responseIndex,counted}){
 const trial=state.current; if(!trial) return;
 const ci=trial.topItems[trial.correctPos];
 const ri=responseIndex!=null?trial.topItems[responseIndex]:null;
 const loggedDurationMs = (
  phase==="paced" || phase==="paced_wrong" || phase==="paced_late_correct" || phase==="paced_late_wrong" || phase==="missed" || phase==="paced_fixed" || phase==="paced_fixed_wrong" || phase==="paced_fixed_missed"
 ) ? (state.presentedRoundDuration!=null ? state.presentedRoundDuration : (state.duration?Math.round(state.duration):null))
   : (state.duration?Math.round(state.duration):null);

 let interTrialGapMs = null;
 if(state._prevTrialOpenedAt!=null && state.trialOpenedAt!=null && state._prevPresentedDurationMs!=null){
  interTrialGapMs = Math.round(state.trialOpenedAt - state._prevTrialOpenedAt - state._prevPresentedDurationMs);
  if(interTrialGapMs < 0) interTrialGapMs = 0;
 }

 state.rtLog.push({
  seq:state.rtLog.length+1, phase, clockTime:new Date().toISOString(),
  durationMs:loggedDurationMs,
  rt:rt!=null?Math.round(rt):null, outcome,
  probe:`${trial.probeFamily}:${trial.probeCount}`,
  correctCell:ci?`${ci.family}:${ci.count} @${trial.correctPos+1}`:"—",
  response:ri?`${ri.family}:${ri.count} @${responseIndex+1}`:(responseIndex!=null?`pos${responseIndex+1}`:"no_response"),
  warmup: counted===false,
  counted,
  interTrialGapMs
 });
}

// ─── Answer recording ───
// Trial log duration for paced-family rows uses the PRESENTED round duration,
// not the already-updated baseline after correct/wrong pacing adjustments.
// ─── ANSWER RECORDING + ANTI-SPOOF ───────────────────────────
// recordAnswer(): updates rolling mean + wrong-window checks.
// ANTI-SPOOF — ROLLING MEAN: if correct% < 50% in last 8 taps
//  → "TOO MANY WRONG RESPONSES! — Retest"
// ANTI-SPOOF — WRONG WINDOW: if >4 wrong in last 5 taps → stop.
// Misses (isMiss=true) excluded from both checks (taps only).
// ──────────────────────────────────────────────────────────────
function trialMatches(trial,index){ return trial&&index===trial.correctPos; }
// ─── MAX PACED WRONG CHECK ───────────────────────────
// checkMaxPacedWrong(): ends test if total paced wrong
//  responses reach maxPacedWrong (default 20).
// Called after every pacedErrors increment.
// ──────────────────────────────────────────────────────
function checkMaxPacedWrong(){
 const limit=Number(settings.maxPacedWrong)||20;
 if(state.pacedErrors>=limit){ state.endReason=`FAILED: reached paced wrong-tap limit (${limit})`; finish(); return true; }
 return false;
}
function recordAnswer(ok,isMiss){
 if(!isMiss){
  state.lastFiveAnswers.push(ok);
  if(state.lastFiveAnswers.length>settings.wrongWindowSize) state.lastFiveAnswers.shift();
  state.rollMeanLog.push(ok);
  const win=Math.max(1,Math.round(Number(settings.rollMeanWindow)||8));
  if(state.rollMeanLog.length>win) state.rollMeanLog.shift();
  if(state.rollMeanLog.length===win){
   const ratio=state.rollMeanLog.filter(v=>v===true).length/win;
   const thresh=Number(settings.rollMeanThreshold)||0.50;
   if(ratio<thresh){ state.endReason=`FAILED: rolling mean below threshold (${win} responses, threshold ${thresh})`; finish(); return true; }
  }
  const wc=state.lastFiveAnswers.filter(v=>v===false).length;
  if(state.lastFiveAnswers.length===settings.wrongWindowSize&&wc>=settings.wrongThresholdStop){
   state.endReason=`FAILED: too many wrong in last ${settings.wrongWindowSize} responses`; finish(); return true;
  }
 }
 updateMetrics(); return false;
}
// ─── TERMINAL RECOVERY RULE ───────────────────────────────────
// maybeTriggerTerminalRule(): fires when 2 consecutive block scores
//  fall within qualifyingBlockGapMs (250ms) of each other.
// → Triggers 2 final self-paced trials, then finishes with SUCCESS.
// avgLast2Blocks(): mean of the last 2 overload (block) durations.
// ──────────────────────────────────────────────────────────────
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
function failCalibration(reason){ state.endReason=reason; finish(); }
// ─── CALIBRATION — SELF-PACED ─────────────────────────────────
// Warm-up trials:
//   initialUnusedCalibrationTrials (default 2) are shown first and never used
//   in averaging or measured-calibration counts.
//
// Measured calibration phase:
//   After warmups, keep presenting self-paced trials until the number of
//   CORRECT measured responses reaches initialMeasuredCalibrationTrials
//   (default 7).
//
// IMPORTANT:
//   Wrong-response RTs are NEVER included in calibration averaging.
//   Only correct measured calibration RTs are averaged.
//
// CHECK ADEQUATELY TRAINED:
//   calibrationErrors >= calibrationStopErrors (default 4)
//   → fail with "TOO MANY WRONG RESPONSES — Practice!"
//
// CHECK RESPONSE SPEED:
//   any correct measured calibration RT > calibrationStopSlowMs (default 6000)
//   → fail with "NOT RESPONDING IN TIME — Practice!"
//
// DETERMINE BASELINE RT FOR MODE 1 AND MODE 3:
//   avg of the required number of CORRECT measured calibration RTs
//   → paced start / fixed baseline derivation
//
// CONDITION 4:
//   avg correct measured calibration RT > calibrationStopSlowMs
//   → "NEED MORE PRACTICE!"
//
// NO-RESPONSE TIMEOUTS: first trial=10s, subsequent=6s
// ──────────────────────────────────────────────────────────────
// finishCalibration() now branches by selected mode:
// mode1 -> original adaptive machine-paced CogSpeed phase
// mode2 -> finish after self-paced-only session
// mode3 -> begin fixed-baseline machine-paced phase using
//          calibration average × mode3BaselineFactor
//          IMPORTANT: mode3CalibrationTrials means CORRECT MEASURED trials;
//          initialUnusedCalibrationTrials warmups are added on top and
//          wrong measured trials do not count toward the target or the average.
function finishCalibration(){
 const avg=mean(state.calibrationRTs.length?state.calibrationRTs:state.selfPacedRTs);
 if(isMode2()){
  state.endReason = state.endReason || "Required responses reached";
  finish(); return;
 }
 if(isMode3()){
  const factor=Number(settings.mode3BaselineFactor)||1.3;
  state.fixedPacedBaseline=clamp(avg*factor,settings.minDurationMs,settings.maxDurationMs);
  state.duration=state.fixedPacedBaseline;
  state.phase="paced_fixed";
  setStatus(`Mode 3 fixed baseline: ${state.duration.toFixed(0)}ms`);
  openTrial("paced_fixed");
  return;
 }
 // Condition 4: avg RT too slow — needs more practice
 if(avg>settings.calibrationStopSlowMs){
  state.endReason="NEED MORE PRACTICE!";
  finish(); return;
 }
 state.duration=clamp(avg*settings.initialPacedPercent,settings.minDurationMs,settings.maxDurationMs);
 state.phase="paced";
 setStatus(`Machine-paced start: ${state.duration.toFixed(0)}ms`);
 openTrial("paced");
}

// ─── Pacing ───
// ─── PACED BASELINE UPDATE ALGORITHM ─────────────────────────
// PACED MODE ONLY. Self-paced calibration is NOT changed.
//
// CORRECT RESPONSE ON ITS OWN FRAME:
//   r = responseTime / roundDuration
//   deltaMs = (f*r - f) * roundDuration
//           = f * (responseTime - roundDuration)
//   where f = correctSpeedupFactor (default 0.20)
//
// IMPORTANT:
//   On CORRECT responses before convergence:
//     minimum speedup = minSpeedupOnCorrectMs (default 50 ms)
//     maximum speedup = maxSpeedupOnCorrectMs (default 200 ms)
//   After the first block, or near the low-ms floor:
//     minimum speedup = convergenceMinSpeedupOnCorrectMs (default 25 ms)
//     maximum speedup = convergenceMaxSpeedupOnCorrectMs (default 50 ms)
//   On slowdown from the correct-response formula:
//     maximum slowdown = 100 ms.
//
// WRONG RESPONSE ON ITS OWN FRAME:
//   baseline += wrongSlowdownMs (default 50 ms)
//
// TRUE NO RESPONSE:
//   baseline unchanged
//
// LATE-BOUNDARY RULE ACROSS 2 CONSECUTIVE FRAMES:
//   Frame 1 can LOOK like a miss when it expires.
//   However, if the FIRST tap on Frame 2 occurs in < lateResponseThresholdMs
//   (default 600 ms), that first tap is treated as belonging to Frame 1, not Frame 2.
//
//   In that case:
//
//   FRAME 1:
//     - is NOT counted as a miss
//     - gets response time:
//         frame1PresentationDuration + firstTapRTonFrame2
//     - if the reassigned response is correct:
//         a provisional correct-response pacing calculation is computed for Frame 1
//     - if the reassigned response is wrong:
//         a provisional wrong-response pacing calculation is computed for Frame 1
//
//   FRAME 2 IMMEDIATELY AFTER THAT FIRST <600 ms TAP:
//     - is still treated as having NO response of its own yet
//     - keeps the same presentation duration that was shown on screen
//       (because when Frame 2 first appeared, Frame 1 still looked like a no-response)
//
//   THEN THERE ARE 2 POSSIBILITIES:
//
//   A) NO SECOND RESPONSE OCCURS DURING FRAME 2:
//      - Frame 2 becomes the true miss
//      - Frame 1's provisional pacing calculation is applied forward to Frame 3
//
//   B) A SECOND RESPONSE OCCURS DURING FRAME 2 AT >= 600 ms:
//      - that second tap is treated as Frame 2's own response
//      - Frame 2 is NOT counted as a miss
//      - Frame 2 gets its own RT measured from Frame 2 onset to that second tap
//      - Frame 2's own pacing calculation is applied to Frame 3
//      - the earlier provisional pacing calculation for Frame 1 is IGNORED
//
// This rule reduces false misses while preserving the visible frame timing.
// After any actual applied update, clamp baseline to:
//   [settings.minDurationMs, settings.maxDurationMs]
// ──────────────────────────────────────────────────────────────
function applyPacing(rt,correct){
 if(correct){
  if(rt==null||!isFinite(rt)||!isFinite(state.duration)) return;
  const roundDuration=state.duration;
  const r=rt/roundDuration;
  const f = Number(settings.correctSpeedupFactor)||0.20;
  let deltaMs=(f*r-f)*roundDuration;

  const afterFirstBlock = Array.isArray(state.overloads) && state.overloads.length >= 1;
  const nearFloor = roundDuration <= (Number(settings.convergenceClampThresholdMs)||1400);

  const minSpeed = afterFirstBlock || nearFloor
    ? (Number(settings.convergenceMinSpeedupOnCorrectMs)||25)
    : (Number(settings.minSpeedupOnCorrectMs)||50);

  const maxSpeed = afterFirstBlock || nearFloor
    ? (Number(settings.convergenceMaxSpeedupOnCorrectMs)||50)
    : (Number(settings.maxSpeedupOnCorrectMs)||200);

  if(deltaMs < 0){
    const speedupMag = Math.min(maxSpeed, Math.max(minSpeed, Math.abs(deltaMs)));
    deltaMs = -speedupMag;
  }else{
    deltaMs = Math.min(100, deltaMs);
  }

  state.duration=clamp(state.duration+deltaMs,settings.minDurationMs,settings.maxDurationMs);
 }else{
  const wrongSlow = Number(settings.wrongSlowdownMs)||50;
  state.duration=clamp(state.duration+wrongSlow,settings.minDurationMs,settings.maxDurationMs);
 }
}

// ─── Finish ───
// ─── TEST FINISH ──────────────────────────────────────────────
// Called by all end conditions (success + all 8 failure modes).
// Computes final CPI, paced RT stats, test duration.
// Also stamps the session number used by full-size graphs and metadata.
// Saves result to state.history (localStorage: ${STORAGE_PREFIX}_history).
// Triggers gear spin outro → thinking box → outcome box → summary.
// ──────────────────────────────────────────────────────────────
function finish(){
 clearTimer(); clearNoResponseTimer(); clearMaxTestTimer();
 state.phase="finished";
 const avg2=avgLast2Blocks(), cps=avg2!=null?computeCPI(avg2):null;
 const pacedSd=stdDev(state.pacedRTs);
 const selfPacedSd=stdDev(state.selfPacedRTs);
 const allResponseRTs=[...state.selfPacedRTs, ...state.pacedRTs];
 const allResponseMean=allResponseRTs.length?mean(allResponseRTs):null;
 const allResponseSd=stdDev(allResponseRTs);
 const blockDiff=state.overloads.length>=2?state.overloads[state.overloads.length-1]-state.overloads[state.overloads.length-2]:null;
 const testDurMs=state.testStartTime!=null?performance.now()-state.testStartTime:null;
 // Mode-specific result payload fields:
// mode1 -> adaptive CogSpeed metrics (blocks / CPI from adaptive phase)
// mode2 -> self-paced counts and self-paced mean RT
// mode3 -> self-paced counts, calibration average, fixed MP baseline,
//          fixed machine-paced counts, and machine-paced mean RT
const modeMetricMs = isMode2() ? (state.selfPacedRTs.length?mean(state.selfPacedRTs):null) : isMode3() ? (state.pacedRTs.length?mean(state.pacedRTs):(state.fixedPacedBaseline||null)) : avg2;
 const modeCPI = (isMode2()||isMode3()) ? null : (modeMetricMs!=null ? computeCPI(modeMetricMs) : cps);
 const result={
  sessionNumber: state.history.length + 1,
  testMode: state.activeMode||settings.testMode||"mode1",
  subjectId:subjectKey(state.subjectId||"0"),
  profile:state.profile?{gender:state.profile.gender,age:computeAge(state.profile.birthMonth,state.profile.birthYear),emailResults:state.profile.emailResults}:null,
  samnPerelli:state.samnPerelli,
  calibrationAverageMs:state.calibrationRTs.length?mean(state.calibrationRTs):null,
  blocks:[...state.overloads], blockCount:state.overloads.length,
  averageLast2BlockingScoresMs:modeMetricMs, blockScoreDifferenceMs:blockDiff,
  cognitivePerformanceIndex:modeCPI, totalResponses:state.totalResponses,
  totalTrials:state.totalTrials, totalCorrect:state.totalCorrect,
  totalIncorrect:state.totalIncorrect, missedTrials:state.missedTrials,
  calibrationErrors:state.calibrationErrors,
  pacedErrors:state.pacedErrors, recoveryErrors:state.recoveryErrors, pacedResponseCount:state.pacedRTs.length,
  pacedResponseMeanMs:state.pacedRTs.length?mean(state.pacedRTs):null,
  pacedResponseSdMs:pacedSd, testDurationMs:testDurMs,
  selfPacedResponseCount: state.selfPacedRTs.length, selfPacedResponseMeanMs: state.selfPacedRTs.length?mean(state.selfPacedRTs):null,
  selfPacedResponseSdMs: selfPacedSd,
  allResponseMeanMs: allResponseMean, allResponseSdMs: allResponseSd,
  selfPacedCorrect: state.selfPacedCorrect, selfPacedWrong: state.selfPacedWrong,
  fixedPacedBaselineMs: state.fixedPacedBaseline, fixedPacedPresented: state.fixedPacedPresented,
  fixedPacedCorrect: state.fixedPacedCorrect, fixedPacedWrong: state.fixedPacedWrong,
  rtLog:[...state.rtLog], endReason:state.endReason||"Run complete",
  time:new Date().toISOString(), geo:state.geo
 };
 state.history.push(result);
localStorage.setItem(`${STORAGE_PREFIX}_history`,JSON.stringify(state.history));
 updateStartPageLinks();
updateCPIDisplay(avg2); setProbeIdle();
 // Build the display text (also used for email)
 buildSummary(result);
 state.lastResultText = $("summaryText") ? $("summaryText").textContent : "";
 showResultsPage();
}

// ─── Open trial ───
// ─── TRIAL LIFECYCLE ──────────────────────────────────────────
// openTrial(): opens one trial for calibration/paced/recovery/terminal.
//  Sets testStartTime on first call (starts 150s total wall clock).
//  Sets paced frame timer (onPacedFrameEnd) for machine-paced trials.
// onPacedFrameEnd(): fires when paced frame expires (subject missed or
//  wrong). Increments miss streak → triggers block if ≥2 true misses.
// ──────────────────────────────────────────────────────────────


function openTrial(kind){
 clearTimer();
 clearNoResponseTimer();

 // Track overall test duration from very first trial
 if(state.testStartTime===null){
  state.testStartTime=performance.now();
  armMaxTestTimer(); // wall clock covers entire test including calibration
 }

 state.previous=state.current;
 const lastPos=state.current?state.current.correctPos:null;
 const lastProbe=state.current?{family:state.current.probeFamily,count:state.current.probeCount}:null;
 state.current=makeTrial(kind,lastPos,lastProbe);
 state.hadResponse=false;

 // Save previous trial timing for inter-trial gap calculation.
 state._prevTrialOpenedAt = state.trialOpenedAt;
 state._prevPresentedDurationMs = state.presentedRoundDuration;

 // IMPORTANT:
 // Do not start timing until the display has actually rendered.
 // If a tap arrives before trialOpenedAt is set, RT is clamped safely to 0 instead of producing a huge bogus value.
 state.trialOpenedAt=null;

 renderTrial(state.current);
 updateMetrics();

 if(kind==="calibration"){
  const total=isMode2()?(Number(settings.mode2TrialLimit)||150):isMode3()?((Number(settings.initialUnusedCalibrationTrials)||2)+(Number(settings.mode3CalibrationTrials)||10)):(settings.initialUnusedCalibrationTrials+settings.initialMeasuredCalibrationTrials), idx=state.calibrationTrialIndex+1;
  phaseLabel.textContent=`Cal ${idx}/${total}`;
  setStatus(isMode1()?(idx<=settings.initialUnusedCalibrationTrials?"Self-paced (unused)":"Self-paced (measured)"):"Self-paced");
 }else if(kind==="paced"){
  // Store the ACTUAL frame duration shown for this paced round.
  state.presentedRoundDuration = Math.round(state.duration);
  phaseLabel.textContent=`Paced · ${Math.round(state.duration)}ms`;
  setStatus("Machine-paced");
 }else if(kind==="paced_fixed"){
  state.presentedRoundDuration = Math.round(state.duration);
  state.fixedPacedPresented += 1;
  phaseLabel.textContent=`Fixed MP · ${Math.round(state.duration)}ms`;
  setStatus("Mode 3 fixed machine-paced");
 }else if(kind==="recovery"){
  clearTimer();
  state.duration=null; state.lastFrameDuration=null; state.presentedRoundDuration=null;
  phaseLabel.textContent=`SP Restart ${state.spCorrectStreak}✓ ${state.spWrongCount}✗`;
  setStatus(`SP Restart — need ${settings.spRestartCorrectStreak} correct in a row`);
 }else if(kind==="terminal_recovery"){
  clearTimer();
  state.duration=null; state.lastFrameDuration=null; state.presentedRoundDuration=null;
  phaseLabel.textContent=`Final SP ${state.recoveryCorrectCompleted+1}/${settings.spRestartCorrectStreak}`;
  setStatus(`Final SP — complete ${settings.spRestartCorrectStreak} correct to finish`);
 }

 // Arm timers only after the display has been fully painted.
 requestAnimationFrame(()=>{
  requestAnimationFrame(()=>{
   requestAnimationFrame(()=>{
    state.trialOpenedAt = performance.now();

    if(kind==="calibration"){
     armNoResponseTimer();
    }else if(kind==="paced" || kind==="paced_fixed"){
     const targetMs = state.duration;
     const frameStart = state.trialOpenedAt;
     function checkFrame(){
      if(performance.now() - frameStart >= targetMs){
       onPacedFrameEnd();
       return;
      }
      state.trialTimer = requestAnimationFrame(checkFrame);
     }
     state._trialTimerIsRaf = true;
     state.trialTimer = requestAnimationFrame(checkFrame);
    }else if(kind==="recovery" || kind==="terminal_recovery"){
     armNoResponseTimer();
    }
   });
  });
 });
}

// ─── Paced frame end ───

// finalizePendingPriorMiss():
//   Called when the next frame has ended or when a >=600 ms response proves the prior frame
//   was not rescued by the late-boundary rule. At that point the earlier frame becomes a TRUE miss.
//   This is the only place a pending prior frame is finally counted as missed.
function finalizePendingPriorMiss(){
 if(!state.pendingPriorMiss) return false;
 const pm = state.pendingPriorMiss;
 state.pendingPriorMiss = null;

 // finalize the older frame as a real miss only now, after the late-response window has passed
 const savedCurrent = state.current;
 const savedPresented = state.presentedRoundDuration;
 state.current = pm.trial;
 state.presentedRoundDuration = pm.durationMs;

 logTrial({phase:"missed",rt:null,outcome:"missed",responseIndex:null});
 state.current = savedCurrent;
 state.presentedRoundDuration = savedPresented;

 state.missedTrials += 1;
 state.lastFrameDuration = pm.durationMs;
 state.unresolvedStreak = (state.unresolvedStreak || 0) + 1;

 if(state.unresolvedStreak >= settings.consecutiveMissesForBlock){
  state.blockDuration = pm.durationMs;
  state.blockRestartBaseline = pm.durationMs;
  state.overloads.push(state.blockDuration);
  state.unresolvedStreak = 0;
  state.lastFrameDuration = null;
  updateCPIDisplay(avgLast2Blocks());

  const maxB = Math.max(2, Number(settings.maxBlockCount) || 6);
  if(state.overloads.length >= maxB){
   state.endReason = "ERRATIC RESPONSES — Retest";
   finish();
   return true;
  }
  if(maybeTriggerTerminalRule()) return true;

  state.phase = "recovery";
  state.recoveryCorrectCompleted = 0;
  state.spCorrectStreak = 0;
  state.spWrongCount = 0;
  openTrial("recovery");
  return true;
 }
 return false;
}

// applyPendingLatePacingIfAny():
//   Applies the provisional pacing result for Frame 1 only if Frame 2 finished with no own response.
//   If Frame 2 later gets its own >=600 ms response, this provisional pacing result is discarded
//   and Frame 2's own pacing result replaces it.
function applyPendingLatePacingIfAny(){
 if(!state.pendingLatePacing) return;
 const p = state.pendingLatePacing;
 state.pendingLatePacing = null;
 if(p.correct){
  applyPacing(p.effectiveRt, true);
 }else{
  applyPacing(null, false);
 }
}

function onPacedFrameEnd(){
 const actualFrameMs = (state.trialOpenedAt!=null)
  ? Math.round(performance.now() - state.trialOpenedAt)
  : (state.presentedRoundDuration || (state.duration ? Math.round(state.duration) : null));
 if(actualFrameMs!=null) state.presentedRoundDuration = actualFrameMs;

 // Mode 3 fixed machine-paced handler:
// every trial uses one fixed baseline duration,
// no adaptive speedup/slowdown within the fixed MP phase.
if(state.phase==="paced_fixed"){
  const truelyMissed=state.current&&!state.current.resolved&&!state.hadResponse;
  if(truelyMissed){
   logTrial({phase:"paced_fixed_missed",rt:null,outcome:"missed",responseIndex:null});
   state.missedTrials+=1;
  }
  if(state.fixedPacedPresented >= (Number(settings.mode3PacedTrialLimit)||140)){
   state.endReason="Required responses reached";
   finish(); return;
  }
  openTrial("paced_fixed");
  return;
 }
 if(state.phase!=="paced") return;
 state.totalTrials+=1;

 // First, if the immediately previous frame was still waiting to be finalized as a true miss,
 // finalize it now because the current frame has now ended without rescuing it.
 // This means the earlier frame is now confirmed as a TRUE miss, not just an apparent miss.
 if(state.pendingPriorMiss){
  if(finalizePendingPriorMiss()) return;
 }

 const truelyMissed=state.current&&!state.current.resolved&&!state.hadResponse;
 if(truelyMissed){
  // Do NOT count this as a real miss yet.
  // Keep it pending so the NEXT frame can retroactively claim it if the first tap on the
  // next frame arrives in < lateResponseThresholdMs (default 600 ms).
  // Until then, this frame is only an APPARENT miss, not yet a TRUE miss.
  state.pendingPriorMiss = {
   trial: state.current,
   durationMs: state.presentedRoundDuration!=null ? state.presentedRoundDuration : (state.duration?Math.round(state.duration):null)
  };

  // If the previous frame already got a late-attributed response and this current frame now
  // truly ends with no own response, then the previous frame's provisional speed change is now
  // confirmed and is applied forward to Frame 3.
  applyPendingLatePacingIfAny();

  if(state.totalTrials>=settings.maxTrialCount){ state.endReason="ERRATIC RESPONSES — Retest"; finish(); }
  else openTrial("paced");
  return;
 }

 // Any real response on the current frame breaks the consecutive true-miss streak.
 state.lastFrameDuration = null;
 state.unresolvedStreak = 0;
 state.pendingPriorMiss = null;
 state.pendingLatePacing = null;

 if(state.totalTrials>=settings.maxTrialCount){ state.endReason="ERRATIC RESPONSES — Retest"; finish(); }
 else openTrial("paced");
}

// ─── Handle tap ───
// ─── TAP HANDLER ──────────────────────────────────────────────
// Entry point for all subject responses (pointerdown on resp-btn).
// Routes to: calibration | paced | recovery | terminal_recovery.
// LATE RESPONSE RULE: if tap within 600ms of frame start after a previous miss,
//  assign that tap to the PREVIOUS trial. If correct, use
//  effectiveRT = currentRT + lastRoundDuration in the paced update.
//  If wrong, baseline slows by +100 ms.
// BLOCKING ALGORITHM: onPacedFrameEnd counts consecutive TRUE misses
//  (hadResponse=false). 2 consecutive misses → block recorded.
//  Recovery after block is SELF-PACED.
// ──────────────────────────────────────────────────────────────

function getSafeTrialRtMs(eventTimeStamp){
 let now;
 if(eventTimeStamp!=null && Number.isFinite(eventTimeStamp) && eventTimeStamp < 1e12){
  now = eventTimeStamp;
 }else{
  now = performance.now();
 }
 if(state.trialOpenedAt==null || !Number.isFinite(state.trialOpenedAt)){
  state.trialOpenedAt = now;
  return 0;
 }
 return Math.max(0, now - state.trialOpenedAt);
}

function handleTap(index,eventTimeStamp){
 if(!["calibration","paced","paced_fixed","recovery","terminal_recovery"].includes(state.phase)) return;
 noteAnyResponse();

 // Calibration
 if(state.phase==="calibration"){
  const rt=getSafeTrialRtMs(eventTimeStamp), ok=trialMatches(state.current,index);
  flashBtn(index,ok); state.totalResponses+=1;

  const warmups = Number(settings.initialUnusedCalibrationTrials)||2;
  const measuredTargetMode1 = Number(settings.initialMeasuredCalibrationTrials)||7;
  const includeInAverages = state.calibrationTrialIndex>=warmups;

  // Warm-up exclusion applies across all modes:
  // warmups never contribute to averages/calculations.
  if(includeInAverages) state.selfPacedRTs.push(rt);
  if(ok){ state.totalCorrect+=1; if(includeInAverages) state.selfPacedCorrect+=1; } else { state.totalIncorrect+=1; if(includeInAverages) state.selfPacedWrong+=1; }

  logTrial({phase:"calibration",rt,outcome:includeInAverages?(ok?"correct":"wrong"):"Warmup",responseIndex:index,counted:includeInAverages});

  if(isMode1()){
   if(!ok){
    state.calibrationErrors+=1; updateMetrics();
    const calWrongLimit=Math.max(1,Number(settings.calibrationStopErrors)||4);
    if(state.calibrationErrors>=calWrongLimit){
      failCalibration(`TOO MANY WRONG RESPONSES — Practice! (${state.calibrationErrors}/${calWrongLimit})`);
      return;
    }
   }else if(includeInAverages){
    // Only CORRECT measured trials count toward calibration average and target count.
    if(rt>settings.calibrationStopSlowMs){
      failCalibration("NOT RESPONDING IN TIME — Practice!");
      return;
    }
    state.calibrationRTs.push(rt);
   }

   state.calibrationTrialIndex+=1;

   // End only after warmups are done AND we have the required number of CORRECT measured trials.
   if(state.calibrationRTs.length >= measuredTargetMode1){
     finishCalibration();
   }else{
     openTrial("calibration");
   }
   return;
  }

  // Mode 2 + Mode 3:
  // warmups are excluded from averages. After warmups, all self-paced trials are counted
  // toward the fixed trial-count phase, but only correct RTs are included in calibrationRTs.
  if(includeInAverages && ok) state.calibrationRTs.push(rt);
  state.calibrationTrialIndex+=1;

  if(isMode2()){
   if(state.calibrationTrialIndex >= (Number(settings.mode2TrialLimit)||150)){
     state.endReason="Required responses reached";
     finishCalibration();
   }else{
     openTrial("calibration");
   }
   return;
  }

  if(isMode3()){
   const mode3MeasuredTarget = Number(settings.mode3CalibrationTrials)||10;
   if(!ok && includeInAverages){
     state.calibrationErrors += 1;
     const calWrongLimit=Math.max(1,Number(settings.calibrationStopErrors)||4);
     if(state.calibrationErrors>=calWrongLimit){
       failCalibration(`TOO MANY WRONG RESPONSES — Practice! (${state.calibrationErrors}/${calWrongLimit})`);
       return;
     }
   }
   if(ok && includeInAverages && rt>settings.calibrationStopSlowMs){
     failCalibration("NOT RESPONDING IN TIME — Practice!");
     return;
   }
   // End only after warmups are done AND we have the required number of CORRECT measured trials.
   if(state.calibrationRTs.length >= mode3MeasuredTarget){
     state.endReason="Required responses reached";
     finishCalibration();
   }else{
     openTrial("calibration");
   }
   return;
  }
 }

 // Recovery (SP Restart)
 if(state.phase==="recovery"){
  clearTimer();
  const rt=getSafeTrialRtMs(eventTimeStamp), ok=trialMatches(state.current,index);
  flashBtn(index,ok); state.totalResponses+=1;
  if(ok) state.totalCorrect+=1; else state.totalIncorrect+=1;
  logTrial({phase:"recovery",rt,outcome:ok?"correct":"wrong",responseIndex:index});
  if(ok){
   state.spCorrectStreak+=1; state.current.resolved=true;
   const need=Math.max(1,Number(settings.spRestartCorrectStreak)||2);
   if(state.spCorrectStreak>=need){
    // REQUIRED RESTART RULE:
    //   restartMs = blockBaselineMs × blockRestartPercent
    // blockBaselineMs is the paced baseline at the block point.
    // blockRestartPercent defaults to 1.2, so restart is 20% slower than block baseline.
    const restartBaseMs=Number(state.blockRestartBaseline)||Number(state.blockDuration)||0;
    const restartFactor=Number(settings.blockRestartPercent)||1.2;
    const slower=clamp(Math.round(restartBaseMs*restartFactor),settings.minDurationMs,settings.maxDurationMs);
    state.recoveries.push(slower); state.phase="paced"; state.duration=slower;
    state.spCorrectStreak=0; state.spWrongCount=0;
    setStatus(`Block recovery passed — resuming at ${slower.toFixed(0)}ms (${restartFactor}× block baseline)`);
    setTimeout(()=>openTrial("paced"),180);
   }else{
    setStatus(`SP Restart: ${state.spCorrectStreak}/${need} correct`);
    setTimeout(()=>openTrial("recovery"),160);
   }
  }else{
   state.spCorrectStreak=0; state.spWrongCount+=1; state.recoveryErrors+=1;
   const limit=Math.max(1,Number(settings.spRestartWrongLimit)||3);
   if(state.spWrongCount>=limit){ state.endReason=`FAILED: reached SP restart wrong-tap limit (${limit})`; finish(); return; }
   setStatus(`SP Restart: ${state.spWrongCount}/${limit} wrong`);
   setTimeout(()=>openTrial("recovery"),160);
  }
  recordAnswer(ok); return;
 }

 // Terminal recovery
 if(state.phase==="terminal_recovery"){
  clearTimer();
  const rt=getSafeTrialRtMs(eventTimeStamp), ok=trialMatches(state.current,index);
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

 // Mode 3 fixed machine-paced
 if(state.phase==="paced_fixed"){
  state.totalTrials += 1;
  const rt=getSafeTrialRtMs(eventTimeStamp);
  if(state.current&&!state.current.resolved&&trialMatches(state.current,index)){
   state.current.resolved=true; state.totalResponses+=1; state.totalCorrect+=1; state.fixedPacedCorrect+=1; state.pacedRTs.push(rt);
   logTrial({phase:"paced_fixed",rt,outcome:"correct",responseIndex:index}); flashBtn(index,true);
   if(state.fixedPacedPresented >= (Number(settings.mode3PacedTrialLimit)||140)){ state.endReason="Required responses reached"; finish(); return; }
   openTrial("paced_fixed"); return;
  }
  state.hadResponse=true;
  state.totalResponses+=1; state.totalIncorrect+=1; state.pacedErrors+=1; state.fixedPacedWrong+=1;
  if(checkMaxPacedWrong()) return;
  logTrial({phase:"paced_fixed_wrong",rt:rt,outcome:"wrong",responseIndex:index});
  flashBtn(index,false);
  if(state.fixedPacedPresented >= (Number(settings.mode3PacedTrialLimit)||140)){ state.endReason="Required responses reached"; finish(); return; }
  openTrial("paced_fixed"); return;
 }

 // Paced
 const rt=getSafeTrialRtMs(eventTimeStamp);
 const lateThreshold = Number(settings.lateResponseThresholdMs)||600;

 // Case A: previous frame looked like a miss, but the FIRST response on this frame
 // arrives under the late threshold.
 // That first response is reassigned backward to the PREVIOUS frame.
 // The current frame is still left open waiting for a possible SECOND response of its own.
 if(state.pendingPriorMiss && rt < lateThreshold){
  const prior = state.pendingPriorMiss.trial;
  const priorDur = state.pendingPriorMiss.durationMs!=null ? state.pendingPriorMiss.durationMs : (state.lastFrameDuration||state.duration);
  const correctForLast = prior && trialMatches(prior,index);

  state.totalResponses += 1;

  if(correctForLast){
   const eRT = rt + priorDur;
   state.totalCorrect += 1;
   state.pacedRTs.push(eRT);

   const savedCurrent = state.current;
   const savedPresented = state.presentedRoundDuration;
   state.current = prior;
   state.presentedRoundDuration = priorDur;
   logTrial({phase:"paced_late_correct",rt:eRT,outcome:"correct",responseIndex:index});
   state.current = savedCurrent;
   state.presentedRoundDuration = savedPresented;

   flashBtn(index,true);
   if(recordAnswer(true)) return;
   state.pendingLatePacing = {correct:true, effectiveRt:eRT};
  }else{
   state.totalIncorrect += 1;
   state.pacedErrors += 1;
   if(checkMaxPacedWrong()) return;

   const savedCurrent = state.current;
   const savedPresented = state.presentedRoundDuration;
   state.current = prior;
   state.presentedRoundDuration = priorDur;
   logTrial({phase:"paced_late_wrong",rt:rt,outcome:"wrong",responseIndex:index});
   state.current = savedCurrent;
   state.presentedRoundDuration = savedPresented;

   flashBtn(index,false);
   if(recordAnswer(false)) return;
   state.pendingLatePacing = {correct:false};
  }

  // Frame 1 is NOT a miss anymore because the first <600 ms tap has rescued it.
  state.pendingPriorMiss = null;

  // IMPORTANT:
  // this first tap belonged to the previous frame, so the current frame still has no own response yet.
  // If no second response occurs before this frame ends, the CURRENT frame becomes the miss.
  // If a second response occurs at >=600 ms, that second response becomes the CURRENT frame's own RT.
  state.hadResponse = false;
  return;
 }

 // Case B: if a previous frame was still pending and this response is >=600 ms,
 // then the earlier frame was not rescued in time and becomes a TRUE miss.
 // Finalize that earlier miss first, then treat this response as belonging to the CURRENT frame.
 if(state.pendingPriorMiss){
  if(finalizePendingPriorMiss()) return;
 }

 // If we had already captured a late-attributed response for Frame 1 and now we receive
 // a second, true Frame 2 response (>=600 ms after Frame 2 appeared),
 // then Frame 2 gets its own RT and its own pacing effect.
 // The earlier provisional pacing calculation for Frame 1 is ignored.
 if(state.pendingLatePacing && rt >= lateThreshold){
  state.pendingLatePacing = null;
 }

 if(state.current&&!state.current.resolved&&trialMatches(state.current,index)){
  state.current.resolved=true; state.totalResponses+=1; state.totalCorrect+=1;
  state.hadResponse=true;
  applyPacing(rt,true); state.pacedRTs.push(rt);
  logTrial({phase:"paced",rt,outcome:"correct",responseIndex:index}); flashBtn(index,true);
  recordAnswer(true); return;
 }

 state.hadResponse=true;
 state.totalResponses+=1; state.totalIncorrect+=1; state.pacedErrors+=1;
 if(checkMaxPacedWrong()) return;
 applyPacing(null,false);
 logTrial({phase:"paced_wrong",rt:getSafeTrialRtMs(eventTimeStamp),outcome:"wrong",responseIndex:index});
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
// ─── SP-FS PAGE RENDERING ─────────────────────────────────────
// Full-page overlay. 7 items with large cyan numbers (1-7).
// Subject taps one item → reveals "▶ Start Test!" button.
// Title: Samn-Perelli Fatigue Scale (SP-FS).
// ──────────────────────────────────────────────────────────────
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
// ─── ADMIN PANEL ──────────────────────────────────────────────
// Admin defaults are displayed in numbered order:
// 1) Admin passcode, 2) shared defaults used across all modes,
// 3) Test mode, 4) mode-specific groups in test-use order.
// Password-protected (default: 4822). Stays unlocked per session.
// TRIAL DETAIL: per-trial table with session selector + CSV download.
// LAST RESULTS: shows summary overlay for most recent test.
// BENCHMARK: device timing calibration test.
// ──────────────────────────────────────────────────────────────
function renderAdmin(){
 const w=$("adminSettings"); w.innerHTML="";
 for(const [k,l,t] of ADMIN_FIELDS){
  const r=document.createElement("div");
  r.style.cssText="display:grid;grid-template-columns:1fr 140px;gap:8px;align-items:center;margin-bottom:8px";
  let controlHTML="";
  if(String(t).startsWith("select:")){
   const opts=String(t).slice(7).split("|").map(v=>`<option value="${v}" ${String(settings[k])===v?"selected":""}>${v}</option>`).join("");
   controlHTML=`<select id="adm_${k}" style="padding:9px;border:1px solid var(--edge);border-radius:10px;background:#0a1629;color:var(--text);font-size:14px;width:100%">${opts}</select>`;
  }else{
   controlHTML=`<input id="adm_${k}" type="${t}" value="${settings[k]}" style="padding:9px;border:1px solid var(--edge);border-radius:10px;background:#0a1629;color:var(--text);font-size:14px;width:100%">`;
  }
  r.innerHTML=`<label style="font-size:14px;color:var(--text)">${l}<div style="font-size:11px;color:var(--muted)">${k}</div></label>${controlHTML}`;
  w.appendChild(r);
 }
}
function readAdmin(){ for(const [k,,t] of ADMIN_FIELDS){ const el=$("adm_"+k); if(el) settings[k]=t==="number"?Number(el.value):el.value; } }
function resetAdmin(){ settings={...DEFAULTS}; saveSettings(); renderAdmin(); }

function bindDoubleTapConfirm(btn, action, idleText, confirmText){
 if(!btn) return;
 let armed = false;
 let timer = null;
 const resetState = ()=>{
  armed = false;
  btn.textContent = idleText;
  btn.style.borderColor = "";
  btn.style.color = "";
  if(timer){ clearTimeout(timer); timer = null; }
 };
 btn.onclick = ()=>{
  if(!armed){
   armed = true;
   btn.textContent = confirmText;
   btn.style.borderColor = "rgba(255,100,136,0.75)";
   btn.style.color = "#ff8aa0";
   timer = setTimeout(resetState, 2200);
   return;
  }
  resetState();
  action();
 };
}

// ─── Charts ───
// ─── HISTORY AND GRAPHS ───────────────────────────────────────
// drawCombinedChart(): 3-series chart — CPI (cyan, left axis 0-100),
//  Block ms (amber, right axis REVERSED: smaller ms at top = better),
//  SP-FS (green, left axis 1-7). Shows last 20 sessions.
//  "↑ better" label on right axis. Each series rises with improvement.
// drawRTScatterChart(): per-trial RT scatter (reversed Y: fast=top).
// ──────────────────────────────────────────────────────────────
function getSessionUtcMs(r){
 if(!r) return 0;
 const candidates = [
  r.time,
  r.date_iso,
  r.utc_time,
  r.gmt_time,
  r.geo && r.geo.date_iso,
  r.geo && r.geo.gmt_time
 ];
 for(const v of candidates){
  if(!v) continue;
  const ms = Date.parse(v);
  if(Number.isFinite(ms)) return ms;
 }
 return 0;
}


// ─── RT scatter chart ───
// Mode 2 / Mode 3 result chart:
// green dots = correct responses
// red dots   = wrong responses
// Mode 2 graphs self-paced responses only.
// Mode 3 graphs self-paced + fixed machine-paced responses.
// Mode 2 / Mode 3 response-time graph
// - full graph shows session number once in subtitle
// - smaller ms = better performance and graphs higher
// - avoid duplicate mode / SP-FS labels on full graph

function getResponseGraphPhaseLegendText(result){
 if(!result) return "Includes phases: none";
 if(result.testMode==="mode1"){
  return "Includes phases: paced, paced_wrong, paced_late_correct, paced_late_wrong, missed.";
 }
 if(result.testMode==="mode2"){
  return "Includes phases: calibration only.";
 }
 if(result.testMode==="mode3"){
  return "Includes phases: calibration, paced_fixed, paced_fixed_wrong, paced_fixed_missed.";
 }
 return "Includes phases: unknown.";
}

function drawModeResultChart(canvas,result){
 if(!canvas){ return; }
 const log=(result&&result.rtLog)||[];
 const ctx=canvas.getContext("2d"),W=canvas.width,H=canvas.height;
 ctx.clearRect(0,0,W,H); ctx.fillStyle="#081321"; ctx.fillRect(0,0,W,H);

 const isFull = canvas.id==="fullModeGraph";
 const PAD=isFull ? {top:70,right:28,bottom:48,left:64} : {top:18,right:20,bottom:28,left:48};
 const cW=W-PAD.left-PAD.right,cH=H-PAD.top-PAD.bottom;

 const mode1Trials = result.testMode==="mode1"
  ? log.filter(e=>[
     "paced","paced_wrong","paced_late_correct","paced_late_wrong","missed"
    ].includes(e.phase) && e.durationMs!=null)
  : [];
 const mode1Responses = result.testMode==="mode1"
  ? mode1Trials.filter(e=>e.rt!=null)
  : [];
 const mode1Misses = result.testMode==="mode1"
  ? mode1Trials.filter(e=>e.phase==="missed")
  : [];

 const pts = result.testMode==="mode1"
  ? mode1Responses
  : log.filter(e=>e.rt!=null && (
     result.testMode==="mode2" ? e.phase==="calibration"
     : result.testMode==="mode3" ? (e.phase==="calibration" || e.phase==="paced_fixed" || e.phase==="paced_fixed_wrong")
     : false
    ));

 const presentedSeries = result.testMode==="mode1"
  ? mode1Trials
  : result.testMode==="mode3"
    ? log.filter(e=>e.durationMs!=null && (e.phase==="paced_fixed" || e.phase==="paced_fixed_wrong" || e.phase==="paced_fixed_missed"))
    : [];

 if(!pts.length && !presentedSeries.length){
  ctx.fillStyle="#d7e7f8"; ctx.font=(isFull?"bold 20px":"bold 13px")+" sans-serif"; ctx.textAlign="center";
  ctx.fillText("No response-time graph for this session/mode",W/2,H/2); return;
 }

 const combinedVals = [
  ...pts.map(p=>p.rt),
  ...presentedSeries.map(p=>p.durationMs),
  ...mode1Misses.map(p=>p.durationMs)
 ].filter(v=>v!=null && isFinite(v));
 const maxRT=Math.ceil(Math.max(...combinedVals,1000)/250)*250;
 const minRT=Math.max(0,Math.floor(Math.min(...combinedVals)/250)*250);

 const xCount = result.testMode==="mode1"
  ? Math.max(1, mode1Trials.length)
  : Math.max(1, Math.max(pts.length, presentedSeries.length));
 function xO(i, n=xCount){ return PAD.left + (i/Math.max(1,n-1))*cW; }
 function yO(v){ return PAD.top + ((v-minRT)/Math.max(1,(maxRT-minRT)))*cH; }

 if(isFull){
  ctx.fillStyle="#d7e7f8";
  ctx.font="bold 22px sans-serif";
  ctx.textAlign="center";
  const title = result.testMode==="mode1"
   ? "Mode 1 — Adaptive Machine-Paced Response Times"
   : result.testMode==="mode2"
     ? "Mode 2 — Self-Paced Calibration Response Times"
     : "Mode 3 — Self-Paced + Machine-Paced Response Times";
  ctx.fillText(title, W/2, 24);
  ctx.font="12px sans-serif";
  ctx.fillStyle="#b7d9ef";
  const spfs = result.samnPerelli ? `SP-FS: ${result.samnPerelli.score}` : "SP-FS: —";
  const modeTxt = result.testMode ? `${formatModeTag(result.testMode)}` : "";
  const sessionTxt = result.sessionNumber!=null ? `Session ${result.sessionNumber}` : "Latest Session";
  ctx.fillText(`${sessionTxt} · ${modeTxt} · ${spfs}`, W/2, 42);
  ctx.font="11px sans-serif";
  ctx.fillStyle="#9fc7de";
  ctx.fillText(getResponseGraphPhaseLegendText(result), W/2, 57);
 }

 ctx.strokeStyle="rgba(79,111,153,0.2)"; ctx.lineWidth=1;
 for(let v=minRT; v<=maxRT; v+=250){
  const y=yO(v);
  ctx.beginPath(); ctx.moveTo(PAD.left,y); ctx.lineTo(PAD.left+cW,y); ctx.stroke();
  ctx.fillStyle="#7fa0c0"; ctx.font=(isFull?"12px":"9px")+" sans-serif"; ctx.textAlign="right";
  ctx.fillText(`${v}ms`,PAD.left-6,y+4);
 }

 ctx.strokeStyle="rgba(127,215,255,0.35)";
 ctx.beginPath();
 ctx.moveTo(PAD.left, PAD.top);
 ctx.lineTo(PAD.left, PAD.top+cH);
 ctx.lineTo(PAD.left+cW, PAD.top+cH);
 ctx.stroke();

 if(presentedSeries.length){
  ctx.strokeStyle="rgba(255,170,68,0.95)";
  ctx.lineWidth=isFull?3:2;
  ctx.beginPath();
  presentedSeries.forEach((e,i)=>{
   const x = result.testMode==="mode1" ? xO(mode1Trials.indexOf(e)) : xO(i, presentedSeries.length);
   const y = yO(e.durationMs);
   if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();
 }

 if(pts.length){
  ctx.strokeStyle="rgba(127,215,255,0.85)";
  ctx.lineWidth=isFull?2.5:1.5;
  ctx.beginPath();
  pts.forEach((e,i)=>{
   const x = result.testMode==="mode1" ? xO(mode1Trials.indexOf(e)) : xO(i, pts.length);
   const y = yO(e.rt);
   if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();
 }

 pts.forEach((e,i)=>{
  const ok=e.outcome==="correct";
  const x = result.testMode==="mode1" ? xO(mode1Trials.indexOf(e)) : xO(i, pts.length);
  const y = yO(e.rt);
  ctx.fillStyle=ok ? "#00ff88" : "#ff4466";
  ctx.beginPath(); ctx.arc(x,y, isFull?5:3.5,0,Math.PI*2); ctx.fill();
 });

 if(result.testMode==="mode1"){
  mode1Misses.forEach((e)=>{
   const x=xO(mode1Trials.indexOf(e)), y=yO(e.durationMs);
   const s=isFull?6:4;
   ctx.strokeStyle="#ffd166";
   ctx.lineWidth=isFull?2.5:2;
   ctx.beginPath(); ctx.moveTo(x-s,y-s); ctx.lineTo(x+s,y+s); ctx.stroke();
   ctx.beginPath(); ctx.moveTo(x+s,y-s); ctx.lineTo(x-s,y+s); ctx.stroke();
  });
 }

 const showLegend = result.testMode==="mode1" || result.testMode==="mode3";
 if(showLegend){
  const ly = isFull ? PAD.top + 10 : PAD.top + 6;
  const lx = PAD.left + 10;
  ctx.font=(isFull?"12px":"10px")+" sans-serif";
  ctx.textAlign="left";

  ctx.strokeStyle="rgba(255,170,68,0.95)";
  ctx.lineWidth=isFull?3:2;
  ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(lx+22,ly); ctx.stroke();
  ctx.fillStyle="#ffd7a0";
  ctx.fillText(result.testMode==="mode1" ? "Presented machine-paced duration" : "Presentation rate", lx+28, ly+4);

  const ly2 = ly + (isFull?20:16);
  ctx.fillStyle="#00ff88";
  ctx.beginPath(); ctx.arc(lx+11, ly2, isFull?4:3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle="#d7f3ff";
  ctx.fillText("Correct RT", lx+28, ly2+4);

  const ly3 = ly2 + (isFull?20:16);
  ctx.fillStyle="#ff4466";
  ctx.beginPath(); ctx.arc(lx+11, ly3, isFull?4:3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle="#ffd5dc";
  ctx.fillText("Wrong RT", lx+28, ly3+4);

  if(result.testMode==="mode1"){
   const ly4 = ly3 + (isFull?20:16);
   const s=isFull?4:3;
   ctx.strokeStyle="#ffd166";
   ctx.lineWidth=isFull?2.5:2;
   ctx.beginPath(); ctx.moveTo(lx+11-s,ly4-s); ctx.lineTo(lx+11+s,ly4+s); ctx.stroke();
   ctx.beginPath(); ctx.moveTo(lx+11+s,ly4-s); ctx.lineTo(lx+11-s,ly4+s); ctx.stroke();
   ctx.fillStyle="#ffe3a3";
   ctx.fillText("Miss", lx+28, ly4+4);
  }
 }

 ctx.fillStyle="#7fa0c0"; ctx.font=(isFull?"13px":"10px")+" sans-serif"; ctx.textAlign="center";
 const xLabel = result.testMode==="mode1"
  ? "Machine-paced trial →"
  : result.testMode==="mode2"
    ? "Self-Paced trial →"
    : "Self-Paced + Machine-Paced trial →";
 ctx.fillText(xLabel, PAD.left+cW/2, H-10);
 if(!isFull){
  const modeTxt=formatModeTag(result.testMode);
  const spfsTxt=result.samnPerelli?`SP-FS ${result.samnPerelli.score}`:"SP-FS —";
  const sessionTxt=result.sessionNumber!=null?`S${result.sessionNumber}`:"Latest";
  ctx.textAlign="left"; ctx.font="10px sans-serif"; ctx.fillStyle="#b7d9ef";
  ctx.fillText(`${sessionTxt} · ${modeTxt} · ${spfsTxt}`, PAD.left, PAD.top+12);
 }
}

function formatModeTag(mode){
 return (mode||"mode1").replace("mode","Test Mode ");
}
// Ranking helpers
// - parse saved trial logs robustly across old/new session formats
// - keep positions in true user-facing 1..6 space
// - do not double-shift positions parsed from strings like "@1"
// ─── SHARED TRIAL ROW NORMALIZER ─────────────────────────────
// Single canonical normalizeTrialRow() used by both
// computeRankAverages() and computeCombinationRankAveragesForMode().
// Parses probe family/count and correct position from both
// structured fields and older string-serialized formats.
// String-parsed "@N" positions are already 1-based and must NOT
// be incremented; only structured 0-based positions are shifted.
// ──────────────────────────────────────────────────────────────
function normalizeTrialRow(r){
 if(!r || r.rt==null || r.counted===false) return null;

 let family = r.probeFamily || null;
 let count = r.probeCount;
 let pos = r.correctPos;

 // Backward-compatible fallback for older saved sessions:
 // probe often looks like "dots:3" or "lines:5"
 if((family==null || count==null) && typeof r.probe==="string"){
  const m = r.probe.match(/^(dots|lines):(\d+)/);
  if(m){
   family = family || m[1];
   if(count==null) count = Number(m[2]);
  }
 }

 // Positions in older string logs are 1-based: "@4" means Position 4.
 let posFromString = false;
 if(typeof r.correctCell==="string"){
  const m = r.correctCell.match(/@(\d+)/);
  if(m){
   pos = Number(m[1]);
   posFromString = true;
  }
 }

 // Only structured stored positions may need 0-based -> 1-based normalization.
 // String-parsed "@4" already means Position 4 and must NOT be incremented.
 if(!posFromString && typeof pos === "number" && Number.isFinite(pos)){
  if(pos >= 0 && pos <= 5) pos = pos + 1;
 }

 if(family==null || count==null || pos==null) return null;

 return {
  outcome:r.outcome,
  rt:Number(r.rt),
  probeFamily:String(family),
  probeCount:Number(count),
  correctPos:Number(pos)
 };
}

function computeRankAverages(rtLog){
 const valid=(rtLog||[]).map(normalizeTrialRow).filter(Boolean);
 const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;

 function buildRows(outcome){
  const rows={dotRows:[], lineRows:[], posRows:[]};
  const sub=valid.filter(r=>r.outcome===outcome);
  for(let n=1;n<=6;n++){
   const dots=sub.filter(r=>r.probeFamily==="dots" && r.probeCount===n).map(r=>r.rt);
   const lines=sub.filter(r=>r.probeFamily==="lines" && r.probeCount===n).map(r=>r.rt);
   const pos=sub.filter(r=>r.correctPos===n).map(r=>r.rt);
   if(dots.length) rows.dotRows.push({label:`${n} dots`,avg:avg(dots),count:dots.length});
   if(lines.length) rows.lineRows.push({label:`${n} lines`,avg:avg(lines),count:lines.length});
   if(pos.length) rows.posRows.push({label:`Position ${n}`,avg:avg(pos),count:pos.length});
  }
  rows.dotRows.sort((a,b)=>a.avg-b.avg);
  rows.lineRows.sort((a,b)=>a.avg-b.avg);
  rows.posRows.sort((a,b)=>a.avg-b.avg);
  return rows;
 }

 return {correct:buildRows("correct"), wrong:buildRows("wrong")};
}
function formatRankRows(rows){
 return rows.length ? rows.map(r=>` ${r.label}: ${r.avg.toFixed(1)} ms (n=${r.count})`).join("\n") : " none";
}
function getModePooledSessionRecords(mode){
 const warmupCount = Math.max(0, Number(settings.initialUnusedCalibrationTrials)||0);
 const sessions = (state.history||[]).filter(s => (s.testMode||"mode1") === (mode||"mode1"));
 const pooledLogs = sessions.flatMap(s => {
   const log = Array.isArray(s.rtLog) ? s.rtLog : [];
   let skippedWarmups = 0;
   return log.filter(r => {
    if(r && r.counted===false) return false;
    if(r && r.phase==="calibration" && skippedWarmups < warmupCount){
      skippedWarmups += 1;
      return false;
    }
    return true;
   });
 });
 return {sessions, pooledLogs};
}
function getModePooledLogsExcludingWarmup(mode){
 return getModePooledSessionRecords(mode).pooledLogs;
}
function computeRankAveragesForMode(mode){
 const pooledLogs = getModePooledLogsExcludingWarmup(mode);
 return computeRankAverages(pooledLogs);
}
// Same-mode pooled combination rankings
// - combines sessions from the selected mode only
// - ranks correct / wrong / all combinations by mean RT
// Same-mode pooled combination rankings
// Uses shared normalizeTrialRow() for consistent position parsing.
function computeCombinationRankAveragesForMode(mode){
 const pooledLogs = getModePooledLogsExcludingWarmup(mode);

 const valid = pooledLogs.map(normalizeTrialRow).filter(Boolean);
 function buildRows(kind){
  const sub = kind==="all" ? valid : valid.filter(r=>r.outcome===kind);
  const buckets = new Map();
  sub.forEach(r=>{
   const key = `${r.probeCount} ${r.probeFamily}, Position ${r.correctPos}`;
   if(!buckets.has(key)) buckets.set(key, []);
   buckets.get(key).push(r.rt);
  });
  const rows = [...buckets.entries()].map(([label, vals])=>({
   label,
   avg: vals.reduce((a,b)=>a+b,0)/vals.length,
   count: vals.length
  }));
  rows.sort((a,b)=>a.avg-b.avg);
  return rows;
 }
 return {correct: buildRows("correct"), wrong: buildRows("wrong"), all: buildRows("all")};
}
function formatModePooledRankSection(mode){
 const rs = computeRankAveragesForMode(mode);
 const cs = computeCombinationRankAveragesForMode(mode);
 const {sessions, pooledLogs} = getModePooledSessionRecords(mode);
 const header = `Combined sessions for ${formatModeTag(mode)}\nSessions pooled: ${sessions.length}\nTotal counted pooled trials: ${pooledLogs.length}`;
 return `${header}\n\nCorrect responses:\nDots:\n${formatRankRows(rs.correct.dotRows)}\nLines:\n${formatRankRows(rs.correct.lineRows)}\nPositions:\n${formatRankRows(rs.correct.posRows)}\nCombinations (correct):\n${formatRankRows(cs.correct)}\n\nWrong responses:\nDots:\n${formatRankRows(rs.wrong.dotRows)}\nLines:\n${formatRankRows(rs.wrong.lineRows)}\nPositions:\n${formatRankRows(rs.wrong.posRows)}\nCombinations (wrong):\n${formatRankRows(cs.wrong)}\n\nAll responses combined:\nCombinations (all):\n${formatRankRows(cs.all)}`;
}
// ─── Export / Email ───
// ─── EXPORT / EMAIL ───────────────────────────────────────────
// exportResults(): downloads full history as ${STORAGE_PREFIX}_results.json
// exportCSV(): downloads history as ${STORAGE_PREFIX}_history.csv
//  Columns: session, subjectId, date, SP-FS, calibration, blocks,
//  CPI, taps, correct, wrong, missed, paced stats, duration, end reason.
// emailResults(): opens mailto: with last result text in body.
// ──────────────────────────────────────────────────────────────

function exportCSV(){
 const h=state.history; if(!h.length){setStatus("No history to export."); return;}
 const cols=["session","subjectId","date","samnPerelli","calibAvgMs","blocks",
  "avgLast2Ms","blockDiffMs","cpi","totalTaps","correct","wrong","missed",
  "pacedCorrect","pacedWrong","spRestartWrong","meanPacedRtMs","pacedRtSd",
  "testDurationMs","endReason","location"];
 const rows=h.map((r,i)=>[
  i+1,
  r.subjectId||"",
  r.time?new Date(r.time).toLocaleString():"",
  r.samnPerelli?`${r.samnPerelli.score} - ${r.samnPerelli.label}`:"",
  r.calibrationAverageMs!=null?r.calibrationAverageMs.toFixed(1):"",
  (r.blocks||[]).join("|"),
  r.averageLast2BlockingScoresMs!=null?r.averageLast2BlockingScoresMs.toFixed(1):"",
  r.blockScoreDifferenceMs!=null?r.blockScoreDifferenceMs.toFixed(1):"",
  r.cognitivePerformanceIndex!=null?r.cognitivePerformanceIndex.toFixed(1):"",
  r.totalResponses||0, r.totalCorrect||0, r.totalIncorrect||0, r.missedTrials||0,
  r.pacedResponseCount||0, r.pacedErrors||0, r.recoveryErrors||0,
  r.pacedResponseMeanMs!=null?r.pacedResponseMeanMs.toFixed(1):"",
  r.pacedResponseSdMs!=null?r.pacedResponseSdMs.toFixed(1):"",
  r.testDurationMs!=null?Math.round(r.testDurationMs):"",
  `"${(r.endReason||"").replace(/"/g,'""')}"`,
  `"${((r.geo&&r.geo.address)||"").replace(/"/g,'""')}"`
 ].map(v=>v==null?"":v).join(","));
 const csv=[cols.join(","), ...rows].join("\n");
 const blob=new Blob([csv],{type:"text/csv"});
 const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`${STORAGE_PREFIX}_history.csv`; a.click();
}
// Email results
// Subject line always uses the current APP_VERSION build label.
function emailResults(){
 const last=state.history[state.history.length-1];
 if(!last){ setStatus("No results to email."); return; }
 const to=state.profile?.emailResults&&state.profile?.email?state.profile.email:"";
 const rawText = state.lastResultText || JSON.stringify(last,null,2);
 const bodyText = rawText.replace(/\n/g,"\r\n");
 window.location.href=`mailto:${to}?subject=CogSpeed® ${APP_VERSION} Results&body=${encodeURIComponent(bodyText)}`;
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
  {x:O+14,  y:O+14},
  {x:O+BW-14, y:O+14},
  {x:O+14,  y:O+BH-14},
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

// ═══════════════════════════════════════════════════════════════
// SECTION: REGISTRATION — PROFILE
// Collects email (subject ID), birth month/year, gender, email pref.
// Stored in localStorage: ${STORAGE_PREFIX}_profile
// [PLANNED] Server-side account for population norms.
// ═══════════════════════════════════════════════════════════════

const PROFILE_KEY = `${STORAGE_PREFIX}_profile`;

function loadProfile(){
 try { return JSON.parse(localStorage.getItem(PROFILE_KEY)||"null"); } catch(e){ return null; }
}
function saveProfile(p){
 localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}
function clearProfile(){
 localStorage.removeItem(PROFILE_KEY);
}

function restoreSubjectFromProfile(){
 const p = loadProfile();
 const inp = $("subjectIdInput");
 const wl = $("subjectWelcome");
 const we = $("welcomeEmail");
 const hint = $("subjectHint");
 if(p && p.email){
  if(inp) inp.value = p.email;
  if(wl) wl.style.display = "block";
  if(we) we.textContent = p.email;
  if(hint) hint.textContent = "";
 } else {
  if(wl) wl.style.display = "none";
  if(we) we.textContent = "";
 }
}

// Compute age from birth month (1-12) and year
function computeAge(bMonth, bYear){
 const now = new Date();
 let age = now.getFullYear() - bYear;
 if(now.getMonth()+1 < bMonth) age--;
 return age;
}

// Current profile being edited
let _profileGenderSelected = "";

function profileSelectGender(g){
 _profileGenderSelected = g;
 ["M","F","O"].forEach(x=>{
  const btn = $("profileGender"+x);
  if(!btn) return;
  btn.style.background = x===g ? "linear-gradient(180deg,#0d4a1a,#062a10)" : "";
  btn.style.borderColor = x===g ? "#00ff88" : "";
  btn.style.color    = x===g ? "#00ff88" : "";
 });
}

function profileToggleEmail(checked){
 const thumb = $("profileEmailThumb");
 const track = $("profileEmailToggle");
 if(thumb) thumb.style.transform = checked ? "translateX(24px)" : "translateX(0)";
 if(track) track.style.background = checked ? "#0080ff" : "rgba(255,255,255,0.15)";
}

function validateProfileAge(){
 const mo = parseInt($("profileBirthMonth")?.value||"0");
 const yr = parseInt($("profileBirthYear")?.value||"0");
 const msg = $("profileAgeMsg");
 if(!mo || !yr || yr < 1910 || yr > new Date().getFullYear()-5){
  if(msg) msg.textContent=""; return false;
 }
 const age = computeAge(mo, yr);
 if(age < 14){
  if(msg){ msg.textContent="⚠ Must be 14 or older to take this test."; msg.style.color="#ff6688"; }
  return false;
 }
 if(age > 120){
  if(msg){ msg.textContent="⚠ Please check the year."; msg.style.color="#ff6688"; }
  return false;
 }
 if(msg){ msg.textContent="Age: "+age+" years ✓"; msg.style.color="#00ff88"; }
 return true;
}

function openProfileOverlay(email){
 const existing = loadProfile();
 _profileGenderSelected = existing?.gender || "";

 // Show email
 const ed = $("profileEmailDisplay");
 if(ed) ed.textContent = email;

 // Pre-fill if returning
 if(existing){
  const bm = $("profileBirthMonth"); if(bm) bm.value = existing.birthMonth||"";
  const by = $("profileBirthYear"); if(by) by.value = existing.birthYear||"";
  const er = $("profileEmailResults"); if(er) er.checked = !!existing.emailResults;
  profileToggleEmail(!!existing.emailResults);
  if(existing.gender) profileSelectGender(existing.gender);
  validateProfileAge();
 } else {
  const bm = $("profileBirthMonth"); if(bm) bm.value="";
  const by = $("profileBirthYear"); if(by) by.value="";
  const er = $("profileEmailResults"); if(er) er.checked=false;
  profileToggleEmail(false);
  profileSelectGender("");
  const msg=$("profileAgeMsg"); if(msg) msg.textContent="";
 }

 showOnly("profileOverlay");
}

let _profileReturnTo = "refresherOverlay"; // where to go after saving profile

function saveAndContinueProfile(){
 const email = ($("subjectIdInput")?.value||"").trim().toLowerCase() ||
        loadProfile()?.email || "";
 const bMonth = parseInt($("profileBirthMonth")?.value||"0");
 const bYear = parseInt($("profileBirthYear")?.value||"0");
 const emailResults = !!$("profileEmailResults")?.checked;

 // Validate age
 if(!validateProfileAge()){ setStatus("Please enter a valid date of birth (14+)."); return; }
 if(!_profileGenderSelected){ setStatus("Please select a gender."); return; }

 const profile = {email, birthMonth:bMonth, birthYear:bYear,
  gender:_profileGenderSelected, emailResults, updatedAt:Date.now()};
 saveProfile(profile);

 // Use email as subjectId
 state.subjectId = email;
 state.profile = profile;

 // Return to appropriate page
 showOnly(_profileReturnTo);
 _profileReturnTo = "refresherOverlay"; // reset for next time
 setStatus("Profile saved"); restoreSubjectFromProfile();
}

function resetProfile(){
 clearProfile();
 _profileGenderSelected = "";
 const bm=$("profileBirthMonth"); if(bm) bm.value="";
 const by=$("profileBirthYear"); if(by) by.value="";
 const er=$("profileEmailResults"); if(er) er.checked=false;
 profileToggleEmail(false);
 ["M","F","O"].forEach(x=>{
  const btn=$("profileGender"+x);
  if(btn){ btn.style.background=""; btn.style.borderColor=""; btn.style.color=""; }
 });
 const msg=$("profileAgeMsg"); if(msg) msg.textContent="";
 setStatus("Profile reset");
}

// ─── OVERLAY / NAVIGATION UTILITIES ──────────────────────────
// hideAllOverlays(): hides every overlay (used at test start).
// showOnly(id): shows one overlay, hides all others.
// _adminReturnTo: tracks which page opened admin so Close returns there.
// ──────────────────────────────────────────────────────────────
function hideAllOverlays(){
 const ids=["subjectOverlay","fatigueOverlay","profileOverlay","refresherOverlay","tutorialOverlay","thinkingOverlay","outcomeOverlay","summaryOverlay","rankedOverlay","adminOverlay","trialLogOverlay","rateRtOverlay","perfTimeOverlay","fullGraphOverlay","emailOverlay","benchmarkOverlay"];
 ids.forEach(id=>{
  const el=$(id);
  if(el) el.classList.add("hidden");
 });
 const ts=$("testScreen");
 if(ts) ts.classList.add("hidden");
}
function showOnly(id){
 hideAllOverlays();
 const el=$(id);
 if(el) el.classList.remove("hidden");
}

// ─── START PAGE SPEEDOMETER LINK ─────────────────────────────
// Shows Speedometer on the Start page whenever any session data
// exists in current state or stored history.
function updateStartPageLinks(){
 const wrap = $("speedometerStartLinkWrap");
 const link = $("speedometerStartLink");
 if(!wrap || !link) return;

 let hasData = false;
 try{
  hasData = Array.isArray(state.history) && state.history.length > 0;
 }catch(e){}

 if(!hasData){
  try{
   const raw = localStorage.getItem(`${STORAGE_PREFIX}_history`) || "[]";
   const parsed = JSON.parse(raw);
   hasData = Array.isArray(parsed) && parsed.length > 0;
  }catch(e){}
 }

 wrap.style.display = "block";

 if(hasData){
  link.style.color = "var(--accent)";
  link.style.pointerEvents = "auto";
  link.onclick = (e)=>{
   e.preventDefault();
   openSpeedometerPage();
  };
 }else{
  link.style.color = "rgba(127,215,255,0.38)";
  link.style.pointerEvents = "none";
  link.onclick = null;
 }
}

function isTestSuccess(r){ return (r||"").toLowerCase().startsWith("convergent"); }

// ─── Summary ───
// ─── SUMMARY TEST RESULTS ─────────────────────────────────────
// Formats full monospace result text (state.lastResultText).
// Includes: subject ID, date/time, location, SP-FS, calibration,
//  block scores, CPI, response stats, end reason, reference table.
// REFERENCE TABLE: 7-row S-PF/CPI/MBS lookup from Perelli (2026)
//  with ← YOUR SCORE arrow on the matching CPI band.
// ──────────────────────────────────────────────────────────────
// Pooled mode-specific ranking summaries:
// Results page rankings now combine all saved sessions from the SAME test mode only.
// Mode 1 pools with Mode 1, Mode 2 with Mode 2, Mode 3 with Mode 3.
// Warm-up calibration trials are excluded from pooled rankings.
// Pooled rankings include single-factor rankings and full pooled combinations
// of dots/lines count with correct response position.
// Combination lists are provided for correct, wrong, and all responses combined.

function getCognitivePerformanceTableText(result){
 if((result.testMode||"mode1")!=="mode1") return "Not used in this mode.";
 const cpi = result.cognitivePerformanceIndex!=null ? Number(result.cognitivePerformanceIndex) : null;
 const actualSpfs = result.samnPerelli && result.samnPerelli.score!=null ? Number(result.samnPerelli.score) : null;
 const best = Number(settings.cpiBestMs)||800;
 const worst = Number(settings.cpiWorstMs)||2400;
 const span = worst - best;
 const cpiToMs = c => Math.round(best + ((100-c)/100)*span);
 const rows = [
  {spfs:7,cpi:100,ms:cpiToMs(100),cap:"FUNCTIONING EXCEPTIONALLY WELL"},
  {spfs:6,cpi:80,ms:cpiToMs(80),cap:"FUNCTIONING VERY WELL"},
  {spfs:5,cpi:75,ms:cpiToMs(75),cap:"FUNCTIONING NORMALLY"},
  {spfs:4,cpi:50,ms:cpiToMs(50),cap:"FUNCTIONING SLIGHTLY LESS THAN NORMAL"},
  {spfs:3,cpi:25,ms:cpiToMs(25),cap:"FUNCTIONING STARTING TO SLOW"},
  {spfs:2,cpi:11,ms:cpiToMs(11),cap:"DIFFICULT TO FUNCTION / BECOMING UNSAFE"},
  {spfs:1,cpi:0,ms:cpiToMs(0),cap:"UNABLE TO FUNCTION / DEFINITELY UNSAFE"},
 ];
 let nearestIdx = -1;
 if(cpi!=null){
  let bestDiff = Infinity;
  rows.forEach((r,i)=>{
   const d = Math.abs(cpi-r.cpi);
   if(d < bestDiff){
    bestDiff = d;
    nearestIdx = i;
   }
  });
 }
 const esc = s => String(s)
   .replace(/&/g,"&amp;")
   .replace(/</g,"&lt;")
   .replace(/>/g,"&gt;");
 let html = '<div class="cogperf-table-wrap">';
 html += '<div class="cogperf-head left">Cognitive Performance Table</div>';
 html += '<div class="cogperf-head right">Cognitive Performance Capability *</div>';
 rows.forEach((r,i)=>{
   const isActual = actualSpfs!=null && r.spfs===actualSpfs;
   const leftCls = isActual ? 'cogperf-row left actual' : 'cogperf-row left';
   const rightCls = isActual ? 'cogperf-row right actual' : 'cogperf-row right';
   const arrow = i===nearestIdx ? ' <span class="cogperf-arrow">← CPI</span>' : '';
   html += `<div class="${leftCls}">${isActual ? '<strong>' : ''}SP-FS ${r.spfs}${isActual ? '</strong>' : ''}: CPI ${String(r.cpi).padStart(3,' ')} | ${r.ms} ms${arrow}</div>`;
   html += `<div class="${rightCls}">${isActual ? '<strong>' : ''}${esc(r.cap)}${isActual ? '</strong>' : ''}</div>`;
 });
 html += '</div>';
 return html;
}
function buildRankedSummary(result){
 const el=$("rankedText"); if(!el) return;
 const hr="─────────────────────────";
 const modeName = result.testMode==="mode2" ? "SPC Mode" : result.testMode==="mode3" ? "SPCMP Mode" : "CogSpeed Mode";
 el.textContent =
`CogSpeed ${APP_VERSION} — ${modeName}
${hr}
RANKED TARGET / POSITION AVERAGES — POOLED SAME-MODE SESSIONS
${formatModePooledRankSection(result.testMode)}`;
}

function escapeHtmlSummary(s){
 return String(s)
  .replace(/&/g,"&amp;")
  .replace(/</g,"&lt;")
  .replace(/>/g,"&gt;");
}
function summaryBlockWithTable(prefix, tableHtml){
 return `<pre style="white-space:pre-wrap;word-break:break-word;margin:0;font:500 15px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--text)">${escapeHtmlSummary(prefix)}</pre>${tableHtml}`;
}

function buildSummary(result){
 const el=$("summaryText"); if(!el) return;
 const hr="─────────────────────────";
 const spf=result.samnPerelli?`${result.samnPerelli.score} (${result.samnPerelli.label})`:"not recorded";
 let geoStr="unavailable";
 if(result.geo){
  geoStr=result.geo.status==="ok"
   ?(result.geo.address||`${result.geo.latitude.toFixed(5)}, ${result.geo.longitude.toFixed(5)}`)+` (±${Math.round(result.geo.accuracy_m)}m)`
   :result.geo.status;
 }
 const modeName = result.testMode==="mode2" ? "SPC Mode" : result.testMode==="mode3" ? "SPCMP Mode" : "CogSpeed Mode";
 if(result.testMode==="mode2"){
  el.textContent=
`CogSpeed ${APP_VERSION} — ${modeName}
${hr}
Test Mode:  ${formatModeTag(result.testMode)}\nSession:    ${result.sessionNumber!=null?result.sessionNumber:"—"}\nSubject ID:  ${result.subjectId}
Date / Time:  ${new Date(result.time).toLocaleString()}
Test duration: ${formatDuration(result.testDurationMs)}
Location:   ${geoStr}
${hr}
FATIGUE (S-PF)
 Pre-test rating: ${spf}
${hr}
SELF-PACED CALIBRATION (SPC)
 Total self-paced responses: ${result.selfPacedResponseCount}
 Average self-paced RT: ${result.selfPacedResponseMeanMs!=null?result.selfPacedResponseMeanMs.toFixed(1)+" ms":"—"}
 Self-paced RT SD:   ${result.selfPacedResponseSdMs!=null?result.selfPacedResponseSdMs.toFixed(1)+" ms":"—"}
 Total response avg: ${result.allResponseMeanMs!=null?result.allResponseMeanMs.toFixed(1)+" ms":"—"}
 Total response SD:  ${result.allResponseSdMs!=null?result.allResponseSdMs.toFixed(1)+" ms":"—"}
 Correct self-paced: ${result.selfPacedCorrect}
 Calibration wrong: ${result.calibrationErrors!=null?result.calibrationErrors:result.selfPacedWrong}
 Paced wrong:       ${result.pacedErrors!=null?result.pacedErrors:0}
 Recovery wrong:    ${result.recoveryErrors!=null?result.recoveryErrors:0}
 Total wrong:       ${result.totalIncorrect}
${hr}
COGNITIVE PERFORMANCE TABLE
 ${getCognitivePerformanceTableText(result)}
${hr}
END REASON
 ${result.endReason||"Run complete"}`;
  return;
 }
 if(result.testMode==="mode3"){
  el.textContent=
`CogSpeed ${APP_VERSION} — ${modeName}
${hr}
Test Mode:  ${formatModeTag(result.testMode)}\nSession:    ${result.sessionNumber!=null?result.sessionNumber:"—"}\nSubject ID:  ${result.subjectId}
Date / Time:  ${new Date(result.time).toLocaleString()}
Test duration: ${formatDuration(result.testDurationMs)}
Location:   ${geoStr}
${hr}
FATIGUE (S-PF)
 Pre-test rating: ${spf}
${hr}
SELF-PACED CALIBRATION
 Total self-paced responses: ${result.selfPacedResponseCount}
 Self-paced correct: ${result.selfPacedCorrect}
 Calibration wrong: ${result.calibrationErrors!=null?result.calibrationErrors:result.selfPacedWrong}
 Paced wrong:       ${result.fixedPacedWrong!=null?result.fixedPacedWrong:(result.pacedErrors||0)}
 Recovery wrong:    ${result.recoveryErrors!=null?result.recoveryErrors:0}
 Total wrong:       ${result.totalIncorrect}
 Average calibration RT: ${result.calibrationAverageMs!=null?result.calibrationAverageMs.toFixed(1)+" ms":"—"}\nSelf-paced RT SD: ${result.selfPacedResponseSdMs!=null?result.selfPacedResponseSdMs.toFixed(1)+" ms":"—"}
${hr}
FIXED MACHINE-PACED PHASE (SPCMP)
 Machine-paced baseline: ${result.fixedPacedBaselineMs!=null?result.fixedPacedBaselineMs.toFixed(1)+" ms":"—"}
 Average machine-paced RT: ${result.pacedResponseMeanMs!=null?result.pacedResponseMeanMs.toFixed(1)+" ms":"—"}
 Machine-paced RT SD: ${result.pacedResponseSdMs!=null?result.pacedResponseSdMs.toFixed(1)+" ms":"—"}
 Total response avg: ${result.allResponseMeanMs!=null?result.allResponseMeanMs.toFixed(1)+" ms":"—"}
 Total response SD:  ${result.allResponseSdMs!=null?result.allResponseSdMs.toFixed(1)+" ms":"—"}
 Total machine-paced presented: ${result.fixedPacedPresented||0}
 Machine-paced correct: ${result.fixedPacedCorrect||0}
 Machine-paced wrong:   ${result.fixedPacedWrong||0}
${hr}
COGNITIVE PERFORMANCE TABLE
 ${getCognitivePerformanceTableText(result)}
${hr}
END REASON
 ${result.endReason||"Run complete"}`;
  return;
 }
 const blockList=result.blocks&&result.blocks.length?result.blocks.map((b,i)=>` Block ${i+1}: ${b.toFixed(0)} ms`).join("\n"):" none";
 const avg2=result.averageLast2BlockingScoresMs;
 const diff=result.blockScoreDifferenceMs;
 const diffStr=diff!=null?`${diff>0?"+":""}${diff.toFixed(0)} ms (${diff>0?"slower":diff<0?"faster":"no change"})`:"—";
 const cps=result.cognitivePerformanceIndex;
 const sd=result.pacedResponseSdMs;
 el.textContent=
`CogSpeed ${APP_VERSION} — ${modeName}
${hr}
Test Mode:  ${formatModeTag(result.testMode)}\nSession:    ${result.sessionNumber!=null?result.sessionNumber:"—"}\nSubject ID:  ${result.subjectId}
Date / Time:  ${new Date(result.time).toLocaleString()}
Test duration: ${formatDuration(result.testDurationMs)}
Location:   ${geoStr}
${hr}
FATIGUE (S-PF)
 Pre-test rating: ${spf}
${hr}
CALIBRATION
 Average RT: ${result.calibrationAverageMs!=null?result.calibrationAverageMs.toFixed(1)+" ms":"—"}
${hr}
MACHINE-PACED PERFORMANCE
 Block scores:
${blockList}
 Avg last 2 blocks: ${avg2!=null?avg2.toFixed(1)+" ms":"—"}
 Block score diff: ${diffStr}
 *** CPI: ${cps!=null?cps.toFixed(1)+" / 100":"—"} ***
${hr}
RESPONSE STATISTICS
 Total taps: ${result.totalResponses}
 Correct: ${result.totalCorrect}
 Calibration wrong: ${result.calibrationErrors!=null?result.calibrationErrors:0}
 Paced wrong: ${result.pacedErrors!=null?result.pacedErrors:0}
 Recovery wrong: ${result.recoveryErrors!=null?result.recoveryErrors:0}
 Total wrong: ${result.totalIncorrect}
 Missed: ${result.missedTrials}
 END REASON: ${result.endReason||"Run complete"}
 Mean paced RT: ${result.pacedResponseMeanMs!=null?result.pacedResponseMeanMs.toFixed(1)+" ms":"—"}
 Paced RT SD: ${sd!=null?sd.toFixed(1)+" ms":"—"}
${hr}
COGNITIVE PERFORMANCE TABLE\n Bold SP-FS row = actual SP-FS score. Arrow = nearest CPI reference. Capability text is shown at right.\n`;
el.innerHTML=summaryBlockWithTable(el.textContent + ``, getCognitivePerformanceTableText(result));
}

// ─── SPEEDOMETER V2 — Vintage Auto Meter style ────────────────
// Full 240° round dial. Cream face, chrome bezel.
// Color arc: red(0-25) → orange(25-50) → light green(50-75) → dark green(75-100)
// Needle sweeps from 0 to final CPI in 1.4s ease-in-out, then dithers ±0.8 CPI.
// Block ms in green LCD box appears at needle tip after sweep completes.
// On fail: needle stays at 0, red needle, no block box.
// ──────────────────────────────────────────────────────────────
let _speedoRaf = null;

function roundRect(ctx, x, y, w, h, r){
 ctx.beginPath();
 ctx.moveTo(x+r, y);
 ctx.lineTo(x+w-r, y); ctx.arcTo(x+w, y, x+w, y+r, r);
 ctx.lineTo(x+w, y+h-r); ctx.arcTo(x+w, y+h, x+w-r, y+h, r);
 ctx.lineTo(x+r, y+h); ctx.arcTo(x, y+h, x, y+h-r, r);
 ctx.lineTo(x, y+r); ctx.arcTo(x, y, x+r, y, r);
 ctx.closePath();
}

function drawSpeedometer(canvas, cps, blockMs, success, showBlock){
 const dpr = window.devicePixelRatio||1;
 const W = canvas.offsetWidth||380;
 const H = W; // square canvas for circular gauge
 canvas.width = W*dpr; canvas.height = H*dpr;
 canvas.style.width = W+"px"; canvas.style.height = H+"px";
 const ctx = canvas.getContext("2d");
 ctx.scale(dpr, dpr);

 const cx = W/2, cy = H/2;
 const R = W*0.375; // dial radius — leaves margin for tip box

 // 240° sweep: 0 CPI at 150° (lower-left), 100 CPI at 390°=30° (lower-right)
 const A_START = 150*Math.PI/180;
 const A_SWEEP = 240*Math.PI/180;
 function toAngle(v){ return A_START + (Math.max(0,Math.min(100,v))/100)*A_SWEEP; }

 const na = toAngle(cps); // needle angle
 const needleColor = success ? "#0d0a00" : "#cc0000";

 // ── 1. Dark outer ring ──
 ctx.beginPath(); ctx.arc(cx,cy,R*1.20,0,Math.PI*2);
 ctx.fillStyle="#1a1a1a"; ctx.fill();

 // ── 2. Chrome bezel (linear gradient for metallic sheen) ──
 const cg = ctx.createLinearGradient(cx-R*1.15, cy-R*1.15, cx+R*1.15, cy+R*1.15);
 cg.addColorStop(0.00,"#f8f8f8"); cg.addColorStop(0.15,"#c8c8c8");
 cg.addColorStop(0.32,"#eeeeee"); cg.addColorStop(0.50,"#a0a0a0");
 cg.addColorStop(0.68,"#e0e0e0"); cg.addColorStop(0.85,"#b4b4b4");
 cg.addColorStop(1.00,"#d8d8d8");
 ctx.beginPath(); ctx.arc(cx,cy,R*1.16,0,Math.PI*2);
 ctx.fillStyle=cg; ctx.fill();

 // Bezel inner shadow
 ctx.beginPath(); ctx.arc(cx,cy,R*1.02,0,Math.PI*2);
 ctx.strokeStyle="rgba(0,0,0,0.5)"; ctx.lineWidth=R*0.025; ctx.stroke();

 // ── 3. Cream parchment face ──
 const fg = ctx.createRadialGradient(cx-R*0.12,cy-R*0.12,0, cx,cy,R);
 fg.addColorStop(0,"#f6edd8"); fg.addColorStop(0.55,"#efe5c8"); fg.addColorStop(1,"#d8cfb0");
 ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
 ctx.fillStyle=fg; ctx.fill();
 // Edge shadow
 ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
 ctx.strokeStyle="rgba(0,0,0,0.14)"; ctx.lineWidth=R*0.018; ctx.stroke();

 // ── 4. Color arc (4 wedge segments) ──
 const arcOut = R*0.925, arcIn = R*0.815;
 const ARC = [
  {s:0, e:25, c:"#cc1100"},
  {s:25, e:50, c:"#ee6500"},
  {s:50, e:75, c:"#7ec800"},
  {s:75, e:100, c:"#006400"},
 ];
 ARC.forEach(seg=>{
  const a1=toAngle(seg.s), a2=toAngle(seg.e);
  ctx.beginPath();
  ctx.arc(cx,cy,arcOut,a1,a2,false);
  ctx.arc(cx,cy,arcIn, a2,a1,true);
  ctx.closePath(); ctx.fillStyle=seg.c; ctx.fill();
  // Inner highlight strip
  ctx.beginPath(); ctx.arc(cx,cy,arcIn+(arcOut-arcIn)*0.18,a1,a2,false);
  ctx.strokeStyle="rgba(255,255,255,0.20)"; ctx.lineWidth=R*0.026; ctx.stroke();
 });
 // Segment dividers
 [0,25,50,75,100].forEach(v=>{
  const a=toAngle(v);
  ctx.beginPath();
  ctx.moveTo(cx+arcIn*Math.cos(a), cy+arcIn*Math.sin(a));
  ctx.lineTo(cx+arcOut*Math.cos(a),cy+arcOut*Math.sin(a));
  ctx.strokeStyle="rgba(0,0,0,0.45)"; ctx.lineWidth=1.2; ctx.stroke();
 });

 // ── 5. Tick marks ──
 const TOUT = R*0.79;
 for(let v=0;v<=100;v++){
  const a=toAngle(v);
  const isMaj=v%10===0, isMid=v%5===0;
  const tLen = isMaj?R*0.175:isMid?R*0.10:R*0.055;
  const lw  = isMaj?R*0.023:isMid?R*0.013:R*0.007;
  ctx.beginPath();
  ctx.moveTo(cx+TOUT*Math.cos(a), cy+TOUT*Math.sin(a));
  ctx.lineTo(cx+(TOUT-tLen)*Math.cos(a), cy+(TOUT-tLen)*Math.sin(a));
  ctx.strokeStyle="#111"; ctx.lineWidth=lw; ctx.lineCap="round"; ctx.stroke();
 }
 // Triangular arrow pointers at 0 and 100
 [0,100].forEach(v=>{
  const a=toAngle(v), pr=TOUT+R*0.012, sz=R*0.038;
  ctx.save();
  ctx.translate(cx+pr*Math.cos(a), cy+pr*Math.sin(a));
  ctx.rotate(a+Math.PI/2);
  ctx.beginPath();
  ctx.moveTo(0,-sz*1.2); ctx.lineTo(sz*0.55,sz*0.6); ctx.lineTo(-sz*0.55,sz*0.6);
  ctx.closePath(); ctx.fillStyle="#111"; ctx.fill();
  ctx.restore();
 });

 // ── 6. Numbers ──
 const NUM_R = R*0.545;
 ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillStyle="#111";
 for(let v=0;v<=100;v+=10){
  const a=toAngle(v), x=cx+NUM_R*Math.cos(a), y=cy+NUM_R*Math.sin(a);
  const fs = v%20===0 ? R*0.108 : R*0.090;
  ctx.font=`bold ${fs.toFixed(1)}px -apple-system,"Helvetica Neue",Arial,sans-serif`;
  ctx.fillText(String(v),x,y);
 }

 // ── 7. "CPI" italic serif label (replaces "Auto Meter" branding) ──
 ctx.font=`italic ${(R*0.105).toFixed(1)}px Georgia,"Times New Roman",serif`;
 ctx.fillStyle="#111"; ctx.textAlign="center"; ctx.textBaseline="middle";
 ctx.fillText("CPI", cx+R*0.13, cy+R*0.285);

 // ── 8. Needle (tapered, pointed) ──
 ctx.save();
 ctx.translate(cx,cy); ctx.rotate(na);
 ctx.beginPath();
 ctx.moveTo(-R*0.155, -R*0.026);
 ctx.lineTo(R*0.62,  -R*0.013);
 ctx.lineTo(R*0.73,  0);
 ctx.lineTo(R*0.62,  R*0.013);
 ctx.lineTo(-R*0.155, R*0.026);
 ctx.closePath();
 ctx.fillStyle=needleColor; ctx.fill();
 // Highlight line
 ctx.beginPath();
 ctx.moveTo(-R*0.10, -R*0.009); ctx.lineTo(R*0.60, -R*0.004);
 ctx.strokeStyle="rgba(255,255,255,0.22)"; ctx.lineWidth=R*0.007; ctx.stroke();
 ctx.restore();

 // ── 9. Block ms box at needle tip (shown after sweep completes) ──
 if(showBlock && blockMs!=null && success){
  const tipR = R*0.99;
  const bx=cx+tipR*Math.cos(na), by=cy+tipR*Math.sin(na);
  const label = Math.round(blockMs)+" ms";
  const fs=R*0.092;
  ctx.font=`bold ${fs.toFixed(1)}px monospace`;
  const tw=ctx.measureText(label).width+R*0.15, th=fs*1.6;
  let bxL=bx-tw/2, byT=by-th/2;
  bxL=Math.max(3,Math.min(bxL,W-tw-3));
  byT=Math.max(3,Math.min(byT,H-th-3));
  // Dark green LCD box
  ctx.fillStyle="#0c2808";
  roundRect(ctx,bxL,byT,tw,th,5); ctx.fill();
  ctx.strokeStyle="#2a7020"; ctx.lineWidth=1.5;
  roundRect(ctx,bxL,byT,tw,th,5); ctx.stroke();
  ctx.fillStyle="#44ff44"; ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText(label, bxL+tw/2, byT+th/2);
 }

 // ── 10. Center hub ──
 const hubGr = ctx.createRadialGradient(cx-R*0.022,cy-R*0.022,0, cx,cy,R*0.092);
 hubGr.addColorStop(0,"#808080"); hubGr.addColorStop(0.45,"#383838"); hubGr.addColorStop(1,"#111");
 ctx.beginPath(); ctx.arc(cx,cy,R*0.092,0,Math.PI*2); ctx.fillStyle=hubGr; ctx.fill();
 ctx.beginPath(); ctx.arc(cx,cy,R*0.092,0,Math.PI*2);
 ctx.strokeStyle="#555"; ctx.lineWidth=R*0.012; ctx.stroke();
 ctx.beginPath(); ctx.arc(cx,cy,R*0.030,0,Math.PI*2); ctx.fillStyle="#606060"; ctx.fill();
 ctx.beginPath(); ctx.arc(cx,cy,R*0.013,0,Math.PI*2); ctx.fillStyle="#aaa"; ctx.fill();
}

// Sweep needle 0→CPI in 1.4s ease-in-out, then dither ±0.8 CPI
function animateSpeedometer(canvas, targetCps, blockMs, success){
 stopSpeedometer();
 const finalCPI = success ? targetCps : 0;
 const SWEEP_DUR = 1400;
 let startTime=null, phase="sweep", ditherStart=null;

 function frame(ts){
  if(!startTime) startTime=ts;
  const elapsed=ts-startTime;
  let cps;
  if(phase==="sweep"){
   const t=Math.min(elapsed/SWEEP_DUR,1);
   // Cubic ease-in-out
   const e=t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
   cps=finalCPI*e;
   if(t>=1){ phase="dither"; ditherStart=ts; }
  } else {
   const dt=ts-ditherStart;
   cps=finalCPI+Math.sin(dt*0.0044)*0.54+Math.sin(dt*0.0071)*0.26;
  }
  drawSpeedometer(canvas, cps, blockMs, success, phase==="dither");
  _speedoRaf=requestAnimationFrame(frame);
 }
 _speedoRaf=requestAnimationFrame(frame);
}
function stopSpeedometer(){ if(_speedoRaf){ cancelAnimationFrame(_speedoRaf); _speedoRaf=null; } }

// ─── Results page — gear spin outro (0.5s) then thinking box ───
// ─── RESULTS PAGE FLOW ────────────────────────────────────────
// THINKING BOX: 2s animated steam+sparks FX after test ends.
// SUCCESS/FAIL BOX: 3s outcome overlay (green=SUCCESS/red=Test Failed).
// Then shows summary overlay with full result text.
// LAST RESULTS: accessible from admin → 📄 Last Results button.
// E-MAIL: emailResults() opens mailto: with full result text body.
// ──────────────────────────────────────────────────────────────
function showResultsPage(){
 beginCurtainTransition();
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
 endCurtainTransition();
 setTimeout(()=>{
  // 3. Show thinking box
  const ts=$("testScreen"); if(ts) ts.classList.add("hidden");
  const thinking=$("thinkingOverlay");
  if(thinking){ thinking.classList.remove("hidden"); startFX(); }
  setTimeout(()=>{
   stopFX(); if(thinking) thinking.classList.add("hidden");
   renderSpeedometerOutcome(last);
   endCurtainTransition();
 try{ updateStartPageLinks(); }catch(e){}
  },2000);
 },500);
}

// ─── Session control ───
// ─── SESSION STATE MANAGEMENT ─────────────────────────────────
// clearCurrentSession(): resets all trial/block/calibration state
//  while preserving subjectId and samnPerelli for retests.
// saveSettings() / loadSettings(): persist to localStorage.
// ──────────────────────────────────────────────────────────────
function clearCurrentSession(){
 clearTimer(); clearNoResponseTimer(); clearMaxTestTimer();
 state.phase="idle"; state.duration=null; state.blockDuration=null;
 state.current=null; state.previous=null; state.unresolvedStreak=0;
 state.overloads=[]; state.recoveries=[]; state.recoveryCorrectCompleted=0;
 state.spCorrectStreak=0; state.spWrongCount=0; state.terminalBlockReason=null;
 state.totalTrials=0; state.endReason=""; state.totalResponses=0; state.pacedErrors=0; state.recoveryErrors=0;
 state.testStartTime=null; state.totalCorrect=0; state.totalIncorrect=0;
 state.missedTrials=0; state.rollMeanLog=[]; state.lastFiveAnswers=[];
 state.calibrationTrialIndex=0; state.calibrationRTs=[]; state.calibrationErrors=0;
 state.pacedRTs=[]; state.rtLog=[]; state.previousMissed=false; state.lastFrameDuration=null; state.presentedRoundDuration=null;
 state.activeMode=settings.testMode||"mode1"; state.selfPacedRTs=[]; state.selfPacedCorrect=0; state.selfPacedWrong=0;
 state.fixedPacedBaseline=null; state.fixedPacedPresented=0; state.fixedPacedCorrect=0; state.fixedPacedWrong=0;
 state.hadResponse=false; state.blockRestartBaseline=null; state.pendingPriorMiss=null; state.pendingLatePacing=null;
 state._prevTrialOpenedAt=null; state._prevPresentedDurationMs=null;
 state.geo=null; state.benchmark=null; state.lastResultText=null;
 updateCPIDisplay(null); updateMetrics(); setProbeIdle(); setTestingQuiet(false);
}
// ─── PAGE NAVIGATION ──────────────────────────────────────────
// goToStartPage(): returns to subject ID entry, clears test state.
// startOverFlow(): full reset including subject ID and SP-FS.
// ──────────────────────────────────────────────────────────────
function goToStartPage(){
 clearCurrentSession();
 ["thinkingOverlay","outcomeOverlay","testScreen"].forEach(id=>{ const el=$(id); if(el) el.classList.add("hidden"); });
 const curtain=$("curtain"); if(curtain) curtain.classList.remove("open");
 probeCell.classList.remove("gspin-f","gspin-r","gidle-f","gidle-r");
 stopFX(); setStatus("Ready"); showOnly("subjectOverlay");
 try{ updateStartPageLinks(); }catch(e){}
 restoreSubjectFromProfile();
}
function startOverFlow(){
 clearCurrentSession(); state.subjectId=null; state.samnPerelli=null;
 fatigueOut.textContent="—"; $("subjectIdInput").value="";
 _adminUnlocked=false;
 // Full reset: clear welcome-back display but preserve saved profile in localStorage
 const wl=$("subjectWelcome"); if(wl) wl.style.display="none";
 const we=$("welcomeEmail"); if(we) we.textContent="";
 const hint=$("subjectHint"); if(hint) hint.textContent="Enter your email to begin.";
 setStatus("Reset. Enter Subject ID."); showOnly("subjectOverlay");
 endCurtainTransition();
}

// ─── Gear spin intro then start ───
// ─── GEAR SPIN INTRO / OUTRO ──────────────────────────────────
// runGearSpinThenStart(): closes curtain, reopens it visibly (0.75s),
//  then keeps all gears visibly spinning for 2.0s before firing callback.
// Outro spin triggered in showResultsPage() after test ends.
// CURTAIN TRANSITION: left/right panels slide apart on open,
//  slide closed on test end (CSS transform translateX).
// During curtain motion, overlays/text are force-hidden to prevent
// leaked text fragments from flashing on screen.
// ──────────────────────────────────────────────────────────────

function beginCurtainTransition(){
 document.body.classList.add("curtain-active");
 hideAllOverlays();
 const rb=$("resultBox"); if(rb){ rb.textContent=""; rb.classList.add("hidden"); }
 const pl=$("phaseLabel"); if(pl) pl.textContent="";
 const sl=$("statusLine"); if(sl) sl.textContent="";
 const probeLbl=document.querySelector("#testScreen .probe-label");
 if(probeLbl) probeLbl.textContent="";
}
function endCurtainTransition(){
 document.body.classList.remove("curtain-active");
}

function runGearSpinThenStart(callback) {
 beginCurtainTransition();
 const ts = $("testScreen"); if(ts) ts.classList.remove("hidden");

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
  const btn = document.createElement("div");
  btn.className = "resp-btn";
  btn.innerHTML = buildGearSVG(i+1, null, "large", i%2===0?"gspin-f":"gspin-r");
  respGrid.appendChild(btn);
 }

 const curtain = $("curtain");
 if(curtain){
  curtain.classList.remove("open");
  void curtain.offsetWidth;
 }

 setTimeout(()=>{
  if(curtain) curtain.classList.add("open");
  setTimeout(()=>{
   setTimeout(()=>{
    callback();
    endCurtainTransition();
   }, 2000);
  }, 750);
 }, 40);
}

// ─── START TEST ───
// ─── TEST START ───────────────────────────────────────────────
// Validates subjectId + samnPerelli, clears session state,
// captures geo, fires gear spin intro, then opens first trial.
// noteAnyResponse() starts the no-response timer AFTER spin completes
//  so the 10s calibration clock only runs when gears are visible.
// ──────────────────────────────────────────────────────────────
function startTest(){
 if(!state.subjectId){ showOnly("subjectOverlay"); setStatus("Enter Subject ID first"); return; }
 if(!state.samnPerelli){ showOnly("fatigueOverlay"); setStatus("Select fatigue rating first"); return; }
 const sid=state.subjectId, spf=state.samnPerelli, mode=settings.testMode||"mode1";
 clearCurrentSession();
 state.subjectId=sid; state.samnPerelli=spf; state.activeMode=mode;
 const fo=$("fatigueOut"); if(fo) fo.textContent=String(spf.score);
 hideAllOverlays();
 setTestingQuiet(true);
 captureGeo();
 runGearSpinThenStart(()=>{
  state.phase="calibration";
  openTrial("calibration");
 });
}

// ─── Trial detail log ───
// ─── TRIAL DETAIL LOG ─────────────────────────────────────────
// Full per-trial table: trial#, phase, RT, outcome, probe, correct
//  cell, response. Session selector dropdown. CSV download button.
// Accessible from admin → 📋 Trial Detail button.
// ──────────────────────────────────────────────────────────────
function buildTrialLog(sessionIndex){
 const tbody=$("trialLogBody"); if(!tbody) return;
 // Populate session selector
 const sel=$("trialLogSessionSelect");
 const preservedValue = (sessionIndex!=null) ? String(sessionIndex) : (sel ? sel.value : null);
 if(sel){
  sel.innerHTML="";
  // Most recent first
  [...state.history].reverse().forEach((r,i)=>{
   const idx=state.history.length-1-i;
   const opt=document.createElement("option");
   opt.value=String(idx);
   opt.textContent=`Session ${idx+1} · ${formatModeTag(r.testMode)} · ${r.subjectId} · ${new Date(r.time).toLocaleString()}`;
   sel.appendChild(opt);
  });
  if(preservedValue!=null) sel.value=String(preservedValue);
 }
 const idx=sel?Number(sel.value):state.history.length-1;
 const result=state.history[idx];
 const log=result?result.rtLog:state.rtLog;
 const meta=$("trialLogMeta"); if(meta && result) meta.textContent=`Session ${idx+1} · ${formatModeTag(result.testMode)} · SP-FS ${result.samnPerelli?result.samnPerelli.score:"—"} · ${new Date(result.time).toLocaleString()}`;
 tbody.innerHTML="";
 if(!log||!log.length){
  tbody.innerHTML='<tr><td colspan="10" style="text-align:center;color:var(--muted);padding:12px">No trial data for this session</td></tr>';
  const meta=$("trialLogMeta"); if(meta) meta.textContent="No data";
  return;
 }
 // Color coding
 const outcomeColor={correct:"#00ff88",wrong:"#ff4466",missed:"#888","Warmup":"#ffd166"};
 log.forEach(e=>{
  const tr=document.createElement("tr");
  const timeStr=e.clockTime?new Date(e.clockTime).toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit",fractionalSecondDigits:3}):"—";
  const rtStr=e.rt!=null?e.rt.toLocaleString():"—";
  const durStr=e.durationMs!=null?e.durationMs.toLocaleString()+"ms":"—";
  const isWarmup = !!(e.warmup || e.counted===false || e.outcome==="Warmup");
  const phaseLabel = isWarmup ? "Warmup" : (e.phase||"—");
  const outcomeLabel = isWarmup ? "Warmup" : (e.outcome||"—");
  const oc=outcomeColor[outcomeLabel]||"var(--muted)";
  tr.innerHTML=`<td style="font-weight:700">${e.seq}</td><td style="font-size:10px">${timeStr}</td><td style="font-size:10px;color:var(--muted)">${phaseLabel}</td><td>${durStr}</td><td style="font-weight:700">${rtStr}</td><td style="color:${oc};font-weight:700">${outcomeLabel}</td><td>${e.counted===false?"No":"Yes"}</td><td>${e.probe}</td><td style="color:var(--accent)">${e.correctCell}</td><td style="color:${oc==="var(--muted)"?"var(--muted)":oc}">${e.response}</td>`;
  tbody.appendChild(tr);
 });
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
 const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`${STORAGE_PREFIX}_trials_${subj}.csv`; a.click();
}

// Presentation Rate vs Response Time (all sessions)
// - all sessions plotted on one graph
// - selected session highlighted with Prev/Next buttons
// - smaller ms = better performance and graphs higher
// Presentation Rate vs Response Time (overlaid sessions)
// - all sessions share the same x-axis
// - every session starts at trial 1
// - sessions can have different lengths
// - selected session is highlighted
// - smaller ms = better performance and graphs higher
// Presentation Rate vs Response Time (same-mode overlaid sessions)
// - only sessions from the SAME mode as the selected session are overlaid
// - all overlaid sessions share the same x-axis starting at trial 1
// - smaller ms = better performance and graphs higher
// - wrong responses are marked with red dots on the RT series
function drawRateRtChart(canvas, sessions, selectedSessionIndex){
 if(!canvas) return;
 const ctx = canvas.getContext("2d"), W=canvas.width, H=canvas.height;
 ctx.clearRect(0,0,W,H);
 ctx.fillStyle="#081321"; ctx.fillRect(0,0,W,H);

 const PAD={top:30,right:56,bottom:48,left:52}, cW=W-PAD.left-PAD.right, cH=H-PAD.top-PAD.bottom;
 const hist = Array.isArray(sessions) ? sessions : [];
 const selected = hist.find(s=>s._actualIndex===selectedSessionIndex) || null;
 const selectedMode = selected ? (selected.testMode||"mode1") : null;
 const filtered = selectedMode ? hist.filter(s=>(s.testMode||"mode1")===selectedMode) : hist;

 function inferDuration(entry){
  if(!entry || typeof entry!=="object") return null;
  if(entry.durationMs!=null && Number.isFinite(Number(entry.durationMs))) return Number(entry.durationMs);
  for(const key of ["duration","roundDuration","presentedRoundDuration","baselineMs"]){
   if(entry[key]!=null && Number.isFinite(Number(entry[key]))) return Number(entry[key]);
  }
  return null;
 }

 const prepared = filtered.map((session)=>{
  const log = (Array.isArray(session.rtLog) ? session.rtLog : [])
   .map((e,i)=>({
     trial:i+1,
     rt:(e && e.rt!=null && Number.isFinite(Number(e.rt))) ? Number(e.rt) : null,
     dur:inferDuration(e),
     outcome:e ? e.outcome : null
   }))
   .filter(e=>e.dur!=null || e.rt!=null);
  return {...session, _preparedLog:log};
 }).filter(s=>s._preparedLog.length);

 const allPts = prepared.flatMap(s=>s._preparedLog);
 if(!allPts.length){
  ctx.fillStyle="#d7e7f8"; ctx.font="bold 13px sans-serif"; ctx.textAlign="center";
  const modeTxt = selectedMode ? formatModeTag(selectedMode) : "selected session";
  ctx.fillText(`No response-time graph for ${modeTxt}`, W/2, H/2);
  ctx.font="11px sans-serif";
  ctx.fillStyle="#b7d9ef";
  ctx.fillText("No plottable RT or presentation-rate points were found in saved history.", W/2, H/2 + 22);
  return;
 }

 const maxY = Math.max(1000, ...allPts.map(p=>Math.max(p.dur||0,p.rt||0)));
 const yTop = Math.ceil(maxY/250)*250;
 const maxTrial = Math.max(1, ...allPts.map(p=>p.trial));
 function xOf(trial){ return PAD.left + ((trial-1)/Math.max(1,maxTrial-1))*cW; }
 function yOf(v){ return PAD.top + (((v||0)/yTop)*cH); }

 ctx.strokeStyle="rgba(79,111,153,0.25)"; ctx.lineWidth=1;
 for(let v=0; v<=yTop; v+=250){
  const y=yOf(v);
  ctx.beginPath(); ctx.moveTo(PAD.left,y); ctx.lineTo(PAD.left+cW,y); ctx.stroke();
  ctx.fillStyle="#7fd7ff"; ctx.font="10px sans-serif"; ctx.textAlign="right";
  ctx.fillText(String(v), PAD.left-4, y+4);
 }

 ctx.fillStyle="#9fb7d6"; ctx.font="10px sans-serif"; ctx.textAlign="center";
 const every = Math.max(1, Math.ceil(maxTrial/10));
 for(let t=1; t<=maxTrial; t++){
  if(t % every !== 0 && t !== 1 && t !== maxTrial) continue;
  ctx.fillText(String(t), xOf(t), PAD.top+cH+16);
 }

 ctx.fillStyle="#b7d9ef"; ctx.textAlign="left"; ctx.font="10px sans-serif";
 ctx.fillText("Better performance ↑ (smaller ms)", PAD.left, PAD.top-10);
 const modeLabel = selectedMode ? formatModeTag(selectedMode) : "All Modes";
 ctx.fillText(`${modeLabel} only · all sessions start at trial 1`, PAD.left+180, PAD.top-10);

 prepared.forEach((session)=>{
  const actualSessionIndex = session._actualIndex;
  const isSelected = actualSessionIndex===selectedSessionIndex;
  const alpha = isSelected ? 0.95 : 0.22;
  const durColor = `rgba(255,159,64,${alpha})`;
  const rtColor = `rgba(127,215,255,${alpha})`;

  ctx.strokeStyle=durColor; ctx.lineWidth=isSelected?2.8:1.2; ctx.beginPath();
  let started=false;
  session._preparedLog.forEach((p)=>{
   if(p.dur==null){ started=false; return; }
   const x=xOf(p.trial), y=yOf(p.dur);
   if(!started){ ctx.moveTo(x,y); started=true; } else ctx.lineTo(x,y);
  });
  ctx.stroke();

  ctx.strokeStyle=rtColor; ctx.lineWidth=isSelected?2.8:1.2; ctx.beginPath();
  started=false;
  session._preparedLog.forEach((p)=>{
   if(p.rt==null){ started=false; return; }
   const x=xOf(p.trial), y=yOf(p.rt);
   if(!started){ ctx.moveTo(x,y); started=true; } else ctx.lineTo(x,y);
  });
  ctx.stroke();

  session._preparedLog.forEach((p)=>{
   if(p.rt==null) return;
   const x=xOf(p.trial), y=yOf(p.rt);
   const wrong = p.outcome==="wrong";
   if(wrong){
    ctx.fillStyle=isSelected ? "#ff4466" : "rgba(255,68,102,0.45)";
   }else{
    ctx.fillStyle=isSelected ? "#7fd7ff" : "rgba(127,215,255,0.35)";
   }
   ctx.beginPath(); ctx.arc(x,y,isSelected?2.8:2.0,0,Math.PI*2); ctx.fill();
  });

  const last = session._preparedLog[session._preparedLog.length-1];
  if(last){
   const lx=xOf(last.trial);
   const ly=yOf((last.rt!=null)?last.rt:(last.dur||0));
   ctx.fillStyle=isSelected ? "#ffffff" : "#b7d9ef";
   ctx.font=(isSelected?"bold 11px":"10px")+" sans-serif";
   ctx.textAlign="left";
   ctx.fillText(`S${actualSessionIndex+1}`, Math.min(lx+4, W-28), ly-4);
  }
 });

 ctx.textAlign="left";
 ctx.font="bold 10px sans-serif";
 ctx.fillStyle="#ff9f40"; ctx.fillText("■ Presentation rate", PAD.left, PAD.top+12);
 ctx.fillStyle="#7fd7ff"; ctx.fillText("■ Response time", PAD.left+120, PAD.top+12);
 ctx.fillStyle="#ff4466"; ctx.fillText("● Wrong response", PAD.left+230, PAD.top+12);

 if(selected){
  ctx.fillStyle="#ffffff";
  ctx.font="bold 10px sans-serif";
  ctx.textAlign="right";
  ctx.fillText(`Highlighted: Session ${selectedSessionIndex+1}`, W-PAD.right, PAD.top+12);
 }
}

function buildRateRtOverlay(sessionIndex){
 const sel=$("rateRtSessionSelect");
 const preservedValue = (sessionIndex!=null) ? String(sessionIndex) : (sel ? sel.value : null);
 const reversedSessions = [...state.history].reverse().map((r,i)=>({
  ...r,
  _actualIndex: state.history.length-1-i
 }));
 if(sel){
  sel.innerHTML="";
  const groupedSessions = ["mode1","mode2","mode3"].flatMap(m => reversedSessions.filter(r => (r.testMode||"mode1")===m));
  groupedSessions.forEach((r)=>{
   const idx=r._actualIndex;
   const opt=document.createElement("option");
   opt.value=String(idx);
   opt.textContent=`Session ${idx+1} · ${formatModeTag(r.testMode)} · ${r.subjectId} · ${new Date(r.time).toLocaleString()}`;
   sel.appendChild(opt);
  });
  if(preservedValue!=null) sel.value=String(preservedValue);
  if(sel.value==="" && sel.options.length) sel.selectedIndex = 0;
 }
 const idx=sel?Number(sel.value):state.history.length-1;
 const result=(idx!=null && idx>=0)?state.history[idx]:null;
 const selectedMode = result ? (result.testMode||"mode1") : null;
 const sameModeSessions = selectedMode ? reversedSessions.filter(s => (s.testMode||"mode1")===selectedMode) : reversedSessions;
 const sessionsForChart = sameModeSessions.length ? sameModeSessions : (result ? [{...result, _actualIndex: idx}] : []);
 const meta=$("rateRtMeta");
 if(meta){
  meta.textContent = result ? `Selected: Session ${idx+1} · ${formatModeTag(result.testMode)} · SP-FS ${result.samnPerelli?result.samnPerelli.score:"—"} · ${result.subjectId} · ${new Date(result.time).toLocaleString()} · ${sessionsForChart.length} same-mode session(s) overlaid from trial 1` : "No session selected";
 }
 drawRateRtChart($("rateRtChart"), sessionsForChart, idx);
}

// ─── History & Graphs overlay ───
// ─── HISTORY OVERLAY ──────────────────────────────────────────
// Table of all sessions (newest first) with CPI, blocks, duration.
// Clickable rows show that session's full summary.
// Rendered inside admin → 📈 History & Graphs button.
// ──────────────────────────────────────────────────────────────
buildHistoryOverlay._openSelectedTrial=function(){
 const idx = buildHistoryOverlay._selectedIndex;
 if(idx==null) return;
 buildTrialLog(idx);
 $("trialLogOverlay").classList.remove("hidden");
};

// ─── Device benchmark ───
async function runDeviceBenchmark(force){
 const enabled=force||Number(settings.deviceBenchmarkEnabled||0)===1;
 if(!enabled){ state.benchmark=null; return; }
 const BENCH=1000;
 const ov=$("benchmarkOverlay"),bs=$("benchStatusLine"),bst=$("benchStats"),bg=$("benchGrade"),bc=null,bb=$("benchBtns");
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
// TUTORIAL
// ═══════════════════════════════════════════════════

let _tutStep = 0;

// Demo trial: probe=lines:3, correct=dots:3 @position 3
const TUT_PROBE_CNT = 3;
const TUT_CORRECT_POS = 2; // 0-based, position 3
const TUT_ITEMS = [
 {family:"dots", count:5, pattern:null},
 {family:"lines", count:1, pattern:null},
 {family:"dots", count:3, pattern:null}, // ← correct answer
 {family:"lines", count:4, pattern:null},
 {family:"dots", count:2, pattern:null},
 {family:"lines", count:6, pattern:null},
];
// Fill patterns after patterns are defined
function tutFillPatterns(){
 TUT_ITEMS.forEach(it=>{
  it.pattern = it.family==="dots" ? DOT_PATTERNS[it.count] : LINE_PATTERNS[it.count];
 });
}

function buildTutGearGrid(highlightPos, showPatterns){
 let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;width:100%;max-width:380px">';
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
 const anim = pulsing ? "animation:probePulseG 1.2s ease-in-out infinite;filter:drop-shadow(0 0 20px rgba(127,215,255,1)) drop-shadow(0 0 36px rgba(127,215,255,0.75))" : "animation:none";
 return `<div style="width:clamp(128px,36vw,196px);height:clamp(128px,36vw,196px);${anim}">
  ${buildGearSVG(0, pat, "probe", "")}
 </div>`;
}


function buildTutGearGridAnimated(showPatterns){
 let html = `<style>
  @keyframes tutPairFlash {
   0%, 16.666% { border-color:#7fd7ff; filter:drop-shadow(0 0 10px rgba(127,215,255,0.95)); box-shadow:0 0 16px rgba(127,215,255,0.30) inset; opacity:1; }
   20%, 100% { border-color:transparent; filter:none; box-shadow:none; opacity:.72; }
  }
  @keyframes tutPairFlashCorrect {
   0%, 16.666% { border-color:#00ff88; filter:drop-shadow(0 0 10px rgba(0,255,136,0.95)); box-shadow:0 0 16px rgba(0,255,136,0.30) inset; opacity:1; }
   20%, 100% { border-color:transparent; filter:none; box-shadow:none; opacity:.72; }
  }
 </style>`;
 html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;width:100%;max-width:380px">';
 TUT_ITEMS.forEach((it,i)=>{
  const pat = showPatterns ? it.pattern : null;
  const anim = i===TUT_CORRECT_POS ? "tutPairFlashCorrect 12s linear infinite" : "tutPairFlash 12s linear infinite";
  html += `<div style="border:2px solid transparent;border-radius:10px;aspect-ratio:1;animation:${anim};animation-delay:${i*2}s">
   ${buildGearSVG(i+1, pat, "large", "")}
  </div>`;
 });
 html += '</div>';
 return html;
}

function buildTutRespGridAnimated(){
 let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;width:100%;max-width:380px">';
 for(let i=0;i<6;i++){
  const anim = i===TUT_CORRECT_POS ? "tutPairFlashCorrect 12s linear infinite" : "tutPairFlash 12s linear infinite";
  html += `<div style="aspect-ratio:1;border-radius:10px;border:2px solid transparent;position:relative;animation:${anim};animation-delay:${i*2}s">
   ${buildGearSVG(i+1, null, "large", "")}
  </div>`;
 }
 html += '</div>';
 return html;
}

// ─── Mini trial screen for tutorial background ───
// Returns HTML showing a tiny test screen with different parts highlighted
function buildMiniScreen(highlightPart){
 // highlightPart: "probe" | "stim" | "both" | "resp" | "all"
 const probeOpacity  = (highlightPart==="probe"||highlightPart==="both"||highlightPart==="all") ? 1 : 0.2;
 const stimOpacity  = (highlightPart==="stim" ||highlightPart==="both"||highlightPart==="all") ? 1 : 0.2;
 const respOpacity  = (highlightPart==="resp" ||highlightPart==="both"||highlightPart==="all") ? 1 : 0.2;
 const probeGlow   = highlightPart==="probe"||highlightPart==="both"||highlightPart==="all"
  ? "0 0 12px rgba(127,215,255,0.6)" : "none";

 // Stim grid — 6 small gears with patterns
 let stimHtml = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;width:100%">';
 TUT_ITEMS.forEach((it,i)=>{
  stimHtml += `<div style="aspect-ratio:1">${buildGearSVG(i+1, it.pattern, "small", "")}</div>`;
 });
 stimHtml += '</div>';

 // Probe
 const probeHtml = `<div style="width:clamp(44px,13vw,60px);height:clamp(44px,13vw,60px);filter:drop-shadow(${probeGlow})">
  ${buildGearSVG(0, LINE_PATTERNS[TUT_PROBE_CNT], "probe", "")}
 </div>`;

 // Response buttons — real gear SVGs (no pattern), correct one glowing green
 let respHtml = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;width:100%">';
 for(let i=0;i<6;i++){
  const isHL = (highlightPart==="resp"||highlightPart==="all") && i===TUT_CORRECT_POS;
  const glow = isHL ? "drop-shadow(0 0 6px rgba(0,255,136,0.8))" : "none";
  const border = isHL ? "1px solid #00ff88" : "1px solid transparent";
  respHtml += `<div style="aspect-ratio:1;border-radius:5px;border:${border};filter:${glow}">
   ${buildGearSVG(i+1, null, "small", "")}
  </div>`;
 }
 respHtml += '</div>';

 return `<div style="
  position:absolute;inset:0;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  gap:4px;
  padding:12px;
  opacity:0.22;
  pointer-events:none;
  background:#969696;
  overflow:hidden;
 ">
  <!-- stim grid -->
  <div style="width:min(240px,80vw);opacity:${stimOpacity};transition:opacity 0.3s">
   ${stimHtml}
  </div>
  <!-- probe -->
  <div style="margin:4px 0;opacity:${probeOpacity};transition:opacity 0.3s">
   ${probeHtml}
  </div>
  <!-- response grid -->
  <div style="width:min(240px,80vw);opacity:${respOpacity};transition:opacity 0.3s">
   ${respHtml}
  </div>
 </div>`;
}

const TUT_STEPS = [
 // Step 1: probe highlighted
 {
  build:()=>{
   return buildMiniScreen("probe") + `
   <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:16px;text-align:center">
    <div style="font-size:13px;letter-spacing:.1em;color:rgba(127,215,255,0.8);text-transform:uppercase;margin-bottom:8px;text-shadow:0 0 12px rgba(127,215,255,0.5)">The Probe</div>
    <div style="margin-bottom:14px">${buildTutProbe(true)}</div>
    <div style="background:rgba(10,20,40,0.88);backdrop-filter:blur(4px);border-radius:16px;padding:14px 18px;max-width:300px;border:1px solid rgba(127,215,255,0.2)">
     <div style="font-size:20px;font-weight:700;color:#f5fbff;margin-bottom:6px">This glowing gear is the <span style="color:#7fd7ff">PROBE</span></div>
     <div style="font-size:15px;color:rgba(255,255,255,0.65)">Count the marks inside it — dots or lines</div>
    </div>
   </div>`;
  }
 },
 // Step 2: stim grid highlighted
 {
  build:()=>{
   return buildMiniScreen("stim") + `
   <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:16px;text-align:center">
    <div style="font-size:13px;letter-spacing:.1em;color:rgba(127,215,255,0.8);text-transform:uppercase;margin-bottom:8px;text-shadow:0 0 12px rgba(127,215,255,0.5)">The Targets</div>
    <div style="margin-bottom:10px">${buildTutGearGrid(-1,true)}</div>
    <div style="background:rgba(10,20,40,0.88);backdrop-filter:blur(4px);border-radius:16px;padding:14px 18px;max-width:300px;border:1px solid rgba(127,215,255,0.2)">
     <div style="font-size:20px;font-weight:700;color:#f5fbff;margin-bottom:6px">These 6 gears are your <span style="color:#7fd7ff">TARGETS</span></div>
     <div style="font-size:15px;color:rgba(255,255,255,0.65)">Each has dots or lines — count them</div>
    </div>
   </div>`;
  }
 },
 // Step 3: both highlighted
 {
  build:()=>{
   return buildMiniScreen("both") + `
   <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:16px;text-align:center">
    <div style="font-size:13px;letter-spacing:.1em;color:rgba(127,215,255,0.8);text-transform:uppercase;margin-bottom:8px;text-shadow:0 0 12px rgba(127,215,255,0.5)">The Rule</div>
    <div style="background:rgba(10,20,40,0.88);backdrop-filter:blur(4px);border-radius:16px;padding:14px 18px;max-width:310px;border:1px solid rgba(127,215,255,0.25)">
     <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;justify-content:center">
      <div style="text-align:center">
       <div style="font-size:10px;color:rgba(255,255,255,0.5);margin-bottom:3px">PROBE</div>
       <div style="width:60px;height:60px">${buildGearSVG(0, LINE_PATTERNS[3], "probe", "")}</div>
       <div style="font-size:12px;color:#7fd7ff;margin-top:3px;font-weight:700">lines : 3</div>
      </div>
      <div style="font-size:24px;color:#ffaa44;font-weight:900">↔</div>
      <div style="text-align:center">
       <div style="font-size:10px;color:rgba(255,255,255,0.5);margin-bottom:3px">MATCH</div>
       <div style="width:60px;height:60px;border:2px solid #7fd7ff;border-radius:8px;box-shadow:0 0 10px rgba(127,215,255,0.4)">${buildGearSVG(3, DOT_PATTERNS[3], "probe", "")}</div>
       <div style="font-size:12px;color:#00ff88;margin-top:3px;font-weight:700">dots : 3 ✓</div>
      </div>
     </div>
     <div style="font-size:17px;font-weight:800;color:#7fd7ff">Same COUNT</div>
     <div style="font-size:14px;color:rgba(255,255,255,0.6);margin:2px 0">3 lines → find 3 dots</div>
     <div style="font-size:17px;font-weight:800;color:#ffaa44;margin-top:6px">Opposite TYPE</div>
     <div style="font-size:14px;color:rgba(255,255,255,0.6)">lines ↔ dots</div>
    </div>
   </div>`;
  }
 },
 // Step 4: all highlighted, response buttons shown
 {
  build:()=>{
   return `
   <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:10px 12px;text-align:center;background:#9b9b9b">
    <div style="font-size:13px;letter-spacing:.1em;color:rgba(20,40,60,0.85);text-transform:uppercase;margin-bottom:8px;text-shadow:none">Tap the Match</div>
    <div style="background:rgba(255,255,255,0.10);backdrop-filter:blur(2px);border-radius:16px;padding:12px 16px;max-width:340px;border:1px solid rgba(0,0,0,0.12)">
     <div style="margin-bottom:8px;opacity:1">${buildTutGearGridAnimated(true)}</div>
     <div style="display:flex;justify-content:center;align-items:center;margin:4px 0 10px 0">
      <div style="width:110px;height:110px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 10px rgba(60,60,60,0.35))">
       ${buildTutProbe(true)}
      </div>
     </div>
     <div style="margin-top:2px">${buildTutRespGridAnimated()}</div>
     <div style="font-size:18px;font-weight:900;color:rgba(20,20,20,0.9);margin-top:10px;line-height:1.5">
      The center <span style="font-weight:900">PROBE</span> Dots or Lines match the Dots or Lines in one gear above. Tap <span style="font-weight:900">RESPONSE GEAR</span> in the same position below.
     </div>
    </div>
   </div>`;
  }
 },
 // Step 5: full screen, mention fatigue question
 {
  build:()=>{
   return buildMiniScreen("all") + `
   <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:16px;text-align:center">
    <div style="font-size:36px;margin-bottom:4px">⚡</div>
    <div style="background:rgba(10,20,40,0.88);backdrop-filter:blur(4px);border-radius:16px;padding:14px 18px;max-width:310px;border:1px solid rgba(127,215,255,0.2)">
     <div style="font-size:26px;font-weight:900;color:#7fd7ff;letter-spacing:.06em;margin-bottom:6px">REACT FAST!</div>
     <div style="font-size:15px;color:rgba(255,255,255,0.7);margin-bottom:10px;line-height:1.5">Each gear appears for only a few seconds.<br>Respond before it disappears!</div>
     <div style="font-size:14px;color:rgba(255,255,255,0.55);line-height:1.6;border-top:1px solid rgba(255,255,255,0.1);padding-top:8px">
      Missing a trial is OK — the test adjusts.<br>Wrong answers are OK too.<br>
      <strong style="color:rgba(255,255,255,0.85)">Just respond as fast as you can.</strong>
     </div>
     <div style="margin-top:10px;padding:8px 12px;background:rgba(127,215,255,0.08);border:1px solid rgba(127,215,255,0.3);border-radius:10px;font-size:13px;color:rgba(200,230,255,0.85);line-height:1.5">
      <span style="color:#7fd7ff;font-weight:700">Up next:</span> A quick fatigue rating question — then the test begins!
     </div>
    </div>
   </div>`;
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

 // Direct button labeling/layout logic
 const nextBtn=$("tutNextBtn");
 const skipBtn=$("tutSkipBtn");
 if(nextBtn && skipBtn){
  nextBtn.style.width="100%";
  skipBtn.style.width="100%";
  nextBtn.style.minHeight="52px";
  skipBtn.style.minHeight="52px";

  if(n===0){
   nextBtn.textContent="TUTORIAL";
   skipBtn.textContent="START TEST";
   nextBtn.style.background="";
   nextBtn.style.borderColor="";
   nextBtn.style.color="";
   skipBtn.style.background="";
   skipBtn.style.borderColor="";
   skipBtn.style.color="";
   skipBtn.style.opacity="0.9";
  }else if(n===4){
   nextBtn.textContent="▶ Start Test!";
   skipBtn.textContent="START TEST";
   nextBtn.style.background="linear-gradient(180deg,#0d4a1a,#062a10)";
   nextBtn.style.borderColor="#00ff88";
   nextBtn.style.color="#00ff88";
   skipBtn.style.background="";
   skipBtn.style.borderColor="";
   skipBtn.style.color="";
   skipBtn.style.opacity="0.9";
  }else{
   nextBtn.textContent="Next →";
   skipBtn.textContent="START TEST";
   nextBtn.style.background="";
   nextBtn.style.borderColor="";
   nextBtn.style.color="";
   skipBtn.style.background="";
   skipBtn.style.borderColor="";
   skipBtn.style.color="";
   skipBtn.style.opacity="0.9";
  }
 }
}

// ─── TUTORIAL / TRAINING ──────────────────────────────────────
// 5-step walkthrough: Probe → Targets → Rule → Tap Match → React Fast!
// Each step shows mini trial screen (22% opacity) in background
//  with relevant parts highlighted. Last step mentions SP-FS next.
// Appears after Pattern Refresher, before SP-FS page.
// Skip button on every step.
// ──────────────────────────────────────────────────────────────
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
 $("tutorialOverlay").classList.add("hidden");
 const sb=$("fatigueStartBtn"); if(sb) sb.classList.add("hidden");
 $("fatigueList").querySelectorAll(".fatigue-item").forEach(el=>el.style.background="");
 showOnly("fatigueOverlay");
}

// ─── Event wiring ───
$("subjectNextBtn").onclick=()=>{
 const v=($("subjectIdInput")?.value||"").trim().toLowerCase();
 if(!v){ setStatus("Enter your email address"); return; }
 if(v==="0"||v==="guest"){
  state.subjectId="Guest"; state.profile=null;
  showOnly("refresherOverlay"); setStatus("Continuing as Guest"); return;
 }
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){
  setStatus("Please enter a valid email address"); return;
 }
 $("subjectIdInput").value=v;
 // If profile already saved for this email → skip profile page
 const saved=loadProfile();
 if(saved&&saved.email===v){
  state.subjectId=v; state.profile=saved;
  showOnly("refresherOverlay"); setStatus("Welcome back, "+v);
 } else {
  // New user or different email → collect profile
  openProfileOverlay(v);
 }
};
$("skipRefresherBtn").onclick=()=>{
 showTutorial(); setStatus("Tutorial");
};
$("refBackBtn").onclick=()=>goToStartPage();
 try{ updateStartPageLinks(); }catch(e){}

$("fatigueBackBtn").onclick=()=>goToStartPage();

bindDoubleTapConfirm($("refStartOverBtn"), ()=>startOverFlow(), "Reset", "Tap again to reset");
bindDoubleTapConfirm($("fatigueStartOverBtn"), ()=>startOverFlow(), "Reset", "Tap again to reset");


const _fsb=$("fatigueStartBtn");
if(_fsb) _fsb.onclick=startTest;
let _adminUnlocked = false;
let _adminReturnTo = "subjectOverlay"; // default return destination

$("adminOpenBtn").onclick=()=>{
 _adminReturnTo = "subjectOverlay"; // from subject page
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

// Profile overlay buttons
const _psb=$("profileSaveBtn"); if(_psb) _psb.onclick=saveAndContinueProfile;

// Profile edit button — from subject page (email must already be entered)
const _peb=$("profileEditBtn"); if(_peb) _peb.onclick=()=>{
 const email=($("subjectIdInput")?.value||"").trim().toLowerCase();
 if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
  setStatus("Enter your email first, then tap ⚙ profile"); return;
 }
 openProfileOverlay(email);
};

// Profile button from summary page
const _spb=$("summaryProfileBtn"); if(_spb) _spb.onclick=()=>{
 const p=loadProfile();
 const email=p?.email||state.subjectId||"";
 if(email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
  // After saving profile from summary, return to summary
  _profileReturnTo="summaryOverlay";
  openProfileOverlay(email);
 } else {
  setStatus("No profile to edit — enter email on start page");
 }
};
const _prb=$("profileResetBtn"); if(_prb) _prb.onclick=resetProfile;
// Age validation on input change
const _pbm=$("profileBirthMonth"); if(_pbm) _pbm.onchange=validateProfileAge;
const _pby=$("profileBirthYear"); if(_pby) _pby.oninput=validateProfileAge;

// Welcome back — pre-fill email if profile exists
(()=>{
 const p=loadProfile();
 if(p&&p.email){
  const inp=$("subjectIdInput"); if(inp) inp.value=p.email;
  const wl=$("subjectWelcome"); if(wl) wl.style.display="block";
  const we=$("welcomeEmail"); if(we) we.textContent=p.email;
  const hint=$("subjectHint"); if(hint) hint.textContent="";
 }
})();
$("tutSkipBtn").onclick=()=>tutSkip();
$("unlockBtn").onclick=()=>{
 const v=$("adminPass").value;
 if(v===settings.adminPasscode){
  _adminUnlocked=true;
  $("adminGate").classList.add("hidden"); $("adminBody").classList.remove("hidden"); renderAdmin(); setStatus("Admin unlocked");
 } else setStatus("Incorrect passcode — default is 4822");
};
$("closeAdminBtn").onclick=()=>{
 $("adminOverlay").classList.add("hidden");
 showOnly(_adminReturnTo);
};
$("closeAdminBtn2").onclick=()=>$("benchmarkOverlay").classList.add("hidden");
$("saveAdminBtn").onclick=()=>{ readAdmin(); saveSettings(); renderAdmin(); setStatus("Settings saved"); };
bindDoubleTapConfirm($("resetAdminBtn"), ()=>{ resetAdmin(); setStatus("Settings reset to defaults"); }, "Reset", "Tap again to reset");
const _ecb=$("exportCsvAdminBtn"); if(_ecb) _ecb.onclick=exportCSV;
$("adminTrialLogBtn").onclick=()=>{ buildTrialLog(state.history.length-1); $("trialLogOverlay").classList.remove("hidden"); };
const _arrb=$("adminRateRtBtn"); if(_arrb) _arrb.onclick=()=>{ $("adminOverlay").classList.add("hidden"); $("rateRtOverlay").classList.remove("hidden"); buildRateRtOverlay(); };
$("adminLastResultBtn").onclick=()=>{
 const last=state.history[state.history.length-1];
 if(!last){ setStatus("No results yet."); return; }
 $("adminOverlay").classList.add("hidden");
 buildSummary(last);
 $("summaryOverlay").classList.remove("hidden");
};
$("trialLogCsvBtn").onclick=()=>downloadTrialLogCSV();
const _rrsel=$("rateRtSessionSelect"); if(_rrsel) _rrsel.onchange=()=>buildRateRtOverlay();
const _tsel=$("trialLogSessionSelect");
if(_tsel) _tsel.onchange=()=>buildTrialLog();
const _tlp=$("trialLogPrevBtn"); if(_tlp) _tlp.onclick=()=>{ const s=$("trialLogSessionSelect"); if(!s) return; s.selectedIndex=Math.max(0,s.selectedIndex-1); if(s.onchange) s.onchange(); };
const _tln=$("trialLogNextBtn"); if(_tln) _tln.onclick=()=>{ const s=$("trialLogSessionSelect"); if(!s) return; s.selectedIndex=Math.min(s.options.length-1,s.selectedIndex+1); if(s.onchange) s.onchange(); };
const _rrp=$("rateRtPrevBtn"); if(_rrp) _rrp.onclick=()=>{ const s=$("rateRtSessionSelect"); if(!s) return; s.selectedIndex=Math.max(0,s.selectedIndex-1); if(s.onchange) s.onchange(); };
const _rrn=$("rateRtNextBtn"); if(_rrn) _rrn.onclick=()=>{ const s=$("rateRtSessionSelect"); if(!s) return; s.selectedIndex=Math.min(s.options.length-1,s.selectedIndex+1); if(s.onchange) s.onchange(); };

$("adminBackBtn").onclick=()=>{ goToStartPage(); try{ updateStartPageLinks(); }catch(e){} };
const _asb=$("adminSpeedometerBtn"); if(_asb) _asb.onclick=()=>openSpeedometerFromAdmin();
bindDoubleTapConfirm($("adminStartOverBtn"), ()=>startOverFlow(), "Full Reset", "Tap again for full reset");
$("benchRunBtn").onclick=()=>runDeviceBenchmark(true);
$("benchMainBtn").onclick=()=>{ $("benchmarkOverlay").classList.add("hidden"); };
$("startBtn").onclick=startTest;
$("backToStartBtn").onclick=goToStartPage;
$("startOverBtn").onclick=startOverFlow;
$("summaryRestartBtn").onclick=()=>{ $("summaryOverlay").classList.add("hidden"); const fg=$("fullGraphOverlay"); if(fg) fg.classList.add("hidden"); goToStartPage(); };
const _sspeed=$("summarySpeedometerBtn"); if(_sspeed) _sspeed.onclick=()=>{ $("summaryOverlay").classList.add("hidden"); openSpeedometerPage(); };
const _orb=$("outcomeResultsBtn"); if(_orb) _orb.onclick=()=>{ $("outcomeOverlay").classList.add("hidden"); stopSpeedometer(); $("summaryOverlay").classList.remove("hidden"); setTestingQuiet(false); };
const _sadmin=$("speedAdminBtn"); if(_sadmin) _sadmin.onclick=()=>{ _adminReturnTo = "outcomeOverlay"; $("outcomeOverlay").classList.add("hidden"); $("adminOverlay").classList.remove("hidden"); if(_adminUnlocked){ $("adminGate").classList.add("hidden"); $("adminBody").classList.remove("hidden"); renderAdmin(); } else { $("adminGate").classList.remove("hidden"); $("adminBody").classList.add("hidden"); $("adminPass").value=""; } };
$("summaryAdminBtn").onclick=()=>{
 _adminReturnTo = "summaryOverlay"; // return here on close
 $("summaryOverlay").classList.add("hidden");
 $("adminOverlay").classList.remove("hidden");
 if(_adminUnlocked){
  $("adminGate").classList.add("hidden"); $("adminBody").classList.remove("hidden"); renderAdmin();
 } else {
  $("adminGate").classList.remove("hidden"); $("adminBody").classList.add("hidden"); $("adminPass").value="";
 }
};
// ─── Init ───
modeLabel.textContent="Subject mode";
renderFatigueChecklist();
renderRefresher();
updateMetrics();

if ("serviceWorker" in navigator) {
 window.addEventListener("load", async () => {
  try{
   await navigator.serviceWorker.register(`./sw.js?v=${RELEASE}`);
   console.log(`V${RELEASE} service worker registered.`);
  }catch(err){
   console.warn("Service worker registration failed:", err);
  }
 });
}


$("summaryRankedBtn").onclick=()=>{ const last=state.history[state.history.length-1]; if(!last) return; buildRankedSummary(last); $("summaryOverlay").classList.add("hidden"); $("rankedOverlay").classList.remove("hidden"); };

try{ updateStartPageLinks(); }catch(e){}



function drawSpfGauge(canvas, spf){
 if(!canvas) return;
 const rect = canvas.getBoundingClientRect();
 const dpr = Math.max(1, window.devicePixelRatio || 1);
 const cssW = Math.max(320, Math.round(rect.width || 900));
 const cssH = Math.max(90, Math.round(cssW * 0.20));
 canvas.width = Math.round(cssW * dpr);
 canvas.height = Math.round(cssH * dpr);
 const ctx = canvas.getContext("2d");
 ctx.setTransform(dpr,0,0,dpr,0,0);
 const W = cssW, H = cssH;

 ctx.clearRect(0,0,W,H);

 const padX = Math.round(W * 0.035);
 const topY = Math.round(H * 0.26);
 const barY = Math.round(H * 0.46);
 const barH = Math.round(H * 0.26);
 const barW = W - padX*2;

 // top labels
 ctx.fillStyle = "#6f7b87";
 ctx.font = `700 ${Math.max(12, Math.round(H*0.18))}px -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif`;
 ctx.textAlign = "center";
 ctx.textBaseline = "middle";
 for(let i=1;i<=7;i++){
  const x = padX + ((i-1)/6)*barW;
  ctx.fillText(String(i), x, Math.round(H*0.11));
 }

 // metallic thin border
 const borderGrad = ctx.createLinearGradient(0, barY, 0, barY+barH);
 borderGrad.addColorStop(0.00, "#d7dde3");
 borderGrad.addColorStop(0.22, "#8f99a4");
 borderGrad.addColorStop(0.50, "#eef2f5");
 borderGrad.addColorStop(0.78, "#8b949d");
 borderGrad.addColorStop(1.00, "#d7dde3");

 // gradient bar
 const grad = ctx.createLinearGradient(padX, 0, padX+barW, 0);
 grad.addColorStop(0.00, "#7a0000"); // 1 dark red
 grad.addColorStop(0.18, "#d02020"); // 2 red
 grad.addColorStop(0.34, "#f08a00"); // 3 orange
 grad.addColorStop(0.50, "#8fcb5a"); // 4 light green
 grad.addColorStop(0.66, "#6fbe4a"); // 5 light green
 grad.addColorStop(0.83, "#228b22"); // 6 dark green
 grad.addColorStop(1.00, "#0b5f16"); // 7 dark green

 const radius = Math.max(8, Math.round(barH*0.18));
 ctx.beginPath();
 ctx.moveTo(padX+radius, barY);
 ctx.lineTo(padX+barW-radius, barY);
 ctx.quadraticCurveTo(padX+barW, barY, padX+barW, barY+radius);
 ctx.lineTo(padX+barW, barY+barH-radius);
 ctx.quadraticCurveTo(padX+barW, barY+barH, padX+barW-radius, barY+barH);
 ctx.lineTo(padX+radius, barY+barH);
 ctx.quadraticCurveTo(padX, barY+barH, padX, barY+barH-radius);
 ctx.lineTo(padX, barY+radius);
 ctx.quadraticCurveTo(padX, barY, padX+radius, barY);
 ctx.closePath();
 ctx.fillStyle = grad;
 ctx.fill();
 ctx.lineWidth = 1.5;
 ctx.strokeStyle = borderGrad;
 ctx.stroke();

 // subtle top ticks
 ctx.strokeStyle = "#b9bfc6";
 ctx.lineWidth = 1;
 for(let i=1;i<=7;i++){
  const x = padX + ((i-1)/6)*barW;
  ctx.beginPath();
  ctx.moveTo(x, Math.round(H*0.19));
  ctx.lineTo(x, Math.round(H*0.24));
  ctx.stroke();
 }

 // pointer
 const value = spf!=null && isFinite(Number(spf)) ? Math.max(1, Math.min(7, Number(spf))) : null;
 if(value!=null){
  const x = padX + ((value-1)/6)*barW;
  const triTop = barY - Math.round(H*0.01);
  const triH = Math.round(H*0.22);
  const triHalf = Math.round(H*0.10);
  ctx.beginPath();
  ctx.moveTo(x, triTop);
  ctx.lineTo(x-triHalf, triTop+triH);
  ctx.lineTo(x+triHalf, triTop+triH);
  ctx.closePath();
  ctx.fillStyle = "#5eb0f3";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.stroke();
 }

 // title
 ctx.fillStyle = "#7fd7ff";
 ctx.font = `800 ${Math.max(12, Math.round(H*0.14))}px -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif`;
 ctx.textAlign = "center";
 ctx.fillText(`SP-FS ${value!=null ? value : "—"}`, W/2, Math.round(H*0.90));
}

function renderSpfGaugeForResult(result){
 const canvas = $("spfGaugeCanvas");
 if(!canvas) return;
 const spf = result && result.samnPerelli && result.samnPerelli.score!=null ? Number(result.samnPerelli.score) : null;
 drawSpfGauge(canvas, spf);
}

function renderSpeedometerOutcome(result){
 const outcome = $("outcomeOverlay");
 const canvas = $("speedometerCanvas");
 syncOutcomeStatusText(result);
 if(!outcome || !canvas) return;
 outcome.classList.remove("hidden");
 const success = !!(result && isTestSuccess(result.endReason));
 const cps = success && result ? Math.max(0, Math.min(100, result.cognitivePerformanceIndex||0)) : 0;
 const mbs = result && result.averageLast2BlockingScoresMs!=null ? result.averageLast2BlockingScoresMs : null;
 const wrap = $("speedometerWrap");
 if(wrap) canvas.style.width = wrap.offsetWidth + "px";
 stopSpeedometer();
 setTimeout(()=>animateSpeedometer(canvas, cps, mbs, success), 80);
 renderSpfGaugeForResult(result);
 setTestingQuiet(false);
}

function syncOutcomeStatusText(result){
 const ot=$("outcomeText"), orr=$("outcomeReasonText");
 if(!ot) return;
 const ok = !!(result && isTestSuccess(result.endReason));
 ot.textContent = ok ? "Success!" : "Failed";
 ot.className = "outcome-text " + (ok ? "success" : "failed");
 if(orr) orr.textContent = (result && result.endReason) ? result.endReason : "Run complete";
}

function openSpeedometerPage(){
 try{ wireEmailSelectControls(); }catch(err){}
 try{ wireEmailDraftAction(); }catch(err){}
 const last = state.history && state.history.length ? state.history[state.history.length-1] : null;
 if(last){
  hideAllOverlays();
  renderSpeedometerOutcome(last);
 }else{
  goToStartPage();
 }
}

function openSpeedometerFromAdmin(){
 const admin = $("adminOverlay");
 if(admin) admin.classList.add("hidden");
 const last = state.history && state.history.length ? state.history[state.history.length-1] : null;
 if(last){
  hideAllOverlays();
  renderSpeedometerOutcome(last);
 }else{
  goToStartPage();
 }
}

$("trialLogCloseBtn").onclick=()=>{ $("trialLogOverlay").classList.add("hidden"); openSpeedometerFromAdmin(); };

const _rrab=$("rateRtAdminBtn"); if(_rrab) _rrab.onclick=()=>{ $("rateRtOverlay").classList.add("hidden"); $("adminOverlay").classList.remove("hidden"); if(_adminUnlocked){ $("adminGate").classList.add("hidden"); $("adminBody").classList.remove("hidden"); renderAdmin(); } else { $("adminGate").classList.remove("hidden"); $("adminBody").classList.add("hidden"); $("adminPass").value=""; } };


const _apt=$("adminPerfTimeBtn"); if(_apt) _apt.onclick=()=>{ $("adminOverlay").classList.add("hidden"); openPerformanceOverTimePage(); };
const _spt=$("speedPerfTimeBtn"); if(_spt) _spt.onclick=()=>{ $("outcomeOverlay").classList.add("hidden"); openPerformanceOverTimePage(); };
const _ptb=$("perfTimeBackBtn"); if(_ptb) _ptb.onclick=()=>{ $("perfTimeOverlay").classList.add("hidden"); openSpeedometerPage(); };
const _pta=$("perfTimeAdminBtn"); if(_pta) _pta.onclick=()=>{ $("perfTimeOverlay").classList.add("hidden"); $("adminOverlay").classList.remove("hidden"); if(_adminUnlocked){ $("adminGate").classList.add("hidden"); $("adminBody").classList.remove("hidden"); renderAdmin(); } else { $("adminGate").classList.remove("hidden"); $("adminBody").classList.add("hidden"); $("adminPass").value=""; } };

const _rsp=$("rankedSpeedometerBtn"); if(_rsp) _rsp.onclick=()=>{ $("rankedOverlay").classList.add("hidden"); openSpeedometerPage(); };
const _rrs=$("rankedRestartBtn"); if(_rrs) _rrs.onclick=()=>{ $("rankedOverlay").classList.add("hidden"); goToStartPage(); };
const _rra=$("rankedAdminBtn"); if(_rra) _rra.onclick=()=>{ $("rankedOverlay").classList.add("hidden"); $("adminOverlay").classList.remove("hidden"); if(_adminUnlocked){ $("adminGate").classList.add("hidden"); $("adminBody").classList.remove("hidden"); renderAdmin(); } else { $("adminGate").classList.remove("hidden"); $("adminBody").classList.add("hidden"); $("adminPass").value=""; } };

const _stl=$("speedTrialLogBtn"); if(_stl) _stl.onclick=()=>{ $("outcomeOverlay").classList.add("hidden"); buildTrialLog(); $("trialLogOverlay").classList.remove("hidden"); };

const _srr=$("speedRateRtBtn"); if(_srr) _srr.onclick=()=>{ $("outcomeOverlay").classList.add("hidden"); buildRateRtOverlay(); $("rateRtOverlay").classList.remove("hidden"); };
const _rateRtCloseBtn=$("rateRtCloseBtn"); if(_rateRtCloseBtn) _rateRtCloseBtn.onclick=()=>{ $("rateRtOverlay").classList.add("hidden"); openSpeedometerPage(); };

const _srg=$("speedResponseGraphBtn"); if(_srg) _srg.onclick=()=>{ openResponseGraphPage(false); };
const _arg=$("adminResponseGraphBtn"); if(_arg) _arg.onclick=()=>{ openResponseGraphPage(true); };
const _fgs=$("fullGraphSpeedometerBtn"); if(_fgs) _fgs.onclick=()=>{ $("fullGraphOverlay").classList.add("hidden"); openSpeedometerPage(); };
const _fga=$("fullGraphAdminBtn"); if(_fga) _fga.onclick=()=>{ $("fullGraphOverlay").classList.add("hidden"); $("adminOverlay").classList.remove("hidden"); if(_adminUnlocked){ $("adminGate").classList.add("hidden"); $("adminBody").classList.remove("hidden"); renderAdmin(); } else { $("adminGate").classList.remove("hidden"); $("adminBody").classList.add("hidden"); $("adminPass").value=""; } };

const _tla=$("trialLogAdminBtn"); if(_tla) _tla.onclick=()=>{ $("trialLogOverlay").classList.add("hidden"); $("adminOverlay").classList.remove("hidden"); if(_adminUnlocked){ $("adminGate").classList.add("hidden"); $("adminBody").classList.remove("hidden"); renderAdmin(); } else { $("adminGate").classList.remove("hidden"); $("adminBody").classList.add("hidden"); $("adminPass").value=""; } };

const _ssp=$("speedStartPageBtn"); if(_ssp) _ssp.onclick=()=>{ hideAllOverlays(); goToStartPage(); };

// ─── E-MAIL SELECT PAGE ───────────────────────────────────────
// Opens from Speedometer. Provides recipient selection and a
// dropdown for which results data to include in the email.
// Includes links back to Speedometer and Start.


window.addEventListener("load",()=>{ try{ updateStartPageLinks(); }catch(e){}; });


/* ===== Performance vs Time graph override (V317) ===== */
const perfGraphState = {
  preset: "last14",
  fromDate: "",
  toDate: ""
};

function perfSessionMs(r){
  if(!r) return null;
  const endReason = String(r.endReason || "");
  const failed = /^FAILED\b/i.test(endReason) || /^Failed\b/i.test(endReason) || endReason.includes("Retest") || endReason.includes("Practice!");
  if(failed) return 3000;
  const candidates = [
    r.averageLast2BlockingScoresMs,
    r.pacedResponseMeanMs,
    r.selfPacedResponseMeanMs,
    r.calibrationAverageMs,
    r.fixedPacedBaselineMs
  ];
  for(const v of candidates){
    const n = Number(v);
    if(Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

function perfSessionCpi(r){
  if(!r) return null;
  const endReason = String(r.endReason || "");
  const failed = /^FAILED\b/i.test(endReason) || /^Failed\b/i.test(endReason) || endReason.includes("Retest") || endReason.includes("Practice!");
  if(failed) return 0;
  const explicit = Number(r.cognitivePerformanceIndex);
  if(Number.isFinite(explicit)) return explicit;
  const ms = perfSessionMs(r);
  return ms!=null ? computeCPI(ms) : null;
}

function perfSessionUtcMs(r){
  return getSessionUtcMs(r);
}

function perfSessionIsoDate(r){
  const ms = perfSessionUtcMs(r);
  if(!Number.isFinite(ms)) return "";
  return new Date(ms).toISOString().slice(0,10);
}

function filterSessionsForPerfGraph(hist){
  const base = (hist||[]).slice().sort((a,b)=>perfSessionUtcMs(a)-perfSessionUtcMs(b));
  if(perfGraphState.preset === "all") return base;
  if(perfGraphState.preset === "last14") return base.slice(-14);
  const from = perfGraphState.fromDate || "";
  const to = perfGraphState.toDate || "";
  return base.filter(r=>{
    const d = perfSessionIsoDate(r);
    if(!d) return false;
    if(from && d < from) return false;
    if(to && d > to) return false;
    return true;
  });
}

function syncPerfGraphControls(hist){
  const preset = $("perfRangePreset");
  const fromEl = $("perfDateFrom");
  const toEl = $("perfDateTo");
  const info = $("perfRangeInfo");
  if(!preset || !fromEl || !toEl) return;

  const base = (hist||[]).slice().sort((a,b)=>perfSessionUtcMs(a)-perfSessionUtcMs(b));
  const firstDate = base.length ? perfSessionIsoDate(base[0]) : "";
  const lastDate = base.length ? perfSessionIsoDate(base[base.length-1]) : "";

  fromEl.min = firstDate || "";
  fromEl.max = lastDate || "";
  toEl.min = firstDate || "";
  toEl.max = lastDate || "";

  if(!perfGraphState.fromDate && firstDate) perfGraphState.fromDate = firstDate;
  if(!perfGraphState.toDate && lastDate) perfGraphState.toDate = lastDate;

  preset.value = perfGraphState.preset;
  fromEl.value = perfGraphState.fromDate || "";
  toEl.value = perfGraphState.toDate || "";

  const custom = perfGraphState.preset === "custom";
  fromEl.disabled = !custom;
  toEl.disabled = !custom;
  fromEl.style.opacity = custom ? "1" : "0.55";
  toEl.style.opacity = custom ? "1" : "0.55";

  const filtered = filterSessionsForPerfGraph(base);
  if(info){
    if(!base.length){
      info.textContent = "No saved sessions yet.";
    }else if(custom){
      info.textContent = `Showing ${filtered.length} session${filtered.length===1?"":"s"} from ${perfGraphState.fromDate||firstDate} to ${perfGraphState.toDate||lastDate}.`;
    }else if(perfGraphState.preset === "last14"){
      info.textContent = `Showing the last ${filtered.length} saved session${filtered.length===1?"":"s"}.`;
    }else{
      info.textContent = `Showing all ${base.length} saved sessions from ${firstDate} to ${lastDate}.`;
    }
  }
}

function wirePerfGraphControls(){
  const preset = $("perfRangePreset");
  const fromEl = $("perfDateFrom");
  const toEl = $("perfDateTo");
  if(!preset || !fromEl || !toEl || preset.dataset.wired==="1") return;
  preset.dataset.wired="1";

  const rerender = ()=>{
    syncPerfGraphControls(state.history||[]);
    drawPerformanceOverTimeChart($("perfTimeGraph"), state.history||[]);
  };

  preset.onchange = ()=>{
    perfGraphState.preset = preset.value || "last14";
    rerender();
  };
  fromEl.onchange = ()=>{
    perfGraphState.fromDate = fromEl.value || "";
    if(perfGraphState.toDate && perfGraphState.fromDate && perfGraphState.toDate < perfGraphState.fromDate){
      perfGraphState.toDate = perfGraphState.fromDate;
      toEl.value = perfGraphState.toDate;
    }
    rerender();
  };
  toEl.onchange = ()=>{
    perfGraphState.toDate = toEl.value || "";
    if(perfGraphState.fromDate && perfGraphState.toDate && perfGraphState.toDate < perfGraphState.fromDate){
      perfGraphState.fromDate = perfGraphState.toDate;
      fromEl.value = perfGraphState.fromDate;
    }
    rerender();
  };
}

function drawPerformanceOverTimeChart(canvas,hist){
  if(!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const cssW = Math.max(320, Math.round(canvas.clientWidth || canvas.offsetWidth || 900));
  const cssH = Math.max(320, Math.round(canvas.clientHeight || 520));
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr,0,0,dpr,0,0);

  const W = cssW, H = cssH;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle="#081321";
  ctx.fillRect(0,0,W,H);

  const fullHist = hist||[];
  if(!fullHist.length){
    ctx.fillStyle="#d7e7f8";
    ctx.font="bold 16px sans-serif";
    ctx.textAlign="center";
    ctx.fillText("No session history yet", W/2, H/2);
    return;
  }

  syncPerfGraphControls(fullHist);
  const slice = filterSessionsForPerfGraph(fullHist);
  const n = slice.length;

  if(!n){
    ctx.fillStyle="#d7e7f8";
    ctx.font="bold 16px sans-serif";
    ctx.textAlign="center";
    ctx.fillText("No sessions in selected date range", W/2, H/2);
    return;
  }

  const bestMs = Number(settings.cpiBestMs)||800;
  const worstMs = Number(settings.cpiWorstMs)||2400;
  const PAD = {top:72,right:76,bottom:n===1?64:92,left:126};
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  function xOf(i){
    if(n<=1) return PAD.left + cW/2;
    return PAD.left + (i/(n-1))*cW;
  }
  function yLeftFromCpi(v){ return PAD.top + cH - ((v-0)/100)*cH; }
  function cpiFromMs(ms){
    const span=(worstMs-bestMs)||1;
    return Math.max(0, Math.min(100, 100*(worstMs-ms)/span));
  }
  function yLeftFromMs(ms){ return yLeftFromCpi(cpiFromMs(ms)); }
  function yRightFromSpf(v){ return PAD.top + cH - (((v-1)/6))*cH; }

  ctx.strokeStyle="rgba(127,215,255,0.16)";
  ctx.lineWidth=1;
  [0,25,50,75,100].forEach(v=>{
    const y=yLeftFromCpi(v);
    ctx.beginPath(); ctx.moveTo(PAD.left,y); ctx.lineTo(PAD.left+cW,y); ctx.stroke();
  });

  const cpiTicks = [100,75,50,25,0];
  const mbsTicks = cpiTicks.map(cpi => Math.round(bestMs + ((100-cpi)/100)*(worstMs-bestMs)));
  ctx.font="11px sans-serif";
  ctx.textAlign="right";
  cpiTicks.forEach((cpi, i)=>{
    const y = yLeftFromCpi(cpi);
    ctx.strokeStyle="#ffb357";
    ctx.beginPath(); ctx.moveTo(PAD.left-46, y); ctx.lineTo(PAD.left-36, y); ctx.stroke();
    ctx.fillStyle="#ffb357"; ctx.fillText(String(mbsTicks[i]), PAD.left-52, y+4);
    ctx.strokeStyle="#7fd7ff";
    ctx.beginPath(); ctx.moveTo(PAD.left-16, y); ctx.lineTo(PAD.left-6, y); ctx.stroke();
    ctx.fillStyle="#7fd7ff"; ctx.fillText(String(cpi), PAD.left-22, y+4);
  });

  ctx.textAlign="left";
  ctx.fillStyle="#88ff88";
  [7,6,5,4,3,2,1].forEach(v=>{
    const y=yRightFromSpf(v);
    ctx.strokeStyle="#88ff88";
    ctx.beginPath(); ctx.moveTo(PAD.left+cW+6, y); ctx.lineTo(PAD.left+cW+16, y); ctx.stroke();
    ctx.fillText(String(v), PAD.left+cW+22, y+4);
  });

  ctx.fillStyle="#b7d9ef";
  ctx.textAlign="left";
  ctx.font="bold 16px sans-serif";
  ctx.fillText("Performance over Date and Time", PAD.left, 24);

  ctx.font="12px sans-serif";
  ctx.fillStyle="#d7e7f8";
  const subjectCount = new Set(slice.map(r => (r.subjectId||"—"))).size;
  const rangeLabel = perfGraphState.preset === "custom"
    ? `    Range: ${perfGraphState.fromDate||"start"} → ${perfGraphState.toDate||"end"}`
    : (perfGraphState.preset === "last14" ? "    Range: Last 14 sessions" : "");
  ctx.fillText(`All sessions sequentially    Subjects: ${subjectCount}    Sessions: ${n}    Chronology: UTC${rangeLabel}`, PAD.left, 46);

  ctx.save();
  ctx.translate(18, PAD.top + cH/2); ctx.rotate(-Math.PI/2);
  ctx.fillStyle="#ffb357"; ctx.textAlign="center"; ctx.font="bold 11px sans-serif";
  ctx.fillText("MBS ms", 0, 0); ctx.restore();

  ctx.save();
  ctx.translate(42, PAD.top + cH/2); ctx.rotate(-Math.PI/2);
  ctx.fillStyle="#7fd7ff"; ctx.textAlign="center"; ctx.font="bold 11px sans-serif";
  ctx.fillText("CPI", 0, 0); ctx.restore();

  ctx.save();
  ctx.translate(W-20, PAD.top + cH/2); ctx.rotate(Math.PI/2);
  ctx.fillStyle="#88ff88"; ctx.textAlign="center"; ctx.font="bold 12px sans-serif";
  ctx.fillText("SP-FS 1–7 (up is better)", 0, 0); ctx.restore();

  ctx.strokeStyle="rgba(79,111,153,0.35)";
  ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top+cH); ctx.lineTo(PAD.left+cW, PAD.top+cH); ctx.stroke();

  ctx.font="10px sans-serif";
  ctx.fillStyle="#9ab6d3";
  if(n===1){
    const d=new Date(slice[0].time);
    const label=`${d.toLocaleDateString("en-US",{month:"numeric",day:"numeric",year:"2-digit"})} ${d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}`;
    ctx.textAlign="center";
    ctx.fillText(label, xOf(0), PAD.top+cH+26);
  }else{
    ctx.textAlign="right";
    const labelStep = Math.max(1, Math.ceil(n/12));
    slice.forEach((r,i)=>{
      if(i % labelStep !== 0 && i !== n-1) return;
      const x=xOf(i), y=PAD.top+cH+8;
      const d = new Date(r.time);
      const raw = `${d.toLocaleDateString("en-US",{month:"numeric",day:"numeric"})} ${d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}`;
      const label = raw.length>22 ? raw.slice(0,22) : raw;
      ctx.save(); ctx.translate(x,y); ctx.rotate(-Math.PI/4); ctx.fillText(label,0,0); ctx.restore();
    });
  }

  function drawLine(vals, yFunc, color, style){
    ctx.strokeStyle=color;
    ctx.lineWidth=2.5;
    ctx.beginPath();
    let started=false;
    vals.forEach((v,i)=>{
      if(v==null){ started=false; return; }
      const x=xOf(i), y=yFunc(v,i);
      if(!started){ ctx.moveTo(x,y); started=true; } else { ctx.lineTo(x,y); }
    });
    if(vals.filter(v=>v!=null).length>1) ctx.stroke();

    vals.forEach((v,i)=>{
      if(v==null) return;
      const x=xOf(i), y=yFunc(v,i);
      ctx.fillStyle=color;
      if(style==="diamond"){
        ctx.save(); ctx.translate(x,y); ctx.rotate(Math.PI/4); ctx.fillRect(-4,-4,8,8); ctx.restore();
      }else{
        ctx.beginPath(); ctx.arc(x,y,4.2,0,Math.PI*2); ctx.fill();
      }
    });
  }

  function drawCombinedPerfMarkers(cpiVals, mbsVals){
    ctx.strokeStyle="#7fd7ff";
    ctx.lineWidth=2.5;
    ctx.beginPath();
    let started=false;
    cpiVals.forEach((cpi,i)=>{
      const mbs = mbsVals[i];
      if(cpi==null || mbs==null){ started=false; return; }
      const x = xOf(i), y = yLeftFromCpi(cpi);
      if(!started){ ctx.moveTo(x,y); started=true; } else { ctx.lineTo(x,y); }
    });
    if(cpiVals.filter((cpi,i)=>cpi!=null && mbsVals[i]!=null).length>1) ctx.stroke();

    cpiVals.forEach((cpi,i)=>{
      const mbs = mbsVals[i];
      if(cpi==null || mbs==null) return;
      const x = xOf(i), y = yLeftFromCpi(cpi);
      ctx.beginPath();
      ctx.arc(x,y,7.2,0,Math.PI*2);
      ctx.strokeStyle="#ffb357";
      ctx.lineWidth=3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x,y,3.6,0,Math.PI*2);
      ctx.fillStyle="#7fd7ff";
      ctx.fill();
    });
  }

  const cpiVals = slice.map(r=>perfSessionCpi(r));
  const mbsVals = slice.map(r=>perfSessionMs(r));
  const spfVals = slice.map(r=>r && r.samnPerelli && r.samnPerelli.score!=null ? Number(r.samnPerelli.score) : null);

  const hasAnyMetric = cpiVals.some(v=>v!=null) || mbsVals.some(v=>v!=null) || spfVals.some(v=>v!=null);
  if(!hasAnyMetric){
    ctx.fillStyle="#d7e7f8";
    ctx.font="bold 15px sans-serif";
    ctx.textAlign="center";
    ctx.fillText("No graphable session values yet", PAD.left + cW/2, PAD.top + cH/2);
    return;
  }

  drawLine(spfVals, v=>yRightFromSpf(v), "#88ff88", "diamond");
  drawCombinedPerfMarkers(cpiVals, mbsVals);

  ctx.textAlign="left";
  ctx.font="bold 11px sans-serif";
  ctx.beginPath();
  ctx.arc(PAD.left+7, PAD.top-18, 7.2, 0, Math.PI*2);
  ctx.strokeStyle="#ffb357";
  ctx.lineWidth=3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(PAD.left+7, PAD.top-18, 3.6, 0, Math.PI*2);
  ctx.fillStyle="#7fd7ff";
  ctx.fill();
  ctx.fillStyle="#7fd7ff";
  ctx.fillText("Blue dot = CPI", PAD.left+20, PAD.top-14);
  ctx.fillStyle="#ffb357";
  ctx.fillText("Orange circle = MBS", PAD.left+118, PAD.top-14);
  ctx.fillStyle="#88ff88"; ctx.fillText("◆ SP-FS", PAD.left+278, PAD.top-14);
}


function getLastGraphableResult(){
 const h = state.history || [];
 for(let i=h.length-1;i>=0;i--){
  const r = h[i];
  if(r && (
    (Array.isArray(r.mode1Trials) && r.mode1Trials.length) ||
    (Array.isArray(r.rtLog) && r.rtLog.length) ||
    r.testMode==="mode1" || r.testMode==="mode2" || r.testMode==="mode3"
  )){
   return r;
  }
 }
 return null;
}

function openResponseGraphPage(fromAdmin){
 hideAllOverlays();
 const ov = $("fullGraphOverlay");
 if(ov) ov.classList.remove("hidden");
 const last = getLastGraphableResult();
 const canvas = $("fullModeGraph");
 const info = $("responseGraphInfo");
 if(last && canvas){
  drawModeResultChart(canvas, last);
  if(info){
   const when = last.time ? new Date(last.time).toLocaleString() : "most recent session";
   info.textContent = `Response time by trial for ${when}. Higher on the graph = faster (smaller ms). ${getResponseGraphPhaseLegendText(last)}`;
  }
 }else if(info){
  info.textContent = "No graphable session data available.";
 }
 const adminBtn = $("fullGraphAdminBtn");
 if(adminBtn) adminBtn.style.display = fromAdmin ? "none" : "";
}

function openPerformanceOverTimePage(){
  hideAllOverlays();
  const ov=$("perfTimeOverlay");
  if(ov) ov.classList.remove("hidden");
  wirePerfGraphControls();
  drawPerformanceOverTimeChart($("perfTimeGraph"), state.history||[]);
}
/* ===== end Performance vs Time graph override (V317) ===== */


/* ===== E-mail Select wiring override (V317) ===== */
function openEmailSelectPage(){
  hideAllOverlays();
  const ov = $("emailOverlay");
  if(ov) ov.classList.remove("hidden");
  const info = $("emailSelectInfo");
  if(info){
    info.textContent = "Use the controls below to choose recipient and which results data to include.";
  }
  try{ wireEmailDraftAction(); }catch(err){}
  try{ syncEditableEmailRecipient(); }catch(err){}
}

function wireEmailSelectControls(){
  const speedBtn = $("speedEmailSelectBtn");
  const backSpeed = $("emailSpeedometerBtn");
  const backStart = $("emailStartBtn");
  const dataSel = $("emailDataSelect");
  const info = $("emailSelectInfo");

  if(speedBtn && speedBtn.dataset.emailWired !== "1"){
    speedBtn.dataset.emailWired = "1";
    speedBtn.onclick = (e)=>{
      if(e) e.preventDefault();
      openEmailSelectPage();
    };
  }

  if(backSpeed && backSpeed.dataset.emailWired !== "1"){
    backSpeed.dataset.emailWired = "1";
    backSpeed.onclick = (e)=>{
      if(e) e.preventDefault();
      const ov = $("emailOverlay");
      if(ov) ov.classList.add("hidden");
      openSpeedometerPage();
    };
  }

  if(backStart && backStart.dataset.emailWired !== "1"){
    backStart.dataset.emailWired = "1";
    backStart.onclick = (e)=>{
      if(e) e.preventDefault();
      const ov = $("emailOverlay");
      if(ov) ov.classList.add("hidden");
      goToStartPage();
      try{ updateStartPageLinks(); }catch(err){}
    };
  }

  if(recipBtn && recipBtn.dataset.emailWired !== "1"){
    recipBtn.dataset.emailWired = "1";
    recipBtn.onclick = (e)=>{
      if(e) e.preventDefault();
      if(info) info.textContent = "Recipient selection ready.";
    };
  }

  if(dataSel && dataSel.dataset.emailWired !== "1"){
    dataSel.dataset.emailWired = "1";
    dataSel.onchange = ()=>{
      if(!info) return;
      const labels = {
        summary: "Results Summary selected.",
        trial_log: "Trial Detail Log selected.",
        ranked: "Ranked Target / Position Averages selected.",
        perf_time: "Performance over Date and Time selected.",
        response_graph: "Response-Time Graph Data selected.",
        rate_rt: "Presentation Rate vs Response Time selected.",
        all: "All available data selected."
      };
      info.textContent = labels[dataSel.value] || "Data selection ready.";
    };
  }
}

window.addEventListener("load", ()=>{
  try{ wireEmailSelectControls(); }catch(err){}
 try{ wireEmailDraftAction(); }catch(err){}
});
/* ===== end E-mail Select wiring override (V317) ===== */


/* ===== E-mail draft action override (V317) ===== */
function formatLastTrialLogText(last){
  if(!last || !Array.isArray(last.rtLog) || !last.rtLog.length) return "No trial detail log available.";
  const lines = last.rtLog.map(r=>{
    return [
      `#${r.seq||""}`,
      `Phase: ${r.phase||"—"}`,
      `RT: ${r.rt!=null ? r.rt : "—"}`,
      `Outcome: ${r.outcome||"—"}`,
      `Probe: ${r.probe||"—"}`,
      `Correct: ${r.correctCell||"—"}`,
      `Response: ${r.response||"—"}`
    ].join(" | ");
  });
  return "Trial Detail Log\n\n" + lines.join("\n");
}

function formatLastRankedText(last){
  if(!last) return "No ranked averages available.";
  const mode = (last.testMode||settings.testMode||"mode1");
  try{
    return formatModePooledRankSection(mode);
  }catch(err){
    return "Ranked Target / Position Averages are not available.";
  }
}


function formatLastResponseGraphText(last){
  if(!last || !Array.isArray(last.rtLog) || !last.rtLog.length) return "No response-time graph data available.";
  const rows = last.rtLog.map((r,i)=>{
    const dur = r.durationMs!=null ? r.durationMs : "—";
    const rt = r.rt!=null ? r.rt : "—";
    return `${i+1}. Trial ${r.seq||i+1} | Phase ${r.phase||"—"} | Presentation ${dur} ms | Response ${rt} ms | Outcome ${r.outcome||"—"}`;
  });
  return "Response-Time Graph Data\n\n" + rows.join("\n");
}

function formatLastPerfTimeText(){
  const h = state.history || [];
  if(!h.length) return "No performance-over-time history available.";
  const rows = h.map((r,i)=>{
    const when = r.time ? new Date(r.time).toLocaleString() : `Session ${i+1}`;
    const cpi = r.cognitivePerformanceIndex!=null ? Math.round(Number(r.cognitivePerformanceIndex)) : "—";
    const mbs = r.averageLast2BlockingScoresMs!=null ? Math.round(Number(r.averageLast2BlockingScoresMs)) : "—";
    const spf = r.samnPerelli && r.samnPerelli.score!=null ? r.samnPerelli.score : "—";
    return `${i+1}. ${when} | CPI ${cpi} | MBS ${mbs} | SP-FS ${spf}`;
  });
  return "Performance over Date and Time\n\n" + rows.join("\n");
}

function formatLastRateRtText(last){
  if(!last) return "No Presentation Rate vs Response Time data available.";
  const rows = (last.rtLog||[]).map((r,i)=>{
    const dur = r.durationMs!=null ? r.durationMs : "—";
    const rt = r.rt!=null ? r.rt : "—";
    return `${i+1}. Phase ${r.phase||"—"} | Presentation ${dur} ms | Response ${rt} ms | Outcome ${r.outcome||"—"}`;
  });
  return rows.length ? ("Presentation Rate vs Response Time\n\n" + rows.join("\n")) : "No Presentation Rate vs Response Time data available.";
}

function buildEmailBodyFromSelection(){
  const last = state.history && state.history.length ? state.history[state.history.length-1] : null;
  const choice = $("emailDataSelect") ? $("emailDataSelect").value : "summary";
  if(choice === "trial_log") return formatLastTrialLogText(last);
  if(choice === "ranked") return formatLastRankedText(last);
  if(choice === "perf_time") return formatLastPerfTimeText();
  if(choice === "response_graph") return formatLastResponseGraphText(last);
  if(choice === "rate_rt") return formatLastRateRtText(last);
  if(choice === "all"){
    return [
      state.lastResultText || "No results summary available.",
      "",
      formatLastTrialLogText(last),
      "",
      formatLastRankedText(last),
      "",
      formatLastPerfTimeText(),
      "",
      formatLastResponseGraphText(last),
      "",
      formatLastRateRtText(last)
    ].join("\n");
  }
  return state.lastResultText || JSON.stringify(last||{}, null, 2);
}


window.addEventListener("load", ()=>{
  try{ wireEmailDraftAction(); }catch(err){}
  try{ syncEditableEmailRecipient(); }catch(err){}
});
/* ===== end E-mail draft action override (V317) ===== */


/* ===== Editable recipient field override (V317) ===== */
function getEditableEmailRecipient(){
  const input = $("emailRecipientInput");
  const typed = input && input.value ? String(input.value).trim() : "";
  if(typed) return typed;
  const fromProfile = (state.profile && state.profile.email) ? String(state.profile.email).trim() : "";
  const fromInput = ($("subjectIdInput") && $("subjectIdInput").value) ? String($("subjectIdInput").value).trim() : "";
  return fromProfile || fromInput || "";
}

function syncEditableEmailRecipient(){
  const input = $("emailRecipientInput");
  const recipInfo = $("emailRecipientInfo");
  if(!input) return;
  if(!input.value){
    const seeded = getEditableEmailRecipient();
    if(seeded) input.value = seeded;
  }
  const current = input.value ? String(input.value).trim() : "";
  if(recipInfo){
    recipInfo.textContent = current ? `Recipient: ${current}` : "Recipient: none entered";
  }
}

function openSelectedEmailDraft(){
  const to = getEditableEmailRecipient();
  const info = $("emailSelectInfo");
  const recipInfo = $("emailRecipientInfo");
  if(recipInfo){
    recipInfo.textContent = to ? `Recipient: ${to}` : "Recipient: none entered";
  }
  if(!to){
    if(info) info.textContent = "Enter a recipient email first.";
    return;
  }
  const body = buildEmailBodyFromSelection().replace(/\n/g,"\r\n");
  const subject = `CogSpeed® ${APP_VERSION} Results`;
  window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function wireEmailDraftAction(){
  const input = $("emailRecipientInput");
  const openBtn = $("emailOpenDraftBtn");
  const info = $("emailSelectInfo");
  if(input && input.dataset.recipientInputWired !== "1"){
    input.dataset.recipientInputWired = "1";
    syncEditableEmailRecipient();
    input.oninput = ()=>{
      syncEditableEmailRecipient();
      if(info) info.textContent = input.value.trim() ? "Recipient ready." : "Enter a recipient email first.";
    };
    input.onchange = ()=> syncEditableEmailRecipient();
  }else{
    syncEditableEmailRecipient();
  }

  if(openBtn && openBtn.dataset.emailDraftWired2 !== "1"){
    openBtn.dataset.emailDraftWired2 = "1";
    openBtn.onclick = (e)=>{
      if(e) e.preventDefault();
      openSelectedEmailDraft();
    };
  }
}
window.addEventListener("load", ()=>{ try{ syncEditableEmailRecipient(); }catch(err){}; });
/* ===== end Editable recipient field override (V317) ===== */


window.addEventListener("resize", ()=>{
 const last = state.history && state.history.length ? state.history[state.history.length-1] : null;
 if(last && !$("outcomeOverlay").classList.contains("hidden")){
  try{ renderSpfGaugeForResult(last); }catch(e){}
 }
});
