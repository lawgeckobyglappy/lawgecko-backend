import { sanitize } from 'apitoolz';

import { handleAuthError } from '@utils';
import { AuthInfo, UserRoles } from '@types';

import { SecurityAdminInvitationRepo } from '../../repositories/security-admin-invitation';

export { getSecurityAdminInvitations };

const getSecurityAdminInvitations = async ({ user: { role } }: AuthInfo) => {
  if (role != UserRoles.SUPER_ADMIN) return handleAuthError('Access denied');

  const invitations = await SecurityAdminInvitationRepo.find();

  return { data: sanitize(invitations, { remove: 'token' }) };
};
