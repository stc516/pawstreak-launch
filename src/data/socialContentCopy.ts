export type SocialAccount = 'PawStreakApp' | 'BaileyHuskyCream'

export type ContentTag = 'launch-week' | 'ugc' | 'community-repost' | 'creator-collab'

export interface AccountCopy {
  caption: string
  hook: string
  storyText: string
}

export interface ContentSlugMeta {
  slug: string
  title: string
  screen: string
  recommendedAccount: SocialAccount | 'Both'
  recommendedPlatform: string
  platforms: ('Instagram' | 'TikTok' | 'Story' | 'Reel')[]
  PawStreakApp: AccountCopy
  BaileyHuskyCream: AccountCopy
  tags?: ContentTag[]
}

/** Placeholder buckets for future catalog expansion (no assets yet). */
export const FUTURE_CONTENT_CHANNELS: {
  tag: ContentTag
  label: string
  description: string
}[] = [
  {
    tag: 'ugc',
    label: 'User-generated content',
    description: 'Customer stories, tagged posts, and community submissions.',
  },
  {
    tag: 'community-repost',
    label: 'Community reposts',
    description: 'Pack highlights, reshares, and earned social proof.',
  },
  {
    tag: 'creator-collab',
    label: 'Creator collabs',
    description: 'Influencer partnerships, co-branded reels, and collab kits.',
  },
]

