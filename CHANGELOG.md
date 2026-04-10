## V590 — Current-state sleep/wake reporting cleanup
- Stopped inferring wakefulness from older test history across long gaps.
- Added a direct **last wake time before this test** entry path when the subject reports no sleep before the current test.
- Results Summary and Results - Complete now report current-state sleep/wake information only, including **Hours awake before test** derived from the current pre-test wake entry.
- Sleep reporting no longer depends on prior sessions for elapsed awake time, avoiding false values after multi-day or multi-week gaps.

## V589 — Wider Results pages
- Widened Results Summary and related results/chart overlays so more data is visible at once.
- Increased Results Summary text area height on phones.
- Reduced modal padding slightly to maximize usable content width.

## V586 — controllerchange-driven update reload
- Removed the timed reload from the update banner Refresh Now button.
- Refresh Now now sets a one-shot pending flag, posts SKIP_WAITING to the waiting service worker, and lets controllerchange perform the single reload.
- Keeps the waiting-state update-banner lifecycle introduced in V585, with a cleaner and more deterministic activation flow.

## V585 — Intro single-play + update-banner SW waiting fix
- Rebased from the approved V584 package.
- Fixed the update notification path by removing `self.skipWaiting()` from the service-worker install handler so new workers can enter the `waiting` state and trigger the in-app update banner.
- Kept the existing `SKIP_WAITING` message path for the banner's Refresh Now action.
- Re-saved `gmm_firebird_intro_fast.gif` without an infinite-loop flag so it plays once instead of looping forever.
- Added tap-to-skip on the intro GIF itself in addition to the overlay background.
- Updated visible/package version references to V585.

## V584 — Consolidated rebuild from V574 official baseline
- Rebased current CogSpeed work on the approved V574 official baseline and carried forward the accepted post-V574 fixes and UI changes into one clean package.
- Preserved the restored CogSpeed Thinking box with turning gears, sparks, smoke, and the 2-second delay.
- Preserved Speedometer menu cleanup, Results Summary / Results - Complete / Ranked Averages entries, and direct-open dropdown behavior without the old Open button.
- Preserved Mode 2 sustained scoring/admin changes, including sustained start factor, anti-spoof defaults, late-response rescue, and the actual MBS-based CPI table behavior.
- Preserved update-banner local-backup protections, including schemaVersion and payload hash verification.
- Preserved Firebird intro single-run logic and intro asset caching from the later branch while keeping V574 as the official source baseline for this consolidated rebuild.
- Updated all visible/package version references to V584.

## V583 — source header banner placeholder fixed
- Replaced the stale literal comment `// CogSpeed ${APP_VERSION} source` with a static-safe header comment so the source banner no longer shows an unexpanded placeholder.
- Updated package/version references to V583.

## V582 — Intro one-shot fix + precise auto-advance
- Set the Firebird intro close guard correctly by marking `introClosedOnce = true` inside `closeIntroOverlay()`, preventing re-arming after close.
- Matched intro auto-advance timing to the GIF duration (~3340 ms).
- Re-encoded the intro GIF with a finite loop count instead of infinite looping.

## V581 — Firebird intro single-play fix
- Re-saved the Firebird intro GIF without infinite looping so it plays once instead of repeating.
- Tightened intro auto-advance to a one-shot timer based on the GIF duration.
- Added a guard so the intro timer does not re-arm if the image load callback fires again.
- Updated visible/package version references to V581.

## V580 — Firebird intro single-play timing fix
- Adjusted Firebird intro timing to avoid the apparent second play before auto-advance.
- Added a one-shot close guard so the intro cannot re-arm and re-close multiple times in the same opening.
- Slightly slowed the intro frame timing while keeping the final logo hold.
- Updated version refs to V580.

## V579 — Firebird intro: one smooth fold and 2-second final hold
- Rebuilt the Firebird intro so the stylized G M M starts side by side and folds inward once into the unified final Firebird.
- Removed the extra secondary spin feel by using a single eased motion into the final logo.
- Kept the exact original Firebird image as the final held frame.
- Extended the final logo hold to about 2 seconds before auto-advance.
- Retimed intro auto-advance to match the new animation length.

## V578 — Firebird intro rebuilt
- Rebuilt the Firebird intro to start with stylized G M M letters side by side, then smoothly fold/spin into the exact original Firebird logo.
- Added many more in-between frames, reduced the initial hold, and increased playback speed for smoother motion.
- Final held frame uses the untouched original Firebird image on a padded canvas so the top does not cut off.
- Adjusted intro auto-advance timing to match the faster smoother GIF.

## V574 — CogSpeed Thinking FX restored
- Restored the CogSpeed Thinking overlay effects by starting the smoke/sparks canvas FX when the Thinking box is shown.
- Preserved the 2-second Thinking delay before the outcome/speedometer page.
- Updated visible/package version references to V574.

## V573 — Package drift cleanup for update reliability
- Fixed stale script tag in `index.html` so the page now requests `app.js?v=572`, matching the current release and service-worker cache key.
- Fixed stale resting `statusLine` text in `index.html` from `CogSpeed V552` to `CogSpeed V573`.
- Replaced the stale app.js integrated-changes header comment with a current-safe note pointing readers to `CHANGELOG.md` for the up-to-date integrated history.
- Updated visible/package version references to V573.

## V571 — Speedometer dropdown cleanup + Ranked Averages
- Added **Ranked Averages** to the Speedometer dropdown menu.
- Removed the unnecessary **Open** button; menu selections now open directly on change.
- Kept the existing reset behavior so returning to Speedometer resets the menu to its placeholder.
- Updated visible/package version references to V571.

## V570 — Firebird intro sped up
- Reduced the long initial hold on the Firebird intro GIF so the first GMM frame no longer lingers.
- Increased overall intro playback speed slightly.
- Shortened the auto-advance timing so the intro moves to the Start page sooner after playback.

## V569 — Firebird intro auto-advance reliability + faster playback
- Reduced Firebird intro playback time.
- Added more reliable intro auto-advance timer startup on load/pageshow so the app moves to the Start page automatically.
- No trial, pacing, scoring, or response-handling changes.

## V568 — Intro auto-advance fix + backup integrity metadata
- Fixed the Firebird intro auto-advance by moving the intro timer wiring out of the trial-opening path and initializing it on page load.
- Intro overlay now closes to the Start page automatically when the GIF finishes timing.
- Removed the bottom Gray Matter Metrics footer line from the intro/start landing screen.
- Local data backup export now includes `schemaVersion: 1` and a SHA-256 `payloadHash`.
- Restore now verifies the payload hash and cleanly fails if the backup file was edited or corrupted.
- Restore rejects newer unsupported schema versions and warns before restoring legacy backups without schema/integrity metadata.

## V567 — Firebird intro auto-advance fix
- Removed the Gray Matter Metrics, LLC text from the Firebird intro page.
- Made the Firebird intro auto-advance to the Start page more reliably by arming the transition immediately when the intro is shown, while keeping the load-based fallback.
- Slightly shortened the intro timing so the transition occurs promptly after the GIF completes.

## V566 — Firebird intro page
- Added a faster Firebird intro GIF page shown before the Start page.
- Intro uses the original Firebird image at the end of the animation so the top is not cut off.
- Added a Continue button to enter the Start page; returning to Start does not reopen the intro automatically.
- Cached the intro GIF in the service-worker app shell.


## V562 — Update-available banner + local backup/restore safeguard
- Added a safe update banner tied to the service-worker waiting state that appears only when no active test is running.
- Banner text: **Update available. Save local data before refresh.**
- Added **Save Local Data** JSON export using the current CogSpeed local profile, settings, and history.
- Added **Restore Local Data** JSON import with validation and overwrite confirmation.
- Added a post-refresh restore offer so users can restore backup data if a version update cleared local data.
- Added service-worker `SKIP_WAITING` message handling for the banner refresh path.
- No trial, pacing, scoring, or response-handling changes.

