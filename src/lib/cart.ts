import {
  productById,
  getSalePriceCents,
  type TeaProduct,
} from '../data/products'
import { siteConfig } from '../data/site'

export interface CartLine {
  productId: string
  quantity: number
}

export interface CartItem {
  product: TeaProduct
  quantity: number
  unitSaleCents: number
  unitOriginalCents: number
  lineSaleCents: number
  lineOriginalCents: number
}

export interface CartTotals {
  count: number
  subtotalCents: number
  originalSubtotalCents: number
  savingsCents: number
  shippingCents: number
  totalCents: number
  freeShippingRemainingCents: number
  qualifiesForFreeShipping: boolean
}

export const MAX_QUANTITY = 99

export function normalizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1
  return Math.min(MAX_QUANTITY, Math.max(1, Math.floor(quantity)))
}

export function buildCartItems(lines: CartLine[]): CartItem[] {
  return lines.flatMap((line) => {
    const product = productById.get(line.productId)
    if (!product) return []
    const quantity = normalizeQuantity(line.quantity)
    const unitSaleCents = getSalePriceCents(product.originalPriceCents)
    return [
      {
        product,
        quantity,
        unitSaleCents,
        unitOriginalCents: product.originalPriceCents,
        lineSaleCents: unitSaleCents * quantity,
        lineOriginalCents: product.originalPriceCents * quantity,
      },
    ]
  })
}

export function calculateCartTotals(items: CartItem[]): CartTotals {
  const count = items.reduce((total, item) => total + item.quantity, 0)
  const subtotalCents = items.reduce((total, item) => total + item.lineSaleCents, 0)
  const originalSubtotalCents = items.reduce(
    (total, item) => total + item.lineOriginalCents,
    0,
  )
  const savingsCents = originalSubtotalCents - subtotalCents
  const qualifiesForFreeShipping =
    subtotalCents >= siteConfig.shipping.freeThresholdCents
  const shippingCents =
    subtotalCents === 0 || qualifiesForFreeShipping
      ? 0
      : siteConfig.shipping.flatRateCents
  const freeShippingRemainingCents = Math.max(
    0,
    siteConfig.shipping.freeThresholdCents - subtotalCents,
  )

  return {
    count,
    subtotalCents,
    originalSubtotalCents,
    savingsCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    freeShippingRemainingCents,
    qualifiesForFreeShipping,
  }
}
