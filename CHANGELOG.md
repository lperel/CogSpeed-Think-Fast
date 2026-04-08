## V505 — Simple UI recovery from V500
- Built from the V500 reference line with only narrow UI fixes.
- Resized the Speedometer overlay so it no longer rides off the top of the screen.
- Expanded the Results page overlay to full vertical viewport height with a full-height results text area.
- Refreshed live/package version references to V505.

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
