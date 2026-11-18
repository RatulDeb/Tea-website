import type { TeaCategory } from './products'

export interface CategoryGuide {
  category: TeaCategory
  label: string
  title: string
  description: string
  character: string
  examples: string[]
}

export const categoryGuides: CategoryGuide[] = [
  {
    category: 'Black',
    label: 'Black tea',
    title: 'Bold, fully oxidised, and endlessly adaptable',
    description:
      'Black tea is fully oxidised, which gives the leaves their dark colour and deep, rounded flavour. It is the most forgiving style to brew and takes milk or lemon with ease.',
    character: 'Malty, fruity, or toasty with a sturdy body.',
    examples: ['Assam Black Tea', 'Darjeeling Black Tea', 'Earl Grey'],
  },
  {
    category: 'Green',
    label: 'Green tea',
    title: 'Fresh, grassy, and closest to the leaf',
    description:
      'Green tea is lightly processed to preserve its fresh character. Water temperature matters: cooler water keeps the cup sweet and avoids a sharp, bitter edge.',
    character: 'Vegetal, floral, or nutty with a clean finish.',
    examples: ['Sencha Green Tea', 'Jasmine Green Tea', 'Matcha'],
  },
  {
    category: 'White',
    label: 'White tea',
    title: 'Delicate, airy, and quietly sweet',
    description:
      'White tea is made from young buds and leaves with minimal handling. The result is a pale, soft cup that rewards a slightly longer, gentler steep.',
    character: 'Honeydew, hay, and white flowers.',
    examples: ['Silver Needle White Tea', 'White Peony Tea'],
  },
  {
    category: 'Oolong',
    label: 'Oolong tea',
    title: 'Partially oxidised, layered, and aromatic',
    description:
      'Oolong sits between green and black tea. Leaves are rolled and partially oxidised, creating floral, creamy, or mineral flavours that unfold across several infusions.',
    character: 'Orchid, cream, stone fruit, or warm spice.',
    examples: ['Tieguanyin Oolong', 'Milk Oolong'],
  },
  {
    category: 'Fermented',
    label: 'Fermented tea',
    title: 'Aged, earthy, and deeply textured',
    description:
      'Fermented teas such as pu-erh are aged and microbially fermented. They produce dark, smooth cups with cellar-like depth and are often brewed with fully boiling water.',
    character: 'Cocoa, damp earth, and old wood.',
    examples: ['Pu-erh Tea'],
  },
  {
    category: 'Herbal',
    label: 'Herbal infusions',
    title: 'Caffeine-free, plant-based, and not true tea',
    description:
      'Herbal infusions, also called tisanes, are not made from the tea plant Camellia sinensis. They are built from flowers, leaves, roots, or fruit and are naturally caffeine-free.',
    character: 'Floral, minty, tart, or gently spiced.',
    examples: ['Rooibos', 'Chamomile', 'Peppermint', 'Hibiscus'],
  },
]

export interface BrewingRow {
  style: string
  amount: string
  water: string
  time: string
  note: string
}

export const brewingTable: BrewingRow[] = [
  {
    style: 'Black tea',
    amount: '2.5 g / 200 ml',
    water: '95–100°C',
    time: '3–4 min',
    note: 'Use off-the-boil water. Milk is optional.',
  },
  {
    style: 'Green tea',
    amount: '2 g / 200 ml',
    water: '70–80°C',
    time: '1–3 min',
    note: 'Cool the kettle for a sweeter cup.',
  },
  {
    style: 'White tea',
    amount: '2.5 g / 200 ml',
    water: '80–85°C',
    time: '3–5 min',
    note: 'Gentle heat draws out the floral notes.',
  },
  {
    style: 'Oolong tea',
    amount: '3 g / 200 ml',
    water: '90–95°C',
    time: '3–4 min',
    note: 'Good for several short infusions.',
  },
  {
    style: 'Pu-erh',
    amount: '3 g / 200 ml',
    water: '95–100°C',
    time: '3–5 min',
    note: 'Rinse the leaves once if you prefer a cleaner cup.',
  },
  {
    style: 'Herbal infusion',
    amount: '2–2.5 g / 200 ml',
    water: '95–100°C',
    time: '5–7 min',
    note: 'Cover the cup while steeping to keep the aroma in.',
  },
]

export const choosingSteps = [
  {
    title: 'Start with the flavour you enjoy',
    body: 'Choose malty and bold for mornings, fresh and grassy for lighter cups, or floral and fruity for slow afternoons. The flavour notes on each tea are a practical starting point.',
  },
  {
    title: 'Decide on caffeine',
    body: 'Black, green, white, oolong, and pu-erh teas come from the tea plant and contain caffeine. Herbal infusions in our range are caffeine-free. Caffeine levels vary with the leaf, dose, and steep time.',
  },
  {
    title: 'Build a small ritual',
    body: 'A 250 g pouch is a generous place to begin. Start with one tea, a favourite mug, and a timer. Adjust the leaf amount and steep time to suit your taste.',
  },
]

export interface ServiceItem {
  title: string
  description: string
  actionLabel: string
  href: string
}

export const serviceItems: ServiceItem[] = [
  {
    title: 'Customer support',
    description:
      'Questions about a tea, an order, or a brewing method? Write to our sample support inbox and we will point you in the right direction. Contact details are sample copy for this demo.',
    actionLabel: 'Email support',
    href: 'mailto:hello@leafandkettle.example',
  },
  {
    title: 'Gift packaging',
    description:
      'Gift wrapping and a handwritten note can be arranged for sample orders. Packaging options, pricing, and availability are sample wording to confirm before launch.',
    actionLabel: 'Ask about gifting',
    href: 'mailto:hello@leafandkettle.example?subject=Gift%20packaging%20enquiry',
  },
  {
    title: 'Delivery',
    description:
      'This demo uses one simple shipping rule: a flat demo rate, waived once the order reaches the free-shipping threshold. Delivery windows vary by destination, and no delivery date is guaranteed.',
    actionLabel: 'See shipping details',
    href: '#shipping-details',
  },
  {
    title: 'Bulk inquiries',
    description:
      'For offices, cafés, events, and thoughtful client gifts, contact our sample wholesale inbox with quantities and timing. Bulk pricing is sample copy awaiting confirmation.',
    actionLabel: 'Email wholesale',
    href: 'mailto:wholesale@leafandkettle.example?subject=Bulk%20tea%20enquiry',
  },
]
