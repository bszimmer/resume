<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/game'
import { useInput } from './useInput'
import { useGameLoop } from './useGameLoop'
import {
  platforms,
  ladders,
  zones,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  JUMP_FORCE,
  MOVE_SPEED,
  CLIMB_SPEED,
  PLAYER_START_X,
  PLAYER_START_Y,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  START_ZONE,
  FINISH_ZONE,
  LEADERBOARD_ZONE,
} from './levelData'
import type { SpeedrunZone } from './levelData'
import {
  resolveFloorCollision,
  getLadderAtBody,
  getLadderBelowBody,
  getZoneAtBody,
  applyGravity,
  integratePosition,
  clampToCanvas,
} from './physics'
import type { PhysicsBody } from './physics'
import type { SectionZone, Ladder } from './levelData'
import {
  initScanlines,
  clearCanvas,
  drawBackground,
  drawPlatforms,
  drawLadders,
  drawSectionZones,
  drawCharacter,
  drawScanlines,
  drawHUD,
  drawTitle,
  drawSpeedrunZones,
  drawSpeedrunHUD,
  drawConfetti,
} from './renderer'
import type { ConfettiParticle } from './renderer'
import SectionOverlay from '@/components/resume/SectionOverlay.vue'
import SpeedrunResultModal from './SpeedrunResultModal.vue'
import SpeedrunPauseModal from './SpeedrunPauseModal.vue'
import LeaderboardModal from './LeaderboardModal.vue'
import VirtualControls from './VirtualControls.vue'
import { useLeaderboardStore } from '@/stores/leaderboard'

const canvasEl = ref<HTMLCanvasElement | null>(null)
const gameStore = useGameStore()
const leaderboardStore = useLeaderboardStore()
const { keys, onEnter, onJump } = useInput()

function triggerEnter() { onEnter.value = true }
function triggerJump() { onJump.value = true }

let ctx: CanvasRenderingContext2D | null = null
let frame = 0
let animFrame = 0

// Camera state — plain numbers, updated every tick
let cameraX = 0
let cameraY = 0
let zoom = 1

function computeZoom() {
  // Zoom in on narrow screens so the game isn't tiny; clamp between 1 and 2
  zoom = Math.min(2, Math.max(1, CANVAS_WIDTH / Math.max(window.innerWidth, CANVAS_WIDTH / 2)))
}

function updateCamera() {
  const visibleW = CANVAS_WIDTH / zoom
  const visibleH = CANVAS_HEIGHT / zoom
  // Center on character
  cameraX = body.x + body.width / 2 - visibleW / 2
  cameraY = body.y + body.height / 2 - visibleH / 2
  // Clamp to world bounds
  cameraX = Math.max(0, Math.min(cameraX, CANVAS_WIDTH - visibleW))
  cameraY = Math.max(0, Math.min(cameraY, CANVAS_HEIGHT - visibleH))
}

// Physics body — plain object, never put in reactive/Pinia to avoid Proxy overhead
const body: PhysicsBody = {
  x: PLAYER_START_X,
  y: PLAYER_START_Y,
  vx: 0,
  vy: 0,
  width: PLAYER_WIDTH,
  height: PLAYER_HEIGHT,
  onGround: true,
  onLadder: false,
  facing: 'right',
}

let nearZone: SectionZone | null = null
let nearSpeedrunZone: SpeedrunZone | null = null
// Track the ladder the character is actively climbing so we keep it even when body exits the hitbox
let activeLadder: Ladder | null = null

// Speedrun timer (plain number, not reactive — updated every tick)
let runElapsed = 0

// Confetti particles (plain array, not reactive)
let confettiParticles: ConfettiParticle[] = []

function rectsOverlapBody(
  b: { x: number; y: number; width: number; height: number },
  z: { x: number; y: number; width: number; height: number },
): boolean {
  return b.x < z.x + z.width && b.x + b.width > z.x && b.y < z.y + z.height && b.y + b.height > z.y
}

function spawnConfetti() {
  const colors = ['#44ff88', '#ff6b4a', '#cc88ff', '#ffdd44', '#4a9eff', '#ffffff']
  confettiParticles = []
  for (let i = 0; i < 120; i++) {
    confettiParticles.push({
      x: Math.random() * CANVAS_WIDTH,
      y: -10 - Math.random() * 40,
      vx: (Math.random() - 0.5) * 3,
      vy: 1 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)] ?? '#ffffff',
      w: 6 + Math.random() * 4,
      h: 3 + Math.random() * 3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      life: 3 + Math.random() * 2,
    })
  }
}

