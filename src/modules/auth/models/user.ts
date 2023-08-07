import Schema from 'clean-schema';

import { generateId } from '@utils';
import { User, UserInput } from '@types';

import {
	validateAuthProvider,
	validateString,
	validateUserAccountStatus,
	validateUserEmail,
	validateUserRole,
	validateUsername,
} from '../validators';
import { generateUsername } from '../utils';

export { UserModel };

const UserModel = new Schema<User, UserInput>(
	{
		_id: { constant: true, value: () => generateId() },
		authProviders: {
			default: [],
			dependent: true,
			dependsOn: '_addAuthProvider',
			resolver({ context: { _addAuthProvider, authProviders } }) {
				if (!authProviders) authProviders = [];

				authProviders.push(_addAuthProvider);

				return authProviders;
			},
		},
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
		username: {
			default({ firstName, lastName }) {
				return generateUsername(
					`${firstName?.trim() || ''}-${lastName?.trim() || ''}`,
				);
			},
			validator: validateUsername,
		},

		_addAuthProvider: { virtual: true, validator: validateAuthProvider },
	},
	{ setMissingDefaultsOnUpdate: true },
).getModel();
