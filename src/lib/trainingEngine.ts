import type { AppState } from '../data/demo'
import type {
  TrainingLesson,
  TrainingProgram,
  TrainingProgress,
  TrainingReward,
  TrainingRewardId,
} from '../data/training'
import {
  TRAINING_PROGRAMS,
  getTrainingProgramById,
  getTrainingRewardById,
} from '../data/training'

export interface TrainingLessonProgress extends TrainingProgress {
  lesson: TrainingLesson
}

export interface TrainingProgramProgress {
  programId: string
  lessonsCompleted: number
  lessonsTotal: number
  percentComplete: number
  fillWidth: string
  completed: boolean
  completedAt?: string
  rewardUnlocked: boolean
  rewardUnlockedAt?: string
  lessons: TrainingLessonProgress[]
}

export interface UnlockedTrainingReward extends TrainingReward {
  programId: string
  unlockedAt: string
}

export interface ResolvedTrainingProgram extends TrainingProgram {
  progress: TrainingProgramProgress
  reward: TrainingReward
}

function getCompletionMap(state: AppState): Map<string, string> {
  return new Map(
    state.trainingLessonCompletions.map((item) => [item.lessonId, item.completedAt]),
  )
}

export function getLessonProgress(
  lesson: TrainingLesson,
  completions: Map<string, string>,
): TrainingProgress {
  const completedAt = completions.get(lesson.id)
  return {
    lessonId: lesson.id,
    programId: lesson.programId,
    completed: Boolean(completedAt),
    completedAt,
  }
}

export function computeProgramProgress(
  program: TrainingProgram,
  state: AppState,
): TrainingProgramProgress {
  const completions = getCompletionMap(state)
  const lessons: TrainingLessonProgress[] = program.lessons.map((lesson) => ({
    ...getLessonProgress(lesson, completions),
    lesson,
  }))

  const lessonsCompleted = lessons.filter((item) => item.completed).length
  const lessonsTotal = lessons.length
  const percentComplete =
    lessonsTotal === 0 ? 0 : Math.round((lessonsCompleted / lessonsTotal) * 100)
  const completed = lessonsCompleted === lessonsTotal && lessonsTotal > 0

  const completionDates = lessons
    .map((item) => item.completedAt)
    .filter((value): value is string => Boolean(value))
    .sort()

  const completedAt =
    completed && completionDates.length > 0
      ? completionDates[completionDates.length - 1]
      : undefined

  const rewardRecord = state.trainingRewardUnlocks.find(
    (item) => item.programId === program.id,
  )

  return {
    programId: program.id,
    lessonsCompleted,
    lessonsTotal,
    percentComplete,
    fillWidth: `${percentComplete}%`,
    completed,
    completedAt,
    rewardUnlocked: Boolean(rewardRecord),
    rewardUnlockedAt: rewardRecord?.unlockedAt,
    lessons,
  }
}

export function resolveTrainingProgram(
  program: TrainingProgram,
  state: AppState,
): ResolvedTrainingProgram {
  const reward = getTrainingRewardById(program.rewardId)!
  return {
    ...program,
    reward,
    progress: computeProgramProgress(program, state),
  }
}

export function resolveAllTrainingPrograms(state: AppState): ResolvedTrainingProgram[] {
  return TRAINING_PROGRAMS.map((program) => resolveTrainingProgram(program, state))
}

export function resolveUnlockedTrainingRewards(state: AppState): UnlockedTrainingReward[] {
  return state.trainingRewardUnlocks
    .map((unlock) => {
      const reward = getTrainingRewardById(unlock.rewardId)
      if (!reward) return null
      return { ...reward, programId: unlock.programId, unlockedAt: unlock.unlockedAt }
    })
    .filter((item): item is UnlockedTrainingReward => Boolean(item))
}

export function completeTrainingLessonState(
  state: AppState,
  lessonId: string,
): AppState {
  const lesson = TRAINING_PROGRAMS.flatMap((program) => program.lessons).find(
    (item) => item.id === lessonId,
  )
  if (!lesson) return state

  const now = new Date().toISOString()
  const alreadyComplete = state.trainingLessonCompletions.some(
    (item) => item.lessonId === lessonId,
  )

  const trainingLessonCompletions = alreadyComplete
    ? state.trainingLessonCompletions
    : [...state.trainingLessonCompletions, { lessonId, completedAt: now }]

  const program = getTrainingProgramById(lesson.programId)
  if (!program) {
    return { ...state, trainingLessonCompletions }
  }

  const nextState = { ...state, trainingLessonCompletions }
  const programProgress = computeProgramProgress(program, nextState)

  if (!programProgress.completed) {
    return nextState
  }

  const hasReward = nextState.trainingRewardUnlocks.some(
    (item) => item.programId === program.id,
  )

  if (hasReward) {
    return nextState
  }

  return {
    ...nextState,
    trainingRewardUnlocks: [
      ...nextState.trainingRewardUnlocks,
      {
        rewardId: program.rewardId,
        programId: program.id,
        unlockedAt: now,
      },
    ],
    memorySaveToast: `${getTrainingRewardById(program.rewardId)?.title ?? 'Reward'} unlocked!`,
  }
}

export function resetTrainingLessonState(state: AppState, lessonId: string): AppState {
  const lesson = TRAINING_PROGRAMS.flatMap((program) => program.lessons).find(
    (item) => item.id === lessonId,
  )
  if (!lesson) return state

  const trainingLessonCompletions = state.trainingLessonCompletions.filter(
    (item) => item.lessonId !== lessonId,
  )

  const programStillComplete = computeProgramProgress(
    getTrainingProgramById(lesson.programId)!,
    { ...state, trainingLessonCompletions },
  ).completed

  const trainingRewardUnlocks = programStillComplete
    ? state.trainingRewardUnlocks
    : state.trainingRewardUnlocks.filter((item) => item.programId !== lesson.programId)

  return {
    ...state,
    trainingLessonCompletions,
    trainingRewardUnlocks,
  }
}

export function getFeaturedTrainingProgram(
  state: AppState,
): ResolvedTrainingProgram | undefined {
  const programs = resolveAllTrainingPrograms(state)
  const inProgress = programs.find(
    (program) =>
      program.progress.lessonsCompleted > 0 && !program.progress.completed,
  )
  if (inProgress) return inProgress
  return programs.find((program) => !program.progress.completed)
}

export function getTrainingSummary(state: AppState): {
  programsStarted: number
  programsCompleted: number
  rewardsUnlocked: number
} {
  const programs = resolveAllTrainingPrograms(state)
  return {
    programsStarted: programs.filter((program) => program.progress.lessonsCompleted > 0).length,
    programsCompleted: programs.filter((program) => program.progress.completed).length,
    rewardsUnlocked: state.trainingRewardUnlocks.length,
  }
}

export type { TrainingRewardId }
