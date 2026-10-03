# DayFlow 1.0.0 review — October 3, 2026

## Decision

Suitable to share as a **personal project in progress**. Do not describe the Windows installer as fully tested or stable. Browser fixes are available publicly, but the unchanged installer still has known defects and needs rebuilding plus Windows acceptance testing.

## Evidence

- Uploaded ZIP contains the installer, not source. Installer size: 144,241,594 bytes; SHA-256 `7d35283ec269e7436a5c2ca72cb1533c60dad311f676d7fc49e6967e31b8af0d`.
- Public download was downloaded fully and matched that checksum.
- Genuine NSIS bootstrap and embedded AMD64 application were identified; Authenticode signature was absent.
- Embedded version metadata is 1.0.0. Company metadata says **ZeroTech Solutions Limited**; confirm this is the intended publisher before wider distribution.
- Six application files were recovered from the installer: main process, preload, HTML, compiled JS/CSS and runtime manifest. Original editable React/TypeScript/build materials remain unavailable. Current main contains those recovered files; release-tag source archives contain the older website.
- Desktop shell loads local files and uses `%APPDATA%\DayFlow`, single-instance locking, sandbox/context isolation and no Node integration in the renderer. This is source inspection, not proof of native offline execution or a security audit.

## Corrections

The browser review build fixes local-date/month-end errors, monthly recurrence overflow (January 31 now clamps to February 28), hidden negative balances, automatic overwriting following unreadable saved data, dashboard completion counts and Undo restoring an outdated full snapshot after later edits. Timeline blocks now have more room; finance modal close has an accessible label. Exact bundle hash/count guards protect original recovered files.

README, release notes and landing copy identify the actual available source, experimental unsigned installer, verified download and missing Windows validation. Landing sample input is escaped, controls labelled, theme storage failure handled, and keyboard/menu/clipboard behavior improved. Screenshots show the real browser renderer with fictional data.

**All renderer changes require a new Windows installer.** The original installer, release tag and recovered originals were preserved; no existing Windows user data was modified.

## Tests actually performed

| Area | Verified in browser/helper checks | Remaining |
| --- | --- | --- |
| Tasks | Empty validation; create/edit; complete exclusively in Completed with timestamp; restore; delete/cancel/Undo; Cancel/X/Escape; weekly series, single occurrence and entire series deletion | Every future-scope branch; OS notifications |
| Routines | Days/times; recurrence dates; edit; pause/resume; one occurrence completion without changing next day; single occurrence deletion/Undo | Missed/skipped UI branches; entire/future routine deletion branches |
| Calendar | Date/day/month/Today navigation; event create/edit/delete/cancel/Undo; duration display; 24-hour slots; overlap columns; current-time marker | Every recurring-event deletion branch; mobile touch/native back behavior |
| Financials | Card details; multiple budgets; expenses create/edit/delete; immediate balance recalculation; transfer affects both cards without adding income/spending; card deletion cleans transfer; budget pause/delete leaves transactions; searchable history | Card editor and budget edit/reset UI; all credit/refund/payment UI combinations |
| Accounting helpers | Debit/credit operations, transfers, unique transaction application, cents rounding, overlapping budget deduplication, deletion recalculation | Real-world financial accuracy beyond tested cases |
| Profile/settings | Fictional profile/email/photo saved; photo removal cancellation; themes; typed RESET confirmation and cancellation | Saved photo-removal branch; native Windows persistence |
| Persistence | Refresh and closing/reopening browser tab retained sample data/theme; corrupt-load overwrite protection isolated checks | Computer restart, installer update, OS storage failure recovery |
| Windows | PE/metadata/unsigned structure and offline file loading inspected | Installation, shortcut/location prompts, native/offline launch, updates, restart, uninstallation — NOT RUN |

Focused original helper checks: 9 pass, 5 fail. Corrected browser build: 14 pass, 0 fail. Failures reproduced date, recurrence, negative balance and unreadable-load problems. Dashboard/timeline and workflow checks were also exercised through the actual running renderer. Helper checks exercise extracted application logic, not a complete native test suite.

## Limitations to communicate

Use sample data in 1.0.0. Original load failure can overwrite unreadable state; original Undo can restore an outdated snapshot and discard newer changes. Back up before using updates/recovery. Browser fixes are not present in the release binary.

First launch/reset restores starter samples. Task/event recurrences are finite. Budget dates do not automatically roll over. Reminder flags do not send OS background notifications. No bank connection, cloud sync, encryption/biometric security claim or AI integration is provided. There is no declared project license.

## Before a new Windows release

Recover or reconstruct the original editable project, lockfile, installer configuration and icon assets. Apply the reviewed fixes to maintainable source, preserve the user-data path, and build a new version. On clean Windows 10/11, test install/location/shortcuts, every CRUD/cancel/delete branch, recurrence scopes, transactions and transfers, close/reopen/reboot, offline launch, update retention, typed reset and uninstall. Confirm publisher attribution; sign only with a valid certificate or retain the unsigned disclosure.

## Screenshots

Five actual browser review-build captures: Overview, Calendar, Daily Breakdown, Financials and Card Details. All names, email, avatar, tasks and financial figures are fictional. No Windows capture is claimed.
