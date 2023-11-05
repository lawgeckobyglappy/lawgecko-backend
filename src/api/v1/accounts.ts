import { Router } from 'express';
import { fileManager } from 'apitoolz';

import { UserRoles } from '@types';
import { requireAuth } from '@middlewares';

import { controllers } from '../../modules/accounts/controllers';

export { router as accountsRouter };

const router = Router();

const multipartParser = fileManager.parseMultipartData()({
  filesConfig: { governmentID: {}, profilePicture: {} },
  pathOnly: false,
  uploadDir: 'public/tmp',
});

// security admins
router.delete(
  '/security-admins/:id',
  requireAuth(UserRoles.SUPER_ADMIN),
  controllers.deleteSecurityAdminInvitation,
);
router.post(
  '/security-admins/invite',
  requireAuth(UserRoles.SUPER_ADMIN),
  controllers.inviteSecurityAdmin,
);
router.patch(
  '/security-admins/resend/:id',
  requireAuth(UserRoles.SUPER_ADMIN),
  controllers.resendSecurityAdminInvitation,
);
router.patch(
  '/security-admins/:token',
  multipartParser,
  controllers.setSecurityAdminInvitationDetails,
);
router.get(
  '/security-admins/:t',
  controllers.getSecurityAdminInvitationByToken,
);
router.get(
  '/security-admins',
  requireAuth(UserRoles.SUPER_ADMIN),
  controllers.getSecurityAdminInvitations,
);

// users
router.post('/register', controllers.register);
router.post('/handle-google-auth', controllers.handleGoogleAuth);
router.get('/current-user', requireAuth(), controllers.getCurrentUser);
router.patch('/update-user/:id', requireAuth(), controllers.updateUser);
router.post('/request-login-link', controllers.requestLoginLink);
router.post('/verify-login-link', controllers.verifyLoginLink);
