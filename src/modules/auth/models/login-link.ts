import dayjs from 'dayjs';
import { Schema } from 'clean-schema';

import config from '@config/env';
import { generateId } from '@utils';
import { LoginLink, LoginLinkInput } from '@types';

import { validateString } from '../validators';

const { loginLinkExpirationMinutes } = config;

export { LoginLinkModel };

const LoginLinkModel = new Schema<LoginLink, LoginLinkInput>({
	_id: { constant: true, value: () => generateId().toLowerCase() },
	expiresAt: {
		constant: true,
		value: () =>
			dayjs(new Date()).add(loginLinkExpirationMinutes, 'minutes').toDate(),
	},
	userId: { readonly: true, validator: validateString('Invalid user id') },
}).getModel();
