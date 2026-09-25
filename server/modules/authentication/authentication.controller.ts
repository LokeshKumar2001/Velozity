import { Request, Response, NextFunction } from 'express';
import { AuthenticationService, authService } from './authentication.service.js';
import { env } from '../../config/env.config.js';

export class AuthenticationController {
  constructor(private service: AuthenticationService = authService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { authResponse, rawRefreshToken, refreshExpiresAt } = await this.service.login(req.body);

      // Set Refresh Token strictly in HttpOnly cookie
      res.cookie('refreshToken', rawRefreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
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

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      const { accessToken, newRawRefreshToken, newExpiresAt } = await this.service.refreshToken(rawRefreshToken);

      res.cookie('refreshToken', newRawRefreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
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
        sameSite: 'strict',
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
