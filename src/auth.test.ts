import type { Request } from "express";
import { describe, it, expect, beforeAll } from "vitest";

import { hashPassword, checkPasswordHash, makeJWT, validateJWT, getBearerToken } from "./auth";
import { UserForbiddenError, UserNotAuthenticatedError } from "./errors.js";

describe("Password Hashing", () => {
	const password1 = "correctPassword123!";
	const password2 = "anotherPassword456!";
	let hash1: string;
	let hash2: string;

	beforeAll(async () => {
		hash1 = await hashPassword(password1);
		hash2 = await hashPassword(password2);
	});

	it("should return true for the correct password", async () => {
		const result = await checkPasswordHash(password1, hash1);
		expect(result).toBe(true);
	});

	it("should return false for an incorrect password", async () => {
		const result = await checkPasswordHash("wrongPassword", hash1);
		expect(result).toBe(false);
	});

	it("should return false when password doesn't match a different hash", async () => {
		const result = await checkPasswordHash(password1, hash2);
		expect(result).toBe(false);
	});

	it("should return false for an empty password", async () => {
		const result = await checkPasswordHash("", hash1);
		expect(result).toBe(false);
	});

	it("should return false for an invalid hash", async () => {
		const result = await checkPasswordHash(password1, "invalidhash");
		expect(result).toBe(false);
	});
});

describe("JWT Functions", () => {
	const secret = "secret";
	const wrongSecret = "wrong_secret";
	const userID = "some-unique-user-id";
	let validToken: string;

	beforeAll(() => {
		validToken = makeJWT(userID, 3600, secret);
	});

	it("should validate a valid token", () => {
		const result = validateJWT(validToken, secret);
		expect(result).toBe(userID);
	});

	it("should throw an error for an invalid token string", () => {
		expect(() => validateJWT("invalid.token.string", secret)).toThrow(
			UserNotAuthenticatedError,
		);
	});

	it("should throw an error when the token is signed with a wrong secret", () => {
		expect(() => validateJWT(validToken, wrongSecret)).toThrow(
			UserNotAuthenticatedError,
		);
	});
});

describe("Bearer Token", () => {

	const makeRequest = (authHeader?: string): Request =>
	({
		// Express: req.get('Authorization') / req.header('Authorization')
		get: (name: string) => {
			if (name.toLowerCase() === "authorization") return authHeader;
			return undefined;
		},
		// include headers too (some code paths may use it)
		headers: authHeader ? { authorization: authHeader } : {},
	} as unknown as Request);


	it("returns the token when Authorization header is valid", () => {
		const req = makeRequest("Bearer abc123");

		const result = getBearerToken(req);

		expect(result).toBe("abc123");
	});

	it("trims whitespace before extracting the token", () => {
		const req = makeRequest("   Bearer abc123   ");

		const result = getBearerToken(req);

		expect(result).toBe("abc123");
	});

	it("throws if Authorization header is missing", () => {
		const req = makeRequest();

		expect(() => getBearerToken(req)).toThrow(UserForbiddenError);
		expect(() => getBearerToken(req)).toThrow(
			"Authorization header not present"
		);
	});

	it("returns unchanged value if 'Bearer ' is missing", () => {
		const req = makeRequest("abc123");

		expect(() => getBearerToken(req)).toThrow(UserForbiddenError);
		expect(() => getBearerToken(req)).toThrow(
			"Invalid Authorization header format"
		);
	});

	it("only removes the first 'Bearer ' occurrence", () => {
		const req = makeRequest("Bearer Bearer abc123");

		const result = getBearerToken(req);

		expect(result).toBe("Bearer abc123");
	});

	it("throws on malformed bearer token", () => {
		const req = makeRequest("Bearer");

		expect(() => getBearerToken(req)).toThrow(
			"Invalid Authorization header format"
		);
	});
});
