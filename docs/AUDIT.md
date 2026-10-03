# DayFlow audit — 3 October 2026

## Scope and evidence

The GitHub repository, README, landing-page source, GitHub Actions configuration, release metadata, and saved Site metadata were inspected. No existing application user data was modified.

At audit time, the repository contained a landing page, Pages workflow, empty .nojekyll marker, and a one-line README. It did not contain React/TypeScript application source, Electron entry points, package manifests, desktop build configuration, or app tests.

The published V1.0.0 release exposes an installer and checksum file. The release API reports the installer size as 144,241,594 bytes and digest as sha256:7d35283ec269e7436a5c2ca72cb1533c60dad311f676d7fc49e6967e31b8af0d. The binary was not downloaded or executed during this audit. GitHub's generated source archives package the website repository only.

The separate full web prototype is owner-only. Source recovery failed because the configured project network connection was unavailable. An elevated helper execution was rejected by automatic approval review. The saved archive could not be resolved by the file-download tool. No attempt was made to bypass these restrictions.

## Changes made

- Replaced the minimal README with project scope, download and integrity instructions, repository layout, local website setup, privacy notes, and limitations.
- Removed visitor-facing links promising access to the owner-only full web prototype; linked project documentation instead.
- Labeled the landing-page interface as an illustrative demo.
- Escaped user-entered demo task text before inserting it into HTML.
- Added task-button accessible labels and a live status region.
- Replaced the nonfunctional focus-score button with a task-completion output.
- Guarded theme-storage access so storage failure does not stop remaining initialization.
- Added mobile-menu expanded state, close-on-navigation, and Escape dismissal.
- Made checksum-copy failure fall back to a selectable text prompt.
- Added focus styles, long-task wrapping, reduced-motion support, and dark-theme contrast adjustments.
- Reworded the download notification to say requested rather than claim browser completion.
- Added basic social title/description metadata, without fabricated imagery.

## Checks completed

The focused source-check script passed locally:

- Inline JavaScript parses.
- HTML escaping covers angle brackets, quotes, apostrophes, and ampersands; task rendering uses it.
- Every local navigation anchor has a matching target.
- Both installer buttons point to the exact public release asset URL.
- No private ChatGPT file-download URL remains.
- The checksum displayed by the website matches the release API's installer digest.
- The demo has an illustrative label.

These are source checks, not browser end-to-end tests. The local browser runtime had no installed browser executable, so visual, touch, keyboard, clipboard, and persistence behavior were not exercised in a browser.

## Remaining release issues

- Full application source is absent; recovery is blocked.
- The original release description mentions a portable build that is not uploaded. Release-description editing was not available through the connected tools used in this audit.
- Fresh screenshots of the real application have not been captured.
- Public download metadata is verified; end-to-end download and clean Windows execution are not.
- The Windows release is unsigned and should be presented as experimental.
- No current proof of encrypted local storage, biometric locking, background notifications, or cloud backup is available. Do not advertise those capabilities.

## Required application acceptance tests

Run with synthetic data in a separate test profile. Record pass/fail, app version, Windows version, date, and evidence for each item.

| Workflow | Required check | Current status |
| --- | --- | --- |
| Installer | Install to chosen folder, launch, shortcuts, version, uninstall | Not run |
| Tasks | Add, edit, cancel/X/Escape/outside click, complete, restore, delete, recurrence scopes | Not run |
| Routines | Create and edit schedule, pause, single-occurrence status, scoped deletion | Not run |
| Calendar | Month/day navigation, correct routine dates, event CRUD, no duplicates | Not run |
| Daily timeline | 24 hours, duration/overlaps, current-time marker, day navigation | Not run |
| Cards | Add/edit/delete, five-card limit, exact-item confirmation | Not run |
| Accounting | Expenses, income, refunds, payments, transfers, edit/delete recalculation | Not run |
| Budgets | Multiple periods/categories, overlaps, warnings, reset/pause/delete | Not run |
| Profile | Save/cancel, picture add/remove, refresh persistence | Not run |
| Settings | Light/dark persistence, RESET confirmation/cancellation | Not run |
| Storage | Close/reopen/restart, update retention, load/save errors, backup/restore | Not run |
| Website browser | Mobile layout, theme, menu, demo, clipboard, actual download | Not run |

Do not describe this audit as a security certification or proof that every feature works. An honest progress announcement is possible; a fully validated release announcement should wait for the remaining checks.
