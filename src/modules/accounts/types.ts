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

const emptyDetails: UserDetails = {
  address: null,
  bio: '',
  firstName: '',
  governmentID: '',
  lastName: '',
  phoneNumber: '',
  profilePicture: '',
};

export const SECURITY_ADMIN_INVITATION_DETAILS_KEYS = Object.keys(emptyDetails);

type ChangesRequested = { [K in keyof UserDetails]?: string };

type SecurityAdminInvitationInput = {
  changesRequested: ChangesRequested | null;
  createdBy: User['_id'];
  details: UserDetails;
  email: string;
  name: string;

  _resend: any;
};

type SecurityAdminInvitation = {
  _id: string;
  changesRequested: ChangesRequested | null;
  createdAt: Date;
  createdBy: User['_id'];
  details: UserDetails | null;
  email: string;
  expiresAt: Date;
  name: string;
  token: string;
  updatedAt: Date;
};
