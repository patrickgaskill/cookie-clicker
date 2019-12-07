const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://orteil.dashnet.org/cookieclicker/", {
    waitUntil: "networkidle2"
  });

  await browser.close();
})();
