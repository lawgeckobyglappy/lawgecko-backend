import { UserInput } from '../../../../shared/types';

import { UserModel } from '../../models';
import { handleError } from '../../utils';
import { userRepository } from '../../repositories';

import { createLoginLink } from './create-login-link';

export { register };

const register = async (values: Partial<UserInput>) => {
	const { data, error } = await UserModel.create(values);

	if (error) return handleError(error);

	const user = await userRepository.insertOne(data);

	await createLoginLink(user as any);

	return { data: user };
};
