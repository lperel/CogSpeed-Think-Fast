// ═══════════════════════════════════════════════════
// CogSpeed V164 bootstrap
// Loads the split runtime in order: core logic, then UI wiring.
// ═══════════════════════════════════════════════════
(function(){
  const scripts = ["app-core.js?v=164", "app-ui.js?v=164"];
  function loadNext(i){
    if(i >= scripts.length) return;
    const s = document.createElement("script");
    s.src = scripts[i];
    s.defer = false;
    s.onload = () => loadNext(i + 1);
    s.onerror = () => console.error("Failed to load", scripts[i]);
    document.head.appendChild(s);
  }
  loadNext(0);
})();
