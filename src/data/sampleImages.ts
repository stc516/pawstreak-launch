import type { PlaceCategory } from '../types/place'

interface CategoryArt {
  label: string
  sky: string
  ground: string
  accent: string
  accent2: string
  icon: 'waves' | 'trail' | 'park' | 'dog-park' | 'coffee' | 'patio' | 'brewery' | 'restaurant' | 'lake' | 'camp' | 'scenic' | 'neighborhood' | 'road' | 'spark'
}

const CATEGORY_ART: Record<PlaceCategory, CategoryArt> = {
  Beach: {
    label: 'Beach',
    sky: '#9fd8e6',
    ground: '#f4c978',
    accent: '#2f8fa3',
    accent2: '#ffffff',
    icon: 'waves',
  },
  Trail: {
    label: 'Trail',
    sky: '#c7dfb5',
    ground: '#8d6b48',
    accent: '#2f6d4f',
    accent2: '#f4e6c8',
    icon: 'trail',
  },
  Park: {
    label: 'Park',
    sky: '#b8ddbd',
    ground: '#77a875',
    accent: '#2f6d4f',
    accent2: '#f6d36f',
    icon: 'park',
  },
  'Dog Park': {
    label: 'Dog Park',
    sky: '#b9dfd2',
    ground: '#83b47d',
    accent: '#315f5b',
    accent2: '#f7d77e',
    icon: 'dog-park',
  },
  Coffee: {
    label: 'Coffee',
    sky: '#f0d3ba',
    ground: '#c48662',
    accent: '#6f4b38',
    accent2: '#fff1d8',
    icon: 'coffee',
  },
  Patio: {
    label: 'Patio',
    sky: '#f4d9b2',
    ground: '#94a86d',
    accent: '#365a4a',
    accent2: '#f7c267',
    icon: 'patio',
  },
  Brewery: {
    label: 'Brewery',
    sky: '#f3c66d',
    ground: '#8d573f',
    accent: '#3f2d28',
    accent2: '#fff0c8',
    icon: 'brewery',
  },
  Restaurant: {
    label: 'Restaurant',
    sky: '#f2b8a5',
    ground: '#9c6f5f',
    accent: '#553b35',
    accent2: '#fff5da',
    icon: 'restaurant',
  },
  Lake: {
    label: 'Lake',
    sky: '#a8d6e8',
    ground: '#5f9fb0',
    accent: '#2d6475',
    accent2: '#d7f0f2',
    icon: 'lake',
  },
  Campground: {
    label: 'Campground',
    sky: '#b4d0b0',
    ground: '#84644a',
    accent: '#2f5e45',
    accent2: '#f3bb63',
    icon: 'camp',
  },
  'Scenic Spot': {
    label: 'Scenic',
    sky: '#bad7e6',
    ground: '#8c9a74',
    accent: '#435f6b',
    accent2: '#f3d37a',
    icon: 'scenic',
  },
  Gardens: {
    label: 'Garden',
    sky: '#cddfb9',
    ground: '#779b67',
    accent: '#9d5f8f',
    accent2: '#f6d0dc',
    icon: 'park',
  },
  'Road trip': {
    label: 'Road Trip',
    sky: '#c7dbe5',
    ground: '#9a805d',
    accent: '#3c5660',
    accent2: '#f4c96f',
    icon: 'road',
  },
  Neighborhood: {
    label: 'Neighborhood',
    sky: '#c9dfd4',
    ground: '#8ca77f',
    accent: '#405b4f',
    accent2: '#f4d177',
    icon: 'neighborhood',
  },
  Custom: {
    label: 'Adventure',
    sky: '#d6d7c2',
    ground: '#8aa083',
    accent: '#4f5943',
    accent2: '#f2c66d',
    icon: 'spark',
  },
}

