import { StringOptions, isEmailOk, isStringOk } from 'ivo';
import isURL from 'validator/lib/isURL';

export { validateEmail, validateString, validateUrl };

function validateEmail(val: any) {
  const validation = isEmailOk(val);

  if (!validation.valid) validation.reason = ['Invalid email'];

  return validation;
}

function validateString<T extends string = string>(
  msg?: string,
  options?: StringOptions<T>,
) {
  return (val: any) => {
    const isValid = isStringOk<T>(val, {
      trim: true,
      ...options,
    } as any);

    if (!isValid.valid && msg) isValid.reason.unshift(msg);

    return isValid;
  };
}

function validateUrl(msg?: string, allowEmpty = false) {
  return (val: any) => {
    const validated = '' + val;

    if (allowEmpty && validated == '') return true;

    const valid = isURL(validated, { require_protocol: true });

    return valid
      ? { valid, validated }
      : { valid, reason: msg || 'Invalid url' };
  };
}
