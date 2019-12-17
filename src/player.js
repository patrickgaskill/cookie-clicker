"use strict";
const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://orteil.dashnet.org/cookieclicker/", {
    waitUntil: "networkidle0"
  });

  const gameHandle = await page.evaluateHandle(() => window.Game);
  await page.waitFor(Game => Game.cookies !== undefined, {}, gameHandle);

  gameHandle.evaluate(async Game => {
    Game.cookies = Game.cookies + 1; // Cheated cookies taste awful shadow achievement
    Game.Win("Third-party"); // Third party add-on shadow achievement
    Game.AchievementsById[204].click(); // Here you go achievement

    // What's in a name achievement
    Game.bakeryNamePrompt();
    Game.bakeryNamePromptRandom();
  });

  // Confirm the bakery name prompt
  page.waitForSelector("a#promptOption0").then(confirm => confirm.click());

  setInterval(async () => {
    gameHandle.evaluate(Game => {
      // If golden cookie is available, click it
      // Click it on the last second it's available for Fading Luck achievement
      const golden = Game.shimmers.find(
        s => s.type === "golden" && s.wrath === 0
      );
      if (golden && golden.life <= Game.fps) golden.pop();

      // If it's Christmas season, click reindeer
      const reindeer = Game.shimmers.find(s => s.type === "reindeer");
      if (reindeer) reindeer.pop();
    });
  }, 500);

  // If a sugar lump is available, click it

  // Find all available upgrades

  // Find all available buildings

  // Calculate the best thing to buy

  // Click the cookie
  setInterval(async () => {
    gameHandle.evaluate(Game => Game.ClickCookie());
  }, 10);

  // Report achievements
  let prevAchievementsWon = {};
  setInterval(async () => {
    const handle = await gameHandle.evaluateHandle(
      Game => Game.AchievementsById
    );
    const properties = await handle.getProperties();
    for (const [id, achievement] of properties.entries()) {
      const [name, won] = await achievement.evaluate(a => [a.name, a.won]);
      if (won && !prevAchievementsWon[id]) console.log(`✓ ${name}`);
      prevAchievementsWon[id] = won;
    }
  }, 1000);
})();
