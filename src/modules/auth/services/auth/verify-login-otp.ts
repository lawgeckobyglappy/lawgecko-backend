import { LoginSessionModel } from 'modules/auth/models';
import {
	loginOTPRepository,
	loginSessionRepository,
	userRepository,
} from 'modules/auth/repositories';
import { createToken, handleAuthError, handleError } from 'modules/auth/utils';
import { UserAccountStatus } from 'shared/types';
import { activateUser } from './activate-user';

export { verifyLoginOTP };

const acceptedAccountStatus: UserAccountStatus[] = [
	'active',
	'pending:activation',
];

const verifyLoginOTP = async (code: string) => {
	const otp = await loginOTPRepository.findByCode(code);

	if (!otp) return handleError({ message: 'Invalid code' });

	const user = await userRepository.findById(otp.userId);

	if (!user || !acceptedAccountStatus.includes(user.accountStatus))
		return handleAuthError('Authentication failed');

	if (user.accountStatus == 'pending:activation') await activateUser(user);

	const [sessionInfo] = await Promise.all([
		await LoginSessionModel.create({
			userId: user._id,
		}),
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

	loginOTPRepository.deleteByCode(code);

	return { data: accessToken };
};
