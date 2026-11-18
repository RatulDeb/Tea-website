export const teaCategories = [
  'Black',
  'Green',
  'White',
  'Oolong',
  'Fermented',
  'Herbal',
] as const

export type TeaCategory = (typeof teaCategories)[number]

export const SALE_RATE = 0.8

export const BASE_GRAMS = 250

export const packSizes = [
  { grams: 250, label: '250 g' },
  { grams: 500, label: '500 g' },
  { grams: 1000, label: '1 kg' },
  { grams: 2000, label: '2 kg' },
  { grams: 3000, label: '3 kg' },
  { grams: 4000, label: '4 kg' },
  { grams: 5000, label: '5 kg' },
] as const

export function getPackLabel(grams: number): string {
  return packSizes.find((pack) => pack.grams === grams)?.label ?? `${grams} g`
}

export function isPackGrams(grams: number): boolean {
  return packSizes.some((pack) => pack.grams === grams)
}

export function getPackPriceCents(baseCents: number, grams: number): number {
  return Math.round((baseCents * grams) / BASE_GRAMS)
}

export interface BrewingGuide {
  amount: string
  water: string
  time: string
}

export interface TeaProduct {
  id: string
  name: string
  variety: string
  category: TeaCategory
  flavor: string
  description: string
  tastingNotes: string[]
  ingredients: string
  origin: string
  caffeine: string
  size: string
  originalPriceCents: number
  brewing: BrewingGuide
  image: string
  imageAlt: string
}

export function getSalePriceCents(originalPriceCents: number): number {
  return Math.round(originalPriceCents * SALE_RATE)
}

export function isHerbal(product: TeaProduct): boolean {
  return product.category === 'Herbal'
}

const size = '250 g'

