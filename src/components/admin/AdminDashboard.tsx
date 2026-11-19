import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowUpRight,
  Download,
  Inbox,
  Leaf,
  LoaderCircle,
  LogOut,
  RefreshCw,
  Search,
  Send,
} from 'lucide-react'
import { useToast } from '../../hooks/useToast'
import {
  deleteOrder,
  fetchOrders,
  formatOrderDate,
  notifyNewOrder,
  orderAddressLines,
  orderStatusLabels,
  orderStatuses,
  paymentMethodLabels,
  updateOrder,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from '../../lib/orders'
import { formatMoney } from '../../lib/money'
import { supabase } from '../../lib/supabase'
import { AdminOrderCard } from './AdminOrderCard'

type StatusFilter = 'all' | OrderStatus
type PaymentFilter = 'all' | 'prepaid' | 'cod-unpaid' | 'paid'

const statusFilterOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  ...orderStatuses.map((status) => ({
    value: status,
    label: orderStatusLabels[status],
  })),
]

const paymentFilterOptions: { value: PaymentFilter; label: string }[] = [
  { value: 'all', label: 'All payments' },
  { value: 'prepaid', label: 'Prepaid (card)' },
  { value: 'cod-unpaid', label: 'Cash on delivery' },
  { value: 'paid', label: 'Paid' },
]

