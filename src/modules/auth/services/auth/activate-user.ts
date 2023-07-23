import { User } from 'shared/types';

import { UserModel } from '../../models';
import { handleError } from '../../utils';
import { userRepository } from '../../repositories';

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
