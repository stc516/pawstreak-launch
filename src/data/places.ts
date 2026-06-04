import type { Dog, JourneyEntry } from './demo'
import { dogNamesLabel } from './demo'
import type { Place, PlaceCategory, PlaceImageTone } from '../types/place'
import { getMagicLine, getHeroMagicSubtitle, getPlanMagicMeta } from '../lib/magicCopy'
import {
  buildEmotionalMemoryLine,
  buildFavoriteMoment,
} from '../lib/adventureFinish'
import type { RecommendationPrefs } from '../lib/onboardingProfile'
import { scorePlaceForProfile } from '../lib/onboardingProfile'
import { getSampleImageForPlace } from './sampleImages'
import { EXPANDED_LOCAL_PLACES } from './placesExpanded'

export { getMagicLine, getHeroMagicSubtitle, getPlanMagicMeta }

export const LEGACY_LOCAL_PLACES: Place[] = [
  {
    id: 'dog-beach-ocean-beach',
    name: 'Dog Beach, Ocean Beach',
    city: 'San Diego',
    region: 'San Diego',
    category: 'Beach',
    tags: ['off-leash', 'water', 'social'],
    distanceLabel: '1.4 mi',
    leashInfo: 'Off-leash',
    dogFriendlyNotes: 'Dedicated off-leash beach at the north end of Ocean Beach.',
    whyDogsLoveIt: 'Wave chasing, sand rolls, and a packed social scene every morning.',
    bestTime: 'Sunrise or weekday mornings',
    energyLevel: 'High',
    addressLabel: '5156 W Point Loma Blvd',
    lat: 32.7551,
    lng: -117.2534,
    featured: true,
    popularNow: true,
  },
  {
    id: 'coronado-dog-beach',
    name: 'Coronado Dog Beach',
    city: 'Coronado',
    region: 'San Diego',
    category: 'Beach',
    tags: ['off-leash', 'water', 'flat-sand'],
    distanceLabel: '6.8 mi',
    leashInfo: 'Off-leash',
    dogFriendlyNotes: 'Wide flat beach at the north end of Coronado near the naval base.',
    whyDogsLoveIt: 'Gentle surf and room to sprint without crowds mid-week.',
    bestTime: 'Early morning before parking fills',
    energyLevel: 'High',
    lat: 32.6917,
    lng: -117.1831,
    featured: true,
    popularNow: false,
  },
  {
    id: 'del-mar-dog-beach',
    name: 'Del Mar Dog Beach',
    city: 'Del Mar',
    region: 'San Diego',
    category: 'Beach',
    tags: ['off-leash', 'water', 'scenic'],
    distanceLabel: '18 mi',
    leashInfo: 'Off-leash',
    dogFriendlyNotes: 'North of 29th Street in Del Mar — one of the best-known SD dog beaches.',
    whyDogsLoveIt: 'Soft sand, consistent surf, and post-walk patio stops nearby.',
    bestTime: 'Late afternoon · best window today',
    energyLevel: 'High',
    lat: 32.9645,
    lng: -117.2653,
    featured: true,
    popularNow: true,
  },
  {
    id: 'fiesta-island',
    name: 'Fiesta Island',
    city: 'San Diego',
    region: 'San Diego',
    category: 'Beach',
    tags: ['off-leash', 'water', 'flat'],
    distanceLabel: '5.2 mi',
    leashInfo: 'Off-leash',
    dogFriendlyNotes: 'Fully off-leash island in Mission Bay with calm water edges.',
    whyDogsLoveIt: 'Shallow bay water, flat running loops, and breeze on hot days.',
    bestTime: 'Weekday mornings',
    energyLevel: 'Moderate',
    lat: 32.7712,
    lng: -117.2189,
    featured: false,
    popularNow: false,
  },
  {
    id: 'la-jolla-shores',
    name: 'La Jolla Shores Beach',
    city: 'La Jolla',
    region: 'San Diego',
    category: 'Beach',
    tags: ['on-leash', 'water', 'family'],
    distanceLabel: '9.1 mi',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Dogs allowed on-leash before 9am and after 4pm in summer.',
    whyDogsLoveIt: 'Gentle waves and a long flat strand for sniff-heavy walks.',
    bestTime: 'Before 9am',
    energyLevel: 'Moderate',
    lat: 32.8584,
    lng: -117.2573,
    featured: false,
    popularNow: false,
  },
  {
    id: 'mission-bay',
    name: 'Mission Bay',
    city: 'San Diego',
    region: 'San Diego',
    category: 'Beach',
    tags: ['on-leash', 'water', 'bay'],
    distanceLabel: '5.5 mi',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Shoreline paths and grassy park edges around Mission Bay.',
    whyDogsLoveIt: 'Flat bay walks, breeze, and room to sniff without steep hills.',
    bestTime: 'Sunset shoreline loop',
    energyLevel: 'Moderate',
    lat: 32.7648,
    lng: -117.2268,
    featured: false,
    popularNow: false,
  },
  {
    id: 'pacific-beach',
    name: 'Pacific Beach',
    city: 'San Diego',
    region: 'San Diego',
    category: 'Beach',
    tags: ['on-leash', 'water', 'boardwalk'],
    distanceLabel: '7.2 mi',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Boardwalk and beach strand — busy on weekends, calmer at sunrise.',
    whyDogsLoveIt: 'Boardwalk energy, sand, and a classic San Diego beach day.',
    bestTime: 'Early morning before crowds',
    energyLevel: 'Moderate',
    lat: 32.7990,
    lng: -117.2540,
    featured: false,
    popularNow: false,
  },
  {
    id: 'cardiff-dog-beach',
    name: 'Cardiff Dog Beach',
    city: 'Encinitas',
    region: 'San Diego',
    category: 'Beach',
    tags: ['off-leash', 'water', 'north-county'],
    distanceLabel: '24 mi',
    leashInfo: 'Off-leash',
    dogFriendlyNotes: 'North County off-leash stretch at the south end of Cardiff State Beach.',
    whyDogsLoveIt: 'Wide sand, steady surf, and a north-county change of pace.',
    bestTime: 'Weekday mornings',
    energyLevel: 'High',
    lat: 33.0102,
    lng: -117.2794,
    featured: false,
    popularNow: false,
  },
  {
    id: 'huntington-dog-beach',
    name: 'Huntington Dog Beach',
    city: 'Huntington Beach',
    region: 'Orange County',
    category: 'Beach',
    tags: ['off-leash', 'water', 'iconic'],
    distanceLabel: '88 mi',
    leashInfo: 'Off-leash',
    dogFriendlyNotes: '1.5 miles of off-leash beach between Seapoint and 21st Street.',
    whyDogsLoveIt: 'Endless sand, surf, and the most famous OC dog beach scene.',
    bestTime: 'Weekday mornings to beat traffic',
    energyLevel: 'High',
    lat: 33.6595,
    lng: -118.0012,
    featured: true,
    popularNow: true,
  },
  {
    id: 'newport-dog-beach',
    name: 'Newport Beach Dog Zone',
    city: 'Newport Beach',
    region: 'Orange County',
    category: 'Beach',
    tags: ['on-leash', 'water', 'harbor'],
    distanceLabel: '82 mi',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Dogs welcome on-leash at specified beach zones and harbor paths.',
    whyDogsLoveIt: 'Harbor smells, sailboats, and a change of scenery from SD beaches.',
    bestTime: 'Morning harbor walk',
    energyLevel: 'Low',
    lat: 33.6189,
    lng: -117.9298,
    featured: false,
    popularNow: false,
  },
  {
    id: 'torrey-pines',
    name: 'Torrey Pines State Reserve',
    city: 'La Jolla',
    region: 'San Diego',
    category: 'Trail',
    tags: ['on-leash', 'coastal', 'views'],
    distanceLabel: '12 mi',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Dogs on-leash on designated trails — avoid fragile habitat areas.',
    whyDogsLoveIt: 'Ocean views, sage scrub smells, and a real workout on the switchbacks.',
    bestTime: 'Weekday sunrise',
    energyLevel: 'High',
    lat: 32.9201,
    lng: -117.2533,
    featured: true,
    popularNow: false,
  },
  {
    id: 'cowles-mountain',
    name: 'Cowles Mountain Trail',
    city: 'San Diego',
    region: 'San Diego',
    category: 'Trail',
    tags: ['on-leash', 'summit', 'workout'],
    distanceLabel: '8.4 mi',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Popular Mission Trails summit — dogs on-leash, bring water.',
    whyDogsLoveIt: 'Summit views and the satisfaction of a steep climb together.',
    bestTime: 'Early morning before heat',
    energyLevel: 'High',
    lat: 32.8129,
    lng: -117.0312,
    featured: true,
    popularNow: false,
  },
  {
    id: 'iron-mountain',
    name: 'Iron Mountain Trail',
    city: 'Poway',
    region: 'San Diego',
    category: 'Trail',
    tags: ['on-leash', 'wildflowers', 'moderate'],
    distanceLabel: '22 mi',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Well-marked loop with seasonal wildflowers in spring.',
    whyDogsLoveIt: 'Shaded sections, varied terrain, and fewer crowds than Cowles.',
    bestTime: 'Spring mornings',
    energyLevel: 'Moderate',
    lat: 33.0184,
    lng: -116.9678,
    featured: false,
    popularNow: false,
  },
  {
    id: 'mission-trails-kwaay-paay',
    name: 'Mission Trails — Kwaay Paay Peak',
    city: 'San Diego',
    region: 'San Diego',
    category: 'Trail',
    tags: ['on-leash', 'local', 'moderate'],
    distanceLabel: '7.6 mi',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Shorter summit option inside Mission Trails Regional Park.',
    whyDogsLoveIt: 'Quick elevation gain and valley views without a long drive.',
    bestTime: 'Sunset hike',
    energyLevel: 'Moderate',
    lat: 32.7856,
    lng: -117.0512,
    featured: false,
    popularNow: false,
  },
  {
    id: 'lestats-coffee',
    name: "Lestat's Coffee House",
    city: 'San Diego',
    region: 'San Diego',
    category: 'Coffee',
    tags: ['patio', 'local', 'late-night'],
    distanceLabel: '2.1 mi',
    leashInfo: 'Patio dogs welcome',
    dogFriendlyNotes: 'Classic SD coffee spot with outdoor seating and a neighborhood vibe.',
    whyDogsLoveIt: 'People watching, patio treats, and the buzz of Normal Heights.',
    bestTime: 'Morning coffee run',
    energyLevel: 'Low',
    addressLabel: '3349 Adams Ave',
    lat: 32.7641,
    lng: -117.1223,
    featured: true,
    popularNow: false,
  },
  {
    id: 'better-buzz-hillcrest',
    name: 'Better Buzz Coffee — Hillcrest',
    city: 'San Diego',
    region: 'San Diego',
    category: 'Coffee',
    tags: ['patio', 'busy', 'local'],
    distanceLabel: '3.0 mi',
    leashInfo: 'Patio dogs welcome',
    dogFriendlyNotes: 'Outdoor tables on the sidewalk — keep pups leashed and close.',
    whyDogsLoveIt: 'High-energy patio scene and a short walk through Hillcrest.',
    bestTime: 'Weekday mid-morning',
    energyLevel: 'Low',
    lat: 32.7489,
    lng: -117.1667,
    featured: false,
    popularNow: true,
  },
  {
    id: 'holsem-coffee',
    name: 'Holsem Coffee',
    city: 'San Diego',
    region: 'San Diego',
    category: 'Coffee',
    tags: ['patio', 'neighborhood', 'pastries'],
    distanceLabel: '4.5 mi',
    leashInfo: 'Patio dogs welcome',
    dogFriendlyNotes: 'South Park favorite with sidewalk seating and calm mornings.',
    whyDogsLoveIt: 'Relaxed patio hangs and a tree-lined walk to get there.',
    bestTime: 'Slow weekend morning',
    energyLevel: 'Low',
    lat: 32.7298,
    lng: -117.1298,
    featured: false,
    popularNow: false,
  },
  {
    id: 'ballast-point-little-italy',
    name: 'Ballast Point — Little Italy',
    city: 'San Diego',
    region: 'San Diego',
    category: 'Brewery',
    tags: ['patio', 'beer', 'waterfront-nearby'],
    distanceLabel: '2.8 mi',
    leashInfo: 'Patio dogs welcome',
    dogFriendlyNotes: 'Dog-friendly patio in Little Italy — busy on weekends.',
    whyDogsLoveIt: 'Patio energy, new smells, and a walk through the neighborhood after.',
    bestTime: 'Weekday afternoon',
    energyLevel: 'Low',
    lat: 32.7234,
    lng: -117.1689,
    featured: true,
    popularNow: false,
  },
  {
    id: 'modern-times-flavordome',
    name: 'Modern Times — Flavordome',
    city: 'San Diego',
    region: 'San Diego',
    category: 'Brewery',
    tags: ['patio', 'beer', 'north-park'],
    distanceLabel: '3.6 mi',
    leashInfo: 'Patio dogs welcome',
    dogFriendlyNotes: 'Large outdoor area in North Park with room for leashed pups.',
    whyDogsLoveIt: 'Open patio, other dogs around, and a fun post-walk reward.',
    bestTime: 'Late afternoon',
    energyLevel: 'Low',
    lat: 32.7412,
    lng: -117.1298,
    featured: false,
    popularNow: false,
  },
  {
    id: 'nates-point',
    name: "Nate's Point Dog Park",
    city: 'San Diego',
    region: 'San Diego',
    category: 'Dog Park',
    tags: ['off-leash', 'enclosed', 'balboa'],
    distanceLabel: '3.4 mi',
    leashInfo: 'Off-leash enclosed',
    dogFriendlyNotes: 'Large fenced off-leash area on the west side of Balboa Park.',
    whyDogsLoveIt: 'Full-speed zoomies and regulars who know every pup by name.',
    bestTime: 'Morning social hour',
    energyLevel: 'High',
    lat: 32.7341,
    lng: -117.1445,
    featured: true,
    popularNow: false,
  },
  {
    id: 'grape-street-dog-park',
    name: 'Grape Street Dog Park',
    city: 'San Diego',
    region: 'San Diego',
    category: 'Dog Park',
    tags: ['off-leash', 'enclosed', 'south-park'],
    distanceLabel: '4.2 mi',
    leashInfo: 'Off-leash enclosed',
    dogFriendlyNotes: 'Neighborhood favorite in South Park with separate small-dog area.',
    whyDogsLoveIt: 'Tight community feel and easy walk from nearby cafes.',
    bestTime: 'After-work play session',
    energyLevel: 'High',
    lat: 32.7291,
    lng: -117.1291,
    featured: false,
    popularNow: false,
  },
  {
    id: 'dusty-rhodes',
    name: 'Dusty Rhodes Dog Park',
    city: 'San Diego',
    region: 'San Diego',
    category: 'Dog Park',
    tags: ['off-leash', 'ocean-breeze', 'ob'],
    distanceLabel: '1.8 mi',
    leashInfo: 'Off-leash enclosed',
    dogFriendlyNotes: 'Ocean-view off-leash park in Ocean Beach — can get windy.',
    whyDogsLoveIt: 'Sea breeze, sand underfoot, and a quick beach combo nearby.',
    bestTime: 'Morning before wind picks up',
    energyLevel: 'High',
    lat: 32.7512,
    lng: -117.2489,
    featured: false,
    popularNow: true,
  },
  {
    id: 'central-bark-lake-forest',
    name: 'Central Bark Dog Park',
    city: 'Lake Forest',
    region: 'Orange County',
    category: 'Dog Park',
    tags: ['off-leash', 'enclosed', 'large'],
    distanceLabel: '72 mi',
    leashInfo: 'Off-leash enclosed',
    dogFriendlyNotes: 'Spacious OC dog park with separate areas for different sizes.',
    whyDogsLoveIt: 'Room to run and a full OC day-trip adventure vibe.',
    bestTime: 'Weekday mid-morning',
    energyLevel: 'High',
    lat: 33.6467,
    lng: -117.6891,
    featured: false,
    popularNow: false,
  },
  {
    id: 'balboa-park',
    name: 'Balboa Park',
    city: 'San Diego',
    region: 'San Diego',
    category: 'Park',
    tags: ['on-leash', 'cultural', 'wide-paths'],
    distanceLabel: '3.2 mi',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Dogs on-leash on paved paths — museums and gardens vary by rules.',
    whyDogsLoveIt: 'Endless paths, fountains, and new corners every visit.',
    bestTime: 'Weekday morning stroll',
    energyLevel: 'Moderate',
    lat: 32.7341,
    lng: -117.1446,
    featured: true,
    popularNow: false,
  },
  {
    id: 'kate-sessions',
    name: 'Kate Sessions Memorial Park',
    city: 'San Diego',
    region: 'San Diego',
    category: 'Park',
    tags: ['on-leash', 'views', 'sunset'],
    distanceLabel: '6.5 mi',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Grassy park on Mount Soledad with panoramic views.',
    whyDogsLoveIt: 'Open grass, sunset views, and a breezy hilltop walk.',
    bestTime: 'Best window today',
    energyLevel: 'Moderate',
    lat: 32.8321,
    lng: -117.2412,
    featured: false,
    popularNow: false,
  },
  {
    id: 'tecolote-canyon',
    name: 'Tecolote Canyon Natural Park',
    city: 'San Diego',
    region: 'San Diego',
    category: 'Park',
    tags: ['on-leash', 'canyon', 'quiet'],
    distanceLabel: '5.8 mi',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Shaded canyon trails in Clairemont — cooler on hot days.',
    whyDogsLoveIt: 'Wild canyon smells and bird activity away from crowds.',
    bestTime: 'Cool morning',
    energyLevel: 'Moderate',
    lat: 32.7812,
    lng: -117.1912,
    featured: false,
    popularNow: false,
  },
  {
    id: 'balboa-rose-garden',
    name: 'Balboa Park Rose Garden',
    city: 'San Diego',
    region: 'San Diego',
    category: 'Gardens',
    tags: ['on-leash', 'flowers', 'seasonal'],
    distanceLabel: '3.2 mi',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Inez Grant Parker Memorial Rose Garden — peak bloom in spring.',
    whyDogsLoveIt: 'Color, fragrance, and a photogenic loop through the blooms.',
    bestTime: 'Spring mornings',
    energyLevel: 'Low',
    lat: 32.7312,
    lng: -117.1489,
    featured: true,
    popularNow: false,
  },
  {
    id: 'san-diego-botanic-garden',
    name: 'San Diego Botanic Garden',
    city: 'Encinitas',
    region: 'San Diego',
    category: 'Gardens',
    tags: ['on-leash', 'trails', 'coastal'],
    distanceLabel: '26 mi',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Dogs allowed on-leash on select trails — check day-of rules.',
    whyDogsLoveIt: 'Global garden zones and shaded paths on a coastal hill.',
    bestTime: 'Weekday visit',
    energyLevel: 'Moderate',
    lat: 33.0512,
    lng: -117.2812,
    featured: false,
    popularNow: false,
  },
  {
    id: 'north-park-loop',
    name: 'North Park Neighborhood Loop',
    city: 'San Diego',
    region: 'San Diego',
    category: 'Neighborhood',
    tags: ['on-leash', 'urban', 'cafes'],
    distanceLabel: '3.5 mi',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Self-guided loop through 30th Street, shops, and side streets.',
    whyDogsLoveIt: 'New storefront smells, friendly neighbors, and cafe stops.',
    bestTime: 'Saturday morning',
    energyLevel: 'Low',
    lat: 32.7412,
    lng: -117.1298,
    featured: false,
    popularNow: false,
  },
  {
    id: 'liberty-station',
    name: 'Liberty Station Waterfront Walk',
    city: 'San Diego',
    region: 'San Diego',
    category: 'Neighborhood',
    tags: ['on-leash', 'waterfront', 'flat'],
    distanceLabel: '4.8 mi',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Flat promenade through the arts district and marina paths.',
    whyDogsLoveIt: 'Harbor views, public art, and a calm flat walk for senior pups.',
    bestTime: 'Evening stroll',
    energyLevel: 'Low',
    lat: 32.7267,
    lng: -117.2145,
    featured: false,
    popularNow: false,
  },
  {
    id: 'julian-day-trip',
    name: 'Julian Dog-Friendly Day Trip',
    city: 'Julian',
    region: 'Julian / Mountain',
    category: 'Road trip',
    tags: ['road-trip', 'apples', 'mountain'],
    distanceLabel: '62 mi',
    driveTimeEstimate: '1 hr 20 min',
    directionsDestination: 'Julian, CA 92036',
    suggestedStops: ['Main Street Julian', 'Apple orchards', 'Cuyamaca Rancho State Park'],
    leashInfo: 'On-leash in town',
    dogFriendlyNotes: 'Mountain town day trip — apple orchards, main street, and nearby trails.',
    whyDogsLoveIt: 'New mountain smells, pie stops, and a big adventure out of the city.',
    bestTime: 'Fall apple season',
    energyLevel: 'Moderate',
    lat: 33.0787,
    lng: -116.602,
    featured: true,
    popularNow: false,
  },
  {
    id: 'lake-cuyamaca',
    name: 'Lake Cuyamaca Recreation Area',
    city: 'Julian',
    region: 'Julian / Mountain',
    category: 'Road trip',
    tags: ['road-trip', 'lake', 'trails'],
    distanceLabel: '58 mi',
    driveTimeEstimate: '1 hr 10 min',
    directionsDestination: 'Lake Cuyamaca Recreation Area, Julian, CA 92036',
    suggestedStops: ['Lake loop trailhead', 'Pine forest picnic areas'],
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Forest lake loop near Julian with cooler mountain air.',
    whyDogsLoveIt: 'Wildlife scents, pine forest, and a true escape from the coast.',
    bestTime: 'Cool-season day trip',
    energyLevel: 'Moderate',
    lat: 32.9876,
    lng: -116.5712,
    featured: false,
    popularNow: false,
  },
  {
    id: 'mount-laguna',
    name: 'Mount Laguna Trail Day Trip',
    city: 'Mount Laguna',
    region: 'Julian / Mountain',
    category: 'Road trip',
    tags: ['road-trip', 'forest', 'elevation'],
    distanceLabel: '55 mi',
    driveTimeEstimate: '1 hr 5 min',
    directionsDestination: 'Mount Laguna, CA 91948',
    suggestedStops: ['Big Laguna Trail', 'Sunset Viewpoint'],
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'High-elevation pine forest trails — snow possible in winter.',
    whyDogsLoveIt: 'Cool air, pine needles underfoot, and big-sky meadow views.',
    bestTime: 'Summer heat escape',
    energyLevel: 'High',
    lat: 32.8712,
    lng: -116.4512,
    featured: false,
    popularNow: false,
  },
  {
    id: 'anza-borrego',
    name: 'Anza-Borrego Desert State Park',
    city: 'Borrego Springs',
    region: 'Julian / Mountain',
    category: 'Road trip',
    tags: ['road-trip', 'desert', 'wildflowers'],
    distanceLabel: '85 mi',
    driveTimeEstimate: '1 hr 45 min',
    directionsDestination: 'Anza-Borrego Desert State Park, Borrego Springs, CA 92004',
    suggestedStops: ['Borrego Palm Canyon', 'Metal sculptures loop'],
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Desert day trip — avoid midday heat, bring extra water.',
    whyDogsLoveIt: 'Wild desert smells and wide-open space to explore together.',
    bestTime: 'Spring wildflower season',
    energyLevel: 'Moderate',
    lat: 33.2558,
    lng: -116.375,
    featured: true,
    popularNow: false,
  },
  {
    id: 'idyllwild-day-trip',
    name: 'Idyllwild Mountain Village',
    city: 'Idyllwild',
    region: 'Julian / Mountain',
    category: 'Road trip',
    tags: ['road-trip', 'mountain', 'village'],
    distanceLabel: '98 mi',
    driveTimeEstimate: '1 hr 55 min',
    directionsDestination: 'Idyllwild, CA 92549',
    suggestedStops: ['Idyllwild Nature Center', 'Main Street village loop'],
    leashInfo: 'On-leash in town',
    dogFriendlyNotes: 'Alpine village day trip with forest trails and art galleries.',
    whyDogsLoveIt: 'Pine forest trails and a cozy mountain town to sniff around.',
    bestTime: 'Fall weekday',
    energyLevel: 'Moderate',
    lat: 33.7412,
    lng: -116.7189,
    featured: false,
    popularNow: false,
  },
  {
    id: 'laguna-coast-wilderness',
    name: 'Laguna Coast Wilderness Park',
    city: 'Laguna Beach',
    region: 'Orange County',
    category: 'Trail',
    tags: ['on-leash', 'coastal', 'oc'],
    distanceLabel: '76 mi',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'OC coastal canyon trails — limited shade, bring water.',
    whyDogsLoveIt: 'Dramatic canyon views and a coastal adventure outside SD.',
    bestTime: 'Cool morning',
    energyLevel: 'High',
    lat: 33.5812,
    lng: -117.7512,
    featured: false,
    popularNow: false,
  },
  {
    id: 'huntington-central-park',
    name: 'Huntington Central Park',
    city: 'Huntington Beach',
    region: 'Orange County',
    category: 'Park',
    tags: ['on-leash', 'large', 'oc'],
    distanceLabel: '90 mi',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Massive OC park with long flat paths — pair with dog beach visit.',
    whyDogsLoveIt: 'Shaded paths and a full OC day when combined with the beach.',
    bestTime: 'Morning before beach crowds',
    energyLevel: 'Moderate',
    lat: 33.7012,
    lng: -117.9912,
    featured: false,
    popularNow: false,
  },
  {
    id: 'carlsbad-village',
    name: 'Carlsbad Village Walk',
    city: 'Carlsbad',
    region: 'San Diego',
    category: 'Neighborhood',
    tags: ['on-leash', 'coastal', 'shops'],
    distanceLabel: '32 mi',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Walk State Street and the village grid down toward the pier area.',
    whyDogsLoveIt: 'Beach-town energy, ice cream stops, and ocean breeze.',
    bestTime: 'Sunday morning',
    energyLevel: 'Low',
    lat: 33.1581,
    lng: -117.3506,
    featured: false,
    popularNow: false,
  },
  {
    id: 'oceanside-harbor',
    name: 'Oceanside Harbor Walk',
    city: 'Oceanside',
    region: 'San Diego',
    category: 'Neighborhood',
    tags: ['on-leash', 'harbor', 'flat'],
    distanceLabel: '38 mi',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Flat harbor promenade with boats, fish smells, and sea lions nearby.',
    whyDogsLoveIt: 'Marine smells and a low-key coastal walk north of SD.',
    bestTime: 'Sunset',
    energyLevel: 'Low',
    lat: 33.2012,
    lng: -117.3912,
    featured: false,
    popularNow: false,
  },
  {
    id: 'temecula-patio-day-trip',
    name: 'Temecula Dog-Friendly Patio Day',
    city: 'Temecula',
    region: 'Julian / Mountain',
    category: 'Road trip',
    tags: ['road-trip', 'patio', 'wine-country'],
    distanceLabel: '58 mi',
    driveTimeEstimate: '1 hr',
    directionsDestination: 'Old Town Temecula, Temecula, CA 92590',
    suggestedStops: ['Old Town Front Street', 'Riverwalk path'],
    leashInfo: 'Patio dogs welcome',
    dogFriendlyNotes: 'Old Town Temecula patios and nearby walking paths — verify per venue.',
    whyDogsLoveIt: 'A grown-up day trip with patio time and new country air.',
    bestTime: 'Weekday lunch',
    energyLevel: 'Low',
    lat: 33.4936,
    lng: -117.1484,
    featured: false,
    popularNow: false,
  },
  {
    id: 'training-leash-manners',
    name: 'Leash manners loop',
    city: 'Near you',
    region: 'San Diego',
    category: 'Park',
    tags: ['training', 'activity', 'neighborhood'],
    distanceLabel: 'Anywhere',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Short neighborhood loop focused on loose-leash reps.',
    whyDogsLoveIt: 'Tiny training moments can become memories too.',
    bestTime: 'Before dinner',
    energyLevel: 'Low',
    featured: false,
    popularNow: false,
  },
  {
    id: 'training-confidence-walk',
    name: 'Confidence walk',
    city: 'Near you',
    region: 'San Diego',
    category: 'Park',
    tags: ['training', 'activity', 'confidence'],
    distanceLabel: 'Anywhere',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Low-pressure route with sniff breaks and praise.',
    whyDogsLoveIt: 'Build brave steps without turning it into a chore.',
    bestTime: 'Quiet morning',
    energyLevel: 'Low',
    featured: false,
    popularNow: false,
  },
  {
    id: 'training-recall-park',
    name: 'Recall practice at the park',
    city: 'Near you',
    region: 'San Diego',
    category: 'Dog Park',
    tags: ['training', 'activity', 'recall'],
    distanceLabel: 'Local park',
    leashInfo: 'Mixed',
    dogFriendlyNotes: 'Short recall games in a familiar fenced area.',
    whyDogsLoveIt: 'Playful reps that still feel like an outing.',
    bestTime: 'Off-peak hours',
    energyLevel: 'Moderate',
    featured: false,
    popularNow: false,
  },
  {
    id: 'training-calm-cafe',
    name: 'Calm cafe sit',
    city: 'Near you',
    region: 'San Diego',
    category: 'Coffee',
    tags: ['training', 'activity', 'cafe'],
    distanceLabel: 'Patio nearby',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Practice settle duration at a dog-friendly patio.',
    whyDogsLoveIt: 'Real-world calm in a place you already love.',
    bestTime: 'Mid-morning',
    energyLevel: 'Low',
    featured: false,
    popularNow: false,
  },
  {
    id: 'dark-horse-coffee',
    name: 'Dark Horse Coffee Roasters',
    city: 'San Diego',
    region: 'San Diego',
    category: 'Coffee',
    tags: ['patio', 'local', 'north-park'],
    distanceLabel: '3.8 mi',
    leashInfo: 'Patio dogs welcome',
    dogFriendlyNotes: 'North Park roastery with sidewalk tables and a relaxed patio vibe.',
    whyDogsLoveIt: 'Patio hangs, new smells, and a short walk through the neighborhood.',
    bestTime: 'Slow weekend morning',
    energyLevel: 'Low',
    lat: 32.7398,
    lng: -117.1294,
    featured: false,
    popularNow: false,
  },
  {
    id: 'training-puppy-basics',
    name: 'Puppy basics session',
    city: 'Near you',
    region: 'San Diego',
    category: 'Park',
    tags: ['training', 'activity', 'puppy'],
    distanceLabel: '15 min',
    leashInfo: 'On-leash',
    dogFriendlyNotes: 'Name game, touch, and gentle exposure in a soft loop.',
    whyDogsLoveIt: 'Small wins that add up to a confident pup.',
    bestTime: 'After breakfast',
    energyLevel: 'Low',
    featured: false,
    popularNow: false,
  },
]

