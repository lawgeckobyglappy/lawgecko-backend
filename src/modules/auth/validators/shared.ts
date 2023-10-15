import { StringOptions, isEmailOk, isStringOk } from 'clean-schema';

export { validateEmail, validateString };

function validateEmail(val: any) {
  const validation = isEmailOk(val);

  if (!validation.valid) validation.reasons = ['Invalid email'];

  return validation;
}

function validateString<T extends string = string>(
  msg?: string,
  options?: StringOptions<T>,
) {
  return (val: any) => {
    const validation = isStringOk<T>(val, {
      trim: true,
      ...options,
    } as any);

    if (!validation.valid && msg) validation.reasons.unshift(msg);

    return validation;
  };
}
