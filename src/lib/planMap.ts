export const PLAN_MAP_BOUNDS = {
  north: 33.75,
  south: 32.55,
  west: -117.85,
  east: -116.25,
}

export function shortPlaceMapLabel(name: string): string {
  const primary = name.split(',')[0]?.trim() ?? name
  if (primary.length <= 14) return primary
  return `${primary.slice(0, 12).trim()}…`
}
