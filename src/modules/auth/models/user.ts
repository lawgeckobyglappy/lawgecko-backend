import Schema from 'clean-schema';

import { generateId } from 'shared/utils';
import { User, UserInput } from 'shared/types';

import {
	validateString,
	validateUserAccountStatus,
	validateUserEmail,
	validateUserRole,
	validateUsername,
} from '../validators';

export { UserModel };

const UserModel = new Schema<UserInput, User>({
	_id: { constant: true, value: () => generateId() },
	accountStatus: {
		default: 'pending:activation',
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
	role: { required: true, validator: validateUserRole },
	username: { required: true, validator: validateUsername },
}).getModel();
