import { ApiError } from 'apitoolz';
import { NextFunction, Request, Response } from 'express';

import {
	getCurrentuser,
	handleGoogleAuth,
	register,
	requestLoginLink,
	updateUser,
	verifyLoginLink,
} from '../services';

export { controllers };

const controllers = {
	getCurrentUser: makeController((req) => getCurrentuser(req.authInfo!)),
	handleGoogleAuth: makeController((req) => handleGoogleAuth(req.body)),
	register: makeController((req) => register(req.body), 201),
	requestLoginLink: makeController((req) => requestLoginLink(req.body.email)),
	updateUser: makeController(({ params: { id }, body, authInfo }) => {
		return updateUser({ id, updates: body, authInfo });
	}),
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

			return adaptResponse({ res, results, successCode, errorCode });
		} catch (err: any) {
			const error = new ApiError({
				message: err.message,
				statusCode: 500,
			}).summary;

			return adaptResponse({
				res,
				results: { error },
				errorCode: error.statusCode,
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
	if (results?.error) {
		const error = new ApiError(results?.error).summary;

		return res.status(error?.statusCode ?? errorCode).json({ error });
	}

	return res.status(successCode).json({ data: results?.data ?? null });
}
