const TELEGRAM_API = 'https://api.telegram.org'

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

  const orderNumber = body.orderNumber
  if (!orderNumber || typeof orderNumber !== 'string') {
    response.status(400).json({ error: 'orderNumber is required.' })
    return
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    response.status(500).json({ error: 'Telegram credentials not configured.' })
    return
  }

  const time = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka',
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const text = [
    `🗑️ Admin deleted an order`,
    '',
    `Order Number: ${orderNumber.trim()}`,
    `Deleted at: ${time}`,
  ].join('\n')

  try {
    const telegramRes = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    })

    if (!telegramRes.ok) {
      const detail = await telegramRes.text()
      response.status(502).json({ error: 'Telegram send failed.', detail: detail.slice(0, 300) })
      return
    }

    response.status(200).json({ ok: true })
  } catch {
    response.status(502).json({ error: 'Could not connect to Telegram.' })
  }
}
