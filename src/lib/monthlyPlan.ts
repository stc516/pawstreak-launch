export const MONTHLY_PLAN_CONFIRMATIONS: Record<string, string> = {
  curated: 'Saved to your PawStreak plan.',
  random: 'Saved for later adventures.',
  preset: 'Saved to your PawStreak plan.',
}

export function getMonthlyPlanConfirmation(planId: string | null): string | null {
  if (!planId) return null
  return MONTHLY_PLAN_CONFIRMATIONS[planId] ?? null
}
