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

export const EMPTY_DEMO_FEEDBACK_DRAFT: DemoFeedbackDraft = {
  whatIsItFor: '',
  wouldUseWithDog: '',
  whatConfused: '',
  whatLikedMost: '',
  premiumValue: '',
}

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

export function loadDemoFeedback(): DemoFeedbackEntry[] {
  return parseStoredFeedback(localStorage.getItem(DEMO_FEEDBACK_STORAGE_KEY))
}

export function saveDemoFeedback(draft: DemoFeedbackDraft): DemoFeedbackEntry {
  const entry: DemoFeedbackEntry = {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    ...draft,
  }

  const entries = [...loadDemoFeedback(), entry]
  localStorage.setItem(DEMO_FEEDBACK_STORAGE_KEY, JSON.stringify(entries))
  return entry
}

export function exportDemoFeedbackJson(): string {
  return JSON.stringify(loadDemoFeedback(), null, 2)
}
