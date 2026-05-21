export type PlaceCategory =
  | 'Beach'
  | 'Trail'
  | 'Coffee'
  | 'Dog park'
  | 'Park'
  | 'Brewery'
  | 'Gardens'
  | 'Road trip'
  | 'Neighborhood'

export type PlaceRegion = 'San Diego' | 'Orange County' | 'Julian / Mountain'

export type PlaceEnergyLevel = 'Low' | 'Moderate' | 'High'

export interface Place {
  id: string
  name: string
  city: string
  region: PlaceRegion
  category: PlaceCategory
  tags: string[]
  distanceLabel: string
  leashInfo: string
  dogFriendlyNotes: string
  whyDogsLoveIt: string
  bestTime: string
  energyLevel: PlaceEnergyLevel
  addressLabel?: string
  lat?: number
  lng?: number
  featured: boolean
  popularNow: boolean
}
