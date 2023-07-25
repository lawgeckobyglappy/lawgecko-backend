import request from 'supertest';
import { cleanupDp } from './_utils';
import { addUsers, users } from './_utils/users';
import { loginLinkRepository } from '../src/modules/auth/repositories';

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
		const url = `${BASE_URL}/verify-login-link`;

		it('should reject if invalid link id is provided', async () => {
			const { body, status } = await api.post(url).send({ id: ' ' });

			const { data, error } = body;

			expect(status).toBe(400);

			expect(data).toBeUndefined();

			expect(error.message).toBe('Invalid link');
		});

		it('should reject with "Authentication failed" error if owner of link is not active', async () => {
			const ids = ['2', '3'];

			for (const _id of ids) {
				await loginLinkRepository.insertOne({ _id, userId: _id } as any);

				const { body, status } = await api.post(url).send({ id: _id });

				const { data, error } = body;

				expect(status).toBe(401);

				expect(data).toBeUndefined();

				expect(error.message).toBe('Authentication failed');
			}
		});

		it('should return the accessToken if the link id is valid and the owner is active', async () => {
			const _id = 'valid-link-id';

			await loginLinkRepository.insertOne({ _id, userId: users[0]._id } as any);

			const { body, status } = await api.post(url).send({ id: _id });

			const { data, error } = body;

			expect(status).toBe(200);

			expect(error).toBeUndefined();

			expect(typeof data).toBe('string');
		});
	});
});
