# Recovered DayFlow 1.0.0 application files

These files were extracted without running the uploaded Windows installer. They are the actual files packaged in its Electron app archive, not a recreation of the landing-page illustration.

Installer: `DayFlow-Setup-1.0.0.exe`  
SHA-256: `7d35283ec269e7436a5c2ca72cb1533c60dad311f676d7fc49e6967e31b8af0d`

## Available files

- `app/desktop/main.mjs`: original JavaScript Electron main process.
- `app/desktop/preload.cjs`: original preload/IPC bridge.
- `app/dist-desktop/`: compiled React interface, bundled JavaScript, CSS, and HTML.
- `app/package.json`: original packaged manifest, retained as evidence.
- `app/SHA256SUMS.txt`: hashes of the six recovered files.

The renderer can be viewed with a static HTTP server. From the repository root:

```sh
python -m http.server 8000
```

Open `http://localhost:8000/recovered/app/dist-desktop/`. The same renderer is available through GitHub Pages. Browser testing uses browser storage; it does not inspect or modify an installed Windows app's data.

## Source and rebuild limitations

These are recovered distribution files. The compiled JavaScript includes the app logic and React runtime, but the original editable TypeScript/TSX files, source maps, lockfile, icon assets, NSIS installer scripts, and complete build configuration were not in the app archive. The manifest has no build scripts. `npm install` alone cannot recreate the published installer from this repository.

Do not describe this directory or GitHub's source archive as the complete original application source. No rebuilt installer is included in this recovery. The original installer remains unchanged.

## Review safety

Use non-sensitive sample data for evaluation. The renderer stores its state under browser local-storage key `dayflow-v2`. Desktop state uses the Electron user-data directory `%APPDATA%\\DayFlow`, as confirmed in the recovered main process. Local storage is not an encryption guarantee.
