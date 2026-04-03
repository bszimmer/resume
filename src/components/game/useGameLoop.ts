import { onUnmounted } from 'vue'

const MAX_DT = 0.05 // cap delta-time at 50ms (20fps floor) to prevent spiral of death

export function useGameLoop(tick: (dt: number) => void) {
  let rafId = 0
  let lastTime = 0
  let running = false

  function loop(timestamp: number) {
    if (!running) return

    const dt = lastTime === 0 ? 0 : Math.min((timestamp - lastTime) / 1000, MAX_DT)
    lastTime = timestamp

    tick(dt)

    rafId = requestAnimationFrame(loop)
  }

  function start() {
    if (running) return
    running = true
    lastTime = 0
    rafId = requestAnimationFrame(loop)
  }

  function stop() {
    running = false
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
  }

  onUnmounted(stop)

  return { start, stop }
}
