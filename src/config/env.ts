import dotenv from 'dotenv';
dotenv.config();

const config = {
	authProviders: {
		google: {
			clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
			clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
		},
	},
	emails: {
		default: {
			user: process.env.DEFAULT_EMAIL_USER,
			password: process.env.DEFAULT_EMAIL_PASSWORD,
			service: process.env.DEFAULT_EMAIL_SERVICE,
		},
	},
	environment: process.env.NODE_ENV || 'development',
	port: process.env.NODE_ENV == 'test' ? 5001 : process.env.PORT || 5000,
	db: {
		dbURI: process.env.MONGODB_URI,
	},
	loginLinkExpirationMinutes: parseInt(
		process.env.LOGIN_LINK_EXPIRATION_MINUTES ?? '15',
	),
	jwt: {
		algorithm: process.env.JWT_ALGO,
		secret: process.env.JWT_SECRET ?? 'test-secret',
		accessExpirationDays: parseInt(
			process.env.JWT_ACCESS_EXPIRATION_DAYS ?? '25',
		),
		refreshExpirationDays: process.env.JWT_REFRESH_EXPIRATION_DAYS,
		resetPasswordExpirationMinutes:
			process.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
		verifyEmailExpirationMinutes:
			process.env.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
	},
	frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5000',
	logs: {
		level: process.env.PINO_LOG_LEVEL || 'info',
	},
};

export default config;
