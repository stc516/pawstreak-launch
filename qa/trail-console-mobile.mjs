import assert from 'node:assert/strict'
import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
const out=process.env.QA_OUT_DIR || 'artifacts/design-90'
const base=process.env.QA_BASE_URL || 'http://127.0.0.1:4190'
await mkdir(out,{recursive:true})
const browser=await chromium.launch({headless:true,...(process.env.QA_BROWSER_PATH ? {executablePath:process.env.QA_BROWSER_PATH}: {})})
const page=await browser.newPage({...devices['iPhone 13'],viewport:{width:375,height:667},deviceScaleFactor:2,serviceWorkers:'block',reducedMotion:'reduce'})
page.setDefaultTimeout(10000)
page.on('dialog',dialog=>dialog.accept())
const errors=[];page.on('pageerror',e=>errors.push(e.message))
const checks=[]
const check=(name,condition)=>{assert.ok(condition,name);checks.push(name);console.log('PASS',name)}
const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('pawstreak:demo')))
const capture=name=>page.screenshot({path:path.join(out,`${name}.png`)})
async function ready(){await page.goto(`${base}/demo/app`);await page.locator('.home-pack').waitFor();}
async function start(){await page.getByRole('button',{name:'Start a walk',exact:true}).click();const button=page.getByRole('button',{name:'Start adventure',exact:true});if(await button.isVisible())await button.click();await page.locator('.trail-console').waitFor();}
async function home(){await page.locator('.bnav').getByRole('button',{name:'Today',exact:true}).click();}
try {
 await ready();await page.waitForTimeout(400);await capture('after-home');
 check('Both dog names visible',await page.locator('.home-pack').innerText().then(t=>t.includes('Bailey')&&t.includes('Meiomi')))
 check('Start and Explore visible above navigation',await page.getByRole('button',{name:'Explore nearby',exact:true}).boundingBox().then(b=>b.y+b.height<600))
 await start();await page.waitForTimeout(1200);await capture('after-active');
 check('Exactly one elapsed timer',await page.locator('.trail-timer').count()===1)
 check('Finish and Pause reachable without scrolling',await page.getByRole('button',{name:'Pause',exact:true}).boundingBox().then(b=>b.y>=0&&b.y+b.height<600))
 check('No checkpoint or photo warning',!await page.getByText(/Memory checkpoint|No photo yet|proof that/).count())
 const id=(await state()).activeAdventure.id
 await page.getByRole('button',{name:'Pause',exact:true}).click();const paused=await page.locator('.trail-timer').innerText();await page.waitForTimeout(1200)
 check('Pause freezes elapsed time',await page.locator('.trail-timer').innerText()===paused)
 await page.getByRole('button',{name:'Minimize active adventure',exact:true}).click();await home();await page.getByRole('button',{name:'Resume walk',exact:true}).click()
 check('Navigation preserves session and pause', (await state()).activeAdventure.id===id && await page.getByRole('button',{name:'Resume',exact:true}).isVisible())
 await page.reload();await page.locator('.trail-console').waitFor();check('Reload preserves paused timer',await page.locator('.trail-timer').innerText()===paused)
 await page.getByRole('button',{name:'Resume',exact:true}).click();await page.waitForTimeout(1200)
 const elapsed=await page.locator('.trail-timer').innerText();check('Resume excludes paused time',Number(elapsed.split(':')[1])-Number(paused.split(':')[1])<=2)
 const count=(await state()).journeyEntries.length
 await page.getByRole('button',{name:'Finish walk',exact:true}).click();await page.locator('.field-notes').waitFor();await capture('after-recap')
 const saved=await state();check('No-photo walk saved once to Journey',!saved.activeAdventure&&saved.journeyEntries.length===count+1&&(saved.journeyEntries[0].photoUrls?.length ?? 0)===0)
 check('No empty-photo warning in recap',!await page.getByText(/No camera|Photo status|without photos/).count())
 await page.getByText('Add a detail · optional',{exact:true}).click();await page.getByLabel('A note to remember').fill('A slow lap together.');await page.getByRole('button',{name:'Save detail',exact:true}).click();await page.getByText('Detail saved.',{exact:true}).waitFor()
 const photo=path.resolve('public/pawstreak-logo.png')
 await page.locator('.field-add-detail input[type=file]').setInputFiles(photo);await page.locator('.field-pending-photo').waitFor();await page.getByRole('button',{name:'Save detail',exact:true}).click();await page.locator('.field-gallery img').waitFor()
 await page.reload();await page.locator('.bnav').waitFor();check('Optional recap photo and note persist after reload',(await state()).journeyEntries[0].userNotes==='A slow lap together.'&&(await state()).journeyEntries[0].photoUrls.length===1)
 await home();
 // Explicit existing geocode mock keeps this deterministic; no live location claim.
 await page.evaluate(()=>{window.__PAWSTREAK_GEOCODE_MOCK__={'97201':{rawInput:'97201',placeName:'Portland, Oregon',city:'Portland',state:'Oregon',country:'United States',lat:45.51,lng:-122.68,mapboxPlaceId:'qa-portland',relevance:1},'92101':{rawInput:'92101',placeName:'San Diego, California',city:'San Diego',state:'California',country:'United States',lat:32.72,lng:-117.16,mapboxPlaceId:'qa-san-diego',relevance:1}}})
 await page.getByRole('button',{name:'Change current area or ZIP'}).click();await page.getByPlaceholder('City or ZIP').fill('97201');await page.getByRole('button',{name:'Find',exact:true}).click();await page.waitForTimeout(500);await home();
 check('Unsupported ZIP shown and no curated pick',(await state()).locationSupported===false&&await page.locator('.home-area-chip').innerText().then(t=>t.includes('97201'))&&await page.locator('.home-nearby-pick').count()===0)
 await capture('after-home-unsupported');await start();check('Unsupported ZIP starts Neighborhood Walk',(await state()).activeAdventure.placeId==='neighborhood-walk')
 await page.getByRole('button',{name:'Cancel adventure',exact:true}).click();await page.waitForTimeout(200)
 if(await page.getByRole('button',{name:'Discard adventure',exact:true}).isVisible())await page.getByRole('button',{name:'Discard adventure',exact:true}).click()
 check('Cancel clears walk without creating a memory',!(await state()).activeAdventure&&(await state()).journeyEntries.length===count+1)
 await page.getByRole('button',{name:'Change current area or ZIP'}).click();await page.getByPlaceholder('City or ZIP').fill('92101');await page.getByRole('button',{name:'Find',exact:true}).click();await page.waitForTimeout(500);await home();
 check('Supported ZIP restores nearby choice',(await state()).locationSupported===true&&await page.locator('.home-nearby-pick').count()===1)
 await start();await page.locator('.cam-input').setInputFiles({name:'bad.txt',mimeType:'text/plain',buffer:Buffer.from('not a photo')});await page.getByRole('status').filter({hasText:'That photo could not be added'}).waitFor();check('Invalid image recovers',true)
 for(let i=0;i<3;i++){await page.locator('.cam-input').setInputFiles(photo);await page.waitForTimeout(150)}
 check('Three photos attach through real image input',(await state()).adventurePhotos.filter(Boolean).length===3)
 await capture('after-active-photos');await page.locator('.trail-scroll').evaluate(el=>el.scrollTop=el.scrollHeight);await capture('after-active-gallery');
 check('Gallery is not covered by a footer',await page.locator('.field-gallery').boundingBox().then(b=>b.y>=0&&b.y+b.height<=667))
 await page.getByRole('button',{name:'Finish walk',exact:true}).click();await page.locator('.field-notes').waitFor();await capture('after-recap-photos');await page.locator('.field-notes-scroll').evaluate(el=>el.scrollTop=el.scrollHeight);await capture('after-recap-gallery')
 check('Gallery count beside heading, photos saved once',await page.locator('.field-gallery-heading').innerText().then(t=>t.includes('3 photos'))&&(await state()).journeyEntries[0].photoUrls.length===3)
 check('No horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
 check('No runtime errors',errors.length===0)
} catch(error){await capture('failure');throw error}finally{await writeFile(path.join(out,'checks.json'),JSON.stringify({checks,errors,viewport:'375 × 667',engine:'Chromium mobile emulation',fixture:'DEMO; uploaded PawStreak logo used only as media QA fixture'},null,2));await browser.close()}
