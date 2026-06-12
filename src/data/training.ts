import { SAMPLE_IMAGES } from './sampleImages'
import type { ChallengeAccent } from './challenges'

export type TrainingRewardId =
  | 'adventure-dog'
  | 'explorer-dog'
  | 'good-dog-graduate'

export interface TrainingLesson {
  id: string
  programId: string
  order: number
  title: string
  description: string
  emoji: string
  practiceHint: string
}

export interface TrainingProgram {
  id: string
  title: string
  subtitle: string
  description: string
  emoji: string
  accent: ChallengeAccent | 'calm'
  rewardId: TrainingRewardId
  lessons: TrainingLesson[]
}

export interface TrainingReward {
  id: TrainingRewardId
  title: string
  description: string
  emoji: string
  badgeImageUrl: string
}

export interface TrainingLessonCompletion {
  lessonId: string
  completedAt: string
}

export interface TrainingRewardUnlock {
  rewardId: TrainingRewardId
  programId: string
  unlockedAt: string
}

export interface TrainingProgress {
  lessonId: string
  programId: string
  completed: boolean
  completedAt?: string
}

export const TRAINING_REWARDS: TrainingReward[] = [
  {
    id: 'good-dog-graduate',
    title: 'Good Dog Graduate',
    description: 'Foundations mastered — your pup earned their diploma.',
    emoji: '🎓',
    badgeImageUrl: SAMPLE_IMAGES.dogPark,
  },
  {
    id: 'adventure-dog',
    title: 'Adventure Ready',
    description: 'Ready for trails, crosswalks, and photo-worthy outings.',
    emoji: '🥾',
    badgeImageUrl: SAMPLE_IMAGES.trail,
  },
  {
    id: 'explorer-dog',
    title: 'Explorer Dog',
    description: 'Advanced recall and distance skills unlocked.',
    emoji: '🧭',
    badgeImageUrl: SAMPLE_IMAGES.trail,
  },
]

const puppyLessons: TrainingLesson[] = [
  {
    id: 'puppy-sit',
    programId: 'puppy-foundations',
    order: 1,
    title: 'Sit',
    description: 'Build a calm default — sit before meals, doors, and greetings.',
    emoji: '🪑',
    practiceHint: '3 short sessions · treat lure · release with praise',
  },
  {
    id: 'puppy-stay',
    programId: 'puppy-foundations',
    order: 2,
    title: 'Stay',
    description: 'Hold position while you take one step back, then two.',
    emoji: '✋',
    practiceHint: 'Start with 2 seconds · add distance slowly',
  },
  {
    id: 'puppy-come',
    programId: 'puppy-foundations',
    order: 3,
    title: 'Come',
    description: 'A cheerful recall on a long line in a quiet spot.',
    emoji: '📣',
    practiceHint: 'Never punish a slow come · party when they arrive',
  },
  {
    id: 'puppy-down',
    programId: 'puppy-foundations',
    order: 4,
    title: 'Down',
    description: 'Relax on cue — useful for cafés, vet waits, and calm moments.',
    emoji: '⬇️',
    practiceHint: 'Lure to down · mark calm breathing',
  },
  {
    id: 'puppy-leave-it',
    programId: 'puppy-foundations',
    order: 5,
    title: 'Leave It',
    description: 'Look away from distractions and check in with you instead.',
    emoji: '🚫',
    practiceHint: 'Trade up with a better treat · practice on walks',
  },
]

const adventureLessons: TrainingLesson[] = [
  {
    id: 'adventure-loose-leash',
    programId: 'adventure-dog',
    order: 1,
    title: 'Loose leash walking',
    description: 'Walk with slack in the line — anywhere from city blocks to park loops.',
    emoji: '🦮',
    practiceHint: 'Stop when the leash tightens · reward beside you',
  },
  {
    id: 'adventure-crosswalk',
    programId: 'adventure-dog',
    order: 2,
    title: 'Wait at crosswalk',
    description: 'Automatic sit or stand-stay before every curb and crossing.',
    emoji: '🚦',
    practiceHint: 'Practice at quiet corners first · build duration',
  },
  {
    id: 'adventure-photo-sit',
    programId: 'adventure-dog',
    order: 3,
    title: 'Sit for photo',
    description: 'Hold a picture-perfect sit while you snap a memory.',
    emoji: '📸',
    practiceHint: 'Short holds · treat after the shutter',
  },
  {
    id: 'adventure-trail-manners',
    programId: 'adventure-dog',
    order: 4,
    title: 'Trail manners',
    description: 'Yield to others, check-ins at forks, and calm passes on narrow paths.',
    emoji: '🌲',
    practiceHint: 'Recall at trail junctions · reward check-ins',
  },
]

