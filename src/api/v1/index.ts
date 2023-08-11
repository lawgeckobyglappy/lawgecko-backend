import { Router } from 'express';
import { authRouter } from './auth';
import { topicsRouter } from './topics';

export { router };

const router = Router();

router.use('/auth', authRouter);
router.use('/auth', topicsRouter);
