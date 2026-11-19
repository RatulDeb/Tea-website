import {
  ChevronDown,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  Trash2,
} from 'lucide-react'
import { googleMapsUrl, telHref } from '../../lib/contact'
import { formatMoney } from '../../lib/money'
import {
  formatOrderDate,
  orderAddressLines,
  orderStatusLabels,
  orderStatuses,
  paymentBadgeLabel,
  paymentMethodLabels,
  paymentStatusLabels,
  paymentStatuses,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from '../../lib/orders'

interface AdminOrderCardProps {
  order: Order
  expanded: boolean
  saving: boolean
  onToggle: () => void
  onUpdate: (patch: {
    status?: OrderStatus
    paymentStatus?: PaymentStatus
  }) => void
  onDelete: () => void
}

export function AdminOrderCard({
  order,
  expanded,
  saving,
  onToggle,
  onUpdate,
  onDelete,
}: AdminOrderCardProps) {
  const addressLines = orderAddressLines(order)
  const mapsUrl = googleMapsUrl(addressLines.join(', '))
  const isNew = order.status === 'new'

  return (
    <article className={`admin-order${isNew ? ' is-new' : ''}`}>
      <button
        type="button"
        className="admin-order-summary"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`order-details-${order.id}`}
      >
        <span className="admin-order-main admin-order-id">
          <strong>{order.orderNumber}</strong>
          <span>{formatOrderDate(order.createdAt)}</span>
        </span>
        <span className="admin-order-main admin-order-customer">
          <strong>{order.customer.fullName}</strong>
          <span>
            {order.customer.phone} · {order.customer.city}
          </span>
        </span>
        <span className="admin-order-main admin-order-total">
          <strong>{formatMoney(order.totalCents)}</strong>
          <span>
            {order.count} {order.count === 1 ? 'item' : 'items'}
          </span>
        </span>
        <span className="admin-badges">
          <span className={`status-badge status-${order.status}`}>
            {orderStatusLabels[order.status]}
          </span>
          <span className={`payment-badge payment-${order.paymentStatus}`}>
            {paymentBadgeLabel(order)}
          </span>
        </span>
        <ChevronDown
          className={`admin-order-chevron${expanded ? ' is-open' : ''}`}
          aria-hidden="true"
        />
      </button>

      {expanded ? (
        <div className="admin-order-body" id={`order-details-${order.id}`}>
          <section aria-labelledby={`delivery-heading-${order.id}`}>
            <h3 id={`delivery-heading-${order.id}`}>Deliver to</h3>
            <div className="admin-address">
              <MapPin aria-hidden="true" />
              <address>
                <strong>{order.customer.fullName}</strong>
                {addressLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
            </div>

            <div className="admin-contact-links">
              <a href={telHref(order.customer.phone)}>
                <Phone aria-hidden="true" />
                Call {order.customer.phone}
              </a>
              <a href={`mailto:${order.customer.email}`}>
                <Mail aria-hidden="true" />
                Email customer
              </a>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <MapPin aria-hidden="true" />
                Open in Maps
              </a>
            </div>

            <p className="admin-payment-note">
              {order.paymentMethod === 'card'
                ? order.paymentStatus === 'paid'
                  ? `Card payment recorded${
                      order.cardLast4 ? ` ···· ${order.cardLast4}` : ''
                    } (test mode) — no real money was charged.`
                  : order.paymentStatus === 'refunded'
                    ? `Card payment refunded${
                        order.cardLast4 ? ` ···· ${order.cardLast4}` : ''
                      } (test mode) — no real money was moved.`
                    : `Card order marked unpaid${
                        order.cardLast4 ? ` ···· ${order.cardLast4}` : ''
                      } (test mode).`
                : order.paymentStatus === 'refunded'
                  ? 'Cash on delivery — payment marked as refunded.'
                  : order.paymentStatus === 'paid'
                    ? 'Cash on delivery — payment marked as received.'
                    : `Cash on delivery — collect ${formatMoney(
                        order.totalCents,
                      )} when the tea arrives.`}
            </p>
          </section>

          <section aria-labelledby={`items-heading-${order.id}`}>
            <h3 id={`items-heading-${order.id}`}>Order contents</h3>
            <ul className="admin-items">
              {order.items.map((item) => (
                <li key={`${item.productId}-${item.size}`}>
                  <div className="admin-item-copy">
                    <strong>{item.name}</strong>
                    <span>
                      {item.variety} · {item.size} · Qty {item.quantity}
                    </span>
                  </div>
                  <span className="admin-line-total">
                    {formatMoney(item.lineSaleCents)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="admin-totals">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatMoney(order.subtotalCents)}</dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd>
                  {order.shippingCents === 0
                    ? 'Free'
                    : formatMoney(order.shippingCents)}
                </dd>
              </div>
              <div className="admin-totals-total">
                <dt>Total</dt>
                <dd>{formatMoney(order.totalCents)}</dd>
              </div>
            </dl>
          </section>

          <div className="admin-controls">
            <div className="admin-control">
              <label htmlFor={`status-${order.id}`}>Order status</label>
              <select
                id={`status-${order.id}`}
                value={order.status}
                onChange={(event) =>
                  onUpdate({ status: event.target.value as OrderStatus })
                }
                disabled={saving}
              >
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {orderStatusLabels[status]}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-control">
              <label htmlFor={`payment-${order.id}`}>Payment status</label>
              <select
                id={`payment-${order.id}`}
                value={order.paymentStatus}
                onChange={(event) =>
                  onUpdate({
                    paymentStatus: event.target.value as PaymentStatus,
                  })
                }
                disabled={saving}
              >
                {paymentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {paymentStatusLabels[status]}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="admin-btn admin-btn-danger"
              onClick={onDelete}
              disabled={saving}
            >
              <Trash2 aria-hidden="true" />
              Delete order
            </button>

            {saving ? (
              <span className="admin-saving" role="status">
                <LoaderCircle className="spin" aria-hidden="true" />
                Saving…
              </span>
            ) : null}

            <p className="admin-order-meta">
              <span>Placed {formatOrderDate(order.createdAt)}</span>
              <span>
                {paymentMethodLabels[order.paymentMethod]}
                {order.cardLast4 ? ` ···· ${order.cardLast4}` : ''}
              </span>
              <span>
                {order.notifiedAt
                  ? `Telegram alert sent ${formatOrderDate(order.notifiedAt)}`
                  : 'Telegram alert not sent yet'}
              </span>
            </p>
          </div>
        </div>
      ) : null}
    </article>
  )
}
