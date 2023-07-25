import { ApiError } from 'apitoolz';
import { NextFunction, Request, Response } from 'express';

import {
	getCurrentuser,
	register,
	requestLoginLink,
	verifyLoginLink,
} from '../services';

export { controllers };

const controllers = {
	getCurrentUser: makeController((req) => getCurrentuser(req.authInfo!)),
	register: makeController((req) => register(req.body), 201),
	requestLoginLink: makeController((req) => requestLoginLink(req.body.email)),
	verifyLoginLink: makeController((req) => verifyLoginLink(req.body.id)),
};

type Handler = (req: Request, res: Response, next?: NextFunction) => any;
function makeController(
	handler: Handler,
	successCode?: number,
	errorCode?: number,
) {
	return async (req: Request, res: Response, next?: NextFunction) => {
		try {
			const results = await handler(req, res, next);

			return adaptResponse({ res, results, successCode });
		} catch (err: any) {
			return adaptResponse({
				res,
				results: { error: new ApiError(err).summary },
				errorCode,
			});
		}
	};
}

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
