import { User } from '../../src/shared/types';
import { userRepository } from '../../src/modules/auth/repositories';
import { UserRoles } from '../../src/shared/types';
export { users, addUsers };

const { SECURITY_ADMIN, SUPER_ADMIN } = UserRoles;

const users = [
  {
    _id: '1',
    accountStatus: 'active',
    bio: '',
    email: 'john@mail.com',
    firstName: 'John',
    phoneNumber: '+46 70 712 34 51',
    lastName: 'Doe',
    username: 'john-d',
    role: 'user',
  },
  {
    _id: '2',
    accountStatus: 'blocked',
    bio: '',
    email: 'blocked@mail.com',
    firstName: 'Blocked',
    phoneNumber: '+46 70 712 34 52',
    lastName: 'User',
    username: 'blocked-user',
    role: 'user',
  },
  {
    _id: '3',
    accountStatus: 'deleted',
    bio: '',
    email: 'deleted@mail.com',
    firstName: 'Deleted',
    phoneNumber: '+46 70 712 34 53',
    lastName: 'User',
    username: 'deleted-user',
    role: 'user',
  },
  {
    _id: '4',
    accountStatus: 'active',
    bio: '',
    email: 'other-user@mail.com',
    firstName: 'Other',
    phoneNumber: '+46 70 712 34 54',
    lastName: 'User',
    username: 'other-user',
    role: 'user',
  },
  {
    _id: '5',
    accountStatus: 'active',
    bio: '',
    email: 'admin@mail.com',
    firstName: 'Admin',
    governmentID: 'govID.png',
    lastName: 'User',
    phoneNumber: '+46 70 712 34 55',
    profilePicture: 'profilePic.png',
    username: 'admin-user',
    role: SECURITY_ADMIN,
  },
  {
    _id: '363',
    accountStatus: 'active',
    bio: '',
    email: 'admin-1@mail.com',
    firstName: 'Admin',
    governmentID: 'govID.png',
    lastName: 'User',
    phoneNumber: '+46 70 712 34 56',
    profilePicture: 'profilePic.png',
    username: 'admin-user-1',
    role: SECURITY_ADMIN,
  },
  {
    _id: '999',
    accountStatus: 'active',
    bio: '',
    email: 'sup-admin-1@mail.com',
    firstName: 'Admin',
    governmentID: 'govID.png',
    lastName: 'User',
    phoneNumber: '+46 70 712 34 57',
    profilePicture: 'profilePic.png',
    username: 'super-admin-user-1',
    role: SUPER_ADMIN,
  },
] as User[];

function addUsers() {
  return userRepository.insertMany(users);
}
