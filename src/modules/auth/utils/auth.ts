import jwt from 'jsonwebtoken';
import { Request } from 'express';

import { config } from '@config';
import { AuthInfo, AuthInfoInput } from '@types';

const { JWT_SECRET, JWT_ACCESS_EXPIRATION_DAYS } = config.jwt;

export { createToken, parseAuth };

function createToken({ userId, userRole, sessionId }: AuthInfoInput) {
  return jwt.sign(
    { user: { _id: userId, role: userRole }, sessionId } as AuthInfo,
    JWT_SECRET!,
    { expiresIn: `${JWT_ACCESS_EXPIRATION_DAYS}d` },
  );
}

function getAuthInfo(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET!) as AuthInfo;
  } catch (err: any) {
    return null;
  }
}

function parseAuth(req: Request) {
  const bearerToken = req.headers['authorization']?.split(' ');

  return bearerToken?.[0] === 'Bearer' ? getAuthInfo(bearerToken[1]) : null;
}
