import cors from 'cors';
import express from 'express';

import { TaskService } from './application/tasks/TaskService';
import { UserService } from './application/users/UserService';
import { getEnvConfig } from './config/env';
import { getFirestore } from './config/firebase';
import { tasksRoutes } from './api/routes/tasks.routes';
import { usersRoutes } from './api/routes/users.routes';
import { errorMiddleware } from './api/middlewares/error.middleware';
import { FirestoreTaskRepository } from './infrastructure/firestore/FirestoreTaskRepository';
import { FirestoreUserRepository } from './infrastructure/firestore/FirestoreUserRepository';

export function createApp(): express.Express {
  const config = getEnvConfig();
  const firestore = getFirestore();

  const userRepository = new FirestoreUserRepository(firestore);
  const taskRepository = new FirestoreTaskRepository(firestore);

  const userService = new UserService(userRepository);
  const taskService = new TaskService(taskRepository);

  const app = express();

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      // Allow non-browser clients (curl/Postman) which often send no Origin header.
      if (!origin) return callback(null, true);

      // Explicit allow-list; supports '*' if you really want to allow all.
      if (config.corsOrigins.includes('*') || config.corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Do not throw; just omit CORS headers (browser will block).
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api', usersRoutes(userService));
  app.use('/api', tasksRoutes(taskService));

  app.use(errorMiddleware);

  return app;
}

// Local dev entrypoint (container runs this file).
if (require.main === module) {
  const config = getEnvConfig();
  const app = createApp();

  app.listen(config.port, '0.0.0.0', () => {
    // Intentionally minimal logging for the scaffold.
    console.log(`API listening on :${config.port}`);
  });
}

