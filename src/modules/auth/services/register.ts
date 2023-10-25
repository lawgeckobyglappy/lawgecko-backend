import { UserInput, UserRoles } from '@types';

import { handleError } from '../utils';
import { UserModel } from '../entities';
import { userRepository } from '../repositories';

import { createLoginLink } from './create-login-link';

export { register };

const register = async (values: Partial<UserInput>) => {
  const { data, error } = await UserModel.create({
    ...values,
    role: UserRoles.USER,
  });

  if (error) return handleError(error);

  const user = await userRepository.insertOne(data);

  await createLoginLink(user);

  return { data: user };
};
