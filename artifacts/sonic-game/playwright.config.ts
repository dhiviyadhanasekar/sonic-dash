import { defineConfig, devices } from "@playwright/test";
import * as os from "os";

// Use the system Chromium installed via Nix when available
const nixChromium = `${os.homedir()}/.nix-profile/bin/chromium`;

export default defineConfig({
  testDir: "./tests",
  timeout: 20_000,
  retries: 1,
  use: {
    baseURL: "http://localhost:25857",
    headless: true,
    screenshot: "only-on-failure",
    launchOptions: {
      executablePath: nixChromium,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm run dev",
    url: "http://localhost:25857",
    reuseExistingServer: true,
    timeout: 15_000,
  },
});
