import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import { Strategy as FacebookStrategy, Profile as FacebookProfile } from 'passport-facebook';
import { Strategy as AppleStrategy, Profile as AppleProfile } from 'passport-apple';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import db from '../db';
import logger from '../utils/logger.js';
import { BadRequestError, UnauthorizedError, ForbiddenError } from '../utils/errors';
import { sendEmail } from './email.service';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const JWT_ISSUER = process.env.JWT_ISSUER || 'aangan-api';

// OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;
const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID;
const APPLE_KEY_ID = process.env.APPLE_KEY_ID;
const APPLE_PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY;

// Initialize OAuth clients
const googleClient = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET
    ? new OAuth2Client(GOOGLE_CLIENT_ID)
    : null;

// Manually define the Passport callback types
type PassportDoneCallback = (err: Error | null, user?: object | false | null, info?: object) => void;

/**
 * Interface for the standard JWT payload.
 * This payload is used for both access and refresh tokens.
 */
interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    tokenId: string;
}

/**
 * Interface for special-purpose tokens like email verification or password reset.
 */
interface SpecialTokenPayload {
    userId: string;
    email: string;
    purpose: 'email_verification' | 'password_reset';
}

/**
 * Interface for the authentication tokens returned to the client.
 */
interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
}

/**
 * Interface to standardize social profile data from different providers.
 */
interface SocialProfile {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    provider: 'google' | 'facebook' | 'apple';
    emailVerified?: boolean;
}

class AuthService {
    /**
     * Generate JWT tokens for a user.
     * A unique `tokenId` is created and returned alongside the tokens to link them to the database record.
     */
    public generateTokens(userId: string, email: string, role: string): { tokens: AuthTokens; tokenId: string; } {
        const tokenId = uuidv4();
        const payload: TokenPayload = { userId, email, role, tokenId };

        const accessTokenOptions: SignOptions = {
            expiresIn: JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
            issuer: JWT_ISSUER,
        };
        const accessToken = jwt.sign(payload, JWT_SECRET, accessTokenOptions);

        const refreshTokenOptions: SignOptions = {
            expiresIn: JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
            issuer: JWT_ISSUER,
        };
        const refreshToken = jwt.sign(payload, JWT_SECRET, refreshTokenOptions);

        return {
            tokens: {
                accessToken,
                refreshToken,
                expiresIn: 15 * 60, // 15 minutes in seconds
                tokenType: 'Bearer',
            },
            tokenId,
        };
    }

    /**
     * Store refresh token in the database.
     * This is a crucial step for implementing refresh token rotation and revocation.
     */
    private async storeRefreshToken(userId: string, tokenId: string, refreshToken: string): Promise<void> {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

        await db('refresh_tokens').insert({
            id: tokenId,
            user_id: userId,
            token: refreshToken,
            expires_at: expiresAt,
            created_at: new Date(),
            updated_at: new Date(),
        });
    }

