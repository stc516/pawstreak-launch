import type { AppState } from '../data/demo'

export interface HomeUpcomingItem {
  id: string
  label: string
  detail: string
  emoji: string
  kind: 'adventure' | 'reminder' | 'plan'
}

// User-created plans should be more prominent than generic prompts.
// Inject the clock for predictable midnight and expired-plan behavior.
export function getHomeUpcomingItems(state: AppState, now: Date = new Date()): HomeUpcomingItem[] {
  const items: HomeUpcomingItem[] = []
  const nowMs = now.getTime()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime()
  const startOfDayAfter = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).getTime()

  const planned = state.scheduledAdventures.map((adventure, index) => {
    const parsedTime = adventure.scheduledFor ? new Date(adventure.scheduledFor).getTime() : NaN
    const scheduledTime = Number.isFinite(parsedTime) ? parsedTime : null
    // Future dates first, undated plans second, elapsed dates last.
    const rank = scheduledTime === null ? 1 : scheduledTime >= nowMs ? 0 : 2
    return { adventure, index, scheduledTime, rank }
  }).sort((left, right) => {
    if (left.rank !== right.rank) return left.rank - right.rank
    if (left.rank === 0) return left.scheduledTime! - right.scheduledTime!
    if (left.rank === 2) return right.scheduledTime! - left.scheduledTime!
    return left.index - right.index
  })

  for (const { adventure, scheduledTime } of planned.slice(0, 3)) {
    const participants = state.dogs
      .filter((dog) => adventure.selectedDogIds.includes(dog.id))
      .map((dog) => dog.name.trim())
      .filter(Boolean)
    const packLabel = participants.length === 1
      ? participants[0]
      : participants.length === 2
        ? participants.join(' + ')
        : participants.length > 2
          ? `${participants.length} dogs`
          : 'Your pack'

    let when = 'Saved for later'
    if (scheduledTime !== null) {
      if (scheduledTime < nowMs) {
        when = 'Ready when you are'
      } else {
        const date = new Date(scheduledTime)
        const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date)
        if (scheduledTime >= startOfToday && scheduledTime < startOfTomorrow) {
          when = `Today, ${time}`
        } else if (scheduledTime >= startOfTomorrow && scheduledTime < startOfDayAfter) {
          when = `Tomorrow, ${time}`
        } else {
          const day = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date)
          when = `${day}, ${time}`
        }
      }
    }

    items.push({
      id: `scheduled-${adventure.id}`,
      label: adventure.title,
      detail: `${when} · ${packLabel}`,
      emoji: '🐾',
      kind: 'adventure',
    })
  }

  if (items.length < 3 && state.monthlyPlanResult && state.selectedMonthlyPlanId === 'monthly') {
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

  if (items.length < 3 && state.randomPlanResult && state.selectedMonthlyPlanId === 'random') {
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
        id: 'next-outing-idea',
        label: 'Choose your next dog day',
        detail: 'Find an outing that fits your pack',
        emoji: '🐾',
        kind: 'reminder',
      },
      {
        id: 'new-place-idea',
        label: 'Try somewhere new',
        detail: 'Explore dog-friendly places and ideas',
        emoji: '📍',
        kind: 'reminder',
      },
    )
  }

  return items.slice(0, 3)
}
