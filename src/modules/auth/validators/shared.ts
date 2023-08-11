import { validate, IStringOptions } from 'clean-schema';

export { validateEmail, validateString };

function validateEmail(val: any) {
	const validation = validate.isEmailOk(val);

	if (!validation.valid) validation.reasons = ['Invalid email'];

	return validation;
}

function validateString(msg?: string, options?: IStringOptions) {
	return (val: any) => {
		const validation = validate.isStringOk(val, { trim: true, ...options });

		if (!validation.valid && msg) validation.reasons.unshift(msg);

		return validation;
	};
}


function validateObjectId(msg?: string, options?: IStringOptions) {
	return (val: any) => {
		const validation = validate.isStringOk(val, { trim: true, ...options });

		if (!validation.valid && msg) validation.reasons.unshift(msg);

		return validation;
	};
}