## V561 — Mode 2 Speedometer defaults to CPI/MBS
- In Mode 2 CogSpeed Sustained, the Speedometer now opens with CPI/MBS as the initial display instead of SPI/CSR/SBLP.
- Updated the default speedometer metric preference and reset path so returning to this view starts on CPI/MBS.
- Updated version references to V561.

## V560 — Speedometer layout cleanup
- Reduced the Mode 2 Speedometer toggle button (**Show CPI / MBS** / **Show SPI / CSR / SBLP**) to the same visual size as the **Back to Start** button.
- Placed the toggle button and **Back to Start** side by side on the Speedometer page.
- Increased the Speedometer dial size for stronger visual emphasis.
- Updated version references and corrected manifest drift to V560.

## V559 — Speedometer toggle resized and dial enlarged
- Increased the Speedometer dial size on the outcome/speedometer screen.
- Resized the **Show CPI / MBS** / **Show SPI / CSR / SBLP** toggle button to match the **Back to Start** button sizing more closely.
- No trial logic, pacing, scoring, or response-handling changes.

## V558 — Package alignment repack
- Corrected package/version drift so `index.html`, `manifest.json`, and `sw.js` all align to V558.
- No logic, scoring, pacing, or UI behavior changes beyond version/package consistency.

## V558 — Added compact Results Summary to Speedometer menu
- Added a new Speedometer dropdown item: **Results Summary**.
- New compact Results Summary includes version, mode, session, subject ID, location, date/time, total trial presentations, total duration, SP-FS, sleep, self-paced calibration, adaptive phase, CPI, MBS, Mode 2 sustained phase details when present, cognitive performance table, CPX, disposition, end reason, and results metric explanations.
- Existing **Results - Complete** item remains available.
- Returning to Speedometer continues to reset the dropdown menu to its default placeholder.

## V557 — Speedometer dropdown label clarified
- Changed the Speedometer dropdown menu label from **Results Summary** to **Results - Complete**.
- Kept the dropdown action wiring unchanged.

## V556 — Package consistency cleanup
- Fixed stale manifest name so package/version references are fully aligned.
- Updated manifest name from stale V552 to V556.
- Repackaged as a clean full build with no program files missing.
- No trial, pacing, scoring, or response-handling logic changes.

## V555 — Mode 2 late-response rescue + dedicated sustained default
- Added the Mode 1-style late-response rescue algorithm to **Mode 2 CogSpeed Sustained** so a first tap on the next sustained frame under the configured threshold can be reassigned to the prior apparent miss, scoring it as correct or wrong instead of missed when appropriate.
- Added a dedicated Admin/default setting for the sustained-phase late-response rule: **Mode 2 late response reassignment threshold (default 600 ms)**.
- Preserved the existing Mode 2 sustained anti-spoof max wrong and rolling-mean defaults.
- No Mode 1 pacing, CPX, or CDI formula changes.

## V554 — Smaller Speedometer SPI/CSR/SBLP toggle button
- Reduced the size of the Speedometer Mode 2 metric-toggle button ("Show SPI / CSR / SBLP" / "Show CPI / MBS") to reduce visual clutter.
- Narrower width, smaller text, and lighter padding only.
- No trial, pacing, scoring, or response-handling changes.

## V553 — Speedometer actions moved into dropdown menu
- Reduced Speedometer button clutter by moving Results Summary, Performance over Date and Time, Response-Time Graph, Trial Detail Log, Presentation Rate vs Response Time, and E-mail Select into a single dropdown action menu.
- Added an Open button next to the dropdown and also allow direct open on selection.
- Returning to the Speedometer now resets the dropdown menu back to its default placeholder state.
- Kept Admin and Back to Start as separate controls on the Speedometer page.

## V552 — Mode 2 sustained anti-spoof defaults completed
- Added the missing DEFAULTS entries for **Mode 2 anti-spoof rolling mean window in Sustained Phase** (`mode4SustainedRollMeanWindow: 10`) and **Mode 2 anti-spoof rolling mean threshold in Sustained Phase** (`mode4SustainedRollMeanThreshold: 0.50`).
- Keeps the V551 Mode 2 sustained rolling-mean Admin fields and runtime logic, but now defines them cleanly in the master DEFAULTS object so fresh installs and Reset Admin Settings restore the intended defaults.
- Updated visible/package version references to V552.

## V551 — Mode 2 sustained anti-spoof rolling mean defaults
- Added Mode 2 sustained-phase anti-spoof rolling mean window default to Admin: **10**.
- Added Mode 2 sustained-phase anti-spoof rolling mean threshold default to Admin: **0.50**.
- Sustained-phase taps now maintain a separate rolling-mean stream from Mode 1 so adaptive-phase history does not contaminate sustained anti-spoof checks.
- If sustained rolling mean falls below threshold after the configured window is filled, the Mode 2 session stops with a sustained-phase anti-spoof end reason.
- No changes to Mode 1, Mode 3, CPX/CDI, or response-timing rules outside the new Mode 2 sustained anti-spoof logic.

## V548 — Mode 2 sustained anti-spoof wrong limit
- Added a new Admin default: **Mode 2 anti-spoof max wrong in Sustained Phase (default 4)**.
- Mode 2 now stops the sustained phase and ends the session if sustained wrong responses reach that limit.
- Kept the existing global anti-spoof and max paced wrong protections unchanged.
- No changes to Mode 1, Mode 3, CPX, CDI, or response-timing rules.

## V547 — Mode 2 sustained phase starts at MBS × factor
- Added new Admin default **Mode 2 sustained start factor × MBS** with default **1.2**.
- When adaptive convergence triggers the sustained phase, the sustained presentation rate now starts at **MBS × mode4SustainedStartFactor** instead of exact MBS.
- The adjusted sustained rate is clamped within the existing global min/max frame-duration limits.
- Updated the Admin section text so the sustained trial count line now reads **sustained trials at MBS × factor**.
- No changes to Mode 1/3/4 logic outside the sustained-start rate for visible Mode 2 CogSpeed Sustained.

## V546 — Mode 1 CPI worst anchor restored to 2400
- Changed **Mode 1 CPI worst ms anchor** default from **2000** to **2400** in `DEFAULTS`, Admin text, and fallback references.
- Kept **Mode 1 CPI best ms anchor** at **1000**.
- Updated the CPI scale comment and aligned visible/package version references to V546.
- Fixed remaining package drift so `index.html` status line and `manifest.json` name now match the current version.

## V545 — Mode 1 CPI anchor correction
- Changed **Mode 1 CPI best ms anchor** default from **100** to **1000** in `DEFAULTS`, Admin text, and fallback references.
- Kept **Mode 1 CPI worst ms anchor** at **2000**.
- Updated the CPI scale comment and aligned the cognitive-performance table fallback to the new anchor through the shared settings/default path.
- Updated visible/package version references to V545.

## V551 — Mode 1 CPI anchor default update
- Changed **Mode 1 CPI best ms anchor** default from **800** to **100** in `DEFAULTS`, Admin text, and fallback references.
- Changed **Mode 1 CPI worst ms anchor** default from **2400** to **2000** in `DEFAULTS`, Admin text, and fallback references.
- Updated the CPI scale comment and visible/package version references to V551.
- No trial, pacing, response-handling, CPX, CDI, or other scoring-logic changes beyond the anchor defaults themselves.

## V543 — Controlled merge build on V541 baseline line
- Repackaged the uploaded V542 CPX / FFS / divergence / disposition scoring branch as a controlled V543 build.
- Preserved the later approved baseline-line defaults and UI features already present in the uploaded source, including CPI worst anchor = 2400, Mode 2 sustained trial count default = 20, and the V541 RT graph legend clarifications.
- Fixed package/version drift so `app.js`, `index.html`, `manifest.json`, and `sw.js` all align to V543.
- No additional trial, pacing, or response-handling logic changes were introduced beyond the integrated V542 scoring branch.

