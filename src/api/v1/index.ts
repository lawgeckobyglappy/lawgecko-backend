import { Router } from 'express';
import { accountsRouter } from './accounts';
import { assessmentsRouter } from './assessments';

export { router };

const router = Router();

router.use('/accounts', accountsRouter);
router.use('/assessments', assessmentsRouter);
