import { User } from '../../src/shared/types';
import { userRepository } from '../../src/modules/auth/repositories';

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
  {
    _id: '4',
    email: 'other-user@mail.com',
    firstName: 'Other',
    accountStatus: 'active',
    lastName: 'User',
    username: 'other-user',
    role: 'user',
  },
  {
    _id: '5',
    email: 'admin@mail.com',
    firstName: 'Admin',
    accountStatus: 'active',
    lastName: 'User',
    username: 'admin-user',
    role: 'admin',
  },
  {
    _id: '363',
    email: 'admin-1@mail.com',
    firstName: 'Admin',
    accountStatus: 'active',
    lastName: 'User',
    username: 'admin-user-1',
    role: 'admin',
  },
] as User[];

function addUsers() {
  return userRepository.insertMany(users);
}
