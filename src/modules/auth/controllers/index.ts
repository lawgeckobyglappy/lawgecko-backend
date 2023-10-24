import { NextFunction, Request, Response } from 'express';

import {
  getCurrentuser,
  handleGoogleAuth,
  register,
  requestLoginLink,
  updateUser,
  verifyLoginLink,
  createSysAdmin,
} from '../services';

export { controllers };

const controllers = {
  createSysAdmin: makeController((req) => createSysAdmin(req.body, req.authInfo!)),
  getCurrentUser: makeController((req) => getCurrentuser(req.authInfo!)),
  handleGoogleAuth: makeController((req) => handleGoogleAuth(req.body)),
  register: makeController((req) => register(req.body), 201),
  requestLoginLink: makeController((req) => requestLoginLink(req.body.email)),
  updateUser: makeController(({ params: { id }, body, authInfo }) => {
    return updateUser({ id, updates: body, authInfo });
  }),
  verifyLoginLink: makeController((req) => verifyLoginLink(req.body.id)),
};

/* eslint-disable-next-line no-unused-vars */
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
      return adaptResponse({
        res,
        results: { message: err.message, statusCode: 500 },
        errorCode: 500,
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
  if (results?.error)
    return res
      .status(results.error?.statusCode ?? errorCode)
      .json({ error: results.error });

  return res.status(successCode).json({ data: results?.data ?? null });
}
