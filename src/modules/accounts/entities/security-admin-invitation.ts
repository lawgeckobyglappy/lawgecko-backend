import { fileManager } from 'apitoolz';
import { Context, Schema, Summary, isEqual, isObject } from 'clean-schema';

import { config } from '@config';
import { generateId } from '@utils';
import { UserAccountStatus, UserRoles } from '@types';

import {
  SecurityAdminInvitation,
  SecurityAdminInvitationInput,
  SECURITY_ADMIN_INVITATION_DETAILS_KEYS,
  InvitationDetailsInput,
  InvitationDetails,
  InvitationDetailsInputAlias,
} from '../types';
import {
  validateAddress,
  validateEmail,
  validateString,
  validateUserPhone,
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
  address: { required: true, validator: validateAddress },
  bio: {
    default: '',
    validator: validateString('Invalid Bio', {
      minLength: 0,
      maxLength: 255,
    }),
  },
  firstName: {
    required: true,
    validator: validateString('Invalid first name'),
  },
  governmentID: {
    default: '',
    dependsOn: '_governmentID',
    resolver: ({ context: { _governmentID } }) => _governmentID.path,
  },
  lastName: {
    default: '',
    validator: validateString('Invalid last name'),
  },
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
    validator: () => true,
  },
  _profilePicture: {
    alias: 'profilePicture',
    virtual: true,
    onFailure: handleFailure('_profilePicture'),
    sanitizer: handleFileUpload('_profilePicture'),
    required: ({ context: { _profilePicture, profilePicture } }) =>
      !profilePicture && !_profilePicture,
    validator: () => true,
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
    const outputField = fileInputToOutputMap[inputField];

    // prepare storage(remote/local) location
    const fileInfo = context[inputField],
      path = fileInfo.path,
      filename = path.split('/').at(-1),
      newPath = `${STATIC_PATH}/security-admin-info/${filename}`;

    // upload to cloud
    fileManager.cutFile(path, newPath);

    // delete previous file if available
    if (previousValues?.[outputField])
      fileManager.deleteFile(getPathOnServer(previousValues[outputField]));

    //  return sanitized values
    return {
      ...fileInfo,
      path: `${appDomainAddress}/security-admin-info/${filename}`,
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
  if (!details) return;

  if (details.governmentID)
    fileManager.deleteFile(getPathOnServer(details.governmentID));

  if (details.profilePicture)
    fileManager.deleteFile(getPathOnServer(details.profilePicture));
}

function getPathOnServer(path: string) {
  return `${STATIC_PATH}/${path.split(`${appDomainAddress}/`).at(-1)}`;
}
