import { User } from 'shared/types';

import { UserModel } from 'modules/auth/models';
import { handleError } from 'modules/auth/utils';
import { userRepository } from 'modules/auth/repositories';

export { activateUser };

const activateUser = async (user: User) => {
	const { data, error } = await UserModel.update(user, {
		accountStatus: 'active',
	});

	if (error) {
		if (error.message.toLowerCase() == 'nothing to update')
			return { data: 'Success' };

		return handleError(error);
	}

	await userRepository.updateOne({ _id: user._id }, data);

	return { data: 'Success' };
};
