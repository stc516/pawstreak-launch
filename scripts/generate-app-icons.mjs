/**
 * Rasterize public/icons/source/*.svg into PWA + iOS icon PNGs.
 * Run: node scripts/generate-app-icons.mjs
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = path.join(root, 'public/icons/source')
const outDir = path.join(root, 'public/icons')
const publicDir = path.join(root, 'public')

const outputs = [
  { svg: 'app-icon.svg', out: path.join(outDir, 'icon-192.png'), size: 192 },
  { svg: 'app-icon.svg', out: path.join(outDir, 'icon-512.png'), size: 512 },
  { svg: 'app-icon.svg', out: path.join(publicDir, 'apple-touch-icon.png'), size: 180 },
  { svg: 'app-icon-maskable.svg', out: path.join(outDir, 'icon-maskable-512.png'), size: 512 },
  { svg: 'app-icon.svg', out: path.join(outDir, 'icon-32.png'), size: 32 },
]

function renderWithSips(svgPath, pngPath, size) {
  const tmpPng = `${pngPath}.tmp.png`
  try {
    execFileSync('qlmanage', ['-t', '-s', String(size), '-o', path.dirname(tmpPng), svgPath], {
      stdio: 'ignore',
    })
  } catch {
    execFileSync(
      'rsvg-convert',
      ['-w', String(size), '-h', String(size), '-o', tmpPng, svgPath],
      { stdio: 'inherit' },
    )
  }

  const generated = path.join(
    path.dirname(tmpPng),
    `${path.basename(svgPath)}.png`,
  )
  const src = fs.existsSync(generated) ? generated : tmpPng
  if (!fs.existsSync(src)) {
    throw new Error(`Could not rasterize ${svgPath}. Install librsvg (rsvg-convert) or use macOS qlmanage.`)
  }
  fs.renameSync(src, pngPath)
  if (fs.existsSync(tmpPng)) fs.unlinkSync(tmpPng)
}

async function renderWithSharp(svgPath, pngPath, size) {
  const sharp = (await import('sharp')).default
  await sharp(svgPath).resize(size, size).png().toFile(pngPath)
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true })
  let render = renderWithSharp
  try {
    await import('sharp')
  } catch {
    render = null
  }

  for (const { svg, out, size } of outputs) {
    const svgPath = path.join(sourceDir, svg)
    if (!fs.existsSync(svgPath)) {
      console.error('Missing', svgPath)
      process.exit(1)
    }
    if (render) {
      await renderWithSharp(svgPath, out, size)
    } else {
      renderWithSips(svgPath, out, size)
    }
    console.log('Wrote', path.relative(root, out), `${size}x${size}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
