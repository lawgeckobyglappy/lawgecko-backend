import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "./shared/middlewares/morgan";
import config from "./config/env";

import exampleRoutes from "./api/v1/example";

const app: Application = express();

if (config.environment !== "test") {
  app.use(morgan);
}

app.use(cors({ origin: "*" }));

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "live" });
});

app.use("/api/v1", exampleRoutes);

export default app;
