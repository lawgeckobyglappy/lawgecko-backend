import { AuthProvider, IApiError, User } from '@types';

import { UserModel } from '../../../models';
import { userRepository } from '../../../repositories';
import { handleAuthError, handleError } from '../../../utils';

export { handleAuthProvider };

type UserInfo = {
	email: string;
	firstName: string;
	lastName: string;
};

type HandlerResponse = { data: User } | { error: IApiError };

type Options = {
	userInfo: UserInfo;
	provider: AuthProvider;
};
async function handleAuthProvider({
	userInfo,
	provider,
}: Options): Promise<HandlerResponse> {
	let user = await userRepository.findOne({ email: userInfo.email });

	if (!user) {
		const { data, error } = await UserModel.create({
			...userInfo,
			_addAuthProvider: provider,
		});

		if (error) return handleError(error);

		user = await userRepository.insertOne(data);

		return { data: user };
	}

	if (user?.accountStatus == 'deleted')
		return handleAuthError('Authentication failed');

	if (user?.accountStatus != 'active') return handleAuthError('Access denied');

	if (user && !user?.authProviders?.includes(provider)) {
		const { data, error } = await UserModel.update(user, {
			_addAuthProvider: provider,
		});

		if (error) return handleError(error);

		await userRepository.updateOne({ _id: user._id }, data);

		return { data: { ...user, ...data } };
	}

	return { data: user };
}
