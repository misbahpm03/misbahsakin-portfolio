import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3001/";
const ARTIFACTS_DIR = path.resolve(process.cwd(), "playwright-artifacts");

function nowSlug() {
  return new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function screenshot(page, name) {
  await ensureDir(ARTIFACTS_DIR);
  const file = path.join(ARTIFACTS_DIR, `${nowSlug()}_${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

function formatMsg(msg) {
  const loc = msg.location?.();
  const locStr = loc && loc.url ? ` @ ${loc.url}:${loc.lineNumber}:${loc.columnNumber}` : "";
  return `[${msg.type()}] ${msg.text()}${locStr}`;
}

async function getGetInTouchButtons(page) {
  const btn = page.getByRole("button", { name: /get in touch/i });
  if ((await btn.count()) > 0) return btn;

  const link = page.getByRole("link", { name: /get in touch/i });
  if ((await link.count()) > 0) return link;

  return page.locator("text=/\\bget in touch\\b/i");
}

async function assertVisible(locator, label) {
  const count = await locator.count();
  if (count === 0) throw new Error(`Expected ${label} to exist, but found 0 matches.`);
  await locator.first().waitFor({ state: "visible", timeout: 10_000 });
}

async function assertClickable(locator, label) {
  await assertVisible(locator, label);
  await locator.first().click({ trial: true, timeout: 10_000 });
}

async function assertFormModalOpen(page) {
  const dialog = page.locator('[role="dialog"]');
  await dialog.first().waitFor({ state: "visible", timeout: 10_000 });

  const formCount = await dialog.locator("form").count();
  const textboxes = await dialog.getByRole("textbox").count();
  const sendButtons =
    (await dialog.getByRole("button", { name: /send/i }).count()) +
    (await dialog.getByRole("button", { name: /submit/i }).count());

  if (formCount === 0 && textboxes === 0 && sendButtons === 0) {
    throw new Error(
      `Dialog opened, but no obvious form controls found (forms=${formCount}, textboxes=${textboxes}, send/submit buttons=${sendButtons}).`
    );
  }
}

async function main() {
  const results = {
    baseUrl: BASE_URL,
    steps: [],
    console: [],
    pageErrors: [],
    requestFailed: [],
    screenshots: [],
    status: "unknown",
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  page.on("console", (msg) => results.console.push(formatMsg(msg)));
  page.on("pageerror", (err) => results.pageErrors.push(String(err?.stack || err)));
  page.on("requestfailed", (req) => {
    const failure = req.failure();
    results.requestFailed.push({
      url: req.url(),
      method: req.method(),
      resourceType: req.resourceType(),
      errorText: failure?.errorText,
    });
  });

  async function runStep(name, fn) {
    const step = { name, ok: false, error: null, screenshot: null };
    results.steps.push(step);
    try {
      await fn();
      step.ok = true;
    } catch (e) {
      step.error = String(e?.stack || e);
      step.screenshot = await screenshot(page, `FAIL_${name.replaceAll(/\s+/g, "_")}`);
      results.screenshots.push(step.screenshot);
      throw e;
    }
  }

  try {
    await runStep("Open homepage", async () => {
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 20_000 });
      await page.waitForTimeout(400);
      results.screenshots.push(await screenshot(page, "home_loaded"));
    });

    await runStep('Hero "Contact Me" opens contact options modal', async () => {
      const contactMeBtn = page.getByRole("button", { name: /contact me/i }).first();
      await assertClickable(contactMeBtn, 'Hero "Contact Me" button');
      await contactMeBtn.click({ timeout: 10_000 });

      const whatsapp = page.locator("text=/\\bwhatsapp\\b/i");
      const telegram = page.locator("text=/\\btelegram\\b/i");
      const email = page.locator("text=/\\bemail\\b/i");

      await assertVisible(whatsapp, "WhatsApp option");
      await assertVisible(telegram, "Telegram option");
      await assertVisible(email, "Email option");

      // Ensure each option is actually clickable (without navigating).
      await assertClickable(whatsapp, "WhatsApp option");
      await assertClickable(telegram, "Telegram option");
      await assertClickable(email, "Email option");

      results.screenshots.push(await screenshot(page, "contact_options_modal_open"));

      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    });

    await runStep('Click sidebar "Get In Touch" opens form modal', async () => {
      const buttons = await getGetInTouchButtons(page);
      if ((await buttons.count()) < 1) {
        throw new Error('Could not find any "Get In Touch" buttons/links.');
      }

      const sidebarBtn = buttons.nth(0);
      await assertClickable(sidebarBtn, 'Sidebar "Get In Touch"');
      await sidebarBtn.click({ timeout: 10_000 });
      await assertFormModalOpen(page);
      results.screenshots.push(await screenshot(page, "get_in_touch_sidebar_form_modal_open"));

      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    });

    await runStep('Click contact-section "Get In Touch" opens form modal', async () => {
      const buttons = await getGetInTouchButtons(page);
      const count = await buttons.count();
      if (count < 2) {
        throw new Error(`Expected 2 "Get In Touch" buttons/links, but found ${count}.`);
      }

      const sectionBtn = buttons.nth(1);
      await sectionBtn.scrollIntoViewIfNeeded();
      await assertClickable(sectionBtn, 'Contact-section "Get In Touch"');
      await sectionBtn.click({ timeout: 10_000 });
      await assertFormModalOpen(page);
      results.screenshots.push(await screenshot(page, "get_in_touch_section_form_modal_open"));
    });

    results.status = "pass";
  } catch {
    results.status = "fail";
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }

  const outFile = path.join(ARTIFACTS_DIR, `${nowSlug()}_ui-smoke-results.json`);
  await ensureDir(ARTIFACTS_DIR);
  await fs.writeFile(outFile, JSON.stringify(results, null, 2), "utf8");

  console.log(JSON.stringify({ status: results.status, resultsFile: outFile, screenshots: results.screenshots }, null, 2));

  if (results.status !== "pass") process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
