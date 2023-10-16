import { AuthInfo } from './shared/types';

declare global {
  export namespace Express {
    export interface Request {
      authInfo: AuthInfo;
    }
  }
}

export {};
