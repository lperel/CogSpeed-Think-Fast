// ═══════════════════════════════════════════════════
//  CogSpeed V21
// ═══════════════════════════════════════════════════

// ─── Version guard ───
(function(){
  const VER="cogspeed_v21", key="cogspeed_version";
  if(localStorage.getItem(key)!==VER){
    Object.keys(localStorage).forEach(k=>{ if(k.startsWith("cogspeed_")||k.startsWith("cogblock_")) localStorage.removeItem(k); });
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
const DEFAULTS={
  adminPasscode:"4822",
  consecutiveMissesForBlock:2,
  spRestartMultiplier:1.3,
  spRestartWrongLimit:3,
  spRestartCorrectStreak:2,
  maxBlockCount:6,
  qualifyingBlockGapMs:250,
  rollMeanWindow:8,
  rollMeanThreshold:0.50,
  machinePacedNoResponseMs:15000,
  recoveryNoResponseMs:10000,
  calibrationFirstNoResponseMs:20000,
  calibrationNoResponseMs:6000,
  wrongWindowSize:5,
  wrongThresholdStop:4,
  maxTrialCount:180,
  maxPacedWrong:20,
  maxTestDurationMs:150000,
  minDurationMs:800,
  maxDurationMs:3000,
  initialUnusedCalibrationTrials:1,
  initialMeasuredCalibrationTrials:10,
  initialPacedPercent:0.70,
  calibrationStopErrors:4,
  calibrationStopSlowMs:5000,
  cpiBestMs:900,
  cpiWorstMs:3400,
  deviceBenchmarkEnabled:0
};

// ═══════════════════════════════════════════════════════════════
// SECTION: ADMIN PANEL — FIELD DEFINITIONS
// Each entry: [settingKey, label, type]
// Drives the admin form UI and maps to DEFAULTS keys above.
// ═══════════════════════════════════════════════════════════════
const ADMIN_FIELDS=[
  // ── Admin ──
  ["adminPasscode","Admin passcode","text"],
  // ── Calibration (self-paced) ──
  ["initialUnusedCalibrationTrials","Initial (warm-up) cal trials","number"],
  ["initialMeasuredCalibrationTrials","Measured cal trials (default 10)","number"],
  ["calibrationFirstNoResponseMs","Cal first-trial no-response (ms, default 20000)","number"],
  ["calibrationNoResponseMs","Cal subsequent no-response (ms, default 6000)","number"],
  ["calibrationStopErrors","Cal stop after N wrong (default 4)","number"],
  ["calibrationStopSlowMs","Cal avg RT limit (ms, default 3000)","number"],
  // ── Machine-paced ──
  ["initialPacedPercent","MP start: % of cal avg (default 0.70)","number"],
  ["minDurationMs","MP FRAME RANGE — minimum frame duration (ms, default 800)","number"],
  ["maxDurationMs","MP FRAME RANGE — maximum frame duration (ms, default 3000)","number"],
  ["machinePacedNoResponseMs","MP no-response timeout (ms, default 15000)","number"],
  ["maxTestDurationMs","Max TOTAL test time (ms, default 150000)","number"],
  ["maxTrialCount","MP max paced trials","number"],
  ["maxPacedWrong","MP max total wrong before fail (default 20)","number"],
  // ── Block detection ──
  ["consecutiveMissesForBlock","Misses to trigger block (default 2)","number"],
  // ── Block recovery (SP self-paced after block) ──
  ["spRestartMultiplier","Block recovery speed: last block × (default 1.3)","number"],
  ["maxBlockCount","Max total blocks before fail (default 6)","number"],
  ["spRestartWrongLimit","Block recovery: max wrong before fail (default 3)","number"],
  ["spRestartCorrectStreak","Block recovery: correct streak to resume (default 2)","number"],
  ["recoveryNoResponseMs","Block recovery no-response (ms, default 10000)","number"],
  // ── Convergence ──
  ["qualifyingBlockGapMs","Convergence: max gap between blocks (ms, default 250)","number"],
  // ── Anti-spoof ──
  ["wrongWindowSize","Anti-spoof: wrong window size","number"],
  ["wrongThresholdStop","Anti-spoof: max wrong in window","number"],
  ["rollMeanWindow","Anti-spoof: rolling mean window (responses)","number"],
  ["rollMeanThreshold","Anti-spoof threshold (0–1, e.g. 0.50)","number"],
  // ── Scoring ──
  ["cpiBestMs","CPI SCORING ANCHOR — best ms (default 900, not MP min)","number"],
  ["cpiWorstMs","CPI SCORING ANCHOR — worst ms (default 3400, not MP max)","number"],
  // ── System ──
  ["deviceBenchmarkEnabled","Device benchmark (0=off, 1=on)","number"],
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
  const s=JSON.parse(localStorage.getItem("cogspeed_v21r9_settings")||"null");
  if(!s) return {...DEFAULTS};
  const m={...DEFAULTS};
  Object.keys(DEFAULTS).forEach(k=>{ if(s[k]!==undefined) m[k]=s[k]; });
  return m;
}
function saveSettings(){ localStorage.setItem("cogspeed_v21r9_settings",JSON.stringify(settings)); }
let settings=loadSettings();

// ─── State ───
const state={
  phase:"idle", duration:null, blockDuration:null, profile:null,
  current:null, previous:null, unresolvedStreak:0,
  overloads:[], recoveries:[], recoveryCorrectCompleted:0,
  spCorrectStreak:0, spWrongCount:0, terminalBlockReason:null,
  history:JSON.parse(localStorage.getItem("cogspeed_v21r9_history")||"[]"),
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
      cpiOut=$("cpiOut"), statusLine=$("statusLine"), resultBox=$("resultBox"),
      phaseLabel=$("phaseLabel"), modeLabel=$("modeLabel");
let deferredPrompt=null;

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

// ─── CPI ───
// ─── CPI SCORE CALCULATION ────────────────────────────────────
// Converts avg last 2 block durations (ms) to 0-100 CPI score.
// Scale: cpiBestMs=900ms → CPI 100, cpiWorstMs=3400ms → CPI 0.
// Source: Perelli (2026). Formula: (worst-ms)/(worst-best)*100
// ──────────────────────────────────────────────────────────────
function computeCPI(avgMs){
  const best=Number(settings.cpiBestMs),worst=Number(settings.cpiWorstMs),span=worst-best;
  if(!isFinite(best)||!isFinite(worst)||span<=0) return 0;
  return Math.max(0,Math.min(100,((worst-avgMs)/span)*100));
}
function updateCPIDisplay(avg){ cpiOut.textContent=avg!=null?computeCPI(avg).toFixed(0):"—"; }

// ─── Timers ───
function clearTimer(){ if(state.trialTimer) clearTimeout(state.trialTimer); state.trialTimer=null; }
function clearNoResponseTimer(){ if(state.absoluteNoResponseTimer) clearTimeout(state.absoluteNoResponseTimer); state.absoluteNoResponseTimer=null; }
function clearMaxTestTimer(){ if(state.maxTestTimer) clearTimeout(state.maxTestTimer); state.maxTestTimer=null; }
// ─── NO-RESPONSE TIMERS ───────────────────────────────────────
// armNoResponseTimer(): phase-aware timeouts by phase:
//   calibration trial 1: 10s | cal trials 2+: 6s
//   machine-paced: 6s (frame ends anyway) | recovery: 10s
//   Fires end condition if subject stops responding.
// armMaxTestTimer(): 150s total session wall clock (cal + paced).
// noteAnyResponse(): called on every tap to reset the 10/20s timer.
// ──────────────────────────────────────────────────────────────
function armNoResponseTimer(){
  clearNoResponseTimer();
  let ms;
  switch(state.phase){
    case "calibration":
      // First trial 10s (orienting), subsequent 6s
      ms = (state.calibrationTrialIndex||0)===0
        ? (Number(settings.calibrationFirstNoResponseMs)||10000)
        : (Number(settings.calibrationNoResponseMs)||6000);
      break;
    case "paced":
      // Machine-paced: frame ends anyway, 6s safety net
      ms = Number(settings.machinePacedNoResponseMs)||15000;
      break;
    case "recovery":
    case "terminal_recovery":
      // Self-paced recovery after block: more time to stabilize
      ms = Number(settings.recoveryNoResponseMs)||10000;
      break;
    default:
      ms = 20000;
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
  const ms=Number(settings.maxTestDurationMs)||150000;
  state.maxTestTimer=setTimeout(()=>{ state.endReason="ERRATIC RESPONSES — Retest"; finish(); },ms);
}
function noteAnyResponse(){ armNoResponseTimer(); }

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
function patternToSVG(pattern,size="large"){
  const dim=size==="probe"?72:size==="small"?40:56;
  const dotR=size==="probe"?8:size==="small"?5:7;
  const lw=size==="probe"?10:size==="small"?6:9;
  const lh=size==="probe"?26:size==="small"?15:22;
  const marks=pattern.map(([k,x,y])=>{
    const px=(x/100)*dim,py=(y/100)*dim;
    return k==="dot"
      ?`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${dotR}" fill="var(--text)" stroke="black" stroke-width="2"/>`
      :`<rect x="${(px-lw/2).toFixed(1)}" y="${(py-lh/2).toFixed(1)}" width="${lw}" height="${lh}" rx="2" fill="var(--text)" stroke="black" stroke-width="2"/>`;
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
// ═══════════════════════════════════════════════════════════════
// SECTION: GEAR VISUAL DEFINITIONS
// 7 unique mechanical cog styles: index 0=probe, 1-6=cell pairs.
// Each: tooth count, radius, body/stroke colors, hub, spokes.
// Range: #4a4a4a (darkest) to #8c8c8c (lightest gray).
// Probe (0): dark navy + blue glow for clear visual distinction.
// ═══════════════════════════════════════════════════════════════
const GEARS=[
  // 0: PROBE — dark navy-steel, blue glow rim
  {n:20,rP:36,add:7,ded:5,tf:0.44,body:"#1a2a3c",stroke:"#5ab0e0",rim:"#7fd7ff",hub:9,hFill:"#0e1824",hStroke:"#9ae0ff",spokes:5},
  // 1: darkest charcoal — clearly visible on dark bg
  {n:10,rP:37,add:8,ded:6,tf:0.46,body:"#4a4a4a",stroke:"#757575",rim:"#808080",hub:8,hFill:"#383838",hStroke:"#808080",spokes:0},
  // 2: dark charcoal, 3 spokes
  {n:14,rP:36,add:7,ded:5,tf:0.45,body:"#565656",stroke:"#828282",rim:"#8c8c8c",hub:7,hFill:"#424242",hStroke:"#8c8c8c",spokes:3},
  // 3: medium-dark
  {n:12,rP:37,add:7,ded:5,tf:0.46,body:"#626262",stroke:"#8e8e8e",rim:"#989898",hub:8,hFill:"#4e4e4e",hStroke:"#989898",spokes:0},
  // 4: medium gray, 4 spokes
  {n:16,rP:36,add:6,ded:5,tf:0.44,body:"#6e6e6e",stroke:"#9a9a9a",rim:"#a4a4a4",hub:7,hFill:"#5a5a5a",hStroke:"#a4a4a4",spokes:4},
  // 5: medium-light
  {n:11,rP:37,add:8,ded:5,tf:0.46,body:"#7c7c7c",stroke:"#a8a8a8",rim:"#b0b0b0",hub:8,hFill:"#686868",hStroke:"#b0b0b0",spokes:0},
  // 6: light gray, 3 spokes
  {n:18,rP:36,add:6,ded:5,tf:0.44,body:"#8c8c8c",stroke:"#b8b8b8",rim:"#c0c0c0",hub:7,hFill:"#787878",hStroke:"#c0c0c0",spokes:3},
];

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
    #testScreen{background:#9b9b9b!important;}
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
      width:100%;
      height:100%;
      object-fit:contain;
      display:block;
      filter:contrast(1.14) saturate(0.95) brightness(1.02);
    }
    .gear-pattern-backdrop{
      position:absolute;
      left:50%;
      top:50%;
      width:54%;
      height:54%;
      transform:translate(-50%,-50%);
      border-radius:50%;
      background:rgba(110,110,110,0.24);
      box-shadow:0 0 14px rgba(0,0,0,0.16) inset;
      pointer-events:none;
    }
    .gear-mark{
      position:absolute;
      transform:translate(-50%,-50%);
      background:#ffffff;
      border:2px solid #111;
      box-shadow:0 0 2px rgba(0,0,0,0.5);
      opacity:0.98;
      pointer-events:none;
    }
    .gear-mark.dot{
      border-radius:50%;
    }
    .gear-mark.line{
      border-radius:3px;
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
  ensureGearImageStyles();
  if(GEAR_IMAGE_SRCS[si]){
    const marks = [];
    if(pattern){
      const scale = size==="probe" ? 0.76 : 0.72;
      const dotR = size==="probe" ? 10 : 8;
      const lw   = size==="probe" ? 13 : 10;
      const lh   = size==="probe" ? 22 : 16;
      pattern.forEach(([k,px,py], idx)=>{
        const left = 50 + ((px/100)-0.5) * scale * 100;
        const top  = 50 + ((py/100)-0.5) * scale * 100;
        if(k==="dot"){
          marks.push(`<div class="gear-mark dot" style="left:${left.toFixed(1)}%;top:${top.toFixed(1)}%;width:${dotR*2}px;height:${dotR*2}px"></div>`);
        } else {
          marks.push(`<div class="gear-mark line" style="left:${left.toFixed(1)}%;top:${top.toFixed(1)}%;width:${lw}px;height:${lh}px"></div>`);
        }
      });
    }
    const backdrop = pattern ? '<div class="gear-pattern-backdrop"></div>' : '';
    return `<div class="gear-img-wrap ${spinClass||""}">
      <img src="${GEAR_IMAGE_SRCS[si]}" alt="gear ${si}" draggable="false"/>
      ${backdrop}
      ${marks.join("")}
    </div>`;
  }

  const g=GEARS[si];
  const uid=si+"_"+(Math.random()*9999|0).toString(36);
  const cx=50,cy=50;
  const path=gearPath(cx,cy,g.n,g.rP,g.add,g.ded,g.tf);
  const lgt=lighten(g.body,30), drk=darken(g.body,10);
  let spokes="";
  if(g.spokes>0){
    const rI=g.hub+2, rO=g.rP-g.ded-5;
    for(let i=0;i<g.spokes;i++){
      const a=(i/g.spokes)*Math.PI*2-Math.PI/2;
      spokes+=`<line x1="${(cx+rI*Math.cos(a)).toFixed(1)}" y1="${(cy+rI*Math.sin(a)).toFixed(1)}" x2="${(cx+rO*Math.cos(a)).toFixed(1)}" y2="${(cy+rO*Math.sin(a)).toFixed(1)}" stroke="${g.stroke}" stroke-width="3" stroke-linecap="round"/>`;
    }
  }
  let marks="";
  if(pattern){
    const iR=(g.rP-g.ded-4)*0.72;
    const dotR=size==="probe"?8:7, lw=size==="probe"?11:9, lh=size==="probe"?18:14;
    marks=pattern.map(([k,px,py])=>{
      const ix=cx+(px/100-0.5)*iR*2.20, iy=cy+(py/100-0.5)*iR*2.20;
      if(k==="dot") return `<circle cx="${ix.toFixed(1)}" cy="${iy.toFixed(1)}" r="${dotR}" fill="white" stroke="black" stroke-width="2" opacity="0.95"/>`;
      return `<rect x="${(ix-lw/2).toFixed(1)}" y="${(iy-lh/2).toFixed(1)}" width="${lw}" height="${lh}" rx="2.5" fill="white" stroke="black" stroke-width="2" opacity="0.95"/>`;
    }).join("");
  }
  const sc=spinClass||"";
  return `<svg class="${sc}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;width:100%;height:100%">
  <defs>
    <radialGradient id="rg${uid}" cx="38%" cy="32%" r="65%">
      <stop offset="0%" stop-color="${lgt}"/>
      <stop offset="100%" stop-color="${drk}"/>
    </radialGradient>
  </defs>
  <g class="g-rot" style="transform-origin:50px 50px">
    <path d="${path}" fill="url(#rg${uid})" stroke="${g.stroke}" stroke-width="0.8"/>
    ${spokes}
  </g>
  <g class="g-pat">${marks}</g>
</svg>`;
}
function lighten(hex,amt){ const n=parseInt(hex.slice(1),16),r=Math.min(255,(n>>16)+amt),g=Math.min(255,((n>>8)&0xff)+amt),b=Math.min(255,(n&0xff)+amt); return `rgb(${r},${g},${b})`; }
function darken(hex,amt){ const n=parseInt(hex.slice(1),16),r=Math.max(0,(n>>16)-amt),g=Math.max(0,((n>>8)&0xff)-amt),b=Math.max(0,(n&0xff)-amt); return `rgb(${r},${g},${b})`; }
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
  wrongOut.textContent=String(state.totalIncorrect);
  fatigueOut.textContent=state.samnPerelli?String(state.samnPerelli.score):"—";
}

// ─── Trial log ───
// ─── TRIAL LOGGING ────────────────────────────────────────────
// Appends one entry to state.rtLog per trial response.
// Captures: phase, RT, outcome, probe, correct cell, response cell.
// Late-catch logs against previous trial (not current).
// ──────────────────────────────────────────────────────────────
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
// ─── ANSWER RECORDING + ANTI-SPOOF ───────────────────────────
// recordAnswer(): updates rolling mean + wrong-window checks.
// ANTI-SPOOF — ROLLING MEAN: if correct% < 50% in last 8 taps
//   → "TOO MANY WRONG RESPONSES! — Retest"
// ANTI-SPOOF — WRONG WINDOW: if >4 wrong in last 5 taps → stop.
// Misses (isMiss=true) excluded from both checks (taps only).
// ──────────────────────────────────────────────────────────────
function trialMatches(trial,index){ return trial&&index===trial.correctPos; }
// ─── MAX PACED WRONG CHECK ───────────────────────────
// checkMaxPacedWrong(): ends test if total paced wrong
//   responses reach maxPacedWrong (default 20).
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
    if(state.lastFiveAnswers.length===settings.wrongWindowSize&&wc>settings.wrongThresholdStop){
      state.endReason=`FAILED: too many wrong in last ${settings.wrongWindowSize} responses`; finish(); return true;
    }
  }
  updateMetrics(); return false;
}
// ─── TERMINAL RECOVERY RULE ───────────────────────────────────
// maybeTriggerTerminalRule(): fires when 2 consecutive block scores
//   fall within qualifyingBlockGapMs (250ms) of each other.
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
// 1 unused + 10 measured self-paced trials.
// CHECK ADEQUATELY TRAINED: >4 errors → "TOO MANY WRONG RESPONSES"
// CHECK RESPONSE SPEED: single RT >3000ms → "NOT RESPONDING IN TIME — Practice!"
// DETERMINE BASELINE RT: avg of 10 measured RTs → paced start duration
//   (initialPacedPercent=0.70 × avg, clamped to 800ms-maxDurationMs).
// CONDITION 4: avg RT >3000ms → "NEED MORE PRACTICE!"
// NO-RESPONSE TIMEOUTS: first trial=10s, subsequent=6s
// ──────────────────────────────────────────────────────────────
function finishCalibration(){
  const avg=mean(state.calibrationRTs);
  // Condition 4: avg RT too slow — needs more practice
  if(avg>settings.calibrationStopSlowMs){
    state.endReason="NEED MORE PRACTICE!";
    finish(); return;
  }
  state.duration=clamp(avg*settings.initialPacedPercent,settings.minDurationMs,settings.maxDurationMs);
  state.phase="paced";
  // armMaxTestTimer already started at first trial — don't restart it here
  setStatus(`Machine-paced start: ${state.duration.toFixed(0)}ms`);
  openTrial("paced");
}

// ─── Pacing ───
// ─── PACING ALGORITHM — MACHINE-PACED ────────────────────────
//
// SPEED UP ON CORRECT RESPONSE:
//   r = RT / currentDuration  (ratio of response time to frame window)
//   delta = (0.1 × r - 0.1) × currentDuration
//   newDuration = currentDuration + delta
//
//   Interpretation:
//   • If r < 1.0 (responded well before frame end): delta is NEGATIVE → speeds up
//   • If r = 1.0 (responded at exactly frame end): delta = 0 → no change
//   • If r > 1.0 (shouldn't happen on correct): delta is POSITIVE → slows slightly
//   • The faster the response relative to the frame, the larger the speedup
//   Example: frame=1000ms, RT=600ms → r=0.6, delta=(0.06-0.1)×1000 = -40ms
//   Example: frame=1000ms, RT=900ms → r=0.9, delta=(0.09-0.1)×1000 = -10ms
//
// SLOW DOWN ON WRONG RESPONSE:
//   newDuration = currentDuration + 100ms (flat penalty)
//   This gives the subject more time after an error.
//
// RESULT: Algorithm hunts for the fastest rate the subject can
//   sustain accurately — converging toward their cognitive speed limit.
//
// Duration always clamped to [minDurationMs=600, maxDurationMs=3500].
// ──────────────────────────────────────────────────────────────
function applyPacing(rt,correct){
  if(correct){ const r=rt/state.duration; state.duration=clamp(state.duration+(0.1*r-0.1)*state.duration,settings.minDurationMs,settings.maxDurationMs); }
  else{ state.duration=clamp(state.duration+100,settings.minDurationMs,settings.maxDurationMs); }
}

// ─── Finish ───
// ─── TEST FINISH ──────────────────────────────────────────────
// Called by all end conditions (success + all 8 failure modes).
// Computes final CPI, paced RT stats, test duration.
// Saves result to state.history (localStorage: cogspeed_v21_history).
// Triggers gear spin outro → thinking box → outcome box → summary.
// ──────────────────────────────────────────────────────────────
function finish(){
  clearTimer(); clearNoResponseTimer(); clearMaxTestTimer();
  state.phase="finished";
  const avg2=avgLast2Blocks(), cps=avg2!=null?computeCPI(avg2):null;
  const sd=stdDev(state.pacedRTs);
  const blockDiff=state.overloads.length>=2?state.overloads[state.overloads.length-1]-state.overloads[state.overloads.length-2]:null;
  const testDurMs=state.testStartTime!=null?performance.now()-state.testStartTime:null;
  const result={
    subjectId:subjectKey(state.subjectId||"0"),
    profile:state.profile?{gender:state.profile.gender,age:computeAge(state.profile.birthMonth,state.profile.birthYear),emailResults:state.profile.emailResults}:null,
    samnPerelli:state.samnPerelli,
    calibrationAverageMs:state.calibrationRTs.length?mean(state.calibrationRTs):null,
    blocks:[...state.overloads], blockCount:state.overloads.length,
    averageLast2BlockingScoresMs:avg2, blockScoreDifferenceMs:blockDiff,
    cognitivePerformanceIndex:cps, totalResponses:state.totalResponses,
    totalTrials:state.totalTrials, totalCorrect:state.totalCorrect,
    totalIncorrect:state.totalIncorrect, missedTrials:state.missedTrials,
    pacedErrors:state.pacedErrors, recoveryErrors:state.recoveryErrors, pacedResponseCount:state.pacedRTs.length,
    pacedResponseMeanMs:state.pacedRTs.length?mean(state.pacedRTs):null,
    pacedResponseSdMs:sd, testDurationMs:testDurMs,
    rtLog:[...state.rtLog], endReason:state.endReason||"Run complete",
    time:new Date().toISOString(), geo:state.geo
  };
  state.history.push(result);
  localStorage.setItem("cogspeed_v21r9_history",JSON.stringify(state.history));
  updateCPIDisplay(avg2); setProbeIdle();
  // Build the display text (also used for email)
  buildSummary(result);
  state.lastResultText = $("summaryText") ? $("summaryText").textContent : "";
  showResultsPage();
}

// ─── Open trial ───
// ─── TRIAL LIFECYCLE ──────────────────────────────────────────
// openTrial(): opens one trial for calibration/paced/recovery/terminal.
//   Sets testStartTime on first call (starts 150s total wall clock).
//   Sets paced frame timer (onPacedFrameEnd) for machine-paced trials.
// onPacedFrameEnd(): fires when paced frame expires (subject missed or
//   wrong). Increments miss streak → triggers block if ≥2 true misses.
// ──────────────────────────────────────────────────────────────
function openTrial(kind){
  clearTimer();
  // Track overall test duration from very first trial
  if(state.testStartTime===null){
    state.testStartTime=performance.now();
    armMaxTestTimer(); // 150s wall covers entire test including calibration
  }
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
    armNoResponseTimer();
  }else if(kind==="paced"){
    phaseLabel.textContent=`Paced · ${Math.round(state.duration)}ms`;
    setStatus("Machine-paced");
    state.trialTimer=setTimeout(onPacedFrameEnd,state.duration);
  }else if(kind==="recovery"){
    phaseLabel.textContent=`SP Restart ${state.spCorrectStreak}✓ ${state.spWrongCount}✗`;
    setStatus(`SP Restart — need ${settings.spRestartCorrectStreak} correct in a row`);
    armNoResponseTimer();
  }else if(kind==="terminal_recovery"){
    phaseLabel.textContent=`Final SP ${state.recoveryCorrectCompleted+1}/${settings.spRestartCorrectStreak}`;
    setStatus("Final self-paced recovery");
    armNoResponseTimer();
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
    updateCPIDisplay(avgLast2Blocks());
    // Check max block count
    const maxB=Math.max(2,Number(settings.maxBlockCount)||6);
    if(state.overloads.length>=maxB){ state.endReason="ERRATIC RESPONSES — Retest"; finish(); return; }
    if(maybeTriggerTerminalRule()) return;
    state.phase="recovery"; state.recoveryCorrectCompleted=0; state.spCorrectStreak=0; state.spWrongCount=0;
    openTrial("recovery"); return;
  }
  if(state.totalTrials>=settings.maxTrialCount){ state.endReason="ERRATIC RESPONSES — Retest"; finish(); }
  else openTrial("paced");
}

// ─── Handle tap ───
// ─── TAP HANDLER ──────────────────────────────────────────────
// Entry point for all subject responses (pointerdown on resp-btn).
// Routes to: calibration | paced | recovery | terminal_recovery.
// LATE CATCH: if tap within 600ms of frame start after a miss,
//   resolves PREVIOUS trial (savedLastDur for correct effectiveRT).
// BLOCKING ALGORITHM: onPacedFrameEnd counts consecutive true misses
//   (hadResponse=false). 2 consecutive → block recorded in overloads[].
//   Wrong taps (hadResponse=true) reset miss streak to 0.
// ──────────────────────────────────────────────────────────────
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
      if(state.calibrationErrors>settings.calibrationStopErrors){ failCalibration("TOO MANY WRONG RESPONSES — Practice!"); return; }
    }else{
      if(rt>settings.calibrationStopSlowMs){ failCalibration("NOT RESPONDING IN TIME — Practice!"); return; }
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
        const mult=Math.max(1.0,Number(settings.spRestartMultiplier)||1.3);
        const slower=clamp(Math.round(state.blockDuration*mult),settings.minDurationMs,settings.maxDurationMs);
        state.recoveries.push(slower); state.phase="paced"; state.duration=slower;
        state.spCorrectStreak=0; state.spWrongCount=0;
        setStatus(`Block recovery passed — resuming at ${slower.toFixed(0)}ms (${mult.toFixed(1)}× block)`);
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
    state.totalResponses+=1;
    // Save lastFrameDuration BEFORE clearing it
    const savedLastDur=state.lastFrameDuration||state.duration;
    state.previousMissed=false; state.lastFrameDuration=null;
    // Subject responded during this frame — mark it so the current trial is NOT a true miss
    state.hadResponse=true;
    if(correctForLast){
      state.previous.resolved=true;
      const eRT=rt+savedLastDur;
      applyPacing(eRT,true); state.totalCorrect+=1; state.pacedRTs.push(eRT);
      // Log against the PREVIOUS trial so probe/cell/response are correct
      const savedCurrent=state.current;
      state.current=state.previous;
      logTrial({phase:"paced_late_correct",rt,outcome:"correct",responseIndex:index});
      state.current=savedCurrent;
      flashBtn(index,true);
      if(recordAnswer(true)) return;
    }else{
      applyPacing(null,false); state.totalIncorrect+=1; state.pacedErrors+=1;
      if(checkMaxPacedWrong()) return;
      const savedCurrent=state.current;
      state.current=state.previous;
      logTrial({phase:"paced_late_wrong",rt,outcome:"wrong",responseIndex:index});
      state.current=savedCurrent;
      flashBtn(index,false);
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
  state.hadResponse=true;
  state.totalResponses+=1; state.totalIncorrect+=1; state.pacedErrors+=1;
  if(checkMaxPacedWrong()) return;
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
// Password-protected (default: 4822). Stays unlocked per session.
// HISTORY AND GRAPHS: combined CPI/MBS ms/SP-FS chart (last 20).
// TRIAL DETAIL: per-trial table with session selector + CSV download.
// LAST RESULTS: shows summary overlay for most recent test.
// EXPORT JSON: full history + settings as .json file.
// EXPORT CSV: history as spreadsheet-ready .csv file.
// BENCHMARK: device timing calibration test.
// ──────────────────────────────────────────────────────────────
function renderAdmin(){
  const w=$("adminSettings"); w.innerHTML="";
  for(const [k,l,t] of ADMIN_FIELDS){
    const r=document.createElement("div");
    r.style.cssText="display:grid;grid-template-columns:1fr 140px;gap:8px;align-items:center;margin-bottom:8px";
    r.innerHTML=`<label style="font-size:14px;color:var(--text)">${l}<div style="font-size:11px;color:var(--muted)">${k}</div></label><input id="adm_${k}" type="${t}" value="${settings[k]}" style="padding:9px;border:1px solid var(--edge);border-radius:10px;background:#0a1629;color:var(--text);font-size:14px;width:100%">`;
    w.appendChild(r);
  }
}
function readAdmin(){ for(const [k,,t] of ADMIN_FIELDS){ const el=$("adm_"+k); if(el) settings[k]=t==="number"?Number(el.value):el.value; } }
function resetAdmin(){ settings={...DEFAULTS}; saveSettings(); renderAdmin(); }

// ─── Charts ───
// ─── HISTORY AND GRAPHS ───────────────────────────────────────
// drawCombinedChart(): 3-series chart — CPI (cyan, left axis 0-100),
//   Block ms (amber, right axis REVERSED: smaller ms at top = better),
//   SP-FS (green, left axis 1-7). Shows last 20 sessions.
//   "↑ better" label on right axis. Each series rises with improvement.
// drawRTScatterChart(): per-trial RT scatter (reversed Y: fast=top).
// ──────────────────────────────────────────────────────────────
function drawCombinedChart(canvas,hist){
  if(!canvas) return;
  const ctx=canvas.getContext("2d"),W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle="#081321"; ctx.fillRect(0,0,W,H);
  const PAD={top:32,right:52,bottom:38,left:48},cW=W-PAD.left-PAD.right,cH=H-PAD.top-PAD.bottom;
  if(!hist.length){ ctx.fillStyle="#d7e7f8"; ctx.font="bold 13px sans-serif"; ctx.textAlign="center"; ctx.fillText("No data yet",W/2,H/2); return; }
  const slice=hist.slice(-20),n=slice.length,xStep=n>1?cW/(n-1):cW;
  const cpsVals=slice.map(x=>x.cognitivePerformanceIndex??null);
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
  // ms axis: RIGHT side — REVERSED (smaller ms = better = higher on chart)
  // t=0 → y=PAD.top (top of chart) = bMax (worst/highest ms)
  // t=5 → y=PAD.top+cH (bottom of chart) = bMin (best/lowest ms)
  ctx.fillStyle="#ff9f40"; ctx.textAlign="left";
  for(let t=0;t<=5;t++){
    const v=bMax-(t/5)*(bMax-bMin);  // bMax at top label, bMin at bottom
    const y=PAD.top+(t/5)*cH;
    const label=v>=1000?(v/1000).toFixed(1)+"s":Math.round(v)+"ms";
    ctx.fillText(label,PAD.left+cW+4,y+4);
  }
  // x-axis session labels
  ctx.fillStyle="#7fa0c0"; ctx.font="10px sans-serif"; ctx.textAlign="center";
  for(let i=0;i<n;i++) ctx.fillText(String(i+1),xO(i),PAD.top+cH+14);
  // drawSeries: draw line + dots + value labels
  function drawSeries(vals,toY,color){
    ctx.strokeStyle=color; ctx.lineWidth=2.2; ctx.beginPath(); let started=false;
    vals.forEach((v,i)=>{ if(v==null){started=false;return;} const x=xO(i),y=toY(v); if(!started){ctx.moveTo(x,y);started=true;}else ctx.lineTo(x,y); });
    ctx.stroke();
    vals.forEach((v,i)=>{ if(v==null) return; ctx.fillStyle=color; ctx.beginPath(); ctx.arc(xO(i),toY(v),3.5,0,Math.PI*2); ctx.fill(); ctx.font="9px sans-serif"; ctx.textAlign="center"; ctx.fillText(v>100?(v/1000).toFixed(1)+"s":v.toFixed(0),xO(i),toY(v)-6); ctx.textAlign="left"; });
  }
  // blockToY: REVERSED — smaller ms → smaller y → higher on chart
  function blockToY(v){ return PAD.top+((v-bMin)/((bMax-bMin)||1))*cH; }
  function spfToY(v){ return yL(v,1,7); }
  drawSeries(blockVals,blockToY,"#ff9f40");
  drawSeries(cpsVals,v=>yL(v,0,100),"#7fd7ff");
  drawSeries(spfVals,spfToY,"#88ff88");
  ctx.fillStyle="#7fd7ff"; ctx.font="bold 9px sans-serif"; ctx.textAlign="left"; ctx.fillText("■ CPI",PAD.left,PAD.top-4);
  ctx.fillStyle="#ff9f40"; ctx.fillText("■ MBS ms",PAD.left+50,PAD.top-4);
  ctx.fillStyle="#88ff88"; ctx.fillText("■ S-PF",PAD.left+115,PAD.top-4);
  ctx.fillStyle="rgba(255,159,64,0.7)"; ctx.font="9px sans-serif"; ctx.textAlign="right";
  ctx.fillText("\u2191 better",PAD.left+cW+50,PAD.top-4);
}


// ─── RT scatter chart ───
function drawRTScatterChart(canvas,rtLog,blocks,meanRT,sdRT){
  if(!canvas||!rtLog.length) return;
  const ctx=canvas.getContext("2d"),W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H); ctx.fillStyle="#081321"; ctx.fillRect(0,0,W,H);
  const PAD={top:20,right:20,bottom:30,left:48},cW=W-PAD.left-PAD.right,cH=H-PAD.top-PAD.bottom;
  const rts=rtLog.filter(e=>e.rt!=null).map(e=>e.rt);
  if(!rts.length) return;
  const maxRT=Math.ceil(Math.max(...rts,1000)/500)*500;
  const minRT=Math.max(0,Math.floor(Math.min(...rts)/500)*500);
  const n=rtLog.length;
  function xO(i){ return PAD.left+(i/(n-1||1))*cW; }
  // REVERSED: smaller RT → smaller y → higher on chart
  function yO(v){ return PAD.top+((v-minRT)/((maxRT-minRT)||1))*cH; }
  ctx.strokeStyle="rgba(79,111,153,0.2)"; ctx.lineWidth=1;
  // Gridlines and labels — larger ms at bottom, smaller at top
  [250,500,750,1000,1500,2000,2500,3000].filter(v=>v>=minRT&&v<=maxRT+100).forEach(v=>{
    const y=yO(v);
    ctx.beginPath(); ctx.moveTo(PAD.left,y); ctx.lineTo(PAD.left+cW,y); ctx.stroke();
    ctx.fillStyle="#7fa0c0"; ctx.font="9px sans-serif"; ctx.textAlign="right";
    ctx.fillText(`${v}ms`,PAD.left-3,y+3);
  });
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
// ─── EXPORT / EMAIL ───────────────────────────────────────────
// exportResults(): downloads full history as cogspeed_v21_results.json
// exportCSV(): downloads history as cogspeed_v21_history.csv
//   Columns: session, subjectId, date, SP-FS, calibration, blocks,
//   CPI, taps, correct, wrong, missed, paced stats, duration, end reason.
// emailResults(): opens mailto: with last result text in body.
// ──────────────────────────────────────────────────────────────
function exportResults(){
  const blob=new Blob([JSON.stringify({settings,history:state.history},null,2)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="cogspeed_v21_results.json"; a.click();
}
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
    `"${(r.location||"").replace(/"/g,'""')}"`
  ].map(v=>v==null?"":v).join(","));
  const csv=[cols.join(","), ...rows].join("\n");
  const blob=new Blob([csv],{type:"text/csv"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="cogspeed_v21_history.csv"; a.click();
}
function emailResults(){
  const last=state.history[state.history.length-1];
  if(!last){ setStatus("No results to email."); return; }
  const to=state.profile?.emailResults&&state.profile?.email?state.profile.email:"";
  window.location.href=`mailto:${to}?subject=CogSpeed V21 Results&body=${encodeURIComponent(state.lastResultText||JSON.stringify(last,null,2))}`;
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

// ═══════════════════════════════════════════════════════════════
// SECTION: REGISTRATION — PROFILE
// Collects email (subject ID), birth month/year, gender, email pref.
// Stored in localStorage: cogspeed_v21_profile
// [PLANNED] Server-side account for population norms.
// ═══════════════════════════════════════════════════════════════

const PROFILE_KEY = "cogspeed_v21_profile";

function loadProfile(){
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)||"null"); } catch(e){ return null; }
}
function saveProfile(p){
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}
function clearProfile(){
  localStorage.removeItem(PROFILE_KEY);
}

// Compute age from birth month (1-12) and year
function computeAge(bMonth, bYear){
  const now = new Date();
  let age = now.getFullYear() - bYear;
  if(now.getMonth()+1 < bMonth) age--;
  return age;
}

// Current profile being edited
let _profileData = {email:"", birthMonth:0, birthYear:0, gender:"", emailResults:false};
let _profileGenderSelected = "";

function profileSelectGender(g){
  _profileGenderSelected = g;
  ["M","F","O"].forEach(x=>{
    const btn = $("profileGender"+x);
    if(!btn) return;
    btn.style.background = x===g ? "linear-gradient(180deg,#0d4a1a,#062a10)" : "";
    btn.style.borderColor = x===g ? "#00ff88" : "";
    btn.style.color       = x===g ? "#00ff88" : "";
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
    const by = $("profileBirthYear");  if(by) by.value  = existing.birthYear||"";
    const er = $("profileEmailResults"); if(er) er.checked = !!existing.emailResults;
    profileToggleEmail(!!existing.emailResults);
    if(existing.gender) profileSelectGender(existing.gender);
    validateProfileAge();
  } else {
    const bm = $("profileBirthMonth"); if(bm) bm.value="";
    const by = $("profileBirthYear");  if(by) by.value="";
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
  const bYear  = parseInt($("profileBirthYear")?.value||"0");
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
  setStatus("Profile saved");
}

function resetProfile(){
  clearProfile();
  _profileGenderSelected = "";
  const bm=$("profileBirthMonth"); if(bm) bm.value="";
  const by=$("profileBirthYear");  if(by) by.value="";
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
  ["subjectOverlay","profileOverlay","refresherOverlay","fatigueOverlay","tutorialOverlay","adminOverlay","resultsOverlay","summaryOverlay","trialLogOverlay","historyOverlay","thinkingOverlay","outcomeOverlay"].forEach(id=>{ const el=$(id); if(el) el.classList.add("hidden"); });
}
function showOnly(id){
  ["subjectOverlay","profileOverlay","refresherOverlay","fatigueOverlay","adminOverlay","resultsOverlay","summaryOverlay","trialLogOverlay","historyOverlay","tutorialOverlay"].forEach(oid=>{ const el=$(oid); if(el) el.classList[oid===id?"remove":"add"]("hidden"); });
}
function isTestSuccess(r){ return (r||"").toLowerCase().startsWith("convergent"); }

// ─── Summary ───
// ─── SUMMARY TEST RESULTS ─────────────────────────────────────
// Formats full monospace result text (state.lastResultText).
// Includes: subject ID, date/time, location, SP-FS, calibration,
//   block scores, CPI, response stats, end reason, reference table.
// REFERENCE TABLE: 7-row S-PF/CPI/MBS lookup from Perelli (2026)
//   with ← YOUR SCORE arrow on the matching CPI band.
// ──────────────────────────────────────────────────────────────
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
  const cps=result.cognitivePerformanceIndex;
  const sd=result.pacedResponseSdMs;
  // Row color by SPF level: top dark green → light green → yellow → orange → bottom 2 red
  const SPF_COLOR={7:'#1a8a1a',6:'#1a8a1a',5:'#4aaa00',4:'#c8a800',3:'#cc5500',2:'#cc1100',1:'#cc1100'};
  const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const tableData=[
    [7,100,  800, "FUNCTIONING EXCEPTIONALLY WELL"],
    [6, 80, 1240, "FUNCTIONING VERY WELL"],
    [5, 75, 1350, "FUNCTIONING NORMALLY"],
    [4, 50, 1900, "FUNCTIONING SLIGHTLY LESS THAN NORMAL"],
    [3, 25, 2450, "FUNCTIONING — STARTING TO SLOW"],
    [2, 11, 2758, "DIFFICULT TO FUNCTION — BECOMING UNSAFE"],
    [1,  0, 3000, "UNABLE TO FUNCTION — DEFINITELY UNSAFE"],
  ];
  const tableRows=tableData.map(([spf,cpi,brd,cap],i)=>{
    const mbsStr = String(brd);
    // Each row owns scores > next row's cpi and <= this row's cpi.
    // Last row owns everything <= 0.
    const loBound = i+1 < tableData.length ? tableData[i+1][1] : -Infinity;
    const inBand  = cps!=null && cps > loBound && cps <= cpi;
    const arrow   = inBand ? " ← YOUR SCORE" : "";
    const line=`    ${String(spf).padStart(2)}  | ${String(cpi).padStart(3)}  | ${mbsStr.padStart(6)}  | ${cap}${arrow}`;
    return `<span style="color:${SPF_COLOR[spf]};font-weight:700">${line}</span>`;
  }).join("\n");

  const mainPart=
`CogSpeed V21  \u2014  Test Results
${hr}
Subject ID:    ${result.subjectId}
${result.profile?`Gender:        ${result.profile.gender==="M"?"Male":result.profile.gender==="F"?"Female":"Other"}
Age:           ${result.profile.age} years`:""}
Date / Time:   ${new Date(result.time).toLocaleString()}
Test duration:         ${formatDuration(result.testDurationMs)}
Location:      ${geoStr}
${hr}
FATIGUE (S-PF)
  Pre-test rating:  ${spf}
${hr}
CALIBRATION
  Average RT:  ${result.calibrationAverageMs!=null?result.calibrationAverageMs.toFixed(1)+" ms":"\u2014"}
${hr}
MACHINE-PACED PERFORMANCE
  Block scores:
${blockList}
  Avg last 2 blocks:   ${avg2!=null?avg2.toFixed(1)+" ms":"\u2014"}
  Block score diff:    ${diffStr}
  CPI:                 ${cps!=null?cps.toFixed(1)+" / 100":"\u2014"}
${hr}
RESPONSE STATISTICS
  Total taps:            ${result.totalResponses}
    Correct:             ${result.totalCorrect}
    Wrong:               ${result.totalIncorrect}
  Missed (no response):  ${result.missedTrials}
  Paced correct taps:    ${result.pacedResponseCount||0}
  Paced wrong taps:      ${result.pacedErrors||0}
  SP Restart wrong taps: ${result.recoveryErrors||0}
  Mean paced RT:         ${result.pacedResponseMeanMs!=null?result.pacedResponseMeanMs.toFixed(1)+" ms":"\u2014"}
  Paced RT SD:           ${sd!=null?sd.toFixed(1)+" ms":"\u2014"}
${hr}
END REASON
  ${result.endReason}
${hr}
COGNITIVE PERFORMANCE REFERENCE TABLE
  S-PF | CPI  | MBS ms  | Performance Capability
  \u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`;

  const footerPart=
`
  \u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  MBS table mapped from current MP min/max defaults (800–3000)  |  CPI = 0-100 scale
  Source: Perelli (2026), Gray Matter Metrics, LLC`;

  el.innerHTML = esc(mainPart)+"\n"+tableRows+esc(footerPart);
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
  canvas.width  = W*dpr; canvas.height = H*dpr;
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
    {s:0,  e:25,  c:"#cc1100"},
    {s:25, e:50,  c:"#ee6500"},
    {s:50, e:75,  c:"#7ec800"},
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
    const lw   = isMaj?R*0.023:isMid?R*0.013:R*0.007;
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
  ctx.lineTo(R*0.62,   -R*0.013);
  ctx.lineTo(R*0.73,    0);
  ctx.lineTo(R*0.62,    R*0.013);
  ctx.lineTo(-R*0.155,  R*0.026);
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

// ─── Results page — gear spin outro then thinking box ───
// ─── RESULTS PAGE FLOW ────────────────────────────────────────
// THINKING BOX: 6s animated steam+sparks FX after test ends.
// SUCCESS/FAIL BOX: 3s outcome overlay (green=SUCCESS/red=Test Failed).
// Then shows summary overlay with full result text.
// LAST RESULTS: accessible from admin → 📄 Last Results button.
// E-MAIL: emailResults() opens mailto: with full result text body.
// ──────────────────────────────────────────────────────────────
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
        // Draw speedometer
        const canvas=$("speedometerCanvas");
        if(canvas){
          const cps=success&&last?Math.max(0,Math.min(100,last.cognitivePerformanceIndex||0)):0;
          const mbs=last&&last.averageLast2BlockingScoresMs!=null?last.averageLast2BlockingScoresMs:null;
          const wrap=$("speedometerWrap");
          if(wrap) canvas.style.width=wrap.offsetWidth+"px";
          setTimeout(()=>animateSpeedometer(canvas, cps, mbs, success), 100);
        }
        // Speedometer stays visible until user taps "View Results"
      }
    },6000);
  },1500);
}

