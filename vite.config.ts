import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

import dotenv from 'dotenv';

process.env = {
	...process.env,
	...dotenv.config({ path: './.env.test' }).parsed
};

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: {
        include: ['src/**/*.{test}.{js,ts}'],
        setupFiles: ['./tests/setup.ts'],
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['tests/lib/server/*'],
				}
			},
            {
				extends: './vite.config.ts',
				test: {
					name: 'client',
					environment: 'jsdom',
					include: ['tests/lib/client/*'],
				}
			}
		]
	}
});
