#!/usr/bin/env node
/**
 * Puts TururuCoding on your Cloudflare account (and updates it later).
 *
 *   node scripts/cloudflare.mjs            deploy, or update an existing deploy
 *   node scripts/cloudflare.mjs new-key    deploy with a brand-new device key (old device links stop working)
 *   node scripts/cloudflare.mjs logout     sign Wrangler out of Cloudflare on this computer
 *
 * On Windows, double-click cloud-deploy.bat instead.
 *
 * What it does: installs Wrangler (Cloudflare's tool) into ./cloudflare, signs
 * you in through your browser, asks which Cloudflare account to use, makes a
 * device key, builds the site, deploys, then opens a link that links this
 * computer's browser. The device key itself is never written to disk; only its
 * SHA-256 hash goes into cloudflare/wrangler.jsonc.
 *
 * Set CLOUDFLARE_API_TOKEN (and CLOUDFLARE_ACCOUNT_ID) to deploy with an API
 * token instead of signing in.
 */
import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cfDir = join(root, "cloudflare");
const configPath = join(cfDir, "wrangler.jsonc");
const statePath = join(cfDir, "deploy.json");
const wranglerBin = join(cfDir, "node_modules", "wrangler", "bin", "wrangler.js");
const isWin = process.platform === "win32";

const WORKER_NAME = "tururucoding";
const APP_ID = "tururucoding";
const COMPATIBILITY_DATE = "2026-06-01";

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const step = (n, text) => console.log(`\n${bold(`[${n}]`)} ${text}`);

class Stop extends Error {}
const stop = (message) => {
  throw new Stop(message);
};

// ------------------------------------------------------------------ process

/** Runs a command; stdio "inherit" keeps it interactive, "capture" collects its output. */
const run = (command, args, { cwd = root, mode = "inherit", env = {}, shell = false } = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      shell,
      env: { ...process.env, WRANGLER_SEND_METRICS: "false", ...env },
      stdio: mode === "inherit" ? "inherit" : ["inherit", "pipe", "pipe"],
    });
    let out = "";
    child.stdout?.on("data", (d) => (out += d));
    child.stderr?.on("data", (d) => (out += d));
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 1, out }));
  });

const npmInstall = (cwd) => {
  const args = ["install", "--no-audit", "--no-fund"];
  // Under "npm run", npm tells us where it lives; that avoids shell quoting on Windows.
  if (process.env.npm_execpath) return run(process.execPath, [process.env.npm_execpath, ...args], { cwd });
  return run(isWin ? "npm.cmd" : "npm", args, { cwd, shell: isWin });
};

let accountId = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const wrangler = (args, opts = {}) =>
  run(process.execPath, [wranglerBin, ...args], {
    cwd: cfDir,
    ...opts,
    env: { ...(accountId ? { CLOUDFLARE_ACCOUNT_ID: accountId } : {}), ...(opts.env ?? {}) },
  });

const ask = async (question) => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
};

const lastJson = (text) => {
  for (let i = text.lastIndexOf("{"); i >= 0; i = text.lastIndexOf("{", i - 1)) {
    try {
      return JSON.parse(text.slice(i));
    } catch {
      /* keep looking */
    }
  }
  return null;
};

const readJson = (path) => {
  try {
    // wrangler.jsonc may contain // comments on their own lines
    return JSON.parse(readFileSync(path, "utf8").replace(/^\s*\/\/.*$/gm, ""));
  } catch {
    return null;
  }
};

const openInBrowser = (url) => {
  try {
    if (isWin) spawn("cmd", ["/c", "start", '""', `"${url}"`], { windowsVerbatimArguments: true, detached: true, stdio: "ignore" }).unref();
    else spawn(process.platform === "darwin" ? "open" : "xdg-open", [url], { detached: true, stdio: "ignore" }).unref();
  } catch {
    /* the link is printed anyway */
  }
};

const copyToClipboard = (text) =>
  new Promise((resolve) => {
    try {
      const child = isWin ? spawn("clip") : process.platform === "darwin" ? spawn("pbcopy") : null;
      if (!child) return resolve(false);
      child.on("error", () => resolve(false));
      child.on("close", (code) => resolve(code === 0));
      child.stdin.end(text);
    } catch {
      resolve(false);
    }
  });

