export type PlaceCategory =
  | 'Dog Park'
  | 'Beach'
  | 'Trail'
  | 'Park'
  | 'Coffee'
  | 'Patio'
  | 'Brewery'
  | 'Restaurant'
  | 'Lake'
  | 'Campground'
  | 'Scenic Spot'
  | 'Gardens'
  | 'Road trip'
  | 'Neighborhood'
  | 'Custom'

export type PlaceRegion = 'San Diego' | 'Orange County' | 'Julian / Mountain'

export type PlaceEnergyLevel = 'Low' | 'Moderate' | 'High'

export type PlaceImageTone =
  | 'coastal'
  | 'forest'
  | 'urban'
  | 'mountain'
  | 'park'
  | 'warm'
  | 'desert'

export interface Place {
  id: string
  name: string
  city: string
  state?: string
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
  address?: string
  website?: string
  lat?: number
  lng?: number
  driveTimeEstimate?: string
  directionsDestination?: string
  suggestedStops?: string[]
  featured: boolean
  popularNow: boolean
  imageUrl?: string
  imageAlt?: string
  imageTone?: PlaceImageTone
}
