import { sanitize } from 'apitoolz';

import { SecurityAdminInvitation } from '../../types';
import { SecurityAdminInvitationRepo } from '../../repositories/security-admin-invitation';

export { getSecurityAdminInvitationByToken };

const getSecurityAdminInvitationByToken = async (
  token: SecurityAdminInvitation['token'],
) => {
  const invitation = await SecurityAdminInvitationRepo.findByToken(token);

  return {
    data: invitation ? sanitize(invitation, { remove: 'token' }) : invitation,
  };
};