## V542 — CPX / FFS / Disposition integrated cognitive performance score

### New scoring system
Added `computeCPX()`, `computeFFS()`, `computeCPXDisposition()`, `computeCPXSummary()`,
and `formatCPXBlock()` to produce a unified cognitive performance score using every
available data source in the session record.

**CPX (Cognitive Performance Extended Index)** — 0–100 composite score:
- Mode 1 (CogSpeed Adaptive): `0.65 × CPI + 0.35 × paced_accuracy`
- Mode 4 (CogSpeed Sustained): weighted sum of CPI, recency-weighted SPI (second half
  carries 60%), SPR, and CDI complement; minus variability penalty (SBLP SD + P90 tail,
  max 10 pts), error-type penalty (omissions + commissions weighted separately, max 10 pts),
  and degradation penalty (CDI preferred over raw decay + RT slope, max 25 pts).
- Weights redistribute automatically when SPR or CDI are unavailable.
- Modes 2 and 3: CPX = null (insufficient machine-paced data).

**CPX state-adjusted** — CPX_raw with SP-FS context modifier applied:
SP-FS 4: −3 pts, 3: −6, 2: −10, 1: −15. SP-FS 5–7: no adjustment.

**FFS (Functional Fatigue State)** — SP-FS-equivalent derived from CPX_raw (1–7),
mapping objective performance onto the corrected Samn-Perelli scale:
7=Full alert (CPX 88–100), 6=Very lively (74–87), 5=Okay/normal (60–73),
4=Less than sharp (46–59), 3=Dull/losing focus (32–45), 2=Groggy (18–31),
1=Unable to function (0–17).

**SP-FS divergence** — SP-FS_reported minus FFS. Positive = performing worse than
declared state predicts (underreporting); +2 = note discrepancy; +3 or more = significant
underreporting flag displayed in results.

**Disposition** — operational recommendation from FFS × divergence matrix:
Green (Clear), Yellow (Monitor / human review recommended),
Red (Remove from hazardous duty — supervisor evaluation required).
Disposition is a structured recommendation only; human review is required in all cases.

### Wiring
- `finish()`: CPX computed and saved into every result record immediately after CDI.
- `buildSummary()`: CPX block inserted before END REASON in Mode 1 and Mode 4 summaries.
- `buildSummary()`: Lazy-recompute backfill added so pre-V542 history sessions receive
  CPX on first open when the result record lacked it.
- `exportCSV()`: Six new columns appended after cdiCommRisk — cpxRaw, cpxFinal, cpxFfs,
  cpxDivergence, cpxDispositionCode, cpxDispositionLabel.
- `getResultsMetricExplanationText()`: CPX, CPX state-adjusted, FFS, SP-FS divergence,
  and Disposition all defined with mode-appropriate fallbacks.

### Version and drift fixes (same build)
- Bumped APP\_VERSION V541 → V542 and corrected stale top-of-file banner (was V536).
- manifest.json name corrected V530 → V542.
- index.html title, versionBadge, and statusLine all corrected to V542
  (statusLine was stale at V527).
- index.html Cloudflare email obfuscation replaced with plain
  mailto:thinkfastgmm@gmail.com anchor (recurring deploy issue — treat as permanent patch).
- sw.js RELEASE bumped 541 → 542.

## V541 — RT graph legend labels clarified
- Added explicit legend labels for orange and yellow RT graph markers: Recovery, Late correct, and Late wrong.
- Kept existing labels for Calibration, Final self-paced, Correct, Wrong, Missed, Mean RT, and Phase break.
- Updated legend layout to wrap across rows when needed so labels remain visible on narrower screens.

## V540 — Speedometer dial face unobstructed
- Removed the needle-tip MBS/SBLP LCD window from the Speedometer so the dial value is no longer blocked.
- Kept the surrounding Speedometer metric cards/toggles intact for MBS, CSR, and SBLP.
- No changes to trial logic, pacing, scoring, or results calculations.

## V539 — Sustained table score labels clarified
- Updated the Mode 2 CogSpeed Sustained cognitive performance table so the matching row now shows the actual labeled values: **CSR X | CPI Y** instead of only **← YOUR SCORE**.
- Updated the table heading to the visible mode name: **Mode 2 CogSpeed Sustained Cognitive Performance Table (CSR → CPI)**.
- No scoring, timing, response-handling, or test-behavior changes.

## V538 — Results modal nearly full-height on phones
- Adjusted the Results Summary modal layout to use nearly the full phone viewport height.
- Removed the extra top/bottom margin around the Results modal and changed it to full dynamic viewport height.
- Slightly tightened Results modal vertical padding so more report text is visible before scrolling.
- No scoring, timing, response-handling, or test-behavior changes.

## V537 — Response-Time Graph legend and phase-break clarification
- Added a dashed phase-break marker at the end of calibration on the Response-Time Graph.
- Kept the sustained-phase break marker and labeled both breaks directly on the chart.
- Missed trials now render as gray X markers even when no RT is recorded, using the displayed frame-duration fallback.
- Expanded the legend to label Calibration and Final self-paced blue markers explicitly.
- Mean RT now renders as a dashed line sample in the legend instead of a solid line.
- Increased legend and axis label type slightly for readability.

## V536 — Clean CDI rebuild on approved V534/V529 baseline
- Rebuilt from the approved V534 baseline while preserving the approved V529/V533/V534 fixes and defaults.
- Added CDI (Cognitive Degradation Index) as a derived sustained-mode metric only; no trial, pacing, scoring, or response-handling logic changes.
- CDI now appears in Mode 2 CogSpeed Sustained Results Summary, metric explanations, and CSV export.
- Preserved approved defaults and admin cleanups, including CPI worst anchor = 2400, Mode 2 sustained trial count default = 20, visible mode ordering, and hidden raw admin keys.

## V534 — Admin defaults reorder + default-value updates
- Changed **Mode 1 CPI worst ms anchor** default from **3000** to **2400** in `DEFAULTS`, Admin text, and fallback references.
- Changed **Mode 2 sustained trials at MBS** default from **10** to **20** in `DEFAULTS`, Admin text, and fallback references.
- Reordered the Admin defaults so the mode-specific sections now appear in visible mode order **Mode 1 → Mode 2 → Mode 3 → Mode 4**.
- Kept each mode section ordered by how the settings are used during the test flow.
- Preserved the V533 Admin cleanup that hides raw internal setting keys.

## V533 — Admin internal key line removed
- Removed the raw internal setting-key line (for example `mode2TrialLimit`, `mode3CalibrationTrials`, `mode4MbsThresholdMs`) from each Admin setting row.
- Kept the visible Admin labels from V532, but stopped exposing legacy internal key names that made the page appear mislinked.
- No scoring, timing, runtime mode logic, or sustained-behavior changes.

## V532 — Admin visible-to-internal mode mapping corrected
- Corrected the Admin Test mode dropdown labels to match the actual internal mode mapping without changing runtime behavior.
- Corrected Admin settings labels 33–41 so each label now matches the internal mode it actually controls: mode2 settings display as Mode 3, mode3 settings display as Mode 4, and mode4 settings display as Mode 2.
- Updated nearby mode-mapping comments in `app.js` to match the real compatibility mapping.
- No scoring, timing, or mode-logic changes.

## V531 — Admin mode-label cleanup (actual field labels fixed)
- Corrected the Admin page field labels for items 33–41 so they match the visible renamed modes.
- Mode 2 fields now read as Mode 2 CogSpeed Sustained.
- Mode 3 fields now read as Mode 3 Self-Paced Calibration.
- Mode 4 fields now remain Mode 4 Fixed Machine-Paced.
- Updated Admin dropdown/support label maps to the same ordering.
- No scoring, timing, or mode-logic changes.

