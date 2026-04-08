// ═══════════════════════════════════════════════════
// CogSpeed V518
// ═══════════════════════════════════════════════════
// Current visible build version used in UI and email subject lines.
const APP_VERSION = "V519";

// ═══════════════════════════════════════════════════
// RECENT INTEGRATED PROGRAM CHANGES (through V488)
// This block summarizes the major program updates that were merged into
// the current main line so future edits do not have to reconstruct them
// from one-off patch builds.
//
// 1) Sleep logger / results integration
//    - Sleep entry supports 12-hour mode (hour + minute + AM/PM buttons)
//      and 24-hour mode.
//    - Sleep data is preserved across test start and saved into result
//      records, CSV export, and the Results page summary.
//    - Each sleep entry stores a real wake datetime so “Time since last
//      sleep” can span multiple days across sessions.
//
// 2) Profile / guest separation
//    - Guest mode (subject ID 0) is treated as settings-only and must not
//      inherit a previously saved email profile.
//    - The 12/24 hour toggle on the Profile page is local draft UI state
//      while Profile is open and is only committed on Save & Continue.
//
// 3) Performance / graph updates
//    - Speedometer has a session browser (dropdown + Prev/Next) and linked
//      views open for the currently selected session.
//    - Performance over Date and Time shows all sessions by default and
//      includes sleep-quality bars.
//    - Response-Time Graph and other live charts use HiDPI canvas setup.
//
// 4) Trial detail / timing diagnostics
//    - Trial Detail column names were clarified.
//    - Trial logs record pacing deltas and per-trial timing diagnostics.
//
// 5) Package consistency / cleanup
//    - Contact text is standardized to thinkfastgmm@gmail.com.
//    - Full Reset label matches actual behavior.
//    - GMM FIREBIRD.png is cached in the service-worker app shell.
//    - The app remains a single monolithic app.js.
//
// 6) Mode 4 integration
//    - Mode 4 adds a sustained MBS phase after convergent adaptive pacing.
//    - Mode 4 stores CSR, SBLP, SPI, sustained/final targets, and related
//      session data for results, graphs, speedometer summaries, and CSV.
//    - Failed non-triggered Mode 4 sessions leave SPI/SBLP empty.
//
// 7) Stabilization / fail-open flow
//    - Curtain helpers are defensive cleanup only; live control flow should
//      not depend on curtain behavior.
//    - Start and finish handoffs are guarded with visible flow diagnostics.
//    - Finish stages are COMPUTE, SAVE, RENDER, and SHOW.
//
// 8) Recent rule updates
//    - Admin max total test time default is 150000 ms.
//    - Mode 4 final self-paced no-response is bounded by the overall max
//      test time rather than a per-trial no-response timeout.
//    - The overall timer is suspended during the sustained MBS segment and
//      restarted when the first final self-paced trial is shown.
//    - Mode 4 now enters the sustained MBS segment when convergent adaptive
//      pacing is reached; it no longer requires adaptive MBS to be below a
//      separate threshold before the sustained branch can start.
// ═══════════════════════════════════════════════════

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
// NOTE: keep DEFAULTS, ADMIN_FIELDS labels, CPI comments, and any table
// fallbacks aligned. Recent cleanup removed several stale mismatches.
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
 testMode:"mode4",
 mode2TrialLimit:150,
 mode2MaxDurationMs:120000,
 mode3CalibrationTrials:10,
 mode3PacedTrialLimit:140,
 mode3MaxDurationMs:120000,
 mode3BaselineFactor:1.3,
 mode4MbsThresholdMs:250,
 mode4SustainedTrialCount:10,
 mode4FinalTrialCount:2,
 consecutiveMissesForBlock:2,
  blockRestartPercent:1.3,
 wrongSlowdownMs:50,
 correctSpeedupFactor:0.30,
 minSpeedupOnCorrectMs:50,
 maxSpeedupOnCorrectMs:200,
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
 initialUnusedCalibrationTrials:1,
 initialMeasuredCalibrationTrials:7,
 initialPacedPercent:1.2,
 calibrationStopErrors:4,
 calibrationStopSlowMs:6000,
 cpiBestMs:800,
 cpiWorstMs:3000,
 deviceBenchmarkEnabled:0,
 timeFormat:"12",
 lateResponseThresholdMs:600, // first response <600ms on next frame may belong to prior frame; a second >=600ms response belongs to current frame
 RecoveryInterTrialDelayMsStart:0, // delay before opening the next recovery or terminal-recovery trial
 ResumeToPacedDelayMs:0 // delay before resuming paced mode after recovery succeeds
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
 ["initialUnusedCalibrationTrials","2. Warm-up calibration trials (default 1)","number"],
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
 ["testMode","16. Test mode","select:mode1|mode2|mode3|mode4"],

 // 18-29. Mode 1 settings, ordered by use
 ["initialPacedPercent","17. Mode 1 MP start: % of calibration avg (default 1.2)","number"],
 ["consecutiveMissesForBlock","18. Mode 1 misses to trigger block (default 2)","number"],
 ["blockRestartPercent","19. Mode 1 restart: % of block baseline (default 1.3)","number"],
 ["spRestartCorrectStreak","20. Mode 1 recovery correct streak to resume (default 2)","number"],
 ["spRestartWrongLimit","21. Mode 1 recovery max wrong before fail (default 3)","number"],
["wrongSlowdownMs","22. Mode 1 MP slowdown on wrong (ms, default 50)","number"],
["correctSpeedupFactor","23. Mode 1 MP correct formula factor (default 0.30)","number"],
["minSpeedupOnCorrectMs","24. Mode 1 MP minimum speedup on correct (ms, default 50)","number"],
["maxSpeedupOnCorrectMs","25. Mode 1 MP maximum speedup on correct (ms, default 200)","number"],
 ["recoveryNoResponseMs","26. Mode 1 recovery no-response timeout (ms, default 10000)","number"],
 ["maxBlockCount","27. Mode 1 max total blocks before fail (default 6)","number"],
 ["qualifyingBlockGapMs","28. Mode 1 qualifying block max gap (ms, default 250)","number"],
 ["maxTrialCount","29. Mode 1 max paced trials (default 180)","number"],
 ["maxPacedWrong","30. Mode 1 max paced wrong before fail (default 20)","number"],
 ["cpiBestMs","31. Mode 1 CPI best ms anchor (default 800)","number"],
 ["cpiWorstMs","32. Mode 1 CPI worst ms anchor (default 3000)","number"],

 // 36-37. Mode 2 settings, ordered by use
 ["mode2TrialLimit","33. Mode 2 SPC trial limit (default 150)","number"],
 ["mode2MaxDurationMs","34. Mode 2 total duration ms (default 120000)","number"],

 // 38-41. Mode 3 settings, ordered by use
 ["mode3CalibrationTrials","35. Mode 3 self-paced calibration trials (default 10)","number"],
 ["mode3BaselineFactor","36. Mode 3 MP baseline factor from cal avg (default 1.3)","number"],
 ["mode3PacedTrialLimit","37. Mode 3 fixed machine-paced trial limit (default 140)","number"],
 ["mode3MaxDurationMs","38. Mode 3 total duration ms (default 120000)","number"],
 ["mode4MbsThresholdMs","39. Mode 4 MBS threshold to start sustained phase (ms, default 250)","number"],
 ["mode4SustainedTrialCount","40. Mode 4 sustained trials at MBS (default 10)","number"],
 ["mode4FinalTrialCount","41. Mode 4 final self-paced trials (default 2)","number"],
 ["deviceBenchmarkEnabled","42. Device benchmark (0=off, 1=on)","number"],
 ["lateResponseThresholdMs","43. Late response reassignment threshold (ms, default 600)","number"],
 ["RecoveryInterTrialDelayMsStart","44. Recovery inter-trial delay at start (ms, default 0)","number"],
 ["ResumeToPacedDelayMs","45. Resume-to-paced delay after recovery (ms, default 0)","number"],
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
 // Legacy migration only: older builds saved the same preference as use12HourTime (1/0).
 if(!m.timeFormat) m.timeFormat = (s.use12HourTime===0 || s.use12HourTime==="0") ? "24" : "12";
 return m;
}
function saveSettings(){ localStorage.setItem(`${STORAGE_PREFIX}_settings`,JSON.stringify(settings)); }
let settings=loadSettings();

