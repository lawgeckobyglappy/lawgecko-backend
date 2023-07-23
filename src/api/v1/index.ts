import { Router } from 'express';
import { authRouter } from './auth';

export { router };

const router = Router();

router.use('/auth', authRouter);
