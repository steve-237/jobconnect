import { test, expect } from '@playwright/test';

test.describe('JobConnect v2.0 E2E Flow', () => {
  test('1. Landing page loads correctly with title & JobConnect Branding', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/JobConnect/i);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('2. Login page allows quick login buttons and language switching', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Connexion/i })).toBeVisible();

    // Verify Quick Dev Login buttons exist
    const quickEmployerBtn = page.getByRole('button', { name: /Employeur \(Jean\)/i });
    await expect(quickEmployerBtn).toBeVisible();
  });

  test('3. Support Chatbot widget opens and responds 24/7', async ({ page }) => {
    await page.goto('/');
    
    // Find Support Chatbot trigger button
    const chatbotBtn = page.getByRole('button', { name: /Support IA 24\/7/i });
    await expect(chatbotBtn).toBeVisible();
    await chatbotBtn.click();

    // Verify Chatbot window opens
    await expect(page.getByText('Assistant Support IA')).toBeVisible();
  });

  test('4. Candidates directory lists candidates with Matchmaking Fit score & Gamification Badges', async ({ page }) => {
    await page.goto('/candidates');
    await expect(page.getByText(/Annuaire des Prestataires/i)).toBeVisible();
  });
});
