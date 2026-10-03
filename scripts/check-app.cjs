// Tests execute isolated helpers extracted from the actual packaged renderer.
// No Electron/window automation, installed user data, or Windows certification.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const originalPath = path.resolve(process.argv[2] || 'recovered/app/dist-desktop/assets/index-BsYSeHvl.js');
const reviewIndex = fs.readFileSync('review-build/index.html', 'utf8');
const reviewAsset = reviewIndex.match(/src="\.\/assets\/([^"]+)"/)[1];
const reviewPath = path.resolve(process.argv[3] || path.join('review-build/assets',reviewAsset));
const results = [];
function between(source, start, end) {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a + start.length);
  assert.ok(a >= 0 && b > a, `Missing helper boundary ${start}`);
  return source.slice(a, b);
}
function test(build, name, fn) {
  try { fn(); results.push({ build, name, status: 'PASS' }); }
  catch (error) { results.push({ build, name, status: 'FAIL', reason: error.message }); }
}
function contexts(source, now) {
  const helpers = source.includes('function dayflowLocalDate') ? source.slice(0, source.indexOf('var e=Object.create')) : '';
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now || '2026-10-03T12:00:00Z'])); }
    static now() { return new Date(now || '2026-10-03T12:00:00Z').getTime(); }
  }
  const finance = vm.createContext({ Date: FixedDate });
  vm.runInContext(helpers + 'var ' + between(source, 'y=e=>Math.round', 'var ne=o('), finance);
  const calendar = vm.createContext({ Date: FixedDate });
  vm.runInContext(helpers + between(source, 'var j=[`Mon`', 'function be('), calendar);
  const dates = vm.createContext({ Date: FixedDate });
  vm.runInContext(helpers + 'var ' + between(source, 'Ae=(e,t,n)=>', ',Me=e=>'), dates);
  const today = between(source, 'var P=()=>', ',F=()=>');
  vm.runInContext(helpers + today, dates);
  return { finance, calendar, dates, helpers };
}
function run(build, source) {
  const { finance: f, calendar: c } = contexts(source);
  const debit = { id: 'debit', type: 'Debit', openingBalance: 1000, balance: 1000 };
  const credit = { id: 'credit', type: 'Credit', openingBalance: 500, balance: 500, limit: 2000 };
  const tx = (id, type, amount, rest = {}) => ({ id, type, amount, cardId: 'debit', date: '2026-10-03', category: 'Food', ...rest });
  test(build, 'Debit expense/income/refund balance', () => {
    assert.equal(f.S([debit], [tx('a', 'Expense', 100), tx('b', 'Income', 200), tx('c', 'Refund', 25)])[0].balance, 1125);
  });
  test(build, 'Credit purchases/payments/refunds', () => {
    assert.equal(f.S([credit], [tx('a', 'Expense', 100, {cardId:'credit'}), tx('b', 'Credit Card Payment', 200, {cardId:'credit'}), tx('c', 'Refund', 25, {cardId:'credit'})])[0].balance, 375);
  });
  test(build, 'Transfer applies once to both cards', () => {
    const out = f.S([debit, credit], [tx('t', 'Transfer', 100, { targetCardId: 'credit' })]);
    assert.equal(out[0].balance, 900); assert.equal(out[1].balance, 400);
  });
  test(build, 'Duplicate transaction IDs do not double-apply balances', () => {
    const expense = tx('a', 'Expense', 10); assert.equal(f.S([debit], [expense, expense])[0].balance, 990);
  });
  test(build, 'Transaction editing/deletion recomputes from opening balance', () => {
    assert.equal(f.S([debit], [tx('a', 'Expense', 125)])[0].balance, 875);
    assert.equal(f.S([debit], [tx('a', 'Expense', 150)])[0].balance, 850);
    assert.equal(f.S([debit], [])[0].balance, 1000);
  });
  test(build, 'Fractional amounts round to currency cents', () => {
    assert.equal(f.S([debit], [tx('a', 'Expense', .1), tx('b', 'Expense', .2)])[0].balance, 999.7);
  });
  test(build, 'Overlapping budgets count spending once overall', () => {
    const general = { id:'g', cardId:'debit', category:'All spending', status:'active', start:'2026-10-01', end:'2026-10-31', limit:1000 };
    const food = { ...general, id:'f', category:'Food', limit:300 };
    const transactions = [tx('a', 'Expense', 125), tx('t', 'Transfer', 100, {targetCardId:'credit'})];
    assert.equal(f.w(general, transactions), 125); assert.equal(f.w(food, transactions), 125);
    assert.equal(f.te([general, food], transactions).spent, 125);
  });
  test(build, 'Routine selected weekdays and date bounds', () => {
    const routine = { startDate:'2026-10-03', endDate:'2026-10-11', days:['Sat','Sun'], weekly:true };
    assert.equal(c.ve(routine, '2026-10-03'), true);
    assert.equal(c.ve(routine, '2026-10-05'), false);
    assert.equal(c.ve(routine, '2026-10-11'), true);
    assert.equal(c.ve(routine, '2026-10-17'), false);
  });
  test(build, 'Timeline overlap columns and time durations', () => {
    const layout = c.ye([{start:'16:00',end:'17:00'}, {start:'16:30',end:'17:30'}, {start:'18:00',end:'18:45'}]);
    assert.equal(layout[0].columns,2); assert.equal(layout[1].column,1); assert.equal(layout[2].columns,1);
    assert.equal(c.M('19:00','20:30'),'1 hour 30 min');
  });
  test(build, 'Monthly recurrence clamps January 31 to February end', () => {
    assert.equal(contexts(source).dates.Ae('2026-01-31','Monthly',1), '2026-02-28');
  });
  test(build, 'Negative debit balance is retained rather than silently clamped', () => {
    assert.equal(f.S([{...debit,openingBalance:50}], [tx('a','Expense',75)])[0].balance, -25);
  });
  const oldTZ = process.env.TZ;
  try {
    process.env.TZ = 'America/New_York';
    test(build, 'Today follows local date near midnight', () => {
      assert.equal(contexts(source,'2026-10-03T23:30:00-04:00').dates.P(), '2026-10-03');
    });
    process.env.TZ = 'Asia/Dhaka';
    test(build, 'Default monthly budget ends on local October 31', () => {
      const ctx = contexts(source, '2026-10-03T12:00:00Z');
      const budgetDefault = between(source,'ce=e=>','),D=e=>') + ')';
      vm.runInContext(ctx.helpers + 'var re=()=>new Date().toISOString().slice(0,10);var ' + budgetDefault, ctx.dates);
      assert.equal(ctx.dates.ce('debit').end, '2026-10-31');
    });
  } finally { if(oldTZ === undefined) delete process.env.TZ; else process.env.TZ = oldTZ; }
  test(build, 'Unreadable saved data is not overwritten by startup auto-save', () => {
    const writes = [];
    const { helpers } = contexts(source);
    const ctx = vm.createContext({
      window: {}, navigator: {}, Date,
      Ne: {profile:{name:'Demo'},cards:[],tasks:[],routines:[],events:[],routineOccurrences:[],budgets:[],transactions:[]},
      P:()=> '2026-10-03', n:true, dayflowPersistenceBlocked:{current:false},
      localStorage:{getItem:()=>'{unreadable',setItem:(k,v)=>writes.push(v)},
      document:{documentElement:{dataset:{}}},
      v:()=>{},ie:()=>{},r:()=>{},ae:()=>{},
    });
    ctx.t = value => {ctx.e=value;};
    vm.runInContext(helpers + between(source,'function Re(){','function ze(){'), ctx);
    const loadBody = between(source, 'let e=Re();', '},[]),(0,_.useEffect)');
    // Restrict to the auto-save effect, not any earlier unrelated if(n).
    const saveStart = source.indexOf('},[]),(0,_.useEffect)(()=>{', source.indexOf('let e=Re();'));
    const actualSave = source.slice(saveStart + '},[]),(0,_.useEffect)(()=>{'.length, source.indexOf('},[e,n])',saveStart));
    vm.runInContext('(function(){'+loadBody+'})();',ctx);
    vm.runInContext('(function(){'+actualSave+'})();',ctx);
    assert.equal(writes.length,0);
  });
}
run('packaged-1.0.0', fs.readFileSync(originalPath,'utf8'));
run('review-fixes', fs.readFileSync(reviewPath,'utf8'));
console.log(JSON.stringify({kind:'Isolated packaged-helper tests; not Windows end-to-end tests',results},null,2));
const reviewFailures=results.filter(r=>r.build==='review-fixes'&&r.status==='FAIL');
process.exitCode=reviewFailures.length ? 1 : 0;