const CATEGORY_IMAGE_TONE: Record<PlaceCategory, PlaceImageTone> = {
  Beach: 'coastal',
  Trail: 'forest',
  Coffee: 'urban',
  'Dog Park': 'park',
  Park: 'park',
  Patio: 'urban',
  Brewery: 'urban',
  Restaurant: 'urban',
  Lake: 'coastal',
  Campground: 'forest',
  'Scenic Spot': 'mountain',
  Gardens: 'park',
  'Road trip': 'mountain',
  Neighborhood: 'warm',
  Custom: 'warm',
}

function applyPlaceImages(place: Place): Place {
  return {
    ...place,
    imageTone: place.imageTone ?? CATEGORY_IMAGE_TONE[place.category],
    imageUrl:
      place.imageUrl ?? getSampleImageForPlace(place.category, place.id),
    imageAlt:
      place.imageAlt ?? `${place.name} — ${place.category.toLowerCase()} spot`,
  }
}

export const CUSTOM_ADVENTURE_PLACE_ID = 'custom-adventure'

export const NEIGHBORHOOD_WALK_PLACE_ID = 'neighborhood-walk'

const NEIGHBORHOOD_WALK_PLACE_RAW: Place = {
  id: NEIGHBORHOOD_WALK_PLACE_ID,
  name: 'Neighborhood Walk',
  city: 'Home',
  region: 'San Diego',
  category: 'Neighborhood',
  tags: ['neighborhood', 'everyday', 'walk'],
  distanceLabel: '0 mi',
  leashInfo: 'On-leash',
  dogFriendlyNotes: 'Your everyday loop — sniff stops, slow corners, and familiar routes.',
  whyDogsLoveIt: 'Around the neighborhood — the route they know by heart.',
  bestTime: 'Anytime',
  energyLevel: 'Low',
  featured: false,
  popularNow: false,
}