    /**
     * Verify and decode a JWT token.
     * Throws specific errors for expired or invalid tokens.
     */
    public verifyToken(token: string, ignoreExpiration = false): TokenPayload {
        try {
            const decoded = jwt.verify(token, JWT_SECRET, {
                issuer: JWT_ISSUER,
                ignoreExpiration,
            }) as TokenPayload;
            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new UnauthorizedError('Token has expired', 'TOKEN_EXPIRED');
            } else if (error instanceof jwt.JsonWebTokenError) {
                throw new UnauthorizedError('Invalid token', 'INVALID_TOKEN');
            }
            throw error;
        }
    }

    /**
     * Register a new user with email and password.
     * This process includes hashing the password and sending a verification email.
     */
    public async register(email: string, password: string, name: string): Promise<AuthTokens> {
        const existingUser = await db('users').where({ email }).first();
        if (existingUser) {
            throw new BadRequestError('Email already in use', 'EMAIL_IN_USE');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [userId] = await db('users').insert({
            id: uuidv4(),
            email,
            password: hashedPassword,
            name,
            username: await this.generateUniqueUsername(name),
            email_verified: false,
            created_at: new Date(),
            updated_at: new Date(),
        }).returning('id');

        const verificationToken = jwt.sign(
            { userId, email, purpose: 'email_verification' } as SpecialTokenPayload,
            JWT_SECRET,
            { expiresIn: '24h', issuer: JWT_ISSUER }
        );

        await sendEmail({
            to: email,
            subject: 'Verify your email',
            template: 'verify-email',
            data: {
                name,
                verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
            },
        });

        const { tokens } = this.generateTokens(userId, email, 'user');
        return tokens;
    }

    /**
     * Login with email and password.
     * Verifies credentials and generates new tokens.
     */
    public async login(email: string, password: string): Promise<AuthTokens> {
        const user = await db('users')
            .where({ email })
            .select('id', 'email', 'password', 'role', 'is_active', 'email_verified')
            .first();

        if (!user || !user.is_active) {
            throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
        }

        if (!user.email_verified) {
            throw new ForbiddenError('Please verify your email address', 'EMAIL_NOT_VERIFIED');
        }

        const { tokens, tokenId } = this.generateTokens(user.id, user.email, user.role);
        await this.storeRefreshToken(user.id, tokenId, tokens.refreshToken);

        await db('users')
            .where({ id: user.id })
            .update({ last_login: new Date() });

        return tokens;
    }

    /**
     * Refresh an access token using a valid refresh token.
     * Implements refresh token rotation for enhanced security.
     */
    public async refreshToken(refreshToken: string): Promise<AuthTokens> {
        let decoded: TokenPayload;
        try {
            decoded = this.verifyToken(refreshToken);
        } catch (error) {
            throw new UnauthorizedError('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
        }

        const tokenRecord = await db('refresh_tokens')
            .where({
                id: decoded.tokenId,
                user_id: decoded.userId,
                revoked: false,
            })
            .first();

        if (!tokenRecord || tokenRecord.token !== refreshToken) {
            throw new UnauthorizedError('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
        }

        if (new Date() > new Date(tokenRecord.expires_at)) {
            await db('refresh_tokens')
                .where({ id: decoded.tokenId })
                .update({ revoked: true });

            throw new UnauthorizedError('Refresh token has expired', 'REFRESH_TOKEN_EXPIRED');
        }

        const user = await db('users')
            .where({ id: decoded.userId, is_active: true })
            .select('id', 'email', 'role')
            .first();

        if (!user) {
            throw new UnauthorizedError('User not found or inactive', 'USER_NOT_FOUND');
        }

        const { tokens, tokenId } = this.generateTokens(user.id, user.email, user.role);

        await db('refresh_tokens')
            .where({ id: decoded.tokenId })
            .update({ revoked: true });

        await this.storeRefreshToken(user.id, tokenId, tokens.refreshToken);

        return tokens;
    }

    /**
     * Logout a user by revoking their current refresh token.
     */
    public async logout(refreshToken: string): Promise<void> {
        try {
            const decoded = this.verifyToken(refreshToken, true);

            await db('refresh_tokens')
                .where({ id: decoded.tokenId })
                .update({ revoked: true });
        } catch (error) {
            logger.warn('Error during logout:', error);
        }
    }

    /**
     * Verify a user's email using a special verification token.
     */
    public async verifyEmail(token: string): Promise<void> {
        let decoded: SpecialTokenPayload;

        try {
            decoded = jwt.verify(token, JWT_SECRET) as SpecialTokenPayload;

            if (decoded.purpose !== 'email_verification') {
                throw new BadRequestError('Invalid verification token', 'INVALID_TOKEN');
            }
        } catch (error) {
            throw new BadRequestError('Invalid or expired verification token', 'INVALID_TOKEN');
        }

        const updated = await db('users')
            .where({ id: decoded.userId, email: decoded.email })
            .update({
                email_verified: true,
                updated_at: new Date(),
            });

        if (!updated) {
            throw new BadRequestError('User not found', 'USER_NOT_FOUND');
        }
    }

    /**
     * Request a password reset by sending an email with a reset token.
     */
    public async requestPasswordReset(email: string): Promise<void> {
        const user = await db('users')
            .where({ email })
            .select('id', 'name', 'email')
            .first();

        if (!user) {
            return;
        }

        const resetToken = jwt.sign(
            { userId: user.id, email: user.email, purpose: 'password_reset' } as SpecialTokenPayload,
            JWT_SECRET,
            { expiresIn: '1h', issuer: JWT_ISSUER }
        );

        await sendEmail({
            to: user.email,
            subject: 'Reset your password',
            template: 'reset-password',
            data: {
                name: user.name,
                resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
            },
        });
    }

    /**
     * Reset a user's password using a valid reset token.
     * This action revokes all existing refresh tokens for the user.
     */
    public async resetPassword(token: string, newPassword: string): Promise<void> {
        let decoded: SpecialTokenPayload;

        try {
            decoded = jwt.verify(token, JWT_SECRET) as SpecialTokenPayload;

            if (decoded.purpose !== 'password_reset') {
                throw new BadRequestError('Invalid reset token', 'INVALID_TOKEN');
            }
        } catch (error) {
            throw new BadRequestError('Invalid or expired reset token', 'INVALID_TOKEN');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updated = await db('users')
            .where({ id: decoded.userId, email: decoded.email })
            .update({
                password: hashedPassword,
                updated_at: new Date(),
            });

        if (!updated) {
            throw new BadRequestError('User not found', 'USER_NOT_FOUND');
        }

        await db('refresh_tokens')
            .where({ user_id: decoded.userId })
            .update({ revoked: true });
    }

    /**
     * Authenticate a user via Google ID token.
     * Creates a new user or links an existing one.
     */
    public async authenticateWithGoogle(idToken: string): Promise<AuthTokens> {
        if (!googleClient) {
            throw new Error('Google OAuth is not configured');
        }

        try {
            const ticket = await googleClient.verifyIdToken({
                idToken,
                audience: GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();

            if (!payload || !payload.email) {
                throw new BadRequestError('Invalid Google token', 'INVALID_GOOGLE_TOKEN');
            }

            const user = await this.getOrCreateUserFromSocial({
                id: payload.sub,
                email: payload.email,
                name: payload.name,
                firstName: payload.given_name,
                lastName: payload.family_name,
                avatar: payload.picture,
                provider: 'google',
                emailVerified: payload.email_verified,
            });

            const { tokens, tokenId } = this.generateTokens(user.id, user.email, user.role);
            await this.storeRefreshToken(user.id, tokenId, tokens.refreshToken);

            return tokens;
        } catch (error) {
            logger.error('Google authentication error:', error);
            throw new UnauthorizedError('Google authentication failed', 'GOOGLE_AUTH_FAILED');
        }
    }

    /**
     * Provides the Passport.js strategy for Facebook authentication.
     */
    public getFacebookStrategy(): FacebookStrategy | null {
        if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
            return null;
        }

        return new FacebookStrategy(
            {
                clientID: FACEBOOK_APP_ID,
                clientSecret: FACEBOOK_APP_SECRET,
                callbackURL: `${process.env.API_URL}/api/auth/facebook/callback`,
                profileFields: ['id', 'emails', 'name', 'photos'],
                scope: ['email'],
            },
            async (_accessToken: string, _refreshToken: string, profile: FacebookProfile, done: PassportDoneCallback) => {
                try {
                    const email = profile.emails?.[0].value;

                    if (!email) {
                        return done(new Error('No email provided by Facebook'), null);
                    }

                    const user = await this.getOrCreateUserFromSocial({
                        id: profile.id,
                        email,
                        name: `${profile.name?.givenName} ${profile.name?.familyName}`.trim(),
                        firstName: profile.name?.givenName,
                        lastName: profile.name?.familyName,
                        avatar: profile.photos?.[0]?.value,
                        provider: 'facebook',
                        emailVerified: true,
                    });

                    return done(null, user);
                } catch (error) {
                    return done(error as Error, null);
                }
            }
        );
    }

    /**
     * Provides the Passport.js strategy for Apple authentication.
     */
    public getAppleStrategy(): AppleStrategy | null {
        if (!APPLE_CLIENT_ID || !APPLE_TEAM_ID || !APPLE_KEY_ID || !APPLE_PRIVATE_KEY) {
            return null;
        }

        return new AppleStrategy(
            {
                clientID: APPLE_CLIENT_ID,
                teamID: APPLE_TEAM_ID,
                keyID: APPLE_KEY_ID,
                key: APPLE_PRIVATE_KEY,
                callbackURL: `${process.env.API_URL}/api/auth/apple/callback`,
                scope: ['email', 'name'],
            },
            async (_accessToken: string, _refreshToken: string, idToken: string, profile: AppleProfile, done: PassportDoneCallback) => {
                try {
                    if (!idToken) {
                        return done(new Error('No ID token provided by Apple'), null);
                    }

                    // Decode the ID token to get user info.
                    const decoded = jwt.decode(idToken) as { sub: string; email: string; email_verified?: boolean };
                    const email = decoded.email;

                    if (!email) {
                        return done(new Error('No email provided by Apple'), null);
                    }

                    // Use the name from the profile if available, otherwise from the ID token or email
                    const name = profile?.name
                        ? `${profile.name.givenName || ''} ${profile.name.familyName || ''}`.trim()
                        : '';

                    const user = await this.getOrCreateUserFromSocial({
                        id: decoded.sub,
                        email,
                        name,
                        provider: 'apple',
                        emailVerified: true,
                    });

                    return done(null, user);
                } catch (error) {
                    return done(error as Error, null);
                }
            }
        );
    }

    /**
     * Handles the creation or retrieval of a user based on a social profile.
     * This logic is wrapped in a transaction to ensure data consistency.
     */
    public async getOrCreateUserFromSocial(profile: SocialProfile) {
        return db.transaction(async (trx) => {
            const existingSocialAccount = await trx('user_social_accounts')
                .where({
                    provider: profile.provider,
                    provider_user_id: profile.id,
                })
                .first();

            let userId: string;

            if (existingSocialAccount) {
                userId = existingSocialAccount.user_id;

                await trx('users')
                    .where({ id: userId })
                    .update({
                        last_login: new Date(),
                        updated_at: new Date(),
                        ...(!existingSocialAccount.avatar && profile.avatar ? { avatar: profile.avatar } : {}),
                    });
            } else {
                const user = await trx('users')
                    .where({ email: profile.email })
                    .first();

                if (user) {
                    userId = user.id;

                    await trx('user_social_accounts').insert({
                        id: uuidv4(),
                        user_id: userId,
                        provider: profile.provider,
                        provider_user_id: profile.id,
                        email: profile.email,
                        name: profile.name,
                        avatar: profile.avatar,
                        created_at: new Date(),
                        updated_at: new Date(),
                    });

                    await trx('users')
                        .where({ id: userId })
                        .update({
                            last_login: new Date(),
                            ...(!user.avatar && profile.avatar ? { avatar: profile.avatar } : {}),
                        });
                } else {
                    const username = await this.generateUniqueUsername(
                        profile.name || profile.email.split('@')[0]
                    );

                    const [newUserId] = await trx('users').insert({
                        id: uuidv4(),
                        email: profile.email,
                        name: profile.name || profile.email.split('@')[0],
                        username,
                        avatar: profile.avatar,
                        email_verified: profile.emailVerified || false,
                        is_active: true,
                        last_login: new Date(),
                        created_at: new Date(),
                        updated_at: new Date(),
                    }).returning('id');

                    userId = newUserId;

                    await trx('user_social_accounts').insert({
                        id: uuidv4(),
                        user_id: userId,
                        provider: profile.provider,
                        provider_user_id: profile.id,
                        email: profile.email,
                        name: profile.name,
                        avatar: profile.avatar,
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                }
            }

            const user = await trx('users')
                .where('users.id', userId)
                .select('users.*', 'roles.name as role')
                .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
                .leftJoin('roles', 'user_roles.role_id', 'roles.id')
                .first();

            if (!user) {
                throw new Error('Failed to create or retrieve user');
            }

            return {
                id: user.id,
                email: user.email,
                role: user.role || 'user',
            };
        });
    }

    /**
     * Generates a unique username from a provided name, ensuring it doesn't
     * already exist in the database.
     */
    private async generateUniqueUsername(name: string): Promise<string> {
        let baseUsername = name
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^\w-]/g, '')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '')
            .substring(0, 20);

        if (!baseUsername) {
            baseUsername = 'user_' + Math.random().toString(36).substring(2, 8);
        }

        let username = baseUsername;
        let counter = 1;
        let exists = true;

        while (exists) {
            const existingUser = await db('users')
                .where({ username })
                .first();

            if (!existingUser) {
                exists = false;
            } else {
                username = `${baseUsername}${counter}`;
                counter++;
            }

            if (counter > 100) {
                username = `${baseUsername}_${Math.random().toString(36).substring(2, 8)}`;
                exists = false;
            }
        }

        return username;
    }
}

export const authService = new AuthService();
export default authService;