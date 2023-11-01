import { sanitize } from 'apitoolz';
import { AuthInfo, UserRoles } from '@types';

import { SecurityAdminInvitation } from '../../types';
import { handleAuthError, handleError } from '../../utils';
import { SecurityAdminInvitationModel } from '../../entities/security-admin-invitation';
import { SecurityAdminInvitationRepo } from '../../repositories/security-admin-invitation';

export { resendSecurityAdminInvitation };

const resendSecurityAdminInvitation = async (
  id: SecurityAdminInvitation['_id'],
  { user: { role } }: AuthInfo,
) => {
  if (role != UserRoles.SUPER_ADMIN) return handleAuthError('Access denied');

  const invitation = await SecurityAdminInvitationRepo.findById(id);

  if (!invitation) return handleError({ message: 'Invitation not found' });

  const { data, error, handleSuccess } =
    await SecurityAdminInvitationModel.update(invitation, { _resend: true });

  if (error) return handleError(error);

  await SecurityAdminInvitationRepo.updateOne({ _id: id }, data);

  await handleSuccess();

  return { data: sanitize({ ...invitation, ...data }, { remove: 'token' }) };
};
