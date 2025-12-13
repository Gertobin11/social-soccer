import test, { expect, type Page } from '@playwright/test';
import dotenv from 'dotenv';
import { prisma, withBasicUser, withGames } from './fixtures';

dotenv.config();

test.beforeEach(async () => {
	await prisma.user.deleteMany();
	await prisma.game.deleteMany();
	await prisma.address.deleteMany();
	await prisma.coordinates.deleteMany();
});

test.afterEach(async () => {
	await prisma.user.deleteMany();
	await prisma.game.deleteMany();
	await prisma.address.deleteMany();
	await prisma.coordinates.deleteMany();
});

test('a non logged in user can see the map and an overview, but prompted to register when a location is clicked', async ({
	page
}) => {
	await withBasicUser(page);
	await withGames();
	await page.goto('/');
});
