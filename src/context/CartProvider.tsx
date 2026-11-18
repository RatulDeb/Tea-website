import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { productById } from '../data/products'
import { CART_STORAGE_KEY } from '../data/site'
import { useToast } from '../hooks/useToast'
import {
  buildCartItems,
  calculateCartTotals,
  normalizeQuantity,
  type CartLine,
} from '../lib/cart'
import { CartContext, type CartContextValue } from './CartContext'

function readStoredCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    const quantities = new Map<string, number>()
    for (const entry of parsed) {
      if (typeof entry !== 'object' || entry === null) continue
      const record = entry as Record<string, unknown>
      const productId = record.productId
      const quantity = record.quantity
      if (typeof productId !== 'string' || !productById.has(productId)) continue
      if (typeof quantity !== 'number' || !Number.isFinite(quantity)) continue
      const combined = (quantities.get(productId) ?? 0) + Math.floor(quantity)
      quantities.set(productId, normalizeQuantity(combined))
    }

    return Array.from(quantities, ([productId, quantity]) => ({
      productId,
      quantity,
    }))
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(readStoredCart)
  const { showToast } = useToast()

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines))
    } catch {
      return
    }
  }, [lines])

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === CART_STORAGE_KEY) {
        setLines(readStoredCart())
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const addItem = useCallback(
    (productId: string, quantity = 1) => {
      const product = productById.get(productId)
      if (!product) return
      const amount = normalizeQuantity(quantity)
      setLines((current) => {
        const existing = current.find((line) => line.productId === productId)
        if (existing) {
          return current.map((line) =>
            line.productId === productId
              ? {
                  ...line,
                  quantity: normalizeQuantity(line.quantity + amount),
                }
              : line,
          )
        }
        return [...current, { productId, quantity: amount }]
      })
      showToast(`${product.name} added to your cart.`, {
        label: 'View cart',
        to: '/cart',
      })
    },
    [showToast],
  )

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setLines((current) =>
      current.map((line) =>
        line.productId === productId
          ? { ...line, quantity: normalizeQuantity(quantity) }
          : line,
      ),
    )
  }, [])

  const removeItem = useCallback((productId: string) => {
    setLines((current) => current.filter((line) => line.productId !== productId))
  }, [])

  const clearCart = useCallback(() => {
    setLines([])
  }, [])

  const quantityFor = useCallback(
    (productId: string) =>
      lines.find((line) => line.productId === productId)?.quantity ?? 0,
    [lines],
  )

  const items = useMemo(() => buildCartItems(lines), [lines])
  const totals = useMemo(() => calculateCartTotals(items), [items])

  const value = useMemo<CartContextValue>(
    () => ({
      ...totals,
      lines,
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      quantityFor,
    }),
    [
      totals,
      lines,
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      quantityFor,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

