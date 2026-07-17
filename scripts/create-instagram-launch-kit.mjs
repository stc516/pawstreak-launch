import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE_URL = process.env.SOCIAL_BASE_URL || 'http://127.0.0.1:5175'
const OUTPUT = process.env.SOCIAL_OUTPUT || '/Users/stephencarroll/Downloads/PawStreak Instagram Launch Kit'
const WALK_PHOTO = process.env.PAWSTREAK_WALK_PHOTO || '/Users/stephencarroll/Downloads/IMG_4654.PNG'
const RAW = path.join(OUTPUT, '01-raw-product-screens')
const FEED = path.join(OUTPUT, '02-feed-4x5')
const STORIES = path.join(OUTPUT, '03-stories-9x16')
const COPY = path.join(OUTPUT, '04-captions')
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const PHILOSOPHY = path.join(SCRIPT_DIR, '..', 'social-assets', 'ELECTRIC_PRODUCT_PHILOSOPHY.md')
const APP_LOGO = path.join(SCRIPT_DIR, '..', 'public', 'pawstreak-logo.png')

const posts = [
  {
    id: '01-meet-pawstreak',
    layout: 'brand-reveal',
    headline: 'Dog days, upgraded.',
    subhead: 'Pick an adventure. Go live it. Keep the story.',
    background: 'linear-gradient(145deg,#c9ff00 0%,#36ff86 35%,#00e2d0 67%,#00b8ff 100%)',
    ink: '#062e24',
    accent: '#ff4f1f',
    caption: 'Meet PawStreak—the dog adventure app built to make getting out the door feel like the best part of the day. Pick something fun, bring your dog, and keep the story after the adventure ends.\n\npawstreakapp.com\n\n#PawStreak #DogAdventure #DogParents #LifeWithDogs',
  },
  {
    id: '02-explore-real-places',
    headline: 'The same old walk just got competition.',
    subhead: 'Explore real dog-friendly places and pick the day’s energy.',
    background: 'linear-gradient(135deg,#ff6a00 0%,#ff2f7d 100%)',
    ink: '#ffffff',
    accent: '#c9ff00',
    objectPosition: 'top',
    caption: 'Beach? Trail? Patio? Park? PawStreak helps you choose the next dog-friendly adventure without turning it into homework.\n\n#PawStreak #DogFriendly #DogAdventure #ExploreWithDogs',
  },
  {
    id: '03-add-your-own',
    headline: 'Your weird little outing counts too.',
    subhead: 'Add any adventure. Calendar alerts are optional—not forced.',
    background: 'linear-gradient(135deg,#00e2d0 0%,#33ff57 100%)',
    ink: '#062e24',
    accent: '#6d28d9',
    objectPosition: 'top',
    caption: 'Camping, a brewery patio, a boat day, or the route only your dog understands. Add it, save it, and choose calendar alerts only if you want them.\n\n#PawStreak #DogDays #AdventureDog #DogParents',
  },
  {
    id: '04-training-adventure',
    headline: 'Training should feel like an adventure.',
    subhead: 'Tiny real sessions. Big dog energy.',
    background: 'linear-gradient(135deg,#6d28d9 0%,#ff2f7d 100%)',
    ink: '#ffffff',
    accent: '#c9ff00',
    objectPosition: 'top',
    caption: 'Training is part of the adventure. Pick a skill, choose your rhythm, and turn the chaos into a superpower—one short session at a time.\n\n#PawStreak #DogTraining #EnrichmentForDogs #AdventureDog',
  },
  {
    id: '05-optional-calendar',
    headline: 'Make the good intention actually happen.',
    subhead: 'Add dates for alerts—or keep it unscheduled. You choose.',
    background: 'linear-gradient(135deg,#ffe600 0%,#ff6a00 100%)',
    ink: '#062e24',
    accent: '#00e2d0',
    objectPosition: 'top',
    caption: 'A training plan can live in PawStreak without touching your calendar. Want the extra nudge? Add real dates and export the sessions with alerts. Nothing happens without your tap.\n\n#PawStreak #DogTrainingTips #DogRoutine #DogParents',
  },
  {
    id: '06-real-walk-memory',
    headline: 'The adventure ends. The story stays.',
    subhead: 'A real walk photo, saved as a PawStreak memory.',
    background: 'linear-gradient(135deg,#ff2f7d 0%,#ff6a00 100%)',
    ink: '#ffffff',
    accent: '#c9ff00',
    objectPosition: 'center',
    caption: 'This is a real photo from a real walk. PawStreak turns the days you actually lived together into memories you can come back to.\n\n#PawStreak #DogWalk #DogMemories #LifeWithDogs',
  },
  {
    id: '07-instagram-share',
    headline: 'Adventure complete. Story ready.',
    subhead: 'Create a share card from the memory you actually saved.',
    background: 'linear-gradient(135deg,#00c2ff 0%,#5b38ff 100%)',
    ink: '#ffffff',
    accent: '#c9ff00',
    objectPosition: 'top',
    caption: 'Finish the adventure, save the memory, and make it Story-ready. No invented miles. No fake streak. Just the day you and your dog actually had.\n\n#PawStreak #InstagramStories #DogAdventure #DogParents',
  },
  {
    id: '08-reminders',
    headline: 'A nudge. Not a guilt trip.',
    subhead: 'Optional morning and evening adventure reminders.',
    background: 'linear-gradient(135deg,#c9ff00 0%,#00e2d0 100%)',
    ink: '#062e24',
    accent: '#ff4f1f',
    objectPosition: 'center',
    caption: '“What adventures did your dog get into today?” Morning and evening reminders are optional, adjustable, and designed to get you out the door—not make you feel behind.\n\n#PawStreak #DogRoutine #DogWalkReminder #DogLife',
  },
]

