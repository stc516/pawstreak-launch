import { chromium } from 'playwright'
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT_DIR = path.join(__dirname, 'evidence', 'stitch-parity', 'comparison')

const SCREENS = [
  {
    id: '01-home',
    label: 'Home',
    stitch: 'references/stitch-heritage/stitch_pawstreak_visual_redesign/home/screen.png',
  },
  {
    id: '02-plan',
    label: 'Plan',
    stitch: 'references/stitch-heritage/stitch_pawstreak_visual_redesign/plan_map/screen.png',
  },
  {
    id: '03-journey',
    label: 'Journey',
    stitch: 'references/stitch-heritage/stitch_pawstreak_visual_redesign/journey/screen.png',
  },
  {
    id: '04-challenges',
    label: 'Challenges',
    stitch: 'references/stitch-heritage/stitch_pawstreak_visual_redesign/challenges_tags/screen.png',
  },
  {
    id: '05-profile',
    label: 'Profile',
    stitch: 'references/stitch-heritage/stitch_pawstreak_visual_redesign/profile/screen.png',
  },
  {
    id: '06-settings',
    label: 'Settings',
    stitch: 'references/stitch-heritage/stitch_pawstreak_visual_redesign/settings/screen.png',
  },
]

function toDataUrl(buffer, mime = 'image/png') {
  return `data:${mime};base64,${buffer.toString('base64')}`
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } })

  for (const screen of SCREENS) {
    const stitchPath = path.join(ROOT, screen.stitch)
    const beforePath = path.join(__dirname, 'evidence', 'stitch-parity', 'before', `${screen.id}.png`)
    const afterPath = path.join(__dirname, 'evidence', 'stitch-parity', 'after', `${screen.id}.png`)

    const [stitchBuf, beforeBuf, afterBuf] = await Promise.all([
      readFile(stitchPath),
      readFile(beforePath),
      readFile(afterPath),
    ])

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Hanken Grotesk', system-ui, sans-serif;
      background: #111;
      color: #faf9f5;
      padding: 24px;
    }
    h1 {
      font-size: 20px;
      margin-bottom: 16px;
      font-weight: 700;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      align-items: start;
    }
    figure {
      background: #1b1c1a;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.08);
    }
    figcaption {
      padding: 10px 12px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #fc895f;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    img {
      display: block;
      width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <h1>${screen.label} — Stitch vs Production Before vs Production After</h1>
  <div class="grid">
    <figure>
      <figcaption>Stitch Reference</figcaption>
      <img src="${toDataUrl(stitchBuf)}" alt="Stitch reference" />
    </figure>
    <figure>
      <figcaption>Production Before</figcaption>
      <img src="${toDataUrl(beforeBuf)}" alt="Production before" />
    </figure>
    <figure>
      <figcaption>Production After</figcaption>
      <img src="${toDataUrl(afterBuf)}" alt="Production after" />
    </figure>
  </div>
</body>
</html>`

    await page.setContent(html, { waitUntil: 'load' })
    await page.waitForTimeout(300)
    await page.screenshot({
      path: path.join(OUT_DIR, `${screen.id}-comparison.png`),
      fullPage: true,
    })
    console.log(`Saved ${screen.id}-comparison.png`)
  }

  await browser.close()
  console.log(`Comparisons saved to ${OUT_DIR}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