// -------------------------------------------------------------------- steps

const ensureTools = async () => {
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major < 20 || (major === 20 && minor < 19)) stop(`Node.js 20.19 or newer is needed (you have ${process.versions.node}). Install the LTS version from https://nodejs.org.`);
  if (!existsSync(join(root, "node_modules", "vite"))) {
    console.log("Installing the site's dependencies first…");
    if ((await npmInstall(root)).code !== 0) stop("npm install failed. Scroll up for the reason.");
  }
  if (!existsSync(wranglerBin)) {
    console.log("Installing Wrangler, Cloudflare's deploy tool (one time, about 100 MB)…");
    if ((await npmInstall(cfDir)).code !== 0) stop("Installing Wrangler failed. Scroll up for the reason.");
  }
};

const whoami = async () => {
  const { code, out } = await wrangler(["whoami", "--json"], { mode: "capture" });
  const info = lastJson(out);
  return code === 0 && info?.loggedIn ? info : null;
};

const signIn = async () => {
  let me = await whoami();
  if (me) return me;
  if (process.env.CLOUDFLARE_API_TOKEN) stop("CLOUDFLARE_API_TOKEN is set but Cloudflare did not accept it.");
  console.log("Your browser opens to sign in to Cloudflare. Sign in there, then click Allow.");
  if ((await wrangler(["login"])).code !== 0) stop("Signing in to Cloudflare did not finish. Run this again to retry.");
  me = await whoami();
  if (!me) stop("Still not signed in to Cloudflare. Run this again to retry.");
  return me;
};

const chooseAccount = async (me, saved) => {
  const accounts = me.accounts ?? [];
  if (!accounts.length) stop("This Cloudflare login has no accounts.");
  const wanted = process.env.CLOUDFLARE_ACCOUNT_ID || saved?.accountId;
  const known = accounts.find((a) => a.id === wanted);
  if (known) return known;
  if (accounts.length === 1) return accounts[0];
  console.log("\nYour Cloudflare login can reach these accounts:");
  accounts.forEach((a, i) => console.log(`  ${i + 1}. ${a.name}  (${a.id})`));
  console.log(yellow("Pick the account for your personal projects, not a business one."));
  for (;;) {
    const answer = await ask(`Which account should TururuCoding use? Type 1-${accounts.length}: `);
    const n = Number(answer);
    if (Number.isInteger(n) && n >= 1 && n <= accounts.length) return accounts[n - 1];
  }
};

const writeConfig = (keyHash) => {
  const config = {
    $schema: "./node_modules/wrangler/config-schema.json",
    name: WORKER_NAME,
    main: "./worker.ts",
    compatibility_date: COMPATIBILITY_DATE,
    account_id: accountId,
    assets: { directory: "../dist", binding: "ASSETS", run_worker_first: ["/api/*"] },
    durable_objects: { bindings: [{ name: "STORE", class_name: "SyncStore" }] },
    migrations: [{ tag: "v1", new_sqlite_classes: ["SyncStore"] }],
    // Only a hash of the device key; the key itself is never stored here.
    vars: { SYNC_KEY_HASH: keyHash },
    observability: { enabled: true },
  };
  const header = "// Written by scripts/cloudflare.mjs. It holds no secrets, but it names your Cloudflare account, so .gitignore keeps it out of the repository.\n";
  writeFileSync(configPath, header + JSON.stringify(config, null, 2) + "\n");
};

const buildApp = async () => {
  const { build } = await import("vite");
  await build({ root, configFile: join(root, "vite.config.ts"), logLevel: "warn", mode: "production" });
  console.log(green("Site built."));
};

const deploy = async () => {
  const dir = mkdtempSync(join(tmpdir(), "tururu-deploy-"));
  const outputFile = join(dir, "out.ndjson");
  try {
    const { code } = await wrangler(["deploy"], { env: { WRANGLER_OUTPUT_FILE_PATH: outputFile } });
    if (code !== 0) stop("Deploying failed (details above). Run this again once it is fixed.");
    const lines = existsSync(outputFile) ? readFileSync(outputFile, "utf8").split("\n").filter(Boolean) : [];
    const entries = lines.map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    });
    const result = entries.find((e) => e?.type === "deploy");
    return result?.targets?.find((t) => t.includes("workers.dev")) ?? result?.targets?.[0] ?? null;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

