import { CANVAS_WIDTH, CANVAS_HEIGHT, GRAVITY, PLAYER_HEIGHT } from './levelData'
import type { Platform, Ladder, SectionZone } from './levelData'

export interface PhysicsBody {
  x: number
  y: number
  vx: number
  vy: number
  width: number
  height: number
  onGround: boolean
  onLadder: boolean
  facing: 'left' | 'right'
}

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

export function resolveFloorCollision(body: PhysicsBody, platforms: readonly Platform[], dt: number): boolean {
  if (body.vy < 0) return false // moving up, no landing
  if (body.onLadder) return false // on a ladder, don't snap back to platform surface

  let landed = false
  const feetY = body.y + body.height
  const prevFeetY = feetY - body.vy * dt * 60

  for (const platform of platforms) {
    // Horizontal overlap check
    if (body.x + body.width <= platform.x || body.x >= platform.x + platform.width) continue

    // Was above platform top last frame and feet are now at or below platform top
    if (prevFeetY <= platform.y && feetY >= platform.y) {
      body.y = platform.y - body.height
      body.vy = 0
      body.onGround = true
      body.onLadder = false
      landed = true
    }
  }
  return landed
}

// Find a ladder whose top opening is directly under the character's feet (for descending)
export function getLadderBelowBody(body: PhysicsBody, ladders: readonly Ladder[]): Ladder | null {
  const centerX = body.x + body.width / 2
  const feetY = body.y + body.height

  for (const ladder of ladders) {
    if (
      centerX >= ladder.x &&
      centerX <= ladder.x + ladder.width &&
      Math.abs(feetY - ladder.topY) <= 6
    ) {
      return ladder
    }
  }
  return null
}

export function getLadderAtBody(body: PhysicsBody, ladders: readonly Ladder[]): Ladder | null {
  const centerX = body.x + body.width / 2
  const centerY = body.y + body.height / 2

  for (const ladder of ladders) {
    if (
      centerX >= ladder.x &&
      centerX <= ladder.x + ladder.width &&
      centerY >= ladder.topY &&
      centerY <= ladder.bottomY
    ) {
      return ladder
    }
  }
  return null
}

export function getZoneAtBody(body: PhysicsBody, zones: readonly SectionZone[]): SectionZone | null {
  for (const zone of zones) {
    if (rectsOverlap(body, zone)) return zone
  }
  return null
}

export function applyGravity(body: PhysicsBody, dt: number): void {
  if (!body.onLadder) {
    body.vy += GRAVITY * dt * 60
  }
}

export function integratePosition(body: PhysicsBody, dt: number): void {
  body.x += body.vx * dt * 60
  body.y += body.vy * dt * 60
}

export function clampToCanvas(body: PhysicsBody): void {
  if (body.x < 0) body.x = 0
  if (body.x + body.width > CANVAS_WIDTH) body.x = CANVAS_WIDTH - body.width
  // Respawn if fell off bottom
  if (body.y > CANVAS_HEIGHT) {
    body.y = 510 - PLAYER_HEIGHT
    body.vy = 0
    body.vx = 0
  }
}