// ─── Session control ───
// ─── SESSION STATE MANAGEMENT ─────────────────────────────────
// clearCurrentSession(): resets all trial/block/calibration state
//   while preserving subjectId and samnPerelli for retests.
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
  state.pacedRTs=[]; state.rtLog=[]; state.previousMissed=false; state.lastFrameDuration=null;
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
}
function startOverFlow(){
  clearCurrentSession(); state.subjectId=null; state.samnPerelli=null;
  fatigueOut.textContent="—"; $("subjectIdInput").value="";
  _adminUnlocked=false;
  setStatus("Reset. Enter Subject ID."); showOnly("subjectOverlay");
}

// ─── Gear spin intro then start ───
// ─── GEAR SPIN INTRO / OUTRO ──────────────────────────────────
// runGearSpinThenStart(): shows all gears spinning fast (1.8s),
//   then opens curtain (0.75s transition), then fires callback.
// Outro spin triggered in showResultsPage() after test ends.
// CURTAIN TRANSITION: left/right panels slide apart on open,
//   slide closed on test end (CSS transform translateX).
// ──────────────────────────────────────────────────────────────
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
// ─── TEST START ───────────────────────────────────────────────
// Validates subjectId + samnPerelli, clears session state,
// captures geo, fires gear spin intro, then opens first trial.
// noteAnyResponse() starts the no-response timer AFTER spin completes
//   so the 10s calibration clock only runs when gears are visible.
// ──────────────────────────────────────────────────────────────
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
  runGearSpinThenStart(()=>{
    state.phase="calibration";
    openTrial("calibration");
  });
}

