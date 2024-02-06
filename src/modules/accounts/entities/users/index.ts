import Schema from 'ivo';
import { fileManager } from 'apitoolz';

import {
  User,
  UserAccountStatus,
  UserInput,
  UserInputAlias,
  UserRoles,
} from '@types';

import {
  validateUserAddress,
  validateAuthProvider,
  validateUserAccountStatus,
  validateUserEmail,
  validateUserPhone,
  validateUserRole,
  validateUsername,
  validateUserBio,
  validateUserFirstName,
  validateUserLastName,
  validateGovernmentID,
  validateProfilePicture,
} from '../../validators';
import { generateUserId, generateUsername } from '../../utils';
import { getFolderOnServer, handleFailure, handleFileUpload } from './utils';

export { UserModel };

const UserModel = new Schema<UserInput, User, UserInputAlias>(
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
      dependsOn: '_governmentID',
      resolver: ({ context: { _governmentID } }) => _governmentID.path,
    },
    lastName: { default: '', validator: validateUserLastName },
    phoneNumber: {
      default: '',
      required({ isUpdate, context }) {
        return !isUpdate && !context._addAuthProvider && !context.phoneNumber;
      },
      validator: validateUserPhone,
    },
    profilePicture: {
      default: '',
      dependsOn: '_profilePicture',
      resolver: ({ context: { _profilePicture } }) => _profilePicture.path,
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
    _governmentID: {
      alias: 'governmentID',
      virtual: true,
      onFailure: handleFailure('_governmentID'),
      sanitizer: handleFileUpload('_governmentID'),
      required({ isUpdate, context: { role, _governmentID, governmentID } }) {
        if (role == UserRoles.USER) return false;

        return isUpdate && !governmentID && !_governmentID;
      },
      validator: validateGovernmentID,
    },
    _profilePicture: {
      alias: 'profilePicture',
      virtual: true,
      onFailure: handleFailure('_profilePicture'),
      sanitizer: handleFileUpload('_profilePicture'),
      required({
        isUpdate,
        context: { role, _profilePicture, profilePicture },
      }) {
        if (role == UserRoles.USER) return false;

        return isUpdate && !profilePicture && !_profilePicture;
      },
      validator: validateProfilePicture,
    },
  },
  { onDelete, setMissingDefaultsOnUpdate: true },
).getModel();

function onDelete({ _id }: User) {
  fileManager.deleteFolder(getFolderOnServer(_id));
}
