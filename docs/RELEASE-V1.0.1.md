# DayFlow 1.0.1 — Windows release candidate

This unsigned Windows x64 candidate reconstructs desktop packaging around the recovered DayFlow application. Original TypeScript/TSX sources remain unavailable. The repository contains the exact recovered assets, guarded transformations, desktop scripts, pinned package lock and packaging configuration used for this candidate.

## Changes

- New workspaces start empty, with setup guidance and no invented tasks or financial balances. Existing workspaces keep their saved records, including any sample records they already contain.
- Correct local-day and month-end calculations and monthly recurrence across short months.
- Preserve negative debit balances, credit overpayments, and balances when editing a card.
- Correct the task-completion denominator.
- Give daily timeline items more vertical room while retaining duration-based placement.
- Pause saving when stored data is unreadable or has an invalid top-level structure. Show a persistent warning rather than overwrite the saved data.
- Back up existing Local Storage, IndexedDB and Preferences before the first 1.0.1 renderer launch. Backup failures pause the upgrade launch.
- Keep `%APPDATA%\DayFlow`, the `dayflow-v2` storage key and the existing Electron app identity. Uninstallation is configured to retain application data.

## Installation and integrity

The candidate is `DayFlow-Setup-1.0.1.exe`; compare its SHA-256 with the attached `DayFlow-1.0.1-SHA256.txt`. A checksum verifies bytes, not publisher identity. The installer is unsigned; no code-signing claim is made.

## Release gate

This release must remain a draft until critical acceptance checks pass. Automated Windows build/test evidence is attached by the workflow. A manual first-run review on Windows 10 and Windows 11 is still required: interactive installer prompts, shortcuts, startup without internet, adding/editing a task, routine/calendar and financial flows, reopening, upgrading an existing installation, and uninstalling while preserving data. Retain a personal backup before evaluating an upgrade.

The public website continues to serve 1.0.0 until 1.0.1 is approved for promotion. No AI integration is included.
