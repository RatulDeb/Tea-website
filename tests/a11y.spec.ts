import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function seriousViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  return results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
}

const pages = ['/', '/teas', '/cart', '/checkout', '/credits', '/missing-page']

for (const path of pages) {
  test(`axe ${path}`, async ({ page }) => {
    await page.goto(path)
    if (path === '/cart' || path === '/checkout') {
      await page.evaluate(() => {
        window.localStorage.setItem(
          'leaf-kettle-cart-v1',
          JSON.stringify([{ productId: 'assam-black-tea', quantity: 1 }]),
        )
      })
      await page.reload()
    }
    const serious = await seriousViolations(page)
    expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([])
  })
}

test('axe product dialog', async ({ page }) => {
  await page.goto('/')
  await page.locator('.product-card').first().getByRole('button', { name: /View Details for/ }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  const serious = await seriousViolations(page)
  expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([])
})

test('axe checkout validation state', async ({ page }) => {
  await page.goto('/checkout')
  await expect(page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible()
  await page.evaluate(() => {
    window.localStorage.setItem(
      'leaf-kettle-cart-v1',
      JSON.stringify([{ productId: 'assam-black-tea', quantity: 1 }]),
    )
  })
  await page.reload()
  await page.getByRole('button', { name: /Pay .*test mode/ }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  const serious = await seriousViolations(page)
  expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([])
})

test('axe mobile menu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open menu' }).click()
  await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeVisible()
  const serious = await seriousViolations(page)
  expect(serious, JSON.stringify(serious.map((v) => v.id))).toEqual([])
})
