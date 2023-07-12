import mongoose from 'mongoose';
import { logger } from '../shared/logger';

/**
 * Connect To Database
 */
export const connectdb = async (url: string) => {
	const database = await mongoose.connect(url, {
		// useNewUrlParser: true,
		// useCreateIndex: true,
		// useFindAndModify: false,
		// useUnifiedTopology: true,
	});
	logger.info('Connected to MongoDB');
	return database;
};
