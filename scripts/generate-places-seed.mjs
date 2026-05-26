/**
 * Generates supabase/seed/places.sql from src/data/places.ts
 * Run: node scripts/generate-places-seed.mjs
 */
import { writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const { PLACES } = await import(
  pathToFileURL(path.join(root, 'src/data/places.ts')).href
)

function sqlString(value) {
  if (value === undefined || value === null) return 'null'
  return `'${String(value).replace(/'/g, "''")}'`
}

function sqlArray(values) {
  if (!values?.length) return "'{}'"
  const items = values.map((v) => `"${String(v).replace(/"/g, '\\"')}"`).join(',')
  return `'{${items}}'`
}

const rows = PLACES.map((place) => {
  return `(
  ${sqlString(place.id)},
  ${sqlString(place.name)},
  ${sqlString(place.city)},
  ${sqlString(place.region)},
  ${sqlString(place.category)},
  ${sqlArray(place.tags)},
  ${sqlString(place.distanceLabel)},
  ${sqlString(place.leashInfo)},
  ${sqlString(place.dogFriendlyNotes)},
  ${sqlString(place.whyDogsLoveIt)},
  ${sqlString(place.bestTime)},
  ${sqlString(place.energyLevel)},
  ${sqlString(place.addressLabel ?? null)},
  ${place.lat ?? 'null'},
  ${place.lng ?? 'null'},
  ${place.featured ? 'true' : 'false'},
  ${place.popularNow ? 'true' : 'false'},
  ${sqlString(place.imageUrl ?? null)},
  ${sqlString(place.imageAlt ?? null)},
  ${sqlString(place.imageTone ?? null)},
  true
)`
})

const sql = `-- Generated from src/data/places.ts — ${PLACES.length} places
-- Run after 004_places.sql

insert into public.places (
  id, name, city, region, category, tags,
  distance_label, leash_info, dog_friendly_notes, why_dogs_love_it, best_time,
  energy_level, address_label, lat, lng, featured, popular_now,
  image_url, image_alt, image_tone, is_active
) values
${rows.join(',\n')}
on conflict (id) do update set
  name = excluded.name,
  city = excluded.city,
  region = excluded.region,
  category = excluded.category,
  tags = excluded.tags,
  distance_label = excluded.distance_label,
  leash_info = excluded.leash_info,
  dog_friendly_notes = excluded.dog_friendly_notes,
  why_dogs_love_it = excluded.why_dogs_love_it,
  best_time = excluded.best_time,
  energy_level = excluded.energy_level,
  address_label = excluded.address_label,
  lat = excluded.lat,
  lng = excluded.lng,
  featured = excluded.featured,
  popular_now = excluded.popular_now,
  image_url = excluded.image_url,
  image_alt = excluded.image_alt,
  image_tone = excluded.image_tone,
  is_active = excluded.is_active;
`

writeFileSync(path.join(root, 'supabase/seed/places.sql'), sql)
console.log(`Wrote ${PLACES.length} places to supabase/seed/places.sql`)
