import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { chromium } from "playwright";

const HOST = "127.0.0.1";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.resolve(projectRoot, "artifacts", "visual-qa");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Server not ready yet.
    }
    await sleep(500);
  }
  throw new Error(`Preview server did not become ready within ${timeoutMs}ms at ${url}.`);
}

async function findAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, HOST, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("Unable to resolve a free port for visual QA.")));
        return;
      }
      const { port } = address;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(port);
      });
    });
    server.on("error", reject);
  });
}

function startPreviewServer(port) {
  const commandText = `npm run preview -- --host ${HOST} --port ${port} --strictPort`;
  console.log(`Starting preview server: ${commandText}`);

  const preview =
    process.platform === "win32"
      ? spawn(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", commandText], {
          cwd: projectRoot,
          stdio: ["ignore", "pipe", "pipe"]
        })
      : spawn("npm", ["run", "preview", "--", "--host", HOST, "--port", String(port), "--strictPort"], {
          cwd: projectRoot,
          stdio: ["ignore", "pipe", "pipe"]
        });

  preview.stdout.on("data", (chunk) => {
    process.stdout.write(chunk.toString());
  });

  preview.stderr.on("data", (chunk) => {
    process.stderr.write(chunk.toString());
  });

  return preview;
}

async function stopPreviewServer(preview) {
  if (!preview || preview.exitCode !== null) return;

  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const killer = spawn("taskkill", ["/pid", String(preview.pid), "/t", "/f"], { stdio: "ignore" });
      killer.on("close", resolve);
      killer.on("error", resolve);
    });
    return;
  }

  preview.kill("SIGTERM");
}

async function launchBrowser() {
  try {
    console.log("Launching browser via Edge channel...");
    return await chromium.launch({
      channel: "msedge",
      headless: true,
      timeout: 30000
    });
  } catch (msEdgeError) {
    try {
      console.log("Edge launch failed, falling back to bundled Chromium...");
      return await chromium.launch({ headless: true, timeout: 30000 });
    } catch (chromiumError) {
      throw new Error(
        `Unable to launch a browser for visual QA.\nmsedge error: ${msEdgeError}\nchromium error: ${chromiumError}`
      );
    }
  }
}

async function disableMotion(page) {
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation: none !important;
        transition: none !important;
      }
    `
  });
  await page.waitForTimeout(180);
}

async function loadDemoScenario(page) {
  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Load Demo Scenario" }).click();
  await page.waitForSelector(".workspace-status", { timeout: 45000 });
  await page.waitForTimeout(180);
}

async function run() {
  console.log("Preparing visual QA output directory...");
  await mkdir(outputDir, { recursive: true });
  const port = await findAvailablePort();
  const baseUrl = `http://${HOST}:${port}`;
  const preview = startPreviewServer(port);

  try {
    console.log(`Waiting for preview server at ${baseUrl}...`);
    await waitForServer(baseUrl);
    console.log("Preview server is ready.");
    const browser = await launchBrowser();
    console.log("Capturing desktop screenshot...");
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1024 }
    });
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "domcontentloaded", timeout: 45000 });
    await disableMotion(page);
    await loadDemoScenario(page);
    await page.screenshot({
      path: path.resolve(outputDir, "desktop.png"),
      fullPage: true
    });

    await context.close();

    console.log("Capturing mobile screenshot...");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
    await mobilePage.evaluate(() => localStorage.clear());
    await mobilePage.reload({ waitUntil: "domcontentloaded", timeout: 45000 });
    await disableMotion(mobilePage);
    await loadDemoScenario(mobilePage);
    await mobilePage.screenshot({
      path: path.resolve(outputDir, "mobile.png"),
      fullPage: false
    });
    await mobileContext.close();
    await browser.close();

    const markerPath = path.resolve(outputDir, "README.txt");
    await writeFile(
      markerPath,
      [
        "Visual QA screenshots generated by scripts/visual-qa.mjs",
        `Desktop: ${path.resolve(outputDir, "desktop.png")}`,
        `Mobile: ${path.resolve(outputDir, "mobile.png")}`,
        `Captured at: ${new Date().toISOString()}`
      ].join("\n"),
      "utf8"
    );

    console.log(`\nVisual QA screenshots saved to ${outputDir}`);
  } finally {
    await stopPreviewServer(preview);
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
