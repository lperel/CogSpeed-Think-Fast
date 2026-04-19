## V699 Rev 30 — 2026-04-18
- Legacy disposition-token migration — critical fix for users with existing history. Rev 29's disposition gates checked `dispositionCode==null` before recomputing, which left saved results from before the upgrade untouched with their old 4-tier tokens ("GREEN", "YELLOW", "ORANGE", "RED"). Combined with the Rev 30 `SP-FS N —` display format, that produced nonsense strings like `SP-FS GREEN — Clear` in the summary. Added a legacy-token regex check at all four disposition gates (lines 5133, 5293, 8058, 8912) that triggers a re-compute when `dispositionCode` matches `/^(GREEN|YELLOW|ORANGE|RED)$/i`. Saved history is now migrated on the fly to the 7-tier SP-FS-aligned labels the first time each result is displayed.
- Disposition display format upgraded to `SP-FS N — caption` in the main summary builder (line 5149) and the Mode 2 detailed summary (line 5363), matching the existing `Fatigue (SP-FS):` line format for consistency. Example: `Disposition: SP-FS 4 — Functioning slightly less than normal`. The speedometer metric box uses a tight 20px-font card and was kept compact at `SP-FS N` (e.g. `SP-FS 4`) so the full caption doesn't wrap into three lines.
- Results Metrics Explanations text rewritten to describe the new 7-tier SP-FS-aligned disposition system. The Rev 28/29 rebuild had updated the computation but left the explanation text at line 5027 still describing the old 4-tier GREEN/YELLOW/ORANGE/RED bands with their old CPA cutoffs. Also removed the `Not used in this mode` gate on the disposition explanation since disposition now applies to all modes.

## V699 Rev 29 — 2026-04-18
- Disposition system extended from Mode 2 only to ALL modes. The Rev 28 rebuild created a seven-tier SP-FS-aligned disposition but gated it on `mode2Triggered`, so Modes 1/3/4 were silently returning `null`. `computeDispositionFromCPA` renamed to `computeDisposition` (old name kept as backward-compat alias that delegates to the new function). For Mode 2, the function uses CPA as before. For Modes 1/3/4, it uses CPI — which is already on the same 0-100 scale anchored to SP-FS via the canonical `mode1Bands` captions, so the same band edges and labels apply without reinterpretation. A Mode 2 test that fails before reaching the sustained phase now falls back to CPI (still a valid 0-100 score) instead of returning null. The function now also self-gates on `isTestSuccess(result)` — failed calibrations and aborted runs get null disposition instead of being falsely assigned "Unable to function." Performance-over-time row summaries now show disposition for every successful mode: Mode 2 keeps its `CPA XX.X (label)` parenthetical; Modes 1/3/4 get a new `| Disposition: label` segment after CPI/MBS. The three summary call sites that previously gated on `mode2Triggered && dispositionCode==null` now just check `dispositionCode==null` — the function itself picks the right score per mode.

## V699 Rev 28 — 2026-04-18
- CPA disposition rebuilt as a seven-tier system aligned to SP-FS levels, replacing the prior four-tier GREEN/YELLOW/ORANGE/RED mapping. Band edges are the midpoints between the canonical CPI anchors used throughout CogSpeed (100, 80, 75, 50, 25, 11, 0 → midpoints 90, 77.5, 62.5, 37.5, 18, 5.5). `dispositionCode` is now the SP-FS numeric level as a string ("1".."7"), `dispositionLabel` is pulled directly from the `mode1Bands` captions ("Functioning exceptionally well", "Functioning very well", "Functioning normally", "Functioning slightly less than normal", "Functioning starting to slow", "Difficult to function / becoming unsafe", "Unable to function / definitely unsafe") so the disposition vocabulary matches the Cognitive Performance table exactly, and a new `dispositionSpfs` numeric field is returned for CSV/research analysis. CSV export gains a `dispositionSpfs` column. Performance-over-time row summaries now show `dispositionLabel` in the parenthetical instead of the raw code, since the row already shows input SP-FS alongside CPA and a numeric disposition code there would be confusing.
- Removed Pattern Refresher icons from the top of Memory and Survival trial pages per user feedback — the mini reference cards weren't useful during the test and consumed vertical space that should go to the gears. `renderTrialRefresher()` is now a no-op that always hides the `#trialRefresher` element. HTML markup retained (unchanged) so the change is fully reversible from a single function body if ever wanted back.
- Enlarged challenge icons on trial screens for readability. With the trial refresher gone, the stim-grid and resp-grid flex containers grow into the freed vertical space and their gears scale up automatically. Additionally bumped the `"large"` size keyword's iconSize/backSize percentages inside `buildGearSVG` so the challenge icon fills more of the gear body: Survival 54% → 66% icon / 66% → 78% back, Memory 36% → 48% icon / 48% → 60% back. Probe icon sizes also raised slightly (Survival 72% → 80%, Memory 54% → 62%) so the center gear matches. xlarge refresher cards kept unchanged — they're already large.
- CPX audit: confirmed no CPX traces remain in `app.js` or `index.html`. CPX was fully removed in V672; this rev's request to "remove all traces" is already complete in the live code. Historical V672 changelog entries noting the CPX removal are preserved as project history.

## V699 Rev 27 — 2026-04-18
- Survival Challenge sounds — substantial upgrade for perceived impact after user reported previous version "not very effective". Added stereo bus routing so whoosh cues pan from one side while impacts stay centered (mimics a weapon approaching then detonating in front of you). Replaced the 4:1 soft-knee limiter with a harder −3 dB / 8:1 / 3 dB-knee / 1 ms-attack brickwall so component gains could be raised without runaway clipping. Inserted a tanh WaveShaper (2x oversample) on the summed bus for harmonic saturation — adds density that reads as "fuller" explosion, especially on phone speakers that roll off below ~180 Hz. Replaced the single sub layer with a detuned dual-layer: 90→42 Hz + 125→70 Hz in parallel, so the two beat slightly for fatness and the higher layer covers the range small speakers actually reproduce. Added a 40 ms pre-impact sub ramp before every boom so the main hit feels earned rather than arriving from nothing. Raised gains across all components (body 0.75→0.85, crack 0.45→0.55, post-limiter trim 0.9→1.1) now that the harder limiter handles peaks cleanly. Ship gets dual-side debris rumble for a wider blast footprint. Fallback to mono bus preserved for older Safari lacking StereoPannerNode.
- Admin field #72 now correctly numbered. Device benchmark was labeled "71." in Rev 25 — a duplicate of the Mode 2 CPA block efficiency buckets field which also used "71." Renumbered Device benchmark to "72." to match its actual position.
- Admin Survival field ordering now matches Memory's pattern. Rev 25 had Survival Min duration (57), CpiBest (58), CpiWorst (59), Max duration (60) — splitting the Min/Max pair with CPI anchors between them. Memory pairs Min (50) / Max (51) adjacent. Fixed Survival to the same layout: 57=Min, 58=Max, 59=CpiBest, 60=CpiWorst, 61=Baseline, 62=MaxTestDuration.

