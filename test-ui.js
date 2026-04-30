const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Navigating to PrintBridge...');
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');

  // Check for any console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Check if the main elements exist
  const title = await page.locator('h1').first().textContent();
  console.log('Page title:', title);

  // Check sidebar
  const menuItems = await page.locator('.ant-menu-item').count();
  console.log('Menu items count:', menuItems);

  // Try to find the file input
  const fileInput = await page.locator('#file-input').count();
  console.log('File input found:', fileInput > 0);

  // Check canvas - should be 0 since no image imported yet
  const canvas = await page.locator('canvas').count();
  console.log('Canvas elements found:', canvas);

  // Check if "选择文件" button exists
  const selectButton = await page.locator('button:has-text("选择文件")').count();
  console.log('Select file button found:', selectButton > 0);

  // Wait a bit for any async errors
  await page.waitForTimeout(2000);

  if (errors.length > 0) {
    console.log('Console errors:', errors);
  } else {
    console.log('No console errors detected');
  }

  await browser.close();
  console.log('Test completed successfully');
})();
