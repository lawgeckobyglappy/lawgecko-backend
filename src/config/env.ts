import dotenv from 'dotenv';
import { loadVariables } from 'apitoolz';

dotenv.config();

const DEPLOYMENT_MODE = {
  DEV: 'development',
  PROD: 'production',
  TEST: 'test',
} as const;

const NODE_ENV = process.env.NODE_ENV || DEPLOYMENT_MODE.DEV;

const currentDeployment = {
  isDev: NODE_ENV == DEPLOYMENT_MODE.DEV,
  isProduction: NODE_ENV == DEPLOYMENT_MODE.PROD,
  isTest: NODE_ENV == DEPLOYMENT_MODE.TEST,
};

const constants = loadVariables(
  {
    DEFAULT_EMAIL_USER: {
      required: currentDeployment.isProduction,
      default: '',
    },
    DEFAULT_EMAIL_PASSWORD: {
      required: currentDeployment.isProduction,
      default: '',
    },
    DEFAULT_EMAIL_SERVICE: {
      required: currentDeployment.isProduction,
      default: '',
    },

    FRONTEND_URL: {
      required: currentDeployment.isProduction,
      // default: 'http://localhost:5000',
      default: 'https://lawgecko.vercel.app/',
    },

    GOOGLE_AUTH_CLIENT_ID: {
      required: currentDeployment.isProduction,
      default: '',
    },
    GOOGLE_AUTH_CLIENT_SECRET: {
      required: currentDeployment.isProduction,
      default: '',
    },

    JWT_SECRET: {
      required: currentDeployment.isProduction,
      default: 'test-secret',
    },
    JWT_ACCESS_EXPIRATION_HOURS: {
      required: currentDeployment.isProduction,
      default: 168,
      parser: (v: any) => parseFloat(v ?? '168'),
    },
    ADMIN_JWT_ACCESS_EXPIRATION_HOURS: {
      required: currentDeployment.isProduction,
      default: currentDeployment.isDev ? 168 : 2,
      parser: (v: any) => parseFloat(v ?? '2'),
    },

    LOGIN_LINK_EXPIRATION_MINUTES: {
      required: currentDeployment.isProduction,
      default: 15,
      parser: (v: any) => parseFloat(v ?? '15'),
    },

    MONGODB_URI: { required: !currentDeployment.isTest, default: '' },

    PINO_LOG_LEVEL: 'info',
    PORT: {
      required: currentDeployment.isProduction,
      default: () => (currentDeployment.isTest ? 0 : 5000),
      parser: (v: any) => (currentDeployment.isTest ? 0 : Number(v)),
    },
  },
  {
    transform(v) {
      return {
        ...v,
        STATIC_PATH: 'public/static',
        TEMPORARY_FILE_UPLOAD_PATH: 'public/tmp',
      };
    },
  },
);

export const config = {
  authProviders: {
    google: {
      clientId: constants.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: constants.GOOGLE_AUTH_CLIENT_SECRET,
    },
  },
  currentDeployment,
  emails: {
    default: {
      user: constants.DEFAULT_EMAIL_USER,
      password: constants.DEFAULT_EMAIL_PASSWORD,
      service: constants.DEFAULT_EMAIL_SERVICE,
    },
  },
  port: constants.PORT,
  db: { dbURI: constants.MONGODB_URI! },
  LOGIN_LINK_EXPIRATION_MINUTES: constants.LOGIN_LINK_EXPIRATION_MINUTES,
  STATIC_PATH: constants.STATIC_PATH,
  TEMPORARY_FILE_UPLOAD_PATH: constants.TEMPORARY_FILE_UPLOAD_PATH,
  jwt: {
    JWT_SECRET: constants.JWT_SECRET,
    JWT_ACCESS_EXPIRATION_HOURS: constants.JWT_ACCESS_EXPIRATION_HOURS,
    ADMIN_JWT_ACCESS_EXPIRATION_HOURS:
      constants.ADMIN_JWT_ACCESS_EXPIRATION_HOURS,
  },
  FRONTEND_URL: constants.FRONTEND_URL,
  logs: { level: constants.PINO_LOG_LEVEL },
};

export default config;
