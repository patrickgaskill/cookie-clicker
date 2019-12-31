"use strict";
const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: false, devtools: true });
  const page = await browser.newPage();
  await page.goto("https://orteil.dashnet.org/cookieclicker/", {
    waitUntil: "networkidle0"
  });

  // await page.exposeFunction("clone", clone);
  await page.addScriptTag({ path: "./node_modules/clone/clone.js" });

  const gameHandle = await page.evaluateHandle(() => window.Game);
  await page.waitFor(Game => Game.cookies !== undefined, {}, gameHandle);

  let useLuckyBuffer = false;

  // Click the cookie
  setInterval(async () => {
    gameHandle.evaluate(Game => {
      const { Achievements, cookieClicks, ClickCookie } = Game;

      if (!Achievements["Neverclick"].won) {
        if (cookieClicks < 15) ClickCookie();
      } else {
        ClickCookie();
      }
    });
  }, 10);

  gameHandle.evaluate(async Game => {
    Game.cookies = Game.cookies + 1; // Cheated cookies taste awful shadow achievement
    Game.Win("Third-party"); // Third party add-on shadow achievement
    Game.AchievementsById[204].click(); // Here you go achievement

    // Tabloid addiction achievement
    for (let i = 0; i < 50; ++i) Game.tickerL.click();

    // What's in a name achievement
    Game.bakeryNamePrompt();
    Game.bakeryNamePromptRandom();
  });

  // Confirm the bakery name prompt
  page.waitForSelector("a#promptOption0").then(confirm => confirm.click());

  // Cache the achievements seen to detect new ones
  let prevAchievementsWon = {};

  setInterval(async () => {
    await gameHandle.evaluate(Game => {
      // If golden cookie is available, click it
      // Click it on the last second it's available for Fading Luck achievement
      const golden = Game.shimmers.find(
        s => s.type === "golden" && s.wrath === 0
      );
      if (golden && !Game.Achievements["Early bird"].won) golden.pop(); // Pop one fast for Early bird
      if (golden && golden.life <= Game.fps) golden.pop();

      // If it's Christmas season, click reindeer
      const reindeer = Game.shimmers.find(s => s.type === "reindeer");
      if (reindeer) reindeer.pop();
    });

    await page.evaluate(Game => {
      const {
        Objects,
        UpgradesInStore,
        cookies,
        cookiesPs,
        computedMouseCps,
        CalculateGains
      } = Game;

      // Keep cookies in the bank to maximize Lucky golden cookies
      if (true || cookies >= 42000 * cookiesPs) {
        const prevTotalCps = cookiesPs + computedMouseCps;

        const purchaseMap = new Map();

        for (const obj of Object.values(Objects)) {
          if (obj.locked || obj.getPrice() > cookies) continue;
          obj.amount++;
          CalculateGains();
          const {
            cookiesPs: nextCookiesPs,
            computedMouseCps: nextComputedMouseCps
          } = Game;
          const nextTotalCps = nextCookiesPs + nextComputedMouseCps;
          obj.amount--;
          CalculateGains();
          const efficiency =
            (obj.getPrice() * nextTotalCps) / (nextTotalCps - prevTotalCps);
          purchaseMap.set(obj, efficiency);
        }

        for (const upgrade of Object.values(UpgradesInStore)) {
          if (!upgrade.canBuy()) continue;
          upgrade.bought = 1;
          CalculateGains();
          const {
            cookiesPs: nextCookiesPs,
            computedMouseCps: nextComputedMouseCps
          } = Game;
          const nextTotalCps = nextCookiesPs + nextComputedMouseCps;
          upgrade.bought = 0;
          CalculateGains();
          const efficiency =
            (upgrade.basePrice * nextTotalCps) / (nextTotalCps - prevTotalCps);
          purchaseMap.set(upgrade, efficiency);
        }

        const sorted = Array.from(purchaseMap.keys()).sort(
          (a, b) => purchaseMap[b] - purchaseMap[a]
        );

        if (sorted.length) {
          console.log("Buying", sorted[0].name);
          sorted[0].buy();
        }
      }
    }, gameHandle);

    // Report achievements
    await gameHandle
      .evaluateHandle(Game => Game.AchievementsById)
      .then(handle => handle.getProperties())
      .then(async properties => {
        for (const [id, achievementHandle] of properties.entries()) {
          const won = await achievementHandle.evaluate(a => a.won);
          if (won && !prevAchievementsWon[id]) {
            const name = await achievementHandle.evaluate(a => a.name);
            console.log(`✓ ${name}`);
            prevAchievementsWon[id] = won;
          }
        }
      });
  }, 500);

  // If a sugar lump is available, click it
})();