## V699 — 2026-04-18
- Rev38 live Speedometer fix: the actual Mode 2 disposition value shown in the Speedometer window now uses the grouped Green / Yellow / Orange / Red wording instead of `SP-FS N`.
- Rev36 baseline rule update: Personal Baseline now excludes Memory Challenge and Survival Challenge sessions entirely; only Standard CogSpeed Mode 1 / Mode 2 sessions can qualify.
- Rev34 bug fix: legacy Mode 2 rows now reconstruct CPI from MBS when stored CPI is missing, before rebuilding CPA and disposition.
- Rev33 bug fix: legacy Mode 2 rows now rebuild CPA before disposition migration so old Mode 2 sessions can be normalized correctly.
- Rev33 bug fix: CSV export now normalizes each row as it exports, preventing stale legacy disposition values from leaking into the CSV.
- Rev32 bug fix: removed the undefined HISTORY_STORAGE_KEY reference and aligned load/save history migration to the same `${STORAGE_PREFIX}_history` storage key.
- Rev31 strict bug-fix: implemented real legacy history migration by normalizing saved rows on load and writing the cleaned history back to storage.
- Rev31 strict bug-fix: CSV/export and history-derived paths now normalize legacy disposition fields before use.
- Rev31 strict bug-fix: compact Mode 2 qualifying-gap rule now uses <= so exact-threshold sessions match the other views.
- Rev25 targeted fix: Pattern Refresher now rerenders from the current active Challenge Set every time it opens, fixing stale/wrong refresher content.
- Rev25 targeted fix: Tutorial page 3 now uses the challenge-specific rule card helper for Memory and Survival instead of the hardcoded standard icons.
- Rev25 targeted fix: compact Results summary path now also moves "End reason" immediately after "Session:".
- Rev24 startup parse fix: corrected the malformed End reason helper insertion that broke app.js parsing and prevented the app from opening.
- Rev23 targeted fix: existing saved profiles now sync their saved Challenge Set into active settings before opening the refresher/tutorial flow, fixing wrong Memory/Survival icon sets.
- Rev23 targeted fix: Tutorial page 3 now uses challenge-specific rule-card icons for Memory and Survival instead of the hardcoded standard dots/lines example.
- Rev23 targeted fix: improved and applied the Results-page "End reason" reordering across the real summary-builder branches.
- Rev22 startup fix: removed an early reference to the runtime state object from the admin-default repair block so the app can open normally again.
- Rev21 verification rebuild: added a runtime repair that force-updates the exact requested challenge Admin defaults when old saved overrides still contain the prior built-in values.
- Rev21 verification rebuild: moved "End reason" immediately after "Session:" across the real Results-page summary builder branches.
- Rev21 verification rebuild: bumped cache-bust strings to reduce stale app-shell issues.
- Verified and kept the requested Admin defaults: #53 = 3000, #58 = 1000, #59 = 3000, plus Memory Challenge max total test time = 240000 ms.
- Moved "End reason" up so it now appears immediately after the "Session:" line on Results pages.
- Updated Admin defaults: Memory Challenge CPI worst anchor is now 3000; Survival Challenge CPI best/worst anchors are now 1000 / 3000.
- Added Memory Challenge max total test time (default 240000 ms) as a new Admin default and runtime setting.
- Updated both Memory and Survival Challenge no-response timeouts to 15000 ms in Admin defaults and runtime fallbacks.
- Fixed the remaining Profile Challenge Set initialization bug: existing saved profiles now open showing their real saved challenge set instead of defaulting to standard.

