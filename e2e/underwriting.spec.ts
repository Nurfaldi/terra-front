import { test, expect } from "@playwright/test";
import path from "path";

const SPAJ_PATH = path.resolve(
    __dirname,
    "../../terra-back/data/health-uw-testing-data/SPAJK ARTHA GRAHA CLEAN censored.pdf"
);
const MEDICAL_PATH = path.resolve(
    __dirname,
    "../../terra-back/data/health-uw-testing-data/lab_medical_result_sample.pdf"
);

test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill("input#username", "rey_user1");
    await page.fill("input#password", "2345");
    await page.click("button:has-text('Sign in')");
    await expect(page).toHaveURL(/\/flows/);
});

test.describe("Health Underwriting Pipeline", () => {
    test("renders the rebuilt shell + stepper", async ({ page }) => {
        await page.goto("/underwriting");

        await expect(page.getByRole("heading", { name: "Health Underwriting Pipeline" })).toBeVisible();
        await expect(page.getByText("Underwriting Workspace")).toBeVisible();

        await expect(page.getByRole("button", { name: /SPAJ Upload/ })).toBeVisible();
        await expect(page.getByRole("button", { name: /Medical Analysis/ })).toBeVisible();
        await expect(page.getByRole("button", { name: /Generate Bordereaux/ })).toBeVisible();

        for (const label of ["Stage", "SPAJ Status", "Medical", "Verdict"]) {
            await expect(page.getByText(label, { exact: true })).toBeVisible();
        }

        await expect(page.getByRole("tab", { name: /SPAJ Upload/ })).toBeVisible();
        await expect(page.getByRole("tab", { name: /Medical Upload/ })).toBeVisible();
        await expect(page.getByRole("tab", { name: /Bordereaux/ })).toBeVisible();
    });

    test("locks medical + bordereaux until SPAJ is extracted", async ({ page }) => {
        await page.goto("/underwriting");

        const medicalTab = page.getByRole("tab", { name: /Medical Upload/ });
        const bordereauxTab = page.getByRole("tab", { name: /Bordereaux/ }).last();
        await expect(medicalTab).toBeDisabled();
        await expect(bordereauxTab).toBeDisabled();
    });

    test("full happy path: SPAJ → medical → bordereaux", async ({ page }) => {
        test.setTimeout(360_000);
        await page.goto("/underwriting");

        const fileInput = page.locator("input[type='file']").first();
        await fileInput.setInputFiles(SPAJ_PATH);
        await expect(page.getByText(/SPAJK ARTHA GRAHA CLEAN/)).toBeVisible();

        await page.getByRole("button", { name: "Extract SPAJ data" }).click();
        await expect(page.getByText("Extracted")).toBeVisible({ timeout: 90_000 });

        await page.getByRole("tab", { name: /Medical Upload/ }).click();
        const medicalInput = page.locator("input[type='file']").nth(1);
        await medicalInput.setInputFiles(MEDICAL_PATH);
        await expect(page.getByText("lab_medical_result_sample.pdf")).toBeVisible();

        await page.getByRole("button", { name: "Analyze documents" }).click();
        await expect(page.getByText(/Analyzed/)).toBeVisible({ timeout: 240_000 });

        await page.getByRole("tab", { name: "Medical Analysis" }).click();
        await expect(page.getByText("Final Verdict")).toBeVisible();
        await expect(page.getByText("Risk Assessment")).toBeVisible();

        await page.getByRole("tab", { name: "Bordereaux", exact: true }).click();
        await page.getByRole("button", { name: "Generate bordereaux" }).click();
        await expect(page.getByText("Bordereaux ready")).toBeVisible({ timeout: 60_000 });

        const downloadPromise = page.waitForEvent("download");
        await page.getByRole("button", { name: /Download Excel/ }).click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/bordereaux.*\.xlsx/);
    });
});
