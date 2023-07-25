import { userRepository } from '../../../src/modules/auth/repositories';
import { User } from '../../../src/shared/types';

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
] as User[];

function addUsers() {
	return userRepository.insertMany(users);
}
