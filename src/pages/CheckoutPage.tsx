import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Info,
  LoaderCircle,
  Mail,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react'
import { TeaImage } from '../components/TeaImage'
import { siteConfig } from '../data/site'
import { useCart } from '../hooks/useCart'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatMoney } from '../lib/money'

interface CheckoutFields {
  fullName: string
  email: string
  address1: string
  address2: string
  city: string
  postalCode: string
  country: string
}

type FieldName = keyof CheckoutFields
type FieldErrors = Partial<Record<FieldName, string>>

const countries = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'New Zealand',
  'Ireland',
  'Germany',
  'France',
  'Netherlands',
  'Sweden',
  'Norway',
  'Denmark',
  'Japan',
  'Singapore',
  'India',
  'Other',
]

const requiredFields: Exclude<FieldName, 'address2'>[] = [
  'fullName',
  'email',
  'address1',
  'city',
  'postalCode',
  'country',
]

const fieldIds: Record<FieldName, string> = {
  fullName: 'checkout-full-name',
  email: 'checkout-email',
  address1: 'checkout-address1',
  address2: 'checkout-address2',
  city: 'checkout-city',
  postalCode: 'checkout-postal-code',
  country: 'checkout-country',
}

const initialFields: CheckoutFields = {
  fullName: '',
  email: '',
  address1: '',
  address2: '',
  city: '',
  postalCode: '',
  country: '',
}

interface OrderLine {
  id: string
  name: string
  variety: string
  size: string
  quantity: number
  unitSaleCents: number
  lineSaleCents: number
  image: string
  imageAlt: string
}

interface OrderConfirmation {
  orderNumber: string
  placedAt: string
  customer: CheckoutFields
  lines: OrderLine[]
  count: number
  subtotalCents: number
  savingsCents: number
  shippingCents: number
  totalCents: number
}

function validateField(name: FieldName, value: string): string | undefined {
  const trimmed = value.trim()
  switch (name) {
    case 'fullName':
      return trimmed ? undefined : 'Please enter the name for this order.'
    case 'email':
      if (!trimmed) return 'Please enter your email address.'
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
        ? undefined
        : 'Enter a valid email address, such as name@example.com.'
    case 'address1':
      return trimmed ? undefined : 'Please enter a street address.'
    case 'city':
      return trimmed ? undefined : 'Please enter a city or town.'
    case 'postalCode':
      return trimmed ? undefined : 'Please enter a postal code.'
    case 'country':
      return trimmed ? undefined : 'Please choose a country.'
    case 'address2':
      return undefined
  }
}

function validateAll(fields: CheckoutFields): FieldErrors {
  const nextErrors: FieldErrors = {}
  for (const name of requiredFields) {
    const error = validateField(name, fields[name])
    if (error) nextErrors[name] = error
  }
  return nextErrors
}

function createOrderNumber(): string {
  const suffix = Math.floor(100000 + Math.random() * 900000)
  return `LK-${new Date().getFullYear()}-${suffix}`
}

