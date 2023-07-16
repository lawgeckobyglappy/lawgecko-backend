/* eslint-disable no-var */

import { AuthPayload } from 'shared/types';

declare global {
	namespace Express {
		export interface Request {
			authInfo?: AuthPayload | null;
		}
	}
}

export {};
