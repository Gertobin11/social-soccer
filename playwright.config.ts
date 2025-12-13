import { defineConfig } from '@playwright/test';
import { devices } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config({ path: "./.env.test" })

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	testDir: 'e2e'
});


const config = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		timeout: 2 * 60 * 1000
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(spec)\.[jt]s/,
	use: {
		trace: 'on-first-retry',
		video: 'retain-on-failure'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	]
};
