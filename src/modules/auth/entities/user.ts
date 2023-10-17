import Schema from 'clean-schema';

import { generateId } from '@utils';
import { User, UserInput, UserRoles } from '@types';

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

const UserModel = new Schema<UserInput, User>(
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
    email: {
      required: true,
      shouldUpdate: () => false,
      validator: validateUserEmail,
    },
    firstName: {
      required: true,
      shouldUpdate: () => false,
      validator: validateString('Invalid first name'),
    },
    lastName: {
      required: true,
      shouldUpdate: () => false,
      validator: validateString('Invalid last name'),
    },
    role: {
      default: UserRoles.USER,
      shouldInit: false,
      validator: validateUserRole,
    },
    username: {
      default({ firstName, lastName }) {
        return generateUsername(
          `${firstName?.trim() || ''}-${lastName?.trim() || ''}`,
        );
      },
      shouldUpdate: () => false,
      validator: validateUsername,
    },
    _addAuthProvider: { virtual: true, validator: validateAuthProvider },
  },
  { setMissingDefaultsOnUpdate: true },
).getModel();
