import { CANVAS_WIDTH, CANVAS_HEIGHT, START_ZONE, FINISH_ZONE, LEADERBOARD_ZONE } from './levelData'
import type { Platform, Ladder, SectionZone, SpeedrunZone } from './levelData'
import type { PhysicsBody } from './physics'

export interface ConfettiParticle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  w: number
  h: number
  rotation: number
  rotationSpeed: number
  life: number
}

// Pre-render the scanline overlay to an offscreen canvas (called once at init)
let scanlineCanvas: HTMLCanvasElement | null = null

export function initScanlines(): void {
  const offscreen = document.createElement('canvas')
  offscreen.width = CANVAS_WIDTH
  offscreen.height = CANVAS_HEIGHT
  const ctx = offscreen.getContext('2d')!
  ctx.fillStyle = 'rgba(0,0,0,0.07)'
  for (let y = 0; y < CANVAS_HEIGHT; y += 3) {
    ctx.fillRect(0, y, CANVAS_WIDTH, 1)
  }
  scanlineCanvas = offscreen
}

export function clearCanvas(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#08080f'
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
}

export function drawBackground(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = 'rgba(74, 158, 255, 0.05)'
  ctx.lineWidth = 1
  // Vertical lines every 80px
  for (let x = 0; x < CANVAS_WIDTH; x += 80) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, CANVAS_HEIGHT)
    ctx.stroke()
  }
  // Horizontal lines every 60px
  for (let y = 0; y < CANVAS_HEIGHT; y += 60) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(CANVAS_WIDTH, y)
    ctx.stroke()
  }
}

export function drawPlatforms(ctx: CanvasRenderingContext2D, platforms: readonly Platform[]): void {
  for (const p of platforms) {
    // Shadow bottom
    ctx.fillStyle = '#2a6abf'
    ctx.fillRect(p.x, p.y + p.height - 3, p.width, 3)

    // Main body
    ctx.fillStyle = '#4a9eff'
    ctx.fillRect(p.x, p.y + 2, p.width, p.height - 5)

    // Top highlight
    ctx.fillStyle = '#7dc4ff'
    ctx.fillRect(p.x, p.y, p.width, 2)

    // Rivet pattern
    ctx.fillStyle = '#2a6abf'
    for (let rx = p.x + 20; rx < p.x + p.width - 10; rx += 40) {
      ctx.fillRect(rx, p.y + 4, 4, 4)
    }
  }
}

export function drawLadders(ctx: CanvasRenderingContext2D, ladders: readonly Ladder[]): void {
  for (const ladder of ladders) {
    const railX1 = ladder.x + 4
    const railX2 = ladder.x + ladder.width - 4

    // Left rail
    ctx.fillStyle = '#ffdd44'
    ctx.fillRect(railX1, ladder.topY, 3, ladder.bottomY - ladder.topY)
    // Right rail
    ctx.fillRect(railX2, ladder.topY, 3, ladder.bottomY - ladder.topY)

    // Rungs
    ctx.fillStyle = '#ccaa22'
    for (let ry = ladder.topY + 9; ry < ladder.bottomY - 4; ry += 18) {
      ctx.fillRect(railX1, ry, railX2 - railX1 + 3, 4)
    }
  }
}

export function drawSectionZones(
  ctx: CanvasRenderingContext2D,
  zones: readonly SectionZone[],
  frame: number,
): void {
  for (const zone of zones) {
    const pulse = 0.5 + 0.5 * Math.sin(frame / 20)

    // Glow fill
    ctx.fillStyle =
      zone.color +
      Math.round(40 + 60 * pulse)
        .toString(16)
        .padStart(2, '0')
    ctx.fillRect(zone.x, zone.y, zone.width, zone.height)

    // Border
    ctx.strokeStyle = zone.color
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.6 + 0.4 * pulse
    ctx.strokeRect(zone.x + 1, zone.y + 1, zone.width - 2, zone.height - 2)
    ctx.globalAlpha = 1

    // Label text
    ctx.fillStyle = '#fff'
    ctx.font = '6px "Press Start 2P"'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(zone.label, zone.x + zone.width / 2, zone.y + zone.height / 2)
  }
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
}

