import { sanitize } from 'apitoolz';
import { VALIDATION_ERRORS } from 'clean-schema';

import { AuthInfo, UserInput, UserRoles } from '@types';

import { UserModel } from '../entities';
import { userRepository } from '../repositories';
import { handleAuthError, handleError } from '../utils';

export { updateUser };

const { SECURITY_ADMIN, SUPER_ADMIN } = UserRoles;

type Options = {
  id: string;
  updates: Partial<UserInput>;
  authInfo: AuthInfo;
};
const updateUser = async ({ id, updates, authInfo }: Options) => {
  const user = await userRepository.findById(id);

  if (!user) return handleError({ message: 'User not found', statusCode: 404 });

  const currentUser = authInfo.user;
  const isCurrentUser = user._id == currentUser._id;

  if (isCurrentUser && user.accountStatus != 'active')
    return handleAuthError('Authentication failed');

  if (!isCurrentUser) {
    if (![SUPER_ADMIN, SECURITY_ADMIN].includes(currentUser.role as any))
      return handleAuthError('Access denied');

    if (user.role == SUPER_ADMIN) return handleAuthError('Access denied');

    if (currentUser.role != SUPER_ADMIN && user.role == SECURITY_ADMIN)
      return handleAuthError('Access denied');
  }

  if (isCurrentUser) {
    updates = sanitize(updates, { remove: ['accountStatus', 'role'] });

    if (currentUser.role == UserRoles.USER)
      updates = sanitize(updates, {
        remove: ['email', 'firstName', 'lastName', 'address'],
      });
  }

  const { data, error } = await UserModel.update(user, updates);

  if (error) {
    if (error.message == VALIDATION_ERRORS.NOTHING_TO_UPDATE)
      return { data: user };

    return handleError(error);
  }

  await userRepository.updateOne({ _id: id }, data);

  return { data: { ...user, ...data } };
};
