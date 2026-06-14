import { Page, Locator, expect } from '@playwright/test';

/**
 * `LoginPage` encapsulates selectors and actions for the CURA login flow.
 *
 * Purpose: centralize selectors and common operations so tests stay readable
 * and maintenance is simplified. Tests should call `goto()` then use
 * `login()` to perform the action.
 *
 * Selectors are kept as `Locator` objects so assertions can be made directly
 * on them from tests.
 */
export class LoginPage {
  readonly page: Page;
  readonly username: Locator; // Username input field
  readonly password: Locator; // Password input field
  readonly loginButton: Locator; // Login button
  readonly errorMessage: Locator; // Error message shown on failed login
  readonly header: Locator; // Page header (h2) used for contextual assertions

  constructor(page: Page) {
    this.page = page;
    this.username = page.locator('#txt-username');
    this.password = page.locator('#txt-password');
    this.loginButton = page.locator('#btn-login');
    this.errorMessage = page.locator('.lead.text-danger');
    this.header = page.locator('h2');
  }

  /**
   * Navigate to the application and open the login form.
   * Notes:
   * - We wait for DOMContentLoaded to reduce flakiness.
   * - Rely on the username input visibility rather than strict navigation
   *   promises (avoids hanging workers if the page triggers background
   *   navigations).
   */
  async goto() {
    await this.page.goto('https://katalon-demo-cura.herokuapp.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.click('text=Make Appointment');
    // Wait for the username field to appear; don't block on navigation to avoid hanging workers
    await expect(this.username).toBeVisible({ timeout: 15000 });
  }

  /**
   * Fill and submit the login form.
   * Keep this method focused (no assertions) so tests can decide what to assert
   * after calling `login()` (positive, negative, regression scenarios, etc.).
   */
  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }
}
