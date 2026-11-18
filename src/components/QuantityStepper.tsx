import { Minus, Plus } from 'lucide-react'
import { MAX_QUANTITY } from '../lib/cart'

interface QuantityStepperProps {
  quantity: number
  onChange: (quantity: number) => void
  productName: string
  compact?: boolean
}

export function QuantityStepper({
  quantity,
  onChange,
  productName,
  compact = false,
}: QuantityStepperProps) {
  return (
    <div
      className={`qty-stepper${compact ? ' qty-stepper-compact' : ''}`}
      role="group"
      aria-label={`Quantity for ${productName}`}
    >
      <button
        type="button"
        className="qty-button"
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= 1}
        aria-label={`Decrease quantity of ${productName}`}
      >
        <Minus aria-hidden="true" />
      </button>
      <output className="qty-value" aria-live="polite" aria-label={`Quantity ${quantity}`}>
        {quantity}
      </output>
      <button
        type="button"
        className="qty-button"
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= MAX_QUANTITY}
        aria-label={`Increase quantity of ${productName}`}
      >
        <Plus aria-hidden="true" />
      </button>
    </div>
  )
}
