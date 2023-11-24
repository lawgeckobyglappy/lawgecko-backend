import request from 'supertest';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import { makeServer } from '../../src/app';
import { userRepository } from '../../src/modules/accounts/repositories';

import { cleanupDp } from '../_utils';
import { addUsers, users } from '../_utils/users';
import { expectAuthError, generateToken } from '../_utils/auth';
import { UserAccountStatus, UserRoles } from '../../src/shared/types';

const { SECURITY_ADMIN, USER } = UserRoles;
const { BLOCKED, DELETED } = UserAccountStatus;

let api: request.SuperTest<request.Test>, server: any;

const BASE_URL = '/api/v1/assessments';

describe('Accounts', () => {
  beforeAll(() => {
    server = makeServer();
    api = request(server);
  });

  afterAll(async () => {
    await server?.close();
  });

  beforeEach(async () => {
    await addUsers();
  });

  afterEach(async () => await cleanupDp());

  describe('POST /assessments/assessment', () => {
    let token = '';

    const user = users.SECURITY_ADMIN;
    let url = `${BASE_URL}/assessment`;

    beforeEach(() => {
      token = generateToken({ user });
    });

    it('should allow creation of an assessment with correct information provided', async () => {
      token = generateToken({ user: users.SECURITY_ADMIN });
      const { body, status } = await api
        .post(url)
        .field('summary', 'This is a random assessment that has no questions.')
        .attach('photo', './tests/assets/spongeGovID.png')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'multipart/form-data');

      const { data, error } = body;
      console.log(data);
      expect(status).toBe(200);
      expect(error).toBeUndefined();
    });
  });
});
