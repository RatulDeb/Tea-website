export const siteConfig = {
  brand: 'Leaf & Kettle',
  tagline: 'Tea atelier',
  locale: 'en-US',
  currency: 'USD',
  demo: true,
  shipping: {
    freeThresholdCents: 3500,
    flatRateCents: 495,
  },
  contact: {
    email: 'hello@leafandkettle.example',
    wholesaleEmail: 'wholesale@leafandkettle.example',
    phone: '+1 (555) 010-2048',
    hours: 'Monday–Friday, 9:00–17:00',
  },
  demoNotes: {
    checkout:
      'This is a demonstration checkout with a test-mode card gateway. No real money is charged and card details are never stored.',
    contact: 'Contact details are sample content for this demo store.',
    content: 'Service details are sample copy and should be confirmed before launch.',
  },
} as const

export const CART_STORAGE_KEY = 'leaf-kettle-cart-v1'
