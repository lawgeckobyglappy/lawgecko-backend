import { sanitize } from 'apitoolz';
import { AuthInfo, UserRoles } from '@types';
import { handleAuthError, handleError } from '@utils';

import { SecurityAdminInvitationInput } from '../../types';
import { SecurityAdminInvitationModel } from '../../entities/users/security-admin-invitation';
import { SecurityAdminInvitationRepo } from '../../repositories/security-admin-invitation';

export { inviteSecurityAdmin };

const inviteSecurityAdmin = async (
  values: SecurityAdminInvitationInput,
  { user: { _id, role } }: AuthInfo,
) => {
  if (role != UserRoles.SUPER_ADMIN) return handleAuthError('Access denied');

  const { data, error, handleSuccess } =
    await SecurityAdminInvitationModel.create({
      ...values,
      createdBy: _id,
    });

  if (error) return handleError(error);

  const invitation = await SecurityAdminInvitationRepo.insertOne(data);

  await handleSuccess();

  return { data: sanitize(invitation, { remove: 'token' }) };
};
