import { defineStore } from 'pinia'
import { ref } from 'vue'

export type SectionId = 'about' | 'experience' | 'education' | 'skills'

export const useGameStore = defineStore('game', () => {
  const activeSection = ref<SectionId | null>(null)
  const overlayVisible = ref(false)

  const speedrunActive = ref(false)
  const speedrunPaused = ref(false)
  const speedrunElapsed = ref(0)
  const speedrunResultVisible = ref(false)

  function openSection(id: SectionId) {
    activeSection.value = id
    overlayVisible.value = true

  }

  function closeSection() {
    overlayVisible.value = false
    activeSection.value = null
  }

  function startRun() {
    speedrunActive.value = true
    speedrunPaused.value = false
    speedrunResultVisible.value = false
  }

  function pauseRun() {
    speedrunPaused.value = true
  }

  function resumeRun() {
    speedrunPaused.value = false
  }

  function cancelRun() {
    speedrunActive.value = false
    speedrunPaused.value = false
    speedrunElapsed.value = 0
  }

  function finishRun(elapsed: number) {
    speedrunActive.value = false
    speedrunPaused.value = false
    speedrunElapsed.value = elapsed
    speedrunResultVisible.value = true
  }

  function closeSpeedrunResult() {
    speedrunResultVisible.value = false
    speedrunElapsed.value = 0
  }

  return {
    activeSection,
    overlayVisible,
    openSection,
    closeSection,
    speedrunActive,
    speedrunPaused,
    speedrunElapsed,
    speedrunResultVisible,
    startRun,
    pauseRun,
    resumeRun,
    cancelRun,
    finishRun,
    closeSpeedrunResult,
  }
})
