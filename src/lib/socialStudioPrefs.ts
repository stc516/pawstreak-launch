const FAVORITES_KEY = 'pawstreak:content-studio:favorites'
const POSTED_KEY = 'pawstreak:content-studio:posted'

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

export function getFavoriteIds(): Set<string> {
  return readSet(FAVORITES_KEY)
}

export function getPostedIds(): Set<string> {
  return readSet(POSTED_KEY)
}

export function toggleFavorite(id: string): Set<string> {
  const next = getFavoriteIds()
  if (next.has(id)) next.delete(id)
  else next.add(id)
  writeSet(FAVORITES_KEY, next)
  return next
}

export function togglePosted(id: string): Set<string> {
  const next = getPostedIds()
  if (next.has(id)) next.delete(id)
  else next.add(id)
  writeSet(POSTED_KEY, next)
  return next
}
