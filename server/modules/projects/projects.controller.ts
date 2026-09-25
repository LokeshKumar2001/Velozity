import { Request, Response, NextFunction } from 'express';
import { ProjectsService, projectsService } from './projects.service.js';

export class ProjectsController {
  constructor(private service: ProjectsService = projectsService) {}

  getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projects = await this.service.getProjects(req.query as any, req.user!);
      res.status(200).json({
        success: true,
        data: projects,
      });
    } catch (error) {
      next(error);
    }
  };

  getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const project = await this.service.getProjectById(req.params.id, req.user!);
      res.status(200).json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  };

  createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const project = await this.service.createProject(req.body, req.user!);
      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const project = await this.service.updateProject(req.params.id, req.body, req.user!);
      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteProject(req.params.id, req.user!);
      res.status(200).json({
        success: true,
        message: 'Project deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export const projectsController = new ProjectsController();
export default projectsController;
