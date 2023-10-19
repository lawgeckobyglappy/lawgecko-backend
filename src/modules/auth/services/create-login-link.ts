import { User } from '@types';

import { LoginLinkModel } from '../entities';
import { handleError } from '../utils/errors';
import { triggerSendLoginLinkEmail } from '../jobs';
import { loginLinkRepository } from '../repositories';

export { createLoginLink };

const createLoginLink = async (user: User) => {
  const { data, error } = await LoginLinkModel.create({ userId: user._id });

  if (error) return handleError(error);

  await loginLinkRepository.insertOne(data);

  triggerSendLoginLinkEmail({ user, linkId: data._id });

  return { data: 'Success' };
};
