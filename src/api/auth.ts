import type { NextFunction, Request, Response } from "express";
import { getUserByEmail } from "../db/queries/users.js";

import { respondWithJSON } from "./json.js";
import { BadRequestError, UserForbiddenError } from "../errors.js";
import { checkPasswordHash, makeJWT } from "../auth.js";
import { config } from "../config.js";
import { UserResponse } from "./users.js";

type LoginResponse = UserResponse & {
	token: string;
};

export async function handlerLogin(req: Request, res: Response, next: NextFunction) {
	try {
		type parameters = {
			email: string;
			password: string;
			expiresInSeconds?: number;
		};

		const params: parameters = req.body;
		if (!params.email || !params.password) {
			throw new BadRequestError("Missing required fields");
		}

		let expiry = config.jwt.defaultDuration;
		if (params.expiresInSeconds && !(params.expiresInSeconds > config.jwt.defaultDuration)) {
			expiry = params.expiresInSeconds;
		}

		const user = await getUserByEmail(params.email);
		if (!user) {
			throw new UserForbiddenError("invalid email or password");
		}

		const verified = await checkPasswordHash(params.password, user.password);
		if (!verified) {
			throw new UserForbiddenError("invalid email or password");
		}

		const token = makeJWT(user.id, expiry, config.jwt.secret)
		const result = {
			id: user.id,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			email: user.email,
			token: token,
		};

		return respondWithJSON(res, 200, result satisfies LoginResponse);
	} catch (e) {
		next(e);
	}
}