const cleanupCss = `
  .demo-mode-bar, .demo-feedback-trigger, .demo-feedback-overlay,
  .demo-feedback-sheet, .memory-toast { display: none !important; }
`

function dataUrl(buffer, mime = 'image/png') {
  return `data:${mime};base64,${buffer.toString('base64')}`
}

async function snap(page, id) {
  await page.addStyleTag({ content: cleanupCss })
  await page.screenshot({ path: path.join(RAW, `${id}.png`), animations: 'disabled' })
}

async function clickNav(page, label) {
  await page.locator('.bnav').getByRole('button', { name: label, exact: true }).click()
  await page.waitForTimeout(450)
}

async function createPostPage(browser, post, screenshot, format) {
  const isStory = format === 'story'
  const viewport = isStory ? { width: 1080, height: 1920 } : { width: 1080, height: 1350 }
  const page = await browser.newPage({ viewport })
  const screenshotUrl = dataUrl(await readFile(screenshot))
  await page.setContent(`<!doctype html><html><head><style>
    *{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;font-family:Inter,ui-rounded,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden}
    body{--ink:${post.ink};--accent:${post.accent};position:relative;background:${post.background};color:var(--ink)}
    body::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 87% 8%,rgba(255,255,255,.42),transparent 18%),linear-gradient(112deg,transparent 64%,rgba(255,255,255,.16) 64% 67%,transparent 67% 71%,rgba(255,255,255,.12) 71% 73%,transparent 73%);pointer-events:none}
    .energy-rail{position:absolute;z-index:1;left:${isStory ? 52 : 36}px;top:${isStory ? 150 : 44}px;width:${isStory ? 18 : 14}px;height:${isStory ? 380 : 270}px;border-radius:99px;background:var(--accent);box-shadow:${isStory ? '30px 0' : '24px 0'} 0 color-mix(in srgb,var(--accent) 55%,transparent),${isStory ? '60px 0' : '48px 0'} 0 color-mix(in srgb,var(--accent) 25%,transparent);transform:skewY(-16deg)}
    .spark{position:absolute;z-index:2;font-size:${isStory ? 72 : 58}px;color:var(--accent);filter:drop-shadow(5px 6px 0 rgba(0,0,0,.16))}.s1{top:${isStory ? 160 : 55}px;right:${isStory ? 75 : 55}px;transform:rotate(12deg)}
    .content{position:absolute;z-index:5;left:${isStory ? 86 : 64}px;right:${isStory ? 86 : 64}px;top:${isStory ? 170 : 52}px}
    .brand{display:flex;align-items:center;gap:13px;font-size:${isStory ? 25 : 20}px;font-weight:950;letter-spacing:.12em;text-transform:uppercase}.paw{display:grid;place-items:center;width:${isStory ? 54 : 44}px;height:${isStory ? 54 : 44}px;border-radius:16px 16px 16px 6px;background:var(--accent);color:#062e24;font-size:${isStory ? 29 : 24}px;transform:rotate(-5deg);box-shadow:5px 6px 0 rgba(0,0,0,.18)}
    .copy{margin-top:${isStory ? 32 : 22}px;max-width:880px}.kicker{display:inline-block;padding:${isStory ? '7px 11px' : '5px 9px'};border:2px solid currentColor;border-radius:999px;font-size:${isStory ? 17 : 13}px;font-weight:950;letter-spacing:.1em;text-transform:uppercase}.copy h1{margin:${isStory ? '15px 0 12px' : '10px 0 8px'};font-size:${isStory ? 68 : 47}px;line-height:.94;letter-spacing:-.055em;max-width:900px}.copy p{margin:0;font-size:${isStory ? 25 : 18}px;line-height:1.24;font-weight:760;max-width:820px}
    .product-stage{position:absolute;z-index:4;overflow:hidden;left:${isStory ? 94 : 88}px;right:${isStory ? 94 : 88}px;top:${isStory ? 545 : 405}px;bottom:${isStory ? '-250' : '-115'}px;border:${isStory ? 18 : 14}px solid #10251e;border-radius:${isStory ? 62 : 48}px;background:#fff;box-shadow:${isStory ? '18px 21px' : '14px 17px'} 0 var(--accent),0 35px 80px rgba(0,0,0,.32);transform:rotate(${isStory ? '-.7' : '.7'}deg)}
    .product-stage img{width:100%;height:100%;object-fit:cover;object-position:${post.objectPosition};display:block}
    .product-tag{position:absolute;z-index:7;right:${isStory ? 112 : 106}px;top:${isStory ? 562 : 422}px;padding:${isStory ? '10px 15px' : '8px 12px'};border-radius:999px;background:#10251e;color:#fff;font-size:${isStory ? 16 : 12}px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
    .url{position:absolute;z-index:8;right:${isStory ? 88 : 66}px;top:${isStory ? 490 : 350}px;padding:7px 11px;border-radius:999px;background:var(--accent);color:#062e24;font-size:${isStory ? 20 : 15}px;font-weight:950}
  </style></head><body>
    <div class="energy-rail"></div><div class="spark s1">✦</div>
    <main class="content"><div class="brand"><span class="paw">🐾</span>PawStreak</div><section class="copy"><div class="kicker">Dog days, upgraded</div><h1>${post.headline}</h1><p>${post.subhead}</p></section></main>
    <div class="product-stage"><img src="${screenshotUrl}" alt="PawStreak product screen"></div>
    <div class="product-tag">PawStreak app</div><div class="url">pawstreakapp.com</div>
  </body></html>`)
  const layout = await page.evaluate(() => {
    const copy = document.querySelector('.copy')?.getBoundingClientRect()
    const product = document.querySelector('.product-stage')?.getBoundingClientRect()
    return {
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      copyOverlapsProduct: Boolean(copy && product && copy.bottom > product.top - 18),
    }
  })
  if (layout.horizontalOverflow || layout.copyOverlapsProduct) {
    throw new Error(`Unsafe ${format} layout for ${post.id}: ${JSON.stringify(layout)}`)
  }
  await page.screenshot({
    path: path.join(isStory ? STORIES : FEED, `${post.id}.png`),
    animations: 'disabled',
  })
  await page.close()
}

