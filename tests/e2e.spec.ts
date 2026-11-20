import { test, expect, type Page } from '@playwright/test'
import { getSalePriceCents, products, SALE_RATE } from '../src/data/products'

const taka = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'BDT',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function money(cents: number) {
  return taka.format(cents / 100)
}

async function addProductFromShop(page: Page, name: string) {
  await page.goto('/')
  await page.locator('#tea-search').fill(name)
  const card = page.locator('.product-card').filter({ hasText: name })
  await expect(card).toHaveCount(1)
  await card.getByRole('button', { name: new RegExp(`Add to Cart for ${name}`) }).click()
  await expect(page.locator('.toast')).toContainText(`${name} added to your cart.`)
}

test('catalog contains all 20 teas with correct discount and working images', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Find your quiet cup.')

  expect(products).toHaveLength(20)
  expect(new Set(products.map((product) => product.id)).size).toBe(20)
  expect(new Set(products.map((product) => product.variety)).size).toBe(20)
  expect(new Set(products.map((product) => product.image)).size).toBe(20)

  const cards = page.locator('.product-card')
  await expect(cards).toHaveCount(20)
  await expect(page.locator('.badge-sale')).toHaveCount(20)
  await expect(page.locator('.badge-sale').first()).toHaveText('20% OFF')

  for (const product of products) {
    const card = page.locator('.product-card').filter({ hasText: product.name })
    await expect(card).toHaveCount(1)
    await expect(card).toContainText(product.variety)
    await expect(card).toContainText(product.size)
    await expect(card).toContainText(money(product.originalPriceCents))
    const sale = getSalePriceCents(product.originalPriceCents)
    expect(sale).toBe(Math.round(product.originalPriceCents * SALE_RATE))
    await expect(card).toContainText(money(sale))
    await expect(card.getByAltText(product.imageAlt)).toHaveCount(1)
  }

  for (const product of products) {
    const response = await page.request.get(product.image)
    expect(response.status(), `image for ${product.name}`).toBe(200)
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect
    .poll(
      async () =>
        page.evaluate(() =>
          Array.from(document.querySelectorAll<HTMLImageElement>('.product-card img')).every(
            (img) => img.complete && img.naturalWidth > 0,
          ),
        ),
      { timeout: 15_000 },
    )
    .toBe(true)
})

test('search, category filters, sort, product modal, and cross-page links work', async ({ page }) => {
  await page.goto('/')

  const search = page.locator('#tea-search')
  await search.fill('jasmine')
  await expect(page.locator('.product-card')).toHaveCount(1)
  await expect(page.locator('.product-card')).toContainText('Moonlit Jasmine')
  await expect(page.locator('.results-bar')).toContainText('Showing 1 tea')
  await page.getByRole('button', { name: 'Clear search' }).click()
  await expect(page.locator('.product-card')).toHaveCount(20)

  await page.getByRole('button', { name: /^Black/ }).click()
  await expect(page.locator('.product-card')).toHaveCount(5)
  await expect(page.locator('.results-bar')).toContainText('Showing 5 teas in Black')
  await expect(page.getByRole('button', { name: /^Black/ })).toHaveAttribute('aria-pressed', 'true')

  await page.getByRole('button', { name: /^Herbal/ }).click()
  await expect(page.locator('.product-card')).toHaveCount(5)
  await expect(page.locator('.product-card').filter({ hasText: 'Chamomile' })).toContainText(
    'Herbal infusion',
  )

  await page.getByRole('button', { name: /^All teas/ }).click()
  await expect(page.locator('.product-card')).toHaveCount(20)

  await page.locator('#tea-sort').selectOption('price-asc')
  await expect(page.locator('.product-card').first()).toContainText('Cool Current')
  await page.locator('#tea-sort').selectOption('price-desc')
  await expect(page.locator('.product-card').first()).toContainText('Silver Threads')
  await page.locator('#tea-sort').selectOption('name-asc')
  await expect(page.locator('.product-card').first()).toContainText('Bergamot & Blue')

  await search.fill('zzzz-no-match')
  await expect(page.getByText('No teas match that search')).toBeVisible()
  await page.getByRole('button', { name: 'Clear filters' }).last().click()
  await expect(page.locator('.product-card')).toHaveCount(20)

  const matchaDetails = page.getByRole('button', { name: 'View Details for Jade Whisk' })
  await matchaDetails.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { name: 'Jade Whisk' })).toBeVisible()
  await expect(dialog).toContainText('Stone-ground tencha green tea')
  await expect(dialog).toContainText('How to brew')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(matchaDetails).toBeFocused()

  await page.getByRole('link', { name: 'Our Teas & Services', exact: true }).click()
  await expect(page).toHaveURL(/\/teas$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('A small shelf')

  await page.getByRole('link', { name: /Shop black tea/i }).click()
  await expect(page).toHaveURL(/\?category=Black#teas/)
  await expect(page.locator('.product-card')).toHaveCount(5)
  await expect(page.locator('.results-bar')).toContainText('Showing 5 teas in Black')
})

