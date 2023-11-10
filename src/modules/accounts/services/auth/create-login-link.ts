import { User } from '@types';
import { handleError } from '@utils';

import { LoginLinkModel } from '../../entities';
import { triggerSendLoginLinkEmail } from '../../jobs';
import { loginLinkRepository } from '../../repositories';

export { createLoginLink };

const createLoginLink = async (user: User) => {
  const { data, error } = await LoginLinkModel.create({ userId: user._id });

  if (error) return handleError(error);

  await loginLinkRepository.insertOne(data);

  triggerSendLoginLinkEmail({
    email: user.email,
    firstName: user.firstName,
    linkId: data._id,
  });

  return { data: 'Success' };
};
