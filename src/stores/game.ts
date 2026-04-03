import { defineStore } from 'pinia'
import { ref } from 'vue'
import { logSectionOpen } from '@/logger'

export type SectionId = 'about' | 'experience' | 'education' | 'skills'

export const useGameStore = defineStore('game', () => {
  const activeSection = ref<SectionId | null>(null)
  const overlayVisible = ref(false)

  function openSection(id: SectionId) {
    activeSection.value = id
    overlayVisible.value = true
    logSectionOpen(id)
  }

  function closeSection() {
    overlayVisible.value = false
    activeSection.value = null
  }

  return { activeSection, overlayVisible, openSection, closeSection }
})
