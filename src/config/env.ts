import dotenv from 'dotenv';
dotenv.config();

export const config = {
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
  port: process.env.NODE_ENV == 'test' ? 0 : process.env.PORT || 5000,
  db: { dbURI: process.env.MONGODB_URI! },
  LOGIN_LINK_EXPIRATION_MINUTES: parseInt(
    process.env.LOGIN_LINK_EXPIRATION_MINUTES ?? '15',
  ),
  jwt: {
    JWT_SECRET: process.env.JWT_SECRET ?? 'test-secret',
    JWT_ACCESS_EXPIRATION_DAYS: parseInt(
      process.env.JWT_ACCESS_EXPIRATION_DAYS ?? '25',
    ),
  },
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5000',
  logs: {
    level: process.env.PINO_LOG_LEVEL || 'info',
  },
};

export default config;