export function CheckoutPage() {
  const {
    items,
    count,
    subtotalCents,
    savingsCents,
    shippingCents,
    totalCents,
    clearCart,
  } = useCart()
  const [fields, setFields] = useState<CheckoutFields>(initialFields)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [order, setOrder] = useState<OrderConfirmation | null>(null)
  const confirmationHeadingRef = useRef<HTMLHeadingElement>(null)

  usePageTitle(order ? 'Order confirmation' : 'Demo checkout')

  useEffect(() => {
    if (order) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      confirmationHeadingRef.current?.focus({ preventScroll: true })
    }
  }, [order])

  const errorCount = Object.values(errors).filter(Boolean).length

  function updateField(name: FieldName, value: string) {
    setFields((current) => ({ ...current, [name]: value }))
    if (errors[name]) {
      setErrors((current) => {
        const next = { ...current }
        const error = validateField(name, value)
        if (error) next[name] = error
        else delete next[name]
        return next
      })
    }
  }

  function handleBlur(name: FieldName) {
    setErrors((current) => {
      const next = { ...current }
      const error = validateField(name, fields[name])
      if (error) next[name] = error
      else delete next[name]
      return next
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (processing) return
    const nextErrors = validateAll(fields)
    setErrors(nextErrors)
    setSubmitAttempted(true)

    const firstError = requiredFields.find((name) => nextErrors[name])
    if (firstError) {
      requestAnimationFrame(() => {
        document.getElementById(fieldIds[firstError])?.focus()
      })
      return
    }

    setProcessing(true)
    await new Promise((resolve) => window.setTimeout(resolve, 900))

    const nextOrder: OrderConfirmation = {
      orderNumber: createOrderNumber(),
      placedAt: new Date().toLocaleString(siteConfig.locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      customer: { ...fields },
      lines: items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        variety: item.product.variety,
        size: item.product.size,
        quantity: item.quantity,
        unitSaleCents: item.unitSaleCents,
        lineSaleCents: item.lineSaleCents,
        image: item.product.image,
        imageAlt: item.product.imageAlt,
      })),
      count,
      subtotalCents,
      savingsCents,
      shippingCents,
      totalCents,
    }

    clearCart()
    setOrder(nextOrder)
    setProcessing(false)
  }

  if (order) {
    const firstName = order.customer.fullName.trim().split(/\s+/)[0] || 'tea lover'
    const addressLines = [
      order.customer.address1,
      order.customer.address2,
      `${order.customer.city}, ${order.customer.postalCode}`,
      order.customer.country,
    ].filter(Boolean)

    return (
      <section className="section confirmation-page">
        <div className="shell narrow">
          <div className="confirmation-card">
            <span className="confirmation-icon" aria-hidden="true">
              <CheckCircle2 />
            </span>
            <p className="eyebrow">Demo order confirmed</p>
            <h1 tabIndex={-1} ref={confirmationHeadingRef}>
              Thank you, {firstName}.
            </h1>
            <p className="confirmation-lede">
              Your demonstration order is complete. The cart has been cleared and
              a sample order number has been created for this demo.
            </p>

            <div className="order-number-box">
              <span>Sample order number</span>
              <strong>{order.orderNumber}</strong>
              <span className="order-meta">
                {order.placedAt} · {order.count} {order.count === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div className="confirmation-grid">
              <section aria-labelledby="confirmation-summary-heading">
                <h2 id="confirmation-summary-heading">Order summary</h2>
                <ul className="confirmation-lines">
                  {order.lines.map((line) => (
                    <li key={line.id}>
                      <TeaImage
                        src={line.image}
                        alt={line.imageAlt}
                        className="confirmation-thumb"
                        priority
                      />
                      <div>
                        <p className="confirmation-line-name">{line.name}</p>
                        <p className="confirmation-line-meta">
                          {line.variety} · {line.size} · Qty {line.quantity}
                        </p>
                      </div>
                      <span>{formatMoney(line.lineSaleCents)}</span>
                    </li>
                  ))}
                </ul>

                <dl className="summary-list confirmation-totals">
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{formatMoney(order.subtotalCents)}</dd>
                  </div>
                  <div className="savings-row">
                    <dt>Launch savings</dt>
                    <dd>−{formatMoney(order.savingsCents)}</dd>
                  </div>
                  <div>
                    <dt>Shipping</dt>
                    <dd>
                      {order.shippingCents === 0
                        ? 'Free'
                        : formatMoney(order.shippingCents)}
                    </dd>
                  </div>
                  <div className="summary-total">
                    <dt>Total</dt>
                    <dd>{formatMoney(order.totalCents)}</dd>
                  </div>
                </dl>
              </section>

              <section aria-labelledby="confirmation-delivery-heading">
                <h2 id="confirmation-delivery-heading">Delivery details</h2>
                <div className="confirmation-address">
                  <MapPin aria-hidden="true" />
                  <address>
                    <strong>{order.customer.fullName}</strong>
                    {addressLines.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </address>
                </div>
                <div className="confirmation-contact">
                  <Mail aria-hidden="true" />
                  <div>
                    <span>Contact email</span>
                    <strong>{order.customer.email}</strong>
                  </div>
                </div>
                <div className="confirmation-note">
                  <Info aria-hidden="true" />
                  <p>
                    This is a demonstration order. No payment was taken and no
                    email has been sent. Keep the sample order number for
                    reference.
                  </p>
                </div>
              </section>
            </div>

            <div className="confirmation-actions">
              <Link className="btn btn-primary btn-large" to="/">
                Continue shopping
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link className="btn btn-secondary btn-large" to="/teas">
                Explore the tea guide
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className="section shell narrow">
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">
            <ShoppingBag />
          </span>
          <p className="eyebrow">Demo checkout</p>
          <h1>Your cart is empty</h1>
          <p>
            Add a tea or two before heading to checkout. Your cart will be waiting
            when you return.
          </p>
          <Link className="btn btn-primary btn-large" to="/">
            Shop teas
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <Link className="back-link" to="/cart">
            <ArrowLeft aria-hidden="true" />
            Back to cart
          </Link>
          <div className="page-heading-row">
            <div>
              <p className="eyebrow">Demo checkout</p>
              <h1>Checkout</h1>
              <p className="page-subtitle">
                No real payment details are needed. Review your order, add a
                shipping address, and place a demonstration order.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section checkout-section">
        <div className="shell checkout-layout">
          <div className="checkout-main">
            <div className="demo-banner" role="note">
              <ShieldCheck aria-hidden="true" />
              <div>
                <strong>This is a demonstration checkout.</strong>
                <p>{siteConfig.demoNotes.checkout}</p>
              </div>
            </div>

            <form className="checkout-form" onSubmit={handleSubmit} noValidate aria-busy={processing}>
              {submitAttempted && errorCount > 0 ? (
                <div className="form-alert" role="alert">
                  <AlertCircle aria-hidden="true" />
                  <p>
                    Please check the highlighted {errorCount === 1 ? 'field' : 'fields'}{' '}
                    below before placing your demo order.
                  </p>
                </div>
              ) : null}

              <fieldset className="form-section">
                <legend>Contact details</legend>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor={fieldIds.fullName}>
                      Full name <span className="required-mark" aria-hidden="true">*</span>
                      <span className="sr-only"> required</span>
                    </label>
                    <input
                      id={fieldIds.fullName}
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      value={fields.fullName}
                      onChange={(event) => updateField('fullName', event.target.value)}
                      onBlur={() => handleBlur('fullName')}
                      aria-invalid={Boolean(errors.fullName)}
                      aria-describedby={
                        errors.fullName ? `${fieldIds.fullName}-error` : undefined
                      }
                      required
                    />
                    {errors.fullName ? (
                      <p className="field-error" id={`${fieldIds.fullName}-error`}>
                        {errors.fullName}
                      </p>
                    ) : null}
                  </div>

                  <div className="field">
                    <label htmlFor={fieldIds.email}>
                      Email address <span className="required-mark" aria-hidden="true">*</span>
                      <span className="sr-only"> required</span>
                    </label>
                    <input
                      id={fieldIds.email}
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={fields.email}
                      onChange={(event) => updateField('email', event.target.value)}
                      onBlur={() => handleBlur('email')}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={
                        errors.email ? `${fieldIds.email}-error` : undefined
                      }
                      required
                    />
                    {errors.email ? (
                      <p className="field-error" id={`${fieldIds.email}-error`}>
                        {errors.email}
                      </p>
                    ) : null}
                  </div>
                </div>
              </fieldset>

              <fieldset className="form-section">
                <legend>Shipping address</legend>
                <div className="form-grid">
                  <div className="field field-full">
                    <label htmlFor={fieldIds.address1}>
                      Street address <span className="required-mark" aria-hidden="true">*</span>
                      <span className="sr-only"> required</span>
                    </label>
                    <input
                      id={fieldIds.address1}
                      name="address1"
                      type="text"
                      autoComplete="address-line1"
                      value={fields.address1}
                      onChange={(event) => updateField('address1', event.target.value)}
                      onBlur={() => handleBlur('address1')}
                      aria-invalid={Boolean(errors.address1)}
                      aria-describedby={
                        errors.address1 ? `${fieldIds.address1}-error` : undefined
                      }
                      required
                    />
                    {errors.address1 ? (
                      <p className="field-error" id={`${fieldIds.address1}-error`}>
                        {errors.address1}
                      </p>
                    ) : null}
                  </div>

                  <div className="field field-full">
                    <label htmlFor={fieldIds.address2}>
                      Apartment, suite, etc. <span className="optional-mark">(optional)</span>
                    </label>
                    <input
                      id={fieldIds.address2}
                      name="address2"
                      type="text"
                      autoComplete="address-line2"
                      value={fields.address2}
                      onChange={(event) => updateField('address2', event.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor={fieldIds.city}>
                      City or town <span className="required-mark" aria-hidden="true">*</span>
                      <span className="sr-only"> required</span>
                    </label>
                    <input
                      id={fieldIds.city}
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      value={fields.city}
                      onChange={(event) => updateField('city', event.target.value)}
                      onBlur={() => handleBlur('city')}
                      aria-invalid={Boolean(errors.city)}
                      aria-describedby={
                        errors.city ? `${fieldIds.city}-error` : undefined
                      }
                      required
                    />
                    {errors.city ? (
                      <p className="field-error" id={`${fieldIds.city}-error`}>
                        {errors.city}
                      </p>
                    ) : null}
                  </div>

                  <div className="field">
                    <label htmlFor={fieldIds.postalCode}>
                      Postal code <span className="required-mark" aria-hidden="true">*</span>
                      <span className="sr-only"> required</span>
                    </label>
                    <input
                      id={fieldIds.postalCode}
                      name="postalCode"
                      type="text"
                      autoComplete="postal-code"
                      value={fields.postalCode}
                      onChange={(event) => updateField('postalCode', event.target.value)}
                      onBlur={() => handleBlur('postalCode')}
                      aria-invalid={Boolean(errors.postalCode)}
                      aria-describedby={
                        errors.postalCode ? `${fieldIds.postalCode}-error` : undefined
                      }
                      required
                    />
                    {errors.postalCode ? (
                      <p className="field-error" id={`${fieldIds.postalCode}-error`}>
                        {errors.postalCode}
                      </p>
                    ) : null}
                  </div>

                  <div className="field field-full">
                    <label htmlFor={fieldIds.country}>
                      Country <span className="required-mark" aria-hidden="true">*</span>
                      <span className="sr-only"> required</span>
                    </label>
                    <select
                      id={fieldIds.country}
                      name="country"
                      autoComplete="country-name"
                      value={fields.country}
                      onChange={(event) => updateField('country', event.target.value)}
                      onBlur={() => handleBlur('country')}
                      aria-invalid={Boolean(errors.country)}
                      aria-describedby={
                        errors.country ? `${fieldIds.country}-error` : undefined
                      }
                      required
                    >
                      <option value="">Choose a country</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    {errors.country ? (
                      <p className="field-error" id={`${fieldIds.country}-error`}>
                        {errors.country}
                      </p>
                    ) : null}
                  </div>
                </div>
              </fieldset>

              <fieldset className="form-section">
                <legend>Payment</legend>
                <label className="payment-option">
                  <input type="radio" name="payment" value="demo" defaultChecked />
                  <span className="payment-icon" aria-hidden="true">
                    <CreditCard />
                  </span>
                  <span className="payment-copy">
                    <strong>Demo payment</strong>
                    <small>
                      No card details required. No money will be charged.
                    </small>
                  </span>
                  <span className="payment-check" aria-hidden="true">
                    <ShieldCheck />
                  </span>
                </label>
                <p className="payment-note">
                  This option exists to demonstrate the checkout flow only. There
                  are no card fields, no payment processor, and no charge.
                </p>
              </fieldset>

              <div className="checkout-submit">
                <button
                  type="submit"
                  className="btn btn-primary btn-large"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <LoaderCircle className="spin" aria-hidden="true" />
                      Placing demo order…
                    </>
                  ) : (
                    <>
                      Place demo order · {formatMoney(totalCents)}
                      <ArrowRight aria-hidden="true" />
                    </>
                  )}
                </button>
                <p>
                  By placing this order you confirm it is a demonstration. No real
                  payment information is collected.
                </p>
              </div>
            </form>
          </div>

          <aside className="checkout-summary" aria-labelledby="checkout-summary-heading">
            <div className="summary-heading">
              <h2 id="checkout-summary-heading">Order summary</h2>
              <Link className="text-button" to="/cart">
                Edit cart
              </Link>
            </div>

            <ul className="checkout-items">
              {items.map((item) => (
                <li key={item.product.id}>
                  <TeaImage
                    src={item.product.image}
                    alt={item.product.imageAlt}
                    className="checkout-thumb"
                    priority
                  />
                  <div className="checkout-item-info">
                    <p className="checkout-item-name">{item.product.name}</p>
                    <p className="checkout-item-meta">
                      {item.product.size} · Qty {item.quantity}
                    </p>
                    <p className="checkout-item-unit">
                      {formatMoney(item.unitSaleCents)} each
                    </p>
                  </div>
                  <span className="checkout-item-total">
                    {formatMoney(item.lineSaleCents)}
                  </span>
                </li>
              ))}
            </ul>

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
              <Truck aria-hidden="true" /> Free shipping on orders{' '}
              {formatMoney(siteConfig.shipping.freeThresholdCents)}+. Otherwise a
              flat {formatMoney(siteConfig.shipping.flatRateCents)}. No tax or
              extra charges are added in this demo.
            </p>
            <p className="summary-note summary-note-strong">
              The 20% launch discount is already included in the prices above.
            </p>
          </aside>
        </div>
      </section>
    </>
  )
}

