#!/usr/bin/env node
/**
 * Opens every written lesson in a real browser and checks that the lesson works:
 *
 *   - the page loads without errors
 *   - with the starter code, the twist checks do NOT all pass
 *   - with the answer pasted in, the twist checks do NOT all pass (the twist must ask for something new)
 *   - with the twist answer, ALL checks pass
 *
 * It also checks the unit's quick check and project against their own answers.
 *
 *   npm run build && npm run check:lessons
 *
 * Needs Chrome. Set CHROME_PATH if it is not found.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "qa-out");
const PORT = 4180;
const base = `http://localhost:${PORT}`;
const shots = process.argv.includes("--shots");

const chromePath =
  process.env.CHROME_PATH ??
  ["/usr/bin/google-chrome", "/usr/bin/chromium", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"].find((p) =>
    existsSync(p),
  );
if (!chromePath) {
  console.error("Chrome was not found. Set CHROME_PATH to its location.");
  process.exit(1);
}
if (!existsSync(join(root, "dist", "index.html"))) {
  console.error("Build the site first: npm run build");
  process.exit(1);
}

const server = spawn(process.execPath, [join(root, "node_modules", "vite", "bin", "vite.js"), "preview", "--port", String(PORT), "--strictPort"], { cwd: root, stdio: "ignore" });
const stop = () => server.kill();
process.on("exit", stop);

const waitForServer = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(base)).ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("The preview server did not start.");
};

const unitsDir = join(root, "content", "units");
const units = readdirSync(unitsDir).filter((d) => existsSync(join(unitsDir, d)));

let failures = 0;
const fail = (where, message) => {
  failures++;
  console.log(`  FAIL  ${where}: ${message}`);
};

/** Reads the state of the check list on the page. */
const readChecks = async (page) => page.$$eval(".checks li", (items) => items.map((li) => li.getAttribute("data-ok") === "true"));

/** Waits until the check results stop changing. */
const settledChecks = async (page) => {
  let last = "";
  let same = 0;
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(150);
    const now = JSON.stringify(await readChecks(page));
    same = now === last ? same + 1 : 0;
    last = now;
    if (same >= 5) break;
  }
  return JSON.parse(last || "[]");
};

const main = async () => {
  await waitForServer();
  if (shots) mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: chromePath, args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });

  for (const unit of units) {
    const files = readdirSync(join(unitsDir, unit));
    const lessonFiles = files.filter((f) => /^\d\d-.*\.md$/.test(f)).sort();
    console.log(`\nUnit "${unit}": ${lessonFiles.length} lessons`);

    for (const file of lessonFiles) {
      const id = `${unit}-${file.slice(0, 2)}`;
      errors.length = 0;
      await page.goto(`${base}/#/lesson/${id}`);
      await page.reload();
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await page.waitForSelector(".titleblock h1");
      const title = await page.textContent(".titleblock h1");
      const total = (await page.$$(".checks li")).length;
      if (total === 0) fail(id, "the twist has no checks");

      const starter = await settledChecks(page);
      if (total && starter.every(Boolean)) fail(id, "all checks already pass with the starter code");

      await page.click("text=Paste the answer for me");
      const answer = await settledChecks(page);
      if (total && answer.every(Boolean)) fail(id, "all checks already pass with the answer, so the twist asks for nothing new");

      await page.click(".codebox >> text=Put it in my editor");
      const twist = await settledChecks(page);
      if (!twist.every(Boolean)) fail(id, `the twist answer fails check(s) ${twist.map((ok, i) => (ok ? null : i + 1)).filter(Boolean).join(", ")}`);

      // The two results on the pad must have rendered something.
      const frames = await page.$$(".frame iframe");
      if (frames.length < 2) fail(id, "expected a Result frame for the answer and for the twist answer");

      const real = errors.filter((e) => !/favicon/.test(e));
      if (real.length) fail(id, `browser errors: ${real.join(" | ")}`);
      if (shots) await page.screenshot({ path: join(out, `lesson-${id}.png`) });
      console.log(`  ok    ${id}  ${title}  (${total} checks; starter ${starter.filter(Boolean).length}, answer ${answer.filter(Boolean).length}, twist ${twist.filter(Boolean).length})`);
    }

    for (const kind of ["check", "project"]) {
      if (!files.includes(`${kind}.md`)) continue;
      errors.length = 0;
      await page.goto(`${base}/#/${kind}/${unit}`);
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await page.waitForSelector(".titleblock h1");
      const total = (await page.$$(".checks li")).length;
      const before = await settledChecks(page);
      if (total && before.every(Boolean)) fail(`${unit} ${kind}`, "all checks already pass with the starter code");
      await page.click(".codebox >> text=Put it in my editor");
      const after = await settledChecks(page);
      if (!after.every(Boolean)) fail(`${unit} ${kind}`, `its own answer fails check(s) ${after.map((ok, i) => (ok ? null : i + 1)).filter(Boolean).join(", ")}`);
      const real = errors.filter((e) => !/favicon/.test(e));
      if (real.length) fail(`${unit} ${kind}`, `browser errors: ${real.join(" | ")}`);
      if (shots) await page.screenshot({ path: join(out, `${kind}-${unit}.png`) });
      console.log(`  ok    ${unit} ${kind}  (${total} checks; start ${before.filter(Boolean).length}, answer ${after.filter(Boolean).length})`);
    }
  }

  await browser.close();
  stop();
  console.log(failures ? `\n${failures} problem(s) found.` : "\nEvery lesson works.");
  process.exit(failures ? 1 : 0);
};

main().catch((error) => {
  console.error(error);
  stop();
  process.exit(1);
});
