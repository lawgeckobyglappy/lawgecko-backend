import { Router } from 'express';
import { authRouter } from './auth';
import forumRouter from './forum';
import exampleRouter from './example';

const router = Router();

router.use('/auth', authRouter);
router.use('/forum', forumRouter);
router.use('/example', exampleRouter);
export { router };
