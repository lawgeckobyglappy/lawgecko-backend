import dayjs from 'dayjs';
import { Schema } from 'clean-schema';

import config from '../../../config/env';
import { generateId } from '../../../shared/utils';
import { LoginLink, LoginLinkInput } from '../../../shared/types';

import { validateString } from '../validators';

const { loginLinkExpirationMinutes } = config;

export { LoginLinkModel };

const LoginLinkModel = new Schema<LoginLinkInput, LoginLink>({
	_id: { constant: true, value: () => generateId().toLowerCase() },
	expiresAt: {
		constant: true,
		value: () =>
			dayjs(new Date()).add(loginLinkExpirationMinutes, 'minutes').toDate(),
	},
	userId: { readonly: true, validator: validateString('Invalid user id') },
}).getModel();
