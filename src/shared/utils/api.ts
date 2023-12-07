import { Request, Response } from 'express';

export { makeController };

type ApiResponse =
  | { data: any; error?: null }
  | {
      data?: null;
      error: {
        message: string;
        payload: Record<string, any>;
        statusCode: number;
      };
    };

function makeController(
  handler: (req: Request, res: Response) => ApiResponse | Promise<ApiResponse>,
  successCode?: number,
  errorCode?: number,
) {
  return async (req: Request, res: Response) => {
    try {
      const results = await handler(req, res);

      return adaptResponse({ res, results, successCode, errorCode });
    } catch (err: any) {
      return adaptResponse({
        res,
        results: {
          error: { message: err.message, payload: {}, statusCode: 500 },
        },
        errorCode: 500,
      });
    }
  };
}

type Options = {
  res: Response;
  results: ApiResponse;
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
