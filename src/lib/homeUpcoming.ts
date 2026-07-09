import type { AppState } from '../data/demo'
export interface HomeUpcomingItem {
  id: string
  label: string
  detail: string
  emoji: string
  kind: 'adventure' | 'reminder' | 'plan'
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
        id: 'new-place-reminder',
        label: 'New place',
        detail: 'Pick one dog-friendly spot you have not tried yet',
        emoji: '📍',
        kind: 'reminder',
      },
    )
  }

  return items.slice(0, 3)
}
