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
- Mode 1 restart percentage of block baseline default set to 1.2.
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
