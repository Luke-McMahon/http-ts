import { Response, Request } from "express";
import { config } from "../config.js";

export async function handlerAdminMetrics(_: Request, res: Response) {
  const html = `
  <html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.fileServerHits} times!</p>
  </body>
</html>
`
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
}
