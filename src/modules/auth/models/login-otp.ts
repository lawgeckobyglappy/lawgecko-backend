import { Schema } from 'clean-schema';
import dayjs from 'dayjs';

import { generateId, getRandom } from 'shared/utils';
import { LoginOTP, LoginOTPInput } from 'shared/types';

import { validateString } from '../validators';

export { LoginOTPModel };

const LoginOTPModel = new Schema<LoginOTPInput, LoginOTP>({
	_id: { constant: true, value: () => generateId() },
	code: { constant: true, value: () => getRandom('0', 5) },
	expiresAt: {
		constant: true,
		value: () => dayjs(new Date()).add(15, 'minutes').toDate(),
	},
	userId: { readonly: true, validator: validateString('Invalid user id') },
}).getModel();
