import { Router } from 'express';
import { fileManager } from 'apitoolz';

import { UserRoles } from '@types';
import { requireAuth } from '@middlewares';

import { controllers } from '../../modules/accounts/controllers';

export { router as accountsRouter };

const router = Router();

const multipartParser = fileManager.parseMultipartData()({
  filesConfig: { governmentID: {}, profilePicture: {} },
  uploadDir: 'public/tmp',
});

// security admin creation
router.delete(
  '/security-admins/invitations/:id',
  requireAuth(UserRoles.SUPER_ADMIN),
  controllers.deleteSecurityAdminInvitation,
);
router.post(
  '/security-admins/invitations',
  requireAuth(UserRoles.SUPER_ADMIN),
  controllers.inviteSecurityAdmin,
);
router.patch(
  '/security-admins/invitations/:id/approve',
  requireAuth(UserRoles.SUPER_ADMIN),
  controllers.approveSecurityAdminDetails,
);
router.patch(
  '/security-admins/invitations/:id/request-changes',
  requireAuth(UserRoles.SUPER_ADMIN),
  controllers.requestAdminInvitationDetailsChanges,
);
router.patch(
  '/security-admins/invitations/:id/resend',
  requireAuth(UserRoles.SUPER_ADMIN),
  controllers.resendSecurityAdminInvitation,
);
router.patch(
  '/security-admins/invitations/:token',
  multipartParser,
  controllers.setSecurityAdminInvitationDetails,
);
router.get(
  '/security-admins/invitations/:token',
  controllers.getSecurityAdminInvitationByToken,
);
router.get(
  '/security-admins/invitations',
  requireAuth(UserRoles.SUPER_ADMIN),
  controllers.getSecurityAdminInvitations,
);

// users
router.post('/register', multipartParser, controllers.register);
router.post('/handle-google-auth', controllers.handleGoogleAuth);
router.get('/current-user', requireAuth(), controllers.getCurrentUser);
router.patch(
  '/update-user/:id',
  requireAuth(),
  multipartParser,
  controllers.updateUser,
);
router.post('/request-login-link', controllers.requestLoginLink);
router.post('/verify-login-link', controllers.verifyLoginLink);