## V530 — Admin mode-label consistency cleanup
- Rolled forward the approved V528 wording fix so sustained completion text reads **Mode 2 CogSpeed Sustained complete...**
- Rolled forward the approved V529 success-classifier fix so that renamed sustained completions are treated as **Success** instead of **Failed**.
- Updated Admin-facing mode labels to stay consistent with the renamed display scheme: **Mode 1 CogSpeed Adaptive**, **Mode 2 CogSpeed Sustained**, **Mode 3 Self-Paced Calibration**, and **Mode 4 Fixed Machine-Paced**.
- Cleaned nearby Admin field labels and related mode-name display strings for consistency only; no scoring, timing, or mode logic changes.

## V527 — Extended sustained-phase analysis metrics

### New metrics (Mode 2 CogSpeed Sustained)
Added `computeMode4SustainedAnalysis()`, a dedicated post-run function that
derives eleven new performance metrics from `rtLog` sustained-phase entries.
No changes to trial engine, timing logic, or MBS convergence algorithm.

New result fields and CSV columns:
- **SBLP SD** (`sustainedBlockLimitPerformanceSdMs`) — SD of correct sustained
  RTs; intraindividual variability at the MBS rate.
- **SBLP P90** (`sustainedCorrectRtP90Ms`) — 90th-percentile correct RT;
  conservative ceiling vs. mean.
- **SBLP Max** (`sustainedCorrectRtMaxMs`) — maximum correct RT in the segment.
- **SPI first/second half** (`sustainedFirstHalfSpi`, `sustainedSecondHalfSpi`)
  — CSR rate split at the midpoint of presented sustained trials.
- **SPI decay** (`sustainedSpiDecay`) — first-half minus second-half SPI;
  positive values indicate within-segment decompensation.
- **RT slope** (`sustainedRtSlopeMsPerTrial`) — OLS slope of correct RT vs.
  trial position (requires ≥3 correct responses); positive = slowing.
- **Omission rate** (`sustainedOmissionRate`) — missed / presented (0–1).
- **Commission rate** (`sustainedCommissionRate`) — wrong / presented (0–1).
- **Error profile** (`sustainedErrorProfile`) — categorical label:
  `clean` | `omission_dominant` | `commission_dominant` | `mixed`.
- **SPR** (`sustainedProcessingReserve`) — (1 − SBLP / MBS) × 100; RT
  headroom remaining below the timing window at the subject's MBS rate.

All new fields are `null` when the sustained phase was not triggered or when
there is insufficient data (e.g. RT slope requires ≥3 correct responses).
All fields are included in CSV export and results text. Metric explanations
block updated to define all new terms.

### Bug fixes found during post-delivery review (V527)
- **`sustainedOmissionRate` return guard** — spurious `sblpSd != null ||`
  condition on the omissionRate return line was a copy-paste artifact and
  removed. Logic is now simply `omissionRate != null ? ... : null`.
- **Dead variable `n2`** — `const n2 = pos.length` in the OLS slope block
  was declared but never used; removed.
- **P90 index formula wrong for N ≤ 10** — `Math.floor(N * 0.9)` returns
  index N−1 (the maximum) for any N ≤ 10, making `sustainedCorrectRtP90Ms`
  identical to `sustainedCorrectRtMaxMs` at the default trial count of 10.
  Fixed to nearest-rank formula: `Math.max(0, Math.ceil(N * 0.9) − 1)`,
  which correctly returns the 9th of 10 values (90th percentile).
- **No backfill for pre-V527 history results** — `buildSummary()` renders
  stored results as-is; old Mode 2 sessions had no new fields and would
  display "—" for all 11 metrics. Added lazy-recompute block matching the
  existing `mode4TimingSummary` pattern: when a pre-V527 result is opened
  with `rtLog` present, all new fields are computed on-the-fly via
  `computeMode4SustainedAnalysis()` before rendering.

### Bug fixes (carried from V526 review)
- `@keyframes probePulseG` added to the `buildTutGearGridAnimated()` injected
  style block. Tutorial probe pulse animation was silently failing.
- `ensureGearImageStyles()` fallback CSS updated: `#6e6e6e` → `#7d7d7d` to
  match the V526 adaptive-phase color and eliminate a potential flash on initial
  render before `applyPhaseBackground()` runs.

### Cosmetic / consistency fixes (carried from V526 review)
- `index.html` Cloudflare email obfuscation replaced with plain
  `mailto:thinkfastgmm@gmail.com` anchor (recurring issue from Cloudflare
  Pages rewriting; treat as permanent patch on each deploy).
- `index.html` static `versionBadge` text corrected `V523` → `V527`
  (dynamically overwritten at runtime but kept in sync for consistency).
- `app.js` header banner corrected `V518` → `V527`.

## V526 — Phase background tone adjustment
- Lightened the adaptive-phase gear-page background from `#6e6e6e` to `#7d7d7d`.
- Darkened the sustained/final-phase gear-page background from `#a6a6a6` to `#979797`.
- Kept calibration background unchanged at `#8f8f8f`.
- No logic, timing, scoring, or layout changes.

## V525 — Sustained phase background toned down again
- Reduced the Sustained phase gear-page background from `#b8b8b8` to `#a6a6a6` to avoid a startling bright-phase transition.
- Left Calibration and Adaptive backgrounds unchanged.
- Refreshed live/package version references to V525.

## V524 — Sustained phase background toned down
- Reduced the sustained-phase gear-page background from a near-white light gray to a softer medium-light gray for better comfort and less glare.
- Kept calibration and adaptive backgrounds unchanged.
- Refreshed live/package version references to V524.

## V523 — Mode 4 phase background cues + SP-FS emphasis
- Added modest phase background colors on the gear page: calibration medium gray, adaptive current gray, sustained light gray.
- Kept the visual change background-only with no timing, scoring, or layout changes.
- Updated the Mode 4 cognitive performance table so the SP-FS column/header is visually emphasized and the current SP-FS row is highlighted.
- Refreshed visible/package version references to V523.

## V522 — Mode 4 cognitive table columns
- Added dynamic SP-FS and description-of-performance columns to the Mode 2 CogSpeed Sustained cognitive performance table so it scales when the sustained-trial target changes.
- Kept the table mapped from CSR to CPI with the user score flagged.

## V521 — Admin test-mode dropdown labels renamed
- Changed the Admin page **Test mode** dropdown to use the new visible mode names.
- Kept **Mode 2 CogSpeed Sustained** (`mode4`) as the default selected mode.
- No logic or scoring changes; display-label update only.

## V520 — Response-Time Graph phase demarcation
- Added a vertical dashed line to demarcate the machine-paced adaptive phase from the sustained phase on the Response-Time Graph in Mode 4.
- Added a matching phase-break legend item on the graph.
- Refreshed live/package version references to V520.

## V519 — Mode 4 adaptive results counts
- Added Right Responses, Wrong Responses, and Missed Responses at the top of the Mode 4 Adaptive Machine-Paced Phase results block.
- Derived those adaptive counts from adaptive-phase rtLog entries so they exclude sustained and final-phase events.
- Refreshed live/package version references to V519.

## V517 — Speedometer Mode 4 metric windows restored
- Restored visible Mode 4 speedometer metric windows for both views.
- CPI view now always shows the MBS window.
- SPI view now always shows the SBLP window alongside CSR.
- Refreshed live/package version references to V517.

## V516 — Results total trial presentations
- Added `Total trial presentations` to Results pages, using the saved `rtLog` length when available so the count includes all self-paced and machine-paced presentations.
- Added safe fallbacks for older sessions when `rtLog` is unavailable.
- Refreshed visible/package version references to V516.

