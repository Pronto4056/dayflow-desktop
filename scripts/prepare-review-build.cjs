// Targeted recovery fixes for the exact renderer shipped in DayFlow 1.0.0.
// This does not rebuild the original React/TypeScript project or Windows installer.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const expected = '1aa4b0d65e66f24774692061cb1b3e7149653e87f3f2e46e05ca3c7b7695c04f';
const input = path.resolve(process.argv[2] || 'recovered/app/dist-desktop');
const output = path.resolve(process.argv[3] || 'review-build');
if (input === output || output.startsWith(input + path.sep)) {
  throw new Error('Choose a separate output directory; recovered originals must stay intact.');
}
const jsName = 'index-BsYSeHvl.js';
let code = fs.readFileSync(path.join(input, 'assets', jsName), 'utf8');
const originalHash = crypto.createHash('sha256').update(code).digest('hex');
if (originalHash !== expected) throw new Error('Unsupported renderer hash; refusing to patch a different version.');
const changes = [];
function replaceExact(before, after, count = 1) {
  const found = code.split(before).length - 1;
  if (found !== count) throw new Error(`Unsupported renderer: expected ${count} matches, found ${found}: ${before.slice(0, 70)}`);
  code = code.split(before).join(after);
  changes.push({ expression: before.slice(0, 100), replacements: count });
}
const helpers = `
function dayflowLocalDate(date = new Date()) {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}
function dayflowShiftDate(value, recurrence, offset) {
  const date = new Date(value + 'T12:00');
  if (recurrence === 'Daily') date.setDate(date.getDate() + offset);
  if (recurrence === 'Weekly') date.setDate(date.getDate() + offset * 7);
  if (recurrence === 'Monthly') {
    const day = date.getDate();
    date.setDate(1);
    date.setMonth(date.getMonth() + offset);
    date.setDate(Math.min(day, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
  }
  return dayflowLocalDate(date);
}
`;

replaceExact('new Date().toISOString().slice(0,10)', 'dayflowLocalDate()', 3);
replaceExact('new Date(new Date().getFullYear(),new Date().getMonth()+1,0).toISOString().slice(0,10)', 'dayflowLocalDate(new Date(new Date().getFullYear(),new Date().getMonth()+1,0))', 2);
replaceExact('n.toISOString().slice(0,10)', 'dayflowLocalDate(n)', 3);
replaceExact('Ae=(e,t,n)=>{let r=new Date(`${e}T12:00`);return t===`Daily`&&r.setDate(r.getDate()+n),t===`Weekly`&&r.setDate(r.getDate()+n*7),t===`Monthly`&&r.setMonth(r.getMonth()+n),r.toISOString().slice(0,10)}', 'Ae=(e,t,n)=>dayflowShiftDate(e,t,n)');
replaceExact('e.completedAt?.slice(0,10)===P()', 'e.completedAt&&dayflowLocalDate(new Date(e.completedAt))===P()');
replaceExact('value:`${N.done} of ${N.todays.length}`', 'value:`${N.done} of ${N.todays.length+N.done}`');

// Preserve raw balances so overdrafts/credit overpayments are not silently erased.
replaceExact('balance:y(Math.max(0,t+r))', 'balance:y(t+r)');
replaceExact('n=Math.max(0,u.balance-r)', 'n=u.balance-r');

// A corrupt-data starter view must never auto-save over the unreadable data.
replaceExact('A=(0,_.useRef)(null);', 'A=(0,_.useRef)(null),dayflowPersistenceBlocked=(0,_.useRef)(!1),dayflowUndoBaseline=(0,_.useRef)(null);');
replaceExact('let e=Re();t(e.data)', 'let e=Re();dayflowPersistenceBlocked.current=!!e.error,t(e.data)');
replaceExact('if(n){try{localStorage.setItem', 'if(n&&!dayflowPersistenceBlocked.current){try{localStorage.setItem');
replaceExact('A safe starter view has been opened; existing files were not intentionally removed.', 'A temporary starter view is open and saving is disabled to protect the original data. Close the app and back up its data folder before recovery.');
replaceExact('localStorage.removeItem(`dayflow-v2`),t(Ne)', 'localStorage.removeItem(`dayflow-v2`),dayflowPersistenceBlocked.current=!1,t(Ne)');

