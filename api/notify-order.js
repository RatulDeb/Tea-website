const TELEGRAM_API = 'https://api.telegram.org'
const ORDER_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function money(cents) {
  return `৳${(Number(cents || 0) / 100).toFixed(2)}`
}

function formatOrderMessage(order) {
  const address = [
    order.address1,
    order.address2,
    `${order.city}, ${order.postal_code}`,
    order.country,
  ].filter(Boolean)

  const items = Array.isArray(order.items) ? order.items : []
  const itemLines = items.map(
    (item) =>
      `- ${item.name} (${item.size}) x ${item.quantity} - ${money(
        item.lineSaleCents,
      )}`,
  )

  const payment =
    order.payment_method === 'card'
      ? `Card${order.card_last4 ? ` ending ${order.card_last4}` : ''} (test mode)`
      : 'Cash on delivery'

  const placed = new Date(order.created_at).toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka',
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return [
    `New order ${order.order_number}`,
    '',
    `Customer: ${order.customer_name}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    '',
    'Deliver to:',
    ...address,
    '',
    'Items:',
    ...itemLines,
    '',
    `Total: ${money(order.total_cents)}`,
    `Payment: ${payment} (${order.payment_status})`,
    `Placed: ${placed}`,
  ].join('\n')
}

function readBody(request) {
  if (request.body && typeof request.body === 'object') return request.body
  if (typeof request.body === 'string' && request.body.length > 0) {
    return JSON.parse(request.body)
  }
  return {}
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.status(405).json({ error: 'Method not allowed.' })
    return
  }

  let body
  try {
    body = readBody(request)
  } catch {
    response.status(400).json({ error: 'Invalid JSON body.' })
    return
  }

  const orderId = body.orderId
  if (typeof orderId !== 'string' || !ORDER_ID_PATTERN.test(orderId)) {
    response.status(400).json({ error: 'A valid orderId is required.' })
    return
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!supabaseUrl || !serviceKey || !botToken || !chatId) {
    response.status(500).json({
      error:
        'Notification is not configured. Add SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TELEGRAM_BOT_TOKEN, and TELEGRAM_CHAT_ID to Vercel.',
    })
    return
  }

  const orderUrl = new URL(`${supabaseUrl}/rest/v1/orders`)
  orderUrl.searchParams.set('id', `eq.${orderId}`)
  orderUrl.searchParams.set('select', '*')

  const orderResponse = await fetch(orderUrl, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  })

  if (!orderResponse.ok) {
    response.status(502).json({ error: 'Could not read the order from Supabase.' })
    return
  }

  const rows = await orderResponse.json()
  const order = Array.isArray(rows) ? rows[0] : null

  if (!order) {
    response.status(404).json({ error: 'Order not found.' })
    return
  }

  if (order.notified_at) {
    response.status(200).json({ ok: true, skipped: true })
    return
  }

  const telegramResponse = await fetch(
    `${TELEGRAM_API}/bot${botToken}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatOrderMessage(order),
        disable_web_page_preview: true,
      }),
    },
  )

  if (!telegramResponse.ok) {
    const detail = await telegramResponse.text()
    response.status(502).json({
      error: 'Telegram rejected the message.',
      detail: detail.slice(0, 400),
    })
    return
  }

  await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`, {
    method: 'PATCH',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ notified_at: new Date().toISOString() }),
  })

  response.status(200).json({ ok: true, orderNumber: order.order_number })
}