export const NEIGHBORHOOD_WALK_PLACE = applyPlaceImages(NEIGHBORHOOD_WALK_PLACE_RAW)

const CUSTOM_ADVENTURE_PLACE_RAW: Place = {
  id: CUSTOM_ADVENTURE_PLACE_ID,
  name: 'Custom adventure',
  city: 'Your adventures',
  region: 'San Diego',
  category: 'Custom',
  tags: ['custom', 'user-created'],
  distanceLabel: '—',
  leashInfo: 'Your outing',
  dogFriendlyNotes: 'Adventures you add yourself — golf, camping, brewery days, and more.',
  whyDogsLoveIt: 'Whatever you and your pack are up to.',
  bestTime: 'Anytime',
  energyLevel: 'Moderate',
  featured: false,
  popularNow: false,
}

export const CUSTOM_ADVENTURE_PLACE = applyPlaceImages(CUSTOM_ADVENTURE_PLACE_RAW)

const RAW_PLACES: Place[] = EXPANDED_LOCAL_PLACES

export const PLACES: Place[] = RAW_PLACES.map(applyPlaceImages)

export function getFeaturedPlaces(): Place[] {
  return sortPlacesForDisplay(PLACES.filter((place) => place.featured))
}

export function getPlacesByCategory(category: PlaceCategory): Place[] {
  return sortPlacesForDisplay(PLACES.filter((place) => place.category === category))
}

