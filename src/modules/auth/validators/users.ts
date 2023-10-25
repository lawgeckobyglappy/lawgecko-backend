import { parsePhoneNumber } from 'awesome-phonenumber';
import { Summary } from 'clean-schema';

import {
  AuthProvidersList,
  User,
  UserAccountStatusList,
  UserInput,
  UserRoles,
  UserRolesList,
} from '@types';
import { userRepository } from '../repositories';

import { validateEmail, validateString } from './shared';

export {
  validateAuthProvider,
  validateUserAccountStatus,
  validateUserEmail,
  validateUsername,
  validateUserPhone,
  validateUserRole,
};

type UserValidationSummary = Summary<UserInput, User>;

async function validateUserEmail(val: any) {
  const isValid = validateEmail(val);

  if (!isValid.valid) return isValid;

  const isTaken = await userRepository.findOne({ email: isValid.validated });

  if (isTaken) return { valid: false, reason: 'Email already taken' };

  return isValid;
}

async function validateUserPhone(val: any) {
  const isValid = validateString('', { minLength: 5, maxLength: 16 })(val);

  if (!isValid.valid) return isValid;

  const pn = parsePhoneNumber(isValid.validated);

  if (!pn.valid) return { valid: false, reason: 'Invalid phone format' };

  const validated = pn.number.international;

  const isTaken = await userRepository.findByPhoneNumber(validated);

  return isTaken
    ? { valid: false, reason: 'Phone number already taken' }
    : { valid: true, validated };
}

async function validateUsername(val: any) {
  const isValid = validateString('Invalid username', { minLength: 3 })(val);

  if (!isValid.valid) return isValid;

  const isTaken = await userRepository.findOne({
    username: isValid.validated,
  });

  if (isTaken) return { valid: false, reason: 'Username already taken' };

  return isValid;
}

function validateAuthProvider(provider: any, summary: UserValidationSummary) {
  const isValid = validateString('Unsupported auth provider', {
    enums: AuthProvidersList,
  })(provider);

  if (!isValid) return isValid;

  const {
    context: { authProviders },
  } = summary;

  return authProviders?.includes(provider)
    ? { valid: false, reason: 'Provider already registered' }
    : true;
}

function validateUserAccountStatus(status: any) {
  return validateString('Invalid account status', {
    enums: UserAccountStatusList,
  })(status);
}

const enums = UserRolesList.filter((r) => r != UserRoles.SUPER_ADMIN);
function validateUserRole(status: any) {
  return validateString('Invalid role', { enums })(status);
}
