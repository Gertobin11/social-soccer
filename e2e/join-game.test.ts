import test, { expect } from '@playwright/test';
import dotenv from 'dotenv';
import { prisma, withAdditionalUser, withBasicUser, withGames, withRequest } from './fixtures';
import { env } from 'process';

dotenv.config();

test.beforeEach(async () => {
    await prisma.requestToJoin.deleteMany()
    await prisma.user.deleteMany();
    await prisma.game.deleteMany();
    await prisma.address.deleteMany();
    await prisma.coordinates.deleteMany();
});

test.afterEach(async () => {
    await prisma.requestToJoin.deleteMany()
    await prisma.user.deleteMany();
    await prisma.game.deleteMany();
    await prisma.address.deleteMany();
    await prisma.coordinates.deleteMany();
});

test('a registered user can request to join a game', async ({
    page
}) => {
    await withBasicUser(page);
    await withGames();
    await page.goto('/');

    //login
    await page.getByRole('link', { name: 'Login' }).click()
    await expect(page.getByRole('heading').getByText('Login')).toBeVisible()
    await page.getByRole('textbox', { name: 'Email' }).fill(env.ETHEREAL_EMAIL || "")
    await page.getByRole('textbox', { name: 'Password' }).fill(env.EMAIL_PASSWORD || "")
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByText('Signed in Successfully')).toBeVisible()

    // go to the game to join
    await page.getByRole('button', { name: 'Browse Games' }).click();
    await page.getByRole('button', { name: 'BEGINNER' }).click();
    await page.getByRole('link', { name: 'View Game Details' }).click()

    await page.getByRole('button', { name: 'Request to Join' }).click()
    await expect(page.getByText('Request sent to Join Game')).toBeVisible()
});


test('an organiser can accept a request', async ({
    page
}) => {
    await withBasicUser(page);
    const player = await withAdditionalUser()
    await withGames();
     const game = await prisma.game.findFirstOrThrow({
        include: {
            players: true
        }
     })
     expect(game.players.length).toBe(0)
    await withRequest(game.id, player.id)
    await page.goto('/');


    //login
    await page.getByRole('link', { name: 'Login' }).click()
    await expect(page.getByRole('heading').getByText('Login')).toBeVisible()
    await page.getByRole('textbox', { name: 'Email' }).fill(env.ETHEREAL_EMAIL || "")
    await page.getByRole('textbox', { name: 'Password' }).fill(env.EMAIL_PASSWORD || "")
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByText('Signed in Successfully')).toBeVisible()

    // go to the dashboard and accept request
    await page.getByRole('link', { name: 'Dashboard' }).click()
    await expect(page.getByRole('heading').getByText('Dashboard')).toBeVisible()
    await page.getByRole('button').nth(1).click()

    await expect(page.getByText('test@test.com')).not.toBeVisible()

    const updatedGame = await prisma.game.findFirstOrThrow({
        where: {
            id: game.id
        }, include: {
            players: true
        }
    })

    expect(updatedGame.players.length).toBe(1)

});