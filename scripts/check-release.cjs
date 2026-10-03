const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const cp = require('node:child_process');
const index = fs.readFileSync('.build/app/dist-desktop/index.html', 'utf8');
const asset = index.match(/src="\.\/assets\/([^"]+)"/)[1];
const code = fs.readFileSync('.build/app/dist-desktop/assets/' + asset, 'utf8');
new vm.Script(code);
// Run existing behavioural helper tests against the actual release output too.
cp.execFileSync(process.execPath, ['scripts/check-app.cjs', 'recovered/app/dist-desktop/assets/index-BsYSeHvl.js', '.build/app/dist-desktop/assets/' + asset], { stdio: 'inherit' });
const start = code.indexOf('Ne={theme:');
const end = code.indexOf(',Pe=()=>', start);
const state = vm.runInNewContext('var ' + code.slice(start, end) + ';Ne');
for (const key of ['tasks', 'cards', 'budgets', 'transactions', 'routines', 'routineOccurrences', 'events']) assert.equal(state[key].length, 0);
const validate = vm.runInNewContext(fs.readFileSync('desktop/validate-data.js', 'utf8') + ';dayflowValidateSavedData');
for (const bad of [null, [], 123, {tasks:{}}, {profile:null}, {routines:[{name:'x',days:null}]}, {cards:[{name:'x',balance:null}]}]) assert.throws(() => validate(bad));
validate({theme:'dark',profile:{name:'Existing user'},tasks:[],cards:[{name:'Overdrawn',balance:-25,openingBalance:-25}]});
assert.ok(code.includes('balance:Number(e.target.value)'));
assert.ok(code.includes('Saving paused'));
assert.ok(code.includes('Welcome to DayFlow'));
const pkg = JSON.parse(fs.readFileSync('.build/app/package.json'));
assert.equal(pkg.version, '1.0.1');
assert.equal(pkg.name, 'dayflow-app');
assert.ok(fs.readFileSync('desktop/main.mjs','utf8').includes('app.setPath("userData", appDataDirectory)'));
const config = JSON.parse(fs.readFileSync('package.json')).build;
assert.equal(config.nsis.deleteAppDataOnUninstall, false);
assert.equal(config.appId, 'com.zerotech.dayflow');
// Exercise the backup implementation on a disposable synthetic data directory.
(async () => {
  const { backupBeforeUpgrade } = await import('../desktop/backup.mjs');
  const temp = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'dayflow-backup-test-'));
  try {
    const data = path.join(temp, 'DayFlow');
    fs.mkdirSync(path.join(data, 'Local Storage'), {recursive:true});
    fs.writeFileSync(path.join(data, 'Local Storage/synthetic-store'), 'original bytes');
    backupBeforeUpgrade(data, temp);
    const backup = fs.readFileSync(path.join(data, '.dayflow-1.0.1-backup-complete'), 'utf8').trim();
    assert.equal(fs.readFileSync(path.join(backup, 'Local Storage/synthetic-store'), 'utf8'), 'original bytes');
    fs.writeFileSync(path.join(data, 'Local Storage/synthetic-store'), 'new bytes');
    backupBeforeUpgrade(data, temp);
    assert.equal(fs.readFileSync(path.join(backup, 'Local Storage/synthetic-store'), 'utf8'), 'original bytes');
  } finally { fs.rmSync(temp, {recursive:true,force:true}); }
  console.log('PASS: 1.0.1 blank defaults, invalid-data protection, negative balances, identity, backup retention, and generated renderer.');
})().catch(error => { console.error(error); process.exitCode=1; });
