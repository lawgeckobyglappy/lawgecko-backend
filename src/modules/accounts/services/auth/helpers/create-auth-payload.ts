import { UserRole } from '@types';
import { handleError } from '@utils';

import { createToken } from '../../../utils';
import { LoginSessionModel } from '../../../entities';
import { loginSessionRepository } from '../../../repositories';

export { createAuthPayload };

type UserInfo = { _id: string; role: UserRole };

const createAuthPayload = async ({ _id: userId, role }: UserInfo) => {
  const sessionInfo = await LoginSessionModel.create({ userId });

  const { data: session, error } = sessionInfo;

  if (error) return handleError(error);

  await loginSessionRepository.insertOne(session);

  const accessToken = createToken({
    userId,
    userRole: role,
    sessionId: session._id,
  });

  return { data: accessToken };
};
