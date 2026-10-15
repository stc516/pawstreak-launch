/** Retired category illustrations must never impersonate a place or a saved photo. */
export function authenticImageUrl(url?: string): string | undefined {
  if (!url || /(?:\/sample-images\/|images\.unsplash\.com|source\.unsplash\.com)/i.test(url)) return undefined
  return url
}

export function authenticPhotoUrls(urls?: string[]): string[] {
  return (urls ?? []).filter(url => Boolean(authenticImageUrl(url)))
}