export function getPlacesByCity(city: string): Place[] {
  const normalizedCity = city.trim().toLowerCase()
  return sortPlacesForDisplay(
    PLACES.filter((place) => place.city.toLowerCase() === normalizedCity),
  )
}

export function searchPlaces(query: string): Place[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return []

  return sortPlacesForDisplay(
    PLACES.filter((place) =>
      [
        place.name,
        place.city,
        place.category,
        place.address,
        place.dogFriendlyNotes,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery)),
    ),
  )
}

export function isNeighborhoodWalkPlace(placeId: string | undefined): boolean {
  return placeId === NEIGHBORHOOD_WALK_PLACE_ID
}

const PLAN_CATEGORY_MAP: Record<string, PlaceCategory | null> = {
  all: null,
  beach: 'Beach',
  trail: 'Trail',
  coffee: 'Coffee',
  'dog-park': 'Dog Park',
  'road-trip': 'Scenic Spot',
  gardens: 'Park',
}

const ACTIVITY_CATEGORY_MAP: Record<string, PlaceCategory> = {
  beach: 'Beach',
  coffee: 'Coffee',
  trail: 'Trail',
  'road-trip': 'Scenic Spot',
  gardens: 'Park',
  neighborhood: 'Park',
  'dog-park': 'Dog Park',
  brewery: 'Brewery',
}

