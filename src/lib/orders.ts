import { siteConfig } from '../data/site'
import { supabase } from './supabase'

export const orderStatuses = [
  'new',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
] as const

export type OrderStatus = (typeof orderStatuses)[number]

export const paymentMethods = ['card', 'cod'] as const

export type PaymentMethod = (typeof paymentMethods)[number]

export const paymentStatuses = ['paid', 'unpaid', 'refunded'] as const

export type PaymentStatus = (typeof paymentStatuses)[number]

export const orderStatusLabels: Record<OrderStatus, string> = {
  new: 'New',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  card: 'Card',
  cod: 'Cash on delivery',
}

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  paid: 'Paid',
  unpaid: 'Unpaid',
  refunded: 'Refunded',
}

export interface OrderCustomer {
  fullName: string
  email: string
  phone: string
  address1: string
  address2: string
  city: string
  postalCode: string
  country: string
}

export interface OrderItem {
  productId: string
  name: string
  variety: string
  size: string
  quantity: number
  unitSaleCents: number
  lineSaleCents: number
  image: string
  imageAlt: string
}

export interface Order {
  id: string
  orderNumber: string
  createdAt: string
  updatedAt: string
  customer: OrderCustomer
  items: OrderItem[]
  count: number
  subtotalCents: number
  savingsCents: number
  shippingCents: number
  totalCents: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  cardLast4: string | null
  status: OrderStatus
  notes: string | null
  notifiedAt: string | null
}

export interface OrderInput {
  orderNumber: string
  customer: OrderCustomer
  items: OrderItem[]
  count: number
  subtotalCents: number
  savingsCents: number
  shippingCents: number
  totalCents: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  cardLast4?: string
}

export interface OrderPatch {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  notes?: string | null
}

export interface PlaceOrderResult {
  order: Order | null
  persisted: boolean
  error?: string
}

interface OrderRow {
  id: string
  order_number: string
  created_at: string
  updated_at: string
  customer_name: string
  email: string
  phone: string
  address1: string
  address2: string | null
  city: string
  postal_code: string
  country: string
  items: OrderItem[] | null
  item_count: number
  subtotal_cents: number
  savings_cents: number
  shipping_cents: number
  total_cents: number
  payment_method: string
  payment_status: string
  card_last4: string | null
  status: string
  notes: string | null
  notified_at: string | null
}

function asOrderStatus(value: string): OrderStatus {
  return orderStatuses.includes(value as OrderStatus)
    ? (value as OrderStatus)
    : 'new'
}

function asPaymentMethod(value: string): PaymentMethod {
  return paymentMethods.includes(value as PaymentMethod)
    ? (value as PaymentMethod)
    : 'cod'
}

function asPaymentStatus(value: string): PaymentStatus {
  return paymentStatuses.includes(value as PaymentStatus)
    ? (value as PaymentStatus)
    : 'unpaid'
}

export function createOrderNumber(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let id = ''
  for (let i = 0; i < 10; i += 1) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

export function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customer: {
      fullName: row.customer_name,
      email: row.email,
      phone: row.phone,
      address1: row.address1,
      address2: row.address2 ?? '',
      city: row.city,
      postalCode: row.postal_code,
      country: row.country,
    },
    items: Array.isArray(row.items) ? row.items : [],
    count: row.item_count,
    subtotalCents: row.subtotal_cents,
    savingsCents: row.savings_cents,
    shippingCents: row.shipping_cents,
    totalCents: row.total_cents,
    paymentMethod: asPaymentMethod(row.payment_method),
    paymentStatus: asPaymentStatus(row.payment_status),
    cardLast4: row.card_last4,
    status: asOrderStatus(row.status),
    notes: row.notes,
    notifiedAt: row.notified_at,
  }
}

export function orderAddressLines(
  order: Pick<Order, 'customer'>,
): string[] {
  const { address1, address2, city, postalCode, country } = order.customer
  return [address1, address2, `${city}, ${postalCode}`, country].filter(
    (line) => line.trim().length > 0,
  )
}