// ─── Trial detail log ───
// ─── TRIAL DETAIL LOG ─────────────────────────────────────────
// Full per-trial table: trial#, phase, RT, outcome, probe, correct
//   cell, response. Session selector dropdown. CSV download button.
// Accessible from admin → 📋 Trial Detail button.
// ──────────────────────────────────────────────────────────────
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
      opt.textContent=`Session ${idx+1} — ${r.subjectId} — ${new Date(r.time).toLocaleString()} — CPI: ${r.cognitivePerformanceIndex!=null?r.cognitivePerformanceIndex.toFixed(0):"—"}`;
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
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`cogspeed_v21_trials_${subj}.csv`; a.click();
}

// ─── History & Graphs overlay ───
// ─── HISTORY OVERLAY ──────────────────────────────────────────
// Table of all sessions (newest first) with CPI, blocks, duration.
// Clickable rows show that session's full summary.
// Rendered inside admin → 📈 History & Graphs button.
// ──────────────────────────────────────────────────────────────
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
    const cps=r.cognitivePerformanceIndex!=null?r.cognitivePerformanceIndex.toFixed(1):"—";
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

// Demo trial: probe=lines:3, correct=dots:3 @position 3
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
    const glow   = isFL ? "drop-shadow(0 0 8px rgba(0,255,136,0.9))" : "none";
    const border = isFL ? "2px solid #00ff88" : "2px solid transparent";
    html += `<div style="aspect-ratio:1;border-radius:10px;border:${border};filter:${glow};position:relative">
      ${buildGearSVG(i+1, null, "large", "")}
    </div>`;
  }
  html += '</div>';
  return html;
}


