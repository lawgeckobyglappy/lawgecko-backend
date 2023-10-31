import { Router } from 'express';
import { accountsRouter } from './accounts';

export { router };

const router = Router();

router.use('/accounts', accountsRouter);
