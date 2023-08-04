import Schema from 'clean-schema';

import { generateId } from '@utils';
import { User, UserInput } from '@types';

import {
	validateString,
	validateUserAccountStatus,
	validateUserEmail,
	validateUserRole,
	validateUsername,
} from '../validators';

export { UserModel };

const UserModel = new Schema<User, UserInput>({
	_id: { constant: true, value: () => generateId() },
	accountStatus: {
		default: 'active',
		shouldInit: false,
		validator: validateUserAccountStatus,
	},
	email: { required: true, validator: validateUserEmail },
	firstName: {
		required: true,
		validator: validateString('Invalid first name'),
	},
	lastName: {
		required: true,
		validator: validateString('Invalid last name'),
	},
	role: { default: 'user', shouldInit: false, validator: validateUserRole },
	username: { required: true, validator: validateUsername },
}).getModel();
