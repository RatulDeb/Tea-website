export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      className={className}
      src="/images/cha-ghor-logo.png"
      alt=""
      width="96"
      height="96"
      aria-hidden="true"
      draggable={false}
    />
  )
}