export function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleString(siteConfig.locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function paymentBadgeLabel(
  order: Pick<Order, 'paymentMethod' | 'paymentStatus'>,
): string {
  if (order.paymentStatus === 'refunded') return 'Refunded'
  if (order.paymentMethod === 'card') {
    return order.paymentStatus === 'paid' ? 'Prepaid' : 'Card unpaid'
  }
  return order.paymentStatus === 'paid' ? 'COD paid' : 'COD'
}

function createUuid(): string {
  const cryptoApi = globalThis.crypto
  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID()
  }
  const bytes = new Uint8Array(16)
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Math.floor(Math.random() * 256)
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function createLocalOrder(
  input: OrderInput,
  overrides: { id?: string; orderNumber?: string; createdAt?: string } = {},
): Order {
  const now = overrides.createdAt ?? new Date().toISOString()
  return {
    id: overrides.id ?? createUuid(),
    orderNumber: overrides.orderNumber ?? input.orderNumber,
    createdAt: now,
    updatedAt: now,
    customer: input.customer,
    items: input.items,
    count: input.count,
    subtotalCents: input.subtotalCents,
    savingsCents: input.savingsCents,
    shippingCents: input.shippingCents,
    totalCents: input.totalCents,
    paymentMethod: input.paymentMethod,
    paymentStatus: input.paymentStatus,
    cardLast4: input.cardLast4 ?? null,
    status: 'new',
    notes: null,
    notifiedAt: null,
  }
}

export async function placeOrder(
  input: OrderInput,
): Promise<PlaceOrderResult> {
  if (!supabase) {
    return { persisted: false, order: createLocalOrder(input) }
  }

  let orderNumber = input.orderNumber

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const orderId = createUuid()
    const createdAt = new Date().toISOString()
    const { error } = await supabase.from('orders').insert({
      id: orderId,
      order_number: orderNumber,
      customer_name: input.customer.fullName,
      email: input.customer.email,
      phone: input.customer.phone,
      address1: input.customer.address1,
      address2: input.customer.address2 || null,
      city: input.customer.city,
      postal_code: input.customer.postalCode,
      country: input.customer.country,
      items: input.items,
      item_count: input.count,
      subtotal_cents: input.subtotalCents,
      savings_cents: input.savingsCents,
      shipping_cents: input.shippingCents,
      total_cents: input.totalCents,
      payment_method: input.paymentMethod,
      payment_status: input.paymentStatus,
      card_last4: input.cardLast4 ?? null,
      created_at: createdAt,
      updated_at: createdAt,
    })

    if (!error) {
      return {
        persisted: true,
        order: createLocalOrder(input, { id: orderId, orderNumber, createdAt }),
      }
    }

    if (error.code !== '23505') {
      return {
        persisted: false,
        order: null,
        error:
          'We could not save your order. Please check your connection and try again, or contact us by phone.',
      }
    }

    orderNumber = createOrderNumber()
  }

  return {
    persisted: false,
    order: null,
    error:
      'We could not create a unique order number. Please try placing the order again.',
  }
}

export async function notifyNewOrder(orderId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/notify-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
      keepalive: true,
    })
    if (!response.ok) return false
    const payload: unknown = await response.json()
    if (!payload || typeof payload !== 'object') return false
    return (
      (payload as { ok?: unknown }).ok === true ||
      (payload as { skipped?: unknown }).skipped === true
    )
  } catch {
    return false
  }
}

export async function fetchOrders(): Promise<Order[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) throw new Error(error.message)
  return (data as OrderRow[]).map(rowToOrder)
}

export async function updateOrder(
  id: string,
  patch: OrderPatch,
): Promise<Order> {
  if (!supabase) throw new Error('Supabase is not configured.')

  const payload: Record<string, unknown> = {}
  if (patch.status) payload.status = patch.status
  if (patch.paymentStatus) payload.payment_status = patch.paymentStatus
  if (patch.notes !== undefined) payload.notes = patch.notes

  const { data, error } = await supabase
    .from('orders')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return rowToOrder(data as OrderRow)
}

export async function deleteOrder(id: string, orderNumber?: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.')

  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) throw new Error(error.message)

  if (orderNumber) {
    try {
      await fetch('/api/notify-admin-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber }),
      })
    } catch {
      // Don't fail deletion if Telegram alert fails
    }
  }
}

export async function cancelOrder(
  orderId: string,
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch('/api/cancel-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, email }),
    })
    const payload: unknown = await response.json()
    if (!response.ok) {
      const message =
        payload && typeof payload === 'object' && 'error' in payload
          ? String((payload as { error: unknown }).error)
          : 'Could not cancel the order. Please contact us.'
      return { ok: false, error: message }
    }
    return { ok: true }
  } catch {
    return {
      ok: false,
      error: 'Could not reach the server. Check your connection and try again.',
    }
  }
}
