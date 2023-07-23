import { Request, Response } from 'express';
import { register } from '../services';

export { controllers };

const controllers = {
	async register(req: Request, res: Response) {
		const results = await register(req.body);

		return adaptResponse({ res, results, successCode: 201 });
	},
};

type Options = {
	res: Response;
	results: any;
	successCode?: number;
	errorCode?: number;
};
function adaptResponse({
	res,
	results,
	successCode = 200,
	errorCode = 400,
}: Options) {
	const { error } = results;

	if (error) return res.status(error?.statusCode ?? errorCode).json(results);

	return res.status(successCode).json(results);
}
