// Type definitions for passport
// Project: https://github.com/jaredhanson/passport
// Definitions by: Horiuchi_H <https://github.com/horiuchi/>
//               Eric Naeseth <https://github.com/enaeseth>
//               Igor Belagor <https://github.com/igorbelagor>
//               Torkild Dyvik Olsen <https://github.com/tdolsen>
//               Pavel Puchkov <https://github.com/0x6368656174>
//               Daniel Perez Alvarez <https://github.com/unindented>
//               Anna Henningsen <https://github.com/addaleax>
//               Michal Kaminski <https://github.com/mk-michal>
//               Joao Vieira <https://github.com/joaovieira>
//               Spencer Rinehart <https://github.com/justfatlard>
//               Piotr Błażejewicz <https://github.com/peterblazejewicz>
//               Wang Zishi <https://github.com/wangzishi>
//               Khaled Al-Ansari <https://github.com/mr-kaffee>
//               Oscar <https://github.com/0x54a2>
//               Lior Mualem <https://github.com/liorm>
//               Jiri Spac <https://github.com/capaj>
//               Michal Frystacky <https://github.com/mfrystacky>
//               Piotr Błażejewicz <https://github.com/peterblazejewicz>
//               Piotr Błażejewicz <https://github.com/peterblazejewicz>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.3

import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';

export interface AuthenticateOptions {
  authInfo?: boolean | undefined;
  assignProperty?: string | undefined;
  failureFlash?: string | boolean | undefined;
  failureMessage?: boolean | string | undefined;
  failureRedirect?: string | undefined;
  failWithError?: boolean | undefined;
  session?: boolean | undefined;
  scope?: string | string[] | undefined;
  successFlash?: string | boolean | undefined;
  successMessage?: boolean | string | undefined;
  successRedirect?: string | undefined;
  successReturnToOrRedirect?: string | undefined;
  successReturnToOrRedirectFallback?: string | undefined;
  successReturnToOrRedirectOptions?: {
    failOnError?: boolean | undefined;
  } | undefined;
  state?: string | undefined;
  pauseStream?: boolean | undefined;
  userProperty?: string | undefined;
  passReqToCallback?: boolean | undefined;
  prompt?: string | undefined;
  display?: string | undefined;
  loginHint?: string | undefined;
  hd?: string | undefined;
  includeGrantedScopes?: boolean | undefined;
  accessType?: 'offline' | 'online' | undefined;
  authType?: 'reauthenticate' | 'rerequest' | 'select_account' | 'signin' | 'signup' | 'use' | undefined;
  requestVisibleActions?: string | undefined;
  openIDRealm?: string | undefined;
  hostedDomain?: string | undefined;
  requestTokenClient?: unknown;
  disableLtiState?: boolean | undefined;
  failureFlashWithType?: boolean | undefined;
  failureFlashType?: string | ((...args: unknown[]) => string) | undefined;
  failureFlashMessage?: string | ((...args: unknown[]) => string) | undefined;
  failureFlashOptions?: Record<string, unknown>;
  successFlashWithType?: boolean | undefined;
  successFlashType?: string | ((...args: unknown[]) => string) | undefined;
  successFlashMessage?: string | ((...args: unknown[]) => string) | undefined;
  successFlashOptions?: Record<string, unknown>;
  // The duplicate properties are removed
}

export interface AuthenticateCallback<TUser = unknown, TInfo = unknown> {
  (err: Error | null, user?: TUser | false, info?: TInfo): void;
}

export interface AuthenticateFunction {
  (name: string | string[], options?: AuthenticateOptions, callback?: AuthenticateCallback): unknown;
  (name: string | string[], callback?: AuthenticateCallback): unknown;
  (options?: AuthenticateOptions): unknown;
  (): unknown;
}

export interface AuthorizeOptions extends AuthenticateOptions {
  passReqToCallback?: boolean | undefined;
}

export interface AuthorizeFunction {
  (name: string | string[], options?: AuthorizeOptions, callback?: AuthenticateCallback): unknown;
  (name: string | string[], callback?: AuthenticateCallback): unknown;
  (options?: AuthorizeOptions): unknown;
  (): unknown;
}

