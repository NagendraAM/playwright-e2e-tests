import { test, expect } from '@playwright/test';

test.describe('Katalon Demo Cura App', () => {
  test('homepage should load with correct title and header', async ({ page }) => {
    await page.goto('https://katalon-demo-cura.herokuapp.com/');

    await expect(page).toHaveTitle('CURA Healthcare Service');

    const header = page.locator('h1');
    await expect(header).toHaveText('CURA Healthcare Service');
  });
});
