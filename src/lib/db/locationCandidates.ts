import type { LocationCandidate } from '../../data/demo'
import { getSupabaseClient } from '../supabase'

export async function insertLocationCandidate(
  candidate: LocationCandidate,
): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  const { error } = await supabase.from('location_candidates').insert({
    id: candidate.id,
    user_id: candidate.userId ?? null,
    source_adventure_id: candidate.sourceAdventureId,
    source_memory_id: candidate.sourceMemoryId ?? null,
    custom_title: candidate.customTitle,
    normalized_title: candidate.normalizedTitle,
    custom_location_label: candidate.customLocationLabel ?? null,
    approximate_lat: candidate.approximateLat,
    approximate_lng: candidate.approximateLng,
    end_lat: candidate.endLat ?? null,
    end_lng: candidate.endLng ?? null,
    photo_count: candidate.photoCount,
    dog_ids: candidate.dogIds,
    user_notes: candidate.userNotes ?? null,
    review_status: candidate.reviewStatus,
    candidate_type: candidate.candidateType,
    source: candidate.source,
    created_at: candidate.createdAt,
  })

  return !error
}