const CATEGORY_EMOJI: Record<PlaceCategory, string> = {
  Beach: '🏖️',
  Trail: '🌲',
  Coffee: '☕',
  'Dog Park': '🐕',
  Park: '🌳',
  Patio: '🍽️',
  Brewery: '🍺',
  Restaurant: '🍽️',
  Lake: '💧',
  Campground: '⛺',
  'Scenic Spot': '📍',
  Gardens: '🌸',
  'Road trip': '🚗',
  Neighborhood: '🏘️',
  Custom: '✨',
}

function regionShort(region: Place['region']): string {
  if (region === 'San Diego') return 'SD'
  if (region === 'Orange County') return 'OC'
  return 'Day trip'
}

export function getPlaceById(id: string): Place | undefined {
  if (id === NEIGHBORHOOD_WALK_PLACE_ID) return NEIGHBORHOOD_WALK_PLACE
  if (id === CUSTOM_ADVENTURE_PLACE_ID) return CUSTOM_ADVENTURE_PLACE
  return PLACES.find((place) => place.id === id)
}

export function getPlaceEmoji(category: PlaceCategory): string {
  return CATEGORY_EMOJI[category]
}

export function formatPlaceMeta(place: Place): string {
  return `${place.distanceLabel} · ${place.leashInfo} · ${regionShort(place.region)}`
}

