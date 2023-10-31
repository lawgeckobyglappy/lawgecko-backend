import { sanitize } from 'apitoolz';

import { SecurityAdminInvitationRepo } from '../../repositories/security-admin-invitation';
import { SecurityAdminInvitation } from '../../types';

export { getSecurityAdminInvitationByToken };

const getSecurityAdminInvitationByToken = async (
  token: SecurityAdminInvitation['token'],
) => {
  const invitation = await SecurityAdminInvitationRepo.findByToken(token);

  return {
    data: invitation ? sanitize(invitation, { remove: 'token' }) : invitation,
  };
};