export const products: TeaProduct[] = [
  {
    id: 'assam-black-tea',
    name: 'Brahmaputra Dawn',
    variety: 'Assam Black Tea',
    category: 'Black',
    flavor: 'Malty, brisk, and bold with a honeyed finish.',
    description:
      'A hearty single-origin Assam with a deep amber cup and a classic malty backbone. It stands up beautifully to milk and makes a dependable, full-flavoured morning brew.',
    tastingNotes: ['Malt', 'Honey', 'Baked bread'],
    ingredients: 'Assam black tea (Camellia sinensis).',
    origin: 'Assam, India',
    caffeine: 'Moderate–high caffeine',
    size,
    originalPriceCents: 4000,
    brewing: { amount: '2.5 g / 200 ml', water: '95–100°C', time: '3–4 min' },
    image: '/images/assam-black-tea.jpg',
    imageAlt:
      'A clear glass bowl filled with dark, wiry Assam black tea leaves.',
  },
  {
    id: 'darjeeling-black-tea',
    name: 'First Light Flush',
    variety: 'Darjeeling Black Tea',
    category: 'Black',
    flavor: 'Muscatel, florals, and a bright, lightly astringent finish.',
    description:
      'A delicate Himalayan black tea with the lifted, muscatel character that Darjeeling is known for. Lighter than an Assam, it is lovely on its own or with a thin slice of lemon.',
    tastingNotes: ['Muscatel', 'Fresh flowers', 'Citrus peel'],
    ingredients: 'Darjeeling black tea (Camellia sinensis).',
    origin: 'Darjeeling, India',
    caffeine: 'Moderate caffeine',
    size,
    originalPriceCents: 5500,
    brewing: { amount: '2.5 g / 200 ml', water: '90–95°C', time: '3–4 min' },
    image: '/images/darjeeling-black-tea.jpg',
    imageAlt:
      'A navy teapot, small cream jug, and cup of amber Darjeeling tea on a wooden tray.',
  },
  {
    id: 'earl-grey',
    name: 'Bergamot & Blue',
    variety: 'Earl Grey',
    category: 'Black',
    flavor: 'Warm bergamot, soft citrus blossom, and a smooth black tea base.',
    description:
      'A mellow black tea scented with bergamot and finished with a scatter of blue cornflower petals. Bright enough for the afternoon, rounded enough for a splash of milk.',
    tastingNotes: ['Bergamot', 'Citrus zest', 'Cream'],
    ingredients:
      'Black tea (Camellia sinensis), bergamot flavouring, cornflower petals.',
    origin: 'A classic bergamot-scented blend',
    caffeine: 'Moderate caffeine',
    size,
    originalPriceCents: 3750,
    brewing: { amount: '2.5 g / 200 ml', water: '95–100°C', time: '3–4 min' },
    image: '/images/earl-grey.jpg',
    imageAlt:
      'Loose Earl Grey black tea with blue cornflower petals spread across a pale surface.',
  },
  {
    id: 'english-breakfast',
    name: 'Morning Assembly',
    variety: 'English Breakfast',
    category: 'Black',
    flavor: 'Full-bodied, toasty, and made for a splash of milk.',
    description:
      'A rounded blend of black teas built for the first cup of the day. Its sturdy, biscuity body takes milk and sugar well without losing its shape.',
    tastingNotes: ['Toast', 'Malt', 'Caramel'],
    ingredients: 'Black tea blend (Camellia sinensis).',
    origin: 'A traditional black tea blend',
    caffeine: 'Moderate–high caffeine',
    size,
    originalPriceCents: 3500,
    brewing: { amount: '2.5 g / 200 ml', water: '95–100°C', time: '3–4 min' },
    image: '/images/english-breakfast.jpg',
    imageAlt:
      'Dark English breakfast tea being poured from a red teapot into a white cup.',
  },
  {
    id: 'masala-chai',
    name: 'Kettle & Spice',
    variety: 'Masala Chai',
    category: 'Black',
    flavor: 'Cardamom, cinnamon, clove, and ginger over a bold Assam base.',
    description:
      'A warming chai blend with whole spices layered over malty Assam. Simmer gently with milk and a little sugar, or steep it in water for a lighter, spiced cup.',
    tastingNotes: ['Cardamom', 'Cinnamon', 'Ginger'],
    ingredients:
      'Assam black tea (Camellia sinensis), cardamom, cinnamon, ginger, cloves, black pepper.',
    origin: 'India',
    caffeine: 'Moderate caffeine',
    size,
    originalPriceCents: 4250,
    brewing: { amount: '3 g / 200 ml', water: '95–100°C', time: '4–5 min' },
    image: '/images/masala-chai.jpg',
    imageAlt:
      'A cup of milky masala chai with whole spices and biscuits on a colourful cloth.',
  },
  {
    id: 'sencha-green-tea',
    name: 'Field of Green',
    variety: 'Sencha Green Tea',
    category: 'Green',
    flavor: 'Fresh-cut grass, steamed greens, and a clean, brisk finish.',
    description:
      'A classic Japanese sencha with a bright, vegetal character. Keep the water below boiling to coax out its sweetness and avoid a bitter edge.',
    tastingNotes: ['Cut grass', 'Steamed greens', 'Marine'],
    ingredients: 'Steamed green tea (Camellia sinensis).',
    origin: 'Shizuoka, Japan',
    caffeine: 'Moderate caffeine',
    size,
    originalPriceCents: 4500,
    brewing: { amount: '2 g / 200 ml', water: '70–80°C', time: '1–2 min' },
    image: '/images/sencha-green-tea.jpg',
    imageAlt: 'Loose sencha green tea leaves piled in a white dish.',
  },
  {
    id: 'jasmine-green-tea',
    name: 'Moonlit Jasmine',
    variety: 'Jasmine Green Tea',
    category: 'Green',
    flavor: 'Soft green tea lifted by heady, sweet jasmine blossom.',
    description:
      'A gentle green tea layered with jasmine aroma and whole blossoms. Floral without being perfumed, it makes an elegant cup for a slow afternoon.',
    tastingNotes: ['Jasmine', 'Honeydew', 'Sweet grass'],
    ingredients: 'Green tea (Camellia sinensis), jasmine blossoms.',
    origin: 'Fujian, China',
    caffeine: 'Moderate caffeine',
    size,
    originalPriceCents: 4750,
    brewing: { amount: '2 g / 200 ml', water: '75–80°C', time: '2–3 min' },
    image: '/images/jasmine-green-tea.jpg',
    imageAlt: 'A glass of jasmine tea with jasmine blossoms floating inside.',
  },
  {
    id: 'matcha',
    name: 'Jade Whisk',
    variety: 'Matcha',
    category: 'Green',
    flavor: 'Vivid umami, sweet grass, and a velvety, lingering finish.',
    description:
      'Fine stone-ground matcha with a deep jade colour and a rounded savoury sweetness. Whisk a small scoop with hot water for a focused, vibrant bowl.',
    tastingNotes: ['Umami', 'Sweet grass', 'Cream'],
    ingredients: 'Stone-ground tencha green tea (Camellia sinensis).',
    origin: 'Japan',
    caffeine: 'High caffeine',
    size,
    originalPriceCents: 7000,
    brewing: { amount: '1–2 g / 60–80 ml', water: '80°C', time: 'Whisk until frothy' },
    image: '/images/matcha.jpg',
    imageAlt:
      'A mound of fine, vivid green matcha powder on a white surface with a spoon.',
  },
  {
    id: 'moroccan-mint-green-tea',
    name: 'Marrakech Mint',
    variety: 'Moroccan Mint Green Tea',
    category: 'Green',
    flavor: 'Gunpowder green tea with a cool wave of spearmint.',
    description:
      'A North African-style blend of green tea and spearmint. Sweeten lightly if you like, pour from a height, and serve in small glasses for a refreshing ritual.',
    tastingNotes: ['Spearmint', 'Green tea', 'Cool finish'],
    ingredients: 'Green tea (Camellia sinensis), spearmint.',
    origin: 'North African-style blend',
    caffeine: 'Moderate caffeine',
    size,
    originalPriceCents: 4000,
    brewing: { amount: '2.5 g / 200 ml', water: '80°C', time: '2–3 min' },
    image: '/images/moroccan-mint-green-tea.jpg',
    imageAlt:
      'A glass teapot and two glasses of Moroccan mint tea with fresh mint leaves.',
  },
  {
    id: 'longjing-green-tea',
    name: 'Dragon Well',
    variety: 'Longjing Green Tea',
    category: 'Green',
    flavor: 'Chestnut, toasted rice, and a mellow sweetness.',
    description:
      'Flat, pan-fired Longjing leaves brew a clear, golden-green cup with a nutty, almost buttery softness. A gentle introduction to Chinese green tea.',
    tastingNotes: ['Chestnut', 'Toasted rice', 'Butter'],
    ingredients: 'Pan-fired green tea (Camellia sinensis).',
    origin: 'Hangzhou, Zhejiang, China',
    caffeine: 'Moderate caffeine',
    size,
    originalPriceCents: 6500,
    brewing: { amount: '2 g / 200 ml', water: '75–80°C', time: '2–3 min' },
    image: '/images/longjing-green-tea.jpg',
    imageAlt:
      'Flat, jade-green Longjing tea leaves scattered on a white surface.',
  },
  {
    id: 'silver-needle-white-tea',
    name: 'Silver Threads',
    variety: 'Silver Needle White Tea',
    category: 'White',
    flavor: 'Delicate honeydew, hay, and white flowers.',
    description:
      'A light-bodied white tea made from silvery buds. The cup is pale gold and softly sweet, with a clean finish that rewards a slower sip.',
    tastingNotes: ['Honeydew', 'Hay', 'White flowers'],
    ingredients: 'White tea buds (Camellia sinensis).',
    origin: 'Fujian, China',
    caffeine: 'Low–moderate caffeine',
    size,
    originalPriceCents: 8000,
    brewing: { amount: '2.5 g / 200 ml', water: '80–85°C', time: '4–5 min' },
    image: '/images/silver-needle-white-tea.jpg',
    imageAlt:
      'Long, pale silver-white tea buds spread across a white surface.',
  },
  {
    id: 'white-peony-tea',
    name: 'Peony Mist',
    variety: 'White Peony Tea',
    category: 'White',
    flavor: 'Soft orchard fruit, cucumber, and a silky body.',
    description:
      'A relaxed, generous white tea made from young leaves and buds. It has more body than Silver Needle, with a gentle fruitiness that stays refreshing.',
    tastingNotes: ['Pear', 'Cucumber', 'Wildflowers'],
    ingredients: 'White tea leaves and buds (Camellia sinensis).',
    origin: 'Fujian, China',
    caffeine: 'Low–moderate caffeine',
    size,
    originalPriceCents: 6000,
    brewing: { amount: '2.5 g / 200 ml', water: '85°C', time: '3–5 min' },
    image: '/images/white-peony-tea.jpg',
    imageAlt:
      'A white bowl filled with loose white peony tea leaves in green and silver tones.',
  },
  {
    id: 'tieguanyin-oolong',
    name: 'Iron Goddess',
    variety: 'Tieguanyin Oolong',
    category: 'Oolong',
    flavor: 'Orchid, cream, and a lingering mineral sweetness.',
    description:
      'A lightly oxidised oolong with tightly rolled leaves and a perfumed floral aroma. The leaves open gradually, so the tea is good for several short infusions.',
    tastingNotes: ['Orchid', 'Cream', 'Wet stone'],
    ingredients: 'Oolong tea (Camellia sinensis).',
    origin: 'Anxi, Fujian, China',
    caffeine: 'Moderate caffeine',
    size,
    originalPriceCents: 6250,
    brewing: { amount: '3 g / 200 ml', water: '90–95°C', time: '3–4 min' },
    image: '/images/tieguanyin-oolong.jpg',
    imageAlt:
      'Dark green, tightly rolled Tieguanyin oolong tea leaves shown close up.',
  },
  {
    id: 'milk-oolong',
    name: 'Milk & Magnolia',
    variety: 'Milk Oolong',
    category: 'Oolong',
    flavor: 'Buttery, floral, and softly creamy.',
    description:
      'Made from the Jin Xuan cultivar, this oolong is known for its smooth, buttery aroma and gentle magnolia sweetness. A comforting, rounded cup.',
    tastingNotes: ['Butter', 'Magnolia', 'Fresh cream'],
    ingredients: 'Jin Xuan oolong tea (Camellia sinensis).',
    origin: 'Nantou, Taiwan',
    caffeine: 'Moderate caffeine',
    size,
    originalPriceCents: 6750,
    brewing: { amount: '3 g / 200 ml', water: '90°C', time: '3–4 min' },
    image: '/images/milk-oolong.jpg',
    imageAlt:
      'Light green, tightly rolled Jin Xuan oolong tea leaves on a pale surface.',
  },
  {
    id: 'pu-erh-tea',
    name: 'Cellar Door',
    variety: 'Pu-erh Tea',
    category: 'Fermented',
    flavor: 'Earthy, cocoa-rich, and deeply smooth.',
    description:
      'A fermented pu-erh with mellow, cellar-like depth and a dark, syrupy cup. Its layered character makes it a natural finish to a long meal.',
    tastingNotes: ['Cocoa', 'Old books', 'Damp earth'],
    ingredients: 'Fermented pu-erh tea (Camellia sinensis).',
    origin: 'Yunnan, China',
    caffeine: 'Moderate–high caffeine',
    size,
    originalPriceCents: 7500,
    brewing: { amount: '3 g / 200 ml', water: '95–100°C', time: '3–5 min' },
    image: '/images/pu-erh-tea.jpg',
    imageAlt: 'A round raw pu-erh tea cake wrapped in white paper.',
  },
  {
    id: 'rooibos',
    name: 'Cape Sunset',
    variety: 'Rooibos',
    category: 'Herbal',
    flavor: 'Honeyed, nutty, and naturally sweet.',
    description:
      'A caffeine-free infusion made from the needle-like leaves of the rooibos plant. Deep red in the cup, with a soft honeyed sweetness and no bitterness.',
    tastingNotes: ['Honey', 'Nuts', 'Vanilla'],
    ingredients: 'Rooibos (Aspalathus linearis).',
    origin: 'Western Cape, South Africa',
    caffeine: 'Caffeine-free',
    size,
    originalPriceCents: 3250,
    brewing: { amount: '2.5 g / 200 ml', water: '95–100°C', time: '5–7 min' },
    image: '/images/rooibos.jpg',
    imageAlt: 'A mound of fine red-brown rooibos tea in a white bowl.',
  },
  {
    id: 'chamomile',
    name: 'Golden Hour',
    variety: 'Chamomile',
    category: 'Herbal',
    flavor: 'Soft apple, honey, and golden florals.',
    description:
      'A gentle caffeine-free infusion of whole chamomile flowers. Light, fragrant, and easy to enjoy in the evening with a spoonful of honey.',
    tastingNotes: ['Apple', 'Honey', 'Chamomile'],
    ingredients: 'Dried chamomile flowers (Matricaria chamomilla).',
    origin: 'Egypt',
    caffeine: 'Caffeine-free',
    size,
    originalPriceCents: 3000,
    brewing: { amount: '2 g / 200 ml', water: '95–100°C', time: '5–7 min' },
    image: '/images/chamomile.jpg',
    imageAlt:
      'A close-up of a white chamomile flower with a yellow centre and a visiting bee.',
  },
  {
    id: 'peppermint',
    name: 'Cool Current',
    variety: 'Peppermint',
    category: 'Herbal',
    flavor: 'Bright, icy mint with a clean finish.',
    description:
      'A simple, caffeine-free peppermint infusion with a clear, cooling flavour. Excellent after dinner or blended with a little chamomile.',
    tastingNotes: ['Mint', 'Menthol', 'Clean finish'],
    ingredients: 'Dried peppermint leaves (Mentha × piperita).',
    origin: 'Pacific Northwest, USA',
    caffeine: 'Caffeine-free',
    size,
    originalPriceCents: 2750,
    brewing: { amount: '2 g / 200 ml', water: '95–100°C', time: '5–7 min' },
    image: '/images/peppermint.jpg',
    imageAlt:
      'Dried peppermint leaves filling the frame in soft green and silver tones.',
  },
  {
    id: 'hibiscus',
    name: 'Crimson Petal',
    variety: 'Hibiscus',
    category: 'Herbal',
    flavor: 'Tart cranberry, pomegranate, and ruby-red brightness.',
    description:
      'A vivid caffeine-free infusion of dried hibiscus petals. Serve it hot or over ice; its tart, berry-like brightness is especially good with a little honey.',
    tastingNotes: ['Cranberry', 'Pomegranate', 'Citrus'],
    ingredients: 'Dried hibiscus petals (Hibiscus sabdariffa).',
    origin: 'West Africa',
    caffeine: 'Caffeine-free',
    size,
    originalPriceCents: 3000,
    brewing: { amount: '2 g / 200 ml', water: '95–100°C', time: '5–7 min' },
    image: '/images/hibiscus.jpg',
    imageAlt: 'A glass cup of deep ruby-red hibiscus tea on a saucer.',
  },
  {
    id: 'ginger-lemongrass',
    name: 'Ginger Grove',
    variety: 'Ginger and Lemongrass',
    category: 'Herbal',
    flavor: 'Zesty lemongrass with a warm ginger snap.',
    description:
      'A bright, caffeine-free blend of ginger root and lemongrass. The citrus lift comes first, followed by a gentle warmth that lingers on the finish.',
    tastingNotes: ['Lemongrass', 'Ginger', 'Lemon peel'],
    ingredients: 'Ginger root, lemongrass.',
    origin: 'A warming botanical blend',
    caffeine: 'Caffeine-free',
    size,
    originalPriceCents: 3250,
    brewing: { amount: '2.5 g / 200 ml', water: '95–100°C', time: '5–7 min' },
    image: '/images/ginger-lemongrass.jpg',
    imageAlt: 'A glass mug of pale golden ginger and lemongrass tea.',
  },
]

export const productById = new Map(products.map((product) => [product.id, product]))
