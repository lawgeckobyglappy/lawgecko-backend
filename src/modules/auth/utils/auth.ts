import jwt from 'jsonwebtoken';
import { Request } from 'express';

import config from '@/config/env';
import { AuthInfo, AuthInfoInput } from '@/shared/types';

const { secret, accessExpirationDays } = config.jwt;

export { createToken, parseAuth };

function createToken({ userId, userRole, sessionId }: AuthInfoInput) {
  return jwt.sign(
    { user: { _id: userId, role: userRole }, sessionId } as AuthInfo,
    secret!,
    { expiresIn: `${accessExpirationDays}d` },
  );
}

function getAuthInfo(token: string) {
  try {
    return jwt.verify(token, secret!) as AuthInfo;
  } catch (err: any) {
    return null;
  }
}

function parseAuth(req: Request) {
  const bearerToken = req.headers['authorization']?.split(' ');

  return bearerToken?.[0] === 'Bearer' ? getAuthInfo(bearerToken[1]) : null;
}