const funEnrichmentLessons: TrainingLesson[] = [
  {
    id: 'fun-sniffari',
    programId: 'fun-enrichment',
    order: 1,
    title: 'Sniffari walk',
    description: 'Let your dog lead with their nose — slow pace, no strict heel.',
    emoji: '👃',
    practiceHint: '5–10 minutes · reward check-ins · no pulling corrections',
  },
  {
    id: 'fun-trick-session',
    programId: 'fun-enrichment',
    order: 2,
    title: 'Trick session',
    description: 'One fun cue — spin, shake, or touch — in a low-pressure session.',
    emoji: '🎉',
    practiceHint: '3 reps · end on a win · keep it playful',
  },
  {
    id: 'fun-puzzle-feeder',
    programId: 'fun-enrichment',
    order: 3,
    title: 'Puzzle feeder',
    description: 'Meals or treats from a puzzle toy for calm mental work at home.',
    emoji: '🧩',
    practiceHint: 'Supervise first use · swap puzzles weekly',
  },
]

const offLeashLessons: TrainingLesson[] = [
  {
    id: 'offleash-recall',
    programId: 'off-leash-expert',
    order: 1,
    title: 'Advanced recall',
    description: 'Come away from mild distractions on a long line before trying open space.',
    emoji: '🎯',
    practiceHint: 'Use a whistle cue · jackpot rewards',
  },
  {
    id: 'offleash-distance-stay',
    programId: 'off-leash-expert',
    order: 2,
    title: 'Distance stay',
    description: 'Hold stay while you move out of sight briefly, then return to release.',
    emoji: '📏',
    practiceHint: 'Increase distance before duration · always return to release',
  },
]

const seniorLessons: TrainingLesson[] = [
  {
    id: 'senior-mobility-walk',
    programId: 'senior-dog',
    order: 1,
    title: 'Mobility walk',
    description: 'Gentle pacing, flat routes, and rest breaks matched to your dog’s comfort.',
    emoji: '🐾',
    practiceHint: 'Shorter loops · soft surfaces · watch for fatigue',
  },
  {
    id: 'senior-enrichment',
    programId: 'senior-dog',
    order: 2,
    title: 'Enrichment activities',
    description: 'Sniffaris, puzzle feeders, and low-impact brain games at home or in the yard.',
    emoji: '🧩',
    practiceHint: '5-minute scent games · rotate toys weekly',
  },
]

export const TRAINING_PROGRAMS: TrainingProgram[] = [
  {
    id: 'puppy-foundations',
    title: 'Puppy Foundations',
    subtitle: '5 core cues · anywhere',
    description: 'Start with the essentials every pup needs — no class signup required.',
    emoji: '🐶',
    accent: 'warm',
    rewardId: 'good-dog-graduate',
    lessons: puppyLessons,
  },
  {
    id: 'adventure-dog',
    title: 'Adventure Readiness',
    subtitle: '4 real-world skills · on the go',
    description: 'Train for outings — sidewalks, trails, and memory-worthy photo stops.',
    emoji: '🥾',
    accent: 'forest',
    rewardId: 'adventure-dog',
    lessons: adventureLessons,
  },
  {
    id: 'off-leash-expert',
    title: 'Recall & Off-Leash',
    subtitle: '2 advanced skills · build trust',
    description: 'For teams ready to practice recall and distance stays with safety first.',
    emoji: '🎯',
    accent: 'coastal',
    rewardId: 'explorer-dog',
    lessons: offLeashLessons,
  },
  {
    id: 'fun-enrichment',
    title: 'Fun & Enrichment',
    subtitle: '3 playful sessions · low pressure',
    description: 'Sniffaris, tricks, and puzzle time — bonding without strict drills.',
    emoji: '🎾',
    accent: 'warm',
    rewardId: 'good-dog-graduate',
    lessons: funEnrichmentLessons,
  },
  {
    id: 'senior-dog',
    title: 'Senior Dog',
    subtitle: '2 gentle modules · comfort first',
    description: 'Mobility-friendly walks and enrichment tuned for older dogs.',
    emoji: '💛',
    accent: 'calm',
    rewardId: 'good-dog-graduate',
    lessons: seniorLessons,
  },
]

export function getTrainingProgramById(programId: string): TrainingProgram | undefined {
  return TRAINING_PROGRAMS.find((program) => program.id === programId)
}

export function getTrainingLessonById(lessonId: string): TrainingLesson | undefined {
  for (const program of TRAINING_PROGRAMS) {
    const lesson = program.lessons.find((item) => item.id === lessonId)
    if (lesson) return lesson
  }
  return undefined
}

export function getTrainingRewardById(rewardId: TrainingRewardId): TrainingReward | undefined {
  return TRAINING_REWARDS.find((reward) => reward.id === rewardId)
}

export function isTrainingProgramId(programId: string): boolean {
  return TRAINING_PROGRAMS.some((program) => program.id === programId)
}
