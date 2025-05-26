import { test, expect } from '@playwright/test';
import path from 'path';

test.setTimeout(30_000);

test('full order flow via credit card', async ({ page }) => {
    await page.goto('/');

    await page.setInputFiles('input[type="file"]', path.join(__dirname, 'fixtures', 'sample.step'));
    await page.click('button:has-text("Upload Files")');

    await page.click('[data-cy="material-btn"] >> nth=0');
    await page.click('button:has-text("To Checkout")');

    await page.fill('input[placeholder="Name"]', 'Playwright User');
    await page.fill('input[placeholder="Email"]', 'pw@example.com');

    await page.click('label:has-text("Credit Card")');

    await page.fill('input[placeholder="Card Number"]', '4242424242424242');
    await page.fill('input[placeholder="Card Holder Name"]', 'Playwright User');
    await page.fill('input[placeholder="CVV"]', '123');

    await page.click('button:has-text("Place Order")');

    await page.waitForSelector('text=Confirm Your Order', { timeout: 10_000 });
    await expect(page.locator('text=Confirm Your Order')).toBeVisible();

    await page.click('button:has-text("Confirm & Place")');

    await expect(page.locator('text=Thank You!')).toBeVisible();
});