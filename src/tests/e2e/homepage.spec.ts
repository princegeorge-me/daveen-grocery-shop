import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('loads and displays hero section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText(/authentic african/i)).toBeVisible()
  })

  test('shows featured products', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/featured products/i)).toBeVisible()
  })

  test('navigates to products page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /shop now/i }).first().click()
    await expect(page).toHaveURL('/products')
  })
})

test.describe('Product Catalog', () => {
  test('loads product grid', async ({ page }) => {
    await page.goto('/products')
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('can search products', async ({ page }) => {
    await page.goto('/products?search=egusi')
    await expect(page.getByRole('main')).toBeVisible()
  })
})

test.describe('Cart', () => {
  test('shows empty state when no items', async ({ page }) => {
    await page.goto('/cart')
    await expect(page.getByText(/your cart is empty/i)).toBeVisible()
  })
})
