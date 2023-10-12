import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { logger } from '@/shared/logger';
import config from './env';

const { environment } = config;

/**
 * Connect To Database
 */
export const connectdb = async (url: string) => {
  if (environment == 'test') {
    const server = await MongoMemoryServer.create();
    url = server.getUri();
  }

  const database = await mongoose.connect(url, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // useUnifiedTopology: true,
  });

  if (environment != 'test') logger.info('Connected to MongoDB');

  return database;
};
