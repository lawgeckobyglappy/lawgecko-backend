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

import { cleanupDp, cleanupTemporaryFileUploadDirectory } from '../_utils';
import { addUsers, users } from '../_utils/users';
import { expectAuthError, generateToken } from '../_utils/auth';
import { SecurityAdminInvitationRepo } from '../../src/modules/accounts/repositories/security-admin-invitation';
import { set } from 'mongoose';
import { userRepository } from '../../src/modules/accounts/repositories';

let api: request.SuperTest<request.Test>, server: any;

const BASE_URL = '/api/v1/accounts/security-admins/invitations';

const urls = {
  invite: `${BASE_URL}`,
  resend: (id: string) => `${BASE_URL}/${id}/resend`,
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

  afterEach(async () => {
    cleanupTemporaryFileUploadDirectory();
    await cleanupDp();
  });

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
    it('should return null if invitation does not exist', async () => {
      const { body, status } = await api
        .patch(urls.resend('1'))
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
        url: urls.resend('1'),
      });

      for (const user of [users.ACTIVE_USER, users.SECURITY_ADMIN])
        expectAuthError({
          description: 'should reject if current user is not Super Admin',
          errorCode: 403,
          errorMessage: 'Access denied',
          method: 'patch',
          user,
          url: urls.resend('1'),
        });

      it('should resend invitation if requested by the super admin', async () => {
        // create valid invitation
        const res = await api
          .post(urls.invite)
          .set('Authorization', `Bearer ${token}`)
          .send({ email: 'test@mail.com', name: 'test user' });

        const { body, status } = await api
          .patch(urls.resend(res.body.data._id))
          .set('Authorization', `Bearer ${token}`)
          .send();

        const { data, error } = body;

        expect(status).toBe(200);

        expect(error).toBeUndefined();
        expect(data).toBeDefined();
      });
    });

    describe('SetDetails /accounts/security-admins/invitations/:token', () => {
      let setUrl = '';
      let invitation;
      beforeEach(async () => {
        const { body } = await api
          .post(urls.invite)
          .set('Authorization', `Bearer ${token}`)
          .send({ email: 'test@mail.com', name: 'test user' });
        const { data } = body;

        invitation = await SecurityAdminInvitationRepo.findById(data._id);

        setUrl = `${BASE_URL}/${invitation.token}`;
      });

      it('should accept details if correct information is given', async () => {
        const { body, status } = await api
          .patch(setUrl)
          .field(
            'address',
            '{"city": "Bikini Bottom", "country": "CA", "street": "1234 SomeStreet"}',
          )
          .field('bio', 'I am a test Security Admin')
          .field('firstName', 'Spongebob')
          .field('lastName', 'Squarepants')
          .field('phoneNumber', '+46 70 712 34 26')
          .attach('governmentID', './tests/assets/spongeGovID.png')
          .attach('profilePicture', './tests/assets/spongeGovID.png')
          .set('Content-Type', 'multipart/form-data');

        const { data, error } = body;

        expect(status).toBe(200);

        expect(data.details).toMatchObject({ firstName: 'Spongebob' });

        expect(error).toBeUndefined();
      });

      it('should not accept details if file size is greater than 5MB', async () => {
        const { body, status } = await api
          .patch(setUrl)
          .field(
            'address',
            '{"city": "Bikini Bottom", "country": "CA", "street": "1234 SomeStreet"}',
          )
          .field('bio', 'I am a test Security Admin')
          .field('firstName', 'Spongebob')
          .field('lastName', 'Squarepants')
          .field('phoneNumber', '+46 70 712 34 26')
          .attach('governmentID', './tests/assets/spongeGovID.png')
          .attach('profilePicture', './tests/assets/largePhoto.jpg') // This photo is 10.2MB
          .set('Content-Type', 'multipart/form-data');

        const { data, error } = body;

        expect(error.statusCode).toBe(400);

        // Not a good match
        expect(data).toBeUndefined();

        expect(error.payload.profilePicture.reasons[0]).toMatchObject(
          'Maximum File Size Exceeded',
        );
      });

      it('should not accept details if extension is invalid', async () => {
        const { body, status } = await api
          .patch(setUrl)
          .field(
            'address',
            '{"city": "Bikini Bottom", "country": "CA", "street": "1234 SomeStreet"}',
          )
          .field('bio', 'I am a test Security Admin')
          .field('firstName', 'Spongebob')
          .field('lastName', 'Squarepants')
          .field('phoneNumber', '+46 70 712 34 26')
          .attach('governmentID', './tests/assets/spongeGovID.png')
          .attach('profilePicture', './tests/assets/dummy.pdf') // This photo is 10.2MB
          .set('Content-Type', 'multipart/form-data');

        const { data, error } = body;

        expect(error.statusCode).toBe(400);

        // Not a good match
        expect(data).toBeUndefined();

        expect(error.payload.profilePicture.reasons[0]).toMatchObject(
          'Wrong Extension',
        );
      });
    });

    describe('RequestChanges /accounts/security-admins/invitations/:id/request-changes', () => {
      let url = '';
      let invitation;
      beforeEach(async () => {
        const {
          body: { data },
        } = await api
          .post(urls.invite)
          .set('Authorization', `Bearer ${token}`)
          .send({ email: 'test@mail.com', name: 'test user' });

        invitation = data;

        url = `${BASE_URL}/${invitation._id}/request-changes`;
      });

      it('should accept request changes if correct information is provided', async () => {
        await SecurityAdminInvitationRepo.updateOne({ _id: invitation._id }, {
          details: { firstName: 'first', lastName: 'last' },
        } as any);

        const { body, status } = await api
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send({
            bio: 'Inappropriate bio, please change!',
            something: 'Just change anything, please!!!!',
          });

        const { data, error } = body;

        expect(status).toBe(200);

        expect(error).toBeUndefined();

        expect(data.changesRequested).toMatchObject({
          bio: 'Inappropriate bio, please change!',
        });

        expect(data.changesRequested.something).toBeUndefined();
      });

      it('should not accept request changes if the invitation does not have details', async () => {
        const { body, status } = await api
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send({
            bio: 'Inappropriate bio, please change!',
            something: 'Just change anything, please!!!!',
          });

        const { data, error } = body;

        expect(status).toBe(400);

        expect(data).toBeUndefined();

        expect(error.payload.changesRequested.reasons[0]).toBe(
          'validation failed',
        );
      });

      it('should not accept request changes if changesRequested is an empty object', async () => {
        const { body, status } = await api
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send('');

        const { data, error } = body;

        expect(status).toBe(400);

        expect(data).toBeUndefined();

        expect(error.message).toBe('VALIDATION_ERROR');
      });

      it('should not accept request changes if the invitation is not found', async () => {
        const { body, status } = await api
          .patch(`${BASE_URL}/1/request-changes`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            bio: 'Inappropriate bio, please change!',
            something: 'Just change anything, please!!!!',
          });

        const { data, error } = body;

        expect(status).toBe(404);

        expect(data).toBeUndefined();

        expect(error.message).toBe('Invitation not found');
      });

      it('should not accept request changes if the user is not a super admin', async () => {
        const otherToken = generateToken({ user: users.ACTIVE_USER });
        const { body, status } = await api
          .patch(url)
          .set('Authorization', `Bearer ${otherToken}`)
          .send({
            bio: 'Inappropriate bio, please change!',
            something: 'Just change anything, please!!!!',
          });

        const { data, error } = body;

        expect(status).toBe(403);

        expect(data).toBeUndefined();

        expect(error.message).toBe('Access denied');
      });
    });

    describe('ApproveDetails /accounts/security-admins/invitations/:id/approve', () => {
      let url = '';
      let invitation;

      beforeEach(async () => {
        const {
          body: { data },
        } = await api
          .post(urls.invite)
          .set('Authorization', `Bearer ${token}`)
          .send({ email: 'test@mail.com', name: 'test user' });

        invitation = await SecurityAdminInvitationRepo.findById(data._id);
        url = `${BASE_URL}/${invitation._id}/approve`;
      });

      it('is a test', async () => {
        const { body, status } = await api.patch(url);
        const { data, error } = body;
        console.log(data, error);
      });

      it('should reject with if no token is provided', async () => {
        expectAuthError({
          description: 'should reject with if no token is provided',
          errorCode: 401,
          errorMessage: 'Authentication failed',
          method: 'patch',
          role: '',
          url,
        });
      });

      it("should contain the Security Admin's email provided in the Database", async () => {
        const setUrl = `${BASE_URL}/${invitation.token}`;
        await api
          .patch(setUrl)
          .field(
            'address',
            '{"city": "Bikini Bottom", "country": "CA", "street": "1234 SomeStreet"}',
          )
          .field('bio', 'I am a test Security Admin')
          .field('firstName', 'Spongebob')
          .field('lastName', 'Squarepants')
          .field('phoneNumber', '+46 70 712 34 26')
          .attach('governmentID', './tests/assets/spongeGovID.png')
          .attach('profilePicture', './tests/assets/spongeGovID.png')
          .set('Content-Type', 'multipart/form-data');

        await api.patch(url).set('Authorization', `Bearer ${token}`).send({
          email: 'test@mail.com',
          password: 'sponge123',
        });

        const user = await userRepository.findOne({ email: 'test@mail.com' });

        expect(user?.email).toMatch('test@mail.com');
      });

      it('should not accept the approval if details are empty', async () => {
        const { body, status } = await api
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send({
            email: 'test@mail.com',
            password: 'sponge123',
          });

        const { data, error } = body;
        console.log(data, error);
        expect(status).toBe(400);

        expect(data).toBeUndefined();

        expect(error.message).toMatch('Incomplete user details');
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
        changesRequested: null,
        createdBy: superAdmin._id,
        details: null,
        email: 'test@mail.com',
        name: 'test user',
      });
    });
  });
});
