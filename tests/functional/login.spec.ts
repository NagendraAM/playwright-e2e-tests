import { test, expect } from '@playwright/test';
import { LoginPage } from '../page_objects/loginPage';

// Read credentials from environment (use .env or CI secrets)
const VALID_USERNAME = process.env.VALID_USERNAME || '';
const VALID_PASSWORD = process.env.VALID_PASSWORD || '';

/**
 * Login test suite covers multiple scenario types:
 * - Positive: a valid credential login that should succeed.
 * - Negative: invalid inputs and empty fields should produce appropriate
 *             validation or visible error messages.
 * - Regression: checks for previously observed misbehavior (e.g. input
 *               clearing unexpectedly after failed submit).
 * - Edge: adversarial or unusual input (SQL injection, very long strings)
 *         should fail safely without exposing data or breaking the app.
 */
test.describe('Login - Katalon Demo Cura', () => {
  // UI Smoke: Validate form elements are present and clearly labelled.
  test('UI: form elements are visible and labelled', async ({ page }) => {
    const p = new LoginPage(page);
    await p.goto();

    // Basic visibility checks (sanity/positive UI smoke)
    await expect(p.username).toBeVisible();
    await expect(p.password).toBeVisible();
    await expect(p.loginButton).toBeVisible();
    await expect(p.header).toContainText('Login');
  });

  // Negative scenario: empty credentials should trigger browser validation
  // or server-side error message. Tests tolerate either behaviour to remain
  // robust across app implementations.
  test('Negative: empty credentials show validation or error', async ({ page }) => {
    const p = new LoginPage(page);
    await p.goto();

    await p.login('', '');

    // Some implementations rely on `required` attribute; others show an error
    const usernameRequired = await p.username.getAttribute('required');
    const passwordRequired = await p.password.getAttribute('required');
    if (usernameRequired || passwordRequired) {
      expect(usernameRequired || passwordRequired).toBeTruthy();
    } else {
      await expect(p.errorMessage).toBeVisible();
    }
  });

  // Negative scenario: invalid credentials must produce a visible error message
  // (server-side authentication failure). Keep assertions narrow and stable.
  test('Negative: invalid credentials show error', async ({ page }) => {
    const p = new LoginPage(page);
    await p.goto();

    await p.login('invalid_user', 'wrong_pass');
    await expect(p.errorMessage).toBeVisible();
  });

  // Edge case: malicious or oversized input should not log in and should
  // be handled gracefully (no crashes, no leakage of sensitive info).
  test('Edge: sql injection and long strings produce safe failure', async ({ page }) => {
    const p = new LoginPage(page);
    await p.goto();

    await p.login("' OR 1=1; --", 'a'.repeat(500));
    await expect(p.errorMessage).toBeVisible();
  });

  // Regression: some previous regressions cleared inputs on failed submit.
  // We assert that the input either preserves the entered value or is
  // intentionally cleared — both behaviours are accepted, but sudden
  // unexpected changes should be investigated.
  test('Regression: inputs preserve value on failed login (or are cleared)', async ({ page }) => {
    const p = new LoginPage(page);
    await p.goto();

    await p.login('preserveUser', 'wrong_pass');
    const current = await p.username.inputValue();
    // Accept either preserved username or intentionally cleared value
    expect(['preserveUser', '']).toContain(current);
  });

  // Positive scenario: when valid credentials are provided the app should
  // navigate to the appointment page. This test is skipped unless
  // VALID_USERNAME and VALID_PASSWORD are set (local .env or CI secrets).
  test('Positive: successful login with valid credentials', async ({ page }) => {
    test.skip(!VALID_USERNAME || !VALID_PASSWORD, 'VALID_USERNAME and VALID_PASSWORD not set');
    const p = new LoginPage(page);
    await p.goto();

    await p.login(VALID_USERNAME, VALID_PASSWORD);
    await expect(page.locator('h2')).toContainText('Make Appointment');
  });
});
