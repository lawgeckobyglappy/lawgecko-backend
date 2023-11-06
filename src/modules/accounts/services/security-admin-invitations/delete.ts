import { sanitize } from 'apitoolz';

import { SecurityAdminInvitation } from '../../types';
import { handleError } from '../../utils';
import { SecurityAdminInvitationRepo } from '../../repositories/security-admin-invitation';
import { SecurityAdminInvitationModel } from '../../entities/security-admin-invitation';

export { deleteSecurityAdminInvitation };

const deleteSecurityAdminInvitation = async (
  id: SecurityAdminInvitation['_id'],
) => {
  const invitation = await SecurityAdminInvitationRepo.findById(id);

  if (!invitation)
    return handleError({ message: 'Invitation not found', statusCode: 404 });

  const results = await SecurityAdminInvitationRepo.deleteById(invitation._id);

  if (results.deletedCount == 0)
    return handleError({ message: 'An error occurred' });

  await SecurityAdminInvitationModel.delete(invitation);

  return { data: sanitize(invitation, { remove: 'token' }) };
};
