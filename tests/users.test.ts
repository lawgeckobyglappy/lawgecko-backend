import request from 'supertest';
import { cleanupDp } from './_utils';
import { addUsers, users } from './_utils/users';
import {
	loginLinkRepository,
	userRepository,
} from '../src/modules/auth/repositories';
import { expectAuthError } from './_utils/auth';

let api: request.SuperTest<request.Test>, server: any;

const BASE_URL = '/api/v1/auth';
const REQUEST_LOGIN_LINK_URL = `${BASE_URL}/request-login-link`;

describe('Auth', () => {
	beforeAll(() => {
		jest.isolateModules(async () => {
			server = (await import('../src/server')).server;
			api = request(server);
		});
	});

	afterAll(async () => {
		await server?.close();

		jest.resetModules();
	});

	beforeEach(async () => await addUsers());

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
				email: expect.arrayContaining(['Invalid email']),
				firstName: expect.arrayContaining(['Invalid first name']),
				lastName: expect.arrayContaining(['Invalid last name']),
				username: expect.arrayContaining(['Invalid username']),
			});
		});

		it('should reject registration if email or user name provided are already taken', async () => {
			const existingUser = users[0];

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
				email: expect.arrayContaining(['Email already taken']),
				username: expect.arrayContaining(['Username already taken']),
			});
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
			const emails = [users[0].email, '1@1.com'];

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

			await loginLinkRepository.insertOne({ _id, userId: users[0]._id } as any);

			const { body, status } = await verifyLoginLink({ id: _id });

			const { data, error } = body;

			expect(status).toBe(200);

			expect(error).toBeUndefined();

			expect(typeof data).toBe('string');
		});
	});

	describe('GET /auth/current-user', () => {
		const linkId = 'valid-link-id',
			user = users[0],
			url = `${BASE_URL}/current-user`;

		beforeEach(async () => {
			return loginLinkRepository.insertOne({
				_id: linkId,
				userId: user._id,
			} as any);
		});

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

			const {
				body: { data: token },
			} = await verifyLoginLink({ id: linkId });

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
			const {
				body: { data: token },
			} = await verifyLoginLink({ id: linkId });

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

		const linkId = 'valid-link-id',
			user = users[0],
			url = `${BASE_URL}/update-user/${user._id}`;

		beforeEach(async () => {
			await loginLinkRepository.insertOne({
				_id: linkId,
				userId: user._id,
			} as any);

			const {
				body: { data },
			} = await verifyLoginLink({ id: linkId });

			token = data;
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

		it('should reject with "Access denied" error if user is not ower of accout and is not admin', async () => {
			const linkId = 'new-link';

			await loginLinkRepository.insertOne({
				_id: linkId,
				userId: users[3]._id,
			} as any);

			const {
				body: { data: token },
			} = await verifyLoginLink({ id: linkId });

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

		it('should update other users if valid data is provided', async () => {
			const update = { firstName: 'Update', username: 'updated-username' };

			const { body, status } = await api
				.patch(url)
				.set('Authorization', `Bearer ${token}`)
				.send(update);

			const { data, error } = body;

			expect(status).toBe(200);

			expect(error).toBeUndefined();

			expect(data).toMatchObject(update);
		});

		it('should return corresponding errors if invalid data is provided', async () => {
			const update = { firstName: '', email: users[4].email, username: '' };

			const { body, status } = await api
				.patch(url)
				.set('Authorization', `Bearer ${token}`)
				.send(update);

			const { data, error } = body;

			expect(status).toBe(400);

			expect(data).toBeUndefined();

			expect(error.message).toBe('Validation Error');
			expect(error.payload).toMatchObject({
				firstName: expect.arrayContaining(['Invalid first name']),
				email: expect.arrayContaining(['Email already taken']),
				username: expect.arrayContaining(['Invalid username']),
			});
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

		it('should allow admins to update other users if is admin', async () => {
			const linkId = 'new-link';

			await loginLinkRepository.insertOne({
				_id: linkId,
				userId: users[4]._id,
			} as any);

			const {
				body: { data: token },
			} = await verifyLoginLink({ id: linkId });

			const update = { firstName: 'Update', accountStatus: 'blocked' };

			const { body, status } = await api
				.patch(url)
				.set('Authorization', `Bearer ${token}`)
				.send(update);

			const { data, error } = body;

			expect(status).toBe(200);

			expect(error).toBeUndefined();

			expect(data).toMatchObject(update);
		});

		it("should allow admins to update other users' account statuses", async () => {
			const linkId = 'new-link';

			await loginLinkRepository.insertOne({
				_id: linkId,
				userId: users[4]._id,
			} as any);

			const {
				body: { data: token },
			} = await verifyLoginLink({ id: linkId });

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

		it("should allow admins to update other users' roles", async () => {
			const linkId = 'new-link';

			await loginLinkRepository.insertOne({
				_id: linkId,
				userId: users[4]._id,
			} as any);

			const {
				body: { data: token },
			} = await verifyLoginLink({ id: linkId });

			const validRoles = ['admin', 'moderator', 'user'];

			for (const role of validRoles) {
				const update = { role };

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
	});

	function verifyLoginLink(requestBody: any) {
		return api.post(`${BASE_URL}/verify-login-link`).send(requestBody);
	}
});
