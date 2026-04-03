import { ref, onUnmounted } from 'vue'

const ARROW_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'])

export function useInput() {
  const keys = new Set<string>()
  const onEnter = ref(false)
  const onJump = ref(false)

  function onKeyDown(e: KeyboardEvent) {
    // Don't hijack input when user is interacting with overlay form elements
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

    if (ARROW_KEYS.has(e.code)) {
      e.preventDefault()
    }

    keys.add(e.code)

    // One-shot actions only fire on the initial keydown, not on repeat (held key)
    if (e.repeat) return

    if (e.code === 'Enter') {
      e.preventDefault()
      onEnter.value = true
    }

    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault()
      onJump.value = true
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    keys.delete(e.code)
  }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)

  function cleanup() {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
  }

  onUnmounted(cleanup)

  return { keys, onEnter, onJump, cleanup }
}
