import dayjs from 'dayjs';
import { Schema, isBooleanOk } from 'clean-schema';

import { config } from '@config';
import { generateId } from '@utils';
import { LoginSession, LoginSessionInput } from '@types';

import { validateString } from '../validators';

const { JWT_ACCESS_EXPIRATION_HOURS } = config.jwt;

export { LoginSessionModel };

const LoginSessionModel = new Schema<LoginSessionInput, LoginSession>({
  _id: { constant: true, value: () => generateId() },
  isBlocked: {
    default: false,
    readonly: true,
    shouldInit: false,
    validator: isBooleanOk,
  },
  expiresAt: {
    constant: true,
    value: () =>
      dayjs(new Date()).add(JWT_ACCESS_EXPIRATION_HOURS, 'hours').toDate(),
  },
  userId: { readonly: true, validator: validateString('Invalid user id') },
}).getModel();
