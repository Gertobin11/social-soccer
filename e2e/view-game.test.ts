import test, { expect, type Page } from '@playwright/test';
import dotenv from 'dotenv';
import { prisma, withBasicUser, withGames } from './fixtures';
import { env } from 'process';

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

	// check the welcome text is visible and the 2 CTA's for non logged in users can be seem
	await expect(page.getByRole('heading', { name: 'Join the game, find your' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Register Now' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Browse Games' })).toBeVisible();

	await page.getByRole('button', { name: 'Browse Games' }).click();
	await page.getByRole('button', { name: 'BEGINNER' }).click();
	await expect(page.getByText('Level BEGINNER')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Register To View Details' })).toBeVisible();
});

test('a non logged in user can see the map and filter the games', async ({ page }) => {
	await withBasicUser(page);
	await withGames();
	await page.goto('/');

	// check the welcome text is visible and the 2 CTA's for non logged in users can be seem
	await expect(page.getByRole('heading', { name: 'Join the game, find your' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Register Now' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Browse Games' })).toBeVisible();

	await page.getByRole('button', { name: 'Browse Games' }).click();

	// filter the games
	await page.getByLabel('Day').selectOption('Tuesday');
	await page.getByLabel('Level').selectOption('RECREATIONAL');
	await page.getByRole('button', { name: 'Filter' }).click();

    // wait for the map to update
    await page.waitForTimeout(1000)

	// check the filtering workded
	await expect(page.getByRole('button', { name: 'RECREATIONAL' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'COMPETITIVE' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'BEGINNER' })).not.toBeVisible();
	await page.getByRole('button', { name: 'RECREATIONAL' }).click();
	await expect(page.getByText('Level RECREATIONAL')).toBeVisible();
	await expect(page. getByLabel('', { exact: true }).getByText('Tuesday')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Register To View Details' })).toBeVisible();
});

test('a registered user can log in and see the game details', async ({
	page
}) => {
	await withBasicUser(page);
	await withGames();
	await page.goto('/');

	// check the welcome text is visible and the 2 CTA's for non logged in users can be seem
	await expect(page.getByRole('heading', { name: 'Join the game, find your' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Register Now' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Browse Games' })).toBeVisible();

    //login
    await page.getByRole('link', { name: 'Login' }).click()
    await expect(page.getByRole('heading').getByText('Login')).toBeVisible()
    await page.getByRole('textbox', { name: 'Email' }).fill(env.ETHEREAL_EMAIL || "")
    await page.getByRole('textbox', { name: 'Password' }).fill(env.EMAIL_PASSWORD || "")
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByText('Signed in Successfully')).toBeVisible()

    // check the landing page updated
    await expect(page.getByRole('link', { name: 'Register Now' })).not.toBeVisible();


    // check that the game pop up card has the option to view it
	await page.getByRole('button', { name: 'Browse Games' }).click();
	await page.getByRole('button', { name: 'BEGINNER' }).click();
	await expect(page.getByText('Level BEGINNER')).toBeVisible();
	await expect(page.getByRole('link', { name: 'View Game Details' })).toBeVisible();
    await page.getByRole('link', { name: 'View Game Details' }).click()

    // verify the game details are now visible
    await expect(page.getByText('No. 1 Main Street Tralee')).toBeVisible()
    await expect(page.getByText('Day Monday Time 20:')).toBeVisible()
});