function hashSeed(seed: string): number {
  return seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function iconMarkup(art: CategoryArt, variant: number): string {
  const offset = variant * 8
  switch (art.icon) {
    case 'waves':
      return `<path d="M16 90c24-18 48 18 72 0s48 18 72 0" fill="none" stroke="${art.accent}" stroke-width="9" stroke-linecap="round"/><path d="M24 112c22-14 44 14 66 0s44 14 66 0" fill="none" stroke="${art.accent2}" stroke-width="7" stroke-linecap="round"/><circle cx="${130 - offset}" cy="42" r="16" fill="${art.accent2}" opacity=".95"/>`
    case 'trail':
      return `<path d="M30 126c26-38 54-28 72-60 14-24 36-26 58-36" fill="none" stroke="${art.accent2}" stroke-width="11" stroke-linecap="round"/><path d="M22 112l38-58 24 34 22-44 52 78" fill="none" stroke="${art.accent}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`
    case 'park':
      return `<circle cx="62" cy="70" r="30" fill="${art.accent}"/><circle cx="104" cy="60" r="36" fill="${art.accent}" opacity=".88"/><rect x="75" y="82" width="16" height="45" rx="7" fill="#6d513b"/><path d="M32 128h126" stroke="${art.accent2}" stroke-width="8" stroke-linecap="round"/>`
    case 'dog-park':
      return `<path d="M36 94h90l18 22" fill="none" stroke="${art.accent}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><circle cx="62" cy="122" r="10" fill="${art.accent2}"/><circle cx="124" cy="122" r="10" fill="${art.accent2}"/><path d="M134 82l20-18" stroke="${art.accent}" stroke-width="10" stroke-linecap="round"/>`
    case 'coffee':
      return `<rect x="52" y="60" width="64" height="58" rx="14" fill="${art.accent2}"/><path d="M116 76h16a16 16 0 010 32h-16" fill="none" stroke="${art.accent2}" stroke-width="10"/><path d="M68 48c-8-14 12-16 4-30M92 48c-8-14 12-16 4-30" stroke="${art.accent}" stroke-width="7" stroke-linecap="round"/>`
    case 'patio':
      return `<path d="M34 84h118" stroke="${art.accent}" stroke-width="9" stroke-linecap="round"/><path d="M58 84v42M128 84v42" stroke="${art.accent}" stroke-width="8" stroke-linecap="round"/><circle cx="72" cy="58" r="12" fill="${art.accent2}"/><circle cx="100" cy="50" r="12" fill="${art.accent2}"/><circle cx="128" cy="58" r="12" fill="${art.accent2}"/>`
    case 'brewery':
      return `<rect x="54" y="58" width="48" height="66" rx="10" fill="${art.accent2}"/><path d="M102 74h18a18 18 0 010 36h-18" fill="none" stroke="${art.accent2}" stroke-width="10"/><path d="M62 50h32M68 42h20" stroke="${art.accent}" stroke-width="7" stroke-linecap="round"/><circle cx="76" cy="92" r="7" fill="${art.accent}"/><circle cx="92" cy="106" r="5" fill="${art.accent}"/>`
    case 'restaurant':
      return `<circle cx="92" cy="86" r="34" fill="${art.accent2}"/><circle cx="92" cy="86" r="20" fill="${art.sky}" opacity=".8"/><path d="M42 50v78M34 50v26M50 50v26M142 50c-18 18-18 44 0 58v20" stroke="${art.accent}" stroke-width="8" stroke-linecap="round"/>`
    case 'lake':
      return `<path d="M24 106c28-18 48 18 76 0s48 18 76 0v28H24z" fill="${art.accent}"/><path d="M36 82l34-36 24 28 18-18 38 34" fill="none" stroke="${art.accent2}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`
    case 'camp':
      return `<path d="M54 126l38-78 38 78z" fill="${art.accent2}"/><path d="M92 48l-14 78M92 48l14 78" stroke="${art.accent}" stroke-width="8" stroke-linecap="round"/><path d="M34 126h124" stroke="${art.accent}" stroke-width="8" stroke-linecap="round"/>`
    case 'scenic':
      return `<path d="M24 124l44-58 28 34 24-48 42 72z" fill="${art.accent}"/><circle cx="${130 - offset}" cy="44" r="14" fill="${art.accent2}"/><path d="M46 122h104" stroke="${art.accent2}" stroke-width="7" stroke-linecap="round"/>`
    case 'neighborhood':
      return `<path d="M38 82l28-24 28 24v42H38zM104 86l24-20 24 20v38h-48z" fill="${art.accent2}"/><path d="M28 126h132" stroke="${art.accent}" stroke-width="8" stroke-linecap="round"/><rect x="70" y="98" width="12" height="26" fill="${art.accent}"/>`
    case 'road':
      return `<path d="M82 132l18-94M110 132L92 38" fill="none" stroke="${art.accent}" stroke-width="16" stroke-linecap="round"/><path d="M96 50v18M96 86v18M96 122v10" stroke="${art.accent2}" stroke-width="5" stroke-linecap="round"/>`
    case 'spark':
      return `<path d="M92 36l12 36 36 12-36 12-12 36-12-36-36-12 36-12z" fill="${art.accent2}"/><circle cx="134" cy="48" r="10" fill="${art.accent}"/><circle cx="50" cy="120" r="8" fill="${art.accent}"/>`
  }
}

function buildCategoryArtUrl(category: PlaceCategory, seed: string = category): string {
  const art = CATEGORY_ART[category]
  const variant = hashSeed(seed) % 4
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 140" role="img" aria-label="${art.label} illustration">
  <rect width="180" height="140" rx="18" fill="${art.sky}"/>
  <path d="M0 ${96 + variant * 3}c36-18 62 12 94-4s52-10 86 8v40H0z" fill="${art.ground}"/>
  <circle cx="${30 + variant * 22}" cy="30" r="28" fill="${art.accent2}" opacity=".28"/>
  ${iconMarkup(art, variant)}
  <rect x="14" y="14" width="${Math.max(52, art.label.length * 8)}" height="24" rx="12" fill="rgba(255,255,255,.72)"/>
  <text x="26" y="31" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="800" fill="${art.accent}">${art.label}</text>
</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export function getSampleImageForPlace(
  category: PlaceCategory,
  placeId: string,
): string {
  return buildCategoryArtUrl(category, placeId)
}

export const SAMPLE_IMAGES = {
  beach: buildCategoryArtUrl('Beach', 'sample-beach'),
  trail: buildCategoryArtUrl('Trail', 'sample-trail'),
  park: buildCategoryArtUrl('Park', 'sample-park'),
  cafe: buildCategoryArtUrl('Coffee', 'sample-coffee'),
  roadTrip: buildCategoryArtUrl('Road trip', 'sample-road-trip'),
  gardens: buildCategoryArtUrl('Gardens', 'sample-gardens'),
  brewery: buildCategoryArtUrl('Brewery', 'sample-brewery'),
  dogPark: buildCategoryArtUrl('Dog Park', 'sample-dog-park'),
  neighborhood: buildCategoryArtUrl('Neighborhood', 'sample-neighborhood'),
  coastal: buildCategoryArtUrl('Scenic Spot', 'sample-coastal'),
  mountain: buildCategoryArtUrl('Campground', 'sample-mountain'),
  patio: buildCategoryArtUrl('Patio', 'sample-patio'),
  restaurant: buildCategoryArtUrl('Restaurant', 'sample-restaurant'),
  lake: buildCategoryArtUrl('Lake', 'sample-lake'),
  campground: buildCategoryArtUrl('Campground', 'sample-campground'),
  scenic: buildCategoryArtUrl('Scenic Spot', 'sample-scenic'),
  training: buildCategoryArtUrl('Custom', 'sample-training'),
  genericAdventure: buildCategoryArtUrl('Custom', 'sample-custom'),
} as const
