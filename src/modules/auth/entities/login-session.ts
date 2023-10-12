import dayjs from 'dayjs';
import { Schema, validate } from 'clean-schema';

import config from '@config/env';

import { generateId } from '@utils';
import { LoginSession, LoginSessionInput } from '@types';

import { validateString } from '../validators';

const { JWT_ACCESS_EXPIRATION_DAYS } = config.jwt;

export { LoginSessionModel };

const LoginSessionModel = new Schema<LoginSession, LoginSessionInput>({
  _id: { constant: true, value: () => generateId() },
  isBlocked: {
    default: false,
    readonly: true,
    shouldInit: false,
    validator: validate.isBooleanOk,
  },
  expiresAt: {
    constant: true,
    value: () =>
      dayjs(new Date()).add(JWT_ACCESS_EXPIRATION_DAYS, 'days').toDate(),
  },
  userId: { readonly: true, validator: validateString('Invalid user id') },
}).getModel();
