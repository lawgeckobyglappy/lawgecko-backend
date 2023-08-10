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
	isLogin: boolean;
	provider: AuthProvider;
};
async function handleAuthProvider({ userInfo, isLogin, provider }: Options) {
	let user = await userRepository.findOne({ email: userInfo.email });

	if (user?.accountStatus == 'deleted')
		return handleAuthError('Authentication failed');

	if (user && user?.accountStatus != 'active')
		return handleAuthError('Access denied');

	if (isLogin && (!user || !user?.authProviders?.includes(provider)))
		return handleError({
			message: 'Auth provider not registered for this account',
		});

	if (!user) {
		const { data, error } = await UserModel.create({
			...userInfo,
			_addAuthProvider: provider,
		});

		if (error) return handleError(error);

		user = await userRepository.insertOne(data);
	}

	return createAuthPayload(user);
}
