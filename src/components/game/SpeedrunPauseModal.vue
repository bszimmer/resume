<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{ resume: []; cancel: [] }>()

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('resume')
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div class="overlay-backdrop" @click.self="emit('resume')">
    <div class="overlay-panel" role="dialog" aria-modal="true">
      <div class="panel-content">
        <p class="paused-title">PAUSED</p>
        <div class="buttons">
          <button class="btn btn-resume" @click="emit('resume')">[ RESUME RUN ]</button>
          <button class="btn btn-cancel" @click="emit('cancel')">[ CANCEL RUN ]</button>
        </div>
        <p class="hint">ESC to resume</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.overlay-panel {
  background: #0a0a1a;
  border: 2px solid #4a9eff;
  box-shadow: 0 0 40px rgba(74, 158, 255, 0.3);
  padding: 48px 48px 40px;
  text-align: center;
}

.panel-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.paused-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  color: #4a9eff;
  margin: 0;
  text-shadow: 0 0 20px rgba(74, 158, 255, 0.6);
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  background: transparent;
  border: 2px solid currentColor;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.btn-resume {
  color: #44ff88;
  border-color: #44ff88;
}

.btn-resume:hover {
  background: #44ff88;
  color: #0a0a1a;
}

.btn-cancel {
  color: #ff6b4a;
  border-color: #ff6b4a;
}

.btn-cancel:hover {
  background: #ff6b4a;
  color: #0a0a1a;
}

.hint {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  color: #8892b0;
  margin: 0;
}
</style>
