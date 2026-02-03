import type { Router } from 'express';
import { Router as createRouter } from 'express';

import { CreateTaskInputSchema, UpdateTaskInputSchema } from '@atom/shared';

import type { TaskService } from '../../application/tasks/TaskService';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';

export function tasksRoutes(taskService: TaskService): Router {
  const router = createRouter();

  router.use(authMiddleware);

  router.get('/tasks/:id', async (req, res, next) => {
    try {
      const taskId = req.params.id;
      const userId = req.user!.userId;
      const task = await taskService.getById(taskId, userId);
      res.json({ data: task });
    } catch (error) {
      next(error);
    }
  });

  router.get('/tasks', async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: { message: 'Unauthorized' } });
        return;
      }

      const query = req.query;

      const tasks = await taskService.listByUserId(userId, query);
      res.json({ data: tasks });
    } catch (error) {
      next(error);
    }
  });

  router.post('/tasks', validateBody(CreateTaskInputSchema), async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: { message: 'Unauthorized' } });
        return;
      }

      const input = CreateTaskInputSchema.parse(req.body);
      const task = await taskService.create(userId, input);
      res.status(201).json({ data: task });
    } catch (error) {
      next(error);
    }
  });

  router.patch('/tasks/:id', validateBody(UpdateTaskInputSchema), async (req, res, next) => {
    try {
      const userId = req.user!.userId;
      const taskId = req.params.id;
      const input = UpdateTaskInputSchema.parse(req.body);
      const task = await taskService.update(taskId, userId, input);
      res.json({ data: task });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/tasks/:id', async (req, res, next) => {
    try {
      const taskId = req.params.id;
      const userId = req.user!.userId;
      await taskService.delete(taskId, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}

