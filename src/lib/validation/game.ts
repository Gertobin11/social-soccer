import { daysOfTheWeek } from "$lib/client/utils";
import { Level } from "@prisma/client";
import z from "zod/v4";

export const createGameSchema = z.object({
    day : z.enum(daysOfTheWeek),
    active: z.boolean().default(true),
    time: z.iso.time(),
    numberOfPlayers: z.number().min(8).max(14).default(8),
    level: z.enum(Level)
});