import type { Challenge } from '../data/challenges'
import type { MonthlyPlanResult } from './monthlyPlan'
import type { ResolvedChallengeNode } from './challengeEngine'
import type { ScheduledAdventure } from './customAdventure'
import type { ActiveTrainingSchedule } from './trainingSchedule'

interface CalendarEventDraft {
  title: string
  description: string
  location?: string
  start: Date
  durationMinutes?: number
}

const DAY_INDEX: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function formatIcsDate(date: Date): string {
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    'T',
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
    'Z',
  ].join('')
}

function getHourForLabel(label: string): number {
  const lower = label.toLowerCase()
  if (lower.includes('lunch')) return 12
  if (lower.includes('after work')) return 17
  if (lower.includes('sunset')) return 18
  if (lower.includes('afternoon')) return 14
  if (lower.includes('coffee')) return 10
  return 9
}

function getMinuteForLabel(label: string): number {
  return label.toLowerCase().includes('after work') ? 30 : 0
}

function getDayForLabel(label: string): number | null {
  const lower = label.toLowerCase()
  for (const [name, index] of Object.entries(DAY_INDEX)) {
    if (lower.includes(name)) return index
  }
  return null
}

function nextDateForTiming(label: string, offsetWeeks: number): Date {
  const now = new Date()
  const targetDay = getDayForLabel(label) ?? ((now.getDay() + 3) % 7)
  const daysUntil = (targetDay - now.getDay() + 7) % 7 || 7
  const date = new Date(now)
  date.setDate(now.getDate() + daysUntil + offsetWeeks * 7)
  date.setHours(getHourForLabel(label), getMinuteForLabel(label), 0, 0)
  return date
}

function buildIcs(events: CalendarEventDraft[], calendarName: string): string {
  const now = formatIcsDate(new Date())
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PawStreak//Adventure Planner//EN',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
  ]

  events.forEach((event, index) => {
    const start = event.start
    const end = new Date(start.getTime() + (event.durationMinutes ?? 60) * 60_000)
    lines.push(
      'BEGIN:VEVENT',
      `UID:pawstreak-${start.getTime()}-${index}@pawstreakapp.com`,
      `DTSTAMP:${now}`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      `SUMMARY:${escapeIcsText(event.title)}`,
      `DESCRIPTION:${escapeIcsText(event.description)}`,
    )
    if (event.location) {
      lines.push(`LOCATION:${escapeIcsText(event.location)}`)
    }
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:PawStreak adventure tomorrow',
      'TRIGGER:-P1D',
      'END:VALARM',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:PawStreak adventure in one hour',
      'TRIGGER:-PT1H',
      'END:VALARM',
      'END:VEVENT',
    )
  })

  lines.push('END:VCALENDAR')
  return `${lines.join('\r\n')}\r\n`
}

export function downloadScheduledAdventureCalendar(
  adventure: ScheduledAdventure,
  packLabel: string,
) {
  if (!adventure.scheduledFor) return false
  const start = new Date(adventure.scheduledFor)
  if (Number.isNaN(start.getTime())) return false
  downloadIcs('pawstreak-planned-adventure.ics', 'PawStreak Adventures', [
    {
      title: `PawStreak: ${adventure.title}`,
      description: [
        `Planned adventure with ${packLabel}.`,
        adventure.notes,
        'Open PawStreak when you are ready to start.',
      ].filter(Boolean).join('\n'),
      location: adventure.locationLabel,
      start,
      durationMinutes: 60,
    },
  ])
  return true
}

export function downloadTrainingScheduleCalendar(
  schedule: ActiveTrainingSchedule,
  programTitle: string,
  packLabel: string,
) {
  const events = schedule.sessions.flatMap((session) => {
    if (!session.scheduledFor) return []
    const start = new Date(session.scheduledFor)
    if (Number.isNaN(start.getTime())) return []
    return [{
      title: `PawStreak training: ${session.lessonTitle}`,
      description: `${programTitle} with ${packLabel}. Open PawStreak for the session steps.`,
      start,
      durationMinutes: 15,
    }]
  })
  if (events.length === 0) return false
  downloadIcs('pawstreak-training-adventure.ics', `PawStreak ${programTitle}`, events)
  return true
}

function downloadIcs(filename: string, calendarName: string, events: CalendarEventDraft[]) {
  const blob = new Blob([buildIcs(events, calendarName)], {
    type: 'text/calendar;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadMonthlyPlanCalendar(result: MonthlyPlanResult) {
  const events = result.weeks.map((week, index) => ({
    title: `PawStreak: ${week.placeName}`,
    description: [
      `${week.category} adventure for your dog.`,
      `Best time: ${week.bestTime}`,
      `Helps with: ${week.tieInLabel}`,
    ].join('\n'),
    location: week.addressLabel ?? week.placeName,
    start: nextDateForTiming(week.timingLabel, index),
    durationMinutes: 60,
  }))
  downloadIcs('pawstreak-adventure-month.ics', 'PawStreak Adventure Month', events)
}

export function downloadChallengeCalendar(
  challenge: Challenge,
  nodes: ResolvedChallengeNode[],
) {
  const currentAndLocked = nodes.filter((node) => node.state !== 'completed')
  const source = currentAndLocked.length > 0 ? currentAndLocked : nodes
  const events = source.slice(0, 6).map((node, index) => ({
    title: `PawStreak: ${node.title}`,
    description: `${challenge.title}\n${node.description}\n${node.planHint}`,
    location: node.name,
    start: nextDateForTiming(index === 0 ? 'Saturday morning' : `Saturday morning ${index}`, index),
    durationMinutes: node.title.toLowerCase().includes('10-minute') ? 10 : 60,
  }))
  downloadIcs('pawstreak-challenge-plan.ics', `PawStreak ${challenge.title}`, events)
}
