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
import {
  loginLinkRepository,
  userRepository,
} from '../../src/modules/accounts/repositories';

import { cleanupDp } from '../_utils';
import { expectAuthError, generateToken } from '../_utils/auth';
import { addUsers, users } from '../_utils/users';
import { UserAccountStatus, UserRoles } from '../../src/shared/types';

const { SECURITY_ADMIN } = UserRoles;

let api: request.SuperTest<request.Test>, server: any;

const BASE_URL = '/api/v1/accounts';
const REQUEST_LOGIN_LINK_URL = `${BASE_URL}/request-login-link`;

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

  describe('POST /accounts/register', () => {
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
        accountStatus: UserAccountStatus.ACTIVE,
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

  describe('POST /accounts/request-login-link', () => {
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

  describe('POST /accounts/verify-login-link', () => {
    it('should reject if invalid link id is provided', async () => {
      const { body, status } = await verifyLoginLink({ id: ' ' });

      const { data, error } = body;

      expect(status).toBe(400);

      expect(data).toBeUndefined();

      expect(error.message).toBe('Invalid link');
    });

    it('should reject with "Authentication failed" error if owner of link is not active', async () => {
      const ids = [users.BLOCKED_USER._id, users.DELETED_USER._id];

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

  describe('GET /accounts/current-user', () => {
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

  describe('POST /accounts/security-admin', () => {
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
        address: {
          city: 'Boston',
          country: 'US',
          street: 'North Main St',
        },
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

  function verifyLoginLink(requestBody: any) {
    return api.post(`${BASE_URL}/verify-login-link`).send(requestBody);
  }
});
