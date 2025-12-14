import { Level } from '$lib/client/prismaEnumTranslation';
import { daysOfTheWeek } from '$lib/client/utils';
import z from 'zod/v4';

export const createGameSchema = z.object({
	day: z.enum(daysOfTheWeek),
	active: z.boolean().default(true),
	time: z.iso.time(),
	numberOfPlayers: z.number().min(8).max(14).default(8),
	level: z.enum(Level),
	addressID: z.number().nonnegative()
});

export const filterGameSchema = z.object({
	day: z.enum(daysOfTheWeek).optional(),
	level: z.enum(Level).optional(),
	numberOfPlayers: z.number().min(8).max(14).optional()
});
