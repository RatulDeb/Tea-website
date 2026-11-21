export function HeroBackdrop() {
  return (
    <div className="hero-backdrop" aria-hidden="true">
      <div className="hero-sky" />
      <div className="hero-sun" />
      <svg
        className="hero-hills"
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
        <path
          className="hero-hill hero-hill-near"
          d="M0,440 C180,410 360,432 540,452 C720,472 900,430 1080,440 C1260,450 1380,432 1440,440 L1440,600 L0,600 Z"
        />
        <g className="hero-terraces">
          <path d="M-40,492 C240,462 520,512 780,492 C1040,472 1240,512 1480,492" />
          <path d="M-40,516 C240,488 520,536 780,516 C1040,496 1240,536 1480,516" />
          <path d="M-40,540 C240,514 520,560 780,540 C1040,520 1240,560 1480,540" />
          <path d="M-40,564 C240,540 520,584 780,564 C1040,544 1240,584 1480,564" />
          <path d="M-40,588 C240,566 520,606 780,588 C1040,570 1240,606 1480,588" />
        </g>
      </svg>
      <div className="hero-mist hero-mist-a" />
      <div className="hero-mist hero-mist-b" />
      <div className="hero-haze" />
    </div>
  )
}
