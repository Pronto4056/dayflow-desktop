DayFlow is an early personal project for daily planning and manual money tracking.

## Downloads

- **DayFlow-Setup-1.0.0.exe** — the unsigned Windows installer (144,241,594 bytes), intended for 64-bit Windows 10 and Windows 11.
- **DayFlow-1.0.0-SHA256.txt** — download-integrity information.

The attached application download is the installer. No portable executable is currently attached. GitHub's automatic source archives for this release tag contain the repository as it existed at that tag; they do not contain the complete original React/Electron source project.

Installer SHA-256:

```text
7d35283ec269e7436a5c2ca72cb1533c60dad311f676d7fc49e6967e31b8af0d
```

## Application scope

Tasks and completed-task history, recurring routines, calendar events and Daily Breakdown, manually managed cards, budgets, transactions, transfers, profile editing, and light/dark themes. The recovered desktop shell loads its interface locally and uses `%APPDATA%\DayFlow` for its user-data directory. No bank connection is used.

## Review status and limitations

The October review exercised the actual packaged renderer in a browser with sample data. Task workflows, routine/calendar synchronization, transaction recalculation, transfers, deletion/Undo, profile changes, and browser persistence were tested. Clean Windows installation, offline launch, OS-level persistence, updates, shortcuts, and uninstallation remain unverified.

**The downloadable 1.0.0 installer is unchanged and has known issues:** local-date/month-end handling, monthly recurrence at the end of a month, negative-balance clamping, unreadable-data recovery, and the dashboard completion denominator. Fixes and a more readable timeline are available in the browser review build; they require a new Windows installer and Windows acceptance testing before release.

Use sample data while evaluating 1.0.0. The executable is not digitally signed; Windows SmartScreen may display an unknown-publisher warning. A checksum confirms file integrity, not publisher identity or software safety.

[Website](https://pronto4056.github.io/dayflow-desktop/) · [Browser review build](https://pronto4056.github.io/dayflow-desktop/review-build/) · [Current README](https://github.com/Pronto4056/dayflow-desktop/blob/main/README.md) · [Detailed audit](https://github.com/Pronto4056/dayflow-desktop/blob/main/docs/AUDIT.md)
