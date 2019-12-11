"use strict";
const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://orteil.dashnet.org/cookieclicker/", {
    waitUntil: "networkidle0"
  });

  // Click the "Here you go" achievement
  // await page.evaluate(() => window.Game.AchievementsById[204].click());

  // If golden cookie is available, click it
  // Click it on the last second it's available?
  // setInterval(() => {}, 1000);

  // If a sugar lump is available, click it
  // setInterval(() => {
  //   const lumps = page.$("#lumps");
  //   console.log("lumps:", lumps);
  //   if (lumps) lumps.click();
  // });

  // Find all available upgrades

  // Find all available buildings

  // Calculate the best thing to buy

  // Click the cookie
  const bigCookie = await page.$("#bigCookie");
  setInterval(() => {
    bigCookie.click();
  }, 10);

  // Update cookies, CPS, achievements
})();
