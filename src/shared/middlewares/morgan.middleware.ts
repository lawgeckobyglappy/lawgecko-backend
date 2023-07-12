import morgan, { StreamOptions } from 'morgan';
import { logger } from '../logger';

// Override the stream method by telling
// Morgan to use our custom logger instead of the console.log.
const stream: StreamOptions = {
	// Use the http severity
	write: (message) => logger.info(message),
};

// Skip all the Morgan http log if the
// application is not running in development mode.
const skip = () => {
	const env = process.env.NODE_ENV || 'development';
	return env !== 'development';
};

const morganMiddleware = morgan(':method :url :status - :response-time ms', {
	stream,
	skip,
});

export default morganMiddleware;
