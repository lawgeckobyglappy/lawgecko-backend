import {
	loginLinkRepository,
	loginSessionRepository,
	userRepository,
} from '../../repositories';
import { LoginSessionModel } from '../../models';
import { createToken, handleAuthError, handleError } from '../../utils';

export { verifyLoginLink };

const verifyLoginLink = async (linkId: string) => {
	const link = await loginLinkRepository.findById(linkId);

	if (!link) return handleError({ message: 'Invalid link' });

	const user = await userRepository.findById(link.userId);

	if (!user || user.accountStatus != 'active')
		return handleAuthError('Authentication failed');

	const sessionInfo = await LoginSessionModel.create({ userId: user._id });

	const { data: session, error } = sessionInfo;

	if (error) return handleError(error);

	await loginSessionRepository.insertOne(session);

	const accessToken = createToken({
		userId: user._id,
		userRole: user.role,
		sessionId: session._id,
	});

	loginLinkRepository.deleteById(linkId);

	return { data: accessToken };
};
