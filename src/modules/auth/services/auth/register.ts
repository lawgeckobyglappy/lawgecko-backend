import { UserModel } from 'modules/auth/models/user';
import { userRepository } from 'modules/auth/repositories';
import { UserInput } from 'shared/types';

export { register };

const register = async (values: Partial<UserInput>) => {
	const { data, error } = await UserModel.create(values);

	if (error) return { error };

	const user = await userRepository.insertOne(data);

	// send email

	return { data: user };
};