## V515 — Outcome false-fail classification fix
- Rebuilt from the V513 baseline as a one-change-at-a-time fix for false **Failed** outcomes on otherwise successful runs.
- Hardened `isTestSuccess()` so explicit fail/retest states still fail, while valid completed Mode 4 max-time outcomes succeed when the sustained branch actually occurred.
- Updated Speedometer/outcome rendering to pass the full result object into the success classifier, not only the raw end-reason string.
- Refreshed live/package version references to V515.

## V513 — Mode 4 speedometer scoring fix
- Fixed Mode 4 Speedometer CPI view so it uses adaptive MBS normalized through the CPI formula instead of a CSR-based score.
- Fixed saved Mode 4 SPI so it remains CSR-based while CPI remains MBS-based.
- Refreshed live/package version references to V513.

## V512 — Adaptive machine-paced results block reorder
- Reordered the Mode 4 Adaptive Machine-Paced Phase results block to show average adaptive paced RT, paced RT SD, block count, full block list, MBS, block difference for MBS, and CPI in that order.
- Clarified MBS wording as the average of the last 2 consecutive blocks less than 250 ms apart.
- Added explicit Block difference for MBS and CPI lines under the block list.
- Refreshed live/package version references to V512.

## V511 — Speedometer SPI metric label fix
- In Mode 4 SPI view, the speedometer now shows **SBLP** as the dial-side metric instead of incorrectly showing **MBS**.
- CPI view continues to show **MBS**.
- Refreshed live/package version references to V511.

## V510 — Speedometer Mode 4 metric windows
- Speedometer Mode 4 toggle now shows CPI with MBS in a window, or SPI with CSR and SBLP in windows.
- Added visible Mode 4 summary metric cards under the speedometer toggle.
- Refreshed live/package version references to V510.

## V509 — Calibration total-wrong cleanup
- Results Summary self-paced calibration sections now keep `Total wrong` limited to calibration wrongs so later paced errors do not appear inside the calibration block.
- Refreshed live/package version references to V509.

## V508 — RT graph lines + legend
- Added connected lines to the Response-Time Graph.
- Added an on-chart legend for Correct, Wrong, Missed, and Mean RT.
- Refreshed live/package version references to V508.

## V508 — Response-Time Graph blank-screen repair
- Restored the missing `drawModeResultChart()` function in the packaged app so the Response-Time Graph renders instead of failing with a blank graph path.
- Kept the V506 UI sizing changes intact and rebuilt from that base as a narrow graph-only fix.
- Refreshed live/package version references to V507.

## V506 — Results screen width cleanup
- Narrowed the full-page Results overlay to a centered readable panel instead of edge-to-edge width.
- Kept the Results page at full vertical height while reducing excessive horizontal spread.
- Enabled pre-wrap rendering in the Results text panel so long lines fit the narrower layout more naturally.
- Refreshed live/package version references to V506.

## V506 — Simple UI recovery from V500
- Built from the V500 reference line with only narrow UI fixes.
- Resized the Speedometer overlay so it no longer rides off the top of the screen.
- Expanded the Results page overlay to full vertical viewport height with a full-height results text area.
- Refreshed live/package version references to V506.

## V500 — Recovery baseline rebuild
- Rebuilt from one verified editable source tree as a new recovery baseline.
- Restored explicit service-worker dev helpers in `app.js`: deregister, clear caches, and dev reset aliases.
- Repaired Results Summary rendering so it fails open instead of blank-freezing.
- Restored Mode 4 core results items: full block list, three timing summary lines, and a CSR-based cognitive performance table.
- Updated the Mode 4 Speedometer toggle to switch between SPI and CPI/MBS views.
- Fixed default/label drift: measured calibration trials = 7, CPI worst anchor = 3000, Mode 4 sustained default = 10, and max paced wrong label = 20.


## V458 — Mode 4 convergence branch cleanup
- Mode 4 now enters the sustained MBS segment when adaptive convergence is reached, using the converged adaptive MBS directly as the sustained presentation rate.
- Removed the extra adaptive-MBS-below-threshold gate that could incorrectly fail a converged Mode 4 session before the sustained segment started.
- Refreshed live/package version references to V458.

## V457 — 1-second gear-spin intro restored safely
- Restored a 1-second spinning-gear intro at test start with no separate visual buffer.
- Kept the start path curtain-neutral and fail-open; the first calibration trial opens from a fixed timer rather than an animation callback.
- Kept the app monolithic and preserved curtain cleanup as defensive-only behavior.

## V456 — Audit cleanup / curtain-neutral CSS cleanup
- Fixed stale top-of-file version/comment drift in `app.js` so the header and integrated-change block match the live build.
- Removed the remaining `body.curtain-active` overlay-hiding CSS side effects from `index.html`; the curtain now stays decorative/defensive only and cannot suppress overlays if that class is left behind.
- Corrected stale inline wording that still referenced a 180000 ms default in the final self-paced no-response rule; the live default remains 150000 ms unless changed in Admin.
- Refreshed package version references to V456.

## V455 — Admin max-time default restored
- Changed Admin **Max total test time** default back to **150000 ms**.
- Updated the live code fallback for `maxTestDurationMs` to **150000 ms** so the default and fallback match.
- Kept the Mode 4 rule that suspends the overall timer during the sustained phase and restarts the remaining time when the first final self-paced trial is shown.
- Refreshed package version references to V455.

## V454 — Mode 4 max-time suspension across sustained phase
- Suspended the overall max-test timer when the Mode 4 sustained MBS phase begins.
- Restarted the remaining overall max-test timer when the first Mode 4 final self-paced trial is displayed.
- Refreshed live/package version references to V454.

## V453 — Mode 4 final self-paced timeout rule
- Mode 4 final self-paced trials no longer arm the per-trial no-response timeout.
- If a subject stops responding after the sustained segment, the session remains alive until the overall max test time is reached, then shows results.
- Kept the app monolithic and refreshed package/version references to V453.

## V452 — Mode 4 adaptive-stop alignment
- Restored the normal Mode 1 adaptive-phase failure stops during Mode 4 before convergence, including max-block failure and other adaptive fail conditions.
- Kept the Mode 4 sustained MBS segment non-interrupting once entered so all sustained trials are presented before final self-paced trials.
- Kept the app as one monolithic `app.js` and refreshed live/package version references to V452.

## V450 — Result/session source-of-truth unification
- Unified result/session selection so Admin Results, Speedometer, and Results Summary resolve through one active-result context before falling back to saved history.
- Added visible source diagnostics to Results Summary and Speedometer, showing whether the view is rendering from the current result or a saved history session.
- Updated finish/save/show paths so the current result context is carried forward even if history save or summary rendering has partial failures.
- Refreshed live/package version references to V450.

## V449 — Fail-open finish pipeline stabilization
- Reworked the finish path into fail-open stages so the app cannot strand the user on the test screen if result computation, localStorage save, summary rendering, or results handoff fails.
- Added visible finish-phase diagnostics for smoke testing: `FINISH_COMPUTE`, `FINISH_SAVE`, `FINISH_RENDER`, and `FINISH_SHOW`, while trial openings now mark `TRIAL`.
- Hardened `showResultsPage()` so it can render directly from the current result payload even if the session could not be saved to history.
- Kept the curtain non-blocking and the runtime as one monolithic `app.js`.
- Refreshed visible/package version references to V449.

## V448 — No-animation / no-delay stabilization build
- Removed the remaining ready-delay from the curtain-neutral start path so the first trial opens immediately.
- Kept curtain helpers only as defensive cleanup and error recovery; live test flow no longer depends on curtain timing.
- Updated stale start-path comments to match the current monolithic no-animation behavior.
- Added clearer visible phase diagnostics for smoke testing (`STARTING`, `FINISHING`).
- Refreshed visible/package version references to V448.

