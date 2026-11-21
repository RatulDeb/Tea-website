import { useEffect, useState } from 'react'

const SCENES = [
  {
    id: 'sreemangal',
    name: 'Sreemangal',
    image: 'https://images.unsplash.com/photo-1595971295024-551fb19f20b3?q=80&w=2070&auto=format&fit=crop',
    alt: 'Lush tea gardens of Sreemangal',
  },
  {
    id: 'sylhet',
    name: 'Sylhet',
    image: 'https://images.unsplash.com/photo-1621274403997-37aae1848b40?q=80&w=2071&auto=format&fit=crop',
    alt: 'Rolling tea estates of Sylhet',
  },
  {
    id: 'estate-dusk',
    name: 'Twilight Garden',
    image: 'https://images.unsplash.com/photo-1582894543167-27361b72ad6c?q=80&w=2070&auto=format&fit=crop',
    alt: 'Tea estate during twilight',
  }
]

export function HeroBackdrop() {
  const [currentScene, setCurrentScene] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % SCENES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="hero-backdrop" aria-hidden="true">
      <div className="hero-scenes">
        {SCENES.map((scene, index) => (
          <div
            key={scene.id}
            className={`hero-scene-layer ${index === currentScene ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${scene.image})`,
            }}
            role="img"
            aria-label={scene.alt}
          />
        ))}
      </div>

      {/* Blend overlay with original SVG elements for depth */}
      <div className="hero-overlay-blend" />

      <svg
        className="hero-hills-overlay"
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          className="hero-hill hero-hill-far"
          d="M0,300 C160,250 320,240 480,270 C640,300 800,250 960,250 C1120,250 1280,280 1440,270 L1440,600 L0,600 Z"
        />
        <path
          className="hero-hill hero-hill-mid"
          d="M0,360 C160,320 320,330 480,360 C640,390 800,340 960,350 C1120,360 1280,330 1440,350 L1440,600 L0,600 Z"
        />
        <g className="hero-terraces">
          <path d="M-40,492 C240,462 520,512 780,492 C1040,472 1240,512 1480,492" />
          <path d="M-40,516 C240,488 520,536 780,516 C1040,496 1240,536 1480,516" />
        </g>
      </svg>

      <div className="hero-mist hero-mist-a" />
      <div className="hero-mist hero-mist-b" />
      <div className="hero-haze" />

      {/* Location tag indicator for extra aesthetic */}
      <div className="hero-location-tag">
        <span className="location-dot" />
        <span className="location-name">{SCENES[currentScene].name}, Bangladesh</span>
      </div>
    </div>
  )
}
