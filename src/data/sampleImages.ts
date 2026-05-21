import type { PlaceCategory } from '../types/place'

const CATEGORY_IMAGES: Record<PlaceCategory, string[]> = {
  Beach: ['/sample-images/beach.jpg', '/sample-images/coastal.jpg'],
  Trail: ['/sample-images/trail.jpg', '/sample-images/mountain.jpg'],
  Coffee: ['/sample-images/cafe.jpg'],
  'Dog park': ['/sample-images/dog-park.jpg', '/sample-images/dogs-outdoors.jpg'],
  Park: ['/sample-images/park.jpg', '/sample-images/gardens.jpg'],
  Brewery: ['/sample-images/brewery.jpg', '/sample-images/cafe.jpg'],
  Gardens: ['/sample-images/gardens.jpg', '/sample-images/park.jpg'],
  'Road trip': ['/sample-images/road-trip.jpg', '/sample-images/mountain.jpg'],
  Neighborhood: ['/sample-images/neighborhood.jpg', '/sample-images/park.jpg'],
}

export function getSampleImageForPlace(
  category: PlaceCategory,
  placeId: string,
): string {
  const images = CATEGORY_IMAGES[category]
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
  dogsOutdoors: '/sample-images/dogs-outdoors.jpg',
  gardens: '/sample-images/gardens.jpg',
  brewery: '/sample-images/brewery.jpg',
  dogPark: '/sample-images/dog-park.jpg',
  neighborhood: '/sample-images/neighborhood.jpg',
  coastal: '/sample-images/coastal.jpg',
  mountain: '/sample-images/mountain.jpg',
} as const
