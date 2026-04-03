<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLeaderboardStore } from '@/stores/leaderboard'

const props = defineProps<{ elapsed: number }>()
const emit = defineEmits<{ close: []; 'open-leaderboard': [] }>()

const store = useLeaderboardStore()

const formattedTime = computed(() => formatTime(props.elapsed))
const isNewPB = ref(false)

const nameInput = ref(store.playerName)
const companyInput = ref(store.playerCompany)
const submitState = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')

const nameError = computed(() => nameInput.value.trim().length > 0 && nameInput.value.trim().length < 3)
const companyError = computed(() => companyInput.value.trim().length > 0 && companyInput.value.trim().length < 3)
const canSubmit = computed(
  () => nameInput.value.trim().length >= 3 && !companyError.value && submitState.value !== 'submitting',
)

function formatTime(s: number): string {
  const mins = Math.floor(s / 60)
  const secs = Math.floor(s % 60).toString().padStart(2, '0')
  const cs = Math.floor((s % 1) * 100).toString().padStart(2, '0')
  return `${mins}:${secs}.${cs}`
}

async function submit() {
  if (!canSubmit.value) return
  submitState.value = 'submitting'
  store.savePlayerInfo(nameInput.value, companyInput.value)
  const ok = await store.submitTime(props.elapsed, nameInput.value, companyInput.value)
  submitState.value = ok ? 'success' : 'error'
}

function openLeaderboard() {
  emit('close')
  emit('open-leaderboard')
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  isNewPB.value = store.checkAndUpdatePB(props.elapsed)
  window.addEventListener('keydown', onKeyDown)
})
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div class="overlay-backdrop" @click.self="emit('close')">
    <div class="overlay-panel" role="dialog" aria-modal="true">
      <button class="close-btn" @click="emit('close')">[ ESC ]</button>
      <div class="panel-content">
        <p class="you-made-it">YOU MADE IT!</p>
        <p class="sub">SPEEDRUN COMPLETE</p>
        <p class="time">{{ formattedTime }}</p>

        <!-- Personal best callout -->
        <p v-if="isNewPB" class="pb-new">★ NEW PERSONAL BEST! ★</p>
        <p v-else-if="store.personalBest !== null" class="pb-existing">
          YOUR BEST: {{ formatTime(store.personalBest) }}
        </p>

        <!-- Submit form -->
        <div v-if="submitState !== 'success'" class="submit-section">
          <div class="field">
            <label>NAME</label>
            <input
              v-model="nameInput"
              type="text"
              placeholder="your name"
              maxlength="32"
              spellcheck="false"
              :class="{ 'input-error': nameError }"
            />
            <span v-if="nameError" class="field-error">min 3 characters</span>
          </div>
          <div class="field">
            <label>COMPANY <span class="optional">(optional)</span></label>
            <input
              v-model="companyInput"
              type="text"
              placeholder="your company"
              maxlength="48"
              spellcheck="false"
              :class="{ 'input-error': companyError }"
            />
            <span v-if="companyError" class="field-error">min 3 characters</span>
          </div>
          <button
            class="submit-btn"
            :disabled="!canSubmit"
            @click="submit"
          >
            {{ submitState === 'submitting' ? 'SUBMITTING...' : '[ SUBMIT TO LEADERBOARD ]' }}
          </button>
          <p v-if="submitState === 'error'" class="submit-error">SUBMIT FAILED — TRY AGAIN</p>
        </div>
        <p v-else class="submit-ok">✓ TIME SUBMITTED</p>

        <button class="leaderboard-btn" @click="openLeaderboard">[ VIEW LEADERBOARD ]</button>

        <p class="hint">[ PRESS ESC TO CLOSE ]</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.overlay-panel {
  position: relative;
  background: #0a0a1a;
  border: 2px solid #44ff88;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 0 40px rgba(68, 255, 136, 0.3);
  padding: 48px 32px 40px;
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 14px;
  background: transparent;
  border: none;
  color: #8892b0;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  cursor: pointer;
  padding: 4px 6px;
  transition: color 0.15s;
}

.close-btn:hover {
  color: #ff6b4a;
}

.panel-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.you-made-it {
  font-family: 'Press Start 2P', monospace;
  font-size: 20px;
  color: #44ff88;
  margin: 0;
  text-shadow: 0 0 20px rgba(68, 255, 136, 0.6);
}

.sub {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: #8892b0;
  margin: 0;
}

.time {
  font-family: 'Press Start 2P', monospace;
  font-size: 36px;
  color: #ffdd44;
  margin: 4px 0;
  text-shadow: 0 0 24px rgba(255, 221, 68, 0.5);
}

.pb-new {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: #ffdd44;
  margin: 0;
  text-shadow: 0 0 12px rgba(255, 221, 68, 0.5);
}

.pb-existing {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  color: #8892b0;
  margin: 0;
}

.submit-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-top: 4px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.field label {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  color: #8892b0;
}

.field .optional {
  color: #4a4a6a;
}

.field input {
  background: #0f0f20;
  border: 1px solid #2a2a4a;
  color: #ccd6f6;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  padding: 8px 10px;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}

.field input:focus {
  border-color: #44ff88;
}

.field input.input-error {
  border-color: #ff6b4a;
}

.field-error {
  font-family: 'Press Start 2P', monospace;
  font-size: 6px;
  color: #ff6b4a;
}

.submit-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  background: transparent;
  border: 2px solid #44ff88;
  color: #44ff88;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  margin-top: 4px;
}

.submit-btn:hover:not(:disabled) {
  background: #44ff88;
  color: #0a0a1a;
}

.submit-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.submit-error {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  color: #ff6b4a;
  margin: 0;
}

.submit-ok {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: #44ff88;
  margin: 4px 0;
}

.leaderboard-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  background: transparent;
  border: 1px solid #4a9eff;
  color: #4a9eff;
  padding: 8px 14px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.leaderboard-btn:hover {
  background: #4a9eff;
  color: #0a0a1a;
}

.hint {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  color: #8892b0;
  margin: 0;
}
</style>
