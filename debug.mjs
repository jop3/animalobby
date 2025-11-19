import { chromium } from 'playwright';

(async () => {
  console.log('Starting browser for debugging...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const logs = { info: [], warn: [], error: [], debug: [] };
  const pageErrors = [];

  // Capture all console output
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    logs[type]?.push(text) || logs.info.push(text);
  });

  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });

  try {
    console.log('Loading http://localhost:5173...');
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    // Wait for React to render
    await page.waitForTimeout(3000);

    // Check what's in the DOM
    const domInfo = await page.evaluate(() => {
      return {
        title: document.title,
        hasRoot: !!document.querySelector('#root'),
        hasCanvas: !!document.querySelector('canvas'),
        rootChildren: document.querySelector('#root')?.childElementCount || 0,
        bodyClasses: document.body.className,
        canvasCount: document.querySelectorAll('canvas').length,
      };
    });

    console.log('=== DOM INFO ===');
    console.log(JSON.stringify(domInfo, null, 2));

    console.log('\n=== CONSOLE LOGS ===');
    console.log('Info:', logs.info.length);
    logs.info.forEach((msg, i) => console.log(`  ${i + 1}. ${msg}`));

    console.log('\nWarnings:', logs.warn.length);
    logs.warn.forEach((msg, i) => console.log(`  ${i + 1}. ${msg}`));

    console.log('\nErrors:', logs.error.length);
    logs.error.forEach((msg, i) => console.log(`  ${i + 1}. ${msg}`));

    console.log('\n=== PAGE ERRORS ===');
    pageErrors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));

    if (pageErrors.length === 0 && logs.error.length === 0) {
      console.log('\n✓ No JavaScript errors detected!');
    } else {
      console.log('\n✗ JavaScript errors found');
    }

  } catch (error) {
    console.error('\nFailed to load page:', error.message);
  }

  await browser.close();
})();
