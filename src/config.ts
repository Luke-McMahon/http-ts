type APIConfig = {
	fileServerHits: number;
	dbURL: string;
};

export const config: APIConfig = {
	fileServerHits: 0,
	dbURL: envOrThrow("DB_URL"),
};

function envOrThrow(key: string): string {
	if (!process.env[key]) {
		throw new Error(`${key} does not exit in .env`);
	}

	return process.env[key];
}