async function createBrandRevealPage(browser, post, logo, format) {
  const isStory = format === 'story'
  const viewport = isStory ? { width: 1080, height: 1920 } : { width: 1080, height: 1350 }
  const page = await browser.newPage({ viewport })
  const logoUrl = dataUrl(await readFile(logo))
  await page.setContent(`<!doctype html><html><head><style>
    *{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;font-family:Inter,ui-rounded,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden}
    body{--ink:${post.ink};--accent:${post.accent};position:relative;background:${post.background};color:var(--ink)}
    body::before{content:'';position:absolute;inset:-10%;background:radial-gradient(circle at 78% 12%,rgba(255,255,255,.75),transparent 20%),repeating-linear-gradient(118deg,transparent 0 76px,rgba(255,255,255,.18) 76px 88px);transform:rotate(-2deg)}
    .corner{position:absolute;background:var(--accent);box-shadow:12px 13px 0 #10251e;z-index:2}.corner.a{width:${isStory ? 260 : 205}px;height:${isStory ? 42 : 32}px;left:${isStory ? -45 : -38}px;top:${isStory ? 260 : 178}px;transform:rotate(-21deg)}.corner.b{width:${isStory ? 300 : 225}px;height:${isStory ? 42 : 32}px;right:${isStory ? -70 : -48}px;top:${isStory ? 870 : 600}px;transform:rotate(-21deg)}
    .spark{position:absolute;z-index:6;color:var(--accent);font-size:${isStory ? 88 : 66}px;font-weight:950;filter:drop-shadow(7px 8px 0 #10251e)}.s1{right:${isStory ? 78 : 60}px;top:${isStory ? 185 : 110}px;transform:rotate(13deg)}.s2{left:${isStory ? 80 : 65}px;top:${isStory ? 1030 : 760}px;transform:rotate(-14deg)}
    .kicker{position:absolute;z-index:8;left:${isStory ? 74 : 60}px;top:${isStory ? 105 : 54}px;display:flex;align-items:center;gap:13px;padding:${isStory ? '14px 20px' : '10px 15px'};border:4px solid #10251e;border-radius:999px;background:#fff8ed;box-shadow:8px 9px 0 var(--accent);font-size:${isStory ? 24 : 18}px;font-weight:950;letter-spacing:.1em;text-transform:uppercase}.dot{width:${isStory ? 20 : 16}px;height:${isStory ? 20 : 16}px;border-radius:50%;background:var(--accent)}
    .mark-zone{position:absolute;z-index:5;left:50%;top:${isStory ? 300 : 175}px;width:${isStory ? 770 : 610}px;height:${isStory ? 770 : 610}px;transform:translateX(-50%) rotate(-2deg)}
    .orbit{position:absolute;inset:-22px;border:7px solid #10251e;border-radius:50%;box-shadow:${isStory ? '25px 30px' : '19px 23px'} 0 var(--accent),${isStory ? '-20px -22px' : '-15px -17px'} 0 #fff8ed}
    .mark{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;border-radius:50%;filter:drop-shadow(0 25px 32px rgba(6,46,36,.22))}
    .copy{position:absolute;z-index:8;left:${isStory ? 74 : 60}px;right:${isStory ? 74 : 60}px;top:${isStory ? 1155 : 835}px}
    h1{margin:0;font-size:${isStory ? 118 : 90}px;line-height:.88;letter-spacing:-.065em;max-width:930px}p{margin:${isStory ? '26px 0 0' : '18px 0 0'};font-size:${isStory ? 36 : 27}px;line-height:1.12;font-weight:850;max-width:850px}
    .rhythm{margin-top:${isStory ? 44 : 30}px;display:inline-flex;gap:${isStory ? 14 : 10}px;align-items:center;padding:${isStory ? '14px 20px' : '10px 15px'};border-radius:14px;background:#10251e;color:#fff;font-size:${isStory ? 22 : 16}px;font-weight:950;letter-spacing:.08em;text-transform:uppercase;transform:rotate(-1deg)}.rhythm b{color:#c9ff00}.rhythm i{color:var(--accent);font-style:normal}
    .url{position:absolute;z-index:9;left:${isStory ? 74 : 60}px;bottom:${isStory ? 82 : 55}px;padding:${isStory ? '13px 19px' : '10px 15px'};border:4px solid #10251e;border-radius:999px;background:var(--accent);color:#10251e;font-size:${isStory ? 25 : 19}px;font-weight:950;box-shadow:7px 8px 0 #fff8ed}
  </style></head><body>
    <div class="corner a"></div><div class="corner b"></div><div class="spark s1">✦</div><div class="spark s2">✦</div>
    <div class="kicker"><span class="dot"></span>Meet the dog adventure app</div>
    <div class="mark-zone"><div class="orbit"></div><img class="mark" src="${logoUrl}" alt="PawStreak app logo"></div>
    <main class="copy"><h1>${post.headline}</h1><p>${post.subhead}</p><div class="rhythm"><b>Pick it</b><i>→</i>Go do it<i>→</i><b>Keep the story</b></div></main>
    <div class="url">pawstreakapp.com</div>
  </body></html>`)
  const layout = await page.evaluate(() => ({
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    verticalOverflow: document.documentElement.scrollHeight > window.innerHeight,
    logoHitsCopy: (() => {
      const logo = document.querySelector('.mark-zone')?.getBoundingClientRect()
      const copy = document.querySelector('.copy')?.getBoundingClientRect()
      return Boolean(logo && copy && logo.bottom > copy.top - 24)
    })(),
  }))
  if (layout.horizontalOverflow || layout.verticalOverflow || layout.logoHitsCopy) {
    throw new Error(`Unsafe ${format} brand layout for ${post.id}: ${JSON.stringify(layout)}`)
  }
  await page.screenshot({ path: path.join(isStory ? STORIES : FEED, `${post.id}.png`), animations: 'disabled' })
  await page.close()
}

