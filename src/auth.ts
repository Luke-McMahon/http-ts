import argon2 from 'argon2';
import { FailedProcessError } from './errors.js';

export async function hashPassword(password: string): Promise<string> {
	try {
		const hash = await argon2.hash(password);
		return hash;
	} catch (e) {
		throw new FailedProcessError("Failed to hash password");
	}

}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
	try {
		if (await argon2.verify(hash, password)) {
			return true;
		} else {
			return false;
		}
	} catch (e) {
		throw new FailedProcessError("Failed to verify hash");
	}
}
