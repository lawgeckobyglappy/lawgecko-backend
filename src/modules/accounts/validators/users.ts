import { parsePhoneNumber, getSupportedRegionCodes } from 'awesome-phonenumber';
import { Summary, isRecordLike } from 'ivo';

import {
  AuthProvidersList,
  User,
  UserAccountStatusList,
  UserInput,
  UserRoles,
  UserRolesList,
} from '@types';
import { validateEmail, validateString } from 'src/shared/validators';

import { userRepository } from '../repositories';

export {
  validateAuthProvider,
  validateUserAccountStatus,
  validateUserAddress,
  validateUserBio,
  validateUserEmail,
  validateUserFirstName,
  validateUserLastName,
  validateUsername,
  validateUserPhone,
  validateUserRole,
};

type UserValidationSummary = Summary<UserInput, User>;

async function validateUserEmail(val: any) {
  const isValid = validateEmail(val);

  if (!isValid.valid) return isValid;

  const isTaken = await userRepository.findOne({ email: isValid.validated });

  if (isTaken) return { valid: false, reason: ['Email already taken'] };

  return isValid;
}

async function validateUserPhone(val: any) {
  const isValid = validateString('', { minLength: 5, maxLength: 25 })(val);

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
    allow: AuthProvidersList,
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
    allow: UserAccountStatusList,
  })(status);
}

const countryCodes = getSupportedRegionCodes();

function validateUserAddress(val: any) {
  if (!val || !isRecordLike(val))
    return { valid: false, reason: 'Invalid address' };

  let reasons: string[] = [];

  if (!countryCodes.includes(val.country)) reasons.push('Invalid country');

  const isCityValid = validateString('Invalid city', { minLength: 2 })(
      val.city,
    ),
    isStreetValid = validateString('Invalid street', {
      minLength: 5,
      maxLength: 50,
    })(val.street);

  if (!isCityValid.valid) reasons = reasons.concat(isCityValid.reason);
  if (!isStreetValid.valid) reasons = reasons.concat(isStreetValid.reason);

  if (reasons.length) return { valid: false, reason: reasons };

  return {
    valid: true,
    validated: {
      city: (isCityValid as any).validated,
      country: val.country,
      street: (isStreetValid as any).validated,
    },
  };
}

function validateUserBio(val: any) {
  return validateString('Invalid Bio', {
    minLength: 0,
    maxLength: 255,
  })(val);
}

function validateUserFirstName(val: any) {
  return validateString('Invalid first name')(val);
}

function validateUserLastName(val: any) {
  return validateString('Invalid last name')(val);
}

const allow = UserRolesList.filter((r) => r != UserRoles.SUPER_ADMIN);
function validateUserRole(status: any) {
  return validateString('Invalid role', { allow })(status);
}
