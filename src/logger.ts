const LOG_URL = 'https://y2vfnhfkeucwbrvdscuoawzz2a0zkesg.lambda-url.us-east-1.on.aws/'

const urlParams = new URLSearchParams(window.location.search)
const ref = urlParams.get('ref') ?? undefined
const company = urlParams.get('company') ?? undefined

function logEvent(event: string, extra?: Record<string, string>) {
  const body: Record<string, string> = { event }
  if (ref) body.ref = ref
  if (company) body.company = company
  if (extra) Object.assign(body, extra)
  fetch(LOG_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {})
}

export function logPageView() {
  logEvent('page_view')
}

export function logSectionOpen(section: string) {
  logEvent('section_open', { section })
}
