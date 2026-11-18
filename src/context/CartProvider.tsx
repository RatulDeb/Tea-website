import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { productById, BASE_GRAMS } from '../data/products'
import { CART_STORAGE_KEY } from '../data/site'
import { useToast } from '../hooks/useToast'
import {
  buildCartItems,
  calculateCartTotals,
  normalizeGrams,
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

    const combined = new Map<string, CartLine>()
    for (const entry of parsed) {
      if (typeof entry !== 'object' || entry === null) continue
      const record = entry as Record<string, unknown>
      const productId = record.productId
      const quantity = record.quantity
      if (typeof productId !== 'string' || !productById.has(productId)) continue
      if (typeof quantity !== 'number' || !Number.isFinite(quantity)) continue
      const grams = normalizeGrams(
        typeof record.grams === 'number' ? record.grams : BASE_GRAMS,
      )
      const key = `${productId}:${grams}`
      const existing = combined.get(key)
      combined.set(key, {
        productId,
        grams,
        quantity: normalizeQuantity(
          (existing?.quantity ?? 0) + Math.floor(quantity),
        ),
      })
    }

    return Array.from(combined.values())
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
    (productId: string, grams = BASE_GRAMS, quantity = 1) => {
      const product = productById.get(productId)
      if (!product) return
      const amount = normalizeQuantity(quantity)
      const chosenGrams = normalizeGrams(grams)
      setLines((current) => {
        const existing = current.find(
          (line) =>
            line.productId === productId && line.grams === chosenGrams,
        )
        if (existing) {
          return current.map((line) =>
            line.productId === productId && line.grams === chosenGrams
              ? {
                  ...line,
                  quantity: normalizeQuantity(line.quantity + amount),
                }
              : line,
          )
        }
        return [...current, { productId, grams: chosenGrams, quantity: amount }]
      })
      showToast(`${product.name} added to your cart.`, {
        label: 'View cart',
        to: '/cart',
      })
    },
    [showToast],
  )

  const updateQuantity = useCallback(
    (productId: string, grams: number, quantity: number) => {
      setLines((current) =>
        current.map((line) =>
          line.productId === productId && line.grams === grams
            ? { ...line, quantity: normalizeQuantity(quantity) }
            : line,
        ),
      )
    },
    [],
  )

  const removeItem = useCallback((productId: string, grams: number) => {
    setLines((current) =>
      current.filter(
        (line) => !(line.productId === productId && line.grams === grams),
      ),
    )
  }, [])

  const clearCart = useCallback(() => {
    setLines([])
  }, [])

  const quantityFor = useCallback(
    (productId: string, grams = BASE_GRAMS) =>
      lines.find(
        (line) => line.productId === productId && line.grams === grams,
      )?.quantity ?? 0,
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

