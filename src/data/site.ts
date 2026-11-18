export const siteConfig = {
  brand: 'Leaf & Kettle',
  tagline: 'Tea atelier',
  locale: 'en-US',
  currency: 'BDT',
  demo: true,
  shipping: {
    freeThresholdCents: 3500,
    flatRateCents: 495,
  },
  contact: {
    email: 'ratuldeb014@gmail.com',
    wholesaleEmail: 'ratuldeb014@gmail.com',
    phones: ['+880 1606-958058', '+880 1741-394978'],
    addressLines: [
      'R tech Computer, Marwan Complex',
      'Habiganj Road, Sreemangal',
      'Moulvibazar, Sylhet',
    ],
    hours: 'Monday–Thursday, 10:00 AM – 8:00 PM',
  },
  demoNotes: {
    checkout:
      'This is a demonstration checkout with a test-mode card gateway. No real money is charged and card details are never stored.',
    content: 'Service details are sample copy and should be confirmed before launch.',
  },
} as const

export const CART_STORAGE_KEY = 'leaf-kettle-cart-v1'
