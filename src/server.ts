// import errorHandler from "errorhandler";
import 'reflect-metadata';
import app from './app';
import config from './config/env';
import { connectdb } from './config/db';
import { logger } from './shared/logger';

import * as dotenv from 'dotenv';
dotenv.config();

const { environment, port, db } = config;

connectdb(String(db.dbURI));

const server = app.listen(port, () => {
	if (environment !== 'test') logger.info(`Listening to port ${port}`);
});

export { server };
