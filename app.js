
function shouldPersistSessionForLocalHistory(result){
 const sid = String(result?.subjectId||"").trim().toLowerCase();
 if(isGuestHistorySubjectId(sid)) return false;
 return true;
}

// ═══════════════════════════════════════════════════
// CogSpeed source
// ═══════════════════════════════════════════════════
// Current visible build version used in UI and email subject lines.
const APP_VERSION = "V699";

// ═══════════════════════════════════════════════════
// Current behavior summary (historical details live in CHANGELOG.md)
// - Visible test labels are standardized everywhere as:
//   Mode 1 CogSpeed Adapted, Mode 2 CogSpeed Sustained,
//   Mode 3 Self-paced, and Mode 4 Machine-paced.
// - Mode 2 uses adaptive pacing until convergence, then runs a sustained
//   fixed-rate segment followed by true self-paced final trials.
// - In the Mode 2 final self-paced segment, unanswered trials are ended only
//   by the overall session max-time rule; there is no per-trial timeout.
// - Start and finish handoffs are curtain-neutral and must not depend on
//   curtain animations or DOM state.
// ═══════════════════════════════════════════════════

const RELEASE = APP_VERSION.replace(/^V/i, "");
const STORAGE_PREFIX = `cogspeed_v${RELEASE}`;

// ─── Version guard ───
(function(){
 const VER=`${STORAGE_PREFIX}_profileguard`, key="cogspeed_version";
 const preserve = new Set([`${STORAGE_PREFIX}_profile`, key]);
 const preservePrefixes = ["cogspeed_scheduler_"];
 if(localStorage.getItem(key)!==VER){
  Object.keys(localStorage).forEach(k=>{
   if((k.startsWith("cogspeed_")||k.startsWith("cogblock_")) && !preserve.has(k) && !preservePrefixes.some(prefix=>k.startsWith(prefix))){
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
// NOTE: try to keep DEFAULTS in the same conceptual order as ADMIN_FIELDS,
// and keep labels, CPI comments, personal-baseline threshold text, and any
// table fallbacks aligned. Recent cleanup removed several stale mismatches.
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// FOUR TEST MODES
// mode1 = Mode 1 CogSpeed Adapted
// mode2 = Mode 2 CogSpeed Sustained
// mode3 = Mode 3 Self-paced
// mode4 = Mode 4 Machine-paced
// ═══════════════════════════════════════════════════════════════
const DEFAULTS={
 adminPasscode:"4822",
 defaultTestMode:"mode2",
 testMode:"mode2",
 mode3TrialLimit:150,
 mode3MaxDurationMs:90000,
 mode4CalibrationTrials:10,
 mode4PacedTrialLimit:140,
 mode4MaxDurationMs:90000,
 mode4BaselineFactor:1.1,
 mode2SustainedReliefMinMs:0,
 mode2SustainedReliefPct:-0.1,
 mode2SustainedReliefMaxMs:220,
 mode2SustainedTrialCount:20,
 mode2SustainedWrongFailPercent:50,
 mode2SustainedRollMeanWindow:10,
 mode2SustainedRollMeanThreshold:0.50,
 mode2LateResponseThresholdMs:600,
 mode2FinalTrialCount:2,
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
 cpiWorstMs:2800,
 personalBaselineMaxMbs:1900,
 symbolSet:"standard",
 memoryNoResponseTimeoutMs:15000,
 memoryMinDurationMs:1400,
 memoryMaxDurationMs:5000,
 memoryCpiBestMs:1400,
 memoryCpiWorstMs:3000,
 memoryBaselineMaxMbs:3200,
 memoryMaxTestDurationMs:240000,
 survivalNoResponseTimeoutMs:15000,
 survivalMinDurationMs:1500,
 survivalMaxDurationMs:5200,
 survivalCpiBestMs:1000,
 survivalCpiWorstMs:3000,
 survivalBaselineMaxMbs:3400,
 survivalMaxTestDurationMs:200000,
 deviceBenchmarkEnabled:0,
 timeFormat:"12",
 lateResponseThresholdMs:600, // first response <600ms on next frame may belong to prior frame; a second >=600ms response belongs to current frame
 RecoveryInterTrialDelayMsStart:0, // delay before opening the next recovery or terminal-recovery trial
 ResumeToPacedDelayMs:0, // delay before resuming paced mode after recovery succeeds
 // Mode 2 normative CPA scaffold defaults. These are intentionally editable
 // in Admin because field research is expected to refine both the challenge
 // rule and the expected sustained-performance profile.
 mode2NormExpectedCorrectRate:"0-20:0.82;20.01-40:0.80;40.01-60:0.76;60.01-80:0.70;80.01-100:0.62",
 mode2NormExpectedWrongRate:"0-20:0.03;20.01-40:0.04;40.01-60:0.05;60.01-80:0.07;80.01-100:0.09",
 mode2NormExpectedMissRate:"0-20:0.15;20.01-40:0.16;40.01-60:0.19;60.01-80:0.23;80.01-100:0.29",
 mode2NormExpectedDriftPct:"0-20:4;20.01-40:5;40.01-60:7;60.01-80:9;80.01-100:12",
 mode2NormExpectedCvPct:"0-20:12;20.01-40:13;40.01-60:15;60.01-80:18;80.01-100:22",
 // V699rev151: new accuracy-composite profile, consolidating the previously
 // collinear correct/wrong/miss rates into a single metric
 //   accComposite = correctRate - wrongRate - 0.5 * missRate
 // Expected values are derived from the old expected profile:
 //   0-20:    0.82 - 0.03 - 0.5*0.15 = 0.715
 //   20-40:   0.80 - 0.04 - 0.5*0.16 = 0.680
 //   40-60:   0.76 - 0.05 - 0.5*0.19 = 0.615
 //   60-80:   0.70 - 0.07 - 0.5*0.23 = 0.515
 //   80-100:  0.62 - 0.09 - 0.5*0.29 = 0.385
 mode2NormExpectedAccuracyComposite:"0-20:0.715;20.01-40:0.680;40.01-60:0.615;60.01-80:0.515;80.01-100:0.385",
 mode2NormToleranceCorrectRate:0.12,   // Deprecated in V699rev151 — retained for storage continuity only.
 mode2NormToleranceWrongRate:0.08,     // Deprecated in V699rev151 — retained for storage continuity only.
 mode2NormToleranceMissRate:0.10,      // Deprecated in V699rev151 — retained for storage continuity only.
 mode2NormToleranceDriftPct:8,
 mode2NormToleranceCvPct:10,
 // V699rev151: tolerance for the new accuracy composite. Sized so that a
 // one-tolerance deviation is roughly comparable in magnitude to the prior
 // summed tolerance of the three collinear features it replaces.
 mode2NormToleranceAccuracyComposite:0.15,
 mode2NormWeightCorrect:0,   // V699rev151: RETIRED. Was 3.0. Consolidated into mode2NormWeightAccuracy.
 mode2NormWeightWrong:0,     // V699rev151: RETIRED. Was 2.5. Consolidated into mode2NormWeightAccuracy.
 mode2NormWeightMiss:0,      // V699rev151: RETIRED. Was 3.5. Consolidated into mode2NormWeightAccuracy.
 // V699rev151: upgraded drift and CV weights, since drift is now measured by
 // the stronger OLS-slope estimator and the composite has headroom after the
 // accuracy-feature consolidation.
 mode2NormWeightDrift:6.0,   // V699rev151: was 1.5; now drives OLS-slope residual
 mode2NormWeightCv:6.0,      // V699rev151: was 1.5
 // V699rev151: new consolidated-accuracy weight. Replaces the previous 9.0
 // combined weight (3.0+2.5+3.5) of the three collinear accuracy features.
 mode2NormWeightAccuracy:9.0,
 // V699rev151: total max absolute weighted residual is
 //   9 (accuracy) + 6 (drift) + 6 (CV) = 21
 // The cap is kept at 20 so the cap can actually engage under sufficiently
 // poor sustained-phase performance, while leaving 1 point of weight headroom
 // so no single feature alone saturates the cap.
 mode2NormMaxDelta:20,
 researchModeLocked:0,
 researchUploadEndpoint:'',
 researchIncludeLearningSessions:0,
 researchAutoUpload:0,
 researchRetainRawAfterVerify:0
};

// ═══════════════════════════════════════════════════════════════
// SECTION: ADMIN PANEL — FIELD DEFINITIONS
// Each entry: [settingKey, label, type]
// Drives the admin form UI and maps to DEFAULTS keys above.
// ═══════════════════════════════════════════════════════════════
const ADMIN_FIELDS=[
 // 1-2. Device / test selection
 ["adminPasscode","1. Admin passcode","text"],
 ["defaultTestMode","2. Default test mode for new users / reset devices (default Mode 2 CogSpeed Sustained)","select:mode1|mode2|mode3|mode4"],

 // 3-15. Shared startup / calibration / anti-spoof settings, in program-use order
 ["initialUnusedCalibrationTrials","3. Warm-up calibration trials (default 1)","number"],
 ["initialMeasuredCalibrationTrials","4. Measured calibration trials (default 7)","number"],
 ["calibrationFirstNoResponseMs","5. Calibration first-trial no-response (ms, default 10000)","number"],
 ["calibrationNoResponseMs","6. Calibration later-trial no-response (ms, default 6000)","number"],
 ["calibrationStopErrors","7. Calibration stop after N wrong (default 4)","number"],
 ["calibrationStopSlowMs","8. Calibration avg RT limit (ms, default 6000)","number"],
 ["minDurationMs","9. MP frame minimum duration (ms, default 600)","number"],
 ["maxDurationMs","10. MP frame maximum duration (ms, default 3500)","number"],
 ["maxTestDurationMs","11. Max total test time (ms, default 150000)","number"],
 ["wrongWindowSize","12. Anti-spoof wrong window size (default 5)","number"],
 ["wrongThresholdStop","13. Anti-spoof max wrong in window (default 4)","number"],
 ["rollMeanWindow","14. Anti-spoof rolling mean window (default 10)","number"],
 ["rollMeanThreshold","15. Anti-spoof rolling mean threshold (default 0.50)","number"],

 // 16-35. Mode 1 CogSpeed Adapted, in program-use order
 ["initialPacedPercent","16. Mode 1 MP start: % of calibration avg (default 1.2)","number"],
 ["consecutiveMissesForBlock","17. Mode 1 misses to trigger block (default 2)","number"],
 ["blockRestartPercent","18. Mode 1 restart multiplier after block (default 1.3 = 130% of block baseline)","number"],
 ["spRestartCorrectStreak","19. Mode 1 recovery correct streak to resume (default 2)","number"],
 ["spRestartWrongLimit","20. Mode 1 recovery max wrong before fail (default 3)","number"],
 ["wrongSlowdownMs","21. Mode 1 MP slowdown on wrong (ms, default 50)","number"],
 ["correctSpeedupFactor","22. Mode 1 MP correct formula factor (default 0.30)","number"],
 ["minSpeedupOnCorrectMs","23. Mode 1 MP minimum speedup on correct (ms, default 50)","number"],
 ["maxSpeedupOnCorrectMs","24. Mode 1 MP maximum speedup on correct (ms, default 200)","number"],
 ["lateResponseThresholdMs","25. Mode 1 late response reassignment threshold (ms, default 600)","number"],
 ["recoveryNoResponseMs","26. Mode 1 recovery no-response timeout (ms, default 10000)","number"],
 ["RecoveryInterTrialDelayMsStart","27. Recovery inter-trial delay at start (ms, default 0)","number"],
 ["ResumeToPacedDelayMs","28. Resume-to-paced delay after recovery (ms, default 0)","number"],
 ["maxBlockCount","29. Mode 1 max total blocks before fail (default 6)","number"],
 ["qualifyingBlockGapMs","30. Mode 1 qualifying block max gap (ms, default 250)","number"],
 ["maxTrialCount","31. Mode 1 max paced trials (default 180)","number"],
 ["maxPacedWrong","32. Mode 1 max paced wrong before fail (default 20)","number"],
 ["cpiBestMs","33. Mode 1 CPI best ms anchor (default 800)","number"],
 ["cpiWorstMs","34. Mode 1 CPI worst ms anchor (default 2800)","number"],
 ["personalBaselineMaxMbs","35. Personal Baseline maximum qualifying MBS (ms, default 1900)","number"],

 // 36-42. Mode 2 runtime flow settings, in program-use order
 ["mode2SustainedReliefMinMs","36. Mode 2 sustained relief minimum (ms, default 0)","number"],
 ["mode2SustainedReliefPct","37. Mode 2 sustained relief % of adaptive MBS (default -0.10 = -10%)","number"],
 ["mode2SustainedReliefMaxMs","38. Mode 2 sustained relief cap (ms, default 220)","number"],
 ["mode2SustainedTrialCount","39. Mode 2 sustained trials at adaptive MBS + relief (default 20)","number"],
 ["mode2SustainedWrongFailPercent","40. Mode 2 wrong-fail threshold for sustained phase (default 50% of sustained trials)","number"],
 ["mode2SustainedRollMeanWindow","41. Mode 2 anti-spoof rolling mean window in Sustained Phase (default 10)","number"],
 ["mode2SustainedRollMeanThreshold","42. Mode 2 anti-spoof rolling mean threshold in Sustained Phase (default 0.50)","number"],
 ["mode2LateResponseThresholdMs","43. Mode 2 late response reassignment threshold (ms, default 600)","number"],
 ["mode2FinalTrialCount","44. Mode 2 final self-paced trials (default 2)","number"],

 // 45-46. Mode 3 Self-paced, in program-use order
 ["mode3TrialLimit","45. Mode 3 self-paced trial limit (default 150)","number"],
 ["mode3MaxDurationMs","46. Mode 3 total duration ms (default 90000)","number"],

 // 47-50. Mode 4 Machine-paced, in program-use order
 ["mode4CalibrationTrials","47. Mode 4 self-paced calibration trials (default 10)","number"],
 ["mode4BaselineFactor","48. Mode 4 MP baseline factor from cal avg (default 1.1)","number"],
 ["mode4PacedTrialLimit","49. Mode 4 fixed machine-paced trial limit (default 140)","number"],
 ["mode4MaxDurationMs","50. Mode 4 total duration ms (default 90000)","number"],

 // 51-57. Memory Challenge defaults
 ["memoryNoResponseTimeoutMs","51. Memory Challenge no-response timeout (ms, default 15000)","number"],
 ["memoryMinDurationMs","52. Memory Challenge MP frame minimum duration (ms, default 1400)","number"],
 ["memoryMaxDurationMs","53. Memory Challenge MP frame maximum duration (ms, default 5000)","number"],
 ["memoryCpiBestMs","54. Memory Challenge CPI best ms anchor (default 1400)","number"],
 ["memoryCpiWorstMs","55. Memory Challenge CPI worst ms anchor (default 3000)","number"],
 ["memoryBaselineMaxMbs","56. Memory Challenge baseline max qualifying MBS (ms, default 3200)","number"],
 ["memoryMaxTestDurationMs","55. Memory Challenge max total test time (ms, default 240000)","number"],

 // 58-64. Survival Challenge defaults
 ["survivalNoResponseTimeoutMs","58. Survival Challenge no-response timeout (ms, default 15000)","number"],
 ["survivalMinDurationMs","59. Survival Challenge MP frame minimum duration (ms, default 1500)","number"],
 ["survivalMaxDurationMs","60. Survival Challenge MP frame maximum duration (ms, default 5200)","number"],
 ["survivalCpiBestMs","61. Survival Challenge CPI best ms anchor (default 1000)","number"],
 ["survivalCpiWorstMs","62. Survival Challenge CPI worst ms anchor (default 3000)","number"],
 ["survivalBaselineMaxMbs","63. Survival Challenge baseline max qualifying MBS (ms, default 3400)","number"],
 ["survivalMaxTestDurationMs","62. Survival Challenge max total test time (ms, default 200000) — gives Survival extra headroom over the 150000ms used by Standard/Memory because slower frame timing needs more session budget","number"],

 // 65-79. Mode 2 normative CPA defaults
 ["mode2NormExpectedCorrectRate","65. Mode 2 expected sustained correct rate by CPI bucket (min-max:value; ...)","text"],
 ["mode2NormExpectedWrongRate","66. Mode 2 expected sustained wrong rate by CPI bucket (min-max:value; ...) — Deprecated V699rev151 (retained for storage continuity)","text"],
 ["mode2NormExpectedMissRate","67. Mode 2 expected sustained miss rate by CPI bucket (min-max:value; ...) — Deprecated V699rev151 (retained for storage continuity)","text"],
 ["mode2NormExpectedDriftPct","68. Mode 2 expected sustained drift % by CPI bucket (min-max:value; ...) — V699rev151 now compared against OLS-slope drift","text"],
 ["mode2NormExpectedCvPct","69. Mode 2 expected sustained CV% by CPI bucket (min-max:value; ...)","text"],
 ["mode2NormToleranceCorrectRate","70. Mode 2 correct-rate tolerance — Deprecated V699rev151 (retained for storage continuity)","number"],
 ["mode2NormToleranceWrongRate","71. Mode 2 wrong-rate tolerance — Deprecated V699rev151 (retained for storage continuity)","number"],
 ["mode2NormToleranceMissRate","72. Mode 2 miss-rate tolerance — Deprecated V699rev151 (retained for storage continuity)","number"],
 ["mode2NormToleranceDriftPct","73. Mode 2 drift tolerance % around expected profile (default 8)","number"],
 ["mode2NormToleranceCvPct","74. Mode 2 CV tolerance % around expected profile (default 10)","number"],
 ["mode2NormWeightCorrect","75. Mode 2 CPA weight for correct-rate — RETIRED V699rev151 (default 0). Consolidated into weight 87.","number"],
 ["mode2NormWeightWrong","76. Mode 2 CPA weight for wrong-rate — RETIRED V699rev151 (default 0). Consolidated into weight 87.","number"],
 ["mode2NormWeightMiss","77. Mode 2 CPA weight for miss-rate — RETIRED V699rev151 (default 0). Consolidated into weight 87.","number"],
 ["mode2NormWeightDrift","78. Mode 2 CPA weight for OLS-drift deviation (default 6.0, V699rev151 — was 1.5)","number"],
 ["mode2NormWeightCv","79. Mode 2 CPA weight for CV deviation (default 6.0, V699rev151 — was 1.5)","number"],
 ["mode2NormMaxDelta","80. Mode 2 CPA max total divergence from CPI (points, default 20). Max pre-cap residual is 21 so the cap can engage.","number"],

 // 81. Diagnostics
 ["deviceBenchmarkEnabled","81. Device benchmark (0=off, 1=on)","number"],
 ["researchModeLocked","82. Research-mode lock (0=off, 1=on)","number"],
 ["researchUploadEndpoint","83. Research upload endpoint URL (leave blank to disable uploads)","text"],
 ["researchIncludeLearningSessions","84. Research upload include learning/pre-baseline sessions (0=off, 1=on)","number"],
 ["researchAutoUpload","85. Research upload automatically when online (0=off, 1=on)","number"],
 ["researchRetainRawAfterVerify","86. Keep raw research payload on device after verification (0=off, 1=on)","number"],
 // V699rev151: new Mode 2 CPA accuracy-composite settings (replace the
 // previously collinear correct/wrong/miss triad).
 ["mode2NormExpectedAccuracyComposite","87. Mode 2 expected sustained accuracy composite by CPI bucket (min-max:value; ...). Composite = correctRate − wrongRate − 0.5·missRate","text"],
 ["mode2NormToleranceAccuracyComposite","88. Mode 2 accuracy-composite tolerance around expected profile (default 0.15)","number"],
 ["mode2NormWeightAccuracy","89. Mode 2 CPA weight for accuracy-composite deviation (default 9.0, V699rev151). Replaces the old sum of weights 75+76+77.","number"]
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
// SECTION: S-PFS — SAMN-PERELLI FATIGUE SCALE
// 7-point Likert scale. Score 7=fully alert, 1=unable to function.
// Validated by Samn & Perelli (1982). Collected before each test.
// TODO: post-test S-PFS delta collection not yet implemented.
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
 let s = null;
 try{
  s = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}_settings`)||"null");
 }catch(e){
  // Corrupt localStorage blob — fall back to defaults rather than wedging module load.
  s = null;
 }
 if(!s) return {...DEFAULTS};
 // Backward compatibility: earlier builds used personalBaselineMinMbs for the same
 // maximum-qualifying-MBS threshold. Carry it forward if present.
 if(s.personalBaselineMaxMbs===undefined && s.personalBaselineMinMbs!==undefined){
  s.personalBaselineMaxMbs = s.personalBaselineMinMbs;
 }
 const m={...DEFAULTS};
 Object.keys(DEFAULTS).forEach(k=>{ if(s[k]!==undefined) m[k]=s[k]; });
 return m;
}
function saveSettings(){ localStorage.setItem(`${STORAGE_PREFIX}_settings`,JSON.stringify(settings)); }
let settings=loadSettings();

// Startup repair must NOT touch the runtime `state` object here because
// settings are initialized before the main session state is declared.
(function repairChallengeAdminDefaults(){
 let changed = false;
 const fixNum = (key, oldVals, nextVal)=>{
  const cur = Number(settings[key]);
  if(!Number.isFinite(cur) || oldVals.includes(cur)){
   settings[key] = nextVal;
   changed = true;
  }
 };
 fixNum("memoryCpiWorstMs", [5000], 3000);
 fixNum("survivalCpiBestMs", [1500], 1000);
 fixNum("survivalCpiWorstMs", [5200], 3000);
 fixNum("memoryMaxTestDurationMs", [0], 240000);
 fixNum("memoryNoResponseTimeoutMs", [10000], 15000);
 fixNum("survivalNoResponseTimeoutMs", [12000], 15000);
 if(changed){
  try{ saveSettings(); }catch(e){}
  try{ localStorage.setItem(`${STORAGE_PREFIX}_admin_defaults_repaired`, "1"); }catch(e){}
 }
})();

// ─── Rev 62 one-time per-revision migration ───
// Fulfills the requirement: "Admin default #2 should start every new revision
// with Mode 2, AND after every test no matter what was selected from the
// profile menu the next test should be Mode 2."
//
// The post-test reset path (resetActiveModeAfterTest) already handles the
// second half. This block handles the first half for RETURNING users whose
// localStorage settings blob and saved profile from an older rev still
// carry a stale testMode/symbolSet selection.
//
// Logic: stamp the current app-rev string into localStorage the first time
// this rev runs on a given device. If the stored stamp doesn't match the
// current rev, force settings.testMode="mode2" and settings.symbolSet="standard"
// (the admin default), strip the legacy symbolSet field out of the saved
// profile record (profile is no longer the source of truth for test type),
// and persist both. This fires once per fresh rev deployment per device;
// after that, the stamp matches and nothing is touched on subsequent loads.
const APP_REV_STAMP = "V699rev151";
// Version policy: APP_VERSION preserves base storage/schema continuity; DISPLAY_VERSION is what users see.
const DISPLAY_VERSION = APP_REV_STAMP || APP_VERSION;

// Rev 145 one-time per-revision migration:
// Safely update requested Admin defaults when devices still carry the old
// default-era values. This includes #48 (Mode 4 baseline factor 1.3 -> 1.1).
(function migrateRev145AdminDefaultsSafely(){
 let stored = "";
 try{ stored = localStorage.getItem(`${STORAGE_PREFIX}_rev145_safe_admin_migration`) || ""; }catch(e){ stored = ""; }
 if(stored === APP_REV_STAMP) return;

 let changed = false;
 const maybeReplace = (key, oldVals, nextVal)=>{
  const cur = Number(settings[key]);
  if(!Number.isFinite(cur) || oldVals.includes(cur)){
   settings[key] = nextVal;
   changed = true;
  }
 };

 maybeReplace("mode3MaxDurationMs", [120000], 90000);          // #46
 maybeReplace("mode4BaselineFactor", [1.3], 1.1);              // #48
 maybeReplace("mode4MaxDurationMs", [120000], 90000);          // #50
 maybeReplace("mode2NormMaxDelta", [12], 20);                  // #80
 maybeReplace("mode2SustainedReliefMinMs", [120], 0);          // #36
 maybeReplace("mode2SustainedReliefPct", [0.1, 0.10], -0.1);   // #37

 if(changed){
  try{ saveSettings(); }catch(e){}
 }
 try{ localStorage.setItem(`${STORAGE_PREFIX}_rev145_safe_admin_migration`, APP_REV_STAMP); }catch(e){}
})();


// V699rev151 one-time per-revision migration:
// Safely bring Admin defaults to the new CPA architecture (accuracy composite
// consolidation + upgraded drift/CV weights + new accuracy-composite expected
// profile and tolerance). Only replace when the stored value still equals the
// old default, preserving any user-edited Admin values.
//
// Migration table:
//   #75 mode2NormWeightCorrect          3.0 -> 0      (RETIRED, consolidated into #89)
//   #76 mode2NormWeightWrong            2.5 -> 0      (RETIRED, consolidated into #89)
//   #77 mode2NormWeightMiss             3.5 -> 0      (RETIRED, consolidated into #89)
//   #78 mode2NormWeightDrift            1.5 -> 6.0    (now drives OLS-slope drift)
//   #79 mode2NormWeightCv               1.5 -> 6.0
//   #87 mode2NormExpectedAccuracyComposite  "" -> default bucket string  (new key)
//   #88 mode2NormToleranceAccuracyComposite "" -> 0.15                    (new key)
//   #89 mode2NormWeightAccuracy             "" -> 9.0                     (new key)
//
// Total max weighted residual after migration:
//    |acc|·9 + |drift|·6 + |cv|·6 = 21   (with each |residual| ≤ 1)
// so the cap of 20 CAN engage at the extremes without any one feature on its
// own saturating it. This is the structural fix called out by the Rev 150
// audit: previously the sum of weights (12) was below the cap (20), making
// the cap vestigial. The new default satisfies that review point.
(function migrateRev151CpaArchitectureSafely(){
 let stored = "";
 try{ stored = localStorage.getItem(`${STORAGE_PREFIX}_rev151_safe_cpa_migration`) || ""; }catch(e){ stored = ""; }
 if(stored === APP_REV_STAMP) return;

 let changed = false;
 const maybeReplaceNum = (key, oldVals, nextVal)=>{
  const cur = Number(settings[key]);
  if(!Number.isFinite(cur) || oldVals.includes(cur)){
   settings[key] = nextVal;
   changed = true;
  }
 };
 const maybeReplaceText = (key, oldVals, nextVal)=>{
  const cur = settings[key];
  if(cur == null || cur === "" || oldVals.includes(String(cur))){
   settings[key] = nextVal;
   changed = true;
  }
 };

 maybeReplaceNum("mode2NormWeightCorrect", [3.0, 3], 0);   // #75 RETIRED
 maybeReplaceNum("mode2NormWeightWrong",   [2.5],    0);   // #76 RETIRED
 maybeReplaceNum("mode2NormWeightMiss",    [3.5],    0);   // #77 RETIRED
 maybeReplaceNum("mode2NormWeightDrift",   [1.5],    6.0); // #78
 maybeReplaceNum("mode2NormWeightCv",      [1.5],    6.0); // #79

 maybeReplaceText("mode2NormExpectedAccuracyComposite",
  [],
  DEFAULTS.mode2NormExpectedAccuracyComposite);            // #87
 maybeReplaceNum("mode2NormToleranceAccuracyComposite",
  [],
  DEFAULTS.mode2NormToleranceAccuracyComposite);           // #88
 maybeReplaceNum("mode2NormWeightAccuracy",
  [],
  DEFAULTS.mode2NormWeightAccuracy);                       // #89

 if(changed){
  try{ saveSettings(); }catch(e){}
 }
 try{ localStorage.setItem(`${STORAGE_PREFIX}_rev151_safe_cpa_migration`, APP_REV_STAMP); }catch(e){}
})();


// Rev 144 one-time per-revision migration:
// Update the five requested Admin values only when they are still at the old
// default values (or missing/invalid). This preserves genuine user-edited
// local Admin settings while still advancing stale default-era devices.
(function migrateRev144AdminDefaultsSafely(){
 let stored = "";
 try{ stored = localStorage.getItem(`${STORAGE_PREFIX}_rev144_safe_admin_migration`) || ""; }catch(e){ stored = ""; }
 if(stored === APP_REV_STAMP) return;

 let changed = false;
 const maybeReplace = (key, oldVals, nextVal)=>{
  const cur = Number(settings[key]);
  if(!Number.isFinite(cur) || oldVals.includes(cur)){
   settings[key] = nextVal;
   changed = true;
  }
 };

 maybeReplace("mode3MaxDurationMs", [120000], 90000);          // #46
 maybeReplace("mode4MaxDurationMs", [120000], 90000);          // #50
 maybeReplace("mode2NormMaxDelta", [12], 20);                  // #80
 maybeReplace("mode2SustainedReliefMinMs", [120], 0);          // #36
 maybeReplace("mode2SustainedReliefPct", [0.1, 0.10], -0.1);   // #37

 if(changed){
  try{ saveSettings(); }catch(e){}
 }
 try{ localStorage.setItem(`${STORAGE_PREFIX}_rev144_safe_admin_migration`, APP_REV_STAMP); }catch(e){}
})();

(function migrateToCurrentRev(){
 let stored = "";
 try{ stored = localStorage.getItem(`${STORAGE_PREFIX}_rev_stamp`) || ""; }catch(e){ stored = ""; }
 if(stored === APP_REV_STAMP) return;
 // Force live settings back to admin default Mode 2 Sustained.
 settings.testMode = "mode2";
 settings.symbolSet = "standard";
 try{ saveSettings(); }catch(e){}
 // Strip symbolSet out of the saved profile record if it exists there from
 // an older rev. Profile ownership of test type is retired in Rev 62.
 try{
  const rawProfile = localStorage.getItem(`${STORAGE_PREFIX}_profile`);
  if(rawProfile){
   const p = JSON.parse(rawProfile);
   if(p && typeof p === "object" && "symbolSet" in p){
    delete p.symbolSet;
    localStorage.setItem(`${STORAGE_PREFIX}_profile`, JSON.stringify(p));
   }
  }
 }catch(e){ /* ignore corrupt profile blob; saveAndContinueProfile will rewrite it cleanly next save */ }
 try{ localStorage.setItem(`${STORAGE_PREFIX}_rev_stamp`, APP_REV_STAMP); }catch(e){}
})();

// ─── State ───
// Shared runtime state for the current session.
// IMPORTANT: keep session-reset helpers aligned with this shape:
//   - resetTrialStateOnly()       = clear active trial/test runtime only
//   - resetPretestEntryState()    = clear sleep / S-PFS entry path only
//   - resetSubjectSessionState()  = full subject/session reset
// Several recent regressions came from clearing the wrong fields at the
// wrong time (especially sleep fields and guest/profile state).
const state={
 phase:"idle", duration:null, blockDuration:null, blockRestartBaseline:null, profile:null,
 current:null, previous:null, unresolvedStreak:0,
 overloads:[], recoveries:[], recoveryTrialsCompleted:0,
 spCorrectStreak:0, spWrongCount:0, terminalBlockReason:null,
 history:loadPersistedHistory(),
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
 mode2Triggered:false, mode2AdaptiveMbsMs:null, mode2SustainedPresentationRateMs:null, mode2SustainedReliefMs:null, mode2SustainedChallengeRatio:null,
 mode2SustainedPresented:0, mode2SustainedCorrect:0, mode2SustainedWrong:0, mode2SustainedMissed:0,
 mode2SustainedCorrectRTs:[], mode2SustainedRollMeanLog:[], mode2PendingPriorMiss:null, mode2FinalTrialsPresented:0,
 mode2FinalCorrect:0, mode2FinalWrong:0, mode2FinalRTs:[],
 // V699rev141: state.speedometerMode2Metric removed — the CPI/CPA toggle was
 // eliminated in rev137; Mode 2 now always shows both needles. The field is
 // confirmed dead (no readers remain) and has been deleted to prevent future
 // confusion.
 speedometerLatestSessionIndex:null,
 summaryVariant:"complete"
 // pendingPriorMiss:
 //   stores the immediately previous paced frame when it LOOKED like a miss at frame end,
 //   but is still inside the late-response grace rule window.
 // pendingLatePacing:
 //   stores a provisional pacing result for frame 1 when a <600 ms tap on frame 2
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
 const visibleVersion = DISPLAY_VERSION;
 document.title = `CogSpeed ${visibleVersion}`;
 const badge = $("versionBadge");
 if(badge) badge.textContent = visibleVersion;
 if(statusLine) statusLine.textContent = `CogSpeed ${visibleVersion}`;
}
syncReleaseUI();

$("openResearchUploadPageBtn")?.addEventListener("click", ()=>$("researchUploadPage")?.classList.remove("hidden"));
$("closeResearchUploadPageBtn")?.addEventListener("click", ()=>$("researchUploadPage")?.classList.add("hidden"));
$("researchUploadPage")?.addEventListener("click", e=>{ if(e.target === $("researchUploadPage")) $("researchUploadPage").classList.add("hidden"); });

function getPhaseBackgroundColor(){
 const phase=String(state.phase||"");
 const LIGHT_BLUE = "#a9d0fb";   // calibration + sustained/final self-paced (slightly darker)
 const MEDIUM_BLUE = "#6f9fd6";  // adaptive / recovery / fixed machine-paced
 if(phase==="calibration") return LIGHT_BLUE;
 if(phase==="mode2_sustained"||phase==="mode2_final") return LIGHT_BLUE;
 if(phase==="paced"||phase==="paced_fixed"||phase==="recovery"||phase==="terminal_recovery") return MEDIUM_BLUE;
 return MEDIUM_BLUE;
}
function applyPhaseBackground(){
 const ts=$("testScreen");
 if(!ts) return;
 try{ ts.style.setProperty("background", getPhaseBackgroundColor(), "important"); }catch(e){}
}

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
 return {result:null, index:null, source:'none'};
}

// ─── Utilities ───
function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
// ─── MATH UTILITIES ───────────────────────────────────────────
function clamp(v,lo,hi){ return Math.min(hi,Math.max(lo,v)); }
function mean(a){ return a.length?a.reduce((x,y)=>x+y,0)/a.length:0; }
function stdDev(a){ if(a.length<2) return null; const m=mean(a); return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/(a.length-1)); }
function shuffle(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]; } return a; }
function subjectKey(id){ return id==="0"?"Guest":id; }
function isGuestHistorySubjectId(v){
 const s = String(v==null ? "" : v).trim().toLowerCase();
 return !s || s==="0" || s==="guest" || s==="guest / no email";
}

function normalizeLegacyResultRow(row){
 if(!row || typeof row !== "object") return row;
 const r = JSON.parse(JSON.stringify(row));

 // Normalize historic block-gap field naming.
 if(r.blockDifferenceMs == null && r.blockScoreDifferenceMs != null){
  r.blockDifferenceMs = r.blockScoreDifferenceMs;
 }
 if(r.blockScoreDifferenceMs == null && r.blockDifferenceMs != null){
  r.blockScoreDifferenceMs = r.blockDifferenceMs;
 }
 // Legacy Mode 2 backfill before disposition migration:
 // computeDisposition() relies on CPA for Mode 2, so old rows need CPA rebuilt first.
 if(r.testMode==="mode2"){
  try{
   // Rebuild missing CPI-from-MBS first for older Mode 2 rows.
   if(r.mode2CpiFromMbs==null && r.cognitivePerformanceIndex==null){
    const adaptiveMbs = r.mode2AdaptiveMbsMs!=null
     ? Number(r.mode2AdaptiveMbsMs)
     : (r.averageLast2BlockingScoresMs!=null ? Number(r.averageLast2BlockingScoresMs) : null);
    if(Number.isFinite(adaptiveMbs)){
     const gap = r.blockScoreDifferenceMs!=null ? Number(r.blockScoreDifferenceMs)
      : (r.blockDifferenceMs!=null ? Number(r.blockDifferenceMs) : null);
     const qualifyingGapMs = Number(settings.qualifyingBlockGapMs)||250;
     if(gap==null || (Number.isFinite(gap) && gap <= qualifyingGapMs)){
      const cpi = computeCPI(adaptiveMbs);
      if(Number.isFinite(cpi)){
       r.mode2CpiFromMbs = cpi;
       r.cognitivePerformanceIndex = cpi;
      }
     }
    }
   }
   // Rebuild retained sustained tails when older logs still have raw rtLog only.
   if(r.mode2Triggered && r.sustainedCorrectRtP90Ms==null && Array.isArray(r.rtLog)){
    Object.assign(r, computeMode2SustainedRtTails(r.rtLog));
   }
   // CPA must be rebuilt before disposition migration for legacy Mode 2 rows.
   if(r.mode2Triggered && r.cpa==null){
    Object.assign(r, computeMode2CPA(r));
   }
   if(r.mode2Triggered && (r.dispositionCode==null || r.dispositionLabel==null || r.dispositionSpfs==null)){
    const nextDisp = computeDisposition(r);
    if(nextDisp && typeof nextDisp==="object"){
     if(nextDisp.dispositionCode!=null) r.dispositionCode = nextDisp.dispositionCode;
     if(nextDisp.dispositionLabel!=null) r.dispositionLabel = nextDisp.dispositionLabel;
     if(nextDisp.dispositionSpfs!=null) r.dispositionSpfs = nextDisp.dispositionSpfs;
    }
   }
  }catch(e){}
 }


 // Legacy disposition cleanup:
 // - old legacy color codes like GREEN/YELLOW/ORANGE/RED
 // - missing disposition fields
 const legacyCodes = new Set(["GREEN","YELLOW","ORANGE","RED"]);
 const badLegacy = legacyCodes.has(String(r.dispositionCode||"").toUpperCase()) || legacyCodes.has(String(r.dispositionLabel||"").toUpperCase());
 const missingDisp = r.dispositionCode == null || r.dispositionLabel == null || r.dispositionSpfs == null;
 if(badLegacy || missingDisp){
  try{
   const next = computeDisposition(r);
   if(next && typeof next === "object"){
    if(next.dispositionCode != null) r.dispositionCode = next.dispositionCode;
    if(next.dispositionLabel != null) r.dispositionLabel = next.dispositionLabel;
    if(next.dispositionSpfs != null) r.dispositionSpfs = next.dispositionSpfs;
   }
  }catch(e){}
 }

 return r;
}

function sanitizePersistedHistory(list){
 if(!Array.isArray(list)) return [];
 const cleaned = [];
 for(const row of list){
  if(!row || typeof row !== "object") continue;
  cleaned.push(normalizeLegacyResultRow(row));
 }
 return cleaned;
}
// Rev 43: Guest sessions must never exist on disk. Used by both the write path
// (defensive against any caller that tries to persist a Guest row) and the
// read path (migrates any pre-Rev-43 installs where Guest rows may have leaked
// onto disk under the Rev 42 policy gap).
function stripGuestRowsForDisk(list){
 if(!Array.isArray(list)) return [];
 return list.filter(row => {
  const sid = String(row?.subjectId||"").trim().toLowerCase();
  return !isGuestHistorySubjectId(sid);
 });
}
// Keep load/save aligned to the same `${STORAGE_PREFIX}_history` key.
function loadPersistedHistory(){
 try{
  const raw = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}_history`)||"[]");
  const cleaned = sanitizePersistedHistory(raw);
  // Rev 43: migrate any legacy Guest rows that leaked onto disk under the
  // Rev 42 policy gap so returning users do not see their signed-in history
  // polluted by prior Guest-on-device sessions.
  const cleanedNoGuest = stripGuestRowsForDisk(cleaned);
  try{
   const rawText = JSON.stringify(Array.isArray(raw) ? raw : []);
   const cleanedText = JSON.stringify(cleanedNoGuest);
   if(rawText !== cleanedText){
    localStorage.setItem(`${STORAGE_PREFIX}_history`, cleanedText);
   }
  }catch(e){}
  return cleanedNoGuest;
 }catch(e){
  return [];
 }
}
function savePersistedHistory(list){
 const cleaned = sanitizePersistedHistory(list);
 // Rev 43: defensive Guest filter. The finish path already gates on
 // shouldPersistSessionForLocalHistory() so no Guest row should reach this
 // write call, but any future caller (backup/restore, admin tools, imports)
 // is also covered here — Guest rows are dropped from the on-disk payload.
 // The in-memory list returned to the caller is left unchanged so current-
 // session Guest speedometer/summary views continue to work.
 const forDisk = stripGuestRowsForDisk(cleaned);
 localStorage.setItem(`${STORAGE_PREFIX}_history`, JSON.stringify(forDisk));
 return cleaned;
}

function clearPersistedHistory(){
 localStorage.removeItem(`${STORAGE_PREFIX}_history`);
 state.history = [];
}

function clearSchedulerLocalData(){
 try{
  Object.keys(localStorage).forEach(k=>{
   if(k.startsWith("cogspeed_scheduler_")) localStorage.removeItem(k);
  });
 }catch(e){}
 stopSchedulerTimers();
 schedulerState.activeSubjectId = "";
 schedulerState.settings = structuredClone(DEFAULT_SCHEDULER_SETTINGS);
}

function clearAllLocalUserData(){
 clearPersistedHistory();
 clearProfile();
 clearSchedulerLocalData();
 clearTransientCurrentSessionState();
 state.profile = null;
 state.subjectId = null;
}

function clearTransientCurrentSessionState(){
 state.activeResult = null;
 state.activeSessionIndex = null;
 state.activeResultSource = null;
 state.speedometerLatestSessionIndex = null;
 state.lastResultText = null;
}
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
 if(mode==="mode2"){
  return selfPaced + (Number(result&&result.mode2SustainedPresented)||0) + (Number(result&&result.mode2FinalTrialsPresented)||0) + Math.max(pacedPresented,pacedDerived,Number(result&&result.totalTrials)||0);
 }
 if(mode==="mode4") return selfPaced + Math.max(pacedPresented,pacedDerived);
 if(mode==="mode3") return selfPaced;
 return selfPaced + Math.max(Number(result&&result.totalTrials)||0,pacedDerived);
}
// Mode helpers centralize mode checks so start / finish / summary logic
// can switch cleanly between current CogSpeed behavior profiles.
function isMode1(){ return (settings.testMode||DEFAULTS.testMode)==="mode1"; }
function isMode2(){ return (settings.testMode||DEFAULTS.testMode)==="mode2"; }
function isMode3(){ return (settings.testMode||DEFAULTS.testMode)==="mode3"; }
function isMode4(){ return (settings.testMode||DEFAULTS.testMode)==="mode4"; }
function currentModeLabel(){ return isMode1() ? "Mode 1 CogSpeed Adapted" : isMode2() ? "Mode 2 CogSpeed Sustained" : isMode3() ? "Mode 3 Self-paced" : "Mode 4 Machine-paced"; }
function getEffectiveTimeFormat(){ return String(settings.timeFormat||"12") === "24" ? "24" : "12"; }
function getSessionMaxDurationMs(){
 if(isMode3()) return Number(settings.mode3MaxDurationMs)||90000;
 if(isMode4()) return Number(settings.mode4MaxDurationMs)||90000;
 // Mode 1 / Mode 2 icon challenges get their own larger budgets.
 if(isMemoryChallengeActive()) return Number(settings.memoryMaxTestDurationMs)||240000;
 if(isSurvivalChallengeActive()) return Number(settings.survivalMaxTestDurationMs)||200000;
 return Number(settings.maxTestDurationMs)||150000;
}

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
// Scale: cpiBestMs=800ms → CPI 100, cpiWorstMs=2800ms → CPI 0.
// Source: Perelli (2026). Formula: (worst-ms)/(worst-best)*100
// ──────────────────────────────────────────────────────────────
function computeCPI(avgMs){
 const ms = Number(avgMs);
 if(!Number.isFinite(ms)) return 0;
 const best=getCurrentCpiBestMs();
 const worst=getCurrentCpiWorstMs();
 const span=worst-best;
 if(!isFinite(best)||!isFinite(worst)||span<=0) return 0;
 return Math.max(0,Math.min(100,((worst-ms)/span)*100));
}
function computeSPI(correctCount,totalTrials){
 const total=Math.max(1, Number(totalTrials)||0);
 const csr=Math.max(0, Number(correctCount)||0);
 return Math.max(0, Math.min(100, (csr/total)*100));
}
function getMode2SblpMsFromState(){
 return state.mode2SustainedCorrectRTs.length ? mean(state.mode2SustainedCorrectRTs) : 0;
}
function getMode2CsrCountFromState(){
 return Math.max(0, Number(state.mode2SustainedCorrect)||0);
}
function updateCPIDisplay(avg){
 if(isMode3()||isMode4()){
  cpiOut.textContent=avg!=null?`${Math.round(avg)}ms`:"—";
  return;
 }
 if(isMode2()){
  const spi = state.mode2Triggered ? computeSPI(state.mode2SustainedCorrect, Number(settings.mode2SustainedTrialCount)||20) : null;
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
// Calibration and Mode 1 recovery use explicit per-trial no-response timeouts.
// Mode 2 final self-paced uses no per-trial timeout; only the overall max-time rule can end an unanswered final trial.
// Fires finish() with a no-response end reason if nothing is tapped in time.
function armNoResponseTimer(){
 clearNoResponseTimer();
 let ms;
 const challengeTimeout = isMemoryChallengeActive() ? (Number(settings.memoryNoResponseTimeoutMs)||15000) : (isSurvivalChallengeActive() ? (Number(settings.survivalNoResponseTimeoutMs)||15000) : null);
 switch(state.phase){
  case "recovery":
  case "terminal_recovery":
   ms = Number(settings.recoveryNoResponseMs)||10000;
   break;
  case "mode2_final":
   return;
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
 if(challengeTimeout!=null && ms!=null) ms = challengeTimeout;
 state.absoluteNoResponseTimer=setTimeout(()=>{
  state.endReason = state.phase==="calibration"
   ? "No response detected — please retest."
   : "Responses were too slow to continue — please retest.";
  finish();
 }, ms);
}
function armMaxTestTimer(msOverride){
 clearMaxTestTimer();
 const baseMs = Number.isFinite(Number(msOverride)) ? Number(msOverride) : (state.maxTestRemainingMs!=null ? Number(state.maxTestRemainingMs) : getSessionMaxDurationMs());
 const ms=Math.max(0, baseMs);
 state.maxTestRemainingMs = ms;
 state.maxTestDeadlineMs = performance.now()+ms;
 state.maxTestTimer=setTimeout(()=>{ state.endReason=(isMode3()||isMode4())?"Test complete: required test time reached.":"Test stopped: maximum test time reached."; finish(); },ms);
}
function noteAnyResponse(){
 if(state.phase==="calibration" || state.phase==="recovery" || state.phase==="terminal_recovery"){
  armNoResponseTimer();
 }
}

function getMode2SustainedWrongFailLimit(){
 const target=Math.max(1, Number(settings.mode2SustainedTrialCount)||20);
 const percent=clamp(Number(settings.mode2SustainedWrongFailPercent)||50,0,100);
 return clamp(Math.ceil(target*(percent/100)),1,target);
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
  // Nominatim reverse geocode with a short AbortController timeout so a vanished
  // network does not leave a dangling request. Browser sends User-Agent automatically.
  const ac = (typeof AbortController !== "undefined") ? new AbortController() : null;
  const timeoutId = ac ? setTimeout(()=>ac.abort(), 4000) : null;
  const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`,{headers:{"Accept":"application/json"}, ...(ac?{signal:ac.signal}:{})});
  if(timeoutId) clearTimeout(timeoutId);
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


// ─── Symbol sets / Memory Challenge ───
function getResultSymbolSet(result){
 const raw = String(result?.symbolSet || result?.challengeSet || "").trim().toLowerCase();
 return raw==="memory" ? "memory" : (raw==="survival" ? "survival" : "standard");
}
function isResultSurvivalChallenge(result){
 return getResultSymbolSet(result) === "survival";
}
function isResultMemoryChallenge(result){
 return getResultSymbolSet(result) === "memory";
}
function getActiveSymbolSet(){
 // Prefer the currently saved settings value first so the active Challenge Set
 // does not get overridden by stale profile state left from an earlier subject.
 const raw = String(settings.symbolSet || (state.profile && state.profile.symbolSet) || "standard");
 if(raw === "memory" || raw === "survival") return raw;
 return "standard";
}
function isMemoryChallengeActive(){
 return getActiveSymbolSet() === "memory";
}
function isSurvivalChallengeActive(){
 return getActiveSymbolSet() === "survival";
}
function isIconChallengeActive(){
 return isMemoryChallengeActive() || isSurvivalChallengeActive();
}
function getCurrentMinDurationMs(){
 return isMemoryChallengeActive() ? (Number(settings.memoryMinDurationMs)||1400)
  : isSurvivalChallengeActive() ? (Number(settings.survivalMinDurationMs)||1500)
  : (Number(settings.minDurationMs)||600);
}
function getCurrentMaxDurationMs(){
 return isMemoryChallengeActive() ? (Number(settings.memoryMaxDurationMs)||5000)
  : isSurvivalChallengeActive() ? (Number(settings.survivalMaxDurationMs)||5200)
  : (Number(settings.maxDurationMs)||3500);
}
function getCurrentCpiBestMs(){
 return isMemoryChallengeActive() ? (Number(settings.memoryCpiBestMs)||1400)
  : isSurvivalChallengeActive() ? (Number(settings.survivalCpiBestMs)||1500)
  : (Number(settings.cpiBestMs)||DEFAULTS.cpiBestMs);
}
function getCurrentCpiWorstMs(){
 return isMemoryChallengeActive() ? (Number(settings.memoryCpiWorstMs)||5000)
  : isSurvivalChallengeActive() ? (Number(settings.survivalCpiWorstMs)||5200)
  : (Number(settings.cpiWorstMs)||DEFAULTS.cpiWorstMs);
}
function getCurrentBaselineMaxMbsValue(){
 return isMemoryChallengeActive() ? (Number(settings.memoryBaselineMaxMbs)||3200)
  : isSurvivalChallengeActive() ? (Number(settings.survivalBaselineMaxMbs)||3400)
  : (Number(settings.personalBaselineMaxMbs)||1900);
}
const MEMORY_ICON_SRC = {
 1:"./mem01_triangle.png", 2:"./mem02_bear.png", 3:"./mem03_circle.png", 4:"./mem04_lion.png",
 5:"./mem05_square.png", 6:"./mem06_snake.png", 7:"./mem07_apple.png", 8:"./mem08_boat.png",
 9:"./mem09_banana.png", 10:"./mem10_car.png", 11:"./mem11_strawberry.png", 12:"./mem12_airplane.png"
};
const MEMORY_LABELS = {
 1:"Triangle",2:"Bear",3:"Circle",4:"Lion",5:"Square",6:"Snake",
 7:"Apple",8:"Boat",9:"Banana",10:"Car",11:"Strawberry",12:"Airplane"
};
const MEMORY_PAIR_MAP = {1:2,2:1,3:4,4:3,5:6,6:5,7:8,8:7,9:10,10:9,11:12,12:11};
const SURVIVAL_ICON_SRC = {
 1:"./surv01_jet1.jpeg", 2:"./surv02_jet2.png", 3:"./surv03_tank.png", 4:"./surv04_cannon.png",
 5:"./surv05_ship.png", 6:"./surv06_submarine.png", 7:"./surv07_rocket.jpeg", 8:"./surv08_missile_battery.png",
 9:"./surv09_spaceship1.png", 10:"./surv10_spaceship2.png", 11:"./surv11_helicopter.jpeg", 12:"./surv12_rpg.png"
};
// Survival icon mapping reviewed against uploaded assets:
const SURVIVAL_LABELS = {
 1:"Jet 1",2:"Jet 2",3:"Tank",4:"Cannon",5:"Ship",6:"Submarine",
 7:"Rocket",8:"Missile Battery",9:"Space ship 1",10:"Space ship 2",11:"Helicopter",12:"RPG"
};
const SURVIVAL_PAIR_MAP = {1:2,2:1,3:4,4:3,5:6,6:5,7:8,8:7,9:10,10:9,11:12,12:11};
function memoryIconPattern(n){
 return {iconSrc: MEMORY_ICON_SRC[n], iconLabel: MEMORY_LABELS[n], iconNum:n, challengeSet:"memory"};
}
function survivalIconPattern(n){
 return {iconSrc: SURVIVAL_ICON_SRC[n], iconLabel: SURVIVAL_LABELS[n], iconNum:n, challengeSet:"survival"};
}
function makeMemoryTrial(kind,lastCorrectPos,lastProbe){
 const group1=[1,2,3,4,5,6], group2=[7,8,9,10,11,12];
 for(let attempt=0;attempt<500;attempt++){
  const group = Math.random()<0.5 ? group1 : group2;
  const other = group===group1 ? group2 : group1;
  const probeNum = group[randInt(0, group.length-1)];
  // Hard rule: never show the same probe twice in a row.
  // The caller builds lastProbe as {family, count} from state.current, so
  // check lastProbe.count here (Rev 62 field-name fix — prior revs read
  // lastProbe.num which is undefined, silently making the no-repeat rule
  // a no-op in Memory mode).
  if(lastProbe && lastProbe.count===probeNum) continue;
  const matchNum = MEMORY_PAIR_MAP[probeNum];
  const correctPos = (()=>{
   if(lastCorrectPos==null) return randInt(0,5);
   let p,t=0; do{ p=randInt(0,5); t++; }while(p===lastCorrectPos&&t<20); return p;
  })();
  const sameGroupOthers = shuffle(group.filter(n=>n!==probeNum && n!==matchNum)).slice(0,3);
  const otherGroupOthers = shuffle([...other]).slice(0,2);
  let nums = shuffle([matchNum, ...sameGroupOthers, ...otherGroupOthers]);
  const ei = nums.indexOf(matchNum);
  [nums[correctPos], nums[ei]] = [nums[ei], nums[correctPos]];
  const topItems = nums.map((n)=>({count:n, family:"memory", pattern:memoryIconPattern(n)}));
  return { kind, probePattern:memoryIconPattern(probeNum), probeCount:probeNum, probeFamily:"memory", topItems, correctPos, resolved:false };
 }
 throw new Error("makeMemoryTrial: could not generate valid trial after 500 attempts");
}

function makeIconChallengeTrial(kind,lastCorrectPos,lastProbe, group1, group2, pairMap, iconPattern, familyName){
 for(let attempt=0;attempt<500;attempt++){
  const group = Math.random()<0.5 ? group1 : group2;
  const other = group===group1 ? group2 : group1;
  const probeNum = group[randInt(0, group.length-1)];
  // Hard rule: never show the same probe twice in a row.
  // The caller builds lastProbe as {family, count} from state.current, so
  // check lastProbe.count here (Rev 62 field-name fix — prior revs read
  // lastProbe.num which is undefined, silently making the no-repeat rule
  // a no-op in Survival mode).
  if(lastProbe && lastProbe.count===probeNum) continue;
  const matchNum = pairMap[probeNum];
  const correctPos = (()=>{
   if(lastCorrectPos==null) return randInt(0,5);
   let p,t=0; do{ p=randInt(0,5); t++; }while(p===lastCorrectPos&&t<20); return p;
  })();
  const sameGroupOthers = shuffle(group.filter(n=>n!==probeNum && n!==matchNum)).slice(0,3);
  const otherGroupOthers = shuffle([...other]).slice(0,2);
  let nums = shuffle([matchNum, ...sameGroupOthers, ...otherGroupOthers]);
  const ei = nums.indexOf(matchNum);
  [nums[correctPos], nums[ei]] = [nums[ei], nums[correctPos]];
  const topItems = nums.map((n)=>({count:n, family:familyName, pattern:iconPattern(n)}));
  return { kind, probePattern:iconPattern(probeNum), probeCount:probeNum, probeFamily:familyName, topItems, correctPos, resolved:false };
 }
 throw new Error("makeIconChallengeTrial: could not generate valid trial after 500 attempts");
}
function makeSurvivalTrial(kind,lastCorrectPos,lastProbe){
 const g1=[1,2,3,4,5,6], g2=[7,8,9,10,11,12];
 return makeIconChallengeTrial(kind,lastCorrectPos,lastProbe,g1,g2,SURVIVAL_PAIR_MAP,survivalIconPattern,"survival");
}
function getActiveRefresherPairs(){
 const active = getActiveSymbolSet();
 if(active==="memory") return [[1,2],[7,8],[4,3],[9,10],[6,5],[12,11]];
 if(active==="survival") return [[1,2],[5,6],[9,10],[7,8],[11,12],[3,4]];
 return [];
}

function buildStandardRefresherCard(n, small=false){
 const cls = small ? "trial-ref-card" : "ref-card";
 const pA = DOT_PATTERNS[n];
 const pB = LINE_PATTERNS[n];
 const size = small ? "small" : "xlarge";
 const gap = small ? "2px" : "6px";
 const rowGap = small ? "2px" : "8px";
 // Standard refresher should use the actual dots/lines drawn on the same
 // gear icons used by the test, and the gears should be as large as is
 // reasonably possible on the full refresher page for easier recognition.
 const colStyle = `display:flex;flex-direction:column;align-items:center;gap:${gap};flex:1 1 0;min-width:0`;
 const gearBoxStyle = small
  ? `width:100%;aspect-ratio:1;max-width:64px`
  : `width:100%;aspect-ratio:1;max-width:210px`;
 return `<div class="${cls}"><div class="ref-num">${n}</div><div class="ref-row" style="justify-content:center;align-items:center;gap:${rowGap}"><div style="${colStyle}"><div class="ref-lbl">dots</div><div style="${gearBoxStyle}">${buildGearSVG(1,pA,size,"")}</div></div><div class="ref-arrow">↔</div><div style="${colStyle}"><div class="ref-lbl">lines</div><div style="${gearBoxStyle}">${buildGearSVG(2,pB,size,"")}</div></div></div></div>`;
}

function buildActiveRefresherCard(a,b,small=false){
 const cls = small ? "trial-ref-card" : "ref-card";
 const active = getActiveSymbolSet();
 const pA = active==="survival" ? survivalIconPattern(a) : memoryIconPattern(a);
 const pB = active==="survival" ? survivalIconPattern(b) : memoryIconPattern(b);
 const labels = active==="survival" ? SURVIVAL_LABELS : MEMORY_LABELS;
 const size = small ? "small" : "xlarge";
 const gap = small ? "2px" : "4px";
 const rowGap = small ? "2px" : "6px";
 // Each gear column sizes via flex:1 + aspect-ratio:1 so the gear wrapper gets
 // an explicit box it can fill. Without this the .gear-img-wrap at 100%/100%
 // collapses to zero inside the flex column, rendering tiny. The gear wrapper
 // is explicitly sized to 100% so buildGearSVG's internal percentages
 // (e.g. xlarge image 126%, icon 84–96%) scale against the real card width.
 const colStyle = small
  ? `display:flex;flex-direction:column;align-items:center;gap:${gap};flex:1 1 0;min-width:0`
  : `display:flex;flex-direction:column;align-items:center;gap:${gap};flex:1 1 0;min-width:0`;
 const gearBoxStyle = small
  ? `width:100%;aspect-ratio:1;max-width:64px`
  : `width:100%;aspect-ratio:1;max-width:180px`;
 return `<div class="${cls}"><div class="ref-row" style="justify-content:center;align-items:center;gap:${rowGap}"><div style="${colStyle}"><div style="${gearBoxStyle}">${buildGearSVG(1,pA,size,"")}</div><div class="ref-lbl">${labels[a]}</div></div><div class="ref-arrow">↔</div><div style="${colStyle}"><div style="${gearBoxStyle}">${buildGearSVG(2,pB,size,"")}</div><div class="ref-lbl">${labels[b]}</div></div></div></div>`;
}
function getSurvivalSoundFamily(iconNum){
 if([1,2].includes(iconNum)) return "jets";
 if([3,4].includes(iconNum)) return "tank";
 if([5,6].includes(iconNum)) return "ship";
 if(iconNum===7) return "rocket";
 if(iconNum===8) return "missile";
 if([9,10].includes(iconNum)) return "space";
 return "helo";
}
// ─── Survival Challenge per-family correct-tap sounds ─────────
// Six distinct WebAudio profiles, one per icon-pair family.
// Every cue is an impact/explosion — the reward sound is the kill.
//
// Rev27 upgrade for perceived impact (user reported previous sounds "not
// very effective"):
//  - Stereo bus: per-component pan (whoosh hard-panned, crack slightly
//    offset, impact centered) widens the size perception on headphones
//    and stereo speakers and makes the cue read as motion-into-impact.
//  - Harder limiter: threshold −3 dB, 8:1, 3 dB knee, 1 ms attack — more
//    brickwall so we can push gains without audible pumping.
//  - Soft-clip saturation (tanh WaveShaper, 2x oversample) on the bus
//    adds harmonic density that reads as "fuller" on phone speakers which
//    roll off below ~180 Hz.
//  - Dual-layer sub with detuning: 90→42 Hz + 125→70 Hz in parallel —
//    the two layers beat slightly for fatness, and the higher layer covers
//    the range small speakers can actually reproduce.
//  - Pre-impact sub ramp (40 ms rising sine) before each boom so the main
//    hit feels earned rather than arriving from nothing.
//  - Raised component gains across the board (limiter handles peaks).
//  - Ship gets dual-side debris rumble for a wider blast footprint.
//
//   tank   (icons 3,4)   — cannon boom          : bright muzzle crack + deep boom
//   jets   (icons 1,2)   — missile whoosh blam  : fast high whoosh + boom
//   ship   (icons 5,6)   — big explosion        : extended sub-heavy detonation
//   rocket (icons 7,8)   — whoosh + boom        : long mid-band whoosh + boom
//   space  (icons 9,10)  — laser zap + boom     : square chirps + boom
//   helo   (icons 11,12) — whoosh + boom        : short low whoosh + boom
function playSurvivalCorrectSound(iconNum){
 try{
  const AC = window.AudioContext || window.webkitAudioContext;
  if(!AC) return;
  state._survivalAudioCtx = state._survivalAudioCtx || new AC();
  const ctx = state._survivalAudioCtx;
  // Rev 70: Duck the master gain for cues that arrive within 120ms of the
  // prior cue. Previously, consecutive fast correct taps (sub-400ms RT in
  // Survival mode) could stack 15-20 oscillator/buffer sources each with
  // tails up to 1.8s, slamming the limiter into heavy compression and
  // making all subsequent hits sound muffled. Ducking preserves every hit
  // as distinct while keeping the summed signal in the limiter's linear
  // range.
  const nowMs = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
  const dtMs = nowMs - (state._lastSurvivalSoundMs || 0);
  state._lastSurvivalSoundMs = nowMs;
  // 1.0 at ≥120ms gap, 0.55 at 0ms gap, linear between.
  const duckFactor = dtMs >= 120 ? 1.0 : 0.55 + 0.45 * (dtMs / 120);
  const emit = ()=>{
   const now = ctx.currentTime + 0.005;
   const fam = getSurvivalSoundFamily(iconNum);

   // ─── Master stereo bus: components sum here, through saturation,
   //     limiter, trim, then out ───
   const bus = ctx.createGain();
   bus.gain.value = 1.0;

   // Soft-clip saturation: tanh curve on the summed bus. Rev 63: drive
   // reduced from k=2.2 to k=1.1 so transients pass through with their
   // attack intact — aggressive tanh was flattening the initial crack
   // and making everything sound muffled.
   const saturator = ctx.createWaveShaper();
   {
    const n = 2048;
    const curve = new Float32Array(n);
    const k = 1.1;
    for(let i=0;i<n;i++){
     const x = (i*2)/(n-1) - 1;
     curve[i] = Math.tanh(k*x) / Math.tanh(k);
    }
    saturator.curve = curve;
    saturator.oversample = "2x";
   }

   // Rev 63 limiter: much looser so peaks actually reach the speaker.
   // Previous brickwall −3 dB / 8:1 / 1 ms was squashing the initial
   // transient. New settings let the crack punch through while still
   // catching overage above 0 dB.
   const masterComp = ctx.createDynamicsCompressor();
   masterComp.threshold.value = -1;
   masterComp.knee.value = 6;
   masterComp.ratio.value = 4;
   masterComp.attack.value = 0.005;
   masterComp.release.value = 0.15;

   const masterGain = ctx.createGain();
   masterGain.gain.value = 1.5 * duckFactor;
   bus.connect(saturator).connect(masterComp).connect(masterGain).connect(ctx.destination);

   // Route to a specific stereo position. pan ∈ [-1, 1]. Falls back to
   // mono bus if StereoPannerNode is unavailable (older Safari).
   const toPannedBus = (pan)=>{
    if(pan === 0) return bus;
    try{
     const panner = ctx.createStereoPanner();
     panner.pan.value = Math.max(-1, Math.min(1, pan));
     panner.connect(bus);
     return panner;
    }catch(e){
     return bus;
    }
   };

   // ─── Primitive: pitched tone with fast attack and exp decay ───
   const tone = (type, f1, f2, t0, dur, gainV, pan=0)=>{
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type=type;
    o.frequency.setValueAtTime(f1, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t0+dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gainV, t0+0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
    o.connect(g).connect(toPannedBus(pan));
    o.start(t0); o.stop(t0+dur+0.02);
   };

   // ─── Primitive: filtered noise burst (whoosh / crack / body) ───
   const noise = (t0, dur, gainV, hpFreq, lpFreq=12000, envShape="decay", pan=0)=>{
    const len=Math.max(1, Math.floor(ctx.sampleRate*dur));
    const buf=ctx.createBuffer(1,len,ctx.sampleRate);
    const data=buf.getChannelData(0);
    if(envShape==="whoosh"){
     for(let i=0;i<len;i++){
      const t=i/len;
      const env = Math.sin(t*Math.PI);
      data[i]=(Math.random()*2-1)*env;
     }
    }else{
     for(let i=0;i<len;i++) data[i]=(Math.random()*2-1)*(1-i/len);
    }
    const src=ctx.createBufferSource(); src.buffer=buf;
    const hp=ctx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=hpFreq;
    const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=lpFreq;
    const g=ctx.createGain();
    if(envShape==="whoosh"){
     g.gain.setValueAtTime(gainV, t0);
    }else{
     g.gain.setValueAtTime(0.0001, t0);
     g.gain.linearRampToValueAtTime(gainV, t0+0.002);
     g.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
    }
    src.connect(hp).connect(lp).connect(g).connect(toPannedBus(pan));
    src.start(t0); src.stop(t0+dur+0.02);
   };

   // ─── Primitive: pre-impact sub ramp (40 ms rising sine) ───
   const preImpact = (impactT, rampDur, gainV)=>{
    const t0 = Math.max(0, impactT - rampDur);
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type="sine";
    o.frequency.setValueAtTime(55, t0);
    o.frequency.linearRampToValueAtTime(85, impactT);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(gainV, impactT);
    g.gain.exponentialRampToValueAtTime(0.0001, impactT+0.02);
    o.connect(g).connect(bus);
    o.start(t0); o.stop(impactT+0.04);
   };

   // ─── Primitive: big explosion (Rev 63 rebuild) ───
   // Rev 62 boom was muffled because body noise was LP-filtered at 1.4 kHz —
   // phone and laptop speakers can't reproduce much below ~180 Hz, so almost
   // nothing audible was left. Rev 63 opens the body up to 8 kHz, triples
   // the sub layers (50/80/130 Hz for full low-end richness), raises the
   // crack gain significantly, and extends all decay times so the boom
   // actually rings instead of clipping off.
   const boom = (t0, dur, gainV)=>{
    preImpact(t0, 0.050, gainV*0.45);

    // Layer 1a: deep sub — 50→28 Hz sine (the "chest thump" — felt more than heard on small speakers)
    {
     const o=ctx.createOscillator(), g=ctx.createGain();
     o.type="sine";
     o.frequency.setValueAtTime(50, t0);
     o.frequency.exponentialRampToValueAtTime(28, t0+Math.min(0.35, dur));
     g.gain.setValueAtTime(0.0001, t0);
     g.gain.linearRampToValueAtTime(gainV*1.1, t0+0.004);
     g.gain.exponentialRampToValueAtTime(0.0001, t0+dur*1.3);
     o.connect(g).connect(bus);
     o.start(t0); o.stop(t0+dur*1.3+0.02);
    }
    // Layer 1b: main sub — 85→40 Hz sine (carries the "boom" body)
    {
     const o=ctx.createOscillator(), g=ctx.createGain();
     o.type="sine";
     o.frequency.setValueAtTime(85, t0);
     o.frequency.exponentialRampToValueAtTime(40, t0+Math.min(0.28, dur));
     g.gain.setValueAtTime(0.0001, t0);
     g.gain.linearRampToValueAtTime(gainV*1.3, t0+0.003);
     g.gain.exponentialRampToValueAtTime(0.0001, t0+dur*1.2);
     o.connect(g).connect(bus);
     o.start(t0); o.stop(t0+dur*1.2+0.02);
    }
    // Layer 1c: upper sub — 130→70 Hz (phone-speaker-audible low end)
    {
     const o=ctx.createOscillator(), g=ctx.createGain();
     o.type="sine";
     o.frequency.setValueAtTime(130, t0);
     o.frequency.exponentialRampToValueAtTime(70, t0+Math.min(0.20, dur));
     g.gain.setValueAtTime(0.0001, t0);
     g.gain.linearRampToValueAtTime(gainV*0.95, t0+0.003);
     g.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
     o.connect(g).connect(bus);
     o.start(t0); o.stop(t0+dur+0.02);
    }
    // Layer 2: full-spectrum mid-body — noise 150 Hz to 8 kHz with slow decay.
    // The big change vs Rev 62: LP opened from 1.4k → 8k so the body has
    // real audible content on phone/laptop speakers, not just sub content
    // they can't reproduce.
    {
     const bodyDur = Math.min(dur*1.15, 0.40);
     const len=Math.max(1, Math.floor(ctx.sampleRate*bodyDur));
     const buf=ctx.createBuffer(1,len,ctx.sampleRate);
     const data=buf.getChannelData(0);
     for(let i=0;i<len;i++){
      // Slower decay envelope than Rev 62 — power 1.1 instead of 1.6 — so
      // the body sustains through the whole boom instead of dying fast.
      const env = Math.pow(1 - i/len, 1.1);
      data[i]=(Math.random()*2-1)*env;
     }
     const src=ctx.createBufferSource(); src.buffer=buf;
     const hp=ctx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=150;
     const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=8000;
     const g=ctx.createGain();
     g.gain.setValueAtTime(0.0001, t0);
     g.gain.linearRampToValueAtTime(gainV*1.15, t0+0.002);
     g.gain.exponentialRampToValueAtTime(0.0001, t0+bodyDur);
     src.connect(hp).connect(lp).connect(g).connect(bus);
     src.start(t0); src.stop(t0+bodyDur+0.02);
    }
    // Layer 3: bright initial crack — short wideband noise 800 Hz to 10 kHz.
    // Rev 62 crack was HP 2.5k–6k which phones can't reproduce well at low
    // gain. Rev 63 widens to 800 Hz–10 kHz so the crack energy lands in a
    // range small speakers actually render, and raises gain from 0.55 to
    // 1.05. This is what gives the "CRACK" at the attack.
    {
     const crackDur = 0.060;
     const len=Math.max(1, Math.floor(ctx.sampleRate*crackDur));
     const buf=ctx.createBuffer(1,len,ctx.sampleRate);
     const data=buf.getChannelData(0);
     for(let i=0;i<len;i++) data[i]=(Math.random()*2-1)*(1-i/len);
     const src=ctx.createBufferSource(); src.buffer=buf;
     const hp=ctx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=800;
     const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=10000;
     const g=ctx.createGain();
     g.gain.setValueAtTime(0.0001, t0);
     g.gain.linearRampToValueAtTime(gainV*1.05, t0+0.001);
     g.gain.exponentialRampToValueAtTime(0.0001, t0+crackDur);
     src.connect(hp).connect(lp).connect(g).connect(bus);
     src.start(t0); src.stop(t0+crackDur+0.01);
    }
    // Layer 4: rumble tail — long low noise 60–400 Hz extending well past
    // main body, so the boom "rings" instead of stopping dead. This was
    // missing in Rev 62 and is a major part of what makes cinematic
    // explosions feel big.
    {
     const tailDur = Math.min(dur*1.8, 0.90);
     const len=Math.max(1, Math.floor(ctx.sampleRate*tailDur));
     const buf=ctx.createBuffer(1,len,ctx.sampleRate);
     const data=buf.getChannelData(0);
     for(let i=0;i<len;i++){
      const env = Math.pow(1 - i/len, 1.4);
      data[i]=(Math.random()*2-1)*env;
     }
     const src=ctx.createBufferSource(); src.buffer=buf;
     const hp=ctx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=60;
     const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=400;
     const g=ctx.createGain();
     g.gain.setValueAtTime(0.0001, t0+0.03);
     g.gain.linearRampToValueAtTime(gainV*0.70, t0+0.05);
     g.gain.exponentialRampToValueAtTime(0.0001, t0+0.03+tailDur);
     src.connect(hp).connect(lp).connect(g).connect(bus);
     src.start(t0+0.03); src.stop(t0+0.03+tailDur+0.02);
    }
   };

   // ─── Family-specific cue composition ───
   // Rev 62 sound overhaul:
   //   tank   — heavier cannon: slower powder-crack muzzle transient into a
   //            long resonant barrel boom, pronounced low decay tail.
   //   jets   — aircraft exploding: whoosh + metallic shred + fuel fireball
   //            (resonant metallic overtones into a sustained low rumble).
   //   missile (ICBM battery, icon 8) — pure detonation: deep pre-compression
   //            sub ramp + full boom stack + extended low rumble tail.
   //            No rocket whoosh (launch is over — this is the impact).
   //   helo   — proper explosion: boom stack + brighter mid-band crack +
   //            secondary debris rumble, whoosh shortened so the blast dominates.
   //   rocket, ship, space — unchanged from Rev 27.
   if(fam==="tank"){
    // Cannon. Rev 63: louder crack layers (with the new wider-spectrum boom
    // they now sit in the right proportion rather than being drowned out).
    // Panned hard left so the shooter feels "behind" the listener.
    noise(now,         0.030, 0.85, 3200, 10000, "decay",  -0.5);  // initial spark
    noise(now+0.004,   0.09,  1.25, 1500, 6500,  "decay",  -0.4);  // powder crack body (raised gain, widened LP)
    noise(now+0.02,    0.22,  0.80, 500,  3500,  "decay",  -0.2);  // mid ring (raised gain, widened LP)
    // Main boom offset from crack gives the "distant cannon" sense.
    boom(now+0.05, 0.60, 1.25);
    // Long low tail — barrel ring / echo off the battlefield.
    {
     const tailT = now + 0.10;
     const tailDur = 0.80;
     const o=ctx.createOscillator(), g=ctx.createGain();
     o.type="sine";
     o.frequency.setValueAtTime(58, tailT);
     o.frequency.exponentialRampToValueAtTime(30, tailT+tailDur);
     g.gain.setValueAtTime(0.0001, tailT);
     g.gain.linearRampToValueAtTime(0.55, tailT+0.015);
     g.gain.exponentialRampToValueAtTime(0.0001, tailT+tailDur);
     o.connect(g).connect(bus);
     o.start(tailT); o.stop(tailT+tailDur+0.02);
    }
   } else if(fam==="jets"){
    // Aircraft exploding. Rev 63: louder metallic shred and crackle,
    // bigger fuel-fireball boom.
    noise(now,         0.14, 0.52, 1600, 9000, "whoosh", -0.6);  // approach whoosh
    // Metallic shred: two detuned sawtooth tones — louder and lower so
    // they read as "tearing airframe" rather than distant whine.
    tone("sawtooth", 1600, 560, now+0.04, 0.14, 0.36, -0.35);
    tone("sawtooth", 1200, 400, now+0.06, 0.16, 0.34, 0.25);
    // High metallic crackle — torn metal ringing (short wideband noise).
    // Widened LP from 8.5k → 10k, widened HP from 3.2k → 2.2k so it sits
    // in the audible band of phone/laptop speakers. Gain raised 0.42 → 0.75.
    {
     const mDur = 0.12;
     const len=Math.max(1, Math.floor(ctx.sampleRate*mDur));
     const buf=ctx.createBuffer(1,len,ctx.sampleRate);
     const data=buf.getChannelData(0);
     for(let i=0;i<len;i++){
      const env = Math.pow(1 - i/len, 1.1);
      data[i]=(Math.random()*2-1)*env;
     }
     const src=ctx.createBufferSource(); src.buffer=buf;
     const hp=ctx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=2200;
     const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=10000;
     const g=ctx.createGain();
     g.gain.setValueAtTime(0.0001, now+0.05);
     g.gain.linearRampToValueAtTime(0.75, now+0.053);
     g.gain.exponentialRampToValueAtTime(0.0001, now+0.05+mDur);
     src.connect(hp).connect(lp).connect(g).connect(toPannedBus(-0.15));
     src.start(now+0.05); src.stop(now+0.05+mDur+0.01);
    }
    // Fuel fireball: main boom — raised from 1.00 to 1.25.
    boom(now+0.14, 0.50, 1.25);
    // Tumbling debris rumble (low mid noise, decaying slowly, opposite pan).
    // Raised gain 0.36 → 0.55, LP opened 700 → 900, longer duration.
    {
     const rDur = 0.65;
     const len=Math.max(1, Math.floor(ctx.sampleRate*rDur));
     const buf=ctx.createBuffer(1,len,ctx.sampleRate);
     const data=buf.getChannelData(0);
     for(let i=0;i<len;i++){
      const t=i/len;
      const env = Math.pow(1-t, 1.6);
      data[i]=(Math.random()*2-1)*env;
     }
     const src=ctx.createBufferSource(); src.buffer=buf;
     const hp=ctx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=80;
     const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=900;
     const g=ctx.createGain();
     g.gain.setValueAtTime(0.0001, now+0.18);
     g.gain.linearRampToValueAtTime(0.55, now+0.19);
     g.gain.exponentialRampToValueAtTime(0.0001, now+0.18+rDur);
     src.connect(hp).connect(lp).connect(g).connect(toPannedBus(0.35));
     src.start(now+0.18); src.stop(now+0.18+rDur+0.02);
    }
   } else if(fam==="ship"){
    boom(now, 0.50, 1.30);
    tone("triangle", 75, 38, now+0.015, 0.45, 0.50, 0);
    noise(now+0.09, 0.32, 0.42, 300, 2800, "decay", -0.3);
    noise(now+0.12, 0.28, 0.38, 300, 2800, "decay", 0.3);
   } else if(fam==="rocket"){
    noise(now, 0.24, 0.48, 800, 6500, "whoosh", 0.6);
    tone("sawtooth", 780, 160, now, 0.22, 0.30, 0.3);
    boom(now+0.24, 0.44, 1.10);
   } else if(fam==="missile"){
    // ICBM/missile battery IMPACT — detonation at the target.
    // No launch whoosh: emphasize a pure heavy boom with extended low tail.
    // Rev 63: pre-compression louder, main boom heavier, secondary thump
    // louder, debris tails raised.
    {
     const preDur = 0.10;
     const preT = now;
     const o=ctx.createOscillator(), g=ctx.createGain();
     o.type="sine";
     o.frequency.setValueAtTime(40, preT);
     o.frequency.linearRampToValueAtTime(95, preT+preDur);
     g.gain.setValueAtTime(0.0001, preT);
     g.gain.linearRampToValueAtTime(0.60, preT+preDur);
     g.gain.exponentialRampToValueAtTime(0.0001, preT+preDur+0.02);
     o.connect(g).connect(bus);
     o.start(preT); o.stop(preT+preDur+0.04);
    }
    // Main detonation — heaviest boom in the set.
    boom(now+0.10, 0.62, 1.40);
    // Secondary sub-octave thump just after the main hit.
    tone("sine", 55, 26, now+0.14, 0.58, 0.72, 0);
    // Debris/rumble noise tail, wide (dual-side) — louder, LP opened.
    noise(now+0.20, 0.52, 0.48, 120, 1600, "decay", -0.4);
    noise(now+0.24, 0.50, 0.44, 120, 1600, "decay", 0.4);
    // Long low rumble — the pressure wave rolling away.
    {
     const tailT = now + 0.30;
     const tailDur = 1.00;
     const o=ctx.createOscillator(), g=ctx.createGain();
     o.type="sine";
     o.frequency.setValueAtTime(62, tailT);
     o.frequency.exponentialRampToValueAtTime(24, tailT+tailDur);
     g.gain.setValueAtTime(0.0001, tailT);
     g.gain.linearRampToValueAtTime(0.52, tailT+0.020);
     g.gain.exponentialRampToValueAtTime(0.0001, tailT+tailDur);
     o.connect(g).connect(bus);
     o.start(tailT); o.stop(tailT+tailDur+0.02);
    }
   } else if(fam==="space"){
    tone("square", 1400, 640, now, 0.07, 0.35, -0.5);
    tone("square", 1850, 820, now+0.06, 0.07, 0.32, 0.5);
    tone("square", 2200, 1000, now+0.12, 0.05, 0.28, -0.3);
    boom(now+0.17, 0.38, 1.05);
   } else {
    // helo (RPG hit): explosion-forward. Rev 63: louder blast, louder
    // secondary crack.
    noise(now, 0.07, 0.50, 900, 5500, "whoosh", 0.5);            // short RPG whoosh
    boom(now+0.06, 0.52, 1.30);                                  // main blast
    // Bright mid-band secondary crack (rotor/fuselage fragment).
    noise(now+0.10, 0.08, 0.80, 1500, 6000, "decay", 0.2);
    // Low secondary thump.
    tone("sine", 70, 32, now+0.12, 0.44, 0.52, 0);
    // Debris rumble tail, opposite pan for width.
    noise(now+0.18, 0.44, 0.42, 150, 1400, "decay", -0.4);
   }
  };
  if(ctx.state === "suspended"){
   Promise.resolve(ctx.resume()).then(()=>setTimeout(emit,0)).catch(()=>setTimeout(emit,0));
  }else{
   emit();
  }
 }catch(e){}
}
function getSurvivalOutcomeText(result){
 const cpi = Number(result?.cognitivePerformanceIndex);
 if(!Number.isFinite(cpi)) return !!(result && isTestSuccess(result)) ? "Victorious!" : "Dead";
 const bands = [
  {anchor:100, label:"Victorious!"},
  {anchor:80, label:"Winning!"},
  {anchor:75, label:"Stand Off"},
  {anchor:50, label:"Wounded"},
  {anchor:25, label:"Crippled"},
  {anchor:11, label:"Dying"},
  {anchor:0, label:"Dead"},
 ];
 let best = bands[0], diff=1e9;
 bands.forEach(b=>{ const d=Math.abs(cpi-b.anchor); if(d<diff){ diff=d; best=b; } });
 return best.label;
}
// ─── Trial generation ───
// ─── TRIAL GENERATION ─────────────────────────────────────────
// Creates one trial: randomly assigns probe (family+count),
// generates 6 target gears, places correct target at random position.
// Rule: correct target has SAME count as probe, OPPOSITE family.
// Constraint: consecutive trials never repeat probe family+count.
// ──────────────────────────────────────────────────────────────
function makeTrial(kind,lastCorrectPos,lastProbe){
 if(isMemoryChallengeActive()) return makeMemoryTrial(kind,lastCorrectPos,lastProbe);
 if(isSurvivalChallengeActive()) return makeSurvivalTrial(kind,lastCorrectPos,lastProbe);
 for(let attempt=0;attempt<500;attempt++){
  const probeFamily=Math.random()<0.5?"dots":"lines";
  const probeCount=randInt(1,6);
  // Hard rule: never show the same probe twice in a row.
  // Re-roll until the probe differs from the immediately previous probe.
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
  #testScreen{background:#7d7d7d!important;}
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
  @keyframes probePulseG{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.06);opacity:.82}}
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
  let iconHtml = "";
  if(pattern && pattern.iconSrc){
   const isSurvival = pattern.challengeSet === "survival";
   // Rev28: bumped "large" iconSize for trial-screen gears so challenge icons
   // are more readable during the test. Percentages are of the gear wrapper,
   // so the icon grows with the gear as the flex container fills freed space.
   const iconSize = isSurvival
    ? (size==="xlarge" ? "84%" : size==="probe" ? "80%" : size==="small" ? "46%" : "66%")
    : (size==="xlarge" ? "68%" : size==="probe" ? "62%" : size==="small" ? "30%" : "48%");
   const backSize = isSurvival
    ? (size==="xlarge" ? "96%" : size==="probe" ? "94%" : size==="small" ? "60%" : "78%")
    : (size==="xlarge" ? "82%" : size==="probe" ? "78%" : size==="small" ? "42%" : "60%");
   iconHtml = `<div class="gear-symbol-back" style="width:${backSize};height:${backSize}"></div><img class="gear-symbol" src="${pattern.iconSrc}" alt="${pattern.iconLabel||"symbol"}" draggable="false" style="position:absolute;z-index:2;width:${iconSize};height:${iconSize};object-fit:contain;pointer-events:none;filter:contrast(1.08) brightness(0.96);"/>`;
  }else if(pattern){
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
  return `<div class="gear-img-wrap ${spinClass||""}">
   <img src="${GEAR_IMAGE_SRCS[si]}" alt="gear ${si}" draggable="false"/>
   ${iconHtml}
   ${marks.join("")}
  </div>`;
 }

 // SVG fallback path: only reached if GEAR_IMAGE_SRCS[si] is falsy (all gear images present in normal operation).
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
 applyPhaseBackground();
 try{ refreshUpdateBannerVisibility(); }catch(e){}
 renderTrialRefresher();
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
 if(ok && isSurvivalChallengeActive() && state.current && state.current.topItems && state.current.topItems[index]){
  try{ playSurvivalCorrectSound(state.current.topItems[index].count); }catch(e){}
 }
 const cls=ok?"correct-flash":"wrong-flash";
 btns[index].classList.add(cls);
 setTimeout(()=>btns[index].classList.remove(cls),200);
}
function setProbeIdle(){
 applyPhaseBackground();
 try{ refreshUpdateBannerVisibility(); }catch(e){}
 renderTrialRefresher();
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
 const isMode2SustainedRow = ["mode2_sustained","mode2_sustained_wrong","mode2_sustained_missed"].includes(phase);
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
  rateChangeReason: pacing&&pacing.rateChangeReason ? pacing.rateChangeReason : "",
  ...(isMode2SustainedRow ? {
   mode2AdaptiveMbsMs: state.mode2AdaptiveMbsMs!=null ? Math.round(state.mode2AdaptiveMbsMs) : null,
   mode2AdaptiveCpi: state.mode2AdaptiveMbsMs!=null ? Number(computeCPI(state.mode2AdaptiveMbsMs).toFixed(1)) : null,
   mode2SustainedRateMs: state.mode2SustainedPresentationRateMs!=null ? Math.round(state.mode2SustainedPresentationRateMs) : null,
   mode2SustainedReliefMs: state.mode2SustainedReliefMs!=null ? Math.round(state.mode2SustainedReliefMs) : null,
   mode2SustainedChallengeRatio: state.mode2SustainedChallengeRatio!=null ? Number(state.mode2SustainedChallengeRatio.toFixed(3)) : null,
   mode2SustainedTrialOrdinal: state.mode2SustainedPresented || null,
   mode2NormativeModelVersion: getMode2NormativeModelVersion()
  } : {})
 });
}

// ─── Answer recording ───
// Trial log duration for paced-family rows uses the PRESENTED round duration,
// not the already-updated baseline after correct/wrong pacing adjustments.
// ─── ANSWER RECORDING + ANTI-SPOOF ───────────────────────────
// recordAnswer(): updates rolling mean + wrong-window checks.
// ANTI-SPOOF — ROLLING MEAN: if correct% < 50% in last 10 taps
//  → stop with the rolling-mean threshold message below.
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
 if(state.pacedErrors>=limit){ state.endReason=`Test stopped: paced wrong-response limit reached (${limit}).`; finish(); return true; }
 return false;
}

function checkMode2SustainedRollingMean(ok){
 if(!isMode2()) return false;
 state.mode2SustainedRollMeanLog = Array.isArray(state.mode2SustainedRollMeanLog) ? state.mode2SustainedRollMeanLog : [];
 state.mode2SustainedRollMeanLog.push(!!ok);
 const win=Math.max(1,Math.round(Number(settings.mode2SustainedRollMeanWindow)||10));
 if(state.mode2SustainedRollMeanLog.length>win) state.mode2SustainedRollMeanLog.shift();
 if(state.mode2SustainedRollMeanLog.length===win){
  const ratio=state.mode2SustainedRollMeanLog.filter(v=>v===true).length/win;
  const thresh=Number(settings.mode2SustainedRollMeanThreshold)||0.50;
  if(ratio<thresh){
   state.endReason=`Mode 2 stopped: sustained-phase average performance fell below threshold (${win} responses, threshold ${thresh}).`;
   finish();
   return true;
  }
 }
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
   if(ratio<thresh){ state.endReason=`Test stopped: recent average performance fell below the allowed threshold (${win} responses, threshold ${thresh}).`; finish(); return true; }
  }
  const wc=state.lastFiveAnswers.filter(v=>v===false).length;
  if(state.lastFiveAnswers.length===settings.wrongWindowSize&&wc>=settings.wrongThresholdStop){
   state.endReason=`Test stopped: too many wrong responses in the most recent ${settings.wrongWindowSize} trials.`; finish(); return true;
  }
 }
 updateMetrics(); return false;
}
// ─── TERMINAL RECOVERY / MODE 2 BRANCH RULE ───────────────────
// maybeTriggerTerminalRule(): fires when 2 consecutive block scores
//  fall within qualifyingBlockGapMs (250ms) of each other.
// Mode 1/3/4 path: enter terminal_recovery and finish after the final
//  self-paced trials.
// Mode 2 sustained path: follow normal Mode 1 adaptive behavior until true
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
  if(isMode2()) {
   if(avg2==null) return false;
   state.mode2Triggered = true;
   state.mode2AdaptiveMbsMs = avg2;
   const reliefCtx = computeMode2SustainedReliefContext(avg2);
   const sustainedRate = clamp(reliefCtx.startMs, Number(getCurrentMinDurationMs())||DEFAULTS.minDurationMs, Number(getCurrentMaxDurationMs())||DEFAULTS.maxDurationMs);
   state.mode2SustainedPresentationRateMs = sustainedRate;
   state.mode2SustainedReliefMs = reliefCtx.reliefMs;
   state.mode2SustainedChallengeRatio = reliefCtx.challengeRatio;
   state.mode2SustainedPresented = 0;
   state.mode2SustainedCorrect = 0;
   state.mode2SustainedWrong = 0;
   state.mode2SustainedMissed = 0;
   state.mode2SustainedCorrectRTs = [];
   state.mode2SustainedRollMeanLog = [];
   state.mode2FinalTrialsPresented = 0;
   state.mode2FinalCorrect = 0;
   state.mode2FinalWrong = 0;
   state.mode2FinalRTs = [];
   state.phase = "mode2_sustained";
   state.duration = sustainedRate;
   openTrial("mode2_sustained");
   return true;
  }
  state.phase="terminal_recovery"; state.recoveryTrialsCompleted=0; state.spCorrectStreak=0; state.spWrongCount=0;
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
//   (default 7).
//
// IMPORTANT:
//   Wrong-response RTs are NEVER included in calibration averaging.
//   Only correct measured calibration RTs are averaged.
//
// CHECK ADEQUATELY TRAINED:
//   calibrationErrors >= calibrationStopErrors (default 4)
//   → fail with the calibration wrong-response practice/retest message
//
// CHECK RESPONSE SPEED:
//   any correct measured calibration RT > calibrationStopSlowMs (default 6000)
//   → fail with the calibration too-slow practice/retest message
//
// DETERMINE BASELINE RT FOR MODE 1 AND MODE 3:
//   avg of the required number of CORRECT measured calibration RTs
//   → paced start / fixed baseline derivation
//
// Slow calibration halt:
//   avg correct measured calibration RT > calibrationStopSlowMs
//   → "Calibration performance indicates more practice is needed before testing."
//
// NO-RESPONSE TIMEOUTS: first trial=10s, subsequent=6s
// ──────────────────────────────────────────────────────────────
// finishCalibration() now branches by selected mode:
// mode1 -> begin adaptive machine-paced CogSpeed phase
// mode2 -> begin adaptive machine-paced CogSpeed phase and later enter sustained + final self-paced
// mode3 -> finish after self-paced-only session
// mode4 -> begin fixed-baseline machine-paced phase using
//          calibration average × mode4BaselineFactor
//          IMPORTANT: mode4CalibrationTrials means CORRECT MEASURED trials;
//          initialUnusedCalibrationTrials warmups are added on top and
//          wrong measured trials do not count toward the target or the average.
function finishCalibration(){
 const avg=mean(state.calibrationRTs.length?state.calibrationRTs:state.selfPacedRTs);
 if(isMode3()){
  state.endReason = state.endReason || "Mode 3 complete: required responses completed.";
  finish(); return;
 }
 if(isMode4()){
  const factor=Number(settings.mode4BaselineFactor)||DEFAULTS.mode4BaselineFactor;
  state.fixedPacedBaseline=clamp(avg*factor,getCurrentMinDurationMs(),getCurrentMaxDurationMs());
  state.duration=state.fixedPacedBaseline;
  state.phase="paced_fixed";
  setStatus(`Mode 4 machine-paced baseline: ${state.duration.toFixed(0)}ms`);
  openTrial("paced_fixed");
  return;
 }
 // Slow calibration halt: avg RT too slow — needs more practice
 if(avg>settings.calibrationStopSlowMs){
  state.endReason="Calibration performance indicates more practice is needed before testing.";
  finish(); return;
 }
 state.duration=clamp(avg*settings.initialPacedPercent,getCurrentMinDurationMs(),getCurrentMaxDurationMs());
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
// IMPORTANT: every CORRECT response must speed up pacing. If the formula would
// otherwise land at neutral or slowdown (for example a late-rescue correct where
// effectiveRt > Frame 1 duration), apply the minimum correct-response speedup
// instead so correctness always moves the next paced frame faster.
// After any actual applied update, clamp baseline to:
//   [getCurrentMinDurationMs(), getCurrentMaxDurationMs()]
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

  let reason;
  if(deltaMs < 0){
    const speedupMag = Math.min(maxSpeed, Math.max(minSpeed, Math.abs(deltaMs)));
    deltaMs = -speedupMag;
    reason = "Correct speedup";
  }else{
    deltaMs = -minSpeed;
    reason = "Correct speedup (late, minimum)";
  }
  const next=clamp(before+deltaMs,getCurrentMinDurationMs(),getCurrentMaxDurationMs());
  return {presentedRateMs:before,nextRateMs:next,rateChangeMs:Math.round(next-before),rateChangeReason:reason};
 }
 const wrongSlow = Number(settings.wrongSlowdownMs)||50;
 const next=clamp(before+wrongSlow,getCurrentMinDurationMs(),getCurrentMaxDurationMs());
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
// Called by all end conditions (success + all configured failure paths).
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
  mode2Triggered: false,
  mode2SustainedReliefMs: null,
  mode2SustainedChallengeRatio: null,
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
async function finish(){
 if(state.phase==="finished") return;
 clearTimer(); clearNoResponseTimer(); clearMaxTestTimer();
 state.phase="finished";
 let result=null;
 try{
  setFlowDiagnostic("FINISH_COMPUTE", `FINISH_COMPUTE — ${state.endReason||"Run complete"}`);
  const avg2=avgLast2Blocks();
  const blockGapLimit = Number(settings.qualifyingBlockGapMs)||250;
  const lastBlockGap = state.overloads.length>=2 ? Math.abs(Number(state.overloads[state.overloads.length-1]) - Number(state.overloads[state.overloads.length-2])) : null;
  const hasQualifyingMbs = avg2!=null && lastBlockGap!=null && lastBlockGap <= blockGapLimit;
  const cps=hasQualifyingMbs ? computeCPI(avg2) : null;
  const pacedSd=stdDev(state.pacedRTs);
  const selfPacedSd=stdDev(state.selfPacedRTs);
  const allResponseRTs=[...state.selfPacedRTs, ...state.pacedRTs];
  const allResponseMean=allResponseRTs.length?mean(allResponseRTs):null;
  const allResponseSd=stdDev(allResponseRTs);
  const blockDiff=state.overloads.length>=2?state.overloads[state.overloads.length-1]-state.overloads[state.overloads.length-2]:null;
  const rawTestDurMs=state.testStartTime!=null?performance.now()-state.testStartTime:null;
  const sustainedOnlyElapsedMs = isMode2() ? ((Array.isArray(state.rtLog)?state.rtLog:[])
    .filter(e=>e && ["mode2_sustained","mode2_sustained_wrong","mode2_sustained_missed"].includes(e.phase)
      && Number.isFinite(Number(e.durationMs)))
    .reduce((s,e)=>s+Number(e.durationMs),0)) : 0;
  // Mode 2 max-time failure should ignore sustained fixed-rate trial time.
  // Keep final self-paced time in the total, but subtract sustained trial time so
  // timing-based stop logic and saved duration align with the intended rule.
  const testDurMs=rawTestDurMs!=null ? Math.max(0, rawTestDurMs - sustainedOnlyElapsedMs) : null;
  const mode2SblpMs = getMode2SblpMsFromState();
  const mode2SustainedTargetCount = Math.max(1, Number(settings.mode2SustainedTrialCount)||20);
  const mode2Spi = isMode2() && state.mode2Triggered ? computeSPI(state.mode2SustainedCorrect, mode2SustainedTargetCount) : null;
  const mode2AdaptiveMbsForCpi = isMode2() ? (state.mode2AdaptiveMbsMs!=null ? state.mode2AdaptiveMbsMs : avg2) : null;
  const modeMetricMs = isMode3() ? (state.selfPacedRTs.length?mean(state.selfPacedRTs):null) : isMode4() ? (state.pacedRTs.length?mean(state.pacedRTs):(state.fixedPacedBaseline||null)) : isMode2() ? mode2AdaptiveMbsForCpi : avg2;
  const modeCPI = (isMode3()||isMode4()) ? null : isMode2() ? (mode2AdaptiveMbsForCpi!=null ? computeCPI(mode2AdaptiveMbsForCpi) : null) : (modeMetricMs!=null ? computeCPI(modeMetricMs) : cps);
  const timingQuality={
   avgFrameOvershootMs: state.frameOvershootLog.length ? Number(mean(state.frameOvershootLog).toFixed(2)) : null,
   maxFrameOvershootMs: state.frameOvershootLog.length ? Number(Math.max(...state.frameOvershootLog).toFixed(2)) : null,
   avgRafIntervalMs: state.rafIntervalLog.length ? Number(mean(state.rafIntervalLog).toFixed(2)) : null,
   maxRafIntervalMs: state.rafIntervalLog.length ? Number(Math.max(...state.rafIntervalLog).toFixed(2)) : null
  };
  const sustainedAnalysis = (isMode2() && state.mode2Triggered)
   ? computeMode2SustainedRtTails(state.rtLog)
   : {
    sustainedCorrectRtP90Ms:null,
    sustainedCorrectRtMaxMs:null
   };
  result={
   sessionNumber: state.history.length + 1,
   testMode: state.activeMode||settings.testMode||"mode1",
   subjectId:subjectKey(state.subjectId||"0"),
   // profile.gender and profile.age are stored per-result for future population-norm use; not currently displayed in UI.
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
   symbolSet: getActiveSymbolSet(),
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
   mode2Triggered: !!state.mode2Triggered,
   sustainedBlockLimitPerformanceMs: isMode2() && state.mode2Triggered ? mode2SblpMs : null,
   sustainedProcessingIndex: mode2Spi,
   correctSustainedResponses: isMode2() ? getMode2CsrCountFromState() : null,
   mode2AdaptiveMbsMs: state.mode2AdaptiveMbsMs,
   mode2SustainedTargetCount: isMode2() ? Math.max(1, Number(settings.mode2SustainedTrialCount)||20) : null,
   mode2FinalTrialTargetCount: isMode2() ? Math.max(1, Number(settings.mode2FinalTrialCount)||2) : null,
   mode2SustainedPresentationRateMs: state.mode2SustainedPresentationRateMs,
   mode2SustainedReliefMs: state.mode2SustainedReliefMs,
   mode2SustainedChallengeRatio: state.mode2SustainedChallengeRatio,
   mode2SustainedPresented: state.mode2SustainedPresented,
   mode2SustainedCorrect: state.mode2SustainedCorrect,
   mode2SustainedWrong: state.mode2SustainedWrong,
   mode2SustainedMissed: state.mode2SustainedMissed,
   mode2FinalTrialsPresented: state.mode2FinalTrialsPresented,
   mode2FinalCorrect: state.mode2FinalCorrect,
   mode2FinalWrong: state.mode2FinalWrong,
   mode2FinalMeanRtMs: state.mode2FinalRTs.length?mean(state.mode2FinalRTs):null,
   mode2CpiFromMbs: isMode2() && state.mode2Triggered ? modeCPI : null,
   mode2TimingSummary: isMode2() ? computeMode2TimingSummary({rtLog:[...state.rtLog], testDurationMs:testDurMs}) : null,
   ...sustainedAnalysis,
   rtLog:[...state.rtLog], endReason:state.endReason||"Run complete",
   time:new Date().toISOString(), geo:state.geo, timingQuality,
   benchmark: state.benchmark ? JSON.parse(JSON.stringify(state.benchmark)) : null
  };
  setActiveResultContext(result, null, "computed result");
  if(result.sleepSinceLastTest==="yes" && result.sleepLog){
   const wakeIso = deriveWakeDateTimeIso(result.sleepLog.wakeTime, result.time);
   if(wakeIso) result.sleepLog.wakeDateTimeIso = wakeIso;
  }
  Object.assign(result, computeMode2CPA(result));
  Object.assign(result, computeDisposition(result));
  result.sessionUuid = generateSessionUuid();
  result.modelVersions = currentResearchModelVersions();
  result.cpaModelVersion = result.modelVersions.cpaModelVersion;
  result.baselineModelVersion = result.modelVersions.baselineModelVersion;
  result.localProvisionalScores = { cpi: result.cognitivePerformanceIndex ?? null, mbs: result.averageLast2BlockingScoresMs ?? null, cpa: result.cpa ?? null, disposition: result.dispositionLabel || null };
  result.verificationStatus = "local_only";
  const baselineUploadContext = buildBaselineUploadContext(result);
  result.baselineUploadContext = baselineUploadContext;
  result.personalBaselineValue = baselineUploadContext.rollingBaselineValue;
  result.personalBaselineQualifyingCount = baselineUploadContext.qualifyingBaselineCount;
  result.personalBaselineUsedNowCount = baselineUploadContext.usedNowCount;
  result.personalBaselineStatus = baselineUploadContext.baselineReason;
  result.researchUploadLane = classifyResearchUploadLane(result, baselineUploadContext, settings);
  const payload = await buildResearchUploadPayload(result);
  result.payloadHash = payload.payloadHash;
  result.trialLogHash = payload.trialLogHash;
  result.settingsHash = payload.settingsHash;
  result.localCaptureStored = true;
  saveRawSessionStore({ ...loadRawSessionStore(), [payload.sessionUuid]: payload });
  if(payload.lane !== "do_not_upload"){
   enqueueUpload(payload);
   result.verificationStatus = "queued";
   if(settings.researchAutoUpload) flushUploadQueue().catch(()=>{});
  }
 }catch(err){
  console.error("finish compute failed", err);
  failOpenResultsHandoff(result, "COMPUTE", err);
  return;
 }
 try{
  setFlowDiagnostic("FINISH_SAVE", `FINISH_SAVE — ${result.endReason||"Run complete"}`);
  state.history.push(result);
  // Rev 43: Guest sessions are kept in state.history for the current-session
  // speedometer/summary view but must never be written to localStorage. This
  // honors the Rev 42 "Guest sessions are not stored locally" policy that was
  // declared in the device-owner state machine but not actually enforced at
  // the save path. savePersistedHistory() also has a defensive filter now, so
  // Guest rows cannot land on disk regardless of caller.
  if(shouldPersistSessionForLocalHistory(result)){
   state.history = savePersistedHistory(state.history);
  }
  state.speedometerLatestSessionIndex = state.history.length-1;
  setActiveResultContext(result, state.history.length-1, isGuestHistorySubjectId(result && result.subjectId) ? "guest in-memory only" : "saved history");
  try{ syncSummarySessionSelect(state.history.length-1); }catch(e){}
  try{ syncSpeedometerSessionSelect(state.history.length-1); }catch(e){}
  try{ updateStartPageLinks(); }catch(e){}
  try{ if(getCurrentSavedSubjectId()) refreshSchedulerStatus(); }catch(e){}
  try{ flushUploadQueue(); }catch(e){}
 }catch(err){
  console.error("finish save failed", err);
  try{ if(state.history[state.history.length-1]===result) state.history.pop(); }catch(e){}
  try{ setStatus("WARNING: Result could not be saved — storage may be full. Export CSV to preserve data."); }catch(e){}
 }
 resetActiveModeAfterTest();
 try{ updateCPIDisplay(avgLast2Blocks()); setProbeIdle(); }catch(e){}
 try{
  setFlowDiagnostic("FINISH_RENDER", `FINISH_RENDER — ${result.endReason||"Run complete"}`);
  buildSummary(result);
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
 if(state.phase==="finished" || state.phase==="idle") return;
 clearTimer();
 clearNoResponseTimer();
 normalizeCurtainForTesting();

 // Track overall test duration from very first trial
 if(state.testStartTime===null){
  state.testStartTime=performance.now();
  state.maxTestRemainingMs = getSessionMaxDurationMs();
  armMaxTestTimer(); // wall clock covers entire test including calibration unless suspended in Mode 2 sustained phase
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
  const total=isMode3()?(Number(settings.mode3TrialLimit)||150):isMode4()?((Number.isFinite(Number(settings.initialUnusedCalibrationTrials))?Number(settings.initialUnusedCalibrationTrials):1)+(Number(settings.mode4CalibrationTrials)||10)):((Number.isFinite(Number(settings.initialUnusedCalibrationTrials))?Number(settings.initialUnusedCalibrationTrials):1)+(Number(settings.initialMeasuredCalibrationTrials)||7)), idx=state.calibrationTrialIndex+1;
  phaseLabel.textContent=`Cal ${idx}/${total}`;
  const warmupLimit = Number.isFinite(Number(settings.initialUnusedCalibrationTrials)) ? Number(settings.initialUnusedCalibrationTrials) : 1;
  setStatus((isMode1() || isMode2()) ? (idx<=warmupLimit?"Self-paced (unused)":"Self-paced (measured)") : "Self-paced");
 }else if(kind==="paced"){
  // Store the ACTUAL frame duration shown for this paced round.
  state.presentedRoundDuration = Math.round(state.duration);
  phaseLabel.textContent=`Paced · ${Math.round(state.duration)}ms`;
  setStatus("Machine-paced");
 }else if(kind==="paced_fixed"){
  state.presentedRoundDuration = Math.round(state.duration);
  state.fixedPacedPresented += 1;
  phaseLabel.textContent=`Fixed MP · ${Math.round(state.duration)}ms`;
  setStatus("Mode 4 fixed machine-paced");
 }else if(kind==="mode2_sustained"){
  if(state.maxTestTimer) suspendMaxTestTimer();
  state.presentedRoundDuration = Math.round(state.duration);
  state.mode2SustainedPresented += 1;
  phaseLabel.textContent=`Mode 2 Sustained · ${Math.round(state.duration)}ms`;
  setStatus(`Mode 2 sustained trials at adaptive MBS + relief margin (${state.mode2SustainedReliefMs!=null?Math.round(state.mode2SustainedReliefMs):"—"} ms)`);
 }else if(kind==="recovery"){
  clearTimer();
  state.duration=null; state.lastFrameDuration=null; state.presentedRoundDuration=null;
  phaseLabel.textContent=`SP Restart ${state.spCorrectStreak}✓ ${state.spWrongCount}✗`;
  setStatus(`SP Restart — need ${settings.spRestartCorrectStreak} correct in a row`);
 }else if(kind==="terminal_recovery"){
  clearTimer();
  state.duration=null; state.lastFrameDuration=null; state.presentedRoundDuration=null;
  const finalNeed=2;
  phaseLabel.textContent=`Final SP ${state.recoveryTrialsCompleted+1}/${finalNeed}`;
  setStatus(`Final SP — complete ${finalNeed} trials to finish`);
 }else if(kind==="mode2_final"){
  clearTimer();
  if(state.mode2FinalTrialsPresented===0 && !state.maxTestTimer) resumeMaxTestTimer();
  state.duration=null; state.lastFrameDuration=null; state.presentedRoundDuration=null;
  const need=Math.max(1, Number(settings.mode2FinalTrialCount)||2);
  phaseLabel.textContent=`Mode 2 Final ${state.mode2FinalTrialsPresented+1}/${need}`;
  setStatus(`Mode 2 final self-paced trials — ${state.mode2FinalTrialsPresented}/${need} completed (true self-paced)`);
 }

 // Arm timers only after the display is fully rendered.
 requestAnimationFrame(()=>{
  requestAnimationFrame(()=>{
   state.trialOpenedAt = performance.now();

   if(kind==="calibration"){
    armNoResponseTimer();
   }else if(kind==="paced" || kind==="paced_fixed" || kind==="mode2_sustained"){
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
   }else if(kind==="mode2_final"){
   // mode2_final has no per-trial no-response timeout.
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
   state.endReason = "Performance was too inconsistent to continue — please retest.";
   finish();
   return true;
  }

  state.phase = "recovery";
  state.recoveryTrialsCompleted = 0;
  state.spCorrectStreak = 0;
  state.spWrongCount = 0;
  openTrial("recovery");
  return true;
 }
 return false;
}

// finalizeMode2SustainedPendingMiss():
//   Commits a pending Mode 2 sustained miss when the next frame ends without a
//   late rescue for the prior frame. This increments sustained missed counts and
//   logs the missed sustained event at the fixed sustained rate.
function finalizeMode2SustainedPendingMiss(){
 if(!state.mode2PendingPriorMiss) return false;
 const pm = state.mode2PendingPriorMiss;
 state.mode2PendingPriorMiss = null;
 const savedCurrent = state.current;
 const savedPresented = state.presentedRoundDuration;
 state.current = pm.trial;
 state.presentedRoundDuration = pm.durationMs;
 logTrial({phase:"mode2_sustained_missed",rt:null,outcome:"missed",responseIndex:null,timing:pm.timing||null,pacing:{nextRateMs:state.duration,rateChangeMs:0,rateChangeReason:"Mode 2 sustained fixed rate (adaptive MBS + relief margin)"}});
 state.current = savedCurrent;
 state.presentedRoundDuration = savedPresented;
 state.missedTrials += 1;
 state.mode2SustainedMissed += 1;
 return false;
}

// Late-rescue corrects can produce effectiveRt > Frame 1 duration because the
// recovered tap lands on the next frame and Frame 1 duration is added back in.
// calculatePacingTransition() still treats that as a correct response and
// applies the minimum speedup so correctness always speeds pacing up.
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
 // Mode 4 Machine-paced handler:
// every trial uses one fixed baseline duration,
// no adaptive speedup/slowdown within the fixed MP phase.
if(state.phase==="paced_fixed"){
  const truelyMissed=state.current&&!state.current.resolved&&!state.hadResponse;
  if(truelyMissed){
   logTrial({phase:"paced_fixed_missed",rt:null,outcome:"missed",responseIndex:null});
   state.missedTrials+=1;
  }
  if(state.fixedPacedPresented >= (Number(settings.mode4PacedTrialLimit)||140)){
   state.endReason="Mode 4 complete: required responses completed.";
   finish(); return;
  }
  openTrial("paced_fixed");
  return;
 }
if(state.phase==="mode2_sustained"){
  if(state.mode2PendingPriorMiss){
   finalizeMode2SustainedPendingMiss();
  }
  const frameTiming = harvestActiveFrameTiming(performance.now());
  const truelyMissed=state.current&&!state.current.resolved&&!state.hadResponse;
  const limit=Math.max(1, Number(settings.mode2SustainedTrialCount)||20);
  if(truelyMissed){
   if(state.mode2SustainedPresented >= limit){
    logTrial({phase:"mode2_sustained_missed",rt:null,outcome:"missed",responseIndex:null,timing:frameTiming,pacing:{nextRateMs:state.duration,rateChangeMs:0,rateChangeReason:"Mode 2 sustained fixed rate (adaptive MBS + relief margin)"}});
    state.missedTrials+=1;
    state.mode2SustainedMissed+=1;
    state.phase="mode2_final";
    state.mode2FinalTrialsPresented=0;
    openTrial("mode2_final");
    return;
   }
   state.mode2PendingPriorMiss = {
    trial: state.current,
    durationMs: state.presentedRoundDuration!=null ? state.presentedRoundDuration : (state.duration?Math.round(state.duration):null),
    timing: frameTiming
   };
   openTrial("mode2_sustained");
   return;
  }
  state.mode2PendingPriorMiss = null;
  if(state.mode2SustainedPresented >= limit){
   state.phase="mode2_final";
   state.mode2FinalTrialsPresented=0;
   openTrial("mode2_final");
   return;
  }
  openTrial("mode2_sustained");
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

  if(state.totalTrials>=settings.maxTrialCount){ state.endReason="Performance was too inconsistent to continue — please retest."; finish(); }
  else openTrial("paced");
  return;
 }

 // Any real response on the current frame breaks the consecutive true-miss streak.
 state.lastFrameDuration = null;
 state.unresolvedStreak = 0;
 state.pendingPriorMiss = null;
 state.pendingLatePacing = null;

 if(state.totalTrials>=settings.maxTrialCount){ state.endReason="Performance was too inconsistent to continue — please retest."; finish(); }
 else openTrial("paced");
}

// ─── Handle tap ───
// ─── TAP HANDLER ──────────────────────────────────────────────
// Entry point for all subject responses (pointerdown on resp-btn).
// Routes to: calibration | paced | recovery | terminal_recovery.
// LATE RESPONSE RULE: if tap within 600ms of frame start after a previous miss,
//  assign that tap to the PREVIOUS trial. If correct, use
//  effectiveRT = currentRT + lastRoundDuration in the paced update.
//  If wrong, baseline slows by the current wrong-slowdown setting (default +50 ms).
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
 if(!["calibration","paced","paced_fixed","mode2_sustained","recovery","terminal_recovery","mode2_final"].includes(state.phase)) return;
 noteAnyResponse();

 // Calibration
 if(state.phase==="calibration"){
  if(!state.current || state.current.resolved) return;
  state.current.resolved=true;
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

  if(isMode1() || isMode2()){
   if(!ok){
    state.calibrationErrors+=1; updateMetrics();
    const calWrongLimit=Math.max(1,Number(settings.calibrationStopErrors)||4);
    if(state.calibrationErrors>=calWrongLimit){
      failCalibration(`Too many wrong responses during practice/calibration — please practice and retest. (${state.calibrationErrors}/${calWrongLimit})`);
      return;
    }
   }else if(includeInAverages){
    // Only CORRECT measured trials count toward calibration average and target count.
    if(rt>settings.calibrationStopSlowMs){
      failCalibration("Responses were too slow during practice/calibration — please practice and retest.");
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

  // Mode 3 + Mode 4:
  // warmups are excluded from averages. After warmups, all self-paced trials are counted
  // toward the fixed trial-count phase, but only correct RTs are included in calibrationRTs.
  if(includeInAverages && ok) state.calibrationRTs.push(rt);
  state.calibrationTrialIndex+=1;

  if(isMode3()){
   if(state.calibrationTrialIndex >= (Number(settings.mode3TrialLimit)||150)){
     state.endReason="Mode 3 complete: required responses completed.";
     finishCalibration();
   }else{
     openTrial("calibration");
   }
   return;
  }

  if(isMode4()){
   const mode4MeasuredTarget = Number(settings.mode4CalibrationTrials)||10;
   if(!ok && includeInAverages){
     state.calibrationErrors += 1;
     const calWrongLimit=Math.max(1,Number(settings.calibrationStopErrors)||4);
     if(state.calibrationErrors>=calWrongLimit){
       failCalibration(`Too many wrong responses during practice/calibration — please practice and retest. (${state.calibrationErrors}/${calWrongLimit})`);
       return;
     }
   }
   if(ok && includeInAverages && rt>settings.calibrationStopSlowMs){
     failCalibration("Responses were too slow during practice/calibration — please practice and retest.");
     return;
   }
   // End only after warmups are done AND we have the required number of CORRECT measured trials.
   if(state.calibrationRTs.length >= mode4MeasuredTarget){
     state.endReason="Mode 4 complete: required responses completed.";
     finishCalibration();
   }else{
     openTrial("calibration");
   }
   return;
  }
 }

 // Recovery (SP Restart)
 if(state.phase==="recovery"){
  if(!state.current || state.current.resolved) return;
  state.current.resolved=true;
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
    // Note: these setTimeout calls are not stored for cancellation. If Full Reset fires
    // during a non-zero ResumeToPacedDelayMs or RecoveryInterTrialDelayMsStart window,
    // openTrial will still fire but handleTap guards against input in idle phase.
    const restartBaseMs=Number(state.blockRestartBaseline)||Number(state.blockDuration)||0;
    const restartFactor=Number(settings.blockRestartPercent)||1.3;
    const slower=clamp(Math.round(restartBaseMs*restartFactor),getCurrentMinDurationMs(),getCurrentMaxDurationMs());
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
   if(state.spWrongCount>=limit){ state.endReason=`Test stopped: self-paced restart wrong-response limit reached (${limit}).`; finish(); return; }
   setStatus(`SP Restart: ${state.spWrongCount}/${limit} wrong`);
   setTimeout(()=>openTrial("recovery"), Number(settings.RecoveryInterTrialDelayMsStart)||0);
  }
  if(recordAnswer(ok)) return; return;
 }

 // Terminal recovery
 if(state.phase==="terminal_recovery"){
  if(!state.current || state.current.resolved) return;
  state.current.resolved=true;
  clearTimer();
  const rt=getSafeTrialRtMs(eventTimeStamp), ok=trialMatches(state.current,index);
  flashBtn(index,ok); state.totalResponses+=1;
  if(ok) state.totalCorrect+=1; else state.totalIncorrect+=1;
  logTrial({phase:"terminal_recovery",rt,outcome:ok?"correct":"wrong",responseIndex:index});
  if(recordAnswer(ok)) return;
  state.current.resolved=true;
  state.recoveryTrialsCompleted+=1;
  const need=2;
  if(state.recoveryTrialsCompleted>=need){ state.endReason=`Mode 1 complete: convergent block criterion reached and ${need} final self-paced trials completed.`; finish(); return; }
  setTimeout(()=>openTrial("terminal_recovery"), Number(settings.RecoveryInterTrialDelayMsStart)||0);
  return;
 }

 // Mode 4 Machine-paced
 if(state.phase==="paced_fixed"){
  const rt=getSafeTrialRtMs(eventTimeStamp);
  const timingSummary = harvestActiveFrameTiming(performance.now());
  if(state.current&&!state.current.resolved&&trialMatches(state.current,index)){
   state.current.resolved=true; state.totalResponses+=1; state.totalCorrect+=1; state.fixedPacedCorrect+=1; state.pacedRTs.push(rt);
   logTrial({phase:"paced_fixed",rt,outcome:"correct",responseIndex:index,timing:timingSummary,pacing:{nextRateMs:state.duration,rateChangeMs:0,rateChangeReason:"Fixed machine-paced"}});
   flashBtn(index,true);
   if(state.fixedPacedPresented >= (Number(settings.mode4PacedTrialLimit)||140)){ state.endReason="Mode 4 complete: required responses completed."; finish(); return; }
   openTrial("paced_fixed"); return;
  }
  state.hadResponse=true;
  state.totalResponses+=1; state.totalIncorrect+=1; state.pacedErrors+=1; state.fixedPacedWrong+=1;
  logTrial({phase:"paced_fixed_wrong",rt,outcome:"wrong",responseIndex:index,timing:timingSummary,pacing:{nextRateMs:state.duration,rateChangeMs:0,rateChangeReason:"Fixed machine-paced"}});
  if(checkMaxPacedWrong()) return;
  flashBtn(index,false);
  if(state.fixedPacedPresented >= (Number(settings.mode4PacedTrialLimit)||140)){ state.endReason="Mode 4 complete: required responses completed."; finish(); return; }
  openTrial("paced_fixed"); return;
 }

 if(state.phase==="mode2_sustained"){
  const rt=getSafeTrialRtMs(eventTimeStamp);
  const lateThreshold = Number(settings.mode2LateResponseThresholdMs)||600;
  const limit=Math.max(1, Number(settings.mode2SustainedTrialCount)||20);

  if(state.mode2PendingPriorMiss && rt < lateThreshold){
   const prior = state.mode2PendingPriorMiss.trial;
   const priorDur = state.mode2PendingPriorMiss.durationMs!=null ? state.mode2PendingPriorMiss.durationMs : (state.duration?Math.round(state.duration):null);
   const correctForLast = prior && trialMatches(prior,index);
   state.totalResponses += 1;
   if(correctForLast){
    const eRT = rt + priorDur;
    state.totalCorrect += 1;
    state.mode2SustainedCorrect += 1;
    state.pacedRTs.push(eRT);
    state.mode2SustainedCorrectRTs.push(eRT);
    const savedCurrent = state.current;
    const savedPresented = state.presentedRoundDuration;
    state.current = prior;
    state.presentedRoundDuration = priorDur;
    logTrial({phase:"mode2_sustained",rt:eRT,outcome:"correct",responseIndex:index,timing:state.mode2PendingPriorMiss?.timing||null,pacing:{nextRateMs:state.duration,rateChangeMs:0,rateChangeReason:"Mode 2 sustained fixed rate (adaptive MBS + relief margin, late rescue)"}});
    state.current = savedCurrent;
    state.presentedRoundDuration = savedPresented;
   flashBtn(index,true);
    if(checkMode2SustainedRollingMean(true)) return;
   }else{
    state.totalIncorrect += 1;
    state.pacedErrors += 1;
    state.mode2SustainedWrong += 1;
    const sustainedWrongLimit=getMode2SustainedWrongFailLimit();
    const savedCurrent = state.current;
    const savedPresented = state.presentedRoundDuration;
    state.current = prior;
    state.presentedRoundDuration = priorDur;
    logTrial({phase:"mode2_sustained_wrong",rt:rt,outcome:"wrong",responseIndex:index,timing:state.mode2PendingPriorMiss?.timing||null,pacing:{nextRateMs:state.duration,rateChangeMs:0,rateChangeReason:"Mode 2 sustained fixed rate (adaptive MBS + relief margin, late rescue)"}});
    state.current = savedCurrent;
    state.presentedRoundDuration = savedPresented;
    flashBtn(index,false);
    if(checkMode2SustainedRollingMean(false)) return;
    if(state.mode2SustainedWrong >= sustainedWrongLimit){
     state.endReason=`Mode 2 stopped: sustained-phase wrong-response limit reached (${state.mode2SustainedWrong}/${sustainedWrongLimit}).`;
     finish(); return;
    }
    if(checkMaxPacedWrong()) return;
   }
   state.mode2PendingPriorMiss = null;
   // The rescue tap is assigned to the previous missed frame only.
   // The current frame remains open and still awaits its own response,
   // so hadResponse must remain false here.
   state.hadResponse = false;
   return;
  }

  if(state.mode2PendingPriorMiss){
   finalizeMode2SustainedPendingMiss();
  }
  const timingSummary = harvestActiveFrameTiming(performance.now());

  if(state.current&&!state.current.resolved&&trialMatches(state.current,index)){
   state.current.resolved=true; state.totalResponses+=1; state.totalCorrect+=1; state.mode2SustainedCorrect+=1; state.pacedRTs.push(rt); state.mode2SustainedCorrectRTs.push(rt);
   state.hadResponse=true;
   logTrial({phase:"mode2_sustained",rt,outcome:"correct",responseIndex:index,timing:timingSummary,pacing:{nextRateMs:state.duration,rateChangeMs:0,rateChangeReason:"Mode 2 sustained fixed rate (adaptive MBS + relief margin)"}});
   flashBtn(index,true);
   // Do NOT call openTrial here — the RAF frame timer must run to full duration.
   // onPacedFrameEnd() will advance to the next trial when the window expires.
   if(checkMode2SustainedRollingMean(true)) return; // only returns true if test ended
   return;
  }
  state.hadResponse=true;
  state.totalResponses+=1; state.totalIncorrect+=1; state.pacedErrors+=1; state.mode2SustainedWrong+=1;
  const sustainedWrongLimit=getMode2SustainedWrongFailLimit();
  if(state.mode2SustainedWrong >= sustainedWrongLimit){
   logTrial({phase:"mode2_sustained_wrong",rt,outcome:"wrong",responseIndex:index,timing:timingSummary,pacing:{nextRateMs:state.duration,rateChangeMs:0,rateChangeReason:"Mode 2 sustained fixed rate (adaptive MBS + relief margin)"}});
   flashBtn(index,false);
   if(checkMode2SustainedRollingMean(false)) return;
   state.endReason=`Mode 2 stopped: sustained-phase wrong-response limit reached (${state.mode2SustainedWrong}/${sustainedWrongLimit}).`;
   finish(); return;
  }
  logTrial({phase:"mode2_sustained_wrong",rt,outcome:"wrong",responseIndex:index,timing:timingSummary,pacing:{nextRateMs:state.duration,rateChangeMs:0,rateChangeReason:"Mode 2 sustained fixed rate (adaptive MBS + relief margin)"}});
  if(checkMaxPacedWrong()) return;
  flashBtn(index,false);
  // Do NOT call openTrial here — the RAF frame timer must run to full duration.
  // onPacedFrameEnd() will advance to the next trial when the window expires.
  if(checkMode2SustainedRollingMean(false)) return; // only returns true if test ended
  return;
 }

 if(state.phase==="mode2_final"){
  if(!state.current || state.current.resolved) return;
  state.current.resolved=true;
  clearTimer();
  const rt=getSafeTrialRtMs(eventTimeStamp), ok=trialMatches(state.current,index);
  flashBtn(index,ok); state.totalResponses+=1; state.mode2FinalTrialsPresented+=1; state.mode2FinalRTs.push(rt);
  if(ok){ state.totalCorrect+=1; state.mode2FinalCorrect+=1; }
  else { state.totalIncorrect+=1; state.mode2FinalWrong+=1; }
  logTrial({phase:"mode2_final",rt,outcome:ok?"correct":"wrong",responseIndex:index});
  const need=Math.max(1, Number(settings.mode2FinalTrialCount)||2);
  if(state.mode2FinalTrialsPresented>=need){
   state.endReason=`Mode 2 complete: sustained segment finished after ${Math.max(1, Number(settings.mode2SustainedTrialCount)||20)} sustained trial(s) at ${state.mode2SustainedPresentationRateMs!=null?Math.round(state.mode2SustainedPresentationRateMs):"—"} ms, followed by ${need} final self-paced trial(s).`;
   finish(); return;
  }
  openTrial("mode2_final");
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

   const savedCurrent = state.current;
   const savedPresented = state.presentedRoundDuration;
   state.current = prior;
   state.presentedRoundDuration = priorDur;
   logTrial({phase:"paced_late_wrong",rt:rt,outcome:"wrong",responseIndex:index,timing:state.pendingPriorMiss?.timing||null});
   const lateLogSeq = state.rtLog.length ? state.rtLog[state.rtLog.length-1].seq : null;
   state.current = savedCurrent;
   state.presentedRoundDuration = savedPresented;
   if(checkMaxPacedWrong()) return;

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
  logTrial({phase:"paced",rt,outcome:"correct",responseIndex:index,timing:frameTiming,pacing});
   flashBtn(index,true);
  recordAnswer(true); return;
 }

 // Second tap on an already-resolved paced trial counts as wrong and slows pacing.
 state.hadResponse=true;
 state.totalResponses+=1; state.totalIncorrect+=1; state.pacedErrors+=1;
 const pacing = applyPacing(null,false);
 logTrial({phase:"paced_wrong",rt,outcome:"wrong",responseIndex:index,timing:frameTiming,pacing});
 if(checkMaxPacedWrong()) return;
 flashBtn(index,false); recordAnswer(false);
}

function isBaselineEstablishedForCurrentSubject(){
 const sid = subjectKey(state.subjectId || (loadProfile()?.email) || "0");
 if(!sid || isGuestBaselineSubject(sid)) return false;
 return !!computePersonalBaseline(state.history, sid).established;
}
function getMemoryRefresherPairs(){
 return [[1,2],[7,8],[4,3],[9,10],[6,5],[12,11]];
}
function buildMemoryRefresherCard(a,b,small=false){
 const cls = small ? "trial-ref-card" : "ref-card";
 return `<div class="${cls}"><div class="ref-row" style="justify-content:center;align-items:center"><div style="display:flex;flex-direction:column;align-items:center;gap:2px">${buildGearSVG(1,memoryIconPattern(a),"small","")}<div class="ref-lbl">${MEMORY_LABELS[a]}</div></div><div class="ref-arrow">↔</div><div style="display:flex;flex-direction:column;align-items:center;gap:2px">${buildGearSVG(2,memoryIconPattern(b),"small","")}<div class="ref-lbl">${MEMORY_LABELS[b]}</div></div></div></div>`;
}
function renderTrialRefresher(){
 // Rev28: trial-page refresher icons removed per user feedback — they weren't
 // useful during the test and consumed screen space that should go to the gear
 // grid. This function is retained as a no-op that always hides the refresher
 // element so the HTML markup stays in place for easy reversal if desired.
 const wrap = $("trialRefresher"), grid = $("trialRefresherGrid");
 if(!wrap || !grid) return;
 wrap.classList.remove("show");
 grid.innerHTML = "";
}

// ─── Refresher ───
function showRefresher(){
 renderRefresher();
 showOnly("refresherOverlay");
}

function renderRefresher(){
 const grid=$("refresherGrid"); grid.innerHTML="";
 if(isIconChallengeActive()){
  getActiveRefresherPairs().forEach(([a,b])=>{
   grid.insertAdjacentHTML("beforeend", buildActiveRefresherCard(a,b,false));
  });
  return;
 }
 for(let i=1;i<=6;i++){
  grid.insertAdjacentHTML("beforeend", buildStandardRefresherCard(i,false));
 }
}

// ─── Fatigue checklist ───
// ─── S-PFS PAGE RENDERING ─────────────────────────────────────
// Full-page overlay. 7 items with large cyan numbers (1-7).
// Subject taps one item → reveals "▶ Start Test!" button.
// Title: Samn-Perelli Fatigue Scale (S-PFS).
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
   setStatus(`S-PFS: ${score} — ${label}`);
   const sb=$("fatigueStartBtn"); if(sb) sb.classList.remove("hidden");
  };
  f.appendChild(b);
 }
}

// ─── Admin ───
// ─── ADMIN PANEL ──────────────────────────────────────────────
// Admin defaults are displayed in numbered order:
// 1) Admin passcode, 2) Test mode, 3) shared defaults used across all modes,
// 4) mode-specific groups in test-use order.
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
   const selectLabels={mode1:"Mode 1 CogSpeed Adapted",mode2:"Mode 2 CogSpeed Sustained",mode3:"Mode 3 Self-paced",mode4:"Mode 4 Machine-paced"};
   const currentSelectValue = String(settings[k] ?? DEFAULTS[k] ?? (k==="defaultTestMode" ? "mode2" : ""));
   const opts=String(t).slice(7).split("|").map(v=>`<option value="${v}" ${currentSelectValue===v?"selected":""}>${selectLabels[v]||v}</option>`).join("");
   controlHTML=`<select id="adm_${k}" style="padding:9px;border:1px solid var(--edge);border-radius:10px;background:#0a1629;color:var(--text);font-size:14px;width:100%">${opts}</select>`;
  }else{
   controlHTML=`<input id="adm_${k}" type="${t}" value="${settings[k]}" style="padding:9px;border:1px solid var(--edge);border-radius:10px;background:#0a1629;color:var(--text);font-size:14px;width:100%">`;
  }
  r.innerHTML=`<label style="font-size:14px;color:var(--text)">${l}</label>${controlHTML}`;
  w.appendChild(r);
 }
 const note=document.createElement("div");
 note.style.cssText="margin-top:14px;padding:12px 14px;border:1px solid var(--edge);border-radius:12px;background:#0a1629;color:var(--text);white-space:pre-wrap;line-height:1.35;font-size:13px";
 note.textContent = [
  "Mode 2 normative CPA defaults",
  "Bucket fields use min-max:value; min-max:value.",
  "Use inf for an open-ended upper bound (example: 80.01-inf:0.62).",
  "",
  "Challenge rule defaults:",
  `36 Relief minimum ms: ${DEFAULTS.mode2SustainedReliefMinMs}`,
  `37 Relief percent of MBS: ${DEFAULTS.mode2SustainedReliefPct}`,
  `38 Relief cap ms: ${DEFAULTS.mode2SustainedReliefMaxMs}`,
  "",
  "Expected sustained-profile defaults by adaptive CPI:",
  `65 Correct rate: ${DEFAULTS.mode2NormExpectedCorrectRate}`,
  `66 Wrong rate: ${DEFAULTS.mode2NormExpectedWrongRate}`,
  `67 Miss rate: ${DEFAULTS.mode2NormExpectedMissRate}`,
  `68 Drift %: ${DEFAULTS.mode2NormExpectedDriftPct}`,
  `69 CV%: ${DEFAULTS.mode2NormExpectedCvPct}`,
  "",
  "Tolerance defaults around the expected profile:",
  `70 Correct tolerance: ${DEFAULTS.mode2NormToleranceCorrectRate}`,
  `71 Wrong tolerance: ${DEFAULTS.mode2NormToleranceWrongRate}`,
  `72 Miss tolerance: ${DEFAULTS.mode2NormToleranceMissRate}`,
  `73 Drift tolerance %: ${DEFAULTS.mode2NormToleranceDriftPct}`,
  `74 CV tolerance %: ${DEFAULTS.mode2NormToleranceCvPct}`,
  "",
  "CPA point weights and cap:",
  `75 Correct weight: ${DEFAULTS.mode2NormWeightCorrect}`,
  `76 Wrong weight: ${DEFAULTS.mode2NormWeightWrong}`,
  `77 Miss weight: ${DEFAULTS.mode2NormWeightMiss}`,
  `78 Drift weight: ${DEFAULTS.mode2NormWeightDrift}`,
  `79 CV weight: ${DEFAULTS.mode2NormWeightCv}`,
  `80 Max CPA divergence from CPI: ±${DEFAULTS.mode2NormMaxDelta}`,
  "",
  "Interpretation:",
  "Mode 2 now uses a bounded challenge rule (adaptive MBS + relief margin) and",
  "then compares observed sustained behavior to the expected profile for that CPI level.",
  "CPA is CPI plus or minus the weighted residual from that expected profile.",
  "These defaults are a normative scaffold only and must be refined with field research.",
  "",
  "Observed drift remains positive-only slowing; improvement does not create an automatic bonus."
 ].join("\n");
 w.appendChild(note);
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
 const PAD={top:22,right:20,bottom:54,left:52},cW=W-PAD.left-PAD.right,cH=H-PAD.top-PAD.bottom;
 function inferDisplayMs(e){
  if(!e||typeof e!=="object") return null;
  if(e.rt!=null && Number.isFinite(Number(e.rt))) return Number(e.rt);
  for(const key of ["durationMs","duration","roundDuration","presentedRoundDuration","baselineMs"]){
   if(e[key]!=null && Number.isFinite(Number(e[key]))) return Number(e[key]);
  }
  return null;
 }
 function isMissLike(e){
  const phase=String(e&&e.phase||"").toLowerCase();
  const outcome=String(e&&e.outcome||"").toLowerCase();
  return phase.includes("miss") || outcome.includes("miss") || outcome.includes("no response");
 }
 const values=rtLog.map(e=>inferDisplayMs(e)).filter(v=>v!=null);
 if(!values.length) return;
 const maxRT=Math.ceil(Math.max(...values,1000)/500)*500;
 const minRT=Math.max(0,Math.floor(Math.min(...values)/500)*500);
 const n=rtLog.length;
 function xO(i){ return PAD.left+(i/(n-1||1))*cW; }
 function yO(v){ return PAD.top+((v-minRT)/((maxRT-minRT)||1))*cH; }
 ctx.strokeStyle="rgba(79,111,153,0.22)"; ctx.lineWidth=1;
 [250,500,750,1000,1500,2000,2500,3000,3500,4000].filter(v=>v>=minRT&&v<=maxRT+100).forEach(v=>{
  const y=yO(v);
  ctx.beginPath(); ctx.moveTo(PAD.left,y); ctx.lineTo(PAD.left+cW,y); ctx.stroke();
  ctx.fillStyle="#8fb0cf"; ctx.font="10px sans-serif"; ctx.textAlign="right";
  ctx.fillText(`${v}ms`,PAD.left-4,y+3);
 });
 const colorMap={correct:"#00ff88",wrong:"#ff4466",missed:"#888888",paced:"#00ff88",paced_wrong:"#ff4466","paced_late_correct":"#ffff00","paced_late_wrong":"#ff8800",calibration:"#88aaff",recovery:"#ffaa00",terminal_recovery:"#ff88ff",mode2_sustained:"#57ff9f",mode2_sustained_wrong:"#ff6b81",mode2_final:"#7fd7ff"};
 const points=rtLog.map((e,i)=>{
  const ms=inferDisplayMs(e);
  if(ms==null) return null;
  return {e,index:i,x:xO(i),y:yO(ms),ms,missLike:isMissLike(e)};
 }).filter(Boolean);
 const rtLinePts=rtLog.map((e,i)=>e&&e.rt!=null&&Number.isFinite(Number(e.rt))?{x:xO(i),y:yO(Number(e.rt))}:null).filter(Boolean);
 if(rtLinePts.length){
  ctx.strokeStyle="rgba(127,215,255,0.55)";
  ctx.lineWidth=1.5;
  ctx.beginPath();
  rtLinePts.forEach((p,i)=>{ if(i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y); });
  ctx.stroke();
 }
 function drawPhaseBreak(x,label){
  ctx.save();
  ctx.strokeStyle="rgba(255,255,255,0.78)";
  ctx.lineWidth=1.5;
  ctx.setLineDash([6,4]);
  ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, PAD.top+cH); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle="#d7e7f8"; ctx.font="11px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="bottom";
  ctx.fillText(label, x, PAD.top-5);
  ctx.restore();
 }
 const calibrationEndIndex = rtLog.findIndex(e=>String(e&&e.phase||"").toLowerCase()!=="calibration");
 if(calibrationEndIndex>0){
  const step=(n>1?cW/(n-1):0);
  drawPhaseBreak(xO(calibrationEndIndex)-(step/2), "End calibration");
 }
 const sustainedStartIndex = rtLog.findIndex(e=>{
  const ph = String(e&&e.phase||"").toLowerCase();
  return ph==="mode2_sustained" || ph==="mode2_sustained_wrong" || ph==="mode2_sustained_missed" || ph==="mode2_final";
 });
 if(sustainedStartIndex>0){
  const step = (n>1 ? cW/(n-1) : 0);
  drawPhaseBreak(xO(sustainedStartIndex) - (step/2), "Sustained phase");
 }
 points.forEach(p=>{
  const fill=colorMap[p.e.phase]||colorMap[p.e.outcome]||"#aaa";
  if(p.missLike){
   ctx.strokeStyle=fill; ctx.lineWidth=2;
   ctx.beginPath(); ctx.moveTo(p.x-4,p.y-4); ctx.lineTo(p.x+4,p.y+4); ctx.moveTo(p.x+4,p.y-4); ctx.lineTo(p.x-4,p.y+4); ctx.stroke();
  }else{
   ctx.fillStyle=fill;
   ctx.beginPath(); ctx.arc(p.x,p.y,3.5,0,Math.PI*2); ctx.fill();
   ctx.strokeStyle="rgba(8,19,33,0.9)"; ctx.lineWidth=1; ctx.stroke();
  }
 });
 if(meanRT){
  ctx.save();
  ctx.strokeStyle="rgba(127,215,255,0.85)";
  ctx.lineWidth=1.5;
  ctx.setLineDash([4,3]);
  ctx.beginPath(); ctx.moveTo(PAD.left,yO(meanRT)); ctx.lineTo(PAD.left+cW,yO(meanRT)); ctx.stroke();
  ctx.restore();
 }
 const legendItems=[
  {label:"Correct", color:"#00ff88", marker:"dot"},
  {label:"Wrong", color:"#ff4466", marker:"dot"},
  {label:"Missed", color:"#888888", marker:"x"},
  {label:"Calibration", color:"#88aaff", marker:"dot"},
  {label:"Recovery", color:"#ffaa00", marker:"dot"},
  {label:"Late correct", color:"#ffff00", marker:"dot"},
  {label:"Late wrong", color:"#ff8800", marker:"dot"},
  {label:"Final self-paced", color:"#7fd7ff", marker:"dot"},
  {label:"Mean RT", color:"rgba(127,215,255,0.85)", marker:"line-dashed"},
  {label:"Phase break", color:"rgba(255,255,255,0.75)", marker:"line-dashed2"}
 ];
 ctx.font="12px sans-serif"; ctx.textAlign="left"; ctx.textBaseline="middle";
 const legendRowGap = 16;
 const legendRight = PAD.left + cW;
 let lx=PAD.left, ly=H-34;
 legendItems.forEach(item=>{
  const itemWidth = 20 + ctx.measureText(item.label).width + 18;
  if(lx>PAD.left && lx + itemWidth > legendRight){
   lx = PAD.left;
   ly += legendRowGap;
  }
  if(item.marker==="line-dashed" || item.marker==="line-dashed2"){
   ctx.save();
   ctx.strokeStyle=item.color; ctx.lineWidth=1.5;
   ctx.setLineDash(item.marker==="line-dashed"?[4,3]:[6,4]);
   ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(lx+16,ly); ctx.stroke();
   ctx.restore();
  }else if(item.marker==="x"){
   ctx.strokeStyle=item.color; ctx.lineWidth=2;
   ctx.beginPath(); ctx.moveTo(lx+3,ly-4); ctx.lineTo(lx+11,ly+4); ctx.moveTo(lx+11,ly-4); ctx.lineTo(lx+3,ly+4); ctx.stroke();
  }else{
   ctx.fillStyle=item.color; ctx.beginPath(); ctx.arc(lx+7,ly,3.5,0,Math.PI*2); ctx.fill();
   ctx.strokeStyle="rgba(8,19,33,0.9)"; ctx.lineWidth=1; ctx.stroke();
  }
  ctx.fillStyle="#b8d0e6"; ctx.fillText(item.label, lx+20, ly);
  lx += itemWidth;
 });
 ctx.fillStyle="#8fb0cf"; ctx.font="10px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="alphabetic";
 ctx.fillText("Trial →",PAD.left+cW/2,H-4);
}

// Mode 2 / Mode 3 result chart:
// green dots = correct responses
// red dots   = wrong responses
// Mode 2 graphs self-paced responses only.
// Mode 3 graphs self-paced + fixed machine-paced responses.
// Mode 2 / Mode 3 response-time graph
// - full graph shows session number once in subtitle
// - smaller ms = better performance and graphs higher
// - avoid duplicate mode / S-PFS labels on full graph

function drawModeResultChart(canvas, result){
 const log=Array.isArray(result&&result.rtLog)?result.rtLog:[];
 const meanRT=result&&result.allResponseMeanMs!=null?result.allResponseMeanMs:(log.filter(e=>e&&e.rt!=null).length?mean(log.filter(e=>e&&e.rt!=null).map(e=>Number(e.rt))):null);
 const blocks=result&&Array.isArray(result.blocks)?result.blocks:[];
 drawRTScatterChart(canvas, log, blocks, meanRT, result&&result.allResponseSdMs!=null?result.allResponseSdMs:null);
}

function getResponseGraphPhaseLegendText(result){
 if(!result) return "Includes phases: none";
 if(result.testMode==="mode1") return "Includes phases: paced, paced_wrong, paced_late_correct, paced_late_wrong, missed.";
 if(result.testMode==="mode3") return "Includes phases: self-paced trials only.";
 if(result.testMode==="mode4") return "Includes phases: self-paced calibration, paced_fixed, paced_fixed_wrong, paced_fixed_missed.";
 if(result.testMode==="mode2") return "Includes phases: calibration, adaptive paced trials, sustained MBS trials, and final self-paced trials.";
 return "Includes phases: paced family only.";
}

function formatModeTag(mode){
 const labels={mode1:"Mode 1 CogSpeed Adapted",mode2:"Mode 2 CogSpeed Sustained",mode3:"Mode 3 Self-paced",mode4:"Mode 4 Machine-paced"};
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
 // Note: paced_late_correct RTs are effectiveRT (current tap RT + prior frame duration).
 // These are longer than single-frame RTs and may slightly inflate ranking averages.
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
//  80 columns: session, subject, date, S-PFS, calibration, blocks,
//  CPI, sustained metrics (SBLP/SPI), CPA + factors,
//  Disposition, timing quality, sleep, paced stats, end reason.
// ──────────────────────────────────────────────────────────────

function csvCell(v){
 const s = v==null ? "" : String(v);
 return /[",\n\r]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
}

function exportCSV(){
 const h=state.history; if(!h.length){setStatus("No history to export."); return;}
 const cols=["session","testMode","symbolSet","subjectId","date","samnPerelli","calibAvgMs","blocks",
  "avgLast2Ms","blockDiffMs","cpi","totalTaps","correct","wrong","missed","sblpMs","sustainedCorrectRtP90Ms","sustainedCorrectRtMaxMs","spi","csr","mode2Target","mode2RateMs","mode2Presented","mode2Correct","mode2Wrong","mode2Missed","mode2FinalTarget","mode2FinalTrials","mode2FinalCorrect","mode2FinalWrong","mode2FinalMeanRtMs",
  "sleepSinceLastTest","sleepBedtime","sleepWakeTime","sleepWakeDateTimeIso","sleepDurationMinutes","sleepQualityLabel","sleepQualityScore",
  "pacedCorrect","pacedWrong","spRestartWrong","meanPacedRtMs","pacedRtSd",
  "avgFrameOvershootMs","maxFrameOvershootMs","avgRafIntervalMs","maxRafIntervalMs",
  "cpa","cpaBaseCpi","cpaCorrectWeighting","cpaWrongWeighting","cpaMissedWeighting","cpaSdWeighting","cpaDriftWeighting","cpaRecoveryWeighting","cpaLapseWeighting","cpaEfficiencyWeighting","cpaAccuracyWeighting","cpaAccuracyResidual","cpaObservedAccuracyComposite","cpaExpectedAccuracyComposite","cpaObservedDriftSlopeMsPerTrial","cpaObservedDriftPctOls","cpaSustainedResponseSdMs","cpaSustainedCvPct","cpaEarlyMedianRtMs","cpaLateMedianRtMs","cpaSustainedDriftRatio","cpaRecoveryCalibRatio","cpaLapseRatePct","cpaTrialsPerBlock","dispositionCode","dispositionLabel","dispositionSpfs",
  "testDurationMs","endReason","location","sessionUuid","payloadHash","trialLogHash","settingsHash","verificationStatus","verificationReceiptId","cpaModelVersion","baselineModelVersion"];
 const rows=h.map((raw,i)=>{ const r=normalizeLegacyResultRow(raw); return [
  i+1,
  r.testMode||"",
  getResultSymbolSet(r),
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
  r.sustainedCorrectRtP90Ms!=null?r.sustainedCorrectRtP90Ms.toFixed(1):"",
  r.sustainedCorrectRtMaxMs!=null?r.sustainedCorrectRtMaxMs.toFixed(1):"",
  r.sustainedProcessingIndex!=null?r.sustainedProcessingIndex.toFixed(1):"",
  r.correctSustainedResponses!=null?r.correctSustainedResponses:"",
  r.mode2SustainedTargetCount!=null?r.mode2SustainedTargetCount:"",
  r.mode2SustainedPresentationRateMs!=null?r.mode2SustainedPresentationRateMs.toFixed(1):"",
  r.mode2SustainedPresented||0, r.mode2SustainedCorrect||0, r.mode2SustainedWrong||0, r.mode2SustainedMissed||0, r.mode2FinalTrialTargetCount!=null?r.mode2FinalTrialTargetCount:"", r.mode2FinalTrialsPresented||0, r.mode2FinalCorrect||0, r.mode2FinalWrong||0, r.mode2FinalMeanRtMs!=null?r.mode2FinalMeanRtMs.toFixed(1):"",
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
  r.cpa!=null?r.cpa.toFixed(1):"",
  r.cpaBaseCpi!=null?r.cpaBaseCpi.toFixed(1):"",
  r.cpaCorrectWeighting!=null?r.cpaCorrectWeighting.toFixed(1):"",
  r.cpaWrongWeighting!=null?r.cpaWrongWeighting.toFixed(1):"",
  r.cpaMissedWeighting!=null?r.cpaMissedWeighting.toFixed(1):"",
  r.cpaSdWeighting!=null?r.cpaSdWeighting.toFixed(1):"",
  r.cpaDriftWeighting!=null?r.cpaDriftWeighting.toFixed(1):"",
  r.cpaRecoveryWeighting!=null?r.cpaRecoveryWeighting.toFixed(1):"",
  r.cpaLapseWeighting!=null?r.cpaLapseWeighting.toFixed(1):"",
  r.cpaEfficiencyWeighting!=null?r.cpaEfficiencyWeighting.toFixed(1):"",
  r.cpaAccuracyWeighting!=null?r.cpaAccuracyWeighting.toFixed(1):"",
  r.cpaAccuracyResidual!=null?r.cpaAccuracyResidual.toFixed(2):"",
  r.cpaObservedAccuracyComposite!=null?r.cpaObservedAccuracyComposite.toFixed(3):"",
  r.cpaExpectedAccuracyComposite!=null?r.cpaExpectedAccuracyComposite.toFixed(3):"",
  r.cpaObservedDriftSlopeMsPerTrial!=null?r.cpaObservedDriftSlopeMsPerTrial.toFixed(3):"",
  r.cpaObservedDriftPctOls!=null?r.cpaObservedDriftPctOls.toFixed(1):"",
  r.cpaSustainedResponseSdMs!=null?r.cpaSustainedResponseSdMs.toFixed(1):"",
  r.cpaSustainedCvPct!=null?r.cpaSustainedCvPct.toFixed(1):"",
  r.cpaEarlyMedianRtMs!=null?r.cpaEarlyMedianRtMs.toFixed(1):"",
  r.cpaLateMedianRtMs!=null?r.cpaLateMedianRtMs.toFixed(1):"",
  r.cpaSustainedDriftRatio!=null?r.cpaSustainedDriftRatio:"",
  r.cpaRecoveryCalibRatio!=null?r.cpaRecoveryCalibRatio.toFixed(2):"",
  r.cpaLapseRatePct!=null?r.cpaLapseRatePct.toFixed(1):"",
  r.cpaTrialsPerBlock!=null?r.cpaTrialsPerBlock.toFixed(1):"",
  r.dispositionCode||"",
  r.dispositionLabel||"",
  r.dispositionSpfs!=null?r.dispositionSpfs:"",
  r.testDurationMs!=null?Math.round(r.testDurationMs):"",
  r.endReason||"",
  (r.geo&&r.geo.address)||"",
  r.sessionUuid||"",
  r.payloadHash||"",
  r.trialLogHash||"",
  r.settingsHash||"",
  r.verificationStatus||"",
  r.verificationReceiptId||"",
  (r.modelVersions&&r.modelVersions.cpaModelVersion)||"",
  (r.modelVersions&&r.modelVersions.baselineModelVersion)||"",
  r.researchUploadLane||"",
  (r.serverVerifiedScores&&r.serverVerifiedScores.cpi)!=null?r.serverVerifiedScores.cpi:"",
  (r.serverVerifiedScores&&r.serverVerifiedScores.mbs)!=null?r.serverVerifiedScores.mbs:"",
  (r.serverVerifiedScores&&r.serverVerifiedScores.cpa)!=null?r.serverVerifiedScores.cpa:"",
  r.appRevStamp||APP_REV_STAMP||""
 ].map(csvCell).join(",");
 });
 const csv=[cols.map(csvCell).join(","), ...rows].join("\n");
 const blob=new Blob([csv],{type:"text/csv"});
 const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`${STORAGE_PREFIX}_history.csv`;
 document.body.appendChild(a); a.click();
 setTimeout(()=>{ try{URL.revokeObjectURL(a.href);}catch(e){} try{a.remove();}catch(e){} },250);
}

// ─── FX (steam + sparks from each gear corner) ───
let _fxRaf=null, _fxParticles=[];
function startFX(){
 // Use FX_CORNERS here, not GEARS. GEARS is the global mechanical gear-definition array.
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
 const FX_CORNERS=[
  {x:O+14,  y:O+14},
  {x:O+BW-14, y:O+14},
  {x:O+14,  y:O+BH-14},
  {x:O+BW-14, y:O+BH-14}
 ];
 _fxParticles=[];
 function frame(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  FX_CORNERS.forEach(g=>{
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
// ═══════════════════════════════════════════════════════════════
// SECTION: MODE 2 SCHEDULER
// Local per-subject reminder system stored on this device only.
//
// What it does:
// - Lets a registered user schedule the next recommended Mode 2 test.
// - Supports 3 schedule types: Anytime, Personal, and Fit for Duty.
// - Uses only local device storage; Guest cannot use Scheduler.
// - Uses bundled local sounds plus optional device text-to-speech.
//
// How to use it:
// 1) Open the asterisk / Profile page.
// 2) Turn Scheduler ON for a registered user.
// 3) Choose Anytime, Personal, or Fit for Duty.
// 4) Save the profile. CogSpeed computes and stores the next reminder.
// 5) CogSpeed shows due reminders while the app is open and can test
//    notification/device capabilities from this page.
//
// Important limits:
// - Scheduler is for one registered user on one device only.
// - Guest cannot save or run Scheduler.
// - Closed-app notifications depend on device/browser support and are tested
//   explicitly in the Scheduler Device Test section.
// ═══════════════════════════════════════════════════════════════
const SCHEDULER_SOUND_FILES = {
 soft_chime: "scheduler-soft-chime.wav",
 beep: "scheduler-beep.wav",
 double_beep: "scheduler-double-beep.wav"
};

const DEFAULT_SCHEDULER_SETTINGS = {
 enabled:false,
 type:"anytime", // anytime | personal | fit_duty
 personalMode:"interval", // interval | daily_times
 personalIntervalHours:4,
 personalWindowStart:"08:00",
 personalWindowEnd:"20:00",
 personalTimes:[
  {enabled:false,time:"08:00"},
  {enabled:false,time:"12:00"},
  {enabled:false,time:"16:00"},
  {enabled:false,time:"20:00"},
  {enabled:false,time:"09:00"},
  {enabled:false,time:"18:00"}
 ],
 fitDutyMinIntervalMin:30,
 fitDutyDefaultIntervalHr:4,
 fitDutyMaxIntervalHr:12,
 fitDutyValidOnly:true,
 fitDutyIgnoreIncomplete:true,
 alertSound:"soft_chime",
 voiceEnabled:false,
 repeatOnce:false,
 quietHoursEnabled:false,
 quietStart:"22:00",
 quietEnd:"06:00",
 nextTestAt:null,
 nextReason:"No active reminder",
 lastReminderResult:"Not yet used",
 deviceTest:{
  installed:"UNKNOWN",
  localSave:"UNKNOWN",
  text:"UNKNOWN",
  sound:"UNKNOWN",
  voice:"DISABLED",
  permission:"NOT ASKED",
  serviceWorker:"UNKNOWN",
  closedApp:"UNKNOWN"
 }
};

const schedulerState = {
 settings: structuredClone(DEFAULT_SCHEDULER_SETTINGS),
 activeSubjectId: "",
 reminderTimerId: null,
 repeatTimerId: null,
 bgTestTimerId: null,
 backgroundTestDueAt: null,
 backgroundTestPending: false,
 // Rev 70: Track currently-playing scheduler Audio so rapid Test button taps
 // don't spawn overlapping playbacks. Set in playSchedulerSound, cleared on
 // playback end/abort.
 activeAudio: null
};

function getSchedulerStorageKey(subjectId){
 return `cogspeed_scheduler_${String(subjectId||"").trim().toLowerCase()}`;
}
function isGuestSchedulerSubject(v){
 const s = String(v||"").trim().toLowerCase();
 return !s || s==="0" || s==="guest" || s==="guest / no email";
}
function getCurrentSchedulerSubjectId(){
 const p = loadProfile();
 if(p && p.email) return String(p.email).trim().toLowerCase();
 const sid = String(state.subjectId||"").trim().toLowerCase();
 if(isValidEmailAddress(sid)) return sid;
 const input = String($("subjectIdInput")?.value||"").trim().toLowerCase();
 return isValidEmailAddress(input) ? input : "";
}
function loadSchedulerSettings(subjectId){
 if(!subjectId || isGuestSchedulerSubject(subjectId)) return structuredClone(DEFAULT_SCHEDULER_SETTINGS);
 try{
  const raw = localStorage.getItem(getSchedulerStorageKey(subjectId));
  if(!raw) return structuredClone(DEFAULT_SCHEDULER_SETTINGS);
  const parsed = JSON.parse(raw);
  const merged = structuredClone(DEFAULT_SCHEDULER_SETTINGS);
  Object.assign(merged, parsed||{});
  merged.personalTimes = Array.isArray(parsed&&parsed.personalTimes) ? parsed.personalTimes.map((row,idx)=>({
   enabled: !!row.enabled,
   time: row.time || DEFAULT_SCHEDULER_SETTINGS.personalTimes[idx]?.time || "08:00"
  })) : structuredClone(DEFAULT_SCHEDULER_SETTINGS.personalTimes);
  merged.deviceTest = { ...structuredClone(DEFAULT_SCHEDULER_SETTINGS.deviceTest), ...(parsed&&parsed.deviceTest||{}) };
  return merged;
 }catch(e){
  return structuredClone(DEFAULT_SCHEDULER_SETTINGS);
 }
}
function saveSchedulerSettings(subjectId, settingsObj){
 if(!subjectId || isGuestSchedulerSubject(subjectId)) return false;
 try{
  localStorage.setItem(getSchedulerStorageKey(subjectId), JSON.stringify(settingsObj));
  return true;
 }catch(e){
  return false;
 }
}
function clearSchedulerSettings(subjectId){
 if(!subjectId || isGuestSchedulerSubject(subjectId)) return;
 try{ localStorage.removeItem(getSchedulerStorageKey(subjectId)); }catch(e){}
}
function setToggleButtonState(id,on,activeColor="#72d572") {
 const btn=$(id); if(!btn) return;
 btn.style.background = on ? "linear-gradient(180deg,#14361a,#0b2211)" : "";
 btn.style.borderColor = on ? activeColor : "";
 btn.style.color = on ? activeColor : "";
 btn.classList.toggle("selected", !!on);
}
function flashSchedulerControl(id){
 const btn=$(id); if(!btn) return;
 btn.classList.add("pressed");
 clearTimeout(btn._schedulerFlashTid);
 btn._schedulerFlashTid = setTimeout(()=>btn.classList.remove("pressed"), 140);
}
function bindSchedulerPressFeedback(){
 [
  "schedulerEnabledOn","schedulerEnabledOff","scheduleTypeAnytime","scheduleTypePersonal","scheduleTypeFitDuty",
  "personalModeInterval","personalModeDailyTimes","schedulerTestSaveBtn","schedulerTestTextBtn",
  "schedulerTestSoundBtn","schedulerTestSoundAlertBtn","schedulerTestVoiceBtn","schedulerTestVoiceAlertBtn",
  "schedulerTestNotificationBtn","schedulerBackgroundTestBtn","schedulerRefreshStatusBtn","schedulerClearStatusBtn",
  "schedulerSaveSettingsBtn","schedulerRefreshDeviceTestBtn","schedulerReminderStartBtn",
  "schedulerReminderSnoozeBtn","schedulerReminderSkipBtn","schedulerAlertSoundSelect",
  "schedulerVoiceEnabledToggle","schedulerRepeatOnceToggle","schedulerQuietHoursToggle",
  "personalIntervalHoursInput","personalWindowStartInput","personalWindowEndInput",
  "fitDutyMinIntervalInput","fitDutyDefaultIntervalInput","fitDutyMaxIntervalInput",
  "fitDutyValidOnlyToggle","fitDutyIgnoreIncompleteToggle",
  "personalTime1Enabled","personalTime2Enabled","personalTime3Enabled","personalTime4Enabled","personalTime5Enabled","personalTime6Enabled",
  "personalTime1Input","personalTime2Input","personalTime3Input","personalTime4Input","personalTime5Input","personalTime6Input",
  "schedulerQuietStartInput","schedulerQuietEndInput"
 ].forEach(id=>{
  const el=$(id); if(!el || el._schedulerFeedbackBound) return;
  const flash=()=>{
   flashSchedulerControl(id);
   const row = el.closest("label,div,.field-row");
   if(row){ row.classList.add("pressed"); clearTimeout(row._schedulerFlashTid); row._schedulerFlashTid=setTimeout(()=>row.classList.remove("pressed"),140); }
  };
  el.addEventListener("pointerdown", flash, {passive:true});
  el.addEventListener("click", flash, {passive:true});
  el.addEventListener("focus", flash, {passive:true});
  el._schedulerFeedbackBound = true;
 });
}
function formatSchedulerDateTime(value){
 if(!value) return "No active reminder";
 const d = new Date(value);
 if(!isFinite(d.getTime())) return "No active reminder";
 return d.toLocaleString();
}
function schedulerStatusTypeLabel(type){
 if(type==="personal") return "Personal";
 if(type==="fit_duty") return "Fit for Duty";
 return "Anytime";
}
function updateScheduleTypeHelpText(type){
 const el=$("scheduleTypeHelpText"); if(!el) return;
 el.textContent = type==="personal"
  ? "Mode 2 reminders at fixed interval or selected daily times. Voice can optionally repeat once."
  : type==="fit_duty"
   ? "Next Mode 2 reminder is based on last completed Mode 2 CPI and S-PFS."
   : "No reminders. Subject may take Mode 2 at any time.";
}
function renderSchedulerStatusFields(s){
 $("schedulerStatusSubject") && ($("schedulerStatusSubject").textContent = schedulerState.activeSubjectId || "—");
 $("schedulerStatusType") && ($("schedulerStatusType").textContent = schedulerStatusTypeLabel(s.type));
 $("schedulerStatusNextTest") && ($("schedulerStatusNextTest").textContent = formatSchedulerDateTime(s.nextTestAt));
 $("schedulerStatusReason") && ($("schedulerStatusReason").textContent = s.nextReason || "No active reminder");
 $("schedulerStatusLastCompleted") && ($("schedulerStatusLastCompleted").textContent = getLatestCompletedMode2Label() || "—");
 $("schedulerStatusLastReminderResult") && ($("schedulerStatusLastReminderResult").textContent = s.lastReminderResult || "Not yet used");
}
function renderSchedulerDeviceFields(dt){
 const map = {
  schedulerDeviceInstalledResult: dt.installed,
  schedulerDeviceLocalSaveResult: dt.localSave,
  schedulerDeviceTextResult: dt.text,
  schedulerDeviceSoundResult: dt.sound,
  schedulerDeviceVoiceResult: dt.voice,
  schedulerDevicePermissionResult: dt.permission,
  schedulerDeviceServiceWorkerResult: dt.serviceWorker,
  schedulerDeviceClosedAppResult: dt.closedApp
 };
 Object.entries(map).forEach(([id,val])=>{ const el=$(id); if(el) el.textContent = val||"UNKNOWN"; });
 const summary=$("schedulerDeviceSummary");
 if(summary){
  if(dt.localSave==="PASS" && dt.text==="PASS" && dt.closedApp==="CONFIRMED") summary.textContent = "Local scheduling works. In-app reminders work. Closed-app reminders confirmed.";
  else if(dt.localSave==="PASS" && dt.text==="PASS") summary.textContent = "Local scheduling works. In-app reminders work. Closed-app reminders limited.";
  else if(dt.localSave==="PASS") summary.textContent = "Local scheduling works. Reminders work only while CogSpeed is open.";
  else summary.textContent = "Local scheduling not yet tested.";
 }
}
function renderSchedulerSettings(){
 const s = schedulerState.settings || structuredClone(DEFAULT_SCHEDULER_SETTINGS);
 const isGuest = !schedulerState.activeSubjectId || isGuestSchedulerSubject(schedulerState.activeSubjectId);
 const panel=$("profileSchedulerPanel"); if(panel) panel.style.opacity = isGuest ? "0.72" : "1";
 const guestNote=$("schedulerGuestBlockedNote"); if(guestNote) guestNote.classList.toggle("hidden", !isGuest);
 const subjectInfo=$("schedulerSubjectInfo"); if(subjectInfo) subjectInfo.textContent = isGuest ? "Scheduler works on this device only." : `Registered user: ${schedulerState.activeSubjectId} · This Scheduler works on this device only.`;
 setToggleButtonState("schedulerEnabledOn", !!s.enabled);
 setToggleButtonState("schedulerEnabledOff", !s.enabled, "#ff9aa8");
 const offNote=$("schedulerOffNote"); if(offNote) offNote.classList.toggle("hidden", !!s.enabled);
 const wrap=$("schedulerSettingsWrap"); if(wrap) wrap.classList.toggle("hidden", !s.enabled);
 setToggleButtonState("scheduleTypeAnytime", s.type==="anytime");
 setToggleButtonState("scheduleTypePersonal", s.type==="personal");
 setToggleButtonState("scheduleTypeFitDuty", s.type==="fit_duty");
 $("personalSchedulePanel")?.classList.toggle("hidden", s.type!=="personal");
 $("fitDutySchedulePanel")?.classList.toggle("hidden", s.type!=="fit_duty");
 setToggleButtonState("personalModeInterval", s.personalMode!=="daily_times");
 setToggleButtonState("personalModeDailyTimes", s.personalMode==="daily_times");
 $("personalIntervalPanel")?.classList.toggle("hidden", s.personalMode==="daily_times");
 $("personalDailyTimesPanel")?.classList.toggle("hidden", s.personalMode!=="daily_times");
 if($("personalIntervalHoursInput")) $("personalIntervalHoursInput").value = s.personalIntervalHours;
 if($("personalWindowStartInput")) $("personalWindowStartInput").value = s.personalWindowStart;
 if($("personalWindowEndInput")) $("personalWindowEndInput").value = s.personalWindowEnd;
 s.personalTimes.forEach((row,idx)=>{ const i=idx+1; if($("personalTime"+i+"Enabled")) $("personalTime"+i+"Enabled").checked = !!row.enabled; if($("personalTime"+i+"Input")) $("personalTime"+i+"Input").value = row.time || "08:00"; });
 if($("fitDutyMinIntervalInput")) $("fitDutyMinIntervalInput").value = s.fitDutyMinIntervalMin;
 if($("fitDutyDefaultIntervalInput")) $("fitDutyDefaultIntervalInput").value = s.fitDutyDefaultIntervalHr;
 if($("fitDutyMaxIntervalInput")) $("fitDutyMaxIntervalInput").value = s.fitDutyMaxIntervalHr;
 if($("fitDutyValidOnlyToggle")) $("fitDutyValidOnlyToggle").checked = !!s.fitDutyValidOnly;
 if($("fitDutyIgnoreIncompleteToggle")) $("fitDutyIgnoreIncompleteToggle").checked = !!s.fitDutyIgnoreIncomplete;
 if($("schedulerAlertSoundSelect")) $("schedulerAlertSoundSelect").value = s.alertSound || "soft_chime";
 if($("schedulerVoiceEnabledToggle")) $("schedulerVoiceEnabledToggle").checked = !!s.voiceEnabled;
 $("schedulerVoicePreviewText")?.classList.toggle("hidden", !s.voiceEnabled);
 if($("schedulerRepeatOnceToggle")) $("schedulerRepeatOnceToggle").checked = !!s.repeatOnce;
 if($("schedulerQuietHoursToggle")) $("schedulerQuietHoursToggle").checked = !!s.quietHoursEnabled;
 if($("schedulerQuietStartInput")) $("schedulerQuietStartInput").value = s.quietStart || "22:00";
 if($("schedulerQuietEndInput")) $("schedulerQuietEndInput").value = s.quietEnd || "06:00";
 ["schedulerVoiceEnabledToggle","schedulerRepeatOnceToggle","schedulerQuietHoursToggle","fitDutyValidOnlyToggle","fitDutyIgnoreIncompleteToggle",
  "personalTime1Enabled","personalTime2Enabled","personalTime3Enabled","personalTime4Enabled","personalTime5Enabled","personalTime6Enabled"]
  .forEach(id=>$(id)?.closest("label,div,.field-row")?.classList.toggle("selected", !!$(id)?.checked));
 updateScheduleTypeHelpText(s.type);
 renderSchedulerStatusFields(s);
 renderSchedulerDeviceFields(s.deviceTest||structuredClone(DEFAULT_SCHEDULER_SETTINGS.deviceTest));
}
function collectSchedulerSettingsFromUI(){
 const prior = schedulerState.settings || structuredClone(DEFAULT_SCHEDULER_SETTINGS);
 return {
  enabled: !!prior.enabled,
  type: prior.type || "anytime",
  personalMode: prior.personalMode || "interval",
  personalIntervalHours: Number($("personalIntervalHoursInput")?.value||4),
  personalWindowStart: $("personalWindowStartInput")?.value || "08:00",
  personalWindowEnd: $("personalWindowEndInput")?.value || "20:00",
  personalTimes:[1,2,3,4,5,6].map(i=>({enabled: !!$("personalTime"+i+"Enabled")?.checked, time: $("personalTime"+i+"Input")?.value || DEFAULT_SCHEDULER_SETTINGS.personalTimes[i-1].time})),
  fitDutyMinIntervalMin: Number($("fitDutyMinIntervalInput")?.value||30),
  fitDutyDefaultIntervalHr: Number($("fitDutyDefaultIntervalInput")?.value||4),
  fitDutyMaxIntervalHr: Number($("fitDutyMaxIntervalInput")?.value||12),
  fitDutyValidOnly: !!$("fitDutyValidOnlyToggle")?.checked,
  fitDutyIgnoreIncomplete: !!$("fitDutyIgnoreIncompleteToggle")?.checked,
  alertSound: $("schedulerAlertSoundSelect")?.value || "soft_chime",
  voiceEnabled: !!$("schedulerVoiceEnabledToggle")?.checked,
  repeatOnce: !!$("schedulerRepeatOnceToggle")?.checked,
  quietHoursEnabled: !!$("schedulerQuietHoursToggle")?.checked,
  quietStart: $("schedulerQuietStartInput")?.value || "22:00",
  quietEnd: $("schedulerQuietEndInput")?.value || "06:00",
  nextTestAt: prior.nextTestAt || null,
  nextReason: prior.nextReason || "No active reminder",
  lastReminderResult: prior.lastReminderResult || "Not yet used",
  deviceTest: prior.deviceTest || structuredClone(DEFAULT_SCHEDULER_SETTINGS.deviceTest)
 };
}
function schedulerSetEnabled(on){
 schedulerState.settings.enabled = !!on;
 renderSchedulerSettings();
}
function schedulerSetType(type){
 schedulerState.settings.type = type;
 renderSchedulerSettings();
}
function schedulerSetPersonalMode(mode){
 schedulerState.settings.personalMode = mode;
 renderSchedulerSettings();
}

function validateSchedulerSettings(s){
 if(!s.enabled) return {ok:true};
 if(s.type==="personal") {
  if(s.personalMode!=="daily_times") {
   if(!Number.isFinite(s.personalIntervalHours) || s.personalIntervalHours<1 || s.personalIntervalHours>24) return {ok:false,message:"Repeat every (hours) must be 1 to 24."};
  } else if(!s.personalTimes.some(x=>x.enabled)) {
   return {ok:false,message:"Select at least 1 daily reminder time."};
  }
 }
 if(s.type==="fit_duty") {
  if(s.fitDutyMinIntervalMin < 5) return {ok:false,message:"Minimum interval must be at least 5 minutes."};
  if(s.fitDutyDefaultIntervalHr < 1) return {ok:false,message:"Default interval must be at least 1 hour."};
  if(s.fitDutyMaxIntervalHr < s.fitDutyDefaultIntervalHr) return {ok:false,message:"Maximum interval must be greater than or equal to default interval."};
 }
 return {ok:true};
}
function schedulerTimeToMinutes(t){
 const m = String(t||"00:00").match(/^(\d{1,2}):(\d{2})$/);
 if(!m) return 0;
 return Number(m[1])*60 + Number(m[2]);
}
function applyQuietHoursToDate(dateObj, s){
 if(!s.quietHoursEnabled) return dateObj;
 const out = new Date(dateObj.getTime());
 const mins = out.getHours()*60 + out.getMinutes();
 const start = schedulerTimeToMinutes(s.quietStart);
 const end = schedulerTimeToMinutes(s.quietEnd);
 const crosses = start > end;
 const inside = crosses ? (mins>=start || mins<end) : (mins>=start && mins<end);
 if(!inside) return out;
 if(crosses && mins>=start) out.setDate(out.getDate()+1);
 out.setHours(Math.floor(end/60), end%60, 0, 0);
 return out;
}
function computePersonalNextReminderAt(s, now=new Date()){
 const clampToPersonalWindow = (cand)=>{
  const start = schedulerTimeToMinutes(s.personalWindowStart);
  const end = schedulerTimeToMinutes(s.personalWindowEnd);
  if(!Number.isFinite(start) || !Number.isFinite(end)) return cand;
  const mins = cand.getHours()*60 + cand.getMinutes();
  if(mins < start){
   cand.setHours(Math.floor(start/60), start%60, 0, 0);
  }else if(mins >= end){
   cand.setDate(cand.getDate()+1);
   cand.setHours(Math.floor(start/60), start%60, 0, 0);
  }
  return cand;
 };
 if(s.personalMode!=="daily_times") {
  const base = new Date(now.getTime() + Math.max(1,Number(s.personalIntervalHours)||1)*3600000);
  let out = clampToPersonalWindow(base);
  out = applyQuietHoursToDate(out, s);
  out = clampToPersonalWindow(out);
  return out.toISOString();
 }
 const enabled = s.personalTimes
  .filter(x=>x.enabled)
  .map(x=>x.time)
  .sort((a,b)=>schedulerTimeToMinutes(a)-schedulerTimeToMinutes(b));
 if(!enabled.length) return null;
 for(let addDay=0; addDay<8; addDay++) {
  for(const t of enabled){
   const cand = new Date(now);
   cand.setDate(cand.getDate()+addDay);
   const mins = schedulerTimeToMinutes(t);
   cand.setHours(Math.floor(mins/60), mins%60, 0, 0);
   if(cand.getTime() > now.getTime()+1000) return applyQuietHoursToDate(cand, s).toISOString();
  }
 }
 return null;
}
// Returns the latest local Mode 2 result for scheduler use.
// Pass ignoreIncomplete=true only for Fit for Duty timing logic.
// Status/readout callers can pass false so the display reflects the latest Mode 2 session seen by the subject.
function getLatestCompletedMode2Result(ignoreIncomplete=true){
 const h = Array.isArray(state.history) ? state.history : [];
 for(let i=h.length-1;i>=0;i--){
  const r = h[i];
  if((r&&r.testMode)!=="mode2") continue;
  if(ignoreIncomplete && isPerfFailureSession(r)) continue;
  return r;
 }
 return null;
}
function getLatestCompletedMode2Label(){
 const r = getLatestCompletedMode2Result(false);
 return r && r.time ? new Date(r.time).toLocaleString() : "";
}
/*
 Personal Baseline
 -----------------
 Personal Baseline is a rolling subject-specific reference based on the
 most recent 5 qualifying Mode 1 / Mode 2 adaptive-phase MBS scores.

 Purpose:
 - provides a current personal reference
 - updates over time to capture learning effects
 - excludes failed or low-quality baseline candidates

 A session qualifies only if:
 - testMode is mode1 or mode2
 - session is not failed
 - adaptive-phase MBS ≤ personal baseline qualifying threshold (default 1900 ms)
 - Samn-Perelli score is 5, 6, or 7

 Failed sessions remain in general session history only and are never
 included in baseline computation.
*/
function isGuestBaselineSubject(v){
 const s = String(v||"").trim().toLowerCase();
 return !s || s==="0" || s==="guest" || s==="guest / no email";
}
function getAdaptivePhaseMbs(result){
 if(!result) return null;
 if(result.testMode==="mode2"){
  const m = Number(result.mode2AdaptiveMbsMs!=null ? result.mode2AdaptiveMbsMs : result.averageLast2BlockingScoresMs);
  return Number.isFinite(m) ? m : null;
 }
 if(result.testMode==="mode1"){
  const m = Number(result.averageLast2BlockingScoresMs);
  return Number.isFinite(m) ? m : null;
 }
 return null;
}

function getPersonalBaselineMaxMbs(){
 const v = getCurrentBaselineMaxMbsValue();
 return Number.isFinite(v) && v>0 ? v : (isMemoryChallengeActive()?3200:1900);
}
function isBaselineQualifyingSession(result){
 if(!result) return false;
 if(isGuestHistorySubjectId(result.subjectId)) return false;
 if(!(result.testMode==="mode1" || result.testMode==="mode2")) return false;
 // Personal Baseline uses STANDARD CogSpeed only.
 // Memory Challenge and Survival Challenge are excluded entirely.
 const symbolSet = getResultSymbolSet(result);
 if(symbolSet==="memory" || symbolSet==="survival") return false;
 if(isPerfFailureSession(result)) return false;
 const mbs = getAdaptivePhaseMbs(result);
 const maxMbs = getPersonalBaselineMaxMbs();
 // Only sessions at or below the qualifying threshold enter the rolling baseline.
 // Sessions above the threshold are ignored for baseline updating and do not replace it.
 if(!Number.isFinite(mbs) || !(mbs <= maxMbs)) return false;
 const spfs = Number(result?.samnPerelli?.score);
 return spfs===5 || spfs===6 || spfs===7;
}
function mapBaselineRow(result, sourceIndex){
 return {
  sourceIndex,
  sessionNumber: result.sessionNumber!=null ? result.sessionNumber : null,
  time: result.time || null,
  testMode: result.testMode,
  modeLabel: formatModeTag(result.testMode),
  mbs: getAdaptivePhaseMbs(result),
  spfs: Number(result?.samnPerelli?.score)
 };
}
function computePersonalBaseline(results, subjectId, cutoffTime=null){
 const all = Array.isArray(results) ? results : [];
 const sid = String(subjectId||"").trim();
 if(!sid || isGuestBaselineSubject(sid)) return {
  established:false, qualifyingCount:0, averageMbs:null, lastFive:[], allQualifying:[],
  statusText:"Baseline not yet established, Test again.", subjectId:sid
 };
 const cutoffMs = cutoffTime ? new Date(cutoffTime).getTime() : null;
 const qualifying = all.map((r,idx)=>({r,idx}))
  .filter(({r})=> String(r?.subjectId||"").trim().toLowerCase()===sid.toLowerCase())
  .filter(({r})=> Number.isFinite(Date.parse(r?.time)))
  .filter(({r})=> cutoffMs==null || Date.parse(r?.time) <= cutoffMs)
  .filter(({r})=> isBaselineQualifyingSession(r))
  .sort((a,b)=> Date.parse(a.r.time)-Date.parse(b.r.time));
 const startOfLastFive = Math.max(0, qualifying.length - 5);
 const allQualifying = qualifying.map(({r,idx}, orderIndex)=> ({
  ...mapBaselineRow(r, idx),
  orderIndex,
  usedInCurrentBaseline: orderIndex >= startOfLastFive
 }));
 const lastFive = allQualifying.slice(-5);
 if(lastFive.length < 5){
  return {
   established:false,
   qualifyingCount:qualifying.length,
   averageMbs:null,
   lastFive,
   allQualifying,
   statusText:"Baseline not yet established, Test again.",
   subjectId:sid
  };
 }
 const avg = Math.round(lastFive.reduce((sum,row)=>sum + Number(row.mbs||0), 0) / 5);
 return {
  established:true,
  qualifyingCount:qualifying.length,
  averageMbs:avg,
  lastFive,
  allQualifying,
  statusText:`Baseline: ${avg} ms`,
  subjectId:sid
 };
}
function getPersonalBaselineForResult(result){
 const sid = String(result?.subjectId||"").trim();
 // Personal Baseline displays must always reflect the full qualifying history
 // for the registered subject, independent of which session is selected in
 // the Speedometer. Do not clip the baseline to the selected session time.
 return computePersonalBaseline(state.history, sid, null);
}
function renderSpeedometerBaseline(result){
 const el = $("speedometerBaselineText");
 if(!el) return;
 const baseline = getPersonalBaselineForResult(result);
 el.textContent = baseline.established ? `Baseline: ${baseline.averageMbs} ms` : "Baseline not yet established, Test again.";
}
function getPersonalBaselineSummaryText(result, label="Personal Baseline"){
 const baseline = getPersonalBaselineForResult(result);
 return baseline.established ? `${label}: ${baseline.averageMbs} ms` : `${label}: Baseline not yet established, Test again.`;
}
function escapeHtml(s){
 return String(s==null?"":s).replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
}
function buildPersonalBaselineSvg(rows, avg){
 const W=860, H=360, L=72, R=24, T=30, B=48;
 const svgOpen = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="auto" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;max-width:100%;height:auto">`;
 if(!rows.length){
  return `<div style="width:100%;max-width:100%;overflow-x:hidden">${svgOpen}<rect width="100%" height="100%" fill="#081321"/><text x="${W/2}" y="${H/2}" fill="#c8d7e5" text-anchor="middle" font-family="Arial,sans-serif" font-size="24">No qualifying baseline sessions yet</text></svg></div>`;
 }
 const vals = rows.map(r=>Number(r.mbs)).filter(Number.isFinite);
 if(Number.isFinite(avg)) vals.push(avg);
 const minV = Math.min(...vals), maxV = Math.max(...vals);
 const pad = Math.max(40, Math.round((maxV-minV||100)*0.15));
 const lo = Math.max(0, minV - pad), hi = maxV + pad;
 const pw=W-L-R, ph=H-T-B;
 const x = i => rows.length===1 ? L+pw/2 : L + (pw*(i/(rows.length-1)));
 // Inverted plot: lower ms is better, so lower values draw higher on the chart.
 const y = v => T + ((v-lo)/(hi-lo||1))*ph;
 const poly = rows.map((r,i)=>`${x(i).toFixed(1)},${y(r.mbs).toFixed(1)}`).join(' ');
 let parts=[`<div style="width:100%;max-width:100%;overflow-x:hidden">`,svgOpen,`<rect width="100%" height="100%" fill="#081321" rx="16"/>`,`<text x="${W/2}" y="22" fill="#7fd7ff" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" font-weight="700">Personal Baseline — All Qualifying MBS Scores</text>`];
 for(let i=0;i<5;i++){
  const v = lo + (hi-lo)*(i/4);
  const yy = y(v);
  parts.push(`<line x1="${L}" y1="${yy.toFixed(1)}" x2="${W-R}" y2="${yy.toFixed(1)}" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>`);
  parts.push(`<text x="${L-10}" y="${(yy+4).toFixed(1)}" fill="#c8d7e5" text-anchor="end" font-family="Arial,sans-serif" font-size="14">${Math.round(v)}</text>`);
 }
 parts.push(`<line x1="${L}" y1="${T}" x2="${L}" y2="${H-B}" stroke="#c8d7e5" stroke-width="1.4"/><line x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}" stroke="#c8d7e5" stroke-width="1.4"/>`);
 if(rows.length>1) parts.push(`<polyline fill="none" stroke="#7fd7ff" stroke-width="3" points="${poly}"/>`);
 rows.forEach((r,i)=>{
  const xx=x(i), yy=y(r.mbs);
  const fill = r.usedInCurrentBaseline ? "#72d572" : "#ffd36f";
  const radius = r.usedInCurrentBaseline ? 6.4 : 5.5;
  parts.push(`<circle cx="${xx.toFixed(1)}" cy="${yy.toFixed(1)}" r="${radius}" fill="${fill}" stroke="#ffffff" stroke-width="1.2"/>`);
  parts.push(`<text x="${xx.toFixed(1)}" y="${H-B+22}" fill="#c8d7e5" text-anchor="middle" font-family="Arial,sans-serif" font-size="12">${i+1}</text>`);
 });
 if(Number.isFinite(avg)){
  const yy=y(avg);
  parts.push(`<line x1="${L}" y1="${yy.toFixed(1)}" x2="${W-R}" y2="${yy.toFixed(1)}" stroke="#72d572" stroke-width="2" stroke-dasharray="8 6"/>`);
  parts.push(`<text x="${W-R}" y="${Math.max(T+14,(yy-8)).toFixed(1)}" fill="#72d572" text-anchor="end" font-family="Arial,sans-serif" font-size="14" font-weight="700">Average ${Math.round(avg)} ms</text>`);
 }
 parts.push(`<text x="${W/2}" y="${H-12}" fill="#9fb4c8" text-anchor="middle" font-family="Arial,sans-serif" font-size="13">Qualifying session order (oldest to newest); current rolling baseline uses the last 5 marked points</text></svg></div>`);
 return parts.join('');
}
function openPersonalBaselinePage(sessionIndex){
 const ctx = resolveResultContext(null, sessionIndex, "personal baseline");
 const result = ctx.result;
 if(!result){ setStatus("No session available for Personal Baseline"); return; }
 const baseline = getPersonalBaselineForResult(result);
 const rows = baseline.allQualifying || baseline.lastFive || [];
 const statusText = baseline.established ? `Baseline: ${baseline.averageMbs} ms` : "Baseline not yet established, Test again.";
 const statusEl = $("personalBaselineStatus");
 const metaEl = $("personalBaselineMeta");
 const graphEl = $("personalBaselineGraph");
 const table = $("personalBaselineTable");
 const tbody = table ? table.querySelector("tbody") : null;
 if(statusEl) statusEl.textContent = statusText;
 if(metaEl){
  const sessionTime = result.time ? new Date(result.time).toLocaleString() : "—";
  metaEl.innerHTML = `<div><strong>Subject:</strong> ${escapeHtml(String(result.subjectId||"—"))}</div><div><strong>History scope:</strong> Full qualifying saved history</div><div><strong>Selected session:</strong> ${escapeHtml(sessionTime)}</div><div><strong>Qualifying sessions available:</strong> ${baseline.qualifyingCount}</div><div style="margin-top:6px">All qualifying sessions are shown below. The rolling baseline value itself uses the most recent 5 qualifying non-Guest Mode 1 / Mode 2 adaptive-phase MBS scores with MBS &le; ${getPersonalBaselineMaxMbs()} ms, S-PFS 5–7, and no failed sessions.</div>`;
 }
 if(graphEl) graphEl.innerHTML = buildPersonalBaselineSvg(rows, baseline.established ? baseline.averageMbs : null);
 if(tbody){
  const bodyRows = rows.map((row,idx)=>`<tr><td style="padding:8px;border-bottom:1px solid var(--edge)">${idx+1}</td><td style="padding:8px;border-bottom:1px solid var(--edge)">${escapeHtml(row.time ? new Date(row.time).toLocaleString() : "—")}</td><td style="padding:8px;border-bottom:1px solid var(--edge)">${escapeHtml(row.modeLabel||formatModeTag(row.testMode))}</td><td style="padding:8px;border-bottom:1px solid var(--edge);text-align:right">${Number(row.mbs).toFixed(1)}</td><td style="padding:8px;border-bottom:1px solid var(--edge);text-align:right">${row.spfs}</td><td style="padding:8px;border-bottom:1px solid var(--edge);text-align:center">${row.usedInCurrentBaseline ? "Yes" : ""}</td></tr>`).join('');
  const avgRow = baseline.established ? `<tr><td style="padding:8px"></td><td style="padding:8px"><strong>Current rolling baseline average</strong></td><td style="padding:8px"></td><td style="padding:8px;text-align:right"><strong>${baseline.averageMbs}</strong></td><td style="padding:8px"></td><td style="padding:8px;text-align:center"><strong>Last 5</strong></td></tr>` : "";
  tbody.innerHTML = bodyRows || '<tr><td colspan="6" style="padding:10px">No qualifying baseline sessions yet.</td></tr>';
  if(avgRow) tbody.insertAdjacentHTML("beforeend", avgRow);
 }
 $("outcomeOverlay").classList.add("hidden");
 $("personalBaselineOverlay").classList.remove("hidden");
 setStatus("Personal Baseline");
}
// Fit for Duty uses the most recent completed valid local Mode 2 plus S-PFS.
// Lower CPI and lower S-PFS (more fatigued/impaired) shorten the next interval.
// Higher CPI and higher S-PFS (more alert/rested) lengthen the next interval.
function computeFitDutyNextReminderAt(s, now=new Date()){
 const latest = getLatestCompletedMode2Result(s?.fitDutyIgnoreIncomplete!==false);
 let minutes = Math.max(60, Number(s.fitDutyDefaultIntervalHr||4) * 60);
 if(latest){
  const cpi = Number(latest.cognitivePerformanceIndex);
  const spf = (latest.samnPerelli && latest.samnPerelli.score != null)
    ? Number(latest.samnPerelli.score) : null;
  const minMin = Math.max(5, Number(s.fitDutyMinIntervalMin)||30);
  const defMin = Math.max(minMin, Number(s.fitDutyDefaultIntervalHr||4)*60);
  const maxMin = Math.max(defMin, Number(s.fitDutyMaxIntervalHr||12)*60);
  if((Number.isFinite(cpi) && cpi < 25) || (Number.isFinite(spf) && spf <= 2)) minutes = minMin;
  else if((Number.isFinite(cpi) && cpi < 50) || (Number.isFinite(spf) && spf <= 3)) minutes = Math.max(minMin, Math.round(defMin/2));
  else if((Number.isFinite(cpi) && cpi >= 80) && (Number.isFinite(spf) && spf >= 6)) minutes = maxMin;
  else minutes = defMin;
 }
 const out = new Date(now.getTime() + minutes*60000);
 return applyQuietHoursToDate(out, s).toISOString();
}
function computeNextSchedulerReason(s){
 if(!s.enabled || s.type==="anytime") return "No active reminder";
 if(s.type==="personal") return s.personalMode==="daily_times" ? "Personal daily time" : `Personal interval (${s.personalIntervalHours}h)`;
 return "Fit for Duty follow-up";
}
function computeNextSchedulerReminderAt(s, now=new Date()){
 if(!s.enabled || s.type==="anytime") return null;
 return s.type==="personal" ? computePersonalNextReminderAt(s, now) : computeFitDutyNextReminderAt(s, now);
}
function persistActiveSchedulerSettings(){
 if(!schedulerState.activeSubjectId || isGuestSchedulerSubject(schedulerState.activeSubjectId)) return false;
 return saveSchedulerSettings(schedulerState.activeSubjectId, schedulerState.settings);
}
function refreshSchedulerStatus(){
 renderSchedulerStatusFields(schedulerState.settings || structuredClone(DEFAULT_SCHEDULER_SETTINGS));
}
function stopSchedulerTimers(){
 clearTimeout(schedulerState.reminderTimerId); schedulerState.reminderTimerId = null;
 clearTimeout(schedulerState.repeatTimerId); schedulerState.repeatTimerId = null;
 clearTimeout(schedulerState.bgTestTimerId); schedulerState.bgTestTimerId = null;
}
// Scheduler sound test waits for the bundled clip to finish before asking the
// subject whether it was heard. Resolving on playback start can suppress audio
// on phones because the confirmation dialog steals focus mid-playback.
//
// Rev 70: If a prior Audio is still playing (e.g. user taps Test Sound twice
// in quick succession), stop and release it before starting a new one so the
// clips don't overlap.
function playSchedulerSound(soundKey){
 if(!soundKey || soundKey==="off") return Promise.resolve(false);
 const src = SCHEDULER_SOUND_FILES[soundKey];
 if(!src) return Promise.resolve(false);
 // Stop any already-playing scheduler Audio.
 try{
  const prev = schedulerState.activeAudio;
  if(prev){
   prev.onended = null; prev.onerror = null; prev.onabort = null;
   try{ prev.pause(); }catch(e){}
   schedulerState.activeAudio = null;
  }
 }catch(e){}
 return new Promise(resolve=>{
  try{
   const a = new Audio(src);
   schedulerState.activeAudio = a;
   let settled = false;
   const done = (ok)=>{
    if(settled) return;
    settled = true;
    if(schedulerState.activeAudio === a) schedulerState.activeAudio = null;
    resolve(ok);
   };
   a.preload = "auto";
   a.volume = 1.0;
   a.currentTime = 0;
   a.onended = ()=>done(true);
   a.onerror = ()=>done(false);
   a.onabort = ()=>done(false);
   const playPromise = a.play();
   if(playPromise && typeof playPromise.catch === "function") playPromise.catch(()=>done(false));
  }catch(e){ resolve(false); }
 });
}
// Scheduler voice uses the device text-to-speech system. The Promise resolves
// when the utterance ends so the confirmation dialog appears only after speech
// had a chance to play, instead of interrupting it immediately.
function speakSchedulerPrompt(type){
 if(!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") return Promise.resolve(false);
 const msg = type==="fit_duty" ? "CogSpeed reminder. Fit for Duty follow-up recommended." : "CogSpeed reminder. Mode 2 test recommended now.";
 return new Promise(resolve=>{
  try{
   const speakNow = ()=>{
    try{
     window.speechSynthesis.cancel();
     const u = new SpeechSynthesisUtterance(msg);
     u.volume = 1.0;
     u.rate = 1;
     u.pitch = 1;
     let settled = false;
     const done = (ok)=>{
      if(settled) return;
      settled = true;
      resolve(ok);
     };
     u.onend = ()=>done(true);
     u.onerror = ()=>done(false);
     window.speechSynthesis.speak(u);
     setTimeout(()=>done(false), Math.max(2500, msg.length * 120));
    }catch(e){ resolve(false); }
   };
   const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
   if(Array.isArray(voices) && voices.length){ speakNow(); return; }
   const onVoicesChanged = ()=>{
    try{ window.speechSynthesis.removeEventListener?.("voiceschanged", onVoicesChanged); }catch(e){}
    speakNow();
   };
   if(window.speechSynthesis.addEventListener){
    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged, {once:true});
    setTimeout(()=>{
     try{ window.speechSynthesis.removeEventListener?.("voiceschanged", onVoicesChanged); }catch(e){}
     speakNow();
    }, 400);
   }else{
    setTimeout(speakNow, 0);
   }
  }catch(e){ resolve(false); }
 });
}
function scheduleNextReminderFromNow(reasonOverride){
 const s = schedulerState.settings;
 s.nextTestAt = computeNextSchedulerReminderAt(s, new Date());
 s.nextReason = reasonOverride || computeNextSchedulerReason(s);
 persistActiveSchedulerSettings();
 refreshSchedulerStatus();
 armSchedulerReminderTimer();
}
function showSchedulerReminderModal(){
 const s = schedulerState.settings;
 const body = s.type==="fit_duty" ? "Fit for Duty: Mode 2 follow-up recommended now." : "Personal Schedule: Mode 2 test due now.";
 try{ if(document.visibilityState !== "visible" && navigator.serviceWorker && navigator.serviceWorker.ready){ navigator.serviceWorker.ready.then(reg=>reg.showNotification?.("CogSpeed Reminder", {body})).catch(()=>{}); } }catch(e){}
 const title = $("schedulerReminderTitle");
 const bodyEl = $("schedulerReminderBody");
 if(title) title.textContent = "CogSpeed Reminder";
 if(bodyEl) bodyEl.textContent = body;
 $("schedulerReminderOverlay")?.classList.remove("hidden");
}
function startMode2FromSchedulerReminder(){
 $("schedulerReminderOverlay")?.classList.add("hidden");
 schedulerState.settings.lastReminderResult = "Completed";
 scheduleNextReminderFromNow();
 settings.testMode = "mode2";
 saveSettings();
 showSleepPrompt();
 setStatus("Mode 2 reminder started");
}
function snoozeSchedulerReminder(){
 $("schedulerReminderOverlay")?.classList.add("hidden");
 schedulerState.settings.lastReminderResult = "Snoozed";
 schedulerState.settings.nextTestAt = new Date(Date.now()+10*60*1000).toISOString();
 schedulerState.settings.nextReason = "Snoozed 10 min";
 persistActiveSchedulerSettings();
 refreshSchedulerStatus();
 armSchedulerReminderTimer();
 setStatus("Mode 2 reminder snoozed 10 min");
}
function skipSchedulerReminder(){
 $("schedulerReminderOverlay")?.classList.add("hidden");
 schedulerState.settings.lastReminderResult = "Skipped";
 scheduleNextReminderFromNow();
 setStatus("Mode 2 reminder skipped");
}
// Fires the local in-app reminder UI and optional sound/voice for the next scheduled Mode 2 test.
function fireSchedulerReminder(){
 const s = schedulerState.settings;
 if(!s?.enabled || !s.nextTestAt) return;
 playSchedulerSound(s.alertSound).then(ok=>{ const el=$("schedulerSoundTestResult"); if(el && ok) el.textContent = "Sound: PASS"; });
 if(s.voiceEnabled){
  speakSchedulerPrompt(s.type).then(ok=>{
   const el=$("schedulerVoiceTestResult");
   if(el && ok) el.textContent = "Voice: PASS";
  });
 }
 showSchedulerReminderModal();
 if(s.repeatOnce){
  clearTimeout(schedulerState.repeatTimerId);
  schedulerState.repeatTimerId = setTimeout(()=>{
   playSchedulerSound(s.alertSound);
   if(s.voiceEnabled) speakSchedulerPrompt(s.type);
  }, 10*60*1000);
 }
}
function armSchedulerReminderTimer(){
 stopSchedulerTimers();
 const nextAt = schedulerState.settings?.nextTestAt;
 if(!nextAt) return;
 const delay = Math.max(0, new Date(nextAt).getTime() - Date.now());
 schedulerState.reminderTimerId = setTimeout(fireSchedulerReminder, delay);
}
function schedulerResumeForCurrentProfile(){
 const subjectId = getCurrentSchedulerSubjectId();
 schedulerState.activeSubjectId = subjectId || "";
 schedulerState.settings = loadSchedulerSettings(subjectId);
 if(subjectId){
  if(schedulerState.settings.enabled && schedulerState.settings.type!=="anytime" && !schedulerState.settings.nextTestAt){
   schedulerState.settings.nextTestAt = computeNextSchedulerReminderAt(schedulerState.settings, new Date());
   schedulerState.settings.nextReason = computeNextSchedulerReason(schedulerState.settings);
   persistActiveSchedulerSettings();
  }
 }
 renderSchedulerSettings();
 refreshSchedulerDeviceStatus();
 armSchedulerReminderTimer();
}
function refreshSchedulerDeviceStatus(){
 const dt = schedulerState.settings?.deviceTest || structuredClone(DEFAULT_SCHEDULER_SETTINGS.deviceTest);
 dt.installed = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone ? "YES" : "NO";
 dt.permission = (typeof Notification === "undefined") ? "UNSUPPORTED" : (Notification.permission === "granted" ? "GRANTED" : Notification.permission === "denied" ? "DENIED" : "NOT ASKED");
 dt.serviceWorker = ("serviceWorker" in navigator) ? (navigator.serviceWorker.controller ? "PASS" : "UNKNOWN") : "FAIL";
 if(dt.localSave==="UNKNOWN") dt.localSave = schedulerState.activeSubjectId ? "PASS" : "FAIL";
 if(dt.text==="UNKNOWN") dt.text = "UNKNOWN";
 if(dt.sound==="UNKNOWN") dt.sound = "UNKNOWN";
 dt.voice = schedulerState.settings?.voiceEnabled ? (dt.voice==="DISABLED"?"UNKNOWN":dt.voice) : "DISABLED";
 if(dt.permission!=="GRANTED") dt.closedApp = dt.closedApp==="CONFIRMED" ? "LIMITED" : dt.closedApp;
 schedulerState.settings.deviceTest = dt;
 persistActiveSchedulerSettings();
 renderSchedulerDeviceFields(dt);
}
function onSchedulerUiChanged(){
 schedulerState.settings = { ...schedulerState.settings, ...collectSchedulerSettingsFromUI() };
 renderSchedulerSettings();
}
// Saves the Scheduler portion of the current profile draft.
// This helper is used by Save & Continue so scheduler validation and persistence stay in one place.
function saveSchedulerDraftFromUi(){
 if(!schedulerState.activeSubjectId || isGuestSchedulerSubject(schedulerState.activeSubjectId)){
  return { ok:false, message:"Scheduler is not available for Guest users." };
 }
 const proposed = collectSchedulerSettingsFromUI();
 const check = validateSchedulerSettings(proposed);
 if(!check.ok) return check;
 proposed.deviceTest = schedulerState.settings.deviceTest || structuredClone(DEFAULT_SCHEDULER_SETTINGS.deviceTest);
 proposed.lastReminderResult = schedulerState.settings.lastReminderResult || "Not yet used";
 proposed.nextTestAt = computeNextSchedulerReminderAt(proposed, new Date());
 proposed.nextReason = computeNextSchedulerReason(proposed);
 schedulerState.settings = proposed;
 persistActiveSchedulerSettings();
 renderSchedulerSettings();
 armSchedulerReminderTimer();
 return { ok:true };
}
function onSchedulerSaveSettings(){
 const res = saveSchedulerDraftFromUi();
 setStatus(res.ok ? "Scheduler settings saved." : (res.message || "Scheduler settings not saved."));
}
function onSchedulerTestSave(){
 if(!schedulerState.activeSubjectId || isGuestSchedulerSubject(schedulerState.activeSubjectId)){ schedulerState.settings.deviceTest.localSave = "FAIL"; renderSchedulerDeviceFields(schedulerState.settings.deviceTest); setStatus("Registered user required for Scheduler."); return; }
 const ok = persistActiveSchedulerSettings();
 schedulerState.settings.deviceTest.localSave = ok ? "PASS" : "FAIL";
 renderSchedulerDeviceFields(schedulerState.settings.deviceTest);
 setStatus(ok ? "Scheduler save PASS" : "Scheduler save FAIL");
}
function onSchedulerTestText(){
 const seen = confirm(`CogSpeed reminder test. Mode 2 test recommended now.

Press OK if you saw it.`);
 schedulerState.settings.deviceTest.text = seen ? "PASS" : "FAIL";
 persistActiveSchedulerSettings();
 renderSchedulerDeviceFields(schedulerState.settings.deviceTest);
 setStatus(seen ? "In-app text PASS" : "In-app text FAIL");
}
function onSchedulerTestSound(){
 // Rev 70: Always prompt the user to confirm whether they heard the sound.
 // Previously `const heard = ok && confirm(...)` silently marked FAIL if the
 // HTMLAudioElement fired onabort/onerror — iOS Safari fires onabort after
 // successful cached playback under memory pressure, so this produced false
 // negatives. The user is the authority on whether the sound was audible.
 playSchedulerSound(schedulerState.settings.alertSound).then(ok=>{
  setTimeout(()=>{
   const heard = confirm("Did you hear the alert sound? Press OK for Yes.");
   schedulerState.settings.deviceTest.sound = heard ? "PASS" : "FAIL";
   const el=$("schedulerSoundTestResult"); if(el) el.textContent = `Sound: ${heard?"PASS":"FAIL"}`;
   persistActiveSchedulerSettings();
   renderSchedulerDeviceFields(schedulerState.settings.deviceTest);
   if(!heard && ok === false){
    setStatus("In-app sound FAIL (playback event reported failure)");
   } else {
    setStatus(heard ? "In-app sound PASS" : "In-app sound FAIL");
   }
  }, 250);
 });
}
async function onSchedulerTestVoice(){
 if(!schedulerState.settings.voiceEnabled){
  schedulerState.settings.deviceTest.voice = "DISABLED";
  const el=$("schedulerVoiceTestResult"); if(el) el.textContent = "Voice: DISABLED";
  renderSchedulerDeviceFields(schedulerState.settings.deviceTest);
  setStatus("Voice Alert is OFF");
  return;
 }
 const ok = await speakSchedulerPrompt("personal");
 const heard = confirm("Did you hear the voice prompt? Press OK for Yes.");
 schedulerState.settings.deviceTest.voice = heard ? "PASS" : "FAIL";
 const el=$("schedulerVoiceTestResult"); if(el) el.textContent = `Voice: ${heard?"PASS":"FAIL"}`;
 persistActiveSchedulerSettings();
 renderSchedulerDeviceFields(schedulerState.settings.deviceTest);
 if(!heard && ok === false){
  setStatus("In-app voice FAIL (speech event reported failure)");
 } else {
  setStatus(heard ? "In-app voice PASS" : "In-app voice FAIL");
 }
}
function onSchedulerTestNotification(){
 if(typeof Notification === "undefined"){
  schedulerState.settings.deviceTest.permission = "UNSUPPORTED";
  schedulerState.settings.deviceTest.closedApp = "UNSUPPORTED";
  renderSchedulerDeviceFields(schedulerState.settings.deviceTest);
  setStatus("Notifications unsupported on this device");
  return;
 }
 const finish = (perm)=>{
  schedulerState.settings.deviceTest.permission = perm === "granted" ? "GRANTED" : perm === "denied" ? "DENIED" : "NOT ASKED";
  if(perm !== "granted"){
   schedulerState.settings.deviceTest.closedApp = "LIMITED";
   persistActiveSchedulerSettings();
   renderSchedulerDeviceFields(schedulerState.settings.deviceTest);
   setStatus("Notification permission not granted");
   return;
  }
  try{
   const body = "CogSpeed notification test.";
   if(navigator.serviceWorker && navigator.serviceWorker.ready){
    navigator.serviceWorker.ready.then(reg=>reg.showNotification?.("CogSpeed Reminder", {body})).catch(()=>new Notification("CogSpeed Reminder", {body}));
   }else{ new Notification("CogSpeed Reminder", {body}); }
   const got = confirm("A test notification was sent. Press OK if you received it.");
   schedulerState.settings.deviceTest.closedApp = got ? "LIMITED" : "FAIL";
   persistActiveSchedulerSettings();
   renderSchedulerDeviceFields(schedulerState.settings.deviceTest);
   setStatus(got ? "Notification PASS" : "Notification FAIL");
  }catch(e){
   schedulerState.settings.deviceTest.closedApp = "FAIL";
   persistActiveSchedulerSettings();
   renderSchedulerDeviceFields(schedulerState.settings.deviceTest);
   setStatus("Notification FAIL");
  }
 };
 if(Notification.permission === "granted") finish("granted");
 else Notification.requestPermission().then(finish).catch(()=>finish(Notification.permission));
}
function onSchedulerBackgroundTest(){
 schedulerState.backgroundTestPending = true;
 schedulerState.backgroundTestDueAt = Date.now() + 60000;
 schedulerState.settings.deviceTest.closedApp = "UNKNOWN";
 persistActiveSchedulerSettings();
 renderSchedulerDeviceFields(schedulerState.settings.deviceTest);
 setStatus("1-minute background test armed");
 alert(`Leave CogSpeed in background or close it now. Return in 1 to 2 minutes.`);
 clearTimeout(schedulerState.bgTestTimerId);
 schedulerState.bgTestTimerId = setTimeout(()=>{
  if(typeof Notification !== "undefined" && Notification.permission === "granted") {
   try{ if(navigator.serviceWorker && navigator.serviceWorker.ready){ navigator.serviceWorker.ready.then(reg=>reg.showNotification?.("CogSpeed Reminder", {body:"1-minute background reminder test."})).catch(()=>{}); } }catch(e){}
  }
  playSchedulerSound(schedulerState.settings.alertSound);
  schedulerState.bgTestTimerId = null;
  armSchedulerReminderTimer();
 }, 60000);
}
function maybeFinishBackgroundTest(){
 if(!schedulerState.backgroundTestPending) return;
 if(Date.now() < (schedulerState.backgroundTestDueAt||0)) return;
 schedulerState.backgroundTestPending = false;
 const got = confirm("Did the 1-minute background reminder arrive? Press OK for Yes.");
 schedulerState.settings.deviceTest.closedApp = got ? "CONFIRMED" : "LIMITED";
 persistActiveSchedulerSettings();
 renderSchedulerDeviceFields(schedulerState.settings.deviceTest);
 setStatus(got ? "Closed-app alert confirmed" : "Closed-app alert limited");
}
function clearSchedulerReminderStatus(){
 schedulerState.backgroundTestPending = false;
 schedulerState.backgroundTestDueAt = null;
 clearTimeout(schedulerState.bgTestTimerId); schedulerState.bgTestTimerId = null;
 clearTimeout(schedulerState.repeatTimerId); schedulerState.repeatTimerId = null;
 schedulerState.settings.lastReminderResult = "Not yet used";
 schedulerState.settings.nextTestAt = computeNextSchedulerReminderAt(schedulerState.settings, new Date());
 schedulerState.settings.nextReason = computeNextSchedulerReason(schedulerState.settings);
 persistActiveSchedulerSettings();
 refreshSchedulerStatus();
 refreshSchedulerDeviceStatus();
 armSchedulerReminderTimer();
 setStatus("Scheduler reminder status reset");
}
// Collects email (subject ID), birth month/year, gender, email pref.
// Stored in localStorage: ${STORAGE_PREFIX}_profile
// Not yet implemented: server-side account/population norms.
// ═══════════════════════════════════════════════════════════════

const PROFILE_KEY = `${STORAGE_PREFIX}_profile`;
const RAW_SESSION_STORE_KEY = `${STORAGE_PREFIX}_raw_sessions`;
const UPLOAD_QUEUE_STORE_KEY = `${STORAGE_PREFIX}_upload_queue`;
const VERIFICATION_RECEIPTS_STORE_KEY = `${STORAGE_PREFIX}_verification_receipts`;

function safeJsonParse(raw, fallback){
 try{ return raw!=null ? JSON.parse(raw) : fallback; }catch(e){ return fallback; }
}
function loadRawSessionStore(){
 return safeJsonParse(localStorage.getItem(RAW_SESSION_STORE_KEY), {});
}
function saveRawSessionStore(store){
 localStorage.setItem(RAW_SESSION_STORE_KEY, JSON.stringify(store||{}));
 return store||{};
}
function loadUploadQueue(){
 const q = safeJsonParse(localStorage.getItem(UPLOAD_QUEUE_STORE_KEY), []);
 return Array.isArray(q) ? q : [];
}
function saveUploadQueue(queue){
 const clean = Array.isArray(queue) ? queue : [];
 localStorage.setItem(UPLOAD_QUEUE_STORE_KEY, JSON.stringify(clean));
 return clean;
}
function loadVerificationReceiptStore(){
 return safeJsonParse(localStorage.getItem(VERIFICATION_RECEIPTS_STORE_KEY), {});
}
function saveVerificationReceiptStore(store){
 localStorage.setItem(VERIFICATION_RECEIPTS_STORE_KEY, JSON.stringify(store||{}));
 return store||{};
}
function generateSessionUuid(){
 try{
  if(window.crypto && crypto.randomUUID) return crypto.randomUUID();
 }catch(e){}
 return `sess-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
}
function persistResearchIdentity(){
 try{
  const profile = state.profile || loadProfile() || {};
  if(state.researchAnonymousId) profile.researchAnonymousId = state.researchAnonymousId;
  saveProfile(profile);
  state.profile = profile;
 }catch(e){}
}
function ensureResearchAnonymousId(){
 const existing = String(state.profile?.researchAnonymousId || state.researchAnonymousId || '').trim();
 if(existing) return existing;
 let rid = '';
 try{ if(window.crypto && crypto.randomUUID) rid = `RID-${crypto.randomUUID()}`; }catch(e){}
 if(!rid) rid = `RID-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
 state.researchAnonymousId = rid;
 if(!state.profile) state.profile = loadProfile() || {};
 state.profile.researchAnonymousId = rid;
 persistResearchIdentity();
 const el = $("profileResearchAnonymousId"); if(el && !el.value) el.value = rid;
 return rid;
}
function currentResearchModelVersions(){
 // V699rev151: CPA model bumped from v1 → v2. v2 features:
 //   • Accuracy composite (correct − wrong − 0.5·miss) replaces three
 //     collinear per-rate residuals.
 //   • OLS-slope drift replaces median-of-halves drift (signed; rewards
 //     within-phase speed-up instead of flooring to zero).
 //   • Piecewise-linear expected-profile interpolation replaces step buckets.
 //   • Weights retuned to 9/6/6 so the mode2NormMaxDelta cap (20) can
 //     actually engage at the extreme of underperformance.
 // A server-side verifier will need to implement v2 semantics before it
 // can issue receipts for CPA values computed under this model version.
 return {
  cpaModelVersion: 'mode2-cpa-norm-v2',
  baselineModelVersion: 'baseline-v1',
  cpiModelVersion: 'cpi-v1',
  dispositionModelVersion: 'disp-v1'
 };
}
// Verification wording is intentionally minimal. Show it only where operationally needed
// (for example Results - Complete and exported records), not on the Speedometer or Results Summary.
function getVerificationStatusLabel(result){
 const code = String(result?.verificationStatus||'local_only').toLowerCase();
 if(code==='verified') return 'Verified';
 if(code==='uploaded') return 'Upload recorded';
 if(code==='queued') return 'Upload pending';
 if(code==='rejected') return 'Review needed';
 if(code==='restored_unverified') return 'Restored locally';
 return 'Local only';
}
function buildScoringSnapshot(){
 const mode2 = {
  sustainedReliefMinMs: Number(settings.mode2SustainedReliefMinMs ?? settings.mode2ReliefMinMs ?? 0),
  sustainedReliefPct: Number(settings.mode2SustainedReliefPct ?? -0.1),
  sustainedReliefMaxMs: Number(settings.mode2SustainedReliefMaxMs ?? 220),
  normMaxDelta: Number(settings.mode2NormMaxDelta ?? 20),
  qualifyingBlockGapMs: Number(settings.qualifyingBlockGapMs ?? 250),
  sustainedTrialCount: Number(settings.mode2SustainedTrialCount ?? 20),
  finalTrialCount: Number(settings.mode2FinalTrialCount ?? 2)
 };
 const adminFields = [
  'mode2NormExpectedCorrectRate','mode2NormExpectedWrongRate','mode2NormExpectedMissRate','mode2NormExpectedDriftPct','mode2NormExpectedCvPct',
  'mode2NormToleranceCorrectRate','mode2NormToleranceWrongRate','mode2NormToleranceMissRate','mode2NormToleranceDriftPct','mode2NormToleranceCvPct',
  'mode2NormWeightCorrect','mode2NormWeightWrong','mode2NormWeightMiss','mode2NormWeightDrift','mode2NormWeightCv','mode2NormMaxDelta'
 ];
 const profile = {};
 adminFields.forEach(k=>{ if(settings[k] != null) profile[k] = settings[k]; });
 return {
  capturedAtIso: new Date().toISOString(),
  release: RELEASE,
  appVersion: APP_VERSION,
  appRevStamp: APP_REV_STAMP,
  researchModeLocked: !!settings.researchModeLocked,
  models: currentResearchModelVersions(),
  mode2,
  profiles: profile,
  researchUploadPolicy: {
   includeLearningSessions: !!settings.researchIncludeLearningSessions,
   autoUpload: !!settings.researchAutoUpload,
   retainRawAfterVerify: !!settings.researchRetainRawAfterVerify
  }
 };
}
async function hashPayload(obj){
 return computeCogSpeedBackupHash(obj);
}
async function hashTrialLog(rtLog){
 return computeCogSpeedBackupHash(Array.isArray(rtLog)?rtLog:[]);
}
async function hashSettingsSnapshot(snapshot){
 return computeCogSpeedBackupHash(snapshot||{});
}
function buildBaselineUploadContext(result){
 const sid = String(result?.subjectId||'').trim();
 const staged = Array.isArray(state.history) ? [...state.history, result] : [result];
 const baseline = computePersonalBaseline(staged, sid, result?.time || null);
 const currentIndex = staged.length - 1;
 const currentQual = !!isBaselineQualifyingSession(result);
 const currentRow = Array.isArray(baseline.allQualifying) ? baseline.allQualifying.find(row => row && row.sourceIndex === currentIndex) : null;
 return {
  baselineEstablished: !!baseline.established,
  qualifyingBaselineCount: Number(baseline.qualifyingCount||0),
  rollingBaselineValue: baseline.averageMbs ?? null,
  isCurrentSessionBaselineQualifying: currentQual,
  currentSessionUsedInRollingBaseline: !!currentRow?.usedInCurrentBaseline,
  usedNowCount: Array.isArray(baseline.lastFive) ? baseline.lastFive.length : 0,
  baselineReason: baseline.statusText || (baseline.established ? 'Baseline established.' : 'Baseline not yet established, Test again.')
 };
}
async function buildResearchUploadPayload(result){
 const scoringSnapshot = buildScoringSnapshot();
 const baselineStatus = result.baselineUploadContext || buildBaselineUploadContext(result);
 const participantResearchId = ensureResearchAnonymousId();
 const payload = {
  sessionUuid: result.sessionUuid,
  lane: result.researchUploadLane || 'do_not_upload',
  verificationStatus: result.verificationStatus || 'local_only',
  capturedAtIso: result.time || new Date().toISOString(),
  participantResearchId,
  appVersion: APP_VERSION,
  appRevStamp: APP_REV_STAMP,
  modelVersions: currentResearchModelVersions(),
  scoringSnapshot,
  demographics: {
   age: result.profile?.age ?? null,
   gender: result.profile?.gender ?? null,
   emailResults: !!result.profile?.emailResults
  },
  samnPerelli: result.samnPerelli || null,
  sleepLog: result.sleepLog || null,
  baselineStatus,
  provisionalScores: result.localProvisionalScores || {
   cpi: result.cognitivePerformanceIndex ?? null,
   mbs: result.averageLast2BlockingScoresMs ?? null,
   cpa: result.cpa ?? null,
   disposition: result.dispositionLabel || null
  },
  resultSummary: {
   testMode: result.testMode,
   totalTrials: result.totalTrials ?? null,
   totalResponses: result.totalResponses ?? null,
   totalCorrect: result.totalCorrect ?? null,
   totalIncorrect: result.totalIncorrect ?? null,
   missedTrials: result.missedTrials ?? null,
   timingQuality: result.timingQuality || null,
   mode2TimingSummary: result.mode2TimingSummary || null,
   geo: result.geo || null
  },
  rtLog: Array.isArray(result.rtLog) ? result.rtLog : []
 };
 payload.trialLogHash = await hashTrialLog(payload.rtLog);
 payload.settingsHash = await hashSettingsSnapshot(scoringSnapshot);
 payload.payloadHash = await hashPayload({
  sessionUuid: payload.sessionUuid,
  lane: payload.lane,
  verificationStatus: payload.verificationStatus,
  capturedAtIso: payload.capturedAtIso,
  participantResearchId: payload.participantResearchId,
  appVersion: payload.appVersion,
  appRevStamp: payload.appRevStamp,
  modelVersions: payload.modelVersions,
  scoringSnapshot: payload.scoringSnapshot,
  demographics: payload.demographics,
  samnPerelli: payload.samnPerelli,
  sleepLog: payload.sleepLog,
  baselineStatus: payload.baselineStatus,
  provisionalScores: payload.provisionalScores,
  resultSummary: payload.resultSummary,
  trialLogHash: payload.trialLogHash,
  settingsHash: payload.settingsHash
 });
 return payload;
}
function classifyResearchUploadLane(result, baselineCtx=null, settingsObj=settings){
 const profile = state.profile || loadProfile() || {};
 if(!profile.researchUploadEnabled) return 'do_not_upload';
 if(result?.testAborted || result?.invalidSession) return 'quarantine';
 if(String(result?.verificationStatus||'').toLowerCase()==='rejected') return 'quarantine';
 const ctx = baselineCtx || result?.baselineUploadContext || buildBaselineUploadContext(result);
 const learningOverride = !!settingsObj.researchIncludeLearningSessions;
 if(learningOverride) return ctx.baselineEstablished ? 'normative' : 'learning';
 return ctx.baselineEstablished ? 'normative' : 'do_not_upload';
}
function enqueueUpload(payload){
 const queue = loadUploadQueue();
 const existing = queue.findIndex(item => item && item.sessionUuid === payload.sessionUuid);
 const rawStore = loadRawSessionStore();
 rawStore[payload.sessionUuid] = {
  sessionUuid: payload.sessionUuid,
  payloadHash: payload.payloadHash,
  trialLogHash: payload.trialLogHash,
  settingsHash: payload.settingsHash,
  verificationStatus: payload.verificationStatus,
  lane: payload.lane,
  capturedAtIso: payload.capturedAtIso,
  participantResearchId: payload.participantResearchId,
  modelVersions: payload.modelVersions,
  provisionalScores: payload.provisionalScores,
  baselineStatus: payload.baselineStatus,
  resultSummary: payload.resultSummary,
  payload
 };
 saveRawSessionStore(rawStore);
 const record = {
  sessionUuid: payload.sessionUuid,
  lane: payload.lane,
  payloadHash: payload.payloadHash,
  enqueuedAtIso: new Date().toISOString(),
  attempts: existing>=0 ? Number(queue[existing].attempts||0) : 0,
  lastAttemptIso: existing>=0 ? (queue[existing].lastAttemptIso||null) : null,
  status: 'queued'
 };
 if(existing>=0) queue[existing]=record; else queue.push(record);
 saveUploadQueue(queue);
 return record;
}
async function flushUploadQueue(){
 const queue = loadUploadQueue();
 if(!queue.length) return {queued:0, uploaded:0};
 const endpoint = String(settings.researchUploadEndpoint || '').trim();
 if(!settings.researchUploadEnabled && !state.profile?.researchUploadEnabled){
  saveUploadQueue(queue);
  return {queued: queue.length, uploaded:0};
 }
 if(!endpoint || !navigator.onLine){
  saveUploadQueue(queue);
  return {queued: queue.length, uploaded:0};
 }
 const rawStore = loadRawSessionStore();
 const keep = [];
 let uploaded = 0;
 for(const item of queue){
  try{
   const payload = rawStore[item.sessionUuid]?.payload;
   if(!payload){ item.status='missing_raw_payload'; keep.push(item); continue; }
   item.attempts = Number(item.attempts||0) + 1;
   item.lastAttemptIso = new Date().toISOString();
   const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
   });
   if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
   let receipt = null;
   try{ receipt = await resp.json(); }catch(e){ receipt = null; }
   if(receipt) applyVerificationReceipt(receipt);
   else applyVerificationReceipt({sessionUuid:item.sessionUuid, verificationStatus:'uploaded', serverPayloadHash: payload.payloadHash});
   uploaded += 1;
  }catch(err){
   item.status = 'queued';
   item.lastError = String(err && err.message ? err.message : err);
   keep.push(item);
  }
 }
 saveUploadQueue(keep);
 return {queued: keep.length, uploaded};
}
function pruneVerifiedRawSessions(){
 if(settings.researchRetainRawAfterVerify) return false;
 const rawStore = loadRawSessionStore();
 let changed = false;
 Object.keys(rawStore).forEach(sessionUuid => {
  const row = rawStore[sessionUuid];
  const status = String(row?.verificationStatus || '').toLowerCase();
  if(status === 'verified' || status === 'uploaded'){
   rawStore[sessionUuid] = {
    sessionUuid,
    payloadHash: row.payloadHash || null,
    trialLogHash: row.trialLogHash || null,
    settingsHash: row.settingsHash || null,
    verificationStatus: row.verificationStatus,
    verificationReceiptId: row.verificationReceiptId || null,
    capturedAtIso: row.capturedAtIso || null,
    lane: row.lane || null,
    participantResearchId: row.participantResearchId || null,
    modelVersions: row.modelVersions || null,
    resultSummary: row.resultSummary || null,
    provisionalScores: row.provisionalScores || null,
    baselineStatus: row.baselineStatus || null
   };
   changed = true;
  }
 });
 if(changed) saveRawSessionStore(rawStore);
 return changed;
}
function applyVerificationReceipt(receipt){
 const sessionUuid = receipt && receipt.sessionUuid ? receipt.sessionUuid : null;
 if(!sessionUuid) return false;
 const rawStore = loadRawSessionStore();
 const localPayloadHash = rawStore[sessionUuid]?.payloadHash || null;
 if(receipt.serverPayloadHash && localPayloadHash && receipt.serverPayloadHash !== localPayloadHash) return false;
 const receipts = loadVerificationReceiptStore();
 receipts[sessionUuid] = {
  ...receipt,
  receivedAtIso: receipt.receivedAtIso || new Date().toISOString()
 };
 saveVerificationReceiptStore(receipts);
 if(rawStore[sessionUuid]){
  rawStore[sessionUuid].verificationStatus = receipt.verificationStatus || 'verified';
  rawStore[sessionUuid].verificationReceiptId = receipt.receiptId || receipt.verificationReceiptId || rawStore[sessionUuid].verificationReceiptId || sessionUuid;
  rawStore[sessionUuid].serverComputedScores = receipt.verifiedScores || receipt.serverComputedScores || rawStore[sessionUuid].serverComputedScores || null;
  rawStore[sessionUuid].serverPayloadHash = receipt.serverPayloadHash || rawStore[sessionUuid].serverPayloadHash || null;
  rawStore[sessionUuid].receiptSignature = receipt.receiptSignature || rawStore[sessionUuid].receiptSignature || null;
  saveRawSessionStore(rawStore);
 }
 let changed = false;
 if(Array.isArray(state.history)){
  state.history = state.history.map(row => {
   if(row && row.sessionUuid === sessionUuid){
    changed = true;
    const verifiedScores = receipt.verifiedScores || receipt.serverComputedScores || row.serverVerifiedScores || null;
    const next = {
     ...row,
     verificationStatus: receipt.verificationStatus || 'verified',
     verificationReceiptId: receipt.receiptId || receipt.verificationReceiptId || row.verificationReceiptId || sessionUuid,
     verifiedAtIso: receipt.verifiedAtIso || new Date().toISOString(),
     serverVerifiedScores: verifiedScores,
     serverComputedScores: verifiedScores,
     receiptSignature: receipt.receiptSignature || row.receiptSignature || null,
     localProvisionalScores: row.localProvisionalScores || null
    };
    if(verifiedScores){
     if(verifiedScores.cpi != null) next.cognitivePerformanceIndex = verifiedScores.cpi;
     if(verifiedScores.mbs != null) next.averageLast2BlockingScoresMs = verifiedScores.mbs;
     if(verifiedScores.cpa != null) next.cpa = verifiedScores.cpa;
     if(verifiedScores.disposition) next.dispositionLabel = verifiedScores.disposition;
    }
    return next;
   }
   return row;
  });
  try{ state.history = savePersistedHistory(state.history); }catch(e){}
 }
 pruneVerifiedRawSessions();
 return changed;
}

window.addEventListener('online', ()=>{ if(settings.researchAutoUpload){ flushUploadQueue().catch(()=>{}); } });

function loadProfile(){
 try { return JSON.parse(localStorage.getItem(PROFILE_KEY)||"null"); } catch(e){ return null; }
}
function saveProfile(p){
 localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}
function clearProfile(){
 localStorage.removeItem(PROFILE_KEY);
}

/*
 Single-user device policy
 -------------------------
 Local CogSpeed data on one device must belong to one local user history only.
 This avoids mixing sessions from different people on the same device.

 Policy:
 - one signed-in email history OR guest-only history may exist locally
 - Guest is allowed on a device that already contains a signed-in user's
   local history, but Guest sessions are not stored
 - if a signed-in user starts on a device that contains Guest-only history,
   the app clears the Guest-only local sessions first and then continues
 - if a different signed-in email is entered on a device that already
   contains another signed-in user's local history, the app warns that
   local data will be cleared and requires explicit agreement before continuing
 - if mixed local history is already present from older builds, block entry
   and warn the operator to clear local data before continuing
 - research pooling across many users belongs in a separate database/export
   workflow, not in the on-device local session history
*/
function getLocalHistorySubjectIds(){
 // Ownership checks must reflect persistent local ownership on the device.
 // Guest sessions may exist in state.history for the current-session view only,
 // but they must not make the device look "mixed" during this runtime.
 const h = Array.isArray(state?.history) ? state.history : loadPersistedHistory();
 const ids = new Set();
 for(const row of (Array.isArray(h) ? h : [])){
  const sid = String(row?.subjectId||"").trim().toLowerCase();
  if(!sid) continue;
  if(isGuestHistorySubjectId(sid)) continue;
  ids.add(sid);
 }
 return [...ids];
}

function getSingleUserDeviceOwnerState(){
 const p = loadProfile();
 const profileEmail = isValidEmailAddress(p?.email) ? String(p.email).trim().toLowerCase() : "";
 const historyIds = getLocalHistorySubjectIds();
 const signedInOwners = new Set(historyIds);
 if(profileEmail) signedInOwners.add(profileEmail);

 // Guest-only ownership should be based on persisted local history, not
 // transient in-memory Guest rows retained for the current-session view.
 const persisted = loadPersistedHistory();
 const hasPersistedGuestHistory = Array.isArray(persisted)
  && persisted.some(row => isGuestHistorySubjectId(String(row?.subjectId||"").trim().toLowerCase()));

 if(signedInOwners.size > 1){
  return {
   status: "mixed",
   signedInOwners: [...signedInOwners].sort(),
   hasGuestHistory: hasPersistedGuestHistory
  };
 }
 if(signedInOwners.size === 1){
  return {
   status: "user",
   userId: [...signedInOwners][0],
   hasGuestHistory: hasPersistedGuestHistory
  };
 }
 if(hasPersistedGuestHistory){
  return {status: "guest"};
 }
 return {status: "empty"};
}

function getSingleUserDevicePolicyMessage(candidateId){
 const owner = getSingleUserDeviceOwnerState();
 const candidate = String(candidateId||"").trim().toLowerCase();
 if(owner.status === "empty") return "";
 if(owner.status === "mixed"){
  return "This device already contains mixed local histories. Clear local data before continuing on this device.";
 }
 if(owner.status === "guest"){
  if(candidate === "guest" || candidate === "0") return "";
  return "Guest-only local history will be cleared before this signed-in user continues on the device.";
 }
 if(owner.status === "user"){
  if(candidate === owner.userId) return "";
  if(candidate === "guest" || candidate === "0") return "";
  return `This device already contains local history for ${owner.userId}. Continuing with a different user will clear local data on this device.`;
 }
 return "";
}

function enforceSingleUserDevicePolicy(candidateId){
 const owner = getSingleUserDeviceOwnerState();
 const candidate = String(candidateId||"").trim().toLowerCase();

 if(owner.status === "mixed"){
  const message = "This device already contains mixed local histories. Clear local data before continuing on this device.";
  setStatus(message);
  try{ alert(message); }catch(e){}
  return false;
 }

 if(owner.status === "guest"){
  if(candidate === "guest" || candidate === "0") return true;
  const message = "This device contains Guest-only local history. That Guest history will be cleared before this signed-in user continues.";
  let ok = true;
  try{ ok = confirm(message); }catch(e){}
  if(!ok){
    setStatus("Sign-in canceled.");
    return false;
  }
  clearPersistedHistory();
  setStatus("Guest-only local history cleared.");
  return true;
 }

 if(owner.status === "user"){
  if(candidate === owner.userId) return true;
  if(candidate === "guest" || candidate === "0"){
   // Allow Guest on a signed-in user's device, but Guest sessions must not be stored.
   return true;
  }
  const message = `This device already contains local history for ${owner.userId}. If you continue, local data on this device will be cleared before the new user starts. Continue?`;
  let ok = true;
  try{ ok = confirm(message); }catch(e){}
  if(!ok){
    setStatus("Sign-in canceled.");
    return false;
  }
  clearAllLocalUserData();
  setStatus("Previous local user data cleared for new sign-in.");
  return true;
 }

 return true;
}


function restoreSubjectFromProfile(){
 const p = loadProfile();
 const inp = $("subjectIdInput");
 const wl = $("subjectWelcome");
 const we = $("welcomeEmail");
 const hint = $("subjectHint");
 if(p && p.email){
  // Rev 47: auto-restore must follow the same device-policy resolution that
  // manual sign-in uses. Prior revs only read the passive policy MESSAGE and
  // bailed out whenever it was non-empty — which correctly blocked for the
  // "mixed" case, but also blocked the two cases the policy says should
  // CLEAR-AND-CONTINUE (Guest-only history + signed-in saved profile, and
  // legacy different-user history + signed-in saved profile). Manual sign-in
  // via $("subjectNextBtn") already calls enforceSingleUserDevicePolicy(),
  // which handles those cases by clearing and proceeding. Auto-restore now
  // delegates to the same path for those statuses so the two entry points
  // behave consistently.
  //
  // Routing (surgical / Option C):
  //   - empty                              → silent restore (no conflict)
  //   - user + candidate === owner.userId  → silent restore (common happy path)
  //   - guest                              → call enforcer to clear + continue
  //   - user + candidate !== owner.userId  → call enforcer to clear + continue
  //   - mixed                              → block with hint (unchanged UX);
  //                                          mixed requires operator action to
  //                                          resolve and should not pop an
  //                                          alert on every back-button
  const candidate = String(p.email).trim().toLowerCase();
  const owner = getSingleUserDeviceOwnerState();
  const isMixed = owner.status === "mixed";
  const needsEnforcement =
   owner.status === "guest" ||
   (owner.status === "user" && candidate !== owner.userId);

  if(isMixed){
   // Preserve prior behavior: block silently, show the hint text, let the
   // operator resolve via Admin → Clear Local Data. No alert dialog here.
   const message = getSingleUserDevicePolicyMessage(candidate);
   state.profile = null;
   state.subjectId = null;
   if(inp) inp.value = "";
   if(wl) wl.style.display = "none";
   if(we) we.textContent = "";
   if(hint) hint.textContent = message;
   return;
  }

  if(needsEnforcement){
   // Delegates to the same enforcer used by manual sign-in. For Guest-only
   // history, this clears the Guest rows and continues silently after confirm.
   // For legacy different-user history, this clears all local data (including
   // the profile we were about to restore) after explicit user confirm, which
   // means we should not proceed with restoring that now-invalid profile.
   const ok = enforceSingleUserDevicePolicy(candidate);
   if(!ok){
    // User canceled the confirm dialog, or the enforcer blocked the action.
    // Fall through to the hint path so the operator sees a descriptive
    // explanation of what to do next.
    const message = getSingleUserDevicePolicyMessage(candidate);
    state.profile = null;
    state.subjectId = null;
    if(inp) inp.value = "";
    if(wl) wl.style.display = "none";
    if(we) we.textContent = "";
    if(hint) hint.textContent = message;
    return;
   }
   // Enforcer approved. For Guest-only-history case, profile on disk is intact
   // and we can proceed. For different-user-history case, the enforcer ran
   // clearAllLocalUserData() which wiped the profile we were about to restore,
   // so we must not reinstate the now-deleted profile in memory — fall through
   // to the no-profile branch below.
   if(!loadProfile()){
    if(wl) wl.style.display = "none";
    if(we) we.textContent = "";
    if(hint) hint.textContent = "";
    return;
   }
  }

  state.profile = p;
  state.subjectId = p.email;
  if(inp) inp.value = p.email;
  if(wl) wl.style.display = "block";
  if(we) we.textContent = p.email;
  if(hint) hint.textContent = "";
  schedulerResumeForCurrentProfile();
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
let _profileSymbolSet = "standard";

function isValidEmailAddress(v){
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v||"").trim());
}

function getProfileDraftTimeFormat(){
 return String(_profileTimeFormat||getEffectiveTimeFormat()) === "24" ? "24" : "12";
}


function normalizeLiveTestTypeForProfileOpen(){
 // New rule:
 // - after each completed test, live state returns to Mode 2 Sustained
 // - Profile should not resurrect older lingering live values from previous
 //   builds/sessions when simply opened for review
 // Therefore on profile-open we normalize the visible live test type back to
 // Mode 2 Sustained unless the user changes it during the current interaction.
 settings.testMode = "mode2";
 settings.symbolSet = "standard";
 try{ saveSettings(); }catch(e){}
}

function getUnifiedProfileTestType(){
 // The Profile Test Type menu must show the current live selection only.
 // All six options remain selectable in the dropdown:
 // mode1, mode2, memory, survival, mode3, and mode4.
 //
 // After every completed test, the live state is reset to Mode 2 CogSpeed
 // Sustained (standard symbol set). Therefore the next time Profile opens,
 // the selected menu value must be Mode 2 unless the user has explicitly
 // changed the live state again from Profile during the current session.
 const mode = String(settings.testMode || "mode2").trim();
 const symbol = String(settings.symbolSet || "standard").trim().toLowerCase();
 if(mode === "mode1") return "mode1";
 if(mode === "mode3") return "mode3";
 if(mode === "mode4") return "mode4";
 if(symbol === "memory") return "memory";
 if(symbol === "survival") return "survival";
 return "mode2";
}

function applyUnifiedProfileTestType(value){
 const v = String(value || "mode2").trim().toLowerCase();
 if(v === "mode1"){
  settings.testMode = "mode1";
  settings.symbolSet = "standard";
 }else if(v === "mode3"){
  settings.testMode = "mode3";
  settings.symbolSet = "standard";
 }else if(v === "mode4"){
  settings.testMode = "mode4";
  settings.symbolSet = "standard";
 }else if(v === "memory"){
  settings.testMode = "mode2";
  settings.symbolSet = "memory";
 }else if(v === "survival"){
  settings.testMode = "mode2";
  settings.symbolSet = "survival";
 }else{
  settings.testMode = "mode2";
  settings.symbolSet = "standard";
 }
 const sel = $("profileTestType");
 if(sel) sel.value = getUnifiedProfileTestType();
 remindProfileSaveNeeded("general");
}

function profileSelectTestMode(v){
 const mode = String(v||"mode2").trim();
 const current = getUnifiedProfileTestType();
 const mapped = (mode==="mode1" || mode==="mode3" || mode==="mode4") ? mode : (current==="memory" || current==="survival" ? current : "mode2");
 applyUnifiedProfileTestType(mapped);
}

function profileSelectSymbolSet(v){
 const raw = String(v||"standard").trim().toLowerCase();
 const currentMode = String(settings.testMode||"mode2").trim();
 const mapped = raw==="memory" ? "memory" : (raw==="survival" ? "survival" : (currentMode==="mode1" || currentMode==="mode3" || currentMode==="mode4" ? currentMode : "mode2"));
 applyUnifiedProfileTestType(mapped);
}

function profileSelectTimeFormat(fmt){
 _profileTimeFormat = String(fmt)==="24" ? "24" : "12";
 remindProfileSaveNeeded("general");
 ["12","24"].forEach(x=>{
  const btn = $("profileTime"+x+"Btn");
  if(!btn) return;
  const on = x===String(_profileTimeFormat);
  btn.style.background = on ? "linear-gradient(180deg,#14361a,#0b2211)" : "";
  btn.style.borderColor = on ? "#72d572" : "";
  btn.style.color = on ? "#72d572" : "";
  btn.classList.toggle("selected", !!on);
 });
 // Do not touch Sleep Logger inputs while editing Profile.
 // The saved format is applied when Sleep Logger opens.
}

function profileSelectGender(g){
 _profileGenderSelected = g;
 remindProfileSaveNeeded("general");
 ["M","F","O"].forEach(x=>{
  const btn = $("profileGender"+x);
  if(!btn) return;
  btn.style.background = x===g ? "linear-gradient(180deg,#0d4a1a,#062a10)" : "";
  btn.style.borderColor = x===g ? "#00ff88" : "";
  btn.style.color    = x===g ? "#00ff88" : "";
 });
}

function profileToggleEmail(checked, options={}){
 const opts = options || {};
 const normalized = !!checked;
 const cb = $("profileEmailResults");
 if(cb && cb.checked !== normalized) cb.checked = normalized;

 const thumb = $("profileEmailThumb");
 const track = $("profileEmailToggle");
 const row = $("profileEmailToggleRow");

 if(thumb) thumb.style.transform = normalized ? "translateX(24px)" : "translateX(0)";
 if(track){
  track.style.background = normalized ? "#0080ff" : "rgba(255,255,255,0.15)";
  track.setAttribute("aria-checked", normalized ? "true" : "false");
 }
 if(row){
  row.classList.toggle("selected", normalized);
  row.setAttribute("data-checked", normalized ? "true" : "false");
 }
 if(!opts.silent) remindProfileSaveNeeded("general");
}

function validateProfileAge(){
 const mo = parseInt($("profileBirthMonth")?.value||"0");
 const yr = parseInt($("profileBirthYear")?.value||"0");
 const msg = $("profileAgeMsg");
 const monthEl = $("profileBirthMonth");
 const yearEl = $("profileBirthYear");
 const row = monthEl?.closest(".field-row") || yearEl?.closest(".field-row");
 const clearGreen = ()=>{
  if(monthEl){ monthEl.classList.remove("selected"); monthEl.style.borderColor=""; monthEl.style.color=""; }
  if(yearEl){ yearEl.classList.remove("selected"); yearEl.style.borderColor=""; yearEl.style.color=""; }
  if(row) row.classList.remove("selected");
  if(msg) msg.classList.remove("selected");
 };
 if(!mo || !yr || yr < 1910 || yr > new Date().getFullYear()-5){
  clearGreen();
  if(msg) msg.textContent="";
  return false;
 }
 const age = computeAge(mo, yr);
 if(age < 14){
  clearGreen();
  if(msg){ msg.textContent="⚠ Must be 14 or older to take this test."; msg.style.color="#ff6688"; }
  return false;
 }
 if(age > 120){
  clearGreen();
  if(msg){ msg.textContent="⚠ Please check the year."; msg.style.color="#ff6688"; }
  return false;
 }
 if(monthEl){ monthEl.classList.add("selected"); monthEl.style.borderColor="#72d572"; monthEl.style.color="#72d572"; }
 if(yearEl){ yearEl.classList.add("selected"); yearEl.style.borderColor="#72d572"; yearEl.style.color="#72d572"; }
 if(row) row.classList.add("selected");
 if(msg){ msg.textContent="Age: "+age+" years ✓"; msg.style.color="#00ff88"; msg.classList.add("selected"); }
 return true;
}



function resetActiveModeAfterTest(){
 // After every completed test, return the active test type to
 // Mode 2 CogSpeed Sustained with the standard symbol set.
 // The unified Profile Test Type menu must reflect that reset state.
 settings.testMode = "mode2";
 settings.symbolSet = "standard";
 const sel = $("profileTestType");
 if(sel) sel.value = "mode2";
 try{ saveSettings(); }catch(e){}
}

function applyProfileSettings(profile){
 if(!profile) return;
 const tf = String(profile.timeFormat||"").trim();
 if(tf==="12" || tf==="24") settings.timeFormat = tf;
 // Do not restore selectedTestMode or symbolSet from saved profile storage.
 // The active test type is controlled from the current live state and resets
 // back to Mode 2 CogSpeed Sustained after every completed test.
 try{ saveSettings(); }catch(e){}
}

function openProfileFromContext(returnTo,email=""){
 _profileReturnTo = returnTo || "subjectOverlay";
 const candidate = String(email || state.profile?.email || state.subjectId || "").trim().toLowerCase();
 const safeEmail = isValidEmailAddress(candidate) ? candidate : "";
 const input = $("subjectIdInput");
 if(input && safeEmail) input.value = safeEmail;
 if(!enforceSingleUserDevicePolicy(safeEmail || candidate || "guest")) return;
 openProfileOverlay(safeEmail);
}

// Profile editor open path:
// - email users load/save their full profile
// - guest users (subject ID 0) must NOT inherit a saved email profile
// - time-format toggle stays local draft state until Save & Continue
// - Scheduler lives on this page and is saved per non-Guest subject on this device only
// - Scheduler reminders can work offline inside CogSpeed; closed-app alerts still depend on device support
// Profile is the only place that can change the active test mode for an
// existing user/device. After each completed test, the app resets the active
// mode back to Mode 2; users must return to Profile to choose another mode.
function openProfileOverlay(email){
 const safeEmail = isValidEmailAddress(email) ? String(email).trim().toLowerCase() : "";
 // Normalize any stale lingering live test-type state before Profile is shown.
 // The Test Type menu should open at Mode 2 Sustained unless the user changes
 // it again from this current Profile interaction.
 normalizeLiveTestTypeForProfileOpen();
 const stored = loadProfile();
 const existing = (safeEmail && stored && String(stored.email||"").trim().toLowerCase()===safeEmail) ? stored : null;
 const existingTimeFormat = existing?.timeFormat || getEffectiveTimeFormat();
 // Rev 62: the saved profile must NOT drive the Test Type dropdown on open.
 // Prior revs stored symbolSet inside the profile record and re-applied it
 // here, which silently resurrected a stale Memory/Survival selection every
 // time Profile opened, overriding the Rev 50/58/61 post-test reset to Mode 2
 // Sustained. The live state (normalized above to mode2/standard) is now the
 // single source of truth for the dropdown. The user can still change it
 // during this Profile interaction; that change applies to live settings
 // only and is wiped again by the post-test reset.
 _profileGenderSelected = existing?.gender || "";
 _profileTimeFormat = String(existingTimeFormat) === "24" ? "24" : "12";
 _profileSymbolSet = String(settings.symbolSet||"standard").trim().toLowerCase();
 const profileTypeSel = $("profileTestType");
 if(profileTypeSel) profileTypeSel.value = getUnifiedProfileTestType();

 // Show email
 const ed = $("profileEmailDisplay");
 if(ed) ed.textContent = safeEmail || "Guest / no email";

 // Suppress the save-reminder alert during programmatic profile load — the
 // profileToggleEmail/profileSelectGender/profileSelectTimeFormat/profileSelectSymbolSet
 // helpers each call remindProfileSaveNeeded, which would otherwise pop an
 // alert on every profile-open. Reset to false at the end so real user edits
 // to those same controls will trigger the reminder as intended.
 _profileReminderShown = true;

 // Pre-fill only when editing the matching saved email profile.
 // Rev 62: do NOT re-apply any stored symbolSet/test-type selection here.
 // The unified Test Type dropdown has already been set by
 // normalizeLiveTestTypeForProfileOpen() + getUnifiedProfileTestType() above,
 // and the live settings now authoritatively represent Mode 2 Sustained
 // unless the user changes the dropdown during this Profile interaction.
 if(existing){
  const bm = $("profileBirthMonth"); if(bm) bm.value = existing.birthMonth||"";
  const by = $("profileBirthYear"); if(by) by.value = existing.birthYear||"";
  const er = $("profileEmailResults"); if(er) er.checked = !!existing.emailResults;
  profileToggleEmail(!!existing.emailResults, {silent:true});
  bindProfileEmailToggleRow();
  if(existing.gender) profileSelectGender(existing.gender);
  const ru = $("profileResearchUploadEnabled"); if(ru) ru.checked = !!existing.researchUploadEnabled;
  const rid = $("profileResearchAnonymousId"); if(rid) rid.value = existing.researchAnonymousId || "";
  const rml = $("profileResearchModeLocked"); if(rml) rml.checked = !!settings.researchModeLocked;
  const rep = $("profileResearchUploadEndpoint"); if(rep) rep.value = settings.researchUploadEndpoint || '';
  const ril = $("profileResearchIncludeLearning"); if(ril) ril.checked = !!settings.researchIncludeLearningSessions;
  const rau = $("profileResearchAutoUpload"); if(rau) rau.checked = !!settings.researchAutoUpload;
  const rrv = $("profileResearchRetainRaw"); if(rrv) rrv.checked = !!settings.researchRetainRawAfterVerify;
  validateProfileAge();
  profileSelectTimeFormat(_profileTimeFormat);
  captureProfileInitialSnapshot();
 } else {
  const bm = $("profileBirthMonth"); if(bm) bm.value="";
  const by = $("profileBirthYear"); if(by) by.value="";
  const er = $("profileEmailResults"); if(er) er.checked=false;
  profileToggleEmail(false, {silent:true});
  bindProfileEmailToggleRow();
  profileSelectGender("");
  const ru = $("profileResearchUploadEnabled"); if(ru) ru.checked = false;
  const rid = $("profileResearchAnonymousId"); if(rid) rid.value = "";
  const rml = $("profileResearchModeLocked"); if(rml) rml.checked = !!settings.researchModeLocked;
  const rep = $("profileResearchUploadEndpoint"); if(rep) rep.value = settings.researchUploadEndpoint || '';
  const ril = $("profileResearchIncludeLearning"); if(ril) ril.checked = !!settings.researchIncludeLearningSessions;
  const rau = $("profileResearchAutoUpload"); if(rau) rau.checked = !!settings.researchAutoUpload;
  const rrv = $("profileResearchRetainRaw"); if(rrv) rrv.checked = !!settings.researchRetainRawAfterVerify;
  const msg=$("profileAgeMsg"); if(msg) msg.textContent="";
  profileSelectTimeFormat(_profileTimeFormat);
 }

 schedulerState.activeSubjectId = safeEmail || "";
 schedulerState.settings = loadSchedulerSettings(schedulerState.activeSubjectId);
 renderSchedulerSettings();
 refreshSchedulerDeviceStatus();
 maybeFinishBackgroundTest();
 resetProfileChangeReminder();
 showOnly("profileOverlay");
}

let _profileReminderShown = false;
let _profileInitialSnapshot = null;
function resetProfileChangeReminder(){
 _profileReminderShown = false;
}
// captureProfileInitialSnapshot: snapshots the current profile-form values so
// "did anything change" checks have a reference point. Previously referenced
// at two call sites (openProfileOverlay on existing-profile load, and
// saveAndContinueProfile on the settings-only save path) but never defined —
// in Rev 14 that was masked because upstream parse errors prevented this code
// from executing; Rev 15 parses clean and exposed the missing definition.

function bindProfileEmailToggleRow(){
 const row = $("profileEmailToggleRow");
 const cb = $("profileEmailResults");
 if(!row || !cb || row.dataset.boundEmailToggle === "1") return;
 row.dataset.boundEmailToggle = "1";

 const syncFromCheckbox = (silent=false)=>{
  profileToggleEmail(!!cb.checked, {silent});
 };

 row.addEventListener("click", (e)=>{
  const tag = (e.target && e.target.tagName ? e.target.tagName.toUpperCase() : "");
  if(tag === "INPUT" || tag === "LABEL") return;
  cb.checked = !cb.checked;
  syncFromCheckbox(false);
 });

 cb.addEventListener("change", ()=>{
  syncFromCheckbox(false);
 });

 syncFromCheckbox(true);
}

function captureProfileInitialSnapshot(){
 try{
  _profileInitialSnapshot = {
   birthMonth: String($("profileBirthMonth")?.value || ""),
   birthYear: String($("profileBirthYear")?.value || ""),
   emailResults: !!$("profileEmailResults")?.checked,
   symbolSet: String(settings.symbolSet||"standard").trim().toLowerCase(),
   gender: String(_profileGenderSelected || ""),
   timeFormat: String(_profileTimeFormat || ""),
   researchUploadEnabled: !!($("profileResearchUploadEnabled")?.checked),
   researchAnonymousId: String($("profileResearchAnonymousId")?.value || "").trim(),
   researchModeLocked: !!($("profileResearchModeLocked")?.checked),
   researchUploadEndpoint: String($("profileResearchUploadEndpoint")?.value || '').trim(),
   researchIncludeLearningSessions: !!($("profileResearchIncludeLearning")?.checked),
   researchAutoUpload: !!($("profileResearchAutoUpload")?.checked),
   researchRetainRawAfterVerify: !!($("profileResearchRetainRaw")?.checked)
  };
 }catch(e){
  _profileInitialSnapshot = null;
 }
}
function remindProfileSaveNeeded(kind="general"){
 if(_profileReminderShown) return;
 _profileReminderShown = true;
 const msg = kind==="challenge"
  ? "Challenge Set changed. Tap Save and Continue to use the new test."
  : "You changed Profile settings. Tap Save and Continue to keep these changes.";
 setStatus(msg);
 try{ alert(msg); }catch(e){}
}

let _profileReturnTo = "refresherOverlay"; // where to go after saving profile

function saveAndContinueProfile(){
 const entered = ($("subjectIdInput")?.value||"").trim().toLowerCase();
 const email = isValidEmailAddress(entered) ? entered : "";
 const bMonth = parseInt($("profileBirthMonth")?.value||"0");
 const bYear = parseInt($("profileBirthYear")?.value||"0");
 const emailResults = !!$("profileEmailResults")?.checked;
 const timeFormat = getProfileDraftTimeFormat();

 // Rev 62: symbolSet/testMode are live-only settings now. They are set by
 // the Profile Test Type dropdown (applyUnifiedProfileTestType) into
 // `settings` and persisted there via saveSettings(). They are NOT stored
 // in the saved profile record anymore, because doing so caused the old
 // challenge set to be resurrected on every Profile-open, overriding the
 // post-test reset to Mode 2 Sustained. The live `settings.testMode` and
 // `settings.symbolSet` are still persisted to localStorage by saveSettings()
 // so the current session survives page refresh; they are wiped back to
 // Mode 2 Sustained after every completed test by resetActiveModeAfterTest().

 // Always save time-format settings from this page
 settings.timeFormat = timeFormat;
 settings.researchModeLocked = ($("profileResearchModeLocked")?.checked) ? 1 : 0;
 settings.researchUploadEndpoint = String($("profileResearchUploadEndpoint")?.value || '').trim();
 settings.researchIncludeLearningSessions = ($("profileResearchIncludeLearning")?.checked) ? 1 : 0;
 settings.researchAutoUpload = ($("profileResearchAutoUpload")?.checked) ? 1 : 0;
 settings.researchRetainRawAfterVerify = ($("profileResearchRetainRaw")?.checked) ? 1 : 0;
 saveSettings();

 // If no email is entered yet, allow returning after saving settings only.
 if(!email){
  captureProfileInitialSnapshot();
  ((_profileReturnTo || "subjectOverlay")==="refresherOverlay" ? showRefresher() : showOnly(_profileReturnTo || "subjectOverlay"));
  _profileReturnTo = "refresherOverlay";
  _profileReminderShown = false;
  setStatus("Settings saved");
  return;
 }

 // Validate age for profile save
 if(!validateProfileAge()){ setStatus("Please enter a valid date of birth (14+)."); return; }
 if(!_profileGenderSelected){ setStatus("Please select a gender."); return; }

 const researchUploadEnabled = !!($("profileResearchUploadEnabled")?.checked);
 const researchAnonymousId = String($("profileResearchAnonymousId")?.value||"").trim() || ensureResearchAnonymousId();
 const researchModeLocked = !!($("profileResearchModeLocked")?.checked);
 const researchUploadEndpoint = String($("profileResearchUploadEndpoint")?.value||'').trim();
 const researchIncludeLearningSessions = !!($("profileResearchIncludeLearning")?.checked);
 const researchAutoUpload = !!($("profileResearchAutoUpload")?.checked);
 const researchRetainRawAfterVerify = !!($("profileResearchRetainRaw")?.checked);
 settings.researchModeLocked = researchModeLocked ? 1 : 0;
 settings.researchUploadEndpoint = researchUploadEndpoint;
 settings.researchIncludeLearningSessions = researchIncludeLearningSessions ? 1 : 0;
 settings.researchAutoUpload = researchAutoUpload ? 1 : 0;
 settings.researchRetainRawAfterVerify = researchRetainRawAfterVerify ? 1 : 0;
 saveSettings();
 const profile = {email, birthMonth:bMonth, birthYear:bYear,
  gender:_profileGenderSelected, emailResults, timeFormat:settings.timeFormat, updatedAt:Date.now(),
  researchUploadEnabled, researchAnonymousId, researchModeLocked, researchUploadEndpoint, researchIncludeLearningSessions, researchAutoUpload, researchRetainRawAfterVerify,
  researchConsentVersion: researchUploadEnabled ? "research-upload-v1" : null,
  researchConsentTimestamp: researchUploadEnabled ? new Date().toISOString() : null};
 schedulerState.activeSubjectId = email;
 try{
  saveProfile(profile);
 }catch(e){
  setStatus("Profile could not be saved — your browser storage may be full or restricted.");
  return;
 }

 state.subjectId = email;
 state.profile = profile;
 const schedulerSave = saveSchedulerDraftFromUi();
 if(!schedulerSave.ok){ setStatus(schedulerSave.message); return; }

 showOnly(_profileReturnTo);
 _profileReturnTo = "refresherOverlay";
_profileReminderShown = false;
 setStatus("Profile saved"); restoreSubjectFromProfile();
}

function resetProfile(){
 const subjectToClear = getCurrentSchedulerSubjectId();
 clearProfile();
 clearSchedulerSettings(subjectToClear);
 stopSchedulerTimers();
 schedulerState.activeSubjectId = "";
 schedulerState.settings = structuredClone(DEFAULT_SCHEDULER_SETTINGS);
 _profileGenderSelected = "";
 _profileTimeFormat = getEffectiveTimeFormat();
 // Suppress the save-reminder alert during programmatic form clearing — the
 // user just tapped Reset and doesn't need a second alert telling them
 // they changed something. Reset the flag at the end for future real edits.
 _profileReminderShown = true;
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
 renderSchedulerSettings();
 _profileReminderShown = false;
 setStatus("Profile reset");
}

function resetAllSessions(){
 state.history = [];
 clearTransientCurrentSessionState();
 localStorage.removeItem(`${STORAGE_PREFIX}_history`);
 updateStartPageLinks();
 try{ syncSummarySessionSelect(0); }catch(e){}
 try{ syncSpeedometerSessionSelect(0); }catch(e){}
 try{ syncTrialLogSessionSelect(0); }catch(e){}
 try{ buildRateRtOverlay(0); }catch(e){}
 setStatus("All sessions deleted");
}

// ─── OVERLAY / NAVIGATION UTILITIES ──────────────────────────
// hideAllOverlays(): hides every overlay (used at test start).
// showOnly(id): shows one overlay, hides all others.
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
 try{ refreshUpdateBannerVisibility(); }catch(e){}
}

function hasActiveTestInProgress(){
 return !["idle","finished"].includes(String(state.phase||"idle"));
}

let introAutoTimer=null;
let introClosedOnce=false;
function clearIntroAutoTimer(){ if(introAutoTimer){ clearTimeout(introAutoTimer); introAutoTimer=null; } }
function armIntroAutoAdvance(){
 clearIntroAutoTimer();
 introAutoTimer=setTimeout(()=>closeIntroOverlay(), 1000);
}
function closeIntroOverlay(){
 const intro=$("introOverlay");
 if(intro) intro.classList.add("hidden");
 const subject=$("subjectOverlay");
 if(subject) subject.classList.remove("hidden");
 clearIntroAutoTimer();
 introClosedOnce=true;
 setStatus("Ready");
 try{ updateStartPageLinks(); }catch(e){}
}
function initIntroAutoAdvance(){
 const introGif=$("introGif");
 const introOverlay=$("introOverlay");
 const restart=()=>{ if(!introClosedOnce && !introAutoTimer && introOverlay && !introOverlay.classList.contains("hidden")) armIntroAutoAdvance(); };
 restart();
 if(introGif){
  introGif.addEventListener("load", restart);
  introGif.addEventListener("error", restart);
  introGif.addEventListener("click", ()=>closeIntroOverlay());
  try{ if(introGif.complete) restart(); }catch(e){}
 }
 if(introOverlay) introOverlay.addEventListener("click", (e)=>{ if(e.target && e.target.id==="introOverlay") closeIntroOverlay(); });
 try{ window.addEventListener('pageshow', restart, {once:true}); }catch(e){}
}

function ensureSafeForLocalDataAction(actionLabel){
 if(hasActiveTestInProgress()){
  setStatus(`${actionLabel} is unavailable during an active test.`);
  return false;
 }
 return true;
}

async function computeCogSpeedBackupHash(payloadObj){
 const json = JSON.stringify(payloadObj);
 const bytes = new TextEncoder().encode(json);
 const digest = await crypto.subtle.digest("SHA-256", bytes);
 return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

async function getCogSpeedBackupPayload(){
 const readJson = (key, fallback)=>{
  try{
   const raw = localStorage.getItem(key);
   return raw!=null ? JSON.parse(raw) : fallback;
  }catch(e){
   return fallback;
  }
 };
 const scheduler = {};
 Object.keys(localStorage).forEach(k=>{
  if(k.startsWith("cogspeed_scheduler_")){
   scheduler[k] = readJson(k, null);
  }
 });
 const payload = {
   settings: readJson(`${STORAGE_PREFIX}_settings`, null),
   profile: readJson(`${STORAGE_PREFIX}_profile`, null),
   history: readJson(`${STORAGE_PREFIX}_history`, []),
   scheduler,
  };
 return {
  magic: "CogSpeedBackup",
  formatVersion: 1,
  schemaVersion: 1,
  appVersion: APP_VERSION,
  storagePrefix: STORAGE_PREFIX,
  exportedAt: new Date().toISOString(),
  payload,
  payloadHash: await computeCogSpeedBackupHash(payload)
 };
}

async function downloadCogSpeedLocalDataBackup(){
 if(!ensureSafeForLocalDataAction("Save Local Data")) return;
 const backup = await getCogSpeedBackupPayload();
 const stamp = backup.exportedAt.slice(0,10);
 const blob = new Blob([JSON.stringify(backup, null, 2)], {type:'application/json'});
 const a=document.createElement('a');
 a.href=URL.createObjectURL(blob);
 a.download=`cogspeed-backup-${DISPLAY_VERSION}-${stamp}.json`;
 document.body.appendChild(a);
 a.click();
 setTimeout(()=>{ try{ URL.revokeObjectURL(a.href); }catch(e){} try{ a.remove(); }catch(e){} }, 250);
 setStatus(`Saved local data backup (${a.download}).`);
}

function isValidCogSpeedBackupFile(obj){
 return !!(obj && obj.magic==="CogSpeedBackup" && Number(obj.formatVersion)>=1 && Number(obj.formatVersion)<=1 && obj.payload && Array.isArray(obj.payload.history));
}

async function verifyCogSpeedBackupFile(obj){
 if(!isValidCogSpeedBackupFile(obj)) return {ok:false, message:"That file is not a valid CogSpeed backup."};
 if(obj.schemaVersion!=null && Number(obj.schemaVersion)>1) return {ok:false, message:`This backup uses unsupported schema version ${obj.schemaVersion}.`};
 if(obj.payloadHash){
  try{
   const computed = await computeCogSpeedBackupHash(obj.payload);
   if(computed !== obj.payloadHash) return {ok:false, message:"Backup file failed integrity verification. The file may have been edited or corrupted."};
  }catch(err){
   return {ok:false, message:"Could not verify backup integrity."};
  }
 }
 return {ok:true, legacy: obj.schemaVersion==null || !obj.payloadHash};
}

async function applyCogSpeedBackupFile(obj){
 if(!ensureSafeForLocalDataAction("Restore Local Data")) return false;
 const verification = await verifyCogSpeedBackupFile(obj);
 if(!verification.ok){
  alert(verification.message);
  return false;
 }
 if(verification.legacy && !confirm("This backup is from an older format and has no schema/integrity metadata. Restore it anyway?")) return false;
 const hasExisting = !!(localStorage.getItem(`${STORAGE_PREFIX}_history`) || localStorage.getItem(`${STORAGE_PREFIX}_profile`) || localStorage.getItem(`${STORAGE_PREFIX}_settings`));
 if(hasExisting && !confirm("Restore local data and overwrite current saved CogSpeed data on this device?")) return false;
 try{
  localStorage.setItem(`${STORAGE_PREFIX}_settings`, JSON.stringify(obj.payload.settings || {}));
  if(obj.payload.profile!=null) localStorage.setItem(`${STORAGE_PREFIX}_profile`, JSON.stringify(obj.payload.profile));
  else localStorage.removeItem(`${STORAGE_PREFIX}_profile`);
  // Rev 43: strip any Guest rows from the backup payload before writing to
  // disk. Older backups made before Rev 43 may contain persisted Guest rows
  // under the Rev 42 policy gap; restore must not re-introduce them.
  const backupHistoryRaw = Array.isArray(obj.payload.history) ? obj.payload.history : [];
  const backupHistoryForDisk = stripGuestRowsForDisk(backupHistoryRaw);
  localStorage.setItem(`${STORAGE_PREFIX}_history`, JSON.stringify(backupHistoryForDisk));
  const schedulerPayload = obj.payload && obj.payload.scheduler && typeof obj.payload.scheduler==="object" ? obj.payload.scheduler : {};
  Object.keys(localStorage).forEach(k=>{ if(k.startsWith("cogspeed_scheduler_")) localStorage.removeItem(k); });
  Object.entries(schedulerPayload).forEach(([k,v])=>{
   if(String(k).startsWith("cogspeed_scheduler_")) localStorage.setItem(k, JSON.stringify(v));
  });
  // Marks that a profile/history-bearing restore has completed so first-run/profile-guard flows do not reinitialize over restored data.
  localStorage.setItem("cogspeed_version", "profileguard");
  sessionStorage.removeItem('cogspeed_restore_offer');
  alert("CogSpeed local data restored. The page will now reload.");
  window.location.reload();
  return true;
 }catch(err){
  console.error('restore backup failed', err);
  alert(`Could not restore backup: ${err && err.message ? err.message : err}`);
  return false;
 }
}

let cogspeedWaitingRegistration = null;
let cogspeedUpdateBannerDismissed = false;
let cogspeedPendingControllerReload = false;

function ensureUpdateBanner(){
 if($("updateBanner")) return;
 const wrap=document.createElement('div');
 wrap.id='updateBanner';
 wrap.className='hidden';
 wrap.style.cssText='position:fixed;left:50%;transform:translateX(-50%);top:max(8px,env(safe-area-inset-top,8px));z-index:1200;width:min(96vw,900px);background:linear-gradient(180deg,#13315b,#0b1830);border:1px solid var(--accent);border-radius:16px;box-shadow:0 14px 34px rgba(0,0,0,.35);padding:12px 14px;color:var(--text)';
 wrap.innerHTML=`<div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;justify-content:space-between"><div id="updateBannerText" style="font-size:15px;font-weight:700;color:var(--text)">Update available. Save local data before refresh.</div><div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end"><button class="ctrl-btn" id="updateBannerSaveBtn" style="width:auto;flex:0 0 auto;padding:10px 14px;min-height:40px;font-size:14px">Save Local Data</button><button class="ctrl-btn" id="updateBannerRestoreBtn" style="width:auto;flex:0 0 auto;padding:10px 14px;min-height:40px;font-size:14px">Restore Local Data</button><button class="ctrl-btn" id="updateBannerRefreshBtn" style="width:auto;flex:0 0 auto;padding:10px 14px;min-height:40px;font-size:14px">Refresh Now</button><button class="ctrl-btn" id="updateBannerLaterBtn" style="width:auto;flex:0 0 auto;padding:10px 14px;min-height:40px;font-size:14px">Later</button></div></div><input id="updateBannerRestoreInput" type="file" accept=".json,application/json" style="display:none"/>`;
 document.body.appendChild(wrap);
 $("updateBannerSaveBtn").onclick=()=>downloadCogSpeedLocalDataBackup();
 $("updateBannerRestoreBtn").onclick=()=>{ if(!ensureSafeForLocalDataAction("Restore Local Data")) return; $("updateBannerRestoreInput").value=''; $("updateBannerRestoreInput").click(); };
 $("updateBannerRefreshBtn").onclick=()=>{
  if(!ensureSafeForLocalDataAction("Refresh")) return;
  sessionStorage.setItem('cogspeed_restore_offer','1');
  cogspeedPendingControllerReload = true;
  try{
   if(cogspeedWaitingRegistration && cogspeedWaitingRegistration.waiting){
    cogspeedWaitingRegistration.waiting.postMessage({type:'SKIP_WAITING'});
   }
  }catch(e){}
 };
 $("updateBannerLaterBtn").onclick=()=>{ cogspeedUpdateBannerDismissed=true; refreshUpdateBannerVisibility(); };
 $("updateBannerRestoreInput").addEventListener('change', async (evt)=>{
  const file = evt.target.files && evt.target.files[0];
  if(!file) return;
  try{
   const text = await file.text();
   const parsed = JSON.parse(text);
   await applyCogSpeedBackupFile(parsed);
  }catch(err){
   alert('Could not read backup file.');
  }finally{
   evt.target.value='';
  }
 });
}

function refreshUpdateBannerVisibility(){
 ensureUpdateBanner();
 const banner=$("updateBanner");
 if(!banner) return;
 const hasRestoreOffer = sessionStorage.getItem('cogspeed_restore_offer')==='1';
 const show = !hasActiveTestInProgress() && !cogspeedUpdateBannerDismissed && (!!cogspeedWaitingRegistration || hasRestoreOffer);
 banner.classList.toggle('hidden', !show);
 if(!show) return;
 const text=$("updateBannerText");
 const refreshBtn=$("updateBannerRefreshBtn");
 const laterBtn=$("updateBannerLaterBtn");
 if(cogspeedWaitingRegistration){
  text.textContent = 'Update available. Save local data before refresh.';
  refreshBtn.style.display='';
  laterBtn.textContent='Later';
 }else{
  text.textContent = 'If data are missing after update, restore local data.';
  refreshBtn.style.display='none';
  laterBtn.textContent='Dismiss';
 }
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
 const reason = String(result ? (result.endReason||"") : (resultOrReason||"")).trim();
 if(!reason) return false;
 const lower = reason.toLowerCase();
 const mode = String(result && result.testMode ? result.testMode : "").toLowerCase();
 // Mode 2 final self-paced no-response must be checked before generic failure hints,
 // because the phrase "no response" otherwise looks like a failure even when the
 // session already qualified for the successful Mode 2 completion path.
 if(lower.includes("mode 2 final self-paced: no response")) return !!(result && result.mode2Triggered);
 // Success phrases first: wording-only refreshes must not flip completed sessions to Failed.
 if(lower.startsWith("mode 1 complete:")) return true;
 if(lower.startsWith("mode 2 complete:")) return true;
 if(lower.startsWith("mode 3 complete:")) return true;
 if(lower.startsWith("mode 4 complete:")) return true;
 if(lower.startsWith("test complete:") && lower.includes("required test time reached")) return true;
 if(lower.startsWith("convergent") || lower.includes("convergent block criterion")) return true;
 if(lower.includes("mode 2 cogspeed sustained complete") || lower.includes("sustained segment finished after")) return true;
 if(lower === "required responses reached" || lower.includes("required responses completed")) return true;
 if(lower === "required test time reached" || lower.includes("required test time reached")) return true;
 if(lower === "time limit reached" || lower.includes("maximum test time reached")){
  if(mode === "mode2"){
   const sustainedPresented = Number(result && (result.mode2SustainedPresented!=null ? result.mode2SustainedPresented : result.sustainedTrialsPresented));
   const sustainedCorrect = Number(result && (result.mode2SustainedCorrect!=null ? result.mode2SustainedCorrect : result.correctSustainedResponses));
   const finalCorrect = Number(result && (result.mode2FinalCorrect!=null ? result.mode2FinalCorrect : result.finalSelfPacedCorrect));
   if((result && result.mode2Triggered) || sustainedPresented>0 || sustainedCorrect>0 || finalCorrect>0) return true;
  }
  return false;
 }
 const failHints = [
  "failed","retest","practice","erratic responses","not responding in time",
  "no response","too many blocks","too many wrong","anti-spoof","rolling mean",
  "wrong window","wrong-response limit reached"
 ];
 if(failHints.some(h => lower.includes(h))) return false;
 if(lower === "run complete") return !!(result && Number.isFinite(Number(result.cognitivePerformanceIndex)));
 return false;
}

// ─── Summary ───
// ─── SUMMARY TEST RESULTS ─────────────────────────────────────
// Formats full monospace result text (state.lastResultText).
// Includes: subject ID, date/time, location, S-PFS, calibration,
//  block scores, CPI, CPA + factors, Disposition, response
//  stats, end reason, reference table.
// REFERENCE TABLE: 7-row S-PFS/CPI/MBS lookup from Perelli (2026)
//  with ← YOUR SCORE arrow on the matching CPI band.
// ──────────────────────────────────────────────────────────────
// Pooled mode-specific ranking summaries:
// Results page rankings now combine all saved sessions from the SAME test mode only.
// Mode 1 pools with Mode 1, Mode 2 with Mode 2, Mode 3 with Mode 3.
// Warm-up calibration trials are excluded from pooled rankings.
// Pooled rankings include single-factor rankings and full pooled combinations
// of dots/lines count with correct response position.
// Combination lists are provided for correct, wrong, and all responses combined.

function moveEndReasonNearSession(text){
 const s = String(text||"");
 const lines = s.split("\n");
 const sessionIdx = lines.findIndex(line => /^Session:/i.test(line));
 if(sessionIdx === -1) return s;

 let startIdx = lines.findIndex(line => /^End reason:/i.test(line));
 let block = 1;
 if(startIdx === -1){
  startIdx = lines.findIndex(line => /^END REASON$/i.test(line) || /^END Reason$/i.test(line));
  if(startIdx !== -1 && startIdx + 1 < lines.length) block = 2;
 }
 if(startIdx === -1 || startIdx === sessionIdx + 1) return s;

 const moved = lines.splice(startIdx, block);
 lines.splice(sessionIdx + 1, 0, ...moved);
 return lines.join("\n");
}


function getCognitivePerformanceTableText(result){
 const mode=(result&&result.testMode)||"mode1";
 if(mode==="mode2"){
  const target=Math.max(1, Number(result.mode2SustainedTargetCount)||Number(settings.mode2SustainedTrialCount)||20);
  const csrRaw=(result&&result.correctSustainedResponses!=null)?result.correctSustainedResponses:(result?result.mode2SustainedCorrect:null);
  const csr=Number.isFinite(Number(csrRaw))?Number(csrRaw):null;
  const actualMbs = result && result.mode2AdaptiveMbsMs!=null
   ? Number(result.mode2AdaptiveMbsMs)
   : (result && result.averageLast2BlockingScoresMs!=null ? Number(result.averageLast2BlockingScoresMs) : null);
  const actualCpi = result && result.cognitivePerformanceIndex!=null
   ? Number(result.cognitivePerformanceIndex)
   : (actualMbs!=null ? computeCPI(actualMbs) : null);
  const actualSpfs = result.samnPerelli && result.samnPerelli.score!=null ? Number(result.samnPerelli.score) : null;
  const best = Number(settings.cpiBestMs)||DEFAULTS.cpiBestMs;
  const worst = Number(settings.cpiWorstMs)||DEFAULTS.cpiWorstMs;
  const span = worst - best;
  const cpiToMs = c => Math.round(best + ((100-c)/100)*span);
  const mode1Bands=[
   {spfs:7,cpi:100,cap:"FUNCTIONING EXCEPTIONALLY WELL"},
   {spfs:6,cpi:80,cap:"FUNCTIONING VERY WELL"},
   {spfs:5,cpi:75,cap:"FUNCTIONING NORMALLY"},
   {spfs:4,cpi:50,cap:"FUNCTIONING SLIGHTLY LESS THAN NORMAL"},
   {spfs:3,cpi:25,cap:"FUNCTIONING STARTING TO SLOW"},
   {spfs:2,cpi:11,cap:"DIFFICULT TO FUNCTION / BECOMING UNSAFE"},
   {spfs:1,cpi:0,cap:"UNABLE TO FUNCTION / DEFINITELY UNSAFE"},
  ];
  const rows=[];
  for(let rowCpi=100;rowCpi>=0;rowCpi-=5){
   const rowMbs=cpiToMs(rowCpi);
   const rowCsr=Math.max(0, Math.min(target, Math.round((rowCpi/100)*target)));
   let band=mode1Bands[0], bestDiff=Infinity;
   mode1Bands.forEach(b=>{ const d=Math.abs(rowCpi-b.cpi); if(d<bestDiff){ bestDiff=d; band=b; } });
   rows.push({spfs:band.spfs, csr:rowCsr, cpi:rowCpi, mbs:rowMbs, cap:band.cap, mark:""});
  }
  let nearestIdx = -1;
  if(actualCpi!=null){
   let bestDiff = Infinity;
   rows.forEach((r,i)=>{ const d=Math.abs(actualCpi-r.cpi); if(d<bestDiff){ bestDiff=d; nearestIdx=i; } });
  }
  if(nearestIdx>=0){
   const cpiLabel = actualCpi!=null ? Math.round(actualCpi) : "—";
   const mbsLabel = actualMbs!=null ? `${Math.round(actualMbs)} ms` : "—";
   const csrLabel = csr!=null ? csr : "—";
   rows[nearestIdx].mark = `← YOUR SCORES: CSR ${csrLabel} | CPI ${cpiLabel} | MBS ${mbsLabel}`;
  }
  const headers=["[S-PFS]","CSR","CPI","MBS","DESCRIPTION OF PERFORMANCE"];
  const spfsDisplay = v => (actualSpfs!=null && Number(v)===actualSpfs) ? `▶${v}◀` : String(v);
  const widths=[
   Math.max(headers[0].length, ...rows.map(r=>spfsDisplay(r.spfs).length)),
   Math.max(headers[1].length, ...rows.map(r=>String(r.csr).length)),
   Math.max(headers[2].length, ...rows.map(r=>String(r.cpi).length)),
   Math.max(headers[3].length, ...rows.map(r=>`${r.mbs} ms`.length)),
   Math.max(headers[4].length, ...rows.map(r=>r.cap.length)),
  ];
  const headerLine=`${headers[0].padEnd(widths[0])} | ${headers[1].padEnd(widths[1])} | ${headers[2].padEnd(widths[2])} | ${headers[3].padEnd(widths[3])} | ${headers[4]}`;
  const body=rows.map(r=>`${spfsDisplay(r.spfs).padEnd(widths[0])} | ${String(r.csr).padStart(widths[1])} | ${String(r.cpi).padStart(widths[2])} | ${`${r.mbs} ms`.padStart(widths[3])} | ${r.cap}${r.mark?`  ${r.mark}`:""}`);
  return ["Mode 2 CogSpeed Sustained Cognitive Performance Table (Actual CPI from MBS)",headerLine,...body].join("\n");
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
   const spfsLabel = (actualSpfs!=null && r.spfs===actualSpfs) ? `[S-PFS ${r.spfs}]` : `S-PFS ${r.spfs}`;
   const mark = i===nearestIdx ? "  ← CPI" : "";
   return `${spfsLabel}: CPI ${r.cpi.toString().padStart(3," ")} | ${r.ms} ms${mark}`;
 });
 const rightRows = rows.map(r=>r.cap);
 const leftWidth = Math.max(leftHeader.length, ...leftRows.map(s=>s.length));
 const gap = "   ";
 const lines = [];
 lines.push(leftHeader.padEnd(leftWidth, " ") + gap + rightHeader);
 for(let i=0;i<rows.length;i++) lines.push(leftRows[i].padEnd(leftWidth, " ") + gap + rightRows[i]);
 return moveEndReasonNearSession(lines.join("\n"));
}
function buildRankedSummary(result){
 const el=$("rankedText"); if(!el) return;
 const hr="─────────────────────────";
 const modeName = formatModeTag(result.testMode);
 el.textContent =
`CogSpeed ${DISPLAY_VERSION} — ${modeName}
${hr}
RANKED TARGET / POSITION AVERAGES — POOLED SAME-MODE SESSIONS
${formatModePooledRankSection(result.testMode)}`;
}

function getResultsMetricExplanationText(result){
 const hr="─────────────────────────";
 const mode=(result&&result.testMode)||"mode1";
 const usesMode1Metrics = mode==="mode1";
 const usesMode2Metrics = mode==="mode2"; // Mode 2 sustained metrics/CPA explanations only.
 return `${hr}
RESULTS METRIC EXPLANATIONS
 MBS (Maximum Blocking Speed) = average in ms of the last 2 consecutive blocks within 250 ms.${usesMode1Metrics||usesMode2Metrics?"":" Not used in this mode."}
 CPI (Cognitive Processing Index) = normalized 0 - 100 index based on MBS.${usesMode1Metrics||usesMode2Metrics?"":" Not used in this mode."}
 BASELINE = rolling personal baseline average built from the most recent 5 qualifying Mode 1 / Mode 2 adaptive-phase MBS sessions for the same registered subject, using non-failed non-Guest sessions with MBS at or below the Admin qualifying threshold and Samn-Perelli Fatigue Scale scores of 5, 6, or 7.${usesMode1Metrics||usesMode2Metrics?"":" Not used in this mode."}
 CSR (Correct Sustained Responses) = number of correct sustained responses in the Mode 2 sustained segment.${usesMode2Metrics?"":" Not used in this mode."}
 SBLP (Sustained Blocking Limit Performance) = average RT of correct sustained responses during Mode 2 sustained segment, but defined as 0 when CSR = 0.${usesMode2Metrics?"":" Not used in this mode."}
 SBLP P90 = 90th-percentile correct sustained RT; conservative ceiling estimate.${usesMode2Metrics?"":" Not used in this mode."}
 SPI (Sustained Processing Index) = normalized 0 - 100 index based on CSR.${usesMode2Metrics?"":" Not used in this mode."}
 CPA (Cognitive Performance Ability) = Mode 2 combined end-state score (0–100). CPA starts with CPI (the speed anchor from adaptive MBS) and then applies a bounded normative-profile adjustment derived from sustained-phase performance. The adjustment can increase CPA, leave it unchanged, or decrease it. Computed for Mode 2 only. Revised V699rev151 to use a 3-feature architecture (accuracy composite, OLS drift, CV).${usesMode2Metrics?"":" Not used in this mode."}
 CPA factor 1 — Sustained Accuracy-Composite Factor = the composite metric (correct_rate − wrong_rate − 0.5 × miss_rate) measured against a CPI-matched expected profile. Weight 9.0. Replaces the three separate correct/wrong/miss factors used before V699rev151 because those three rates live on a simplex (they sum to ~1) and were collinear — summing them triple-counted accuracy. Higher composite is better.${usesMode2Metrics?"":" Not used in this mode."}
 CPA factor 2 — OLS-Drift Factor = ordinary-least-squares slope of correct sustained RT versus 1-indexed trial position, expressed as percent change in RT from trial 1 to trial N, measured against a CPI-matched expected drift profile. Weight 6.0. Replaces the median-of-halves estimator used before V699rev151, which was a weak low-power statistic at typical sustained-phase trial counts. Signed: a negative slope (speeding up across the phase) earns a positive residual — the old estimator floored this to zero and discarded that information.${usesMode2Metrics?"":" Not used in this mode."}
 CPA factor 3 — Sustained RT Variability (CV) Factor = 100 × SD(correct sustained RTs) ÷ mean(correct sustained RTs), measured against a CPI-matched expected CV profile. Weight 6.0 (raised from 1.5 in V699rev151). Lower CV is better. Captures intra-individual RT instability, a well-established vigilance / fatigue marker.${usesMode2Metrics?"":" Not used in this mode."}
 Each feature produces a residual in [−1, +1] via tolerance-normalized deviation from the expected profile. Max absolute weighted residual is 9+6+6 = 21. CPA = clamp(CPI + clampSigned(Σ weighted_residual, ±20), 0, 100). The ±20 cap can engage under extreme sustained-phase underperformance but is dormant under typical operation.${usesMode2Metrics?"":" Not used in this mode."}
 Expected-profile lookup uses piecewise-linear interpolation between CPI-bucket centers (10, 30, 50, 70, 90), not step lookup, so adjacent CPI values produce smoothly adjacent expected profiles.${usesMode2Metrics?"":" Not used in this mode."}
 CPA-retired features (V699rev151) — Recovery÷Calibration RT Factor, Lapse-Rate Factor, and Block-Efficiency Factor were previously described as CPA factors 6–8. These values are still computed and reported as secondary diagnostics but no longer drive the CPA adjustment.${usesMode2Metrics?"":" Not used in this mode."}
 Disposition = operational recommendation aligned to the seven-point Samn-Perelli Fatigue Scale (S-PFS). For Mode 2 the CPA score drives the disposition; for Modes 1, 3, and 4 the CPI score is used (same 0–100 scale, same band edges). Bands use the midpoints between the canonical CPI anchors and map to the same captions as the Cognitive Performance table: ≥ 90 = S-PFS 7, Functioning exceptionally well. 77.5 to <90 = S-PFS 6, Functioning very well. 62.5 to <77.5 = S-PFS 5, Functioning normally. 37.5 to <62.5 = S-PFS 4, Functioning slightly less than normal. 18 to <37.5 = S-PFS 3, Functioning starting to slow. 5.5 to <18 = S-PFS 2, Difficult to function / becoming unsafe. <5.5 = S-PFS 1, Unable to function / definitely unsafe. The Speedometer dial groups these seven tiers into four operational colors: GREEN — Clear for duty (S-PFS 5, 6, 7). YELLOW — Monitor / human review recommended (S-PFS 4). ORANGE — Human review required (S-PFS 3). RED — Remove from Hazardous Duty (S-PFS 1, 2). The Speedometer Disposition window shows both halves together, e.g. "GREEN — Clear for duty (S-PFS 6)". CogSpeed disposition is a structured recommendation requiring human review — not a standalone fitness determination.`;
}

// ─── Mode 2 timing breakdown ─────────────────────────────────
// Splits Mode 2 saved duration into adaptive+final time (the max-time clocked path)
// and sustained-only time (explicitly excluded from max-time failure accounting).
function computeMode2TimingSummary(result){
 const entries=Array.isArray(result&&result.rtLog)?result.rtLog:[];
 const elapsedMsForEntry=(entry)=>{
  if(!entry) return null;
  const phase=String(entry.phase||"");
  const rtMs=Number(entry.rt);
  const durMs=Number(entry.durationMs);
  if(["calibration","mode2_final"].includes(phase) && Number.isFinite(rtMs)) return Math.max(0, rtMs);
  if(Number.isFinite(durMs)) return Math.max(0, durMs);
  if(Number.isFinite(rtMs)) return Math.max(0, rtMs);
  return null;
 };
 const sumPhases=(phases)=>entries
  .filter(e=>phases.includes(String(e.phase||"")))
  .reduce((s,e)=>s + (elapsedMsForEntry(e)||0),0);
 const calibrationMs=sumPhases(["calibration"]);
 const adaptiveOnlyMs=sumPhases(["paced","paced_wrong","paced_late_correct","paced_late_wrong","missed","recovery"]);
 const sustainedOnlyMs=sumPhases(["mode2_sustained","mode2_sustained_wrong","mode2_sustained_missed"]);
 const finalSelfPacedMs=sumPhases(["mode2_final"]);
 const adaptiveMs=adaptiveOnlyMs || Math.max(0, (Number(result&&result.testDurationMs)||0) - finalSelfPacedMs - calibrationMs);
 const nonSustainedMs=(Number(result&&result.testDurationMs)||0) || (calibrationMs + adaptiveMs + finalSelfPacedMs);
 const totalMs = calibrationMs + adaptiveMs + sustainedOnlyMs + finalSelfPacedMs;
 return {
  totalMs,
  calibrationMs,
  adaptiveMs,
  sustainedOnlyMs,
  finalSelfPacedMs,
  nonSustainedMs
 };
}

// ─── Mode 2 block list text ──────────────────────────────────
function getMode4BlockListText(result){
 const blocks=Array.isArray(result&&result.blocks)?result.blocks:[];
 if(!blocks.length) return " none";
 return blocks.map((b,i)=>` Block ${i+1}: ${Number(b).toFixed(0)} ms`).join("\n");
}

function computeMode2AdaptiveCounts(result){
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
 const missed = Math.max(0, Number(result&&result.missedTrials)||0) - Math.max(0, Number(result&&result.mode2SustainedMissed)||0);
 return {correct, wrong, missed: Math.max(0, missed)};
}

function computeMode2WrongBreakdown(result){
 const blank = {calibration:0, adaptive:0, recovery:0, sustained:0, finalSelfPaced:0, total:0};
 if(!result || result.testMode !== "mode2") return blank;
 const log = Array.isArray(result.rtLog) ? result.rtLog : [];
 if(log.length){
  for(const entry of log){
   if(!entry || String(entry.outcome).toLowerCase() !== "wrong") continue;
   switch(String(entry.phase||"")){
    case "calibration":
     blank.calibration += 1;
     break;
    case "paced":
    case "paced_wrong":
    case "paced_late_wrong":
     blank.adaptive += 1;
     break;
    case "recovery":
     blank.recovery += 1;
     break;
    case "mode2_sustained_wrong":
     blank.sustained += 1;
     break;
    case "mode2_final":
     blank.finalSelfPaced += 1;
     break;
   }
  }
  blank.total = blank.calibration + blank.adaptive + blank.recovery + blank.sustained + blank.finalSelfPaced;
  return blank;
 }
 blank.calibration = Math.max(0, Number(result.calibrationErrors!=null ? result.calibrationErrors : result.selfPacedWrong) || 0);
 const adaptive = computeMode2AdaptiveCounts(result);
 blank.adaptive = Math.max(0, Number(adaptive.wrong)||0);
 blank.recovery = Math.max(0, Number(result.recoveryErrors)||0);
 blank.sustained = Math.max(0, Number(result.mode2SustainedWrong)||0);
 blank.finalSelfPaced = Math.max(0, Number(result.mode2FinalWrong)||0);
 blank.total = blank.calibration + blank.adaptive + blank.recovery + blank.sustained + blank.finalSelfPaced;
 return blank;
}

function buildResultsSummaryCompact(result){
 const el=$("summaryText"); if(!el) return;
 const hr="─────────────────────────";
 const spf=result.samnPerelli?`${result.samnPerelli.score} (${result.samnPerelli.label})`:"not recorded";
 let geoStr="unavailable";
 if(result.geo){
  geoStr=result.geo.status==="ok"
   ?(result.geo.address||`${result.geo.latitude.toFixed(5)}, ${result.geo.longitude.toFixed(5)}`)+` (±${Math.round(result.geo.accuracy_m)}m)`
   :result.geo.status;
 }
 const modeName = formatModeTag(result.testMode);
 const totalPresentations = computeTotalTrialPresentations(result);
 const totalDuration = formatDuration(result.testDurationMs);
 const sleepLine = formatSleepLine(result);
 const adaptiveMbsRaw=result.mode2AdaptiveMbsMs!=null?result.mode2AdaptiveMbsMs:result.averageLast2BlockingScoresMs;
 const adaptiveBlockGap=result.blockScoreDifferenceMs!=null ? Number(result.blockScoreDifferenceMs) : null;
 const qualifyingGapMs=Number(settings.qualifyingBlockGapMs)||250;
 const adaptiveMbs=(adaptiveMbsRaw!=null && Number.isFinite(adaptiveBlockGap) && adaptiveBlockGap <= qualifyingGapMs) ? adaptiveMbsRaw : null;
 const timing=result.testMode==="mode2" ? (result.mode2TimingSummary||computeMode2TimingSummary(result)) : null;
 if(result.testMode==="mode2"){
  if(result.mode2Triggered && result.sustainedCorrectRtP90Ms==null && Array.isArray(result.rtLog)){
   Object.assign(result, computeMode2SustainedRtTails(result.rtLog));
  }
 }
 if(result.mode2Triggered && result.cpa==null){
  Object.assign(result, computeMode2CPA(result));
 }
 if(result.dispositionCode==null || result.dispositionLabel==null || /^(GREEN|YELLOW|ORANGE|RED)$/i.test(String(result.dispositionCode||""))){
  Object.assign(result, computeDisposition(result));
 }
 const adaptiveCounts = result.testMode==="mode2" ? computeMode2AdaptiveCounts(result) : null;
 const mode2WrongBreakdown = result.testMode==="mode2" ? computeMode2WrongBreakdown(result) : null;
 const mode1AdaptiveBlock = result.testMode==="mode1" ? `ADAPTIVE MACHINE-PACED PHASE: Right ${result.pacedResponseCount||0} · Wrong ${result.pacedErrors||0} · Missed ${result.missedTrials||0} · Avg RT ${result.pacedResponseMeanMs!=null?result.pacedResponseMeanMs.toFixed(1)+" ms":"—"} · CPI ${result.cognitivePerformanceIndex!=null?result.cognitivePerformanceIndex.toFixed(1):"—"} · MBS ${result.averageLast2BlockingScoresMs!=null?result.averageLast2BlockingScoresMs.toFixed(1)+" ms":"—"}` : null;
 const mode2AdaptiveBlock = result.testMode==="mode2" ? `ADAPTIVE MACHINE-PACED PHASE: Right ${adaptiveCounts.correct} · Wrong ${adaptiveCounts.wrong} · Missed ${adaptiveCounts.missed} · Avg RT ${result.pacedResponseMeanMs!=null?result.pacedResponseMeanMs.toFixed(1)+" ms":"—"}` : null;
 const cpiDisplay = result.testMode==="mode2" ? (adaptiveMbs!=null?computeCPI(adaptiveMbs).toFixed(1)+" / 100":"—") : (result.cognitivePerformanceIndex!=null?result.cognitivePerformanceIndex.toFixed(1)+" / 100":result.testMode==="mode4"||result.testMode==="mode3"?"—":(result.averageLast2BlockingScoresMs!=null?computeCPI(result.averageLast2BlockingScoresMs).toFixed(1)+" / 100":"—"));
 const mbsDisplay = result.testMode==="mode2" ? (adaptiveMbs!=null?adaptiveMbs.toFixed(1)+" ms":"—") : (result.averageLast2BlockingScoresMs!=null?result.averageLast2BlockingScoresMs.toFixed(1)+" ms":"—");
 const selfPacedLine = result.testMode==="mode4" || result.testMode==="mode2" || result.testMode==="mode3"
   ? `SELF-PACED CALIBRATION: Total ${result.selfPacedResponseCount!=null?result.selfPacedResponseCount:"—"} · Correct ${result.selfPacedCorrect!=null?result.selfPacedCorrect:"—"} · Wrong ${result.calibrationErrors!=null?result.calibrationErrors:(result.selfPacedWrong!=null?result.selfPacedWrong:"—")} · Avg RT ${result.calibrationAverageMs!=null?result.calibrationAverageMs.toFixed(1)+" ms":(result.selfPacedResponseMeanMs!=null?result.selfPacedResponseMeanMs.toFixed(1)+" ms":"—")}`
   : `SELF-PACED CALIBRATION: Total ${result.selfPacedResponseCount!=null?result.selfPacedResponseCount:"—"} · Correct ${result.selfPacedCorrect!=null?result.selfPacedCorrect:"—"} · Wrong ${result.calibrationErrors!=null?result.calibrationErrors:(result.selfPacedWrong!=null?result.selfPacedWrong:"—")} · Avg RT ${result.calibrationAverageMs!=null?result.calibrationAverageMs.toFixed(1)+" ms":"—"}`;
 const sustainedBlock = result.testMode==="mode2" && result.mode2Triggered
   ? `MODE 2 SUSTAINED COGSPEED PHASE: Presentation Rate ${result.mode2SustainedPresentationRateMs!=null?result.mode2SustainedPresentationRateMs.toFixed(1)+" ms":"—"} · CSR Correct ${result.correctSustainedResponses!=null?result.correctSustainedResponses:(result.mode2SustainedCorrect||0)} · SBLP ${result.sustainedBlockLimitPerformanceMs!=null?result.sustainedBlockLimitPerformanceMs.toFixed(1)+" ms":"—"} · SPI ${result.sustainedProcessingIndex!=null?result.sustainedProcessingIndex.toFixed(1)+" / 100":"—"}`
   : `MODE 2 SUSTAINED COGSPEED PHASE: not taken`;
 const cpaLine = result.testMode==="mode2" && result.mode2Triggered ? `CPA: ${result.cpa!=null?result.cpa.toFixed(1)+" / 100":"—"}` : 'CPA: —';
 const dispositionLine = (result.dispositionLabel||result.dispositionCode)
   ? (result.dispositionCode && result.dispositionLabel
       ? `S-PFS ${result.dispositionCode} — ${result.dispositionLabel}`
       : `${result.dispositionCode||"—"} ${result.dispositionLabel||"—"}`.trim())
   : '—';
 const wrongBreakdownLine = result.testMode==="mode2" ? `Wrong breakdown: Cal ${mode2WrongBreakdown.calibration} · Adaptive ${mode2WrongBreakdown.adaptive} · Recovery ${mode2WrongBreakdown.recovery} · Sustained ${mode2WrongBreakdown.sustained} · Final SP ${mode2WrongBreakdown.finalSelfPaced} · Total ${mode2WrongBreakdown.total}` : null;
 el.textContent=
moveEndReasonNearSession(`CogSpeed version: ${DISPLAY_VERSION}
Mode: ${modeName}
Session: ${result.sessionNumber!=null?result.sessionNumber:"—"}
Subject ID: ${result.subjectId||"—"}
Location: ${geoStr}
Date/Time: ${result.time?new Date(result.time).toLocaleString():"—"}
Total Trial Presentations: ${totalPresentations}
Total Test Duration: ${result.testMode==="mode2"&&timing?formatDuration(timing.totalMs):totalDuration}
${result.testMode==="mode2"&&timing?`Calibration Phase Duration: ${timing.calibrationMs?formatDuration(timing.calibrationMs):"—"}
Adaptive Phase Duration: ${timing.adaptiveMs?formatDuration(timing.adaptiveMs):"—"}
Sustained Phase Duration: ${timing.sustainedOnlyMs?formatDuration(timing.sustainedOnlyMs):"—"}
Final Self-paced Duration: ${timing.finalSelfPacedMs?formatDuration(timing.finalSelfPacedMs):"—"}`:""}
Fatigue (S-PFS): ${spf}
Sleep: ${sleepLine.replace(/^SLEEP:\s*/,'')}
${formatSleepSummaryMetricsLine(result)}
${formatTimeSinceLastTestLine(result)||""}
${getPersonalBaselineSummaryText(result)}
${selfPacedLine}
${mode1AdaptiveBlock || mode2AdaptiveBlock || 'ADAPTIVE MACHINE-PACED PHASE: Not used in this mode'}
CPI: ${cpiDisplay}
MBS: ${mbsDisplay}
${sustainedBlock}
${wrongBreakdownLine||""}
Cognitive Performance table:
 ${getCognitivePerformanceTableText(result)}
${cpaLine}
Disposition: ${dispositionLine}
END Reason: ${result.endReason||"Run complete"}
${hr}
${buildVerificationSummaryLines(result)}
${hr}
RESULTS METRICS EXPLANATIONS:
${getResultsMetricExplanationText(result)}`);
}

function buildVerificationSummaryLines(result){
 const models = result && result.modelVersions ? result.modelVersions : currentResearchModelVersions();
 return `Verification status: ${getVerificationStatusLabel(result)}
Session UUID: ${result && result.sessionUuid ? result.sessionUuid : "—"}
Payload hash: ${result && result.payloadHash ? result.payloadHash : "—"}
Trial-log hash: ${result && result.trialLogHash ? result.trialLogHash : "—"}
Settings hash: ${result && result.settingsHash ? result.settingsHash : "—"}
Model versions: CPA ${models.cpaModelVersion||"—"}; Baseline ${models.baselineModelVersion||"—"}`;
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
 const modeName = formatModeTag(result.testMode);
 if(result.testMode==="mode3"){
  el.textContent=
moveEndReasonNearSession(`CogSpeed ${DISPLAY_VERSION} — ${modeName}
${hr}
Test Mode:  ${formatModeTag(result.testMode)}
Session:    ${result.sessionNumber!=null?result.sessionNumber:"—"}
Subject ID:  ${result.subjectId}
Date / Time:  ${new Date(result.time).toLocaleString()}
Total trial presentations: ${computeTotalTrialPresentations(result)}
Test duration: ${formatDuration(result.testDurationMs)}
Location:   ${geoStr}
${hr}
FATIGUE (S-PFS)
 Pre-test rating: ${spf}
${formatSleepLine(result)}
${formatTimeSinceLastSleepLine(result)||""}
${formatSleepSummaryMetricsLine(result)}
${formatTimeSinceLastTestLine(result)||""}
${getPersonalBaselineSummaryText(result)}
${hr}
SELF-PACED CALIBRATION
 Total self-paced responses: ${result.selfPacedResponseCount}
 Average self-paced RT: ${result.selfPacedResponseMeanMs!=null?result.selfPacedResponseMeanMs.toFixed(1)+" ms":"—"}
 Self-paced RT SD:   ${result.selfPacedResponseSdMs!=null?result.selfPacedResponseSdMs.toFixed(1)+" ms":"—"}
 Total response avg: ${result.allResponseMeanMs!=null?result.allResponseMeanMs.toFixed(1)+" ms":"—"}
 Total response SD:  ${result.allResponseSdMs!=null?result.allResponseSdMs.toFixed(1)+" ms":"—"}
 Correct self-paced: ${result.selfPacedCorrect}
 Calibration wrong: ${result.calibrationErrors!=null?result.calibrationErrors:result.selfPacedWrong}
 Total wrong:       ${result.totalIncorrect!=null?result.totalIncorrect:"—"}
${hr}
COGNITIVE PERFORMANCE TABLE
 ${getCognitivePerformanceTableText(result)}
${hr}
END REASON
 ${result.endReason||"Run complete"}
${hr}
${buildVerificationSummaryLines(result)}
${getResultsMetricExplanationText(result)}`);
  return;
 }
 if(result.testMode==="mode4"){
  el.textContent=
moveEndReasonNearSession(`CogSpeed ${DISPLAY_VERSION} — ${modeName}
${hr}
Test Mode:  ${formatModeTag(result.testMode)}
Session:    ${result.sessionNumber!=null?result.sessionNumber:"—"}
Subject ID:  ${result.subjectId}
Date / Time:  ${new Date(result.time).toLocaleString()}
Total trial presentations: ${computeTotalTrialPresentations(result)}
Test duration: ${formatDuration(result.testDurationMs)}
Location:   ${geoStr}
${hr}
FATIGUE (S-PFS)
 Pre-test rating: ${spf}
${formatSleepLine(result)}
${formatTimeSinceLastSleepLine(result)||""}
${formatSleepSummaryMetricsLine(result)}
${formatTimeSinceLastTestLine(result)||""}
${getPersonalBaselineSummaryText(result)}
${hr}
SELF-PACED CALIBRATION
 Total self-paced responses: ${result.selfPacedResponseCount}
 Self-paced correct: ${result.selfPacedCorrect}
 Calibration wrong: ${result.calibrationErrors!=null?result.calibrationErrors:result.selfPacedWrong}
 Total wrong:       ${result.calibrationErrors!=null?result.calibrationErrors:result.selfPacedWrong}
 Average calibration RT: ${result.calibrationAverageMs!=null?result.calibrationAverageMs.toFixed(1)+" ms":"—"}
Self-paced RT SD: ${result.selfPacedResponseSdMs!=null?result.selfPacedResponseSdMs.toFixed(1)+" ms":"—"}
${hr}
MACHINE-PACED PHASE (Mode 4 Machine-paced)
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
${hr}
${buildVerificationSummaryLines(result)}
${getResultsMetricExplanationText(result)}`);
  return;
 }
 if(result.testMode==="mode2"){
  const adaptiveMbs=result.mode2AdaptiveMbsMs!=null?result.mode2AdaptiveMbsMs:result.averageLast2BlockingScoresMs;
  const spi=result.sustainedProcessingIndex;
  const sblp=result.sustainedBlockLimitPerformanceMs;
  const csr=result.correctSustainedResponses!=null?result.correctSustainedResponses:(result.mode2SustainedCorrect||0);
  const timing=result.mode2TimingSummary||computeMode2TimingSummary(result);
  // Backfill retained sustained RT descriptors for legacy sessions
  if(result.mode2Triggered && result.sustainedCorrectRtP90Ms==null && Array.isArray(result.rtLog)){
   Object.assign(result, computeMode2SustainedRtTails(result.rtLog));
  }
  if(result.mode2Triggered && result.cpa==null){
   Object.assign(result, computeMode2CPA(result));
  }
  if(result.dispositionCode==null || result.dispositionLabel==null || /^(GREEN|YELLOW|ORANGE|RED)$/i.test(String(result.dispositionCode||""))){
   Object.assign(result, computeDisposition(result));
  }
  const mode2Cpi=(adaptiveMbs!=null) ? (result.mode2CpiFromMbs!=null ? result.mode2CpiFromMbs : computeCPI(adaptiveMbs)) : null;
  const adaptiveCounts=computeMode2AdaptiveCounts(result);
  const wrongBreakdown=computeMode2WrongBreakdown(result);
  el.textContent=
moveEndReasonNearSession(`CogSpeed ${DISPLAY_VERSION} — ${modeName}
${hr}
Test Mode:  ${formatModeTag(result.testMode)}
Session:    ${result.sessionNumber!=null?result.sessionNumber:"—"}
Subject ID:  ${result.subjectId}
Date / Time:  ${new Date(result.time).toLocaleString()}
Total trial presentations: ${computeTotalTrialPresentations(result)}
Total test duration: ${formatDuration(timing.totalMs)}
Calibration phase duration: ${timing.calibrationMs?formatDuration(timing.calibrationMs):"—"}
Adaptive phase duration: ${timing.adaptiveMs?formatDuration(timing.adaptiveMs):"—"}
Sustained phase duration: ${timing.sustainedOnlyMs?formatDuration(timing.sustainedOnlyMs):"—"}
Final self-paced duration: ${timing.finalSelfPacedMs?formatDuration(timing.finalSelfPacedMs):"—"}
Location:   ${geoStr}
${hr}
FATIGUE (S-PFS)
 Pre-test rating: ${spf}
${formatSleepLine(result)}
${formatTimeSinceLastSleepLine(result)||""}
${formatSleepSummaryMetricsLine(result)}
${formatTimeSinceLastTestLine(result)||""}
${getPersonalBaselineSummaryText(result)}
${hr}
SELF-PACED CALIBRATION
 Total self-paced responses: ${result.selfPacedResponseCount}
 Self-paced correct: ${result.selfPacedCorrect}
 Calibration wrong: ${wrongBreakdown.calibration}
 Average calibration RT: ${result.calibrationAverageMs!=null?result.calibrationAverageMs.toFixed(1)+" ms":"—"}
 Self-paced RT SD: ${result.selfPacedResponseSdMs!=null?result.selfPacedResponseSdMs.toFixed(1)+" ms":"—"}
${hr}
WRONG BREAKDOWN
 Calibration wrong: ${wrongBreakdown.calibration}
 Adaptive wrong: ${wrongBreakdown.adaptive}
 Recovery wrong: ${wrongBreakdown.recovery}
 Sustained wrong: ${wrongBreakdown.sustained}
 Final self-paced wrong: ${wrongBreakdown.finalSelfPaced}
 Total wrong across all phases: ${wrongBreakdown.total}
${hr}
ADAPTIVE MACHINE-PACED PHASE
 Right Responses: ${adaptiveCounts.correct}
 Wrong Responses: ${adaptiveCounts.wrong}
 Missed Responses: ${adaptiveCounts.missed}
 Average adaptive paced RT: ${result.pacedResponseMeanMs!=null?result.pacedResponseMeanMs.toFixed(1)+" ms":"—"}
 Paced RT SD: ${result.pacedResponseSdMs!=null?result.pacedResponseSdMs.toFixed(1)+" ms":"—"}
 Blocks found: ${result.blockCount||0}
${getMode4BlockListText(result)}
 MBS: ${adaptiveMbs!=null?adaptiveMbs.toFixed(1)+" ms":"—"} ${adaptiveMbs!=null?`(Average of last 2 consecutive blocks less than ${(Number(settings.qualifyingBlockGapMs)||250)} ms difference)`:`(No qualifying consecutive block pair within ${(Number(settings.qualifyingBlockGapMs)||250)} ms)`}
 Block difference for MBS: ${result.blockScoreDifferenceMs!=null?Math.abs(Number(result.blockScoreDifferenceMs)).toFixed(1)+" ms":"—"}
 CPI: ${adaptiveMbs!=null?computeCPI(adaptiveMbs).toFixed(1)+" / 100":"—"}${adaptiveMbs==null?" (No CPI until qualifying MBS is found)":""}
${hr}
MODE 2 SUSTAINED COGSPEED PHASE
 Triggered: ${result.mode2Triggered?"Yes":"No"}
 Sustained presentation rate: ${result.mode2SustainedPresentationRateMs!=null?result.mode2SustainedPresentationRateMs.toFixed(1)+" ms":"—"}
 Sustained trials target / presented: ${result.mode2SustainedTargetCount!=null?result.mode2SustainedTargetCount:(Math.max(1, Number(settings.mode2SustainedTrialCount)||20))} / ${result.mode2SustainedPresented||0}
 CSR (Correct Sustained Responses): ${csr}
 Sustained wrong:   ${result.mode2SustainedWrong||0}
 Sustained missed:  ${result.mode2SustainedMissed||0}
 SBLP: ${sblp!=null?(Number(sblp)===0&&csr===0?"0 ms (CSR = 0)":sblp.toFixed(1)+" ms"):"—"}
 SBLP P90: ${result.sustainedCorrectRtP90Ms!=null?result.sustainedCorrectRtP90Ms.toFixed(1)+" ms":"—"}
 SBLP Max: ${result.sustainedCorrectRtMaxMs!=null?result.sustainedCorrectRtMaxMs.toFixed(1)+" ms":"—"}
 SPI: ${spi!=null?spi.toFixed(1)+" / 100":"—"}
 CPI from MBS: ${mode2Cpi!=null?mode2Cpi.toFixed(1):"—"}${mode2Cpi==null?" (No CPI until qualifying MBS is found)":""}
${hr}
CPA — COGNITIVE PERFORMANCE ABILITY
 CPA: ${result.cpa!=null?result.cpa.toFixed(1)+" / 100":"—"}
 Disposition: ${(result.dispositionCode && result.dispositionLabel) ? `S-PFS ${result.dispositionCode} — ${result.dispositionLabel}` : `${result.dispositionCode||"—"} ${result.dispositionLabel||"—"}`.trim()}
 Base CPI: ${result.cpaBaseCpi!=null?result.cpaBaseCpi.toFixed(1):"—"}
 Sustained accuracy-composite factor: ${result.cpaAccuracyWeighting!=null?(result.cpaAccuracyWeighting>=0?"+":"")+result.cpaAccuracyWeighting.toFixed(1):(result.cpaCorrectWeighting!=null?(result.cpaCorrectWeighting>=0?"+":"")+result.cpaCorrectWeighting.toFixed(1):"—")}
 [Legacy correct-response factor: ${result.cpaCorrectWeighting!=null?(result.cpaCorrectWeighting>=0?"+":"")+result.cpaCorrectWeighting.toFixed(1):"—"}]
 [Legacy wrong-response factor: ${result.cpaWrongWeighting!=null?(result.cpaWrongWeighting>=0?"+":"")+result.cpaWrongWeighting.toFixed(1):"— (retired V699rev151)"}]
 [Legacy missed-response factor: ${result.cpaMissedWeighting!=null?(result.cpaMissedWeighting>=0?"+":"")+result.cpaMissedWeighting.toFixed(1):"— (retired V699rev151)"}]
 Sustained RT variability (CV) factor: ${result.cpaSdWeighting!=null?(result.cpaSdWeighting>=0?"+":"")+result.cpaSdWeighting.toFixed(1):"—"}
 Drift (OLS slope) factor: ${result.cpaDriftWeighting!=null?(result.cpaDriftWeighting>=0?"+":"")+result.cpaDriftWeighting.toFixed(1):"—"}
 Accuracy composite (observed / expected): ${result.cpaObservedAccuracyComposite!=null?result.cpaObservedAccuracyComposite.toFixed(3):"—"} / ${result.cpaExpectedAccuracyComposite!=null?result.cpaExpectedAccuracyComposite.toFixed(3):"—"}
 Drift OLS slope: ${result.cpaObservedDriftSlopeMsPerTrial!=null?result.cpaObservedDriftSlopeMsPerTrial.toFixed(2)+" ms/trial":"—"}
 Drift OLS full-phase: ${result.cpaObservedDriftPctOls!=null?(result.cpaObservedDriftPctOls>=0?"+":"")+result.cpaObservedDriftPctOls.toFixed(1)+"%":"—"}
 Recovery / calibration RT factor: ${result.cpaRecoveryWeighting!=null?(result.cpaRecoveryWeighting>=0?"+":"")+result.cpaRecoveryWeighting.toFixed(1):"— (retired V699rev151)"}
 Lapse-rate factor: ${result.cpaLapseWeighting!=null?(result.cpaLapseWeighting>=0?"+":"")+result.cpaLapseWeighting.toFixed(1):"— (retired V699rev151)"}
 Block-efficiency factor: ${result.cpaEfficiencyWeighting!=null?(result.cpaEfficiencyWeighting>=0?"+":"")+result.cpaEfficiencyWeighting.toFixed(1):"— (retired V699rev151)"}
 Sustained response RT SD: ${result.cpaSustainedResponseSdMs!=null?result.cpaSustainedResponseSdMs.toFixed(1)+" ms":"—"}
 Sustained RT CV%: ${result.cpaSustainedCvPct!=null?result.cpaSustainedCvPct.toFixed(1)+"%":"—"}
 Early median sustained RT: ${result.cpaEarlyMedianRtMs!=null?result.cpaEarlyMedianRtMs.toFixed(1)+" ms":"—"}
 Late median sustained RT: ${result.cpaLateMedianRtMs!=null?result.cpaLateMedianRtMs.toFixed(1)+" ms":"—"}
 Drift ratio: ${result.cpaSustainedDriftRatio!=null?(result.cpaSustainedDriftRatio*100).toFixed(1)+"%":"—"}
 Recovery÷calib RT ratio: ${result.cpaRecoveryCalibRatio!=null?result.cpaRecoveryCalibRatio.toFixed(2):"—"}
 Sustained-phase lapse rate: ${result.cpaLapseRatePct!=null?result.cpaLapseRatePct.toFixed(1)+"%":"—"}
 Block formation efficiency: ${result.cpaTrialsPerBlock!=null?result.cpaTrialsPerBlock.toFixed(1)+" trials/block":"—"}
${hr}
FINAL SELF-PACED TRIALS
 Final self-paced trials target / presented: ${result.mode2FinalTrialTargetCount!=null?result.mode2FinalTrialTargetCount:(result.mode2FinalTrialsPresented||0)} / ${result.mode2FinalTrialsPresented||0}
 Final self-paced correct: ${result.mode2FinalCorrect||0}
 Final self-paced wrong:   ${result.mode2FinalWrong||0}
 Final self-paced mean RT: ${result.mode2FinalMeanRtMs!=null?result.mode2FinalMeanRtMs.toFixed(1)+" ms":"—"}
${hr}
COGNITIVE PERFORMANCE TABLE
 ${getCognitivePerformanceTableText(result)}

${hr}
END REASON
 ${result.endReason||"Run complete"}
${hr}
${buildVerificationSummaryLines(result)}
${getResultsMetricExplanationText(result)}`);
  return;
 }
 const blockList=result.blocks&&result.blocks.length?result.blocks.map((b,i)=>` Block ${i+1}: ${b.toFixed(0)} ms`).join("\n"):" none";
 const avg2=result.averageLast2BlockingScoresMs;
 const diff=result.blockScoreDifferenceMs;
 const diffStr=diff!=null?`${diff>0?"+":""}${diff.toFixed(0)} ms (${diff>0?"slower":diff<0?"faster":"no change"})`:"—";
 const cps=result.cognitivePerformanceIndex;
 const sd=result.pacedResponseSdMs;
 el.textContent=
moveEndReasonNearSession(`CogSpeed ${DISPLAY_VERSION} — ${modeName}
${hr}
Test Mode:  ${formatModeTag(result.testMode)}
Session:    ${result.sessionNumber!=null?result.sessionNumber:"—"}
Subject ID:  ${result.subjectId}
Date / Time:  ${new Date(result.time).toLocaleString()}
Total trial presentations: ${computeTotalTrialPresentations(result)}
Test duration: ${formatDuration(result.testDurationMs)}
Location:   ${geoStr}
${hr}
FATIGUE (S-PFS)
 Pre-test rating: ${spf}
${formatSleepLine(result)}
${formatTimeSinceLastSleepLine(result)||""}
${formatSleepSummaryMetricsLine(result)}
${formatTimeSinceLastTestLine(result)||""}
${getPersonalBaselineSummaryText(result)}
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
${hr}
${buildVerificationSummaryLines(result)}
${getResultsMetricExplanationText(result)}`);
}

// ─── SPEEDOMETER V2 — Vintage Auto Meter style ────────────────
// Full 240° round dial. Cream face, chrome bezel.
// Color arc: seven equal bands from dark red at 0 to dark green at 100.
// Needle sweeps from 0 to final CPI in 1.4s ease-in-out, then dithers ±0.8 CPI.
// Block ms in green LCD box appears at needle tip after sweep completes.
// On fail: needle stays at 0, red needle, no block box.
// ──────────────────────────────────────────────────────────────
let _speedoRaf = null;

function drawSpeedometer(canvas, scoreValue, success, scoreLabel="CPI", tipLabel="MBS", tipValue=null, opts=null){
 const dpr = window.devicePixelRatio||1;
 const W = canvas.offsetWidth||380;
 const H = W;
 canvas.width = W*dpr; canvas.height = H*dpr;
 canvas.style.width = W+"px"; canvas.style.height = H+"px";
 const ctx = canvas.getContext("2d");
 ctx.setTransform(dpr,0,0,dpr,0,0);
 ctx.clearRect(0,0,W,H);

 const cx = W/2, cy = H/2;
 const R = W*0.38;
 const A_START = 150*Math.PI/180;
 const A_SWEEP = 240*Math.PI/180;
 function toAngle(v){ return A_START + (Math.max(0,Math.min(100,v))/100)*A_SWEEP; }
 const na = toAngle(scoreValue);
 const bandOut = R*1.12;
 const bandIn  = R*0.95;
 const tickOuter = R*0.89;
 const faceTone = "#efe2c2";
 const dark = "#17130f";

 // outer bezel / chrome
 ctx.beginPath(); ctx.arc(cx,cy,R*1.22,0,Math.PI*2);
 ctx.fillStyle = "#111"; ctx.fill();
 const bezel = ctx.createLinearGradient(cx-R*1.22, cy-R*1.22, cx+R*1.22, cy+R*1.22);
 bezel.addColorStop(0.00,"#fbfbfb");
 bezel.addColorStop(0.10,"#b9b9b9");
 bezel.addColorStop(0.24,"#efefef");
 bezel.addColorStop(0.52,"#717171");
 bezel.addColorStop(0.78,"#f1f1f1");
 bezel.addColorStop(1.00,"#8f8f8f");
 ctx.beginPath(); ctx.arc(cx,cy,R*1.18,0,Math.PI*2);
 ctx.fillStyle = bezel; ctx.fill();
 ctx.beginPath(); ctx.arc(cx,cy,R*1.11,0,Math.PI*2);
 ctx.strokeStyle = "rgba(0,0,0,0.55)"; ctx.lineWidth = R*0.018; ctx.stroke();

 // dial face
 const face = ctx.createRadialGradient(cx-R*0.08, cy-R*0.12, 0, cx, cy, R*1.05);
 face.addColorStop(0, "#f5e8ca");
 face.addColorStop(0.7, faceTone);
 face.addColorStop(1, "#dccba3");
 ctx.beginPath(); ctx.arc(cx,cy,R*1.02,0,Math.PI*2);
 ctx.fillStyle = face; ctx.fill();
 ctx.beginPath(); ctx.arc(cx,cy,R*1.02,0,Math.PI*2);
 ctx.strokeStyle = "rgba(255,255,255,0.38)"; ctx.lineWidth = R*0.012; ctx.stroke();

 // Disposition-based outer arc using canonical S-PFS 7-tier midpoint edges.
 // Band edges (5.5, 18, 37.5, 62.5, 77.5, 90) are the midpoints between the
 // canonical CPI anchors (100, 80, 75, 50, 25, 11, 0) — the same edges used
 // by computeDisposition() and the Cognitive Performance table captions.
 // Colors grouped per the speedometer disposition window:
 //   RED     = S-PFS 1 (<5.5), S-PFS 2 (5.5–<18)   → "Remove from Hazardous Duty"
 //   ORANGE  = S-PFS 3 (18–<37.5)                  → "Human review required"
 //   YELLOW  = S-PFS 4 (37.5–<62.5)                → "Monitor / human review recommended"
 //   GREEN   = S-PFS 5 (62.5–<77.5), 6 (77.5–<90), 7 (≥90) → "Clear for duty"
 const arcBands = [
  {s:0,    e:5.5,  c:"#650000"},
  {s:5.5,  e:18,   c:"#cf2020"},
  {s:18,   e:37.5, c:"#f28c18"},
  {s:37.5, e:62.5, c:"#e4cf2f"},
  {s:62.5, e:77.5, c:"#9ddc6b"},
  {s:77.5, e:90,   c:"#43a94e"},
  {s:90,   e:100,  c:"#0a5d1c"}
 ];
 for(const b of arcBands){
  const a1 = toAngle(b.s), a2 = toAngle(b.e);
  ctx.beginPath();
  ctx.arc(cx,cy,bandOut,a1,a2,false);
  ctx.arc(cx,cy,bandIn,a2,a1,true);
  ctx.closePath();
  ctx.fillStyle = b.c;
  ctx.fill();
 }

 // outer fine hash marks
 ctx.strokeStyle = dark;
 ctx.lineCap = "butt";
 for(let v=0;v<=100;v++){
  const a = toAngle(v);
  const major = v%10===0;
  const five = v%5===0;
  const len = major ? R*0.16 : five ? R*0.09 : R*0.055;
  const lw = major ? R*0.013 : five ? R*0.009 : R*0.0045;
  ctx.beginPath();
  ctx.moveTo(cx + tickOuter*Math.cos(a), cy + tickOuter*Math.sin(a));
  ctx.lineTo(cx + (tickOuter-len)*Math.cos(a), cy + (tickOuter-len)*Math.sin(a));
  ctx.lineWidth = lw;
  ctx.stroke();
 }

 [0,20,40,60,80,100].forEach(v=>{
  const a = toAngle(v);
  const rr = tickOuter + R*0.005;
  const sz = R*0.05;
  ctx.save();
  ctx.translate(cx + rr*Math.cos(a), cy + rr*Math.sin(a));
  ctx.rotate(a + Math.PI/2);
  ctx.beginPath();
  ctx.moveTo(0,-sz*1.05);
  ctx.lineTo(sz*0.46, sz*0.38);
  ctx.lineTo(-sz*0.46, sz*0.38);
  ctx.closePath();
  ctx.fillStyle = dark;
  ctx.fill();
  ctx.restore();
 });

 // numerals
 ctx.fillStyle = dark;
 ctx.textAlign = "center";
 ctx.textBaseline = "middle";
 const numR = R*0.63;
 for(let v=0; v<=100; v+=10){
  const a = toAngle(v);
  const x = cx + numR*Math.cos(a);
  const y = cy + numR*Math.sin(a);
  const major20 = v%20===0;
  const fontSize = major20 ? R*0.132 : R*0.09;
  ctx.font = `${major20 ? '700' : '500'} ${fontSize.toFixed(1)}px "Arial Narrow","Helvetica Neue Condensed",Arial,sans-serif`;
  ctx.fillText(String(v), x, y);
 }

 // Explicit score label(s) — kept low on the dial so the needle does not obscure
 // them. V699rev141: when a secondary needle is present (Mode 2 dual-needle
 // layout) render BOTH labels side by side, each colored to match its needle
 // (CPI = dark/primary, CPA = blue/secondary). Modes 1/3/4 never pass a
 // secondary needle, so they continue to show a single centered "CPI" label.
 const hasSecondaryNeedleForLabels = !!(opts && opts.secondaryNeedle && Number.isFinite(Number(opts.secondaryNeedle.value)));
 ctx.font = `700 ${(R*0.104).toFixed(1)}px Arial,sans-serif`;
 ctx.textAlign = "center";
 ctx.textBaseline = "middle";
 if(hasSecondaryNeedleForLabels){
  const secondaryColor = String(opts.secondaryNeedle.color || "#2d6cdf");
  // Horizontal offset from center — pushes the two labels far enough apart
  // that they don't touch at typical dial sizes.
  const labelOffset = R*0.16;
  const labelY = cy + R*0.22;
  ctx.fillStyle = dark;
  ctx.fillText("CPI", cx - labelOffset, labelY);
  ctx.fillStyle = secondaryColor;
  ctx.fillText("CPA", cx + labelOffset, labelY);
 } else {
  ctx.fillStyle = dark;
  ctx.fillText(String(scoreLabel||"CPI"), cx, cy + R*0.22);
 }

 // vintage-style spear needle without a rear tail
 ctx.save();
 ctx.translate(cx,cy);
 ctx.rotate(na);
 const needleColor = success ? dark : "#b10000";
 ctx.beginPath();
 ctx.moveTo(R*0.02, 0);
 ctx.lineTo(R*0.12, -R*0.028);
 ctx.lineTo(R*0.54, -R*0.016);
 ctx.lineTo(R*0.84, 0);
 ctx.lineTo(R*0.54, R*0.016);
 ctx.lineTo(R*0.12, R*0.028);
 ctx.closePath();
 ctx.fillStyle = needleColor;
 ctx.fill();
 ctx.beginPath();
 ctx.moveTo(R*0.08, -R*0.004);
 ctx.lineTo(R*0.72, -R*0.002);
 ctx.strokeStyle = "rgba(255,255,255,0.22)";
 ctx.lineWidth = R*0.005;
 ctx.stroke();
 ctx.restore();

 // Optional secondary needle (used for Mode 2 CPA/CPI dual-needle display).
 // V699rev141: The CPA needle is now rendered as a BOLDER filled-and-outlined
 // spear — same category (outlined) as before, but substantially more visible.
 // Shape distinction from the primary (solid CPI) is preserved via: a thinner
 // silhouette, a distinct two-tone fill (semi-transparent body + solid border),
 // a tip that stops short of the primary's tip, and a filled tip disc. This
 // keeps the two needles readable for colorblind viewers and in grayscale
 // printouts while significantly improving CPA visibility on the dial.
 const secondaryNeedle = opts && opts.secondaryNeedle && Number.isFinite(Number(opts.secondaryNeedle.value))
  ? {
     value: Math.max(0, Math.min(100, Number(opts.secondaryNeedle.value))),
     color: String(opts.secondaryNeedle.color || "#2d6cdf"),
     widthScale: Number.isFinite(Number(opts.secondaryNeedle.widthScale)) ? Number(opts.secondaryNeedle.widthScale) : 0.62
    }
  : null;
 if(secondaryNeedle){
  const sa = toAngle(secondaryNeedle.value);
  ctx.save();
  ctx.translate(cx,cy);
  ctx.rotate(sa);
  // Spear silhouette. Half-widths tuned to land between "reads as delicate"
  // (rev138 = 0.012) and "reads identical to primary" (primary = 0.028).
  // Tip reaches R*0.80 (vs primary R*0.84) so both tips stay distinct.
  ctx.beginPath();
  ctx.moveTo(R*0.020, 0);
  ctx.lineTo(R*0.10,  -R*0.018);
  ctx.lineTo(R*(0.54*secondaryNeedle.widthScale), -R*0.011);
  ctx.lineTo(R*0.80, 0);
  ctx.lineTo(R*(0.54*secondaryNeedle.widthScale), R*0.011);
  ctx.lineTo(R*0.10,  R*0.018);
  ctx.closePath();
  // Pass 1: semi-transparent colored FILL — makes the body pop without
  // masking the dial numerals underneath when the needle crosses them.
  // Uses globalAlpha (not string concatenation with "55") so this works
  // regardless of the color format the caller passes — "#rgb", "#rrggbb",
  // "rgb(...)", named colors, etc. would all break the naive hex+alpha
  // append pattern.
  ctx.save();
  ctx.globalAlpha = 0.33;
  ctx.fillStyle = secondaryNeedle.color;
  ctx.fill();
  ctx.restore();
  // Pass 2: white halo stroke for legibility over both the cream dial
  // face and any colored band it crosses.
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(255,255,255,0.88)";
  ctx.lineWidth = R*0.020;
  ctx.stroke();
  // Pass 3: solid colored border on top — the decisive silhouette.
  ctx.strokeStyle = secondaryNeedle.color;
  ctx.lineWidth = R*0.012;
  ctx.stroke();
  // Tip disc: FILLED (not hollow) and slightly larger than rev138, to
  // read as a confident pointer. White halo behind for contrast.
  ctx.beginPath();
  ctx.arc(R*0.76, 0, R*0.032, 0, Math.PI*2);
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(R*0.76, 0, R*0.028, 0, Math.PI*2);
  ctx.fillStyle = secondaryNeedle.color;
  ctx.fill();
  // A small white dot in the center of the tip disc — mirrors the hub
  // aesthetic and reinforces that this is a pointer, not a dot.
  ctx.beginPath();
  ctx.arc(R*0.76, 0, R*0.010, 0, Math.PI*2);
  ctx.fillStyle = "rgba(255,255,255,0.70)";
  ctx.fill();
  ctx.restore();
 }

 // MBS window and label
 // V699rev150: auto-shrink the tip label + value so long Mode 3/4 labels
 // ("Average Self-paced RT", "Average Machine-Paced RT") and long Mode 4
 // value strings ("450.0 ms • Rate 550.0 ms") fit inside the yellow box
 // without overflowing the speedometer arc. Base font sizes are preserved;
 // we only shrink when the measured text width exceeds the allowed inner
 // width (box width minus horizontal padding).
 if(success && tipValue){
  const bw = R*0.72, bh = R*0.18;
  const bx = cx - bw/2, by = cy + R*0.37;
  ctx.beginPath();
  if(ctx.roundRect) ctx.roundRect(bx, by, bw, bh, R*0.012); else ctx.rect(bx, by, bw, bh);
  ctx.fillStyle = "#d9df4c";
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.lineWidth = R*0.008;
  ctx.stroke();
  ctx.fillStyle = dark;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Horizontal padding inside the box. Label is drawn ABOVE the box so it
  // has a slightly larger usable width than the value line, but we keep
  // the allowed width conservative to avoid crowding neighboring dial art.
  const labelMaxW = bw - R*0.04;
  const valueMaxW = bw - R*0.08;
  // Floor the font so extreme strings still remain legible rather than
  // collapsing to illegible microtype.
  function fitFont(text, basePx, maxW, floorPx){
   let px = basePx;
   ctx.font = `700 ${px.toFixed(1)}px Arial,sans-serif`;
   let w = ctx.measureText(String(text)).width;
   if(w <= maxW) return px;
   px = Math.max(floorPx, basePx * (maxW / w));
   ctx.font = `700 ${px.toFixed(1)}px Arial,sans-serif`;
   return px;
  }
  const valueBasePx = R*0.068;
  const labelBasePx = R*0.108;
  const valueFloorPx = R*0.050;
  const labelFloorPx = R*0.070;
  fitFont(tipValue, valueBasePx, valueMaxW, valueFloorPx);
  ctx.fillText(String(tipValue), cx, by + bh*0.54);
  fitFont(tipLabel||"MBS", labelBasePx, labelMaxW, labelFloorPx);
  ctx.fillText(String(tipLabel||"MBS"), cx, by - R*0.07);
 }

 // Outer-ring S-PFS band label (Mode 2 only). Positioned at the angular
 // midpoint of the colored band corresponding to the self-reported pre-test
 // S-PFS value (1–7), rendered in that band's color on a white pill so it
 // stays readable regardless of where the needles happen to point.
 //
 // Band center CPI values (computed once from arcBands edges above):
 //   S-PFS 1 → 2.75   (deep red band)
 //   S-PFS 2 → 11.75  (red band)
 //   S-PFS 3 → 27.75  (orange band)
 //   S-PFS 4 → 50.0   (yellow band)
 //   S-PFS 5 → 70.0   (light green band)
 //   S-PFS 6 → 83.75  (green band)
 //   S-PFS 7 → 95.0   (deep green band)
 const spfsLabel = opts && opts.spfsOuterLabel;
 if(spfsLabel && Number.isFinite(Number(spfsLabel.spfs))){
  const n = Math.max(1, Math.min(7, Math.round(Number(spfsLabel.spfs))));
  const bandCenters = [2.75, 11.75, 27.75, 50.0, 70.0, 83.75, 95.0];
  const bandColorsForText = [
   "#650000","#cf2020","#f28c18","#b58a00","#3d8a2c","#2c7a2f","#0a5d1c"
  ];
  const a = toAngle(bandCenters[n-1]);
  const labelR = R*1.04;
  const lx = cx + labelR*Math.cos(a);
  const ly = cy + labelR*Math.sin(a);
  const text = `S-PFS ${n}`;
  ctx.save();
  ctx.font = `800 ${(R*0.082).toFixed(1)}px Arial,sans-serif`;
  const metrics = ctx.measureText(text);
  const pillW = metrics.width + R*0.12;
  const pillH = R*0.15;
  ctx.translate(lx, ly);
  // Keep the pill upright regardless of its angular position on the ring.
  ctx.beginPath();
  if(ctx.roundRect) ctx.roundRect(-pillW/2, -pillH/2, pillW, pillH, pillH*0.45);
  else ctx.rect(-pillW/2, -pillH/2, pillW, pillH);
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.fill();
  ctx.strokeStyle = bandColorsForText[n-1];
  ctx.lineWidth = R*0.010;
  ctx.stroke();
  ctx.fillStyle = bandColorsForText[n-1];
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, R*0.004);
  ctx.restore();
 }

 const hub = ctx.createRadialGradient(cx-R*0.02, cy-R*0.02, 0, cx, cy, R*0.09);
 hub.addColorStop(0, "#6a6a6a");
 hub.addColorStop(0.55, "#272727");
 hub.addColorStop(1, "#0c0c0c");
 ctx.beginPath(); ctx.arc(cx,cy,R*0.085,0,Math.PI*2); ctx.fillStyle = hub; ctx.fill();
 ctx.beginPath(); ctx.arc(cx,cy,R*0.03,0,Math.PI*2); ctx.fillStyle = "#4f4f4f"; ctx.fill();
}

// Sweep needle 0→CPI in 1.4s ease-in-out, then dither ±0.8 CPI
function animateSpeedometer(canvas, targetScore, success, scoreLabel="CPI", tipLabel="MBS", tipValue=null, opts=null){
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
  const drawOpts = opts && opts.secondaryNeedle && Number.isFinite(Number(opts.secondaryNeedle.value))
   ? Object.assign({}, opts, { secondaryNeedle: Object.assign({}, opts.secondaryNeedle, { value: (phase==="sweep" ? Number(opts.secondaryNeedle.value)*((elapsed/SWEEP_DUR)<0.5?4*Math.pow(Math.min(elapsed/SWEEP_DUR,1),3):1-Math.pow(-2*Math.min(elapsed/SWEEP_DUR,1)+2,3)/2) : Number(opts.secondaryNeedle.value)) }) })
   : opts;
  drawSpeedometer(canvas, cps, success, scoreLabel, tipLabel, tipValue, drawOpts);
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
// ──────────────────────────────────────────────────────────────
function getSummarySelectedIndex(){
 const s=$("summarySessionSelect");
 if(!s || !s.options.length) return Math.max(0, state.history.length-1);
 const idx=Number(s.value);
 return Number.isFinite(idx) ? Math.max(0, Math.min(state.history.length-1, idx)) : Math.max(0, state.history.length-1);
}

function getFullResultModeLabel(result){
 const mode = result && result.testMode ? String(result.testMode) : '';
 if(mode === 'mode2'){
  if(isResultSurvivalChallenge(result)) return 'Mode 2 CogSpeed Survival Challenge';
  if(isResultMemoryChallenge(result)) return 'Mode 2 CogSpeed Memory Challenge';
  return 'Mode 2 CogSpeed Sustained';
 }
 if(mode === 'mode1') return 'Mode 1 CogSpeed Adapted';
 if(mode === 'mode3') return 'Mode 3 Self-paced';
 if(mode === 'mode4') return 'Mode 4 Machine-paced';
 return '—';
}

function formatCompactResultModeLabel(result){
 const mode = result && result.testMode ? String(result.testMode) : '';
 if(mode === 'mode2'){
  if(isResultSurvivalChallenge(result)) return 'M2 Survival';
  if(isResultMemoryChallenge(result)) return 'M2 Memory';
  return 'M2 Sustained';
 }
 if(mode === 'mode1') return 'M1 Adapted';
 if(mode === 'mode3') return 'M3 Self-paced';
 if(mode === 'mode4') return 'M4 Machine-paced';
 return '—';
}

function syncSummarySessionSelect(selectedIdx){
 const s=$("summarySessionSelect");
 if(!s) return;
 const wanted = Math.max(0, Math.min(state.history.length-1, Number(selectedIdx)||0));
 const existing = Array.from(s.options).map(o=>o.value).join('|');
 const desired = state.history.map((r,idx)=>String(idx)).join('|');
 if(existing !== desired){
  s.innerHTML = state.history.map((r,idx)=>{
   const dt = r && r.time ? new Date(r.time) : null;
   const stamp = dt ? dt.toLocaleDateString() : `Sess ${idx+1}`;
   const mode = formatCompactResultModeLabel(r);
   return `<option value="${idx}">Sess ${idx+1} · ${mode} · ${stamp}</option>`;
  }).join('');
 }
 if(s.options.length){
  s.value = String(wanted);
  if(String(s.value)!==String(wanted)){
   s.selectedIndex = Math.max(0, Math.min(s.options.length-1, wanted));
  }
 }
}

function openSummarySession(sessionIndex, variant){
 const desiredVariant = String(variant || state.summaryVariant || "complete").toLowerCase()==="compact" ? "compact" : "complete";
 state.summaryVariant = desiredVariant;
 const ctx = resolveResultContext(null, sessionIndex, `summary ${desiredVariant}`);
 if(!ctx.result) return goToStartPage();
 hideAllOverlays();
 const summary = $("summaryOverlay");
 if(summary) summary.classList.remove("hidden");
 if(Number.isFinite(Number(ctx.index)) && ctx.index>=0) syncSummarySessionSelect(ctx.index);
 try{
  if(desiredVariant === "compact") buildResultsSummaryCompact(ctx.result);
  else buildSummary(ctx.result);
 }catch(err){
  console.error("openSummarySession render failed", err);
  const el=$("summaryText");
  if(el) el.textContent = `CogSpeed results fallback
Reason: ${ctx.result && ctx.result.endReason ? ctx.result.endReason : "Run complete"}
Render error: ${err && err.message ? err.message : err}`;
 }
 try{ updateStartPageLinks(); }catch(e){}
 setTestingQuiet(false);
}

// ─── Mode 2 Sustained Phase RT Tail Metrics ───────────────────
// Computes P90 and Max of correct sustained RTs from rtLog.
// Input:  rtLog array (full session trial log)
// Output: { sustainedCorrectRtP90Ms, sustainedCorrectRtMaxMs }
// ──────────────────────────────────────────────────────────────
function computeMode2SustainedRtTails(rtLog){
 const entries = Array.isArray(rtLog) ? rtLog : [];
 const correctRTs = entries
  .filter(e => e && e.phase==="mode2_sustained" && e.outcome==="correct" && Number.isFinite(Number(e.rt)))
  .map(e => Number(e.rt));
 if(!correctRTs.length) return {
  sustainedCorrectRtP90Ms:null,
  sustainedCorrectRtMaxMs:null
 };
 const sorted = [...correctRTs].sort((a,b)=>a-b);
 const p90idx = Math.max(0, Math.ceil(sorted.length * 0.9) - 1);
 const r1 = v => v != null ? Number(v.toFixed(1)) : null;
 return {
  sustainedCorrectRtP90Ms: r1(sorted[p90idx]),
  sustainedCorrectRtMaxMs: r1(sorted[sorted.length - 1])
 };
}

// ─── CPA helper: median of a numeric array ───────────────────
// Returns null for empty input; handles even lengths via lower-middle average.
function median(arr){
 if(!Array.isArray(arr)||!arr.length) return null;
 const s=[...arr].map(Number).filter(Number.isFinite).sort((a,b)=>a-b);
 if(!s.length) return null;
 const m=Math.floor(s.length/2);
 return s.length%2 ? s[m] : (s[m-1]+s[m])/2;
}

function getBucketValue(value, buckets, fallback=0){
 const raw = Number(value);
 if(!Number.isFinite(raw)) return fallback;
 const n = Math.round(raw * 100) / 100;
 for(const [lo, hi, v] of buckets){
  if(n >= lo && n <= hi) return v;
 }
 return fallback;
}

// V699rev151: linear interpolation between bucket CENTERS.
//
// The original getBucketValue is a step function across [lo, hi] ranges. It
// produces a discontinuity at each bucket boundary — two subjects whose CPI
// values are 60.00 and 60.02 get materially different expected values despite
// being behaviorally identical. This rewards hysteresis hunting and introduces
// cliff-edge behavior in CPA whenever a subject's CPI lands near a boundary.
//
// This helper replaces the step lookup with piecewise-linear interpolation
// between bucket centers ((lo+hi)/2, value). Flat extrapolation is applied
// below the leftmost center and above the rightmost center so values outside
// the defined range stay anchored to the nearest expected level.
//
// Does not modify getBucketValue. Used by getMode2ExpectedProfileForCpi for
// all Mode 2 CPA expected-profile lookups.
function getInterpolatedBucketValue(value, buckets, fallback=0){
 const raw = Number(value);
 if(!Number.isFinite(raw) || !Array.isArray(buckets) || !buckets.length) return fallback;
 // Build sorted list of (center, value) anchor points.
 const points = buckets
  .filter(b=>Array.isArray(b) && b.length>=3 && Number.isFinite(Number(b[0])) && Number.isFinite(Number(b[1])) && Number.isFinite(Number(b[2])))
  .map(([lo, hi, v])=>{
   const a = Number(lo), b = Number(hi);
   const c = Number.isFinite(b) ? (a+b)/2 : a;
   return [c, Number(v)];
  })
  .sort((a,b)=>a[0]-b[0]);
 if(!points.length) return fallback;
 if(points.length === 1) return points[0][1];
 const x = raw;
 if(x <= points[0][0]) return points[0][1];
 if(x >= points[points.length-1][0]) return points[points.length-1][1];
 for(let i=1;i<points.length;i++){
  const [x0, y0] = points[i-1];
  const [x1, y1] = points[i];
  if(x >= x0 && x <= x1){
   if(x1 === x0) return y0;
   const t = (x - x0) / (x1 - x0);
   return y0 + t * (y1 - y0);
  }
 }
 return fallback;
}

function clampSigned(value, limit){
 const v = Number(value);
 const lim = Math.max(0, Number(limit)||0);
 if(!Number.isFinite(v)) return 0;
 return Math.max(-lim, Math.min(lim, v));
}

function normalizeResidual(observed, expected, tolerance, beneficialHigher=true){
 const obs = Number(observed), exp = Number(expected), tol = Number(tolerance);
 if(!Number.isFinite(obs) || !Number.isFinite(exp) || !Number.isFinite(tol) || tol<=0) return 0;
 const raw = beneficialHigher ? (obs-exp)/tol : (exp-obs)/tol;
 return clampSigned(raw, 1);
}

function getMode2NormativeModelVersion(){
 return "Mode 2 normative CPA scaffold v2 (V699rev151) — accuracy-composite + OLS-drift + CV, with interpolated buckets. Field validation required.";
}

function computeMode2SustainedReliefContext(mbsMs){
 const mbs = Number(mbsMs);
 if(!Number.isFinite(mbs) || mbs<=0) return { reliefMs:null, startMs:null, challengeRatio:null };
 const minMs = Math.max(0, Number(settings.mode2SustainedReliefMinMs) ?? DEFAULTS.mode2SustainedReliefMinMs);
 const rawPct = Number(settings.mode2SustainedReliefPct);
 const pct = Number.isFinite(rawPct) ? rawPct : DEFAULTS.mode2SustainedReliefPct;
 const maxMs = Math.max(minMs, Number(settings.mode2SustainedReliefMaxMs)||DEFAULTS.mode2SustainedReliefMaxMs);
 const rawReliefMs = Math.round(mbs * pct);
 const reliefMs = Math.min(maxMs, Math.max(minMs, rawReliefMs));
 const startMs = Math.round(mbs + reliefMs);
 const challengeRatio = startMs>0 ? startMs/mbs : null;
 return { reliefMs, startMs, challengeRatio };
}

// V699rev151 — expected-profile generator for the Mode 2 CPA composite.
//
// Semantics of each expected value:
//   expectedAccuracyComposite : target for (correctRate - wrongRate - 0.5·missRate)
//                               — consolidates three previously collinear
//                               accuracy features into a single metric.
//   expectedDriftPct          : target full-phase RT slowing percentage, now
//                               derived from the OLS slope of correct RTs
//                               across the sustained phase rather than a
//                               median-of-halves split (weak estimator).
//   expectedCvPct             : target coefficient of variation across
//                               correct sustained RTs.
//
// The three legacy expected rates (expectedCorrectRate, expectedWrongRate,
// expectedMissRate) remain populated so legacy CSV rows and verifier receipts
// retain the same column layout, but they are no longer consumed by
// computeMode2CPA. See computeMode2CPA for the active adjustment path.
//
// Bucket lookups use getInterpolatedBucketValue (linear interpolation between
// bucket centers) so there are no discontinuities at CPI = 20/40/60/80. This
// addresses the Rev 150 audit point (b).
function getMode2ExpectedProfileForCpi(cpi){
 const correctBuckets = parseBucketSpec(settings.mode2NormExpectedCorrectRate,
  [[0,20,0.82],[20.01,40,0.80],[40.01,60,0.76],[60.01,80,0.70],[80.01,100,0.62]]);
 const wrongBuckets = parseBucketSpec(settings.mode2NormExpectedWrongRate,
  [[0,20,0.03],[20.01,40,0.04],[40.01,60,0.05],[60.01,80,0.07],[80.01,100,0.09]]);
 const missBuckets = parseBucketSpec(settings.mode2NormExpectedMissRate,
  [[0,20,0.15],[20.01,40,0.16],[40.01,60,0.19],[60.01,80,0.23],[80.01,100,0.29]]);
 const driftBuckets = parseBucketSpec(settings.mode2NormExpectedDriftPct,
  [[0,20,4],[20.01,40,5],[40.01,60,7],[60.01,80,9],[80.01,100,12]]);
 const cvBuckets = parseBucketSpec(settings.mode2NormExpectedCvPct,
  [[0,20,12],[20.01,40,13],[40.01,60,15],[60.01,80,18],[80.01,100,22]]);
 const accCompositeBuckets = parseBucketSpec(settings.mode2NormExpectedAccuracyComposite,
  [[0,20,0.715],[20.01,40,0.680],[40.01,60,0.615],[60.01,80,0.515],[80.01,100,0.385]]);
 return {
  expectedCorrectRate: getInterpolatedBucketValue(cpi, correctBuckets, 0.7),
  expectedWrongRate:   getInterpolatedBucketValue(cpi, wrongBuckets,   0.06),
  expectedMissRate:    getInterpolatedBucketValue(cpi, missBuckets,    0.2),
  expectedDriftPct:    getInterpolatedBucketValue(cpi, driftBuckets,   8),
  expectedCvPct:       getInterpolatedBucketValue(cpi, cvBuckets,      16),
  expectedAccuracyComposite: getInterpolatedBucketValue(cpi, accCompositeBuckets, 0.6)
 };
}

function getMode2SustainedRespondedEntries(rtLog){
 const log = Array.isArray(rtLog) ? rtLog : [];
 return log.filter(e => e && ["mode2_sustained","mode2_sustained_wrong"].includes(e.phase) && Number.isFinite(Number(e.rt)));
}

function parseBucketSpec(spec, fallback){
 try{
  const text = String(spec ?? '').trim();
  if(!text) return fallback.map(([min,max,mult])=>[min,max,mult]);
  const out = [];
  for(const rawPart of text.split(';')){
   const part = rawPart.trim();
   if(!part) continue;
   const pieces = part.split(':');
   if(pieces.length !== 2) throw new Error('bad bucket');
   const rangeText = pieces[0].trim();
   const multText = pieces[1].trim();
   const rangePieces = rangeText.split('-');
   if(rangePieces.length !== 2) throw new Error('bad range');
   const parseBound = (v)=>{
    const t = String(v).trim().toLowerCase();
    if(t === 'inf' || t === '+inf' || t === 'infinity' || t === '+infinity') return Number.POSITIVE_INFINITY;
    const n = Number(t);
    if(!Number.isFinite(n)) throw new Error('bad bound');
    return n;
   };
   const min = parseBound(rangePieces[0]);
   const max = parseBound(rangePieces[1]);
   const mult = Number(multText);
   if(!Number.isFinite(min) || !(Number.isFinite(max) || max === Number.POSITIVE_INFINITY) || !Number.isFinite(mult) || max < min) throw new Error('bad values');
   out.push([min,max,mult]);
  }
  out.sort((a,b)=>a[0]-b[0]);
  for(let i=1;i<out.length;i++){
   if(out[i][0] <= out[i-1][1]) throw new Error('overlap');
  }
  return out.length ? out : fallback.map(([min,max,mult])=>[min,max,mult]);
 }catch(_err){
  return fallback.map(([min,max,mult])=>[min,max,mult]);
 }
}
// ═══════════════════════════════════════════════════════════════════════════
// computeMode2CPA — V699rev151 Mode 2 Cognitive Performance Ability composite
// ═══════════════════════════════════════════════════════════════════════════
//
// WHAT CPA IS
// -----------
// CPA is CPI adjusted by a bounded, normative-profile-based residual score
// computed from the sustained phase of a Mode 2 run. CPI (derived from the
// adaptive MBS) provides the SPEED anchor: how fast the subject can still
// process near their ceiling. The residual score provides the SUSTAIN anchor:
// how well that speed holds up under a near-ceiling fixed-rate load.
//
// CPA = clamp( CPI + clampSigned(Σᵢ wᵢ · residualᵢ, ±maxDelta), 0, 100 )
//
// FEATURE SET (V699rev151)
// ------------------------
// Three features drive the residual:
//
//   1. Accuracy composite   (weight 9.0, tol 0.15)
//        observed = correctRate - wrongRate - 0.5 · missRate
//        Higher is better. Consolidates the previously collinear correct,
//        wrong, and miss rate features into a single scalar. The three raw
//        rates are still computed and reported for transparency, but they
//        are no longer independent inputs to the residual score. This is
//        the Rev 150 audit fix (a).
//
//   2. OLS drift slope      (weight 6.0, tol 8 %)
//        observed = 100 · slope · (N-1) / meanRT
//        where slope is the OLS slope of correctRT vs. 1-indexed sustained
//        trial number. The product expresses "percent change in RT from
//        trial 1 to trial N", which has the same interpretation as the old
//        median-of-halves drift % but uses every correct trial. Signed —
//        negative values (speeding up) are NOT clamped to zero; they earn
//        a positive residual since speeding up within a sustained phase is
//        beneficial, not harmful. This is the Rev 150 audit fix (c).
//
//   3. Coefficient of variation (weight 6.0, tol 10 %)
//        observed = 100 · sd(correctRT) / mean(correctRT)
//        Lower is better. Captures response-time stability as a fatigue /
//        vigilance marker. Unchanged in concept from Rev 150; weight
//        upgraded from 1.5 to 6.0 to match drift and exploit the headroom
//        opened by the accuracy-feature consolidation.
//
// WEIGHT / CAP DESIGN
// -------------------
// Each normalized residual is in [-1, +1] (symmetric clamping around zero
// tolerance units). Max absolute weighted residual is:
//     9.0 (accuracy) + 6.0 (drift) + 6.0 (cv) = 21.0
// mode2NormMaxDelta is set to 20, so the cap CAN engage in the extreme case
// (all three features at full negative saturation simultaneously — roughly
// "accuracy one tol below expected AND drifting one tol+ above expected AND
// variability one tol+ above expected"). Under typical operating regimes the
// cap is dormant and the composite is driven by the weighted residual sum.
// This is the Rev 150 audit fix (d).
//
// EXPECTED PROFILE
// ----------------
// Expected values for each feature are looked up against the subject's
// current CPI using piecewise-linear interpolation between CPI-bucket
// centers (10, 30, 50, 70, 90). This eliminates the step-function
// discontinuities at CPI = 20 / 40 / 60 / 80 that caused adjacent CPI
// values to produce materially different expected profiles. This is the
// Rev 150 audit fix (b).
//
// BACKWARD COMPATIBILITY
// ----------------------
// All legacy output fields (cpaObservedCorrectRate, cpaObservedWrongRate,
// cpaObservedMissRate, cpaCorrectWeighting, cpaWrongWeighting, ...) remain
// in the result object so CSV exports and verification receipts retain the
// same column layout. Legacy residual / weighting fields that correspond
// to retired features are populated as null. Legacy "correct" weighting is
// aliased to the new accuracy-composite weighting so the existing results
// summary display ("Sustained correct-response factor: ...") still reads
// the headline accuracy adjustment instead of going blank.
//
// NEW OUTPUT FIELDS (V699rev151)
// ------------------------------
//   cpaObservedAccuracyComposite / cpaExpectedAccuracyComposite
//   cpaAccuracyResidual / cpaAccuracyWeighting
//   cpaObservedDriftSlopeMsPerTrial         (raw OLS slope)
//   cpaObservedDriftPctOls                  (full-phase % slowing, OLS-derived)
//
// ═══════════════════════════════════════════════════════════════════════════
function computeMode2CPA(result){
 const blank = {
  cpa:null, cpaBaseCpi:null,
  cpaAdjustmentApplied:null,
  cpaNormativeModelVersion:getMode2NormativeModelVersion(),
  cpaExpectedCorrectRate:null, cpaExpectedWrongRate:null, cpaExpectedMissRate:null,
  cpaExpectedDriftPct:null, cpaExpectedCvPct:null,
  cpaExpectedAccuracyComposite:null,
  cpaObservedCorrectRate:null, cpaObservedWrongRate:null, cpaObservedMissRate:null,
  cpaObservedDriftPct:null, cpaObservedCvPct:null,
  cpaObservedAccuracyComposite:null,
  cpaObservedDriftSlopeMsPerTrial:null,
  cpaObservedDriftPctOls:null,
  cpaCorrectWeighting:null, cpaWrongWeighting:null,
  cpaMissedWeighting:null, cpaSdWeighting:null, cpaDriftWeighting:null,
  cpaAccuracyWeighting:null,
  cpaCorrectResidual:null, cpaWrongResidual:null, cpaMissedResidual:null,
  cpaCvResidual:null, cpaDriftResidual:null,
  cpaAccuracyResidual:null,
  cpaSustainedResponseSdMs:null,
  cpaSustainedCvPct:null,
  cpaSustainedDriftRatio:null,
  cpaEarlyMedianRtMs:null, cpaLateMedianRtMs:null,
  cpaRecoveryCalibRatio:null,
  cpaLapseRatePct:null,
  cpaTrialsPerBlock:null,
  cpaSustainedReliefMs:null,
  cpaSustainedChallengeRatio:null
 };
 if(!result || result.testMode!=="mode2" || !result.mode2Triggered) return blank;

 const cpi = Number(result.mode2CpiFromMbs!=null ? result.mode2CpiFromMbs : result.cognitivePerformanceIndex);
 if(!Number.isFinite(cpi)) return blank;

 const correct = Number(result.mode2SustainedCorrect)||0;
 const wrong   = Number(result.mode2SustainedWrong)||0;
 const missed  = Number(result.mode2SustainedMissed)||0;
 const presented = Math.max(1, Number(result.mode2SustainedPresented)||0, correct+wrong+missed);
 const correctRate = correct / presented;
 const wrongRate = wrong / presented;
 const missRate = missed / presented;

 // V699rev151: the accuracy composite consolidates correct, wrong, and miss
 // rates into a single scalar. Weighting coefficients in the formula reflect
 // the intuition that wrong answers and misses are the harmful-direction
 // signals (hence negative contribution), and that missed trials — while
 // informative about lapses — should not dominate a pure accuracy composite
 // since miss rate also depends strongly on pacing. The 0.5 multiplier on
 // missRate is a deliberate down-weighting within the composite.
 //
 //   accComposite = correctRate - wrongRate - 0.5 · missRate
 //
 // Range under normal operation: roughly 0.3 (high CPI, near ceiling) to
 // 0.8 (low CPI, comfortable pacing). Tolerance 0.15 is sized so a
 // one-tolerance deviation reflects a meaningful but recoverable deviation.
 const accComposite = correctRate - wrongRate - 0.5 * missRate;

 const log = Array.isArray(result.rtLog) ? result.rtLog : [];

 // Correct sustained RT descriptors remain useful as secondary diagnostics.
 const sustainedCorrectRTs = log
  .filter(e=>e && e.phase==="mode2_sustained" && e.outcome==="correct" && Number.isFinite(Number(e.rt)))
  .map(e=>Number(e.rt));
 const responseSd   = sustainedCorrectRTs.length>=2 ? stdDev(sustainedCorrectRTs) : null;
 const responseMean = sustainedCorrectRTs.length>=1 ? mean(sustainedCorrectRTs) : null;
 const responseCvPct = (responseSd!=null && responseMean!=null && responseMean>0)
  ? (responseSd/responseMean)*100 : null;

 // V699rev151 drift estimator:
 //
 //   Preserves the two legacy descriptors (earlyMedian, lateMedian,
 //   driftRatio) for retained diagnostic fields, but the value that FEEDS
 //   the residual score is now OLS slope based.
 //
 //   Slope = OLS( y = rt, x = 1..N )   across correct sustained RTs only.
 //   Drift % = 100 · slope · (N-1) / meanRT
 //            — "percent change in RT from first to last trial if the
 //               subject were exactly on the regression line"
 //
 //   Signed: negative slope (subject speeds up across the phase) yields a
 //   negative driftPctOls, which under beneficialHigher=false (lower is
 //   better) maps to a POSITIVE residual — a reward for holding or
 //   improving speed under sustained load. The old estimator floored this
 //   to zero, discarding that information.
 let earlyMedian=null, lateMedian=null, driftRatio=null;
 if(sustainedCorrectRTs.length>=2){
  const half=Math.floor(sustainedCorrectRTs.length/2);
  const early=sustainedCorrectRTs.slice(0,half), late=sustainedCorrectRTs.slice(half);
  if(early.length && late.length){
   earlyMedian=median(early); lateMedian=median(late);
   if(Number.isFinite(earlyMedian) && earlyMedian>0 && Number.isFinite(lateMedian))
    driftRatio=Math.max(0,(lateMedian-earlyMedian)/earlyMedian);
  }
 }
 const driftPctLegacy = driftRatio!=null ? driftRatio*100 : null; // legacy, unsigned

 // OLS slope over correct sustained RTs (Rev 151). Requires ≥3 points for
 // a minimally meaningful regression; fewer falls back to the legacy drift
 // estimate so low-trial-count sessions still produce a residual.
 let driftSlopeMsPerTrial = null;
 let driftPctOls = null;
 if(sustainedCorrectRTs.length >= 3 && responseMean!=null && responseMean>0){
  const n = sustainedCorrectRTs.length;
  // x = 1..n so mean(x) = (n+1)/2 and Σ(x - xMean)² = n(n²-1)/12.
  const xMean = (n+1)/2;
  let num = 0;
  let denom = 0;
  for(let i=0;i<n;i++){
   const x = i+1;
   const dx = x - xMean;
   num   += dx * (sustainedCorrectRTs[i] - responseMean);
   denom += dx * dx;
  }
  if(denom > 0){
   driftSlopeMsPerTrial = num / denom;
   driftPctOls = 100 * driftSlopeMsPerTrial * (n-1) / responseMean;
  }
 }
 // Observed drift % reported downstream is the OLS value when available;
 // fall back to the legacy median-of-halves only when too few trials.
 const driftPctObserved = driftPctOls!=null ? driftPctOls
  : (driftPctLegacy!=null ? driftPctLegacy : null);

 // Recovery / lapse / efficiency diagnostics (unchanged — retained as
 // secondary metrics for future analysis; not CPA inputs).
 const recoveryRTs = log
  .filter(e=>e && e.phase==="recovery" && Number.isFinite(Number(e.rt)))
  .map(e=>Number(e.rt));
 const calibAvg = result.calibrationAverageMs!=null ? Number(result.calibrationAverageMs) : null;
 const recoveryMeanRT = recoveryRTs.length>=1 ? mean(recoveryRTs) : null;
 const recoveryCalibRatio = (recoveryMeanRT!=null && calibAvg!=null && calibAvg>0)
  ? recoveryMeanRT/calibAvg : null;
 const sustainedMedianRT = sustainedCorrectRTs.length ? median(sustainedCorrectRTs) : null;
 const lapseThreshold = sustainedMedianRT!=null ? 2*sustainedMedianRT : null;
 const lapseCount = lapseThreshold!=null
  ? sustainedCorrectRTs.filter(rt=>rt>lapseThreshold).length : 0;
 const lapseRatePct = (lapseThreshold!=null && sustainedCorrectRTs.length>0)
  ? (lapseCount/sustainedCorrectRTs.length)*100 : null;
 const blockCount = Number(result.blockCount)||0;
 const adaptiveTrials = log.filter(e=>e && [
  "paced","paced_wrong","paced_late_correct","paced_late_wrong","missed"
 ].includes(e.phase)).length;
 const trialsPerBlock = (blockCount>0 && adaptiveTrials>0)
  ? adaptiveTrials/blockCount : null;

 // ── Expected profile via piecewise-linear interpolation ──────────────
 const expected = getMode2ExpectedProfileForCpi(cpi);
 // Retained tolerance fallbacks (drift, cv) and the new accuracy-composite
 // tolerance. The retired per-rate tolerances are intentionally not read
 // here; they remain in DEFAULTS only for storage continuity.
 const tolAccuracy = Number(settings.mode2NormToleranceAccuracyComposite) || DEFAULTS.mode2NormToleranceAccuracyComposite;
 const tolDrift    = Number(settings.mode2NormToleranceDriftPct)          || DEFAULTS.mode2NormToleranceDriftPct;
 const tolCv       = Number(settings.mode2NormToleranceCvPct)             || DEFAULTS.mode2NormToleranceCvPct;

 // ── Residuals in [-1, +1] ─────────────────────────────────────────────
 // Accuracy composite: beneficialHigher = true (above profile is good).
 const accuracyResidual = normalizeResidual(accComposite,
  expected.expectedAccuracyComposite, tolAccuracy, true);
 // OLS drift: beneficialHigher = false (below expected slowing is good;
 // a negative observed drift is BETTER than a positive expected drift, so
 // this yields a positive residual).
 const driftResidual = normalizeResidual(
  driftPctObserved!=null ? driftPctObserved : expected.expectedDriftPct,
  expected.expectedDriftPct, tolDrift, false);
 // CV: beneficialHigher = false (below expected variability is good).
 const cvResidual = normalizeResidual(
  responseCvPct!=null ? responseCvPct : expected.expectedCvPct,
  expected.expectedCvPct, tolCv, false);

 // ── Weighted adjustment ───────────────────────────────────────────────
 const wAccuracy = Number(settings.mode2NormWeightAccuracy) || DEFAULTS.mode2NormWeightAccuracy;
 const wDrift    = Number(settings.mode2NormWeightDrift)    || DEFAULTS.mode2NormWeightDrift;
 const wCv       = Number(settings.mode2NormWeightCv)       || DEFAULTS.mode2NormWeightCv;

 const accuracyAdj = accuracyResidual * wAccuracy;
 const driftAdj    = driftResidual    * wDrift;
 const cvAdj       = cvResidual       * wCv;

 // NOTE: the three retired weights (correct / wrong / miss) are now
 // defaulted to 0, but we still read them through the settings fallback
 // so a user who has hand-edited them in Admin gets the expected behavior.
 // Under default settings their contribution is zero.
 const wCorrectLegacy = Number(settings.mode2NormWeightCorrect);
 const wWrongLegacy   = Number(settings.mode2NormWeightWrong);
 const wMissLegacy    = Number(settings.mode2NormWeightMiss);
 const legacyAccuracyAdj = (Number.isFinite(wCorrectLegacy) && wCorrectLegacy>0)
   ? normalizeResidual(correctRate, expected.expectedCorrectRate,
      Number(settings.mode2NormToleranceCorrectRate)||DEFAULTS.mode2NormToleranceCorrectRate,
      true) * wCorrectLegacy
   : 0;
 const legacyWrongAdj = (Number.isFinite(wWrongLegacy) && wWrongLegacy>0)
   ? normalizeResidual(wrongRate, expected.expectedWrongRate,
      Number(settings.mode2NormToleranceWrongRate)||DEFAULTS.mode2NormToleranceWrongRate,
      false) * wWrongLegacy
   : 0;
 const legacyMissAdj = (Number.isFinite(wMissLegacy) && wMissLegacy>0)
   ? normalizeResidual(missRate, expected.expectedMissRate,
      Number(settings.mode2NormToleranceMissRate)||DEFAULTS.mode2NormToleranceMissRate,
      false) * wMissLegacy
   : 0;

 const rawAdj = accuracyAdj + driftAdj + cvAdj
  + legacyAccuracyAdj + legacyWrongAdj + legacyMissAdj;
 const maxDelta = Math.max(0, Number(settings.mode2NormMaxDelta)||DEFAULTS.mode2NormMaxDelta);
 const cappedAdj = clampSigned(rawAdj, maxDelta);
 const cpa = Math.max(0, Math.min(100, cpi + cappedAdj));

 const reliefCtx = computeMode2SustainedReliefContext(result.mode2AdaptiveMbsMs!=null ? result.mode2AdaptiveMbsMs : null);
 const reliefMs = result.mode2SustainedReliefMs!=null ? Number(result.mode2SustainedReliefMs) : reliefCtx.reliefMs;
 const challengeRatio = result.mode2SustainedChallengeRatio!=null ? Number(result.mode2SustainedChallengeRatio) : reliefCtx.challengeRatio;

 const r1 = v=>v!=null&&Number.isFinite(Number(v))?Number(Number(v).toFixed(1)):null;
 const r2 = v=>v!=null&&Number.isFinite(Number(v))?Number(Number(v).toFixed(2)):null;
 const r3 = v=>v!=null&&Number.isFinite(Number(v))?Number(Number(v).toFixed(3)):null;

 // Backward-compat note on legacy field population:
 //   cpaCorrectWeighting   ← accuracy-composite adjustment (so the existing
 //                           Results summary line reads the headline accuracy
 //                           signal; the line is relabeled in Rev 151 to
 //                           "Sustained accuracy factor").
 //   cpaCorrectResidual    ← accuracy-composite residual (same alias rationale)
 //   cpaWrongWeighting / cpaMissedWeighting / cpaWrongResidual / cpaMissedResidual
 //                         ← null when the corresponding weight is 0 (default)
 //                           so CSV columns stay but show empty for retired
 //                           features. When a user has opted back in via
 //                           admin overrides, the legacy values are reported.
 const legacyCorrectVal  = (legacyAccuracyAdj!==0) ? legacyAccuracyAdj : null;
 const legacyWrongVal    = (legacyWrongAdj!==0)   ? legacyWrongAdj    : null;
 const legacyMissVal     = (legacyMissAdj!==0)    ? legacyMissAdj     : null;

 return {
  cpa: r1(cpa),
  cpaBaseCpi: r1(cpi),
  cpaAdjustmentApplied: r1(cappedAdj),
  cpaNormativeModelVersion: getMode2NormativeModelVersion(),
  // Expected profile (legacy fields + new composite)
  cpaExpectedCorrectRate: r3(expected.expectedCorrectRate),
  cpaExpectedWrongRate: r3(expected.expectedWrongRate),
  cpaExpectedMissRate: r3(expected.expectedMissRate),
  cpaExpectedDriftPct: r1(expected.expectedDriftPct),
  cpaExpectedCvPct: r1(expected.expectedCvPct),
  cpaExpectedAccuracyComposite: r3(expected.expectedAccuracyComposite),
  // Observed values (legacy fields + new composite + OLS drift)
  cpaObservedCorrectRate: r3(correctRate),
  cpaObservedWrongRate: r3(wrongRate),
  cpaObservedMissRate: r3(missRate),
  cpaObservedDriftPct: r1(driftPctObserved),
  cpaObservedCvPct: r1(responseCvPct),
  cpaObservedAccuracyComposite: r3(accComposite),
  cpaObservedDriftSlopeMsPerTrial: r3(driftSlopeMsPerTrial),
  cpaObservedDriftPctOls: r1(driftPctOls),
  // Weighted adjustments (canonical + legacy aliases)
  cpaAccuracyWeighting: r1(accuracyAdj),
  cpaCorrectWeighting: r1(legacyCorrectVal!=null ? legacyCorrectVal : accuracyAdj),
  cpaWrongWeighting: r1(legacyWrongVal),
  cpaMissedWeighting: r1(legacyMissVal),
  cpaSdWeighting: r1(cvAdj),
  cpaDriftWeighting: r1(driftAdj),
  // Residuals (canonical + legacy aliases)
  cpaAccuracyResidual: r2(accuracyResidual),
  cpaCorrectResidual: r2(accuracyResidual),
  cpaWrongResidual: legacyWrongVal!=null ? r2(legacyWrongVal / (wWrongLegacy||1)) : null,
  cpaMissedResidual: legacyMissVal!=null ? r2(legacyMissVal / (wMissLegacy||1)) : null,
  cpaCvResidual: r2(cvResidual),
  cpaDriftResidual: r2(driftResidual),
  // Retained diagnostics
  cpaSustainedResponseSdMs: r1(responseSd),
  cpaSustainedCvPct: r1(responseCvPct),
  cpaSustainedDriftRatio: sustainedCorrectRTs.length>=2 ? r3(driftRatio) : null,
  cpaEarlyMedianRtMs: r1(earlyMedian),
  cpaLateMedianRtMs: r1(lateMedian),
  cpaRecoveryCalibRatio: r2(recoveryCalibRatio),
  cpaLapseRatePct: r1(lapseRatePct),
  cpaTrialsPerBlock: r1(trialsPerBlock),
  cpaSustainedReliefMs: r1(reliefMs),
  cpaSustainedChallengeRatio: r3(challengeRatio)
 };
}

function computeDisposition(result){
 const blank = { dispositionCode:null, dispositionLabel:null, dispositionSpfs:null };
 if(!result) return blank;
 // Gate: only completed/successful tests get a disposition. A failed
 // calibration or aborted run should not be assigned an S-PFS level as
 // that would falsely read as "Unable to function" when the subject
 // simply never produced a scorable result.
 try{ if(!isTestSuccess(result)) return blank; }catch(e){ return blank; }

 // Rev29 — disposition extended from Mode 2 only to ALL modes:
 //   • Mode 2 uses CPA (the synthesized fit-for-duty score that already
 //     incorporates CPI plus sustained-phase adjustments)
 //   • Mode 1 / 3 / 4 use CPI directly, since they have no sustained
 //     phase and CPI is already on the 0-100 scale anchored to S-PFS
 //     via the same canonical `mode1Bands` captions.
 //
 // Band edges are the midpoints between the canonical CPI anchors used
 // throughout CogSpeed (100, 80, 75, 50, 25, 11, 0 → midpoints 90, 77.5,
 // 62.5, 37.5, 18, 5.5). Labels pulled directly from the Cognitive
 // Performance table captions (see mode1Bands in getCognitivePerformanceTableText)
 // so the disposition vocabulary matches the rest of the app exactly.
 // dispositionCode is the S-PFS numeric level as a string ("1".."7");
 // dispositionSpfs is the same value as a Number for CSV/analysis use.
 // ┌────┬──────────────────┬──────────────────────────────────────────────┐
 // │SPF │ Score band (CPA  │ Label (from mode1Bands)                      │
 // │    │ or CPI)          │                                              │
 // ├────┼──────────────────┼──────────────────────────────────────────────┤
 // │ 7  │ ≥ 90             │ Functioning exceptionally well               │
 // │ 6  │ 77.5 – <90       │ Functioning very well                        │
 // │ 5  │ 62.5 – <77.5     │ Functioning normally                         │
 // │ 4  │ 37.5 – <62.5     │ Functioning slightly less than normal        │
 // │ 3  │ 18   – <37.5     │ Functioning starting to slow                 │
 // │ 2  │  5.5 – <18       │ Difficult to function / becoming unsafe      │
 // │ 1  │ <  5.5           │ Unable to function / definitely unsafe       │
 // └────┴──────────────────┴──────────────────────────────────────────────┘
 let score = null;
 if(result.testMode === "mode2" && result.mode2Triggered){
  score = Number(result.cpa);
 } else if(result.testMode === "mode1" || result.testMode === "mode3" || result.testMode === "mode4"){
  score = Number(result.cognitivePerformanceIndex);
 } else if(result.testMode === "mode2"){
  // Mode 2 that did not reach the sustained phase → no CPA was computed;
  // fall back to CPI (still a valid 0-100 score against the same anchors).
  score = Number(result.cognitivePerformanceIndex);
 }
 if(!Number.isFinite(score)) return blank;

 let spfs, label;
 if(score >= 90)      { spfs=7; label="Functioning exceptionally well"; }
 else if(score >= 77.5){ spfs=6; label="Functioning very well"; }
 else if(score >= 62.5){ spfs=5; label="Functioning normally"; }
 else if(score >= 37.5){ spfs=4; label="Functioning slightly less than normal"; }
 else if(score >= 18)  { spfs=3; label="Functioning starting to slow"; }
 else if(score >= 5.5) { spfs=2; label="Difficult to function / becoming unsafe"; }
 else                  { spfs=1; label="Unable to function / definitely unsafe"; }
 return { dispositionCode: String(spfs), dispositionLabel: label, dispositionSpfs: spfs };
}

// Backward-compatible alias — older call sites use the Mode 2 name, and some
// saved-result paths may still reference computeDispositionFromCPA. The new
// function does the right thing for all modes, so the alias simply delegates.
function computeDispositionFromCPA(result){ return computeDisposition(result); }

function getSpeedometerSelectedIndex(){
 const s=$("speedometerSessionSelect");
 if(!s || !s.options.length) return Math.max(0, state.history.length-1);
 const idx=Number(s.value);
 return Number.isFinite(idx) ? Math.max(0, Math.min(state.history.length-1, idx)) : Math.max(0, state.history.length-1);
}

function getLatestHistoryIndex(){
 if(!Array.isArray(state.history) || !state.history.length) return null;
 let bestIdx = state.history.length - 1;
 let bestTime = Number.NEGATIVE_INFINITY;
 for(let i=0;i<state.history.length;i++){
  const r = state.history[i];
  const t = r && r.time ? Date.parse(r.time) : NaN;
  const score = Number.isFinite(t) ? t : i;
  if(score >= bestTime){
   bestTime = score;
   bestIdx = i;
  }
 }
 return bestIdx;
}

function syncSpeedometerSessionSelect(selectedIdx){
 const s=$("speedometerSessionSelect");
 if(!s) return;
 const latestIdx = getLatestHistoryIndex();
 const wanted = Number.isFinite(Number(selectedIdx))
  ? Math.max(0, Math.min(state.history.length-1, Number(selectedIdx)))
  : (latestIdx!=null ? latestIdx : 0);
 const orderedIdx = state.history
  .map((r, idx)=>({idx, t:(r && r.time ? Date.parse(r.time) : NaN)}))
  .sort((a,b)=>{
   const at = Number.isFinite(a.t) ? a.t : a.idx;
   const bt = Number.isFinite(b.t) ? b.t : b.idx;
   return bt - at;
  })
  .map(entry=>entry.idx);
 const existing = Array.from(s.options).map(o=>o.value).join('|');
 const desired = orderedIdx.map(idx=>String(idx)).join('|');
 if(existing !== desired){
  s.innerHTML = orderedIdx.map((idx)=>{
   const r = state.history[idx];
   const stamp = r && r.time ? new Date(r.time).toLocaleDateString() : `Sess ${idx+1}`;
   const mode = formatCompactResultModeLabel(r);
   return `<option value="${idx}">Sess ${idx+1} · ${mode} · ${stamp}</option>`;
  }).join('');
 }
 if(s.options.length){
  s.value = String(wanted);
  if(String(s.value)!==String(wanted)){
   s.selectedIndex = Math.max(0, Math.min(s.options.length-1, wanted));
  }
 }
}

function openSpeedometerSession(idx){
 const safeIdx = Number.isFinite(Number(idx)) ? Math.max(0, Math.min(state.history.length-1, Number(idx))) : getLatestHistoryIndex();
 const ctx = resolveResultContext(null, safeIdx, "speedometer session");
 if(!ctx.result) return goToStartPage();
 hideAllOverlays();
 if(Number.isFinite(Number(ctx.index)) && ctx.index>=0){
  syncSpeedometerSessionSelect(ctx.index);
 }
 renderSpeedometerOutcome(ctx.result, ctx.index);
}

function showResultsPage(resultOverride){
 // Results handoff is fully curtain-neutral.
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
  if(outcome) outcome.classList.add("hidden");
  if(thinking) thinking.classList.remove("hidden");
  try{ startFX(); }catch(e){ console.warn("startFX failed", e); }
  setFlowDiagnostic("THINKING", `CogSpeed Thinking — ${ctx.result && ctx.result.endReason ? ctx.result.endReason : "Run complete"}`);
  setTimeout(()=>{
   try{
    if(thinking) thinking.classList.add("hidden");
    if(outcome) outcome.classList.remove("hidden");
    const latestIdx = state.history.length - 1;
    if(Number.isFinite(Number(latestIdx)) && latestIdx>=0){ syncSummarySessionSelect(latestIdx); syncSpeedometerSessionSelect(latestIdx); }
    renderSpeedometerOutcome(ctx.result, latestIdx);
   }catch(err){
    console.error("showResultsPage delayed render failed", err);
    if(outcome) outcome.classList.remove("hidden");
    try{ syncOutcomeStatusText(ctx.result || {endReason:state.endReason||"Run complete"}); }catch(e){}
   }finally{
    try{ updateStartPageLinks(); }catch(e){}
   }
  }, 2000);
 }catch(err){
  console.error("showResultsPage failed", err);
  if(thinking) thinking.classList.add("hidden");
  if(outcome) outcome.classList.remove("hidden");
  try{ syncOutcomeStatusText(ctx.result || {endReason:state.endReason||"Run complete"}); }catch(e){}
  try{ updateStartPageLinks(); }catch(e){}
 }
}

// ─── Session control ───
// ─── SESSION STATE MANAGEMENT ─────────────────────────────────
// resetTrialStateOnly(): clears only active test/runtime state.
// resetPretestEntryState(): clears sleep/S-PFS entry state.
// resetSubjectSessionState(): clears runtime + pretest state while preserving saved profile/settings.
// saveSettings() / loadSettings(): persist to localStorage.
// ──────────────────────────────────────────────────────────────
function resetTrialStateOnly(){
 clearTimer(); clearNoResponseTimer(); clearMaxTestTimer();
 state.phase="idle"; state.duration=null; state.blockDuration=null; state.blockRestartBaseline=null;
 state.current=null; state.previous=null; state.unresolvedStreak=0;
 state.overloads=[]; state.recoveries=[]; state.recoveryTrialsCompleted=0;
 state.spCorrectStreak=0; state.spWrongCount=0; state.terminalBlockReason=null;
 state.totalTrials=0; state.endReason=""; state.totalResponses=0; state.pacedErrors=0; state.recoveryErrors=0;
 state.testStartTime=null; state.maxTestRemainingMs=null; state.maxTestDeadlineMs=null; state.totalCorrect=0; state.totalIncorrect=0;
 state.missedTrials=0; state.rollMeanLog=[]; state.mode2SustainedRollMeanLog=[]; state.mode2PendingPriorMiss=null; state.lastFiveAnswers=[];
 state.calibrationTrialIndex=0; state.calibrationRTs=[]; state.calibrationErrors=0;
 state.pacedRTs=[]; state.rtLog=[]; state.lastFrameDuration=null; state.presentedRoundDuration=null;
 state.activeMode=settings.testMode||"mode1"; state.selfPacedRTs=[]; state.selfPacedCorrect=0; state.selfPacedWrong=0;
 state.fixedPacedBaseline=null; state.fixedPacedPresented=0; state.fixedPacedCorrect=0; state.fixedPacedWrong=0;
 state.geo=null; state.benchmark=null; state.lastResultText=null;
 state.pendingPriorMiss=null; state.pendingLatePacing=null;
 state.activeFrameTiming=null; state.frameOvershootLog=[]; state.rafIntervalLog=[];
 state.mode2Triggered=false; state.mode2AdaptiveMbsMs=null; state.mode2SustainedPresentationRateMs=null; state.mode2SustainedReliefMs=null; state.mode2SustainedChallengeRatio=null;
 state.mode2SustainedPresented=0; state.mode2SustainedCorrect=0; state.mode2SustainedWrong=0; state.mode2SustainedMissed=0;
 state.mode2SustainedCorrectRTs=[]; state.mode2FinalTrialsPresented=0; state.mode2FinalCorrect=0; state.mode2FinalWrong=0; state.mode2FinalRTs=[]; state.summaryVariant="complete";
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
 ["sleepBedHourInput","sleepBedMinuteInput","sleepWakeHourInput","sleepWakeMinuteInput","sleepDurationOverrideInput"].forEach(id=>{ const el=$(id); if(el) el.value=""; });
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
 stopFX(); stopSpeedometer(); setStatus("Ready"); showOnly("subjectOverlay");
 try{ updateStartPageLinks(); }catch(e){}
 restoreSubjectFromProfile();
}
function startOverFlow(){
 resetSubjectSessionState(); state.subjectId=null; state.profile=null;
 stopSchedulerTimers();
 schedulerState.activeSubjectId = "";
 schedulerState.settings = structuredClone(DEFAULT_SCHEDULER_SETTINGS);
 fatigueOut.textContent="—"; $("subjectIdInput").value="";
 persistAdminUnlockForCurrentRev(false);
 // Full reset: clear welcome-back display but preserve saved profile in localStorage
 const wl=$("subjectWelcome"); if(wl) wl.style.display="none";
 const we=$("welcomeEmail"); if(we) we.textContent="";
 const hint=$("subjectHint"); if(hint) hint.textContent="Enter your email to begin.";
 setStatus("Reset. Enter Subject ID."); showOnly("subjectOverlay");
 normalizeCurtainForTesting();
}

// ─── Ready signal then start ───
// ─── READY HANDOFF / CURTAIN-NEUTRAL START ───────────────────
// Curtain transitions have been retired. These helpers now only normalize the
// visible test surface so the gear-spin handoff stays fail-open and simple.
// ──────────────────────────────────────────────────────────────

function clearCurtainWatchdog(){}
function hardResetCurtainState(hideTestScreen=false){
 document.body.classList.remove("curtain-active");
 const ts=$("testScreen");
 if(ts){
  if(hideTestScreen) ts.classList.add("hidden");
  else {
   ts.classList.remove("hidden");
   ts.classList.remove("transition-blocked");
  }
  ts.style.pointerEvents="auto";
 }
 applyPhaseBackground();
}
function normalizeCurtainForTesting(){
 hardResetCurtainState(false);
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
  meta.textContent=`S-PFS ${result.samnPerelli?result.samnPerelli.score:"—"}`;
 }
 tbody.innerHTML="";
 if(!log||!log.length){
  tbody.innerHTML='<tr><td colspan="11" style="text-align:center;color:var(--muted);padding:12px">No trial data for this session</td></tr>';
  const meta=$("trialLogMeta"); if(meta) meta.textContent="S-PFS —";
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
 const subj=(result?result.subjectId:"current").replace(/@/g,"_").replace(/\./g,"_");
 const blob=new Blob([hdr+rows],{type:"text/csv"});
 const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`${STORAGE_PREFIX}_trials_${subj}.csv`;
 document.body.appendChild(a); a.click();
 setTimeout(()=>{ try{URL.revokeObjectURL(a.href);}catch(e){} try{a.remove();}catch(e){} },250);
}

// Presentation Rate Versus Response Time Graph (all sessions)
// - all sessions plotted on one graph
// - selected session highlighted with Prev/Next buttons
// - smaller ms = better performance and graphs higher
// Presentation Rate Versus Response Time Graph (overlaid sessions)
// - all sessions share the same x-axis
// - every session starts at trial 1
// - sessions can have different lengths
// - selected session is highlighted
// - smaller ms = better performance and graphs higher
// Presentation Rate Versus Response Time Graph (same-mode overlaid sessions)
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
  meta.textContent = result ? `S-PFS ${result.samnPerelli?result.samnPerelli.score:"—"}` : "S-PFS —";
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
// Note: runDeviceBenchmark is not cancellable once started. Closing the overlay
// while the benchmark runs leaves it running in the background. Do not start a
// test while the benchmark is in progress.
async function runDeviceBenchmark(force){
 const enabled=force||Number(settings.deviceBenchmarkEnabled||0)===1;
 if(!enabled){ state.benchmark=null; return; }
 const BENCH=1000;
 const ov=$("benchmarkOverlay"),bs=$("benchStatusLine"),bst=$("benchStats"),bg=$("benchGrade"),bb=$("benchBtns");
 if(ov) ov.classList.remove("hidden");
 if(bg) bg.style.display="none"; if(bb) bb.style.display="none";
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

// Tutorial demo data switches with the active symbol set.
const STANDARD_TUT_DATA = {
 probePattern: LINE_PATTERNS[3],
 correctPos: 2,
 items: [
  {family:"dots", count:5, pattern:DOT_PATTERNS[5]},
  {family:"lines", count:1, pattern:LINE_PATTERNS[1]},
  {family:"dots", count:3, pattern:DOT_PATTERNS[3]},
  {family:"lines", count:4, pattern:LINE_PATTERNS[4]},
  {family:"dots", count:2, pattern:DOT_PATTERNS[2]},
  {family:"lines", count:6, pattern:LINE_PATTERNS[6]},
 ]
};
const MEMORY_TUT_DATA = {
 probePattern: memoryIconPattern(1),
 correctPos: 2,
 items: [
  {family:"memory", count:7, pattern:memoryIconPattern(7)},
  {family:"memory", count:10, pattern:memoryIconPattern(10)},
  {family:"memory", count:2, pattern:memoryIconPattern(2)},
  {family:"memory", count:5, pattern:memoryIconPattern(5)},
  {family:"memory", count:11, pattern:memoryIconPattern(11)},
  {family:"memory", count:4, pattern:memoryIconPattern(4)},
 ]
};
// SURVIVAL_TUT_DATA mirrors MEMORY_TUT_DATA's structure with Survival icons.
// Probe is Jet 1 (icon 1); its paired match per SURVIVAL_PAIR_MAP is Jet 2 (icon 2).
// correctPos=2 places Jet 2 at grid position 2 (the third cell, index 2), matching
// the layout convention used by STANDARD_TUT_DATA and MEMORY_TUT_DATA.
const SURVIVAL_TUT_DATA = {
 probePattern: survivalIconPattern(1),
 correctPos: 2,
 items: [
  {family:"survival", count:7,  pattern:survivalIconPattern(7)},
  {family:"survival", count:10, pattern:survivalIconPattern(10)},
  {family:"survival", count:2,  pattern:survivalIconPattern(2)},
  {family:"survival", count:5,  pattern:survivalIconPattern(5)},
  {family:"survival", count:11, pattern:survivalIconPattern(11)},
  {family:"survival", count:4,  pattern:survivalIconPattern(4)},
 ]
};
// getTutorialData returns the correct tutorial dataset for the active challenge set.
// Previously referenced at four call sites but never defined — Rev 14 masked this
// because upstream parse errors prevented the tutorial code path from executing.
// Rev 15 parses clean so any user tapping into the tutorial would hit a
// ReferenceError without this function in place.
function getTutorialData(){
 if(isMemoryChallengeActive()) return MEMORY_TUT_DATA;
 if(isSurvivalChallengeActive()) return SURVIVAL_TUT_DATA;
 return STANDARD_TUT_DATA;
}
function getTutorialTargetsHint(){
 if(isMemoryChallengeActive()) return "Each gear has an icon. Learn the icon-pair matches shown in the refresher.";
 if(isSurvivalChallengeActive()) return "Each gear has a Survival icon. Learn the paired matches shown in the refresher.";
 return "Each has dots or lines — count them";
}
function getTutorialRuleCardHtml(){
 if(isMemoryChallengeActive()){
  return `<div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;justify-content:center">
      <div style="text-align:center"><div style="font-size:10px;color:rgba(255,255,255,0.5);margin-bottom:3px">PROBE</div><div style="width:60px;height:60px">${buildGearSVG(0, memoryIconPattern(1), "probe", "")}</div><div style="font-size:12px;color:#7fd7ff;margin-top:3px;font-weight:700">Triangle</div></div>
      <div style="font-size:24px;color:#ffaa44;font-weight:900">↔</div>
      <div style="text-align:center"><div style="font-size:10px;color:rgba(255,255,255,0.5);margin-bottom:3px">MATCH</div><div style="width:60px;height:60px;border:2px solid #7fd7ff;border-radius:8px;box-shadow:0 0 10px rgba(127,215,255,0.4)">${buildGearSVG(3, memoryIconPattern(2), "probe", "")}</div><div style="font-size:12px;color:#00ff88;margin-top:3px;font-weight:700">Bear ✓</div></div>
     </div>
     <div style="font-size:17px;font-weight:800;color:#7fd7ff">Paired MATCH</div>
     <div style="font-size:14px;color:rgba(255,255,255,0.6);margin:2px 0">Triangle → find Bear</div>
     <div style="font-size:17px;font-weight:800;color:#ffaa44;margin-top:6px">Use the learned icon matches</div>`;
 }
 if(isSurvivalChallengeActive()){
  return `<div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;justify-content:center">
      <div style="text-align:center"><div style="font-size:10px;color:rgba(255,255,255,0.5);margin-bottom:3px">PROBE</div><div style="width:60px;height:60px">${buildGearSVG(0, survivalIconPattern(1), "probe", "")}</div><div style="font-size:12px;color:#7fd7ff;margin-top:3px;font-weight:700">Jet 1</div></div>
      <div style="font-size:24px;color:#ffaa44;font-weight:900">↔</div>
      <div style="text-align:center"><div style="font-size:10px;color:rgba(255,255,255,0.5);margin-bottom:3px">MATCH</div><div style="width:60px;height:60px;border:2px solid #7fd7ff;border-radius:8px;box-shadow:0 0 10px rgba(127,215,255,0.4)">${buildGearSVG(3, survivalIconPattern(2), "probe", "")}</div><div style="font-size:12px;color:#00ff88;margin-top:3px;font-weight:700">Jet 2 ✓</div></div>
     </div>
     <div style="font-size:17px;font-weight:800;color:#7fd7ff">Paired MATCH</div>
     <div style="font-size:14px;color:rgba(255,255,255,0.6);margin:2px 0">Jet 1 → find Jet 2</div>
     <div style="font-size:17px;font-weight:800;color:#ffaa44;margin-top:6px">Use Survival pairs</div>`;
 }
 return `<div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;justify-content:center">
      <div style="text-align:center"><div style="font-size:10px;color:rgba(255,255,255,0.5);margin-bottom:3px">PROBE</div><div style="width:60px;height:60px">${buildGearSVG(0, LINE_PATTERNS[3], "probe", "")}</div><div style="font-size:12px;color:#7fd7ff;margin-top:3px;font-weight:700">lines : 3</div></div>
      <div style="font-size:24px;color:#ffaa44;font-weight:900">↔</div>
      <div style="text-align:center"><div style="font-size:10px;color:rgba(255,255,255,0.5);margin-bottom:3px">MATCH</div><div style="width:60px;height:60px;border:2px solid #7fd7ff;border-radius:8px;box-shadow:0 0 10px rgba(127,215,255,0.4)">${buildGearSVG(3, DOT_PATTERNS[3], "probe", "")}</div><div style="font-size:12px;color:#00ff88;margin-top:3px;font-weight:700">dots : 3 ✓</div></div>
     </div>
     <div style="font-size:17px;font-weight:800;color:#7fd7ff">Same COUNT</div>
     <div style="font-size:14px;color:rgba(255,255,255,0.6);margin:2px 0">3 lines → find 3 dots</div>`;
}
function getTutorialTapInstructionHtml(){
 if(isMemoryChallengeActive()) return 'The center <span style="font-weight:900">PROBE</span> icon is paired with one icon in one gear above. Tap <span style="font-weight:900">RESPONSE GEAR</span> in the same position below.';
 if(isSurvivalChallengeActive()) return 'The center <span style="font-weight:900">PROBE</span> icon is paired with one Survival icon in one gear above. Tap <span style="font-weight:900">RESPONSE GEAR</span> in the same position below.';
 return 'The center <span style="font-weight:900">PROBE</span> Dots or Lines match the Dots or Lines in one gear above. Tap <span style="font-weight:900">RESPONSE GEAR</span> in the same position below.';
}
function tutFillPatterns(){
 // Tutorial data is already fully assembled for both standard and Memory Challenge sets.
}
function buildTutGearGrid(highlightPos, showPatterns){
 let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;width:100%;max-width:380px">';
 const tut=getTutorialData();
 tut.items.forEach((it,i)=>{
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
 const pat = getTutorialData().probePattern;
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
 const tut=getTutorialData();
 tut.items.forEach((it,i)=>{
  const pat = showPatterns ? it.pattern : null;
  const anim = i===tut.correctPos ? "tutPairFlashCorrect 12s linear infinite" : "tutPairFlash 12s linear infinite";
  html += `<div style="border:2px solid transparent;border-radius:10px;aspect-ratio:1;animation:${anim};animation-delay:${i*2}s">
   ${buildGearSVG(i+1, pat, "large", "")}
  </div>`;
 });
 html += '</div>';
 return html;
}

function buildTutRespGridAnimated(){
 let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;width:100%;max-width:380px">';
 const tut = getTutorialData();
 for(let i=0;i<6;i++){
  const anim = i===tut.correctPos ? "tutPairFlashCorrect 12s linear infinite" : "tutPairFlash 12s linear infinite";
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
 const tut=getTutorialData();
 let stimHtml = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;width:100%">';
 tut.items.forEach((it,i)=>{
  stimHtml += `<div style="aspect-ratio:1">${buildGearSVG(i+1, it.pattern, "small", "")}</div>`;
 });
 stimHtml += '</div>';

 // Probe
 const probeHtml = `<div style="width:clamp(44px,13vw,60px);height:clamp(44px,13vw,60px);filter:drop-shadow(${probeGlow})">
  ${buildGearSVG(0, tut.probePattern, "probe", "")}
 </div>`;

 // Response buttons — real gear SVGs (no pattern), correct one glowing green
 let respHtml = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;width:100%">';
 for(let i=0;i<6;i++){
  const isHL = (highlightPart==="resp"||highlightPart==="all") && i===tut.correctPos;
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
 // Step 1: before-you-begin preparation page
 {
  build:()=>{
   return `
   <div style="position:relative;z-index:1;display:flex;flex-direction:column;height:100%;padding:14px 14px 10px 14px;text-align:left">
    <div style="font-size:13px;letter-spacing:.1em;color:rgba(127,215,255,0.8);text-transform:uppercase;margin-bottom:8px;text-align:center;text-shadow:0 0 12px rgba(127,215,255,0.5)">Before You Begin</div>
    <div style="background:rgba(10,20,40,0.92);backdrop-filter:blur(4px);border-radius:16px;padding:12px 14px;max-width:100%;border:1px solid rgba(127,215,255,0.22);overflow:auto">
     <div style="font-size:18px;font-weight:800;color:#f5fbff;margin-bottom:8px;text-align:center">Hints, test hygiene, and preparation</div>
     <ol style="margin:0;padding-left:18px;font-size:13.5px;line-height:1.36;color:rgba(255,255,255,0.86)">
      <li>Make sure your phone or tablet has enough battery to finish the test.</li>
      <li>Use Wi-Fi if possible, especially if you want syncing, downloads, or e-mail features.</li>
      <li>Silence calls, alerts, and pop-up notifications if you can.</li>
      <li>Take the test in a safe place where you can focus fully.</li>
      <li>Do not take the test while driving, walking in traffic, or doing anything hazardous.</li>
      <li>Hold the device in a comfortable, stable position.</li>
      <li>Make sure the screen is clean, easy to see, and bright enough.</li>
      <li>If you use reading glasses or other vision correction, wear them.</li>
      <li>Use your usual hand and normal tapping posture.</li>
      <li>Avoid talking or multitasking during the test.</li>
      <li>Try to minimize distractions from people, TV, music, or other devices.</li>
      <li>Take the test only when you can give it your full attention for a few minutes.</li>
      <li>Try to tap as quickly as you can without guessing wildly.</li>
      <li>Establish your personal baseline.</li>
      <li>For best comparisons over time, take the test under roughly similar conditions when possible.</li>
      <li>If you feel unusually impaired, unsafe, or unable to focus, treat that result seriously.</li>
      <li>Don’t get discouraged if you can’t keep up — CogSpeed is faster than you are!</li>
     </ol>
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
     <div style="font-size:15px;color:rgba(255,255,255,0.65)">${getTutorialTargetsHint()}</div>
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
     ${getTutorialRuleCardHtml()}
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
${getTutorialTapInstructionHtml()}
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
      <span style="color:#7fd7ff;font-weight:700">Up next:</span> First go to the Sleep Logger path. If you have not slept before this test, answer No there. Then rate your fatigue (S-PFS), then the test begins!
     </div>
    </div>
   </div>`;
  }
 },
 // Step 6: explain why baseline matters
 {
  build:()=>{
   return `
   <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:18px;text-align:center;background:linear-gradient(180deg,#8f8f8f 0%,#7f7f7f 100%)">
    <div style="max-width:360px;background:rgba(12,22,40,0.9);border:1px solid rgba(127,215,255,0.25);border-radius:18px;padding:18px 18px 16px;box-shadow:0 10px 28px rgba(0,0,0,0.2)">
     <div style="font-size:28px;font-weight:900;color:#7fd7ff;letter-spacing:.04em;margin-bottom:10px">PERSONAL BASELINE</div>
     <div style="font-size:15px;line-height:1.6;color:rgba(255,255,255,0.88)">
      CogSpeed works best when you build your own personal Baseline. Your Baseline is a rolling average of your last 5 qualifying Mode 1 or Mode 2 MBS scores.
     </div>
     <div style="margin-top:12px;font-size:14px;line-height:1.6;color:rgba(220,235,255,0.88);background:rgba(127,215,255,0.08);border:1px solid rgba(127,215,255,0.22);border-radius:12px;padding:10px 12px">
      Baseline sessions must be non-failed non-Guest tests with <strong>MBS at or below ${getPersonalBaselineMaxMbs()} ms</strong> and <strong>S-PFS of 5, 6, or 7</strong>. This helps CogSpeed track changes from your own normal level and capture learning effects over time.
     </div>
    </div>
   </div>`;
  }
 },
 // Step 7: explain scheduler on profile page
 {
  build:()=>{
   return `
   <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:18px;text-align:center;background:linear-gradient(180deg,#8f8f8f 0%,#7f7f7f 100%)">
    <div style="max-width:360px;background:rgba(12,22,40,0.9);border:1px solid rgba(127,215,255,0.25);border-radius:18px;padding:18px 18px 16px;box-shadow:0 10px 28px rgba(0,0,0,0.2)">
     <div style="font-size:28px;font-weight:900;color:#7fd7ff;letter-spacing:.04em;margin-bottom:10px">PROFILE SCHEDULER</div>
     <div style="font-size:15px;line-height:1.6;color:rgba(255,255,255,0.88)">
      On the Profile page, the Mode 2 Scheduler can remind you when to test again. You can choose <strong>Anytime</strong>, a <strong>Personal</strong> schedule, or <strong>Fit for Duty</strong>.
     </div>
     <div style="margin-top:12px;font-size:14px;line-height:1.6;color:rgba(220,235,255,0.88);background:rgba(127,215,255,0.08);border:1px solid rgba(127,215,255,0.22);border-radius:12px;padding:10px 12px">
      Personal lets you test at set times. Fit for Duty adjusts the next reminder from your latest Mode 2 CPI and S-PFS. Scheduler is for registered users only, not Guest.
     </div>
    </div>
   </div>`;
  }
 },
];

function tutSetStep(n){
 _tutStep = n;
 // Update dots
 for(let i=0;i<7;i++){
  const d=$("tdot"+i);
  if(d) d.style.background = i===n ? "#7fd7ff" : "rgba(127,215,255,0.25)";
 }
 // Update content
 const content=$("tutorialContent");
 if(content) content.innerHTML = TUT_STEPS[n].build();

 // Direct button labeling/layout logic
 const backBtn=$("tutBackBtn");
 const nextBtn=$("tutNextBtn");
 const skipBtn=$("tutSkipBtn");
 if(backBtn && nextBtn && skipBtn){
  backBtn.style.width="100%";
  nextBtn.style.width="100%";
  skipBtn.style.width="100%";
  backBtn.style.minHeight="52px";
  nextBtn.style.minHeight="52px";
  skipBtn.style.minHeight="52px";

  backBtn.textContent="← Back 1 Page";
  backBtn.style.background="";
  backBtn.style.borderColor="";
  backBtn.style.color="";
  backBtn.style.opacity = n===0 ? "0.45" : "0.9";
  backBtn.disabled = n===0;

  if(n===0){
   nextBtn.textContent="TUTORIAL";
   skipBtn.textContent="SKIP TO TEST";
   nextBtn.style.background="";
   nextBtn.style.borderColor="";
   nextBtn.style.color="";
   skipBtn.style.background="";
   skipBtn.style.borderColor="";
   skipBtn.style.color="";
   skipBtn.style.opacity="0.9";
  }else if(n===TUT_STEPS.length-1){
   nextBtn.textContent="▶ Start Test!";
   skipBtn.textContent="SKIP TO TEST";
   nextBtn.style.background="linear-gradient(180deg,#0d4a1a,#062a10)";
   nextBtn.style.borderColor="#00ff88";
   nextBtn.style.color="#00ff88";
   skipBtn.style.background="";
   skipBtn.style.borderColor="";
   skipBtn.style.color="";
   skipBtn.style.opacity="0.9";
  }else{
   nextBtn.textContent="Next →";
   skipBtn.textContent="SKIP TO TEST";
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
// 7-step walkthrough: Probe → Targets → Rule → Tap Match → React Fast!
//  then Personal Baseline, then Profile Scheduler.
// Each step shows mini trial screen (22% opacity) in background where useful.
// Appears after Pattern Refresher, before S-PFS page.
// Skip to Test button is available on every step.
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
function applyRelativeDay(baseDate, dayTag){
 const d = new Date(baseDate);
 if(!isFinite(d.getTime())) return null;
 const tag = String(dayTag||"today").trim().toLowerCase();
 if(tag==="yesterday") d.setDate(d.getDate()-1);
 return d;
}
function deriveWakeDateTimeIso(wakeTime, testIso, wakeDayTag="today"){
 const wakeMins = parseSleepTimeToMinutes(wakeTime);
 if(wakeMins==null || !testIso) return null;
 const testDate = new Date(testIso);
 if(!isFinite(testDate.getTime())) return null;
 const wakeDate = applyRelativeDay(testDate, wakeDayTag);
 if(!wakeDate) return null;
 wakeDate.setHours(Math.floor(wakeMins/60), wakeMins%60, 0, 0);
 if(String(wakeDayTag||"today").toLowerCase()==="today" && wakeDate.getTime() > testDate.getTime()) return null;
 return wakeDate.toISOString();
}
function deriveSleepWindowForCurrentTest(bedTime, wakeTime, referenceIso, durationOverrideMinutes=null, bedDayTag="yesterday", wakeDayTag="today"){
 const computedDurationMinutes = computeSleepDurationMinutes(bedTime, wakeTime);
 const durationMinutes = durationOverrideMinutes!=null ? durationOverrideMinutes : computedDurationMinutes;
 const wakeIso = deriveWakeDateTimeIso(wakeTime, referenceIso, wakeDayTag);
 if(durationMinutes==null || !wakeIso) return null;
 const wakeDate = new Date(wakeIso);
 if(!isFinite(wakeDate.getTime())) return null;
 let bedDate = applyRelativeDay(wakeDate, bedDayTag);
 if(!bedDate) return null;
 const bedMins = parseSleepTimeToMinutes(bedTime);
 if(bedMins==null) return null;
 bedDate.setHours(Math.floor(bedMins/60), bedMins%60, 0, 0);
 // No silent auto-correction here; validation/UI handling should surface bed/wake mismatches.
 const referenceDate = new Date(referenceIso || Date.now());
 if(!isFinite(referenceDate.getTime())) return null;
 return { bedDate, wakeDate, durationMinutes, computedDurationMinutes, referenceDate, usedDurationOverride: durationOverrideMinutes!=null, bedDayTag, wakeDayTag };
}
function validateSleepWindowForCurrentTest(bedTime, wakeTime, referenceIso, durationOverrideMinutes=null, bedDayTag="yesterday", wakeDayTag="today"){
 const window = deriveSleepWindowForCurrentTest(bedTime, wakeTime, referenceIso, durationOverrideMinutes, bedDayTag, wakeDayTag);
 if(!window) return { ok:false, message:"Enter both sleep and wake times." };
 const { bedDate, wakeDate, durationMinutes, referenceDate } = window;
 if(durationMinutes < 10) return { ok:false, message:"Sleep duration is too short. Enter at least 10 minutes for a cat nap or correct the times." };
 if(durationMinutes > 16*60) return { ok:false, message:"Sleep duration looks too long. Please correct the times." };
 if(wakeDate.getTime() > referenceDate.getTime()) return { ok:false, message:"Wake time cannot be after the current test time." };
 // Do not require sleep start to be within 24 hours of the test.
 // Subjects in sleep-deprivation studies or real-world fatigue cases may
 // validly report being awake for more than 24 hours before testing.
 return { ok:true, window };
}
function minutesBetweenIso(fromIso, toIso){
 const a = Date.parse(fromIso||"");
 const b = Date.parse(toIso||"");
 if(!Number.isFinite(a) || !Number.isFinite(b) || b < a) return null;
 return Math.round((b - a)/60000);
}
function computeTimeSinceLastSleepMinutes(result){
 const wakeIso = result?.sleepLog?.lastWakeDateTimeIso || result?.sleepLog?.wakeDateTimeIso || null;
 return wakeIso ? minutesBetweenIso(wakeIso, result?.time) : null;
}
// getSessionSleptMinutes():
// Returns the duration of the ACTIVE sleep episode for this result.
// - YES session: duration from the newly entered sleep record
// - NO session with carry-forward: duration from the most recent actual sleep record
// - NO session with no prior sleep data: 0
// This function is shared by Summary and Speedometer so both views stay aligned.
function getSessionSleptMinutes(result){
 const d = result?.sleepLog?.durationMinutes;
 return d!=null ? Number(d) : (result?.sleepSinceLastTest === "no" ? 0 : null);
}
function formatTimeSinceLastSleepLine(result){
 const mins = computeTimeSinceLastSleepMinutes(result);
 if(mins==null) return null;
 return `Hours awake before test: ${formatElapsedDuration(mins)}`;
}
// formatSleepSummaryMetricsLine():
// Uses the active sleep episode semantics described above. On carried-forward NO
// sessions, "Total time asleep" intentionally refers to the most recent actual
// sleep episode, while "Total time awake" continues from that episode's wake time.
function formatSleepSummaryMetricsLine(result){
 const awakeMins = computeTimeSinceLastSleepMinutes(result);
 const sleptMins = getSessionSleptMinutes(result);
 const awakeText = awakeMins!=null ? formatElapsedDuration(awakeMins) : "—";
 const sleptText = sleptMins!=null ? formatSleepDuration(sleptMins) : "—";
 return `Sleep timing: Total time awake ${awakeText}   Total time asleep ${sleptText}   Sleep Quality: ${formatSleepQualityText(result)}`;
}
function computeSleepDurationMinutes(bed,wake){
 const b=parseSleepTimeToMinutes(bed), w=parseSleepTimeToMinutes(wake);
 if(b==null || w==null) return null;
 let d = w - b;
 if(d < 0) d += 24*60;
 return d;
}

function getSleepDurationOverrideMinutes(){
 const el=$("sleepDurationOverrideInput");
 if(!el) return null;
 const raw=String(el.value||"").trim();
 if(!raw) return null;
 const n=Number(raw);
 if(!Number.isFinite(n) || n < 0) return null;
 return Math.round(n);
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
// getLatestPriorSleepReference():
// Finds the most recent prior result for this subject that contains a usable
// sleep reference (wake time and/or duration). Used on the NO path so the app
// can keep reporting the last actual sleep episode until a later YES replaces it.
function getLatestPriorSleepReference(subjectId, beforeIso=null){
 if(!subjectId || !Array.isArray(state.history)) return null;
 const cutoff = beforeIso ? Date.parse(beforeIso) : Number.POSITIVE_INFINITY;
 let best = null;
 for(const r of state.history){
  if(!r || String(r.subjectId||"") !== String(subjectId)) continue;
  const t = Date.parse(r.time||"");
  if(!Number.isFinite(t) || t >= cutoff) continue;
  const sl = r.sleepLog || null;
  const hasWake = !!(sl && (sl.wakeDateTimeIso || sl.lastWakeDateTimeIso));
  const hasDuration = !!(sl && Number.isFinite(Number(sl.durationMinutes)));
  if(!hasWake && !hasDuration) continue;
  if(!best || Date.parse(best.time||"") < t) best = r;
 }
 return best ? JSON.parse(JSON.stringify(best.sleepLog||null)) : null;
}
function getPreviousSameSubjectResult(result){
 if(!result || !result.subjectId || !Array.isArray(state.history)) return null;
 const currentTime = Date.parse(result.time||"");
 if(!Number.isFinite(currentTime)) return null;
 let prev = null;
 for(const r of state.history){
  if(!r || r===result) continue;
  if(String(r.subjectId||"") !== String(result.subjectId||"")) continue;
  const t = Date.parse(r.time||"");
  if(!Number.isFinite(t) || t >= currentTime) continue;
  if(!prev || Date.parse(prev.time||"") < t) prev = r;
 }
 return prev;
}
function getTimeSinceLastTestMinutes(result){
 const prev = getPreviousSameSubjectResult(result);
 if(!prev) return null;
 const currentTime = Date.parse(result.time||"");
 const prevTime = Date.parse(prev.time||"");
 if(!Number.isFinite(currentTime) || !Number.isFinite(prevTime) || currentTime < prevTime) return null;
 return Math.round((currentTime - prevTime)/60000);
}
// formatTimeSinceLastTestLine():
// Shows elapsed time since the prior test for this subject.
// For the first test, returns null so the line is omitted rather than implying 0h 0m.
function formatTimeSinceLastTestLine(result){
 const mins = getTimeSinceLastTestMinutes(result);
 if(mins==null) return null;
 return `Since last test: Total time since last test ${formatElapsedDuration(mins)}`;
}
function formatSleepLine(result){
 const slept = result?.sleepSinceLastTest;
 const sl = result?.sleepLog || null;
 if(slept==="yes"){
  const bed = formatClockForDisplay(sl?.bedtime || null);
  const wake = formatClockForDisplay(sl?.wakeTime || null);
  const bedTag = formatSleepDayTag(sl?.bedDayTag);
  const wakeTag = formatSleepDayTag(sl?.wakeDayTag);
  return `Bed ${bed}${bedTag ? ` (${bedTag})` : ""} → Wake ${wake}${wakeTag ? ` (${wakeTag})` : ""}`;
 }
 if(slept==="no"){
  const wakeIso = sl?.lastWakeDateTimeIso || sl?.wakeDateTimeIso || null;
  const wakePart = wakeIso ? `Last wake: ${new Date(wakeIso).toLocaleString()}` : "No sleep before this test";
  return wakePart;
 }
 return "Sleep: Not entered";
}

function updateSleepLoggerUI(){
 const bed=getSleepInputCanonicalValue("sleepBedtimeInput");
 const wake=getSleepInputCanonicalValue("sleepWakeInput");
 const overrideMinutes=getSleepDurationOverrideMinutes();
 const d=overrideMinutes!=null ? overrideMinutes : computeSleepDurationMinutes(bed,wake);
 const box=$("sleepDurationBox");
 const warn=$("sleepWarnBox");
 if(box) box.textContent = `Sleep duration: ${formatSleepDuration(d)}`;
 if(warn){
  const validation = (bed && wake) ? validateSleepWindowForCurrentTest(bed, wake, new Date().toISOString(), overrideMinutes) : null;
  const basicUnusual = (d!=null && (d < 10 || d > 16*60));
  const qualityScore = state.sleepLog && Number.isFinite(Number(state.sleepLog.qualityScore)) ? Number(state.sleepLog.qualityScore) : null;
  const missingQuality = !!(bed && wake && qualityScore==null);
  const shouldWarn = basicUnusual || (validation && !validation.ok) || missingQuality;
  warn.style.display = shouldWarn ? "block" : "none";
  if(shouldWarn){
   warn.textContent =
    validation && !validation.ok ? validation.message :
    (missingQuality ? "Select Sleep Quality before continuing." :
    "This sleep duration looks unusual. Please check hour and AM/PM selections.");
  }
 }
}
function setSleepQuality(score){
 state.sleepLog = state.sleepLog || {};
 state.sleepLog.qualityScore = score;
 state.sleepLog.qualityLabel = score===1 ? "Poor" : score===2 ? "Restless" : score===3 ? "Good" : null;
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
// - read the active entry mode (12-hour structured fields or 24-hour input)
// - keep canonical HH:MM values for bedtime and wake time
// - carry the separate Yesterday/Today day markers for both entries
// - validate the full sleep window against the current test date/time
// - compute durationMinutes from the validated window or the optional override
// - save bedDateTimeIso / wakeDateTimeIso so Results can compute hours awake
//   from the current test's recorded wake entry only
// continueFromSleepLogger():
// - validates the newly entered sleep window against the current test time
// - requires Sleep Quality whenever new sleep data is entered
// - on success, saves a NEW active sleep episode on state.sleepLog
// - this replaces any earlier carried-forward sleep reference for subsequent results
function continueFromSleepLogger(){
 const bed=getSleepInputCanonicalValue("sleepBedtimeInput");
 const wake=getSleepInputCanonicalValue("sleepWakeInput");
 const durationOverrideMinutes=getSleepDurationOverrideMinutes();
 const bedDay = String($("sleepBedDaySelect")?.value||"yesterday");
 const wakeDay = String($("sleepWakeDaySelect")?.value||"today");
 const qualityScore = state.sleepLog && Number.isFinite(Number(state.sleepLog.qualityScore)) ? Number(state.sleepLog.qualityScore) : null;
 const validation = validateSleepWindowForCurrentTest(bed, wake, new Date().toISOString(), durationOverrideMinutes, bedDay, wakeDay);
 if(!validation.ok){
  setStatus(validation.message);
  const warn=$("sleepWarnBox");
  if(warn){ warn.style.display = "block"; warn.textContent = validation.message; }
  return;
 }
 if(qualityScore==null){
  const msg = "Select Sleep Quality before continuing.";
  setStatus(msg);
  const warn=$("sleepWarnBox");
  if(warn){ warn.style.display = "block"; warn.textContent = msg; }
  return;
 }
 state.sleepSinceLastTest = "yes";
 state.sleepLog = state.sleepLog || {};
 const duration=validation.window.durationMinutes;
 state.sleepLog.bedtime = bed || null;
 state.sleepLog.wakeTime = wake || null;
 state.sleepLog.durationMinutes = duration;
 state.sleepLog.durationOverrideMinutes = durationOverrideMinutes!=null ? durationOverrideMinutes : null;
 state.sleepLog.bedDayTag = bedDay;
 state.sleepLog.wakeDayTag = wakeDay;
 state.sleepLog.bedDateTimeIso = validation.window.bedDate.toISOString();
 state.sleepLog.wakeDateTimeIso = validation.window.wakeDate.toISOString();
 showFatigueOverlay();
}

// Sleep Logger model:
// 1) The sleep prompt wording depends on subject history:
//    - first test for this subject: "Have you slept before this test?"
//    - later tests: "Have you slept since LAST TEST?"
// 2) YES means the subject reports a NEW sleep episode before the current test.
//    The Sleep Logger must be completed, including required Sleep Quality.
//    That new sleep entry REPLACES the prior sleep reference.
// 3) NO means no new sleep occurred since the prior test.
//    The most recent ACTUAL sleep episode remains the active reference and is
//    carried forward into results/CSV until a later YES replaces it.
// 4) Result semantics:
//    - Total time asleep = duration of the active sleep episode
//    - Total time awake  = current test time minus the active wake time
//    - Time since last test = elapsed time since the prior test for this subject
function hasPriorTestForCurrentSubject(){
 const sid = subjectKey(state.subjectId||"0");
 if(!sid || !Array.isArray(state.history)) return false;
 return state.history.some(r=>r && String(r.subjectId||"")===String(sid));
}
function getSleepPromptQuestionText(){
 return hasPriorTestForCurrentSubject()
  ? "Have you slept since LAST TEST?"
  : "Have you slept before this test?";
}
function updateSleepPromptQuestion(){
 const el = $("sleepPromptQuestion");
 if(!el) return;
 el.textContent = getSleepPromptQuestionText();
}
// showSleepPrompt():
// - resets transient pre-test entry state for the CURRENT flow
// - refreshes the dynamic question wording from subject history
// - does not alter saved history; first-vs-later wording comes from prior results
function showSleepPrompt(){
 resetPretestEntryState();
 updateSleepPromptQuestion();
 showOnly("sleepPromptOverlay");
}

function showTutorial(){
 tutFillPatterns();
 _tutStep = 0;
 $("tutorialOverlay").classList.remove("hidden");
 tutSetStep(0);
}

function tutNext(){
 if(_tutStep < TUT_STEPS.length - 1){
  tutSetStep(_tutStep + 1);
  return;
 }
 $("tutorialOverlay").classList.add("hidden");
 showOnly("tutorialExitOverlay");
}

function tutBack(){
 if(_tutStep > 0) tutSetStep(_tutStep - 1);
}

function tutSkip(){
 $("tutorialOverlay").classList.add("hidden");
 showOnly("tutorialExitOverlay");
}

// ─── Event wiring ───
$("subjectNextBtn").onclick=()=>{
 const v=($("subjectIdInput")?.value||"").trim().toLowerCase();
 if(!v){ setStatus("Enter your email address"); return; }
 const isGuestCandidate = (v==="0"||v==="guest");
 if(!isGuestCandidate && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){
  setStatus("Please enter a valid email address"); return;
 }
 if(!enforceSingleUserDevicePolicy(v)) return;
 if(isGuestCandidate){
  state.subjectId="Guest"; state.profile=null;
  stopSchedulerTimers();
  schedulerState.activeSubjectId = "";
  schedulerState.settings = structuredClone(DEFAULT_SCHEDULER_SETTINGS);
  showRefresher(); setStatus("Continuing as Guest"); return;
 }
 $("subjectIdInput").value=v;
 // If profile already saved for this email → skip profile page
 const saved=loadProfile();
 if(saved&&saved.email===v){
  state.subjectId=v; state.profile=saved;
  applyProfileSettings(saved);
  schedulerResumeForCurrentProfile();
  showRefresher(); setStatus("Welcome back, "+v);
 } else {
  // New user or different email → collect profile
  openProfileOverlay(v);
 }
};
$("profileTestType")?.addEventListener("change", e=>applyUnifiedProfileTestType(e.currentTarget.value));
$("profileResearchUploadEnabled")?.addEventListener("change", e=>{
 const on=!!e.currentTarget.checked;
 const anon=$("profileResearchAnonymousId");
 if(on && anon && !String(anon.value||"").trim()) anon.value = `RID-${Date.now().toString(36).toUpperCase()}`;
 setStatus(on ? "Anonymous research upload enabled for future verified upload builds." : "Anonymous research upload disabled.");
});
$("profileResearchAnonymousId")?.addEventListener("change", ()=>setStatus("Research anonymous ID updated."));
$("skipRefresherBtn").onclick=()=>{
 showTutorial(); setStatus("Tutorial");
};
$("tutBackBtn").onclick=()=>tutBack();
$("refBackBtn").onclick=()=>goToStartPage();
 try{ updateStartPageLinks(); }catch(e){}

$("fatigueBackBtn").onclick=()=>{ if(state.sleepSinceLastTest==="yes") showOnly("sleepOverlay"); else showSleepPrompt(); };

$("sleepPromptYesBtn").onclick=()=>{
 state.sleepSinceLastTest="yes";
 showSleepLogger();
 setStatus(`${getSleepPromptQuestionText()} Yes`);
};
$("sleepPromptNoBtn").onclick=()=>{
 state.sleepSinceLastTest="no";
 const priorSleep = getLatestPriorSleepReference(subjectKey(state.subjectId||"0"));
 state.sleepLog = priorSleep || null;
 startTest();
 setStatus(`${getSleepPromptQuestionText()} No`);
};

$("sleepBedtimeInput").addEventListener("input", (e)=>{ syncSleepInputCanonical(e.currentTarget); updateSleepLoggerUI(); });
$("sleepWakeInput").addEventListener("input", (e)=>{ syncSleepInputCanonical(e.currentTarget); updateSleepLoggerUI(); });
$("sleepBedDaySelect")?.addEventListener("change", ()=>updateSleepLoggerUI());
$("sleepWakeDaySelect")?.addEventListener("change", ()=>updateSleepLoggerUI());
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
$("sleepBackBtn").onclick=()=>showSleepPrompt();

$("sleepPromptBackBtn").onclick=()=>goToStartPage();

const _fsb=$("fatigueStartBtn");
if(_fsb) _fsb.onclick=startTest;
let _adminUnlocked = false;
// _adminReturnTo: tracks which page opened admin so Close returns there.
let _adminReturnTo = "subjectOverlay"; // default return destination
const ADMIN_UNLOCK_REV_KEY = `${STORAGE_PREFIX}_admin_unlock_rev`;
function loadAdminUnlockForCurrentRev(){
 try{
  _adminUnlocked = localStorage.getItem(ADMIN_UNLOCK_REV_KEY) === APP_REV_STAMP;
 }catch(e){
  _adminUnlocked = false;
 }
}
function persistAdminUnlockForCurrentRev(unlocked){
 _adminUnlocked = !!unlocked;
 try{
  if(_adminUnlocked) localStorage.setItem(ADMIN_UNLOCK_REV_KEY, APP_REV_STAMP);
  else localStorage.removeItem(ADMIN_UNLOCK_REV_KEY);
 }catch(e){}
}
loadAdminUnlockForCurrentRev();
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
const _pt12=$("profileTime12Btn"); if(_pt12){
 _pt12.onclick=(e)=>{ if(e) e.preventDefault(); flashSchedulerControl("profileTime12Btn"); profileSelectTimeFormat("12"); };
 _pt12.addEventListener("pointerdown", ()=>flashSchedulerControl("profileTime12Btn"), {passive:true});
}
const _pt24=$("profileTime24Btn"); if(_pt24){
 _pt24.onclick=(e)=>{ if(e) e.preventDefault(); flashSchedulerControl("profileTime24Btn"); profileSelectTimeFormat("24"); };
 _pt24.addEventListener("pointerdown", ()=>flashSchedulerControl("profileTime24Btn"), {passive:true});
};
// Age validation on input change
const _pbm=$("profileBirthMonth"); if(_pbm){ _pbm.onchange=()=>{ validateProfileAge(); flashSchedulerControl("profileBirthMonth"); }; _pbm.addEventListener("pointerdown", ()=>flashSchedulerControl("profileBirthMonth"), {passive:true}); }
const _pby=$("profileBirthYear"); if(_pby){ _pby.oninput=()=>{ validateProfileAge(); flashSchedulerControl("profileBirthYear"); }; _pby.addEventListener("pointerdown", ()=>flashSchedulerControl("profileBirthYear"), {passive:true}); }

// Scheduler controls on the asterisk / Profile page
const _seo=$("schedulerEnabledOn"); if(_seo) _seo.onclick=(e)=>{ if(e) e.preventDefault(); if(!schedulerState.activeSubjectId){ setStatus("Registered user required for Scheduler"); return; } schedulerSetEnabled(true); };
const _seoff=$("schedulerEnabledOff"); if(_seoff) _seoff.onclick=(e)=>{ if(e) e.preventDefault(); schedulerSetEnabled(false); };
const _sta=$("scheduleTypeAnytime"); if(_sta) _sta.onclick=(e)=>{ if(e) e.preventDefault(); schedulerSetType("anytime"); };
const _stp=$("scheduleTypePersonal"); if(_stp) _stp.onclick=(e)=>{ if(e) e.preventDefault(); if(!schedulerState.settings.enabled) schedulerSetEnabled(true); schedulerSetType("personal"); };
const _stf=$("scheduleTypeFitDuty"); if(_stf) _stf.onclick=(e)=>{ if(e) e.preventDefault(); if(!schedulerState.settings.enabled) schedulerSetEnabled(true); schedulerSetType("fit_duty"); };
const _pmi=$("personalModeInterval"); if(_pmi) _pmi.onclick=(e)=>{ if(e) e.preventDefault(); schedulerSetPersonalMode("interval"); };
const _pmd=$("personalModeDailyTimes"); if(_pmd) _pmd.onclick=(e)=>{ if(e) e.preventDefault(); schedulerSetPersonalMode("daily_times"); };
["personalIntervalHoursInput","personalWindowStartInput","personalWindowEndInput","fitDutyMinIntervalInput","fitDutyDefaultIntervalInput","fitDutyMaxIntervalInput","schedulerAlertSoundSelect","schedulerQuietStartInput","schedulerQuietEndInput"].forEach(id=>{ const el=$(id); if(el){ el.oninput=onSchedulerUiChanged; el.onchange=onSchedulerUiChanged; } });
["fitDutyValidOnlyToggle","fitDutyIgnoreIncompleteToggle","schedulerVoiceEnabledToggle","schedulerRepeatOnceToggle","schedulerQuietHoursToggle","personalTime1Enabled","personalTime2Enabled","personalTime3Enabled","personalTime4Enabled","personalTime5Enabled","personalTime6Enabled"].forEach(id=>{ const el=$(id); if(el) el.onchange=onSchedulerUiChanged; });
["personalTime1Input","personalTime2Input","personalTime3Input","personalTime4Input","personalTime5Input","personalTime6Input"].forEach(id=>{ const el=$(id); if(el){ el.oninput=onSchedulerUiChanged; el.onchange=onSchedulerUiChanged; } });
const _sts=$("schedulerTestSaveBtn"); if(_sts) _sts.onclick=onSchedulerTestSave;
const _stxt=$("schedulerTestTextBtn"); if(_stxt) _stxt.onclick=onSchedulerTestText;
const _ssnd=$("schedulerTestSoundBtn"); if(_ssnd) _ssnd.onclick=onSchedulerTestSound;
const _ssnda=$("schedulerTestSoundAlertBtn"); if(_ssnda) _ssnda.onclick=onSchedulerTestSound;
const _sv=$("schedulerTestVoiceBtn"); if(_sv) _sv.onclick=onSchedulerTestVoice;
const _sva=$("schedulerTestVoiceAlertBtn"); if(_sva) _sva.onclick=onSchedulerTestVoice;
const _snt=$("schedulerTestNotificationBtn"); if(_snt) _snt.onclick=onSchedulerTestNotification;
const _sbg=$("schedulerBackgroundTestBtn"); if(_sbg) _sbg.onclick=onSchedulerBackgroundTest;
const _srs=$("schedulerRefreshStatusBtn"); if(_srs) _srs.onclick=()=>{ maybeFinishBackgroundTest(); refreshSchedulerStatus(); refreshSchedulerDeviceStatus(); setStatus("Scheduler status refreshed"); };
const _scs=$("schedulerClearStatusBtn"); if(_scs) _scs.onclick=clearSchedulerReminderStatus;
const _sss=$("schedulerSaveSettingsBtn"); if(_sss) _sss.onclick=onSchedulerSaveSettings;
const _srd=$("schedulerRefreshDeviceTestBtn"); if(_srd) _srd.onclick=()=>{ maybeFinishBackgroundTest(); refreshSchedulerDeviceStatus(); setStatus("Device test refreshed"); };
const _srsb=$("schedulerReminderStartBtn"); if(_srsb) _srsb.onclick=()=>startMode2FromSchedulerReminder();
const _ssnb=$("schedulerReminderSnoozeBtn"); if(_ssnb) _ssnb.onclick=()=>snoozeSchedulerReminder();
const _sskpb=$("schedulerReminderSkipBtn"); if(_sskpb) _sskpb.onclick=()=>skipSchedulerReminder();
bindSchedulerPressFeedback();

// Welcome back — pre-fill email if profile exists
(()=>{
 const p=loadProfile();
 if(p&&p.email){
  const inp=$("subjectIdInput"); if(inp) inp.value=p.email;
  const wl=$("subjectWelcome"); if(wl) wl.style.display="block";
  const we=$("welcomeEmail"); if(we) we.textContent=p.email;
  const hint=$("subjectHint"); if(hint) hint.textContent="";
 }
 schedulerResumeForCurrentProfile();
})();
refreshSchedulerDeviceStatus();
window.addEventListener("focus", ()=>{ maybeFinishBackgroundTest(); refreshSchedulerDeviceStatus(); });
// Rev 70: visibilitychange listener consolidated at end of file to avoid duplicate registration.
$("tutSkipBtn").onclick=()=>tutSkip();
$("unlockBtn").onclick=()=>{
 const v=$("adminPass").value;
 if(v===settings.adminPasscode){
  persistAdminUnlockForCurrentRev(true);
  $("adminGate").classList.add("hidden"); $("adminBody").classList.remove("hidden"); renderAdmin(); setStatus("Admin unlocked for this revision");
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
// Speedometer session list is sorted newest-first. Therefore Prev moves to an older session
// (higher selectedIndex) and Next moves to a newer session (lower selectedIndex).
const _spprev=$("speedometerPrevBtn"); if(_spprev) _spprev.onclick=()=>{ const s=$("speedometerSessionSelect"); if(!s||!s.options.length) return; s.selectedIndex=Math.min(s.options.length-1, s.selectedIndex+1); if(s.onchange) s.onchange(); };
const _spnext=$("speedometerNextBtn"); if(_spnext) _spnext.onclick=()=>{ const s=$("speedometerSessionSelect"); if(!s||!s.options.length) return; s.selectedIndex=Math.max(0, s.selectedIndex-1); if(s.onchange) s.onchange(); };
// V699rev137: CPI/CPA toggle button removed — Mode 2 now shows both needles
// simultaneously. The old _spm4 handler has been deleted.
const _sactsel=$("speedometerActionSelect"); if(_sactsel) _sactsel.onchange=()=>openSpeedometerMenuSelection();
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
window.cogspeedDeregisterServiceWorkers=cogspeedDeregisterServiceWorkers;
window.cogspeedClearCachesOnly=cogspeedClearCachesOnly;
window.cogspeedDevReset=cogspeedDevReset;

// ─── Init ───
modeLabel.textContent="Subject mode";
renderFatigueChecklist();
renderRefresher();
updateMetrics();
clearTransientCurrentSessionState();
state.history = loadPersistedHistory();

initIntroAutoAdvance(); // app.js loads with defer so DOMContentLoaded has already fired; introGif.complete also handles the cached-GIF case where load fired before the listener attached, so restart() is called directly and auto-advance still starts.

if ("serviceWorker" in navigator) {
 window.addEventListener("load", async () => {
  ensureUpdateBanner();
  try{
   const reg = await navigator.serviceWorker.register(`./sw.js?v=${RELEASE}`);
   // Service worker registered
   const captureWaiting = ()=>{
    if(reg.waiting){
     cogspeedWaitingRegistration = reg;
     cogspeedUpdateBannerDismissed = false;
     refreshUpdateBannerVisibility();
    }
   };
   captureWaiting();
   reg.addEventListener('updatefound', ()=>{
    const installing = reg.installing;
    if(!installing) return;
    installing.addEventListener('statechange', ()=>{
     if(installing.state === 'installed' && navigator.serviceWorker.controller){
      cogspeedWaitingRegistration = reg;
      cogspeedUpdateBannerDismissed = false;
      refreshUpdateBannerVisibility();
     }
    });
   });
   navigator.serviceWorker.addEventListener('controllerchange', ()=>{
    cogspeedWaitingRegistration = null;
    refreshUpdateBannerVisibility();
    if(cogspeedPendingControllerReload){
     cogspeedPendingControllerReload = false;
     window.location.reload();
    }
   });
  }catch(err){
   console.warn("Service worker registration failed:", err);
  }
  try{ updateStartPageLinks(); }catch(err){}
  try{ wireEmailSelectControls(); }catch(err){}
  try{ wireEmailDraftAction(); }catch(err){}
  try{ syncEditableEmailRecipient(); }catch(err){}
  try{ wireResponseGraphControls(); }catch(err){}
  try{ refreshUpdateBannerVisibility(); }catch(err){}
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
 ctx.fillText(`S-PFS ${value!=null ? value : "—"}`, W/2, Math.round(H*0.90));
}

function renderSpfGaugeForResult(result){
 const canvas = $("spfGaugeCanvas");
 if(!canvas) return;
 const spf = result && result.samnPerelli && result.samnPerelli.score!=null ? Number(result.samnPerelli.score) : null;
 drawSpfGauge(canvas, spf);
}

function getSleepQualityBadge(result){
 const label = String(result?.sleepLog?.qualityLabel || "").trim();
 const score = result?.sleepLog?.qualityScore!=null ? Number(result.sleepLog.qualityScore) : null;
 const key = label.toLowerCase();
 if(key==="poor") return {icon:"😵‍💫", color:"#d9514e", text:"Poor", score};
 if(key==="restless") return {icon:"🥱", color:"#f1c14b", text:"Restless", score};
 if(key==="good") return {icon:"😴", color:"#72d572", text:"Good", score};
 if(result?.sleepSinceLastTest==="no") return {icon:"—", color:"#9fb4c8", text:"No sleep", score:null};
 return {icon:"—", color:"#9fb4c8", text:"—", score:null};
}
function formatSleepQualityText(result){
 const q = getSleepQualityBadge(result);
 return q.score!=null && q.text && q.text!=="—" ? `${q.text} (${q.score}/3)` : q.text;
}
function formatSleepDayTag(tag){
 const t = String(tag||"").trim().toLowerCase();
 if(t==="yesterday") return "Yesterday";
 if(t==="today") return "Today";
 return t ? t.charAt(0).toUpperCase()+t.slice(1) : "";
}

function renderSpeedometerSleepMetrics(result){
 const wrap = $("speedometerSleepMetrics");
 if(!wrap) return;
 const awakeMins = computeTimeSinceLastSleepMinutes(result);
 const sleptMins = getSessionSleptMinutes(result);
 const quality = getSleepQualityBadge(result);
 const awakeText = awakeMins!=null ? formatElapsedDuration(awakeMins) : "—";
 const sleptText = sleptMins!=null ? formatSleepDuration(sleptMins) : "—";
 const qualityText = formatSleepQualityText(result);
 wrap.innerHTML = `
  <div class="summary-card">
    <div class="summary-card-label">Since last waking</div>
    <div class="summary-card-val" style="font-size:18px">Total hours awake ${awakeText}</div>
  </div>
  <div class="summary-card">
    <div class="summary-card-label">Most recent sleep</div>
    <div class="summary-card-val" style="font-size:18px;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap">
      <span>Total hours last slept ${sleptText}</span>
      <span style="display:inline-flex;align-items:center;gap:6px;color:${quality.color};font-size:18px;font-weight:800">
        <span aria-hidden="true" style="font-size:20px;line-height:1">${quality.icon}</span>
        <span>Sleep Quality: ${qualityText}</span>
      </span>
    </div>
  </div>`;
}

// Rev 39: returns the combined grouped disposition text with the S-PFS tier in
// parentheses — e.g. "GREEN — Clear for duty (S-PFS 6)". The grouping half
// matches the speedometer dial's 4-color arc regions; the S-PFS tier matches
// the same 7-tier edges used by computeDisposition() and the main summary's
// "S-PFS N — caption" line. Using both halves here keeps the speedometer's
// Disposition box consistent with both the color arc and the saved summary/CSV.
function getMode2DispositionWindowText(result){
 // MODE 2 ONLY:
 // Disposition is an operational recommendation derived from CPA, not CPI.
 // The Speedometer disposition window intentionally does NOT display S-PFS text
 // because visible S-PFS and visible CPA/Disposition can otherwise disagree and
 // confuse the operator.
 //
 // Safety override rule:
 // - If pre-test S-PFS is 1 or 2, force RED regardless of CPA
 // - If pre-test S-PFS is 3, force ORANGE regardless of CPA
 // - Otherwise use CPA bands only
 //   GREEN  = CPA >= 62.5
 //   YELLOW = CPA >= 37.5 and < 62.5
 //   ORANGE = CPA >= 18 and < 37.5
 //   RED    = CPA < 18
 //
 // Modes 1, 3, and 4 must not use this Disposition window.
 if(!result) return "—";
 const spfs = Number(result?.samnPerelli?.score);
 if(spfs === 1 || spfs === 2) return "RED — Remove from Hazardous Duty";
 if(spfs === 3) return "ORANGE — Human review required";

 const cpa = Number(result?.cpa);
 if(!Number.isFinite(cpa)) return "—";
 if(cpa >= 62.5) return "GREEN — Clear for duty";
 if(cpa >= 37.5) return "YELLOW — Monitor / human review recommended";
 if(cpa >= 18) return "ORANGE — Human review required";
 return "RED — Remove from Hazardous Duty";
}


function getMode2SpeedometerMetric(result, success){
 // V699rev137: Mode 2 Speedometer is now a fixed dual-needle layout — no
 // CPI/CPA toggle and no separate MBS window in the metric-boxes row.
 //   • Primary needle   = CPI (solid filled spear, dark)
 //   • Secondary needle = CPA (hollow outlined spear, blue)
 //   • On-dial window   = MBS (unchanged from Modes 1/3/4)
 //   • Outer ring       = self-reported pre-test S-PFS label in band color
 //   • Boxes row        = Disposition only
 // Modes 1/3/4 never call this path.
 const mbs = Number(result && (result.mode2AdaptiveMbsMs!=null ? result.mode2AdaptiveMbsMs : result.averageLast2BlockingScoresMs));
 const cpi = Number.isFinite(mbs) ? computeCPI(mbs) : (Number.isFinite(Number(result && result.cognitivePerformanceIndex)) ? Number(result.cognitivePerformanceIndex) : null);
 const cpa = Number(result && result.cpa);
 // On a failed test the dial needles animate to 0 and the outcome text reads
 // "Test Failed" / "Dead" — the Disposition box must not contradict that by
 // continuing to show the last-computed value. Force displayed text to "—".
 const failed = success === false;
 const dispositionText = failed ? "—" : getMode2DispositionWindowText(result);
 const mbsText = failed ? "—" : (Number.isFinite(mbs)?`${Number(mbs).toFixed(1)} ms`:"—");
 return {
  // The dial is driven by CPI (primary needle). CPA is shown as the secondary
  // needle. Disposition text lives in the single box below the dial.
  // V699rev141: cpiValue and cpaValue are nulled on failure so callers that
  // read them (e.g. the secondary-needle value lookup) never draw a stale
  // needle on a failed test.
  score: failed ? 0 : (Number.isFinite(cpi)?Math.max(0,Math.min(100,cpi)):0),
  scoreLabel: "CPI",
  mbsText,
  cpiValue: failed ? null : (Number.isFinite(cpi) ? cpi : null),
  cpaValue: failed ? null : (Number.isFinite(cpa) ? cpa : null),
  boxes: [
   {label:"Disposition", value:dispositionText}
  ]
 };
}

function renderMode2SpeedometerBoxes(metric){
 const wrap = $("speedometerMode2Metrics");
 if(!wrap) return;
 const boxes = metric && Array.isArray(metric.boxes) ? metric.boxes : [];
 if(!boxes.length){ wrap.innerHTML=""; wrap.classList.add("hidden"); return; }
 wrap.classList.remove("hidden");
 wrap.style.display = "grid";
 // V699rev137: Mode 2 now emits a single "Disposition" box. Collapse the grid
 // to one column in that case so the card stretches the full width and no
 // empty phantom column appears beside it.
 wrap.style.gridTemplateColumns = boxes.length === 1 ? "1fr" : "1fr 1fr";
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
 // Survival fail-safe: any failed Survival test or any Survival outcome in the
 // "Dead" band forces cps to 0 regardless of stored CPI. Previously only the
 // "Dead" text-label path triggered this, which missed failures whose stored
 // CPI happened to land in a higher outcome band (Dying/Crippled/Wounded).
 if(isResultSurvivalChallenge(result) && (!success || getSurvivalOutcomeText(result)==="Dead")) cps = 0;
 let mbs = result && result.averageLast2BlockingScoresMs!=null ? result.averageLast2BlockingScoresMs : null;
 let scoreLabel = "CPI";
 let metricLabel = "MBS";
 let metricValueText = null;
 let mode2MetricBoxes = null;
 let speedoOpts = null;
 const isMode2Speedometer = !!(result && result.testMode==="mode2");
 if(isMode2Speedometer){
  if(result && result.mode2Triggered && result.cpa==null) Object.assign(result, computeMode2CPA(result));
  if(result && (result.dispositionCode==null || result.dispositionLabel==null || /^(GREEN|YELLOW|ORANGE|RED)$/i.test(String(result.dispositionCode||"")))) Object.assign(result, computeDisposition(result));
  const mode2Metric = getMode2SpeedometerMetric(result, success);
  cps = success ? mode2Metric.score : 0;
  if(success){
   mbs = Number(result && (result.mode2AdaptiveMbsMs!=null ? result.mode2AdaptiveMbsMs : result.averageLast2BlockingScoresMs));
   metricLabel = "MBS";
   metricValueText = mode2Metric.mbsText || (Number.isFinite(mbs)?`${Number(mbs).toFixed(1)} ms`:null);
   if(!Number.isFinite(mbs)) mbs = null;
  }else{
   mbs = null;
   metricLabel = "MBS";
   metricValueText = null;
  }
  scoreLabel = mode2Metric.scoreLabel;
  mode2MetricBoxes = mode2Metric.boxes || null;
  // V699rev137: Mode 2 now renders a fixed dual-needle layout — primary =
  // CPI (solid filled spear, dark), secondary = CPA (hollow outlined spear,
  // blue). The two shapes are distinguishable beyond color alone so the
  // display remains legible for colorblind users and in grayscale output.
  // (V699rev141 cleanup: removed the unused local `cpiNeedle` — the primary
  // needle is driven by `cps` above, not a separate opts entry.)
  const cpaNeedle = Number.isFinite(Number(mode2Metric.cpaValue)) ? Number(mode2Metric.cpaValue) : Number(result && result.cpa);
  speedoOpts = speedoOpts || {};
  if(success && Number.isFinite(cpaNeedle)){
   speedoOpts.secondaryNeedle = { value: cpaNeedle, color: "#2d6cdf" };
  }
  // Outer-ring S-PFS band label — self-reported pre-test S-PFS (1–7), NOT
  // the computed disposition tier. Rendered in the band color matching the
  // value so the color and number reinforce each other.
  const spfsSelf = Number(result && result.samnPerelli && result.samnPerelli.score);
  if(Number.isFinite(spfsSelf) && spfsSelf>=1 && spfsSelf<=7){
   speedoOpts.spfsOuterLabel = { spfs: Math.round(spfsSelf) };
  }
 }

 if(result && result.testMode==="mode3"){
  scoreLabel = "CPI";
  metricLabel = "Average Self-paced RT";
  metricValueText = result && result.selfPacedResponseMeanMs!=null
   ? `${Number(result.selfPacedResponseMeanMs).toFixed(1)} ms`
   : null;
  mbs = result && result.selfPacedResponseMeanMs!=null ? Number(result.selfPacedResponseMeanMs) : null;
 }

 if(result && result.testMode==="mode4"){
  scoreLabel = "CPI";
  const avgRt = result && result.pacedResponseMeanMs!=null ? Number(result.pacedResponseMeanMs) : null;
  const pacedRate = result && result.fixedPacedBaselineMs!=null ? Number(result.fixedPacedBaselineMs) : null;
  metricLabel = "Average Machine-Paced RT";
  metricValueText = avgRt!=null
   ? `${avgRt.toFixed(1)} ms${pacedRate!=null ? ` • Rate ${pacedRate.toFixed(1)} ms` : ""}`
   : (pacedRate!=null ? `Rate ${pacedRate.toFixed(1)} ms` : null);
  mbs = avgRt!=null ? avgRt : pacedRate;
 }

 const wrap = $("speedometerWrap");
 if(wrap) canvas.style.width = wrap.offsetWidth + "px";
 const latestIdx = getLatestHistoryIndex();
 const idx = Number.isFinite(Number(sessionIndex))
  ? Math.max(0, Math.min(state.history.length-1, Number(sessionIndex)))
  : (result
      ? ((latestIdx!=null && state.history[latestIdx]===result) ? latestIdx : Math.max(0, state.history.indexOf(result)))
      : (latestIdx!=null ? latestIdx : 0));
 setActiveResultContext(result, idx>=0?idx:null, idx>=0?"rendered from history":"rendered current result");
 if(idx>=0){ syncSpeedometerSessionSelect(idx); }
 // V699rev137: The CPI/CPA toggle button has been removed from the DOM; Mode 2
 // now always renders both needles simultaneously. Any legacy references to
 // #speedometerMode2ToggleBtn are harmlessly ignored because $() returns null.
 renderMode2SpeedometerBoxes(isMode2Speedometer ? {boxes:mode2MetricBoxes||[]} : null);
 stopSpeedometer();
 setTimeout(()=>animateSpeedometer(canvas, cps, success, scoreLabel, metricLabel, metricValueText, speedoOpts), 80);
 renderSpfGaugeForResult(result);
 const ovt=$("outcomeVerificationText"); if(ovt){ ovt.textContent = ""; ovt.style.display = "none"; }
 renderSpeedometerSleepMetrics(result);
 renderSpeedometerBaseline(result);
 const speedometerSessionInfo = $("speedometerSessionInfo");
 if(speedometerSessionInfo){
  const fullModeLabel = getFullResultModeLabel(result);
  if(fullModeLabel && fullModeLabel !== '—'){
   speedometerSessionInfo.textContent = fullModeLabel;
   speedometerSessionInfo.style.display = 'block';
  }else{
   speedometerSessionInfo.textContent = '';
   speedometerSessionInfo.style.display = 'none';
  }
 }
 setTestingQuiet(false);
}

function syncOutcomeStatusText(result){
 const ot=$("outcomeText");
 if(!ot) return;
 const ok = !!(result && isTestSuccess(result));
 ot.textContent = isResultSurvivalChallenge(result) ? getSurvivalOutcomeText(result) : (ok ? "Success!" : "Failed");
 ot.className = "outcome-text " + (ok ? "success" : "failed");
}

function openSpeedometerMenuSelection(){
 const sel=$("speedometerActionSelect");
 if(!sel) return;
 const choice=String(sel.value||"");
 if(!choice) return;
 const idx=getSpeedometerSelectedIndex();
 sel.value="";
 if(choice==="summary"){ $("outcomeOverlay").classList.add("hidden"); stopSpeedometer(); openSummarySession(idx, "complete"); setTestingQuiet(false); return; }
 if(choice==="summary_short"){ $("outcomeOverlay").classList.add("hidden"); stopSpeedometer(); openSummarySession(idx, "compact"); setTestingQuiet(false); return; }
 if(choice==="perf_time"){ $("outcomeOverlay").classList.add("hidden"); stopSpeedometer(); openPerformanceOverTimePage(); return; }
 if(choice==="response_graph"){ stopSpeedometer(); openResponseGraphPage(false, idx); return; }
 if(choice==="trial_log"){ $("outcomeOverlay").classList.add("hidden"); stopSpeedometer(); buildTrialLog(idx); $("trialLogOverlay").classList.remove("hidden"); return; }
 if(choice==="ranked"){ $("outcomeOverlay").classList.add("hidden"); stopSpeedometer(); buildRankedSummary(state.history[idx]); $("rankedOverlay").classList.remove("hidden"); return; }
 if(choice==="rate_rt"){ $("outcomeOverlay").classList.add("hidden"); stopSpeedometer(); buildRateRtOverlay(idx); $("rateRtOverlay").classList.remove("hidden"); return; }
 if(choice==="email"){ stopSpeedometer(); openEmailSelectPage(); return; }
 if(choice==="personal_baseline" || choice==="download_personal_baseline"){ stopSpeedometer(); openPersonalBaselinePage(idx); return; }
}

function openSpeedometerPage(sessionIndex){
 try{ wireEmailSelectControls(); }catch(err){}
 try{ wireEmailDraftAction(); }catch(err){}
 const explicitIdx = Number.isFinite(Number(sessionIndex)) ? Math.max(0, Math.min(state.history.length-1, Number(sessionIndex))) : null;
 const idx = explicitIdx!=null ? explicitIdx : getLatestHistoryIndex();
 if(idx!=null){
  openSpeedometerSession(idx);
 }else{
  goToStartPage();
 }
}

function openSpeedometerFromAdmin(sessionIndex){
 const admin = $("adminOverlay");
 if(admin) admin.classList.add("hidden");
 const explicitIdx = Number.isFinite(Number(sessionIndex)) ? Math.max(0, Math.min(state.history.length-1, Number(sessionIndex))) : null;
 const idx = explicitIdx!=null ? explicitIdx : getLatestHistoryIndex();
 if(idx!=null){
  openSpeedometerSession(idx);
 }else{
  goToStartPage();
 }
}

$("trialLogCloseBtn").onclick=()=>{ $("trialLogOverlay").classList.add("hidden"); openSpeedometerFromAdmin(); };

const _rrab=$("rateRtAdminBtn"); if(_rrab) _rrab.onclick=()=>openAdminFromOverlay("rateRtOverlay");

const _apt=$("adminPerfTimeBtn"); if(_apt) _apt.onclick=()=>{ $("adminOverlay").classList.add("hidden"); openPerformanceOverTimePage(); };

const _ptb=$("perfTimeBackBtn"); if(_ptb) _ptb.onclick=()=>{ $("perfTimeOverlay").classList.add("hidden"); openSpeedometerPage(); };
const _pta=$("perfTimeAdminBtn"); if(_pta) _pta.onclick=()=>openAdminFromOverlay("perfTimeOverlay");

const _rsp=$("rankedSpeedometerBtn"); if(_rsp) _rsp.onclick=()=>{ $("rankedOverlay").classList.add("hidden"); openSpeedometerPage(); };
const _rrs=$("rankedRestartBtn"); if(_rrs) _rrs.onclick=()=>{ $("rankedOverlay").classList.add("hidden"); goToStartPage(); };
const _rra=$("rankedAdminBtn"); if(_rra) _rra.onclick=()=>openAdminFromOverlay("rankedOverlay");
const _pbs=$("personalBaselineSpeedometerBtn"); if(_pbs) _pbs.onclick=()=>{ $("personalBaselineOverlay").classList.add("hidden"); openSpeedometerPage(); };
const _pbst=$("personalBaselineStartBtn"); if(_pbst) _pbst.onclick=()=>{ $("personalBaselineOverlay").classList.add("hidden"); goToStartPage(); };
const _pba=$("personalBaselineAdminBtn"); if(_pba) _pba.onclick=()=>openAdminFromOverlay("personalBaselineOverlay");

const _rateRtCloseBtn=$("rateRtCloseBtn"); if(_rateRtCloseBtn) _rateRtCloseBtn.onclick=()=>{ $("rateRtOverlay").classList.add("hidden"); openSpeedometerPage(); };

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
  zoom: 1
};

function isPerfFailureSession(r){
  if(!r) return false;
  const endReason = String(r.endReason || "");
  const lower = endReason.toLowerCase();
  if(/^failed\b/i.test(endReason) || lower.includes("retest") || lower.includes("practice")) return true;
  // Anti-spoof and sustained-stop endings for Mode 2 are failed / invalid sessions.
  if(r.testMode === "mode2" && (
    lower.includes("rolling mean below threshold in sustained phase") ||
    lower.includes("sustained-phase average performance fell below threshold") ||
    lower.includes("wrong-response limit reached in sustained phase") ||
    lower.includes("sustained-phase wrong-response limit reached")
  )) return true;
  return false;
}

function perfSessionMs(r){
  if(!r) return null;
  const failed = isPerfFailureSession(r);
  if(failed) return Number(settings.cpiWorstMs)||DEFAULTS.cpiWorstMs;
  // Performance-over-time graph uses CPI as the plotted score for every mode.
  // The orange ring is a visual companion marker for MBS and intentionally sits
  // on the same CPI point; it is not independently positioned from raw ms.
  const candidates = [
    r.mode2AdaptiveMbsMs,
    r.averageLast2BlockingScoresMs,
    r.sustainedBlockLimitPerformanceMs,
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
  const failed = isPerfFailureSession(r);
  if(failed) return 0;
  const explicit = Number(r.cognitivePerformanceIndex);
  if(Number.isFinite(explicit)) return explicit;
  const ms = perfSessionMs(r);
  return ms!=null ? computeCPI(ms) : null;
}

function perfSessionCpiEstimated(r){
  if(!r || r.testMode !== "mode2") return false;
  if(isPerfFailureSession(r)) return false;
  const explicit = Number(r.cognitivePerformanceIndex);
  if(Number.isFinite(explicit)) return false;
  const ms = perfSessionMs(r);
  return ms!=null;
}

function getSessionUtcMs(r){
  if(!r) return NaN;

  const directCandidates = [
    r.time,
    r.date_iso,
    r.dateIso,
    r.timestamp,
    r.createdAt,
    r.created_at,
    r.clockTime,
    r.startTime,
    r.endTime,
    r?.geo?.date_iso,
    r?.geo?.gmt_time,
    r?.geo?.local_time,
    Array.isArray(r.rtLog) && r.rtLog.length ? r.rtLog[0]?.clockTime : null,
    Array.isArray(r.rtLog) && r.rtLog.length ? r.rtLog[r.rtLog.length-1]?.clockTime : null
  ];

  for(const v of directCandidates){
    if(v == null || v === "") continue;
    if(typeof v === "number" && Number.isFinite(v)) return v;
    const ms = Date.parse(String(v));
    if(Number.isFinite(ms)) return ms;
  }

  // Older rows may carry only a local date/time pair or a human-readable geo blob.
  const datePart = r.date || r.localDate || r.testDate || r?.geo?.date || "";
  const timePart = r.localTime || r.testTime || "";
  if(datePart || timePart){
    const combined = `${String(datePart).trim()} ${String(timePart).trim()}`.trim();
    const ms = Date.parse(combined);
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

function getPerfGraphBaseSessions(hist){
  return (hist||[])
    .slice()
    .map((r, idx)=>({r, idx, ms: perfSessionUtcMs(r)}))
    .filter(x=>Number.isFinite(x.ms) || x.r)
    .sort((a,b)=>{
      if(Number.isFinite(a.ms) && Number.isFinite(b.ms)) return a.ms - b.ms;
      if(Number.isFinite(a.ms)) return -1;
      if(Number.isFinite(b.ms)) return 1;
      return a.idx - b.idx;
    })
    .map(x=>x.r);
}

function filterSessionsForPerfGraph(hist){
  const base = getPerfGraphBaseSessions(hist);
  if(!base.length) return base;
  const lastMs = perfSessionUtcMs(base[base.length-1]);
  if(perfGraphState.preset === "all") return base;
  if(perfGraphState.preset === "30sessions") return base.slice(-30);
  if(perfGraphState.preset === "24h"){
    const startMs = lastMs - (24 * 60 * 60 * 1000);
    return base.filter(r=> perfSessionUtcMs(r) >= startMs);
  }
  if(perfGraphState.preset === "7d"){
    const startMs = lastMs - (7 * 24 * 60 * 60 * 1000);
    return base.filter(r=> perfSessionUtcMs(r) >= startMs);
  }
  return base;
}

function syncPerfGraphControls(hist){
  const preset = $("perfRangePreset");
  const info = $("perfRangeInfo");
  if(!preset) return;

  const base = getPerfGraphBaseSessions(hist);
  const firstDate = base.length ? perfSessionIsoDate(base[0]) : "";
  const lastDate = base.length ? perfSessionIsoDate(base[base.length-1]) : "";

  preset.value = perfGraphState.preset;

  const filtered = filterSessionsForPerfGraph(base);
  const zoomPct = Math.round((perfGraphState.zoom || 1) * 100);
  if(info){
    if(!base.length){
      info.textContent = "No saved sessions yet.";
    }else if(perfGraphState.preset === "24h"){
      info.textContent = `Showing sessions from the last 24 hours. Zoom ${zoomPct}%.`;
    }else if(perfGraphState.preset === "7d"){
      info.textContent = `Showing sessions from the last 7 days. Zoom ${zoomPct}%.`;
    }else if(perfGraphState.preset === "30sessions"){
      info.textContent = `Showing the last ${filtered.length} saved session${filtered.length===1?"":"s"} (up to 30). Zoom ${zoomPct}%.`;
    }else{
      info.textContent = `Showing all ${base.length} saved sessions from ${firstDate} to ${lastDate}. Zoom ${zoomPct}%.`;
    }
  }
}

function wirePerfGraphControls(){
  const preset = $("perfRangePreset");
  const zoomInBtn = $("perfZoomInBtn");
  const zoomOutBtn = $("perfZoomOutBtn");
  const zoomResetBtn = $("perfZoomResetBtn");

  const rerender = ()=>{
    syncPerfGraphControls(state.history||[]);
    drawPerformanceOverTimeChart($("perfTimeGraph"), state.history||[]);
  };

  if(preset && preset.dataset.wired!=="1"){
    preset.dataset.wired="1";
    preset.onchange = ()=>{
      perfGraphState.preset = preset.value || "all";
      rerender();
    };
  }

  if(zoomInBtn && zoomInBtn.dataset.wired!=="1"){
    zoomInBtn.dataset.wired = "1";
    zoomInBtn.onclick = ()=>{
      perfGraphState.zoom = Math.min(4, Number((perfGraphState.zoom * 1.35).toFixed(3)));
      rerender();
    };
  }

  if(zoomOutBtn && zoomOutBtn.dataset.wired!=="1"){
    zoomOutBtn.dataset.wired = "1";
    zoomOutBtn.onclick = ()=>{
      perfGraphState.zoom = Math.max(0.5, Number((perfGraphState.zoom / 1.35).toFixed(3)));
      rerender();
    };
  }

  if(zoomResetBtn && zoomResetBtn.dataset.wired!=="1"){
    zoomResetBtn.dataset.wired = "1";
    zoomResetBtn.onclick = ()=>{
      perfGraphState.zoom = 1;
      rerender();
    };
  }
}

function drawPerformanceOverTimeChart(canvas,hist){
  if(!canvas) return;
  const fullHist = hist || [];
  const scroller = canvas.parentElement;
  const viewportW = Math.max(320, Math.round((scroller && scroller.clientWidth) || canvas.clientWidth || canvas.offsetWidth || 900));
  const viewportH = Math.max(620, Math.round((scroller && scroller.clientHeight) || canvas.clientHeight || canvas.offsetHeight || 700));

  function setupCanvas(cssW, cssH){
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = cssW + "px";
    canvas.style.minWidth = cssW + "px";
    canvas.style.height = cssH + "px";
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr,0,0,dpr,0,0);
    return ctx;
  }

  let cssW = Math.max(viewportW, 920);
  let cssH = Math.max(620, Math.min(760, viewportH));
  let ctx = setupCanvas(cssW, cssH);
  let W = cssW, H = cssH;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = "#081321";
  ctx.fillRect(0,0,W,H);

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
    if(perfGraphState.preset !== "all"){
      perfGraphState.preset = "all";
      syncPerfGraphControls(fullHist);
      return drawPerformanceOverTimeChart(canvas, fullHist);
    }
    ctx.fillStyle="#d7e7f8";
    ctx.font="bold 16px sans-serif";
    ctx.textAlign="center";
    ctx.fillText("No sessions in selected date range", W/2, H/2);
    return;
  }

  let sessionTimes = slice.map(r=>{
    const t = perfSessionUtcMs(r);
    return Number.isFinite(t) ? t : null;
  });
  let validTimes = sessionTimes.filter(t=>t!=null);
  if(!validTimes.length){
    // Last-resort fallback for older legacy rows: preserve graph usability by
    // spacing sessions sequentially in time order instead of leaving the graph blank.
    const now = Date.now();
    sessionTimes = slice.map((_, i)=> now + (i * 60 * 1000));
    validTimes = sessionTimes.filter(t=>t!=null);
  }

  function sleepQualityColor(r){
    const q = String(r?.sleepLog?.qualityLabel || "").trim().toLowerCase();
    if(q==="poor") return "#ff4d4f";
    if(q==="restless") return "#ffd84d";
    if(q==="good") return "#46d36a";
    return null;
  }

  const sleepSpans = slice.map(r=>{
    const bed = r?.sleepLog?.bedDateTimeIso ? new Date(r.sleepLog.bedDateTimeIso).getTime() : null;
    const wake = (r?.sleepLog?.wakeDateTimeIso || r?.sleepLog?.lastWakeDateTimeIso) ? new Date(r.sleepLog.wakeDateTimeIso || r.sleepLog.lastWakeDateTimeIso).getTime() : null;
    const color = sleepQualityColor(r);
    return (Number.isFinite(bed) && Number.isFinite(wake) && wake > bed && color) ? {start:bed, end:wake, color} : null;
  });
  const validSleepStarts = sleepSpans.filter(Boolean).map(s=>s.start);
  const validSleepEnds = sleepSpans.filter(Boolean).map(s=>s.end);

  let minTime = Math.min(...validTimes, ...(validSleepStarts.length ? validSleepStarts : [Math.min(...validTimes)]));
  let maxTime = Math.max(...validTimes, ...(validSleepEnds.length ? validSleepEnds : [Math.max(...validTimes)]));
  if(!(maxTime > minTime)){
    minTime -= 30 * 60 * 1000;
    maxTime += 30 * 60 * 1000;
  }
  const timeSpan = Math.max(1, maxTime - minTime);

  const hourMs = 60 * 60 * 1000;
  const sortedValidTimes = validTimes.slice().sort((a,b)=>a-b);
  const minMarkerSepPx = perfGraphState.preset === "24h" ? 30 : perfGraphState.preset === "7d" ? 24 : perfGraphState.preset === "30sessions" ? 22 : 18;
  let widthForDensity = 0;
  for(let i=1;i<sortedValidTimes.length;i++){
    const gap = sortedValidTimes[i] - sortedValidTimes[i-1];
    if(gap > 0){
      widthForDensity = Math.max(widthForDensity, Math.round((minMarkerSepPx * timeSpan) / gap));
    }
  }
  // Compress the time axis so typical history ranges stay readable on-screen
  // without forcing an over-wide scroll canvas by default. User zoom can then
  // expand or contract the time scale for closer examination.
  const zoom = Math.max(0.5, Math.min(4, Number(perfGraphState.zoom || 1)));
  const pxPerHourBase = perfGraphState.preset === "24h" ? 22
    : perfGraphState.preset === "7d" ? 4
    : perfGraphState.preset === "30sessions" ? 7
    : 1.2;
  const pxPerHour = pxPerHourBase * zoom;
  const widthForTime = Math.round(340 + (timeSpan / hourMs) * pxPerHour);
  const widthForSessions = Math.round(340 + Math.max(0, n - 1) * ((minMarkerSepPx * zoom) + 2));
  const maxAutoWidth = Math.max(viewportW, Math.round(viewportW * Math.max(1.35, zoom * 1.6)));
  cssW = Math.max(viewportW, Math.min(maxAutoWidth, Math.max(920, widthForTime, (widthForDensity ? Math.round(widthForDensity * zoom) : 0), widthForSessions)));
  cssH = Math.max(640, Math.min(780, viewportH));
  ctx = setupCanvas(cssW, cssH);
  W = cssW;
  H = cssH;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle="#081321";
  ctx.fillRect(0,0,W,H);

  const setKeys = new Set(slice.map(r=>getResultSymbolSet(r)));
  const homogeneousSet = setKeys.size === 1 ? [...setKeys][0] : null;
  const showMsAxis = !!homogeneousSet;
  let bestMs, worstMs;
  if(homogeneousSet === "memory"){
    bestMs = Number(settings.memoryCpiBestMs)||DEFAULTS.memoryCpiBestMs;
    worstMs = Number(settings.memoryCpiWorstMs)||DEFAULTS.memoryCpiWorstMs;
  } else if(homogeneousSet === "survival"){
    bestMs = Number(settings.survivalCpiBestMs)||DEFAULTS.survivalCpiBestMs;
    worstMs = Number(settings.survivalCpiWorstMs)||DEFAULTS.survivalCpiWorstMs;
  } else {
    bestMs = Number(settings.cpiBestMs)||DEFAULTS.cpiBestMs;
    worstMs = Number(settings.cpiWorstMs)||DEFAULTS.cpiWorstMs;
  }
  const setLabelForAxis = homogeneousSet === "memory" ? "Memory" : homogeneousSet === "survival" ? "Survival" : "Standard";

  const fontTitle = "bold 16px sans-serif";
  const fontSub = "12px sans-serif";
  const fontAxis = "bold 11px sans-serif";
  const fontTick = "11px sans-serif";
  const fontLegend = "bold 11px sans-serif";
  const fontSleepLegend = "12px sans-serif";
  const fontXAxisTitle = "bold 12px sans-serif";

  const PAD = {top:72,right:118,left:126};
  const gaps = {afterPlot: 10, betweenTickAndTitle: 12, betweenTitleAndSleep: 14, betweenSleepAndLegend: 14};
  const sleepBarH = 12;
  const tickLine1H = 14;
  const tickLine2H = 14;
  const tickBandH = tickLine1H + tickLine2H + 10;
  const axisTitleBandH = 18;
  const sleepLegendBandH = 18;
  const reservedBottom = tickBandH + gaps.betweenTickAndTitle + axisTitleBandH + gaps.betweenTitleAndSleep + sleepBarH + gaps.betweenSleepAndLegend + sleepLegendBandH + 22;
  const cW = Math.max(260, W - PAD.left - PAD.right);
  const cH = Math.max(180, H - PAD.top - reservedBottom);
  const plotBottom = PAD.top + cH;
  const tickLabelTop = plotBottom + gaps.afterPlot + 12;
  const axisTitleY = plotBottom + gaps.afterPlot + tickBandH + gaps.betweenTickAndTitle;
  const sleepBarY = axisTitleY + gaps.betweenTitleAndSleep;
  const legendY = sleepBarY + sleepBarH + gaps.betweenSleepAndLegend;

  function rawXForTime(ts){
    const frac = (ts - minTime) / timeSpan;
    return PAD.left + Math.max(0, Math.min(1, frac)) * cW;
  }
  const rawXPositions = sessionTimes.map(t => t==null ? null : rawXForTime(t));

  function buildDisplayXPositions(rawXs, minSep, minX, maxX){
    const adjusted = rawXs.slice();
    const pts = rawXs.map((x,i)=> x==null ? null : {x, i}).filter(Boolean).sort((a,b)=>a.x-b.x);
    if(!pts.length) return adjusted;
    const groups = [];
    let current = [pts[0]];
    for(let i=1;i<pts.length;i++){
      if((pts[i].x - pts[i-1].x) <= minSep){
        current.push(pts[i]);
      }else{
        groups.push(current);
        current = [pts[i]];
      }
    }
    groups.push(current);
    groups.forEach(group=>{
      if(group.length < 2) return;
      const anchor = group.reduce((sum,p)=>sum+p.x,0) / group.length;
      const spacing = Math.min(10, Math.max(6, minSep * 0.72));
      const start = anchor - (spacing * (group.length - 1)) / 2;
      group.forEach((p, idx)=>{
        adjusted[p.i] = Math.max(minX + 2, Math.min(maxX - 2, start + idx * spacing));
      });
    });
    return adjusted;
  }

  const displayXPositions = buildDisplayXPositions(rawXPositions, minMarkerSepPx, PAD.left, PAD.left + cW);
  const validRawXs = rawXPositions.filter(v=>v!=null).sort((a,b)=>a-b);
  let minRawGapPx = Infinity;
  for(let i=1;i<validRawXs.length;i++) minRawGapPx = Math.min(minRawGapPx, validRawXs[i] - validRawXs[i-1]);
  const denseCluster = Number.isFinite(minRawGapPx) && minRawGapPx < 10;
  const perfOuterRadius = denseCluster ? 5.0 : 5.8;
  const perfInnerRadius = denseCluster ? 2.4 : 2.8;
  const perfMarkerSize = denseCluster ? 3.4 : 3.7;
  const spfMarkerSize = denseCluster ? 3.7 : 4.2;

  function xOfIndex(i){
    const x = displayXPositions[i];
    return x==null ? PAD.left + cW/2 : x;
  }
  function rawXOfIndex(i){
    const x = rawXPositions[i];
    return x==null ? PAD.left + cW/2 : x;
  }
  function yLeftFromScore(v){ return PAD.top + cH - ((v-0)/100)*cH; }
  function yRightFromSpf(v){ return PAD.top + cH - (((v-1)/6))*cH; }

  function formatTickDate(ts){
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", {month:"numeric", day:"numeric", year:"2-digit"});
  }
  function formatTickTime(ts){
    const d = new Date(ts);
    return d.toLocaleTimeString("en-US", {hour:"numeric", minute:"2-digit"});
  }
  function chooseTickStep(spanMs, maxTicks){
    const minute = 60*1000;
    const hour = 60*minute;
    const day = 24*hour;
    const candidates = [
      15*minute, 30*minute,
      1*hour, 2*hour, 3*hour, 4*hour, 6*hour, 8*hour, 12*hour,
      1*day, 2*day, 3*day, 7*day, 14*day, 30*day
    ];
    const target = spanMs / Math.max(2, maxTicks-1);
    for(const step of candidates){ if(step >= target) return step; }
    return candidates[candidates.length-1];
  }
  function alignStart(ts, step){
    return Math.floor(ts / step) * step;
  }
  function buildTimeTicks(minTs, maxTs, plotWidth){
    const approxLabelW = 112;
    const maxTicks = Math.max(3, Math.min(6, Math.floor(plotWidth / approxLabelW)));
    const step = chooseTickStep(maxTs - minTs, maxTicks);
    const ticks = [];
    let t = alignStart(minTs, step);
    if(t < minTs) t += step;
    for(let i=0; i<200 && t<=maxTs; i++, t+=step) ticks.push(t);
    if(!ticks.length || ticks[0] > minTs) ticks.unshift(minTs);
    if(ticks[ticks.length-1] < maxTs) ticks.push(maxTs);
    return ticks.filter((t, i, arr)=> i===0 || t > arr[i-1]);
  }
  const timeTicks = buildTimeTicks(minTime, maxTime, cW);

  ctx.strokeStyle="rgba(127,215,255,0.16)";
  ctx.lineWidth=1;
  [0,100/7,200/7,300/7,400/7,500/7,600/7,100].forEach(v=>{
    const y=yLeftFromScore(v);
    ctx.beginPath(); ctx.moveTo(PAD.left,y); ctx.lineTo(PAD.left+cW,y); ctx.stroke();
  });
  ctx.strokeStyle="rgba(127,215,255,0.18)";
  timeTicks.forEach(ts=>{
    const x = rawXForTime(ts);
    ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, plotBottom); ctx.stroke();
  });

  const scoreTicks = [100,75,50,25,0];
  const metricTicks = showMsAxis ? scoreTicks.map(score => Math.round(bestMs + ((100-score)/100)*(worstMs-bestMs))) : null;
  ctx.font=fontTick;
  ctx.textAlign="right";
  scoreTicks.forEach((score, i)=>{
    const y = yLeftFromScore(score);
    if(showMsAxis){
     ctx.strokeStyle="#ffb357";
     ctx.beginPath(); ctx.moveTo(PAD.left-46, y); ctx.lineTo(PAD.left-36, y); ctx.stroke();
     ctx.fillStyle="#ffb357"; ctx.fillText(String(metricTicks[i]), PAD.left-52, y+4);
    }
    ctx.strokeStyle="#7fd7ff";
    ctx.beginPath(); ctx.moveTo(PAD.left-16, y); ctx.lineTo(PAD.left-6, y); ctx.stroke();
    ctx.fillStyle="#7fd7ff"; ctx.fillText(String(score), PAD.left-22, y+4);
  });

  ctx.textAlign="left";
  ctx.font=fontTick;
  ctx.fillStyle="#88ff88";
  [7,6,5,4,3,2,1].forEach(v=>{
    const y=yRightFromSpf(v);
    ctx.strokeStyle="#88ff88";
    ctx.beginPath(); ctx.moveTo(PAD.left+cW+6, y); ctx.lineTo(PAD.left+cW+16, y); ctx.stroke();
    ctx.fillText(String(v), PAD.left+cW+34, y+4);
  });

  ctx.fillStyle="#b7d9ef";
  ctx.textAlign="left";
  ctx.font=fontTitle;
  ctx.fillText("Performance Over Date and Time Graph", PAD.left, 24);

  ctx.font=fontSub;
  ctx.fillStyle="#d7e7f8";
  const subjectCount = new Set(slice.map(r => (r.subjectId||"—"))).size;
  const rangeLabel = perfGraphState.preset === "24h" ? "    Range: Last 24 hours"
      : perfGraphState.preset === "7d" ? "    Range: Last 7 days"
      : perfGraphState.preset === "30sessions" ? "    Range: Last 30 sessions"
      : "    Range: All history";
  ctx.fillText(`All sessions in continuous device-local time    Subjects: ${subjectCount}    Sessions: ${n}${rangeLabel}`, PAD.left, 46);

  ctx.save();
  ctx.translate(18, PAD.top + cH/2); ctx.rotate(-Math.PI/2);
  ctx.fillStyle="#ffb357"; ctx.textAlign="center"; ctx.font=fontAxis;
  ctx.fillText(showMsAxis ? `MBS ms (${setLabelForAxis})` : "MBS ms (mixed sets — hidden)", 0, 0); ctx.restore();

  ctx.save();
  ctx.translate(42, PAD.top + cH/2); ctx.rotate(-Math.PI/2);
  ctx.fillStyle="#7fd7ff"; ctx.textAlign="center"; ctx.font=fontAxis;
  ctx.fillText("CPI / CPA", 0, 0); ctx.restore();

  ctx.save();
  ctx.translate(W-8, PAD.top + cH/2); ctx.rotate(Math.PI/2);
  ctx.fillStyle="#88ff88"; ctx.textAlign="center"; ctx.font=fontXAxisTitle;
  ctx.fillText("S-PFS 1–7 (up is better)", 0, 0); ctx.restore();

  ctx.strokeStyle="rgba(215,231,248,0.82)";
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(PAD.left, plotBottom);
  ctx.lineTo(PAD.left+cW, plotBottom);
  ctx.stroke();

  ctx.font=fontTick;
  ctx.textAlign="center";
  timeTicks.forEach(ts=>{
    const x = rawXForTime(ts);
    ctx.strokeStyle="rgba(215,231,248,0.9)";
    ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.moveTo(x, plotBottom);
    ctx.lineTo(x, plotBottom + 8);
    ctx.stroke();
    ctx.fillStyle="#d7e7f8";
    ctx.fillText(formatTickDate(ts), x, tickLabelTop);
    ctx.fillText(formatTickTime(ts), x, tickLabelTop + 14);
  });

  ctx.font=fontXAxisTitle;
  ctx.fillStyle="#b7d9ef";
  ctx.textAlign="center";
  ctx.fillText("Date and Time (continuous device-local time)", PAD.left + cW/2, axisTitleY);

  function drawAnchorGuide(i, y){
    const rawX = rawXOfIndex(i);
    const dispX = xOfIndex(i);
    if(Math.abs(dispX - rawX) < 0.75) return;
    ctx.strokeStyle = "rgba(215,231,248,0.42)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rawX, y);
    ctx.lineTo(dispX, y);
    ctx.stroke();
  }

  function drawLine(vals, yFunc, color, style, opts={}){
    const markerDx = Number(opts.markerDx)||0;
    const markerSize = Number(opts.markerSize)||4.2;
    const strokeMarker = !!opts.strokeMarker;
    ctx.strokeStyle=color;
    ctx.lineWidth=2.5;
    ctx.beginPath();
    let started=false;
    vals.forEach((v,i)=>{
      if(v==null || sessionTimes[i]==null){ started=false; return; }
      const x=xOfIndex(i), y=yFunc(v,i);
      if(!started){ ctx.moveTo(x,y); started=true; } else { ctx.lineTo(x,y); }
    });
    if(vals.filter((v,i)=>v!=null && sessionTimes[i]!=null).length>1) ctx.stroke();

    vals.forEach((v,i)=>{
      if(v==null || sessionTimes[i]==null) return;
      const x=xOfIndex(i)+markerDx, y=yFunc(v,i);
      drawAnchorGuide(i, y);
      ctx.fillStyle=color;
      if(style==="diamond"){
        ctx.save(); ctx.translate(x,y); ctx.rotate(Math.PI/4); ctx.fillRect(-markerSize,-markerSize,markerSize*2,markerSize*2); ctx.restore();
      }else if(style==="square"){
        if(strokeMarker){
          ctx.strokeStyle = "#f6e7ff";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x-markerSize-1, y-markerSize-1, markerSize*2+2, markerSize*2+2);
        }
        ctx.fillRect(x-markerSize,y-markerSize,markerSize*2,markerSize*2);
      }else{
        ctx.beginPath(); ctx.arc(x,y,markerSize,0,Math.PI*2); ctx.fill();
      }
    });
  }

  function drawCombinedPerfMarkers(scoreVals, metricVals){
    ctx.strokeStyle="#7fd7ff";
    ctx.lineWidth=2.5;
    ctx.beginPath();
    let started=false;
    scoreVals.forEach((score,i)=>{
      if(score==null || sessionTimes[i]==null){ started=false; return; }
      const x = xOfIndex(i), y = yLeftFromScore(score);
      if(!started){ ctx.moveTo(x,y); started=true; } else { ctx.lineTo(x,y); }
    });
    if(scoreVals.filter((score,i)=>score!=null && sessionTimes[i]!=null).length>1) ctx.stroke();

    scoreVals.forEach((score,i)=>{
      if(score==null || sessionTimes[i]==null) return;
      const metric = metricVals[i];
      const x = xOfIndex(i);
      const y = yLeftFromScore(score);
      drawAnchorGuide(i, y);
      if(metric!=null){
        ctx.beginPath(); ctx.arc(x,y,perfOuterRadius,0,Math.PI*2);
        ctx.strokeStyle="#ffb357"; ctx.lineWidth=2.2; ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(x,y,perfInnerRadius,0,Math.PI*2);
      ctx.fillStyle="#7fd7ff";
      ctx.fill();
    });
  }

  const scoreVals = slice.map(r=>perfSessionCpi(r));
  const metricVals = slice.map(r=>perfSessionMs(r));
  const cpaVals = slice.map(r=>r && r.testMode==="mode2" && r.mode2Triggered && Number.isFinite(Number(r.cpa)) ? Number(r.cpa) : null);
  const spfVals = slice.map(r=>r && r.samnPerelli && r.samnPerelli.score!=null ? Number(r.samnPerelli.score) : null);

  const hasAnyMetric = scoreVals.some(v=>v!=null) || metricVals.some(v=>v!=null) || cpaVals.some(v=>v!=null) || spfVals.some(v=>v!=null) || sleepSpans.some(v=>v!=null);
  if(!hasAnyMetric){
    ctx.fillStyle="#d7e7f8";
    ctx.font="bold 15px sans-serif";
    ctx.textAlign="center";
    ctx.fillText("No graphable session values yet", PAD.left + cW/2, PAD.top + cH/2);
    return;
  }

  drawLine(spfVals, v=>yRightFromSpf(v), "#88ff88", "diamond", {markerSize: spfMarkerSize});
  drawCombinedPerfMarkers(scoreVals, metricVals);
  drawLine(cpaVals, v=>yLeftFromScore(v), "#d6a7ff", "square", {markerDx:8, markerSize:perfMarkerSize, strokeMarker:true});

  sleepSpans.forEach(span=>{
    if(!span) return;
    const x1 = rawXForTime(span.start);
    const x2 = rawXForTime(span.end);
    const barW = Math.max(2, x2 - x1);
    ctx.fillStyle = span.color;
    ctx.fillRect(x1, sleepBarY, barW, sleepBarH);
    ctx.strokeStyle = "rgba(215,231,248,0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x1, sleepBarY, barW, sleepBarH);
  });

  ctx.textAlign="left";
  ctx.font=fontLegend;
  ctx.beginPath();
  ctx.arc(PAD.left+7, PAD.top-18, perfInnerRadius, 0, Math.PI*2);
  ctx.fillStyle="#7fd7ff";
  ctx.fill();
  ctx.fillStyle="#7fd7ff";
  ctx.fillText("Blue dot = CPI", PAD.left+18, PAD.top-14);
  ctx.beginPath();
  ctx.arc(PAD.left+188, PAD.top-18, perfOuterRadius, 0, Math.PI*2);
  ctx.strokeStyle="#ffb357";
  ctx.lineWidth=2.2;
  ctx.stroke();
  ctx.fillStyle="#ffb357";
  ctx.fillText("Orange circle = MBS", PAD.left+200, PAD.top-14);
  ctx.fillStyle="#d6a7ff";
  ctx.fillRect(PAD.left+360, PAD.top-22, 8, 8);
  ctx.fillText("Purple square = CPA", PAD.left+376, PAD.top-14);
  const spLegendY = PAD.top + 4;
  ctx.fillStyle="#88ff88";
  ctx.save();
  ctx.translate(PAD.left+7, spLegendY+4);
  ctx.rotate(Math.PI/4);
  ctx.fillRect(-3.8,-3.8,7.6,7.6);
  ctx.restore();
  ctx.fillText("Green diamond = S-PFS", PAD.left+18, spLegendY+8);

  ctx.font=fontSleepLegend;
  ctx.fillStyle = "#ff4d4f"; ctx.fillRect(PAD.left, legendY-8, 12, 8);
  ctx.fillStyle = "#d7e7f8"; ctx.fillText("Sleep: Poor", PAD.left+18, legendY);
  ctx.fillStyle = "#ffd84d"; ctx.fillRect(PAD.left+108, legendY-8, 12, 8);
  ctx.fillStyle = "#d7e7f8"; ctx.fillText("Restless", PAD.left+126, legendY);
  ctx.fillStyle = "#46d36a"; ctx.fillRect(PAD.left+198, legendY-8, 12, 8);
  ctx.fillStyle = "#d7e7f8"; ctx.fillText("Good", PAD.left+216, legendY);
}

function getLastGraphableResult(){
 const h = state.history || [];
 for(let i=h.length-1;i>=0;i--){
  const r = h[i];
  if(r && (
    (Array.isArray(r.rtLog) && r.rtLog.length) ||
    r.testMode==="mode1" || r.testMode==="mode3" || r.testMode==="mode4" || r.testMode==="mode2"
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
  if(r && ((Array.isArray(r.rtLog) && r.rtLog.length) || r.testMode==="mode1" || r.testMode==="mode3" || r.testMode==="mode4" || r.testMode==="mode2")){
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

/* ===== E-Mail Select wiring ===== */
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
  const backSpeed = $("emailSpeedometerBtn");
  const backStart = $("emailStartBtn");
  const dataSel = $("emailDataSelect");
  const info = $("emailSelectInfo");

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
        perf_time: "Performance Over Date and Time Graph selected.",
        response_graph: "Response Time Graph Data selected.",
        rate_rt: "Presentation Rate Versus Response Time Graph selected.",
        all: "All available data selected."
      };
      info.textContent = labels[dataSel.value] || "Data selection ready.";
    };
  }
}

/* ===== end E-Mail Select wiring ===== */

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
  return "Response Time Graph Data\n\n" + rows.join("\n");
}

function formatLastPerfTimeText(){
  const h = state.history || [];
  if(!h.length) return "No performance-over-time history available.";
  const rows = h.map((r,i)=>{
    const when = r.time ? new Date(r.time).toLocaleString() : `Session ${i+1}`;
    const isMode2Sustained = r.testMode==="mode2";
    const cpi = r.cognitivePerformanceIndex!=null ? Math.round(Number(r.cognitivePerformanceIndex)) : "—";
    const mbs = isMode2Sustained
      ? (r.sustainedBlockLimitPerformanceMs!=null ? Math.round(Number(r.sustainedBlockLimitPerformanceMs))+" ms" : "—")
      : (r.averageLast2BlockingScoresMs!=null ? Math.round(Number(r.averageLast2BlockingScoresMs))+" ms" : "—");
    const cpa = isMode2Sustained && r.cpa!=null ? `CPA ${Number(r.cpa).toFixed(1)}` : null;
    // Rev29: disposition is now computed for all modes, not just Mode 2.
    // Mode 2 attaches it to the CPA parenthetical ("CPA 45.0 (Functioning
    // normally)"); other modes get a standalone parenthetical after CPI.
    // Legacy 4-tier tokens (GREEN/YELLOW/ORANGE/RED) in saved history are
    // migrated on the fly so old sessions display the new label.
    if(r.dispositionCode && /^(GREEN|YELLOW|ORANGE|RED)$/i.test(String(r.dispositionCode))){
     try{ Object.assign(r, computeDisposition(r)); }catch(e){}
    }
    const disp = r.dispositionLabel || r.dispositionCode || null;
    const spf = r.samnPerelli && r.samnPerelli.score!=null ? r.samnPerelli.score : "—";
    const sleep = r.sleepLog && r.sleepLog.qualityLabel ? r.sleepLog.qualityLabel : (r.sleepSinceLastTest==="no" ? "No sleep before this test" : "—");
    const cpaStr = cpa ? ` | ${cpa}${disp?" ("+disp+")":""}` : (disp ? ` | Disposition: ${disp}` : "");
    return `${i+1}. ${when} | CPI ${cpi} | MBS ${mbs}${cpaStr} | S-PFS ${spf} | Sleep ${sleep}`;
  });
  return "Performance Over Date and Time Graph\n\n" + rows.join("\n");
}

function formatLastRateRtText(last){
  if(!last) return "No Presentation Rate Versus Response Time Graph data available.";
  const rows = (last.rtLog||[]).map((r,i)=>{
    const dur = r.durationMs!=null ? `${r.durationMs} ms` : "—";
    const rt = r.rt!=null ? `${r.rt} ms` : "—";
    const change = r.rateChangeMs!=null ? `${r.rateChangeMs>0?"+":""}${r.rateChangeMs} ms` : "—";
    return `${i+1}. Phase ${r.phase||"—"} | Presented ${dur} | RT ${rt} | Rate change ${change} | Trial result ${r.outcome||"—"}`;
  });
  return rows.length ? ("Presentation Rate Versus Response Time Graph\n\n" + rows.join("\n")) : "No Presentation Rate Versus Response Time Graph data available.";
}

function buildEmailBodyFromSelection(){
  // Use the actively selected/displayed result; fall back to last history entry.
  const last = state.activeResult || (state.history && state.history.length ? state.history[state.history.length-1] : null);
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
  const subject = `CogSpeed® ${DISPLAY_VERSION} Results`;
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

  if(openBtn && openBtn.dataset.emailDraftWired !== "1"){
    openBtn.dataset.emailDraftWired = "1";
    openBtn.onclick = (e)=>{
      if(e) e.preventDefault();
      openSelectedEmailDraft();
    };
  }
}
/* ===== end Editable recipient field ===== */

document.addEventListener("visibilitychange", ()=>{
 if(document.visibilityState === "visible"){
  maybeFinishBackgroundTest();
 } else {
  // Rev 70: Release the Survival AudioContext when the tab is hidden to
  // free ~5-15MB on mobile. It will be recreated lazily on the next call
  // to playSurvivalCorrectSound(). Guarded so a close() failure on older
  // Safari doesn't break visibility handling.
  try{
   const ctx = state && state._survivalAudioCtx;
   if(ctx && typeof ctx.close === "function" && ctx.state !== "closed"){
    ctx.close().catch(()=>{});
   }
   if(state) state._survivalAudioCtx = null;
  }catch(e){}
 }
});

// One-time status note if old local admin overrides were auto-repaired.
setTimeout(()=>{
 try{
  if(localStorage.getItem(`${STORAGE_PREFIX}_admin_defaults_repaired`) === "1"){
   setStatus("Challenge Admin defaults updated to latest requested values.");
   localStorage.removeItem(`${STORAGE_PREFIX}_admin_defaults_repaired`);
  }
 }catch(e){}
}, 0);

window.addEventListener("resize", ()=>{
 const last = state.history && state.history.length ? state.history[state.history.length-1] : null;
 if(last && !$("outcomeOverlay").classList.contains("hidden")){
  try{ renderSpfGaugeForResult(last); }catch(e){}
 }
});

$("refSleepBtn").onclick=()=>showSleepPrompt();

$("tutorialExitSleepBtn").onclick=()=>showSleepPrompt();
$("tutorialExitBackBtn").onclick=()=>goToStartPage();
const _pbm_sr=$("profileBirthMonth"); if(_pbm_sr) _pbm_sr.onchange=()=>remindProfileSaveNeeded("general");
const _pby_sr=$("profileBirthYear"); if(_pby_sr) _pby_sr.oninput=()=>remindProfileSaveNeeded("general");
const _per=$("profileEmailResults"); if(_per) _per.onchange=()=>remindProfileSaveNeeded("general");


window.addEventListener("online", ()=>{ try{ flushUploadQueue(); }catch(e){} });
