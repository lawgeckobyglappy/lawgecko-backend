import Schema from 'clean-schema';

import { generateId } from '@utils';
import { User, UserInput, UserRoles } from '@types';

import {
  validateAuthProvider,
  validateString,
  validateUserAccountStatus,
  validateUserEmail,
  validateUserPhone,
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
    email: { readonly: true, validator: validateUserEmail },
    firstName: {
      readonly: true,
      validator: validateString('Invalid first name'),
    },
    lastName: {
      readonly: true,
      validator: validateString('Invalid last name'),
    },
    role: {
      default: UserRoles.USER,
      shouldInit: false,
      validator: validateUserRole,
    },
    phoneNumber: { required: true, validator: validateUserPhone },
    username: {
      default({ firstName, lastName }) {
        return generateUsername(
          `${firstName?.trim() || ''}-${lastName?.trim() || ''}`,
        );
      },
      shouldUpdate: false,
      validator: validateUsername,
    },
    _addAuthProvider: { virtual: true, validator: validateAuthProvider },
  },
  { setMissingDefaultsOnUpdate: true },
).getModel();
