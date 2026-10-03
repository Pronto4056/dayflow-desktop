// Reproducible distribution recovery: original bundle -> guarded review fixes -> 1.0.1.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
process.chdir(root);
const output = path.join(root, '.build/app');
fs.rmSync(output, { recursive: true, force: true });
cp.execFileSync(process.execPath, ['scripts/prepare-review-build.cjs', 'recovered/app/dist-desktop', '.build/review'], { stdio: 'inherit' });
const provenance = JSON.parse(fs.readFileSync('.build/review/provenance.json'));
let code = fs.readFileSync('.build/review/assets/' + provenance.reviewJs, 'utf8');
const changes = [];
function replace(before, after, count = 1) {
  if (code.split(before).length - 1 !== count) throw new Error('Unsupported bundle: ' + before.slice(0, 100));
  code = code.split(before).join(after); changes.push(before.slice(0, 100));
}
const start = code.indexOf('Ne={theme:');
const end = code.indexOf(',Pe=()=>', start);
if (start < 0 || end < start) throw new Error('Default state boundary missing');
replace(code.slice(start, end), 'Ne={theme:`light`,profile:{name:`My workspace`,email:``,phone:``,location:``,image:``},tasks:[],cards:[],budgets:[],transactions:[],routines:[],routineOccurrences:[],events:[]}');
// Validate before merging. Invalid but parseable JSON must not replace existing data.
replace('let e=JSON.parse(localStorage.getItem(`dayflow-v2`)||`null`)||{};return',
  'let raw=localStorage.getItem(`dayflow-v2`),e=raw===null?{}:JSON.parse(raw);dayflowValidateSavedData(e);return');
const validation = fs.readFileSync('desktop/validate-data.js', 'utf8');
code = validation + '\n' + code;
replace('if(n&&!dayflowPersistenceBlocked.current){try{localStorage.setItem',
  'if(n){document.documentElement.dataset.theme=e.theme}if(n&&!dayflowPersistenceBlocked.current){try{localStorage.setItem');
replace('onClick:()=>ie(``),children:`Dismiss`', 'disabled:dayflowPersistenceBlocked.current,onClick:()=>ie(``),children:dayflowPersistenceBlocked.current?`Saving paused`:`Dismiss`');
replace('i===`home`&&(0,T.jsxs)(`section`,{className:`view-stack`,children:[',
  'i===`home`&&(0,T.jsxs)(`section`,{className:`view-stack`,children:[!e.tasks.length&&!e.routines.length&&!e.cards.length&&(0,T.jsx)(`p`,{className:`notice`,role:`note`,children:`Welcome to DayFlow. Start with Add task, create a routine, or add a card in Financials. This workspace starts empty; balances and transactions are entered manually.`}),');
replace('className:`card-grid`,children:P.map',
  'className:`card-grid`,children:!P.length?(0,T.jsx)(ue,{text:`No cards yet. Add a card with its current balance to start tracking your own spending. No bank connection is required.`}):P.map');
// Editing an overdrawn card must not silently clamp its visible/current balance.
replace('type:`number`,min:`0`,step:`0.01`,value:u.balance,onChange:e=>d(t=>({...t,balance:Math.max(0,Number(e.target.value))}))',
  'type:`number`,step:`0.01`,value:u.balance,onChange:e=>d(t=>({...t,balance:Number(e.target.value)}))');
replace('if(u.type===`Credit`&&u.limit<u.balance)', 'if(!Number.isFinite(u.balance)||!Number.isFinite(u.limit))return w(`Enter a valid balance and credit limit.`);if(u.type===`Credit`&&u.limit<u.balance)');
// Native reset is a user-confirmed operation; storage failures stay visible.
replace('localStorage.removeItem(`dayflow-v2`),dayflowPersistenceBlocked.current=!1,t(Ne)',
  'try{localStorage.removeItem(`dayflow-v2`)}catch{return w(`Reset failed because local storage is unavailable. Your data has not been reset.`)}dayflowPersistenceBlocked.current=!1,t(Ne)');
new vm.Script(code);
fs.mkdirSync(output + '/dist-desktop/assets', { recursive: true });
fs.mkdirSync(output + '/desktop', { recursive: true });
const hash = crypto.createHash('sha256').update(code).digest('hex');
const js = 'dayflow-1.0.1-' + hash.slice(0, 12) + '.js';
fs.writeFileSync(output + '/dist-desktop/assets/' + js, code);
fs.copyFileSync('.build/review/assets/' + provenance.reviewCss, output + '/dist-desktop/assets/' + provenance.reviewCss);
fs.writeFileSync(output + '/dist-desktop/index.html', fs.readFileSync('.build/review/index.html', 'utf8').replace(provenance.reviewJs, js));
for (const file of ['main.mjs', 'preload.cjs', 'backup.mjs']) fs.copyFileSync('desktop/' + file, output + '/desktop/' + file);
const pkg = JSON.parse(fs.readFileSync('package.json'));
fs.writeFileSync(output + '/package.json', JSON.stringify({ name: pkg.name, version: pkg.version, private: true, main: 'desktop/main.mjs', type: 'module', author: pkg.author, description: pkg.description }, null, 2));
fs.writeFileSync('.build/provenance.json', JSON.stringify({ version: pkg.version, ...provenance, status: 'Reconstructed 1.0.1 desktop distribution; original TSX source unavailable', releaseHash: hash, releaseChanges: changes }, null, 2));
console.log('Prepared DayFlow ' + pkg.version + ' at ' + output);
