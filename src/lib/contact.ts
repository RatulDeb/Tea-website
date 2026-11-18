export function gmailComposeUrl(email: string, subject = 'Tea enquiry'): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: email,
    su: subject,
  })
  return `https://mail.google.com/mail/?${params.toString()}`
}

export function googleMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}

export function formatAddress(lines: readonly string[]): string {
  return lines.join(', ')
}
