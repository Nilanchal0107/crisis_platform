import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { UserRole } from '@vrl/shared';
import {
  TaskService,
  TaskNotFoundError,
  TaskForbiddenError,
  TaskStateConflictError,
  PrematureDispatchError,
  MathMismatchError
} from './task.service.js';
import {
  CreateTaskSchema,
  AcknowledgeTaskSchema,
  DispatchTaskSchema,
  SubmitOutcomeSchema,
  PostTaskUpdateSchema
} from './task.schema.js';

export class TaskController {
  /**
   * Helper to ensure actor context is defined
   */
  private static getActor(req: Request) {
    return req.actor || { id: 'rajesh', role: UserRole.COORDINATOR };
  }

  /**
   * POST /api/tasks - Create an offered mission
   */
  static async createTask(req: Request, res: Response): Promise<void> {
    try {
      const actor = TaskController.getActor(req);
      if (actor.role !== UserRole.COORDINATOR) {
        res.status(403).json({
          error: 'FORBIDDEN',
          message: 'Only agency coordinators can assign and offer missions.'
        });
        return;
      }

      const validated = CreateTaskSchema.parse(req.body);
      const task = TaskService.createTask(validated, actor);

      res.status(201).json(task);
    } catch (err: any) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          issues: err.errors
        });
        return;
      }
      if (err instanceof TaskStateConflictError) {
        res.status(409).json({
          error: 'CONFLICT',
          message: err.message
        });
        return;
      }
      if (err instanceof TaskForbiddenError) {
        res.status(403).json({
          error: 'FORBIDDEN',
          message: err.message
        });
        return;
      }
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  /**
   * GET /api/tasks - List tasks visible to the actor
   */
  static async listTasks(req: Request, res: Response): Promise<void> {
    try {
      const actor = TaskController.getActor(req);
      const tasks = TaskService.listTasks(actor);
      res.status(200).json({
        count: tasks.length,
        tasks
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  /**
   * GET /api/tasks/:id - View single task
   */
  static async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const taskId = parseInt(req.params.id, 10);
      if (isNaN(taskId)) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid task ID' });
        return;
      }

      const actor = TaskController.getActor(req);
      const task = TaskService.getTaskById(taskId, actor);
      res.status(200).json(task);
    } catch (err: any) {
      if (err instanceof TaskNotFoundError) {
        res.status(404).json({ error: 'NOT_FOUND', message: err.message });
        return;
      }
      if (err instanceof TaskForbiddenError) {
        res.status(403).json({ error: 'FORBIDDEN', message: err.message });
        return;
      }
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  /**
   * POST /api/tasks/:id/acknowledge - Accept or decline mission ownership (LOGIC-003)
   */
  static async acknowledgeTask(req: Request, res: Response): Promise<void> {
    try {
      const taskId = parseInt(req.params.id, 10);
      if (isNaN(taskId)) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid task ID' });
        return;
      }

      const actor = TaskController.getActor(req);
      const validated = AcknowledgeTaskSchema.parse(req.body);
      const updatedTask = TaskService.acknowledgeTask(taskId, validated, actor);

      res.status(200).json(updatedTask);
    } catch (err: any) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          issues: err.errors
        });
        return;
      }
      if (err instanceof TaskNotFoundError) {
        res.status(404).json({ error: 'NOT_FOUND', message: err.message });
        return;
      }
      if (err instanceof TaskForbiddenError) {
        res.status(403).json({ error: 'FORBIDDEN', message: err.message });
        return;
      }
      if (err instanceof TaskStateConflictError) {
        res.status(409).json({ error: 'CONFLICT', message: err.message });
        return;
      }
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  /**
   * POST /api/tasks/:id/dispatch - Departure confirmation & shift stock to in-transit
   */
  static async dispatchTask(req: Request, res: Response): Promise<void> {
    try {
      const taskId = parseInt(req.params.id, 10);
      if (isNaN(taskId)) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid task ID' });
        return;
      }

      const actor = TaskController.getActor(req);
      const validated = DispatchTaskSchema.parse(req.body || {});
      const updatedTask = TaskService.dispatchTask(taskId, validated, actor);

      res.status(200).json(updatedTask);
    } catch (err: any) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          issues: err.errors
        });
        return;
      }
      if (err instanceof PrematureDispatchError) {
        res.status(422).json({
          error: 'PREMATURE_DISPATCH_UNPROCESSABLE',
          message: err.message
        });
        return;
      }
      if (err instanceof TaskNotFoundError) {
        res.status(404).json({ error: 'NOT_FOUND', message: err.message });
        return;
      }
      if (err instanceof TaskForbiddenError) {
        res.status(403).json({ error: 'FORBIDDEN', message: err.message });
        return;
      }
      if (err instanceof TaskStateConflictError) {
        res.status(409).json({ error: 'CONFLICT', message: err.message });
        return;
      }
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  /**
   * POST /api/tasks/:id/outcome - Submit physical execution outcome (LOGIC-004)
   */
  static async submitOutcome(req: Request, res: Response): Promise<void> {
    try {
      const taskId = parseInt(req.params.id, 10);
      if (isNaN(taskId)) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid task ID' });
        return;
      }

      const actor = TaskController.getActor(req);
      const validated = SubmitOutcomeSchema.parse(req.body);
      const updatedTask = TaskService.submitOutcome(taskId, validated, actor);

      res.status(200).json(updatedTask);
    } catch (err: any) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          issues: err.errors
        });
        return;
      }
      if (err instanceof MathMismatchError) {
        res.status(422).json({
          error: 'OUTCOME_MATH_MISMATCH_UNPROCESSABLE',
          message: err.message
        });
        return;
      }
      if (err instanceof TaskNotFoundError) {
        res.status(404).json({ error: 'NOT_FOUND', message: err.message });
        return;
      }
      if (err instanceof TaskForbiddenError) {
        res.status(403).json({ error: 'FORBIDDEN', message: err.message });
        return;
      }
      if (err instanceof TaskStateConflictError) {
        res.status(409).json({ error: 'CONFLICT', message: err.message });
        return;
      }
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  /**
   * POST /api/tasks/:id/updates - Post a free-text progress or exception update
   */
  static async postUpdate(req: Request, res: Response): Promise<void> {
    try {
      const taskId = parseInt(req.params.id, 10);
      if (isNaN(taskId)) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid task ID' });
        return;
      }

      const actor = TaskController.getActor(req);
      const validated = PostTaskUpdateSchema.parse(req.body);
      const updatedTask = TaskService.postProgressUpdate(taskId, validated, actor);

      res.status(200).json(updatedTask);
    } catch (err: any) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          issues: err.errors
        });
        return;
      }
      if (err instanceof TaskNotFoundError) {
        res.status(404).json({ error: 'NOT_FOUND', message: err.message });
        return;
      }
      if (err instanceof TaskForbiddenError) {
        res.status(403).json({ error: 'FORBIDDEN', message: err.message });
        return;
      }
      if (err instanceof TaskStateConflictError) {
        res.status(409).json({ error: 'CONFLICT', message: err.message });
        return;
      }
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
}
