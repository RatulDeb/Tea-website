const TELEGRAM_API = 'https://api.telegram.org'
const ORDER_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function money(cents) {
  return `৳${(Number(cents || 0) / 100).toFixed(2)}`
}

function formatCancellationMessage(order) {
  const items = Array.isArray(order.items) ? order.items : []
  const itemLines = items.map(
    (item) =>
      `- ${item.name} (${item.size}) x ${item.quantity} - ${money(
        item.lineSaleCents,
      )}`,
  )

  const time = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka',
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return [
    `⚠️ Order Cancelled: ${order.order_number}`,
    '',
    `Customer: ${order.customer_name}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    '',
    'Cancelled Items:',
    ...itemLines,
    '',
    `Total: ${money(order.total_cents)}`,
    `Cancelled at: ${time}`,
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
  const email = body.email

  if (typeof orderId !== 'string' || !ORDER_ID_PATTERN.test(orderId)) {
    response.status(400).json({ error: 'A valid orderId is required.' })
    return
  }

  if (typeof email !== 'string' || email.length < 3) {
    response.status(400).json({ error: 'The order email is required for verification.' })
    return
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    response.status(500).json({ error: 'Server is not configured.' })
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
    response.status(502).json({ error: 'Could not read the order.' })
    return
  }

  const rows = await orderResponse.json()
  const order = Array.isArray(rows) ? rows[0] : null

  if (!order) {
    response.status(404).json({ error: 'Order not found.' })
    return
  }

  if (order.email.toLowerCase() !== email.toLowerCase()) {
    response.status(403).json({ error: 'Email does not match the order.' })
    return
  }

  if (order.status !== 'new') {
    response.status(409).json({
      error: `This order has already been ${order.status}. It can no longer be cancelled.`,
    })
    return
  }

  const patchResponse = await fetch(
    `${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`,
    {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ status: 'cancelled' }),
    },
  )

  if (!patchResponse.ok) {
    response.status(502).json({ error: 'Could not cancel the order.' })
    return
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (botToken && chatId) {
    try {
      await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: formatCancellationMessage(order),
          disable_web_page_preview: true,
        }),
      })
    } catch {
      // Continue even if Telegram delivery fails
    }
  }

  response.status(200).json({ ok: true, orderNumber: order.order_number })
}
