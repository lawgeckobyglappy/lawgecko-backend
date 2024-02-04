import cors from 'cors';
import express from 'express';

import { config, connectdb, scheduler } from '@config';

import { logger } from './shared/logger';
import morgan from './shared/middlewares/morgan.middleware';

import { router } from './api/v1';

const { currentDeployment, port, db, STATIC_PATH } = config;

const app = express();

if (!currentDeployment.isTest) app.use(morgan);

app.use(cors({ origin: 'https://lawgecko.vercel.app' }));

app.use(express.json());

app.use(express.static(STATIC_PATH));

app.get('/', (_, res) => res.json({ message: 'live' }));

app.use('/api/v1', router);

app.use((_, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

connectdb(String(db.dbURI));

function makeServer() {
  return app.listen(port, async () => {
    if (currentDeployment.isTest) return;

    await scheduler.start();
    logger.info(`Listening to port ${port}`);
  });
}

export { makeServer };
