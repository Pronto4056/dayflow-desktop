# DayFlow

A personal project bringing daily planning and manual money tracking into one place.

[Visit the website](https://pronto4056.github.io/dayflow-desktop/) · [Download Windows installer](https://github.com/Pronto4056/dayflow-desktop/releases/download/V1.0.0/DayFlow-Setup-1.0.0.exe) · [Release details](https://github.com/Pronto4056/dayflow-desktop/releases/tag/V1.0.0)

## Project status

DayFlow is an experimental personal project, built iteratively with AI-assisted development. Version 1.0.0 is available as an **unsigned Windows installer**. Feedback and reproducible bug reports are welcome.

**This repository currently contains the promotional website, not the full React/Electron application source.** GitHub's automatically generated “Source code” ZIP and TAR files contain this repository only; they are not a rebuildable desktop application. Recovery of the complete application source is pending.

The website includes a small, clearly labeled illustrative interactive demo. It is not the full application. Its example tasks reset on reload, and its calendar and financial figures are sample data. The separate full web prototype currently requires owner access.

## What DayFlow is designed to do

- Organize tasks, priorities, deadlines, and completed work.
- Schedule routines alongside calendar events and a daily timeline.
- Track manually entered card balances, budgets, transactions, and transfers.
- Offer local persistence and light/dark themes.

These describe the application scope. The October 2026 audit verified the website source and release metadata; it did **not** independently verify these desktop workflows. See the [audit and test checklist](docs/AUDIT.md).

## Download and installation

1. Download **DayFlow-Setup-1.0.0.exe** from the release link above.
2. Verify the SHA-256 value below if you want to check file integrity.
3. Open the installer and follow its prompts on a 64-bit Windows 10 or Windows 11 computer.

Installer size: 144,241,594 bytes (approximately 137.6 MiB).

The installer is not digitally signed. Windows may show an unknown-publisher warning. A checksum match verifies integrity, not publisher identity or software safety. Only run software you trust.

Clean Windows installation, launch, persistence, shortcuts, updates, and uninstallation still need a fresh end-to-end test. A portable executable is **not attached to the public release**, despite the older release description mentioning one.

### Verify the download

In PowerShell, from the folder containing the installer:

```powershell
Get-FileHash .\DayFlow-Setup-1.0.0.exe -Algorithm SHA256
```

Expected SHA-256, also recorded in GitHub's release asset metadata:

```text
7d35283ec269e7436a5c2ca72cb1533c60dad311f676d7fc49e6967e31b8af0d
```

[Download the existing checksum file](https://github.com/Pronto4056/dayflow-desktop/releases/download/V1.0.0/DayFlow-1.0.0-SHA256.txt)

## Privacy and local data

The application was designed for manual finance tracking, without bank connections. Do not enter full card numbers, security codes, PINs, bank passwords, or real sensitive financial information when evaluating this release.

The previously documented desktop data location is `%APPDATA%\DayFlow`. Confirm the folder exists on your installation. Close the app before copying that folder for backup; keep the backup private. Backup restoration and update retention have not been reverified in this audit.

Local storage does not, by itself, establish encryption or protection from other users of the computer. This project does not claim an independent security audit, bank-grade encryption, cloud synchronization, or financial advice.

The landing page stores only its theme choice in browser local storage; demo tasks are held in memory.

## Technology and repository layout

| Component | Technology / availability |
| --- | --- |
| Public website | HTML, CSS, vanilla JavaScript |
| Website hosting | GitHub Pages, deployed with GitHub Actions |
| Desktop application | Previously packaged using Electron with a React/TypeScript interface; full source is not in this repository yet |
| Installer | Windows executable supplied through GitHub Releases |

```text
index.html                 Website and illustrative demo
.github/workflows/pages.yml  GitHub Pages deployment
scripts/check-website.cjs   Focused website source checks
docs/AUDIT.md               Evidence, limitations, and remaining tests
README.md                  Project overview
```

## Run the website locally

Clone or download this repository. Open `index.html` in a browser, or serve the folder with a static web server. For example, if Python is installed:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`.

With Node.js installed, run the focused source checks:

```sh
node scripts/check-website.cjs index.html
```

No npm installation is needed for this landing page. Desktop build instructions will be added only after the actual application source and configuration are restored and verified.

## Screenshots

New application screenshots are pending access to a runnable copy. The landing-page illustration should not be represented as a screenshot of the full app. No fabricated screenshots are included.

## Reporting a problem

[Open an issue](https://github.com/Pronto4056/dayflow-desktop/issues) with the app version, Windows version, steps to reproduce, expected result, and actual result. Use sample data and redact any personal details in screenshots.

## Before a wider release

- Restore and review the complete app source and desktop build configuration.
- Run the app workflow and clean Windows checklist in the audit document.
- Capture real application screenshots with non-sensitive sample data.
- Reconcile the release notes with the assets actually published.
- Consider code signing for future releases.
