import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { handlerAdminMetrics } from "./api/metrics.js";
import {
	middlewareLogResponse,
	middlewareMetricsInc
} from './api/middleware.js';
import { handlerReset } from "./api/reset.js";
import { handlerChirpsValidate } from "./api/validateChirp.js";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(middlewareLogResponse);


const adminRouter = express.Router();
adminRouter.post("/reset", handlerReset);
adminRouter.get("/metrics", handlerAdminMetrics);


const apiRouter = express.Router();
apiRouter.get("/healthz", handlerReadiness);
apiRouter.post("/validate_chirp", handlerChirpsValidate);

app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use("/admin", adminRouter);
app.use("/api", apiRouter);

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
