// import errorHandler from "errorhandler";
import app from "./app";
import { connectdb } from "./config/db";
import config from "./config/env";
import { logger } from "./shared/logger";

import * as dotenv from "dotenv";
dotenv.config();

connectdb(String(process.env.MONGODB_URI));
const port = process.env.PORT;
const server = app.listen(port, () => {
  logger.info(`Listening to port ${port}`);
});

export default server;
