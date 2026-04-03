<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/game'
import AboutSection from './AboutSection.vue'
import ExperienceSection from './ExperienceSection.vue'
import EducationSection from './EducationSection.vue'
import SkillsSection from './SkillsSection.vue'

const emit = defineEmits<{ close: [] }>()

const gameStore = useGameStore()

const sectionComponents = {
  about: AboutSection,
  experience: ExperienceSection,
  education: EducationSection,
  skills: SkillsSection,
} as const

const activeComponent = computed(() => {
  const id = gameStore.activeSection
  if (!id) return null
  return sectionComponents[id] ?? null
})

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div class="overlay-backdrop" @click.self="emit('close')">
    <div class="overlay-panel" role="dialog" aria-modal="true">
      <button class="close-btn" @click="emit('close')">[ ESC ]</button>
      <div class="panel-content">
        <component :is="activeComponent" v-if="activeComponent" />
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
  max-width: 680px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 40px rgba(74, 158, 255, 0.3);
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
  z-index: 1;
  padding: 4px 6px;
  transition: color 0.15s;
}

.close-btn:hover {
  color: #ff6b4a;
}

.panel-content {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

/* Scrollbar styling */
.panel-content::-webkit-scrollbar {
  width: 6px;
}
.panel-content::-webkit-scrollbar-track {
  background: #0a0a1a;
}
.panel-content::-webkit-scrollbar-thumb {
  background: #4a9eff;
}
</style>
