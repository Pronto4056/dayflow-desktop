# Rebuilding DayFlow 1.0.1

Use Windows x64 and Node.js 22 (at least 22.13). From the repository root:

```sh
npm ci
npm run prepare:app
npm test
npm run dist:win
```

The installer appears at `release/DayFlow-Setup-1.0.1.exe`. The workflow `.github/workflows/windows-release.yml` performs the same build on a clean Windows runner and uploads a draft release, never a public release. `npm run test:windows` is intentionally restricted to disposable Windows CI because it installs/uninstalls test builds and manipulates that runner's DayFlow profile. Do not run the acceptance script on a personal computer.

The original editable TSX source was not recovered: the uploaded ZIP contains only the original installer. This is a reproducible reconstruction from checked-in original distribution assets with explicit, guarded transformations. `scripts/prepare-review-build.cjs` applies the previously reviewed fixes; `scripts/prepare-desktop.cjs` adds first-launch and storage protection, then copies the editable Electron main/preload scripts. `.build/provenance.json` records original and generated hashes. Dependencies are pinned in `package-lock.json`. Installer timestamps and signing, if added, can change binary hashes across builds; byte-identical installer reproducibility is not claimed.

Runtime dependencies are already bundled in the recovered renderer. Development dependencies are not shipped. Assets are loaded locally under a restrictive Content Security Policy. Data remains under `%APPDATA%\DayFlow` and the `dayflow-v2` key; no schema/key migration is performed. The pre-upgrade backup lives under `%APPDATA%\DayFlow-backups`. Existing records are preserved rather than heuristically identifying and deleting old sample data.

The Windows installer is unsigned. Packaging uses app ID `com.zerotech.dayflow`, matching the recovered shell; legacy installer registration compatibility must be verified by Windows acceptance testing.

## Publishing after acceptance

Review attached test evidence and complete the manual Windows checklist in the release notes. Publish the existing draft only after those checks pass. Update the website's installer URLs, version labels, size and SHA-256 from the actual published asset, and update the README. Keep the old release in history. Verify a fresh download against its published checksum.
