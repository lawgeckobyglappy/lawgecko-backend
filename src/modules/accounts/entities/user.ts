import Schema from 'clean-schema';

import { User, UserAccountStatus, UserInput, UserRoles } from '@types';

import {
  validateUserAddress,
  validateAuthProvider,
  validateUrl,
  validateUserAccountStatus,
  validateUserEmail,
  validateUserPhone,
  validateUserRole,
  validateUsername,
  validateUserBio,
  validateUserFirstName,
  validateUserLastName,
} from '../validators';
import { generateUserId, generateUsername } from '../utils';

export { UserModel };

const UserModel = new Schema<UserInput, User>(
  {
    _id: { constant: true, value: generateUserId },
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
      validator: validateUserAddress,
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
    bio: { default: '', validator: validateUserBio },
    email: { readonly: true, validator: validateUserEmail },
    firstName: { required: true, validator: validateUserFirstName },
    governmentID: {
      default: '',
      readonly: true,
      required({ operation, context: { role, governmentID } }) {
        return role == UserRoles.SECURITY_ADMIN
          ? operation == 'update' && !governmentID
          : false;
      },
      validator: validateUrl('Invalid Government ID', true),
    },
    lastName: { default: '', validator: validateUserLastName },
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
