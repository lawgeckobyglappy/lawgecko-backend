import { ValidatorResponse } from 'clean-schema';
import { validateEmail, validateString } from './shared';
import { UserAccountStatus, UserRole } from 'shared/types';
import { userRepository } from '../repositories';

export {
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

const validAccountStatus: UserAccountStatus[] = [
	'active',
	'blocked',
	'deleted',
	'pending:activation',
];
function validateUserAccountStatus(status: any) {
	return validateString('Invalid account status', {
		enums: validAccountStatus,
	})(status) as ValidatorResponse<UserAccountStatus>;
}

const validRoles: UserRole[] = ['admin', 'moderator', 'user'];
function validateUserRole(status: any) {
	return validateString('Invalid role', {
		enums: validRoles,
	})(status) as ValidatorResponse<UserRole>;
}
