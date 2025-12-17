import type { Level as LevelOrigin } from '@prisma/client';

// In the client side I cannot directly import values from the server i.e. prisma enums
// so in this file I can do a typesafe translation that guarentees the type matches what is in Prisma

// Guarantee that the implementation corresponds to the original type
export const Level: { [k in LevelOrigin]: k } = {
	BEGINNER: 'BEGINNER',
	RECREATIONAL: 'RECREATIONAL',
	INTERMEDITE: 'INTERMEDITE',
	COMPETITIVE: 'COMPETITIVE',
	ADVANCED: 'ADVANCED'
} as const;

// Re-exporting the original type with the original name
export type Level = LevelOrigin;
