import { getSupabaseClient, isSupabaseConfigured } from './supabase'

export const DEMO_FEEDBACK_STORAGE_KEY = 'pawstreak:demo-feedback'

export interface DemoFeedbackEntry {
  id: string
  submittedAt: string
  whatIsItFor: string
  wouldUseWithDog: string
  whatConfused: string
  whatLikedMost: string
  premiumValue: string
}

export interface DemoFeedbackDraft {
  whatIsItFor: string
  wouldUseWithDog: string
  whatConfused: string
  whatLikedMost: string
  premiumValue: string
}

export interface DemoFeedbackListItem extends DemoFeedbackEntry {
  userAgent?: string | null
  pagePath?: string | null
  source?: string
  origin: 'supabase' | 'local'
}

interface DemoFeedbackRow {
  id: string
  submitted_at: string
  what_is_it_for: string
  would_use_with_dog: string
  what_confused: string
  what_liked_most: string
  premium_value: string | null
  user_agent: string | null
  page_path: string | null
  source: string
  created_at: string
}

export const EMPTY_DEMO_FEEDBACK_DRAFT: DemoFeedbackDraft = {
  whatIsItFor: '',
  wouldUseWithDog: '',
  whatConfused: '',
  whatLikedMost: '',
  premiumValue: '',
}

export { isSupabaseConfigured }

function parseStoredFeedback(raw: string | null): DemoFeedbackEntry[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (entry): entry is DemoFeedbackEntry =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as DemoFeedbackEntry).id === 'string' &&
        typeof (entry as DemoFeedbackEntry).submittedAt === 'string',
    )
  } catch {
    return []
  }
}

function rowToListItem(row: DemoFeedbackRow): DemoFeedbackListItem {
  return {
    id: row.id,
    submittedAt: row.submitted_at,
    whatIsItFor: row.what_is_it_for,
    wouldUseWithDog: row.would_use_with_dog,
    whatConfused: row.what_confused,
    whatLikedMost: row.what_liked_most,
    premiumValue: row.premium_value ?? '',
    userAgent: row.user_agent,
    pagePath: row.page_path,
    source: row.source,
    origin: 'supabase',
  }
}

function entryToListItem(entry: DemoFeedbackEntry): DemoFeedbackListItem {
  return { ...entry, origin: 'local' }
}

export function loadDemoFeedback(): DemoFeedbackEntry[] {
  return parseStoredFeedback(localStorage.getItem(DEMO_FEEDBACK_STORAGE_KEY))
}

export function loadDemoFeedbackListItems(): DemoFeedbackListItem[] {
  return loadDemoFeedback().map(entryToListItem)
}

export async function fetchDemoFeedbackFromSupabase(): Promise<DemoFeedbackListItem[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('demo_feedback')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (error || !data) return []
  return (data as DemoFeedbackRow[]).map(rowToListItem)
}

export async function loadFeedbackForDashboard(): Promise<{
  items: DemoFeedbackListItem[]
  source: 'supabase' | 'local'
}> {
  if (isSupabaseConfigured()) {
    const items = await fetchDemoFeedbackFromSupabase()
    return { items, source: 'supabase' }
  }
  return { items: loadDemoFeedbackListItems(), source: 'local' }
}

export async function submitDemoFeedbackToSupabase(
  entry: DemoFeedbackEntry,
  meta?: { pagePath?: string },
): Promise<void> {
  const supabase = getSupabaseClient()
  if (!supabase) return

  const { error } = await supabase.from('demo_feedback').insert({
    id: entry.id,
    submitted_at: entry.submittedAt,
    what_is_it_for: entry.whatIsItFor,
    would_use_with_dog: entry.wouldUseWithDog,
    what_confused: entry.whatConfused,
    what_liked_most: entry.whatLikedMost,
    premium_value: entry.premiumValue.trim() ? entry.premiumValue : null,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    page_path: meta?.pagePath ?? (typeof window !== 'undefined' ? window.location.pathname : null),
    source: 'demo',
  })

  if (error) {
    throw error
  }
}

export function saveDemoFeedback(draft: DemoFeedbackDraft): DemoFeedbackEntry {
  const entry: DemoFeedbackEntry = {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    ...draft,
  }

  const entries = [...loadDemoFeedback(), entry]
  localStorage.setItem(DEMO_FEEDBACK_STORAGE_KEY, JSON.stringify(entries))

  void submitDemoFeedbackToSupabase(entry).catch(() => {
    // Supabase failures must not block local save UX.
  })

  return entry
}

export function exportDemoFeedbackJson(
  entries?: DemoFeedbackListItem[] | DemoFeedbackEntry[],
): string {
  return JSON.stringify(entries ?? loadDemoFeedback(), null, 2)
}

export function exportLocalDemoFeedbackJson(): string {
  return exportDemoFeedbackJson(loadDemoFeedback())
}

export function feedbackMatchesQuery(item: DemoFeedbackListItem, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true

  const haystack = [
    item.whatIsItFor,
    item.wouldUseWithDog,
    item.whatConfused,
    item.whatLikedMost,
    item.premiumValue,
    item.pagePath ?? '',
    item.userAgent ?? '',
    item.source ?? '',
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(needle)
}
