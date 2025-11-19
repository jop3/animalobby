import { chromium } from 'playwright';

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-gl=swiftshader',
      '--disable-software-rasterizer',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--disable-gpu',
    ]
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  // Capture console logs before navigation
  const consoleLogs = [];
  const pageErrors = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    console.log('[Browser Console]', msg.type(), ':', text);
  });

  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.log('[Page Error]', error.message);
  });

  try {
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    console.log('Page loaded, waiting for canvas...');

    // Try to wait for canvas, but don't fail if it doesn't appear
    try {
      await page.waitForSelector('canvas', { timeout: 5000 });
      console.log('Canvas found!');
    } catch (e) {
      console.log('Canvas not found, but continuing...');
    }

    // Wait for any React/Three.js to initialize
    await page.waitForTimeout(3000);

    console.log('Taking screenshot...');
    await page.screenshot({
      path: 'screenshot.png',
      type: 'png'
    });
    console.log('✓ Screenshot saved: screenshot.png');

    // Get page HTML to debug
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    console.log('\n=== Page HTML (first 500 chars) ===');
    console.log(bodyHTML.substring(0, 500));

    // Check for specific elements
    const hasCanvas = await page.evaluate(() => !!document.querySelector('canvas'));
    const hasRoot = await page.evaluate(() => !!document.querySelector('#root'));
    console.log('\n=== Element Check ===');
    console.log('Has #root:', hasRoot);
    console.log('Has canvas:', hasCanvas);

  } catch (error) {
    console.error('Error during screenshot:', error.message);
  }

  console.log('\n=== Summary ===');
  console.log('Console logs:', consoleLogs.length);
  console.log('Page errors:', pageErrors.length);
  if (pageErrors.length > 0) {
    console.log('Errors:', pageErrors);
  }

  await browser.close();
  console.log('Browser closed.');
})();
