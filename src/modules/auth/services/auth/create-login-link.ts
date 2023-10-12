import { User } from '@types';
import { sendLoginLinkEmail } from '@utils';

import { LoginLinkModel } from '../../entities';
import { handleError } from '../../utils/errors';
import { loginLinkRepository } from '../../repositories';

export { createLoginLink };

const createLoginLink = async (user: User) => {
  const { data, error } = await LoginLinkModel.create({ userId: user._id });

  if (error) return handleError(error);

  await loginLinkRepository.insertOne(data);

  await sendLoginLinkEmail({ user, linkId: data._id });

  return { data: 'Success' };
};
