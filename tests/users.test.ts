import request from 'supertest';
import { cleanupDp } from './_utils';
import { addUsers, users } from './_utils/auth/users';

let api: request.SuperTest<request.Test>, server: any;

const BASE_URL = '/api/v1/auth';

describe('users', () => {
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
		const url = `${BASE_URL}/request-login-link`;

		it('should reject if invalid email is provided', async () => {
			const { body, status } = await api.post(url).send({
				email: ' ',
			});

			const { data, error } = body;

			expect(status).toBe(400);

			expect(data).toBeUndefined();

			expect(error.message).toBe('Invalid email');
		});

		it('should respond with positive message when email is valid', async () => {
			const emails = [users[0].email, '1@1.com'];

			for (const email of emails) {
				const { body, status } = await api.post(url).send({
					email,
				});

				const { data, error } = body;

				expect(status).toBe(200);

				expect(error).toBeUndefined();

				expect(data).toBe('Success');
			}
		});
	});
});
