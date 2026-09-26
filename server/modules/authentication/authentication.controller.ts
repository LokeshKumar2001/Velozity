import { Request, Response, NextFunction } from 'express';
import { AuthenticationService, authService } from './authentication.service.js';
import { env } from '../../config/env.config.js';

export class AuthenticationController {
  constructor(private service: AuthenticationService = authService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { authResponse, rawRefreshToken, refreshExpiresAt } = await this.service.login(req.body);

      res.cookie('refreshToken', rawRefreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        expires: refreshExpiresAt,
        path: '/api/auth',
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: authResponse,
      });
    } catch (error) {
      next(error);
    }
  };

  loginWithGoogle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.body?.credential || req.body?.idToken || req.body?.token;
      const { authResponse, rawRefreshToken, refreshExpiresAt } = await this.service.loginWithGoogle(token);

      res.cookie('refreshToken', rawRefreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        expires: refreshExpiresAt,
        path: '/api/auth',
      });

      res.status(200).json({
        success: true,
        message: 'Google login successful',
        data: authResponse,
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      const { accessToken, newRawRefreshToken, newExpiresAt } = await this.service.refreshToken(rawRefreshToken);

      res.cookie('refreshToken', newRawRefreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        expires: newExpiresAt,
        path: '/api/auth',
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawRefreshToken = req.cookies?.refreshToken;
      await this.service.logout(rawRefreshToken, req.user?.id);

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/api/auth',
      });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.getCurrentUser(req.user!.id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthenticationController();
export default authController;
