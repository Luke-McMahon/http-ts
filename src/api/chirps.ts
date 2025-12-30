import type { NextFunction, Request, Response } from "express";

import { respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError, UserNotAuthenticatedError } from "../errors.js";
import { createChirp, getChirp, getChirps } from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";

export async function handlerChirpGet(req: Request, res: Response, next: NextFunction) {
	try {
		const chirpId = req.params.chirpId as string;

		const chirp = await getChirp(chirpId);
		if (!chirp) {
			throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`);
		}

		respondWithJSON(res, 200, chirp);
	} catch (e) {
		next(e);
	}
}
export async function handlerChirpsGet(req: Request, res: Response, next: NextFunction) {
	try {
		const chirps = await getChirps();
		respondWithJSON(res, 200, chirps);
	} catch (e) {
		next(e);
	}
}

export async function handlerChirpsCreate(req: Request, res: Response, next: NextFunction) {
	try {

		const token = getBearerToken(req);
		const userId = validateJWT(token, config.jwt.secret);
		if (!userId) {
			throw new UserNotAuthenticatedError("unauthorized");
		}

		type parameters = {
			body: string;
		};

		const maxChirpLength = 140;
		const params: parameters = req.body;

		if (params.body.length > maxChirpLength) {
			throw new BadRequestError(`Chirp is too long. Max length is ${maxChirpLength}`);
		}

		const naughtyWords = ["kerfuffle", "sharbert", "fornax"];
		const searchPattern = new RegExp(naughtyWords.join("|"), "gi");

		const cleanedBody = params.body.replaceAll(searchPattern, "****")

		const chirp = await createChirp({
			body: cleanedBody,
			user_id: userId,
		});

		respondWithJSON(res, 201, {
			id: chirp.id,
			createdAt: chirp.createdAt,
			updatedAt: chirp.updatedAt,
			body: chirp.body,
			userId: chirp.user_id,
		});
	} catch (e) {
		next(e);
	}
}

