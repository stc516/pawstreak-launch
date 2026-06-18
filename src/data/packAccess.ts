export interface PackAccessMember {
  id: string
  name: string
  role: string
  accessLevel: string
  accessDescription: string
  lastActivity: string
  isOwner?: boolean
}

export const DEFAULT_PACK_ACCESS_MEMBERS: PackAccessMember[] = [
  {
    id: 'owner',
    name: 'You',
    role: 'Owner',
    accessLevel: 'Full access',
    accessDescription: 'Manage adventures, memories, and pack settings',
    lastActivity: 'Active now',
    isOwner: true,
  },
  {
    id: 'dog-mom',
    name: 'Dog Mom',
    role: 'Family',
    accessLevel: 'Family access',
    accessDescription: 'Can view memories, react, and suggest adventures',
    lastActivity: 'Viewed a memory yesterday',
  },
  {
    id: 'walker',
    name: 'Walker',
    role: 'Adventure helper',
    accessLevel: 'Helper access',
    accessDescription: 'Can suggest adventures and add photos',
    lastActivity: 'Suggested a trail last week',
  },
]

export const PACK_INVITE_ROLES = [
  'Dog Mom / Dog Dad',
  'Family',
  'Walker / Sitter',
  'Trainer',
  'Friend',
] as const

export const PACK_INVITE_ACCESS_LEVELS = [
  'View memories',
  'Suggest adventures',
  'Add photos',
  'Start adventures',
] as const

export type PackInviteRole = (typeof PACK_INVITE_ROLES)[number]
export type PackInviteAccessLevel = (typeof PACK_INVITE_ACCESS_LEVELS)[number]

export function accessDescriptionFor(levels: PackInviteAccessLevel[]): string {
  const parts: string[] = []
  if (levels.includes('View memories')) parts.push('view memories')
  if (levels.includes('Suggest adventures')) parts.push('suggest adventures')
  if (levels.includes('Add photos')) parts.push('add photos')
  if (levels.includes('Start adventures')) parts.push('start adventures')

  if (parts.length === 0) return 'Can stay connected to the pack'
  if (parts.length === 1) return `Can ${parts[0]}`
  if (parts.length === 2) return `Can ${parts[0]} and ${parts[1]}`
  return `Can ${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`
}

export function roleLabelForInvite(role: PackInviteRole): string {
  if (role === 'Dog Mom / Dog Dad') return 'Family'
  if (role === 'Walker / Sitter') return 'Adventure helper'
  return role
}