// The original Undo replaces the full prior snapshot. Expire it after any new
// state change so it cannot discard a later task completion, pause or theme change.
replaceExact('},[oe]);let j=', '},[oe]),(0,_.useEffect)(()=>{if(le){if(dayflowUndoBaseline.current===null)dayflowUndoBaseline.current=e;else if(dayflowUndoBaseline.current!==e){ue(null);dayflowUndoBaseline.current=null}}else dayflowUndoBaseline.current=null},[e,le]);let j=');
replaceExact('ne(e),ue(t||null)', 'ne(e),dayflowUndoBaseline.current=null,ue(t||null)');
replaceExact('he=()=>{le&&(t(le),ue(null),ne(`Deletion undone`),A.current&&window.clearTimeout(A.current),A.current=window.setTimeout(()=>ne(``),2300))}', 'he=()=>{if(!le)return;if(dayflowUndoBaseline.current!==null&&dayflowUndoBaseline.current!==e){ue(null),ne(`Undo expired because other data changed`);return}t(le),ue(null),ne(`Deletion undone`),A.current&&window.clearTimeout(A.current),A.current=window.setTimeout(()=>ne(``),2300)}');

// Keep duration-based placement while giving routine/event labels and actions space.
replaceExact('style:{top:t*60}', 'style:{top:t*120}');
replaceExact('style:{top:new Date().getHours()*60+new Date().getMinutes()}', 'style:{top:(new Date().getHours()*60+new Date().getMinutes())*2}');
replaceExact('let t=he(e.start),n=Math.max(44,he(e.end)-t),r=', 'let t=he(e.start)*2,n=Math.max(66,(he(e.end)-he(e.start))*2),r=');
replaceExact('top:Math.max(0,t-150)', 'top:Math.max(0,(t-60)*2)');
replaceExact('className:`modal-x`,onClick:Ce', 'className:`modal-x`,"aria-label":`Close`,onClick:Ce');

// Compile before creating any output; exact-match guards reject an incompatible bundle.
code = helpers + code;
new (require('node:vm').Script)(code, { filename: 'DayFlow-review-renderer.js' });
fs.mkdirSync(path.join(output, 'assets'), { recursive: true });
const patchedHash = crypto.createHash('sha256').update(code).digest('hex');
const reviewJs = `dayflow-review-${patchedHash.slice(0, 12)}.js`;
let css = fs.readFileSync(path.join(input, 'assets', 'index-BNpHI6a5.css'), 'utf8');
const originalCssHash = crypto.createHash('sha256').update(css).digest('hex');
const cssBefore = '.timeline{height:1440px';
if (css.split(cssBefore).length - 1 !== 1) throw new Error('Unsupported timeline stylesheet.');
css = css.replace(cssBefore, '.timeline{height:2880px').replace('.hour-row{align-items:start;height:60px', '.hour-row{align-items:start;height:120px');
const patchedCssHash = crypto.createHash('sha256').update(css).digest('hex');
const reviewCss = `dayflow-review-${patchedCssHash.slice(0, 12)}.css`;
let html = fs.readFileSync(path.join(input, 'index.html'), 'utf8');
html = html.replace(jsName, reviewJs).replace('index-BNpHI6a5.css', reviewCss);
fs.writeFileSync(path.join(output, 'index.html'), html);
fs.writeFileSync(path.join(output, 'assets', reviewCss), css);
fs.writeFileSync(path.join(output, 'assets', reviewJs), code);
fs.writeFileSync(path.join(output, 'provenance.json'), JSON.stringify({
  basedOn: 'DayFlow 1.0.0 packaged renderer',
  status: 'Browser review build; not a rebuilt or validated Windows release',
  originalHash, patchedHash, originalCssHash, patchedCssHash, reviewJs, reviewCss, changes,
}, null, 2) + '\n');
console.log(JSON.stringify({ output, originalHash, patchedHash, changes: changes.length }, null, 2));
