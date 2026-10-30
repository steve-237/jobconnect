import { test, expect } from '@playwright/test';

function createMockJwt(email: string, role: string, id: string = 'user-test-id', expOffsetSec: number = 3600) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const exp = Math.floor(Date.now() / 1000) + expOffsetSec;
  const payload = Buffer.from(JSON.stringify({ sub: id, id, email, role, exp })).toString('base64');
  return `${header}.${payload}.mockSignature`;
}

test.describe('Routing & Navigation System Verification', () => {

  // Scenario 1: Public Routes Direct Access
  test('1. Public routes (/ and /jobs) load directly without bounce loops or blank screens', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('http://127.0.0.1:3000/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('link', { name: /Browse Jobs|Missions/i }).first()).toBeVisible();

    // Direct access to /jobs
    await page.goto('/jobs');
    await expect(page).toHaveURL('http://127.0.0.1:3000/jobs');
    await expect(page.getByText(/Missions trouvées/i)).toBeVisible();
  });

  // Scenario 2: 404 Fallback & Recovery
  test('2. Unknown URLs display the branded 404 Not Found page with recovery buttons', async ({ page }) => {
    await page.goto('/unknown-page-route-test');
    await expect(page.getByText(/Erreur 404 — Page Introuvable/i)).toBeVisible();
    await expect(page.getByText(/Oups ! Destination inconnue/i)).toBeVisible();

    // Test recovery buttons
    const dashboardLink = page.getByRole('link', { name: /Tableau de bord/i });
    await expect(dashboardLink).toBeVisible();

    const jobsLink = page.getByRole('link', { name: /Voir les missions/i });
    await expect(jobsLink).toBeVisible();

    await jobsLink.click();
    await expect(page).toHaveURL(/.*jobs/);
  });

  // Scenario 3: Unauthenticated Access & Redirect Preservation
  test('3. Protected routes redirect unauthenticated users to login with ?redirect= parameter preserved', async ({ page }) => {
    const protectedRoutes = ['/wallet', '/calendar', '/profile', '/disputes', '/jobs/create', '/admin', '/dashboard'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(`/login\\?redirect=(${encodeURIComponent(route)}|${route.replace(/\//g, '\\/')})`));
    }
  });

  // Scenario 4: Login with Redirect Parameter
  test('4. Logging in with a ?redirect= parameter navigates to the intended destination', async ({ page }) => {
    const candidateToken = createMockJwt('candidate@test.com', 'CANDIDATE', 'cand-1');

    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access_token: candidateToken }),
      });
    });

    await page.goto('/login?redirect=/wallet');

    // Fill in credentials and submit
    await page.locator('input[type="email"]').fill('candidate@test.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.getByRole('button', { name: /Se connecter/i }).click();

    // Verify user is redirected to the intended destination (/wallet)
    await expect(page).toHaveURL(/.*wallet/);
  });

  // Scenario 5: Authenticated User Role-based Routing (Candidate vs Employer vs Admin)
  test('5. Role-based routing enforces proper dashboard and permissions', async ({ page }) => {
    const employerToken = createMockJwt('jean.dupont@employeur.com', 'EMPLOYER', 'emp-1');

    // Mock localStorage token for employer
    await page.addInitScript((token) => {
      window.localStorage.setItem('token', token);
    }, employerToken);

    // Mock backend calls
    await page.route('**/jobs/employer/my-jobs', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.route('**/categories', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.route('**/payments/transactions', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ transactions: [], availableBalance: 150 }) });
    });

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText(/EMPLOYER/i)).toBeVisible();

    // Candidate attempting to access /jobs/create is redirected
    const candidateToken = createMockJwt('marc.bricole@candidat.com', 'CANDIDATE', 'cand-1');
    await page.addInitScript((token) => {
      window.localStorage.setItem('token', token);
    }, candidateToken);

    await page.goto('/jobs/create');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  // Scenario 6: Deep linking via ?tab= parameter on Dashboard
  test('6. Dashboard supports deep linking to specific tabs via URL query params', async ({ page }) => {
    const candidateToken = createMockJwt('marc.bricole@candidat.com', 'CANDIDATE', 'cand-1');

    await page.addInitScript((token) => {
      window.localStorage.setItem('token', token);
    }, candidateToken);

    await page.route('**/applications/my-applications', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.route('**/payments/transactions', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ transactions: [], availableBalance: 50 }) });
    });

    // Deep link to wallet tab
    await page.goto('/dashboard?tab=wallet');
    await expect(page.getByText(/Gains & Portefeuille Prestataire/i)).toBeVisible();
  });

  // Scenario 7: Standalone Direct Access to Nested Pages with Breadcrumbs & Navigation Header
  test('7. Standalone routes (/wallet, /profile, /disputes) render NavigationHeader and Breadcrumbs', async ({ page }) => {
    const candidateToken = createMockJwt('marc.bricole@candidat.com', 'CANDIDATE', 'cand-1');

    await page.addInitScript((token) => {
      window.localStorage.setItem('token', token);
    }, candidateToken);

    await page.route('**/payments/transactions', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ transactions: [], availableBalance: 0 }) });
    });

    await page.goto('/wallet');
    // Verify breadcrumb is present
    await expect(page.getByRole('navigation', { name: /Fil d'Ariane/i })).toBeVisible();
    await expect(page.getByText(/Portefeuille/i).first()).toBeVisible();

    // Verify back navigation button exists
    const backBtn = page.getByRole('button', { name: /Retour/i });
    await expect(backBtn).toBeVisible();
  });

  // Scenario 8: Session Expiration Notification
  test('8. Navigating to login with expired=true shows session expiration banner', async ({ page }) => {
    await page.goto('/login?expired=true');
    await expect(page.getByText(/Votre session a expiré/i)).toBeVisible();
  });

  // Scenario 9: Browser Back and Forward Navigation
  test('9. Browser Back and Forward navigation functions smoothly without errors', async ({ page }) => {
    await page.goto('/');
    await page.goto('/jobs');
    await expect(page).toHaveURL(/.*jobs/);

    await page.goBack();
    await expect(page).toHaveURL('http://127.0.0.1:3000/');

    await page.goForward();
    await expect(page).toHaveURL(/.*jobs/);
  });
});
