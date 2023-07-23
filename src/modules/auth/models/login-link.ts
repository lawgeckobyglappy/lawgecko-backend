import dayjs from 'dayjs';
import { Schema } from 'clean-schema';

import { generateId } from '../../../shared/utils';
import { LoginLink, LoginLinkInput } from '../../../shared/types';

import { validateString } from '../validators';

export { LoginLinkModel };

const LoginLinkModel = new Schema<LoginLinkInput, LoginLink>({
	_id: { constant: true, value: () => generateId() },
	expiresAt: {
		constant: true,
		value: () => dayjs(new Date()).add(15, 'minutes').toDate(),
	},
	userId: { readonly: true, validator: validateString('Invalid user id') },
}).getModel();
