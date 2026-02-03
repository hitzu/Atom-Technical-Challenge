import admin from 'firebase-admin';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/main';

async function signIn(app: ReturnType<typeof createApp>, email = 'ci.user@example.com'): Promise<string> {
  const res = await request(app)
    .post('/api/auth/sign-in')
    .send({ email });

  expect(res.status).toBe(200);
  expect(res.body?.token).toMatch(/^DEV\./);
  return res.body.token as string;
}

describe('Tasks API', () => {
  it('POST /api/tasks should return 401 without auth', async () => {
    // Arrange
    const app = createApp();

    // Act
    const res = await request(app).post('/api/tasks').send({ title: 't1' });

    // Assert
    expect(res.status).toBe(401);
    expect(res.body?.error?.message).toBe('Unauthorized');
  });

  it('POST /api/tasks should return 400 on validation error (missing title)', async () => {
    // Arrange
    const app = createApp();
    const token = await signIn(app);

    // Act
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'no title' });

    // Assert
    expect(res.status).toBe(400);
    expect(res.body?.error?.message).toBe('Validation error');
    expect(res.body?.error?.details).toBeDefined();
  });

  it('POST /api/tasks should create a task and persist it in Firestore', async () => {
    // Arrange
    const app = createApp();
    const token = await signIn(app, 'owner@example.com');

    // Act
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Write integration tests', description: 'Use emulator + wipe per test' });

    // Assert (HTTP)
    expect(res.status).toBe(201);
    expect(res.body?.data?.id).toBeTruthy();
    expect(res.body?.data?.title).toBe('Write integration tests');
    expect(res.body?.data?.description).toBe('Use emulator + wipe per test');
    expect(res.body?.data?.completed).toBe(false);
    expect(typeof res.body?.data?.createdAt).toBe('string');

    // Assert (Firestore state)
    const taskId = res.body.data.id as string;
    const snapshot = await admin.firestore().collection('tasks').doc(taskId).get();
    expect(snapshot.exists).toBe(true);
    expect(snapshot.data()).toMatchObject({
      title: 'Write integration tests',
      description: 'Use emulator + wipe per test',
      completed: false,
    });
  });
});

