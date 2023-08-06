import { User } from '@types';

import { loginSessionRepository } from '../../../repositories';
import { LoginSessionModel } from '../../../models';
import { createToken, handleError } from '../../../utils';

export { createAuthPayload };

const createAuthPayload = async (user: User) => {
	const sessionInfo = await LoginSessionModel.create({ userId: user._id });

	const { data: session, error } = sessionInfo;

	if (error) return handleError(error);

	await loginSessionRepository.insertOne(session);

	const accessToken = createToken({
		userId: user._id,
		userRole: user.role,
		sessionId: session._id,
	});

	return { data: accessToken };
};