await Promise.all([RAW, FEED, STORIES, COPY].map((directory) => rm(directory, { recursive: true, force: true })))
await Promise.all([RAW, FEED, STORIES, COPY].map((directory) => mkdir(directory, { recursive: true })))
await copyFile(PHILOSOPHY, path.join(OUTPUT, 'ELECTRIC_PRODUCT_PHILOSOPHY.md'))
await copyFile(APP_LOGO, path.join(RAW, '01-meet-pawstreak.png'))
const walkJpeg = path.join(RAW, 'source-real-walk.jpg')
execFileSync('sips', ['-Z', '900', '-s', 'format', 'jpeg', '-s', 'formatOptions', '82', WALK_PHOTO, '--out', walkJpeg], { stdio: 'ignore' })
const walkPhotoData = dataUrl(await readFile(walkJpeg), 'image/jpeg')

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  serviceWorkers: 'block',
})
const page = await context.newPage()

try {
  await page.goto(`${BASE_URL}/demo/app`, { waitUntil: 'networkidle' })
  await page.evaluate((photo) => {
    const raw = localStorage.getItem('pawstreak:demo')
    if (!raw) return
    const state = JSON.parse(raw)
    state.userName = 'Stephen'
    state.dogs = (state.dogs || []).map((dog) => ({ ...dog, photoUrl: undefined }))
    state.hasUserDogProfile = true
    state.streak = 0
    state.adventureCount = 1
    state.placeCount = 0
    state.recentAdventures = []
    state.favoritePlaces = []
    state.trainingLessonCompletions = []
    state.trainingRewardUnlocks = []
    state.joinedChallenges = []
    state.achievements = []
    state.scheduledAdventures = []
    state.activeTrainingSchedule = null
    state.journeyEntries = [{
      id: 'real-walk-photo',
      placeId: 'neighborhood-walk',
      place: 'Neighborhood Walk',
      date: 'A real walk with Bailey + Meiomi',
      magicLine: 'A regular walk that deserved to be remembered.',
      tags: ['Neighborhood walk'],
      photoUrls: [photo],
      recapLabels: [],
      dogTags: ['Bailey', 'Meiomi'],
    }]
    state.activeTab = 'home'
    localStorage.setItem('pawstreak:demo', JSON.stringify(state))
  }, walkPhotoData)
  await page.reload({ waitUntil: 'networkidle' })
  await page.addStyleTag({ content: cleanupCss })

  await clickNav(page, 'Explore')
  await snap(page, '02-explore-real-places')

  await page.getByRole('button', { name: /Add Your Own/i }).click()
  await snap(page, '03-add-your-own')
  await page.getByRole('button', { name: /Back/i }).click()

  await page.locator('.plan-hub-action').filter({ hasText: 'Training' }).click()
  await snap(page, '04-training-adventure')
  await page.getByRole('button', { name: /Fun & Enrichment/i }).click()
  await page.getByRole('button', { name: 'Choose this adventure', exact: true }).click()
  await page.getByRole('button', { name: /Daily/i }).click()
  await snap(page, '05-optional-calendar')
  await page.getByRole('button', { name: /Back/i }).click()
  await page.getByRole('button', { name: /Back/i }).click()

  await clickNav(page, 'Journey')
  await page.locator('.journey-everyday-row').first().click()
  await snap(page, '06-real-walk-memory')
  await page.getByRole('button', { name: 'Share memory' }).click()
  await snap(page, '07-instagram-share')
  await page.getByRole('dialog').getByRole('button', { name: 'Close share preview' }).click()
  await page.getByRole('button', { name: /Back/i }).click()

  await clickNav(page, 'Pack')
  await page.getByRole('button', { name: 'Open settings' }).click()
  await page.locator('.settings-section').filter({ hasText: 'Notifications' }).evaluate((section) => {
    section.scrollIntoView({ block: 'center' })
  })
  await page.waitForTimeout(250)
  await snap(page, '08-reminders')
} finally {
  await context.close()
}

