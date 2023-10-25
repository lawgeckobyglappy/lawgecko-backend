import { Router } from 'express';

import { UserRoles } from '@types';
import { requireAuth } from '@middlewares';

import { controllers } from '../../modules/auth/controllers';

export { router as authRouter };

const router = Router();

router.post(
  '/system-admin',
  requireAuth(UserRoles.SUPER_ADMIN),
  controllers.createSysAdmin,
);
router.post('/register', controllers.register);
router.post('/handle-google-auth', controllers.handleGoogleAuth);
router.get('/current-user', requireAuth(), controllers.getCurrentUser);
router.patch('/update-user/:id', requireAuth(), controllers.updateUser);
router.post('/request-login-link', controllers.requestLoginLink);
router.post('/verify-login-link', controllers.verifyLoginLink);
