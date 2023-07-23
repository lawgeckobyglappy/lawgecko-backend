import dayjs from 'dayjs';
import { Schema, validate } from 'clean-schema';

import config from '../../../config/env';

import { generateId } from '../../../shared/utils';
import { LoginSession, LoginSessionInput } from '../../../shared/types';

import { validateString } from '../validators';

const { accessExpirationMinutes } = config.jwt;

export { LoginSessionModel };

const LoginSessionModel = new Schema<LoginSessionInput, LoginSession>({
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
			dayjs(new Date()).add(accessExpirationMinutes, 'minutes').toDate(),
	},
	userId: { readonly: true, validator: validateString('Invalid user id') },
}).getModel();