function buildTutGearGridAnimated(showPatterns){
  let html = `<style>
    @keyframes tutPairFlash {
      0%, 16.666% { border-color:#7fd7ff; filter:drop-shadow(0 0 10px rgba(127,215,255,0.95)); box-shadow:0 0 16px rgba(127,215,255,0.30) inset; opacity:1; }
      20%, 100% { border-color:transparent; filter:none; box-shadow:none; opacity:.72; }
    }
  </style>`;
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;width:100%;max-width:340px">';
  TUT_ITEMS.forEach((it,i)=>{
    const pat = showPatterns ? it.pattern : null;
    html += `<div style="border:2px solid transparent;border-radius:10px;aspect-ratio:1;animation:tutPairFlash 12s linear infinite;animation-delay:${i*2}s">
      ${buildGearSVG(i+1, pat, "large", "")}
    </div>`;
  });
  html += '</div>';
  return html;
}

function buildTutRespGridAnimated(){
  let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;width:100%;max-width:340px">';
  for(let i=0;i<6;i++){
    html += `<div style="aspect-ratio:1;border-radius:10px;border:2px solid transparent;position:relative;animation:tutPairFlash 12s linear infinite;animation-delay:${i*2}s">
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
  const probeOpacity   = (highlightPart==="probe"||highlightPart==="both"||highlightPart==="all") ? 1 : 0.2;
  const stimOpacity    = (highlightPart==="stim" ||highlightPart==="both"||highlightPart==="all") ? 1 : 0.2;
  const respOpacity    = (highlightPart==="resp" ||highlightPart==="both"||highlightPart==="all") ? 1 : 0.2;
  const probeGlow      = highlightPart==="probe"||highlightPart==="both"||highlightPart==="all"
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
          <div style="font-size:14px;color:rgba(20,20,20,0.72);margin-top:10px;line-height:1.45">
            The center <span style="font-weight:700">probe</span> matches one gear above and the
            response gear in the <span style="font-weight:700">same position below</span>.
            Each matching top/bottom pair flashes for 2 seconds in sequence.
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
  // Update next button
  const btn=$("tutNextBtn");
  if(btn) btn.textContent = n===4 ? "▶ Start Test!" : "Next →";
  if(btn) btn.style.background = n===4 ? "linear-gradient(180deg,#0d4a1a,#062a10)" : "";
  if(btn) btn.style.borderColor = n===4 ? "#00ff88" : "";
  if(btn) btn.style.color = n===4 ? "#00ff88" : "";
}

// ─── TUTORIAL / TRAINING ──────────────────────────────────────
// 5-step walkthrough: Probe → Targets → Rule → Tap Match → React Fast!
// Each step shows mini trial screen (22% opacity) in background
//   with relevant parts highlighted. Last step mentions SP-FS next.
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
$("refStartOverBtn").onclick=()=>startOverFlow();
$("fatigueBackBtn").onclick=()=>goToStartPage();
$("fatigueStartOverBtn").onclick=()=>startOverFlow();
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
$("resetAdminBtn").onclick=()=>{ resetAdmin(); setStatus("Settings reset to defaults"); };
$("exportAdminBtn").onclick=()=>{ const blob=new Blob([JSON.stringify(settings,null,2)],{type:"application/json"}),a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="cogspeed_v21_settings.json"; a.click(); };
const _ecb=$("exportCsvAdminBtn"); if(_ecb) _ecb.onclick=exportCSV;
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
  const btn=$("historyClearBtn");
  if(btn._confirmPending){
    clearTimeout(btn._confirmTimer);
    btn._confirmPending=false;
    btn.textContent="🗑 Clear History";
    btn.style.color="rgba(255,100,136,0.5)";
    btn.style.borderColor="rgba(255,100,136,0.3)";
    state.history=[]; localStorage.removeItem("cogspeed_v21r9_history");
    buildHistoryOverlay(); setStatus("History cleared.");
  } else {
    btn._confirmPending=true;
    btn.textContent="Tap again to confirm";
    btn.style.color="#ff6688";
    btn.style.borderColor="#ff6688";
    btn._confirmTimer=setTimeout(()=>{
      btn._confirmPending=false;
      btn.textContent="🗑 Clear History";
      btn.style.color="rgba(255,100,136,0.5)";
      btn.style.borderColor="rgba(255,100,136,0.3)";
    },3000);
  }
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
const _orb=$("outcomeResultsBtn"); if(_orb) _orb.onclick=()=>{ $("outcomeOverlay").classList.add("hidden"); stopSpeedometer(); $("summaryOverlay").classList.remove("hidden"); setTestingQuiet(false); };
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


if ("serviceWorker" in navigator) {
  let __swRefreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (__swRefreshing) return;
    __swRefreshing = true;
    window.location.reload();
  });
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").then(reg => {
      reg.update();
    }).catch(err => {
      console.warn("SW registration failed:", err);
    });
  });
}
