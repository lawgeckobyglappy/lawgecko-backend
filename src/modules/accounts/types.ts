import { type FileInfo } from 'apitoolz';

import { User } from '@types';

export {
  FileInfo,
  InvitationDetails,
  InvitationDetailsInputAlias,
  InvitationDetailsInput,
  SecurityAdminInvitation,
  SecurityAdminInvitationInput,
};

type InvitationDetailsInputAlias = {
  governmentID: FileInfo;
  profilePicture: FileInfo;
};

type InvitationDetailsInput = {
  address: User['address'];
  bio: User['bio'];
  firstName: User['firstName'];
  lastName: User['lastName'];
  phoneNumber: User['phoneNumber'];

  _governmentID: FileInfo;
  _profilePicture: FileInfo;
};

type InvitationDetails = Pick<
  User,
  | '_id'
  | 'address'
  | 'bio'
  | 'firstName'
  | 'governmentID'
  | 'lastName'
  | 'phoneNumber'
  | 'profilePicture'
>;

const emptyDetails = {
  address: null,
  bio: '',
  firstName: '',
  governmentID: '',
  lastName: '',
  phoneNumber: '',
  profilePicture: '',
};

export const SECURITY_ADMIN_INVITATION_DETAILS_KEYS = Object.keys(emptyDetails);

type ChangesRequested = { [K in keyof InvitationDetails]?: string };

type SecurityAdminInvitationInput = {
  changesRequested: ChangesRequested | null;
  createdBy: User['_id'];
  details: InvitationDetails;
  email: string;
  name: string;

  _resend: any;
};

type SecurityAdminInvitation = {
  _id: string;
  changesRequested: ChangesRequested | null;
  createdAt: Date;
  createdBy: User['_id'];
  details: InvitationDetails | null;
  email: string;
  name: string;
  token: string;
  updatedAt: Date;
};
