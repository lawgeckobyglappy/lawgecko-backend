import { validate, IStringOptions, ValidatorResponse } from 'clean-schema';
import { RangeType } from 'clean-schema/dist/validate/isNumberOk';

export { isValidObject, validateEmail, validateNumber, validateString };

function validateEmail(val: any) {
	const validation = validate.isEmailOk(val);

	if (!validation.valid) validation.reasons = ['Invalid email'];

	return validation;
}

function isValidObject(val: any): val is NonNullable<any> {
	return val && typeof val === 'object' && !Array.isArray(val);
}

function validateNumber(msg?: string, range?: RangeType) {
	return (val: any) => {
		const validation = validate.isNumberOk(val, { range });

		if (!validation.valid && msg) validation.reasons?.unshift(msg);

		return validation;
	};
}

function validateString(msg?: string, options?: IStringOptions) {
	return (val: any) => {
		const validation = validate.isStringOk(val, options);

		if (!validation.valid && msg) validation.reasons?.unshift(msg);

		return validation;
	};
}
