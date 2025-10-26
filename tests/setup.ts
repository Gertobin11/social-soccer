import { execSync } from 'child_process';
import { config } from 'dotenv';
import path from 'path';

/**
 * Global vitest setup to apply all migrations to test database
 */

config({ path: path.resolve(__dirname, '../.env.test') });

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not set for testing');
}

console.log('Starting Vitest... Applying migrations to test database...');

try {
	execSync('npx prisma migrate deploy', { stdio: 'inherit' });
	console.log('Migrations applied successfully.');
} catch (error) {
	console.error('Failed to apply migrations:', error);
	process.exit(1);
}
