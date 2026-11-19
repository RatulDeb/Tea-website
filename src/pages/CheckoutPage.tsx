import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle2,
  CreditCard,
  Info,
  LoaderCircle,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react'
import { TeaImage } from '../components/TeaImage'
import { siteConfig } from '../data/site'
import { useCart } from '../hooks/useCart'
import { usePageTitle } from '../hooks/usePageTitle'
import { telHref } from '../lib/contact'
import { formatMoney } from '../lib/money'
import {
  createOrderNumber,
  formatOrderDate,
  notifyNewOrder,
  placeOrder,
  type OrderItem,
  type PaymentStatus,
} from '../lib/orders'

interface CheckoutFields {
  fullName: string
  email: string
  phone: string
  address1: string
  address2: string
  city: string
  postalCode: string
  country: string
}

type FieldName = keyof CheckoutFields
type FieldErrors = Partial<Record<FieldName, string>>

const countries = [
  'Bangladesh',
  'India',
  'Pakistan',
  'Nepal',
  'Sri Lanka',
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
  'Other',
]

const requiredFields: Exclude<FieldName, 'address2'>[] = [
  'fullName',
  'email',
  'phone',
  'address1',
  'city',
  'postalCode',
  'country',
]

const fieldIds: Record<FieldName, string> = {
  fullName: 'checkout-full-name',
  email: 'checkout-email',
  phone: 'checkout-phone',
  address1: 'checkout-address1',
  address2: 'checkout-address2',
  city: 'checkout-city',
  postalCode: 'checkout-postal-code',
  country: 'checkout-country',
}

const initialFields: CheckoutFields = {
  fullName: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  postalCode: '',
  country: '',
}

interface PaymentFields {
  cardName: string
  cardNumber: string
  cardExpiry: string
  cardCvc: string
}

type PaymentFieldName = keyof PaymentFields
type PaymentErrors = Partial<Record<PaymentFieldName, string>>
type PaymentMethod = 'card' | 'cod'

const initialPayment: PaymentFields = {
  cardName: '',
  cardNumber: '',
  cardExpiry: '',
  cardCvc: '',
}

const paymentFieldIds: Record<PaymentFieldName, string> = {
  cardName: 'checkout-card-name',
  cardNumber: 'checkout-card-number',
  cardExpiry: 'checkout-card-expiry',
  cardCvc: 'checkout-card-cvc',
}

const paymentFieldOrder: PaymentFieldName[] = [
  'cardName',
  'cardNumber',
  'cardExpiry',
  'cardCvc',
]

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 19)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function formatCvc(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4)
}

function validatePaymentField(
  name: PaymentFieldName,
  value: string,
): string | undefined {
  const trimmed = value.trim()
  switch (name) {
    case 'cardName':
      return trimmed ? undefined : 'Enter the name printed on the card.'
    case 'cardNumber': {
      if (!trimmed) return 'Enter a card number.'
      const digits = trimmed.replace(/\s+/g, '')
      return /^\d{13,19}$/.test(digits)
        ? undefined
        : 'Enter a valid card number (13–19 digits).'
    }
    case 'cardExpiry': {
      if (!trimmed) return 'Enter the expiry date.'
      const match = /^(\d{2})\/(\d{2})$/.exec(trimmed)
      if (!match) return 'Use MM/YY, for example 12/29.'
      const month = Number(match[1])
      const year = 2000 + Number(match[2])
      if (month < 1 || month > 12) return 'Enter a month between 01 and 12.'
      const expiryEnd = new Date(year, month, 1)
      return expiryEnd <= new Date() ? 'This card has expired.' : undefined
    }
    case 'cardCvc':
      return /^\d{3,4}$/.test(trimmed)
        ? undefined
        : 'Enter the 3–4 digit security code.'
  }
}

interface OrderConfirmation {
  orderNumber: string
  placedAt: string
  customer: CheckoutFields
  lines: OrderItem[]
  count: number
  subtotalCents: number
  savingsCents: number
  shippingCents: number
  totalCents: number
  paymentLabel: string
  cardLast4?: string
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
    case 'phone':
      if (!trimmed) return 'Please enter a phone number for delivery.'
      return /^\+?[\d][\d\s()-]{5,19}$/.test(trimmed)
        ? undefined
        : 'Enter a phone number we can use for delivery.'
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [payment, setPayment] = useState<PaymentFields>(initialPayment)
  const [paymentErrors, setPaymentErrors] = useState<PaymentErrors>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [order, setOrder] = useState<OrderConfirmation | null>(null)
  const [persisted, setPersisted] = useState(false)
  const confirmationHeadingRef = useRef<HTMLHeadingElement>(null)