export interface Passport {
  use(strategy: Strategy): this;
  use(name: string, strategy: Strategy): this;
  unuse(name: string): this;
  framework(fw: Framework): this;
  initialize(options?: { userProperty?: string | undefined; }): Express.Handler;
  session(options?: { pauseStream?: boolean | undefined; }): Express.Handler;
  authenticate(strategy: string | string[], callback?: AuthenticateCallback): Express.Handler;
  authenticate(strategy: string | string[], options: AuthenticateOptions, callback?: AuthenticateCallback): Express.Handler;
  authorize(strategy: string | string[], callback?: AuthenticateCallback): Express.Handler;
  authorize(strategy: string | string[], options: AuthorizeOptions, callback?: AuthenticateCallback): Express.Handler;
  serializeUser<TUser, TID>(fn: (user: TUser, done: (err: Error | null, id?: TID) => void) => void): void;
  deserializeUser<TUser, TID>(fn: (id: TID, done: (err: Error | null, user?: TUser | false | null) => void) => void): void;
  transformAuthInfo(fn: (info: unknown, done: (err: Error | null, transformedInfo: unknown) => void) => void): void;
}

export interface PassportStatic extends Passport {
  Passport: { new(): Passport };
  Authenticator: { new(): Passport };
  initialize(options?: { userProperty?: string | undefined; }): Express.Handler;
  session(options?: { pauseStream?: boolean | undefined; }): Express.Handler;
  authenticate(strategy: string | string[], callback?: AuthenticateCallback): Express.Handler;
  authenticate(strategy: string | string[], options: AuthenticateOptions, callback?: AuthenticateCallback): Express.Handler;
  authorize(strategy: string | string[], callback?: AuthenticateCallback): Express.Handler;
  authorize(strategy: string | string[], options: AuthorizeOptions, callback?: AuthenticateCallback): Express.Handler;
  use(strategy: Strategy): this;
  use(name: string, strategy: Strategy): this;
  unuse(name: string): this;
  framework(fw: Framework): this;
  serializeUser<TUser, TID>(fn: (user: TUser, done: (err: Error | null, id?: TID) => void) => void): void;
  deserializeUser<TUser, TID>(fn: (id: TID, done: (err: Error | null, user?: TUser | false | null) => void) => void): void;
  transformAuthInfo(fn: (info: unknown, done: (err: Error | null, transformedInfo: unknown) => void) => void): void;
}

export interface Strategy {
  name?: string | undefined;
  authenticate(this: Strategy, req: ExpressRequest, options?: unknown): unknown;
}

export interface StrategyCreated<TUser = unknown, TInfo = unknown> {
  name: string;
  authenticate: (req: ExpressRequest, options?: unknown) => unknown;
  success: (user: TUser, info?: TInfo) => void;
  fail: (challenge?: unknown, status?: number) => void;
  redirect: (url: string, status?: number) => void;
  pass: () => void;
  error: (err: Error) => void;
  // The duplicate properties are removed
}

export interface StrategyCreatedStatic {
  new <TUser = unknown, TInfo = unknown>(
    options?: unknown,
    verify?: (req: ExpressRequest, ...args: unknown[]) => unknown
  ): StrategyCreated<TUser, TInfo>;
}

export interface Framework {
  initialize(passport: Passport, options?: unknown): unknown;
  authenticate(passport: Passport, name: string, options?: unknown, callback?: (...args: unknown[]) => unknown): unknown;
  authorize?(passport: Passport, name: string, options?: unknown, callback?: (...args: unknown[]) => unknown): unknown;
}

declare const passport: PassportStatic;

export default passport;

// To make `Express.Handler` available, you might need to add this
// to your project or reference an `express.d.ts` file.
declare namespace Express {
  interface Request {
    isAuthenticated(): boolean;
    isUnauthenticated(): boolean;
    login(user: unknown, done: (err: Error | null) => void): void;
    login(user: unknown, options: unknown, done: (err: Error | null) => void): void;
    logIn(user: unknown, done: (err: Error | null) => void): void;
    logIn(user: unknown, options: unknown, done: (err: Error | null) => void): void;
    logout(options: { keepSessionInfo: boolean }, done: (err: Error | null) => void): void;
    logout(done: (err: Error | null) => void): void;
    logOut(options: { keepSessionInfo: boolean }, done: (err: Error | null) => void): void;
    logOut(done: (err: Error | null) => void): void;
    session: Express.Session | null;
    user?: unknown;
    authInfo?: unknown;
  }

  interface Handler {
    (req: Request, res: Response, next: NextFunction): void;
  }
}