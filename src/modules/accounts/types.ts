import { User } from '@types';

export { SecurityAdminInvitation, SecurityAdminInvitationInput };

type UserDetails = Pick<
  User,
  | 'address'
  | 'bio'
  | 'firstName'
  | 'governmentID'
  | 'lastName'
  | 'phoneNumber'
  | 'profilePicture'
>;

type SecurityAdminInvitationInput = {
  createdBy: User['_id'];
  details: UserDetails;
  email: string;
  name: string;

  _approve: { approvedBy: User['_id']; adminEmail: string; password: string };
  _resend: any;
};

type SecurityAdminInvitation = {
  _id: string;
  createdAt: Date;
  createdBy: User['_id'];
  approvedAt: Date | null;
  approvedBy: User['_id'] | null;
  details: UserDetails | null;
  email: string;
  expiresAt: Date;
  name: string;
  token: string;
  updatedAt: Date;
};
