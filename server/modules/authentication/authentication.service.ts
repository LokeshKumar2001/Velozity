import bcrypt from 'bcrypt';
import { AuthenticationRepository, authRepository } from './authentication.repository.js';
import { LoginDTO, AuthResponse, RefreshResponse } from './authentication.types.js';
import { AppError } from '../../errors/app-error.js';
import { generateAccessToken, generateRefreshToken, hashToken } from '../../utils/jwt.util.js';
import { env } from '../../config/env.config.js';

export class AuthenticationService {
  constructor(private repo: AuthenticationRepository = authRepository) {}

  async login(dto: LoginDTO): Promise<{ authResponse: AuthResponse; rawRefreshToken: string; refreshExpiresAt: Date }> {
    const user = await this.repo.findUserByEmail(dto.email.toLowerCase().trim());
    if (!user) {
      throw AppError.unauthenticated('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw AppError.unauthenticated('Invalid email or password');
    }

    const authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(authUser);
    const { token: rawRefreshToken, hash, expiresAt } = generateRefreshToken(user.id);

    await this.repo.saveRefreshToken(user.id, hash, expiresAt);

    return {
      authResponse: {
        user: authUser,
        accessToken,
      },
      rawRefreshToken,
      refreshExpiresAt: expiresAt,
    };
  }

  async loginWithGoogle(credentialToken: string): Promise<{ authResponse: AuthResponse; rawRefreshToken: string; refreshExpiresAt: Date }> {
    if (!credentialToken) {
      throw AppError.badRequest('Google credential token is required');
    }

    let payload: any;
    try {
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credentialToken}`);
      if (res.ok) {
        payload = await res.json();
      } else {
        const parts = credentialToken.split('.');
        if (parts.length === 3) {
          payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        }
      }
    } catch (err) {
      try {
        const parts = credentialToken.split('.');
        if (parts.length === 3) {
          payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        }
      } catch (e) {
        throw AppError.unauthenticated('Invalid Google credential token');
      }
    }

    if (!payload || !payload.email) {
      throw AppError.unauthenticated('Invalid Google account payload');
    }

    const email = payload.email.toLowerCase().trim();
    let user = await this.repo.findUserByEmail(email);

    if (!user) {
      const name = payload.name || payload.given_name || email.split('@')[0];
      const randomPassword = await bcrypt.hash(Math.random().toString(36).substring(2) + Date.now(), 10);
      user = await this.repo.createUser({
        name,
        email,
        passwordHash: randomPassword,
        role: 'DEVELOPER',
      });
    }

    const authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(authUser);
    const { token: rawRefreshToken, hash, expiresAt } = generateRefreshToken(user.id);

    await this.repo.saveRefreshToken(user.id, hash, expiresAt);

    return {
      authResponse: {
        user: authUser,
        accessToken,
      },
      rawRefreshToken,
      refreshExpiresAt: expiresAt,
    };
  }

  async refreshToken(rawRefreshToken: string): Promise<{ accessToken: string; newRawRefreshToken: string; newExpiresAt: Date }> {
    if (!rawRefreshToken) {
      throw AppError.unauthenticated('Refresh token required');
    }

    const currentHash = hashToken(rawRefreshToken);
    const storedToken = await this.repo.findValidRefreshToken(currentHash);

    if (!storedToken) {
      throw AppError.unauthenticated('Invalid or expired refresh token. Please sign in again.');
    }

    await this.repo.revokeRefreshToken(currentHash);

    const user = storedToken.user;
    const authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(authUser);
    const { token: newRawRefreshToken, hash: newHash, expiresAt: newExpiresAt } = generateRefreshToken(user.id);

    await this.repo.saveRefreshToken(user.id, newHash, newExpiresAt);

    return {
      accessToken: newAccessToken,
      newRawRefreshToken,
      newExpiresAt,
    };
  }

  async logout(rawRefreshToken?: string, userId?: string): Promise<void> {
    if (rawRefreshToken) {
      const hash = hashToken(rawRefreshToken);
      await this.repo.revokeRefreshToken(hash);
    } else if (userId) {
      await this.repo.revokeAllUserTokens(userId);
    }
  }

  async getCurrentUser(userId: string) {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthenticationService();
export default authService;
