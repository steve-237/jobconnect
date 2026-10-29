const fs = require('fs');
const { chromium } = require('d:/formations_personnelles/platforme-jobs/web/node_modules/@playwright/test');

function toBase64(filePath) {
  const data = fs.readFileSync(filePath);
  return 'data:image/png;base64,' + data.toString('base64');
}

const heroBase64 = toBase64('d:/formations_personnelles/platforme-jobs/presentation-assets/screen-hero.png');
const matchingBase64 = toBase64('d:/formations_personnelles/platforme-jobs/presentation-assets/card-matching.png');
const escrowBase64 = toBase64('d:/formations_personnelles/platforme-jobs/presentation-assets/card-escrow.png');
const verifiedBase64 = toBase64('d:/formations_personnelles/platforme-jobs/presentation-assets/card-verified.png');
const loginBase64 = toBase64('d:/formations_personnelles/platforme-jobs/presentation-assets/card-login-modal.png');

const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>JobConnect - 3D Presentation Showcase</title>
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
      background: radial-gradient(circle at 45% 35%, #181236 0%, #0C0820 40%, #050410 80%, #020108 100%);
      color: #F8FAFC;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
      position: relative;
    }

    /* Ambient Studio Glows */
    .studio-light-left {
      position: absolute;
      width: 1400px;
      height: 1000px;
      left: 50px;
      top: -200px;
      background: radial-gradient(circle, rgba(147, 51, 234, 0.28) 0%, rgba(99, 102, 241, 0.16) 45%, transparent 70%);
      filter: blur(150px);
      pointer-events: none;
    }
    .studio-light-right {
      position: absolute;
      width: 1400px;
      height: 1200px;
      right: 50px;
      top: 50px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.24) 0%, rgba(37, 99, 235, 0.12) 50%, transparent 70%);
      filter: blur(160px);
      pointer-events: none;
    }
    .studio-floor-reflection {
      position: absolute;
      width: 2200px;
      height: 650px;
      left: 180px;
      bottom: -180px;
      background: radial-gradient(ellipse, rgba(99, 102, 241, 0.22) 0%, rgba(16, 185, 129, 0.14) 40%, transparent 70%);
      filter: blur(130px);
      pointer-events: none;
    }

    /* 3D Scene Viewport */
    .scene-viewport {
      width: 100%;
      height: 100%;
      position: relative;
      perspective: 2000px;
      perspective-origin: 50% 48%;
      transform-style: preserve-3d;
    }

    /* ========================================================
       LAPTOP (MacBook Pro) - RIGHT SIDE
       ======================================================== */
    .laptop-container {
      position: absolute;
      right: 120px;
      top: 170px;
      width: 1380px;
      height: 940px;
      transform-style: preserve-3d;
      transform: rotateY(-14deg) rotateX(8deg) rotateZ(-2deg) translateZ(0px);
      filter: drop-shadow(0 40px 95px rgba(0, 0, 0, 0.9));
    }

    /* Laptop Lid / Screen Frame */
    .laptop-screen-frame {
      width: 1300px;
      height: 835px;
      background: #080B12;
      border-radius: 26px 26px 4px 4px;
      border: 14px solid #141724;
      border-bottom: 22px solid #141724;
      position: relative;
      overflow: hidden;
      box-shadow: 
        inset 0 0 0 2px rgba(255, 255, 255, 0.14),
        0 0 45px rgba(59, 130, 246, 0.22);
    }

    /* Notch */
    .laptop-notch {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 160px;
      height: 24px;
      background: #141724;
      border-radius: 0 0 12px 12px;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .camera-lens {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #030712;
      border: 1px solid #374151;
      box-shadow: inset 0 0 3px #1E40AF;
    }
    .camera-led {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 6px #10B981;
    }

    /* Laptop Display Content (Real JobConnect Web UI) */
    .laptop-display {
      width: 100%;
      height: 100%;
      background: #000000;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .laptop-display img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center center;
      display: block;
    }

    /* Screen Gloss */
    .screen-gloss {
      position: absolute;
      inset: 0;
      background: linear-gradient(125deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.03) 40%, transparent 65%);
      pointer-events: none;
      z-index: 5;
    }

    /* Laptop Base */
    .laptop-base {
      width: 1380px;
      height: 82px;
      background: linear-gradient(to bottom, #1E2232 0%, #111422 40%, #0A0C16 100%);
      border-radius: 0 0 36px 36px;
      position: absolute;
      bottom: 25px;
      left: -40px;
      box-shadow: 
        0 30px 70px rgba(0, 0, 0, 0.95),
        inset 0 2px 2px rgba(255, 255, 255, 0.28),
        inset 0 -2px 5px rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: flex-start;
      border: 1px solid rgba(255, 255, 255, 0.09);
    }
    .laptop-base-notch {
      width: 180px;
      height: 10px;
      background: #090B12;
      border-radius: 0 0 10px 10px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-top: none;
    }

    /* ========================================================
       SMARTPHONE (iPhone 15/16 Pro) - FOREGROUND LEFT
       ======================================================== */
    .phone-container {
      position: absolute;
      left: 540px;
      top: 140px;
      width: 490px;
      height: 1000px;
      transform-style: preserve-3d;
      transform: rotateY(-18deg) rotateX(15deg) rotateZ(-7deg) translateZ(80px);
      filter: drop-shadow(-35px 50px 75px rgba(0, 0, 0, 0.88)) drop-shadow(0 0 55px rgba(99, 102, 241, 0.38));
      z-index: 30;
    }

    /* Outer Titanium Bezel */
    .phone-bezel {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #374151 0%, #1F2937 40%, #111827 100%);
      border-radius: 64px;
      padding: 12px;
      position: relative;
      box-shadow: 
        inset 0 0 0 2px rgba(255, 255, 255, 0.3),
        inset 0 0 12px rgba(0, 0, 0, 0.8),
        0 0 0 4px #0B0E14,
        0 0 0 6px rgba(255, 255, 255, 0.16);
    }

    /* Buttons */
    .phone-btn-left-1 { position: absolute; left: -8px; top: 180px; width: 6px; height: 40px; background: #374151; border-radius: 4px 0 0 4px; }
    .phone-btn-left-2 { position: absolute; left: -8px; top: 240px; width: 6px; height: 65px; background: #374151; border-radius: 4px 0 0 4px; }
    .phone-btn-left-3 { position: absolute; left: -8px; top: 320px; width: 6px; height: 65px; background: #374151; border-radius: 4px 0 0 4px; }
    .phone-btn-right { position: absolute; right: -8px; top: 250px; width: 6px; height: 95px; background: #374151; border-radius: 0 4px 4px 0; }

    /* Screen Glass */
    .phone-screen {
      width: 100%;
      height: 100%;
      background: #090D16;
      border-radius: 54px;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Status Bar & Dynamic Island */
    .phone-status-bar {
      height: 52px;
      padding: 14px 28px 0 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 15;
    }
    .status-time {
      font-size: 15px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.2px;
    }
    .dynamic-island {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 12px;
      width: 125px;
      height: 32px;
      background: #000000;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 14px;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
    .island-camera {
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: #070D18;
      box-shadow: inset 0 0 3px #1E3A8A;
      border: 1px solid #1E293B;
    }
    .status-icons {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #FFFFFF;
      font-size: 13px;
      font-weight: 700;
    }

    /* Content */
    .phone-app-content {
      flex: 1;
      width: 100%;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px 16px;
    }
    .phone-app-content img {
      width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 24px;
      display: block;
    }

    /* Bottom Home Indicator */
    .phone-nav-bar {
      height: 65px;
      padding-bottom: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
    }
    .phone-home-indicator {
      width: 140px;
      height: 5px;
      background: #FFFFFF;
      border-radius: 100px;
      opacity: 0.85;
    }

    /* Gloss Overlay */
    .phone-gloss {
      position: absolute;
      inset: 0;
      background: linear-gradient(130deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 40%, transparent 60%);
      pointer-events: none;
      z-index: 25;
      border-radius: 54px;
    }

    /* ========================================================
       FLOATING 3D GLASSMORPHIC CARDS
       ======================================================== */
    .floating-card-3d {
      position: absolute;
      background: rgba(15, 23, 42, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.26);
      border-radius: 26px;
      backdrop-filter: blur(30px);
      box-shadow: 
        0 30px 70px rgba(0, 0, 0, 0.88),
        0 0 45px rgba(99, 102, 241, 0.3);
      overflow: hidden;
      transform-style: preserve-3d;
    }

    /* CARD 1: TOP LEFT (Verified Candidate Profile Badge) */
    .card-top-left {
      left: 140px;
      top: 140px;
      width: 450px;
      padding: 20px 26px;
      transform: rotateY(-12deg) rotateX(10deg) rotateZ(-3deg) translateZ(100px);
      display: flex;
      align-items: center;
      gap: 20px;
      border-color: rgba(168, 85, 247, 0.45);
      box-shadow: 
        0 25px 65px rgba(0, 0, 0, 0.85),
        0 0 50px rgba(168, 85, 247, 0.4);
    }
    .profile-avatar-wrap {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: linear-gradient(135deg, #A855F7, #3B82F6);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      box-shadow: 0 0 24px rgba(168, 85, 247, 0.7);
      border: 2px solid rgba(255, 255, 255, 0.5);
      flex-shrink: 0;
      font-size: 36px;
    }
    .verified-check-pill {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #10B981;
      border: 2px solid #0B0E14;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 900;
      color: white;
    }
    .profile-info h3 {
      font-size: 22px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.3px;
    }
    .profile-info p {
      font-size: 14px;
      color: #94A3B8;
      margin-top: 3px;
      font-weight: 600;
    }
    .profile-pill-tag {
      margin-top: 8px;
      display: inline-block;
      padding: 4px 14px;
      background: rgba(168, 85, 247, 0.22);
      border: 1px solid rgba(168, 85, 247, 0.45);
      border-radius: 100px;
      font-size: 12px;
      font-weight: 800;
      color: #D8B4FE;
    }

    /* CARD 2: BOTTOM LEFT (Real Instant Matching Feature Card) */
    .card-bottom-left {
      left: 170px;
      bottom: 200px;
      width: 420px;
      padding: 24px;
      transform: rotateY(-15deg) rotateX(12deg) rotateZ(-4deg) translateZ(120px);
      border-color: rgba(59, 130, 246, 0.4);
      box-shadow: 
        0 30px 75px rgba(0, 0, 0, 0.92),
        0 0 50px rgba(59, 130, 246, 0.35);
    }
    .card-bottom-left img {
      width: 100%;
      border-radius: 16px;
      display: block;
    }

    /* CARD 3: BOTTOM RIGHT (Floating IN FRONT of Laptop Base - exactly like Cagnotte Cadeau) */
    .card-bottom-right {
      right: 180px;
      bottom: 260px;
      width: 520px;
      padding: 24px 30px;
      transform: rotateY(-10deg) rotateX(6deg) rotateZ(1deg) translateZ(280px);
      border-color: rgba(59, 130, 246, 0.55);
      box-shadow: 
        0 35px 90px rgba(0, 0, 0, 0.98),
        0 0 60px rgba(59, 130, 246, 0.45);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .escrow-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .escrow-title-box {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .escrow-icon {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.35), rgba(16, 185, 129, 0.35));
      border: 1px solid rgba(59, 130, 246, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
    }
    .escrow-title-box h4 {
      font-size: 19px;
      font-weight: 800;
      color: #FFFFFF;
    }
    .escrow-title-box p {
      font-size: 13px;
      color: #94A3B8;
      margin-top: 3px;
    }
    .escrow-badge-pill {
      padding: 6px 16px;
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid rgba(16, 185, 129, 0.5);
      border-radius: 100px;
      font-size: 13px;
      font-weight: 800;
      color: #34D399;
    }
    .escrow-progress-bar {
      width: 100%;
      height: 14px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 100px;
      overflow: hidden;
      position: relative;
    }
    .escrow-progress-fill {
      width: 85%;
      height: 100%;
      background: linear-gradient(90deg, #3B82F6, #10B981);
      border-radius: 100px;
      box-shadow: 0 0 20px #10B981;
    }
    .escrow-stats {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 700;
      color: #94A3B8;
    }
    .escrow-stats span.highlight {
      color: #34D399;
    }

    /* ========================================================
       FLOATING 3D PROPS & PARTICLES
       ======================================================== */
    .floating-prop {
      position: absolute;
      pointer-events: none;
      filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.8));
      z-index: 12;
    }

    /* 3D Gift Box 1 */
    .prop-gift-1 {
      left: 90px;
      bottom: 250px;
      width: 120px;
      height: 120px;
      transform: rotateY(25deg) rotateX(-15deg) rotateZ(12deg) translateZ(40px);
    }
    /* 3D Gift Box 2 */
    .prop-gift-2 {
      left: 1080px;
      top: 70px;
      width: 90px;
      height: 90px;
      transform: rotateY(-30deg) rotateX(20deg) rotateZ(-18deg) translateZ(50px);
      filter: drop-shadow(0 15px 35px rgba(99, 102, 241, 0.5));
    }

    /* 3D Dark Metallic Balloons */
    .prop-balloon-1 {
      left: 110px;
      top: 360px;
      width: 80px;
      height: 105px;
      background: radial-gradient(circle at 35% 35%, #C084FC 0%, #7E22CE 60%, #3B0764 100%);
      border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
      box-shadow: inset -6px -6px 18px rgba(0,0,0,0.65), 0 0 35px rgba(168, 85, 247, 0.45);
      transform: rotate(-12deg) translateZ(20px);
    }
    .prop-balloon-2 {
      right: 60px;
      top: 250px;
      width: 95px;
      height: 120px;
      background: radial-gradient(circle at 35% 35%, #60A5FA 0%, #1D4ED8 60%, #0F172A 100%);
      border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
      box-shadow: inset -6px -6px 18px rgba(0,0,0,0.65), 0 0 40px rgba(59, 130, 246, 0.45);
      transform: rotate(15deg) translateZ(20px);
    }

    /* Floating Golden Confetti Ribbons */
    .confetti {
      position: absolute;
      pointer-events: none;
      border-radius: 4px;
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.55);
    }
    .c1 { width: 38px; height: 13px; background: linear-gradient(135deg, #FDE68A, #D97706); top: 170px; left: 90px; transform: rotate(45deg); }
    .c2 { width: 30px; height: 11px; background: linear-gradient(135deg, #FDE68A, #D97706); top: 390px; left: 590px; transform: rotate(-25deg); }
    .c3 { width: 34px; height: 12px; background: linear-gradient(135deg, #FDE68A, #D97706); top: 110px; right: 290px; transform: rotate(60deg); }
    .c4 { width: 28px; height: 10px; background: linear-gradient(135deg, #FDE68A, #D97706); bottom: 170px; right: 110px; transform: rotate(-40deg); }
    .c5 { width: 42px; height: 15px; background: linear-gradient(135deg, #FDE68A, #D97706); bottom: 340px; left: 500px; transform: rotate(70deg); }

    .gift-box-svg {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <!-- Ambient Studio Lighting -->
  <div class="studio-light-left"></div>
  <div class="studio-light-right"></div>
  <div class="studio-floor-reflection"></div>

  <!-- Confetti Ribbons -->
  <div class="confetti c1"></div>
  <div class="confetti c2"></div>
  <div class="confetti c3"></div>
  <div class="confetti c4"></div>
  <div class="confetti c5"></div>

  <!-- 3D Balloons -->
  <div class="floating-prop prop-balloon-1"></div>
  <div class="floating-prop prop-balloon-2"></div>

  <!-- 3D Gift Box 1 (SVG Isometric) -->
  <div class="floating-prop prop-gift-1">
    <svg class="gift-box-svg" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="cubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3B82F6"/>
          <stop offset="100%" stop-color="#1D4ED8"/>
        </linearGradient>
        <linearGradient id="cubeLeft" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1E40AF"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
        <linearGradient id="cubeRight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1D4ED8"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
        <linearGradient id="ribbonGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDE68A"/>
          <stop offset="100%" stop-color="#D97706"/>
        </linearGradient>
      </defs>
      <polygon points="60,15 105,40 60,65 15,40" fill="url(#cubeTop)"/>
      <polygon points="15,40 60,65 60,110 15,85" fill="url(#cubeLeft)"/>
      <polygon points="60,65 105,40 105,85 60,110" fill="url(#cubeRight)"/>
      <polygon points="55,17 65,22 65,65 55,60" fill="url(#ribbonGold)"/>
      <polygon points="15,40 60,65 60,75 15,50" fill="url(#ribbonGold)" opacity="0.9"/>
      <polygon points="60,65 105,40 105,50 60,75" fill="url(#ribbonGold)" opacity="0.8"/>
      <circle cx="56" cy="18" r="8" fill="url(#ribbonGold)"/>
      <circle cx="64" cy="18" r="8" fill="url(#ribbonGold)"/>
    </svg>
  </div>

  <!-- 3D Gift Box 2 (SVG Isometric) -->
  <div class="floating-prop prop-gift-2">
    <svg class="gift-box-svg" viewBox="0 0 100 100">
      <polygon points="50,10 90,32 50,55 10,32" fill="url(#cubeTop)"/>
      <polygon points="10,32 50,55 50,95 10,72" fill="url(#cubeLeft)"/>
      <polygon points="50,55 90,32 90,72 50,95" fill="url(#cubeRight)"/>
      <circle cx="46" cy="12" r="6" fill="url(#ribbonGold)"/>
      <circle cx="54" cy="12" r="6" fill="url(#ribbonGold)"/>
    </svg>
  </div>

  <div class="scene-viewport">

    <!-- ========================================================
         LAPTOP (MacBook Pro) - DISPLAYING REAL WEBPAGE (Hero)
         ======================================================== -->
    <div class="laptop-container">
      <div class="laptop-screen-frame">
        <div class="laptop-notch">
          <div class="camera-lens"></div>
          <div class="camera-led"></div>
        </div>

        <div class="laptop-display">
          <img src="${heroBase64}" alt="JobConnect Web Interface">
          <div class="screen-gloss"></div>
        </div>
      </div>

      <div class="laptop-base">
        <div class="laptop-base-notch"></div>
      </div>
    </div>

    <!-- ========================================================
         SMARTPHONE (iPhone 15/16 Pro) - DISPLAYING REAL LOGIN CARD
         ======================================================== -->
    <div class="phone-container">
      <div class="phone-btn-left-1"></div>
      <div class="phone-btn-left-2"></div>
      <div class="phone-btn-left-3"></div>
      <div class="phone-btn-right"></div>

      <div class="phone-bezel">
        <div class="phone-screen">
          <div class="phone-gloss"></div>

          <!-- Status Bar & Dynamic Island -->
          <div class="phone-status-bar">
            <span class="status-time">9:41</span>
            <div class="dynamic-island">
              <div class="island-camera"></div>
            </div>
            <div class="status-icons">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          <!-- Real JobConnect Mobile App Screen (Login Modal) -->
          <div class="phone-app-content">
            <img src="${loginBase64}" alt="JobConnect Mobile Auth">
          </div>

          <!-- Home Indicator Bar -->
          <div class="phone-nav-bar">
            <div class="phone-home-indicator"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================
         FLOATING CARD 1: TOP LEFT (Verified Candidate Profile)
         ======================================================== -->
    <div class="floating-card-3d card-top-left">
      <div class="profile-avatar-wrap">
        <span>👩‍🔧</span>
        <div class="verified-check-pill">✓</div>
      </div>
      <div class="profile-info">
        <h3>Sophie M.</h3>
        <p>⭐️ 4.9 (128 avis) • Paris</p>
        <span class="profile-pill-tag">Jobsetter Vérifié 🛡️</span>
      </div>
    </div>

    <!-- ========================================================
         FLOATING CARD 2: BOTTOM LEFT (Real Instant Matching Feature)
         ======================================================== -->
    <div class="floating-card-3d card-bottom-left">
      <img src="${matchingBase64}" alt="Instant Matching">
    </div>

    <!-- ========================================================
         FLOATING CARD 3: BOTTOM RIGHT (Real Secure Escrow Badge - IN FRONT OF LAPTOP)
         ======================================================== -->
    <div class="floating-card-3d card-bottom-right">
      <div class="escrow-header">
        <div class="escrow-title-box">
          <div class="escrow-icon">🛡️</div>
          <div>
            <h4>Paiement Séquestre Sécurisé</h4>
            <p>Fonds bloqués jusqu'à validation</p>
          </div>
        </div>
        <span class="escrow-badge-pill">Sécurisé</span>
      </div>

      <div class="escrow-progress-bar">
        <div class="escrow-progress-fill"></div>
      </div>

      <div class="escrow-stats">
        <span>Protection acheteur & prestataire</span>
        <span class="highlight">100% Garanti</span>
      </div>
    </div>

  </div>
</body>
</html>`;

const tempHtmlPath = 'd:/formations_personnelles/platforme-jobs/presentation-3d-temp.html';
fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

(async () => {
  console.log('Launching browser for 3D mockup...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 2560, height: 1440 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  
  console.log('Loading 3D mockup HTML...');
  await page.goto('file:///' + tempHtmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  
  await page.waitForTimeout(1000);
  
  const pngPath = 'd:/formations_personnelles/platforme-jobs/jobconnect-presentation-3d.png';
  const jpgPath = 'd:/formations_personnelles/platforme-jobs/jobconnect-presentation.jpg';
  const webJpgPath = 'd:/formations_personnelles/platforme-jobs/web/public/jobconnect-presentation.jpg';
  const brainJpgPath = 'C:/Users/Cyrax/.gemini/antigravity/brain/5d9f29e1-ac98-4b45-b84b-4f3d0eb9e50a/jobconnect-presentation-3d.jpg';

  console.log('Taking high-resolution 3D screenshot...');
  await page.screenshot({ path: pngPath, type: 'png' });
  await page.screenshot({ path: jpgPath, type: 'jpeg', quality: 95 });
  await page.screenshot({ path: webJpgPath, type: 'jpeg', quality: 95 });
  await page.screenshot({ path: brainJpgPath, type: 'jpeg', quality: 95 });
  
  await browser.close();
  
  if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
  
  console.log('DONE! 3D Presentation mockup generated.');
  console.log('PNG:', pngPath, fs.statSync(pngPath).size);
  console.log('JPG:', jpgPath, fs.statSync(jpgPath).size);
})();
