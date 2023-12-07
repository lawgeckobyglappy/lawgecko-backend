import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { logger } from '@shared';
import config from './env';

const { currentDeployment } = config;

/**
 * Connect To Database
 */
export const connectdb = async (url: string) => {
  if (currentDeployment.isTest) {
    const server = await MongoMemoryServer.create();
    url = server.getUri();
  }

  const database = await mongoose.connect(url, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // useUnifiedTopology: true,
  });

  if (!currentDeployment.isTest) logger.info('Connected to MongoDB');

  return database;
};
