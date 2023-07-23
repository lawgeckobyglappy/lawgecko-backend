import { handleError } from '../../utils';
import { validateEmail } from '../../validators';
import { userRepository } from '../../repositories';

import { createLoginLink } from './create-login-link';

export { requestLoginLink };

const requestLoginLink = async (email: string) => {
	const isValid = validateEmail(email);

	if (!isValid.valid) return handleError({ message: 'Invalid email' });

	const user = await userRepository.findOne({ email: isValid.validated });

	if (!user || user.accountStatus !== 'active') return { data: 'Success' };

	return createLoginLink(user);
};
