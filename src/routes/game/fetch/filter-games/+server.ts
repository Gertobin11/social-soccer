import {
	buildGameDataForMap,
	type FilterGameData,
	type MapGameData
} from '$lib/server/game';
import prisma from '$lib/server/prisma.js';
import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	try {
		const { form }: { form: FilterGameData } = await request.json();

		if (!form) {
			throw new Error('Request does not have form data');
		}

		const games = await prisma.game.findMany({
			where: form,
			orderBy: { createdOn: 'desc' },
			include: { players: true }
		});

		const gameDataArray: MapGameData[] = [];

		for (let game of games) {
			gameDataArray.push(await buildGameDataForMap(game));
		}

		return json({ success: true, message: 'Filter Successful', gameDataArray });
	} catch (error) {
		return json({ success: false, message: 'Server error, please try again or contact support' });
	}
}
