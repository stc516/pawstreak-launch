export type ShareCardKind =
  | 'adventure-complete'
  | 'monthly-recap'
  | 'challenge-progress'
  | 'achievement-unlocked'
  | 'plan-next'
  | 'founder-demo'

export type ShareCardFormat = 'story' | 'feed'

export interface ShareCardMetric {
  label: string
  value: string
}

export interface ShareCardSlot {
  label: string
  status?: 'done' | 'next' | 'open'
}

export interface ShareCardSpot {
  name: string
  meta: string
  category: string
  imageUrl?: string
}

export interface ShareCardData {
  kind: ShareCardKind
  eyebrow: string
  title: string
  subtitle: string
  dogNames: string
  cta: string
  brandLine?: string
  imageUrl?: string
  badgeImageUrl?: string
  badgeEmoji?: string
  category?: string
  location?: string
  duration?: string
  distance?: string
  photoCount?: number
  dateLabel?: string
  progressLabel?: string
  progressPercent?: number
  metrics?: ShareCardMetric[]
  slots?: ShareCardSlot[]
  spots?: ShareCardSpot[]
}
