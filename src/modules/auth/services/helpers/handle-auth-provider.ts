import { AuthProvider } from '@types';

import { UserModel } from '../../entities';
import { userRepository } from '../../repositories';
import { handleAuthError, handleError } from '../../utils';

import { createAuthPayload } from './create-auth-payload';

export { handleAuthProvider };

type UserInfo = {
  email: string;
  firstName: string;
  lastName: string;
};

type Options = {
  userInfo: UserInfo;
  isLogin: boolean;
  provider: AuthProvider;
};
async function handleAuthProvider({ userInfo, isLogin, provider }: Options) {
  let user = await userRepository.findOne({ email: userInfo.email });

  if (user?.accountStatus == 'deleted')
    return handleAuthError('Authentication failed');

  if (user && user?.accountStatus != 'active')
    return handleAuthError('Access denied');

  const isProviderRegistered = user?.authProviders?.includes(provider);

  if (isLogin && (!user || !isProviderRegistered))
    return handleError({
      message: 'Auth provider not registered for this account',
    });

  if (!isLogin && user && !isProviderRegistered) {
    const { data, error } = await UserModel.update(user, {
      _addAuthProvider: provider,
    });

    if (error) return handleError(error);

    await userRepository.updateOne({ _id: user._id }, data);

    user = { ...user, ...data };
  }

  if (!user) {
    const { data, error } = await UserModel.create({
      ...userInfo,
      _addAuthProvider: provider,
    });

    if (error) return handleError(error);

    user = await userRepository.insertOne(data);
  }

  return createAuthPayload(user);
}
