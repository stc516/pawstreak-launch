import assetsManifest from '../../social-assets/assets.json'
import {
  getContentTags,
  SOCIAL_CONTENT_BY_SLUG,
  type AccountCopy,
  type ContentTag,
  type SocialAccount,
} from '../data/socialContentCopy'

export type SocialAssetType = 'screenshot' | 'story' | 'video'
export type SocialPlatform = 'Instagram' | 'TikTok' | 'Story' | 'Reel'

export const SOCIAL_ASSETS_ROOT = 'social-assets'

export const SOCIAL_ASSET_FOLDERS = {
  root: SOCIAL_ASSETS_ROOT,
  screenshots: `${SOCIAL_ASSETS_ROOT}/screenshots`,
  stories: `${SOCIAL_ASSETS_ROOT}/stories`,
  videos: `${SOCIAL_ASSETS_ROOT}/videos`,
} as const

export interface SocialStudioItem {
  id: string
  slug: string
  title: string
  screen: string
  type: SocialAssetType
  assetPath: string
  fullAssetPath: string
  mediaUrl: string
  recommendedAccount: SocialAccount | 'Both'
  recommendedPlatform: string
  platforms: SocialPlatform[]
  tags: ContentTag[]
  sortIndex: number
  PawStreakApp: AccountCopy
  BaileyHuskyCream: AccountCopy
  generatedAt?: string
}

export interface StudioAnalytics {
  total: number
  posted: number
  favorites: number
  screenshots: number
  stories: number
  reels: number
}

const mediaUrls = import.meta.glob('../../social-assets/**/*.{png,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

function resolveMediaUrl(relativePath: string): string {
  const match = Object.entries(mediaUrls).find(([key]) => key.endsWith(relativePath))
  return match?.[1] ?? ''
}

function slugFromAssetId(id: string): string {
  if (id === 'pawstreak-demo-flow') return id
  return id.replace(/-story$/, '')
}

function titleFromSlug(slug: string, type: SocialAssetType): string {
  const meta = SOCIAL_CONTENT_BY_SLUG[slug]
  if (!meta) return slug
  if (type === 'story') return `${meta.title} (Story-safe)`
  if (type === 'video') return meta.title
  return meta.title
}

export function buildSocialStudioCatalog(): SocialStudioItem[] {
  const manifest = assetsManifest as {
    assets: {
      id: string
      type: SocialAssetType
      path: string
    }[]
    generatedAt?: string
  }

  return manifest.assets.flatMap((asset, sortIndex) => {
    const slug = slugFromAssetId(asset.id)
    const meta = SOCIAL_CONTENT_BY_SLUG[slug]
    if (!meta) return []

    const mediaUrl = resolveMediaUrl(asset.path)
    if (!mediaUrl) return []

    const item: SocialStudioItem = {
      id: asset.id,
      slug,
      title: titleFromSlug(slug, asset.type),
      screen: meta.screen,
      type: asset.type,
      assetPath: asset.path,
      fullAssetPath: `${SOCIAL_ASSETS_ROOT}/${asset.path}`,
      mediaUrl,
      recommendedAccount: meta.recommendedAccount,
      recommendedPlatform: meta.recommendedPlatform,
      platforms: meta.platforms,
      tags: meta.tags ?? getContentTags(slug),
      sortIndex,
      PawStreakApp: meta.PawStreakApp,
      BaileyHuskyCream: meta.BaileyHuskyCream,
      generatedAt: manifest.generatedAt,
    }
    return [item]
  })
}

export function getStudioAnalytics(
  catalog: SocialStudioItem[],
  favoriteIds: Set<string>,
  postedIds: Set<string>,
): StudioAnalytics {
  return {
    total: catalog.length,
    posted: postedIds.size,
    favorites: favoriteIds.size,
    screenshots: catalog.filter((item) => item.type === 'screenshot').length,
    stories: catalog.filter((item) => item.type === 'story').length,
    reels: catalog.filter((item) => item.type === 'video').length,
  }
}

export type StudioSortMode = 'default' | 'recent'

export function sortStudioItems(
  items: SocialStudioItem[],
  mode: StudioSortMode,
): SocialStudioItem[] {
  const sorted = [...items]
  if (mode === 'recent') {
    sorted.sort((a, b) => b.sortIndex - a.sortIndex)
    return sorted
  }
  sorted.sort((a, b) => a.sortIndex - b.sortIndex)
  return sorted
}

export const SOCIAL_STUDIO_CORE_LINE = assetsManifest.coreLine as string

export const SOCIAL_STUDIO_GENERATED_AT = assetsManifest.generatedAt as string | undefined
