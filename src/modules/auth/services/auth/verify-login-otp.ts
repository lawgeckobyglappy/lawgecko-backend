import { LoginSessionModel } from 'modules/auth/models';
import {
	loginOTPRepository,
	loginSessionRepository,
	userRepository,
} from 'modules/auth/repositories';
import { createToken, handleAuthError, handleError } from 'modules/auth/utils';

export { verifyLoginOTP };

const verifyLoginOTP = async (code: string) => {
	const otp = await loginOTPRepository.findByCode(code);

	if (!otp) return handleError({ message: 'Invalid code' });

	const user = await userRepository.findById(otp.userId);

	if (!user) return handleAuthError('Authentication failed');

	const { data: session, error } = await LoginSessionModel.create({
		userId: user._id,
	});

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
