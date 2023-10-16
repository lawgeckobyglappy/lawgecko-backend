import { Summary } from 'clean-schema';

import {
  AccountStatusList,
  AuthProvidersList,
  User,
  UserInput,
  UserRolesList,
} from '@types';
import { userRepository } from '../repositories';

import { validateEmail, validateString } from './shared';

export {
  validateAuthProvider,
  validateUserAccountStatus,
  validateUserEmail,
  validateUsername,
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
    enums: AccountStatusList,
  })(status);
}

function validateUserRole(status: any) {
  return validateString('Invalid role', {
    enums: UserRolesList,
  })(status);
}
