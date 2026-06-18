export interface PackAccessMember {
  id: string
  name: string
  role: string
  accessLevel: string
  accessDescription: string
  lastActivity: string
  isOwner?: boolean
  inviteStatus?: 'active' | 'pending'
  contactLabel?: string
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

export const PACK_INVITE_ROLES = ['Member', 'Viewer'] as const

export type PackInviteRole = (typeof PACK_INVITE_ROLES)[number]
export type PackMemberRole = 'owner' | 'member' | 'viewer'

export function packRoleValueForInvite(role: PackInviteRole): 'member' | 'viewer' {
  return role === 'Viewer' ? 'viewer' : 'member'
}

export function roleLabelForPackRole(role: PackMemberRole): string {
  if (role === 'owner') return 'Owner'
  if (role === 'viewer') return 'Viewer'
  return 'Member'
}

export function accessLevelForPackRole(role: PackMemberRole): string {
  if (role === 'owner') return 'Full access'
  if (role === 'viewer') return 'Read-only'
  return 'Contributor access'
}

export function accessDescriptionForPackRole(role: PackMemberRole): string {
  if (role === 'owner') return 'Invite people, edit dog profiles, and manage permissions'
  if (role === 'viewer') return 'Can view dogs, adventures, memories, and challenges'
  return 'Can add memories, contribute photos, join adventures, and participate in challenges'
}

export function inviteDescriptionForRole(role: PackInviteRole): string {
  return accessDescriptionForPackRole(packRoleValueForInvite(role))
}
