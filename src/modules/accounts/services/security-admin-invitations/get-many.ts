import { sanitize } from 'apitoolz';
import { AuthInfo, UserRoles } from '@types';

import { handleAuthError } from '../../utils';
import { SecurityAdminInvitationRepo } from '../../repositories/security-admin-invitation';

export { getSecurityAdminInvitations };

const getSecurityAdminInvitations = async ({ user: { role } }: AuthInfo) => {
  if (role != UserRoles.SUPER_ADMIN) return handleAuthError('Access denied');

  const invitations = await SecurityAdminInvitationRepo.find();

  return { data: sanitize(invitations, { remove: 'token' }) };
};
