const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateThumbnail() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to match social media image dimensions
  await page.setViewport({ width: 1200, height: 630 });
  
  // Load the HTML file
  const htmlPath = path.join(__dirname, 'generate-thumbnail-template.html');
  await page.goto(`file://${htmlPath}`);
  
  // Wait for any fonts to load
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Take screenshot
  const outputPath = path.join(__dirname, '../public/og-image.png');
  await page.screenshot({
    path: outputPath,
    type: 'png',
    fullPage: false
  });
  
  console.log(`Thumbnail generated: ${outputPath}`);
  
  await browser.close();
}

generateThumbnail().catch(console.error); 