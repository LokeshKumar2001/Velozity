import { Request, Response, NextFunction } from 'express';
import { NotificationsService, notificationsService } from './notifications.service.js';

export class NotificationsController {
  constructor(private service: NotificationsService = notificationsService) {}

  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getUserNotifications(req.user!.id);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.markAsRead(req.params.id as string, req.user!.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.markAllAsRead(req.user!.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const notificationsController = new NotificationsController();
export default notificationsController;
