import { sanitize } from 'apitoolz';

import { handleError } from '../../utils';
import { InvitationDetailsInput, SecurityAdminInvitation } from '../../types';
import { UserDetailsModel } from '../../entities/security-admin-invitation';
import { SecurityAdminInvitationRepo } from '../../repositories/security-admin-invitation';

export { setSecurityAdminInvitationDetails };

const setSecurityAdminInvitationDetails = async (
  token: SecurityAdminInvitation['token'],
  details: InvitationDetailsInput,
) => {
  let invitation = await SecurityAdminInvitationRepo.findByToken(token);

  if (!invitation)
    return handleError({ message: 'Invitation not found', statusCode: 404 });

  const oldDetails = invitation.details;

  const { data, error, handleSuccess } = await (oldDetails
    ? UserDetailsModel.update(oldDetails, details)
    : UserDetailsModel.create(details));

  if (error) return handleError(error);

  invitation = await SecurityAdminInvitationRepo.updateOne(
    { _id: invitation._id },
    { details: { ...oldDetails, ...data } as any },
  );

  await handleSuccess();

  return { data: sanitize(invitation, { remove: 'token' }) };
};
