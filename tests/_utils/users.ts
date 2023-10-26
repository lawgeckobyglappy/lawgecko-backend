import { UserAccountStatus } from '../../src/shared/types';
import { userRepository } from '../../src/modules/auth/repositories';
import { UserRoles } from '../../src/shared/types';
export { users, addUsers };

const { SECURITY_ADMIN, SUPER_ADMIN, USER } = UserRoles;
const { ACTIVE, BLOCKED, DELETED } = UserAccountStatus;

const assetLink = 'http://cdn.com/asset.png';
const address = {
  city: 'Boston',
  country: 'US',
  street: 'North Main St',
};

const users = {
  ACTIVE_USER: {
    _id: '1',
    accountStatus: ACTIVE,
    address: null,
    bio: '',
    email: 'john@mail.com',
    firstName: 'John',
    phoneNumber: '+46 70 712 34 51',
    lastName: 'Doe',
    username: 'john-d',
    role: USER,
  },
  ACTIVE_USER_1: {
    _id: '4',
    accountStatus: ACTIVE,
    address: null,
    bio: '',
    email: 'other-user@mail.com',
    firstName: 'Other',
    phoneNumber: '+46 70 712 34 54',
    lastName: 'User',
    username: 'other-user',
    role: USER,
  },
  BLOCKED_USER: {
    _id: '2',
    accountStatus: BLOCKED,
    address: null,
    bio: '',
    email: 'blocked@mail.com',
    firstName: 'Blocked',
    phoneNumber: '+46 70 712 34 52',
    lastName: 'User',
    username: 'blocked-user',
    role: USER,
  },
  DELETED_USER: {
    _id: '3',
    accountStatus: DELETED,
    address: null,
    bio: '',
    email: 'deleted@mail.com',
    firstName: 'Deleted',
    phoneNumber: '+46 70 712 34 53',
    lastName: 'User',
    username: 'deleted-user',
    role: USER,
  },
  SECURITY_ADMIN: {
    _id: '5',
    accountStatus: ACTIVE,
    address,
    bio: '',
    email: 'admin@mail.com',
    firstName: 'Admin',
    governmentID: assetLink,
    lastName: 'User',
    phoneNumber: '+46 70 712 34 55',
    profilePicture: assetLink,
    username: 'admin-user',
    role: SECURITY_ADMIN,
  },
  SECURITY_ADMIN_1: {
    _id: '363',
    accountStatus: ACTIVE,
    address,
    bio: '',
    email: 'admin-1@mail.com',
    firstName: 'Admin',
    governmentID: assetLink,
    lastName: 'User',
    phoneNumber: '+46 70 712 34 56',
    profilePicture: assetLink,
    username: 'admin-user-1',
    role: SECURITY_ADMIN,
  },
  SUPER_ADMIN: {
    _id: '999',
    accountStatus: ACTIVE,
    address,
    bio: '',
    email: 'sup-admin-1@mail.com',
    firstName: 'Admin',
    governmentID: assetLink,
    lastName: 'User',
    phoneNumber: '+46 70 712 34 57',
    profilePicture: assetLink,
    username: 'super-admin-user-1',
    role: SUPER_ADMIN,
  },
};

function addUsers() {
  return userRepository.insertMany(Object.values(users));
}