// ─── State ───
// Shared runtime state for the current session.
// IMPORTANT: keep session-reset helpers aligned with this shape:
//   - resetTrialStateOnly()       = clear active trial/test runtime only
//   - resetPretestEntryState()    = clear sleep / SP-FS entry path only
//   - resetSubjectSessionState()  = full subject/session reset
// Several recent regressions came from clearing the wrong fields at the
// wrong time (especially sleep fields and guest/profile state).
const state={
 phase:"idle", duration:null, blockDuration:null, blockRestartBaseline:null, profile:null,
 current:null, previous:null, unresolvedStreak:0,
 overloads:[], recoveries:[], recoveryCorrectCompleted:0,
 spCorrectStreak:0, spWrongCount:0, terminalBlockReason:null,
 history:(function(){ try { return JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}_history`)||"[]"); } catch(e){ return []; } })(),
 totalTrials:0, totalResponses:0, totalCorrect:0, totalIncorrect:0,
 missedTrials:0, pacedErrors:0, recoveryErrors:0, rollMeanLog:[],
 testStartTime:null, trialTimer:null, absoluteNoResponseTimer:null, maxTestTimer:null,
 maxTestRemainingMs:null, maxTestDeadlineMs:null,
 lastFiveAnswers:[], samnPerelli:null, subjectId:null,
 calibrationTrialIndex:0, calibrationRTs:[], calibrationErrors:0,
 pacedRTs:[], rtLog:[], lastFrameDuration:null,
 presentedRoundDuration:null,
 activeMode:"mode1", selfPacedRTs:[], selfPacedCorrect:0, selfPacedWrong:0,
 fixedPacedBaseline:null, fixedPacedPresented:0, fixedPacedCorrect:0, fixedPacedWrong:0,
 trialOpenedAt:null, geo:null, benchmark:null, lastResultText:null,
 activeResult:null, activeSessionIndex:null, activeResultSource:null,
 sleepSinceLastTest:null,
 sleepLog:null,
 pendingPriorMiss:null, pendingLatePacing:null,
 activeFrameTiming:null, frameOvershootLog:[], rafIntervalLog:[],
 mode4Triggered:false, mode4AdaptiveMbsMs:null, mode4SustainedPresentationRateMs:null,
 mode4SustainedPresented:0, mode4SustainedCorrect:0, mode4SustainedWrong:0, mode4SustainedMissed:0,
 mode4SustainedCorrectRTs:[], mode4FinalTrialsPresented:0,
 mode4FinalCorrect:0, mode4FinalWrong:0, mode4FinalRTs:[],
 speedometerMode4Metric:"spi"
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

function formatActiveResultSource(result, sessionIndex, sourceHint){
 const idx = Number.isFinite(Number(sessionIndex)) ? Number(sessionIndex) : (result && Array.isArray(state.history) ? state.history.indexOf(result) : -1);
 const when = result && result.time ? new Date(result.time).toLocaleString() : 'unsaved';
 const base = idx>=0 ? `history[${idx}]` : 'currentResult';
 const extra = sourceHint ? ` · ${sourceHint}` : '';
 return `SOURCE: ${base}${extra} · ${when}`;
}
function setActiveResultContext(result, sessionIndex, sourceHint){
 state.activeResult = result || null;
 state.activeSessionIndex = Number.isFinite(Number(sessionIndex)) ? Number(sessionIndex) : ((result && Array.isArray(state.history)) ? state.history.indexOf(result) : null);
 state.activeResultSource = formatActiveResultSource(result, state.activeSessionIndex, sourceHint||'');
 return {result:state.activeResult, index:state.activeSessionIndex, source:state.activeResultSource};
}
function resolveResultContext(resultOverride, sessionIndex, sourceHint){
 if(resultOverride){
  return setActiveResultContext(resultOverride, sessionIndex, sourceHint || (Array.isArray(state.history) && state.history.indexOf(resultOverride)>=0 ? 'explicit resultOverride' : 'explicit current result'));
 }
 if(Number.isFinite(Number(sessionIndex)) && Array.isArray(state.history) && state.history[Number(sessionIndex)]){
  return setActiveResultContext(state.history[Number(sessionIndex)], Number(sessionIndex), sourceHint || 'explicit session index');
 }
 if(state.activeResult){
  return setActiveResultContext(state.activeResult, state.activeSessionIndex, sourceHint || 'active result');
 }
 if(Array.isArray(state.history) && state.history.length){
  return setActiveResultContext(state.history[state.history.length-1], state.history.length-1, sourceHint || 'latest saved history');
 }
 return {result:null, index:null, source:'SOURCE: none'};
}
function applySummarySourceDiagnostic(result, sessionIndex, sourceText){
 const el=$('summaryText'); if(!el||!result) return;
 const source = sourceText || formatActiveResultSource(result, sessionIndex, 'summary');
 const body = String(el.textContent||'');
 const lines = body.split('\n');
 if(lines[0]===source) return;
 el.textContent = `${source}\n${body}`;
}
function applySpeedometerSourceDiagnostic(result, sessionIndex, sourceText){
 const info=$('speedometerSessionInfo');
 if(!info) return;
 if(!result){ info.textContent=''; info.style.display='none'; return; }
 info.textContent = sourceText || formatActiveResultSource(result, sessionIndex, 'speedometer');
 info.style.display='block';
}

// ─── Utilities ───
function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
// ─── MATH UTILITIES ───────────────────────────────────────────
function clamp(v,lo,hi){ return Math.min(hi,Math.max(lo,v)); }
function mean(a){ return a.length?a.reduce((x,y)=>x+y,0)/a.length:0; }
function stdDev(a){ if(a.length<2) return null; const m=mean(a); return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/(a.length-1)); }
function shuffle(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]; } return a; }
function subjectKey(id){ return id==="0"?"Guest":id; }
function setStatus(m){ statusLine.textContent=m; }
function setFlowDiagnostic(label,statusText){
 try{ if(phaseLabel) phaseLabel.textContent=label||""; }catch(e){}
 try{ if(statusText!=null) setStatus(statusText); }catch(e){}
}
function formatDuration(ms){ if(ms==null) return "—"; const s=Math.round(ms/1000),m=Math.floor(s/60); return m>0?`${m}m ${s%60}s`:`${s}s`; }
function computeTotalTrialPresentations(result){
 const logCount = Array.isArray(result&&result.rtLog) ? result.rtLog.length : 0;
 if(logCount>0) return logCount;
 const mode = (result&&result.testMode)||"mode1";
 const selfPaced = Number(result&&result.selfPacedResponseCount)||0;
 const pacedPresented = Number(result&&result.fixedPacedPresented)||0;
 const pacedDerived = Math.max(0,(Number(result&&result.pacedResponseCount)||0)+(Number(result&&result.pacedErrors)||0)+(Number(result&&result.missedTrials)||0));
 if(mode==="mode4"){
  return selfPaced + (Number(result&&result.mode4SustainedPresented)||0) + (Number(result&&result.mode4FinalTrialsPresented)||0) + Math.max(pacedPresented,pacedDerived,Number(result&&result.totalTrials)||0);
 }
 if(mode==="mode3") return selfPaced + Math.max(pacedPresented,pacedDerived);
 if(mode==="mode2") return selfPaced;
 return selfPaced + Math.max(Number(result&&result.totalTrials)||0,pacedDerived);
}
// Mode helpers centralize mode checks so start / finish / summary logic
// can switch cleanly between CogSpeed, SPC, and SPCMP behavior.
function isMode1(){ return (settings.testMode||"mode1")==="mode1"; }
function isMode2(){ return (settings.testMode||"mode1")==="mode2"; }
function isMode3(){ return (settings.testMode||"mode1")==="mode3"; }
function isMode4(){ return (settings.testMode||"mode1")==="mode4"; }
function currentModeLabel(){ return isMode1() ? "Mode 1 CogSpeed Adaptive" : isMode2() ? "Mode 3 Self-paced" : isMode3() ? "Mode 4 Machine-Paced" : "Mode 2 CogSpeed Sustained"; }
function getEffectiveTimeFormat(){ return String(settings.timeFormat||"12") === "24" ? "24" : "12"; }
function getSessionMaxDurationMs(){ return isMode2() ? (Number(settings.mode2MaxDurationMs)||120000) : isMode3() ? (Number(settings.mode3MaxDurationMs)||120000) : (Number(settings.maxTestDurationMs)||150000); }

// Timing diagnostics are observational only. They do NOT affect pacing or scoring.
function beginFrameTiming(targetMs, phase){
 state.activeFrameTiming = {
  phase,
  targetMs:Number(targetMs)||0,
  frameStartedAt:null,
  scheduledEndAt:null,
  lastRafAt:null,
  rafIntervals:[]
 };
}
function noteFrameTimingStart(startAt){
 if(!state.activeFrameTiming) return;
 state.activeFrameTiming.frameStartedAt = startAt;
 state.activeFrameTiming.scheduledEndAt = startAt + (Number(state.activeFrameTiming.targetMs)||0);
 state.activeFrameTiming.lastRafAt = startAt;
}
function noteFrameTimingRaf(now){
 const ft=state.activeFrameTiming; if(!ft||ft.frameStartedAt==null) return;
 if(ft.lastRafAt!=null){
  const delta=now-ft.lastRafAt;
  if(isFinite(delta)&&delta>=0) ft.rafIntervals.push(delta);
 }
 ft.lastRafAt=now;
}
function summarizeFrameTiming(ft, actualAtMs){
 if(!ft||ft.frameStartedAt==null) return null;
 const actualAt = Number.isFinite(actualAtMs) ? actualAtMs : performance.now();
 const targetMs = Number(ft.targetMs)||0;
 const frameAge = Math.max(0, actualAt - ft.frameStartedAt);
 const overshoot = Math.max(0, actualAt - (ft.scheduledEndAt!=null ? ft.scheduledEndAt : (ft.frameStartedAt + targetMs)));
 const intervals = Array.isArray(ft.rafIntervals) ? ft.rafIntervals.filter(v=>isFinite(v)&&v>=0) : [];
 return {
  targetFrameMs: Math.round(targetMs),
  frameAgeMs: Math.round(frameAge),
  frameOvershootMs: Math.round(overshoot),
  rafSamples: intervals.length,
  meanRafIntervalMs: intervals.length ? Number(mean(intervals).toFixed(2)) : null,
  maxRafIntervalMs: intervals.length ? Number(Math.max(...intervals).toFixed(2)) : null
 };
}
function harvestActiveFrameTiming(actualAtMs){
 const ft=state.activeFrameTiming;
 const summary=summarizeFrameTiming(ft, actualAtMs);
 state.activeFrameTiming=null;
 if(summary){
  if(summary.frameOvershootMs!=null&&isFinite(summary.frameOvershootMs)) state.frameOvershootLog.push(summary.frameOvershootMs);
  if(summary.meanRafIntervalMs!=null&&isFinite(summary.meanRafIntervalMs)) state.rafIntervalLog.push(summary.meanRafIntervalMs);
  if(summary.maxRafIntervalMs!=null&&isFinite(summary.maxRafIntervalMs)) state.rafIntervalLog.push(summary.maxRafIntervalMs);
 }
 return summary;
}

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
function computeSPI(correctCount,totalTrials){
 const total=Math.max(1, Number(totalTrials)||0);
 const csr=Math.max(0, Number(correctCount)||0);
 return Math.max(0, Math.min(100, (csr/total)*100));
}
function getMode4SblpMsFromState(){
 return state.mode4SustainedCorrectRTs.length ? mean(state.mode4SustainedCorrectRTs) : 0;
}
function getMode4CsrCountFromState(){
 return Math.max(0, Number(state.mode4SustainedCorrect)||0);
}
function updateCPIDisplay(avg){
 if(isMode2()||isMode3()){
  cpiOut.textContent=avg!=null?`${Math.round(avg)}ms`:"—";
  return;
 }
 if(isMode4()){
  const spi = state.mode4Triggered ? computeSPI(state.mode4SustainedCorrect, Number(settings.mode4SustainedTrialCount)||20) : null;
  cpiOut.textContent=spi!=null?Number(spi).toFixed(0):"—";
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
function clearMaxTestTimer(){ if(state.maxTestTimer) clearTimeout(state.maxTestTimer); state.maxTestTimer=null; state.maxTestDeadlineMs=null; }
function suspendMaxTestTimer(){
 const now=performance.now();
 const remaining = state.maxTestDeadlineMs!=null ? Math.max(0, state.maxTestDeadlineMs-now) : (Number(state.maxTestRemainingMs)||0);
 clearMaxTestTimer();
 state.maxTestRemainingMs = remaining;
}
function resumeMaxTestTimer(){
 const remaining = Math.max(0, Number(state.maxTestRemainingMs)||0);
 if(remaining<=0) return;
 armMaxTestTimer(remaining);
}
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
  case "paced_fixed":
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
function armMaxTestTimer(msOverride){
 clearMaxTestTimer();
 const baseMs = Number.isFinite(Number(msOverride)) ? Number(msOverride) : (state.maxTestRemainingMs!=null ? Number(state.maxTestRemainingMs) : getSessionMaxDurationMs());
 const ms=Math.max(0, baseMs);
 state.maxTestRemainingMs = ms;
 state.maxTestDeadlineMs = performance.now()+ms;
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
  .gear-img-wrap.gspin-f img{ animation:gSpinF 1.4s linear infinite; }
  .gear-img-wrap.gspin-r img{ animation:gSpinR 1.4s linear infinite; }
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
   const scale = size==="probe" ? 0.64 : 0.60;
   const dotR = size==="probe" ? 13 : 11;
   const lw  = size==="probe" ? 15 : 13;
   const lh  = size==="probe" ? 38 : 30;
   pattern.forEach(([k,px,py], idx)=>{
    const left = 50 + ((px/100)-0.5) * scale * 100;
    const top = 50 + ((py/100)-0.5) * scale * 100;
    if(k==="dot"){
     marks.push(`<div class="gear-mark dot" style="left:${left.toFixed(1)}%;top:${top.toFixed(1)}%;width:${dotR*2}px;height:${dotR*2}px"></div>`);
    } else {
     marks.push(`<div class="gear-mark line" style="left:${left.toFixed(1)}%;top:${top.toFixed(1)}%;width:${lw}px;height:${lh}px"></div>`);
    }
   });
  }
  return `<div class="gear-img-wrap ${spinClass||""}">
   <img src="${GEAR_IMAGE_SRCS[si]}" alt="gear ${si}" draggable="false"/>
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
   if(k==="dot") return `<circle cx="${ix.toFixed(1)}" cy="${iy.toFixed(1)}" r="${dotR}" fill="white" stroke="black" stroke-width="3" opacity="0.95"/>`;
   return `<rect x="${(ix-lw/2).toFixed(1)}" y="${(iy-lh/2).toFixed(1)}" width="${lw}" height="${lh}" rx="2.5" fill="white" stroke="black" stroke-width="3" opacity="0.95"/>`;
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
function logTrial({phase,rt,outcome,responseIndex,counted,timing,pacing}){
 const trial=state.current; if(!trial) return;
 const ci=trial.topItems[trial.correctPos];
 const ri=responseIndex!=null?trial.topItems[responseIndex]:null;
 const loggedDurationMs = (
  phase==="paced" || phase==="paced_wrong" || phase==="paced_late_correct" || phase==="paced_late_wrong" || phase==="missed" || phase==="paced_fixed" || phase==="paced_fixed_wrong" || phase==="paced_fixed_missed"
 ) ? (state.presentedRoundDuration!=null ? state.presentedRoundDuration : (state.duration?Math.round(state.duration):null))
   : (state.duration?Math.round(state.duration):null);
 state.rtLog.push({
  seq:state.rtLog.length+1, phase, clockTime:new Date().toISOString(),
  durationMs:loggedDurationMs,
  rt:rt!=null?Math.round(rt):null, outcome,
  probe:`${trial.probeFamily}:${trial.probeCount}`,
  correctCell:ci?`${ci.family}:${ci.count} @${trial.correctPos+1}`:"—",
  response:ri?`${ri.family}:${ri.count} @${responseIndex+1}`:(responseIndex!=null?`pos${responseIndex+1}`:"no_response"),
  warmup: counted===false,
  counted,
  targetFrameMs: timing&&timing.targetFrameMs!=null ? timing.targetFrameMs : null,
  frameAgeMs: timing&&timing.frameAgeMs!=null ? timing.frameAgeMs : null,
  frameOvershootMs: timing&&timing.frameOvershootMs!=null ? timing.frameOvershootMs : null,
  rafSamples: timing&&timing.rafSamples!=null ? timing.rafSamples : null,
  meanRafIntervalMs: timing&&timing.meanRafIntervalMs!=null ? timing.meanRafIntervalMs : null,
  maxRafIntervalMs: timing&&timing.maxRafIntervalMs!=null ? timing.maxRafIntervalMs : null,
  nextRateMs: pacing&&pacing.nextRateMs!=null ? pacing.nextRateMs : null,
  rateChangeMs: pacing&&pacing.rateChangeMs!=null ? pacing.rateChangeMs : null,
  rateChangeReason: pacing&&pacing.rateChangeReason ? pacing.rateChangeReason : ""
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
  const win=Math.max(1,Math.round(Number(settings.rollMeanWindow)||DEFAULTS.rollMeanWindow));
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
// ─── TERMINAL RECOVERY / MODE 4 BRANCH RULE ───────────────────
// maybeTriggerTerminalRule(): fires when 2 consecutive block scores
//  fall within qualifyingBlockGapMs (250ms) of each other.
// Mode 1/2/3 path: enter terminal_recovery and finish after the final
//  self-paced trials.
// Mode 4 path: follow normal Mode 1 adaptive behavior until true
//  convergence is reached. Adaptive-phase failure stops such as
//  no-response timeout, max blocks, and other normal Mode 1 fail paths
//  still apply before convergence. If convergence occurs, branch to the
//  sustained fixed-rate MBS segment using that converged adaptive MBS.
//  Once the sustained segment starts, keep presenting the full sustained
//  trial count before final self-paced trials.
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
  const avg2 = avgLast2Blocks();
  state.terminalBlockReason=`Blocks ${n-1}&${n} within ${settings.qualifyingBlockGapMs}ms (${b1.toFixed(0)}ms,${b2.toFixed(0)}ms,diff=${diff.toFixed(0)}ms)`;
  if(isMode4()) {
   if(avg2==null) return false;
   state.mode4Triggered = true;
   state.mode4AdaptiveMbsMs = avg2;
   state.mode4SustainedPresentationRateMs = avg2;
   state.mode4SustainedPresented = 0;
   state.mode4SustainedCorrect = 0;
   state.mode4SustainedWrong = 0;
   state.mode4SustainedMissed = 0;
   state.mode4SustainedCorrectRTs = [];
   state.mode4FinalTrialsPresented = 0;
   state.mode4FinalCorrect = 0;
   state.mode4FinalWrong = 0;
   state.mode4FinalRTs = [];
   state.phase = "mode4_sustained";
   state.duration = avg2;
   openTrial("mode4_sustained");
   return true;
  }
  state.phase="terminal_recovery"; state.recoveryCorrectCompleted=0; state.spCorrectStreak=0; state.spWrongCount=0;
  openTrial("terminal_recovery"); return true;
 }
 return false;
}
function failCalibration(reason){ state.endReason=reason; finish(); }
// ─── CALIBRATION — SELF-PACED ─────────────────────────────────
// Warm-up trials:
//   initialUnusedCalibrationTrials (default 1) are shown first and never used
//   in averaging or measured-calibration counts.
//
// Measured calibration phase:
//   After warmups, keep presenting self-paced trials until the number of
//   CORRECT measured responses reaches initialMeasuredCalibrationTrials
//   (default 5).
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
//   where f = correctSpeedupFactor (default 0.30)
//
// IMPORTANT:
//   On CORRECT responses that speed up:
//     minimum speedup = minSpeedupOnCorrectMs (default 50 ms)
//     maximum speedup = maxSpeedupOnCorrectMs (default 200 ms)
//   There is no separate speedup path.
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
function calculatePacingTransition(currentDuration,rt,correct){
 if(!isFinite(currentDuration)) return null;
 const before=currentDuration;
 if(correct){
  if(rt==null||!isFinite(rt)) return null;
  const r=rt/before;
  const f = Number(settings.correctSpeedupFactor)||0.30;
  let deltaMs=(f*r-f)*before;

  const minSpeed = Number(settings.minSpeedupOnCorrectMs)||50;
  const maxSpeed = Number(settings.maxSpeedupOnCorrectMs)||200;

  let reason = "Correct response formula";
  if(deltaMs < 0){
    const speedupMag = Math.min(maxSpeed, Math.max(minSpeed, Math.abs(deltaMs)));
    deltaMs = -speedupMag;
    reason = "Correct speedup";
  }else{
    deltaMs = Math.min(100, deltaMs);
    reason = "Correct response slowdown";
  }
  const next=clamp(before+deltaMs,settings.minDurationMs,settings.maxDurationMs);
  return {presentedRateMs:before,nextRateMs:next,rateChangeMs:Math.round(next-before),rateChangeReason:reason};
 }
 const wrongSlow = Number(settings.wrongSlowdownMs)||50;
 const next=clamp(before+wrongSlow,settings.minDurationMs,settings.maxDurationMs);
 return {presentedRateMs:before,nextRateMs:next,rateChangeMs:Math.round(next-before),rateChangeReason:"Wrong slowdown"};
}
function applyPacing(rt,correct){
 const transition = calculatePacingTransition(state.duration, rt, correct);
 if(!transition) return null;
 state.duration = transition.nextRateMs;
 return transition;
}

// ─── Finish ───
// ─── TEST FINISH ──────────────────────────────────────────────
// Called by all end conditions (success + all 8 failure modes).
// Computes final CPI, paced RT stats, test duration.
// Also stamps the session number used by full-size graphs and metadata.
// Saves result to state.history (localStorage: ${STORAGE_PREFIX}_history).
// Triggers gear spin outro → thinking box → outcome box → summary.
// ──────────────────────────────────────────────────────────────
function failOpenResultsHandoff(result, stage, err){
 setFlowDiagnostic(`FINISH_${stage}`, `FINISH ${stage}${err?` ERROR — ${err.message||err}`:''}`);
 try{ clearTimer(); clearNoResponseTimer(); clearMaxTestTimer(); }catch(e){}
 try{ state.phase="finished"; }catch(e){}
 try{ stopFX(); }catch(e){}
 try{ hideAllOverlays(); }catch(e){}
 try{ hardResetCurtainState(true); }catch(e){}
 try{ const ts=$("testScreen"); if(ts) ts.classList.add("hidden"); }catch(e){}
 const fallbackResult = result || {
  testMode: state.activeMode||settings.testMode||"mode1",
  endReason: (state.endReason||"Run complete") + ` [Finish fallback: ${stage}]`,
  cognitivePerformanceIndex: null,
  averageLast2BlockingScoresMs: null,
  mode4Triggered: false,
  time:new Date().toISOString(),
  subjectId:subjectKey(state.subjectId||"0")
 };
 try{
  const st=$("summaryText");
  if(st){
   st.textContent = `CogSpeed finish fallback\nStage: ${stage}\nReason: ${fallbackResult.endReason}\n${err?`Error: ${err.message||err}`:''}`;
  }
 }catch(e){}
 try{
  const outcome=$("outcomeOverlay");
  if(outcome) outcome.classList.remove("hidden");
  syncOutcomeStatusText(fallbackResult);
 }catch(e){}
 try{ renderSpeedometerOutcome(fallbackResult); }catch(e){}
 try{ updateStartPageLinks(); }catch(e){}
}
function finish(){
 clearTimer(); clearNoResponseTimer(); clearMaxTestTimer();
 state.phase="finished";
 let result=null;
 try{
  setFlowDiagnostic("FINISH_COMPUTE", `FINISH_COMPUTE — ${state.endReason||"Run complete"}`);
  const avg2=avgLast2Blocks(), cps=avg2!=null?computeCPI(avg2):null;
  const pacedSd=stdDev(state.pacedRTs);
  const selfPacedSd=stdDev(state.selfPacedRTs);
  const allResponseRTs=[...state.selfPacedRTs, ...state.pacedRTs];
  const allResponseMean=allResponseRTs.length?mean(allResponseRTs):null;
  const allResponseSd=stdDev(allResponseRTs);
  const blockDiff=state.overloads.length>=2?state.overloads[state.overloads.length-1]-state.overloads[state.overloads.length-2]:null;
  const testDurMs=state.testStartTime!=null?performance.now()-state.testStartTime:null;
  const mode4SblpMs = getMode4SblpMsFromState();
  const mode4SustainedTargetCount = Math.max(1, Number(settings.mode4SustainedTrialCount)||10);
  const mode4Spi = isMode4() && state.mode4Triggered ? computeSPI(state.mode4SustainedCorrect, mode4SustainedTargetCount) : null;
  const mode4AdaptiveMbsForCpi = isMode4() ? (state.mode4AdaptiveMbsMs!=null ? state.mode4AdaptiveMbsMs : avg2) : null;
  const modeMetricMs = isMode2() ? (state.selfPacedRTs.length?mean(state.selfPacedRTs):null) : isMode3() ? (state.pacedRTs.length?mean(state.pacedRTs):(state.fixedPacedBaseline||null)) : isMode4() ? mode4AdaptiveMbsForCpi : avg2;
  const modeCPI = (isMode2()||isMode3()) ? null : isMode4() ? (mode4AdaptiveMbsForCpi!=null ? computeCPI(mode4AdaptiveMbsForCpi) : null) : (modeMetricMs!=null ? computeCPI(modeMetricMs) : cps);
  const timingQuality={
   avgFrameOvershootMs: state.frameOvershootLog.length ? Number(mean(state.frameOvershootLog).toFixed(2)) : null,
   maxFrameOvershootMs: state.frameOvershootLog.length ? Number(Math.max(...state.frameOvershootLog).toFixed(2)) : null,
   avgRafIntervalMs: state.rafIntervalLog.length ? Number(mean(state.rafIntervalLog).toFixed(2)) : null,
   maxRafIntervalMs: state.rafIntervalLog.length ? Number(Math.max(...state.rafIntervalLog).toFixed(2)) : null
  };
  result={
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
   sleepSinceLastTest: state.sleepSinceLastTest,
   sleepLog: state.sleepLog ? JSON.parse(JSON.stringify(state.sleepLog)) : null,
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
   mode4Triggered: !!state.mode4Triggered,
   sustainedBlockLimitPerformanceMs: isMode4() && state.mode4Triggered ? mode4SblpMs : null,
   sustainedProcessingIndex: mode4Spi,
   correctSustainedResponses: isMode4() ? getMode4CsrCountFromState() : null,
   mode4AdaptiveMbsMs: state.mode4AdaptiveMbsMs,
   mode4MbsThresholdMs: Number(settings.mode4MbsThresholdMs)||250,
   mode4SustainedTargetCount: isMode4() ? Math.max(1, Number(settings.mode4SustainedTrialCount)||10) : null,
   mode4FinalTrialTargetCount: isMode4() ? Math.max(1, Number(settings.mode4FinalTrialCount)||2) : null,
   mode4SustainedPresentationRateMs: state.mode4SustainedPresentationRateMs,
   mode4SustainedPresented: state.mode4SustainedPresented,
   mode4SustainedCorrect: state.mode4SustainedCorrect,
   mode4SustainedWrong: state.mode4SustainedWrong,
   mode4SustainedMissed: state.mode4SustainedMissed,
   mode4FinalTrialsPresented: state.mode4FinalTrialsPresented,
   mode4FinalCorrect: state.mode4FinalCorrect,
   mode4FinalWrong: state.mode4FinalWrong,
   mode4FinalMeanRtMs: state.mode4FinalRTs.length?mean(state.mode4FinalRTs):null,
   mode4CpiFromCsr: isMode4() && state.mode4Triggered ? modeCPI : null,
   mode4TimingSummary: isMode4() ? computeMode4TimingSummary({rtLog:[...state.rtLog], testDurationMs:testDurMs}) : null,
   rtLog:[...state.rtLog], endReason:state.endReason||"Run complete",
   time:new Date().toISOString(), geo:state.geo, timingQuality
  };
  setActiveResultContext(result, null, "computed result");
  if(result.sleepSinceLastTest==="yes" && result.sleepLog){
   const wakeIso = deriveWakeDateTimeIso(result.sleepLog.wakeTime, result.time);
   if(wakeIso) result.sleepLog.wakeDateTimeIso = wakeIso;
  }
 }catch(err){
  console.error("finish compute failed", err);
  failOpenResultsHandoff(result, "COMPUTE", err);
  return;
 }
 try{
  setFlowDiagnostic("FINISH_SAVE", `FINISH_SAVE — ${result.endReason||"Run complete"}`);
  state.history.push(result);
  localStorage.setItem(`${STORAGE_PREFIX}_history`,JSON.stringify(state.history));
  setActiveResultContext(result, state.history.length-1, "saved history");
  try{ updateStartPageLinks(); }catch(e){}
 }catch(err){
  console.error("finish save failed", err);
  try{ if(state.history[state.history.length-1]===result) state.history.pop(); }catch(e){}
 }
 try{ updateCPIDisplay(avgLast2Blocks()); setProbeIdle(); }catch(e){}
 try{
  setFlowDiagnostic("FINISH_RENDER", `FINISH_RENDER — ${result.endReason||"Run complete"}`);
  buildSummary(result);
  applySummarySourceDiagnostic(result, state.activeSessionIndex, state.activeResultSource);
  state.lastResultText = $("summaryText") ? $("summaryText").textContent : "";
 }catch(err){
  console.error("finish render failed", err);
  try{
   const st=$("summaryText");
   if(st) st.textContent=`CogSpeed summary fallback\nReason: ${result.endReason||"Run complete"}\nRender error: ${err.message||err}`;
   state.lastResultText = st ? st.textContent : "";
  }catch(_e){}
 }
 try{
  setFlowDiagnostic("FINISH_SHOW", `FINISH_SHOW — ${result.endReason||"Run complete"}`);
  showResultsPage(result);
 }catch(err){
  console.error("finish show failed", err);
  failOpenResultsHandoff(result, "SHOW", err);
 }
}


// ─── Open trial ───
// ─── TRIAL LIFECYCLE ──────────────────────────────────────────
// openTrial(): opens one trial for calibration/paced/recovery/terminal.
//  Sets testStartTime on first call (starts the settings-based max total test timer).
//  Sets paced frame timer (onPacedFrameEnd) for machine-paced trials.
// onPacedFrameEnd(): fires when paced frame expires (subject missed or
//  wrong). Increments miss streak → triggers block if ≥2 true misses.
// ──────────────────────────────────────────────────────────────


function openTrial(kind){
 clearTimer();
 clearNoResponseTimer();
 normalizeCurtainForTesting();

 // Track overall test duration from very first trial
 if(state.testStartTime===null){
  state.testStartTime=performance.now();
  state.maxTestRemainingMs = getSessionMaxDurationMs();
  armMaxTestTimer(); // wall clock covers entire test including calibration unless suspended in Mode 4 sustained phase
 }

 state.previous=state.current;
 const lastPos=state.current?state.current.correctPos:null;
 const lastProbe=state.current?{family:state.current.probeFamily,count:state.current.probeCount}:null;
 state.current=makeTrial(kind,lastPos,lastProbe);
 state.hadResponse=false;

 // IMPORTANT:
 // Do not start timing until the display has actually rendered.
 // If a tap arrives before trialOpenedAt is set, RT is clamped safely to 0 instead of producing a huge bogus value.
 state.trialOpenedAt=null;

 renderTrial(state.current);
 updateMetrics();
 try{ setFlowDiagnostic("TRIAL", `${String(kind||"trial").toUpperCase()} — awaiting response`); }catch(e){}

 if(kind==="calibration"){
  const total=isMode2()?(Number(settings.mode2TrialLimit)||150):isMode3()?((Number.isFinite(Number(settings.initialUnusedCalibrationTrials))?Number(settings.initialUnusedCalibrationTrials):1)+(Number(settings.mode3CalibrationTrials)||10)):((Number.isFinite(Number(settings.initialUnusedCalibrationTrials))?Number(settings.initialUnusedCalibrationTrials):1)+(Number(settings.initialMeasuredCalibrationTrials)||7)), idx=state.calibrationTrialIndex+1;
  phaseLabel.textContent=`Cal ${idx}/${total}`;
  const warmupLimit = Number.isFinite(Number(settings.initialUnusedCalibrationTrials)) ? Number(settings.initialUnusedCalibrationTrials) : 1;
  setStatus((isMode1() || isMode4()) ? (idx<=warmupLimit?"Self-paced (unused)":"Self-paced (measured)") : "Self-paced");
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
 }else if(kind==="mode4_sustained"){
  if(state.maxTestTimer) suspendMaxTestTimer();
  state.presentedRoundDuration = Math.round(state.duration);
  state.mode4SustainedPresented += 1;
  phaseLabel.textContent=`Mode 4 Sustained MBS · ${Math.round(state.duration)}ms`;
  setStatus("Mode 4 sustained MBS trials at fixed presentation rate");
 }else if(kind==="recovery"){
  clearTimer();
  state.duration=null; state.lastFrameDuration=null; state.presentedRoundDuration=null;
  phaseLabel.textContent=`SP Restart ${state.spCorrectStreak}✓ ${state.spWrongCount}✗`;
  setStatus(`SP Restart — need ${settings.spRestartCorrectStreak} correct in a row`);
 }else if(kind==="terminal_recovery"){
  clearTimer();
  state.duration=null; state.lastFrameDuration=null; state.presentedRoundDuration=null;
  const finalNeed=2;
  phaseLabel.textContent=`Final SP ${state.recoveryCorrectCompleted+1}/${finalNeed}`;
  setStatus(`Final SP — complete ${finalNeed} trials to finish`);
 }else if(kind==="mode4_final"){
  clearTimer();
  if(state.mode4FinalTrialsPresented===0 && !state.maxTestTimer) resumeMaxTestTimer();
  state.duration=null; state.lastFrameDuration=null; state.presentedRoundDuration=null;
  const need=Math.max(1, Number(settings.mode4FinalTrialCount)||2);
  phaseLabel.textContent=`Mode 4 Final ${state.mode4FinalTrialsPresented+1}/${need}`;
  setStatus(`Mode 4 final self-paced trials — ${state.mode4FinalTrialsPresented}/${need} completed (overall max time still applies)`);
 }

 // Arm timers only after the display is fully rendered.
 requestAnimationFrame(()=>{
  requestAnimationFrame(()=>{
   state.trialOpenedAt = performance.now();

   if(kind==="calibration"){
    armNoResponseTimer();
   }else if(kind==="paced" || kind==="paced_fixed" || kind==="mode4_sustained"){
    const targetMs = state.duration;
    const frameStart = state.trialOpenedAt;
    beginFrameTiming(targetMs, kind);
    noteFrameTimingStart(frameStart);
    function checkFrame(){
     const now = performance.now();
     noteFrameTimingRaf(now);
     if(now - frameStart >= targetMs){
      onPacedFrameEnd(now);
      return;
     }
     state.trialTimer = requestAnimationFrame(checkFrame);
    }
    state._trialTimerIsRaf = true;
    state.trialTimer = requestAnimationFrame(checkFrame);
   }else if(kind==="recovery" || kind==="terminal_recovery"){
    armNoResponseTimer();
   }else if(kind==="mode4_final"){
    clearNoResponseTimer();
   }
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

 logTrial({phase:"missed",rt:null,outcome:"missed",responseIndex:null,timing:pm.timing||null});
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

  if(maybeTriggerTerminalRule()) return true;

  const maxB = Math.max(2, Number(settings.maxBlockCount) || 6);
  if(state.overloads.length >= maxB){
   state.endReason = "ERRATIC RESPONSES — Retest";
   finish();
   return true;
  }

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
 const pacing = p.correct ? applyPacing(p.effectiveRt, true) : applyPacing(null, false);
 if(p.logSeq && pacing){
  const row = state.rtLog.find(x=>x.seq===p.logSeq);
  if(row){
   row.nextRateMs = pacing.nextRateMs;
   row.rateChangeMs = pacing.rateChangeMs;
   row.rateChangeReason = pacing.rateChangeReason + " (applied after late hold)";
  }
 }
}

function onPacedFrameEnd(actualNow){
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
if(state.phase==="mode4_sustained"){
  const truelyMissed=state.current&&!state.current.resolved&&!state.hadResponse;
  if(truelyMissed){
   logTrial({phase:"mode4_sustained_missed",rt:null,outcome:"missed",responseIndex:null});
   state.missedTrials+=1;
   state.mode4SustainedMissed+=1;
  }
  const limit=Math.max(1, Number(settings.mode4SustainedTrialCount)||10);
  if(state.mode4SustainedPresented >= limit){
   state.phase="mode4_final";
   state.mode4FinalTrialsPresented=0;
   openTrial("mode4_final");
   return;
  }
  openTrial("mode4_sustained");
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
 const frameTiming = harvestActiveFrameTiming(performance.now());

 const truelyMissed=state.current&&!state.current.resolved&&!state.hadResponse;
 if(truelyMissed){
  // Do NOT count this as a real miss yet.
  // Keep it pending so the NEXT frame can retroactively claim it if the first tap on the
  // next frame arrives in < lateResponseThresholdMs (default 600 ms).
  // Until then, this frame is only an APPARENT miss, not yet a TRUE miss.
  state.pendingPriorMiss = {
   trial: state.current,
   durationMs: state.presentedRoundDuration!=null ? state.presentedRoundDuration : (state.duration?Math.round(state.duration):null),
   timing: frameTiming
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
 if(!["calibration","paced","paced_fixed","mode4_sustained","recovery","terminal_recovery","mode4_final"].includes(state.phase)) return;
 noteAnyResponse();

 // Calibration
 if(state.phase==="calibration"){
  const rt=getSafeTrialRtMs(eventTimeStamp), ok=trialMatches(state.current,index);
  flashBtn(index,ok); state.totalResponses+=1;

  const warmups = Number.isFinite(Number(settings.initialUnusedCalibrationTrials)) ? Number(settings.initialUnusedCalibrationTrials) : 1;
  const measuredTargetMode1 = Number(settings.initialMeasuredCalibrationTrials)||7;
  const includeInAverages = state.calibrationTrialIndex>=warmups;

  // Warm-up exclusion applies across all modes:
  // warmups never contribute to averages/calculations.
  if(includeInAverages) state.selfPacedRTs.push(rt);
  if(ok){ state.totalCorrect+=1; if(includeInAverages) state.selfPacedCorrect+=1; } else { state.totalIncorrect+=1; if(includeInAverages) state.selfPacedWrong+=1; }

  logTrial({phase:"calibration",rt,outcome:includeInAverages?(ok?"correct":"wrong"):"Warmup",responseIndex:index,counted:includeInAverages});

  if(isMode1() || isMode4()){
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
    // blockRestartPercent defaults to 1.3, so restart is 30% slower than block baseline.
    const restartBaseMs=Number(state.blockRestartBaseline)||Number(state.blockDuration)||0;
    const restartFactor=Number(settings.blockRestartPercent)||1.3;
    const slower=clamp(Math.round(restartBaseMs*restartFactor),settings.minDurationMs,settings.maxDurationMs);
    state.recoveries.push(slower); state.phase="paced"; state.duration=slower;
    state.spCorrectStreak=0; state.spWrongCount=0;
    setStatus(`Block recovery passed — resuming at ${slower.toFixed(0)}ms (${restartFactor}× block baseline)`);
    setTimeout(()=>openTrial("paced"), Number(settings.ResumeToPacedDelayMs)||0);
   }else{
    setStatus(`SP Restart: ${state.spCorrectStreak}/${need} correct`);
    setTimeout(()=>openTrial("recovery"), Number(settings.RecoveryInterTrialDelayMsStart)||0);
   }
  }else{
   state.spCorrectStreak=0; state.spWrongCount+=1; state.recoveryErrors+=1;
   const limit=Math.max(1,Number(settings.spRestartWrongLimit)||3);
   if(state.spWrongCount>=limit){ state.endReason=`FAILED: reached SP restart wrong-tap limit (${limit})`; finish(); return; }
   setStatus(`SP Restart: ${state.spWrongCount}/${limit} wrong`);
   setTimeout(()=>openTrial("recovery"), Number(settings.RecoveryInterTrialDelayMsStart)||0);
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
  state.current.resolved=true;
  state.recoveryCorrectCompleted+=1;
  const need=2;
  if(state.recoveryCorrectCompleted>=need){ state.endReason=`Convergent blocks — ${state.terminalBlockReason||"2 consecutive blocks within threshold"}. Completed ${need} final trials.`; finish(); return; }
  setTimeout(()=>openTrial("terminal_recovery"), Number(settings.RecoveryInterTrialDelayMsStart)||0);
  return;
 }

 // Mode 3 fixed machine-paced
 if(state.phase==="paced_fixed"){
  const rt=getSafeTrialRtMs(eventTimeStamp);
  const timingSummary = harvestActiveFrameTiming(performance.now());
  if(state.current&&!state.current.resolved&&trialMatches(state.current,index)){
   state.current.resolved=true; state.totalResponses+=1; state.totalCorrect+=1; state.fixedPacedCorrect+=1; state.pacedRTs.push(rt);
   logTrial({phase:"paced_fixed",rt,outcome:"correct",responseIndex:index,timing:timingSummary,pacing:{nextRateMs:state.duration,rateChangeMs:0,rateChangeReason:"Fixed machine-paced"}}); flashBtn(index,true);
   if(state.fixedPacedPresented >= (Number(settings.mode3PacedTrialLimit)||140)){ state.endReason="Required responses reached"; finish(); return; }
   openTrial("paced_fixed"); return;
  }
  state.hadResponse=true;
  state.totalResponses+=1; state.totalIncorrect+=1; state.pacedErrors+=1; state.fixedPacedWrong+=1;
  if(checkMaxPacedWrong()) return;
  logTrial({phase:"paced_fixed_wrong",rt,outcome:"wrong",responseIndex:index,timing:timingSummary,pacing:{nextRateMs:state.duration,rateChangeMs:0,rateChangeReason:"Fixed machine-paced"}});
  flashBtn(index,false);
  if(state.fixedPacedPresented >= (Number(settings.mode3PacedTrialLimit)||140)){ state.endReason="Required responses reached"; finish(); return; }
  openTrial("paced_fixed"); return;
 }

 if(state.phase==="mode4_sustained"){
  const rt=getSafeTrialRtMs(eventTimeStamp);
  const timingSummary = harvestActiveFrameTiming(performance.now());
  const limit=Math.max(1, Number(settings.mode4SustainedTrialCount)||10);
  if(state.current&&!state.current.resolved&&trialMatches(state.current,index)){
   state.current.resolved=true; state.totalResponses+=1; state.totalCorrect+=1; state.mode4SustainedCorrect+=1; state.pacedRTs.push(rt); state.mode4SustainedCorrectRTs.push(rt);
   logTrial({phase:"mode4_sustained",rt,outcome:"correct",responseIndex:index,timing:timingSummary,pacing:{nextRateMs:state.duration,rateChangeMs:0,rateChangeReason:"Mode 4 sustained fixed MBS"}});
   flashBtn(index,true);
   if(state.mode4SustainedPresented >= limit){ state.phase="mode4_final"; state.mode4FinalTrialsPresented=0; openTrial("mode4_final"); return; }
   openTrial("mode4_sustained"); return;
  }
  state.hadResponse=true;
  state.totalResponses+=1; state.totalIncorrect+=1; state.pacedErrors+=1; state.mode4SustainedWrong+=1;
  if(checkMaxPacedWrong()) return;
  logTrial({phase:"mode4_sustained_wrong",rt,outcome:"wrong",responseIndex:index,timing:timingSummary,pacing:{nextRateMs:state.duration,rateChangeMs:0,rateChangeReason:"Mode 4 sustained fixed MBS"}});
  flashBtn(index,false);
  if(state.mode4SustainedPresented >= limit){ state.phase="mode4_final"; state.mode4FinalTrialsPresented=0; openTrial("mode4_final"); return; }
  openTrial("mode4_sustained"); return;
 }

 if(state.phase==="mode4_final"){
  clearTimer();
  const rt=getSafeTrialRtMs(eventTimeStamp), ok=trialMatches(state.current,index);
  flashBtn(index,ok); state.totalResponses+=1; state.mode4FinalTrialsPresented+=1; state.mode4FinalRTs.push(rt);
  if(ok){ state.totalCorrect+=1; state.mode4FinalCorrect+=1; }
  else { state.totalIncorrect+=1; state.mode4FinalWrong+=1; }
  logTrial({phase:"mode4_final",rt,outcome:ok?"correct":"wrong",responseIndex:index});
  const need=Math.max(1, Number(settings.mode4FinalTrialCount)||2);
  if(state.mode4FinalTrialsPresented>=need){
   state.endReason=`Mode 4 sustained MBS segment complete. Presented ${Math.max(1, Number(settings.mode4SustainedTrialCount)||10)} sustained trial(s) at ${state.mode4SustainedPresentationRateMs!=null?Math.round(state.mode4SustainedPresentationRateMs):"—"} ms, CSR ${state.mode4SustainedCorrect||0}, and ${need} final self-paced trial(s).`;
   finish(); return;
  }
  openTrial("mode4_final");
  return;
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
   logTrial({phase:"paced_late_correct",rt:eRT,outcome:"correct",responseIndex:index,timing:state.pendingPriorMiss?.timing||null});
   const lateLogSeq = state.rtLog.length ? state.rtLog[state.rtLog.length-1].seq : null;
   state.current = savedCurrent;
   state.presentedRoundDuration = savedPresented;

   flashBtn(index,true);
   if(recordAnswer(true)) return;
   state.pendingLatePacing = {correct:true, effectiveRt:eRT, logSeq:lateLogSeq};
  }else{
   state.totalIncorrect += 1;
   state.pacedErrors += 1;
   if(checkMaxPacedWrong()) return;

   const savedCurrent = state.current;
   const savedPresented = state.presentedRoundDuration;
   state.current = prior;
   state.presentedRoundDuration = priorDur;
   logTrial({phase:"paced_late_wrong",rt:rt,outcome:"wrong",responseIndex:index,timing:state.pendingPriorMiss?.timing||null});
   const lateLogSeq = state.rtLog.length ? state.rtLog[state.rtLog.length-1].seq : null;
   state.current = savedCurrent;
   state.presentedRoundDuration = savedPresented;

   flashBtn(index,false);
   if(recordAnswer(false)) return;
   state.pendingLatePacing = {correct:false, logSeq:lateLogSeq};
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
 const frameTiming = harvestActiveFrameTiming(performance.now());

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
  const pacing = applyPacing(rt,true); state.pacedRTs.push(rt);
  logTrial({phase:"paced",rt,outcome:"correct",responseIndex:index,timing:frameTiming,pacing}); flashBtn(index,true);
  recordAnswer(true); return;
 }

 state.hadResponse=true;
 state.totalResponses+=1; state.totalIncorrect+=1; state.pacedErrors+=1;
 if(checkMaxPacedWrong()) return;
 const pacing = applyPacing(null,false);
 logTrial({phase:"paced_wrong",rt,outcome:"wrong",responseIndex:index,timing:frameTiming,pacing});
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
function readAdmin(){ for(const [k,,t] of ADMIN_FIELDS){ const el=$("adm_"+k); if(!el) continue; settings[k]=(String(t).startsWith("select:")||t==="text") ? el.value : Number(el.value); } }
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
function configureHiDPICanvas(canvas, fallbackW, fallbackH){
 if(!canvas) return null;
 const dpr = window.devicePixelRatio || 1;
 const cssW = Math.max(320, Math.round(canvas.clientWidth || canvas.offsetWidth || fallbackW || 900));
 const cssH = Math.max(220, Math.round(canvas.clientHeight || fallbackH || 520));
 canvas.width = Math.round(cssW * dpr);
 canvas.height = Math.round(cssH * dpr);
 const ctx = canvas.getContext("2d");
 ctx.setTransform(dpr,0,0,dpr,0,0);
 return {ctx, W:cssW, H:cssH};
}

function drawRTScatterChart(canvas,rtLog,blocks,meanRT,sdRT){
 if(!canvas||!rtLog.length) return;
 const cfg = configureHiDPICanvas(canvas, 900, 360);
 if(!cfg) return;
 const {ctx,W,H} = cfg;
 ctx.clearRect(0,0,W,H); ctx.fillStyle="#081321"; ctx.fillRect(0,0,W,H);
 const PAD={top:20,right:20,bottom:42,left:48},cW=W-PAD.left-PAD.right,cH=H-PAD.top-PAD.bottom;
 const rts=rtLog.filter(e=>e.rt!=null).map(e=>e.rt);
 if(!rts.length) return;
 const maxRT=Math.ceil(Math.max(...rts,1000)/500)*500;
 const minRT=Math.max(0,Math.floor(Math.min(...rts)/500)*500);
 const n=rtLog.length;
 function xO(i){ return PAD.left+(i/(n-1||1))*cW; }
 function yO(v){ return PAD.top+((v-minRT)/((maxRT-minRT)||1))*cH; }
 ctx.strokeStyle="rgba(79,111,153,0.2)"; ctx.lineWidth=1;
 [250,500,750,1000,1500,2000,2500,3000].filter(v=>v>=minRT&&v<=maxRT+100).forEach(v=>{
  const y=yO(v);
  ctx.beginPath(); ctx.moveTo(PAD.left,y); ctx.lineTo(PAD.left+cW,y); ctx.stroke();
  ctx.fillStyle="#7fa0c0"; ctx.font="9px sans-serif"; ctx.textAlign="right";
  ctx.fillText(`${v}ms`,PAD.left-3,y+3);
 });
 const colorMap={correct:"#00ff88",wrong:"#ff4466",missed:"#888",paced:"#00ff88",paced_wrong:"#ff4466","paced_late_correct":"#ffff00","paced_late_wrong":"#ff8800",calibration:"#88aaff",recovery:"#ffaa00",terminal_recovery:"#ff88ff",mode4_sustained:"#57ff9f",mode4_sustained_wrong:"#ff6b81",mode4_final:"#7fd7ff"};
 const pts=rtLog.map((e,i)=>e&&e.rt!=null?{e,x:xO(i),y:yO(e.rt)}:null).filter(Boolean);
 if(pts.length){
  ctx.strokeStyle="rgba(127,215,255,0.55)";
  ctx.lineWidth=1.5;
  ctx.beginPath();
  pts.forEach((p,i)=>{ if(i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y); });
  ctx.stroke();
 }
 pts.forEach(p=>{
  ctx.fillStyle=colorMap[p.e.phase]||colorMap[p.e.outcome]||"#aaa";
  ctx.beginPath(); ctx.arc(p.x,p.y,3,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle="rgba(8,19,33,0.9)"; ctx.lineWidth=1; ctx.stroke();
 });
 if(meanRT){
  ctx.strokeStyle="rgba(127,215,255,0.85)";
  ctx.lineWidth=1.5;
  ctx.setLineDash([4,3]);
  ctx.beginPath(); ctx.moveTo(PAD.left,yO(meanRT)); ctx.lineTo(PAD.left+cW,yO(meanRT)); ctx.stroke();
  ctx.setLineDash([]);
 }
 const legendItems=[
  {label:"Correct", color:"#00ff88"},
  {label:"Wrong", color:"#ff4466"},
  {label:"Missed", color:"#888888"},
  {label:"Mean RT", color:"rgba(127,215,255,0.85)", line:true}
 ];
 let lx=PAD.left, ly=H-14;
 ctx.font="10px sans-serif"; ctx.textAlign="left"; ctx.textBaseline="middle";
 legendItems.forEach(item=>{
  if(item.line){
   ctx.strokeStyle=item.color; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(lx+12,ly); ctx.stroke();
  }else{
   ctx.fillStyle=item.color; ctx.beginPath(); ctx.arc(lx+6,ly,3,0,Math.PI*2); ctx.fill();
  }
  ctx.fillStyle="#9fb9d6"; ctx.fillText(item.label, lx+16, ly);
  lx += 16 + ctx.measureText(item.label).width + 18;
 });
 ctx.fillStyle="#7fa0c0"; ctx.font="9px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="alphabetic";
 ctx.fillText("Trial →",PAD.left+cW/2,H-26);
}

// Mode 2 / Mode 3 result chart:
// green dots = correct responses
// red dots   = wrong responses
// Mode 2 graphs self-paced responses only.
// Mode 3 graphs self-paced + fixed machine-paced responses.
// Mode 2 / Mode 3 response-time graph
// - full graph shows session number once in subtitle
// - smaller ms = better performance and graphs higher
// - avoid duplicate mode / SP-FS labels on full graph

function drawModeResultChart(canvas, result){
 const log=Array.isArray(result&&result.rtLog)?result.rtLog:[];
 const meanRT=result&&result.allResponseMeanMs!=null?result.allResponseMeanMs:(log.filter(e=>e&&e.rt!=null).length?mean(log.filter(e=>e&&e.rt!=null).map(e=>Number(e.rt))):null);
 const blocks=result&&Array.isArray(result.blocks)?result.blocks:[];
 drawRTScatterChart(canvas, log, blocks, meanRT, result&&result.allResponseSdMs!=null?result.allResponseSdMs:null);
}

function getResponseGraphPhaseLegendText(result){
 if(!result) return "Includes phases: none";
 if(result.testMode==="mode1") return "Includes phases: paced, paced_wrong, paced_late_correct, paced_late_wrong, missed.";
 if(result.testMode==="mode2") return "Includes phases: calibration only.";
 if(result.testMode==="mode3") return "Includes phases: calibration, paced_fixed, paced_fixed_wrong, paced_fixed_missed.";
 if(result.testMode==="mode4") return "Includes phases: calibration, adaptive paced trials, sustained MBS trials, and final self-paced trials.";
 return "Includes phases: paced family only.";
}

function formatModeTag(mode){
 const labels={mode1:"Mode 1 CogSpeed Adaptive",mode2:"Mode 3 Self-paced",mode3:"Mode 4 Machine-Paced",mode4:"Mode 2 CogSpeed Sustained"};
 return labels[mode||"mode1"] || (mode||"mode1").replace("mode","Test Mode ");
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
// exportCSV(): downloads history as ${STORAGE_PREFIX}_history.csv
//  Columns: session, subjectId, date, SP-FS, calibration, blocks,
//  CPI, taps, correct, wrong, missed, paced stats, duration, end reason.
// emailResults(): opens mailto: with last result text in body.
// ──────────────────────────────────────────────────────────────

function csvCell(v){
 const s = v==null ? "" : String(v);
 return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
}

function exportCSV(){
 const h=state.history; if(!h.length){setStatus("No history to export."); return;}
 const cols=["session","testMode","subjectId","date","samnPerelli","calibAvgMs","blocks",
  "avgLast2Ms","blockDiffMs","cpi","totalTaps","correct","wrong","missed","sblpMs","spi","csr","mode4Target","mode4RateMs","mode4Presented","mode4Correct","mode4Wrong","mode4Missed","mode4FinalTarget","mode4FinalTrials","mode4FinalCorrect","mode4FinalWrong","mode4FinalMeanRtMs",
  "sleepSinceLastTest","sleepBedtime","sleepWakeTime","sleepWakeDateTimeIso","sleepDurationMinutes","sleepQualityLabel","sleepQualityScore",
  "pacedCorrect","pacedWrong","spRestartWrong","meanPacedRtMs","pacedRtSd",
  "avgFrameOvershootMs","maxFrameOvershootMs","avgRafIntervalMs","maxRafIntervalMs",
  "testDurationMs","endReason","location"];
 const rows=h.map((r,i)=>[
  i+1,
  r.testMode||"",
  r.subjectId||"",
  r.time?new Date(r.time).toLocaleString():"",
  r.samnPerelli?`${r.samnPerelli.score} - ${r.samnPerelli.label}`:"",
  r.calibrationAverageMs!=null?r.calibrationAverageMs.toFixed(1):"",
  (r.blocks||[]).join("|"),
  r.averageLast2BlockingScoresMs!=null?r.averageLast2BlockingScoresMs.toFixed(1):"",
  r.blockScoreDifferenceMs!=null?r.blockScoreDifferenceMs.toFixed(1):"",
  r.cognitivePerformanceIndex!=null?r.cognitivePerformanceIndex.toFixed(1):"",
  r.totalResponses||0, r.totalCorrect||0, r.totalIncorrect||0, r.missedTrials||0,
  r.sustainedBlockLimitPerformanceMs!=null?r.sustainedBlockLimitPerformanceMs.toFixed(1):"",
  r.sustainedProcessingIndex!=null?r.sustainedProcessingIndex.toFixed(1):"",
  r.correctSustainedResponses!=null?r.correctSustainedResponses:"",
  r.mode4SustainedTargetCount!=null?r.mode4SustainedTargetCount:"",
  r.mode4SustainedPresentationRateMs!=null?r.mode4SustainedPresentationRateMs.toFixed(1):"",
  r.mode4SustainedPresented||0, r.mode4SustainedCorrect||0, r.mode4SustainedWrong||0, r.mode4SustainedMissed||0, r.mode4FinalTrialTargetCount!=null?r.mode4FinalTrialTargetCount:"", r.mode4FinalTrialsPresented||0, r.mode4FinalCorrect||0, r.mode4FinalWrong||0, r.mode4FinalMeanRtMs!=null?r.mode4FinalMeanRtMs.toFixed(1):"",
  r.sleepSinceLastTest||"",
  r.sleepLog?.bedtime||"",
  r.sleepLog?.wakeTime||"",
  r.sleepLog?.wakeDateTimeIso||"",
  r.sleepLog?.durationMinutes!=null?r.sleepLog.durationMinutes:"",
  r.sleepLog?.qualityLabel||"",
  r.sleepLog?.qualityScore!=null?r.sleepLog.qualityScore:"",
  r.pacedResponseCount||0, r.pacedErrors||0, r.recoveryErrors||0,
  r.pacedResponseMeanMs!=null?r.pacedResponseMeanMs.toFixed(1):"",
  r.pacedResponseSdMs!=null?r.pacedResponseSdMs.toFixed(1):"",
  r.timingQuality?.avgFrameOvershootMs!=null?r.timingQuality.avgFrameOvershootMs.toFixed(2):"",
  r.timingQuality?.maxFrameOvershootMs!=null?r.timingQuality.maxFrameOvershootMs.toFixed(2):"",
  r.timingQuality?.avgRafIntervalMs!=null?r.timingQuality.avgRafIntervalMs.toFixed(2):"",
  r.timingQuality?.maxRafIntervalMs!=null?r.timingQuality.maxRafIntervalMs.toFixed(2):"",
  r.testDurationMs!=null?Math.round(r.testDurationMs):"",
  r.endReason||"",
  (r.geo&&r.geo.address)||""
 ].map(csvCell).join(","));
 const csv=[cols.map(csvCell).join(","), ...rows].join("\n");
 const blob=new Blob([csv],{type:"text/csv"});
 const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`${STORAGE_PREFIX}_history.csv`; a.click();
}

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


let _profileTimeFormat = null;

function isValidEmailAddress(v){
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v||"").trim());
}

function getProfileDraftTimeFormat(){
 return String(_profileTimeFormat||getEffectiveTimeFormat()) === "24" ? "24" : "12";
}

function profileSelectTimeFormat(fmt){
 _profileTimeFormat = String(fmt)==="24" ? "24" : "12";
 ["12","24"].forEach(x=>{
  const btn = $("profileTime"+x+"Btn");
  if(!btn) return;
  const on = x===String(_profileTimeFormat);
  btn.style.background = on ? "linear-gradient(180deg,#0d2e5a,#081b36)" : "";
  btn.style.borderColor = on ? "#7fd7ff" : "";
  btn.style.color = on ? "#7fd7ff" : "";
 });
 // Do not touch Sleep Logger inputs while editing Profile.
 // The saved format is applied when Sleep Logger opens.
}

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

function openProfileFromContext(returnTo,email=""){
 _profileReturnTo = returnTo || "subjectOverlay";
 const candidate = String(email || state.profile?.email || state.subjectId || "").trim().toLowerCase();
 const safeEmail = isValidEmailAddress(candidate) ? candidate : "";
 const input = $("subjectIdInput");
 if(input && safeEmail) input.value = safeEmail;
 openProfileOverlay(safeEmail);
}

// Profile editor open path:
// - email users load/save their full profile
// - guest users (subject ID 0) must NOT inherit a saved email profile
// - time-format toggle stays local draft state until Save & Continue
function openProfileOverlay(email){
 const safeEmail = isValidEmailAddress(email) ? String(email).trim().toLowerCase() : "";
 const stored = loadProfile();
 const existing = (safeEmail && stored && String(stored.email||"").trim().toLowerCase()===safeEmail) ? stored : null;
 const existingTimeFormat = existing?.timeFormat || getEffectiveTimeFormat();
 _profileGenderSelected = existing?.gender || "";
 _profileTimeFormat = String(existingTimeFormat) === "24" ? "24" : "12";

 // Show email
 const ed = $("profileEmailDisplay");
 if(ed) ed.textContent = safeEmail || "Guest / no email";

 // Pre-fill only when editing the matching saved email profile.
 if(existing){
  const bm = $("profileBirthMonth"); if(bm) bm.value = existing.birthMonth||"";
  const by = $("profileBirthYear"); if(by) by.value = existing.birthYear||"";
  const er = $("profileEmailResults"); if(er) er.checked = !!existing.emailResults;
  profileToggleEmail(!!existing.emailResults);
  if(existing.gender) profileSelectGender(existing.gender);
  validateProfileAge();
  profileSelectTimeFormat(_profileTimeFormat);
 } else {
  const bm = $("profileBirthMonth"); if(bm) bm.value="";
  const by = $("profileBirthYear"); if(by) by.value="";
  const er = $("profileEmailResults"); if(er) er.checked=false;
  profileToggleEmail(false);
  profileSelectGender("");
  const msg=$("profileAgeMsg"); if(msg) msg.textContent="";
  profileSelectTimeFormat(_profileTimeFormat);
 }

 showOnly("profileOverlay");
}

let _profileReturnTo = "refresherOverlay"; // where to go after saving profile

function saveAndContinueProfile(){
 const entered = ($("subjectIdInput")?.value||"").trim().toLowerCase();
 const email = isValidEmailAddress(entered) ? entered : "";
 const bMonth = parseInt($("profileBirthMonth")?.value||"0");
 const bYear = parseInt($("profileBirthYear")?.value||"0");
 const emailResults = !!$("profileEmailResults")?.checked;
 const timeFormat = getProfileDraftTimeFormat();

 // Always save time-format settings from this page
 settings.timeFormat = timeFormat;
 saveSettings();

 // If no email is entered yet, allow returning after saving settings only.
 if(!email){
  showOnly(_profileReturnTo || "subjectOverlay");
  _profileReturnTo = "refresherOverlay";
  setStatus("Settings saved");
  return;
 }

 // Validate age for profile save
 if(!validateProfileAge()){ setStatus("Please enter a valid date of birth (14+)."); return; }
 if(!_profileGenderSelected){ setStatus("Please select a gender."); return; }

 const profile = {email, birthMonth:bMonth, birthYear:bYear,
  gender:_profileGenderSelected, emailResults, timeFormat:settings.timeFormat, updatedAt:Date.now()};
 saveProfile(profile);

 state.subjectId = email;
 state.profile = profile;

 showOnly(_profileReturnTo);
 _profileReturnTo = "refresherOverlay";
 setStatus("Profile saved"); restoreSubjectFromProfile();
}

function resetProfile(){
 clearProfile();
 _profileGenderSelected = "";
 _profileTimeFormat = getEffectiveTimeFormat();
 const bm=$("profileBirthMonth"); if(bm) bm.value="";
 const by=$("profileBirthYear"); if(by) by.value="";
 const er=$("profileEmailResults"); if(er) er.checked=false;
 profileToggleEmail(false);
 ["M","F","O"].forEach(x=>{
  const btn=$("profileGender"+x);
  if(btn){ btn.style.background=""; btn.style.borderColor=""; btn.style.color=""; }
 });
 const msg=$("profileAgeMsg"); if(msg) msg.textContent="";
 profileSelectTimeFormat(_profileTimeFormat);
 setStatus("Profile reset");
}

function resetAllSessions(){
 state.history = [];
 localStorage.removeItem(`${STORAGE_PREFIX}_history`);
 updateStartPageLinks();
 try{ syncSummarySessionSelect(0); }catch(e){}
 try{ syncSpeedometerSessionSelect(0); }catch(e){}
 try{ syncTrialLogSessionSelect(0); }catch(e){}
 setStatus("All sessions deleted");
}

// ─── OVERLAY / NAVIGATION UTILITIES ──────────────────────────
// hideAllOverlays(): hides every overlay (used at test start).
// showOnly(id): shows one overlay, hides all others.
// _adminReturnTo: tracks which page opened admin so Close returns there.
// ──────────────────────────────────────────────────────────────
function getOverlayElements(){
 return Array.from(document.querySelectorAll(".overlay, .thinking-overlay, .outcome-overlay"));
}
function hideAllOverlays(){
 getOverlayElements().forEach(el=>el.classList.add("hidden"));
}
function showOnly(id){
 const target=$(id);
 getOverlayElements().forEach(el=>el.classList[el===target?"remove":"add"]("hidden"));
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

function isTestSuccess(resultOrReason){
 const result = (resultOrReason && typeof resultOrReason === "object") ? resultOrReason : null;
 const reason=String(result ? (result.endReason||"") : (resultOrReason||"")).trim();
 if(!reason) return false;
 const lower=reason.toLowerCase();
 const failHints=["failed","retest","practice","erratic responses","not responding in time","no response","too many blocks","too many wrong","anti-spoof","rolling mean","wrong window"];
 if(failHints.some(h=>lower.includes(h))) return false;
 if(lower.startsWith("convergent")) return true;
 if(lower.includes("mode 4 sustained mbs segment complete")) return true;
 if(lower==="required responses reached") return true;
 if(lower==="required test time reached") return true;
 if(lower==="time limit reached"){
  if(result && result.testMode==="mode4"){
   const sustainedPresented = Number(result.mode4SustainedPresented!=null ? result.mode4SustainedPresented : result.sustainedTrialsPresented);
   const sustainedCorrect = Number(result.mode4SustainedCorrect!=null ? result.mode4SustainedCorrect : result.correctSustainedResponses);
   if(result.mode4Triggered || sustainedPresented>0 || sustainedCorrect>0) return true;
  }
  return false;
 }
 if(lower==="run complete") return !!(result && Number.isFinite(Number(result.cognitivePerformanceIndex)));
 return false;
}

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
 const mode=(result&&result.testMode)||"mode1";
 if(mode==="mode4"){
  const target=Math.max(1, Number(result.mode4SustainedTargetCount)||Number(settings.mode4SustainedTrialCount)||10);
  const csr=Number(result.correctSustainedResponses!=null?result.correctSustainedResponses:result.mode4SustainedCorrect);
  const cpi=Number.isFinite(csr)?Math.max(0,Math.min(100,computeSPI(csr,target))):null;
  const rows=[];
  for(let n=target;n>=0;n--){
   const rowCpi=Math.round((n/target)*100);
   const mark=(csr===n)?"  ← YOUR SCORE":"";
   rows.push(`CSR ${String(n).padStart(2," ")} | CPI ${String(rowCpi).padStart(3," ")}${mark}`);
  }
  return ["Mode 4 Cognitive Performance Table (CSR → CPI)",...rows].join("\n");
 }
 if(mode!=="mode1") return "Not used in this mode.";
 const cpi = result.cognitivePerformanceIndex!=null ? Number(result.cognitivePerformanceIndex) : null;
 const actualSpfs = result.samnPerelli && result.samnPerelli.score!=null ? Number(result.samnPerelli.score) : null;
 const best = Number(settings.cpiBestMs)||DEFAULTS.cpiBestMs;
 const worst = Number(settings.cpiWorstMs)||DEFAULTS.cpiWorstMs;
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
  rows.forEach((r,i)=>{ const d=Math.abs(cpi-r.cpi); if(d<bestDiff){bestDiff=d; nearestIdx=i;} });
 }
 const leftHeader = "Cognitive Performance Table";
 const rightHeader = "Cognitive Performance Capability *";
 const leftRows = rows.map((r,i)=>{
   const spfsLabel = (actualSpfs!=null && r.spfs===actualSpfs) ? `[SP-FS ${r.spfs}]` : `SP-FS ${r.spfs}`;
   const mark = i===nearestIdx ? "  ← CPI" : "";
   return `${spfsLabel}: CPI ${r.cpi.toString().padStart(3," ")} | ${r.ms} ms${mark}`;
 });
 const rightRows = rows.map(r=>r.cap);
 const leftWidth = Math.max(leftHeader.length, ...leftRows.map(s=>s.length));
 const gap = "   ";
 const lines = [];
 lines.push(leftHeader.padEnd(leftWidth, " ") + gap + rightHeader);
 for(let i=0;i<rows.length;i++) lines.push(leftRows[i].padEnd(leftWidth, " ") + gap + rightRows[i]);
 return lines.join("\n");
}
function buildRankedSummary(result){
 const el=$("rankedText"); if(!el) return;
 const hr="─────────────────────────";
 const modeName = result.testMode==="mode2" ? "Mode 3 Self-paced" : result.testMode==="mode3" ? "Mode 4 Machine-Paced" : result.testMode==="mode4" ? "Mode 2 CogSpeed Sustained" : "Mode 1 CogSpeed Adaptive";
 el.textContent =
`CogSpeed ${APP_VERSION} — ${modeName}
${hr}
RANKED TARGET / POSITION AVERAGES — POOLED SAME-MODE SESSIONS
${formatModePooledRankSection(result.testMode)}`;
}

function getTerminalRecoveryWrongCount(result){
 try{
  return Array.isArray(result?.rtLog)
    ? result.rtLog.filter(r => r && r.phase==="terminal_recovery" && r.outcome==="wrong").length
    : 0;
 }catch(e){
  return 0;
 }
}

function getResultsMetricExplanationText(result){
 const hr="─────────────────────────";
 const mode=(result&&result.testMode)||"mode1";
 const usesMode1Metrics = mode==="mode1";
 const usesMode4Metrics = mode==="mode4";
 return `${hr}
RESULTS METRIC EXPLANATIONS
 MBS (Max Blocking Score) = Average in ms of last 2 blocks within 250 ms.${usesMode1Metrics||usesMode4Metrics?"":" Not used in this mode."}
 CPI (Cognitive Processing Index) = normalized 0 - 100 index based on MBS.${usesMode1Metrics||usesMode4Metrics?"":" Not used in this mode."}
 CSR (Correct Sustained Responses) = number of correct sustained responses in the Mode 4 sustained segment.${usesMode4Metrics?"":" Not used in this mode."}
 SBLP (Sustained Blocking Limit Performance) = average RT of correct sustained responses during Mode 4 sustained segment, but defined as 0 when CSR = 0.${usesMode4Metrics?"":" Not used in this mode."}
 SPI (Sustained Processing Index) = normalized 0 - 100 index based on CSR.${usesMode4Metrics?"":" Not used in this mode."}`;
}


function computeMode4AdaptiveCounts(result){
 const log = Array.isArray(result&&result.rtLog) ? result.rtLog : [];
 const adaptive = log.filter(r => ["paced","paced_wrong","paced_late_correct","paced_late_wrong","missed"].includes(r.phase));
 if(adaptive.length){
  const correct = adaptive.filter(r => r.outcome === "correct").length;
  const wrong = adaptive.filter(r => r.outcome === "wrong").length;
  const missed = adaptive.filter(r => r.outcome === "missed").length;
  return {correct, wrong, missed};
 }
 const correct = Math.max(0, Number(result&&result.pacedResponseCount)||0);
 const wrong = Math.max(0, Number(result&&result.pacedErrors)||0);
 const missed = Math.max(0, Number(result&&result.missedTrials)||0) - Math.max(0, Number(result&&result.mode4SustainedMissed)||0);
 return {correct, wrong, missed: Math.max(0, missed)};
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
 const modeName = result.testMode==="mode2" ? "Mode 3 Self-paced" : result.testMode==="mode3" ? "Mode 4 Machine-Paced" : result.testMode==="mode4" ? "Mode 2 CogSpeed Sustained" : "Mode 1 CogSpeed Adaptive";
 if(result.testMode==="mode2"){
  el.textContent=
`CogSpeed ${APP_VERSION} — ${modeName}
${hr}
Test Mode:  ${formatModeTag(result.testMode)}
Session:    ${result.sessionNumber!=null?result.sessionNumber:"—"}
Subject ID:  ${result.subjectId}
Date / Time:  ${new Date(result.time).toLocaleString()}
Total trial presentations: ${computeTotalTrialPresentations(result)}
Test duration: ${formatDuration(result.testDurationMs)}
Location:   ${geoStr}
${hr}
FATIGUE (S-PF)
 Pre-test rating: ${spf}
${formatSleepLine(result)}
${formatTimeSinceLastSleepLine(result)||""}
${hr}
SELF-PACED CALIBRATION (SPC)
 Total self-paced responses: ${result.selfPacedResponseCount}
 Average self-paced RT: ${result.selfPacedResponseMeanMs!=null?result.selfPacedResponseMeanMs.toFixed(1)+" ms":"—"}
 Self-paced RT SD:   ${result.selfPacedResponseSdMs!=null?result.selfPacedResponseSdMs.toFixed(1)+" ms":"—"}
 Total response avg: ${result.allResponseMeanMs!=null?result.allResponseMeanMs.toFixed(1)+" ms":"—"}
 Total response SD:  ${result.allResponseSdMs!=null?result.allResponseSdMs.toFixed(1)+" ms":"—"}
 Correct self-paced: ${result.selfPacedCorrect}
 Calibration wrong: ${result.calibrationErrors!=null?result.calibrationErrors:result.selfPacedWrong}
 Total wrong:       ${result.calibrationErrors!=null?result.calibrationErrors:result.selfPacedWrong}
${hr}
COGNITIVE PERFORMANCE TABLE
 ${getCognitivePerformanceTableText(result)}
${hr}
END REASON
 ${result.endReason||"Run complete"}
${getResultsMetricExplanationText(result)}`;
  return;
 }
 if(result.testMode==="mode3"){
  el.textContent=
`CogSpeed ${APP_VERSION} — ${modeName}
${hr}
Test Mode:  ${formatModeTag(result.testMode)}
Session:    ${result.sessionNumber!=null?result.sessionNumber:"—"}
Subject ID:  ${result.subjectId}
Date / Time:  ${new Date(result.time).toLocaleString()}
Total trial presentations: ${computeTotalTrialPresentations(result)}
Test duration: ${formatDuration(result.testDurationMs)}
Location:   ${geoStr}
${hr}
FATIGUE (S-PF)
 Pre-test rating: ${spf}
${formatSleepLine(result)}
${formatTimeSinceLastSleepLine(result)||""}
${hr}
SELF-PACED CALIBRATION
 Total self-paced responses: ${result.selfPacedResponseCount}
 Self-paced correct: ${result.selfPacedCorrect}
 Calibration wrong: ${result.calibrationErrors!=null?result.calibrationErrors:result.selfPacedWrong}
 Total wrong:       ${result.calibrationErrors!=null?result.calibrationErrors:result.selfPacedWrong}
 Average calibration RT: ${result.calibrationAverageMs!=null?result.calibrationAverageMs.toFixed(1)+" ms":"—"}
Self-paced RT SD: ${result.selfPacedResponseSdMs!=null?result.selfPacedResponseSdMs.toFixed(1)+" ms":"—"}
${hr}
FIXED MACHINE-PACED PHASE (Mode 4 Machine-Paced)
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
 ${result.endReason||"Run complete"}
${getResultsMetricExplanationText(result)}`;
  return;
 }
 if(result.testMode==="mode4"){
  const adaptiveMbs=result.mode4AdaptiveMbsMs!=null?result.mode4AdaptiveMbsMs:result.averageLast2BlockingScoresMs;
  const spi=result.sustainedProcessingIndex;
  const sblp=result.sustainedBlockLimitPerformanceMs;
  const csr=result.correctSustainedResponses!=null?result.correctSustainedResponses:(result.mode4SustainedCorrect||0);
  const timing=result.mode4TimingSummary||computeMode4TimingSummary(result);
  const mode4Cpi=result.mode4CpiFromCsr!=null?result.mode4CpiFromCsr:(Number.isFinite(Number(csr))?computeSPI(Number(csr), Math.max(1, Number(result.mode4SustainedTargetCount)||10)):null);
  const adaptiveCounts=computeMode4AdaptiveCounts(result);
  el.textContent=
`CogSpeed ${APP_VERSION} — ${modeName}
${hr}
Test Mode:  ${formatModeTag(result.testMode)}
Session:    ${result.sessionNumber!=null?result.sessionNumber:"—"}
Subject ID:  ${result.subjectId}
Date / Time:  ${new Date(result.time).toLocaleString()}
Total trial presentations: ${computeTotalTrialPresentations(result)}
Total TEST duration: ${formatDuration(timing.totalMs)}
Calibration → end of adaptive paced trials: ${formatDuration(timing.adaptiveMs)}
Sustained + final self-paced duration: ${formatDuration(timing.sustainedFinalMs)}
Location:   ${geoStr}
${hr}
FATIGUE (S-PF)
 Pre-test rating: ${spf}
${formatSleepLine(result)}
${formatTimeSinceLastSleepLine(result)||""}
${hr}
SELF-PACED CALIBRATION
 Total self-paced responses: ${result.selfPacedResponseCount}
 Self-paced correct: ${result.selfPacedCorrect}
 Calibration wrong: ${result.calibrationErrors!=null?result.calibrationErrors:result.selfPacedWrong}
 Total wrong:       ${result.calibrationErrors!=null?result.calibrationErrors:result.selfPacedWrong}
 Average calibration RT: ${result.calibrationAverageMs!=null?result.calibrationAverageMs.toFixed(1)+" ms":"—"}
 Self-paced RT SD: ${result.selfPacedResponseSdMs!=null?result.selfPacedResponseSdMs.toFixed(1)+" ms":"—"}
${hr}
ADAPTIVE MACHINE-PACED PHASE
 Right Responses: ${adaptiveCounts.correct}
 Wrong Responses: ${adaptiveCounts.wrong}
 Missed Responses: ${adaptiveCounts.missed}
 Average adaptive paced RT: ${result.pacedResponseMeanMs!=null?result.pacedResponseMeanMs.toFixed(1)+" ms":"—"}
 Paced RT SD: ${result.pacedResponseSdMs!=null?result.pacedResponseSdMs.toFixed(1)+" ms":"—"}
 Blocks found: ${result.blockCount||0}
${getMode4BlockListText(result)}
 MBS: ${adaptiveMbs!=null?adaptiveMbs.toFixed(1)+" ms":"—"} (Average of last 2 consecutive blocks less than 250 ms difference)
 Block difference for MBS: ${result.blockScoreDifferenceMs!=null?result.blockScoreDifferenceMs.toFixed(1)+" ms":"—"}
 CPI: ${adaptiveMbs!=null?computeCPI(adaptiveMbs).toFixed(1)+" / 100":"—"}
${hr}
MODE 4 SUSTAINED MBS PHASE
 Triggered: ${result.mode4Triggered?"Yes":"No"}
 Sustained presentation rate: ${result.mode4SustainedPresentationRateMs!=null?result.mode4SustainedPresentationRateMs.toFixed(1)+" ms":"—"}
 Sustained trials target / presented: ${result.mode4SustainedTargetCount!=null?result.mode4SustainedTargetCount:(Math.max(1, Number(settings.mode4SustainedTrialCount)||10))} / ${result.mode4SustainedPresented||0}
 CSR (Correct Sustained Responses): ${csr}
 Sustained wrong:   ${result.mode4SustainedWrong||0}
 Sustained missed:  ${result.mode4SustainedMissed||0}
 SBLP: ${sblp!=null?(Number(sblp)===0&&csr===0?"0 ms (CSR = 0)":sblp.toFixed(1)+" ms"):"—"}
 SPI: ${spi!=null?spi.toFixed(1)+" / 100":"—"}
 CPI from CSR: ${mode4Cpi!=null?mode4Cpi.toFixed(1):"—"}
${hr}
FINAL SELF-PACED TRIALS
 Final self-paced trials target / presented: ${result.mode4FinalTrialTargetCount!=null?result.mode4FinalTrialTargetCount:(result.mode4FinalTrialsPresented||0)} / ${result.mode4FinalTrialsPresented||0}
 Final self-paced correct: ${result.mode4FinalCorrect||0}
 Final self-paced wrong:   ${result.mode4FinalWrong||0}
 Final self-paced mean RT: ${result.mode4FinalMeanRtMs!=null?result.mode4FinalMeanRtMs.toFixed(1)+" ms":"—"}
${hr}
COGNITIVE PERFORMANCE TABLE
 ${getCognitivePerformanceTableText(result)}
${hr}
END REASON
 ${result.endReason||"Run complete"}
${getResultsMetricExplanationText(result)}`;
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
Test Mode:  ${formatModeTag(result.testMode)}
Session:    ${result.sessionNumber!=null?result.sessionNumber:"—"}
Subject ID:  ${result.subjectId}
Date / Time:  ${new Date(result.time).toLocaleString()}
Total trial presentations: ${computeTotalTrialPresentations(result)}
Test duration: ${formatDuration(result.testDurationMs)}
Location:   ${geoStr}
${hr}
FATIGUE (S-PF)
 Pre-test rating: ${spf}
${formatSleepLine(result)}
${formatTimeSinceLastSleepLine(result)||""}
${hr}
CALIBRATION
 Average RT: ${result.calibrationAverageMs!=null?result.calibrationAverageMs.toFixed(1)+" ms":"—"}
${hr}
MACHINE-PACED PERFORMANCE
 Block scores:
${blockList}
 Average of last 2 blocks: ${avg2!=null?avg2.toFixed(1)+" ms":"—"}
 Block score difference: ${diffStr}
 Average paced RT: ${result.pacedResponseMeanMs!=null?result.pacedResponseMeanMs.toFixed(1)+" ms":"—"}
 Paced RT SD: ${sd!=null?sd.toFixed(1)+" ms":"—"}
${hr}
COGNITIVE PERFORMANCE TABLE
 ${getCognitivePerformanceTableText(result)}
${hr}
END REASON
 ${result.endReason||"Run complete"}
${getResultsMetricExplanationText(result)}`;
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

function drawSpeedometer(canvas, scoreValue, blockMs, success, showBlock, scoreLabel="CPI", blockLabel="MBS"){
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

 const na = toAngle(scoreValue); // needle angle
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
 ctx.fillText(String(scoreLabel||"CPI"), cx+R*0.13, cy+R*0.285);

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
  const label = `${String(blockLabel||"MBS")}: ${Math.round(blockMs)}${String(blockLabel||"MBS")==="CSR"?"":" ms"}`;
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
function animateSpeedometer(canvas, targetScore, blockMs, success, scoreLabel="CPI", blockLabel="MBS"){
 stopSpeedometer();
 const finalCPI = success ? targetScore : 0;
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
  drawSpeedometer(canvas, cps, blockMs, success, phase==="dither", scoreLabel, blockLabel);
  _speedoRaf=requestAnimationFrame(frame);
 }
 _speedoRaf=requestAnimationFrame(frame);
}
function stopSpeedometer(){ if(_speedoRaf){ cancelAnimationFrame(_speedoRaf); _speedoRaf=null; } }

// ─── Results page — gear spin outro (1.0s) then thinking box ───
// ─── RESULTS PAGE FLOW ────────────────────────────────────────
// THINKING BOX: 2s animated steam+sparks FX after test ends.
// SUCCESS/FAIL BOX: 3s outcome overlay (green=SUCCESS/red=Test Failed).
// Then shows summary overlay with full result text.
// LAST RESULTS: accessible from admin → 📄 Last Results button.
// E-MAIL: emailResults() opens mailto: with full result text body.
// ──────────────────────────────────────────────────────────────
function getSummarySelectedIndex(){
 const s=$("summarySessionSelect");
 if(!s || !s.options.length) return Math.max(0, state.history.length-1);
 const idx=Number(s.value);
 return Number.isFinite(idx) ? Math.max(0, Math.min(state.history.length-1, idx)) : Math.max(0, state.history.length-1);
}

function syncSummarySessionSelect(selectedIdx){
 const s=$("summarySessionSelect");
 if(!s) return;
 const wanted = Math.max(0, Math.min(state.history.length-1, Number(selectedIdx)||0));
 const existing = Array.from(s.options).map(o=>o.value).join('|');
 const desired = state.history.map((r,idx)=>String(idx)).join('|');
 if(existing !== desired){
  s.innerHTML = state.history.map((r,idx)=>{
   const stamp = r && r.time ? new Date(r.time).toLocaleString() : `Session ${idx+1}`;
   const mode = r && r.testMode ? formatModeTag(r.testMode) : '—';
   const subj = r && r.subjectId ? r.subjectId : '—';
   return `<option value="${idx}">Session ${idx+1} • ${mode} • ${subj} • ${stamp}</option>`;
  }).join('');
 }
 if(s.options.length) s.value = String(wanted);
}


function computeMode4TimingSummary(result){
 const entries=Array.isArray(result&&result.rtLog)?result.rtLog:[];
 const sumPhases=(phases)=>entries.filter(e=>phases.includes(String(e.phase||"")) && Number.isFinite(Number(e.durationMs))).reduce((s,e)=>s+Number(e.durationMs),0);
 const sustainedFinalMs=sumPhases(["mode4_sustained","mode4_sustained_wrong","mode4_sustained_missed","mode4_final"]);
 const totalMs=Number(result&&result.testDurationMs)||0;
 const adaptiveMs=Math.max(0,totalMs-sustainedFinalMs);
 return {totalMs,adaptiveMs,sustainedFinalMs};
}
function getMode4BlockListText(result){
 const blocks=Array.isArray(result&&result.blocks)?result.blocks:[];
 if(!blocks.length) return " none";
 return blocks.map((b,i)=>` Block ${i+1}: ${Number(b).toFixed(0)} ms`).join("\n");
}

function openSummarySession(idx){
 const ctx = resolveResultContext(null, idx, "summary session");
 if(!ctx.result) return;
 const clamped = Number.isFinite(Number(ctx.index)) ? Math.max(0, Math.min(state.history.length-1, Number(ctx.index))) : null;
 if(clamped!=null) syncSummarySessionSelect(clamped);
 try{
  buildSummary(ctx.result);
  applySummarySourceDiagnostic(ctx.result, clamped, ctx.source);
 }catch(err){
  const st=$("summaryText");
  if(st) st.textContent=`CogSpeed summary fallback
Reason: ${(ctx.result&&ctx.result.endReason)||"Run complete"}
Render error: ${err&&err.message?err.message:err}`;
 }
 $("summaryOverlay").classList.remove("hidden");
}

function getSpeedometerSelectedIndex(){
 const s=$("speedometerSessionSelect");
 if(!s || !s.options.length) return Math.max(0, state.history.length-1);
 const idx=Number(s.value);
 return Number.isFinite(idx) ? Math.max(0, Math.min(state.history.length-1, idx)) : Math.max(0, state.history.length-1);
}

function syncSpeedometerSessionSelect(selectedIdx){
 const s=$("speedometerSessionSelect");
 if(!s) return;
 const wanted = Math.max(0, Math.min(state.history.length-1, Number(selectedIdx)||0));
 const existing = Array.from(s.options).map(o=>o.value).join('|');
 const desired = state.history.map((r,idx)=>String(idx)).join('|');
 if(existing !== desired){
  s.innerHTML = state.history.map((r,idx)=>{
   const stamp = r && r.time ? new Date(r.time).toLocaleString() : `Session ${idx+1}`;
   const mode = r && r.testMode ? formatModeTag(r.testMode) : '—';
   const subj = r && r.subjectId ? r.subjectId : '—';
   return `<option value="${idx}">Session ${idx+1} · ${mode} · ${subj} · ${stamp}</option>`;
  }).join('');
 }
 if(s.options.length) s.value = String(wanted);
}

function openSpeedometerSession(idx){
 const ctx = resolveResultContext(null, idx, "speedometer session");
 if(!ctx.result) return goToStartPage();
 hideAllOverlays();
 if(Number.isFinite(Number(ctx.index)) && ctx.index>=0) syncSpeedometerSessionSelect(ctx.index);
 renderSpeedometerOutcome(ctx.result, ctx.index);
}

function showResultsPage(resultOverride){
 // Curtain-neutral results handoff: curtain is fully non-blocking here.
 clearCurtainWatchdog();
 hardResetCurtainState(true);
 hideAllOverlays();
 const thinking=$("thinkingOverlay");
 const outcome=$("outcomeOverlay");
 const testScreen=$("testScreen");
 const ctx = resolveResultContext(resultOverride, null, "showResultsPage");
 try{
  stopFX();
  if(testScreen) testScreen.classList.add("hidden");
  if(thinking) thinking.classList.add("hidden");
  if(outcome) outcome.classList.remove("hidden");
  if(Number.isFinite(Number(ctx.index)) && ctx.index>=0) syncSummarySessionSelect(ctx.index);
  renderSpeedometerOutcome(ctx.result, ctx.index);
 }catch(err){
  console.error("showResultsPage failed", err);
  if(outcome) outcome.classList.remove("hidden");
  try{ syncOutcomeStatusText(ctx.result || {endReason:state.endReason||"Run complete"}); }catch(e){}
  try{ applySpeedometerSourceDiagnostic(ctx.result, ctx.index, ctx.source); }catch(e){}
 }finally{
  try{ updateStartPageLinks(); }catch(e){}
 }
}


// ─── Session control ───
// ─── SESSION STATE MANAGEMENT ─────────────────────────────────
// resetTrialStateOnly(): clears only active test/runtime state.
// resetPretestEntryState(): clears sleep/SP-FS entry state.
// resetSubjectSessionState(): clears runtime + pretest state while preserving saved profile/settings.
// saveSettings() / loadSettings(): persist to localStorage.
// ──────────────────────────────────────────────────────────────
function resetTrialStateOnly(){
 clearTimer(); clearNoResponseTimer(); clearMaxTestTimer();
 state.phase="idle"; state.duration=null; state.blockDuration=null; state.blockRestartBaseline=null;
 state.current=null; state.previous=null; state.unresolvedStreak=0;
 state.overloads=[]; state.recoveries=[]; state.recoveryCorrectCompleted=0;
 state.spCorrectStreak=0; state.spWrongCount=0; state.terminalBlockReason=null;
 state.totalTrials=0; state.endReason=""; state.totalResponses=0; state.pacedErrors=0; state.recoveryErrors=0;
 state.testStartTime=null; state.maxTestRemainingMs=null; state.maxTestDeadlineMs=null; state.totalCorrect=0; state.totalIncorrect=0;
 state.missedTrials=0; state.rollMeanLog=[]; state.lastFiveAnswers=[];
 state.calibrationTrialIndex=0; state.calibrationRTs=[]; state.calibrationErrors=0;
 state.pacedRTs=[]; state.rtLog=[]; state.lastFrameDuration=null; state.presentedRoundDuration=null;
 state.activeMode=settings.testMode||"mode1"; state.selfPacedRTs=[]; state.selfPacedCorrect=0; state.selfPacedWrong=0;
 state.fixedPacedBaseline=null; state.fixedPacedPresented=0; state.fixedPacedCorrect=0; state.fixedPacedWrong=0;
 state.geo=null; state.benchmark=null; state.lastResultText=null;
 state.pendingPriorMiss=null; state.pendingLatePacing=null;
 state.activeFrameTiming=null; state.frameOvershootLog=[]; state.rafIntervalLog=[];
 state.mode4Triggered=false; state.mode4AdaptiveMbsMs=null; state.mode4SustainedPresentationRateMs=null;
 state.mode4SustainedPresented=0; state.mode4SustainedCorrect=0; state.mode4SustainedWrong=0; state.mode4SustainedMissed=0;
 state.mode4SustainedCorrectRTs=[]; state.mode4FinalTrialsPresented=0; state.mode4FinalCorrect=0; state.mode4FinalWrong=0; state.mode4FinalRTs=[]; state.speedometerMode4Metric="spi";
 updateCPIDisplay(null); updateMetrics(); setProbeIdle(); setTestingQuiet(false);
}
function resetPretestEntryState(){
 state.samnPerelli=null;
 state.sleepSinceLastTest=null;
 state.sleepLog=null;
 fatigueOut.textContent="—";
 const fsb=$("fatigueStartBtn"); if(fsb) fsb.classList.add("hidden");
 const fl=$("fatigueList"); if(fl) fl.querySelectorAll(".fatigue-item").forEach(el=>{ el.style.background=""; el.classList.remove("selected"); });
 ["sleepBedtimeInput","sleepWakeInput"].forEach(id=>{ const el=$(id); if(el){ el.value=""; if(el.dataset){ el.dataset.canonical=""; el.dataset.meridiem = (id==="sleepBedtimeInput"?"PM":"AM"); } } });
 ["sleepBedHourInput","sleepBedMinuteInput","sleepWakeHourInput","sleepWakeMinuteInput"].forEach(id=>{ const el=$(id); if(el) el.value=""; });
 ["sleepBed","sleepWake"].forEach(prefix=>refreshSleepMeridiemButtons(prefix));
 ["sleepQualityPoorBtn","sleepQualityOkayBtn","sleepQualityGoodBtn"].forEach(id=>$(id)?.classList.remove("selected"));
 updateSleepLoggerUI();
}
function resetSubjectSessionState(){
 resetTrialStateOnly();
 resetPretestEntryState();
}
// ─── PAGE NAVIGATION ──────────────────────────────────────────
// goToStartPage(): returns to subject ID entry, clears test state.
// startOverFlow(): Full Reset for the current device/app state.
// Clears current subject/session runtime and related saved test state.
// Use this only for the broad Admin reset action, not for Reset Sessions.
// ──────────────────────────────────────────────────────────────
function goToStartPage(){
 resetSubjectSessionState();
 ["thinkingOverlay","outcomeOverlay","testScreen"].forEach(id=>{ const el=$(id); if(el) el.classList.add("hidden"); });
 normalizeCurtainForTesting();
 probeCell.classList.remove("gspin-f","gspin-r","gidle-f","gidle-r");
 stopFX(); setStatus("Ready"); showOnly("subjectOverlay");
 try{ updateStartPageLinks(); }catch(e){}
 restoreSubjectFromProfile();
}
function startOverFlow(){
 resetSubjectSessionState(); state.subjectId=null; state.profile=null;
 fatigueOut.textContent="—"; $("subjectIdInput").value="";
 _adminUnlocked=false;
 // Full reset: clear welcome-back display but preserve saved profile in localStorage
 const wl=$("subjectWelcome"); if(wl) wl.style.display="none";
 const we=$("welcomeEmail"); if(we) we.textContent="";
 const hint=$("subjectHint"); if(hint) hint.textContent="Enter your email to begin.";
 setStatus("Reset. Enter Subject ID."); showOnly("subjectOverlay");
 normalizeCurtainForTesting();
}

// ─── Ready signal then start ───
// ─── READY HANDOFF / CURTAIN-NEUTRAL START ───────────────────
// runGearSpinThenStart(): curtain-neutral, fail-open 1-second gear-spin intro.
// It clears any stale curtain state, reveals the live test screen, renders a
// short decorative spinning-gear cue, then opens the first calibration trial.
// The start path does NOT depend on animation callbacks or curtain state.
// If anything goes wrong, the callback still runs after the fixed 1-second
// handoff window. hardResetCurtainState() and normalizeCurtainForTesting()
// remain as defensive cleanup helpers for trial open and page reset paths.
// ──────────────────────────────────────────────────────────────

let _curtainWatchdogTimer=null;
function clearCurtainWatchdog(){
 if(_curtainWatchdogTimer){ clearTimeout(_curtainWatchdogTimer); _curtainWatchdogTimer=null; }
}
function hardResetCurtainState(hideTestScreen=false){
 clearCurtainWatchdog();
 document.body.classList.remove("curtain-active");
 const curtain=$("curtain");
 if(curtain){
  curtain.classList.add("open");
  curtain.classList.remove("closing","opening");
  curtain.style.transition="none";
  void curtain.offsetWidth;
  curtain.style.transition="";
 }
 const ts=$("testScreen");
 if(ts){
  if(hideTestScreen) ts.classList.add("hidden");
  else {
   ts.classList.remove("hidden");
   ts.classList.remove("transition-blocked");
  }
  ts.style.pointerEvents="auto";
 }
}
function beginCurtainTransition(){
 hardResetCurtainState(false);
}
function endCurtainTransition(){
 hardResetCurtainState(false);
}
function normalizeCurtainForTesting(){
 hardResetCurtainState(false);
}
function armCurtainWatchdog(ms, fallback){
 clearCurtainWatchdog();
 _curtainWatchdogTimer=setTimeout(()=>{
  _curtainWatchdogTimer=null;
  try{ if(typeof fallback==="function") fallback(); }
  finally{ hardResetCurtainState(false); }
 }, Math.max(250, Number(ms)||0));
}

function runGearSpinThenStart(callback) {
 hardResetCurtainState(false);
 const ts = $("testScreen"); if(ts) ts.classList.remove("hidden");
 let completed=false;
 const finishStart=()=>{
  if(completed) return;
  completed=true;
  try{
   hardResetCurtainState(false);
   callback();
  }catch(err){
   console.error("runGearSpinThenStart failed", err);
   try{ setStatus(`START FAILED — ${state.phase||"idle"}`); }catch(_e){}
   try{ hardResetCurtainState(true); }catch(_e){}
   try{ showOnly("fatigueOverlay"); }catch(_e){}
  }
 };
 try{
  stimGrid.innerHTML = "";
  probeCell.classList.remove("idle","gspin-f","gspin-r","gidle-f","gidle-r");
  probeInner.innerHTML = buildGearSVG(0,null,"probe","gspin-f");
  respGrid.innerHTML = "";
  for(let i=0;i<6;i++){
   const cell=document.createElement("div");
   cell.className="stim-cell";
   cell.innerHTML=buildGearSVG(i+1,null,"large", i%2===0?"gspin-f":"gspin-r");
   stimGrid.appendChild(cell);
  }
  for(let i=0;i<6;i++){
   const btn=document.createElement("div");
   btn.className="resp-btn";
   btn.innerHTML=buildGearSVG(i+1,null,"large", i%2===0?"gspin-r":"gspin-f");
   respGrid.appendChild(btn);
  }
 }catch(err){
  console.error("runGearSpinThenStart intro render failed", err);
 }
 setTimeout(finishStart, 1000);
}

// ─── START TEST ───
// ─── TEST START ───────────────────────────────────────────────
// Validates subjectId + samnPerelli, clears session state,
// captures geo, then immediately opens the first calibration trial
// through the curtain-neutral start helper.
// This build uses a decorative 1-second spinning-gear intro with no separate visual buffer.
// noteAnyResponse() begins only after the first trial is actually open.
// ──────────────────────────────────────────────────────────────
function startTest(){
 setFlowDiagnostic("STARTING", "STARTING — preparing test");
 if(!state.subjectId){ showOnly("subjectOverlay"); setStatus("Enter Subject ID first"); return; }
 if(!state.samnPerelli){ showOnly("fatigueOverlay"); setStatus("Select fatigue rating first"); return; }
 const sid=state.subjectId, spf=state.samnPerelli, mode=settings.testMode||"mode1";
 const preservedProfile = state.profile;
 const preservedSleepSinceLastTest = state.sleepSinceLastTest;
 const preservedSleepLog = state.sleepLog ? JSON.parse(JSON.stringify(state.sleepLog)) : null;
 resetTrialStateOnly();
 state.subjectId=sid; state.profile=preservedProfile; state.samnPerelli=spf; state.activeMode=mode;
 state.sleepSinceLastTest = preservedSleepSinceLastTest;
 state.sleepLog = preservedSleepLog;
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
function syncTrialLogSessionSelect(selectedValue){
 const sel=$("trialLogSessionSelect"); if(!sel) return;
 const options = [...state.history].reverse().map((r,i)=>{
  const idx=state.history.length-1-i;
  return `<option value="${idx}">Session ${idx+1} · ${formatModeTag(r.testMode)} · ${r.subjectId} · ${new Date(r.time).toLocaleString()}</option>`;
 }).join("");
 if(sel.dataset.optionsHtml !== options){ sel.innerHTML = options; sel.dataset.optionsHtml = options; }
 if(selectedValue!=null) sel.value=String(selectedValue);
}

function buildTrialLog(sessionIndex){
 const tbody=$("trialLogBody"); if(!tbody) return;
 const sel=$("trialLogSessionSelect");
 const preservedValue = (sessionIndex!=null) ? String(sessionIndex) : (sel ? sel.value : null);
 if(sel) syncTrialLogSessionSelect(preservedValue);
 const idx=sel?Number(sel.value):state.history.length-1;
 const result=state.history[idx];
 const log=result?result.rtLog:state.rtLog;
 const meta=$("trialLogMeta"); if(meta && result){
  meta.textContent=`SP-FS ${result.samnPerelli?result.samnPerelli.score:"—"}`;
 }
 tbody.innerHTML="";
 if(!log||!log.length){
  tbody.innerHTML='<tr><td colspan="11" style="text-align:center;color:var(--muted);padding:12px">No trial data for this session</td></tr>';
  const meta=$("trialLogMeta"); if(meta) meta.textContent="SP-FS —";
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
  const targetStr=e.targetFrameMs!=null?`${e.targetFrameMs}ms`:"—";
  const ageStr=e.frameAgeMs!=null?`${e.frameAgeMs}ms`:"—";
  const overStr=e.frameOvershootMs!=null?`${e.frameOvershootMs}ms`:"—";
  const meanRafStr=e.meanRafIntervalMs!=null?`${Number(e.meanRafIntervalMs).toFixed(2)}ms`:"—";
  const maxRafStr=e.maxRafIntervalMs!=null?`${Number(e.maxRafIntervalMs).toFixed(2)}ms`:"—";
  const rafSamplesStr=e.rafSamples!=null?String(e.rafSamples):"—";
  const nextRateStr=e.nextRateMs!=null?`${e.nextRateMs}ms`:"—";
  const changeStr=e.rateChangeMs!=null?`${e.rateChangeMs>0?"+":""}${e.rateChangeMs}ms`:"—";
  const reasonStr=e.rateChangeReason||"—";
  tr.innerHTML=`<td style="font-weight:700">${e.seq}</td><td style="font-size:10px">${timeStr}</td><td style="font-size:10px;color:var(--muted)">${phaseLabel}</td><td>${durStr}</td><td>${rtStr}</td><td>${changeStr}</td><td style="color:${oc};font-weight:700">${outcomeLabel}</td><td style="color:var(--accent)">${e.correctCell}</td><td style="color:${oc==="var(--muted)"?"var(--muted)":oc}">${e.response}</td><td>${maxRafStr}</td><td>${reasonStr}</td>`;
  tbody.appendChild(tr);
 });
}
function downloadTrialLogCSV(){
 const sel=$("trialLogSessionSelect");
 const idx=sel?Number(sel.value):state.history.length-1;
 const result=state.history[idx];
 const log=result?result.rtLog:state.rtLog;
 if(!log||!log.length){ setStatus("No trial data to download"); return; }
 const hdr="trial#,clockTime,phase,presentationRateMs,rtMs,targetFrameMs,frameAgeMs,frameOvershootMs,rafSamples,meanRafIntervalMs,maxRafIntervalMs,outcome,scored,probe,correctCell,response,rateChangeMs,nextRateMs,rateChangeReason\n";
 const rows=log.map(e=>[
  e.seq,
  e.clockTime||"",
  e.phase,
  e.durationMs!=null?e.durationMs:"",
  e.rt!=null?e.rt:"",
  e.targetFrameMs!=null?e.targetFrameMs:"",
  e.frameAgeMs!=null?e.frameAgeMs:"",
  e.frameOvershootMs!=null?e.frameOvershootMs:"",
  e.rafSamples!=null?e.rafSamples:"",
  e.meanRafIntervalMs!=null?e.meanRafIntervalMs:"",
  e.maxRafIntervalMs!=null?e.maxRafIntervalMs:"",
  e.outcome,
  e.counted===false?"No":"Yes",
  e.probe,
  e.correctCell,
  `"${e.response}"`,
  e.rateChangeMs!=null?e.rateChangeMs:"",
  e.nextRateMs!=null?e.nextRateMs:"",
  `"${(e.rateChangeReason||"").replace(/"/g,'""')}"`
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
 const cfg = configureHiDPICanvas(canvas, 900, 520);
 if(!cfg) return;
 const {ctx, W, H} = cfg;
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
  const groupedSessions = ["mode1","mode2","mode3","mode4"].flatMap(m => reversedSessions.filter(r => (r.testMode||"mode1")===m));
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
  meta.textContent = result ? `SP-FS ${result.samnPerelli?result.samnPerelli.score:"—"}` : "SP-FS —";
 }
 const info=$("rateRtInfoBar");
 if(info){
  info.textContent = result
   ? `Session ${idx+1} · ${formatModeTag(result.testMode)} · ${result.subjectId} · ${new Date(result.time).toLocaleString()} · ${sessionsForChart.length} same-mode session(s) overlaid from trial 1`
   : "No session selected";
 }
 drawRateRtChart($("rateRtChart"), sessionsForChart, idx);
}

// ─── History & Graphs overlay ───
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
      <span style="color:#7fd7ff;font-weight:700">Up next:</span> First go to the Sleep Logger path. If you did not sleep since your last test, answer No there. Then rate your fatigue (SP-FS), then the test begins!
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


function normalizeSleepTimeValue(v){
 if(v==null) return null;
 const s=String(v).trim();
 if(!s) return null;
 let m=s.match(/^(\d{1,2}):(\d{2})$/);
 if(m){
  let hh=Number(m[1]), mm=Number(m[2]);
  if(Number.isFinite(hh) && Number.isFinite(mm) && hh>=0 && hh<=23 && mm>=0 && mm<=59){
   return `${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}`;
  }
 }
 m=s.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
 if(m){
  let hh=Number(m[1]), mm=Number(m[2]);
  const ap=m[3].toUpperCase();
  if(Number.isFinite(hh) && Number.isFinite(mm) && hh>=1 && hh<=12 && mm>=0 && mm<=59){
   if(hh===12) hh=0;
   if(ap==="PM") hh+=12;
   return `${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}`;
  }
 }
 return null;
}
function parseSleepTimeToMinutes(v){
 const canon=normalizeSleepTimeValue(v);
 if(!canon) return null;
 const [hh,mm]=canon.split(":").map(Number);
 if(!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
 return hh*60+mm;
}
function getSleep12PrefixFromInputId(id){
 if(id==="sleepBedtimeInput") return "sleepBed";
 if(id==="sleepWakeInput") return "sleepWake";
 return "";
}
function getDefaultSleepMeridiem(prefix){
 return prefix==="sleepBed" ? "PM" : "AM";
}
function setSleepMeridiem(prefix, meridiem){
 const hidden=$(prefix==="sleepBed"?"sleepBedtimeInput":"sleepWakeInput");
 if(hidden && hidden.dataset) hidden.dataset.meridiem = meridiem;
 refreshSleepMeridiemButtons(prefix);
}
function refreshSleepMeridiemButtons(prefix){
 const hidden=$(prefix==="sleepBed"?"sleepBedtimeInput":"sleepWakeInput");
 const meridiem=(hidden&&hidden.dataset&&hidden.dataset.meridiem)||getDefaultSleepMeridiem(prefix);
 const am=$(prefix+"AmBtn"), pm=$(prefix+"PmBtn");
 if(am){ am.style.background = meridiem==="AM" ? "#1a3366" : ""; am.style.borderColor = meridiem==="AM" ? "var(--accent)" : ""; }
 if(pm){ pm.style.background = meridiem==="PM" ? "#1a3366" : ""; pm.style.borderColor = meridiem==="PM" ? "var(--accent)" : ""; }
}
function getSleep12CanonicalValue(prefix){
 const hRaw=($(prefix+"HourInput")?.value||"").trim();
 const mRaw=($(prefix+"MinuteInput")?.value||"").trim();
 if(!hRaw || !mRaw) return "";
 const hh=Number(hRaw), mm=Number(mRaw);
 if(!Number.isFinite(hh) || !Number.isFinite(mm) || hh<1 || hh>12 || mm<0 || mm>59) return "";
 const hidden=$(prefix==="sleepBed"?"sleepBedtimeInput":"sleepWakeInput");
 const meridiem=(hidden&&hidden.dataset&&hidden.dataset.meridiem)||getDefaultSleepMeridiem(prefix);
 let hour=hh%12;
 if(meridiem==="PM") hour+=12;
 return `${String(hour).padStart(2,"0")}:${String(mm).padStart(2,"0")}`;
}
function setSleep12FromCanonical(prefix, canon){
 const hourEl=$(prefix+"HourInput"), minEl=$(prefix+"MinuteInput");
 if(!hourEl || !minEl) return;
 if(!canon){ hourEl.value=""; minEl.value=""; setSleepMeridiem(prefix,getDefaultSleepMeridiem(prefix)); return; }
 const [hh,mm]=String(canon).split(":").map(Number);
 if(!Number.isFinite(hh) || !Number.isFinite(mm)) return;
 const meridiem = hh>=12 ? "PM" : "AM";
 const h12 = ((hh+11)%12)+1;
 hourEl.value=String(h12);
 minEl.value=String(mm).padStart(2,"0");
 setSleepMeridiem(prefix,meridiem);
}
function getSleepInputCanonicalValue(id, modeOverride=null){
 const mode=(modeOverride===null||modeOverride===undefined)?getEffectiveTimeFormat():String(modeOverride)==="24"?"24":"12";
 const el=$(id);
 if(!el) return "";
 if(mode==="12"){
  const prefix=getSleep12PrefixFromInputId(id);
  if(prefix) return getSleep12CanonicalValue(prefix) || "";
 }
 const raw = (el.dataset && el.dataset.canonical) ? el.dataset.canonical : (el.value || "");
 const canon = normalizeSleepTimeValue(raw);
 return canon || "";
}
function syncSleepInputCanonical(el){
 if(!el) return "";
 if(getEffectiveTimeFormat()==="12"){
  const prefix=getSleep12PrefixFromInputId(el.id||"");
  const canon=prefix ? getSleep12CanonicalValue(prefix) : "";
  if(el.dataset) el.dataset.canonical = canon || "";
  return canon || "";
 }
 const canon = normalizeSleepTimeValue(el.value || "");
 if(el.dataset) el.dataset.canonical = canon || "";
 return canon || "";
}
function applySleepInputFormat(modeOverride=null){
 const mode=(modeOverride===null||modeOverride===undefined)?getEffectiveTimeFormat():String(modeOverride)==="24"?"24":"12";
 ["sleepBedtimeInput","sleepWakeInput"].forEach(id=>{
  const el=$(id);
  if(!el) return;
  const canon = (el.dataset && el.dataset.canonical) ? el.dataset.canonical : normalizeSleepTimeValue(el.value || "") || "";
  if(el.dataset) el.dataset.canonical = canon || "";
  const isBed=id==="sleepBedtimeInput";
  const wrap24=$(isBed?"sleepBedtime24Wrap":"sleepWake24Wrap");
  const wrap12=$(isBed?"sleepBedtime12Wrap":"sleepWake12Wrap");
  const prefix=isBed?"sleepBed":"sleepWake";
  if(mode==="24"){
   if(wrap24) wrap24.classList.remove("hidden");
   if(wrap12) wrap12.classList.add("hidden");
   el.type="time";
   el.placeholder="";
   el.inputMode="numeric";
   el.value=canon || "";
  }else{
   if(wrap24) wrap24.classList.add("hidden");
   if(wrap12) wrap12.classList.remove("hidden");
   setSleep12FromCanonical(prefix, canon || "");
  }
 })
}
function formatSleepDuration(mins){
 if(mins==null || !Number.isFinite(mins)) return "—";
 const h=Math.floor(mins/60), m=mins%60;
 return `${h}h ${m}m`;
}
function formatElapsedDuration(mins){
 if(mins==null || !Number.isFinite(mins)) return "—";
 const days=Math.floor(mins/(24*60));
 const rem=mins-days*24*60;
 const h=Math.floor(rem/60), m=rem%60;
 return days>0 ? `${days}d ${h}h ${m}m` : `${h}h ${m}m`;
}
function deriveWakeDateTimeIso(wakeTime, testIso){
 const wakeMins = parseSleepTimeToMinutes(wakeTime);
 if(wakeMins==null || !testIso) return null;
 const testDate = new Date(testIso);
 if(!isFinite(testDate.getTime())) return null;
 const wakeDate = new Date(testDate);
 wakeDate.setHours(Math.floor(wakeMins/60), wakeMins%60, 0, 0);
 if(wakeDate.getTime() > testDate.getTime()) wakeDate.setDate(wakeDate.getDate()-1);
 return wakeDate.toISOString();
}
function findMostRecentSleepWakeDateTimeIso(result){
 const direct = result?.sleepLog?.wakeDateTimeIso;
 if(direct){
  const d = new Date(direct);
  if(isFinite(d.getTime())) return direct;
 }
 const testIso = result?.time;
 const testDate = new Date(testIso);
 if(!isFinite(testDate.getTime())) return null;
 const history = Array.isArray(state?.history) ? state.history : [];
 let bestIso = null;
 let bestMs = -Infinity;
 for(const r of history){
  const iso = r?.sleepLog?.wakeDateTimeIso;
  if(!iso) continue;
  const d = new Date(iso);
  const ms = d.getTime();
  if(!isFinite(ms)) continue;
  if(ms <= testDate.getTime() && ms > bestMs){
   bestMs = ms;
   bestIso = iso;
  }
 }
 return bestIso;
}
// Computes elapsed time from the most recent recorded sleep wake datetime.
// Falls back to the latest prior session with sleepLog.wakeDateTimeIso so
// sessions several days after the last recorded sleep still display
// meaningful elapsed time.
function computeTimeSinceLastSleepMinutes(result){
 const wakeIso = findMostRecentSleepWakeDateTimeIso(result);
 const testIso = result?.time;
 if(!wakeIso || !testIso) return null;
 const wakeDate = new Date(wakeIso);
 const testDate = new Date(testIso);
 if(!isFinite(wakeDate.getTime()) || !isFinite(testDate.getTime())) return null;
 const deltaMs = testDate.getTime() - wakeDate.getTime();
 if(deltaMs < 0) return null;
 return Math.round(deltaMs/60000);
}
function formatTimeSinceLastSleepLine(result){
 const mins = computeTimeSinceLastSleepMinutes(result);
 if(mins==null) return null;
 return `Time since last sleep: ${formatElapsedDuration(mins)}`;
}
function computeSleepDurationMinutes(bed,wake){
 const b=parseSleepTimeToMinutes(bed), w=parseSleepTimeToMinutes(wake);
 if(b==null || w==null) return null;
 let d = w - b;
 if(d < 0) d += 24*60;
 return d;
}

function formatClockForDisplay(v){
 if(!v) return "—";
 try{
  const [hh,mm] = String(v).split(":").map(Number);
  if(!Number.isFinite(hh) || !Number.isFinite(mm)) return String(v);
  const use12 = getEffectiveTimeFormat()==="12";
  if(!use12) return `${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}`;
  const suffix = hh >= 12 ? "PM" : "AM";
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2,"0")} ${suffix}`;
 }catch(e){
  return String(v);
 }
}
function formatSleepLine(result){
 const slept = result?.sleepSinceLastTest;
 const sl = result?.sleepLog || null;
 if(slept==="yes"){
  const bed = formatClockForDisplay(sl?.bedtime || null);
  const wake = formatClockForDisplay(sl?.wakeTime || null);
  const dur = sl?.durationMinutes!=null ? formatSleepDuration(sl.durationMinutes) : "—";
  const qLabel = sl?.qualityLabel || "—";
  const qScore = sl?.qualityScore!=null ? `${sl.qualityScore}/3` : "—";
  return `SLEEP: Yes · Bed ${bed} → Wake ${wake} (${dur}) · Quality: ${qLabel} (${qScore})`;
 }
 if(slept==="no"){
  return "SLEEP: No sleep since last test";
 }
 return "SLEEP: Not entered";
}

function updateSleepLoggerUI(){
 const bed=getSleepInputCanonicalValue("sleepBedtimeInput");
 const wake=getSleepInputCanonicalValue("sleepWakeInput");
 const d=computeSleepDurationMinutes(bed,wake);
 const box=$("sleepDurationBox");
 const warn=$("sleepWarnBox");
 if(box) box.textContent = `Sleep duration: ${formatSleepDuration(d)}`;
 if(warn){
  warn.style.display = (d!=null && (d < 30 || d > 16*60)) ? "block" : "none";
  if(warn && warn.style.display==="block") warn.textContent = "This sleep duration looks unusual. Please check hour and AM/PM selections.";
 }
}
function setSleepQuality(score){
 state.sleepLog = state.sleepLog || {};
 state.sleepLog.qualityScore = score;
 state.sleepLog.qualityLabel = score===1 ? "Poor" : score===2 ? "Okay" : score===3 ? "Good" : null;
 const map = {1:$("sleepQualityPoorBtn"), 2:$("sleepQualityOkayBtn"), 3:$("sleepQualityGoodBtn")};
 [1,2,3].forEach(k=>{
  const btn=map[k];
  if(!btn) return;
  btn.style.background = k===score ? "#1a3366" : "";
  btn.style.borderColor = k===score ? "var(--accent)" : "";
 });
}

function updateSleepTimeFormatHint(){
 const el = $("sleepTimeFormatHint");
 if(!el) return;
 let txt = "Use the time format shown by your device when entering sleep and wake times.";
 try{
  if(getEffectiveTimeFormat() === "12"){
   txt = "Enter sleep and wake times using hour, minute, and AM/PM buttons.";
  }else{
   txt = "Enter sleep and wake times using 24-hour time.";
  }
 }catch(e){}
 el.textContent = txt;
}

function showSleepLogger(){
 updateSleepTimeFormatHint();
 applySleepInputFormat();
 updateSleepLoggerUI();
 showOnly("sleepOverlay");
}
function showFatigueOverlay(){
 const fsb=$("fatigueStartBtn"); if(fsb) fsb.classList.add("hidden");
 const fl=$("fatigueList");
 if(fl) fl.querySelectorAll(".fatigue-item").forEach(el=>{ el.style.background=""; el.classList.remove("selected"); });
 showOnly("fatigueOverlay");
}

// Sleep Logger save path:
// - parse current entry mode (12-hour structured fields or 24-hour input)
// - save canonical HH:MM times
// - compute durationMinutes
// - save wakeDateTimeIso anchored to the session date so Results can
//   compute “Time since last sleep” across multiple days
function continueFromSleepLogger(){
 state.sleepSinceLastTest = "yes";
 state.sleepLog = state.sleepLog || {};
 const bed=getSleepInputCanonicalValue("sleepBedtimeInput");
 const wake=getSleepInputCanonicalValue("sleepWakeInput");
 const duration=computeSleepDurationMinutes(bed,wake);
 state.sleepLog.bedtime = bed || null;
 state.sleepLog.wakeTime = wake || null;
 state.sleepLog.durationMinutes = duration;
 if(state.sleepLog.qualityScore==null){
  state.sleepLog.qualityScore = 2;
  state.sleepLog.qualityLabel = "Okay";
 }
 showFatigueOverlay();
}

function showSleepPrompt(){
 resetPretestEntryState();
 showOnly("sleepPromptOverlay");
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
  return;
 }
 $("tutorialOverlay").classList.add("hidden");
 showOnly("tutorialExitOverlay");
}

function tutSkip(){
 $("tutorialOverlay").classList.add("hidden");
 showOnly("tutorialExitOverlay");
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

$("fatigueBackBtn").onclick=()=>{ if(state.sleepSinceLastTest==="yes") showOnly("sleepOverlay"); else showOnly("sleepPromptOverlay"); };

$("sleepPromptYesBtn").onclick=()=>{
 showSleepLogger();
 setStatus("Sleep since last test: Yes");
};
$("sleepPromptNoBtn").onclick=()=>{
 state.sleepSinceLastTest="no";
 state.sleepLog=null;
 showFatigueOverlay();
 setStatus("Sleep since last test: No");
};

$("sleepBedtimeInput").addEventListener("input", (e)=>{ syncSleepInputCanonical(e.currentTarget); updateSleepLoggerUI(); });
$("sleepWakeInput").addEventListener("input", (e)=>{ syncSleepInputCanonical(e.currentTarget); updateSleepLoggerUI(); });
["sleepBedHourInput","sleepBedMinuteInput","sleepWakeHourInput","sleepWakeMinuteInput"].forEach(id=>{
 const el=$(id); if(el) el.addEventListener("input", ()=>updateSleepLoggerUI());
});
const _sba=$("sleepBedAmBtn"); if(_sba) _sba.onclick=(e)=>{ e.preventDefault(); setSleepMeridiem("sleepBed","AM"); updateSleepLoggerUI(); };
const _sbp=$("sleepBedPmBtn"); if(_sbp) _sbp.onclick=(e)=>{ e.preventDefault(); setSleepMeridiem("sleepBed","PM"); updateSleepLoggerUI(); };
const _swa=$("sleepWakeAmBtn"); if(_swa) _swa.onclick=(e)=>{ e.preventDefault(); setSleepMeridiem("sleepWake","AM"); updateSleepLoggerUI(); };
const _swp=$("sleepWakePmBtn"); if(_swp) _swp.onclick=(e)=>{ e.preventDefault(); setSleepMeridiem("sleepWake","PM"); updateSleepLoggerUI(); };
$("sleepQualityPoorBtn").onclick=()=>setSleepQuality(1);
$("sleepQualityOkayBtn").onclick=()=>setSleepQuality(2);
$("sleepQualityGoodBtn").onclick=()=>setSleepQuality(3);
$("sleepContinueBtn").onclick=()=>continueFromSleepLogger();
$("sleepBackBtn").onclick=()=>showOnly("sleepPromptOverlay");

$("sleepPromptBackBtn").onclick=()=>goToStartPage();



const _fsb=$("fatigueStartBtn");
if(_fsb) _fsb.onclick=startTest;
let _adminUnlocked = false;
let _adminReturnTo = "subjectOverlay"; // default return destination
function showAdminOverlay(){
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
}
function openAdminFromOverlay(sourceOverlayId){
 _adminReturnTo = sourceOverlayId || "subjectOverlay";
 if(sourceOverlayId && $(sourceOverlayId)) $(sourceOverlayId).classList.add("hidden");
 showAdminOverlay();
}

$("adminOpenBtn").onclick=()=>{
 _adminReturnTo = "subjectOverlay";
 showAdminOverlay();
};
$("tutNextBtn").onclick=()=>tutNext();

// Profile overlay buttons
const _psb=$("profileSaveBtn"); if(_psb) _psb.onclick=saveAndContinueProfile;

// Profile / ASTERISK page button — can open even before email is entered
const _peb=$("profileEditBtn"); if(_peb) _peb.onclick=()=>{
 const email=($("subjectIdInput")?.value||"").trim().toLowerCase();
 openProfileFromContext("subjectOverlay", email);
};

// Profile button from summary page
const _spb=$("summaryProfileBtn"); if(_spb) _spb.onclick=(e)=>{
 if(e) e.preventDefault();
 const p=loadProfile();
 const email=p?.email||state.subjectId||"";
 openProfileFromContext("summaryOverlay", email);
};
const _prb=$("profileResetBtn"); if(_prb) _prb.onclick=resetProfile;
const _prs=$("profileResetSessionsBtn"); if(_prs) bindDoubleTapConfirm(_prs, ()=>resetAllSessions(), "Reset Sessions", "Tap again to delete sessions");
const _pt12=$("profileTime12Btn"); if(_pt12) _pt12.onclick=(e)=>{ if(e) e.preventDefault(); profileSelectTimeFormat("12"); };
const _pt24=$("profileTime24Btn"); if(_pt24) _pt24.onclick=(e)=>{ if(e) e.preventDefault(); profileSelectTimeFormat("24"); };
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
 const ctx = resolveResultContext(null, null, "admin last result");
 if(!ctx.result){ setStatus("No results yet."); return; }
 $("adminOverlay").classList.add("hidden");
 openSummarySession(ctx.index);
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
$("summaryRestartBtn").onclick=()=>{ $("summaryOverlay").classList.add("hidden"); const fg=$("fullGraphOverlay"); if(fg) fg.classList.add("hidden"); goToStartPage(); };
const _sspeed=$("summarySpeedometerBtn"); if(_sspeed) _sspeed.onclick=()=>{ $("summaryOverlay").classList.add("hidden"); openSpeedometerPage(); };
const _sssel=$("summarySessionSelect"); if(_sssel) _sssel.onchange=()=>openSummarySession(Number(_sssel.value));
const _ssprev=$("summaryPrevBtn"); if(_ssprev) _ssprev.onclick=()=>{ const s=$("summarySessionSelect"); if(!s||!s.options.length) return; s.selectedIndex=Math.max(0, s.selectedIndex-1); if(s.onchange) s.onchange(); };
const _ssnext=$("summaryNextBtn"); if(_ssnext) _ssnext.onclick=()=>{ const s=$("summarySessionSelect"); if(!s||!s.options.length) return; s.selectedIndex=Math.min(s.options.length-1, s.selectedIndex+1); if(s.onchange) s.onchange(); };
const _spsel=$("speedometerSessionSelect"); if(_spsel) _spsel.onchange=()=>openSpeedometerSession(Number(_spsel.value));
const _spprev=$("speedometerPrevBtn"); if(_spprev) _spprev.onclick=()=>{ const s=$("speedometerSessionSelect"); if(!s||!s.options.length) return; s.selectedIndex=Math.max(0, s.selectedIndex-1); if(s.onchange) s.onchange(); };
const _spnext=$("speedometerNextBtn"); if(_spnext) _spnext.onclick=()=>{ const s=$("speedometerSessionSelect"); if(!s||!s.options.length) return; s.selectedIndex=Math.min(s.options.length-1, s.selectedIndex+1); if(s.onchange) s.onchange(); };
const _spm4=$("speedometerMode4ToggleBtn"); if(_spm4) _spm4.onclick=()=>{ state.speedometerMode4Metric = String(state.speedometerMode4Metric||"spi").toLowerCase()==="cpi" ? "spi" : "cpi"; openSpeedometerSession(getSpeedometerSelectedIndex()); };
const _orb=$("outcomeResultsBtn"); if(_orb) _orb.onclick=()=>{ $("outcomeOverlay").classList.add("hidden"); stopSpeedometer(); openSummarySession(getSpeedometerSelectedIndex()); setTestingQuiet(false); };
const _sadmin=$("speedAdminBtn"); if(_sadmin) _sadmin.onclick=()=>openAdminFromOverlay("outcomeOverlay");
$("summaryAdminBtn").onclick=()=>openAdminFromOverlay("summaryOverlay");

async function cogspeedDeregisterServiceWorkers(){
 if(!("serviceWorker" in navigator)) return false;
 const regs=await navigator.serviceWorker.getRegistrations();
 await Promise.all(regs.map(r=>r.unregister()));
 return true;
}
async function cogspeedClearCachesOnly(){
 if(!("caches" in window)) return false;
 const keys=await caches.keys();
 await Promise.all(keys.map(k=>caches.delete(k)));
 return true;
}
async function cogspeedDevReset(){
 try{ await cogspeedDeregisterServiceWorkers(); }catch(e){}
 try{ await cogspeedClearCachesOnly(); }catch(e){}
 Object.keys(localStorage).forEach(k=>{ if(k.startsWith("cogspeed_")||k.startsWith("cogblock_")) localStorage.removeItem(k); });
 return true;
}
async function cogspeedResetter(){ return cogspeedDevReset(); }
async function cogspeedClearSWCache(){ return cogspeedClearCachesOnly(); }
async function cogspeedFullDevReset(){ return cogspeedDevReset(); }
window.cogspeedDeregisterServiceWorkers=cogspeedDeregisterServiceWorkers;
window.cogspeedClearCachesOnly=cogspeedClearCachesOnly;
window.cogspeedDevReset=cogspeedDevReset;
window.cogspeedResetter=cogspeedResetter;
window.cogspeedClearSWCache=cogspeedClearSWCache;
window.cogspeedFullDevReset=cogspeedFullDevReset;

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
  try{ updateStartPageLinks(); }catch(err){}
  try{ wireEmailSelectControls(); }catch(err){}
  try{ wireEmailDraftAction(); }catch(err){}
  try{ syncEditableEmailRecipient(); }catch(err){}
  try{ wireResponseGraphControls(); }catch(err){}
 });
}


$("summaryRankedBtn").onclick=()=>{ const selected=state.history[getSummarySelectedIndex()]; if(!selected) return; buildRankedSummary(selected); $("summaryOverlay").classList.add("hidden"); $("rankedOverlay").classList.remove("hidden"); };

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

function getMode4SpeedometerMetric(result){
 const pref = String(state.speedometerMode4Metric||"spi").toLowerCase()==="cpi" ? "cpi" : "spi";
 const csr = Number(result && (result.correctSustainedResponses!=null ? result.correctSustainedResponses : result.mode4SustainedCorrect));
 const spi = Number(result && result.sustainedProcessingIndex);
 const sblp = Number(result && result.sustainedBlockLimitPerformanceMs);
 const total = Math.max(1, Number(result && result.mode4SustainedTargetCount) || 10);
 const mbs = Number(result && (result.mode4AdaptiveMbsMs!=null ? result.mode4AdaptiveMbsMs : result.averageLast2BlockingScoresMs));
 const cpi = Number.isFinite(mbs) ? computeCPI(mbs) : (Number.isFinite(Number(result && result.cognitivePerformanceIndex)) ? Number(result.cognitivePerformanceIndex) : null);
 if(pref==="cpi"){
  return {
   score:Number.isFinite(cpi)?Math.max(0,Math.min(100,cpi)):0,
   scoreLabel:"CPI",
   boxes:[{label:"MBS", value:Number.isFinite(mbs)?`${Number(mbs).toFixed(1)} ms`:"—"}]
  };
 }
 const spiScore = Number.isFinite(spi) ? Math.max(0,Math.min(100,spi)) : computeSPI(Number.isFinite(csr)?csr:0,total);
 return {
  score:spiScore,
  scoreLabel:"SPI",
  boxes:[
   {label:"CSR", value:Number.isFinite(csr)?String(Math.round(csr)):"—"},
   {label:"SBLP", value:Number.isFinite(sblp)?`${Number(sblp).toFixed(1)} ms`:"—"}
  ]
 };
}

function renderMode4SpeedometerBoxes(metric){
 const wrap = $("speedometerMode4Metrics");
 if(!wrap) return;
 const boxes = metric && Array.isArray(metric.boxes) ? metric.boxes : [];
 if(!boxes.length){ wrap.innerHTML=""; wrap.classList.add("hidden"); return; }
 wrap.classList.remove("hidden");
 wrap.style.display = "grid";
 wrap.innerHTML = boxes.map(b=>`<div class="summary-card"><div class="summary-card-label">${b.label}</div><div class="summary-card-val" style="font-size:20px">${b.value}</div></div>`).join("");
}

function renderSpeedometerOutcome(result, sessionIndex){
 const outcome = $("outcomeOverlay");
 const canvas = $("speedometerCanvas");
 syncOutcomeStatusText(result);
 if(!outcome || !canvas) return;
 outcome.classList.remove("hidden");
 const success = !!(result && isTestSuccess(result));
 let cps = success && result ? Math.max(0, Math.min(100, result.cognitivePerformanceIndex||0)) : 0;
 let mbs = result && result.averageLast2BlockingScoresMs!=null ? result.averageLast2BlockingScoresMs : null;
 let scoreLabel = "CPI";
 let metricLabel = "MBS";
 let mode4MetricBoxes = null;
 const isMode4Speedometer = !!(result && result.testMode==="mode4");
 if(isMode4Speedometer){
  const mode4Metric = getMode4SpeedometerMetric(result);
  cps = success ? mode4Metric.score : 0;
  if(success){
   if(String(mode4Metric.scoreLabel||"SPI")==="SPI"){
    mbs = Number(result && result.sustainedBlockLimitPerformanceMs);
    metricLabel = "SBLP";
   }else{
    mbs = Number(result && (result.mode4AdaptiveMbsMs!=null ? result.mode4AdaptiveMbsMs : result.averageLast2BlockingScoresMs));
    metricLabel = "MBS";
   }
   if(!Number.isFinite(mbs)) mbs = null;
  }else{
   mbs = null;
   metricLabel = String(mode4Metric.scoreLabel||"SPI")==="SPI" ? "SBLP" : "MBS";
  }
  scoreLabel = mode4Metric.scoreLabel;
  mode4MetricBoxes = mode4Metric.boxes || null;
 }
 const wrap = $("speedometerWrap");
 if(wrap) canvas.style.width = wrap.offsetWidth + "px";
 const idx = Number.isFinite(Number(sessionIndex)) ? Math.max(0, Math.min(state.history.length-1, Number(sessionIndex))) : (result ? Math.max(0, state.history.indexOf(result)) : Math.max(0, state.history.length-1));
 setActiveResultContext(result, idx>=0?idx:null, idx>=0?"rendered from history":"rendered current result");
 if(idx>=0) syncSpeedometerSessionSelect(idx);
 applySpeedometerSourceDiagnostic(result, idx>=0?idx:null, state.activeResultSource);
 const mode4Toggle=$("speedometerMode4ToggleBtn");
 if(mode4Toggle){
  if(isMode4Speedometer){
   mode4Toggle.classList.remove("hidden");
   mode4Toggle.textContent = String(state.speedometerMode4Metric||"spi").toLowerCase()==="cpi" ? "Show SPI / CSR / SBLP" : "Show CPI / MBS";
  }else{
   mode4Toggle.classList.add("hidden");
  }
 }
 renderMode4SpeedometerBoxes(isMode4Speedometer ? {boxes:mode4MetricBoxes||[]} : null);
 stopSpeedometer();
 setTimeout(()=>animateSpeedometer(canvas, cps, mbs, success, scoreLabel, metricLabel), 80);
 renderSpfGaugeForResult(result);
 setTestingQuiet(false);
}

function syncOutcomeStatusText(result){
 const ot=$("outcomeText"), orr=$("outcomeReasonText");
 if(!ot) return;
 const ok = !!(result && isTestSuccess(result));
 ot.textContent = ok ? "Success!" : "Failed";
 ot.className = "outcome-text " + (ok ? "success" : "failed");
 if(orr) orr.textContent = (result && result.endReason) ? result.endReason : "Run complete";
}

function openSpeedometerPage(sessionIndex){
 try{ wireEmailSelectControls(); }catch(err){}
 try{ wireEmailDraftAction(); }catch(err){}
 const ctx = resolveResultContext(null, sessionIndex, "openSpeedometerPage");
 const idx = Number.isFinite(Number(ctx.index)) ? Math.max(0, Math.min(state.history.length-1, Number(ctx.index))) : null;
 if(idx!=null){
  openSpeedometerSession(idx);
 }else{
  goToStartPage();
 }
}

function openSpeedometerFromAdmin(sessionIndex){
 const admin = $("adminOverlay");
 if(admin) admin.classList.add("hidden");
 const ctx = resolveResultContext(null, sessionIndex, "openSpeedometerFromAdmin");
 const idx = Number.isFinite(Number(ctx.index)) ? Math.max(0, Math.min(state.history.length-1, Number(ctx.index))) : null;
 if(idx!=null){
  openSpeedometerSession(idx);
 }else{
  goToStartPage();
 }
}

$("trialLogCloseBtn").onclick=()=>{ $("trialLogOverlay").classList.add("hidden"); openSpeedometerFromAdmin(); };

const _rrab=$("rateRtAdminBtn"); if(_rrab) _rrab.onclick=()=>openAdminFromOverlay("rateRtOverlay");


const _apt=$("adminPerfTimeBtn"); if(_apt) _apt.onclick=()=>{ $("adminOverlay").classList.add("hidden"); openPerformanceOverTimePage(); };
const _spt=$("speedPerfTimeBtn"); if(_spt) _spt.onclick=()=>{ $("outcomeOverlay").classList.add("hidden"); openPerformanceOverTimePage(); };
const _ptb=$("perfTimeBackBtn"); if(_ptb) _ptb.onclick=()=>{ $("perfTimeOverlay").classList.add("hidden"); openSpeedometerPage(); };
const _pta=$("perfTimeAdminBtn"); if(_pta) _pta.onclick=()=>openAdminFromOverlay("perfTimeOverlay");

const _rsp=$("rankedSpeedometerBtn"); if(_rsp) _rsp.onclick=()=>{ $("rankedOverlay").classList.add("hidden"); openSpeedometerPage(); };
const _rrs=$("rankedRestartBtn"); if(_rrs) _rrs.onclick=()=>{ $("rankedOverlay").classList.add("hidden"); goToStartPage(); };
const _rra=$("rankedAdminBtn"); if(_rra) _rra.onclick=()=>openAdminFromOverlay("rankedOverlay");

const _stl=$("speedTrialLogBtn"); if(_stl) _stl.onclick=()=>{ $("outcomeOverlay").classList.add("hidden"); buildTrialLog(getSpeedometerSelectedIndex()); $("trialLogOverlay").classList.remove("hidden"); };

const _srr=$("speedRateRtBtn"); if(_srr) _srr.onclick=()=>{ $("outcomeOverlay").classList.add("hidden"); buildRateRtOverlay(getSpeedometerSelectedIndex()); $("rateRtOverlay").classList.remove("hidden"); };
const _rateRtCloseBtn=$("rateRtCloseBtn"); if(_rateRtCloseBtn) _rateRtCloseBtn.onclick=()=>{ $("rateRtOverlay").classList.add("hidden"); openSpeedometerPage(); };

const _srg=$("speedResponseGraphBtn"); if(_srg) _srg.onclick=()=>{ openResponseGraphPage(false, getSpeedometerSelectedIndex()); };
const _arg=$("adminResponseGraphBtn"); if(_arg) _arg.onclick=()=>{ openResponseGraphPage(true); };
const _fgs=$("fullGraphSpeedometerBtn"); if(_fgs) _fgs.onclick=()=>{ $("fullGraphOverlay").classList.add("hidden"); openSpeedometerPage(); };
const _fga=$("fullGraphAdminBtn"); if(_fga) _fga.onclick=()=>openAdminFromOverlay("fullGraphOverlay");

const _tla=$("trialLogAdminBtn"); if(_tla) _tla.onclick=()=>openAdminFromOverlay("trialLogOverlay");

const _ssp=$("speedStartPageBtn"); if(_ssp) _ssp.onclick=()=>{ hideAllOverlays(); goToStartPage(); };

// ─── E-MAIL SELECT PAGE ───────────────────────────────────────
// Opens from Speedometer. Provides recipient selection and a
// dropdown for which results data to include in the email.
// Includes links back to Speedometer and Start.




/* ===== Performance vs Time graph ===== */
const perfGraphState = {
  preset: "all",
  fromDate: "",
  toDate: ""
};

function perfSessionMs(r){
  if(!r) return null;
  const endReason = String(r.endReason || "");
  const failed = /^FAILED\b/i.test(endReason) || /^Failed\b/i.test(endReason) || endReason.includes("Retest") || endReason.includes("Practice!");
  if(failed) return 3000;
  const candidates = [
    r.sustainedBlockLimitPerformanceMs,
    r.mode4AdaptiveMbsMs,
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
  const mode4Spi = Number(r.sustainedProcessingIndex);
  if(Number.isFinite(mode4Spi)) return mode4Spi;
  const explicit = Number(r.cognitivePerformanceIndex);
  if(Number.isFinite(explicit)) return explicit;
  const ms = perfSessionMs(r);
  return ms!=null ? computeCPI(ms) : null;
}

function getSessionUtcMs(r){
  if(!r) return NaN;
  const candidates = [
    r.time,
    r?.geo?.gmt_time,
    r?.geo?.local_time
  ];
  for(const v of candidates){
    const ms = Date.parse(v);
    if(Number.isFinite(ms)) return ms;
  }
  return NaN;
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
    perfGraphState.preset = preset.value || "all";
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
  const worstMs = Number(settings.cpiWorstMs)||3000;
  const PAD = {top:72,right:76,bottom:n===1?82:112,left:126};
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  const allTriggeredMode4 = slice.every(r=>r && r.testMode==="mode4" && r.mode4Triggered);
  const mixedMode4 = slice.some(r=>r && r.testMode==="mode4" && r.mode4Triggered) && !allTriggeredMode4;
  const leftMetricLabel = allTriggeredMode4 ? "SBLP ms" : mixedMode4 ? "MBS / SBLP ms" : "MBS ms";
  const leftScoreLabel = allTriggeredMode4 ? "SPI" : mixedMode4 ? "CPI / SPI" : "CPI";
  const dotLegend = allTriggeredMode4 ? "Blue dot = SPI" : mixedMode4 ? "Blue dot = CPI / SPI" : "Blue dot = CPI";
  const ringLegend = allTriggeredMode4 ? "Orange circle = SBLP" : mixedMode4 ? "Orange circle = MBS / SBLP" : "Orange circle = MBS";

  function xOf(i){
    if(n<=1) return PAD.left + cW/2;
    return PAD.left + (i/(n-1))*cW;
  }
  function yLeftFromScore(v){ return PAD.top + cH - ((v-0)/100)*cH; }
  function scoreFromMs(ms){
    const span=(worstMs-bestMs)||1;
    return Math.max(0, Math.min(100, 100*(worstMs-ms)/span));
  }
  function yLeftFromMs(ms){ return yLeftFromScore(scoreFromMs(ms)); }
  function yRightFromSpf(v){ return PAD.top + cH - (((v-1)/6))*cH; }

  ctx.strokeStyle="rgba(127,215,255,0.16)";
  ctx.lineWidth=1;
  [0,25,50,75,100].forEach(v=>{
    const y=yLeftFromScore(v);
    ctx.beginPath(); ctx.moveTo(PAD.left,y); ctx.lineTo(PAD.left+cW,y); ctx.stroke();
  });

  const scoreTicks = [100,75,50,25,0];
  const metricTicks = scoreTicks.map(score => Math.round(bestMs + ((100-score)/100)*(worstMs-bestMs)));
  ctx.font="11px sans-serif";
  ctx.textAlign="right";
  scoreTicks.forEach((score, i)=>{
    const y = yLeftFromScore(score);
    ctx.strokeStyle="#ffb357";
    ctx.beginPath(); ctx.moveTo(PAD.left-46, y); ctx.lineTo(PAD.left-36, y); ctx.stroke();
    ctx.fillStyle="#ffb357"; ctx.fillText(String(metricTicks[i]), PAD.left-52, y+4);
    ctx.strokeStyle="#7fd7ff";
    ctx.beginPath(); ctx.moveTo(PAD.left-16, y); ctx.lineTo(PAD.left-6, y); ctx.stroke();
    ctx.fillStyle="#7fd7ff"; ctx.fillText(String(score), PAD.left-22, y+4);
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
  ctx.fillText(`All sessions sequentially    Subjects: ${subjectCount}    Sessions: ${n}    Chronology: Device Local Time${rangeLabel}`, PAD.left, 46);

  ctx.save();
  ctx.translate(18, PAD.top + cH/2); ctx.rotate(-Math.PI/2);
  ctx.fillStyle="#ffb357"; ctx.textAlign="center"; ctx.font="bold 11px sans-serif";
  ctx.fillText(leftMetricLabel, 0, 0); ctx.restore();

  ctx.save();
  ctx.translate(42, PAD.top + cH/2); ctx.rotate(-Math.PI/2);
  ctx.fillStyle="#7fd7ff"; ctx.textAlign="center"; ctx.font="bold 11px sans-serif";
  ctx.fillText(leftScoreLabel, 0, 0); ctx.restore();

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

  function drawCombinedPerfMarkers(scoreVals, metricVals){
    ctx.strokeStyle="#7fd7ff";
    ctx.lineWidth=2.5;
    ctx.beginPath();
    let started=false;
    scoreVals.forEach((score,i)=>{
      const metric = metricVals[i];
      if(score==null || metric==null){ started=false; return; }
      const x = xOf(i), y = yLeftFromScore(score);
      if(!started){ ctx.moveTo(x,y); started=true; } else { ctx.lineTo(x,y); }
    });
    if(scoreVals.filter((score,i)=>score!=null && metricVals[i]!=null).length>1) ctx.stroke();

    scoreVals.forEach((score,i)=>{
      const metric = metricVals[i];
      if(score==null || metric==null) return;
      const x = xOf(i), y = yLeftFromScore(score);
      ctx.beginPath(); ctx.arc(x,y,5.6,0,Math.PI*2);
      ctx.strokeStyle="#ffb357"; ctx.lineWidth=3; ctx.stroke();
      ctx.beginPath(); ctx.arc(x,y,2.8,0,Math.PI*2);
      ctx.fillStyle="#7fd7ff"; ctx.fill();
    });
  }

  const scoreVals = slice.map(r=>perfSessionCpi(r));
  const metricVals = slice.map(r=>perfSessionMs(r));
  const spfVals = slice.map(r=>r && r.samnPerelli && r.samnPerelli.score!=null ? Number(r.samnPerelli.score) : null);
  function sleepQualityColor(r){
    const q = String(r?.sleepLog?.qualityLabel || "").trim().toLowerCase();
    if(q==="poor") return "#ff4d4f";
    if(q==="okay") return "#ffd84d";
    if(q==="good") return "#46d36a";
    return null;
  }
  const sleepColors = slice.map(r=>sleepQualityColor(r));

  const hasAnyMetric = scoreVals.some(v=>v!=null) || metricVals.some(v=>v!=null) || spfVals.some(v=>v!=null) || sleepColors.some(v=>v!=null);
  if(!hasAnyMetric){
    ctx.fillStyle="#d7e7f8";
    ctx.font="bold 15px sans-serif";
    ctx.textAlign="center";
    ctx.fillText("No graphable session values yet", PAD.left + cW/2, PAD.top + cH/2);
    return;
  }

  drawLine(spfVals, v=>yRightFromSpf(v), "#88ff88", "diamond");
  drawCombinedPerfMarkers(scoreVals, metricVals);

  const sleepBarY = PAD.top + cH + 18;
  const sleepBarH = 10;
  const sleepW = n<=1 ? Math.min(28, cW*0.18) : Math.max(8, Math.min(18, cW/Math.max(n,14)));
  sleepColors.forEach((color,i)=>{
    if(!color) return;
    const x = xOf(i) - sleepW/2;
    ctx.fillStyle = color;
    ctx.fillRect(x, sleepBarY, sleepW, sleepBarH);
    ctx.strokeStyle = "rgba(215,231,248,0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, sleepBarY, sleepW, sleepBarH);
  });

  ctx.textAlign="left";
  ctx.font="bold 11px sans-serif";
  ctx.beginPath();
  ctx.arc(PAD.left+7, PAD.top-18, 5.6, 0, Math.PI*2);
  ctx.strokeStyle="#ffb357";
  ctx.lineWidth=3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(PAD.left+7, PAD.top-18, 2.8, 0, Math.PI*2);
  ctx.fillStyle="#7fd7ff";
  ctx.fill();
  ctx.fillStyle="#7fd7ff";
  ctx.fillText(dotLegend, PAD.left+20, PAD.top-14);
  ctx.fillStyle="#ffb357";
  ctx.fillText(ringLegend, PAD.left+148, PAD.top-14);
  ctx.fillStyle="#88ff88"; ctx.fillText("◆ SP-FS", PAD.left+322, PAD.top-14);

  const legendY = PAD.top + cH + 38;
  ctx.fillStyle = "#ff4d4f"; ctx.fillRect(PAD.left, legendY, 12, 8);
  ctx.fillStyle = "#d7e7f8"; ctx.fillText("Sleep: Poor", PAD.left+18, legendY+8);
  ctx.fillStyle = "#ffd84d"; ctx.fillRect(PAD.left+92, legendY, 12, 8);
  ctx.fillStyle = "#d7e7f8"; ctx.fillText("Okay", PAD.left+110, legendY+8);
  ctx.fillStyle = "#46d36a"; ctx.fillRect(PAD.left+156, legendY, 12, 8);
  ctx.fillStyle = "#d7e7f8"; ctx.fillText("Good", PAD.left+174, legendY+8);
}


function getLastGraphableResult(){
 const h = state.history || [];
 for(let i=h.length-1;i>=0;i--){
  const r = h[i];
  if(r && (
    (Array.isArray(r.rtLog) && r.rtLog.length) ||
    r.testMode==="mode1" || r.testMode==="mode2" || r.testMode==="mode3" || r.testMode==="mode4"
  )){
   return r;
  }
 }
 return null;
}

function getGraphableResults(){
 const h = state.history || [];
 const out = [];
 for(let i=0;i<h.length;i++){
  const r = h[i];
  if(r && ((Array.isArray(r.rtLog) && r.rtLog.length) || r.testMode==="mode1" || r.testMode==="mode2" || r.testMode==="mode3" || r.testMode==="mode4")){
   out.push({result:r,index:i});
  }
 }
 return out;
}

function syncResponseGraphSessionSelect(selectedValue){
 const sel = $("responseGraphSessionSelect");
 if(!sel) return null;
 const graphable = getGraphableResults();
 const options = graphable.map(({result,index})=>{
  const when = result.time ? new Date(result.time).toLocaleString() : `Session ${index+1}`;
  return `<option value="${index}">Session ${index+1} · ${when}</option>`;
 }).join("");
 if(sel.dataset.optionsHtml !== options){
  sel.innerHTML = options;
  sel.dataset.optionsHtml = options;
 }
 if(selectedValue!=null && graphable.some(g=>g.index===Number(selectedValue))){
  sel.value = String(selectedValue);
 }else if(sel.options.length){
  sel.selectedIndex = sel.options.length - 1;
 }
 return sel.value!=="" ? Number(sel.value) : null;
}

function renderResponseGraphPage(selectedValue){
 const canvas = $("fullModeGraph");
 const info = $("responseGraphInfo");
 const actualIndex = syncResponseGraphSessionSelect(selectedValue);
 const target = Number.isFinite(actualIndex) ? (state.history||[])[actualIndex] : getLastGraphableResult();
 if(target && canvas){
  drawModeResultChart(canvas, target);
  if(info){
   const when = target.time ? new Date(target.time).toLocaleString() : `session ${Number.isFinite(actualIndex)?actualIndex+1:""}`;
   info.textContent = `Response time by trial for ${when}. Higher on the graph = faster (smaller ms). ${getResponseGraphPhaseLegendText(target)}`;
  }
 }else if(info){
  info.textContent = "No graphable session data available.";
 }
}

function wireResponseGraphControls(){
 const sel = $("responseGraphSessionSelect");
 const prev = $("responseGraphPrevBtn");
 const next = $("responseGraphNextBtn");
 if(sel && !sel.dataset.wired){
  sel.dataset.wired = "1";
  sel.onchange = ()=>renderResponseGraphPage(Number(sel.value));
 }
 if(prev && !prev.dataset.wired){
  prev.dataset.wired = "1";
  prev.onclick = ()=>{
   if(!sel || !sel.options.length) return;
   sel.selectedIndex = Math.max(0, sel.selectedIndex - 1);
   if(sel.onchange) sel.onchange();
  };
 }
 if(next && !next.dataset.wired){
  next.dataset.wired = "1";
  next.onclick = ()=>{
   if(!sel || !sel.options.length) return;
   sel.selectedIndex = Math.min(sel.options.length - 1, sel.selectedIndex + 1);
   if(sel.onchange) sel.onchange();
  };
 }
}

function openResponseGraphPage(fromAdmin, selectedIndex){
 hideAllOverlays();
 const ov = $("fullGraphOverlay");
 if(ov) ov.classList.remove("hidden");
 wireResponseGraphControls();
 const graphable = getGraphableResults();
 const initialIndex = Number.isFinite(Number(selectedIndex)) && graphable.some(g=>g.index===Number(selectedIndex)) ? Number(selectedIndex) : (graphable.length ? graphable[graphable.length-1].index : null);
 renderResponseGraphPage(initialIndex);
 const adminBtn = $("fullGraphAdminBtn");
 if(adminBtn) adminBtn.style.display = fromAdmin ? "none" : "";
}

function renderPerformanceOverTimePage(){
  drawPerformanceOverTimeChart($("perfTimeGraph"), state.history||[]);
}

function openPerformanceOverTimePage(){
  hideAllOverlays();
  const ov=$("perfTimeOverlay");
  if(ov) ov.classList.remove("hidden");
  wirePerfGraphControls();
  renderPerformanceOverTimePage();
  requestAnimationFrame(()=>requestAnimationFrame(renderPerformanceOverTimePage));
  setTimeout(renderPerformanceOverTimePage,80);
}
/* ===== end Performance vs Time graph section ===== */


/* ===== E-mail Select wiring ===== */
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

/* ===== end E-mail Select wiring ===== */


/* ===== E-mail draft action ===== */
function formatLastTrialLogText(last){
  if(!last || !Array.isArray(last.rtLog) || !last.rtLog.length) return "No trial detail log available.";
  const rows = last.rtLog.map(r=>{
    const clock = r.clockTime ? new Date(r.clockTime).toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"}) : "—";
    const presented = r.durationMs!=null ? `${r.durationMs} ms` : "—";
    const rt = r.rt!=null ? `${r.rt} ms` : "—";
    const change = r.rateChangeMs!=null ? `${r.rateChangeMs>0?"+":""}${r.rateChangeMs} ms` : "—";
    const maxRaf = r.maxRafIntervalMs!=null ? `${Number(r.maxRafIntervalMs).toFixed(2)} ms` : "—";
    return [
      `#${r.seq||""}`,
      `Clock ${clock}`,
      `Phase ${r.phase||"—"}`,
      `Presented ${presented}`,
      `RT ${rt}`,
      `Rate change ${change}`,
      `Trial result ${r.outcome||"—"}`,
      `Correct target ${r.correctCell||"—"}`,
      `Chosen response ${r.response||"—"}`,
      `Max rAF ${maxRaf}`,
      `Why changed ${r.rateChangeReason||"—"}`
    ].join(" | ");
  });
  return "Trial Detail Log\n\n" + rows.join("\n");
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
    const dur = r.durationMs!=null ? `${r.durationMs} ms` : "—";
    const rt = r.rt!=null ? `${r.rt} ms` : "—";
    return `${i+1}. Trial ${r.seq||i+1} | Phase ${r.phase||"—"} | Presented ${dur} | RT ${rt} | Trial result ${r.outcome||"—"}`;
  });
  return "Response-Time Graph Data\n\n" + rows.join("\n");
}

function formatLastPerfTimeText(){
  const h = state.history || [];
  if(!h.length) return "No performance-over-time history available.";
  const rows = h.map((r,i)=>{
    const when = r.time ? new Date(r.time).toLocaleString() : `Session ${i+1}`;
    const cpi = r.testMode==="mode4" && r.sustainedProcessingIndex!=null ? Math.round(Number(r.sustainedProcessingIndex)) : (r.cognitivePerformanceIndex!=null ? Math.round(Number(r.cognitivePerformanceIndex)) : "—");
    const mbs = r.testMode==="mode4" ? (r.correctSustainedResponses!=null ? `${Math.round(Number(r.correctSustainedResponses))} CSR` : (r.sustainedBlockLimitPerformanceMs!=null ? Math.round(Number(r.sustainedBlockLimitPerformanceMs))+" ms" : "—")) : (r.averageLast2BlockingScoresMs!=null ? Math.round(Number(r.averageLast2BlockingScoresMs))+" ms" : "—");
    const spf = r.samnPerelli && r.samnPerelli.score!=null ? r.samnPerelli.score : "—";
    const sleep = r.sleepLog && r.sleepLog.qualityLabel ? r.sleepLog.qualityLabel : (r.sleepSinceLastTest==="no" ? "No sleep since last test" : "—");
    return `${i+1}. ${when} | ${r.testMode==="mode4"?"SPI":"CPI"} ${cpi} | ${r.testMode==="mode4"?"CSR/SBLP":"MBS"} ${mbs} | SP-FS ${spf} | Sleep ${sleep}`;
  });
  return "Performance over Date and Time\n\n" + rows.join("\n");
}

function formatLastRateRtText(last){
  if(!last) return "No Presentation Rate vs Response Time data available.";
  const rows = (last.rtLog||[]).map((r,i)=>{
    const dur = r.durationMs!=null ? `${r.durationMs} ms` : "—";
    const rt = r.rt!=null ? `${r.rt} ms` : "—";
    const change = r.rateChangeMs!=null ? `${r.rateChangeMs>0?"+":""}${r.rateChangeMs} ms` : "—";
    return `${i+1}. Phase ${r.phase||"—"} | Presented ${dur} | RT ${rt} | Rate change ${change} | Trial result ${r.outcome||"—"}`;
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


/* ===== end E-mail draft action ===== */


/* ===== Editable recipient field ===== */
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
/* ===== end Editable recipient field ===== */


window.addEventListener("resize", ()=>{
 const last = state.history && state.history.length ? state.history[state.history.length-1] : null;
 if(last && !$("outcomeOverlay").classList.contains("hidden")){
  try{ renderSpfGaugeForResult(last); }catch(e){}
 }
});

$("refSleepBtn").onclick=()=>showSleepPrompt();

$("tutorialExitSleepBtn").onclick=()=>showSleepPrompt();
$("tutorialExitBackBtn").onclick=()=>goToStartPage();