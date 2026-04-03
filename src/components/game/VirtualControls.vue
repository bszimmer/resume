<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  keys: Set<string>
  triggerEnter: () => void
  triggerJump: () => void
}>()

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

// Joystick state
const thumbX = ref(0)
const thumbY = ref(0)
let originX = 0
let originY = 0

const BASE_RADIUS = 40
const DEADZONE = 15

function clearDirectional() {
  props.keys.delete('ArrowLeft')
  props.keys.delete('ArrowRight')
  props.keys.delete('ArrowUp')
  props.keys.delete('ArrowDown')
}

function onJoystickStart(e: TouchEvent) {
  e.preventDefault()
  const touch = e.touches[0]
  if (!touch) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  originX = rect.left + rect.width / 2
  originY = rect.top + rect.height / 2
  thumbX.value = 0
  thumbY.value = 0
}

function onJoystickMove(e: TouchEvent) {
  e.preventDefault()
  const touch = e.touches[0]
  if (!touch) return

  const dx = touch.clientX - originX
  const dy = touch.clientY - originY
  const dist = Math.sqrt(dx * dx + dy * dy)

  // Clamp thumb visually to base radius
  if (dist > BASE_RADIUS) {
    thumbX.value = (dx / dist) * BASE_RADIUS
    thumbY.value = (dy / dist) * BASE_RADIUS
  } else {
    thumbX.value = dx
    thumbY.value = dy
  }

  // Update directional keys
  clearDirectional()
  if (dx < -DEADZONE) props.keys.add('ArrowLeft')
  if (dx > DEADZONE) props.keys.add('ArrowRight')
  if (dy < -DEADZONE) props.keys.add('ArrowUp')
  if (dy > DEADZONE) props.keys.add('ArrowDown')
}

function onJoystickEnd(e: TouchEvent) {
  e.preventDefault()
  clearDirectional()
  thumbX.value = 0
  thumbY.value = 0
}

function onJumpPress(e: TouchEvent) {
  e.preventDefault()
  props.triggerJump()
}

function onEnterPress(e: TouchEvent) {
  e.preventDefault()
  props.triggerEnter()
}
</script>

<template>
  <div v-if="isTouchDevice" class="virtual-controls">
    <!-- Joystick -->
    <div
      class="joystick-base"
      @touchstart="onJoystickStart"
      @touchmove="onJoystickMove"
      @touchend="onJoystickEnd"
      @touchcancel="onJoystickEnd"
    >
      <div
        class="joystick-thumb"
        :style="{ transform: `translate(${thumbX}px, ${thumbY}px)` }"
      />
    </div>

    <!-- Action buttons -->
    <div class="action-buttons">
      <button class="action-btn jump-btn" @touchstart="onJumpPress">▲</button>
      <button class="action-btn enter-btn" @touchstart="onEnterPress">●</button>
    </div>
  </div>
</template>

<style scoped>
.virtual-controls {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
}

.joystick-base {
  position: fixed;
  bottom: 80px;
  left: 40px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  touch-action: none;
}

.joystick-thumb {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(74, 158, 255, 0.8);
  border: 2px solid #4a9eff;
  pointer-events: none;
  transition: none;
}

.action-buttons {
  position: fixed;
  bottom: 40px;
  right: 40px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
  pointer-events: auto;
}

.action-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid;
  background: rgba(0, 0, 0, 0.5);
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  cursor: pointer;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.jump-btn {
  border-color: #ffdd44;
  color: #ffdd44;
}

.jump-btn:active {
  background: rgba(255, 221, 68, 0.2);
}

.enter-btn {
  border-color: #44ff88;
  color: #44ff88;
}

.enter-btn:active {
  background: rgba(68, 255, 136, 0.2);
}
</style>
