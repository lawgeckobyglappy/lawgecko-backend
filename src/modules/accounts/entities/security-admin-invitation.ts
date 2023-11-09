import { fileManager } from 'apitoolz';
import { Context, Schema, Summary, isEqual, isObject } from 'clean-schema';

import { config } from '@config';
import { generateId } from '@utils';
import { UserAccountStatus, UserRoles } from '@types';

import { generateUserId } from '../utils';
import {
  SecurityAdminInvitation,
  SecurityAdminInvitationInput,
  SECURITY_ADMIN_INVITATION_DETAILS_KEYS,
  InvitationDetailsInput,
  InvitationDetails,
  InvitationDetailsInputAlias,
} from '../types';
import {
  validateUserAddress,
  validateEmail,
  validateString,
  validateUserPhone,
  validateUserLastName,
  validateUserFirstName,
  validateUserBio,
  validateGovernmentID,
  validateProfilePicture,
} from '../validators';
import { userRepository } from '../repositories';
import { triggerSendSecurityAdminInvitationEmail } from '../jobs';
import { SecurityAdminInvitationRepo } from '../repositories/security-admin-invitation';

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

type DetailsCtx = Context<InvitationDetailsInput, InvitationDetails>;
type DetailsSummary = Summary<InvitationDetailsInput, InvitationDetails>;
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

  if (!val || !isObject(val)) return { valid: false, reason: 'Invalid data' };

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
    ? { valid: false, reasons: ['Invitation already sent'] }
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

type FileInputFields = '_governmentID' | '_profilePicture';

const fileInputToOutputMap = {
  _governmentID: 'governmentID',
  _profilePicture: 'profilePicture',
} as const;

const appDomainAddress = `localhost:${config.port}`,
  STATIC_PATH = config.STATIC_PATH;

function handleFileUpload(inputField: FileInputFields) {
  return ({ context, previousValues }: DetailsSummary) => {
    const { _id, [inputField]: fileInfo } = context,
      outputField = fileInputToOutputMap[inputField];

    // prepare storage(remote/local) location
    const path = fileInfo.path,
      filename = path.split('/').at(-1),
      newPath = `${getFolderOnServer(_id)}/${filename}`;

    // upload to cloud
    fileManager.cutFile(path, newPath);

    // delete previous file if available
    if (previousValues?.[outputField])
      fileManager.deleteFile(getPathOnServer(_id, previousValues[outputField]));

    //  return sanitized values
    return {
      ...fileInfo,
      path: `${getFolderOnServer(_id, appDomainAddress)}/${filename}`,
    };
  };
}

function handleFailure(inputField: FileInputFields) {
  return (context: DetailsCtx) => {
    const fileInfo = context[inputField];

    fileManager.deleteFile(fileInfo.path);
  };
}

function onDelete({ details }: SecurityAdminInvitation) {
  if (details) fileManager.deleteFolder(getFolderOnServer(details._id));
}

function getFolderOnServer(
  accountId: InvitationDetails['_id'],
  basePath = STATIC_PATH,
) {
  return `${basePath}/files/accounts/${accountId}`;
}

function getPathOnServer(accountId: InvitationDetails['_id'], path: string) {
  return `${getFolderOnServer(accountId)}/${path
    .split(`${getFolderOnServer(accountId, appDomainAddress)}/`)
    .at(-1)}`;
}
