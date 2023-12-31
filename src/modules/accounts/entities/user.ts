import Schema from 'clean-schema';

import { generateId } from '@utils';
import { User, UserAccountStatus, UserInput, UserRoles } from '@types';

import {
  validateAddress,
  validateAuthProvider,
  validateString,
  validateUrl,
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
    accountStatus: {
      default: UserAccountStatus.ACTIVE,
      shouldInit: false,
      validator: validateUserAccountStatus,
    },
    address: {
      default: null,
      required({ context: { address, role } }) {
        return role == UserRoles.SECURITY_ADMIN ? !address : false;
      },
      validator: validateAddress,
    },
    authProviders: {
      default: [],
      dependent: true,
      dependsOn: '_addAuthProvider',
      resolver({ context: { _addAuthProvider, authProviders } }) {
        authProviders.push(_addAuthProvider);

        return authProviders;
      },
    },
    bio: {
      default: '',
      validator: validateString('Invalid Bio', {
        minLength: 0,
        maxLength: 255,
      }),
    },
    email: { readonly: true, validator: validateUserEmail },
    firstName: {
      default: '',
      validator: validateString('Invalid first name'),
    },
    governmentID: {
      default: '',
      required({ context: { role, governmentID } }) {
        return role == UserRoles.SECURITY_ADMIN ? !governmentID : false;
      },
      validator: validateUrl('Invalid Government ID', true),
    },
    lastName: {
      default: '',
      validator: validateString('Invalid last name'),
    },
    phoneNumber: {
      default: '',
      required({ operation, context }) {
        return (
          operation == 'creation' &&
          !context._addAuthProvider &&
          !context.phoneNumber
        );
      },
      validator: validateUserPhone,
    },
    profilePicture: {
      default: '',
      validator: validateUrl('Invalid profile picture', true),
    },
    role: { readonly: true, validator: validateUserRole },
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
