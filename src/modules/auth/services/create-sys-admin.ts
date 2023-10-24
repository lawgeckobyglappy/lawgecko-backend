import { AuthInfo, UserInput, UserRoles } from '@types';
import { UserModel } from '../entities';
import { handleAuthError, handleError } from '../utils';
import { userRepository } from '../repositories';

import { createLoginLink } from './create-login-link';

export { createSysAdmin };

const createSysAdmin = async (values: Partial<UserInput>, authInfo: AuthInfo) => {
  if (authInfo.user.role != UserRoles.SUPER_ADMIN)
    return handleAuthError('Access denied')

  const { data, error } = await UserModel.create({...values, role: UserRoles.SYSTEM_ADMIN});

  if (error) return handleError(error);

  const user = await userRepository.insertOne(data);

  await createLoginLink(user as any);

  return { data: user };
};
