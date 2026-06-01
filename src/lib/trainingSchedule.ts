import type { AppState } from '../data/demo'
import {
  TRAINING_PROGRAMS,
  getTrainingProgramById,
  type TrainingLesson,
} from '../data/training'

export type TrainingCadence = 'daily' | 'four-days'

export interface TrainingScheduleSession {
  dayLabel: string
  lessonId: string
  lessonTitle: string
  completed: boolean
  completedAt?: string
}

export interface ActiveTrainingSchedule {
  programId: string
  cadence: TrainingCadence
  startDate: string
  sessions: TrainingScheduleSession[]
  currentLessonId: string
  savedAt: string
}

export interface TrainingProgramDraft {
  programId: string | null
  cadence: TrainingCadence | null
}

export const EMPTY_TRAINING_PROGRAM_DRAFT: TrainingProgramDraft = {
  programId: null,
  cadence: null,
}

export const HOME_TRAINING_PROGRAM_IDS = [
  'puppy-foundations',
  'off-leash-expert',
  'fun-enrichment',
] as const

export const TRAINING_CADENCE_OPTIONS: { id: TrainingCadence; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'four-days', label: '4 days / week' },
]

const FOUR_DAY_LABELS = ['Mon', 'Tue', 'Thu', 'Sat']

function rotateLessons(lessons: TrainingLesson[], count: number): TrainingLesson[] {
  if (lessons.length === 0) return []
  const rotated: TrainingLesson[] = []
  for (let index = 0; index < count; index += 1) {
    rotated.push(lessons[index % lessons.length])
  }
  return rotated
}

export function generateTrainingSchedule(
  programId: string,
  cadence: TrainingCadence,
  state: AppState,
): ActiveTrainingSchedule | null {
  const program = getTrainingProgramById(programId)
  if (!program) return null

  const completionMap = new Map(
    state.trainingLessonCompletions.map((item) => [item.lessonId, item.completedAt]),
  )

  const sessionCount = cadence === 'daily' ? program.lessons.length : 4
  const lessons = rotateLessons(program.lessons, sessionCount)
  const dayLabels =
    cadence === 'daily'
      ? lessons.map((_, index) => `Day ${index + 1}`)
      : FOUR_DAY_LABELS

  const sessions: TrainingScheduleSession[] = lessons.map((lesson, index) => ({
    dayLabel: dayLabels[index] ?? `Day ${index + 1}`,
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    completed: completionMap.has(lesson.id),
    completedAt: completionMap.get(lesson.id),
  }))

  const currentLessonId =
    sessions.find((session) => !session.completed)?.lessonId ?? sessions[0]?.lessonId ?? program.lessons[0].id

  return {
    programId,
    cadence,
    startDate: new Date().toISOString(),
    sessions,
    currentLessonId,
    savedAt: new Date().toISOString(),
  }
}

export function getHomeTrainingPrograms() {
  return TRAINING_PROGRAMS.filter((program) =>
    HOME_TRAINING_PROGRAM_IDS.includes(program.id as (typeof HOME_TRAINING_PROGRAM_IDS)[number]),
  )
}

export function getCurrentTrainingSession(
  schedule: ActiveTrainingSchedule | null,
): TrainingScheduleSession | null {
  if (!schedule) return null
  return (
    schedule.sessions.find((session) => session.lessonId === schedule.currentLessonId) ??
    schedule.sessions.find((session) => !session.completed) ??
    null
  )
}
