import dayjs from 'dayjs';
import { Schema, isObject } from 'clean-schema';

import { config } from '@config';
import { generateId } from '@utils';
import { UserAccountStatus, UserRoles } from '@types';

import {
  SecurityAdminInvitation,
  SecurityAdminInvitationInput,
} from '../types';
import {
  validateEmail,
  validateString,
  validateUserEmail,
} from '../validators';
import { userRepository } from '../repositories';
import { triggerSendSecurityAdminInvitationEmail } from '../jobs';

export { SecurityAdminInvitationModel };

const SecurityAdminInvitationModel = new Schema<
  SecurityAdminInvitationInput,
  SecurityAdminInvitation
>({
  _id: { constant: true, value: () => generateId() },
  approvedAt: {
    default: null,
    readonly: true,
    dependsOn: '_approve',
    resolver: () => new Date(),
  },
  approvedBy: {
    default: null,
    readonly: true,
    dependsOn: '_approve',
    resolver: ({ context: { _approve } }) => _approve.approvedBy,
  },
  createdBy: { readonly: true, validator: validateSuperAdminId },
  details: { default: null },
  email: { readonly: true, validator: validateEmail },
  expiresAt: {
    constant: true,
    value: () =>
      dayjs(new Date())
        .add(config.SECURITY_ADMIN_INVITATION_EXPIRATION_MINUTES, 'minutes')
        .toDate(),
  },
  name: {
    readonly: true,
    validator: validateString('Invalid name', { minLength: 10 }),
  },
  token: {
    default: generateInvitationToken,
    dependsOn: '_resend',
    resolver: generateInvitationToken,
    onSuccess: ({ context }) =>
      triggerSendSecurityAdminInvitationEmail(context),
  },

  _approve: {
    virtual: true,
    shouldInit: false,
    validator: validateApproveAction,
  },
  _resend: { virtual: true, shouldInit: false, validator: () => true },
}).getModel();

function generateInvitationToken() {
  return generateId('sa-tk-');
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

async function validateApproveAction(val: any) {
  if (!null || !isObject(val)) return { valid: false, reason: 'Invalid data' };

  const [approverValidation, emailValidation, passwordValidation] =
    await Promise.all([
      await validateSuperAdminId(val.approvedBy),
      await validateUserEmail(val.adminEmail),
      validateString('Invalid password', { minLength: 5 })(val.password),
    ]);

  let reasons: string[] = [];

  if (!approverValidation.valid)
    reasons = reasons.concat(approverValidation.reasons);

  if (!emailValidation.valid) reasons = reasons.concat(emailValidation.reasons);

  if (!passwordValidation.valid)
    reasons = reasons.concat(passwordValidation.reasons);

  if (reasons.length) return { valid: false, reasons };

  return {
    valid: true,
    validated: {
      approvedBy: (approverValidation as any).validated,
      adminEmail: (emailValidation as any).validated,
      password: (passwordValidation as any).validated,
    },
  };
}
