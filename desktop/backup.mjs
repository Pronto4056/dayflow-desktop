import fs from 'node:fs';
import path from 'node:path';

// Called once, after the instance lock and before a renderer opens the old store.
export function backupBeforeUpgrade(dataDirectory, appDataDirectory) {
  const marker = path.join(dataDirectory, '.dayflow-1.0.1-backup-complete');
  if (fs.existsSync(marker)) return;
  const names = ['Local Storage', 'IndexedDB', 'Preferences'];
  const present = names.filter(name => fs.existsSync(path.join(dataDirectory, name)));
  if (!present.length) return;
  const destination = path.join(appDataDirectory, 'DayFlow-backups', 'before-1.0.1-' + new Date().toISOString().replace(/[:.]/g, '-'));
  fs.mkdirSync(destination, { recursive: true });
  for (const name of present) fs.cpSync(path.join(dataDirectory, name), path.join(destination, name), { recursive: true, errorOnExist: true, force: false });
  fs.writeFileSync(path.join(destination, 'README.txt'), 'Automatic pre-1.0.1 backup. Close DayFlow before restoring. Contains private local application data.\n');
  fs.writeFileSync(marker, destination + '\n');
}
