import dayjs from 'dayjs';
import { Schema, isObject } from 'clean-schema';

import { config } from '@config';
import { generateId } from '@utils';
import { UserAccountStatus, UserRoles } from '@types';

import {
  SecurityAdminInvitation,
  SecurityAdminInvitationInput,
  SECURITY_ADMIN_INVITATION_DETAILS_KEYS,
} from '../types';
import {
  validateEmail,
  validateString,
  // validateUserEmail,
} from '../validators';
import { userRepository } from '../repositories';
import { triggerSendSecurityAdminInvitationEmail } from '../jobs';
import { SecurityAdminInvitationRepo } from '../repositories/security-admin-invitation';

export { SecurityAdminInvitationModel };

const SecurityAdminInvitationModel = new Schema<
  SecurityAdminInvitationInput,
  SecurityAdminInvitation
>({
  _id: { constant: true, value: () => generateId() },
  changesRequested: {
    default: null,
    shouldInit: false,
    validator: validateChangesRequested,
  },
  createdBy: { readonly: true, validator: validateSuperAdminId },
  details: { default: null },
  email: { readonly: true, validator: validateInvitationEmail },
  expiresAt: {
    constant: true,
    value: () =>
      dayjs(new Date())
        .add(config.SECURITY_ADMIN_INVITATION_EXPIRATION_MINUTES, 'minutes')
        .toDate(),
  },
  name: {
    readonly: true,
    validator: validateString('Invalid name', { minLength: 5, maxLength: 50 }),
  },
  token: {
    default: generateInvitationToken,
    dependsOn: ['changesRequested', '_resend'],
    resolver: generateInvitationToken,
    onSuccess: ({ context }) =>
      triggerSendSecurityAdminInvitationEmail(context),
  },

  _resend: { virtual: true, shouldInit: false, validator: () => true },
}).getModel();

function validateChangesRequested(val: any) {
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

  return { valid: true, validated };
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

// async function validateApproveAction(val: any) {
//   if (!val || !isObject(val)) return { valid: false, reason: 'Invalid data' };

//   const [approverValidation, emailValidation, passwordValidation] =
//     await Promise.all([
//       await validateSuperAdminId(val.approvedBy),
//       await validateUserEmail(val.adminEmail),
//       validateString('Invalid password', { minLength: 5 })(val.password),
//     ]);

//   let reasons: string[] = [];

//   if (!approverValidation.valid)
//     reasons = reasons.concat(approverValidation.reasons);

//   if (!emailValidation.valid) reasons = reasons.concat(emailValidation.reasons);

//   if (!passwordValidation.valid)
//     reasons = reasons.concat(passwordValidation.reasons);

//   if (reasons.length) return { valid: false, reasons };

//   return {
//     valid: true,
//     validated: {
//       approvedBy: (approverValidation as any).validated,
//       adminEmail: (emailValidation as any).validated,
//       password: (passwordValidation as any).validated,
//     },
//   };
// }
