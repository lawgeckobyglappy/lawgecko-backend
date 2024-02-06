import { fileManager } from 'apitoolz';
import { Schema, Summary, isEqual, isRecordLike } from 'ivo';

import { generateId } from '@utils';
import { UserAccountStatus, UserRoles } from '@types';
import { validateEmail, validateString } from 'src/shared/validators';

import { generateUserId } from '../../utils';
import {
  SecurityAdminInvitation,
  SecurityAdminInvitationInput,
  SECURITY_ADMIN_INVITATION_DETAILS_KEYS,
  InvitationDetailsInput,
  InvitationDetails,
  InvitationDetailsInputAlias,
} from '../../types';
import {
  validateUserAddress,
  validateUserPhone,
  validateUserLastName,
  validateUserFirstName,
  validateUserBio,
  validateGovernmentID,
  validateProfilePicture,
} from '../../validators';
import { userRepository } from '../../repositories';
import { triggerSendSecurityAdminInvitationEmail } from '../../jobs';
import { SecurityAdminInvitationRepo } from '../../repositories/security-admin-invitation';
import { getFolderOnServer, handleFailure, handleFileUpload } from './utils';

export { SecurityAdminInvitationModel, UserDetailsModel };

const SecurityAdminInvitationModel = new Schema<
  SecurityAdminInvitationInput,
  SecurityAdminInvitation
>(
  {
    _id: { constant: true, value: () => generateId() },
    changesRequested: {
      default: null,
      shouldInit: false,
      validator: validateChangesRequested,
    },
    createdBy: { readonly: true, validator: validateSuperAdminId },
    details: { default: null },
    email: { readonly: true, validator: validateInvitationEmail },
    name: {
      readonly: true,
      validator: validateString('Invalid name', {
        minLength: 5,
        maxLength: 50,
      }),
    },
    token: {
      default: generateInvitationToken,
      dependsOn: ['changesRequested', '_resend'],
      resolver: generateInvitationToken,
      onSuccess: ({ context }) =>
        triggerSendSecurityAdminInvitationEmail(context),
    },

    _resend: { virtual: true, shouldInit: false, validator: () => true },
  },
  { onDelete },
).getModel();

type InvitationSummary = Summary<
  SecurityAdminInvitationInput,
  SecurityAdminInvitation
>;

const UserDetailsModel = new Schema<
  InvitationDetailsInput,
  InvitationDetails,
  InvitationDetailsInputAlias
>({
  _id: { constant: true, value: generateUserId },
  address: { required: true, validator: validateUserAddress },
  bio: { default: '', validator: validateUserBio },
  firstName: { required: true, validator: validateUserFirstName },
  governmentID: {
    default: '',
    dependsOn: '_governmentID',
    resolver: ({ context: { _governmentID } }) => _governmentID.path,
  },
  lastName: { required: true, validator: validateUserLastName },
  phoneNumber: { required: true, validator: validateUserPhone },
  profilePicture: {
    default: '',
    dependsOn: '_profilePicture',
    resolver: ({ context: { _profilePicture } }) => _profilePicture.path,
  },

  _governmentID: {
    alias: 'governmentID',
    virtual: true,
    onFailure: handleFailure('_governmentID'),
    sanitizer: handleFileUpload('_governmentID'),
    required: ({ context: { _governmentID, governmentID } }) =>
      !governmentID && !_governmentID,
    validator: validateGovernmentID,
  },
  _profilePicture: {
    alias: 'profilePicture',
    virtual: true,
    onFailure: handleFailure('_profilePicture'),
    sanitizer: handleFileUpload('_profilePicture'),
    required: ({ context: { _profilePicture, profilePicture } }) =>
      !profilePicture && !_profilePicture,
    validator: validateProfilePicture,
  },
}).getModel();

function validateChangesRequested(
  val: any,
  { previousValues }: InvitationSummary,
) {
  if (!previousValues?.details) return false;

  if (val == null) return true;

  if (!val || !isRecordLike(val))
    return { valid: false, reason: 'Invalid data' };

  const validated = {} as any;

  Object.entries(val).forEach(([key, value]) => {
    value = value?.trim();

    if (
      SECURITY_ADMIN_INVITATION_DETAILS_KEYS.includes(key) &&
      value &&
      typeof value == 'string'
    )
      validated[key] = value;
  });

  return { valid: true, validated: isEqual(validated, {}) ? null : validated };
}

function generateInvitationToken() {
  return generateId('sa-tk-');
}

async function validateInvitationEmail(val: any) {
  const isValid = validateEmail(val);

  if (!isValid.valid) return isValid;

  const invitation = await SecurityAdminInvitationRepo.findByEmail(
    isValid.validated,
  );

  return invitation
    ? { valid: false, reason: 'Invitation already sent' }
    : isValid;
}

async function validateSuperAdminId(val: any) {
  const isValid = validateString('Invalid user id')(val);

  if (!isValid.valid) return isValid;

  const user = await userRepository.findOne({ _id: isValid.validated });

  if (!user) return { valid: false, reasons: ['User not found'] };

  const { accountStatus, role } = user;

  if (
    accountStatus != UserAccountStatus.ACTIVE ||
    role != UserRoles.SUPER_ADMIN
  )
    return { valid: false, reasons: ['Invalid operation'] };

  return isValid;
}

function onDelete({ details }: SecurityAdminInvitation) {
  if (details) fileManager.deleteFolder(getFolderOnServer(details._id));
}