function tick(dt: number) {
  if (!ctx) return

  // Skip physics on the first frame (dt=0) — just render the initial state
  if (dt === 0) {
    render()
    return
  }

  // Pause physics when overlay is open, run is paused, or leaderboard is open
  if (gameStore.overlayVisible || gameStore.speedrunPaused || leaderboardStore.visible) {
    render()
    return
  }

  // --- Input ---
  const left = keys.has('ArrowLeft') || keys.has('KeyA')
  const right = keys.has('ArrowRight') || keys.has('KeyD')
  const up = keys.has('ArrowUp') || keys.has('KeyW')
  const down = keys.has('ArrowDown') || keys.has('KeyS')

  // Horizontal movement (blocked while on ladder)
  if (!body.onLadder) {
    if (left) {
      body.vx = -MOVE_SPEED
      body.facing = 'left'
    } else if (right) {
      body.vx = MOVE_SPEED
      body.facing = 'right'
    } else {
      body.vx = 0
    }
  }

  // Ladder logic
  const nearLadder = getLadderAtBody(body, ladders)

  if (body.onLadder && activeLadder) {
    // Already climbing — keep using the stored ladder reference
    if (up) {
      body.vy = -CLIMB_SPEED
    } else if (down) {
      body.vy = CLIMB_SPEED
    } else {
      body.vy = 0 // hover in place when no key held
    }
    body.vx = 0

    // Exit top: feet have reached or passed the upper platform surface
    if (body.y + body.height <= activeLadder.topY) {
      body.y = activeLadder.topY - body.height
      body.vy = 0
      body.onGround = true
      body.onLadder = false
      activeLadder = null
    }
    // Exit bottom: feet have reached the lower platform surface
    else if (body.y + body.height >= activeLadder.bottomY) {
      body.y = activeLadder.bottomY - body.height
      body.vy = 0
      body.onGround = true
      body.onLadder = false
      activeLadder = null
    }
  } else if (!body.onLadder && nearLadder && (up || down)) {
    // Enter a ladder (character is within the ladder zone — going up or down)
    body.onLadder = true
    activeLadder = nearLadder
    body.vy = up ? -CLIMB_SPEED : CLIMB_SPEED
    body.vx = 0
  } else if (!body.onLadder && body.onGround && down) {
    // Descend: character is standing on a platform above a ladder opening
    const ladderBelow = getLadderBelowBody(body, ladders)
    if (ladderBelow) {
      body.onLadder = true
      activeLadder = ladderBelow
      body.onGround = false
      body.vy = CLIMB_SPEED
      body.vx = 0
    }
  }

  // Jump — one-shot on keydown only, not while holding
  if (onJump.value && body.onGround && !body.onLadder) {
    onJump.value = false
    body.vy = JUMP_FORCE
    body.onGround = false
  } else {
    onJump.value = false
  }

  // Gravity (skip on ladder)
  applyGravity(body, dt)

  // Integrate
  integratePosition(body, dt)

  // Floor collision
  body.onGround = false
  resolveFloorCollision(body, platforms, dt)

  // Canvas bounds
  clampToCanvas(body)

  // Zone detection
  nearZone = getZoneAtBody(body, zones)
  nearSpeedrunZone = rectsOverlapBody(body, START_ZONE)
    ? START_ZONE
    : rectsOverlapBody(body, FINISH_ZONE)
      ? FINISH_ZONE
      : rectsOverlapBody(body, LEADERBOARD_ZONE)
        ? LEADERBOARD_ZONE
        : null

  // Section / speedrun activation
  if (onEnter.value) {
    onEnter.value = false
    if (nearZone) {
      gameStore.openSection(nearZone.id)
    } else if (nearSpeedrunZone?.kind === 'start' && !gameStore.speedrunActive) {
      runElapsed = 0
      gameStore.startRun()
    } else if (nearSpeedrunZone?.kind === 'leaderboard' && !gameStore.speedrunActive) {
      leaderboardStore.open()
    }
  }

  // Accumulate speedrun timer (paused while any overlay is open or run is paused)
  if (gameStore.speedrunActive && !gameStore.overlayVisible && !gameStore.speedrunResultVisible && !gameStore.speedrunPaused) {
    runElapsed += dt
  }

  // Finish detection
  if (gameStore.speedrunActive && nearSpeedrunZone?.kind === 'finish') {
    gameStore.finishRun(runElapsed)
    spawnConfetti()
  }

  // Update confetti particles
  if (confettiParticles.length > 0) {
    for (const p of confettiParticles) {
      p.vy += 0.08 * dt * 60
      p.x += p.vx * dt * 60
      p.y += p.vy * dt * 60
      p.rotation += p.rotationSpeed * dt * 60
      p.life -= dt
    }
    confettiParticles = confettiParticles.filter((p) => p.life > 0)
  }

  const isMoving = body.vx !== 0 || body.onLadder
  if (isMoving) animFrame++
  frame++
  updateCamera()
  render()
}