## V447 — Ready-signal cleanup + stale comment fix
- Rewrote the stale `runGearSpinThenStart()` comment block so it now describes the real curtain-neutral start path instead of the removed gear-spin / curtain animation behavior.
- Kept `hardResetCurtainState()` and `normalizeCurtainForTesting()` as defensive cleanup helpers for trial-open and page-reset paths.
- Added a short 200 ms ready delay before the first calibration trial opens so the test no longer snaps instantly into the first frame.
- Refreshed visible/package version references to V447.

## V446 — Curtain-neutral stabilization + Mode 4 graph fixes
- Removed remaining curtain-active CSS side effects from the live UI shell so the curtain cannot hide overlays or intercept results presentation.
- Hardened `showResultsPage()` to hide the test screen, clear all overlays, and show the outcome/speedometer directly.
- Fixed Performance over Date and Time labels for Mode 4 sessions so the chart can show SPI/SBLP labeling rather than stale CPI/MBS-only wording.
- Fixed the Response-Time graph X alignment bug by plotting RT and presented-rate series on one common sequence axis.
- Added a Mode 4-specific response-graph X-axis label and phase-boundary markers for sustained and final-trial transitions.

## V446 — Results-path curtain watchdog safety cleanup
- Kept the app as a single monolithic `app.js`.
- Applied the safer results-path curtain handling pattern so the results handoff does not depend on `endCurtainTransition()` clearing watchdog state.
- Kept curtain reset defensive, but results transition now bypasses shared curtain-end cleanup in favor of direct state normalization.
- Refreshed live/package version references to V444.

## V444 — Stabilization build: curtain removed from live flow
- Removed curtain animation from live start, trial-transition, and finish/results flow so app state no longer depends on transition callbacks.
- Kept a hard curtain reset only as defensive cleanup across all modes, including Mode 2.
- Refreshed live/package version references to V444.

## V442 — Transition-system fail-safe hardening across Modes 1–4
- Re-ran version/package alignment and active DOM wiring audit against the V441 monolith line; no missing active DOM IDs or duplicate HTML IDs were found.
- Hardened the shared curtain transition system so start, trial advance, and finish/results no longer depend on animation completion callbacks.
- Added one shared curtain hard-reset / watchdog path used across all modes, with explicit Mode 2 coverage in the transition repair scope.
- Wrapped the intro and finish/result handoff paths in fail-safe completion logic so the app can recover even if a curtain callback chain stalls.
- Refreshed live/package version references to V442 across `app.js`, `index.html`, `manifest.json`, `sw.js`, and the downloadable package folder.

## V441 — Focused audit cleanup + version/changelog alignment
- Fixed a real live/package version drift bug where the hidden status line in `index.html` still showed `CogSpeed V439` instead of the active build.
- Corrected stale changelog drift in the historical V434 entry where it incorrectly claimed live/package references were refreshed to `V436`; it now correctly states `V434`.
- Refreshed live/package version references to V441 across `app.js`, `index.html`, `manifest.json`, `sw.js`, and the downloadable package folder.

## V440 — Rebuilt as monolith package
- Reconfirmed the delivered package uses a single integrated `app.js` rather than split runtime JS files.
- Refreshed live/package version references to V440 across `app.js`, `index.html`, `manifest.json`, and `sw.js`.
- Rebuilt the downloadable zip from the correct source tree with internal folder name `CogSpeed-V440`.
- No intended functional scoring or flow changes in this rebuild; this is a packaging/structure reset to keep the app in one main script.

## V439 — Focused audit cleanup + Mode 4 display / changelog alignment
- Re-ran version/package alignment and active DOM wiring audit against the V438 line; no missing active DOM IDs or duplicate HTML IDs were found.
- Fixed a real Mode 4 live-display bug where the CPI/SPI readout could fall back to an adaptive CPI-style value before the sustained phase had actually triggered.
- Mode 4 now leaves the live CPI/SPI readout blank until the sustained phase is reached, which matches the saved-results rule for non-triggered Mode 4 sessions.
- Corrected stale changelog drift by relabeling the older changelog-clarification entry to V434 and adding the missing V437 entry for the shared curtain / calibration repair.
- Refreshed live/package version references to V439 across `app.js`, `index.html`, `manifest.json`, `sw.js`, and the downloadable package folder.

## V438 — Shared curtain/test-screen freeze repair
- Re-ran version/package alignment and active DOM wiring audit against the V436 Mode 4 line; no missing active DOM IDs or duplicate HTML IDs were found.
- Fixed a shared curtain/test-screen reset bug that could leave Mode 1 and Mode 4 stuck on a partial transition screen during smoke testing.
- Added a defensive curtain reset on trial open / start-page return / post-intro handoff so the shared transition layer cannot remain half-open between phases.
- Fixed Mode 4 calibration progression so it now follows the same measured self-paced calibration flow as Mode 1 before branching later.
- Refreshed live/package version references to V438 across `app.js`, `index.html`, `manifest.json`, `sw.js`, and the downloadable package folder.

## V436 — Focused audit cleanup + script-version alignment
- Re-ran version/package alignment and active DOM wiring audit against the V435 line; no missing active DOM IDs or duplicate HTML IDs were found.
- Fixed a real package/version drift bug where `index.html` still loaded `app.js?v=434` even though the active build had moved forward, which could allow stale cached script reuse during smoke testing and deployment.
- Refreshed live/package version references to V436 across `app.js`, `index.html`, `manifest.json`, `sw.js`, and the downloadable package folder.

## V437 — Shared curtain/test-screen freeze repair
- Re-ran version/package alignment and active DOM wiring audit against the V436 Mode 4 line; no missing active DOM IDs or duplicate HTML IDs were found.
- Fixed a shared curtain/test-screen reset bug that could leave Mode 1 and Mode 4 stuck on a partial transition screen during smoke testing.
- Added a defensive curtain reset on trial open / start-page return / post-intro handoff so the shared transition layer cannot remain half-open between phases.
- Fixed Mode 4 calibration progression so it now follows the same measured self-paced calibration flow as Mode 1 before branching later.
- Refreshed live/package version references to V437 across `app.js`, `index.html`, `manifest.json`, `sw.js`, and the downloadable package folder.

## V434 — Focused audit cleanup + changelog clarification
- Re-ran version/package alignment and active DOM wiring audit against the V433 line; no missing active DOM IDs or duplicate HTML IDs were found.
- Verified that V430, V431, and V432 now appear only as historical entries inside `CHANGELOG.md`, not in the live UI, package version fields, or active code paths.
- Added a changelog note clarifying that older version numbers below are retained intentionally as release history, not active program labels.
- Refreshed live/package version references to V436 across `app.js`, `index.html`, `manifest.json`, `sw.js`, and the downloadable package folder.

## Release-history note
- Older version numbers listed below are retained intentionally as changelog history. They are not active UI/package labels unless they match the current build version.

## V433 — Focused audit cleanup + changelog consistency
- Re-ran version/package alignment and active DOM wiring audit against the V432 line; no missing active DOM IDs or duplicate HTML IDs were found.
- Corrected stale changelog drift where the Mode 4 final-phase reporting entry was mislabeled as V432 instead of V431.
- Corrected stale changelog drift where the V430 entry incorrectly said its live/package references were refreshed to V432.
- Refreshed live/package version references to V433 across `app.js`, `index.html`, `manifest.json`, `sw.js`, and the downloadable package folder.

## V432 — Focused audit cleanup + changelog / comment alignment
- Re-ran version/package alignment and active DOM wiring audit against the V431 line; no missing active DOM IDs or duplicate HTML IDs were found.
- Corrected stale changelog drift where the calibration-total fix entry was mislabeled as V431 instead of V430.
- Updated stale terminal-rule comments so they now reflect the actual Mode 1 vs Mode 4 branch behavior at convergent blocking.
- Refreshed live/package version references to V432 across `app.js`, `index.html`, `manifest.json`, `sw.js`, and the downloadable package folder.

