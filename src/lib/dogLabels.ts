import type { Dog } from '../data/demo'

export function isDefaultDemoDogs(dogs: Dog[]): boolean {
  return (
    dogs.length === 2 &&
    dogs[0]?.id === 'bailey' &&
    dogs[1]?.id === 'omi'
  )
}

export function getDogDisplayName(dogs: Dog[], index = 0): string {
  if (dogs.length === 0) return 'your dog'
  return dogs[index]?.name ?? dogs[0].name
}

export function getPackDisplayName(dogs: Dog[]): string {
  if (dogs.length === 0) return 'your pack'
  if (dogs.length === 1) return dogs[0].name
  if (dogs.length === 2) return `${dogs[0].name} + ${dogs[1].name}`
  return 'your pack'
}

export function getDogPossessive(dogs: Dog[]): string {
  if (dogs.length === 0) return "your dog's"
  if (dogs.length === 1) return `${dogs[0].name}'s`
  return `${getPackDisplayName(dogs)}'s`
}

export function getDogCountLabel(dogs: Dog[]): string {
  if (dogs.length === 0) return 'your pup'
  if (dogs.length === 1) return dogs[0].name
  return getPackDisplayName(dogs)
}

export function getAdventureDogLabel(dogs: Dog[]): string {
  if (dogs.length === 0) return 'this adventure'
  if (dogs.length === 1) return dogs[0].name
  return getPackDisplayName(dogs)
}

export function dogNamesLabel(dogs: Dog[]): string {
  return getPackDisplayName(dogs)
}

export function dogPossessiveLabel(dogs: Dog[]): string {
  return getDogPossessive(dogs)
}

export function personalizeGhostText(text: string, dogs: Dog[]): string {
  if (dogs.length === 0) {
    return text
      .replace(/Bailey \+ Omi/g, 'your pack')
      .replace(/Both dogs/g, 'They')
      .replace(/both dogs/g, 'they')
      .replace(/Bailey/g, 'Your dog')
      .replace(/Omi/g, 'your pup')
      .replace(/an Omi-paced/g, 'a slower-paced')
      .replace(/Omi-paced/g, 'slower-paced')
  }

  if (dogs.length === 1) {
    const name = dogs[0].name
    return text
      .replace(/Bailey \+ Omi/g, name)
      .replace(/Both dogs/g, name)
      .replace(/both dogs/g, name)
      .replace(/Bailey/g, name)
      .replace(/Omi/g, name)
      .replace(/an Omi-paced/g, `a ${name}-paced`)
      .replace(/Omi-paced/g, `${name}-paced`)
  }

  const pack = getPackDisplayName(dogs)
  const lead = dogs[0].name
  const support = dogs[1]?.name ?? 'your pup'

  return text
    .replace(/Bailey \+ Omi/g, pack)
    .replace(/Both dogs/g, pack)
    .replace(/both dogs/g, 'they')
    .replace(/Bailey/g, lead)
    .replace(/Omi/g, support)
    .replace(/an Omi-paced/g, `a ${support}-paced`)
    .replace(/Omi-paced/g, `${support}-paced`)
}