test('clicking anywhere on a product card opens details, while add to cart still works', async ({
  page,
}) => {
  await page.goto('/')
  const card = page.locator('.product-card').filter({ hasText: 'Moonlit Jasmine' })
  await expect(card).toHaveCount(1)

  await card.click({ position: { x: 40, y: 60 } })
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { name: 'Moonlit Jasmine' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()

  await card.getByRole('button', { name: /Add to Cart for Moonlit Jasmine/ }).click()
  await expect(dialog).toBeHidden()
  await expect(page.locator('.toast')).toContainText('Moonlit Jasmine added to your cart.')
})

test('product details offer 250 g to 5 kg packs with scaled prices', async ({ page }) => {
  await page.goto('/')
  const card = page.locator('.product-card').filter({ hasText: 'Brahmaputra Dawn' })
  await card.click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('radio')).toHaveCount(7)
  await expect(dialog.getByRole('radio', { name: '250 g' })).toBeChecked()

  const addButton = dialog.getByRole('button', { name: /Add to Cart/ })
  await expect(addButton).toContainText(money(3200))

  await dialog.getByRole('radio', { name: '1 kg' }).check()
  await expect(addButton).toContainText(money(12800))
  await addButton.click()
  await expect(dialog).toBeHidden()

  await page.getByRole('link', { name: '1 item in cart' }).click()
  await expect(page.locator('.cart-line')).toContainText('1 kg pouch')
  await expect(page.locator('.cart-unit-price')).toContainText('৳128.00 each')
})