export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  body: PhysicsBody,
  frame: number,
): void {
  const { x, y, facing, onLadder } = body
  const walkFrame = Math.floor(frame / 8) % 2
  const climbFrame = Math.floor(frame / 6) % 2

  ctx.save()

  if (facing === 'left') {
    // Flip horizontally around body center
    ctx.translate(x + body.width / 2, 0)
    ctx.scale(-1, 1)
    ctx.translate(-(x + body.width / 2), 0)
  }

  // Head (skin)
  ctx.fillStyle = '#f4c28f'
  ctx.fillRect(x + 5, y, 10, 10)

  // Hat body
  ctx.fillStyle = '#cc2222'
  ctx.fillRect(x + 3, y, 4, 4)
  // Hat brim
  ctx.fillRect(x + 2, y + 4, 16, 3)

  // Shirt body
  ctx.fillStyle = '#cc2222'
  ctx.fillRect(x + 3, y + 10, 14, 10)

  // Overall straps
  ctx.fillStyle = '#3355cc'
  ctx.fillRect(x + 5, y + 10, 4, 10)
  ctx.fillRect(x + 11, y + 10, 4, 10)

  if (onLadder) {
    // Climbing animation: alternate arm positions
    const armOffset = climbFrame === 0 ? -2 : 2
    ctx.fillStyle = '#f4c28f'
    ctx.fillRect(x + 1, y + 10 + armOffset, 3, 5)
    ctx.fillRect(x + 16, y + 10 - armOffset, 3, 5)

    // Legs spread on ladder
    ctx.fillStyle = '#3355cc'
    ctx.fillRect(x + 3, y + 20, 5, 8)
    ctx.fillRect(x + 12, y + 20, 5, 8)
  } else {
    // Walk cycle
    ctx.fillStyle = '#3355cc'
    if (walkFrame === 0) {
      ctx.fillRect(x + 3, y + 20, 6, 8)
      ctx.fillRect(x + 11, y + 20, 6, 8)
    } else {
      ctx.fillRect(x + 3, y + 22, 6, 6)
      ctx.fillRect(x + 11, y + 18, 6, 10)
    }
  }

  // Shoes
  ctx.fillStyle = '#331100'
  ctx.fillRect(x + 3, y + 26, 6, 2)
  ctx.fillRect(x + 11, y + 26, 6, 2)

  ctx.restore()
}

export function drawScanlines(ctx: CanvasRenderingContext2D): void {
  if (!scanlineCanvas) return
  ctx.drawImage(scanlineCanvas, 0, 0)
}

export function drawHUD(
  ctx: CanvasRenderingContext2D,
  nearZone: SectionZone | null,
  frame: number,
): void {
  if (!nearZone) return

  const pulse = 0.5 + 0.5 * Math.sin(frame / 15)
  ctx.globalAlpha = 0.6 + 0.4 * pulse
  ctx.fillStyle = nearZone.color
  ctx.font = '8px "Press Start 2P"'
  ctx.textAlign = 'center'
  ctx.fillText('[ PRESS ENTER ]', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 16)
  ctx.textAlign = 'left'
  ctx.globalAlpha = 1
}

export function drawTitle(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = 'rgba(74, 158, 255, 0.4)'
  ctx.font = '10px "Press Start 2P"'
  ctx.textAlign = 'left'
  ctx.fillText('BRENNAN ZIMMER — RESUME', 12, 30)
  ctx.fillText('USE ARROW KEYS TO MOVE', 12, 48)
  ctx.fillText('TAB TO OPEN LEADERBOARD', 12, 66)
}