export function formatHeroSubtitle(place: Place, dogs: Dog[] = []): string {
  return getHeroMagicSubtitle(place, dogs)
}

export function getHeroBadge(place: Place): string {
  if (place.popularNow) return '🔥 Popular now'
  if (place.featured) return '⭐ Featured'
  return ''
}

function sortPlacesForDisplay(places: Place[]): Place[] {
  return [...places].sort((a, b) => {
    if (a.popularNow !== b.popularNow) return a.popularNow ? -1 : 1
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return 0
  })
}

export function getPlacesForPlanCategory(
  categoryId: string,
  prefs?: RecommendationPrefs,
): Place[] {
  if (categoryId === 'training') {
    return sortPlacesForDisplay(PLACES.filter((place) => place.tags.includes('training')))
  }

  const category = PLAN_CATEGORY_MAP[categoryId]

  let places: Place[]
  if (category === null) {
    const featuredMix = PLACES.filter((place) => place.featured || place.popularNow)
    places = sortPlacesForDisplay(featuredMix)
  } else {
    places = sortPlacesForDisplay(PLACES.filter((place) => place.category === category))
  }

  if (!prefs) return places.slice(0, category === null ? 4 : places.length)

  const ranked = [...places].sort(
    (a, b) =>
      scorePlaceForProfile(b, prefs.vibeNames, prefs.categoryIds) -
      scorePlaceForProfile(a, prefs.vibeNames, prefs.categoryIds),
  )

  return category === null ? ranked.slice(0, 4) : ranked
}

