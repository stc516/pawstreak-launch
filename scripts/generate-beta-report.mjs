import { createClient } from '@supabase/supabase-js'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const outputDirectory = process.env.BETA_REPORT_OUT_DIR || 'artifacts/beta-report'
const windowDays = Math.max(1, Number.parseInt(process.env.BETA_REPORT_DAYS || '30', 10))
const supabaseUrl = process.env.SUPABASE_URL?.trim()
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!supabaseUrl || !serviceRoleKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. Values are never printed.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const cutoff = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString()

async function selectAll(table, columns, options = {}) {
  let query = supabase.from(table).select(columns).limit(10000)
  if (options.sinceColumn) query = query.gte(options.sinceColumn, cutoff)
  const { data, error } = await query
  if (error) throw new Error(`${table}: ${error.message}`)
  return data ?? []
}

function distinctUsers(rows) {
  return new Set(rows.map((row) => row.user_id).filter(Boolean))
}

function percent(numerator, denominator) {
  if (!denominator) return 0
  return Math.round((numerator / denominator) * 1000) / 10
}

function eventUsers(events, eventName) {
  return distinctUsers(events.filter((event) => event.event_name === eventName))
}

function intersectCount(users, cohort) {
  return [...users].filter((userId) => cohort.has(userId)).length
}

async function main() {
  const [profiles, events, memories, feedback] = await Promise.all([
    selectAll('profiles', 'id,onboarding_complete,created_at'),
    selectAll('user_events', 'user_id,event_name,created_at', { sinceColumn: 'created_at' }),
    selectAll('memories', 'user_id,occurred_at', { sinceColumn: 'occurred_at' }),
    selectAll('product_feedback', 'submitted_at', { sinceColumn: 'submitted_at' }),
  ])

  const recentProfiles = profiles.filter((profile) => profile.created_at >= cutoff)
  const recentOnboarded = recentProfiles.filter((profile) => profile.onboarding_complete)
  const recentOnboardedIds = new Set(recentOnboarded.map((profile) => profile.id))
  const started = eventUsers(events, 'adventure_started')
  const completed = eventUsers(events, 'adventure_completed')
  const memoryCreators = distinctUsers(memories)
  const memoryCounts = new Map()
  for (const memory of memories) {
    if (!memory.user_id) continue
    memoryCounts.set(memory.user_id, (memoryCounts.get(memory.user_id) ?? 0) + 1)
  }
  const repeatUsers = [...memoryCounts.entries()]
    .filter(([userId, count]) => recentOnboardedIds.has(userId) && count >= 2)
    .length
  const cohortStarters = intersectCount(started, recentOnboardedIds)
  const cohortCompleters = intersectCount(completed, recentOnboardedIds)
  const cohortMemoryCreators = intersectCount(memoryCreators, recentOnboardedIds)

  const metrics = {
    generatedAt: new Date().toISOString(),
    windowDays,
    totalProfiles: profiles.length,
    newProfiles: recentProfiles.length,
    onboardedProfiles: recentOnboarded.length,
    onboardingRate: percent(recentOnboarded.length, recentProfiles.length),
    adventureStarters: cohortStarters,
    adventureStartRate: percent(cohortStarters, recentOnboarded.length),
    adventureCompleters: cohortCompleters,
    memoryCreators: cohortMemoryCreators,
    memoryRate: percent(cohortMemoryCreators, recentOnboarded.length),
    repeatMemoryUsers: repeatUsers,
    repeatRate: percent(repeatUsers, recentOnboarded.length),
    feedbackResponses: feedback.length,
    eventCounts: Object.fromEntries(
      [...new Set(events.map((event) => event.event_name))]
        .sort()
        .map((name) => [name, events.filter((event) => event.event_name === name).length]),
    ),
  }

  const gates = [
    { label: 'Onboarding rate ≥ 70%', pass: metrics.onboardingRate >= 70, value: `${metrics.onboardingRate}%` },
    { label: 'Adventure start rate ≥ 50%', pass: metrics.adventureStartRate >= 50, value: `${metrics.adventureStartRate}%` },
    { label: 'Memory save rate ≥ 30%', pass: metrics.memoryRate >= 30, value: `${metrics.memoryRate}%` },
    { label: 'Repeat memory rate ≥ 20%', pass: metrics.repeatRate >= 20, value: `${metrics.repeatRate}%` },
  ]

  const markdown = `# PawStreak beta health\n\nGenerated ${metrics.generatedAt} for the last ${windowDays} days. This report contains aggregate counts only—no email addresses, user IDs, dog names, notes, photos, or raw feedback.\n\n## Core metrics\n\n| Metric | Result |\n| --- | ---: |\n| Total profiles | ${metrics.totalProfiles} |\n| New profiles | ${metrics.newProfiles} |\n| Onboarding completion | ${metrics.onboardingRate}% |\n| Users starting adventures | ${metrics.adventureStarters} |\n| Users completing adventures | ${metrics.adventureCompleters} |\n| Users saving memories | ${metrics.memoryCreators} |\n| Users with 2+ memories in window | ${metrics.repeatMemoryUsers} |\n| Feedback responses | ${metrics.feedbackResponses} |\n\n## Widen-beta gates\n\n${gates.map((gate) => `- ${gate.pass ? 'PASS' : 'NOT YET'} — ${gate.label} (${gate.value})`).join('\n')}\n\nNumbers are decision support, not proof of product value. Read opted-in qualitative feedback before expanding or adding a paywall.\n`

  await mkdir(outputDirectory, { recursive: true })
  await writeFile(path.join(outputDirectory, 'beta-health.json'), `${JSON.stringify({ metrics, gates }, null, 2)}\n`)
  await writeFile(path.join(outputDirectory, 'beta-health.md'), markdown)
  console.log(markdown)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
