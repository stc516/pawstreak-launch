import type { PlaceCategory } from '../types/place'

/** Destination-scene photos only — no dog stock imagery. */
const CATEGORY_DESTINATION_IMAGES: Record<PlaceCategory, string[]> = {
  Beach: ['/sample-images/beach.jpg', '/sample-images/coastal.jpg'],
  Trail: ['/sample-images/trail.jpg', '/sample-images/park.jpg'],
  Coffee: ['/sample-images/cafe.jpg'],
  'Dog Park': ['/sample-images/park.jpg', '/sample-images/dog-park.jpg'],
  Park: ['/sample-images/park.jpg', '/sample-images/gardens.jpg'],
  Patio: ['/sample-images/cafe.jpg', '/sample-images/neighborhood.jpg'],
  Brewery: ['/sample-images/brewery.jpg', '/sample-images/cafe.jpg'],
  Restaurant: ['/sample-images/cafe.jpg', '/sample-images/neighborhood.jpg'],
  Lake: ['/sample-images/coastal.jpg', '/sample-images/park.jpg'],
  Campground: ['/sample-images/mountain.jpg', '/sample-images/trail.jpg'],
  'Scenic Spot': ['/sample-images/mountain.jpg', '/sample-images/coastal.jpg'],
  Gardens: ['/sample-images/gardens.jpg', '/sample-images/park.jpg'],
  'Road trip': ['/sample-images/road-trip.jpg', '/sample-images/mountain.jpg', '/sample-images/trail.jpg'],
  Neighborhood: ['/sample-images/neighborhood.jpg', '/sample-images/park.jpg'],
  Custom: ['/sample-images/park.jpg', '/sample-images/neighborhood.jpg'],
}

export function getSampleImageForPlace(
  category: PlaceCategory,
  placeId: string,
): string {
  const images = CATEGORY_DESTINATION_IMAGES[category]
  const index =
    placeId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    images.length
  return images[index]!
}

export const SAMPLE_IMAGES = {
  beach: '/sample-images/beach.jpg',
  trail: '/sample-images/trail.jpg',
  park: '/sample-images/park.jpg',
  cafe: '/sample-images/cafe.jpg',
  roadTrip: '/sample-images/road-trip.jpg',
  gardens: '/sample-images/gardens.jpg',
  brewery: '/sample-images/brewery.jpg',
  dogPark: '/sample-images/park.jpg',
  neighborhood: '/sample-images/neighborhood.jpg',
  coastal: '/sample-images/coastal.jpg',
  mountain: '/sample-images/mountain.jpg',
} as const
