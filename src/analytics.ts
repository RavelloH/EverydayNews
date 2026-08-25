type InsightFlareProperties = Record<string, unknown>

type InsightFlare = {
  track: (eventName: string, properties?: InsightFlareProperties) => void
}

declare global {
  interface Window {
    insightflare?: InsightFlare
  }
}

const INSIGHTFLARE_SCRIPT = 'https://insight.ravelloh.com/script.js?siteId=29c04cdd-fd98-4b30-a034-6e9807cd8057'
const pendingEvents: Array<{ eventName: string; properties: InsightFlareProperties }> = []
let scriptInitialized = false

function flushPendingEvents() {
  const tracker = window.insightflare
  if (!tracker) return

  while (pendingEvents.length > 0) {
    const event = pendingEvents.shift()
    if (event) tracker.track(event.eventName, event.properties)
  }
}

export function initializeInsightFlare() {
  if (import.meta.env.DEV || typeof document === 'undefined' || scriptInitialized) return
  scriptInitialized = true

  const existingScript = document.querySelector<HTMLScriptElement>('script[data-insightflare]')
  if (existingScript) {
    flushPendingEvents()
    return
  }

  const script = document.createElement('script')
  script.defer = true
  script.src = INSIGHTFLARE_SCRIPT
  script.dataset.insightflare = 'true'
  script.addEventListener('load', flushPendingEvents, { once: true })
  document.head.appendChild(script)
}

export function trackInsightFlare(eventName: string, properties: InsightFlareProperties = {}) {
  if (import.meta.env.DEV || typeof window === 'undefined') return

  const tracker = window.insightflare
  if (tracker) {
    tracker.track(eventName, properties)
    return
  }

  pendingEvents.push({ eventName, properties })
}
