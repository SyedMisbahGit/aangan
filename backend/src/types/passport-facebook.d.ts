// Type definitions for passport-facebook
// Project: https://github.com/jaredhanson/passport-facebook
// Definitions by: James Roland Cabresos <https://github.com/staticfunction>
//                 Lucas Acosta <https://github.com/lucasmacosta>
//                 Jiri Spac <https://github.com/capaj>
//                 Gleb Shulga <https://github.com/gleshch>
//                 Dan Manastireanu <https://github.com/danmana>

declare module 'passport-facebook' {
  import { Strategy as PassportStrategy } from 'passport';
  import express = require('express');

  export interface Profile extends passport.Profile {
    id: string;
    displayName: string;
    name?: {
      familyName?: string;
      givenName?: string;
      middleName?: string;
    };
    gender?: string;
    profileUrl?: string;
    emails?: Array<{
      value: string;
      type?: string;
    }>;
    photos?: Array<{
      value: string;
    }>;
    provider: string;
    _raw: string;
    _json: any;
  }

  export interface AuthenticateOptions extends passport.AuthenticateOptions {
    authType?: string;
  }

  export interface StrategyOption extends passport.StrategyOption {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string | string[];
    scopeSeparator?: string;
    enableProof?: boolean;
    profileFields?: string[];
    profileURL?: string;
    authorizationURL?: string;
    tokenURL?: string;
    graphAPIVersion?: string;
    display?: 'page' | 'popup' | 'touch' | 'wap';
    authType?: 'reauthenticate' | 'rerequest';
  }

  export interface StrategyOptionWithRequest extends StrategyOption {
    passReqToCallback: true;
  }

  export type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void
  ) => void;

  export type VerifyFunctionWithRequest = (
    req: express.Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void
  ) => void;

  export class Strategy extends PassportStrategy {
    constructor(
      options: StrategyOption,
      verify: VerifyFunction
    );
    
    constructor(
      options: StrategyOptionWithRequest,
      verify: VerifyFunctionWithRequest
    );
  }
}
