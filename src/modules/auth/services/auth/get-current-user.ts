import { AuthInfo } from '../../../../shared/types';

import { handleAuthError } from '../../utils';
import { userRepository } from '../../repositories';

export { getCurrentuser };

const getCurrentuser = async ({ user: { _id } }: AuthInfo) => {
	const user = await userRepository.findById(_id);

	if (!user || user.accountStatus != 'active')
		return handleAuthError('Authentication failed');

	return { data: user };
};
