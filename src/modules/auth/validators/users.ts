import { Summary, ValidatorResponse } from 'clean-schema';
import { validateEmail, validateString } from './shared';
import {
  AuthProvider,
  supportedAuthProviders,
  User,
  UserAccountStatus,
  UserInput,
  UserRole,
  UserRoles,
  validAccountStatus,
} from '@/shared/types';
import { userRepository } from '../repositories';

export {
  validateAuthProvider,
  validateUserAccountStatus,
  validateUserEmail,
  validateUsername,
  validateUserRole,
};

type UserValidationSummary = Summary<User, UserInput>;

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

  const isTaken = await userRepository.findOne({ username: isValid.validated });

  if (isTaken) return { valid: false, reason: 'Username already taken' };

  return isValid;
}

function validateAuthProvider(provider: any, summary: UserValidationSummary) {
  const isValid = validateString('Unsupported auth provider', {
    enums: supportedAuthProviders as any,
  })(provider) as ValidatorResponse<AuthProvider>;

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
    enums: validAccountStatus as any,
  })(status) as ValidatorResponse<UserAccountStatus>;
}

const validRoles: UserRole[] = [
  UserRoles.ADMIN,
  UserRoles.MODERATOR,
  UserRoles.USER,
];
function validateUserRole(status: any) {
  return validateString('Invalid role', {
    enums: validRoles,
  })(status) as ValidatorResponse<UserRole>;
}
