import jwt from 'jsonwebtoken';
import { Request } from 'express';

import { config } from '@config';
import { AuthInfo, AuthInfoInput, UserRoles } from '@types';

const { JWT_SECRET } = config.jwt;

export { createToken, parseAuth };

function createToken({ userId, userRole, sessionId }: AuthInfoInput) {
  const expiresIn = UserRoles.USER == userRole ? config.jwt.JWT_ACCESS_EXPIRATION_HOURS : config.jwt.ADMIN_JWT_ACCESS_EXPIRATION_HOURS
  
  return jwt.sign(
    { user: { _id: userId, role: userRole }, sessionId } as AuthInfo,
    JWT_SECRET!,
    { expiresIn: `${expiresIn}h` },
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