const waitUntilLive = async (url) => {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${url}/api/info`, { signal: AbortSignal.timeout(5000) });
      if (res.ok && (await res.json()).app === APP_ID) return true;
    } catch {
      /* a new workers.dev address can take a minute to appear */
    }
    await new Promise((r) => setTimeout(r, 4000));
  }
  return false;
};

// --------------------------------------------------------------------- main

const main = async () => {
  const command = process.argv[2] ?? "deploy";
  if (!["deploy", "new-key", "logout", "--dry-run"].includes(command)) stop(`Unknown command "${command}". Use deploy, new-key or logout.`);
  console.log(bold("\nTururuCoding → Cloudflare\n"));
  await ensureTools();

  // For testing this script without an account: build, write a config and let
  // Wrangler bundle and validate everything without uploading.
  if (command === "--dry-run") {
    accountId = "0".repeat(32);
    writeConfig(createHash("sha256").update("dry-run").digest("hex"));
    await buildApp();
    const { code } = await wrangler(["deploy", "--dry-run", "--outdir", join(tmpdir(), "tururu-dry-run")]);
    rmSync(configPath, { force: true });
    if (code !== 0) stop("Wrangler rejected the configuration (details above).");
    console.log(green("Dry run passed."));
    return;
  }

  if (command === "logout") {
    await wrangler(["logout"]);
    return;
  }

  step(1, "Signing in to Cloudflare");
  const me = await signIn();
  console.log(`Signed in as ${me.email ?? "an API token"}.`);
  const saved = readJson(statePath);
  const account = await chooseAccount(me, saved);
  accountId = account.id;
  console.log(`Using the account ${bold(account.name)}.`);

  step(2, "Device key");
  const existing = readJson(configPath)?.vars?.SYNC_KEY_HASH;
  let key = null;
  if (existing && command !== "new-key") {
    console.log("Keeping your current device key (linked devices keep working).");
    writeConfig(existing);
  } else {
    key = randomBytes(32).toString("base64url");
    writeConfig(createHash("sha256").update(key).digest("hex"));
    console.log(command === "new-key" ? "Made a new device key. Devices linked with the old one must be linked again." : "Made a device key for your devices.");
  }

  step(3, "Building the site");
  await buildApp();

  step(4, "Deploying to Cloudflare");
  const url = (await deploy()) ?? saved?.url ?? null;
  if (!url) stop("Deployed, but Wrangler did not report the address. Find it under Workers & Pages in the Cloudflare dashboard.");
  writeFileSync(statePath, JSON.stringify({ accountId, accountName: account.name, url, deployedAt: new Date().toISOString() }, null, 2) + "\n");

  step(5, "Checking the server");
  const live = await waitUntilLive(url);
  console.log(live ? green(`TururuCoding is live at ${url}`) : yellow(`Deployed to ${url}. It can take a few minutes before a new address answers.`));

  if (key) {
    const link = `${url}/#tc-key=${key}`;
    const copied = await copyToClipboard(link);
    console.log(`\n${bold("Your device link")} (it contains your device key, so keep it private):\n\n  ${link}\n`);
    console.log(
      `${copied ? "It is also on your clipboard. " : ""}Opening it in your browser now links this computer.\n` +
        "Open the same link once on each of your other devices (laptop, phone).\n" +
        "Save it in your password manager. Any linked device can show it again under Settings > Your devices.",
    );
    openInBrowser(link);
  } else {
    console.log(`\nYour devices keep syncing with the same key. Open ${url} to use the updated site.`);
  }

  if (!process.env.CLOUDFLARE_API_TOKEN) {
    const answer = await ask(
      `\nSign Wrangler out of Cloudflare on this computer now? Your site keeps running;\nyou only sign in again for the next update. [Y/n] `,
    );
    if (!/^n/i.test(answer)) {
      await wrangler(["logout"], { mode: "capture" });
      console.log("Signed out.");
    }
  }
  console.log(green("\nDone."));
};

main().catch((error) => {
  if (error instanceof Stop) console.error(`\n${red("Stopped:")} ${error.message}`);
  else console.error(error);
  process.exitCode = 1;
});
