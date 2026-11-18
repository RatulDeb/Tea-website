import { createContext } from 'react'
import type { CartItem, CartLine, CartTotals } from '../lib/cart'

export interface CartContextValue extends CartTotals {
  lines: CartLine[]
  items: CartItem[]
  addItem: (productId: string, grams?: number, quantity?: number) => void
  updateQuantity: (productId: string, grams: number, quantity: number) => void
  removeItem: (productId: string, grams: number) => void
  clearCart: () => void
  quantityFor: (productId: string, grams?: number) => number
}

export const CartContext = createContext<CartContextValue | null>(null)
