const fs = require('fs');
const path = require('path');
const { chromium } = require('d:/formations_personnelles/platforme-jobs/web/node_modules/@playwright/test');

function toBase64(filePath) {
  const data = fs.readFileSync(filePath);
  return 'data:image/png;base64,' + data.toString('base64');
}

const heroBase64 = toBase64('d:/formations_personnelles/platforme-jobs/presentation-assets/screen-hero.png');
const featuresBase64 = toBase64('d:/formations_personnelles/platforme-jobs/presentation-assets/screen-features.png');
const loginBase64 = toBase64('d:/formations_personnelles/platforme-jobs/presentation-assets/screen-login.png');

const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>JobConnect - Présentation Officielle</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 2560px;
      height: 1440px;
      background-color: #05070C;
      color: #F8FAFC;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 44px 60px 38px 60px;
    }

    /* Ambient background glows */
    .bg-glow-1 {
      position: absolute;
      width: 1000px;
      height: 1000px;
      left: 100px;
      top: -220px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, rgba(99, 102, 241, 0) 70%);
      filter: blur(140px);
      pointer-events: none;
      z-index: 0;
    }
    .bg-glow-2 {
      position: absolute;
      width: 1100px;
      height: 1100px;
      right: 50px;
      top: 50px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, rgba(59, 130, 246, 0) 70%);
      filter: blur(150px);
      pointer-events: none;
      z-index: 0;
    }
    .bg-glow-3 {
      position: absolute;
      width: 900px;
      height: 900px;
      right: 400px;
      bottom: -180px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0) 70%);
      filter: blur(140px);
      pointer-events: none;
      z-index: 0;
    }

    /* Tech grid overlay */
    .bg-grid {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
      background-size: 55px 55px;
      pointer-events: none;
      z-index: 1;
    }

    /* Content container */
    .content-wrap {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
    }

    /* TOP HEADER */
    .top-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.09);
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 18px;
    }
    .brand-logo-icon {
      width: 52px;
      height: 52px;
      background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 35px rgba(59, 130, 246, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .brand-logo-icon svg {
      width: 30px;
      height: 30px;
      fill: #FFFFFF;
    }
    .brand-text h1 {
      font-size: 34px;
      font-weight: 900;
      letter-spacing: -0.8px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-text h1 span {
      background: linear-gradient(135deg, #FFFFFF 40%, #94A3B8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .brand-text p {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #F59E0B;
      text-transform: uppercase;
      margin-top: 2px;
    }
    
    .center-badge {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 24px;
      background: rgba(59, 130, 246, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.35);
      border-radius: 100px;
      box-shadow: 0 0 25px rgba(59, 130, 246, 0.25);
    }
    .pulse-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 14px #10B981;
    }
    .center-badge span {
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.6px;
      color: #93C5FD;
      text-transform: uppercase;
    }

    .tech-tags {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .tag {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      color: #CBD5E1;
      backdrop-filter: blur(10px);
    }
    .tag.highlight {
      background: rgba(99, 102, 241, 0.2);
      border-color: rgba(99, 102, 241, 0.45);
      color: #A5B4FC;
    }

    /* MAIN SHOWCASE AREA */
    .showcase-grid {
      display: grid;
      grid-template-columns: 1.48fr 1fr;
      gap: 30px;
      margin-top: 22px;
      margin-bottom: 22px;
      align-items: stretch;
      flex: 1;
    }

    /* LEFT COLUMN: HERO BROWSER MOCKUP */
    .browser-window {
      background: #000000;
      border-radius: 22px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      box-shadow: 
        0 30px 90px rgba(0, 0, 0, 0.9),
        0 0 60px rgba(59, 130, 246, 0.25);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .browser-header {
      background: rgba(15, 23, 42, 0.95);
      padding: 13px 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(14px);
    }
    .window-dots {
      display: flex;
      gap: 9px;
    }
    .dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
    }
    .dot.red { background: #EF4444; }
    .dot.yellow { background: #F59E0B; }
    .dot.green { background: #10B981; }

    .browser-url-bar {
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 7px 26px;
      border-radius: 100px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      font-weight: 600;
      color: #94A3B8;
      width: 470px;
      justify-content: center;
    }
    .browser-url-bar svg {
      width: 14px;
      height: 14px;
      fill: #10B981;
    }

    .window-badge {
      font-size: 12px;
      font-weight: 800;
      color: #38BDF8;
      background: rgba(56, 189, 248, 0.14);
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 5px 14px;
      border-radius: 100px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .browser-screen {
      flex: 1;
      width: 100%;
      height: 100%;
      background: #000000;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .browser-screen img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }

    /* RIGHT COLUMN: 2 TILES */
    .right-column {
      display: flex;
      flex-direction: column;
      gap: 22px;
      justify-content: space-between;
    }

    /* TILE BASE */
    .tile-card {
      background: rgba(15, 23, 42, 0.78);
      border-radius: 22px;
      border: 1px solid rgba(255, 255, 255, 0.13);
      box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.7),
        0 0 40px rgba(99, 102, 241, 0.18);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      backdrop-filter: blur(20px);
      position: relative;
    }
    .tile-card.features-tile {
      height: 51%;
    }
    .tile-card.login-tile {
      height: 49%;
    }

    .tile-header {
      padding: 12px 22px;
      background: rgba(255, 255, 255, 0.04);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .tile-title {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #E2E8F0;
      display: flex;
      align-items: center;
      gap: 9px;
    }
    .tile-title-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #6366F1;
      box-shadow: 0 0 10px #6366F1;
    }
    .tile-tag {
      font-size: 11px;
      font-weight: 700;
      padding: 4px 11px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.08);
      color: #CBD5E1;
    }

    /* FEATURES TILE CONTENT */
    .tile-content-features {
      flex: 1;
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: relative;
      background: #000000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .tile-content-features img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }

    /* LOGIN MODAL CONTAINER */
    .tile-content-login {
      flex: 1;
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at center, #0F172A 0%, #030712 100%);
    }
    .login-cropper {
      width: 540px;
      height: 100%;
      overflow: hidden;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .login-cropper img {
      width: 1024px;
      max-width: none;
      height: 100%;
      object-fit: contain;
    }

    /* FLOATING PILL CALLOUTS */
    .floating-pill {
      position: absolute;
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 10px 20px;
      background: rgba(15, 23, 42, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 100px;
      box-shadow: 0 18px 45px rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(25px);
      z-index: 10;
    }
    .pill-icon {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
    .pill-text {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.3px;
    }

    /* BOTTOM BAR */
    .bottom-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.09);
    }
    .highlights-list {
      display: flex;
      align-items: center;
      gap: 32px;
    }
    .highlight-item {
      display: flex;
      align-items: center;
      gap: 13px;
    }
    .highlight-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 19px;
    }
    .icon-emerald {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34D399;
    }
    .icon-blue {
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.35);
      color: #60A5FA;
    }
    .icon-indigo {
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.35);
      color: #A5B4FC;
    }
    .icon-purple {
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.35);
      color: #C084FC;
    }
    .highlight-text h4 {
      font-size: 14px;
      font-weight: 800;
      color: #F8FAFC;
    }
    .highlight-text p {
      font-size: 12px;
      color: #94A3B8;
      margin-top: 2px;
    }

    .status-stamp {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 22px;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.32);
      border-radius: 14px;
    }
    .status-stamp span {
      font-size: 13px;
      font-weight: 800;
      color: #34D399;
      letter-spacing: 0.6px;
    }
  </style>
</head>
<body>
  <!-- Ambient background lighting -->
  <div class="bg-glow-1"></div>
  <div class="bg-glow-2"></div>
  <div class="bg-glow-3"></div>
  <div class="bg-grid"></div>

  <div class="content-wrap">
    <!-- TOP HEADER -->
    <header class="top-header">
      <div class="brand-section">
        <div class="brand-logo-icon">
          <svg viewBox="0 0 24 24">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"/>
          </svg>
        </div>
        <div class="brand-text">
          <h1><span>JobConnect</span></h1>
          <p>Petits Jobs & Services Ponctuels ⚡</p>
        </div>
      </div>

      <div class="center-badge">
        <div class="pulse-dot"></div>
        <span>Interfaces Réelles Développées • Version Officielle</span>
      </div>

      <div class="tech-tags">
        <div class="tag highlight">Next.js 16 (App Router)</div>
        <div class="tag highlight">NestJS + Prisma</div>
        <div class="tag">PostgreSQL</div>
        <div class="tag">TailwindCSS Glassmorphism</div>
        <div class="tag">Socket.io</div>
      </div>
    </header>

    <!-- MAIN SHOWCASE GRID -->
    <main class="showcase-grid">
      <!-- LEFT: BROWSER MOCKUP WITH HERO SCREENSHOT -->
      <div class="browser-window">
        <div class="browser-header">
          <div class="window-dots">
            <div class="dot red"></div>
            <div class="dot yellow"></div>
            <div class="dot green"></div>
          </div>
          <div class="browser-url-bar">
            <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z"/></svg>
            https://jobconnect.app — Page d'Accueil & Recherche
          </div>
          <div class="window-badge">Plateforme Web Live</div>
        </div>

        <div class="browser-screen">
          <img src="${heroBase64}" alt="Interface Accueil JobConnect">
        </div>

        <!-- Floating callouts over browser -->
        <div class="floating-pill" style="bottom: 24px; left: 28px;">
          <div class="pill-icon" style="background: rgba(16, 185, 129, 0.2); color: #34D399;">✓</div>
          <div class="pill-text" style="color: #F8FAFC;">Design Glassmorphism & Dark Mode Natif</div>
        </div>

        <div class="floating-pill" style="bottom: 24px; right: 28px;">
          <div class="pill-icon" style="background: rgba(99, 102, 241, 0.2); color: #818CF8;">🤖</div>
          <div class="pill-text" style="color: #F8FAFC;">Support IA 24/7 Intégré</div>
        </div>
      </div>

      <!-- RIGHT: 2 TILES FOR FEATURES AND LOGIN -->
      <div class="right-column">
        <!-- TILE 1: REAL FEATURES SCREEN -->
        <div class="tile-card features-tile">
          <div class="tile-header">
            <div class="tile-title">
              <div class="tile-title-dot"></div>
              Pourquoi Nous Choisir • Built for Trust & Speed
            </div>
            <div class="tile-tag">Fonctionnalités Clés</div>
          </div>
          <div class="tile-content-features">
            <img src="${featuresBase64}" alt="Fonctionnalités Réelles JobConnect">
          </div>
        </div>

        <!-- TILE 2: REAL LOGIN MODAL SCREEN (CLEANLY FRAMED TO THE REAL CARD) -->
        <div class="tile-card login-tile">
          <div class="tile-header">
            <div class="tile-title">
              <div class="tile-title-dot" style="background: #3B82F6; box-shadow: 0 0 10px #3B82F6;"></div>
              Espace Connexion & Authentification Sécurisée
            </div>
            <div class="tile-tag">Auth JWT & Rôles</div>
          </div>
          <div class="tile-content-login">
            <div class="login-cropper">
              <img src="${loginBase64}" alt="Interface Connexion JobConnect">
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- BOTTOM BAR: KEY HIGHLIGHTS -->
    <footer class="bottom-bar">
      <div class="highlights-list">
        <div class="highlight-item">
          <div class="highlight-icon-box icon-emerald">🤝</div>
          <div class="highlight-text">
            <h4>Instant Matching</h4>
            <p>Mise en relation intelligente selon compétences & localisation</p>
          </div>
        </div>

        <div class="highlight-item">
          <div class="highlight-icon-box icon-blue">🛡️</div>
          <div class="highlight-text">
            <h4>Paiement Séquestre Sécurisé</h4>
            <p>Fonds bloqués jusqu'à validation complète de la mission</p>
          </div>
        </div>

        <div class="highlight-item">
          <div class="highlight-icon-box icon-purple">⭐</div>
          <div class="highlight-text">
            <h4>Profils Vérifiés & Rôles</h4>
            <p>Espaces dédiés Administrateur, Employeur et Jobsetter</p>
          </div>
        </div>

        <div class="highlight-item">
          <div class="highlight-icon-box icon-indigo">💬</div>
          <div class="highlight-text">
            <h4>Messagerie Temps Réel</h4>
            <p>Chat interactif Socket.io et notifications directes</p>
          </div>
        </div>
      </div>

      <div class="status-stamp">
        <div class="pulse-dot"></div>
        <span>Stack V1.0 Prête au Déploiement</span>
      </div>
    </footer>
  </div>
</body>
</html>`;

const tempHtmlPath = 'd:/formations_personnelles/platforme-jobs/presentation-temp.html';
fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 2560, height: 1440 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  
  console.log('Loading presentation HTML...');
  await page.goto('file:///' + tempHtmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  
  await page.waitForTimeout(1000);
  
  const pngPath = 'd:/formations_personnelles/platforme-jobs/jobconnect-presentation-reelle.png';
  const jpgPath = 'd:/formations_personnelles/platforme-jobs/jobconnect-presentation.jpg';
  const webJpgPath = 'd:/formations_personnelles/platforme-jobs/web/public/jobconnect-presentation.jpg';
  const brainJpgPath = 'C:/Users/Cyrax/.gemini/antigravity/brain/5d9f29e1-ac98-4b45-b84b-4f3d0eb9e50a/jobconnect-presentation-reelle.jpg';

  console.log('Taking high-resolution screenshots...');
  await page.screenshot({ path: pngPath, type: 'png' });
  await page.screenshot({ path: jpgPath, type: 'jpeg', quality: 95 });
  await page.screenshot({ path: webJpgPath, type: 'jpeg', quality: 95 });
  await page.screenshot({ path: brainJpgPath, type: 'jpeg', quality: 95 });
  
  await browser.close();
  
  if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
  
  console.log('DONE! Refined presentation successfully generated.');
  console.log('PNG:', pngPath, fs.statSync(pngPath).size);
  console.log('JPG:', jpgPath, fs.statSync(jpgPath).size);
})();
