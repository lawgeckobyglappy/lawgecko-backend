import { AuthProvider } from '@types';

import { UserModel } from '../../../models';
import { userRepository } from '../../../repositories';
import { handleAuthError, handleError } from '../../../utils';
import { createAuthPayload } from './create-auth-payload';

export { handleAuthProvider };

type UserInfo = {
	email: string;
	firstName: string;
	lastName: string;
};

type Options = {
	userInfo: UserInfo;
	provider: AuthProvider;
};
async function handleAuthProvider({ userInfo, provider }: Options) {
	let user = await userRepository.findOne({ email: userInfo.email });

	if (user?.accountStatus == 'deleted')
		return handleAuthError('Authentication failed');

	if (user?.accountStatus != 'active') return handleAuthError('Access denied');

	if (!user) {
		const { data, error } = await UserModel.create({
			...userInfo,
			_addAuthProvider: provider,
		});

		if (error) return handleError(error);

		user = await userRepository.insertOne(data);
	} else if (!user?.authProviders?.includes(provider)) {
		const { data, error } = await UserModel.update(user, {
			_addAuthProvider: provider,
		});

		if (error) return handleError(error);

		await userRepository.updateOne({ _id: user._id }, data);

		user = { ...user, ...data };
	}

	return createAuthPayload(user);
}
