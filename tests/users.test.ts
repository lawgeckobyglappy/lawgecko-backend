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

import { makeServer } from '../src/app';
import {
  loginLinkRepository,
  userRepository,
} from '../src/modules/auth/repositories';

import { cleanupDp } from './_utils';
import { expectAuthError, generateToken } from './_utils/auth';
import { addUsers, users } from './_utils/users';
import { UserRoles } from '../src/shared/types';

const { SECURITY_ADMIN, USER } = UserRoles;

let api: request.SuperTest<request.Test>, server: any;

const BASE_URL = '/api/v1/auth';
const REQUEST_LOGIN_LINK_URL = `${BASE_URL}/request-login-link`;

makeServer;

describe('Auth', () => {
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

  describe('POST /auth/register', () => {
    const url = `${BASE_URL}/register`;

    it('should allow users to register if correct infomation is provided', async () => {
      const { body, status } = await api.post(url).send({
        email: '1@1.com ',
        firstName: ' test',
        lastName: 'user',
        username: 'test-user',
        accountStatus: 'blocked',
        role: 'admin',
        phoneNumber: '+46 70 712 34 26',
      });

      const { data, error } = body;

      expect(status).toBe(201);

      expect(error).toBeUndefined();

      expect(data).toMatchObject({
        email: '1@1.com',
        firstName: 'test',
        lastName: 'user',
        username: 'test-user',
        accountStatus: 'active',
        role: 'user',
      });
    });

    it('should reject registration if invalid data is provided', async () => {
      const { body, status } = await api.post(url).send({
        email: ' ',
        firstName: '  ',
        lastName: ' ',
        username: ' ',
      });

      const { data, error } = body;

      expect(status).toBe(400);

      expect(data).toBeUndefined();

      expect(error.payload).toMatchObject({
        email: expect.objectContaining({
          reasons: expect.arrayContaining(['Invalid email']),
        }),
        firstName: expect.objectContaining({
          reasons: expect.arrayContaining(['Invalid first name']),
        }),
        lastName: expect.objectContaining({
          reasons: expect.arrayContaining(['Invalid last name']),
        }),
        username: expect.objectContaining({
          reasons: expect.arrayContaining(['Invalid username']),
        }),
      });
    });

    it('should reject registration if email or user name provided are already taken', async () => {
      const existingUser = users.ACTIVE_USER;

      const { body, status } = await api.post(url).send({
        email: existingUser.email,
        firstName: ' test',
        lastName: 'user',
        username: existingUser.username,
      });

      const { data, error } = body;

      expect(status).toBe(400);

      expect(data).toBeUndefined();

      expect(error.payload).toMatchObject({
        email: expect.objectContaining({
          reasons: expect.arrayContaining(['Email already taken']),
        }),
        username: expect.objectContaining({
          reasons: expect.arrayContaining(['Username already taken']),
        }),
      });
    });

    describe('Phone number', () => {
      it('should reject registration if phone number is too short', async () => {
        const { body, status } = await api.post(url).send({ phoneNumber: ' ' });

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
          .post(url)
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

      it('should reject registration if phone number is taken', async () => {
        const { body, status } = await api
          .post(url)
          .send({ phoneNumber: users.ACTIVE_USER.phoneNumber });

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

  describe('POST /auth/security-admin', () => {
    let token = '';

    const url = `${BASE_URL}/security-admin`;

    it('should allow Super Admins to create Security Admins if correct information is provided', async () => {
      token = generateToken({ user: users.SUPER_ADMIN });

      const input = {
        email: 'secadmin1@gmail.com',
        firstName: 'John Doe',
        lastName: 'John Doe',
        username: 'john-sys',
        phoneNumber: '+1 2813450560',
        governmentID: 'http://cdn.com/somewhere.png',
      };

      const { body, status } = await api
        .post(url)
        .set('Authorization', `Bearer ${token}`)
        .send(input);

      const { data, error } = body;

      expect(status).toBe(200);

      expect(error).toBeUndefined();

      expect(data).toMatchObject({
        ...input,
        phoneNumber: '+1 281-345-0560',
        profilePicture: '',
        bio: '',
        role: SECURITY_ADMIN,
      });
    });

    it('should not allow Security Admins to create Security Admins', async () => {
      token = generateToken({ user: users.SECURITY_ADMIN });

      const { body, status } = await api
        .post(url)
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'secadmin1@gmail.com',
          firstName: 'John Doe',
          lastName: 'John Doe',
          username: 'john-sys',
          phoneNumber: '+1 2813450560',
          governmentID: 'somewhere.png',
        });

      const { data, error } = body;

      expect(status).toBe(403);

      expect(error.message).toMatchObject('Access denied');

      expect(data).toBeUndefined();
    });

    it('should not allow users to create Security Admins', async () => {
      token = generateToken({ user: users.ACTIVE_USER });

      const { body, status } = await api
        .post(url)
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'sysadmin1@gmail.com',
          firstName: 'John Doe',
          lastName: 'John Doe',
          username: 'john-sys',
          phoneNumber: '+1 2813450560',
          governmentID: 'somewhere.png',
        });

      const { data, error } = body;

      expect(status).toBe(403);

      expect(error.message).toMatchObject('Access denied');

      expect(data).toBeUndefined();
    });
  });

  describe('POST /auth/request-login-link', () => {
    it('should reject if invalid email is provided', async () => {
      const { body, status } = await api
        .post(REQUEST_LOGIN_LINK_URL)
        .send({ email: ' ' });

      const { data, error } = body;

      expect(status).toBe(400);

      expect(data).toBeUndefined();

      expect(error.message).toBe('Invalid email');
    });

    it('should respond with positive message when email is valid even if user does not exist', async () => {
      const emails = [users.ACTIVE_USER.email, '1@1.com'];

      for (const email of emails) {
        const { body, status } = await api
          .post(REQUEST_LOGIN_LINK_URL)
          .send({ email });

        const { data, error } = body;

        expect(status).toBe(200);

        expect(error).toBeUndefined();

        expect(data).toBe('Success');
      }
    });
  });

  describe('POST /auth/verify-login-link', () => {
    it('should reject if invalid link id is provided', async () => {
      const { body, status } = await verifyLoginLink({ id: ' ' });

      const { data, error } = body;

      expect(status).toBe(400);

      expect(data).toBeUndefined();

      expect(error.message).toBe('Invalid link');
    });

    it('should reject with "Authentication failed" error if owner of link is not active', async () => {
      const ids = ['2', '3'];

      for (const _id of ids) {
        await loginLinkRepository.insertOne({ _id, userId: _id } as any);

        const { body, status } = await verifyLoginLink({ id: _id });

        const { data, error } = body;

        expect(status).toBe(401);

        expect(data).toBeUndefined();

        expect(error.message).toBe('Authentication failed');
      }
    });

    it('should return the accessToken if the link id is valid and the owner is active', async () => {
      const _id = 'valid-link-id';

      await loginLinkRepository.insertOne({
        _id,
        userId: users.ACTIVE_USER._id,
      } as any);

      const { body, status } = await verifyLoginLink({ id: _id });

      const { data, error } = body;

      expect(status).toBe(200);

      expect(error).toBeUndefined();

      expect(typeof data).toBe('string');
    });
  });

  describe('GET /auth/current-user', () => {
    const user = users.ACTIVE_USER,
      url = `${BASE_URL}/current-user`,
      token = generateToken({ user });

    expectAuthError({
      description:
        'should reject with "Authentication failed" if no token is provided',
      errorCode: 401,
      errorMessage: 'Authentication failed',
      method: 'get',
      role: '',
      url,
    });

    it('should reject with "Authentication failed" error if user is not active', async () => {
      const statusToReject = ['blocked', 'deleted'];

      for (const accountStatus of statusToReject) {
        await userRepository.updateOne({ _id: user._id }, {
          accountStatus,
        } as any);

        const { body, status } = await api
          .get(url)
          .set('Authorization', `Bearer ${token}`);

        const { data, error } = body;

        expect(status).toBe(401);

        expect(data).toBeUndefined();

        expect(error.message).toBe('Authentication failed');
      }
    });

    it('should return user info if valid token is provided', async () => {
      const { body, status } = await api
        .get(url)
        .set('Authorization', `Bearer ${token}`);

      const { data, error } = body;

      expect(status).toBe(200);

      expect(error).toBeUndefined();

      expect(data).toMatchObject(user);
    });
  });

  describe('PATCH /auth/update-user', () => {
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

  function verifyLoginLink(requestBody: any) {
    return api.post(`${BASE_URL}/verify-login-link`).send(requestBody);
  }
});