export function getHeroPlace(activityId: string, prefs?: RecommendationPrefs): Place {
  const category = ACTIVITY_CATEGORY_MAP[activityId]
  const pool = category
    ? PLACES.filter((place) => place.category === category)
    : PLACES

  const rankPool = (items: Place[]) => {
    if (!prefs) return sortPlacesForDisplay(items)
    return [...items].sort(
      (a, b) =>
        scorePlaceForProfile(b, prefs.vibeNames, prefs.categoryIds) -
        scorePlaceForProfile(a, prefs.vibeNames, prefs.categoryIds),
    )
  }

  const highlighted = rankPool(pool.filter((place) => place.popularNow || place.featured))

  if (highlighted[0]) return highlighted[0]

  const fallback = rankPool(pool)
  if (fallback[0]) return fallback[0]

  return PLACES[0]
}

export function createJourneyEntryFromNeighborhoodWalk(
  dogs: Dog[],
  options: {
    photoUrls?: string[]
    durationLabel?: string
    recapLabels?: string[]
  } = {},
): JourneyEntry {
  const recapLabels = options.recapLabels ?? []
  const emotionalLine = buildEmotionalMemoryLine(recapLabels, dogs)
  const favoriteMoment = buildFavoriteMoment(recapLabels, dogs)
  const memoryMood =
    recapLabels.includes('Needed a slower pace') ? 'Calm + close' :
    recapLabels.includes('Loved every second') ? 'Joyful + tired' :
    'Warm + steady'

  return {
    id: `neighborhood-walk-${Date.now()}`,
    placeId: NEIGHBORHOOD_WALK_PLACE_ID,
    place: 'Neighborhood Walk',
    date: 'Today',
    occurredAt: new Date().toISOString(),
    magicLine: 'Around the neighborhood',
    tags: ['Neighborhood', 'Around the neighborhood', dogNamesLabel(dogs), 'Loved it'],
    photoUrls: options.photoUrls?.length ? options.photoUrls : undefined,
    durationLabel: options.durationLabel,
    recapLabels: recapLabels.length > 0 ? recapLabels : undefined,
    emotionalLine,
    favoriteMoment,
    memoryMood,
    dogTags: dogs.map(
      (dog) => `${dog.name} · ${dog.breed.split('·')[0]?.trim() ?? 'companion'}`,
    ),
  }
}

