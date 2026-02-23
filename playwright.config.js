const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/smoke',
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:9000'
  },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://127.0.0.1:9000',
    reuseExistingServer: true,
    timeout: 120000
  }
});
