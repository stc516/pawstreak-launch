# Phase 2 — Mapbox Implementation Plan

Phase 1 keeps the CSS terrain map in `PlanAdventureMap.tsx`. Phase 2 replaces it with Mapbox GL JS.

## Recommendation

Use **Mapbox GL JS** via **`react-map-gl`** (v7+). Fastest path to a shippable real map with pin ↔ card sync preserved.

Google Maps stays for **directions deep links** only (`src/lib/roadTrip.ts`). Leaflet deferred — would still need a paid tile provider for production quality.

## Dependencies

```bash
npm install mapbox-gl react-map-gl
npm install -D @types/mapbox-gl
```

## Environment

```env
VITE_MAPBOX_TOKEN=pk....
VITE_MAPBOX_STYLE_URL=mapbox://styles/...   # optional custom Stitch/heritage style
```

Restrict tokens by HTTP referrer (production + preview domains).

## Migration steps

### 1. Map helper (`src/lib/mapbox.ts`)

- Read token/style from `import.meta.env`
- Export `DEFAULT_MAP_STYLE`, `isMapboxConfigured()`
- Export `fitBoundsToPlaces(places: Place[])` helper

### 2. Replace `PlanAdventureMap.tsx`

Create `PlanMapView.tsx`:

- Center on user ZIP (geocode via Mapbox Geocoding API or existing `state.mapRegion` + zip)
- Render `<Marker>` per place from `getPlanNearbyPlaces()` / map props
- `onClick` marker → existing `onSelectPlace(placeId)` in `PlanScreen`
- `selectedPlaceId` → highlight marker + optional `flyTo`
- Hide default Mapbox attribution overflow on mobile; keep required attribution compact
- Match heritage card container (rounded map card, no default control chrome)

Preserve in `PlanScreen.tsx`:

- `selectedPlaceId` state
- `placeCardRefs` scroll-into-view on pin select
- ZIP apply → recenter map

### 3. Geocoding

- On `onApplyLocation`, geocode `state.zipCode` → `{ lat, lng }`
- Store in app state or derive from existing location profile
- Fallback: San Diego center when unsupported area

### 4. Journey map (Phase 2b)

Reuse `PlanMapView` pattern in `JourneyMapView.tsx`:

- Pins from `buildJourneyMapPins()` using real lat/lng from journey entries
- Memory preview on pin select (existing UX)

### 5. QA

- Update `qa/map-polish-verification.mjs` for `.mapboxgl-map` presence
- Pin tap → card scroll regression
- iPhone 13 viewport shell guard (`npm run qa:shell-guard`)
- PWA build precache size check

## Cost / ops

- Mapbox free tier: ~50k map loads/month (sufficient for launch)
- Monitor usage in Mapbox dashboard
- Style updates ship via style URL (no app redeploy if using hosted style)

## Files touched (Phase 2)

| Action | File |
|---|---|
| New | `src/components/PlanMapView.tsx`, `src/lib/mapbox.ts` |
| Replace/refactor | `src/components/PlanAdventureMap.tsx` |
| Edit | `src/screens/app/PlanScreen.tsx`, `package.json`, `.env.example` |
| Optional | `src/screens/overlays/JourneyMapView.tsx` |
| QA | `qa/map-polish-verification.mjs`, `qa/phase1-product-honesty.mjs` (map section) |

## Out of scope for Mapbox phase

- Calendar integration
- Community map layers
- Offline tile packs (PWA uses network map)
