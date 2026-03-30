// CogSpeed V161 — UI wiring / startup / service worker
// Edit this file for button handlers, overlays, startup flow, and app boot.

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
$("exportAdminBtn").onclick=exportResults;
const _ecb=$("exportCsvAdminBtn"); if(_ecb) _ecb.onclick=exportCSV;
$("adminTrialLogBtn").onclick=()=>{ buildTrialLog(state.history.length-1); $("trialLogOverlay").classList.remove("hidden"); };
$("adminHistoryBtn").onclick=()=>{ buildHistoryOverlay(); $("historyOverlay").classList.remove("hidden"); };
const _arrb=$("adminRateRtBtn"); if(_arrb) _arrb.onclick=()=>{ $("adminOverlay").classList.add("hidden"); $("rateRtOverlay").classList.remove("hidden"); buildRateRtOverlay(); };
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
const _rrsel=$("rateRtSessionSelect"); if(_rrsel) _rrsel.onchange=()=>buildRateRtOverlay();
const _rrcb=$("rateRtCloseBtn"); if(_rrcb) _rrcb.onclick=()=>{ $("rateRtOverlay").classList.add("hidden"); $("adminOverlay").classList.remove("hidden"); if(_adminUnlocked){ $("adminGate").classList.add("hidden"); $("adminBody").classList.remove("hidden"); renderAdmin(); } };
$("historyClearBtn").onclick=()=>{
 const btn=$("historyClearBtn");
 if(btn._confirmPending){
  clearTimeout(btn._confirmTimer);
  btn._confirmPending=false;
  btn.textContent="🗑 Clear History";
  btn.style.color="rgba(255,100,136,0.5)";
  btn.style.borderColor="rgba(255,100,136,0.3)";
  state.history=[]; localStorage.removeItem(STORAGE_VERSION + "_history");
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
  },2000);
 }
};
const _tsel=$("trialLogSessionSelect");
if(_tsel) _tsel.onchange=()=>buildTrialLog();
const _tlp=$("trialLogPrevBtn"); if(_tlp) _tlp.onclick=()=>{ const s=$("trialLogSessionSelect"); if(!s) return; s.selectedIndex=Math.max(0,s.selectedIndex-1); if(s.onchange) s.onchange(); };
const _tln=$("trialLogNextBtn"); if(_tln) _tln.onclick=()=>{ const s=$("trialLogSessionSelect"); if(!s) return; s.selectedIndex=Math.min(s.options.length-1,s.selectedIndex+1); if(s.onchange) s.onchange(); };
const _hp=$("historyPrevBtn"); if(_hp) _hp.onclick=()=>{ const cur=(buildHistoryOverlay._selectedIndex!=null?buildHistoryOverlay._selectedIndex:(state.history.length-1)); buildHistoryOverlay(Math.max(0,cur-1)); };
const _hn=$("historyNextBtn"); if(_hn) _hn.onclick=()=>{ const cur=(buildHistoryOverlay._selectedIndex!=null?buildHistoryOverlay._selectedIndex:(state.history.length-1)); buildHistoryOverlay(Math.min(state.history.length-1,cur+1)); };
const _rrp=$("rateRtPrevBtn"); if(_rrp) _rrp.onclick=()=>{ const s=$("rateRtSessionSelect"); if(!s) return; s.selectedIndex=Math.max(0,s.selectedIndex-1); if(s.onchange) s.onchange(); };
const _rrn=$("rateRtNextBtn"); if(_rrn) _rrn.onclick=()=>{ const s=$("rateRtSessionSelect"); if(!s) return; s.selectedIndex=Math.min(s.options.length-1,s.selectedIndex+1); if(s.onchange) s.onchange(); };

$("adminBackBtn").onclick=()=>goToStartPage();
$("adminStartOverBtn").onclick=()=>startOverFlow();
$("benchRunBtn").onclick=()=>runDeviceBenchmark(true);
$("benchMainBtn").onclick=()=>{ $("benchmarkOverlay").classList.add("hidden"); };
$("startBtn").onclick=startTest;
$("backToStartBtn").onclick=goToStartPage;
$("startOverBtn").onclick=startOverFlow;
$("summaryRestartBtn").onclick=()=>{ $("summaryOverlay").classList.add("hidden"); const fg=$("fullGraphOverlay"); if(fg) fg.classList.add("hidden"); goToStartPage(); };
$("summaryEmailBtn").onclick=()=>emailResults(currentSummaryIndex);
const _heb=$("historyEmailBtn"); if(_heb) _heb.onclick=()=>{ const idx=(buildHistoryOverlay._selectedIndex!=null?buildHistoryOverlay._selectedIndex:(state.history.length-1)); emailResults(idx); };
const _fgb=$("summaryFullGraphBtn"); if(_fgb) _fgb.onclick=()=>{ $("summaryOverlay").classList.add("hidden"); $("fullGraphOverlay").classList.remove("hidden"); };
const _fgbb=$("fullGraphBackBtn"); if(_fgbb) _fgbb.onclick=()=>{ $("fullGraphOverlay").classList.add("hidden"); $("summaryOverlay").classList.remove("hidden"); };
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



