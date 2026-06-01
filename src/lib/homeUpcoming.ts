import type { AppState } from '../data/demo'
import { getFeaturedTrainingProgram } from './trainingEngine'

export interface HomeUpcomingItem {
  id: string
  label: string
  detail: string
  emoji: string
  kind: 'adventure' | 'training' | 'reminder' | 'plan'
}

export function getHomeUpcomingItems(state: AppState): HomeUpcomingItem[] {
  const items: HomeUpcomingItem[] = []

  if (state.monthlyPlanResult && state.selectedMonthlyPlanId === 'monthly') {
    const activeWeek = state.monthlyPlanResult.weeks.find(
      (week) => week.weekIndex === state.monthlyPlanResult!.nextWeekIndex,
    )
    if (activeWeek) {
      items.push({
        id: 'monthly-next',
        label: 'Monthly plan',
        detail: `${activeWeek.label} · ${activeWeek.placeName}`,
        emoji: '🗓️',
        kind: 'plan',
      })
    }
  }

  if (state.randomPlanResult && state.selectedMonthlyPlanId === 'random') {
    items.push({
      id: 'random-plan',
      label: state.randomPlanResult.title,
      detail: state.randomPlanResult.weeklyCadence,
      emoji: '🎲',
      kind: 'plan',
    })
  }

  const training = getFeaturedTrainingProgram(state)
  const nextLesson = training?.progress.lessons.find((lesson) => !lesson.completed)
  if (nextLesson) {
    items.push({
      id: `training-${nextLesson.lessonId}`,
      label: training!.title,
      detail: nextLesson.lesson.title,
      emoji: training!.emoji,
      kind: 'training',
    })
  }

  if (items.length === 0) {
    items.push(
      {
        id: 'weekend-reminder',
        label: 'Weekend adventure',
        detail: 'Plan something worth remembering together',
        emoji: '🌅',
        kind: 'reminder',
      },
      {
        id: 'training-reminder',
        label: 'Training session',
        detail: 'Short practice keeps adventures smooth',
        emoji: '🎓',
        kind: 'training',
      },
    )
  }

  return items.slice(0, 3)
}
