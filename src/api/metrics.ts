import { Response, Request } from "express";
import { config } from "../config.js";

export async function handlerMetrics(_: Request, res: Response) {
  res.send(`Hits: ${config.fileServerHits}`);
}
