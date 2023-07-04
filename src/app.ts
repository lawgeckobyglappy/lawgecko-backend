import express, { Application, Request, Response } from "express";
import exampleRoutes from "./api/v1/example";

const app: Application = express();

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "live" });
});

app.use("/api/v1", exampleRoutes);

export default app;
