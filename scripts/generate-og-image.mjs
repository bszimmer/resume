import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const W = 1200
const H = 630

const canvas = createCanvas(W, H)
const ctx = canvas.getContext('2d')

// ── Background ────────────────────────────────────────────────────────────────
ctx.fillStyle = '#08080f'
ctx.fillRect(0, 0, W, H)

// Subtle grid lines (matching the game)
ctx.strokeStyle = 'rgba(74, 158, 255, 0.06)'
ctx.lineWidth = 1
for (let x = 0; x < W; x += 80) {
  ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
}
for (let y = 0; y < H; y += 60) {
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
}

// ── Arcade platform bar at top and bottom ────────────────────────────────────
ctx.fillStyle = '#4a9eff'
ctx.fillRect(0, 0, W, 8)
ctx.fillStyle = '#7dc4ff'
ctx.fillRect(0, 0, W, 2)
ctx.fillStyle = '#4a9eff'
ctx.fillRect(0, H - 8, W, 8)
ctx.fillStyle = '#2a6abf'
ctx.fillRect(0, H - 3, W, 3)

// ── Profile photo (left side) ────────────────────────────────────────────────
const photo = await loadImage(join(root, 'public', 'profile.webp'))

const photoSize = 380
const photoX = 100
const photoY = (H - photoSize) / 2

// Green glow border
ctx.shadowColor = 'rgba(68, 255, 136, 0.5)'
ctx.shadowBlur = 24
ctx.fillStyle = '#44ff88'
ctx.fillRect(photoX - 4, photoY - 4, photoSize + 8, photoSize + 8)
ctx.shadowBlur = 0

// Photo
ctx.drawImage(photo, photoX, photoY, photoSize, photoSize)

// ── Right side text ───────────────────────────────────────────────────────────
const textX = 560

// Name
ctx.fillStyle = '#ffffff'
ctx.font = 'bold 64px system-ui, -apple-system, sans-serif'
ctx.textBaseline = 'top'
ctx.fillText('Brennan', textX, 160)
ctx.fillText('Zimmer', textX, 238)

// Divider line
ctx.fillStyle = '#44ff88'
ctx.fillRect(textX, 330, 480, 3)

// Title tags
const titles = ['Software Engineer', 'Leader', 'Bookworm']
const tagColors = ['#44ff88', '#4a9eff', '#ffdd44']

let tagX = textX
const tagY = 352

ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
for (let i = 0; i < titles.length; i++) {
  const title = titles[i]
  const color = tagColors[i] ?? '#44ff88'
  const measured = ctx.measureText(title)
  const tagW = measured.width + 20
  const tagH = 32

  ctx.fillStyle = color
  ctx.fillRect(tagX, tagY, tagW, tagH)

  ctx.fillStyle = '#000000'
  ctx.fillText(title, tagX + 10, tagY + 7)

  tagX += tagW + 10
}

// Bio line
ctx.fillStyle = '#8892b0'
ctx.font = '20px system-ui, -apple-system, sans-serif'
const bio = 'Software Engineering Manager @ Autodesk'
ctx.fillText(bio, textX, 418)

// URL
ctx.fillStyle = 'rgba(74, 158, 255, 0.7)'
ctx.font = '18px system-ui, -apple-system, sans-serif'
ctx.fillText('brennanzimmer.com', textX, H - 60)

// ── Save ─────────────────────────────────────────────────────────────────────
const buffer = canvas.toBuffer('image/png')
writeFileSync(join(root, 'public', 'og-image.png'), buffer)
console.log('✅  public/og-image.png generated (1200×630)')
