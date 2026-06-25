import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir } from 'node:fs/promises';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const publicDocsDir = join(scriptDir, '..', 'public', 'docs');

const baseUrl = process.env.CAPTURE_BASE_URL ?? 'http://localhost:3000';
const email = process.env.CAPTURE_EMAIL;
const password = process.env.CAPTURE_PASSWORD;
const onlySection = process.env.CAPTURE_SECTION;

const viewport = { width: 1440, height: 900 };

async function login(page) {
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
    await page.fill('#login-rhf-email', email);
    await page.fill('#login-rhf-password', password);
    await Promise.all([
        page.waitForURL(url => !url.pathname.startsWith('/login'), {
            timeout: 30000,
        }),
        page.getByRole('button', { name: 'Login' }).click(),
    ]);
}

async function shot(page, section, name) {
    const dir = join(publicDocsDir, section);
    await mkdir(dir, { recursive: true });
    await page.screenshot({ path: join(dir, `${name}.png`), fullPage: false });
    console.log(`Captured ${section}/${name}`);
}

async function step(label, fn) {
    try {
        await fn();
    } catch (error) {
        console.warn(`Skipped "${label}": ${error.message}`);
    }
}

async function selectFirstLocation(page) {
    await page.getByRole('combobox').first().click();
    await page.getByRole('option').first().waitFor();
    await page.getByRole('option').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
}

async function clickTab(page, label) {
    await page.getByRole('tab', { name: label, exact: true }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
}

const sections = [
    {
        name: 'review',
        url: '/review',
        async capture(page) {
            await page.getByRole('tab', { name: 'SITES LIST' }).waitFor();
            await shot(page, 'review', '01-overview');

            await step('location dropdown', async () => {
                await page.getByRole('combobox').first().click();
                await page.getByRole('option').first().waitFor();
                await page.waitForTimeout(500);
                await shot(page, 'review', '02-location-dropdown');
                await page.getByRole('option').first().click();
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(500);
                await shot(page, 'review', '03-sites-list');
            });

            await step('month range picker', async () => {
                await page
                    .getByRole('button', { name: /\b20\d{2}$/ })
                    .first()
                    .click();
                await page.waitForTimeout(500);
                await shot(page, 'review', '05-month-picker');
                await page.keyboard.press('Escape');
                await page.waitForTimeout(300);
            });

            await step('expand site group', async () => {
                await page.locator('.cursor-pointer').first().click();
                await page.waitForTimeout(500);
                await shot(page, 'review', '04-site-expanded');
            });

            await step('export tab', async () => {
                await clickTab(page, 'EXPORT');
                await shot(page, 'review', '06-export');
            });
        },
    },
    {
        name: 'review-detail',
        url: '/review',
        async capture(page) {
            await page.getByRole('tab', { name: 'SITES LIST' }).waitFor();
            await selectFirstLocation(page);
            await page.locator('.cursor-pointer').first().click();
            await page.waitForTimeout(500);
            await page.locator('a[href^="/review/"]').first().click();
            await page.waitForURL(/\/review\/\d+/, { timeout: 15000 });
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(800);
            await shot(page, 'review-detail', '01-metadata-review');

            await step('advance to image review', async () => {
                const directContinue = page.getByRole('button', {
                    name: 'Continue to Image Review',
                });
                const canContinueDirectly =
                    (await directContinue.count()) > 0 &&
                    (await directContinue.first().isEnabled());

                if (canContinueDirectly) {
                    await directContinue.first().click();
                } else {
                    let guard = 0;
                    while (guard++ < 50) {
                        const pending = page.locator(
                            'button:has-text("Select value")',
                        );
                        if ((await pending.count()) === 0) break;
                        await pending.first().click();
                        await page.getByRole('option').first().click();
                        await page.waitForTimeout(120);
                    }
                    await page
                        .getByRole('button', { name: 'Resolve & Continue' })
                        .click();
                }

                await page
                    .getByRole('button', { name: 'Continue to Certification' })
                    .waitFor({ timeout: 15000 });
                await page.waitForTimeout(1000);
                await shot(page, 'review-detail', '02-image-review');
            });

            await step('certification step', async () => {
                await page
                    .getByRole('button', { name: 'Continue to Certification' })
                    .click();
                await page.waitForTimeout(1200);
                await shot(page, 'review-detail', '03-certification');
            });
        },
    },
    {
        name: 'operations',
        url: '/operations',
        async capture(page) {
            await selectFirstLocation(page);
            const tabs = [
                { name: 'geographical-summary', label: 'GEOGRAPHICAL SUMMARY' },
                { name: 'metrics', label: 'METRICS' },
                { name: 'ai-performance', label: 'AI PERFORMANCE' },
                { name: 'vht-compliance', label: 'VHT COMPLIANCE' },
            ];
            for (const [index, tab] of tabs.entries()) {
                await step(`operations ${tab.label}`, async () => {
                    await clickTab(page, tab.label);
                    if (tab.name === 'geographical-summary') {
                        await page
                            .locator('.leaflet-marker-icon')
                            .first()
                            .waitFor({ timeout: 15000 })
                            .catch(() => {});
                        await page.waitForTimeout(500);
                    }
                    const prefix = String(index + 1).padStart(2, '0');
                    await shot(page, 'operations', `${prefix}-${tab.name}`);
                });
            }
        },
    },
    {
        name: 'annotation',
        url: '/annotate',
        async capture(page) {
            const tabs = [
                { name: 'pending', label: 'PENDING' },
                { name: 'in-progress', label: 'IN PROGRESS' },
                { name: 'completed', label: 'COMPLETED' },
            ];
            for (const [index, tab] of tabs.entries()) {
                await step(`annotation ${tab.label}`, async () => {
                    await clickTab(page, tab.label);
                    const prefix = String(index + 1).padStart(2, '0');
                    await shot(
                        page,
                        'annotation',
                        `${prefix}-tasks-${tab.name}`,
                    );
                });
            }

            await step('open first task detail', async () => {
                await clickTab(page, 'COMPLETED');
                await page.locator('a[href^="/annotate/"]').first().click();
                await page.waitForURL(/\/annotate\/\d+/, { timeout: 15000 });
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(800);
                const detailTabs = [
                    { name: 'pending', label: 'PENDING' },
                    { name: 'annotated', label: 'ANNOTATED' },
                    { name: 'flagged', label: 'FLAGGED' },
                ];
                for (const [index, tab] of detailTabs.entries()) {
                    await step(`annotation detail ${tab.label}`, async () => {
                        await clickTab(page, tab.label);
                        const prefix = String(index + 1).padStart(2, '0');
                        await shot(
                            page,
                            'annotation',
                            `detail-${prefix}-${tab.name}`,
                        );
                    });
                }
            });
        },
    },
];

async function main() {
    if (!email || !password) {
        throw new Error(
            'Set CAPTURE_EMAIL and CAPTURE_PASSWORD environment variables.',
        );
    }

    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport,
        deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    await login(page);

    for (const section of sections) {
        if (onlySection && section.name !== onlySection) continue;
        await step(`section ${section.name}`, async () => {
            await page.goto(`${baseUrl}${section.url}`, {
                waitUntil: 'networkidle',
            });
            await page.waitForTimeout(800);
            await section.capture(page);
        });
    }

    await browser.close();
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
