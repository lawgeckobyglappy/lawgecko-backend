import { ValidatorResponse } from 'clean-schema';
import { validateEmail, validateString } from './shared';
import {
	AuthProvider,
	supportedAuthProviders,
	UserAccountStatus,
	UserRole,
	validAccountStatus,
} from '@/shared/types';
import { userRepository } from '../repositories';

export {
	validateAuthProviders,
	validateUserAccountStatus,
	validateUserEmail,
	validateUsername,
	validateUserRole,
};

async function validateUserEmail(val: any) {
	const isValid = validateEmail(val);

	if (!isValid.valid) return isValid;

	const isTaken = await userRepository.findOne({ email: isValid.validated });

	if (isTaken) return { valid: false, reason: 'Email already taken' };

	return isValid;
}

async function validateUsername(val: any) {
	const isValid = validateString('Invalid username')(val);

	if (!isValid.valid) return isValid;

	const isTaken = await userRepository.findOne({ username: isValid.validated });

	if (isTaken) return { valid: false, reason: 'Username already taken' };

	return isValid;
}

function validateAuthProviders(providers: any) {
	if (!Array.isArray(providers)) return { valid: false, reason: '' };

	const reasons: string[] = [];

	for (const provider of providers)
		if (!supportedAuthProviders.includes(provider))
			reasons.push(`${provider} is not a supported auth provider`);

	if (reasons.length) return { valid: false, reasons };

	return { valid: true, validated: providers } as ValidatorResponse<
		AuthProvider[]
	>;
}

function validateUserAccountStatus(status: any) {
	return validateString('Invalid account status', {
		enums: validAccountStatus as any,
	})(status) as ValidatorResponse<UserAccountStatus>;
}

const validRoles: UserRole[] = ['admin', 'moderator', 'user'];
function validateUserRole(status: any) {
	return validateString('Invalid role', {
		enums: validRoles,
	})(status) as ValidatorResponse<UserRole>;
}
