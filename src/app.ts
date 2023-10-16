import cors from 'cors';
import express, { Response } from 'express';

import config from './config/env';
import { connectdb } from './config/db';
import { logger } from './shared/logger';
import morgan from './shared/middlewares/morgan.middleware';

import { router } from './api/v1';
import exampleRoutes from './api/v1/example';
import { scheduler } from '@config/scheduler';

const { environment, port, db } = config;

const app = express();

if (config.environment !== 'test') app.use(morgan);

app.use(cors({ origin: '*' }));

app.use(express.json());

app.get('/', (_, res: Response) => {
  res.json({ message: 'live' });
});

app.use('/api/v1', exampleRoutes);
app.use('/api/v1', router);

app.use((_, res: Response) => {
  res.status(404).json({ message: 'Resource not found' });
});

connectdb(String(db.dbURI));

function makeServer() {
  return app.listen(port, async () => {
    if (environment !== 'test') {
      await scheduler.start();
      logger.info(`Listening to port ${port}`);
    }
  });
}

export { makeServer };
