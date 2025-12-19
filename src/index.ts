import express from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";


import { handlerReadiness } from "./api/readiness.js";
import { handlerAdminMetrics } from "./api/metrics.js";
import {
	errorHandler,
	middlewareLogResponse,
	middlewareMetricsInc
} from './api/middleware.js';
import { handlerReset } from "./api/reset.js";
import { handlerChirpGet, handlerChirpsCreate, handlerChirpsGet } from "./api/chirps.js";
import { config } from "./config.js";
import { handlerUserCreate } from "./api/users.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(express.json());
app.use(middlewareLogResponse);


const adminRouter = express.Router();
adminRouter.post("/reset", handlerReset);
adminRouter.get("/metrics", handlerAdminMetrics);


const apiRouter = express.Router();
apiRouter.get("/healthz", handlerReadiness);
apiRouter.get("/chirps", handlerChirpsGet);
apiRouter.get("/chirps/:chirpId", handlerChirpGet);
apiRouter.post("/chirps", handlerChirpsCreate);
apiRouter.post("/users", handlerUserCreate);


app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use("/admin", adminRouter);
app.use("/api", apiRouter);

app.use(errorHandler);

app.listen(config.api.port, () => {
	console.log(`Server is running at http://localhost:${config.api.port}`);
});
