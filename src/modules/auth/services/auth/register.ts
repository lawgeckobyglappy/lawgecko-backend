import { UserInput } from 'shared/types';

import { UserModel } from 'modules/auth/models';
import { handleError } from 'modules/auth/utils';
import { userRepository } from 'modules/auth/repositories';

import { createLoginOTP } from './create-login-otp';

export { register };

const register = async (values: Partial<UserInput>) => {
	const { data, error } = await UserModel.create({
		...values,
		accountStatus: 'pending:activation',
	});

	if (error) return handleError(error);

	const user = await userRepository.insertOne(data);

	await createLoginOTP(user as any);

	return { data: user };
};
