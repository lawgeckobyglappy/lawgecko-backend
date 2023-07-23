import { UserAccountStatus } from '../../../../shared/types';

import {
	loginLinkRepository,
	loginSessionRepository,
	userRepository,
} from '../../repositories';
import { LoginSessionModel } from '../../models';
import { createToken, handleAuthError, handleError } from '../../utils';

import { activateUser } from './activate-user';

export { verifyLoginLink };

const acceptedAccountStatus: UserAccountStatus[] = [
	'active',
	'pending:activation',
];

const verifyLoginLink = async (id: string) => {
	const link = await loginLinkRepository.findById(id);

	if (!link) return handleError({ message: 'Invalid code' });

	const user = await userRepository.findById(link.userId);

	if (!user || !acceptedAccountStatus.includes(user.accountStatus))
		return handleAuthError('Authentication failed');

	const [sessionInfo] = await Promise.all([
		await LoginSessionModel.create({ userId: user._id }),
		user.accountStatus == 'pending:activation'
			? await activateUser(user)
			: null,
	]);

	const { data: session, error } = sessionInfo;

	if (error) return handleError(error);

	await loginSessionRepository.insertOne(session);

	const accessToken = createToken({
		userId: user._id,
		userRole: user.role,
		sessionId: session._id,
	});

	loginLinkRepository.deleteById(id);

	return { data: accessToken };
};