  usePageTitle(order ? 'Order confirmation' : 'Demo checkout')

  useEffect(() => {
    if (order) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      confirmationHeadingRef.current?.focus({ preventScroll: true })
    }
  }, [order])

  const errorCount =
    Object.values(errors).filter(Boolean).length +
    (paymentMethod === 'card'
      ? Object.values(paymentErrors).filter(Boolean).length
      : 0)

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

  function updatePaymentField(name: PaymentFieldName, value: string) {
    const formatted =
      name === 'cardNumber'
        ? formatCardNumber(value)
        : name === 'cardExpiry'
          ? formatExpiry(value)
          : name === 'cardCvc'
            ? formatCvc(value)
            : value
    setPayment((current) => ({ ...current, [name]: formatted }))
    if (paymentErrors[name]) {
      setPaymentErrors((current) => {
        const next = { ...current }
        const error = validatePaymentField(name, formatted)
        if (error) next[name] = error
        else delete next[name]
        return next
      })
    }
  }

  function handlePaymentBlur(name: PaymentFieldName) {
    setPaymentErrors((current) => {
      const next = { ...current }
      const error = validatePaymentField(name, payment[name])
      if (error) next[name] = error
      else delete next[name]
      return next
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (processing) return
    const nextErrors = validateAll(fields)
    const nextPaymentErrors: PaymentErrors = {}
    if (paymentMethod === 'card') {
      for (const name of paymentFieldOrder) {
        const error = validatePaymentField(name, payment[name])
        if (error) nextPaymentErrors[name] = error
      }
    }
    setErrors(nextErrors)
    setPaymentErrors(nextPaymentErrors)
    setSubmitAttempted(true)

    const firstError = requiredFields.find((name) => nextErrors[name])
    if (firstError) {
      requestAnimationFrame(() => {
        document.getElementById(fieldIds[firstError])?.focus()
      })
      return
    }

    const firstPaymentError =
      paymentMethod === 'card'
        ? paymentFieldOrder.find((name) => nextPaymentErrors[name])
        : undefined
    if (firstPaymentError) {
      requestAnimationFrame(() => {
        document.getElementById(paymentFieldIds[firstPaymentError])?.focus()
      })
      return
    }

    setProcessing(true)
    setSubmitError(null)

    const customer: CheckoutFields = {
      fullName: fields.fullName.trim(),
      email: fields.email.trim(),
      phone: fields.phone.trim(),
      address1: fields.address1.trim(),
      address2: fields.address2.trim(),
      city: fields.city.trim(),
      postalCode: fields.postalCode.trim(),
      country: fields.country.trim(),
    }
    const orderItems: OrderItem[] = items.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      variety: item.product.variety,
      size: item.sizeLabel,
      quantity: item.quantity,
      unitSaleCents: item.unitSaleCents,
      lineSaleCents: item.lineSaleCents,
      image: item.product.image,
      imageAlt: item.product.imageAlt,
    }))
    const paymentStatus: PaymentStatus =
      paymentMethod === 'card' ? 'paid' : 'unpaid'
    const cardLast4 =
      paymentMethod === 'card'
        ? payment.cardNumber.replace(/\D/g, '').slice(-4) || undefined
        : undefined

    try {
      const result = await placeOrder({
        orderNumber: createOrderNumber(),
        customer,
        items: orderItems,
        count,
        subtotalCents,
        savingsCents,
        shippingCents,
        totalCents,
        paymentMethod,
        paymentStatus,
        cardLast4,
      })

      if (!result.order) {
        setSubmitError(
          result.error ??
            'We could not save your order. Please try again, or contact us by phone.',
        )
        setProcessing(false)
        return
      }

      if (result.persisted) {
        void notifyNewOrder(result.order.id)
      }

      const nextOrder: OrderConfirmation = {
        orderNumber: result.order.orderNumber,
        placedAt: formatOrderDate(result.order.createdAt),
        customer,
        lines: result.order.items,
        count: result.order.count,
        subtotalCents: result.order.subtotalCents,
        savingsCents: result.order.savingsCents,
        shippingCents: result.order.shippingCents,
        totalCents: result.order.totalCents,
        paymentLabel:
          paymentMethod === 'card'
            ? 'Card — test mode'
            : 'Pay on delivery — demo',
        cardLast4: result.order.cardLast4 ?? undefined,
      }

      clearCart()
      setPersisted(result.persisted)
      setOrder(nextOrder)
      setProcessing(false)
    } catch {
      setSubmitError(
        'We could not save your order. Please check your connection and try again, or contact us by phone.',
      )
      setProcessing(false)
    }
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
            <p className="eyebrow">
              {persisted ? 'Order received' : 'Demo order confirmed'}
            </p>
            <h1 tabIndex={-1} ref={confirmationHeadingRef}>
              Thank you, {firstName}.
            </h1>
            <p className="confirmation-lede">
              {persisted
                ? 'Your order is in and saved for the shop. We will confirm it with you by phone or email shortly.'
                : 'Your demonstration order is complete. The cart has been cleared and a sample order number has been created for this demo.'}
            </p>

            <div className="order-number-box">
              <span>{persisted ? 'Order number' : 'Sample order number'}</span>
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
                    <li key={`${line.productId}-${line.size}`}>
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
                <div className="confirmation-contact">
                  <Phone aria-hidden="true" />
                  <div>
                    <span>Delivery phone</span>
                    <strong>
                      <a href={telHref(order.customer.phone)}>
                        {order.customer.phone}
                      </a>
                    </strong>
                  </div>
                </div>
                <div className="confirmation-contact">
                  <CreditCard aria-hidden="true" />
                  <div>
                    <span>Payment</span>
                    <strong>
                      {order.paymentLabel}
                      {order.cardLast4 ? ` ···· ${order.cardLast4}` : ''}
                    </strong>
                  </div>
                </div>
                <div className="confirmation-note">
                  <Info aria-hidden="true" />
                  <p>
                    {persisted
                      ? 'Your order has been recorded for the shop. This demo checkout does not charge a real card; the shop will confirm payment and delivery with you directly.'
                      : 'This is a demonstration order. No payment was taken and no email has been sent. Keep the sample order number for reference.'}
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
                Review your order, add a shipping address, and complete payment in
                test mode. No real money is charged.
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

                  <div className="field field-full">
                    <label htmlFor={fieldIds.phone}>
                      Phone number <span className="required-mark" aria-hidden="true">*</span>
                      <span className="sr-only"> required</span>
                    </label>
                    <input
                      id={fieldIds.phone}
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+880 1XXX-XXXXXX"
                      value={fields.phone}
                      onChange={(event) => updateField('phone', event.target.value)}
                      onBlur={() => handleBlur('phone')}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={
                        errors.phone ? `${fieldIds.phone}-error` : undefined
                      }
                      required
                    />
                    {errors.phone ? (
                      <p className="field-error" id={`${fieldIds.phone}-error`}>
                        {errors.phone}
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
                <div className="payment-methods">
                  <label
                    className={`payment-option${paymentMethod === 'card' ? ' selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                    />
                    <span className="payment-icon" aria-hidden="true">
                      <CreditCard />
                    </span>
                    <span className="payment-copy">
                      <strong>Card — test gateway</strong>
                      <small>Secure test mode. No real money is charged.</small>
                    </span>
                    <span className="payment-check" aria-hidden="true">
                      <ShieldCheck />
                    </span>
                  </label>

                  <label
                    className={`payment-option${paymentMethod === 'cod' ? ' selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <span className="payment-icon" aria-hidden="true">
                      <Banknote />
                    </span>
                    <span className="payment-copy">
                      <strong>Pay on delivery</strong>
                      <small>Demo option — no cash is ever collected.</small>
                    </span>
                    <span className="payment-check" aria-hidden="true">
                      <CheckCircle2 />
                    </span>
                  </label>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="card-panel">
                    <div className="test-mode-note">
                      <Lock aria-hidden="true" />
                      <p>
                        <strong>Test mode.</strong> Use card{' '}
                        <code>4242 4242 4242 4242</code>, any future expiry, and
                        any 3-digit code. Nothing is charged and card details are
                        never stored.
                      </p>
                    </div>

                    <div className="form-grid">
                      <div className="field field-full">
                        <label htmlFor={paymentFieldIds.cardName}>
                          Name on card{' '}
                          <span className="required-mark" aria-hidden="true">*</span>
                          <span className="sr-only"> required</span>
                        </label>
                        <input
                          id={paymentFieldIds.cardName}
                          name="cardName"
                          type="text"
                          autoComplete="cc-name"
                          value={payment.cardName}
                          onChange={(event) =>
                            updatePaymentField('cardName', event.target.value)
                          }
                          onBlur={() => handlePaymentBlur('cardName')}
                          aria-invalid={Boolean(paymentErrors.cardName)}
                          aria-describedby={
                            paymentErrors.cardName
                              ? `${paymentFieldIds.cardName}-error`
                              : undefined
                          }
                          required
                        />
                        {paymentErrors.cardName ? (
                          <p
                            className="field-error"
                            id={`${paymentFieldIds.cardName}-error`}
                          >
                            {paymentErrors.cardName}
                          </p>
                        ) : null}
                      </div>

                      <div className="field field-full">
                        <label htmlFor={paymentFieldIds.cardNumber}>
                          Card number{' '}
                          <span className="required-mark" aria-hidden="true">*</span>
                          <span className="sr-only"> required</span>
                        </label>
                        <input
                          id={paymentFieldIds.cardNumber}
                          name="cardNumber"
                          type="text"
                          inputMode="numeric"
                          autoComplete="cc-number"
                          placeholder="4242 4242 4242 4242"
                          value={payment.cardNumber}
                          onChange={(event) =>
                            updatePaymentField('cardNumber', event.target.value)
                          }
                          onBlur={() => handlePaymentBlur('cardNumber')}
                          aria-invalid={Boolean(paymentErrors.cardNumber)}
                          aria-describedby={
                            paymentErrors.cardNumber
                              ? `${paymentFieldIds.cardNumber}-error`
                              : undefined
                          }
                          required
                        />
                        {paymentErrors.cardNumber ? (
                          <p
                            className="field-error"
                            id={`${paymentFieldIds.cardNumber}-error`}
                          >
                            {paymentErrors.cardNumber}
                          </p>
                        ) : null}
                      </div>

                      <div className="field">
                        <label htmlFor={paymentFieldIds.cardExpiry}>
                          Expiry (MM/YY){' '}
                          <span className="required-mark" aria-hidden="true">*</span>
                          <span className="sr-only"> required</span>
                        </label>
                        <input
                          id={paymentFieldIds.cardExpiry}
                          name="cardExpiry"
                          type="text"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          placeholder="12/29"
                          value={payment.cardExpiry}
                          onChange={(event) =>
                            updatePaymentField('cardExpiry', event.target.value)
                          }
                          onBlur={() => handlePaymentBlur('cardExpiry')}
                          aria-invalid={Boolean(paymentErrors.cardExpiry)}
                          aria-describedby={
                            paymentErrors.cardExpiry
                              ? `${paymentFieldIds.cardExpiry}-error`
                              : undefined
                          }
                          required
                        />
                        {paymentErrors.cardExpiry ? (
                          <p
                            className="field-error"
                            id={`${paymentFieldIds.cardExpiry}-error`}
                          >
                            {paymentErrors.cardExpiry}
                          </p>
                        ) : null}
                      </div>

                      <div className="field">
                        <label htmlFor={paymentFieldIds.cardCvc}>
                          CVC{' '}
                          <span className="required-mark" aria-hidden="true">*</span>
                          <span className="sr-only"> required</span>
                        </label>
                        <input
                          id={paymentFieldIds.cardCvc}
                          name="cardCvc"
                          type="text"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          placeholder="123"
                          value={payment.cardCvc}
                          onChange={(event) =>
                            updatePaymentField('cardCvc', event.target.value)
                          }
                          onBlur={() => handlePaymentBlur('cardCvc')}
                          aria-invalid={Boolean(paymentErrors.cardCvc)}
                          aria-describedby={
                            paymentErrors.cardCvc
                              ? `${paymentFieldIds.cardCvc}-error`
                              : undefined
                          }
                          required
                        />
                        {paymentErrors.cardCvc ? (
                          <p
                            className="field-error"
                            id={`${paymentFieldIds.cardCvc}-error`}
                          >
                            {paymentErrors.cardCvc}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="payment-note">
                    You will pay the courier when your tea arrives. This is a
                    demo option: no cash is collected and no courier is booked.
                  </p>
                )}
              </fieldset>

              {submitError ? (
                <div className="form-alert" role="alert">
                  <AlertCircle aria-hidden="true" />
                  <p>{submitError}</p>
                </div>
              ) : null}

              <div className="checkout-submit">
                <button
                  type="submit"
                  className="btn btn-primary btn-large"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <LoaderCircle className="spin" aria-hidden="true" />
                      {paymentMethod === 'card'
                        ? 'Processing test payment…'
                        : 'Placing demo order…'}
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'card'
                        ? `Pay ${formatMoney(totalCents)} (test mode)`
                        : `Place demo order · ${formatMoney(totalCents)}`}
                      <ArrowRight aria-hidden="true" />
                    </>
                  )}
                </button>
                <p>
                  Test-mode checkout only. No real payment is taken and card
                  details are never stored.
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
                <li key={`${item.product.id}-${item.grams}`}>
                  <TeaImage
                    src={item.product.image}
                    alt={item.product.imageAlt}
                    className="checkout-thumb"
                    priority
                  />
                  <div className="checkout-item-info">
                    <p className="checkout-item-name">{item.product.name}</p>
                    <p className="checkout-item-meta">
                      {item.sizeLabel} · Qty {item.quantity}
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

