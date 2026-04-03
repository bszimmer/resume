<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useLeaderboardStore } from '@/stores/leaderboard'

const emit = defineEmits<{ close: [] }>()
const store = useLeaderboardStore()

function formatTime(s: number): string {
  const mins = Math.floor(s / 60)
  const secs = Math.floor(s % 60).toString().padStart(2, '0')
  const cs = Math.floor((s % 1) * 100).toString().padStart(2, '0')
  return `${mins}:${secs}.${cs}`
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div class="overlay-backdrop" @click.self="emit('close')">
    <div class="overlay-panel" role="dialog" aria-modal="true">
      <button class="close-btn" @click="emit('close')">[ ESC ]</button>
      <div class="panel-content">
        <p class="title">LEADERBOARD</p>
        <p class="sub">TOP 10 FASTEST PLAYERS</p>

        <div v-if="store.loading" class="state-msg">LOADING...</div>
        <div v-else-if="store.error" class="state-msg error">{{ store.error }}</div>
        <div v-else-if="store.entries.length === 0" class="state-msg muted">NO TIMES YET — BE THE FIRST!</div>
        <table v-else class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>NAME</th>
              <th>TIME</th>
              <th>COMPANY</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(entry, i) in store.entries"
              :key="entry.timestamp"
              :class="{ 'my-pb': store.personalBest !== null && entry.time === store.personalBest }"
            >
              <td class="rank">{{ i + 1 }}</td>
              <td class="name">{{ entry.name }}</td>
              <td class="time">{{ formatTime(entry.time) }}</td>
              <td class="company">{{ entry.company || '—' }}</td>
            </tr>
          </tbody>
        </table>

        <p class="hint">[ PRESS ESC OR TAB TO CLOSE ]</p>
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
  border: 2px solid #4a9eff;
  width: 100%;
  max-width: 560px;
  box-shadow: 0 0 40px rgba(74, 158, 255, 0.3);
  padding: 48px 32px 36px;
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
  gap: 12px;
}

.title {
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #4a9eff;
  margin: 0;
  text-shadow: 0 0 20px rgba(74, 158, 255, 0.5);
}

.sub {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  color: #8892b0;
  margin: 0 0 8px;
}

.state-msg {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: #4a9eff;
  padding: 24px 0;
}

.state-msg.error {
  color: #ff6b4a;
}

.state-msg.muted {
  color: #8892b0;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
}

.table th {
  color: #8892b0;
  text-align: left;
  padding: 6px 8px;
  border-bottom: 1px solid #1a1a2e;
}

.table td {
  padding: 8px 8px;
  border-bottom: 1px solid #0f0f1e;
  color: #ccd6f6;
}

.table tr.my-pb td {
  color: #ffdd44;
}

.table tr.my-pb td.rank::before {
  content: '★ ';
}

.rank {
  color: #8892b0;
  width: 24px;
}

.time {
  color: #44ff88;
  font-size: 8px;
}

.table tr.my-pb td.time {
  color: #ffdd44;
}

.company {
  color: #8892b0;
}

.hint {
  font-family: 'Press Start 2P', monospace;
  font-size: 6px;
  color: #8892b0;
  margin: 8px 0 0;
}
</style>
