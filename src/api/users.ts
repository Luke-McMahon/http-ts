import type { NextFunction, Request, Response } from "express";

import { createUser } from "../db/queries/users.js";
import { respondWithJSON } from "./json.js";
import { BadRequestError } from "../errors.js";
import { hashPassword } from "../auth.js";
import { NewUser } from "../db/schema.js";


export type UserResponse = Omit<NewUser, "password">;

export async function handlerUserCreate(req: Request, res: Response, next: NextFunction) {
	try {
		type parameters = {
			email: string;
			password: string;
		};

		const params: parameters = req.body;
		if (!params.email || !params.password) {
			throw new BadRequestError("Missing required fields");
		}

		const hash = await hashPassword(params.password);

		const user = await createUser({ email: params.email, password: hash }) as UserResponse;

		return respondWithJSON(res, 201, user);
	} catch (e) {
		next(e);
	}
}
