// Runs only on a disposable Windows CI worker; never point this at a personal profile.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const { _electron, expect } = require('@playwright/test');
if (process.platform !== 'win32' || process.env.CI !== 'true') throw new Error('Disposable Windows CI only');
const out = path.resolve('test-results'); fs.mkdirSync(out, {recursive:true});
const install = path.join(process.env.LOCALAPPDATA, 'Programs', 'DayFlow-acceptance');
const data = path.join(process.env.APPDATA, 'DayFlow');
const executable = path.join(install, 'DayFlow.exe');
const installer = path.resolve('release/DayFlow-Setup-1.0.1.exe');
const report = {version:'1.0.1',platform:process.platform,os:require('node:os').release(),checks:[],manualWindows10And11Review:'pending'};
let app, page;
function save() { fs.writeFileSync(path.join(out, 'windows-acceptance.json'), JSON.stringify(report,null,2)); }
async function check(name, fn) {
  console.log('CHECK ' + name);
  try { await fn(); report.checks.push({name,status:'PASS'}); }
  catch (error) { report.checks.push({name,status:'FAIL',reason:error.message}); if(page&&!page.isClosed()) { await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{}); fs.writeFileSync(path.join(out,'failure-dom.txt'),await page.locator('body').innerText().catch(()=>'')); } throw error; }
  finally { save(); }
}
async function poll(fn, timeout=90000) { const start=Date.now(); while(Date.now()-start<timeout) { if(await fn()) return; await new Promise(r=>setTimeout(r,500)); } throw new Error('Timed out waiting for condition'); }
function run(file,args=[]) { cp.execFileSync(file,args,{stdio:'inherit',timeout:180000,windowsHide:true}); }
async function launch(expectedVersion) {
  app=await _electron.launch({executablePath:executable,timeout:60000});
  page=await app.firstWindow(); page.setDefaultTimeout(15000);
  await expect(page.getByRole('button',{name:'Toggle theme'})).toBeVisible();
  assert.equal(await app.evaluate(({app})=>app.getVersion()),expectedVersion);
  assert.equal((await app.evaluate(({app})=>app.getPath('userData'))).toLowerCase(),data.toLowerCase());
}
async function close() { if(app) await app.close(); app=null;page=null; }
const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('dayflow-v2')));
const nav=name=>page.locator('.sidebar nav').getByRole('button',{name:new RegExp(name)}).click();
const modal=()=>page.locator('.modal').filter({visible:true});
async function addTask(title) { await page.getByRole('button',{name:'＋ Add task',exact:true}).click(); await page.getByLabel('Task name',{exact:false}).fill(title); await page.getByRole('button',{name:'Create task',exact:true}).click(); await expect(page.getByText(title,{exact:true})).toBeVisible(); }
async function removeConfirmed() { await page.getByRole('alertdialog').getByRole('button',{name:'Delete',exact:true}).click(); await expect(page.getByRole('alertdialog')).toHaveCount(0); }
async function addCard(name,balance) { await nav('Financials');await page.getByRole('button',{name:'＋ Add new card',exact:true}).click();await page.getByLabel('Card name').fill(name);await page.getByLabel('Current balance',{exact:true}).fill(String(balance));await page.getByRole('button',{name:'Save card',exact:true}).click();await expect(page.getByRole('heading',{name,exact:true})).toBeVisible(); }
async function transaction(description,amount,type='Expense',destination) { await page.getByRole('button',{name:'＋ Log transaction',exact:true}).click();await page.getByLabel('Transaction type').selectOption(type);await page.getByLabel('Amount',{exact:true}).fill(String(amount));await page.getByLabel('Merchant or description').fill(description);if(destination)await page.getByLabel('Destination card').selectOption((await state()).cards.find(card=>card.name===destination).id);await page.getByRole('button',{name:'Save transaction',exact:true}).click();await expect(page.getByText(description,{exact:true})).toBeVisible(); }
async function uninstall() { const uninstaller=fs.readdirSync(install).find(name=>/^Uninstall.*\.exe$/i.test(name));assert.ok(uninstaller,'Uninstaller exists');run(path.join(install,uninstaller),['/S']);await poll(()=>!fs.existsSync(executable)); }
(async()=>{
  let legacyState;
  await check('Original 1.0.0 installer checksum and installation',async()=>{
    const url='https://github.com/Pronto4056/dayflow-desktop/releases/download/V1.0.0/DayFlow-Setup-1.0.0.exe';
    const response=await fetch(url);assert.equal(response.status,200);const bytes=Buffer.from(await response.arrayBuffer());
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'7d35283ec269e7436a5c2ca72cb1533c60dad311f676d7fc49e6967e31b8af0d');
    const old=path.resolve('.build/DayFlow-Setup-1.0.0.exe');fs.writeFileSync(old,bytes);run(old,['/S','/currentuser','/D='+install]);await poll(()=>fs.existsSync(executable));
    // Some installers start the app even in silent mode; stop only this CI test executable.
    cp.spawnSync('taskkill',['/IM','DayFlow.exe','/F'],{stdio:'ignore'});
    await launch('1.0.0');await addTask('Upgrade retention check');await page.getByRole('button',{name:'Toggle theme'}).click();
    legacyState=await state();await close();
  });
  await check('Upgrade installation and complete saved-state retention',async()=>{
    run(installer,['/S','/currentuser','/D='+install]);await poll(()=>fs.existsSync(executable));await launch('1.0.1');
    assert.deepEqual(await state(),legacyState);await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
    const backup=fs.readFileSync(path.join(data,'.dayflow-1.0.1-backup-complete'),'utf8').trim();assert.ok(fs.existsSync(path.join(backup,'Local Storage')));
    await page.screenshot({path:path.join(out,'upgrade-retained.png')});
  });
  await check('Offline renderer reload and application restart persistence',async()=>{
    await page.context().setOffline(true);await page.reload();await expect(page.getByText('Upgrade retention check',{exact:true})).toBeVisible();
    await close();await launch('1.0.1');assert.deepEqual(await state(),legacyState);await close();
  });
  await check('Uninstall preserves profile and removes executable',async()=>{await uninstall();assert.ok(fs.existsSync(path.join(data,'Local Storage')));});
  await check('Fresh installation starts empty without sample money or tasks',async()=>{
    fs.renameSync(data,data+'-upgrade-test-retained');run(installer,['/S','/currentuser','/D='+install]);await poll(()=>fs.existsSync(executable));await launch('1.0.1');
    const fresh=await state();for(const key of ['tasks','cards','budgets','transactions','routines','events'])assert.deepEqual(fresh[key],[]);
    await expect(page.getByText(/Welcome to DayFlow/)).toBeVisible();await page.screenshot({path:path.join(out,'first-launch.png')});
  });
  await check('Task validation, creation, edit, completion, restore, deletion and Undo',async()=>{
    await page.getByRole('button',{name:'＋ Add task',exact:true}).click();await page.getByRole('button',{name:'Create task',exact:true}).click();await expect(page.getByText('Task name and due date are required.')).toBeVisible();await page.getByRole('button',{name:'Cancel',exact:true}).click();
    await addTask('Acceptance task');await page.locator('.task-row').filter({hasText:'Acceptance task'}).getByRole('button',{name:'Edit',exact:true}).click();await page.getByLabel('Task name').fill('Edited acceptance task');await page.getByRole('button',{name:'Save changes',exact:true}).click();
    await page.getByRole('button',{name:'Complete task',exact:true}).click();await expect(page.locator('.metric').filter({hasText:'Tasks completed'})).toContainText('1 of 1');
    await nav('Tasks');await page.getByRole('button',{name:'Completed',exact:true}).click();await page.getByRole('button',{name:'Restore task to active'}).click();await page.getByRole('button',{name:'All',exact:true}).click();
    await page.locator('.task-row').filter({hasText:'Edited acceptance task'}).getByRole('button',{name:'Delete',exact:true}).click();await removeConfirmed();await page.getByRole('button',{name:'Undo',exact:true}).click();assert.equal((await state()).tasks.length,1);
  });
  await check('Routine creation, pause/resume and calendar synchronization',async()=>{
    await nav('Routines');await page.getByRole('button',{name:'＋ New routine',exact:true}).click();await page.getByLabel('Routine name').fill('Daily review');
    for(const day of ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']){const b=page.locator('.day-select').getByRole('button',{name:day,exact:true});if(!(await b.getAttribute('class')).includes('selected'))await b.click();}
    await page.getByLabel('Start time').fill('09:00');await page.getByLabel('End time').fill('10:00');await page.getByRole('button',{name:'Save routine',exact:true}).click();
    await page.getByRole('button',{name:'Pause',exact:true}).click();assert.equal((await state()).routines[0].status,'paused');await page.getByRole('button',{name:'Resume',exact:true}).click();await nav('Calendar');await expect(page.getByText('Daily review',{exact:true})).toBeVisible();
  });
  await check('Calendar event, daily timeline and overlapping duration layout',async()=>{
    await page.getByRole('button',{name:'＋ Add event',exact:true}).click();await page.getByLabel('Event title').fill('Planning call');await page.getByLabel('Start time').fill('09:30');await page.getByLabel('End time').fill('10:30');await page.getByRole('button',{name:'Save event',exact:true}).click();
    await page.getByRole('button',{name:'View day',exact:true}).click();await expect(page.getByText('Planning call',{exact:true})).toBeVisible();assert.equal(await page.locator('.timeline').evaluate(e=>getComputedStyle(e).height),'2880px');await page.screenshot({path:path.join(out,'daily-breakdown.png')});
  });
  await check('Cards, budget, expense editing/deletion, transfer and recalculation',async()=>{
    await addCard('Test debit',100);await addCard('Test savings',50);await page.getByRole('button',{name:/Debit Test debit/}).click();
    await page.getByRole('button',{name:'＋ Add budget',exact:true}).click();await page.getByLabel('Budget name').fill('Test monthly budget');await page.getByLabel('Budget limit').fill('200');await page.getByRole('button',{name:'Save budget',exact:true}).click();
    await transaction('Sample expense',125);await expect(page.locator('.card-detail-hero')).toContainText('-$25.00');
    const row=page.locator('.transaction-row').filter({hasText:'Sample expense'});await row.getByRole('button',{name:'Edit',exact:true}).click();await page.getByLabel('Amount',{exact:true}).fill('120');await page.getByRole('button',{name:'Save transaction',exact:true}).click();await expect(page.locator('.card-detail-hero')).toContainText('-$20.00');
    await row.getByRole('button',{name:'Delete',exact:true}).click();await removeConfirmed();await expect(page.locator('.card-detail-hero')).toContainText('$100.00');
    await transaction('Sample transfer',25,'Transfer','Test savings');await expect(page.locator('.card-detail-hero')).toContainText('$75.00');
    await page.getByRole('button',{name:'← Back to Financials',exact:true}).click();await expect(page.getByRole('button',{name:/Debit Test savings/})).toContainText('$75.00');await page.screenshot({path:path.join(out,'financials.png')});
  });
  await check('Profile, theme and restart persistence',async()=>{
    await nav('Profile');await page.getByLabel('Name',{exact:false}).fill('Demo workspace');await page.getByRole('button',{name:'Save profile',exact:true}).click();await page.getByRole('button',{name:'Toggle theme'}).click();
    const before=await state();await close();await launch('1.0.1');assert.deepEqual(await state(),before);await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  });
  await check('Corrupt JSON and invalid saved structure remain intact and cannot be silently overwritten',async()=>{
    const before=await state();
    for(const bad of ['{unreadable','{"profile":null}']){
      await page.evaluate(raw=>localStorage.setItem('dayflow-v2',raw),bad);await page.reload();await expect(page.getByRole('alert')).toContainText('saving is disabled');await page.getByRole('button',{name:'Toggle theme'}).click();assert.equal(await page.evaluate(()=>localStorage.getItem('dayflow-v2')),bad);
      await expect(page.getByRole('button',{name:'Saving paused',exact:true})).toBeDisabled();
    }
    await page.evaluate(saved=>localStorage.setItem('dayflow-v2',JSON.stringify(saved)),before);await page.reload();
  });
  await check('Confirmed reset clears to an empty workspace',async()=>{
    await nav('Settings');await page.getByRole('button',{name:'Reset account',exact:true}).click();await expect(page.getByRole('button',{name:'Permanently reset'})).toBeDisabled();await page.getByRole('button',{name:'Cancel',exact:true}).click();assert.ok((await state()).tasks.length);
    await page.getByRole('button',{name:'Reset account',exact:true}).click();await page.getByLabel('Type RESET to confirm').fill('RESET');await page.getByRole('button',{name:'Permanently reset'}).click();assert.equal((await state()).tasks.length,0);assert.equal((await state()).cards.length,0);
  });
  await close();await check('Final clean uninstall',uninstall);
  report.result='PASS';save();
})().catch(async error=>{console.error(error);report.result='FAIL';save();await close().catch(()=>{});process.exitCode=1;});
