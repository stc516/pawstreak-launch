export interface AdventurePackIdea {
  id: string
  title: string
  prompt: string
  duration: string
  setting: string
  action: 'quick-walk' | 'custom'
}

export interface AdventurePack {
  id: string
  title: string
  subtitle: string
  price: 'free'
  ideas: AdventurePackIdea[]
}

export const BETTER_DOG_DAYS_STARTER_PACK: AdventurePack = {
  id: 'better-dog-days-starter',
  title: '30 Better Dog Days',
  subtitle: 'Thirty low-pressure ways to make today feel different.',
  price: 'free',
  ideas: [
    { id: 'new-block', title: 'The New Block', prompt: 'Turn one street earlier than usual and let your dog investigate a new block.', duration: '15–25 min', setting: 'Neighborhood', action: 'quick-walk' },
    { id: 'sniffari', title: 'Sniffari', prompt: 'Let your dog choose the pace and spend the walk following interesting smells.', duration: '15 min', setting: 'Anywhere outdoors', action: 'quick-walk' },
    { id: 'sunset-loop', title: 'Sunset Loop', prompt: 'Pick a familiar route at golden hour and stop for one memory photo.', duration: '20–30 min', setting: 'Neighborhood or park', action: 'custom' },
    { id: 'park-bench', title: 'Park Bench Pause', prompt: 'Walk to a bench, settle together, and quietly watch the world for five minutes.', duration: '20 min', setting: 'Park', action: 'custom' },
    { id: 'treat-trail', title: 'Tiny Treat Trail', prompt: 'Hide a few treats in safe, easy spots and let your dog search with their nose.', duration: '10 min', setting: 'Home or yard', action: 'custom' },
    { id: 'photo-mission', title: 'One Great Photo', prompt: 'Visit a colorful or scenic spot and capture one photo worth saving.', duration: '20–40 min', setting: 'Anywhere', action: 'custom' },
    { id: 'quiet-trail', title: 'Quiet Trail Time', prompt: 'Choose an easy path and reward calm check-ins along the way.', duration: '30–60 min', setting: 'Trail', action: 'custom' },
    { id: 'rainy-window', title: 'Rainy-Day Window Watch', prompt: 'Make a cozy lookout and reward calm observation of the rainy world outside.', duration: '10 min', setting: 'Indoors', action: 'custom' },
    { id: 'favorite-place', title: 'Their Favorite Place', prompt: 'Return to a place your dog already loves and let them lead the familiar ritual.', duration: '30 min', setting: 'Favorite spot', action: 'custom' },
    { id: 'slow-morning', title: 'Slow Morning Walk', prompt: 'Leave the phone away and take the first walk without rushing the sniff stops.', duration: '20 min', setting: 'Neighborhood', action: 'quick-walk' },
    { id: 'find-water', title: 'Find the Water', prompt: 'Plan a safe outing near a fountain, creek, lake view, or beach access.', duration: '30–90 min', setting: 'Waterfront', action: 'custom' },
    { id: 'new-toy', title: 'New-to-Them Toy', prompt: 'Rotate in a forgotten toy and spend ten focused minutes playing together.', duration: '10 min', setting: 'Home', action: 'custom' },
    { id: 'cafe-practice', title: 'Calm Patio Practice', prompt: 'Choose a genuinely dog-friendly patio and practice a short, relaxed settle.', duration: '20–40 min', setting: 'Dog-friendly patio', action: 'custom' },
    { id: 'three-turns', title: 'Three Dog-Chosen Turns', prompt: 'At three safe corners, let your dog choose which direction the walk goes.', duration: '20 min', setting: 'Neighborhood', action: 'quick-walk' },
    { id: 'texture-walk', title: 'Texture Walk', prompt: 'Notice safe grass, soil, pavement, leaves, and other surfaces under their paws.', duration: '20 min', setting: 'Park or neighborhood', action: 'custom' },
    { id: 'backyard-camp', title: 'Backyard Campout', prompt: 'Bring a blanket outside and share a quiet evening sniff-and-listen session.', duration: '20–45 min', setting: 'Yard or balcony', action: 'custom' },
    { id: 'mini-road-trip', title: 'Mini Road Trip', prompt: 'Drive to a nearby place you have not walked before and keep the outing easy.', duration: '45–90 min', setting: 'Nearby destination', action: 'custom' },
    { id: 'hide-and-seek', title: 'Treat Hide-and-Seek', prompt: 'Hide easy treats around one room and cheer on a calm search.', duration: '10 min', setting: 'Indoors', action: 'custom' },
    { id: 'friend-walk', title: 'Walk With a Friend', prompt: 'Invite a compatible dog-and-human pair for a parallel walk with plenty of space.', duration: '30 min', setting: 'Wide path', action: 'custom' },
    { id: 'picnic', title: 'Dog-Day Picnic', prompt: 'Pack water, your dog’s usual treats, and a blanket for a short outdoor pause.', duration: '30–60 min', setting: 'Park', action: 'custom' },
    { id: 'nosework-boxes', title: 'Cardboard Nosework', prompt: 'Place treats in a few open boxes and supervise an easy search game.', duration: '10 min', setting: 'Indoors', action: 'custom' },
    { id: 'early-park', title: 'Early Park Visit', prompt: 'Try a familiar park at a quieter time and enjoy the extra space.', duration: '30 min', setting: 'Park', action: 'custom' },
    { id: 'sound-check', title: 'Listen Together', prompt: 'Pause in a comfortable spot and notice birds, breezes, and distant neighborhood sounds.', duration: '10–15 min', setting: 'Quiet outdoor spot', action: 'custom' },
    { id: 'short-and-sweet', title: 'Short and Sweet', prompt: 'Take a no-pressure loop where turning home early is completely fine.', duration: '10 min', setting: 'Neighborhood', action: 'quick-walk' },
    { id: 'garden-stroll', title: 'Garden Stroll', prompt: 'Find a dog-permitted garden area or leafy street and make the walk about smells.', duration: '20–40 min', setting: 'Green space', action: 'custom' },
    { id: 'blanket-settle', title: 'Blanket Settle', prompt: 'Bring a familiar blanket somewhere calm and reward relaxed time beside you.', duration: '15 min', setting: 'Home, yard, or park', action: 'custom' },
    { id: 'memory-remake', title: 'Remake a Favorite Memory', prompt: 'Revisit one saved PawStreak adventure and notice what feels different today.', duration: '30–60 min', setting: 'A past favorite', action: 'custom' },
    { id: 'sunrise-sniffs', title: 'Sunrise Sniffs', prompt: 'Start a little earlier and give your dog an unrushed first look at the day.', duration: '20 min', setting: 'Neighborhood', action: 'quick-walk' },
    { id: 'choose-adventure', title: 'Pick From the Map', prompt: 'Choose one honest nearby PawStreak suggestion you have never tried.', duration: '30–90 min', setting: 'Nearby', action: 'custom' },
    { id: 'celebration-lap', title: 'Celebration Lap', prompt: 'Finish the pack with a favorite route, a photo, and an extra-long sniff stop.', duration: '30 min', setting: 'Favorite route', action: 'custom' },
  ],
}

export function getDailyStarterPackIndex(date = new Date()): number {
  const dayNumber = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000)
  return Math.abs(dayNumber) % BETTER_DOG_DAYS_STARTER_PACK.ideas.length
}
