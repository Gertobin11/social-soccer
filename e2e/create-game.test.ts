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

test('a registered user can create a game', async ({
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

    // create the address for the game after clicking on the location on the map
    await page.getByRole('link', { name: 'Create Game' }).click();
    await page.locator('.gm-style > div > div:nth-child(2)').click()

    // wait for the geo spatial translation
    await page.waitForTimeout(400)

    await page.getByRole('textbox', { name: 'Address Line 1 *' }).fill("No. 1 Main street")
    await page.getByRole('textbox', { name: 'Eircode *' }).fill("V91 23HY")
    await page.getByRole('button', { name: 'Continue' }).click()

    // create the game game details 
    await expect(page.getByRole('heading', { name: 'Game Details' })).toBeVisible()
    await page.getByLabel('Day').selectOption("Thursday")
    await page.getByRole('textbox', { name: 'Time' }).fill("16:00")
    await page.getByLabel('Level').selectOption("COMPETITIVE")
    await page.getByRole('spinbutton', { name: 'No. of PLayers' }).fill("12")
    await page.getByRole('button', { name: 'Create' }).click()

    // validate game was created 
    await expect(page.getByText('Game Created Successfully!')).toBeVisible()
    await expect(page.getByText('No. 1 Main street')).toBeVisible()
    await expect(page.getByText('Thursday')).toBeVisible()
    await expect(page.getByText('12')).toBeVisible()

});
