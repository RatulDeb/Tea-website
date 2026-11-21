export function HeroBackdrop() {
  return (
    <div className="hero-backdrop" aria-hidden="true">
      <div
        className="hero-image-bg"
        style={{
          backgroundImage: `url("/images/sreemangal tea garden picture.jpg")`,
        }}
        role="img"
        aria-label="Sreemangal tea garden landscape"
      />
      <div className="hero-image-overlay" />
    </div>
  )
}
