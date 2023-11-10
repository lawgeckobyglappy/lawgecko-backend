import {
  approveSecurityAdminDetails,
  deleteSecurityAdminInvitation,
  getCurrentuser,
  getSecurityAdminInvitationByToken,
  getSecurityAdminInvitations,
  handleGoogleAuth,
  inviteSecurityAdmin,
  register,
  requestAdminInvitationDetailsChanges,
  requestLoginLink,
  resendSecurityAdminInvitation,
  setSecurityAdminInvitationDetails,
  updateUser,
  verifyLoginLink,
} from '../services';
import { makeController } from 'src/shared/utils/api';

export { controllers };

const controllers = {
  approveSecurityAdminDetails: makeController((req) =>
    approveSecurityAdminDetails({
      id: req.params.id,
      authInfo: req.authInfo,
      adminCredentials: req.body,
    }),
  ),
  deleteSecurityAdminInvitation: makeController((req) =>
    deleteSecurityAdminInvitation(req.params.id, req.authInfo),
  ),
  getSecurityAdminInvitations: makeController((req) =>
    getSecurityAdminInvitations(req.authInfo),
  ),
  getSecurityAdminInvitationByToken: makeController((req) =>
    getSecurityAdminInvitationByToken(req.params.token),
  ),
  inviteSecurityAdmin: makeController(
    (req) => inviteSecurityAdmin(req.body, req.authInfo),
    201,
  ),
  resendSecurityAdminInvitation: makeController((req) =>
    resendSecurityAdminInvitation(req.params.id, req.authInfo),
  ),
  requestAdminInvitationDetailsChanges: makeController((req) =>
    requestAdminInvitationDetailsChanges({
      id: req.params.id,
      authInfo: req.authInfo,
      changesRequested: req.body,
    }),
  ),
  setSecurityAdminInvitationDetails: makeController((req) =>
    setSecurityAdminInvitationDetails(req.params.token, req.body),
  ),

  getCurrentUser: makeController((req) => getCurrentuser(req.authInfo)),
  handleGoogleAuth: makeController((req) => handleGoogleAuth(req.body)),
  register: makeController((req) => register(req.body), 201),
  requestLoginLink: makeController((req) => requestLoginLink(req.body.email)),
  updateUser: makeController(({ params: { id }, body, authInfo }) => {
    return updateUser({ id, updates: body, authInfo });
  }),
  verifyLoginLink: makeController((req) => verifyLoginLink(req.body.id)),
};
