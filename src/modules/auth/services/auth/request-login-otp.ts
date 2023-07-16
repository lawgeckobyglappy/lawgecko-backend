import { userRepository } from 'modules/auth/repositories';
import { handleError } from 'modules/auth/utils';
import { validateEmail } from 'modules/auth/validators';

import { createLoginOTP } from './create-login-otp';

export { requestLoginOTP };

const requestLoginOTP = async (email: string) => {
	const isValid = validateEmail(email);

	if (!isValid.valid) return handleError({ message: 'Invalid email' });

	const user = await userRepository.findOne({ email: isValid.validated });

	if (!user || user.accountStatus !== 'active') return { data: 'Success' };

	return createLoginOTP(user);
};