function csvCell(value: string | number): string {
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function downloadCsv(orders: Order[]) {
  const headers = [
    'Order number',
    'Placed at',
    'Customer',
    'Phone',
    'Email',
    'Delivery address',
    'Items',
    'Total (BDT)',
    'Payment method',
    'Payment status',
    'Order status',
  ]

  const rows = orders.map((order) => [
    order.orderNumber,
    formatOrderDate(order.createdAt),
    order.customer.fullName,
    order.customer.phone,
    order.customer.email,
    orderAddressLines(order).join(', '),
    order.items
      .map(
        (item) =>
          `${item.name} (${item.size}) × ${item.quantity} — ${formatMoney(
            item.lineSaleCents,
          )}`,
      )
      .join('; '),
    (order.totalCents / 100).toFixed(2),
    paymentMethodLabels[order.paymentMethod],
    order.paymentStatus,
    orderStatusLabels[order.status],
  ])

  const csv = [headers, ...rows]
    .map((row) => row.map(csvCell).join(','))
    .join('\r\n')

  const blob = new Blob(['\uFEFF', csv], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `leaf-kettle-orders-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

function matchesPayment(order: Order, filter: PaymentFilter): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'prepaid':
      return order.paymentMethod === 'card' && order.paymentStatus === 'paid'
    case 'cod-unpaid':
      return order.paymentMethod === 'cod' && order.paymentStatus === 'unpaid'
    case 'paid':
      return order.paymentStatus === 'paid'
  }
}

export function AdminDashboard({ session }: { session: Session }) {
  const { showToast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [sendingAlerts, setSendingAlerts] = useState(false)
  const [lastLoadedAt, setLastLoadedAt] = useState<string | null>(null)

  const loadOrders = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true)
    try {
      const nextOrders = await fetchOrders()
      setOrders(nextOrders)
      setError(null)
      setLastLoadedAt(new Date().toISOString())
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Could not load orders. Check your Supabase connection.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    fetchOrders()
      .then((nextOrders) => {
        if (!active) return
        setOrders(nextOrders)
        setError(null)
        setLastLoadedAt(new Date().toISOString())
      })
      .catch((loadError: unknown) => {
        if (!active) return
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Could not load orders. Check your Supabase connection.',
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!supabase) return
    const client = supabase

    const channel = client
      .channel('admin-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        () => {
          showToast('New order received.')
          void loadOrders()
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        () => {
          void loadOrders()
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'orders' },
        () => {
          void loadOrders()
        },
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [loadOrders, showToast])

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase()
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false
      if (!matchesPayment(order, paymentFilter)) return false
      if (!query) return true

      const haystack = [
        order.orderNumber,
        order.customer.fullName,
        order.customer.email,
        order.customer.phone,
        order.customer.city,
        order.customer.address1,
        order.customer.address2,
        order.customer.postalCode,
        order.customer.country,
        ...order.items.map((item) => item.name),
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [orders, search, statusFilter, paymentFilter])

  const stats = useMemo(() => {
    const newCount = orders.filter((order) => order.status === 'new').length
    const inProgressCount = orders.filter(
      (order) =>
        order.status === 'confirmed' ||
        order.status === 'packed' ||
        order.status === 'shipped',
    ).length
    const prepaidCents = orders
      .filter(
        (order) =>
          order.paymentMethod === 'card' && order.paymentStatus === 'paid',
      )
      .reduce((total, order) => total + order.totalCents, 0)
    const codDueCents = orders
      .filter(
        (order) =>
          order.paymentMethod === 'cod' &&
          order.paymentStatus === 'unpaid' &&
          order.status !== 'cancelled',
      )
      .reduce((total, order) => total + order.totalCents, 0)

    return { newCount, inProgressCount, prepaidCents, codDueCents }
  }, [orders])

  const pendingAlerts = useMemo(
    () => orders.filter((order) => !order.notifiedAt),
    [orders],
  )

  async function handleUpdate(
    order: Order,
    patch: { status?: OrderStatus; paymentStatus?: PaymentStatus },
  ) {
    setSavingId(order.id)
    setError(null)
    try {
      const updated = await updateOrder(order.id, patch)
      setOrders((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      showToast(`${updated.orderNumber} updated.`)
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Could not update the order.',
      )
    } finally {
      setSavingId(null)
    }
  }

  async function handleDelete(order: Order) {
    if (
      !window.confirm(
        `Delete order ${order.orderNumber}? This cannot be undone.`,
      )
    ) {
      return
    }

    setSavingId(order.id)
    setError(null)
    try {
      await deleteOrder(order.id)
      setOrders((current) => current.filter((item) => item.id !== order.id))
      showToast(`${order.orderNumber} deleted.`)
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Could not delete the order.',
      )
    } finally {
      setSavingId(null)
    }
  }

  async function handleSendAlerts() {
    if (!pendingAlerts.length || sendingAlerts) return

    setSendingAlerts(true)
    let sent = 0

    for (const order of pendingAlerts) {
      if (await notifyNewOrder(order.id)) sent += 1
    }

    setSendingAlerts(false)
    showToast(
      sent > 0
        ? `Sent ${sent} order alert${sent === 1 ? '' : 's'}.`
        : 'Could not send alerts. Check the Telegram environment variables.',
    )
    await loadOrders(true)
  }

  async function handleSignOut() {
    await supabase?.auth.signOut()
  }

  return (
    <div className="admin">
      <header className="admin-topbar">
        <div className="shell admin-topbar-inner">
          <Link className="admin-brand" to="/">
            <span className="admin-brand-seal" aria-hidden="true">
              <Leaf />
            </span>
            <span className="admin-brand-text">
              <small>Leaf &amp; Kettle</small>
              <strong>Control panel</strong>
            </span>
          </Link>

          <div className="admin-topbar-actions">
            <span className="admin-user">{session.user.email}</span>
            <Link className="admin-btn admin-btn-dark" to="/">
              <ArrowUpRight aria-hidden="true" />
              View store
            </Link>
            <button
              type="button"
              className="admin-btn admin-btn-dark"
              onClick={handleSignOut}
            >
              <LogOut aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="shell admin-shell">
        <div className="admin-header">
          <div>
            <p className="eyebrow">Order desk</p>
            <h1>Customer orders</h1>
            <p>
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              {lastLoadedAt
                ? ` · last refreshed ${formatOrderDate(lastLoadedAt)}`
                : ''}
            </p>
          </div>

          <div className="admin-header-actions">
            <button
              type="button"
              className="admin-btn"
              onClick={() => void loadOrders(true)}
              disabled={loading}
            >
              <RefreshCw
                className={loading ? 'spin' : undefined}
                aria-hidden="true"
              />
              Refresh
            </button>
            <button
              type="button"
              className="admin-btn"
              onClick={() => downloadCsv(filteredOrders)}
              disabled={filteredOrders.length === 0}
            >
              <Download aria-hidden="true" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="admin-stats">
          <div className="admin-stat is-accent">
            <span>New orders</span>
            <strong>{stats.newCount}</strong>
          </div>
          <div className="admin-stat">
            <span>In progress</span>
            <strong>{stats.inProgressCount}</strong>
          </div>
          <div className="admin-stat">
            <span>Prepaid total</span>
            <strong>{formatMoney(stats.prepaidCents)}</strong>
          </div>
          <div className="admin-stat">
            <span>Cash to collect</span>
            <strong>{formatMoney(stats.codDueCents)}</strong>
          </div>
        </div>

        {error ? (
          <div className="form-alert admin-alert" role="alert">
            <AlertCircle aria-hidden="true" />
            <p>{error}</p>
          </div>
        ) : null}

        {pendingAlerts.length > 0 ? (
          <div className="admin-notice" role="status">
            <Send aria-hidden="true" />
            <p>
              {pendingAlerts.length}{' '}
              {pendingAlerts.length === 1 ? 'order has' : 'orders have'} not
              triggered a Telegram alert yet. Orders are still saved here.
            </p>
            <button
              type="button"
              className="admin-btn"
              onClick={() => void handleSendAlerts()}
              disabled={sendingAlerts}
            >
              {sendingAlerts ? (
                <LoaderCircle className="spin" aria-hidden="true" />
              ) : (
                <Send aria-hidden="true" />
              )}
              Send alerts
            </button>
          </div>
        ) : null}

        <div className="admin-toolbar">
          <div className="admin-search">
            <Search aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, name, phone, or address"
              aria-label="Search orders"
            />
          </div>

          <select
            className="admin-select"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            aria-label="Filter by order status"
          >
            {statusFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className="admin-select"
            value={paymentFilter}
            onChange={(event) =>
              setPaymentFilter(event.target.value as PaymentFilter)
            }
            aria-label="Filter by payment"
          >
            {paymentFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <span className="admin-result-count">
            {filteredOrders.length} shown
          </span>
        </div>

        {loading && orders.length === 0 ? (
          <div className="admin-empty" role="status">
            <LoaderCircle className="spin" aria-hidden="true" />
            <p>Loading orders…</p>
          </div>
        ) : null}

        {!loading && !error && filteredOrders.length === 0 ? (
          <div className="admin-empty">
            <Inbox aria-hidden="true" />
            <h2>{orders.length === 0 ? 'No orders yet' : 'No matching orders'}</h2>
            <p>
              {orders.length === 0
                ? 'New customer orders will appear here as soon as they are placed.'
                : 'Try clearing the search or changing the filters.'}
            </p>
          </div>
        ) : null}

        <div className="admin-orders">
          {filteredOrders.map((order) => (
            <AdminOrderCard
              key={order.id}
              order={order}
              expanded={expandedId === order.id}
              saving={savingId === order.id}
              onToggle={() =>
                setExpandedId((current) =>
                  current === order.id ? null : order.id,
                )
              }
              onUpdate={(patch) => void handleUpdate(order, patch)}
              onDelete={() => void handleDelete(order)}
            />
          ))}
        </div>

        <p className="admin-footnote">
          {orders.length > 0
            ? `${orders.length} of 500 most recent orders shown. Payment card details are never stored — only the last four digits.`
            : 'Only signed-in shop owner accounts can read customer orders.'}
        </p>
      </main>
    </div>
  )
}
