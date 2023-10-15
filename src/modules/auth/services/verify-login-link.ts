import { handleAuthError, handleError } from '../utils';
import { loginLinkRepository, userRepository } from '../repositories';

import { createAuthPayload } from './helpers';

export { verifyLoginLink };

const verifyLoginLink = async (linkId: string) => {
  const link = await loginLinkRepository.findById(linkId);

  if (!link) return handleError({ message: 'Invalid link' });

  const user = await userRepository.findById(link.userId);

  if (!user || user.accountStatus != 'active')
    return handleAuthError('Authentication failed');

  await loginLinkRepository.deleteById(linkId);

  return createAuthPayload(user);
};
