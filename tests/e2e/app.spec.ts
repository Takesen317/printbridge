import { expect, test } from '@playwright/test'

test.describe('PrintBridge core workflow', () => {
  test('loads the Color Lab workflow shell', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1, name: 'Color Lab' })).toBeVisible()
    await expect(page.getByText('Import an image, inspect representative color shifts, and preview a soft-proof style output.')).toBeVisible()
    await expect(page.getByText('Import', { exact: true })).toBeVisible()
    await expect(page.getByText('Analyze', { exact: true })).toBeVisible()
    await expect(page.getByText('Preview', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { level: 3, name: 'Import image' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Choose file' })).toBeVisible()
  })

  test('switches between the first three readable workflow headings with keyboard shortcuts on Windows/Linux shells', async ({ page }) => {
    await page.goto('/')

    await page.keyboard.press('Control+1')
    await expect(page.getByRole('heading', { level: 1, name: 'Color Lab' })).toBeVisible()

    await page.keyboard.press('Control+2')
    await expect(page.getByRole('heading', { level: 1, name: 'Cross-Media Preview' })).toBeVisible()
    await expect(page.getByText('Compare on-screen content with simulated print-style output under different viewing conditions.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Refresh preview' })).toBeVisible()

    await page.keyboard.press('Control+3')
    await expect(page.getByRole('heading', { level: 1, name: 'Smart Print Adapter' })).toBeVisible()
    await expect(page.getByText('Run heuristic print-readiness checks for resolution, gamut risk, color workflow, and likely bleed issues.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Run checks' })).toBeVisible()
  })

  test('keeps the core workflow shell available across the main module path', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1, name: 'Color Lab' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Choose file' })).toBeVisible()

    await page.keyboard.press('Control+2')
    await expect(page.getByRole('heading', { level: 1, name: 'Cross-Media Preview' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Refresh preview' })).toBeVisible()

    await page.keyboard.press('Control+3')
    await expect(page.getByRole('heading', { level: 1, name: 'Smart Print Adapter' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Run checks' })).toBeVisible()

    await page.keyboard.press('Control+1')
    await expect(page.getByRole('heading', { level: 1, name: 'Color Lab' })).toBeVisible()
  })
})
