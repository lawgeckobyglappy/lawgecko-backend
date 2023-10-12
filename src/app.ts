import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';

import config from './config/env';
import { connectdb } from './config/db';
import { logger } from './shared/logger';
import morgan from './shared/middlewares/morgan.middleware';

import { router } from './api/v1';
import exampleRoutes from './api/v1/example';

const app = express();

if (config.environment !== 'test') app.use(morgan);

app.use(cors({ origin: '*' }));

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'live' });
});

app.use('/api/v1', exampleRoutes);
app.use('/api/v1', router);

app.use((_, res: Response) => {
  res.status(404).json({ message: 'Resource not found' });
});

dotenv.config();

const { environment, port, db } = config;

connectdb(String(db.dbURI));

function makeServer() {
  return app.listen(port, () => {
    if (environment !== 'test') logger.info(`Listening to port ${port}`);
  });
}

export { makeServer };