function render() {
  if (!ctx) return

  // Clear the full canvas in screen space
  clearCanvas(ctx)

  // Apply camera transform — all world-space drawing happens here
  ctx.setTransform(zoom, 0, 0, zoom, -cameraX * zoom, -cameraY * zoom)
  drawBackground(ctx)
  drawPlatforms(ctx, platforms)
  drawLadders(ctx, ladders)
  drawSectionZones(ctx, zones, frame)
  drawSpeedrunZones(ctx, frame, gameStore.speedrunActive)
  drawCharacter(ctx, body, animFrame)

  // Reset to screen space for HUD elements (scanlines, title, hints)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  drawScanlines(ctx)
  drawTitle(ctx)
  drawHUD(ctx, nearZone, frame)
  drawSpeedrunHUD(ctx, nearSpeedrunZone, gameStore.speedrunActive, runElapsed, frame)
  if (confettiParticles.length > 0) drawConfetti(ctx, confettiParticles)
}

// CSS scale to fit canvas in viewport while preserving 800×600 aspect ratio
function updateScale() {
  const canvas = canvasEl.value
  if (!canvas) return
  computeZoom()
  const scaleX = window.innerWidth / CANVAS_WIDTH
  const scaleY = window.innerHeight / CANVAS_HEIGHT
  const scale = Math.min(scaleX, scaleY)
  canvas.style.transform = `scale(${scale})`
  canvas.style.transformOrigin = 'top left'
  canvas.style.position = 'absolute'
  canvas.style.top = `${(window.innerHeight - CANVAS_HEIGHT * scale) / 2}px`
  canvas.style.left = `${(window.innerWidth - CANVAS_WIDTH * scale) / 2}px`
}

const gameLoop = useGameLoop(tick)

function onEscape(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  if (gameStore.speedrunActive && !gameStore.speedrunPaused) {
    e.preventDefault()
    gameStore.pauseRun()
  }
}

function onTab(e: KeyboardEvent) {
  if (e.key !== 'Tab') return
  e.preventDefault()
  if (gameStore.overlayVisible || gameStore.speedrunActive || gameStore.speedrunResultVisible) return
  leaderboardStore.visible ? leaderboardStore.close() : leaderboardStore.open()
}

function handleCancelRun() {
  runElapsed = 0
  gameStore.cancelRun()
}

onMounted(() => {
  const canvas = canvasEl.value
  if (!canvas) return
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
  ctx = canvas.getContext('2d')
  if (!ctx) return

  initScanlines()
  updateScale()
  window.addEventListener('resize', updateScale)
  window.addEventListener('keydown', onEscape)
  window.addEventListener('keydown', onTab)
  gameLoop.start()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScale)
  window.removeEventListener('keydown', onEscape)
  window.removeEventListener('keydown', onTab)
  gameLoop.stop()
})
</script>

<template>
  <div class="game-wrapper">
    <canvas ref="canvasEl" />
    <VirtualControls :keys="keys" :trigger-enter="triggerEnter" :trigger-jump="triggerJump" />
    <Transition name="overlay">
      <SectionOverlay v-if="gameStore.overlayVisible" @close="gameStore.closeSection()" />
    </Transition>
    <Transition name="overlay">
      <SpeedrunResultModal
        v-if="gameStore.speedrunResultVisible"
        :elapsed="gameStore.speedrunElapsed"
        @close="gameStore.closeSpeedrunResult()"
        @open-leaderboard="leaderboardStore.open()"
      />
    </Transition>
    <Transition name="overlay">
      <LeaderboardModal
        v-if="leaderboardStore.visible"
        @close="leaderboardStore.close()"
      />
    </Transition>
    <Transition name="overlay">
      <SpeedrunPauseModal
        v-if="gameStore.speedrunPaused"
        @resume="gameStore.resumeRun()"
        @cancel="handleCancelRun()"
      />
    </Transition>
  </div>
</template>

<style scoped>
.game-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
}

canvas {
  display: block;
  image-rendering: pixelated;
}
</style>

<style>
/* Overlay transition */
.overlay-enter-active,
.overlay-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
