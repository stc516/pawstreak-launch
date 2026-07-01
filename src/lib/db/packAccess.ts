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

function friendlyFunctionError(message: string | null, fallback: string): string {
  if (!message) return fallback
  if (/jwt|auth session missing|authentication required|not authenticated/i.test(message)) {
    return 'Log in again before sending a Pack Access invite.'
  }
  if (/rate limit/i.test(message)) {
    return 'Invite limit reached for today. Owners can send 10 invites per day.'
  }
  if (/email/i.test(message) && /valid/i.test(message)) {
    return 'Enter a valid email address.'
  }
  return message
}

async function readFunctionErrorMessage(error: unknown): Promise<string | null> {
  const context = (error as { context?: unknown })?.context
  if (context instanceof Response) {
    try {
      const body = (await context.clone().json()) as { error?: unknown; message?: unknown }
      if (typeof body.error === 'string') return body.error
      if (typeof body.message === 'string') return body.message
    } catch {
      try {
        const text = await context.clone().text()
        if (text) return text
      } catch {
        return null
      }
    }
  }

  return error instanceof Error ? error.message : null
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

  if (error) {
    const message = await readFunctionErrorMessage(error)
    throw new Error(friendlyFunctionError(message, 'Could not send invite.'))
  }
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

  if (error) {
    const message = await readFunctionErrorMessage(error)
    throw new Error(friendlyFunctionError(message, 'Could not accept invite.'))
  }
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
