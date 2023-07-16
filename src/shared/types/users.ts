export type { User, UserInput, UserAccountStatus, UserRole };

type UserAccountStatus =
	| 'active'
	| 'blocked'
	| 'deleted'
	| 'pending:activation';

type UserRole = 'admin' | 'moderator' | 'user';

type UserInput = {
	_id: string;
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
