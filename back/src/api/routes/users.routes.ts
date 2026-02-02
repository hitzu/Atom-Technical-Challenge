import type { Router } from 'express';
import { Router as createRouter } from 'express';
import jwt from 'jsonwebtoken';

import { LoginOrCreateBodySchema, LoginOrCreateResponseSchema } from '@atom/shared';

import type { UserService } from '../../application/users/UserService';
import { getEnvConfig } from '../../config/env';
import { validateBody } from '../middlewares/validation.middleware';

export function usersRoutes(userService: UserService): Router {
  const router = createRouter();

  router.post('/auth/login-or-create', validateBody(LoginOrCreateBodySchema), async (req, res, next) => {
    try {
      const { email } = LoginOrCreateBodySchema.parse(req.body);
      const user = await userService.loginOrCreate(email);

      const config = getEnvConfig();
      const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, { expiresIn: '7d' });

      res.json(
        LoginOrCreateResponseSchema.parse({
          data: user,
          token,
        }),
      );
    } catch (error) {
      next(error);
    }
  });

  return router;
}

