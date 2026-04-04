import { defineStore } from 'pinia'
import { ref } from 'vue'

const LEADERBOARD_URL = 'https://lta42uukgjauydrno2tinyx3ji0adhim.lambda-url.us-east-1.on.aws/'
const TURNSTILE_SITE_KEY = '0x4AAAAAAC0YtiTEOmDDNacA'

let _turnstileWidgetId: string | null = null

function getTurnstileToken(): Promise<string> {
  const container = document.getElementById('turnstile-container')
  if (!container) return Promise.reject(new Error('Turnstile container not found'))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ts = (window as any).turnstile
  if (!ts) return Promise.reject(new Error('Turnstile not loaded'))
  if (_turnstileWidgetId !== null) {
    ts.remove(_turnstileWidgetId)
    _turnstileWidgetId = null
  }
  return new Promise((resolve, reject) => {
    _turnstileWidgetId = ts.render(container, {
      sitekey: TURNSTILE_SITE_KEY,
      size: 'invisible',
      callback: (token: string) => resolve(token),
      'error-callback': () => reject(new Error('Turnstile challenge failed')),
    })
  })
}

export interface LeaderboardEntry {
  time: number
  name: string
  company: string
  timestamp: string
  playerId?: string
}

export const useLeaderboardStore = defineStore('leaderboard', () => {
  const personalBest = ref<number | null>(
    localStorage.getItem('speedrun_pb') ? Number(localStorage.getItem('speedrun_pb')) : null,
  )
  const playerName = ref(localStorage.getItem('speedrun_name') ?? '')
  const playerCompany = ref(localStorage.getItem('speedrun_company') ?? '')

  let playerId = localStorage.getItem('speedrun_player_id') ?? ''

  if (!playerId) {
    playerId = crypto.randomUUID()
    localStorage.setItem('speedrun_player_id', playerId)

    // Try to recover an existing leaderboard ID for this player based on name+company
    if (playerName.value.trim().length >= 3) {
      fetch(LEADERBOARD_URL)
        .then((r) => r.json())
        .then((entries: LeaderboardEntry[]) => {
          const name = playerName.value.toLowerCase().trim()
          const company = playerCompany.value.toLowerCase().trim()
          const match = entries.find((e) => {
            const nameMatch = e.name.toLowerCase().trim() === name
            const companyMatch = !company || e.company.toLowerCase().trim() === company
            return nameMatch && companyMatch
          })
          if (match?.playerId) {
            playerId = match.playerId
            localStorage.setItem('speedrun_player_id', match.playerId)
          }
        })
        .catch(() => {/* silent fail — new UUID will be used */})
    }
  }

  const visible = ref(false)
  const entries = ref<LeaderboardEntry[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Returns true if this is a new personal best (and saves it)
  function checkAndUpdatePB(time: number): boolean {
    if (personalBest.value === null || time < personalBest.value) {
      personalBest.value = time
      localStorage.setItem('speedrun_pb', String(time))
      return true
    }
    return false
  }

  function savePlayerInfo(name: string, company: string) {
    playerName.value = name.trim()
    playerCompany.value = company.trim()
    localStorage.setItem('speedrun_name', name.trim())
    localStorage.setItem('speedrun_company', company.trim())
  }

  async function fetchEntries() {
    if (!LEADERBOARD_URL) return
    loading.value = true
    error.value = null
    try {
      const res = await fetch(LEADERBOARD_URL)
      entries.value = (await res.json()) as LeaderboardEntry[]
    } catch {
      error.value = 'Failed to load leaderboard'
    } finally {
      loading.value = false
    }
  }

  async function submitTime(time: number, name: string, company: string): Promise<boolean> {
    if (!LEADERBOARD_URL) return false
    try {
      const turnstileToken = await getTurnstileToken()
      const res = await fetch(LEADERBOARD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time, name, company, playerId, turnstileToken }),
      })
      return res.ok
    } catch {
      return false
    }
  }

  fetchEntries()

  function open() {
    visible.value = true
  }

  function close() {
    visible.value = false
  }

  return {
    personalBest,
    playerName,
    playerCompany,
    visible,
    entries,
    loading,
    error,
    checkAndUpdatePB,
    savePlayerInfo,
    fetchEntries,
    submitTime,
    open,
    close,
  }
})
