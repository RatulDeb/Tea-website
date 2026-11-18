import { siteConfig } from '../data/site'

const currencyFormatter = new Intl.NumberFormat(siteConfig.locale, {
  style: 'currency',
  currency: siteConfig.currency,
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatMoney(cents: number): string {
  return currencyFormatter.format(cents / 100)
}

export function formatDiscount(rate: number): string {
  return `${Math.round((1 - rate) * 100)}% OFF`
}