export function createJourneyEntryFromPlace(
  place: Place,
  dogs: Dog[],
  options: {
    photoUrls?: string[]
    durationLabel?: string
    recapLabels?: string[]
  } = {},
): JourneyEntry {
  const recapLabels = options.recapLabels ?? []
  const emotionalLine = buildEmotionalMemoryLine(recapLabels, dogs)
  const favoriteMoment = buildFavoriteMoment(recapLabels, dogs)
  const memoryMood =
    recapLabels.includes('Needed a slower pace') ? 'Calm + close' :
    recapLabels.includes('Loved every second') ? 'Joyful + tired' :
    'Warm + steady'

  return {
    id: `adventure-${place.id}-${Date.now()}`,
    placeId: place.id,
    place: place.name,
    date: 'Today',
    occurredAt: new Date().toISOString(),
    magicLine: getMagicLine(place),
    tags: [place.category, place.leashInfo, dogNamesLabel(dogs), 'Loved it'],
    photoUrls: options.photoUrls?.length ? options.photoUrls : undefined,
    durationLabel: options.durationLabel,
    recapLabels: recapLabels.length > 0 ? recapLabels : undefined,
    emotionalLine,
    favoriteMoment,
    memoryMood,
    dogTags: dogs.map(
      (dog) => `${dog.name} · ${dog.breed.split('·')[0]?.trim() ?? 'companion'}`,
    ),
  }
}

export function resolvePlaceFromLocation(location: string): Place {
  const exact = PLACES.find((place) => place.name === location)
  if (exact) return exact

  const partial = PLACES.find((place) =>
    location.toLowerCase().includes(place.name.split(',')[0]!.toLowerCase()),
  )
  if (partial) return partial

  return PLACES[0]
}

export function resolvePlaceFromAdventure(
  adventure: { placeId?: string; location: string },
): Place {
  if (adventure.placeId) {
    return getPlaceById(adventure.placeId) ?? resolvePlaceFromLocation(adventure.location)
  }

  return resolvePlaceFromLocation(adventure.location)
}
