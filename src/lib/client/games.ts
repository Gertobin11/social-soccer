import type { Rating } from '@prisma/client';

export function getAverageRating(ratings: Rating[]) {
	if (ratings.length > 0) {
		const totalRatings = ratings.reduce((acc, cur) => acc + cur.rating, 0);
		return totalRatings / ratings.length;
	}
}
