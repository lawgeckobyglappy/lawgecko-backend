import { AuthInfo } from './shared/types';

declare global {
  namespace Express {
    export interface Request {
      authInfo: AuthInfo;
    }
  }
}

export {};
