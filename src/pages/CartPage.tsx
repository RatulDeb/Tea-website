import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react'
import { QuantityStepper } from '../components/QuantityStepper'
import { TeaImage } from '../components/TeaImage'
import { siteConfig } from '../data/site'
import { useCart } from '../hooks/useCart'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatMoney } from '../lib/money'

export function CartPage() {
  usePageTitle('Your cart')
  const {
    items,
    count,
    subtotalCents,
    savingsCents,
    shippingCents,
    totalCents,
    freeShippingRemainingCents,
    qualifiesForFreeShipping,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart()

  if (items.length === 0) {
    return (
      <section className="section shell narrow">
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">
            <ShoppingBag />
          </span>
          <p className="eyebrow">Your cart</p>
          <h1>Your cart is empty</h1>
          <p>
            The kettle is ready when you are. Browse twenty teas and infusions,
            then add a pouch or two to begin.
          </p>
          <div className="empty-actions">
            <Link className="btn btn-primary btn-large" to="/">
              Shop teas
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link className="btn btn-secondary btn-large" to="/teas">
              Read the tea guide
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const progressPercent = Math.min(
    100,
    Math.round(
      (subtotalCents / siteConfig.shipping.freeThresholdCents) * 100,
    ),
  )

  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="page-heading-row">
            <div>
              <p className="eyebrow">Your selection</p>
              <h1>Your cart</h1>
              <p className="page-subtitle">
                {count} {count === 1 ? 'item' : 'items'} · 20% launch pricing is
                already included in every price.
              </p>
            </div>
            <Link className="text-link" to="/">
              <ArrowRight aria-hidden="true" className="flip-icon" />
              Continue shopping
            </Link>
          </div>
        </div>
      </section>

      <section className="section cart-section">
        <div className="shell cart-layout">
          <div>
            <div className="cart-list-heading">
              <h2>Items</h2>
              <button type="button" className="text-button" onClick={clearCart}>
                Clear cart
              </button>
            </div>
            <ul className="cart-lines" aria-live="polite">
              {items.map((item) => (
                <li className="cart-line" key={`${item.product.id}-${item.grams}`}>
                  <TeaImage
                    src={item.product.image}
                    alt={item.product.imageAlt}
                    className="cart-thumb"
                    priority
                  />
                  <div className="cart-line-info">
                    <p className="cart-line-category">{item.product.category}</p>
                    <h3>{item.product.name}</h3>
                    <p className="cart-line-variety">{item.product.variety}</p>
                    <p className="cart-line-size">{item.sizeLabel} pouch</p>
                    <div className="cart-unit-price">
                      <span>{formatMoney(item.unitSaleCents)} each</span>
                      <del>
                        <span className="sr-only">Original unit price </span>
                        {formatMoney(item.unitOriginalCents)}
                      </del>
                    </div>
                  </div>
                  <div className="cart-line-controls">
                    <QuantityStepper
                      quantity={item.quantity}
                      productName={`${item.product.name} (${item.sizeLabel})`}
                      onChange={(quantity) =>
                        updateQuantity(item.product.id, item.grams, quantity)
                      }
                      compact
                    />
                    <button
                      type="button"
                      className="icon-text-button remove-button"
                      onClick={() => removeItem(item.product.id, item.grams)}
                    >
                      <Trash2 aria-hidden="true" />
                      Remove
                      <span className="sr-only">
                        {' '}
                        {item.product.name} ({item.sizeLabel})
                      </span>
                    </button>
                  </div>
                  <div className="cart-line-total">
                    <span className="sr-only">Line total </span>
                    {formatMoney(item.lineSaleCents)}
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-assurance">
              <p>
                <Leaf aria-hidden="true" />
                Every pouch is packed to order, from a 250 g pouch up to 5 kg.
              </p>
              <p>
                <ShieldCheck aria-hidden="true" />
                This is a demo cart. It is saved on this device and no payment
                will be taken.
              </p>
            </div>
          </div>

          <aside className="summary-card" aria-labelledby="cart-summary-heading">
            <div className="summary-heading">
              <h2 id="cart-summary-heading">Order summary</h2>
              <span className="count-pill">{count}</span>
            </div>

            <div className="shipping-progress">
              <p className="shipping-progress-label">
                <Truck aria-hidden="true" />
                {qualifiesForFreeShipping
                  ? 'Free shipping unlocked'
                  : `Add ${formatMoney(freeShippingRemainingCents)} for free shipping`}
              </p>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Progress toward free shipping"
                aria-valuemin={0}
                aria-valuemax={siteConfig.shipping.freeThresholdCents}
                aria-valuenow={subtotalCents}
                aria-valuetext={
                  qualifiesForFreeShipping
                    ? 'Free shipping unlocked'
                    : `${formatMoney(freeShippingRemainingCents)} away from free shipping`
                }
              >
                <span style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <dl className="summary-list">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatMoney(subtotalCents)}</dd>
              </div>
              <div className="savings-row">
                <dt>Launch savings (20% off)</dt>
                <dd>
                  <span className="sr-only">You save </span>−
                  {formatMoney(savingsCents)}
                </dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd>
                  {shippingCents === 0 ? (
                    <>
                      <span className="free-shipping">Free</span>
                      <span className="sr-only"> shipping</span>
                    </>
                  ) : (
                    formatMoney(shippingCents)
                  )}
                </dd>
              </div>
              <div className="summary-total">
                <dt>Total</dt>
                <dd>{formatMoney(totalCents)}</dd>
              </div>
            </dl>

            <p className="summary-note">
              Free shipping on orders{' '}
              {formatMoney(siteConfig.shipping.freeThresholdCents)}+. Otherwise a
              flat {formatMoney(siteConfig.shipping.flatRateCents)}. No tax or
              extra charges are added in this demo.
            </p>
            <p className="summary-note summary-note-strong">
              The 20% launch discount is already in the prices above — it is not
              applied a second time.
            </p>

            <Link className="btn btn-primary btn-large summary-cta" to="/checkout">
              Proceed to checkout
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link className="summary-continue" to="/teas">
              Or explore our teas &amp; services
            </Link>
          </aside>
        </div>
      </section>
    </>
  )
}

