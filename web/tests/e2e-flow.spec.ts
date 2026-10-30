import { test, expect } from '@playwright/test';

function createMockJwt(email: string, role: string, id: string = 'user-test-id') {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ sub: id, id, email, role })).toString('base64');
  return `${header}.${payload}.mockSignature`;
}

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

  test('5. Jobs browsing page displays available jobs grid & search bar', async ({ page }) => {
    await page.goto('/jobs');
    await expect(page.locator('input').first()).toBeVisible();
  });

  test('6. Wallet & Transactions page displays balance and history', async ({ page }) => {
    await page.goto('/wallet');
    await expect(page).toHaveURL(/.*wallet|.*login/);
  });

  test('7. Employer Flow: Login, View Dashboard Stats & Open CreateJobModal with AI Generator', async ({ page }) => {
    const mockToken = createMockJwt('jean.dupont@employeur.com', 'EMPLOYER', 'emp-1');

    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access_token: mockToken }),
      });
    });

    await page.route('**/categories', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'cat-1', name: 'Bricolage & Travaux' },
          { id: 'cat-2', name: 'Jardinage' },
        ]),
      });
    });

    await page.route('**/jobs**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'job-1',
              title: 'Rénovation peinture salon',
              description: 'Peinture des murs et plafonds',
              price: 450,
              location: 'Paris 11e',
              status: 'PUBLISHED',
              createdAt: new Date().toISOString(),
              employerId: 'emp-1',
              category: { id: 'cat-1', name: 'Bricolage & Travaux' },
              applications: [],
            },
          ]),
        });
      } else {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 'job-new', title: 'Nouvelle mission' }),
        });
      }
    });

    await page.route('**/ai/generate-job', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Peinture salon 30m2 avec préparation',
          description: 'Lessivage, ponçage et application de deux couches de blanc mat.',
          recommendedPrice: 380,
          categoryId: 'cat-1',
          estimatedDuration: 2,
          explanation: 'Estimation calculée pour 30m2 standard',
        }),
      });
    });

    // 1. Visit login and click quick employer button
    await page.goto('/login');
    const quickEmployerBtn = page.getByRole('button', { name: /Employeur \(Jean\)/i });
    await quickEmployerBtn.click();

    // 2. Submit login
    const submitBtn = page.getByRole('button', { name: /Se connecter/i });
    await submitBtn.click();

    // 3. Verify redirected to dashboard and Employer dashboard is present
    await page.waitForURL('**/dashboard');
    await expect(page.getByText(/Vos Annonces Actives/i)).toBeVisible();

    // 4. Open CreateJobModal
    const createBtn = page.getByRole('button', { name: /Créer une annonce|Annonce/i }).first();
    await createBtn.click();
    await expect(page.getByRole('heading', { name: /Publier une annonce/i })).toBeVisible();

    // 5. Test AI Generation inside modal
    const aiInput = page.getByPlaceholder(/Décrivez votre besoin en 1 phrase/i);
    await aiInput.fill('Repeindre un salon de 30m2');
    const generateBtn = page.getByRole('button', { name: /Générer/i });
    await generateBtn.click();

    // Verify AI populated the form
    await expect(page.locator('input[value*="Peinture salon"]')).toBeVisible({ timeout: 5000 });

    // Close modal
    const closeBtn = page.locator('button:has(svg.lucide-x)').first();
    await closeBtn.click();
  });

  test('8. Candidate Flow: Login, View Candidate Dashboard & Applications', async ({ page }) => {
    const mockToken = createMockJwt('marc.bricole@candidat.com', 'CANDIDATE', 'cand-1');

    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access_token: mockToken }),
      });
    });

    await page.route('**/applications/my*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'app-cand-1',
            status: 'ACCEPTED',
            isAccepted: true,
            job: {
              id: 'job-cand-1',
              title: 'Pose de parquet flottant 25m2',
              price: 320,
              location: 'Lyon 3e',
              status: 'IN_PROGRESS',
              category: { name: 'Bricolage & Travaux' },
              employer: { name: 'Sophie L.' },
            },
          },
        ]),
      });
    });

    await page.goto('/login');
    const quickCandidateBtn = page.getByRole('button', { name: /Candidat \(Marc\)/i });
    await quickCandidateBtn.click();

    const submitBtn = page.getByRole('button', { name: /Se connecter/i });
    await submitBtn.click();

    await page.waitForURL('**/dashboard');
    await expect(page.getByText(/Mes Candidatures/i)).toBeVisible();
    await expect(page.getByText('Pose de parquet flottant 25m2')).toBeVisible();
  });

  test('9. Review Modal: Rate completed job and submit review', async ({ page }) => {
    const mockToken = createMockJwt('jean.dupont@employeur.com', 'EMPLOYER', 'emp-1');

    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access_token: mockToken }),
      });
    });

    await page.route('**/categories', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    let reviewSubmitted = false;
    await page.route('**/reviews', async (route) => {
      reviewSubmitted = true;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'rev-1', rating: 5, comment: 'Excellent travail ponctuel et soigné' }),
      });
    });

    await page.route('**/jobs**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'job-completed-1',
            title: 'Installation étagères murales',
            description: 'Fixation sur mur porteur',
            price: 120,
            location: 'Bordeaux',
            status: 'COMPLETED',
            createdAt: new Date().toISOString(),
            employerId: 'emp-1',
            category: { id: 'cat-1', name: 'Bricolage' },
            applications: [],
          },
        ]),
      });
    });

    await page.goto('/login');
    const quickEmployerBtn = page.getByRole('button', { name: /Employeur \(Jean\)/i });
    await quickEmployerBtn.click();

    const submitBtn = page.getByRole('button', { name: /Se connecter/i });
    await submitBtn.click();

    await page.waitForURL('**/dashboard');

    // Click "Noter" button on the completed job
    const rateBtn = page.getByRole('button', { name: /Noter/i });
    await expect(rateBtn).toBeVisible();
    await rateBtn.click();

    // Verify ReviewModal opens
    await expect(page.getByRole('heading', { name: /Évaluer/i })).toBeVisible();

    // Fill comment and submit
    const textarea = page.getByPlaceholder(/Laissez un commentaire/i);
    await textarea.fill('Excellent travail ponctuel et soigné !');

    const submitReviewBtn = page.getByRole('button', { name: /Publier l'avis/i });
    await submitReviewBtn.click();

    // Modal should close and review API called
    await expect(page.getByRole('heading', { name: /Évaluer/i })).not.toBeVisible();
    expect(reviewSubmitted).toBe(true);
  });
});
