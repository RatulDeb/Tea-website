import { useEffect, useRef, useState } from 'react'
import { Check, Plus } from 'lucide-react'
import {
  getSalePriceCents,
  SALE_RATE,
  type TeaProduct,
} from '../data/products'
import { useCart } from '../hooks/useCart'
import { formatDiscount, formatMoney } from '../lib/money'
import { TeaImage } from './TeaImage'

interface ProductCardProps {
  product: TeaProduct
  onViewDetails: (product: TeaProduct) => void
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const timerRef = useRef<number | null>(null)
  const saleCents = getSalePriceCents(product.originalPriceCents)
  const categoryLabel =
    product.category === 'Herbal' ? 'Herbal infusion' : product.category

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  function handleAdd() {
    addItem(product.id)
    setAdded(true)
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setAdded(false), 2000)
  }

  return (
    <article className="product-card">
      <div className="product-media">
        <TeaImage src={product.image} alt={product.imageAlt} className="card-image" />
        <span className="badge badge-sale">{formatDiscount(SALE_RATE)}</span>
        <span className={`badge badge-category${product.category === 'Herbal' ? ' badge-herbal' : ''}`}>
          {categoryLabel}
        </span>
      </div>

      <div className="product-body">
        <div className="product-heading">
          <h3>{product.name}</h3>
          <p className="product-variety">{product.variety}</p>
        </div>
        <p className="product-flavor">{product.flavor}</p>
        <p className="product-meta">
          <span>{product.size}</span>
          <span aria-hidden="true">·</span>
          <span>{product.caffeine}</span>
        </p>

        <div className="price-block">
          <del className="price-was">
            <span className="sr-only">Original price </span>
            {formatMoney(product.originalPriceCents)}
          </del>
          <span className="price-now">
            <span className="sr-only">Sale price </span>
            {formatMoney(saleCents)}
          </span>
          <span className="price-unit">per {product.size}</span>
        </div>

        <div className="card-actions">
          <button
            type="button"
            className={`btn btn-primary btn-add${added ? ' is-added' : ''}`}
            onClick={handleAdd}
          >
            {added ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
            <span aria-hidden="true">{added ? 'Added' : 'Add to Cart'}</span>
            <span className="sr-only">
              {added
                ? `${product.name} added to cart`
                : `Add to Cart for ${product.name}`}
            </span>
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => onViewDetails(product)}
          >
            <span aria-hidden="true">View Details</span>
            <span className="sr-only">View Details for {product.name}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
