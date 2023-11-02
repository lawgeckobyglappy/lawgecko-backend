export {
  UserAccountStatusList,
  AuthProvidersList,
  UserAccountStatus,
  UserRoles,
  UserRolesList,
};

export type {
  Address,
  AuthInfo,
  AuthInfoInput,
  AuthProvider,
  User,
  UserInput,
  IUserAccountStatus,
  UserRole,
  LoginLink,
  LoginLinkInput,
  LoginSession,
  LoginSessionInput,
};

type Address = {
  city: string;
  country: string;
  street: string;
};

type AuthInfoInput = {
  userId: string;
  userRole: UserRole;
  sessionId: string;
};

type AuthInfo = {
  user: { _id: string; role: UserRole };
  sessionId: string;
};

const UserAccountStatus = {
  ACTIVE: 'active',
  BLOCKED: 'blocked',
  DELETED: 'deleted',
} as const;

type IUserAccountStatus =
  (typeof UserAccountStatus)[keyof typeof UserAccountStatus];

const UserAccountStatusList = Object.values(
  UserAccountStatus,
) as IUserAccountStatus[];

const UserRoles = {
  SECURITY_ADMIN: 'security-admin',
  SUPER_ADMIN: 'super-admin',
  USER: 'user',
} as const;
type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

const UserRolesList = Object.values(UserRoles) as UserRole[];

const AuthProvidersList = ['google'] as const;
type AuthProvider = (typeof AuthProvidersList)[number];

type UserInput = {
  accountStatus: IUserAccountStatus;
  address: Address;
  bio: string;
  email: string;
  firstName: string;
  governmentID: string;
  lastName: string;
  phoneNumber: string;
  profilePicture: string;
  role: UserRole;
  username: string;

  _addAuthProvider: AuthProvider;
};

type User = {
  _id: string;
  accountStatus: IUserAccountStatus;
  address: Address | null;
  authProviders?: AuthProvider[];
  bio: string;
  createdAt: Date | string;
  email: string;
  firstName: string;
  governmentID: string;
  lastName: string;
  phoneNumber: string;
  profilePicture: string;
  role: UserRole;
  username: string;
  updatedAt: Date | string;
};

type LoginLinkInput = {
  userId: string;
};

type LoginLink = {
  _id: string;
  createdAt: string;
  expiresAt: Date | string;
  userId: string;
};

type LoginSessionInput = {
  isBlocked: boolean;
  userId: string;
};

type LoginSession = {
  _id: string;
  isBlocked: boolean;
  createdAt: string;
  expiresAt: Date | string;
  updatedAt: Date | string;
  userId: string;
};
