import { ERRORS, isObject } from 'clean-schema';

import { AuthInfo, UserRoles } from '@types';

import { UserModel } from '../../entities';
import { userRepository } from '../../repositories';
import { SecurityAdminInvitation } from '../../types';
import { handleAuthError, handleError } from '../../utils';
import { SecurityAdminInvitationRepo } from '../../repositories/security-admin-invitation';
import { validateEmail, validateString } from '../../validators';

export { approveSecurityAdminDetails };

type Props = {
  authInfo: AuthInfo;
  adminCredentials: any;
  id: SecurityAdminInvitation['_id'];
};

const approveSecurityAdminDetails = async ({
  authInfo: {
    user: { role },
  },
  adminCredentials,
  id,
}: Props) => {
  if (role != UserRoles.SUPER_ADMIN) return handleAuthError('Access denied');

  const validation = validateAdminCredentials(adminCredentials);

  if (validation.error) return handleError(validation.error);

  const invitation = await SecurityAdminInvitationRepo.findById(id);

  if (!invitation)
    return handleError({ message: 'Invitation not found', statusCode: 404 });

  if (!invitation.details)
    return handleError({ message: 'Incomplete user details' });

  const { _id, governmentID, profilePicture, ...info } = invitation.details;

  const { data, error } = await UserModel.create({
    ...info,
    address: info.address!,
    email: validation.data.email,
    role: UserRoles.SECURITY_ADMIN,
  });

  if (error) return handleError(error);

  const user = await userRepository.insertOne({
    ...data,
    _id,
    governmentID,
    profilePicture,
  });

  // TODO: send admin welcome email

  // TODO: delete invitation
  await SecurityAdminInvitationRepo.deleteById(id);

  return { data: user };
};

function validateAdminCredentials(credentials: any) {
  if (!credentials || !isObject(credentials))
    return { error: { message: ERRORS.INVALID_DATA } };

  const emailValidation = validateEmail(credentials.email),
    passwordValidation = validateString('Invalid password', { minLength: 5 })(
      credentials.password,
    );

  const error = {
    message: ERRORS.VALIDATION_ERROR,
    payload: {} as any,
  };

  if (!emailValidation.valid) error.payload['email'] = emailValidation;
  if (!passwordValidation.valid) error.payload['password'] = passwordValidation;

  if (!emailValidation.valid || !passwordValidation.valid) return { error };

  return {
    data: {
      email: (emailValidation as any).validated as string,
      password: (passwordValidation as any).validated as string,
    },
  };
}
