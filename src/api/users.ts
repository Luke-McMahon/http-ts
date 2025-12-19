import type { NextFunction, Request, Response } from "express";
import { createUser } from "../db/queries/users.js";

import { respondWithJSON } from "./json.js";
import { BadRequestError } from "../errors.js";

export async function handlerUserCreate(req: Request, res: Response, next: NextFunction) {
	try {
		type parameters = {
			email: string;
		};

		const params: parameters = req.body;
		if (!params.email) {
			throw new BadRequestError("Missing required fields");
		}

		const user = await createUser({ email: params.email });

		respondWithJSON(res, 201, {
			id: user.id,
			email: user.email,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		});
	} catch (e) {
		next(e);
	}
}
