import { sanitize } from 'apitoolz';

import { AuthInfo, UserRoles } from '@types';
import { handleAuthError, handleError } from '@utils';

import { SecurityAdminInvitation } from '../../types';
import { SecurityAdminInvitationModel } from '../../entities/users/security-admin-invitation';
import { SecurityAdminInvitationRepo } from '../../repositories/security-admin-invitation';

export { requestAdminInvitationDetailsChanges };

type Props = {
  authInfo: AuthInfo;
  changesRequested: any;
  id: SecurityAdminInvitation['_id'];
};

const requestAdminInvitationDetailsChanges = async ({
  authInfo: {
    user: { role },
  },
  changesRequested,
  id,
}: Props) => {
  if (role != UserRoles.SUPER_ADMIN) return handleAuthError('Access denied');

  let invitation = await SecurityAdminInvitationRepo.findById(id);

  if (!invitation)
    return handleError({ message: 'Invitation not found', statusCode: 404 });

  const { data, error, handleSuccess } =
    await SecurityAdminInvitationModel.update(invitation, { changesRequested });

  if (error) return handleError(error);

  invitation = await SecurityAdminInvitationRepo.updateOne(
    { _id: invitation._id },
    data,
  );

  await handleSuccess();

  return { data: sanitize(invitation, { remove: 'token' }) };
};
