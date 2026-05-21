export const MONTHLY_PLAN_CONFIRMATIONS: Record<string, string> = {
  curated: 'Curated plan saved — built around what they love most.',
  random: 'Random plan saved — surprise adventures ahead.',
  preset: 'Preset plan saved — ready to sync to calendar.',
}

export function getMonthlyPlanConfirmation(planId: string | null): string | null {
  if (!planId) return null
  return MONTHLY_PLAN_CONFIRMATIONS[planId] ?? null
}
