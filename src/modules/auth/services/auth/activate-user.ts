import { UserModel } from 'modules/auth/models';
import { userRepository } from 'modules/auth/repositories';
import { handleError } from 'modules/auth/utils';
import { User } from 'shared/types';

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
