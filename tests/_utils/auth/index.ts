import request from 'supertest';
import { User, UserRole } from '../../../src/shared/types';
import { createToken } from '../../../src/modules/auth/utils';

let api: request.SuperTest<request.Test>, server: any;

export { expectAuthError, generateToken, users };

type AuthConfig = {
	description: string;
	errorCode: 401 | 403;
	errorMessage: 'Access denied' | 'Authentication failed';
	method: 'delete' | 'get' | 'patch' | 'post';
	role?: '' | UserRole;
	url: string;
};

const users = [
	{
		_id: '1',
		email: 'john@mail.com',
		firstName: 'John',
		accountStatus: 'active',
		lastName: 'Doe',
		role: 'user',
	},
] as User[];

function generateToken({
	customId,
	role,
	user,
}: {
	role?: '' | UserRole;
	customId?: string;
	user?: User;
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
		beforeEach(async () => {
			server = (await import('../../../src/server')).server;
			api = request(server);
		});

		afterEach(async () => {
			server?.close();
		});

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
