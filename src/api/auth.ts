import type { NextFunction, Request, Response } from "express";
import { getUserByEmail } from "../db/queries/users.js";

import { respondWithJSON } from "./json.js";
import { BadRequestError, UserForbiddenError } from "../errors.js";
import { checkPasswordHash } from "../auth.js";
import { UserResponse } from "../api/users.js";

export async function handlerLogin(req: Request, res: Response, next: NextFunction) {
	try {
		type parameters = {
			email: string;
			password: string;
		};

		const params: parameters = req.body;
		if (!params.email || !params.password) {
			throw new BadRequestError("Missing required fields");
		}

		const user = await getUserByEmail(params.email);
		if (!user) {
			throw new UserForbiddenError("invalid email or password");
		}

		const verified = await checkPasswordHash(params.password, user.password);
		if (!verified) {
			throw new UserForbiddenError("invalid email or password");
		}

		return respondWithJSON(res, 200, user as UserResponse);
	} catch (e) {
		next(e);
	}
}
