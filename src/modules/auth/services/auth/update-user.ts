import { sanitize } from 'apitoolz';

import { AuthInfo, User } from '../../../../shared/types';

import { UserModel } from '../../models';
import { userRepository } from '../../repositories';
import { handleAuthError, handleError } from '../../utils';

export { updateUser };

type Options = {
	id: string;
	updates: Partial<User>;
	authInfo: AuthInfo;
};
const updateUser = async ({ id, updates, authInfo }: Options) => {
	const user = await userRepository.findById(id);

	if (!user) return handleError({ message: 'User not found', statusCode: 404 });

	const isCurrentUser = user._id == authInfo.user._id;

	if (isCurrentUser && user.accountStatus != 'active')
		return handleAuthError('Authentication failed');

	if (!isCurrentUser && authInfo.user.role != 'admin')
		return handleAuthError('Access denied');

	if (isCurrentUser)
		updates = sanitize(updates, { remove: ['accountStatus', 'role'] });

	const { data, error } = await UserModel.update(user, updates);

	if (error) {
		if (error.message.toLowerCase() == 'nothing to update')
			return { data: user };

		return handleError(error);
	}

	await userRepository.updateOne({ _id: id }, data);

	return { data: { ...user, ...data } };
};
