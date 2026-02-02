import type { Router } from 'express';
import { Router as createRouter } from 'express';

import { CreateUserBodySchema, UserLoggedInResponseSchema } from '@atom/shared';

import type { UserService } from '../../application/users/UserService';
import { validateBody } from '../middlewares/validation.middleware';
import { ZodError } from 'zod';

export function usersRoutes(userService: UserService): Router {
  const router = createRouter();

  router.get('/users/:email', async (req, res, next) => {
    try {
      const { email } = req.params;
      const userLoggedInResponse = await userService.findByEmail(email);
      res.json(
        UserLoggedInResponseSchema.parse(userLoggedInResponse),
      );
    } catch (error) {
      next(error);
    }
  });


  router.post('/auth/sign-in', validateBody(CreateUserBodySchema), async (req, res, next) => {
    try {
      const { email } = CreateUserBodySchema.parse(req.body);
      const userLoggedInResponse = await userService.createUser(email);

      res.json(
        UserLoggedInResponseSchema.parse(userLoggedInResponse),
      );
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: { message: 'Invalid request body', code: 'INVALID_REQUEST_BODY' } });
      }
      next(error);
    }
  });

  return router;
}

