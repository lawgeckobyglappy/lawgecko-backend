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

import { cleanupDp } from '../_utils';
import { addUsers, users } from '../_utils/users';
import { expectAuthError, generateToken } from '../_utils/auth';
import { SecurityAdminInvitationRepo } from '../../src/modules/accounts/repositories/security-admin-invitation';

let api: request.SuperTest<request.Test>, server: any;

const BASE_URL = '/api/v1/accounts/security-admins';

const urls = {
  invite: `${BASE_URL}/invite`,
  resend: `${BASE_URL}/resend`,
};

describe('Security Admins', () => {
  let token = '';
  const superAdmin = users.SUPER_ADMIN;

  beforeAll(() => {
    server = makeServer();
    api = request(server);
  });

  afterAll(async () => {
    await server?.close();
  });

  beforeEach(async () => {
    await addUsers();
    token = generateToken({ user: superAdmin });
  });

  afterEach(async () => await cleanupDp());

  describe('DELETE /accounts/security-admins/:id', () => {
    let invitationIds: string[] = [];
    const url = BASE_URL;

    beforeEach(async () => {
      invitationIds = [];

      const res = await api
        .post(urls.invite)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'test@mail.com', name: 'test user' });

      const res1 = await api
        .post(urls.invite)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'test-1@mail.com', name: 'test user 2' });

      invitationIds.push(res.body.data._id);
      invitationIds.push(res1.body.data._id);
    });

    expectAuthError({
      description: 'should reject with if no token is provided',
      errorCode: 401,
      errorMessage: 'Authentication failed',
      method: 'delete',
      role: '',
      url: `${url}/1`,
    });

    for (const user of [users.ACTIVE_USER, users.SECURITY_ADMIN])
      expectAuthError({
        description: 'should reject if current user is not Super Admin',
        errorCode: 403,
        errorMessage: 'Access denied',
        method: 'delete',
        user,
        url: `${url}/1`,
      });

    it('should reject if invitation does not exist', async () => {
      const { body, status } = await api
        .delete(`${url}/1`)
        .set('Authorization', `Bearer ${token}`)
        .send();

      const { data, error } = body;

      expect(status).toBe(404);

      expect(data).toBeUndefined();
      expect(error.message).toBe('Invitation not found');
    });

    it('should delete invitation if it exists', async () => {
      for (const id of invitationIds) {
        const { body, status } = await api
          .delete(`${url}/${id}`)
          .set('Authorization', `Bearer ${token}`)
          .send();

        const { data, error } = body;

        expect(status).toBe(200);

        expect(error).toBeUndefined();
        expect(data).toBeDefined();
      }

      const invitations = await SecurityAdminInvitationRepo.find();

      expect(invitations.length).toBe(0);
    });
  });

  describe('GET /accounts/security-admins', () => {
    let invitationTokens: string[] = [];
    const url = BASE_URL;

    beforeEach(async () => {
      await api
        .post(urls.invite)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'test@mail.com', name: 'test user' });

      await api
        .post(urls.invite)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'test-1@mail.com', name: 'test user 2' });

      invitationTokens = (await SecurityAdminInvitationRepo.find()).map(
        (i) => i.token,
      );
    });

    describe('Get by token /accounts/security-admins/:token', () => {
      it('should return invitation by token without token', async () => {
        for (const t of invitationTokens) {
          const { body, status } = await api
            .get(`${url}/${t}`)
            .set('Authorization', `Bearer ${token}`)
            .send();

          const { data, error } = body;

          expect(status).toBe(200);

          expect(error).toBeUndefined();
          expect(data).toBeDefined();
          expect(data.token).toBeUndefined();
        }
      });

      it('should return null if invitation does not exist', async () => {
        const { body, status } = await api
          .get(`${url}/1`)
          .set('Authorization', `Bearer ${token}`)
          .send();

        const { data, error } = body;

        expect(status).toBe(200);

        expect(data).toBeNull();
        expect(error).toBeUndefined();
      });
    });

    describe('Get many', () => {
      expectAuthError({
        description: 'should reject with if no token is provided',
        errorCode: 401,
        errorMessage: 'Authentication failed',
        method: 'get',
        role: '',
        url,
      });

      for (const user of [users.ACTIVE_USER, users.SECURITY_ADMIN])
        expectAuthError({
          description: 'should reject if current user is not Super Admin',
          errorCode: 403,
          errorMessage: 'Access denied',
          method: 'get',
          user,
          url,
        });

      it('should return all invitations without tokens to super admins', async () => {
        const { body, status } = await api
          .get(url)
          .set('Authorization', `Bearer ${token}`)
          .send();

        const { data, error } = body;

        expect(status).toBe(200);

        expect(error).toBeUndefined();
        expect(data.length).toBe(2);

        for (const invitation of data) expect(invitation.token).toBeUndefined();
      });
    });
  });

  describe('PATCH /accounts/security-admins', () => {
    const url = urls.resend;

    it('should return null if invitation does not exist', async () => {
      const { body, status } = await api
        .patch(`${url}/1`)
        .set('Authorization', `Bearer ${token}`)
        .send();

      const { data, error } = body;

      expect(status).toBe(400);

      expect(data).toBeUndefined();
      expect(error).toMatchObject({ message: 'Invitation not found' });
    });

    describe('Resend /accounts/security-admins/resend:id', () => {
      expectAuthError({
        description: 'should reject with if no token is provided',
        errorCode: 401,
        errorMessage: 'Authentication failed',
        method: 'patch',
        role: '',
        url: `${url}/1`,
      });

      for (const user of [users.ACTIVE_USER, users.SECURITY_ADMIN])
        expectAuthError({
          description: 'should reject if current user is not Super Admin',
          errorCode: 403,
          errorMessage: 'Access denied',
          method: 'patch',
          user,
          url: `${url}/1`,
        });

      it('should resend invitation if requested by the super admin', async () => {
        // create valid invitation
        const res = await api
          .post(urls.invite)
          .set('Authorization', `Bearer ${token}`)
          .send({ email: 'test@mail.com', name: 'test user' });

        const { body, status } = await api
          .patch(`${url}/${res.body.data._id}`)
          .set('Authorization', `Bearer ${token}`)
          .send();

        const { data, error } = body;

        expect(status).toBe(200);

        expect(error).toBeUndefined();
        expect(data).toBeDefined();
      });
    });
  });

  describe('POST /accounts/security-admins', () => {
    const url = urls.invite;

    expectAuthError({
      description: 'should reject with if no token is provided',
      errorCode: 401,
      errorMessage: 'Authentication failed',
      method: 'post',
      role: '',
      url,
    });

    for (const user of [users.ACTIVE_USER, users.SECURITY_ADMIN])
      expectAuthError({
        description: 'should reject if current user is not Super Admin',
        errorCode: 403,
        errorMessage: 'Access denied',
        method: 'post',
        user,
        url,
      });

    it('should reject if invitation with an email already exist', async () => {
      await api
        .post(urls.invite)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'test@mail.com', name: 'test user' });

      const { body, status } = await api
        .post(url)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'test@mail.com', name: 'test user 1' });

      const { data, error } = body;

      expect(status).toBe(400);
      expect(data).toBeUndefined();

      expect(error).toMatchObject({
        message: 'VALIDATION_ERROR',
        payload: expect.objectContaining({
          email: expect.objectContaining({
            reasons: expect.arrayContaining(['Invitation already sent']),
          }),
        }),
      });
    });

    it('should reject invitation if incorrect infomation is provided', async () => {
      const { body, status } = await api
        .post(url)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: '', name: '' });

      const { data, error } = body;

      expect(status).toBe(400);
      expect(data).toBeUndefined();

      expect(error).toMatchObject({
        message: 'VALIDATION_ERROR',
        payload: expect.objectContaining({
          email: expect.objectContaining({
            reasons: expect.arrayContaining(['Invalid email']),
          }),
          name: expect.objectContaining({
            reasons: expect.arrayContaining(['Invalid name']),
            metadata: { maxLength: 50, minLength: 5 },
          }),
        }),
      });
    });

    it('should allow invitation if correct infomation is provided', async () => {
      const { body, status } = await api
        .post(url)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'test@mail.com', name: 'test user' });

      const { data, error } = body;

      expect(status).toBe(201);
      expect(error).toBeUndefined();

      expect(data.token).toBeUndefined();
      expect(data).toMatchObject({
        approvedAt: null,
        approvedBy: null,
        createdBy: superAdmin._id,
        details: null,
        email: 'test@mail.com',
        name: 'test user',
      });
    });
  });
});