## V431 — Mode 4 final-phase reporting cleanup
- Added explicit Mode 4 final self-paced result fields (correct, wrong, mean RT) to saved results and CSV export.
- Updated Mode 4 Results text so final self-paced trials are reported as a distinct phase, not only as target/presented counts.
- Refreshed live/package version references to V431 across `app.js`, `index.html`, `manifest.json`, `sw.js`, and the downloadable package folder.

## V430 — Focused audit cleanup + calibration total fix
- Re-ran version/package alignment and active DOM wiring audit against the V429 line; no missing active DOM IDs or duplicate HTML IDs were found.
- Fixed a real calibration progress-display bug where saved Admin values loaded as strings could concatenate in the `Cal X/Y` total for Mode 1 and Mode 3 instead of adding numerically.
- Coerced warm-up and measured calibration settings numerically in the calibration total counter so the displayed trial total now matches the actual configured settings.
- Refreshed live/package version references to V430 across `app.js`, `index.html`, `manifest.json`, `sw.js`, and the downloadable package folder.

## V429 — Failed Mode 4 metrics cleanup
- Re-ran version/package alignment and active DOM wiring audit against the V428 line; no missing active DOM IDs or duplicate HTML IDs were found.
- Fixed a real Mode 4 results bug where failed sessions that never triggered the sustained phase could still save a fallback adaptive CPI-style value into `sustainedProcessingIndex`.
- Failed non-triggered Mode 4 sessions now leave `SPI` and `SBLP` empty in saved results so Results pages, Speedometer/session lists, and exports do not imply sustained scoring occurred when it did not.
- Refreshed live/package version references to V429 across `app.js`, `index.html`, `manifest.json`, `sw.js`, and the downloadable package folder.

## V428 — Focused audit cleanup + Mode 4 session-target persistence
- Re-ran version/package alignment and active DOM wiring audit against the V427 line; no missing active DOM IDs or duplicate HTML IDs were found.
- Fixed a real historical-scoring drift bug by storing the Mode 4 sustained-trial target and final-trial target in each saved result.
- Updated Mode 4 SPI / CSR Speedometer rendering to use the saved session target count instead of the current Admin setting or presented-count fallback.
- Expanded Mode 4 Results text and CSV export to include sustained-target and final-target counts for clearer auditability.
- Refreshed live/package version references to V428 across app.js, index.html, manifest.json, sw.js, and the downloadable package folder.

## V427 — Results-page metric explanations
- Added a metric explanation footer at the bottom of each Results page.
- Footer explains MBS, CPI, CSR, SBLP, and SPI, and states when a metric is not used in the current mode.
- Refreshed live/package version references to V427 across app.js, index.html, manifest.json, and sw.js.

## V426 — Mode 4 scoring clarification
- Defined Mode 4 SBLP as 0 when CSR = 0, and updated results text accordingly.
- Kept CSR as the count of correct sustained responses during the Admin-defined Mode 4 sustained segment.
- Kept SPI scaling to the current Admin sustained-trial target instead of hard-coding 20.
- Refreshed live/package version references to V426 across app.js, index.html, manifest.json, and sw.js.

## V425 — Mode 4 tightening + package cleanup
- Kept Mode 4 final trials self-paced and clarified reporting so adaptive paced trials, sustained MBS trials, and final self-paced trials are named separately in results and graphs.
- Mode 4 sessions that never trigger the sustained MBS phase now end as Failed Test sessions instead of falling through the Mode 1 terminal-success path.
- Added explicit CSR (Correct Sustained Responses) reporting to Mode 4 results, CSV export, and Speedometer support.
- Defined SBLP as 0 when CSR = 0 so zero-correct sustained sessions have an explicit score value.
- Added a Speedometer toggle for Mode 4 sessions so the user can switch between SPI/SBLP and CSR views.
- Fixed package naming so the downloadable zip and the internal folder both match the current V425 release.

## V424 — Focused audit cleanup + terminal final-trial fix
- Fixed the non-Mode-4 terminal final-trial path so the ending final trials are counted as actual presented trials instead of correct-only trials accidentally tied to the SP restart setting.
- Removed stale script/comment drift around the old `mode3_paced` phase name and stale max-total-time wording.
- Standardized visible/package version references to V424 across `app.js`, `index.html`, `manifest.json`, and `sw.js`.
- Standardized visible Mode 4 naming in session summaries.

## V423 — Mode 4 sustained block-limit mode + focused audit cleanup
- Added **Mode 4** and made it the default test mode. Mode 4 starts from the adaptive Mode 1 path, then enters a sustained fixed-rate phase when convergent blocking occurs and adaptive MBS falls below the Mode 4 threshold.
- Added new Admin defaults for the Mode 4 MBS threshold, sustained MBS trial count, final self-paced trial count, and updated max total test time default to 180000 ms.
- Added Mode 4 result fields: adaptive MBS, sustained presentation rate, CSR / sustained presented / wrong / missed counts, SBLP, SPI, and final-trial counts.
- Updated Speedometer, Results Summary, Response-Time Graph, Rate vs RT graph, CSV export, and same-mode session grouping to include Mode 4 sessions and metrics.
- Refreshed visible/package version references to V423 across `app.js`, `index.html`, `manifest.json`, and `sw.js`.

## V422 — Audit cleanup + calibration consistency
- Re-ran version/package alignment and DOM ID wiring audit against the V421 line.
- Bumped visible/package version references to V422 across `app.js`, `index.html`, `manifest.json`, and `sw.js`.
- Fixed calibration comment drift so the measured-calibration default matches the live code (`initialMeasuredCalibrationTrials` default 5, not 7).
- Fixed warm-up fallback logic so an explicit `initialUnusedCalibrationTrials = 0` is honored in Mode 3 calibration counts and measured-calibration inclusion checks.
- Kept V421 package-consistency fixes intact, including unified contact text and the cached Profile logo asset.

## V421 — Clean merge audit + package consistency fixes
- Added `GMM FIREBIRD.png` to the service-worker app shell so the Profile logo is available offline.
- Unified package contact text to `thinkfastgmm@gmail.com` across Profile, About, Privacy, and Terms pages.
- Fixed the Admin reset label/action mismatch by renaming the Admin button to **Full Reset** to match actual behavior.
- Refreshed visible/package version references to V421 across `app.js`, `index.html`, `manifest.json`, and `sw.js`.
- Corrected stale changelog summary drift so the current main-line Mode 1 block-restart default matches the live code.

## V420 — Audit clean merge + version/comment alignment
- Re-ran a focused DOM/wiring audit against the active V419 line. No missing active DOM IDs or duplicate element IDs were found in the live UI.
- Confirmed `timeFormat` remains the canonical time-format setting; `use12HourTime` is still present only as legacy migration support when loading older saved settings.
- Fixed stale top-of-file comment drift in `app.js` so the header and integrated-change block now match the current merged main line.
- Bumped all visible/package version elements to V420 so `app.js`, `index.html`, `manifest.json`, and `sw.js` stay aligned.

## V419 — Admin default updates
- Changed default warm-up calibration trials from 2 to 1.
- Changed default measured calibration trials from 7 to 5.
- Changed default Mode 1 restart percent of block baseline from 1.2 to 1.3.
- Updated corresponding Admin labels and related inline comments to match the new defaults.

## V418 — Audit clean merge + version/comment alignment
- Re-ran a DOM/wiring audit against the active V417 line. No missing active DOM IDs were found in the live UI, and no duplicate element IDs were found in `index.html`.
- Fixed stale version/comment drift so the top-of-file `app.js` header, integrated-change comment block, hidden status line, HTML title, script query string, manifest, and service worker all match V418.
- Kept current functional behavior intact while folding the audit cleanup into the main line.

