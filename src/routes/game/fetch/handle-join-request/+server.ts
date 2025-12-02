import type { RequestWithRelatedFields } from '$lib/client/games';
import {
	addPlayerToGame,
	getOpenGameRequestForAdmin,
	getRequestToJoinByID,
	updateRequestToJoin
} from '$lib/orm/game';
import { verifyUserIsOrganiserOfGame } from '$lib/server/game';
import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	try {
		if (!locals.session) {
			return json({ success: false, message: 'User was not logged in ' });
		}

		const { requestID, accepted }: { requestID: number; accepted: boolean } = await request.json();

		if (!requestID) {
			return json({ success: false, message: 'Request does not have an ID' });
		}

		if (isNaN(requestID)) {
			return json({ success: false, message: 'ID is invalid' });
		}

		if (accepted === undefined) {
			return json({
				success: false,
				message: 'Request does not provide info if the request was accepted or rejected'
			});
		}

		const gameRequest = await getRequestToJoinByID(requestID);
		if (!gameRequest) {
			return json({ success: false, message: 'Request not found' });
		}

		await verifyUserIsOrganiserOfGame(gameRequest.gameID, locals.session.userID);

		if (accepted === true) {
			await addPlayerToGame(gameRequest.gameID, gameRequest.playerID);
		}
        
		await updateRequestToJoin(gameRequest.id, accepted);
		const openRequests: RequestWithRelatedFields[] = await getOpenGameRequestForAdmin(
			locals.session.userID
		);

		return json({ success: true, message: 'Request accepted', openRequests });
	} catch (error) {
		return json({ success: false, message: 'Server error, please try again or contact support' });
	}
}
