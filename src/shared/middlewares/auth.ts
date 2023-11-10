import { NextFunction, Request, Response } from 'express';

import { UserRole } from '@types';
import { parseAuth } from '../../modules/accounts/utils';
import { handleAuthError } from '../utils/errors';

export { requireAuth };

function requireAuth(roles: UserRole | UserRole[] = []) {
  if (!Array.isArray(roles)) roles = [roles];

  return (req: Request, res: Response, next: NextFunction) => {
    const authInfo = parseAuth(req);

    if (!authInfo) {
      const _res = handleAuthError('Authentication failed');

      return res.status(_res.error.statusCode).json(_res);
    }

    if (roles.length && !roles.includes(authInfo.user.role)) {
      const _res = handleAuthError('Access denied');

      return res.status(_res.error.statusCode).json(_res);
    }

    req.authInfo = authInfo;

    return next();
  };
}
