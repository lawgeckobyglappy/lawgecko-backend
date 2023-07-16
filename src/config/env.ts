import dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });

const config = {
	emails: {
		default: {
			user: process.env.DEFAULT_EMAIL_USER,
			password: process.env.DEFAULT_EMAIL_PASSWORD,
			service: process.env.DEFAULT_EMAIL_SERVICE,
		},
	},
	environment: process.env.NODE_ENV || 'development',
	port: process.env.PORT || 5000,
	db: {
		dbURI: process.env.MONGODB_URI,
	},
	jwt: {
		algorithm: process.env.JWT_ALGO,
		secret: process.env.JWT_SECRET,
		accessExpirationMinutes: process.env.JWT_ACCESS_EXPIRATION_MINUTES,
		refreshExpirationDays: process.env.JWT_REFRESH_EXPIRATION_DAYS,
		resetPasswordExpirationMinutes:
			process.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
		verifyEmailExpirationMinutes:
			process.env.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
	},

	logs: {
		level: process.env.PINO_LOG_LEVEL || 'info',
	},
};

export default config;
