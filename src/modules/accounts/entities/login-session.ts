import { add } from 'date-fns';
import { Schema, isBooleanOk } from 'ivo';

import { config } from '@config';
import { generateId } from '@utils';
import { LoginSession, LoginSessionInput } from '@types';
import { validateString } from 'src/shared/validators';

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
    value: () => add(new Date(), { hours: JWT_ACCESS_EXPIRATION_HOURS }),
  },
  userId: { readonly: true, validator: validateString('Invalid user id') },
}).getModel();
