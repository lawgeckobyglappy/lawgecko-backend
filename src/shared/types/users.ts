export type {
	AuthPayload,
	AuthPayloadInput,
	User,
	UserInput,
	UserAccountStatus,
	UserRole,
	LoginLink,
	LoginLinkInput,
	LoginSession,
	LoginSessionInput,
};

type AuthPayloadInput = {
	userId: string;
	userRole: UserRole;
	sessionId: string;
};

type AuthPayload = {
	user: { _id: string; role: UserRole };
	sessionId: string;
};

type UserAccountStatus =
	| 'active'
	| 'blocked'
	| 'deleted'
	| 'pending:activation';

type UserRole = 'admin' | 'moderator' | 'user';

type UserInput = {
	_id: string;
	accountStatus: UserAccountStatus;
	email: string;
	firstName: string;
	lastName: string;
	role: UserRole;
	username: string;
};

type User = {
	_id: string;
	accountStatus: UserAccountStatus;
	createdAt: Date | string;
	email: string;
	firstName: string;
	lastName: string;
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