## V415 — Speedometer space cleanup
- Hid the redundant Speedometer session info line under the selector.
- Reduced the Speedometer size slightly so the lower buttons fit on screen more comfortably.

## V414 — Audit clean merge + version alignment

- Re-ran a DOM/wiring audit against the active V413 line; no missing active DOM IDs were found in the live UI.
- Fixed stale static version drift so the visible badge, status line, script query string, manifest, service worker, and app version all match V414.
- Refreshed top-of-file integrated-change comments to match the current merged main line through V414, including the Speedometer session browser.

## V412 — Wiring audit / stale-drift cleanup
- Consolidated remaining manual admin-open boilerplate to use `openAdminFromOverlay()` for Outcome, Summary, and Rate/RT paths.
- Corrected stale inline comments describing the gear-spin hold; active behavior remains the same.
- Bumped all versioned/static elements to V412 so `app.js`, `index.html`, `manifest.json`, and `sw.js` stay aligned.

## V411 — Audit clean merge

- Re-ran a DOM/wiring audit against the active V410 line. All jQuery-style `$("id")` references in `app.js` now map to real elements in `index.html`; no missing control IDs were found in the active UI.
- Refreshed static version alignment to V411 across `app.js`, `index.html`, `manifest.json`, and `sw.js`.
- Clarified that `use12HourTime` is legacy migration-only compatibility logic inside `loadSettings()`; `timeFormat` remains the canonical setting.
- Updated integrated-change comments so documentation matches the current merged main line.

## V409 — E-mail formatting + Trial Detail readability
- Improved plain-text e-mail formatting for Trial Detail Log, Response-Time Graph, Performance over Date and Time, and Presentation Rate vs Response Time data so exported draft text is easier to read.
- Trial Detail e-mail text now matches the visible log more closely, including Presented Rate, RT, Rate Change, Correct Target, Chosen Response, Max rAF, and Why Changed.
- Improved on-screen Trial Detail table readability with sticky headers, nowrap cells, and horizontal scrolling that preserves full data visibility.

## V407 — Wiring, version, and stale-drift audit

- Fixed stale version drift so the static HTML and manifest now match the live build: title, version badge, status line, manifest name, and script query string all point to V407.
- Removed stale wiring for legacy hidden buttons (`startBtn`, `backToStartBtn`, `startOverBtn`) that no longer exist in `index.html`.
- Kept only the active visible navigation wiring in the main program.
- Updated comments to reflect that legacy hidden-button placeholders are gone and the active control wiring is the source of truth.

## V406 — Clean merge and bug cleanup

- Fixed a real cache-busting/versioning bug where `index.html` still loaded `app.js?v=383` instead of the current build script.
- Updated stale top-of-file comments in `app.js` from V399 to V406 so documentation matches the integrated main line.
- Removed a stale optional `emailSelectRecipientBtn` wiring block that no longer had a matching element in `index.html`.
- No pacing, scoring, sleep-logic, or graph-math changes in this build.

# V404

- Trial Detail Log visible columns reduced and reordered to: #, Clock, Phase, Presented Rate, Rate Change, Trial Result, Correct Target, Chosen Response, Max rAF, Why Changed.

# CogSpeed Change Log

This file summarizes the major integrated changes in the current main program line.
It is meant to provide a readable history without overloading inline code comments.

## V400 — Documentation build
- Added this `CHANGELOG.md` file to the package.
- Kept code behavior unchanged.
- Bumped build/version references so the package, app, manifest, and service worker stay aligned.

## Major integrated program changes in the current main line

### Core test and pacing
- Mode 1 restart percentage of block baseline default set to 1.3.
- Correct-response formula factor default set to 0.30.
- Correct speedup range kept at 50–200 ms.
- Convergent-clamp special speedup branch removed so normal speedup bounds apply throughout.
- Recovery delays exposed as admin settings:
  - `RecoveryInterTrialDelayMsStart`
  - `ResumeToPacedDelayMs`

### Sleep logger and sleep reporting
- Sleep logger supports 12-hour and 24-hour entry modes.
- 12-hour mode uses hour, minute, and AM/PM controls.
- 24-hour mode uses native time input.
- Sleep recording is preserved through test start and saved into results.
- Results include sleep summary information and time since last sleep.
- Time since last sleep can span multiple days using `sleepLog.wakeDateTimeIso`.
- Performance over Date and Time graph shows sleep bars:
  - red = Poor
  - yellow = Okay
  - green = Good

### Profile and guest handling
- Guest (`0`) profile flow is separated from saved email-profile data.
- Time-format selection is local draft state while Profile is open and is saved on Save & Continue.
- Results/Profile access is more robust for guest sessions.
- GMM logo restored to the Profile page.

### Graphs and results
- Performance over Date and Time uses Device Local Time labeling.
- CPI/MBS marker dots were reduced in size so more sessions fit on screen.
- All sessions are available more directly in graph flows.
- Response-Time Graph includes session navigation controls.
- Results page includes local time, GMT time, sleep summary, and time since last sleep.

### Admin and diagnostics
- Admin button labels cleaned up for clarity.
- `lateResponseThresholdMs` exposed in Admin.
- Read-admin handling for select fields made explicit.
- Added timing diagnostics for paced trials and timing summaries in exports.

### CSV and exports
- CSV export alignment fixed by escaping all fields safely.
- `testMode` included in CSV.
- Trial Detail log got clearer column labels and rate-change columns.
- Visible Trial Detail table removed redundant Center Probe column while keeping Correct Target/location.

### Cleanup and maintenance
- Removed dead history-overlay code and related stale chart code.
- Removed stale hidden legacy controls and dead fields like `previousMissed`.
- Replaced hardcoded overlay lists with DOM-driven overlay discovery.
- Consolidated repeated admin-open and startup boilerplate.
- Removed PNG-unreachable SVG gear fallback path.
- Refreshed comments around reset helpers, guest/profile separation, and sleep handling.

## Notes
- Older saved admin settings on a device can still override new code defaults until Reset Admin Settings is used.
- This change log summarizes the current integrated line and major changes, not every experiment or failed intermediate patch.
## V408 — Trial Detail RT column
- Restored the visible RT column in the Trial Detail Log between Presented Rate and Rate Change.
- Updated the empty-table colspan and version alignment fields.


## V410 — Clean merge audit
- Fixed stale static version drift so all visible/package elements now match the live build: HTML title, version badge, status line, script query string, manifest name, app version, and service-worker release.
- Refreshed top-of-file integrated-change comments to match the current main line through V410.
- Verified current startup wiring remains consolidated to a single load initializer and response-graph controls are wired in the active path.
- No scoring, pacing, sleep, or graph-math logic changes in this audit build.

## V413 — Speedometer session browser
- Added Speedometer session selector with Prev / Next controls.
- Speedometer now states which session is currently displayed.
- View Results, Trial Detail Log, Rate vs RT, and Response-Time Graph launched from Speedometer now follow the selected session.
- Kept version/package/release identifiers aligned.


## V416 - Results and Speedometer space cleanup
- Expanded Results summary panel vertically so more results text fits on screen.
- Reduced Speedometer size and tightened button spacing so the bottom Start Page button fits more reliably on screen.
- Updated versioned files to V416.

## V417 — Profile Reset Sessions button
- Kept Profile Reset button behavior unchanged (clears saved profile fields only).
- Added a new subject-facing double-tap **Reset Sessions** button on the Profile page.
- Reset Sessions clears saved session history only (`state.history` / `${STORAGE_PREFIX}_history`) without deleting profile/settings.
- Clarified the separation from Admin Full Reset, which is broader and does not specifically mean session-history deletion.
