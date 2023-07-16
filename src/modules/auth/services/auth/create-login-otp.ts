import { User } from 'shared/types';
import { sendOTPEmail } from 'shared/utils';

import { LoginOTPModel } from 'modules/auth/models';
import { loginOTPRepository } from 'modules/auth/repositories';

export { createLoginOTP };

const createLoginOTP = async (user: User) => {
	const { data, error } = await LoginOTPModel.create({ userId: user._id });

	if (error) return { error };

	await loginOTPRepository.insertOne(data);

	await sendOTPEmail({ user, code: data.code });

	return { data: 'Success' };
};
