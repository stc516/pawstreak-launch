import type { PackAccessMember, PackInviteRole, PackMemberRole } from '../../data/demo'
import {
  accessDescriptionForPackRole,
  accessLevelForPackRole,
  packRoleValueForInvite,
  roleLabelForPackRole,
} from '../../data/packAccess'
import { getSupabaseClient } from '../supabase'

interface PackMemberRow {
  id: string
  pack_id: string
  user_id: string
  role: PackMemberRole
  created_at: string
  profiles?: {
    display_name?: string | null
    email?: string | null
  } | null
}

interface PackInviteResponse {
  invite: {
    id: string
    email: string
    role: 'member' | 'viewer'
    expiresAt: string
  }
}

interface PackInviteAcceptResponse {
  packId: string
  role: PackMemberRole
}

function formatMemberName(row: PackMemberRow, currentUserId: string): string {
  if (row.user_id === currentUserId) return 'You'
  return row.profiles?.display_name || row.profiles?.email || 'Pack member'
}

function memberRowToPackAccessMember(
  row: PackMemberRow,
  currentUserId: string,
): PackAccessMember {
  return {
    id: row.id,
    name: formatMemberName(row, currentUserId),
    role: roleLabelForPackRole(row.role),
    accessLevel: accessLevelForPackRole(row.role),
    accessDescription: accessDescriptionForPackRole(row.role),
    lastActivity: row.role === 'owner' ? 'Active owner' : 'Active member',
    isOwner: row.role === 'owner',
    inviteStatus: 'active',
    contactLabel: row.profiles?.email ?? undefined,
  }
}

export async function fetchPackAccessMembers(
  currentUserId: string,
): Promise<PackAccessMember[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('pack_members')
    .select('id, pack_id, user_id, role, created_at, profiles(display_name, email)')
    .order('created_at', { ascending: true })

  if (error || !data) return []
  return (data as PackMemberRow[]).map((row) =>
    memberRowToPackAccessMember(row, currentUserId),
  )
}

export async function sendPackInvite(input: {
  email: string
  role: PackInviteRole
}): Promise<PackInviteResponse['invite']> {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured')

  const { data, error } = await supabase.functions.invoke<PackInviteResponse>(
    'pack-invites',
    {
      body: {
        email: input.email,
        role: packRoleValueForInvite(input.role),
      },
    },
  )

  if (error) throw new Error(error.message || 'Could not send invite.')
  if (!data?.invite) throw new Error('Invite did not return from the server.')
  return data.invite
}

export async function acceptPackInvite(token: string): Promise<PackInviteAcceptResponse> {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured')

  const { data, error } = await supabase.functions.invoke<PackInviteAcceptResponse>(
    'pack-invite-accept',
    {
      body: { token },
    },
  )

  if (error) throw new Error(error.message || 'Could not accept invite.')
  if (!data?.packId) throw new Error('Invite was not accepted.')
  return data
}

export async function createChallengeRequest(input: {
  cityOrZip: string
  notes?: string
}): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) return false

  const { error } = await supabase.from('challenge_requests').insert({
    user_id: userId,
    city_or_zip: input.cityOrZip.trim(),
    notes: input.notes?.trim() || null,
  })

  return !error
}
