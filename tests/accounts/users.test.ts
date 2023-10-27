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
import { expectAuthError, generateToken } from '../_utils/auth';
import { addUsers, users } from '../_utils/users';
import { UserRoles } from '../../src/shared/types';

const { SECURITY_ADMIN, USER } = UserRoles;

let api: request.SuperTest<request.Test>, server: any;

const BASE_URL = '/api/v1/accounts';

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

  describe('PATCH /accounts/update-user', () => {
    let token = '';

    const user = users.ACTIVE_USER,
      url = `${BASE_URL}/update-user/${user._id}`;

    beforeEach(() => {
      token = generateToken({ user });
    });

    expectAuthError({
      description:
        'should reject with "Authentication failed" if no token is provided',
      errorCode: 401,
      errorMessage: 'Authentication failed',
      method: 'patch',
      role: '',
      url,
    });

    it('should reject with "User not found" error if user does not exist', async () => {
      const { body, status } = await api
        .patch(url + 'id-that-is-not-in-db')
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Update' });

      const { data, error } = body;

      expect(status).toBe(404);

      expect(data).toBeUndefined();

      expect(error.message).toBe('User not found');
    });

    it('should reject with "Access denied" error if user is not owner of account and is not admin', async () => {
      token = generateToken({ user: users.ACTIVE_USER_1 });

      const { body, status } = await api
        .patch(url)
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Update' });

      const { data, error } = body;

      expect(status).toBe(403);

      expect(data).toBeUndefined();

      expect(error.message).toBe('Access denied');
    });

    it('should reject with "Authentication failed" error if user is not active', async () => {
      const statusToReject = ['blocked', 'deleted'];

      for (const accountStatus of statusToReject) {
        await userRepository.updateOne({ _id: user._id }, {
          accountStatus,
        } as any);

        const { body, status } = await api
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send({ firstName: 'Update' });

        const { data, error } = body;

        expect(status).toBe(401);

        expect(data).toBeUndefined();

        expect(error.message).toBe('Authentication failed');
      }
    });

    it('should ignore if users try to update their "accountStatus" or "role"', async () => {
      const update = { accountStatus: 'blocked', role: 'admin' };

      const { body, status } = await api
        .patch(url)
        .set('Authorization', `Bearer ${token}`)
        .send(update);

      const { data, error } = body;

      expect(status).toBe(200);

      expect(error).toBeUndefined();

      expect(data).toMatchObject(user);
    });

    it('should not allow admins to update other admins', async () => {
      token = generateToken({ user: users.SECURITY_ADMIN });

      const update = { firstName: 'Update', accountStatus: 'blocked' };

      const { body, status } = await api
        .patch(`${BASE_URL}/update-user/${users.SECURITY_ADMIN_1._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(update);

      const { data, error } = body;

      expect(status).toBe(403);
      expect(data).toBeUndefined();
      expect(error).toMatchObject({ message: 'Access denied' });
    });

    it("should allow admins to update other users' account statuses", async () => {
      token = generateToken({ user: users.SECURITY_ADMIN });

      const validStatuses = ['active', 'blocked', 'deleted'];

      for (const accountStatus of validStatuses) {
        const update = { accountStatus };

        const { body, status } = await api
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(update);

        const { data, error } = body;

        expect(status).toBe(200);

        expect(error).toBeUndefined();

        expect(data).toMatchObject(update);
      }
    });

    it('should not allow admins to update roles', async () => {
      token = generateToken({ user: users.SECURITY_ADMIN });

      const validRoles = [SECURITY_ADMIN, USER];

      for (const role of validRoles) {
        const update = { role };

        const { body, status } = await api
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(update);

        const { data, error } = body;

        expect(status).toBe(200);

        expect(error).toBeUndefined();

        expect(data).toMatchObject({ role: user.role });
      }
    });

    it('should allow Super Admin to update user if correct information is provided', async () => {
      token = generateToken({ user: users.SUPER_ADMIN });

      const url2 = `${BASE_URL}/update-user/${user._id}`;

      const update = {
        bio: 'this is a new bio',
        profilePicture: 'http://cdn.com/somePath.jpeg',
        firstName: 'newFirst',
        lastName: 'newLast',
        username: 'newUsername',
      };

      const { body, status } = await api
        .patch(url2)
        .set('Authorization', `Bearer ${token}`)
        .send(update);

      const { data, error } = body;

      expect(status).toBe(200);

      expect(error).toBeUndefined();

      expect(data).toMatchObject(update);
    });

    it('should allow Security Admin to update user if correct information is provided', async () => {
      token = generateToken({ user: users.SECURITY_ADMIN });

      const url2 = `${BASE_URL}/update-user/${user._id}`;

      const update = {
        bio: 'this is a new bio',
        profilePicture: 'http://cdn.com/somePath.jpeg',
        firstName: 'newFirst',
        lastName: 'newLast',
        username: 'newUsername',
      };

      const { body, status } = await api
        .patch(url2)
        .set('Authorization', `Bearer ${token}`)
        .send(update);

      const { data, error } = body;

      expect(status).toBe(200);

      expect(error).toBeUndefined();

      expect(data).toMatchObject(update);
    });

    it('should allow Super Admin to update Security Admin if correct information is provided', async () => {
      token = generateToken({ user: users.SUPER_ADMIN }); // Super admin

      const user2 = users.SECURITY_ADMIN; // Security Admin

      const url2 = `${BASE_URL}/update-user/${user2._id}`;

      const update = {
        bio: 'this is a new bio',
        profilePicture: 'http://cdn.com/somePath.jpeg',
        firstName: 'newFirst',
        lastName: 'newLast',
        username: 'newUsername',
      };

      const { body, status } = await api
        .patch(url2)
        .set('Authorization', `Bearer ${token}`)
        .send(update);

      const { data, error } = body;

      expect(status).toBe(200);

      expect(error).toBeUndefined();

      expect(data).toMatchObject(update);
    });

    it('should not allow Security Admin to update Super Admin', async () => {
      token = generateToken({ user: users.SECURITY_ADMIN });

      const url2 = `${BASE_URL}/update-user/${users.SUPER_ADMIN._id}`;

      const update = {
        bio: 'this is a new bio',
        profilePicture: 'somePath.jpeg',
        firstName: 'newFirst',
        lastName: 'newLast',
        username: 'newUsername',
      };

      const { body, status } = await api
        .patch(url2)
        .set('Authorization', `Bearer ${token}`)
        .send(update);

      const { data, error } = body;

      expect(status).toBe(403);

      expect(data).toBeUndefined();

      expect(error.message).toBe('Access denied');
    });

    describe('Phone number', () => {
      it('should reject registration if phone number is too short', async () => {
        const { body, status } = await api
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send({ phoneNumber: ' ' });

        const { data, error } = body;

        expect(status).toBe(400);

        expect(data).toBeUndefined();

        expect(error.payload).toMatchObject({
          phoneNumber: expect.objectContaining({
            reasons: expect.arrayContaining(['Too short']),
            metadata: expect.objectContaining({ minLength: 5, maxLength: 16 }),
          }),
        });
      });

      it('should reject registration if phone number is too long', async () => {
        const { body, status } = await api
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send({ phoneNumber: Array(17).fill('4').join('') });

        const { data, error } = body;

        expect(status).toBe(400);

        expect(data).toBeUndefined();

        expect(error.payload).toMatchObject({
          phoneNumber: expect.objectContaining({
            reasons: expect.arrayContaining(['Too long']),
            metadata: expect.objectContaining({ minLength: 5, maxLength: 16 }),
          }),
        });
      });

      it('should reject registration if phone number is of invalid format', async () => {
        const { body, status } = await api
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send({ phoneNumber: '+46 677 123 456' });

        const { data, error } = body;

        expect(status).toBe(400);

        expect(data).toBeUndefined();

        expect(error.payload).toMatchObject({
          phoneNumber: expect.objectContaining({
            reasons: expect.arrayContaining(['Invalid phone format']),
          }),
        });
      });

      it('should reject registration if phone number is taken', async () => {
        const { body, status } = await api
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send({ phoneNumber: users.SECURITY_ADMIN.phoneNumber });

        const { data, error } = body;

        expect(status).toBe(400);

        expect(data).toBeUndefined();

        expect(error.payload).toMatchObject({
          phoneNumber: expect.objectContaining({
            reasons: expect.arrayContaining(['Phone number already taken']),
          }),
        });
      });
    });
  });
});
