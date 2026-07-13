import type { Dog } from '../data/demo'

export type DogAdventureSceneState = 'ready' | 'adventuring' | 'memory' | 'evening'

interface DogAdventureSceneProps {
  dog?: Dog
  packLabel: string
  state: DogAdventureSceneState
  memoryPhotoUrl?: string
}

const SCENE_COPY: Record<DogAdventureSceneState, { eyebrow: string; title: string; detail: string }> = {
  ready: {
    eyebrow: 'Today is waiting',
    title: 'Where will those paws take you?',
    detail: 'Choose one good thing to do together.',
  },
  adventuring: {
    eyebrow: 'Adventure in progress',
    title: 'The story is happening now',
    detail: 'Capture one little thing you will want to remember.',
  },
  memory: {
    eyebrow: 'Today has a story',
    title: 'One more day worth keeping',
    detail: 'Your latest adventure is now part of the journey.',
  },
  evening: {
    eyebrow: 'There is still time',
    title: 'One last little adventure?',
    detail: 'A ten-minute sniff around the block counts.',
  },
}

export function DogAdventureScene({
  dog,
  packLabel,
  state,
  memoryPhotoUrl,
}: DogAdventureSceneProps) {
  const copy = SCENE_COPY[state]
  const dogName = dog?.name ?? packLabel

  return (
    <section className={`dog-adventure-scene dog-adventure-scene--${state}`} aria-label={`${dogName}'s day`}>
      {memoryPhotoUrl ? (
        <img src={memoryPhotoUrl} alt="" className="dog-adventure-scene-memory" />
      ) : null}
      <svg
        className="dog-adventure-world"
        viewBox="0 0 420 286"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="paw-scene-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--scene-sky-top)" />
            <stop offset=".72" stopColor="var(--scene-sky-bottom)" />
          </linearGradient>
          <linearGradient id="paw-scene-field" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--scene-field-light)" />
            <stop offset="1" stopColor="var(--scene-field-dark)" />
          </linearGradient>
          <linearGradient id="paw-scene-path" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6e7bd" stopOpacity=".78" />
            <stop offset="1" stopColor="#d9bd7f" stopOpacity=".94" />
          </linearGradient>
          <radialGradient id="paw-scene-glow">
            <stop offset="0" stopColor="#fff8c9" stopOpacity=".95" />
            <stop offset="1" stopColor="#ffe7a4" stopOpacity="0" />
          </radialGradient>
          <filter id="paw-scene-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        <rect width="420" height="286" fill="url(#paw-scene-sky)" />
        <circle className="dog-world-sun-glow" cx="354" cy="57" r="50" fill="url(#paw-scene-glow)" />
        <circle className="dog-world-sun" cx="354" cy="57" r="21" fill="#ffed9b" />

        <g className="dog-world-cloud dog-world-cloud--one" fill="#fff" opacity=".72">
          <ellipse cx="62" cy="51" rx="30" ry="10" />
          <circle cx="48" cy="46" r="12" />
          <circle cx="67" cy="42" r="15" />
          <circle cx="84" cy="48" r="10" />
        </g>
        <g className="dog-world-cloud dog-world-cloud--two" fill="#fff" opacity=".48">
          <ellipse cx="262" cy="87" rx="22" ry="7" />
          <circle cx="251" cy="83" r="9" />
          <circle cx="267" cy="80" r="11" />
        </g>

        <g className="dog-world-birds" fill="none" stroke="#294638" strokeLinecap="round" strokeWidth="1.5" opacity=".55">
          <path d="M118 72q6-6 12 0q6-6 12 0" />
          <path d="M151 58q4-4 8 0q4-4 8 0" />
        </g>

        <path d="M0 164C52 119 99 127 143 151c35 19 67 2 100-24 42-33 96-24 177 28v70H0z" fill="var(--scene-mountain)" opacity=".52" />
        <path d="M0 188c61-45 108-34 151-10 43 23 73 4 110-18 48-28 102-16 159 17v109H0z" fill="var(--scene-hill)" />

        <g className="dog-world-trees" fill="#355f49" opacity=".82">
          <g className="dog-world-tree"><path d="M22 184l15-40 15 40zM25 168l12-34 12 34z" /><rect x="34" y="177" width="6" height="22" rx="2" /></g>
          <g className="dog-world-tree"><path d="M74 174l13-34 13 34zM77 160l10-29 10 29z" /><rect x="84" y="168" width="5" height="20" rx="2" /></g>
          <g className="dog-world-tree"><path d="M306 174l13-38 14 38zM309 157l10-30 11 30z" /><rect x="316" y="168" width="6" height="23" rx="2" /></g>
          <g className="dog-world-tree"><path d="M383 190l14-42 15 42zM386 171l11-33 12 33z" /><rect x="394" y="181" width="6" height="23" rx="2" /></g>
        </g>

        <path d="M0 220c65-28 124-26 181-4 58 22 104 17 146-5 35-19 66-17 93-5v80H0z" fill="url(#paw-scene-field)" />
        <path d="M232 286c-8-35-10-64 2-92 8-18 20-29 34-40-7 17-11 31-8 46 5 29 31 53 48 86z" fill="url(#paw-scene-path)" opacity=".9" />
        <path d="M0 252c78-18 126-4 179 13 57 18 113 17 159-1 31-12 59-13 82-8v30H0z" fill="#315c45" opacity=".55" />

        <g className="dog-world-grass" stroke="#244c38" strokeLinecap="round" opacity=".72">
          <path d="M18 270l-5-14m5 14 4-17m-4 17 11-10M90 278l-4-15m4 15 6-18m-6 18 11-11M338 270l-4-17m4 17 7-20m-7 20 12-12M397 280l-6-16m6 16 4-20" />
        </g>
        <g className="dog-world-fireflies" fill="#fff5a9" filter="url(#paw-scene-soft)">
          <circle cx="113" cy="196" r="3" /><circle cx="286" cy="181" r="2.5" /><circle cx="372" cy="218" r="2" />
        </g>
        <g className="dog-world-flowers">
          <circle cx="53" cy="236" r="2.5" fill="#fff4de" /><circle cx="59" cy="231" r="2" fill="#f08b62" />
          <circle cx="329" cy="241" r="2.5" fill="#fff4de" /><circle cx="334" cy="236" r="2" fill="#f08b62" />
        </g>
      </svg>

      <div className="dog-adventure-character">
        <div className="dog-adventure-avatar">
          {dog?.photoUrl ? (
            <img src={dog.photoUrl} alt={`${dog.name}, ready for an adventure`} />
          ) : (
            <span aria-label={dog ? `${dog.name} avatar` : 'Dog avatar'}>
              {dog?.profileEmoji ?? '🐕'}
            </span>
          )}
        </div>
        <span className="dog-adventure-bandana" aria-hidden="true" />
        <span className="dog-adventure-name">{dogName}</span>
      </div>

      <div className="dog-adventure-copy">
        <span>{copy.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p>{copy.detail}</p>
      </div>
    </section>
  )
}
