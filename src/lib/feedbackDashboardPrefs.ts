const HIGH_SIGNAL_KEY = 'pawstreak:feedback-dashboard:high-signal'

function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as string[]
    return new Set(parsed)
  } catch {
    return new Set()
  }
}

function writeSet(key: string, values: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...values]))
}

export function getHighSignalIds(): Set<string> {
  return readSet(HIGH_SIGNAL_KEY)
}

export function toggleHighSignal(id: string): Set<string> {
  const next = getHighSignalIds()
  if (next.has(id)) next.delete(id)
  else next.add(id)
  writeSet(HIGH_SIGNAL_KEY, next)
  return next
}
