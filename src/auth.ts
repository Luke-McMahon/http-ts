import type { Request } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

import { UserForbiddenError, UserNotAuthenticatedError } from "./errors.js";
import { config } from "./config.js";


export async function hashPassword(password: string) {
	return argon2.hash(password);
}

export async function checkPasswordHash(password: string, hash: string) {
	if (!password) return false;
	try {
		return await argon2.verify(hash, password);
	} catch {
		return false;
	}
}

export function getBearerToken(req: Request): string {
	const raw = req.get("authorization");
	if (!raw) throw new UserForbiddenError("Authorization header not present");

	const match = raw.trim().match(/^Bearer\s+(.+)$/i);
	if (!match) throw new UserForbiddenError("Invalid Authorization header format");

	return match[1].trim();
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string) {
	const issuedAt = Math.floor(Date.now() / 1000);
	const expiresAt = issuedAt + expiresIn;
	const token = jwt.sign(
		{
			iss: config.jwt.issuer,
			sub: userID,
			iat: issuedAt,
			exp: expiresAt,
		} satisfies payload,
		secret,
		{ algorithm: "HS256" },
	);

	return token;
}

export function validateJWT(tokenString: string, secret: string) {
	let decoded: payload;
	try {
		decoded = jwt.verify(tokenString, secret) as JwtPayload;
	} catch (e) {
		throw new UserNotAuthenticatedError("Invalid token");
	}

	if (decoded.iss !== config.jwt.issuer) {
		throw new UserNotAuthenticatedError("Invalid issuer");
	}

	if (!decoded.sub) {
		throw new UserNotAuthenticatedError("No user ID in token");
	}

	return decoded.sub;
}