for (const post of posts) {
  const screenshot = path.join(RAW, `${post.id}.png`)
  if (post.layout === 'brand-reveal') {
    await createBrandRevealPage(browser, post, screenshot, 'feed')
    await createBrandRevealPage(browser, post, screenshot, 'story')
  } else {
    await createPostPage(browser, post, screenshot, 'feed')
    await createPostPage(browser, post, screenshot, 'story')
  }
  await writeFile(path.join(COPY, `${post.id}.txt`), `${post.caption}\n`)
}

await browser.close()

const manifest = posts.map((post) => ({
  post: post.id,
  sourceScreen: `01-raw-product-screens/${post.id}.png`,
  feed: `02-feed-4x5/${post.id}.png`,
  story: `03-stories-9x16/${post.id}.png`,
  caption: `04-captions/${post.id}.txt`,
}))
await writeFile(path.join(OUTPUT, 'manifest.json'), JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl: BASE_URL, posts: manifest }, null, 2))
await writeFile(path.join(OUTPUT, 'README.md'), `# PawStreak Instagram Launch Kit\n\nEight electric, product-first concepts in both Instagram Feed 4:5 and Story 9:16 formats. The launch opens with the real PawStreak app mark; the product screen is the dominant visual on each feature post. The walk-memory post uses the real supplied photo at ${WALK_PHOTO}. No audience totals, donation claims, distances, streaks, or impact numbers were invented.\n\nFolders:\n- 01-raw-product-screens: source captures and brand mark for review\n- 02-feed-4x5: 1080 × 1350 PNGs\n- 03-stories-9x16: 1080 × 1920 PNGs\n- 04-captions: ready-to-paste copy\n\nThe visual system is documented in ELECTRIC_PRODUCT_PHILOSOPHY.md. Calendar and notification prompts shown here are optional and require the user to tap before PawStreak takes action.\n`)

console.log(`Created ${posts.length} feed posts, ${posts.length} stories, raw screens, and captions in ${OUTPUT}`)
