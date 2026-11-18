import { useState } from 'react'
import { Leaf } from 'lucide-react'

interface TeaImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
}

export function TeaImage({ src, alt, className, priority = false }: TeaImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  return (
    <div className={`tea-image${className ? ` ${className}` : ''} is-${status}`}>
      {status === 'error' ? (
        <div className="image-fallback" role="img" aria-label={alt}>
          <Leaf aria-hidden="true" />
          <span>Image unavailable</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
      {status === 'loading' ? (
        <span className="image-skeleton" aria-hidden="true" />
      ) : null}
    </div>
  )
}
