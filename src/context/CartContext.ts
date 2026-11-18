import { createContext } from 'react'
import type { CartItem, CartLine, CartTotals } from '../lib/cart'

export interface CartContextValue extends CartTotals {
  lines: CartLine[]
  items: CartItem[]
  addItem: (productId: string, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  quantityFor: (productId: string) => number
}

export const CartContext = createContext<CartContextValue | null>(null)
