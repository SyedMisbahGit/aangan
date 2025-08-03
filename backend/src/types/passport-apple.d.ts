// Type definitions for passport-apple
// Project: https://github.com/ananay/passport-apple
// Definitions by: Karl Horky <https://github.com/karlhorky>
//                 Jaeheon Jeong <https://github.com/tonyfromundefined>
//                 Peter Squicciarini <https://github.com/stripedpajamas>
//                 Justin Noel <https://github.com/justinnoel>

declare module 'passport-apple' {
  import { Strategy as PassportStrategy } from 'passport';
  import * as express from 'express';
  import { VerifyCallback as PassportVerifyCallback } from 'passport-oauth2';

  export interface Profile extends passport.Profile {
    id: string;
    provider: 'apple';
    displayName?: string;
    name?: {
      namePrefix?: string | null;
      givenName?: string | null;
      middleName?: string | null;
      familyName?: string | null;
      nameSuffix?: string | null;
      name?: string | null;
    };
    emails?: Array<{
      value: string;
      type?: string;
    }>;
    _raw: string;
    _json: {
      iss: string;
      aud: string;
      exp: number;
      iat: number;
      sub: string;
      c_hash: string;
      email?: string;
      email_verified?: string;
      is_private_email?: string;
      auth_time: number;
      nonce_supported: boolean;
      real_user_status?: number;
    };
  }

  export interface AuthenticateOptions extends passport.AuthenticateOptions {
    authType?: string;
  }

  export interface StrategyOptions {
    clientID: string;
    teamID: string;
    keyID: string;
    key: string | Buffer;
    scope?: string | string[];
    callbackURL: string;
    callbackURLScheme?: string;
    passReqToCallback?: boolean;
    state?: boolean;
    nonce?: boolean;
    pkce?: boolean;
    nonceValidator?: (nonce: string, req: express.Request, callback: (err: Error | null, ok: boolean) => void) => void;
    nonceFromReq?: (req: express.Request) => string | null;
    nonceToState?: (nonce: string) => string;
    nonceFromState?: (state: string) => string | null;
    generateNonce?: () => string;
  }

  export type VerifyCallback = PassportVerifyCallback;

  export type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    idToken: string,
    profile: Profile,
    done: VerifyCallback
  ) => void;

  export type VerifyFunctionWithRequest = (
    req: express.Request,
    accessToken: string,
    refreshToken: string,
    idToken: string,
    profile: Profile,
    done: VerifyCallback
  ) => void;

  export class Strategy extends PassportStrategy {
    constructor(
      options: StrategyOptions,
      verify: VerifyFunction | VerifyFunctionWithRequest
    );
  }
}
