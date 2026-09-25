import { Request, Response, NextFunction } from 'express';
import { ActivitiesService, activitiesService } from './activities.service.js';

export class ActivitiesController {
  constructor(private service: ActivitiesService = activitiesService) {}

  getFeed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const feed = await this.service.getFeed(req.query as any, req.user!);
      res.status(200).json({
        success: true,
        data: feed,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const activitiesController = new ActivitiesController();
export default activitiesController;
