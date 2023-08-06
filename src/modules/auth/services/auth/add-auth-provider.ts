import { handleAuthError, handleError } from '../../utils';
import { validateEmail } from '../../validators';
import { userRepository } from '../../repositories';

import { createLoginLink } from './create-login-link';

export { requestLoginLink };

import { OAuth2Client } from 'google-auth-library';
import { UserModel } from '../../models';
import { AuthProvider } from '@types';
const client = new OAuth2Client({
	clientId: 'YOUR_GOOGLE_CLIENT_ID',
	clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
	redirectUri: 'YOUR_GOOGLE_REDIRECT_URI',
});

type GoogleUserInfo = {
	email: string;
	email_verified: boolean;
	name: string;
	picture: string;
	given_name: string;
	family_name: string;
};
async function addAuthProvider(code: string) {
	const { tokens } = await client.getToken(code);

	client.setCredentials({
		access_token: tokens.access_token,
		refresh_token: tokens.refresh_token,
	});

	const response = await client.request<GoogleUserInfo>({
		url: 'https://www.googleapis.com/oauth2/v3/userinfo',
	});

	if (response.status != 200)
		return handleError({ message: response.statusText, statusCode: 500 });

	const userInfo = response.data;

	if (!userInfo.email_verified)
		return handleError({ message: 'Email not verified' });

	let user = await userRepository.findOne({ email: userInfo.email });

	if (user?.accountStatus == 'deleted')
		return handleAuthError('Authentication failed');

	if (user?.accountStatus != 'active') return handleAuthError('Access denied');

	if (user && !user?.authProviders?.includes('google')) {
		const { data, error } = await UserModel.create({
			email: userInfo.email,
			firstName: userInfo.given_name,
			lastName: userInfo.family_name,
			authProviders: ['google'],
		});

		if (error) return handleError(error);

		const authProviders: AuthProvider[] = [
			...(user?.authProviders ?? []),
			'google',
		];

		user.authProviders = authProviders;

		await userRepository.updateOne({ _id: user._id }, { authProviders });
	}

	if (!user) {
		const { data, error } = await UserModel.create({
			email: userInfo.email,
			firstName: userInfo.given_name,
			lastName: userInfo.family_name,
			authProviders: ['google'],
		});

		if (error) return handleError(error);

		user = await userRepository.insertOne(data);
	}

	return userInfo;
}

const requestLoginLink = async (email: string) => {
	const isValid = validateEmail(email);

	if (!isValid.valid) return handleError({ message: 'Invalid email' });

	const user = await userRepository.findOne({ email: isValid.validated });

	if (!user || user.accountStatus != 'active') return { data: 'Success' };

	return createLoginLink(user);
};
