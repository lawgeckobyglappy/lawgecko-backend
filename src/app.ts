import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from './shared/middlewares/morgan.middleware';
import config from './config/env';

import { router } from './api/v1';
import exampleRoutes from './api/v1/example';

const app: Application = express();

if (config.environment !== 'test') {
	app.use(morgan);
}

app.use(cors({ origin: '*' }));

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
	res.json({ message: 'live' });
});

app.use('/api/v1', exampleRoutes);
app.use('/api/v1', router);

app.use((_, res: Response) => {
	res.status(404).json({ message: 'Resource not found' });
});

export default app;