test('cart totals, quantity changes, free shipping threshold, persistence, and empty state', async ({
  page,
}) => {
  await addProductFromShop(page, 'Brahmaputra Dawn')
  await expect(page.getByRole('link', { name: '1 item in cart' })).toBeVisible()
  await page.getByRole('link', { name: '1 item in cart' }).click()

  await expect(page).toHaveURL(/\/cart$/)
  await expect(page.locator('.cart-line')).toHaveCount(1)
  await expect(page.locator('.cart-line')).toContainText('Brahmaputra Dawn')
  await expect(page.locator('.cart-line')).toContainText('250 g pouch')
  await expect(page.locator('.cart-unit-price')).toContainText('৳32.00 each')
  await expect(page.locator('.cart-line-total')).toContainText('৳32.00')

  const summary = page.locator('.summary-card')
  await expect(summary).toContainText('৳32.00')
  await expect(summary).toContainText('−৳8.00')
  await expect(summary).toContainText('৳4.95')
  await expect(summary).toContainText('৳36.95')
  await expect(summary).toContainText('already in the prices above')

  await page.getByRole('button', { name: /Increase quantity of Brahmaputra Dawn/ }).click()
  await expect(page.getByRole('link', { name: '2 items in cart' })).toBeVisible()
  await expect(summary).toContainText('৳64.00')
  await expect(summary).toContainText('−৳16.00')

  await page.reload()
  await expect(page.locator('.qty-value')).toHaveText('2')
  await expect(summary).toContainText('৳64.00')

  await page.getByRole('button', { name: /Increase quantity of Brahmaputra Dawn/ }).click()
  await expect(summary).toContainText('৳96.00')
  await expect(summary.locator('.free-shipping')).toHaveText('Free')
  await expect(summary).toContainText('Free shipping unlocked')
  await expect(summary.locator('.summary-list')).not.toContainText('৳4.95')

  const stored = await page.evaluate(() =>
    window.localStorage.getItem('leaf-kettle-cart-v1'),
  )
  expect(JSON.parse(stored ?? '[]')).toEqual([
    { productId: 'assam-black-tea', grams: 250, quantity: 3 },
  ])

  await page.getByRole('button', { name: /Remove Brahmaputra Dawn/ }).click()
  await expect(page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible()
  await expect(page.getByRole('link', { name: '0 items in cart' })).toBeVisible()
})

test('checkout validates required fields and email, then confirms a demo order and clears cart', async ({
  page,
}) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await addProductFromShop(page, 'Brahmaputra Dawn')
  await page.goto('/checkout')

  await expect(page.locator('.demo-banner')).toContainText('This is a demonstration checkout.')
  const summary = page.locator('.checkout-summary')
  await expect(summary).toContainText('Brahmaputra Dawn')
  await expect(summary).toContainText('Qty 1')
  await expect(summary).toContainText('৳32.00')
  await expect(summary).toContainText('৳4.95')
  await expect(summary).toContainText('৳36.95')

  await page.getByRole('button', { name: /Pay .*test mode/ }).click()
  await expect(page.getByRole('alert')).toContainText('Please check the highlighted fields')
  await expect(page.getByLabel(/Full name/)).toBeFocused()

  await page.getByLabel(/Full name/).fill('Ada Lovelace')
  await page.getByLabel(/Email address/).fill('not-an-email')
  await page.getByLabel(/Phone number/).fill('+880 1712-345678')
  await page.getByLabel(/Street address/).fill('12 Tea Garden Lane')
  await page.getByLabel(/City or town/).fill('Portland')
  await page.getByLabel(/Postal code/).fill('97205')
  await page.getByLabel(/Country/).selectOption('United States')
  await page.getByRole('button', { name: /Pay .*test mode/ }).click()
  await expect(page.getByText('Enter a valid email address, such as name@example.com.')).toBeVisible()
  await expect(page.getByLabel(/Email address/)).toBeFocused()

  await page.getByLabel(/Email address/).fill('ada@example.com')
  await expect(page.getByText('Enter a valid email address, such as name@example.com.')).toBeHidden()

  await page.getByLabel(/Name on card/).fill('Ada Lovelace')
  await page.getByLabel(/Card number/).fill('4242 4242 4242 4242')
  await page.getByLabel(/Expiry/).fill('12/29')
  await page.getByLabel(/CVC/).fill('123')

  await page.getByRole('button', { name: /Pay .*test mode/ }).click()
  await expect(page.getByRole('heading', { name: 'Thank you, Ada.' })).toBeVisible()
  await expect(page.getByText(/Demo order confirmed|Order received/)).toBeVisible()
  await expect(page.locator('.order-number-box strong')).toHaveText(/^[2-9A-HJ-NP-Z]{10}$/)
  await expect(page.locator('.confirmation-card')).toContainText('test mode')
  await expect(page.locator('.confirmation-card')).toContainText('4242')
  await expect(page.locator('.confirmation-note')).toContainText(/No payment was taken|recorded for the shop/)
  await expect(page.locator('.confirmation-card')).toContainText('৳32.00')
  await expect(page.locator('.confirmation-card')).toContainText('৳4.95')
  await expect(page.locator('.confirmation-card')).toContainText('৳36.95')
  await expect(page.getByRole('link', { name: '0 items in cart' })).toBeVisible()

  const stored = await page.evaluate(() =>
    window.localStorage.getItem('leaf-kettle-cart-v1'),
  )
  expect(JSON.parse(stored ?? '[]')).toEqual([])

  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible()
  expect(pageErrors).toEqual([])
})

test('mobile layout, menu, shopping, and checkout summary are usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible()
  await page.getByRole('button', { name: 'Open menu' }).click()
  await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeVisible()
  await page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: 'Our Teas & Services' }).click()
  await expect(page).toHaveURL(/\/teas$/)
  await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeHidden()

  await page.goto('/')
  await page.locator('#tea-search').fill('Peppermint')
  const card = page.locator('.product-card').filter({ hasText: 'Cool Current' })
  await card.getByRole('button', { name: 'Add to Cart for Cool Current' }).click()
  await page.getByRole('link', { name: '1 item in cart' }).click()
  await expect(page.locator('.cart-line')).toContainText('Cool Current')

  await page.getByRole('link', { name: /Proceed to checkout/ }).click()
  await expect(page.locator('.checkout-summary')).toBeVisible()
  const summaryBox = await page.locator('.checkout-summary').boundingBox()
  const formBox = await page.locator('.checkout-form').boundingBox()
  expect(summaryBox?.y ?? 0).toBeLessThan(formBox?.y ?? 0)
  await expect(page.getByRole('button', { name: /Pay .*test mode/ })).toBeVisible()

  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390)
  await expect(page.locator('body')).toHaveJSProperty('clientWidth', 390)
})

