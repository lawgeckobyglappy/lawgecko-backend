import { Router } from 'express';
import { controllers } from '../../modules/auth/controllers';

export { router as authRouter };

const router = Router();

router.post('/register', controllers.register);
