import type { NextFunction, Request, Response } from "express";

import { respondWithJSON } from "./json.js";
import { BadRequestError } from "../errors.js";

export async function handlerChirpsValidate(req: Request, res: Response, next: NextFunction) {
	try {
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

		respondWithJSON(res, 200, {
			cleanedBody
		});
	} catch (e) {
		next(e);
	}
}

