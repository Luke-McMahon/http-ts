

import { asc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { Chirp, NewChirp, chirps } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
	const [result] = await db.insert(chirps).values(chirp).onConflictDoNothing().returning();
	return result;
}

export async function getChirps() {
	const result: Chirp[] = await db.select().from(chirps).orderBy(asc(chirps.createdAt));
	return result;
}

export async function getChirp(id: string) {
	const result = await db.select().from(chirps).where(eq(chirps.id, id));
	if (result.length === 0) {
		return;
	}
	return result[0];
}

