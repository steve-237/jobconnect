const fs = require('fs');
const { chromium } = require('d:/formations_personnelles/platforme-jobs/web/node_modules/@playwright/test');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  
  const loginData = 'data:image/png;base64,' + fs.readFileSync('d:/formations_personnelles/platforme-jobs/presentation-assets/screen-login.png').toString('base64');
  
  await page.setContent('<html><body><canvas id="cLogin"></canvas></body></html>');
  
  const crops = await page.evaluate(async ({ loginData }) => {
    function loadImage(src) {
      return new Promise(res => {
        const img = new Image();
        img.onload = () => res(img);
        img.src = src;
      });
    }
    
    const loginImg = await loadImage(loginData);
    
    // Login Card: x: 265, y: 32, w: 362, h: 430
    const cLogin = document.getElementById('cLogin');
    cLogin.width = 362; cLogin.height = 430;
    cLogin.getContext('2d').drawImage(loginImg, 265, 32, 362, 430, 0, 0, 362, 430);
    
    return {
      cardLogin: cLogin.toDataURL('image/png')
    };
  }, { loginData });
  
  function saveBase64(dataUrl, dest) {
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(dest, Buffer.from(base64, 'base64'));
  }
  
  saveBase64(crops.cardLogin, 'd:/formations_personnelles/platforme-jobs/presentation-assets/card-login-modal.png');
  console.log('Saved card-login-modal.png cleanly!');
  await browser.close();
})();
