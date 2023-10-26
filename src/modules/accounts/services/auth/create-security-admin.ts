import { AuthInfo, UserInput, UserRoles } from '@types';

import { UserModel } from '../../entities';
import { userRepository } from '../../repositories';
import { handleAuthError, handleError } from '../../utils';

import { createLoginLink } from './create-login-link';

export { createSecAdmin };

const createSecAdmin = async (
  values: Partial<UserInput>,
  authInfo: AuthInfo,
) => {
  if (authInfo.user.role != UserRoles.SUPER_ADMIN)
    return handleAuthError('Access denied');

  const { data, error } = await UserModel.create({
    ...values,
    role: UserRoles.SECURITY_ADMIN,
  });

  if (error) return handleError(error);

  const user = await userRepository.insertOne(data);

  await createLoginLink(user);

  return { data: user };
};
