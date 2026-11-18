import { useEffect, useId, useRef } from 'react'
import { CheckCircle2, Leaf, ShoppingBag, X } from 'lucide-react'
import {
  getSalePriceCents,
  SALE_RATE,
  type TeaProduct,
} from '../data/products'
import { useCart } from '../hooks/useCart'
import { formatDiscount, formatMoney } from '../lib/money'
import { TeaImage } from './TeaImage'

interface ProductModalProps {
  product: TeaProduct
  onClose: () => void
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const { addItem, quantityFor } = useCart()
  const saleCents = getSalePriceCents(product.originalPriceCents)
  const savingsCents = product.originalPriceCents - saleCents
  const inCart = quantityFor(product.id)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    return () => {
      document.body.style.overflow = previousOverflow
      if (dialog.open) dialog.close()
    }
  }, [])

  function handleAdd() {
    addItem(product.id)
    dialogRef.current?.close()
  }

  return (
    <dialog
      ref={dialogRef}
      className="product-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close()
      }}
    >
      <div className="dialog-panel">
        <button
          type="button"
          className="dialog-close"
          onClick={() => dialogRef.current?.close()}
          aria-label="Close product details"
          autoFocus
        >
          <X aria-hidden="true" />
        </button>

        <div className="modal-media">
          <TeaImage src={product.image} alt={product.imageAlt} priority />
          <span className="badge badge-sale modal-badge">
            {formatDiscount(SALE_RATE)}
          </span>
        </div>

        <div className="modal-content">
          <p className="eyebrow">
            {product.category === 'Herbal' ? 'Herbal infusion' : `${product.category} tea`} ·{' '}
            {product.size}
          </p>
          <h2 id={titleId}>{product.name}</h2>
          <p className="modal-variety">{product.variety}</p>
          <p id={descriptionId} className="modal-description">
            {product.description}
          </p>

          <div className="modal-price-row">
            <div className="price-block">
              <del className="price-was">
                <span className="sr-only">Original price </span>
                {formatMoney(product.originalPriceCents)}
              </del>
              <span className="price-now">
                <span className="sr-only">Sale price </span>
                {formatMoney(saleCents)}
              </span>
            </div>
            <span className="save-pill">You save {formatMoney(savingsCents)}</span>
          </div>

          <ul className="tasting-notes" aria-label="Tasting notes">
            {product.tastingNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>

          {product.category === 'Herbal' ? (
            <p className="type-note">
              <Leaf aria-hidden="true" />
              Herbal infusion — caffeine-free and not made from the tea plant.
            </p>
          ) : (
            <p className="type-note">
              <Leaf aria-hidden="true" />
              Made from Camellia sinensis · {product.caffeine.toLowerCase()}.
            </p>
          )}

          <dl className="modal-details">
            <div>
              <dt>Ingredients</dt>
              <dd>{product.ingredients}</dd>
            </div>
            <div>
              <dt>Origin</dt>
              <dd>{product.origin}</dd>
            </div>
            <div>
              <dt>Caffeine</dt>
              <dd>{product.caffeine}</dd>
            </div>
            <div>
              <dt>Package</dt>
              <dd>{product.size} resealable pouch</dd>
            </div>
          </dl>

          <div className="brewing-panel">
            <h3>How to brew</h3>
            <dl>
              <div>
                <dt>Leaf</dt>
                <dd>{product.brewing.amount}</dd>
              </div>
              <div>
                <dt>Water</dt>
                <dd>{product.brewing.water}</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>{product.brewing.time}</dd>
              </div>
            </dl>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-primary" onClick={handleAdd}>
              <ShoppingBag aria-hidden="true" />
              Add to Cart · {formatMoney(saleCents)}
            </button>
            {inCart > 0 ? (
              <p className="in-cart-note">
                <CheckCircle2 aria-hidden="true" />
                {inCart} already in your cart
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </dialog>
  )
}