export const SOCIAL_CONTENT_BY_SLUG: Record<string, ContentSlugMeta> = {
  '01-today-home': {
    slug: '01-today-home',
    title: 'Today / Home',
    screen: 'Home — today’s adventure, pack energy, San Diego intro.',
    recommendedAccount: 'BaileyHuskyCream',
    recommendedPlatform: 'Story',
    platforms: ['Instagram', 'Story', 'Reel'],
    PawStreakApp: {
      caption:
        "Today's adventure is waiting. PawStreak turns walks, beach days, and road trips into a map you'll actually want to open again. Your dog's best days shouldn't disappear in your camera roll.",
      hook: 'Stop losing the good days in your camera roll.',
      storyText: "Pick today's adventure →",
    },
    BaileyHuskyCream: {
      caption:
        "Another San Diego morning, another chance to make a memory with Bailey + Omi. We're not just taking photos — we're building their story.",
      hook: "Bailey doesn't know what 'camera roll' means. But he knows a good day.",
      storyText: 'Best day energy 🐾',
    },
  },
  '02-plan-adventure': {
    slug: '02-plan-adventure',
    title: 'Plan / Adventure',
    screen: 'Plan — categories, spots, adventure picker.',
    recommendedAccount: 'PawStreakApp',
    recommendedPlatform: 'Instagram',
    platforms: ['Instagram', 'Story'],
    PawStreakApp: {
      caption:
        "Beach? Trail? Coffee patio? Plan the outing — then save it as a memory when you're home. Less scrolling, more living.",
      hook: 'What if planning a dog day felt this easy?',
      storyText: 'Plan something good today',
    },
    BaileyHuskyCream: {
      caption:
        'When you live with a husky and a senior lab mix, every plan is a negotiation. PawStreak at least makes picking the spot fun.',
      hook: 'Two dogs. One plan. Zero regrets.',
      storyText: 'Where should we go? 🏖️',
    },
  },
  '03-journey-memory': {
    slug: '03-journey-memory',
    title: 'Journey memory',
    screen: 'Journey memory detail — place, photos, emotional line.',
    recommendedAccount: 'BaileyHuskyCream',
    recommendedPlatform: 'Reel',
    platforms: ['Instagram', 'Reel', 'Story', 'TikTok'],
    PawStreakApp: {
      caption:
        'Every outing becomes a memory — not a buried photo lost in your camera roll. This is what PawStreak is for.',
      hook: "This isn't a screenshot. It's a day you gave them.",
      storyText: 'Save the day, not just the photo',
    },
    BaileyHuskyCream: {
      caption:
        "Dog Beach, OB. Bailey sprinted through the shallows and Omi pretended to be dignified. I'll remember this longer than my camera roll will.",
      hook: 'The shallows. The sprint. The good day.',
      storyText: 'Remember this one 🏖️',
    },
  },
  '04-map-path': {
    slug: '04-map-path',
    title: 'Map / Path',
    screen: 'Journey map — pins, stats, memory preview.',
    recommendedAccount: 'PawStreakApp',
    recommendedPlatform: 'Reel',
    platforms: ['Instagram', 'Reel', 'TikTok', 'Story'],
    PawStreakApp: {
      caption:
        'Every pin is a day you gave them. 47 adventures. 22 places. One map that actually means something.',
      hook: "Your dog's life map — one outing at a time.",
      storyText: 'Every pin = a good day',
    },
    BaileyHuskyCream: {
      caption:
        'Torrey Pines on the map. Dog Beach on the map. That random perfect coffee patio on the map. Their story is starting to look like a life.',
      hook: "We're building a map of the days that matter.",
      storyText: 'Our map is filling in 🗺️',
    },
  },
  '05-profile': {
    slug: '05-profile',
    title: 'Profile / Pack',
    screen: 'Profile — Bailey + Omi, streak, adventures, pack.',
    recommendedAccount: 'BaileyHuskyCream',
    recommendedPlatform: 'Story',
    platforms: ['Instagram', 'Story'],
    PawStreakApp: {
      caption:
        'Two dogs. One streak. A whole life of adventures waiting to be saved. Start with yours.',
      hook: 'Meet the pack behind the memories.',
      storyText: 'Your pack, your story',
    },
    BaileyHuskyCream: {
      caption:
        'Bailey + Omi — husky chaos and senior sweetness. 14-day streak and counting. These two are the whole point.',
      hook: 'The husky and the lab mix who rewired my camera roll.',
      storyText: 'Bailey + Omi 🐾',
    },
  },
  '06-early-access': {
    slug: '06-early-access',
    title: 'Early access / Welcome',
    screen: 'Onboarding welcome — “Your dog gives you everything.”',
    recommendedAccount: 'PawStreakApp',
    recommendedPlatform: 'Story',
    platforms: ['Instagram', 'Story', 'TikTok'],
    PawStreakApp: {
      caption:
        "Adventures, memories, and the life your dog deserves — all in one place. Early access is open. Your dog's best days shouldn't disappear in your camera roll.",
      hook: 'Give them their best day.',
      storyText: 'Get started — link in bio',
    },
    BaileyHuskyCream: {
      caption:
        "If you're a dog parent who takes 400 photos and remembers 4 days — this is for you. We're trying PawStreak so the good ones stick.",
      hook: '400 photos. 4 days remembered. Fix that.',
      storyText: "We're in — join us?",
    },
  },
  'pawstreak-demo-flow': {
    slug: 'pawstreak-demo-flow',
    title: 'Demo flow video',
    screen: 'Home → Plan → Journey → Map pin → Onboarding welcome.',
    recommendedAccount: 'Both',
    recommendedPlatform: 'Reel',
    platforms: ['Instagram', 'Reel', 'TikTok', 'Story'],
    PawStreakApp: {
      caption:
        'A quick walk through PawStreak — plan an adventure, save a memory, watch your map grow. Built for dog parents who care about the days, not just the photos.',
      hook: "POV: your dog's best days finally have a home.",
      storyText: 'Full demo — tap through',
    },
    BaileyHuskyCream: {
      caption:
        "This is what we're using to remember Bailey + Omi's days — not bury them in the camera roll. Quick tour if you're curious.",
      hook: 'How we stopped losing the good dog days.',
      storyText: 'Watch the tour 🎬',
    },
  },
}

export function getContentTags(slug: string): ContentTag[] {
  if (slug in SOCIAL_CONTENT_BY_SLUG) return ['launch-week']
  return []
}
