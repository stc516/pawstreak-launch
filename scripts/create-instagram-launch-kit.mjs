import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.SOCIAL_BASE_URL || 'http://127.0.0.1:5175'
const OUTPUT = process.env.SOCIAL_OUTPUT || '/Users/stephencarroll/Downloads/PawStreak Instagram Launch Kit'
const WALK_PHOTO = process.env.PAWSTREAK_WALK_PHOTO || '/Users/stephencarroll/Downloads/IMG_4654.PNG'
const RAW = path.join(OUTPUT, '01-raw-product-screens')
const FEED = path.join(OUTPUT, '02-feed-4x5')
const STORIES = path.join(OUTPUT, '03-stories-9x16')
const COPY = path.join(OUTPUT, '04-captions')

const posts = [
  {
    id: '01-welcome-tour',
    headline: 'Your dog’s next great day starts here.',
    subhead: 'A six-tap tour gets every new pack moving.',
    caption: 'Meet PawStreak: choose a real adventure, go do it, and keep the memory. New packs get a quick six-step tour—with a Skip button, because dogs do not wait.\n\n#PawStreak #DogAdventure #DogParents #DogLife',
  },
  {
    id: '02-explore-real-places',
    headline: 'The same old walk just got competition.',
    subhead: 'Explore real dog-friendly places and pick the day’s energy.',
    caption: 'Beach? Trail? Patio? Park? PawStreak helps you choose the next dog-friendly adventure without turning it into homework.\n\n#PawStreak #DogFriendly #DogAdventure #ExploreWithDogs',
  },
  {
    id: '03-add-your-own',
    headline: 'Your weird little outing counts too.',
    subhead: 'Add any adventure. Calendar alerts are optional—not forced.',
    caption: 'Camping, a brewery patio, a boat day, or the route only your dog understands. Add it, save it, and choose calendar alerts only if you want them.\n\n#PawStreak #DogDays #AdventureDog #DogParents',
  },
  {
    id: '04-training-adventure',
    headline: 'Training should feel like an adventure.',
    subhead: 'Tiny real sessions. Big dog energy.',
    caption: 'Training is part of the adventure. Pick a skill, choose your rhythm, and turn the chaos into a superpower—one short session at a time.\n\n#PawStreak #DogTraining #EnrichmentForDogs #AdventureDog',
  },
  {
    id: '05-optional-calendar',
    headline: 'Make the good intention actually happen.',
    subhead: 'Add dates for alerts—or keep it unscheduled. You choose.',
    caption: 'A training plan can live in PawStreak without touching your calendar. Want the extra nudge? Add real dates and export the sessions with alerts. Nothing happens without your tap.\n\n#PawStreak #DogTrainingTips #DogRoutine #DogParents',
  },
  {
    id: '06-real-walk-memory',
    headline: 'The walk ends. The story stays.',
    subhead: 'A real walk photo, saved as a PawStreak memory.',
    caption: 'This is a real photo from a real walk. PawStreak turns the days you actually lived together into memories you can come back to.\n\n#PawStreak #DogWalk #DogMemories #LifeWithDogs',
  },
  {
    id: '07-instagram-share',
    headline: 'Adventure complete. Story ready.',
    subhead: 'Create a share card from the memory you actually saved.',
    caption: 'Finish the adventure, save the memory, and make it Story-ready. No invented miles. No fake streak. Just the day you and your dog actually had.\n\n#PawStreak #InstagramStories #DogAdventure #DogParents',
  },
  {
    id: '08-reminders',
    headline: 'A nudge. Not a guilt trip.',
    subhead: 'Optional morning and evening adventure reminders.',
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
    *{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;font-family:Inter,ui-rounded,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#083f31;color:#fff;overflow:hidden}
    body{position:relative;background:radial-gradient(circle at 95% 5%,rgba(201,255,0,.56),transparent 25%),radial-gradient(circle at 5% 70%,rgba(0,211,211,.42),transparent 30%),linear-gradient(145deg,#093d30 0%,#075a44 55%,#07372c 100%)}
    .scribble{position:absolute;border:18px solid #f76a2a;border-left-color:transparent;border-radius:50%;width:260px;height:150px;transform:rotate(-22deg);right:-70px;top:34%}
    .spark{position:absolute;font-size:70px;color:#c9ff00}.s1{top:5%;right:7%;transform:rotate(12deg)}.s2{bottom:8%;left:5%;color:#ff8b48}
    .content{position:absolute;inset:${isStory ? '175px 78px 175px' : '64px 62px 55px'};display:flex;flex-direction:column}
    .brand{display:flex;align-items:center;gap:13px;font-size:${isStory ? 28 : 23}px;font-weight:950;letter-spacing:.12em;text-transform:uppercase}.paw{display:grid;place-items:center;width:${isStory ? 58 : 48}px;height:${isStory ? 58 : 48}px;border-radius:17px 17px 17px 6px;background:#c9ff00;color:#063d2f;font-size:${isStory ? 32 : 27}px;transform:rotate(-4deg)}
    .copy{margin-top:${isStory ? 58 : 34}px;max-width:${isStory ? 900 : 720}px;z-index:2}.kicker{color:#c9ff00;font-size:${isStory ? 23 : 18}px;font-weight:950;letter-spacing:.1em;text-transform:uppercase}.copy h1{margin:${isStory ? '18px 0 20px' : '11px 0 12px'};font-size:${isStory ? 76 : 54}px;line-height:.95;letter-spacing:-.055em;max-width:900px}.copy p{margin:0;font-size:${isStory ? 29 : 21}px;line-height:1.32;font-weight:650;max-width:760px;color:#eafff7}
    .phone{position:absolute;z-index:1;overflow:hidden;border:${isStory ? 18 : 14}px solid #111b18;border-radius:${isStory ? 70 : 52}px;background:#fff;box-shadow:0 35px 85px rgba(0,0,0,.42),${isStory ? '14px 16px' : '10px 12px'} 0 #f76a2a;width:${isStory ? 570 : 388}px;height:${isStory ? 1160 : 840}px;left:50%;transform:translateX(-50%) rotate(${isStory ? '-1.5' : '2'}deg);bottom:${isStory ? 175 : '-118'}px}
    .phone img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}.preview{position:absolute;z-index:3;right:${isStory ? 82 : 53}px;bottom:${isStory ? 178 : 35}px;padding:10px 15px;border-radius:999px;background:rgba(4,36,28,.9);font-size:${isStory ? 18 : 14}px;font-weight:850;letter-spacing:.04em}.url{position:absolute;left:${isStory ? 80 : 62}px;bottom:${isStory ? 184 : 38}px;font-size:${isStory ? 23 : 18}px;font-weight:900}
  </style></head><body>
    <div class="scribble"></div><div class="spark s1">✦</div><div class="spark s2">⚡</div>
    <main class="content"><div class="brand"><span class="paw">🐾</span>PawStreak</div><section class="copy"><div class="kicker">Dog days, upgraded</div><h1>${post.headline}</h1><p>${post.subhead}</p></section></main>
    <div class="phone"><img src="${screenshotUrl}" alt="PawStreak product screen"></div>
    <div class="url">pawstreakapp.com</div><div class="preview">REAL PRODUCT SCREEN</div>
  </body></html>`)
  await page.screenshot({
    path: path.join(isStory ? STORIES : FEED, `${post.id}.png`),
    animations: 'disabled',
  })
  await page.close()
}

await Promise.all([RAW, FEED, STORIES, COPY].map((directory) => mkdir(directory, { recursive: true })))
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

  await page.goto(`${BASE_URL}/demo/app?tour=1`, { waitUntil: 'networkidle' })
  await page.locator('[data-testid="product-tour"]').waitFor({ state: 'visible' })
  await snap(page, '01-welcome-tour')
  await page.getByRole('button', { name: 'Skip', exact: true }).click()

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
  await createPostPage(browser, post, screenshot, 'feed')
  await createPostPage(browser, post, screenshot, 'story')
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
await writeFile(path.join(OUTPUT, 'README.md'), `# PawStreak Instagram Launch Kit\n\nEight ready-to-post concepts in both Instagram Feed 4:5 and Story 9:16 formats. Every design uses a captured PawStreak product screen. The walk-memory post uses the real supplied photo at ${WALK_PHOTO}. No audience totals, donation claims, distances, streaks, or impact numbers were invented.\n\nFolders:\n- 01-raw-product-screens: source captures for review\n- 02-feed-4x5: 1080 × 1350 PNGs\n- 03-stories-9x16: 1080 × 1920 PNGs\n- 04-captions: ready-to-paste copy\n\nCalendar and notification prompts shown here are optional and require the user to tap before PawStreak takes action.\n`)

console.log(`Created ${posts.length} feed posts, ${posts.length} stories, raw screens, and captions in ${OUTPUT}`)
