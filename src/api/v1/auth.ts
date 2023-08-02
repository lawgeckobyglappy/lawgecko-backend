import { Router } from 'express';
import { controllers } from '@/modules/auth/controllers';
import { requireAuth } from '@/shared/middlewares/auth.middleware';

export { router as authRouter };

const router = Router();

router.post('/register', controllers.register);
router.get('/current-user', requireAuth(), controllers.getCurrentUser);
router.patch('/update-user/:id', requireAuth(), controllers.updateUser);
router.post('/request-login-link', controllers.requestLoginLink);
router.post('/verify-login-link', controllers.verifyLoginLink);
