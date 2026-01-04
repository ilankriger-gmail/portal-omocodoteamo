import puppeteer from 'puppeteer';

async function main() {
  try {
    console.log("Starting browser test...");

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ]
    });

    const page = await browser.newPage();
    await page.goto('https://www.instagram.com/nextleveldj/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const title = await page.title();
    console.log("Page title:", title);

    await browser.close();
    console.log("Browser test completed successfully!");
  } catch (error) {
    console.error("Error in browser test:", error);
  }
}

main();