// Draw start and finish flags standing on their platforms in world-space
export function drawSpeedrunZones(
  ctx: CanvasRenderingContext2D,
  frame: number,
  speedrunActive: boolean,
): void {
  // Flag poles are centered in their respective zones
  const poleX = START_ZONE.x + START_ZONE.width / 2  // x=400, canvas center

  // ── Start flag (bottom floor, platform surface y=510) ─────────────────────
  const startBaseY = 510
  const startPoleTopY = startBaseY - 46
  const startPulse = 0.5 + 0.5 * Math.sin(frame / 20)
  const startWave = Math.sin(frame / 10) * 1.5

  // Pole
  ctx.fillStyle = '#aaaaaa'
  ctx.fillRect(poleX - 1, startPoleTopY, 3, startBaseY - startPoleTopY)

  // Green triangular pennant with a subtle wave on the tip
  ctx.fillStyle = `rgba(68, 255, 136, ${0.85 + 0.15 * startPulse})`
  ctx.beginPath()
  ctx.moveTo(poleX + 2, startPoleTopY + 2)
  ctx.lineTo(poleX + 22, startPoleTopY + 9 + startWave)
  ctx.lineTo(poleX + 2, startPoleTopY + 17)
  ctx.closePath()
  ctx.fill()

  // Label above the flag
  ctx.globalAlpha = 0.7 + 0.3 * startPulse
  ctx.fillStyle = '#44ff88'
  ctx.font = '5px "Press Start 2P"'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  ctx.fillText('START', poleX - 1, startPoleTopY - 3)
  ctx.globalAlpha = 1

  // ── Finish flag (top floor, platform surface y=100) ────────────────────────
  const finishBaseY = 100
  const finishPoleTopY = finishBaseY - 46
  const finishSpeed = speedrunActive ? 6 : 20
  const finishPulse = 0.5 + 0.5 * Math.sin(frame / finishSpeed)

  // Pole
  ctx.fillStyle = '#aaaaaa'
  ctx.fillRect(poleX - 1, finishPoleTopY, 3, finishBaseY - finishPoleTopY)

  // Checkered flag: 4 cols × 3 rows of 6×6px tiles
  const tW = 6
  const tH = 6
  const fCols = 4
  const fRows = 3
  const flagX = poleX + 2
  const flagY = finishPoleTopY + 2
  ctx.globalAlpha = 0.85 + 0.15 * finishPulse
  for (let row = 0; row < fRows; row++) {
    for (let col = 0; col < fCols; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? '#ffffff' : '#111111'
      ctx.fillRect(flagX + col * tW, flagY + row * tH, tW, tH)
    }
  }
  ctx.globalAlpha = 1

  // Label above the flag
  ctx.globalAlpha = 0.7 + 0.3 * finishPulse
  ctx.fillStyle = '#ffffff'
  ctx.font = '5px "Press Start 2P"'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  ctx.fillText('FINISH', poleX - 1, finishPoleTopY - 3)
  ctx.globalAlpha = 1

  // ── Leaderboard zone (bottom floor, right of START) ──────────────────────
  const lz = LEADERBOARD_ZONE
  const lzCenterX = lz.x + lz.width / 2
  const lzBaseY = 510
  const lzPoleTopY = lzBaseY - 46
  const lzPulse = 0.5 + 0.5 * Math.sin(frame / 18 + 1.5) // slightly offset phase from start flag

  // Pole
  ctx.fillStyle = '#aaaaaa'
  ctx.fillRect(lzCenterX - 1, lzPoleTopY, 3, lzBaseY - lzPoleTopY)

  // Gold/trophy banner — small rectangular flag with trophy icon
  const bannerX = lzCenterX + 2
  const bannerY = lzPoleTopY + 2
  const bannerW = 22
  const bannerH = 16
  ctx.fillStyle = `rgba(255, 200, 40, ${0.75 + 0.25 * lzPulse})`
  ctx.fillRect(bannerX, bannerY, bannerW, bannerH)
  ctx.strokeStyle = `rgba(255, 200, 40, ${0.8 + 0.2 * lzPulse})`
  ctx.lineWidth = 1
  ctx.strokeRect(bannerX, bannerY, bannerW, bannerH)

  // Tiny trophy shape (cup + base) in dark color on the banner
  ctx.fillStyle = '#0a0a1a'
  // Cup body
  ctx.fillRect(bannerX + 7, bannerY + 2, 8, 6)
  // Cup handles (left/right bumps)
  ctx.fillRect(bannerX + 5, bannerY + 3, 2, 3)
  ctx.fillRect(bannerX + 15, bannerY + 3, 2, 3)
  // Stem
  ctx.fillRect(bannerX + 10, bannerY + 8, 2, 3)
  // Base
  ctx.fillRect(bannerX + 7, bannerY + 11, 8, 2)

  // "TOP 10" label above the banner
  ctx.globalAlpha = 0.7 + 0.3 * lzPulse
  ctx.fillStyle = '#ffc828'
  ctx.font = '5px "Press Start 2P"'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  ctx.fillText('TOP 10', lzCenterX - 1, lzPoleTopY - 3)
  ctx.globalAlpha = 1

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
}

function formatRunTime(s: number): string {
  const mins = Math.floor(s / 60)
  const secs = Math.floor(s % 60).toString().padStart(2, '0')
  const cs = Math.floor((s % 1) * 100)
    .toString()
    .padStart(2, '0')
  return `${mins}:${secs}.${cs}`
}

// Draw speedrun-specific HUD elements in screen-space
export function drawSpeedrunHUD(
  ctx: CanvasRenderingContext2D,
  nearSpeedrunZone: SpeedrunZone | null,
  speedrunActive: boolean,
  runElapsed: number,
  frame: number,
): void {
  if (nearSpeedrunZone?.kind === 'start' && !speedrunActive) {
    const pulse = 0.5 + 0.5 * Math.sin(frame / 15)
    ctx.globalAlpha = 0.6 + 0.4 * pulse
    ctx.fillStyle = '#44ff88'
    ctx.font = '8px "Press Start 2P"'
    ctx.textAlign = 'center'
    ctx.fillText('[ PRESS ENTER TO START RUN ]', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 16)
    ctx.textAlign = 'left'
    ctx.globalAlpha = 1
  }

  if (nearSpeedrunZone?.kind === 'leaderboard' && !speedrunActive) {
    const pulse = 0.5 + 0.5 * Math.sin(frame / 15)
    ctx.globalAlpha = 0.6 + 0.4 * pulse
    ctx.fillStyle = '#ffc828'
    ctx.font = '8px "Press Start 2P"'
    ctx.textAlign = 'center'
    ctx.fillText('[ PRESS ENTER TO VIEW LEADERBOARD ]', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 16)
    ctx.textAlign = 'left'
    ctx.globalAlpha = 1
  }

  if (speedrunActive) {
    ctx.fillStyle = '#44ff88'
    ctx.font = '8px "Press Start 2P"'
    ctx.textAlign = 'right'
    ctx.fillText(`RUN: ${formatRunTime(runElapsed)}`, CANVAS_WIDTH - 12, 20)
    ctx.textAlign = 'left'
  }
}

// Draw confetti particles in screen-space
export function drawConfetti(
  ctx: CanvasRenderingContext2D,
  particles: readonly ConfettiParticle[],
): void {
  for (const p of particles) {
    ctx.save()
    ctx.globalAlpha = Math.min(1, p.life)
    ctx.translate(p.x + p.w / 2, p.y + p.h / 2)
    ctx.rotate(p.rotation)
    ctx.fillStyle = p.color
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
    ctx.restore()
  }
}
