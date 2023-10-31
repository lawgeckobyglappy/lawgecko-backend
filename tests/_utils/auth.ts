import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { makeServer } from '../../src/app';
import { User, UserRole } from '../../src/shared/types';
import { createToken } from '../../src/modules/accounts/utils';

let api: request.SuperTest<request.Test>, server: any;

export { expectAuthError, generateToken };

type AuthConfig = {
  description: string;
  errorCode: 401 | 403;
  errorMessage: 'Access denied' | 'Authentication failed';
  method: 'delete' | 'get' | 'patch' | 'post';
  role?: '' | UserRole;
  url: string;
};

function generateToken({
  customId,
  role,
  user,
}: {
  role?: '' | UserRole;
  customId?: string;
  user?: Partial<User>;
}) {
  if (user)
    return createToken({ userId: user._id, userRole: user.role } as any);

  if (customId) return createToken({ userId: customId, userRole: role } as any);

  return '';
}

function expectAuthError({
  description,
  errorCode,
  errorMessage,
  method,
  role,
  url,
}: AuthConfig) {
  describe('auth failure', () => {
    beforeEach(() => {
      server = makeServer();
      api = request(server);
    });

    afterEach(() => server?.close());

    it(description, async () => {
      const res = await api[method](url)
        .set('Authorization', `Bearer ${generateToken({ role })}`)
        .send();

      const { body, status } = res;

      expect(status).toBe(errorCode);
      expect(body.data).toBeUndefined();
      expect(body.error?.message).toEqual(errorMessage);
    });
  });
}