## V699 Rev 16 — 2026-04-18
- Fixed speedometer showing stale CPI (e.g. "100") when the test failed. The Mode 2 speedometer boxes (CPI / MBS / CPA / Disposition) were built from stored result values via `getMode2SpeedometerMetric` with no awareness of whether the overall test had succeeded, so a failed test could display the last-computed CPI text alongside a zeroed needle and a "Test Failed" label — a three-way contradiction. `getMode2SpeedometerMetric` now takes a `success` argument and forces the displayed CPI/CPA text to `0.0 / 100` and MBS/Disposition to "—" when success is false. Also expanded the Survival fail-safe in `renderSpeedometerOutcome` so any failed Survival test (not just one whose outcome text happens to land in the "Dead" band) forces the dial to zero, previously the failure-zero override only ran when the outcome text matched the exact string "Dead".
- Fixed Pattern Refresher icons rendering far too small to see. The root cause was a layout bug: `.gear-img-wrap` is sized `width:100%;height:100%`, which only works when its parent has explicit dimensions. In `buildActiveRefresherCard` the gear was dropped into a flex column with no fixed width or height, so `.gear-img-wrap` collapsed to zero and the gear IMG inside rendered at its intrinsic (tiny) size. Fix: each gear now sits inside an explicit sized box (`width:100%; aspect-ratio:1; max-width:180px` for xlarge, `max-width:64px` for small-mode trial refresher cards) inside a flex:1 column, so the gear fills the full available card width. On typical phone screens the xlarge gears now render several times larger than before; on tablets the 180px cap prevents them from looking sparse in a 3-column grid.
- Fixed tutorial page throwing ReferenceError on open. `getTutorialData()` was called at four sites in the tutorial rendering code (`buildTutGearGrid`, `buildTutProbe`, `buildTutGearGridAnimated`, `buildMiniScreen`) but never defined anywhere in the file. In Rev 14 this was masked alongside the other latent bugs because the upstream parse errors prevented the tutorial code path from executing; Rev 15 parses clean so any user tapping into the tutorial would immediately hit `ReferenceError: getTutorialData is not defined`. Defined `getTutorialData()` to return the correct tutorial dataset for the active challenge set.
- Added missing `SURVIVAL_TUT_DATA`. Only `STANDARD_TUT_DATA` and `MEMORY_TUT_DATA` were defined — Survival users had no tutorial data to render even once `getTutorialData` was in place. New `SURVIVAL_TUT_DATA` mirrors the Memory structure: probe is Jet 1, correctPos=2, items populate the six grid cells with a spread of Survival icons including the paired match (Jet 2) at correctPos.
- Fixed undefined variable reference `tut.correctPos` in `buildTutRespGridAnimated` — `tut` was never declared in the function's local scope. Added `const tut = getTutorialData()` at the top of the function.
- Fixed unwanted save-reminder alert firing when the Profile page opens. The helper functions called during profile load (`profileToggleEmail`, `profileSelectGender`, `profileSelectTimeFormat`, `profileSelectSymbolSet`) each call `remindProfileSaveNeeded()` as a side effect, which pops an alert saying "You changed Profile settings. Tap Save and Continue to keep these changes." The guard flag `_profileReminderShown` was only set to false at the end of `openProfileOverlay` via `resetProfileChangeReminder()`, so the first of those four calls during programmatic load would fire the alert before the user had done anything. Rev 14 masked this because its parse errors prevented the profile flow from executing at all. Fix: pre-set `_profileReminderShown = true` at the start of the programmatic load block so the guard suppresses reminders during initialization, then the existing `resetProfileChangeReminder()` call at the end re-enables it so real user edits fire the alert as intended. Same fix applied to `resetProfile()` since the user just tapped Reset and doesn't need a second alert telling them they changed something.
- Fixed "froze on Profile" bug. `openProfileOverlay` and `saveAndContinueProfile` both called `captureProfileInitialSnapshot()` but that function was never defined anywhere in the file. In Rev 14 this was masked because upstream parse errors (`let const rawSymbolSet`, `const _pbm` redeclaration) prevented the module from fully evaluating, leaving profile handlers unwired and the code path unreachable. Once Rev 15 fixed those parse errors the file evaluated cleanly — and the undefined-reference call immediately threw `ReferenceError: captureProfileInitialSnapshot is not defined` mid-way through profile opening. The overlay appeared in a half-initialized state (scheduler settings never loaded, save-reminder tracker never reset, bindings incomplete) which read to the user as "frozen". Defined `captureProfileInitialSnapshot()` as a proper state snapshot of the current form values so the two call sites no longer throw.
- Rebuilt Survival Challenge correct-tap sounds with real OOMPH. Previous version routed every sub-component through its own aggressive DynamicsCompressor (−28 dB threshold, 24 dB knee, 10:1 ratio, 3 ms attack) running in parallel, which crushed each component to roughly −24 dBFS before summing — the stated 0.44 peak gain reached the speakers at closer to 0.06 linear. New architecture sums all components through a single master bus gain → single master compressor (−6 dB, 6 dB knee, 4:1, 2 ms attack, 120 ms release) acting as a transient-preserving limiter, so peaks are caught but body breathes.
- Rebuilt the boom primitive as a 3-layer impact: (1) sub-thump — 90→42 Hz sine with 3 ms impulse attack, (2) mid body — filtered noise 180–1400 Hz with steep decay, (3) high crack — brief 2.5–5.5 kHz HP noise burst. The old boom was a single 210 Hz-lowpassed noise tail with no transient head; the new one has real impact energy in the ear-grabbing bands.
- Added a whoosh envelope option to the noise primitive (bell-curve fade-in + fade-out) so incoming cues for jets / rocket / helo families actually arrive and don't just thud.
- Retuned all six family compositions with higher peak gains (up to 0.95) now that the master limiter can genuinely catch them: tank adds a bright muzzle crack ahead of the thud; ship gets a sub-heavy extended detonation with debris rumble; jets / rocket / helo differ by whoosh speed and center frequency; space keeps its 3-chirp laser zap sequence.
- Fixed a shipped hard syntax error at former line 4155: `let const rawSymbolSet = String(existing?.symbolSet || settings.symbolSet || "standard");` — orphaned code fragment at module scope that was never valid JavaScript. Replaced with a clean `let _profileSymbolSet = "standard"` declaration, which was the variable that line was ambiguously trying to initialize.
- Fixed shipped const redeclarations at former lines 8780–8781: `const _pbm` and `const _pby` collided with identically-named consts declared at lines 7412–7413. Renamed the second set to `_pbm_sr` / `_pby_sr` ("save reminder" suffix, matching the handler's purpose) to eliminate the collision. Both parse errors together prevented `node --check app.js` from passing on V699 Rev 14; Rev 15 now parses clean.
- Hardened `loadSettings()` against corrupt localStorage: previous code ran `JSON.parse(localStorage.getItem(...))` at module load time with no try/catch, so a partial-write or corrupted settings blob could wedge the entire app at boot. Now falls back to DEFAULTS on parse failure.
- Hardened `computeCPI(avgMs)` against non-finite input: now coerces via `Number()` and returns 0 for NaN / Infinity / null, instead of silently leaking NaN into downstream CPI values via callers that passed numeric-looking but non-finite values.
- Hardened profile save against localStorage quota/availability failures: `saveAndContinueProfile` now wraps `saveProfile()` in try/catch and surfaces a clear "Profile could not be saved — your browser storage may be full or restricted." status message, instead of failing silently while showing "Profile saved".

## V699 — 2026-04-17
- Added a one-time Profile change reminder. When the user changes Profile settings, the app now alerts them to tap Save and Continue.
- The reminder uses a specific Challenge Set message when the Challenge Set menu is changed.
- Added a Profile-page unsaved-changes alert. If the user changes Profile settings and tries to leave without saving, the app now warns them to tap Save and Continue.
- The alert uses a more specific message when the Challenge Set was changed: "Challenge Set changed. Tap Save and Continue to use the new test."
- Fixed the About page by moving the Additional Challenge Tests section inside the page box and placing it immediately before Sponsor and contact.
- Enlarged Pattern Refresher icons again with a new xlarge icon rendering mode and larger refresher cards.
- Fixed Challenge Set menu behavior so existing profiles show and use their real saved challenge set, while new profiles still default to CogSpeed Sustained - Mode 2.
- Enlarged the Pattern Refresher icons on the page shown right after Continue as much as practical.
- Made the standard Profile Challenge Set label read "CogSpeed Sustained - Mode 2" and kept the Profile page default on standard.
- Increased Survival audio loudness and strengthened its startup reliability.
- Updated the About page by preserving the original page and inserting a short Additional Challenge Tests section that keeps CogSpeed Sustained - Mode 2 as the main focus of the program.
- Fixed Survival Speedometer so a "Dead" outcome now forces CPI to display as 0 instead of 100.
- Enlarged icon-challenge Pattern Refresher icons on the overlay page as much as practical by using large gear rendering there.
- Renamed the standard Profile Challenge Set entry to "CogSpeed Sustained - Mode 2" and made the Profile page always default that selector back to standard when opened.
- Focused Survival repair pass: active Challenge Set resolution now prefers the saved settings value so stale profile state no longer forces the wrong refresher/icon set.
- Enlarged Survival icons substantially on trial pages and refresher cards for better readability.
- Centralized Survival correct-tap sounds in flashBtn() so every correct response path triggers the sound exactly once.
- Made Survival WebAudio startup more reliable on mobile by resuming the AudioContext before emitting the sound.
- Tightened active refresher rendering so Survival refresher cards always use the active saved Survival set and requested pair order.
- Added a symbolSet column to the CSV export so Standard, Memory, and Survival sessions can be distinguished in downstream research analysis; legacy records without the field export as "standard".
- Added a Challenge Set badge (Std / Memory / Survival) to the session selector dropdowns on both the Summary page and the Speedometer page.
- Made the Performance Over Time chart's MBS-ms left-axis labels Challenge-Set-aware: homogeneous ranges use the correct anchors for that set (Standard 800/2800, Memory 1400/5000, Survival 1500/5200); mixed-set ranges suppress the ms tick numbers and label the axis "MBS ms (mixed sets — hidden)" since a single y-axis cannot unambiguously label three different ms scales simultaneously.
- CPI dots continue to plot at the correct y-position in all cases because each session's CPI is already pre-normalized against its own anchors at session-finish time.
- Updated visible app/package versioning to V699 across app.js APP_VERSION, index.html title/badge/statusLine/cache-buster, manifest.json, and sw.js RELEASE.

## V698 — 2026-04-17
- Fixed a historical-session rendering bug by saving the selected Challenge Set into each result record.
- Speedometer outcome wording now uses the saved session's Challenge Set instead of the current profile selection, so historical Survival sessions keep their Survival labels.
- Rewrote Survival Challenge correct-tap sounds: every family now resolves to an impact/explosion rather than a vehicle timbre (the reward sound is the kill, not the kill method).
- Jets, rocket, and helo share an identical boom tail but have distinct whoosh heads (fast-high ~120ms for jets, long mid-band ~260ms for rocket, short-low ~100ms for helo).
- Tank is now a cannon boom with a sharp muzzle crack plus low thud; ship is a deeper larger-scale naval detonation with debris tail; space is a laser zap plus the shared boom.
- Previous build had only 5 audio branches for 6 families, so rocket (icons 7-8) and helo (icons 11-12) shared an identical fallback — now each has its own distinct cue.
- Added lpNoise() WebAudio helper for lowpass-filtered decaying noise used by all explosion bodies.
- All cues remain below 440ms total duration and peak gain 0.32, so they never bleed into the next trial's RT window and do not clip.
- Added Admin field #61 survivalMaxTestDurationMs (default 200000ms) so Survival Mode 1/2 sessions get extra budget over the 150000ms used by Standard/Memory; slower Survival frame timing (min 1500ms, max 5200ms) can otherwise run up against the session cap before the sustained + final phases finish.
- Renumbered Mode 2 CPA admin fields to 62-70 and diagnostics field to 71 to keep numbering sequential after the new Survival field.
- Fixed a stale duplicate label number in the CPA correct buckets admin field (was showing "62" on both the header and first two rows).
- Fixed getActiveSymbolSet() to whitelist-normalize the symbol set value so corrupted or unrecognized values fall through to "standard" rather than silently skipping both the Memory and Survival branches.
- Fixed hardcoded 3500ms fallback in the Mode 2 sustained rate clamp so Survival's larger maxDurationMs is respected even when getCurrentMaxDurationMs() returns a falsy value; now uses DEFAULTS.maxDurationMs as the fallback instead of a magic number.
- Fixed an orphan closing </div> on index.html line 784 left over from the V696 sleep-prompt flow simplification; browser DOM depth is now balanced (was -1 in V697).
- Fixed indent drift on the Survival Challenge option in the Challenge Set selector (was 10 spaces vs 8 for Standard/Memory).
- Rewrote the Challenge Set field hint to cover both Memory and Survival (previously only mentioned Memory even though Survival was also available).
- Removed a stale duplicate comment line in ADMIN_FIELDS that showed old pre-Memory/Survival numbering "// 49-57. Mode 2 CPA editable defaults" next to the correct "// 61-69" header.
- Updated visible app/package versioning to V698 across app.js APP_VERSION, index.html title/badge/statusLine, manifest.json, sw.js RELEASE, and the app.js cache-buster query.

## V697 — 2026-04-17
- Added a third Challenge Set on the Profile page: CogSpeed Survival Challenge.
- Added the full 12-icon Survival Challenge trial generator, Survival Pattern Refresher, and Survival tutorial content using the requested icon-pair order.
- Added separate Survival Challenge defaults for timeout, min/max paced duration, CPI anchors, and baseline qualification threshold.
- Added temporary per-family correct-tap sounds for Survival Challenge trials.
- Survival speedometer outcome text now uses 7 CPI-band labels matched to the Cognitive Performance Table: Victorious!, Winning!, Stand Off, Wounded, Crippled, Dying, Dead.
- Also fixed two pre-existing Memory Challenge regressions in this branch: recursive min/max duration getters and recursive tutorial rule-card text.
- Improved Memory Challenge icon contrast on the Pattern Refresher page and trial page by adding a light circular backdrop behind the icons inside gears.
- This specifically improves visibility for the dark triangle, circle, and square symbols against the dark gear backgrounds.
- Added the Memory Challenge Pattern Refresher directly to each trial page, styled like the first test and shown as 2 rows of 3 in the requested pair order.
- The trial-page Memory Challenge refresher now disappears automatically once baseline is established for the current subject.
- Kept the smaller Memory Challenge icon sizing inside gears and tightened tutorial wording for icon-pair matching.
- Fixed Memory Challenge Pattern Refresher to display as 2 rows of 3 cards in the requested pair order.
- Reduced Memory Challenge icon size inside gears for trial, refresher, and tutorial readability.
- Updated Memory Challenge tutorial text and rule examples so they explain icon-pair matching instead of dots/lines.
- Added a new selectable Challenge Set on the Profile page: Standard CogSpeed or CogSpeed Memory Challenge.
- Added full 12-icon Memory Challenge assets and trial generation using paired-match logic across the two specified number groups.
- Memory Challenge now swaps in its own Pattern Refresher icons, Tutorial icons, and separate admin defaults for timeout, min/max paced duration, CPI anchors, and baseline qualification threshold.
- Standard CogSpeed behavior and defaults remain unchanged when the standard set is selected.

## V696 — 2026-04-15
- Added a fuller code-comment pass for the Sleep Logger model, including first-vs-later prompt wording, YES/NO carry-forward semantics, required Sleep Quality on new sleep entry, and the meanings of Total time asleep / Total time awake / Time since last test.
- Removed dead unreachable quality-null cleanup code from continueFromSleepLogger() after Sleep Quality became required.
- Added an explicit code note documenting the intended carried-forward sleep semantics used in results and CSV rows.
- Sleep Quality is now required whenever new sleep data is entered; a new sleep entry replaces the prior one and remains the active reference until the next new sleep entry.
- Restored the intended sleep carry-forward behavior: on No, results continue to show the last actual sleep episode's total time asleep while time awake continues from the carried-forward wake time.
- Added a shared getSessionSleptMinutes helper and used it in both Summary and Speedometer so historical No-session records no longer disagree between views.
- Removed the dead getCurrentTestWakeDateTimeIso function.
- Made sleep status-bar messages match the dynamic first-test vs later-test prompt wording.
- Routed sleep-prompt back-navigation through showSleepPrompt() so the prompt text always refreshes correctly.
- Sleep prompt wording is now context-sensitive: first test shows 'Have you slept before this test?' and later tests show 'Have you slept since LAST TEST?'
- Removed the now-unreachable lastWakeOverlay code and HTML after the sleep prompt flow was simplified to Yes → Sleep Logger and No → Test.
- Fixed the remaining wake-time priority inconsistency in formatSleepLine so lastWakeDateTimeIso is preferred everywhere.
- Fixed the first-test summary so 'Time since last test' is omitted when no prior test exists, instead of showing 0h 0m.
- Fixed a sleep-results regression by adding the missing minutesBetweenIso helper used for awake-time calculations.
- Fixed No-session sleep metrics so Total time asleep is always 0 when the subject answers No, even with carried-forward sleep context.
- Unified sleep wake-time priority to prefer lastWakeDateTimeIso consistently across the code.
- Normalized saved No-session records so sleepLog.durationMinutes is stored as 0, avoiding contradictory CSV/result rows.
- Removed the immediate back-to-back scheduler voice repeat; Repeat Once now relies on the later reminder repeat instead of speaking twice immediately.
- Fixed carried-forward sleep results so first-test 'time since last test' displays as 0h 0m, and aligned the Fatigue back button with the new sleep-question routing.
- Sleep carry-forward now works across tests: answering No preserves the most recent prior sleep episode for total asleep/awake calculations until the next Yes creates a new sleep episode.
- Both result views now show total time awake, total time asleep, and total time since last test.
- Both result summaries now show total time awake, total time asleep, and total time since last test.
- Sleep prompt routing now does exactly: Yes → Sleep Logger, No → Test.
- Updated the sleep prompt wording to: "Have you slept since LAST TEST?"
- Date-of-birth month/year inputs and the age-valid message now turn green when the 14-or-older requirement is satisfied.
- Date-of-birth validation now turns the month/year entry state green when the 14-or-older requirement is satisfied.
- Rechecked and aligned visible version references across app.js, index.html, service worker release, and manifest where needed.
- Profile time-format buttons now use the same green selected-state styling and tap flash feedback as other selectable controls.
- Restored the red selected-state cue for Scheduler OFF while keeping other scheduler selections green.
- Increased scheduler alert-sound playback to maximum in-app volume.
- Set scheduler voice prompts to maximum speech-synthesis volume.
- Scheduler voice prompts now optionally repeat once when the Repeat Once setting is enabled.
- Extended scheduler green selected-state highlighting to all scheduler selections and toggle rows.
- Extended scheduler tap/press flash feedback to all scheduler controls, including inputs, selectors, toggles, and test/reset buttons.
- Scheduler selection buttons now keep a persistent green selected state like the Gender buttons.
- This applies to Scheduler ON/OFF, Anytime/Personal/Fit for Duty, and Every X Hours/Daily Times.
- Added explicit touch/click press feedback for scheduler controls so buttons visibly react on mobile devices.
- Strengthened Scheduler 'Clear Reminder Status' into a real reminder-status reset: it now recalculates next reminder timing, clears pending background/repeat state, refreshes fields, and rearms timers.
- Updated visible app/package versioning to V696.
- Added self-paced double-tap guards for calibration, recovery, terminal_recovery, and mode2_final so only the first tap can resolve each self-paced trial.
- This prevents phantom extra self-paced trials, duplicated wrong counts, and premature completion from rapid double-taps.
- Fixed a double-finish / duplicate-history-entry bug in Mode 2 sustained wrong-response termination paths by honoring checkMode2SustainedRollingMean(false) return values.
- Added a finish() re-entry guard as belt-and-suspenders against duplicate result saves.
- Reapplied the mode2_final no-timeout cleanup and trimmed lingering blank whitespace.
- Fixed the stale CPI scale comment so it matches the current 800/2800 defaults.
- Removed the dead mode2_final no-response arming call in openTrial() and replaced it with a clarifying comment.
- Corrected Admin field #5 and #26 labels from default 8000 to default 10000.
- Marked the post-test SP-FS delta note as an explicit TODO.
- Removed dead sleep-window fallback code left behind after the no-autocorrection change.
- Removed the orphaned Results-button comment block and blank whitespace from index.html.
- Updated the CPI scale comment to match the current 800/2800 defaults.
- Removed the no-op mode2_final armNoResponseTimer call in openTrial() and replaced it with a clarifying comment.
- Changed Admin default #33 CPI best ms anchor from 1000 to 800.
- Changed Admin default #34 CPI worst ms anchor from 2400 to 2800.
- Changed Admin default #35 Personal Baseline maximum qualifying MBS from 1800 ms to 1900 ms.
- Updated related default labels and fallback text so CPI/MBS/baseline references follow the new defaults.
- Fixed the adaptive-summary MBS block-gap display so the reported block difference is always shown as an absolute positive ms value.
- On version change, Guest sessions are cleared from saved history automatically.
- Registered-user sessions remain preserved across version updates.
- Added a dedicated app-version marker for version-change cleanup behavior.
- Updated visible app/package versioning to V695.
- Fixed adaptive summary reporting so MBS and CPI are shown only when the consecutive block pair actually meets the qualifyingBlockGapMs threshold; otherwise the summary reports that no qualifying MBS/CPI was found.
- Fixed the Mode 2 Scheduler Guest panel so the "Registered user required. Guest cannot use Scheduler." warning appears only once.
- Removed the duplicate "Registered user required. Guest cannot use Scheduler." line from the Mode 2 Scheduler panel.
- Fixed the remaining scheduler window-boundary inconsistency so personal window end handling now uses the same inclusive/exclusive convention as quiet-hours clamping.
- Removed the 36-hour silent sleep-window auto-correction so large bed/wake discrepancies are no longer silently rewritten.
- Documented the post-restore profileguard marker write instead of leaving it unexplained.
- Removed dead CSS selectors and the orphan #histGraphChart rule from index.html, and cleaned a few redundant wrapper classes.
- Removed remaining "saved subject" scheduler wording so the UI consistently says "registered user".
- Fixed delayed-reopen handling by guarding openTrial() after finish()/idle and unified recovery return handling.
- Removed the unreachable mode2_final branch from the no-response timer callback.
- Fixed multiple Mode 2 CPA issues: Field 54 now controls the per-component clamp floor, bucket specs reject overlap, bucket matching rounds to 2 decimals, drift is null-guarded, and drift ratio exports null when insufficient data exists.
- Fixed the CPA disposition boundary so CPA = 65 is GREEN.
- Cleaned up the Mode 2 summary by removing the duplicate CPA block, making the MBS gap text use the current qualifyingBlockGapMs setting, and renaming the local CPI variable.
- Fixed Performance Over Time legend overlap and allowed Mode 3 sessions to contribute plotted CPI/ring values.
- Fixed scheduler and backup issues: personal scheduler time sorting/window handling, missing SP-FS no longer acts like zero, legacy untimestamped baseline records are ignored, backup now includes scheduler settings, restore reinstates them, and backup formatVersion is now bounded.
- Updated remaining scheduler wording to say "registered user" instead of "saved subject" where applicable.
- Updated visible app/package versioning to V694.
- Fixed the remaining Mode 2 Scheduler Guest-warning strings in both index.html and app.js so only one "registered user" message is shown.
- Updated Mode 2 Scheduler guest-warning wording to say "registered user" and removed the duplicate message.\n- Guest sessions are saved and shown in Speedometer/history again.\n- Guest sessions remain excluded from Personal Baseline qualification and rolling-baseline updates.
- Replaced tutorial page 1 with the approved preparation, test-hygiene, and baseline checklist.
- Inverted the Personal Baseline graph so better (lower ms) values plot higher, matching the other graphs.
- Fixed the Personal Baseline graph so it scales to phone width instead of forcing an 860 px-wide SVG.
- Clarified that sessions above the Personal Baseline qualifying MBS threshold do not update or replace the rolling baseline.
- Moved personalBaselineMaxMbs within DEFAULTS so its placement matches the Admin field order and Mode 1 grouping.
- Clarified the code comment that DEFAULTS and ADMIN_FIELDS should stay aligned in conceptual order.
- Removed duplicate tutNextBtn and tutSkipBtn event wiring so tutorial navigation is assigned in one place.
- Renamed the Personal Baseline Admin/settings key from personalBaselineMinMbs to personalBaselineMaxMbs to match its actual maximum-threshold semantics.
- Added backward-compatible settings migration so older saved Admin values still carry forward after the key rename.
- Preserved registered-user data while stopping Guest history from persisting to local storage.
- Added launch-time clearing of transient current-session UI/result state.
- Sanitized persisted history on load so old Guest sessions are removed automatically.
- Added BASELINE to Results Metric Explanations.
- Fixed Personal Baseline qualification logic so sessions count when adaptive-phase MBS is at or below the Admin qualifying threshold, rather than above it.
- Updated Admin/baseline wording to reflect that the Personal Baseline threshold is a maximum qualifying MBS.
- Reordered Admin defaults to match program-use order more closely across shared flow, Mode 1, Mode 2 runtime, Mode 3, Mode 4, and Mode 2 CPA editable defaults.
- Corrected the Admin-page Mode 2 CPA editable-default numbering and explanatory text so fields 49–57 match the displayed bucket/default specs.
- Removed the bundled About PDF from the package.
- Added a tutorial Back 1 Page button on every tutorial page.
- Personal Baseline graph now uses the live Admin baseline MBS threshold in its displayed text.
- Speedometer dropdown reordered so Personal Baseline is second from bottom and E-mail is last.
- Added editable Admin default for Personal Baseline minimum qualifying MBS.
- Raised the Personal Baseline qualifying MBS default from 1500 ms to 1800 ms.
- Reordered Admin defaults to follow the program’s actual usage flow more closely.
- Revised CPA labels and explanatory text to reflect actual bucket behavior without changing the CPA formula.
- Updated the Start page layout: enlarged About CogSpeed and Speedometer, moved them directly under Continue, and moved Privacy Policy and Terms of Service to the bottom corners while leaving the admin link unchanged.
- Corrected packaged version-string literals in `index.html` so the title, version badge, and status line all ship as V693 instead of stale V688 placeholders.
- Preserved the Speedometer Mode 2 CPI/CPA toggle selection across return-to-Start navigation by removing the reset from trial-state clearing.
- Clarified intro auto-advance comments to document the cached-GIF `introGif.complete` case.
- Corrected the stale `initialMeasuredCalibrationTrials` comment to match the actual default of 7.
- Updated paced-transition logic so every correct response always speeds up pacing; late-rescue correct responses now receive the minimum correct-response speedup instead of a slowdown.
- Removed contradictory pacing-comment text that still described a correct-response slowdown path, and tightened related late-response comment wording.

## V691
- Expanded the tutorial from 5 to 7 pages by adding a Personal Baseline explanation page and a Profile Scheduler explanation page after the test-instructions pages.
- Changed the tutorial secondary button on every page to read `SKIP TO TEST` so subjects can jump directly to testing from any tutorial page.
- Updated tutorial progress dots and navigation logic to support the new pages and keep the final page start-test action intact.

## V690
- Speedometer baseline menu now opens an in-app Personal Baseline page instead of downloading a file.
- Added Personal Baseline overlay with baseline status, graph, and table for the viewed session.
- Speedometer menu label changed from Download Personal Baseline to Personal Baseline.

## V689
- Fixed Fit for Duty CPI extraction to read `cognitivePerformanceIndex` from saved results, so CPI-based reminder branching works again.
- Reused `scheduleNextReminderFromNow()` in reminder action paths to remove stale dead-code drift and keep recompute/persist/rearm logic in one place.

# V688 — 2026-04-15
- Hardened service worker install so optional media-cache failures do not abort installation.
- Fixed Scheduler Device Test service worker status so PASS requires an active controller.
- Hardened offline fallback to return cached or network index.html instead of resolving to undefined.

# V687 — 2026-04-15
- Fixed scheduler save-button drift by adding a real Save Scheduler Settings button and handler.
- Fixed Personal Baseline to compute historically as of the viewed session time instead of using future sessions.
- Moved scheduler audio files to the package root; updated playback paths and service-worker cache list.
- Removed vestigial Speedometer outcome-reason element after the concise outcome cleanup.

# V686 — 2026-04-15

- Speedometer cleanup: removed the repetitive outcome end-reason text directly below Success!/Failed.
- Preserved the existing detailed session information elsewhere on Speedometer and Results pages.

# V685 — 2026-04-15

- Added Personal Baseline as a rolling average of the most recent 5 qualifying Mode 1 / Mode 2 adaptive-phase MBS scores.
- Baseline qualifies only for non-failed sessions with adaptive-phase MBS > 1800 ms and SP-FS 5, 6, or 7.
- Personal Baseline now appears on the Speedometer and in Results Summary pages.
- Added Speedometer dropdown item `Download Personal Baseline` as the last menu item; it downloads a self-contained HTML report with status block, table, and graph.
- Fixed a critical Mode 2 duration bug: sustained-only elapsed subtraction now uses the logged `durationMs` field and no longer double-counts with `+ rt`.
- Fixed scheduler timer state consistency by declaring `bgTestTimerId` in `schedulerState`.
- Kept scheduler sound/voice timing fixes from V684 and added baseline comments explaining how rolling baseline works and why failed sessions stay in history only.

# V684 — 2026-04-15

- Mode 2 total test duration now excludes sustained fixed-rate trial time; sustained-only duration is reported separately in the results summary.
- Scheduler sound test now waits for the bundled clip to end before asking for confirmation, and voice test now waits for text-to-speech to finish before prompting.
- Scheduler Save Settings button wiring was prepared in code for direct use if present in the UI.

## V683
- Fixed Fit for Duty SP-FS extraction so scheduler reads `samnPerelli.score` from saved Mode 2 results instead of coercing the whole object to `NaN`.
- Corrected Fit for Duty SP-FS thresholds to match the Samn-Perelli scale orientation: lower SP-FS now shortens the next interval and higher SP-FS can lengthen it.
- Fixed the 1-minute Scheduler background test so it uses its own timer, never overwrites the real reminder timer, and rearms the real reminder after the test completes.
- Refactored scheduler draft saving into a shared helper used by Profile Save & Continue so scheduler save logic is no longer dead drift.
- Separated the Fit for Duty-only incomplete-session filter from the general Scheduler Status readout so Last Completed Mode 2 reflects the latest session seen by the subject.
- Added scheduler comments clarifying one-device local use, offline behavior, reminder types, and how the scheduler save/helper/timer flow works.
- Advanced package versioning to V683 and aligned APP_VERSION, visible labels, app.js cache-bust, service worker release, manifest, and packaged folder naming.

## V682
- Added a new Mode 2 Scheduler on the asterisk / Profile page for saved subjects only.
- Scheduler supports 3 local schedule types: Anytime, Personal, and Fit for Duty.
- Added local bundled alert sounds (Soft Chime, Beep, Double Beep) plus optional device text-to-speech voice alerts.
- Added Scheduler Status and Scheduler Device Test sections, including local-save, text, sound, voice, notification, and 1-minute background reminder checks.
- Added code comments that explain what the Scheduler does, how to use it, and its key limits: saved subject only, one device only, and device-dependent closed-app alerts.
- Advanced package versioning to V682 and aligned APP_VERSION, visible labels, app.js cache-bust, service worker release, manifest, and packaged audio assets.

## V681
- Rebuilt from the wording-refresh branch as a fully versioned V681 package.
- Hardened success classification in isTestSuccess() so wording-only end-message changes do not flip completed sessions to Failed.
- Added direct recognition for Mode 1/2/3/4 completion prefixes and refreshed time-complete wording.
- Preserved legacy success-string recognition for older stored sessions.
- Corrected isPerfFailureSession() so refreshed practice/retest wording and refreshed Mode 2 sustained-stop wording are classified as failed sessions in the Performance Over Date and Time chart.
- Fixed the failed-session regex to use a real word-boundary (\b) matcher.

## V680
- Advanced the V679 wording-refresh rebuild to V680 so the package filename, APP_VERSION, visible labels, app.js cache-bust, and service-worker release all move together.
- Fixed stale end-reason classifier matching in `isTestSuccess()` so the refreshed success wording maps correctly to successful outcomes on the Speedometer and legacy success strings remain recognized.
- Fixed stale end-reason classifier matching in `isPerfFailureSession()` so refreshed practice/retest strings and refreshed Mode 2 sustained-stop strings are correctly treated as failed/non-plottable sessions on the Performance Over Date and Time graph.

## V679
- Advanced the approved wording-refresh rebuild to V679 so the package filename, APP_VERSION, visible labels, app.js cache-bust, and service-worker release all move together.
- Fixed success/failure status classification so refreshed end-message wording still maps completed sessions to Success on the Speedometer.
- Replaced session-end user-facing messages with clearer, more consistent wording while preserving the exact ending logic by category: success, practice/retest, threshold stops, and time-limit stops.
- Renamed misnamed `usesMode4Metrics` to `usesMode2Metrics` in Results Metric Explanations. Logic was already correct for Mode 2; this is a maintenance-safety cleanup to prevent future stale interpretation.
- Added a clarifying code comment on Speedometer Prev/Next navigation: the list is sorted newest-first, so Prev intentionally moves to an older session and Next to a newer one.
- Focused audit completed on the packaged V679 build.
- Fixed a real Sleep Logger wiring bug: `app.js` already read and listened to `sleepWakeDaySelect`, but `index.html` did not include that control. The wake-entry day marker is now present so wake-time validation and saved sleep windows match the UI.
- Clarified the Sleep Logger save-path comment so it explicitly documents canonical time storage, separate day markers, validated date-time windows, and persisted ISO timestamps.
- Re-ran package/version alignment and basic static audit checks: `APP_VERSION`, visible HTML labels, `app.js?v=679`, `manifest.json`, and `sw.js` all match V679.
- JavaScript syntax check passed for `app.js` and `sw.js`.
- Fixed paced_late_wrong state restoration so state.current and presentedRoundDuration are restored before any early return from the paced wrong-limit check.
- Fixed performance-failure classification so all-caps "NEED MORE PRACTICE!" sessions are recognized as failed / invalid sessions.
- Noted that speedometerLatestSessionIndex is currently reserved / unused to avoid future confusion.

## V677
- Fixed APP_VERSION mismatch so live JS, storage namespace, static HTML, and service worker all align on V677.
- Marked Mode 2 sustained wrong-response limit stops as failures in both isTestSuccess() and isPerfFailureSession().
- Removed duplicate Results Metric Explanations paragraphs for recovery ratio, lapse rate, and block formation efficiency.
- Revised CPA factor 8 explanation to describe rapid block formation neutrally and operationally.

## V676
- Fixed Mode 2 CPA max-reduction-factor fallback so Admin field 54 honors valid numeric inputs without forcing 0.9 on falsy values.
- Updated performance-over-time text export to use CPI/MBS wording for Mode 2 instead of stale SPI/CSR-SBLP labels.
- Changed Mode 2 CPA CV% and drift descriptors to use correct-only sustained RTs for consistency scoring.

## V674
- Added the new Mode 2 CPA factor defaults to the Admin page defaults/help block so fields 49–57 now show the live default bucket specs and max reduction cap in one place.

# CogSpeed Change Log

## V673
- Expanded Mode 2 CPA to use sustained RT CV%, recovery÷calibration RT ratio, sustained-phase lapse rate, and block formation efficiency.
- Enforced Admin field 54 (Mode 2 CPA max total reduction factor × CPI) as a real cap on total negative CPA adjustment.
- Replaced raw SD bucket defaults with CV% bucket defaults in Admin and results text for better scale invariance across subjects.
- Added new CPA metrics to CSV export, Results - Complete, and metric explanations.
- Documented the semantic shift: cpaSdWeighting now reflects CV-based weighting for new sessions; old sessions may retain prior SD-based values.

## V672 — version strings corrected; CPX references removed

- Corrected stale V658 version strings in index.html.
- Removed all remaining CPX references from the package text/history.

V668
- Sleep Logger now shows Yesterday / Today day-marker selectors prominently for both bedtime and wake time in all time-entry modes.

## V666
- Sleep metrics wording updated to "Since last waking" / "Total hours last slept" with sleep quality score and bed/wake day tags.
- Sleep Logger now includes Yesterday/Today selectors for sleep and wake times.
- Speedometer needle tail removed and CPI/CPA label moved to bottom of dial.

## V665
- moved Speedometer CPI/CPA label into the upper dial sector so the live needle no longer obscures it
- made calibration and sustained/final self-paced background blue slightly darker while keeping them matched

V663
- Graph legend now says “Green diamond = SP-FS”.
- Enlarged MBS label and window text on Speedometer dial.
- Calibration and Sustained phases continue to use the same light blue test background.

## V662
- Reverted to the clean live-drawn Speedometer with a vintage-style spear needle.
- Increased MBS label prominence on the dial and kept MBS in the rectangular window.
- Made the Mode 2 Speedometer toggle fully switch the summary boxes between CPA/Disposition and CPI/MBS.
- Reworked the outer dial arc to seven bands aligned to the disposition score ranges.
- Made CPA markers on the Performance Over Date and Time Graph more visually distinct and added a clearer offset square marker.

V658
- Vintage dial: masked baked-in image needle so only the live needle remains.

## V657
- Sleep Logger prompt changed to “Have you slept before this test?”
- Sleep Logger main instruction clarified for entered sleep/wake times before this test
- Sleep quality middle option renamed from Okay to Restless throughout UI/results

## V651
- Restored the original analog-style Speedometer look with a cream dial face, black ticks/numerals, chrome bezel, and rectangular MBS window while keeping the 7-band outer color arc.

## V650
- Fixed showResultsPage results handoff so Speedometer and summary selectors sync to the newest saved session after the result is written to history.

## V646
- Changed Admin item 32 default to `1.1` for **Mode 2 sustained start factor × MBS**.
- Added a **Mode 2 CPA defaults** note block on the Admin page listing the current CPA weighting rules for correct, wrong, missed, sustained RT SD, drift ratio, and the max CPA reduction of `CPI × 0.9`.

## V644
- Keep Fix 8 in the late-rescue path.
- Keep hadResponse = false for the current frame after a late-rescue.
- Replace the stale comment so it correctly explains why the current frame remains open.

## V643
- Fix stale app.js cache buster to load V643 script.
- Fix late-rescue path so current frame remains open for response scoring.
- Realign CSV export headers with row data after stale metrics cleanup.
- Rename stale Mode 2 performance-history helper variable for clarity.

## V642
- Speedometer now defaults and re-syncs to the most recent saved session after each completed session.
- Updated the dial to seven equally spaced color bands from dark red through dark green.
- Revised Mode 2 CPA Disposition thresholds and labels to GREEN >65, YELLOW 45–64, ORANGE 30–44, RED <30, and synced the Speedometer box/reporting text.

## V638
- Fixed stale app version constant in app.js from V633 to V638 so the live start page, storage prefix, and session namespace now match the actual build.
- This isolates V638 storage/history from older V633 sessions.

## V630
- Rebuilt from V629.
- Fixed Mode 2 CPA drift weighting to use the bucketed slowing ranges instead of the unintended continuous drift penalty.
- Shortened the intro auto-advance so the Firebird logo remains up for about 1 second after the GMM spin completes.
- Removed remaining live CDI explanatory text from metric explanations while keeping SPI itself.
- No pacing, response-handling, or mode-routing changes outside the CPA and intro timing fixes.
## V625 — CPA/Disposition repair rebuild from V619

- Rebuilt from V619 as the baseline to avoid the broken CPA patch chain.
- Added Mode 2 sustained CPA and CPA-based disposition to results.
- Added CPA/Disposition view to the Mode 2 Speedometer dial with CPI/MBS toggle.
- Fixed `computeCPI()` to use DEFAULTS fallbacks for CPI anchors.

## V625 — Performance Over Date and Time graph CPI/MBS correction

- Corrected the Performance Over Date and Time graph so the blue marker always plots CPI for all modes, including Mode 2 CogSpeed Sustained.
- Kept the orange MBS ring as a companion marker at the same CPI position by design, instead of implying an independently plotted SPI or SBLP point.
- Changed graph metric preference so Mode 2 sessions use adaptive MBS before SBLP when deriving CPI and the left-axis MBS labels.
- Moved the SP-FS right-side scale and label farther right for readability.
- Updated package/app version strings to V625.

## V618 — Admin label clarification for Mode 1 restart
- Updated Admin item 18 text to: `Mode 1 restart multiplier after block (default 1.3 = 130% of block baseline)`.
- Preserved Admin item 34 text: `Mode 2 wrong-fail threshold for sustained phase (default 50% of sustained trials)`.
- Updated package/app version strings to V618.

## V617 — Admin label clarification for Mode 2 wrong-fail threshold
- Updated Admin item 34 text to: `Mode 2 wrong-fail threshold for sustained phase (default 50% of sustained trials)`.
- No logic changes.

## V616 — sustained wrong-fail default corrected to 50%

- Changed `mode4SustainedWrongFailPercent` default from 20% to 50%.
- Admin label now reads: `Mode 2 wrong-fail threshold (% of sustained trials, default 50)`.
- With the default 20 sustained trials, the default wrong-fail limit is now 10 wrong responses.
- Added the shared helper `getMode2SustainedWrongFailLimit()` and routed sustained wrong-limit checks through it. This also fixes the missing-helper runtime bug in V615.

## V615 — mode naming cleanup, true final self-paced, sustained wrong-fail percent

### Behavioral fixes
- Mode labels standardized throughout the program as: Mode 1 CogSpeed Adapted, Mode 2 CogSpeed Sustained, Mode 3 Self-paced, and Mode 4 Machine-paced.
- Mode 2 final self-paced is now truly self-paced: unanswered final trials are ended only by the overall max test timer, not by a per-trial timeout.
- Mode 2 sustained-phase wrong-response fail logic now uses a percentage of the sustained trial target. New Admin setting: `mode4SustainedWrongFailPercent` (default 20%). With the default 20 sustained trials, the default wrong-fail limit is 4 wrong responses.

### Admin cleanup
- Removed deprecated no-effect Mode 2 MBS threshold setting from defaults/Admin.
- Removed dead machine-paced no-response timeout setting from defaults/Admin.
- Updated Mode 2 recovery/final self-paced labeling so Admin text matches live behavior.

### Code cleanup
- Replaced the large top-of-file history block with a short current-behavior header and kept archaeology in CHANGELOG.md.
- Removed more retired curtain scaffolding: the hidden curtain DOM node is gone, and curtain reset helpers are now lightweight test-surface normalizers only.

## V614 — Audit patch: mode4_final fix completed, privacy.html CPI, dead code

### Critical bug fixes (V614)
- Mode 2 final self-paced no-response timeout now correctly produces a success outcome.
  V613 added the isTestSuccess guard but omitted the distinct end reason in armNoResponseTimer,
  so the guard was dead code ("no response" in failHints intercepted first). V614 adds
  the distinct end reason "Mode 2 final self-paced: no response — session complete" in
  armNoResponseTimer AND moves the isTestSuccess guard before the failHints block.
- privacy.html: "CPS score" corrected to "CPI score".

### Behavioural fixes (V614)
- response_graph Speedometer menu choice now calls stopSpeedometer() before navigating.
  Was the only menu choice that did not stop the speedometer rAF loop.

### Dead code removed (V614)
- openIntroOverlay(): defined but never called (closeIntroOverlay remains).
- roundRect(): canvas helper defined but never called anywhere.

---

## V613 — Comprehensive audit fix build

### Critical bug fixes
- `safeCdiNum(null)` now correctly returns null (was returning 0 via Number(null)=0).
  Fixes corrupted CDI for low-data sessions; cdiSprRisk(null) no longer injects 100 into scores.
- `perfSessionCpi()` now guards null before Number() conversion.
  Fixes Mode 1 sessions plotting at zero on Performance Over Date and Time graph.
- [Completed in V614] Mode 2 final self-paced no-response timeout fix was half-applied in V613.
- Service worker now filters external requests — Nominatim geocode responses are no longer
  cached by the SW (violated Nominatim ToS and caused unbounded cache growth).
- emailDataSelect dropdown labels now match speedometerActionSelect labels.
- Dead speedEmailSelectBtn wiring removed (element never existed in index.html).

### Label and terminology fixes
- "FATIGUE (S-PF)" corrected to "FATIGUE (SP-FS)" in all four summary builders.
- "Condition 4" inline comment updated to match section header "Slow calibration halt".
- "SELF-PACE CALIBRATION" corrected to "SELF-PACED CALIBRATION" in compact summary.
- armNoResponseTimer header comment now mentions Mode 2 final self-paced coverage.
- Admin field 26 label updated to include Mode 2 final self-paced.
- Admin field 33 (mode4MbsThresholdMs) marked deprecated — has no effect on logic.
- terms.html: "Cognitive Performance Score / CPS" → "Cognitive Performance Index / CPI".
- GitHub URL in privacy.html and terms.html: CogSpeed®-Think-Fast → CogSpeed-Think-Fast.
- Performance Over Date and Time graph: axis labels now adapt for Mode 2 sessions
  (SPI / SBLP labels when all filtered sessions are Mode 2).

### Dead code removed
- emailResults() function and its two comment references (superseded by E-Mail Select).
- getTerminalRecoveryWrongCount() — computed but never called.
- armCurtainWatchdog() — curtain is permanently passive since earlier versions.
- resetSpeedometerActionMenu() — never called.
- allTriggeredMode4, mixedMode4 — computed but never read in drawPerformanceOverTimeChart.
- yLeftFromMs(), scoreFromMs() — dead inner functions since V606 marker consolidation.
- Dead DOMContentLoaded listener — unreachable with defer script loading.
- Dead gidle CSS rules from index.html and ensureGearImageStyles (gidle classes never added).
- Dead curtain CSS rules (curtain is permanently display:none).
- drawSpeedometer: removed unused parameters blockMs, showBlock, blockLabel.

### Behavioural fixes
- summaryVariant is now reset to "complete" between tests.
- resetAllSessions now syncs the Rate/RT session dropdown.
- stopSpeedometer() called in all non-summary Speedometer menu paths and goToStartPage.
- noteAnyResponse() now includes mode4_final phase (resets per-trial no-response timer on tap).
- Blob URLs in exportCSV and downloadTrialLogCSV now revoked after download.
- CSV trial download filename: @ and . in subject email sanitized to _ to avoid OS issues.
- localStorage save failure now sets a visible status warning to the user.
- @keyframes probePulseG hoisted to ensureGearImageStyles — no longer re-injected on each
  tutorial step render.
- emailDraftWired2 flag renamed to emailDraftWired (stale version suffix).

### Profile and UI
- "Email my results" toggle text corrected: auto-send is not implemented; text now
  directs users to E-Mail Select on the results page.
- Profile birth year max attribute corrected from stale "2015" to "2012" (14+ in 2026).
- Profile age/gender collection documented: stored per-result for future population-norm use.

### Code comments added
- SVG gear fallback path: comment notes this is only reached if gear images are missing.
- normalizeTrialRow: note about late-rescue RT inflation in ranking averages.
- Paced phase: comment on double-tap-on-resolved-trial behaviour (counts as wrong).
- Recovery delay setTimeout: note about non-cancellability on Full Reset.
- Nominatim fetch: comment on UA attribution and absence of AbortController timeout.
- Benchmark: comment on non-cancellability while running.

## V612 — Speedometer menu package-alignment fix
- Fixed stale script query in index.html.
- index.html now loads app.js?v=612 instead of the stale v599 cache-busting tag.
- Preserved the corrected Speedometer menu order and wiring from V611.

## V611 — Speedometer menu order corrected in static dropdown
- Corrected the actual Speedometer dropdown order and labels to:
  1. Results Summary
  2. Results - Complete
  3. Trial Detail Log
  4. Response Time Graph
  5. Performance Over Date and Time Graph
  6. Presentation Rate Versus Response Time Graph
  7. Ranked Averages
  8. E-Mail Select

## V610 — Speedometer menu label correction
- Corrected the Speedometer menu labels to:
  1. Results Summary
  2. Results - Complete
  3. Trial Detail Log
  4. Response Time Graph
  5. Performance Over Date and Time Graph
  6. Presentation Rate Versus Response Time Graph
  7. Ranked Averages
  8. E-Mail Select

## V609 — Speedometer menu reordered
- Reordered the Speedometer “Open the results / graphs log” menu to:
  1. Results Summary
  2. Results - Complete
  3. Trial Detail Log
  4. Response Time Graph
  5. Performance Over Date and Time Graph
  6. Presentation Rate Versus Response
  7. Ranked Averages Time Graph
  8. E-Mail Select
- Updated the displayed labels to match the requested wording.

## V608 — Thinking FX symbol-reference cleanup
- Confirmed the Thinking-box FX loop uses FX_CORNERS, not GEARS.
- Added a clarifying comment in startFX() to prevent future rename drift.
- This is the strict follow-up build after the GEARS → FX_CORNERS stale-reference bug.

## V607 — CogSpeed Thinking FX restored
- Fixed the Thinking box FX regression.
- Smoke and sparks now use the local FX corner coordinates again.
- Kept the V606 Performance over Date and Time legend fix intact.

## V606 — SP-FS restored to Performance over Date and Time legend
- Added SP-FS back to the legend on the Performance over Date and Time graph.
- Kept CPI as the blue dot and MBS as the orange open circle around the same point.

## V605 — Performance over Date and Time CPI/MBS markers aligned
- Fixed the graph so CPI (blue dot) and MBS (orange circle) are drawn at the same y-position.
- The orange open circle now sits around the blue CPI dot instead of being plotted at a separate nearby position.
- This keeps CPI and MBS visually paired at the same x/y location, matching the intended meaning that they represent the same session value in different units.

## V604 — Mode 2 final self-paced now consistently uses per-trial no-response timeout
- Fixed the dead `case "mode4_final"` branch in `armNoResponseTimer()` by making `openTrial("mode4_final")` actually call `armNoResponseTimer()`.
- Mode 2 final self-paced trials now use the configured recovery no-response timeout per trial, consistent with the existing switch logic.
- Updated the `armNoResponseTimer()` header comment to document Mode 2 final self-paced coverage.

## V603 — Mode 2 final self-paced restored to true self-paced
- Removed the no-response timeout path from Mode 2 final self-paced trials.
- Final self-paced trials now wait for an answer and only the overall max test time can end the session if unanswered.
- Updated status text to clarify that the final two trials are true self-paced.

## V602 — Mode 2 final self-paced presentations now finish even on no response
- Fixed Mode 2 CogSpeed Sustained so the final self-paced phase counts presented trials, not only responded trials.
- Added mode4_final no-response handling: each unanswered final self-paced presentation now counts toward the configured final-trial target and the session completes after the target count is reached.
- Mode 2 final self-paced now uses the existing no-response timeout instead of hanging until the overall max time.

## V600 — Mode-label drift comment cleanup
- Clarified sustained-mode comments to distinguish the internal `mode4` key from the user-facing **Mode 2 CogSpeed Sustained** name.
- Updated the top integration notes and sustained-analysis heading to avoid stale **Mode 4** wording in comments.
- Kept the already-correct user-facing phase labels and MBS-based CPI wording intact.
- Minor cleanup: no-result source diagnostic fallback text no longer uses a `SOURCE:` prefix.

## V600 — cleanup and audit fixes
- Removed stale dead success branch for old Mode 4 sustained completion wording.
- Renamed stored sustained CPI field from mode4CpiFromCsr to mode4CpiFromMbs and corrected Results text label to CPI from MBS.
- Corrected Results fallback to compute CPI from adaptive MBS instead of SPI from CSR.
- Disabled user-visible summary/source diagnostic injection.
- Renamed local FX GEARS array to FX_CORNERS to avoid shadowing the global GEARS definition.
- Renamed recoveryCorrectCompleted to recoveryTrialsCompleted to match actual behavior.
- Removed stale extra closing </div> after benchmarkOverlay in index.html.
- Removed dead curtain wrapper functions and dead benchmark no-op variable.
- Updated stale mode-count/mode-label comments and visible Mode 2 sustained labels.
- Corrected Total wrong rows to use totalIncorrect.
- Added sw.js RELEASE sync note and aligned all version references to V600.

## V597 — Sleep/wake path completed and validated
- Added a dedicated **last wake time before this test** entry path when the subject reports **no sleep before the current test**.
- Removed fallback inference from older session history for awake-time reporting.
- Results now compute **Hours awake before test** only from the current test's own wake entry (`wakeDateTimeIso` or `lastWakeDateTimeIso`).
- Updated the optional **Actual minutes asleep** field to use `min=10` so the UI matches the validator.

## V596 — Sleep logger timezone/cat-nap support
- Added optional **Actual minutes asleep** override in Sleep Logger for cat naps and sleep episodes that cross time zones, such as on an airplane.
- Results now use the override when entered and label it as manual in the sleep line.
- Lowered the minimum accepted sleep duration from 30 minutes to 10 minutes so short naps can be logged.
- Preserved wake-time validation against the current test time.

## V595 — allow >24h awake intervals
- Removed the hard validation rule that required sleep start to be within 24 hours of the current test.
- Sleep validation now checks logical consistency only: sleep duration bounds and wake time not after the current test time.
- This allows valid >24-hour awake intervals in sleep-deprivation studies and real-world fatigue cases.

## V595 — Performance over Date and Time legend and marker cleanup
- Blue dot in the Performance over Date and Time graph now represents CPI without an orange ring around it in the legend.
- Orange open circle now represents MBS as a separate marker at the same x-position on the graph.
- Left-axis labels/legend were simplified to CPI and MBS wording for clarity.

## V593 — Results pages now show hours asleep
- Updated the shared sleep line used by Results Summary and Results - Complete so sleep now explicitly shows hours asleep.
- If the subject slept before the test, the results show the recorded sleep duration in hours/minutes.
- If the subject did not sleep before the test, the results show Hours asleep: 0h.

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

## V548 — Mode 2 sustained anti-spoof wrong limit
- Added a new Admin default: **Mode 2 anti-spoof max wrong in Sustained Phase (default 4)**.
- Mode 2 now stops the sustained phase and ends the session if sustained wrong responses reach that limit.
- Kept the existing global anti-spoof and max paced wrong protections unchanged.

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

## V543 — Controlled merge build on V541 baseline line
- Preserved the later approved baseline-line defaults and UI features already present in the uploaded source, including CPI worst anchor = 2400, Mode 2 sustained trial count default = 20, and the V541 RT graph legend clarifications.
- Fixed package/version drift so `app.js`, `index.html`, `manifest.json`, and `sw.js` all align to V543.
- No additional trial, pacing, or response-handling logic changes were introduced beyond the integrated V542 scoring branch.


### New scoring system
available data source in the session record.

- Mode 1 (CogSpeed Adaptive): `0.65 × CPI + 0.35 × paced_accuracy`
- Mode 4 (CogSpeed Sustained): weighted sum of CPI, recency-weighted SPI (second half
  max 10 pts), error-type penalty (omissions + commissions weighted separately, max 10 pts),
  and degradation penalty (CDI preferred over raw decay + RT slope, max 25 pts).

SP-FS 4: −3 pts, 3: −6, 2: −10, 1: −15. SP-FS 5–7: no adjustment.

mapping objective performance onto the corrected Samn-Perelli scale:
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
- `buildSummary()`: Lazy-recompute backfill added so pre-V542 history sessions receive
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


## V661
- Restored SP-FS item 5 wording to **"Okay, about normal"** while keeping the acronym as **SP-FS**.
- Changed test-phase backgrounds to blue tones: calibration = light blue; adaptive/recovery/fixed machine-paced = medium blue; sustained/final self-paced = light blue.
- Updated all package version wiring to V661.
