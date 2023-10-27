import { OAuth2Client } from 'google-auth-library';

import { config } from '@config';
import { handleError } from '../../utils';
import { handleAuthProvider } from './helpers';

export { handleGoogleAuth };

const {
  authProviders: { google },
  FRONTEND_URL: frontendUrl,
} = config;

const client = new OAuth2Client({
  clientId: google.clientId,
  clientSecret: google.clientSecret,
  redirectUri: frontendUrl,
});

type GoogleUserInfo = {
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
};
async function handleGoogleAuth({
  code,
  isLogin,
}: {
  code: string;
  isLogin: boolean;
}) {
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

  return handleAuthProvider({
    isLogin,
    userInfo: {
      email: userInfo.email,
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
    },
    provider: 'google',
  });
}
