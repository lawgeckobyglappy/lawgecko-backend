import { userRepository } from '../../src/modules/auth/repositories';
import { User } from '../../src/shared/types';

export { users, addUsers };

const users = [
	{
		_id: '1',
		email: 'john@mail.com',
		firstName: 'John',
		accountStatus: 'active',
		lastName: 'Doe',
		username: 'john-d',
		role: 'user',
	},
	{
		_id: '2',
		email: 'blocked@mail.com',
		firstName: 'Blocked',
		accountStatus: 'blocked',
		lastName: 'User',
		username: 'blocked-user',
		role: 'user',
	},
	{
		_id: '3',
		email: 'deleted@mail.com',
		firstName: 'Deleted',
		accountStatus: 'deleted',
		lastName: 'User',
		username: 'deleted-user',
		role: 'user',
	},
] as User[];

function addUsers() {
	return userRepository.insertMany(users);
}
